import { WSXServer } from "./wsx-server";

// Example usage and helper functions
export function createWSXServer() {
  return new WSXServer();
}

// Example server implementation
const wsx = createWSXServer();
const app = wsx.getApp();

// Serve static files
app.get("/", (c) => {
  return c.html(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>WSX Example</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="/wsx.js"></script>
      </head>
      <body class="bg-gray-100 p-8">
        <div wx-config='{"url": "ws://localhost:8787/ws", "debug": true}'>
          <h1 class="text-2xl font-bold mb-4">WSX Example</h1>
          
          <div id="content" class="mb-4 p-4 bg-white rounded min-h-[100px]">
            <p>Click the buttons below to test WSX with different swap modifiers</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <button 
              wx-send 
              wx-target="#content" 
              wx-trigger="click"
              class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Standard Update (300ms delay)
            </button>
            
            <button 
              wx-send="fast-update"
              wx-target="#content" 
              wx-trigger="click"
              class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Fast Update (No delay)
            </button>
            
            <button 
              wx-send="append-update"
              wx-target="#content" 
              wx-trigger="click"
              class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Append Content
            </button>
          </div>
          
          <form 
            wx-send 
            wx-target="#content" 
            wx-trigger="submit"
            class="mt-4"
          >
            <input 
              type="text" 
              name="message" 
              placeholder="Enter a message"
              class="border px-3 py-2 rounded mr-2"
            />
            <button 
              type="submit"
              class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Send Message
            </button>
          </form>
          
          <div class="mt-4">
            <input 
              type="text" 
              name="search" 
              placeholder="Real-time search"
              wx-send 
              wx-target="#content" 
              wx-trigger="input"
              class="border px-3 py-2 rounded w-full"
            />
          </div>
        </div>
      </body>
      </html>
    `);
});

// Handle WSX triggers
wsx.on("click", async (request, connection) => {
  return {
    id: request.id,
    target: request.target,
    html: `
        <div class="text-green-600">
          <p>Button clicked at ${new Date().toLocaleTimeString()}</p>
          <p>Connection: ${connection.id}</p>
        </div>
      `,
    swap: "innerHTML",
  };
});

wsx.on("submit", async (request, connection) => {
  const message = request.data?.message || "No message provided";
  return {
    id: request.id,
    target: request.target,
    html: `
        <div class="text-blue-600">
          <p><strong>Form submitted:</strong> ${message}</p>
          <p>Time: ${new Date().toLocaleTimeString()}</p>
        </div>
      `,
    swap: "innerHTML",
  };
});

wsx.on("input", async (request, connection) => {
  const search = request.data?.search || "";
  const results = search
    ? [
        `Result 1 for "${search}"`,
        `Result 2 for "${search}"`,
        `Result 3 for "${search}"`,
      ]
    : [];

  return {
    id: request.id,
    target: request.target,
    html: `
        <div class="text-purple-600">
          <p><strong>Search results for:</strong> ${search}</p>
          ${
            results.length > 0
              ? `<ul class="list-disc list-inside mt-2">
              ${results.map((result) => `<li>${result}</li>`).join("")}
            </ul>`
              : '<p class="text-gray-500">Start typing to see results...</p>'
          }
        </div>
      `,
    swap: "innerHTML",
  };
});

// Specific named handlers for different button types
wsx.on("fast-update", async (request, connection) => {
  return {
    id: request.id,
    target: request.target,
    html: `
      <div class="text-green-600 p-4 border-l-4 border-green-400 bg-green-50">
        <p><strong>Fast update!</strong> No swap delay</p>
        <p>Updated at: ${new Date().toLocaleTimeString()}</p>
        <p>Connection: ${connection.id}</p>
      </div>
    `,
    swap: "innerHTML settle:0ms",
  };
});

wsx.on("append-update", async (request, connection) => {
  return {
    id: request.id,
    target: request.target,
    html: `
      <div class="text-purple-600 p-2 border border-purple-300 bg-purple-50 rounded mb-2">
        <p><strong>Appended:</strong> ${new Date().toLocaleTimeString()}</p>
      </div>
    `,
    swap: "afterbegin swap:200ms settle:100ms",
  };
});

// Default handler for when no specific handler is provided
wsx.on(async (request, connection) => {
  // Route based on trigger type when no specific handler is given
  switch (request.trigger) {
    case "click":
      return {
        id: request.id,
        target: request.target,
        html: `
          <div class="text-green-600">
            <p>Button clicked at ${new Date().toLocaleTimeString()}</p>
            <p>Connection: ${connection.id}</p>
          </div>
        `,
        swap: "innerHTML swap:300ms settle:100ms show:top",
      };
      
    case "submit":
      const message = request.data?.message || "No message provided";
      return {
        id: request.id,
        target: request.target,
        html: `
          <div class="text-blue-600 p-4 border-l-4 border-blue-400 bg-blue-50">
            <p><strong>Form submitted:</strong> ${message}</p>
            <p>Time: ${new Date().toLocaleTimeString()}</p>
          </div>
        `,
        swap: "innerHTML swap:500ms settle:200ms scroll:bottom",
      };
      
    case "input":
      const search = request.data?.search || "";
      const results = search
        ? [
            `Result 1 for "${search}"`,
            `Result 2 for "${search}"`,
            `Result 3 for "${search}"`,
          ]
        : [];

      return {
        id: request.id,
        target: request.target,
        html: `
          <div class="text-purple-600 transition-all duration-300">
            <p><strong>Search results for:</strong> ${search}</p>
            ${
              results.length > 0
                ? `<ul class="list-disc list-inside mt-2 space-y-1">
                ${results.map((result) => `<li class="hover:bg-purple-50 p-1 rounded">${result}</li>`).join("")}
              </ul>`
                : '<p class="text-gray-500">Start typing to see results...</p>'
            }
          </div>
        `,
        swap: "innerHTML swap:100ms settle:50ms",
      };
      
    default:
      return {
        id: request.id,
        target: request.target,
        html: `
          <div class="text-red-600">
            <p>Unknown trigger: ${request.trigger}</p>
            <p>Time: ${new Date().toLocaleTimeString()}</p>
          </div>
        `,
        swap: "innerHTML",
      };
  }
});

// Export the fetch function that Wrangler expects
export default {
  fetch: app.fetch,
  wsx,
  app,
};
