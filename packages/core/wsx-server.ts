import {
  WSXRequest,
  WSXResponse,
  WSXConnection,
  WSXHandler,
  WSXServerAdapter,
  WSXServerConfig,
  WSXBinaryData,
  WSXJSONHandler,
  WSXJSONMessage,
  WSXJSONSendOptions,
  WSXStreamHandler,
  WSXStreamMessage,
  WSXStreamSendOptions,
} from './types.js';

const STREAM_MESSAGE_TYPE = 'stream';
const JSON_MESSAGE_TYPE = 'json';

type WSXJSONEnvelope = {
  type: string;
  id?: string;
  channel: string;
  data: any;
  metadata?: Record<string, any>;
};

export class WSXServer {
  private connections = new Map<string, WSXConnection>();
  private handlers = new Map<string, WSXHandler>();
  private jsonHandlers = new Map<string, WSXJSONHandler>();
  private streamHandlers = new Map<string, WSXStreamHandler>();
  private connectionCounter = 0;
  private adapter: WSXServerAdapter;
  private config: WSXServerConfig;
  private textEncoder = new TextEncoder();
  private textDecoder = new TextDecoder();

  constructor(adapter: WSXServerAdapter, config?: WSXServerConfig) {
    this.adapter = adapter;
    this.config = config || {};
    this.setupWebSocket();
  }

  private setupWebSocket() {
    const websocketPath = this.config.websocketPath || '/ws';
    this.adapter.setupWebSocket(
      websocketPath,
      async (data: string | WSXBinaryData, connection: WSXConnection) => {
        this.registerConnection(connection);

        try {
          if (typeof data === 'string') {
            await this.handleTextMessage(data, connection);
          } else if (this.isBinaryData(data)) {
            await this.handleBinaryMessage(data, connection);
          } else {
            console.warn(
              `Unsupported WSX message type received: ${typeof data}`
            );
          }
        } catch (error) {
          console.error('Error handling WSX message:', error);
        }
      }
    );
  }

  private async handleTextMessage(data: string, connection: WSXConnection) {
    const payload = JSON.parse(data);

    if (this.isJsonEnvelope(payload)) {
      const message = this.normalizeJsonEnvelope(payload);
      console.log(
        `Received JSON message on channel ${message.channel} (${message.id})`
      );
      await this.handleJson(message, connection);
      return;
    }

    const request: WSXRequest = payload;
    console.log('Received message:', request);
    await this.handleRequest(request, connection);
  }

  private async handleBinaryMessage(
    data: WSXBinaryData,
    connection: WSXConnection
  ) {
    const { message, payload } = this.decodeStreamMessage(data);
    console.log(
      `Received stream message on channel ${message.channel} (${message.id})`
    );
    await this.handleStream(message, payload, connection);
  }

  private isJsonEnvelope(value: unknown): value is WSXJSONEnvelope {
    return (
      value !== null &&
      typeof value === 'object' &&
      (value as WSXJSONEnvelope).type === JSON_MESSAGE_TYPE &&
      typeof (value as WSXJSONEnvelope).channel === 'string' &&
      'data' in (value as Record<string, unknown>)
    );
  }

  private normalizeJsonEnvelope(envelope: WSXJSONEnvelope): WSXJSONMessage {
    return {
      id:
        typeof envelope.id === 'string'
          ? envelope.id
          : this.generateJsonId(),
      channel: envelope.channel,
      data: envelope.data,
      metadata: envelope.metadata,
    };
  }

