# WSX - WebSocket Extensions for HTMX-style Hypermedia

**WSX** is a modern, framework-agnostic WebSocket library that brings the simplicity and power of HTMX to real-time web applications. It enables developers to build reactive, real-time applications using familiar hypermedia patterns with WebSocket communication.

## 🚀 Features

- **🔄 Real-time Hypermedia**: Apply HTMX-style patterns to WebSocket communications
- **📡 Out-of-Band Updates**: Update multiple DOM elements from a single WebSocket response
- **🎯 Advanced Triggers**: Rich trigger system with throttling, debouncing, delays, and conditions
- **🔧 Framework Agnostic**: Works with Express, Hono, and other frameworks via adapters
- **🌐 Broadcasting**: Send updates to all connected clients or specific connections
- **⚡ Swap Modifiers**: Control timing, positioning, and animation of DOM updates
- **🔌 Easy Integration**: Drop-in client library with minimal configuration
- **📦 Monorepo Structure**: Organized packages for core, adapters, and client

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Architecture](#architecture)
- [Client Usage](#client-usage)
- [Server Usage](#server-usage)
- [Examples](#examples)
- [API Reference](#api-reference)
- [Contributing](#contributing)

## 🚀 Quick Start

### 1. Install WSX

```bash
# For Express
npm install @wsx/core @wsx/express

# For Hono
npm install @wsx/core @wsx/hono
```

### 2. Create a Server

**Express Example:**

```javascript
import { createExpressWSXServer } from "@wsx/express";
import { html } from '@wsx/core';

const wsx = createExpressWSXServer();
const app = wsx.getApp();

// Handle WebSocket triggers
wsx.on("update-content", async (request, connection) => {
  return {
    id: request.id,
    target: request.target,
    html: html`<div>Updated at ${new Date().toLocaleTimeString()}</div>`,
    swap: "innerHTML",
  };
});

app.listen(3000);
```

**Hono Example:**

```javascript
import { createHonoWSXServer } from "@wsx/hono";
import { html } from '@wsx/core';

const wsx = createHonoWSXServer();
const app = wsx.getApp();

wsx.on("update-content", async (request, connection) => {
  return {
    id: request.id,
    target: request.target,
    html: html`<div>Updated at ${new Date().toLocaleTimeString()}</div>`,
    swap: "innerHTML",
  };
});

export default { fetch: app.fetch };
```

### 3. Add Client-side WSX

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="/path/to/wsx.js"></script>
  </head>
  <body>
    <div wx-config='{"url": "ws://localhost:3000/ws", "debug": true}'>
      <div id="content">Original content</div>
      <button wx-send="update-content" wx-target="#content">
        Update Content
      </button>
    </div>
  </body>
</html>
```

## 📦 Installation

WSX is organized as a monorepo with separate packages for different use cases:

```bash
# Core library (required)
npm install @wsx/core

# Framework adapters (choose one)
npm install @wsx/express  # For Express.js
npm install @wsx/hono     # For Hono framework

# Client library is included in examples/
```

## 🏗️ Architecture

WSX follows a modular architecture with clear separation of concerns:

```
wsx/
├── packages/
│   ├── core/           # Core WSX server logic
│   ├── client/         # Client-side JavaScript library
│   ├── express/        # Express.js adapter
│   └── hono/          # Hono framework adapter
└── examples/
    ├── express/        # Express example application
    └── hono/          # Hono example application
```

### Core Components

- **WSXServer**: Main server class that manages connections and handlers
- **WSXAdapter**: Interface for framework-specific WebSocket handling
- **WSXConnection**: Represents a single WebSocket connection
- **WSXClient**: Browser-side library for WebSocket communication

## 💻 Client Usage

### Basic Setup

```html
<div wx-config='{"url": "ws://localhost:3000/ws", "debug": true}'>
  <!-- Your WSX-enabled content -->
</div>
```

### Trigger Elements

Elements with `wx-send` attribute will trigger WebSocket requests:

```html
<!-- Basic button -->
<button wx-send wx-target="#result">Click Me</button>

<!-- Named handler -->
<button wx-send="update-user" wx-target="#user-info">Update User</button>

<!-- Form submission -->
<form wx-send="submit-form" wx-target="#form-result">
  <input name="message" placeholder="Enter message" />
  <button type="submit">Send</button>
</form>
```

### Advanced Triggers

WSX supports sophisticated trigger patterns:

```html
<!-- Throttled input (max 1 request per 500ms) -->
<input
  wx-send="search"
  wx-target="#results"
  wx-trigger="input throttle:500ms"
/>

<!-- Debounced input (300ms delay) -->
<input wx-send="search" wx-target="#results" wx-trigger="input queue" />

<!-- Key-specific triggers -->
<input wx-send="search" wx-target="#results" wx-trigger="keyup[Enter]" />

<!-- Conditional triggers -->
<input wx-send="search" wx-target="#results" wx-trigger="keyup[ctrlKey]" />

<!-- Delayed actions -->
<button
  wx-send="delayed-action"
  wx-target="#result"
  wx-trigger="click delay:1s"
>
  Delayed Button
</button>

<!-- One-time triggers -->
<button wx-send="once-action" wx-target="#result" wx-trigger="click once">
  Click Once
</button>

<!-- Changed values only -->
<input
  wx-send="changed-search"
  wx-target="#results"
  wx-trigger="blur changed"
/>
```

### Swap Specifications

Control how content is inserted and animated:

```html
<!-- Basic swap types -->
<div wx-swap="innerHTML">Replace content</div>
<div wx-swap="outerHTML">Replace entire element</div>
<div wx-swap="beforebegin">Insert before element</div>
<div wx-swap="afterend">Insert after element</div>

<!-- Timing and animation -->
<div wx-swap="innerHTML swap:300ms settle:100ms">Animated swap</div>
<div wx-swap="innerHTML show:top scroll:smooth">Scroll to top</div>
```

## 🖥️ Server Usage

### Basic Handler

```javascript
// Handle all click events
wsx.on("click", async (request, connection) => {
  return {
    id: request.id,
    target: request.target,
    html: `<div>Clicked at ${new Date().toLocaleTimeString()}</div>`,
  };
});

// Handle specific named events
wsx.on("update-user", async (request, connection) => {
  const userId = request.data.userId;
  // ... update user logic
  return {
    id: request.id,
    target: request.target,
    html: `<div>User ${userId} updated</div>`,
  };
});
```

### Out-of-Band Updates

Update multiple DOM elements from a single response:

```javascript
wsx.on("complex-update", async (request, connection) => {
  return {
    id: request.id,
    target: request.target,
    html: `<div>Main content updated</div>`,
    oob: [
      {
        target: "#sidebar",
        html: `<div>Sidebar updated</div>`,
        swap: "innerHTML",
      },
      {
        target: "#notification",
        html: `<div class="alert">Update complete!</div>`,
        swap: "afterbegin",
      },
    ],
  };
});
```

### Broadcasting

Send updates to all connected clients:

```javascript
// Broadcast to all connections
wsx.broadcast("#global-status", "<div>Server status: Online</div>");

// Send to specific connection
wsx.sendToConnection(
  connectionId,
  "#user-notification",
  "<div>Personal message</div>"
);
```

### Connection Management

```javascript
// Get all connections
const connections = wsx.getConnections();

// Get connection count
const count = wsx.getConnectionCount();

// Handle connection events
wsx.on((request, connection) => {
  console.log(`Request from ${connection.id}: ${request.handler}`);
});
```

## 📚 Examples

### Real-time Chat

```javascript
// Server
wsx.on("send-message", async (request, connection) => {
  const message = request.data.message;
  const timestamp = new Date().toLocaleTimeString();

  // Broadcast to all connections
  wsx.broadcast(
    "#chat-messages",
    `
    <div class="message">
      <span class="time">${timestamp}</span>
      <span class="text">${message}</span>
    </div>
  `,
    "afterbegin"
  );

  // Clear the input for the sender
  return {
    id: request.id,
    target: "#message-input",
    html: "",
    swap: "innerHTML",
  };
});
```

```html
<!-- Client -->
<div id="chat-messages"></div>
<form wx-send="send-message" wx-target="#message-input">
  <input name="message" id="message-input" placeholder="Type message..." />
  <button type="submit">Send</button>
</form>
```

### Live Search

```javascript
// Server
wsx.on("search", async (request, connection) => {
  const query = request.data.search;
  const results = await searchDatabase(query);

  return {
    id: request.id,
    target: request.target,
    html: results.map((r) => `<div class="result">${r.title}</div>`).join(""),
  };
});
```

```html
<!-- Client -->
<input
  wx-send="search"
  wx-target="#results"
  wx-trigger="input throttle:300ms"
  placeholder="Search..."
/>
<div id="results"></div>
```

### Live Dashboard

```javascript
// Server
setInterval(() => {
  const stats = getSystemStats();
  wsx.broadcast(
    "#dashboard",
    `
    <div class="stats">
      <div>CPU: ${stats.cpu}%</div>
      <div>Memory: ${stats.memory}%</div>
      <div>Active Users: ${wsx.getConnectionCount()}</div>
    </div>
  `
  );
}, 5000);
```

## 🏷️ HTML Template Helper

WSX provides a template helper for better TypeScript support and syntax highlighting when building HTML in your handlers:

```javascript
import { html } from '@wsx/core';

wsx.on("create-user", async (request, connection) => {
  const { name, email } = request.data;
  
  // Use the html helper for template literals
  return {
    id: request.id,
    target: request.target,
    html: html`
      <div class="user-card">
        <h3>${name}</h3>
        <p>Email: ${email}</p>
        <small>Created: ${new Date().toLocaleString()}</small>
      </div>
    `
  };
});
```

### Benefits

- **TypeScript Support**: Better type inference and checking
- **Syntax Highlighting**: Improved IDE support for HTML in template literals
- **Auto-completion**: Better HTML attribute and tag completion
- **Linting**: HTML linting works inside template literals

### Usage Pattern

```javascript
// ✅ Recommended: Use the html helper
html: html`<div>Content with ${variable}</div>`

// ❌ Avoid: Plain template literals
html: `<div>Content with ${variable}</div>`
```

## 📖 API Reference

### Server API

#### WSXServer

```javascript
// Create server
const wsx = new WSXServer(adapter);

// Register handlers
wsx.on(handler: string, handlerFunction: WSXHandler): WSXServer
wsx.on(handlerFunction: WSXHandler): WSXServer

// Broadcasting
wsx.broadcast(target: string, html: string, swap?: string): void
wsx.sendToConnection(connectionId: string, target: string, html: string, swap?: string): void

// Connection management
wsx.getConnections(): WSXConnection[]
wsx.getConnectionCount(): number
wsx.removeConnection(connectionId: string): void
```

#### WSXRequest

```javascript
interface WSXRequest {
  id: string;
  handler: string;
  target: string;
  trigger: string;
  data?: Record<string, any>;
  swap?: string;
}
```

#### WSXResponse

```javascript
interface WSXResponse {
  id: string;
  target: string;
  html: string;
  swap?: string;
  oob?: WSXOOBUpdate[];
}
```

### Client API

#### WSX Constructor

```javascript
const wsx = new WSX({
  url: "ws://localhost:3000/ws",
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  debug: false,
});
```

#### Methods

```javascript
// Connection management
wsx.disconnect(): void
wsx.reconnect(): void
wsx.isConnected(): boolean

// Programmatic triggers
wsx.trigger(selector: string, data?: object): void
```

#### Events

```javascript
// Connection events
document.addEventListener("wsx:connected", (event) => {
  console.log("Connected to WSX server");
});

document.addEventListener("wsx:disconnected", (event) => {
  console.log("Disconnected from WSX server");
});

// Swap events
element.addEventListener("wsx:beforeSwap", (event) => {
  console.log("Before swap:", event.detail);
});

element.addEventListener("wsx:afterSwap", (event) => {
  console.log("After swap:", event.detail);
});
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to help improve WSX.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/stukennedy/wsx.git
cd wsx

# Install dependencies
npm install

# Build packages
npm run build

# Run examples
npm run example:express
npm run example:hono
```

### Running Tests

```bash
npm test
```

### Package Scripts

```bash
npm run build     # Build all packages
npm run dev       # Development mode
npm run clean     # Clean build artifacts
npm run lint      # Run linting
```

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [HTMX](https://htmx.org/) and its hypermedia approach
- Built for modern real-time web applications
- Designed to work seamlessly with existing frameworks

---

**WSX** - Making real-time web development as simple as traditional hypermedia. 🚀
