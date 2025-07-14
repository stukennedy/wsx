import { createHonoWSXServer } from "@wsx/hono";
import { html } from "@wsx/core";
import { landingPage } from "./pages/landing";
import { docsPage } from "./pages/docs";

const wsx = createHonoWSXServer();
const app = wsx.getApp();

// Mount our routes
app.get("/", landingPage);
app.get("/docs", docsPage);

// WSX Handlers for landing page interactions
wsx.on("animate-hero", async (request: any, connection: any) => {
  const animations = [
    html`<div class="glitch-text">🚀 WSX: HYPERMEDIA GOES REAL-TIME 🚀</div>`,
    html`<div class="neon-text">⚡ WEBSOCKETS MEET HTMX ⚡</div>`,
    html`<div class="retro-text">🌈 REACTIVE HYPERMEDIA 🌈</div>`,
    html`<div class="cyber-text">🔥 REAL-TIME DOM UPDATES 🔥</div>`,
  ];

  const randomAnimation =
    animations[Math.floor(Math.random() * animations.length)];

  return {
    id: request.id,
    target: request.target,
    html: randomAnimation,
  };
});

wsx.on("show-feature", async (request: any, connection: any) => {
  const { feature } = request.data;

  const features = {
    realtime: {
      icon: "⚡",
      title: "Real-Time Hypermedia",
      description: "HTMX-style patterns with WebSocket power",
      code: `wsx.on("update", async (req, conn) => {
  return {
    target: "#content",
    html: html\`<div class="live">\${data}</div>\`
  };
});`,
    },
    oob: {
      icon: "🎯",
      title: "Out-of-Band Updates",
      description: "Update multiple DOM elements simultaneously",
      code: `return {
  target: "#main",
  html: html\`<div>Main content</div>\`,
  oob: [{
    target: "#sidebar",
    html: html\`<div>Sidebar update</div>\`
  }]
};`,
    },
    triggers: {
      icon: "🎮",
      title: "Advanced Triggers",
      description: "Rich trigger system with debouncing and conditions",
      code: `<input 
  wx-send="search"
  wx-trigger="keyup delay:300ms"
  wx-target="#results"
/>`,
    },
    framework: {
      icon: "🔧",
      title: "Framework Agnostic",
      description: "Works with Express, Hono, and custom adapters",
      code: `import { createHonoWSXServer } from "@wsx/hono";
import { createExpressWSXServer } from "@wsx/express";

const wsx = createHonoWSXServer();`,
    },
  };

  const featureData = features[feature as keyof typeof features];
  if (!featureData) return;

  return {
    id: request.id,
    target: request.target,
    html: html`
      <div class="feature-showcase animate-in">
        <div class="feature-icon">${featureData.icon}</div>
        <h3 class="neon-text">${featureData.title}</h3>
        <p class="feature-description">${featureData.description}</p>
        <pre class="code-block"><code>${featureData.code}</code></pre>
        <div class="feature-glow"></div>
      </div>
    `,
  };
});

wsx.on("demo-interaction", async (request: any, connection: any) => {
  const interactions = [
    html`<div class="demo-response pulse">🎉 WSX Magic Happened! 🎉</div>`,
    html`<div class="demo-response glow">✨ Real-time Update! ✨</div>`,
    html`<div class="demo-response bounce">🚀 Hypermedia Power! 🚀</div>`,
    html`<div class="demo-response slide">⚡ Lightning Fast! ⚡</div>`,
  ];

  const randomResponse =
    interactions[Math.floor(Math.random() * interactions.length)];

  // Simulate multiple updates
  setTimeout(() => {
    wsx.broadcast(
      "#demo-counter",
      html`
        <span class="counter-value">${Math.floor(Math.random() * 1000)}</span>
      `
    );
  }, 500);

  return {
    id: request.id,
    target: request.target,
    html: randomResponse,
  };
});

wsx.on("scroll-reveal", async (request: any, connection: any) => {
  const { section } = request.data;

  return {
    id: request.id,
    target: `#${section}`,
    html: html`<div class="revealed animate-slide-up">
      Section ${section} is now visible!
    </div>`,
    swap: "beforeend",
  };
});

wsx.on("get-stats", async (request: any, connection: any) => {
  const stats = {
    connections: wsx.getConnectionCount(),
    updates: Math.floor(Math.random() * 10000),
    frameworks: ["Express", "Hono", "Custom"],
    version: "1.0.0",
  };

  return {
    id: request.id,
    target: request.target,
    html: html`
      <div class="stats-grid animate-fade-in">
        <div class="stat-item">
          <div class="stat-number neon-text">${stats.connections}</div>
          <div class="stat-label">Live Connections</div>
        </div>
        <div class="stat-item">
          <div class="stat-number neon-text">
            ${stats.updates.toLocaleString()}
          </div>
          <div class="stat-label">DOM Updates</div>
        </div>
        <div class="stat-item">
          <div class="stat-number neon-text">${stats.frameworks.length}</div>
          <div class="stat-label">Frameworks</div>
        </div>
        <div class="stat-item">
          <div class="stat-number neon-text">v${stats.version}</div>
          <div class="stat-label">Version</div>
        </div>
      </div>
    `,
  };
});

// Export the fetch function that Wrangler expects
export default {
  fetch: app.fetch,
  wsx,
  app,
};
