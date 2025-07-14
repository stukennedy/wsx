import { Hono } from 'hono';
import { upgradeWebSocket } from 'hono/cloudflare-workers';
import { WSXServer, WSXServerAdapter, WSXConnection } from '@wsx/core';

export class HonoAdapter implements WSXServerAdapter {
  private app: Hono;
  private wsToConnectionId = new WeakMap<any, string>();
  private connectionCounter = 0;

  constructor() {
    this.app = new Hono();
  }

  setupWebSocket(path: string, onMessage: (data: string, connection: WSXConnection) => void): void {
    this.app.get(
      path,
      upgradeWebSocket((c) => ({
        onMessage: async (event, ws) => {
          // Find or create connection
          let connectionId = this.wsToConnectionId.get(ws);
          if (!connectionId) {
            connectionId = `conn_${++this.connectionCounter}`;
            this.wsToConnectionId.set(ws, connectionId);
          }

          const connection: WSXConnection = {
            id: connectionId,
            sessionData: {},
            send: (data: string) => {
              try {
                ws.send(data);
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

          await onMessage(event.data.toString(), connection);
        },

        onClose: (event, ws) => {
          const connectionId = this.wsToConnectionId.get(ws);
          if (connectionId) {
            this.wsToConnectionId.delete(ws);
            console.log(`WSX connection closed: ${connectionId}`);
          }
        },

        onError: (event, ws) => {
          console.error('WSX WebSocket error:', event);
        },
      }))
    );
  }

  onConnection?(connection: WSXConnection): void {
    // Optional hook for when a connection is established
  }

  onDisconnection?(connection: WSXConnection): void {
    // Optional hook for when a connection is closed
  }

  getApp(): Hono {
    return this.app;
  }
}

export function createHonoAdapter(): HonoAdapter {
  return new HonoAdapter();
}

// Convenience function to create a WSX server with Hono
export function createHonoWSXServer() {
  const adapter = createHonoAdapter();
  return new WSXServer(adapter);
}