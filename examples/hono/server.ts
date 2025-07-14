import { createHonoWSXServer } from "@wsx/hono";
import { html } from "@wsx/core";

// Example server implementation using the new library structure
const wsx = createHonoWSXServer({
  websocketPath: '/example-ws',
  onConnection: (connection) => {
    console.log('Example connection established:', connection.id);
  }
});
const app = wsx.getApp();

// Global action counter for OOB demos
let actionCounter = 0;

// Serve static files
app.get("/", (c) => {
  return c.html(html`
    <!DOCTYPE html>
    <html>
      <head>
        <title>WSX Example</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="/wsx.js"></script>
      </head>
      <body class="bg-gray-100 p-8">
        <div wx-config='{"url": "ws://localhost:8787/example-ws", "debug": true}'>
          <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold">WSX Example</h1>

            <!-- Counter that gets updated via OOB -->
            <div id="counter" class="bg-blue-100 px-3 py-1 rounded">
              <span class="text-sm text-blue-800">Actions: 0</span>
            </div>
          </div>

          <!-- Notification area that gets updated via OOB -->
          <div id="notifications" class="mb-4">
            <!-- OOB notifications appear here -->
          </div>

          <div id="content" class="mb-4 p-4 bg-white rounded min-h-[100px]">
            <p>
              Click the buttons below to test WSX with different swap modifiers
            </p>
            <p class="text-sm text-gray-600 mt-2">
              Notice how the counter and notifications update automatically!
            </p>
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

          <div class="mb-4">
            <button
              wx-send="oob-demo"
              wx-target="#content"
              wx-trigger="click"
              class="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:from-pink-600 hover:to-purple-600 text-lg font-semibold"
            >
              🚀 Out-of-Band Demo (Updates Multiple Areas)
            </button>
          </div>

          <form wx-send wx-target="#content" wx-trigger="submit" class="mt-4">
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

          <div class="mt-4 space-y-4">
            <h3 class="text-lg font-semibold">Advanced Trigger Examples:</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1"
                  >Throttled Search (500ms):</label
                >
                <input
                  type="text"
                  name="search"
                  placeholder="Throttled real-time search"
                  wx-send="throttled-search"
                  wx-target="#content"
                  wx-trigger="input throttle:500ms"
                  class="border px-3 py-2 rounded w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1"
                  >Debounced Search (queue):</label
                >
                <input
                  type="text"
                  name="search"
                  placeholder="Debounced search"
                  wx-send="debounced-search"
                  wx-target="#content"
                  wx-trigger="input queue"
                  class="border px-3 py-2 rounded w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1"
                  >Enter Key Only:</label
                >
                <input
                  type="text"
                  name="search"
                  placeholder="Press Enter to search"
                  wx-send="enter-search"
                  wx-target="#content"
                  wx-trigger="keyup[Enter]"
                  class="border px-3 py-2 rounded w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1"
                  >Changed Values Only:</label
                >
                <input
                  type="text"
                  name="search"
                  placeholder="Only when value changes"
                  wx-send="changed-search"
                  wx-target="#content"
                  wx-trigger="blur changed"
                  class="border px-3 py-2 rounded w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1"
                  >Delayed Action (1s):</label
                >
                <button
                  wx-send="delayed-action"
                  wx-target="#content"
                  wx-trigger="click delay:1s"
                  class="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 w-full"
                >
                  Delayed Button (1s)
                </button>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">Once Only:</label>
                <button
                  wx-send="once-action"
                  wx-target="#content"
                  wx-trigger="click once"
                  class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full"
                >
                  Click Once Only
                </button>
              </div>
            </div>
          </div>

          <!-- Sidebar for recent actions (also updated via OOB) -->
          <div class="mt-8">
            <h3 class="text-lg font-semibold mb-2">Recent Actions</h3>
            <div
              id="recent-actions"
              class="bg-gray-50 p-4 rounded border max-h-48 overflow-y-auto"
            >
              <p class="text-gray-500 text-sm">Actions will appear here...</p>
            </div>
          </div>
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
    {
      target: "#notifications",
      html: html`
        <div
          class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-2"
        >
          <span class="block sm:inline"
            >Action ${actionCounter} completed at
            ${new Date().toLocaleTimeString()}</span
          >
        </div>
      `,
      swap: "afterbegin",
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
      </div>
    `,
    swap: "innerHTML swap:300ms settle:100ms show:top",
    oob: createOOBUpdates(),
  };
});

