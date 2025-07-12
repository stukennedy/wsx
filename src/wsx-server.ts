// wsx-server.ts
import { Hono } from "hono";
import { upgradeWebSocket } from "hono/cloudflare-workers";

interface WSXRequest {
  id: string;
  handler: string;
  target: string;
  trigger: string;
  data?: Record<string, any>;
  swap?: string;
}

interface WSXResponse {
  id: string;
  target: string;
  html: string;
  swap?: string;
}

interface WSXConnection {
  id: string;
  ws: any; // Changed from WebSocket to any to fix the error
  sessionData?: Record<string, any>;
}

type WSXHandler = (
  request: WSXRequest,
  connection: WSXConnection
) => Promise<WSXResponse | WSXResponse[] | void>;

class WSXServer {
  private app: Hono;
  private connections = new Map<string, WSXConnection>();
  private handlers = new Map<string, WSXHandler>();
  private connectionCounter = 0;
  private wsToConnectionId = new WeakMap<any, string>();

  constructor() {
    this.app = new Hono();
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.app.get(
      "/ws",
      upgradeWebSocket((c) => ({
        onMessage: async (event, ws) => {
          try {
            const request: WSXRequest = JSON.parse(event.data.toString());
            console.log("Received message:", request);

            // Register connection on first message if not already registered
            let connection = this.findConnectionByWS(ws);
            if (!connection) {
              const connectionId = `conn_${++this.connectionCounter}`;
              console.log(`Registering new connection: ${connectionId}`);

              connection = {
                id: connectionId,
                ws,
                sessionData: {},
              };

              this.wsToConnectionId.set(ws, connectionId);
              this.connections.set(connectionId, connection);
              console.log(`WSX connection registered: ${connectionId}`);
            }

            await this.handleRequest(request, connection);
          } catch (error) {
            console.error("Error handling WSX message:", error);
          }
        },

        onClose: (event, ws) => {
          const connection = this.findConnectionByWS(ws);
          if (connection) {
            this.connections.delete(connection.id);
            this.wsToConnectionId.delete(ws);
            console.log(`WSX connection closed: ${connection.id}`);
          }
        },

        onError: (event, ws) => {
          console.error("WSX WebSocket error:", event);
        },
      }))
    );
  }

  private findConnectionByWS(ws: any): WSXConnection | undefined {
    const connectionId = this.wsToConnectionId.get(ws);
    if (connectionId) {
      return this.connections.get(connectionId);
    }
    return undefined;
  }

  private async handleRequest(request: WSXRequest, connection: WSXConnection) {
    // Check for specific handler first
    if (request.handler && this.handlers.has(request.handler)) {
      const handler = this.handlers.get(request.handler)!;
      await this.executeHandler(handler, request, connection);
      return;
    }

    // Check for catch-all handler (empty string key)
    if (this.handlers.has("")) {
      const handler = this.handlers.get("")!;
      await this.executeHandler(handler, request, connection);
      return;
    }

    console.warn(`No handler found for: ${request.handler || "default"}`);
  }

  private async executeHandler(
    handler: WSXHandler,
    request: WSXRequest,
    connection: WSXConnection
  ) {
    try {
      const response = await handler(request, connection);

      if (response) {
        if (Array.isArray(response)) {
          // Handle multiple responses
          for (const res of response) {
            this.sendResponse(res, connection);
          }
        } else {
          // Handle single response
          this.sendResponse(response, connection);
        }
      }
    } catch (error) {
      console.error(`Error in handler for ${request.handler}:`, error);

      // Send error response
      const errorResponse: WSXResponse = {
        id: request.id,
        target: request.target,
        html: `<div class="error">An error occurred: ${
          error instanceof Error ? error.message : String(error)
        }</div>`,
        swap: "innerHTML",
      };

      this.sendResponse(errorResponse, connection);
    }
  }

  private sendResponse(response: WSXResponse, connection: WSXConnection) {
    try {
      connection.ws.send(JSON.stringify(response));
    } catch (error) {
      console.error("Error sending response:", error);
    }
  }

  // Public API
  public on(handler: string, handlerFunction: WSXHandler): this;
  public on(handlerFunction: WSXHandler): this;
  public on(
    handlerOrFunction: string | WSXHandler,
    handlerFunction?: WSXHandler
  ): this {
    if (typeof handlerOrFunction === "string") {
      // Named handler: wsx.on('update-user', handler)
      this.handlers.set(handlerOrFunction, handlerFunction!);
    } else {
      // Catch-all handler: wsx.on(handler)
      this.handlers.set("", handlerOrFunction);
    }
    return this;
  }

  public broadcast(target: string, html: string, swap?: string) {
    const response: WSXResponse = {
      id: `broadcast_${Date.now()}`,
      target,
      html,
      swap: (swap as any) || "innerHTML",
    };

    for (const connection of this.connections.values()) {
      this.sendResponse(response, connection);
    }
  }

  public sendToConnection(
    connectionId: string,
    target: string,
    html: string,
    swap?: string
  ) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      const response: WSXResponse = {
        id: `direct_${Date.now()}`,
        target,
        html,
        swap: (swap as any) || "innerHTML",
      };

      this.sendResponse(response, connection);
    }
  }

  public getApp(): Hono {
    return this.app;
  }

  public getConnections(): WSXConnection[] {
    return Array.from(this.connections.values());
  }

  public getConnectionCount(): number {
    return this.connections.size;
  }
}

export { WSXServer, WSXRequest, WSXResponse, WSXConnection, WSXHandler };
