import express from "express";
import { WebSocket, WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import {
  WSXServer,
  WSXServerAdapter,
  WSXConnection,
  WSXServerConfig,
} from "../core";

export class ExpressAdapter implements WSXServerAdapter {
  private app: express.Application;
  private wss?: WebSocketServer;
  private wsToConnectionId = new WeakMap<WebSocket, string>();
  private connectionCounter = 0;

  constructor() {
    this.app = express();
  }

  setupWebSocket(
    path: string,
    onMessage: (data: string, connection: WSXConnection) => void
  ): void {
    // Create WebSocket server
    this.wss = new WebSocketServer({ noServer: true });

    this.wss.on("connection", (ws: WebSocket, request: IncomingMessage) => {
      const connectionId = `conn_${++this.connectionCounter}`;
      this.wsToConnectionId.set(ws, connectionId);

      const connection: WSXConnection = {
        id: connectionId,
        sessionData: {},
        send: (data: string) => {
          try {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(data);
            }
          } catch (error) {
            console.error("Error sending data:", error);
          }
        },
        close: () => {
          try {
            ws.close();
          } catch (error) {
            console.error("Error closing connection:", error);
          }
        },
      };

      ws.on("message", async (data) => {
        await onMessage(data.toString(), connection);
      });

      ws.on("close", () => {
        this.wsToConnectionId.delete(ws);
        console.log(`WSX connection closed: ${connectionId}`);
        if (this.onDisconnection) {
          this.onDisconnection(connection);
        }
      });

      ws.on("error", (error) => {
        console.error("WSX WebSocket error:", error);
      });

      if (this.onConnection) {
        this.onConnection(connection);
      }
    });

    // Handle upgrade requests
    this.app.use((req, res, next) => {
      if (req.url === path && req.headers.upgrade === "websocket") {
        this.wss!.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
          this.wss!.emit("connection", ws, req);
        });
      } else {
        next();
      }
    });
  }

  onConnection?(connection: WSXConnection): void {
    // Optional hook for when a connection is established
  }

  onDisconnection?(connection: WSXConnection): void {
    // Optional hook for when a connection is closed
  }

  getApp(): express.Application {
    return this.app;
  }
}

export function createExpressAdapter(): ExpressAdapter {
  return new ExpressAdapter();
}

// Convenience function to create a WSX server with Express
export function createExpressWSXServer(config?: WSXServerConfig) {
  const adapter = createExpressAdapter();
  return new WSXServer(adapter, config);
}