wsx.on("submit", async (request, connection) => {
  const message = request.data?.message || "No message provided";
  return {
    id: request.id,
    target: request.target,
    html: html`
      <div class="text-blue-600 p-4 border-l-4 border-blue-400 bg-blue-50">
        <p><strong>Form submitted:</strong> ${message}</p>
        <p>Time: ${new Date().toLocaleTimeString()}</p>
      </div>
    `,
    swap: "innerHTML swap:500ms settle:200ms scroll:bottom",
    oob: createOOBUpdates(),
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

// Special OOB demo handler
wsx.on("oob-demo", async (request, connection) => {
  const colors = ["red", "blue", "green", "purple", "yellow", "pink"];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  return {
    id: request.id,
    target: request.target,
    html: html`
      <div
        class="text-${randomColor}-600 p-6 border-2 border-${randomColor}-300 bg-${randomColor}-50 rounded-lg"
      >
        <h3 class="text-xl font-bold mb-2">🎉 Out-of-Band Demo!</h3>
        <p>This updates the <strong>main content area</strong>, but also:</p>
        <ul class="list-disc list-inside mt-2 space-y-1">
          <li>✅ Updates the counter in the header</li>
          <li>✅ Adds a notification at the top</li>
          <li>✅ Updates the recent actions sidebar</li>
        </ul>
        <p class="mt-3 text-sm">All from a single WebSocket response!</p>
        <p class="text-xs text-gray-600">
          Time: ${new Date().toLocaleTimeString()}
        </p>
      </div>
    `,
    swap: "innerHTML swap:200ms settle:150ms",
    oob: [
      ...createOOBUpdates(),
      {
        target: "#recent-actions",
        html: html`
          <div
            class="text-xs text-gray-600 p-2 border-l-2 border-${randomColor}-300 bg-${randomColor}-25 mb-1"
          >
            <strong>OOB Demo:</strong> Updated at
            ${new Date().toLocaleTimeString()}
          </div>
        `,
        swap: "afterbegin",
      },
    ],
  };
});

// Advanced trigger handlers
wsx.on("throttled-search", async (request, connection) => {
  const search = request.data?.search || "";
  const results = search
    ? [
        `Throttled result 1 for "${search}"`,
        `Throttled result 2 for "${search}"`,
        `Throttled result 3 for "${search}"`,
      ]
    : [];

  return {
    id: request.id,
    target: request.target,
    html: html`
      <div class="text-blue-600 p-4 border-l-4 border-blue-400 bg-blue-50">
        <p><strong>Throttled Search (max 1 per 500ms):</strong> ${search}</p>
        <p>Time: ${new Date().toLocaleTimeString()}</p>
        ${results.length > 0
          ? `<ul class="list-disc list-inside mt-2">
            ${results.map((result) => `<li>${result}</li>`).join("")}
          </ul>`
          : '<p class="text-gray-500">Start typing to see throttled results...</p>'}
      </div>
    `,
    swap: "innerHTML",
  };
});

wsx.on("debounced-search", async (request, connection) => {
  const search = request.data?.search || "";
  const results = search
    ? [
        `Debounced result 1 for "${search}"`,
        `Debounced result 2 for "${search}"`,
      ]
    : [];

  return {
    id: request.id,
    target: request.target,
    html: html`
      <div class="text-green-600 p-4 border-l-4 border-green-400 bg-green-50">
        <p><strong>Debounced Search (300ms delay):</strong> ${search}</p>
        <p>Time: ${new Date().toLocaleTimeString()}</p>
        ${results.length > 0
          ? `<ul class="list-disc list-inside mt-2">
            ${results.map((result) => `<li>${result}</li>`).join("")}
          </ul>`
          : '<p class="text-gray-500">Start typing to see debounced results...</p>'}
      </div>
    `,
    swap: "innerHTML",
  };
});

wsx.on("enter-search", async (request, connection) => {
  const search = request.data?.search || "";

  return {
    id: request.id,
    target: request.target,
    html: html`
      <div
        class="text-purple-600 p-4 border-l-4 border-purple-400 bg-purple-50"
      >
        <p><strong>Enter Key Search:</strong> ${search}</p>
        <p>Triggered only when Enter is pressed!</p>
        <p>Time: ${new Date().toLocaleTimeString()}</p>
      </div>
    `,
    swap: "innerHTML",
  };
});

wsx.on("changed-search", async (request, connection) => {
  const search = request.data?.search || "";

  return {
    id: request.id,
    target: request.target,
    html: html`
      <div
        class="text-yellow-600 p-4 border-l-4 border-yellow-400 bg-yellow-50"
      >
        <p><strong>Changed Value Search:</strong> ${search}</p>
        <p>Only triggers when value actually changes and field loses focus</p>
        <p>Time: ${new Date().toLocaleTimeString()}</p>
      </div>
    `,
    swap: "innerHTML",
  };
});

wsx.on("delayed-action", async (request, connection) => {
  return {
    id: request.id,
    target: request.target,
    html: html`
      <div
        class="text-orange-600 p-4 border-l-4 border-orange-400 bg-orange-50"
      >
        <p><strong>Delayed Action Executed!</strong></p>
        <p>This action was delayed by 1 second after the click</p>
        <p>Time: ${new Date().toLocaleTimeString()}</p>
      </div>
    `,
    swap: "innerHTML",
  };
});

wsx.on("once-action", async (request, connection) => {
  return {
    id: request.id,
    target: request.target,
    html: html`
      <div class="text-red-600 p-4 border-l-4 border-red-400 bg-red-50">
        <p><strong>Once Action Executed!</strong></p>
        <p>This button can only be clicked once</p>
        <p>Try clicking it again - it won't work!</p>
        <p>Time: ${new Date().toLocaleTimeString()}</p>
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
    html: html`
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
    html: html`
      <div
        class="text-purple-600 p-2 border border-purple-300 bg-purple-50 rounded mb-2"
      >
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
        html: html`
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
        html: html`
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
        html: html`
          <div class="text-purple-600 transition-all duration-300">
            <p><strong>Search results for:</strong> ${search}</p>
            ${results.length > 0
              ? `<ul class="list-disc list-inside mt-2 space-y-1">
                ${results
                  .map(
                    (result) =>
                      `<li class="hover:bg-purple-50 p-1 rounded">${result}</li>`
                  )
                  .join("")}
              </ul>`
              : '<p class="text-gray-500">Start typing to see results...</p>'}
          </div>
        `,
        swap: "innerHTML swap:100ms settle:50ms",
      };

    default:
      return {
        id: request.id,
        target: request.target,
        html: html`
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
