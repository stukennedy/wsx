export interface WSXRequest {
  id: string;
  handler: string;
  target: string;
  trigger: string;
  data?: Record<string, any>;
  swap?: string;
}

export interface WSXResponse {
  id: string;
  target: string;
  html: string | { toString(): string } | Promise<{ toString(): string }>;
  swap?: string;
  oob?: WSXOOBUpdate[];
}

export interface WSXOOBUpdate {
  target: string;
  html: string | { toString(): string } | Promise<{ toString(): string }>;
  swap?: string;
}

export interface WSXConnection {
  id: string;
  sessionData?: Record<string, any>;
  send(data: string | WSXBinaryData): void;
  close(): void;
}

export type WSXHandler = (
  request: WSXRequest,
  connection: WSXConnection
) => Promise<WSXResponse | WSXResponse[] | void>;

export type WSXBinaryData = ArrayBuffer | ArrayBufferView;

export interface WSXJSONMessage {
  id: string;
  channel: string;
  data: any;
  metadata?: Record<string, any>;
}

export type WSXJSONHandler = (
  message: WSXJSONMessage,
  connection: WSXConnection
) => Promise<void> | void;

export interface WSXJSONSendOptions {
  id?: string;
  metadata?: Record<string, any>;
}

export interface WSXStreamMessage {
  id: string;
  channel: string;
  metadata?: Record<string, any>;
}

export type WSXStreamHandler = (
  message: WSXStreamMessage,
  data: Uint8Array,
  connection: WSXConnection
) => Promise<void> | void;

export interface WSXStreamSendOptions {
  id?: string;
  metadata?: Record<string, any>;
}

export interface WSXServerAdapter {
  setupWebSocket(
    path: string,
    onMessage: (data: string | WSXBinaryData, connection: WSXConnection) => void
  ): void;
  onConnection?(connection: WSXConnection): void;
  onDisconnection?(connection: WSXConnection): void;
  getApp(): any;
}

export interface WSXServerConfig {
  websocketPath?: string;
  onConnection?(connection: WSXConnection): void;
  onDisconnection?(connection: WSXConnection): void;
}
