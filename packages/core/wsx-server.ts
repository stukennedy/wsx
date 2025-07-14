import { WSXRequest, WSXResponse, WSXConnection, WSXHandler, WSXServerAdapter, WSXServerConfig } from './types.js';

export class WSXServer {
  private connections = new Map<string, WSXConnection>();
  private handlers = new Map<string, WSXHandler>();
  private connectionCounter = 0;
  private adapter: WSXServerAdapter;
  private config: WSXServerConfig;

  constructor(adapter: WSXServerAdapter, config?: WSXServerConfig) {
    this.adapter = adapter;
    this.config = config || {};
    this.setupWebSocket();
  }

  private setupWebSocket() {
    const websocketPath = this.config.websocketPath || '/ws';
    this.adapter.setupWebSocket(websocketPath, async (data: string, connection: WSXConnection) => {
      try {
        const request: WSXRequest = JSON.parse(data);
        console.log('Received message:', request);

        // Register connection if not already registered
        if (!this.connections.has(connection.id)) {
          this.connections.set(connection.id, connection);
          console.log(`WSX connection registered: ${connection.id}`);
          
          // Call config callback first, then adapter callback
          if (this.config.onConnection) {
            this.config.onConnection(connection);
          }
          
          if (this.adapter.onConnection) {
            this.adapter.onConnection(connection);
          }
        }

        await this.handleRequest(request, connection);
      } catch (error) {
        console.error('Error handling WSX message:', error);
      }
    });
  }

  private async handleRequest(request: WSXRequest, connection: WSXConnection) {
    // Check for specific handler first
    if (request.handler && this.handlers.has(request.handler)) {
      const handler = this.handlers.get(request.handler)!;
      await this.executeHandler(handler, request, connection);
      return;
    }

    // Check for catch-all handler (empty string key)
    if (this.handlers.has('')) {
      const handler = this.handlers.get('')!;
      await this.executeHandler(handler, request, connection);
      return;
    }

    console.warn(`No handler found for: ${request.handler || 'default'}`);
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
        swap: 'innerHTML',
      };

      this.sendResponse(errorResponse, connection);
    }
  }

  private sendResponse(response: WSXResponse, connection: WSXConnection) {
    try {
      connection.send(JSON.stringify(response));
    } catch (error) {
      console.error('Error sending response:', error);
    }
  }

  // Public API
  public on(handler: string, handlerFunction: WSXHandler): this;
  public on(handlerFunction: WSXHandler): this;
  public on(
    handlerOrFunction: string | WSXHandler,
    handlerFunction?: WSXHandler
  ): this {
    if (typeof handlerOrFunction === 'string') {
      // Named handler: wsx.on('update-user', handler)
      this.handlers.set(handlerOrFunction, handlerFunction!);
    } else {
      // Catch-all handler: wsx.on(handler)
      this.handlers.set('', handlerOrFunction);
    }
    return this;
  }

  public broadcast(target: string, html: string, swap?: string) {
    const response: WSXResponse = {
      id: `broadcast_${Date.now()}`,
      target,
      html,
      swap: swap || 'innerHTML',
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
        swap: swap || 'innerHTML',
      };

      this.sendResponse(response, connection);
    }
  }

  public getApp() {
    return this.adapter.getApp();
  }

  public getConnections(): WSXConnection[] {
    return Array.from(this.connections.values());
  }

  public getConnectionCount(): number {
    return this.connections.size;
  }

  public removeConnection(connectionId: string) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      this.connections.delete(connectionId);
      
      // Call config callback first, then adapter callback
      if (this.config.onDisconnection) {
        this.config.onDisconnection(connection);
      }
      
      if (this.adapter.onDisconnection) {
        this.adapter.onDisconnection(connection);
      }
    }
  }

  public generateConnectionId(): string {
    return `conn_${++this.connectionCounter}`;
  }
}