  private registerConnection(connection: WSXConnection) {
    if (this.connections.has(connection.id)) {
      return;
    }

    this.connections.set(connection.id, connection);
    console.log(`WSX connection registered: ${connection.id}`);

    if (this.config.onConnection) {
      this.config.onConnection(connection);
    }

    if (this.adapter.onConnection) {
      this.adapter.onConnection(connection);
    }
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

  private async handleStream(
    message: WSXStreamMessage,
    payload: Uint8Array,
    connection: WSXConnection
  ) {
    const handler =
      this.streamHandlers.get(message.channel) ??
      this.streamHandlers.get('');

    if (!handler) {
      console.warn(`No stream handler found for channel: ${message.channel}`);
      return;
    }

    try {
      await handler(message, payload, connection);
    } catch (error) {
      console.error(`Error in stream handler for ${message.channel}:`, error);
    }
  }

  private async handleJson(
    message: WSXJSONMessage,
    connection: WSXConnection
  ) {
    const handler =
      this.jsonHandlers.get(message.channel) ?? this.jsonHandlers.get('');

    if (!handler) {
      console.warn(`No JSON handler found for channel: ${message.channel}`);
      return;
    }

    try {
      await handler(message, connection);
    } catch (error) {
      console.error(`Error in JSON handler for ${message.channel}:`, error);
    }
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

  private sendJsonMessage(
    connection: WSXConnection,
    message: WSXJSONMessage
  ) {
    try {
      connection.send(this.encodeJsonMessage(message));
    } catch (error) {
      console.error(
        `Error sending JSON message for ${message.channel}:`,
        error
      );
    }
  }

  private sendStreamFrame(
    connection: WSXConnection,
    message: WSXStreamMessage,
    payload: WSXBinaryData
  ) {
    try {
      const frame = this.encodeStreamMessage(message, payload);
      connection.send(frame);
    } catch (error) {
      console.error(
        `Error sending stream message for ${message.channel}:`,
        error
      );
    }
  }

  private createJsonMessage(
    channel: string,
    data: any,
    options?: WSXJSONSendOptions
  ): WSXJSONMessage {
    return {
      id: options?.id || this.generateJsonId(),
      channel,
      data,
      metadata: options?.metadata,
    };
  }

  private createStreamMessage(
    channel: string,
    options?: WSXStreamSendOptions
  ): WSXStreamMessage {
    return {
      id: options?.id || this.generateStreamId(),
      channel,
      metadata: options?.metadata,
    };
  }

  private encodeStreamMessage(
    message: WSXStreamMessage,
    payload: WSXBinaryData
  ): Uint8Array {
    const headerObject: Record<string, any> = {
      type: STREAM_MESSAGE_TYPE,
      id: message.id,
      channel: message.channel,
    };

    if (message.metadata !== undefined) {
      headerObject.metadata = message.metadata;
    }

    const headerBytes = this.textEncoder.encode(JSON.stringify(headerObject));
    const payloadBytes = this.toUint8Array(payload);
    const buffer = new ArrayBuffer(4 + headerBytes.byteLength + payloadBytes.byteLength);
    const view = new DataView(buffer);
    view.setUint32(0, headerBytes.byteLength, false);

    const frame = new Uint8Array(buffer);
    frame.set(headerBytes, 4);
    frame.set(payloadBytes, 4 + headerBytes.byteLength);

    return frame;
  }

  private encodeJsonMessage(message: WSXJSONMessage): string {
    const envelope: Record<string, any> = {
      type: JSON_MESSAGE_TYPE,
      id: message.id,
      channel: message.channel,
      data: message.data,
    };

    if (message.metadata !== undefined) {
      envelope.metadata = message.metadata;
    }

    return JSON.stringify(envelope);
  }

  private decodeStreamMessage(
    data: WSXBinaryData
  ): { message: WSXStreamMessage; payload: Uint8Array } {
    const bytes = this.toUint8Array(data);

    if (bytes.byteLength < 4) {
      throw new Error('Stream message is too short to contain header length');
    }

    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const headerLength = view.getUint32(0, false);
    const headerStart = 4;
    const headerEnd = headerStart + headerLength;

    if (bytes.byteLength < headerEnd) {
      throw new Error('Stream message header is incomplete');
    }

    const headerBytes = bytes.subarray(headerStart, headerEnd);
    const headerString = this.textDecoder.decode(headerBytes);
    const header = JSON.parse(headerString);

    if (!header || header.type !== STREAM_MESSAGE_TYPE) {
      throw new Error('Unsupported binary message received');
    }

    if (typeof header.id !== 'string' || typeof header.channel !== 'string') {
      throw new Error('Invalid stream message header');
    }

    const payload = bytes.subarray(headerEnd);

    return {
      message: {
        id: header.id,
        channel: header.channel,
        metadata: header.metadata,
      },
      payload,
    };
  }

  private toUint8Array(data: WSXBinaryData): Uint8Array {
    if (data instanceof ArrayBuffer) {
      return new Uint8Array(data);
    }

    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  }

  private isBinaryData(data: unknown): data is WSXBinaryData {
    return data instanceof ArrayBuffer || ArrayBuffer.isView(data as any);
  }

  private generateStreamId(): string {
    return `stream_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  private generateJsonId(): string {
    return `json_${Date.now()}_${Math.random().toString(16).slice(2)}`;
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

  public onJson(handler: string, handlerFunction: WSXJSONHandler): this;
  public onJson(handlerFunction: WSXJSONHandler): this;
  public onJson(
    handlerOrFunction: string | WSXJSONHandler,
    handlerFunction?: WSXJSONHandler
  ): this {
    if (typeof handlerOrFunction === 'string') {
      this.jsonHandlers.set(handlerOrFunction, handlerFunction!);
    } else {
      this.jsonHandlers.set('', handlerOrFunction);
    }

    return this;
  }

  public onStream(handler: string, handlerFunction: WSXStreamHandler): this;
  public onStream(handlerFunction: WSXStreamHandler): this;
  public onStream(
    handlerOrFunction: string | WSXStreamHandler,
    handlerFunction?: WSXStreamHandler
  ): this {
    if (typeof handlerOrFunction === 'string') {
      this.streamHandlers.set(handlerOrFunction, handlerFunction!);
    } else {
      this.streamHandlers.set('', handlerOrFunction);
    }

    return this;
  }

  public broadcastJson(
    channel: string,
    data: any,
    options?: WSXJSONSendOptions
  ): string {
    const message = this.createJsonMessage(channel, data, options);

    for (const connection of this.connections.values()) {
      this.sendJsonMessage(connection, message);
    }

    return message.id;
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

  public broadcastStream(
    channel: string,
    payload: WSXBinaryData,
    options?: WSXStreamSendOptions
  ): string {
    const message = this.createStreamMessage(channel, options);

    for (const connection of this.connections.values()) {
      this.sendStreamFrame(connection, message, payload);
    }

    return message.id;
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

  public sendStreamToConnection(
    connectionId: string,
    channel: string,
    payload: WSXBinaryData,
    options?: WSXStreamSendOptions
  ): string | undefined {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return undefined;
    }

    const message = this.createStreamMessage(channel, options);
    this.sendStreamFrame(connection, message, payload);
    return message.id;
  }

  public sendJsonToConnection(
    connectionId: string,
    channel: string,
    data: any,
    options?: WSXJSONSendOptions
  ): string | undefined {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return undefined;
    }

    const message = this.createJsonMessage(channel, data, options);
    this.sendJsonMessage(connection, message);
    return message.id;
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
