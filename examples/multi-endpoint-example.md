# Multiple WebSocket Endpoints Example

This example demonstrates how to create multiple WSX servers with different WebSocket endpoints for different parts of your application.

## Server Setup

```typescript
import { createHonoWSXServer } from "@wsx-sh/hono";
import { html } from "@wsx-sh/core";

// Chat application WebSocket server
const chatWsx = createHonoWSXServer({
  websocketPath: "/chat-ws",
  onConnection: (connection) => {
    console.log("Chat connection established:", connection.id);
  },
});

// Dashboard WebSocket server
const dashboardWsx = createHonoWSXServer({
  websocketPath: "/dashboard-ws",
  onConnection: (connection) => {
    console.log("Dashboard connection established:", connection.id);
  },
});

// Main application
const app = chatWsx.getApp();

// Chat handlers
chatWsx.on("send-message", async (request, connection) => {
  const { message } = request.data;

  // Broadcast to all chat connections
  chatWsx.broadcast(
    "#chat-messages",
    html`
      <div class="message"><strong>${connection.id}:</strong> ${message}</div>
    `
  );

  return {
    id: request.id,
    target: request.target,
    html: html`<div class="success">Message sent!</div>`,
  };
});

// Dashboard handlers
dashboardWsx.on("update-metrics", async (request, connection) => {
  const metrics = {
    users: dashboardWsx.getConnectionCount(),
    messages: Math.floor(Math.random() * 1000),
  };

  return {
    id: request.id,
    target: request.target,
    html: html`
      <div class="metrics">
        <div>Active Users: ${metrics.users}</div>
        <div>Messages: ${metrics.messages}</div>
      </div>
    `,
  };
});

// Routes
app.get("/chat", (c) => {
  return c.html(html`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Chat</title>
        <script src="/wsx.js"></script>
      </head>
      <body wx-config='{"url": "ws://localhost:8787/chat-ws", "debug": true}'>
        <div id="chat-messages"></div>
        <form wx-send="send-message" wx-target="#chat-result">
          <input type="text" name="message" placeholder="Type a message..." />
          <button type="submit">Send</button>
        </form>
        <div id="chat-result"></div>
      </body>
    </html>
  `);
});

app.get("/dashboard", (c) => {
  return c.html(html`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Dashboard</title>
        <script src="/wsx.js"></script>
      </head>
      <body
        wx-config='{"url": "ws://localhost:8787/dashboard-ws", "debug": true}'
      >
        <div
          id="metrics"
          wx-send="update-metrics"
          wx-target="#metrics"
          wx-trigger="load, click interval:5000ms"
        >
          <div>Loading metrics...</div>
        </div>
      </body>
    </html>
  `);
});

export default {
  fetch: app.fetch,
  chatWsx,
  dashboardWsx,
  app,
};
```

## Client Configuration

Each page specifies its own WebSocket endpoint in the `wx-config` attribute:

### Chat Page

```html
<body wx-config='{"url": "ws://localhost:8787/chat-ws", "debug": true}'></body>
```

### Dashboard Page

```html
<body
  wx-config='{"url": "ws://localhost:8787/dashboard-ws", "debug": true}'
></body>
```

## Benefits

1. **Isolation**: Chat and dashboard connections are completely separate
2. **Scalability**: Each endpoint can have different handlers and connection management
3. **Security**: Different endpoints can have different authentication/authorization
4. **Performance**: Broadcast messages only go to relevant connections
5. **Debugging**: Easier to debug specific functionality with separate connection logs

## Configuration Options

The `WSXServerConfig` interface provides these options:

```typescript
interface WSXServerConfig {
  websocketPath?: string; // Default: '/ws'
  onConnection?(connection: WSXConnection): void;
  onDisconnection?(connection: WSXConnection): void;
}
```

## Express Example

The same pattern works with Express:

```typescript
import { createExpressWSXServer } from "@wsx-sh/express";

const wsx = createExpressWSXServer({
  websocketPath: "/api/ws",
  onConnection: (connection) => {
    console.log("API connection:", connection.id);
  },
});
```
