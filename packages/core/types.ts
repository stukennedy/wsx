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
  html: string;
  swap?: string;
  oob?: WSXOOBUpdate[];
}

export interface WSXOOBUpdate {
  target: string;
  html: string;
  swap?: string;
}

export interface WSXConnection {
  id: string;
  sessionData?: Record<string, any>;
  send(data: string): void;
  close(): void;
}

export type WSXHandler = (
  request: WSXRequest,
  connection: WSXConnection
) => Promise<WSXResponse | WSXResponse[] | void>;

export interface WSXServerAdapter {
  setupWebSocket(path: string, onMessage: (data: string, connection: WSXConnection) => void): void;
  onConnection?(connection: WSXConnection): void;
  onDisconnection?(connection: WSXConnection): void;
  getApp(): any;
}