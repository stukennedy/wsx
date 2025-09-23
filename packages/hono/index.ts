import { Hono } from "hono";
import { upgradeWebSocket } from "hono/cloudflare-workers";
import {
  WSXServer,
  WSXServerAdapter,
  WSXConnection,
  WSXServerConfig,
  WSXBinaryData,
} from "../core";

export class HonoAdapter implements WSXServerAdapter {
  private app: Hono;
  private wsToConnectionId = new WeakMap<any, string>();
  private connectionCounter = 0;

  constructor() {
    this.app = new Hono();
  }

  setupWebSocket(
    path: string,
    onMessage: (data: string | WSXBinaryData, connection: WSXConnection) => void
  ): void {
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
            send: (data: string | WSXBinaryData) => {
              try {
                if (typeof data === "string") {
                  ws.send(data);
                } else {
                  const view =
                    data instanceof ArrayBuffer
                      ? new Uint8Array(data)
                      : new Uint8Array(
                          data.buffer,
                          data.byteOffset,
                          data.byteLength
                        );
                  ws.send(view);
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

          const rawData = event.data;
          let payload: string | WSXBinaryData;

          if (typeof rawData === "string") {
            payload = rawData;
          } else if (rawData instanceof ArrayBuffer) {
            payload = rawData;
          } else if (ArrayBuffer.isView(rawData)) {
            payload = rawData as ArrayBufferView;
          } else {
            payload = String(rawData);
          }

          await onMessage(payload, connection);
        },

        onClose: (event, ws) => {
          const connectionId = this.wsToConnectionId.get(ws);
          if (connectionId) {
            this.wsToConnectionId.delete(ws);
            console.log(`WSX connection closed: ${connectionId}`);
          }
        },

        onError: (event, ws) => {
          console.error("WSX WebSocket error:", event);
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
export function createHonoWSXServer(config?: WSXServerConfig) {
  const adapter = createHonoAdapter();
  return new WSXServer(adapter, config);
}
