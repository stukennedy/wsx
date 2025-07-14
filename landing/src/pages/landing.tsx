import { Context } from "hono";

export const landingPage = (c: Context) => {
  return c.render(
    <div wx-config='{"url": "ws://localhost:8787/landing-ws", "debug": true}'>
      <div id="live-stats" class="live-indicator">
        <span class="live-dot"></span>
        Demo Mode
      </div>

      <section class="hero">
        <div
          id="animated-hero-text"
          class="animated-hero-text"
          wx-send="animate-hero"
          wx-target="#animated-hero-text"
          wx-trigger="load, click delay:2000ms"
        >
          <h1 class="hero-title neon-text">WSX</h1>
        </div>

        <h2 class="hero-subtitle">
          Real-Time Hypermedia Framework
          <br />
          <span class="retro-text">WebSockets meet HTMX</span>
        </h2>

        <div class="hero-cta">
          <a href="#demo" class="cta-button">
            Try Live Demo
          </a>
          <a href="/docs" class="cta-button secondary">
            Read Docs
          </a>
        </div>
      </section>

      <section id="demo" class="demo-section">
        <div class="demo-container">
          <h2 class="demo-title neon-text">Experience WSX Live</h2>
          <p>Click any button to see real-time WebSocket hypermedia updates:</p>

          <div class="demo-controls">
            <button
              class="demo-button"
              wx-send="demo-interaction"
              wx-target="#demo-output"
            >
              🚀 Launch Update
            </button>

            <button
              class="demo-button"
              wx-send="demo-interaction"
              wx-target="#demo-output"
            >
              ⚡ Send Pulse
            </button>

            <button
              class="demo-button"
              wx-send="demo-interaction"
              wx-target="#demo-output"
            >
              🌈 Magic Trigger
            </button>

            <button
              class="demo-button"
              wx-send="demo-interaction"
              wx-target="#demo-output"
            >
              🔥 Fire Event
            </button>
          </div>

          <div id="demo-output" class="demo-output">
            <span class="text-dim">
              Click a button above to see WSX in action...
            </span>
          </div>

          <div class="demo-stats">
            <span class="text-dim">Live Counter: </span>
            <span id="demo-counter" class="neon-text">
              <span class="counter-value">0</span>
            </span>
          </div>
        </div>
      </section>

      <section id="features" class="features-section">
        <div class="features-container">
          <h2 class="features-title neon-text">Hypermedia Goes Real-Time</h2>

          <div class="features-grid">
            <div
              class="feature-card"
              wx-send="show-feature"
              wx-target="#feature-showcase"
              wx-trigger="click"
              data-feature="realtime"
            >
              <div class="feature-icon">⚡</div>
              <h3 class="feature-title">Real-Time Hypermedia</h3>
              <p class="feature-description">
                Bring HTMX-style patterns to WebSocket communications for
                reactive, real-time applications.
              </p>
            </div>

            <div
              class="feature-card"
              wx-send="show-feature"
              wx-target="#feature-showcase"
              wx-trigger="click"
              data-feature="oob"
            >
              <div class="feature-icon">🎯</div>
              <h3 class="feature-title">Out-of-Band Updates</h3>
              <p class="feature-description">
                Update multiple DOM elements simultaneously from a single
                WebSocket response.
              </p>
            </div>

            <div
              class="feature-card"
              wx-send="show-feature"
              wx-target="#feature-showcase"
              wx-trigger="click"
              data-feature="triggers"
            >
              <div class="feature-icon">🎮</div>
              <h3 class="feature-title">Advanced Triggers</h3>
              <p class="feature-description">
                Rich trigger system with debouncing, throttling, delays, and
                conditional logic.
              </p>
            </div>

            <div
              class="feature-card"
              wx-send="show-feature"
              wx-target="#feature-showcase"
              wx-trigger="click"
              data-feature="framework"
            >
              <div class="feature-icon">🔧</div>
              <h3 class="feature-title">Framework Agnostic</h3>
              <p class="feature-description">
                Works seamlessly with Express, Hono, and custom adapters via a
                clean API.
              </p>
            </div>
          </div>

          <div id="feature-showcase" class="feature-showcase">
            <p class="text-dim">
              Click a feature above to see code examples...
            </p>
          </div>
        </div>
      </section>

      <section class="stats-section">
        <div class="stats-container">
          <h2 class="stats-title neon-text">Live Framework Stats</h2>

          <div
            id="stats-display"
            wx-send="get-stats"
            wx-target="#stats-display"
            wx-trigger="load, click delay:5000ms"
          >
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number neon-text">...</div>
                <div class="stat-label">Loading...</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer class="footer">
        <div class="footer-content">
          <div class="footer-links">
            <a href="/docs">Documentation</a>
            <a href="https://github.com/stukennedy/wsx" target="_blank">
              GitHub
            </a>
            <a href="https://npm.im/@wsx/core" target="_blank">
              NPM
            </a>
            <a href="#demo">Demo</a>
            <a href="mailto:hello@wsx.dev">Contact</a>
          </div>

          <p class="text-dim">
            &copy; 2025 WSX Framework. Built with ❤️ for the real-time web.
          </p>
        </div>
      </footer>

      <script src="/wsx.js"></script>
    </div>
  );
};
