import express from 'express';
import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import {
  WSXServer,
  WSXServerAdapter,
  WSXConnection,
  WSXServerConfig,
  WSXBinaryData
} from '../core';

export class ExpressAdapter implements WSXServerAdapter {
  private app: express.Application;
  private wss?: WebSocketServer;
  private wsToConnectionId = new WeakMap<WebSocket, string>();
  private connectionCounter = 0;
  private websocketPath?: string;
  private onMessageHandler?: (
    data: string | WSXBinaryData,
    connection: WSXConnection
  ) => void;

  constructor() {
    this.app = express();
  }

  setupWebSocket(
    path: string,
    onMessage: (data: string | WSXBinaryData, connection: WSXConnection) => void
  ): void {
    this.websocketPath = path;
    this.onMessageHandler = onMessage;

    // Create WebSocket server
    this.wss = new WebSocketServer({ noServer: true });

    this.wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      const connectionId = `conn_${++this.connectionCounter}`;
      this.wsToConnectionId.set(ws, connectionId);

      const connection: WSXConnection = {
        id: connectionId,
        sessionData: {},
        send: (data: string | WSXBinaryData) => {
          try {
            if (ws.readyState === WebSocket.OPEN) {
              if (typeof data === 'string') {
                ws.send(data);
              } else if (data instanceof ArrayBuffer) {
                ws.send(data);
              } else if (ArrayBuffer.isView(data)) {
                ws.send(data);
              } else {
                ws.send(data as any);
              }
            }
          } catch (error) {
            console.error('Error sending data:', error);
          }
        },
        close: () => {
          try {
            ws.close();
          } catch (error) {
            console.error('Error closing connection:', error);
          }
        }
      };

      ws.on('message', async (data, isBinary) => {
        let payload: string | WSXBinaryData;

        if (isBinary) {
          if (Array.isArray(data)) {
            payload = Buffer.concat(data);
          } else {
            payload = data as WSXBinaryData;
          }
        } else {
          if (typeof data === 'string') {
            payload = data;
          } else if (Array.isArray(data)) {
            payload = Buffer.concat(data).toString();
          } else {
            payload = (data as Buffer).toString();
          }
        }

        if (this.onMessageHandler) {
          await this.onMessageHandler(payload, connection);
        }
      });

      ws.on('close', () => {
        this.wsToConnectionId.delete(ws);
        console.log(`WSX connection closed: ${connectionId}`);
        if (this.onDisconnection) {
          this.onDisconnection(connection);
        }
      });

      ws.on('error', (error) => {
        console.error('WSX WebSocket error:', error);
      });

      if (this.onConnection) {
        this.onConnection(connection);
      }
    });
  }

  // Method to handle upgrade requests - should be called from the HTTP server
  handleUpgrade(req: IncomingMessage, socket: any, head: Buffer): void {
    if (this.wss && this.websocketPath && req.url === this.websocketPath) {
      this.wss.handleUpgrade(req, socket, head, (ws) => {
        this.wss!.emit('connection', ws, req);
      });
    }
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
