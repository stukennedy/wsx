import { createExpressWSXServer } from "@wsx/express";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { html } from "@wsx/core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Example server implementation using Express
const wsx = createExpressWSXServer();
const app = wsx.getApp();

// Global action counter for OOB demos
let actionCounter = 0;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Serve the main HTML page
app.get("/", (req, res) => {
  res.send(html`
    <!DOCTYPE html>
    <html>
      <head>
        <title>WSX Express Example</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="/wsx.js"></script>
      </head>
      <body class="bg-gray-100 p-8">
        <div wx-config='{"url": "ws://localhost:3000/ws", "debug": true}'>
          <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold">WSX Express Example</h1>

            <!-- Counter that gets updated via OOB -->
            <div id="counter" class="bg-blue-100 px-3 py-1 rounded">
              <span class="text-sm text-blue-800">Actions: 0</span>
            </div>
          </div>

          <div id="content" class="mb-4 p-4 bg-white rounded min-h-[100px]">
            <p>Click the button below to test WSX with Express!</p>
            <p class="text-sm text-gray-600 mt-2">
              Notice how the counter updates automatically!
            </p>
          </div>

          <button
            wx-send
            wx-target="#content"
            wx-trigger="click"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test WSX with Express
          </button>
        </div>
      </body>
    </html>
  `);
});

// Helper function to create OOB updates
function createOOBUpdates() {
  actionCounter++;

  return [
    {
      target: "#counter",
      html: `<span class="text-sm text-blue-800">Actions: ${actionCounter}</span>`,
      swap: "innerHTML",
    },
  ];
}

// Handle WSX triggers
wsx.on("click", async (request, connection) => {
  return {
    id: request.id,
    target: request.target,
    html: html`
      <div class="text-green-600">
        <p>Button clicked at ${new Date().toLocaleTimeString()}</p>
        <p>Connection: ${connection.id}</p>
        <p>Running on Express with Node.js!</p>
      </div>
    `,
    swap: "innerHTML swap:300ms settle:100ms show:top",
    oob: createOOBUpdates(),
  };
});

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`WSX Express server running on http://localhost:${PORT}`);
});

// Handle WebSocket upgrade for Express
server.on("upgrade", (request, socket, head) => {
  // This is handled by the ExpressAdapter
});
