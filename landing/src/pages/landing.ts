import { Context } from "hono";
import { html } from "@wsx/core";

export const landingPage = (c: Context) => {
  return c.html(html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>WSX - Real-Time Hypermedia Framework</title>
        <meta
          name="description"
          content="WSX brings HTMX-style patterns to WebSocket communications for real-time, reactive web applications."
        />

        <!-- Fonts -->
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Fira+Code:wght@300;400;500&display=swap"
          rel="stylesheet"
        />

        <style>
          /* CSS Reset & Base */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          :root {
            --neon-pink: #ff0080;
            --neon-blue: #00ffff;
            --neon-green: #00ff00;
            --neon-purple: #8000ff;
            --neon-yellow: #ffff00;
            --dark-bg: #0a0a0a;
            --darker-bg: #050505;
            --grid-color: #1a1a1a;
            --text-dim: #666;
            --text-bright: #fff;
          }

          body {
            font-family: "Orbitron", monospace;
            background: var(--dark-bg);
            color: var(--text-bright);
            overflow-x: hidden;
            scroll-behavior: smooth;
          }

          /* Retro Grid Background */
          body::before {
            content: "";
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: linear-gradient(
                rgba(0, 255, 255, 0.1) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(0, 255, 255, 0.1) 1px,
                transparent 1px
              );
            background-size: 50px 50px;
            animation: grid-move 20s linear infinite;
            pointer-events: none;
            z-index: -1;
          }

          @keyframes grid-move {
            0% {
              transform: translate(0, 0);
            }
            100% {
              transform: translate(50px, 50px);
            }
          }

          /* Neon Text Effects */
          .neon-text {
            color: var(--neon-blue);
            text-shadow: 0 0 5px var(--neon-blue), 0 0 10px var(--neon-blue),
              0 0 15px var(--neon-blue), 0 0 20px var(--neon-blue);
            animation: neon-flicker 2s infinite alternate;
          }

          .glitch-text {
            color: var(--neon-pink);
            text-shadow: 0 0 5px var(--neon-pink), 0 0 10px var(--neon-pink);
            animation: glitch 1s infinite;
          }

          .retro-text {
            background: linear-gradient(
              45deg,
              var(--neon-purple),
              var(--neon-yellow)
            );
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: rainbow-shift 3s ease-in-out infinite;
          }

          .cyber-text {
            color: var(--neon-green);
            text-shadow: 0 0 5px var(--neon-green), 0 0 10px var(--neon-green);
            animation: cyber-pulse 1.5s ease-in-out infinite;
          }

          @keyframes neon-flicker {
            0%,
            100% {
              opacity: 1;
            }
            50% {
              opacity: 0.8;
            }
          }

          @keyframes glitch {
            0% {
              transform: translate(0);
            }
            20% {
              transform: translate(-2px, 2px);
            }
            40% {
              transform: translate(-2px, -2px);
            }
            60% {
              transform: translate(2px, 2px);
            }
            80% {
              transform: translate(2px, -2px);
            }
            100% {
              transform: translate(0);
            }
          }

          @keyframes rainbow-shift {
            0% {
              filter: hue-rotate(0deg);
            }
            50% {
              filter: hue-rotate(180deg);
            }
            100% {
              filter: hue-rotate(360deg);
            }
          }

          @keyframes cyber-pulse {
            0%,
            100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }

          /* Header */
          .header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: rgba(10, 10, 10, 0.9);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid var(--neon-blue);
            z-index: 1000;
            padding: 1rem 2rem;
          }

          .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1400px;
            margin: 0 auto;
          }

          .logo {
            font-size: 1.5rem;
            font-weight: 900;
            color: var(--neon-pink);
            text-shadow: 0 0 10px var(--neon-pink);
            text-decoration: none;
          }

          .nav-links {
            display: flex;
            gap: 2rem;
            list-style: none;
          }

          .nav-links a {
            color: var(--text-bright);
            text-decoration: none;
            transition: all 0.3s ease;
            border: 1px solid transparent;
            padding: 0.5rem 1rem;
            border-radius: 4px;
          }

          .nav-links a:hover {
            color: var(--neon-blue);
            border-color: var(--neon-blue);
            box-shadow: 0 0 10px var(--neon-blue);
          }

          /* Hero Section */
          .hero {
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            position: relative;
            padding: 0 2rem;
          }

          .hero::before {
            content: "";
            position: absolute;
            top: 50%;
            left: 50%;
            width: 800px;
            height: 800px;
            border-radius: 50%;
            border: 2px solid var(--neon-purple);
            transform: translate(-50%, -50%);
            animation: rotate 20s linear infinite;
            opacity: 0.3;
          }

          @keyframes rotate {
            from {
              transform: translate(-50%, -50%) rotate(0deg);
            }
            to {
              transform: translate(-50%, -50%) rotate(360deg);
            }
          }

          .hero-title {
            font-size: clamp(3rem, 8vw, 8rem);
            font-weight: 900;
            margin-bottom: 1rem;
            line-height: 1;
          }

          .hero-subtitle {
            font-size: clamp(1rem, 3vw, 2rem);
            margin-bottom: 2rem;
            opacity: 0.8;
          }

          .hero-cta {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            justify-content: center;
          }

          .cta-button {
            padding: 1rem 2rem;
            border: 2px solid var(--neon-blue);
            background: transparent;
            color: var(--neon-blue);
            text-decoration: none;
            font-family: inherit;
            font-weight: 700;
            border-radius: 8px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }

          .cta-button:hover {
            color: var(--dark-bg);
            background: var(--neon-blue);
            box-shadow: 0 0 20px var(--neon-blue);
            transform: translateY(-2px);
          }

          .cta-button.secondary {
            border-color: var(--neon-pink);
            color: var(--neon-pink);
          }

          .cta-button.secondary:hover {
            background: var(--neon-pink);
            box-shadow: 0 0 20px var(--neon-pink);
          }

          /* Animated Hero Text */
          .animated-hero-text {
            min-height: 4rem;
            margin-bottom: 2rem;
          }

          /* Demo Section */
          .demo-section {
            padding: 4rem 2rem;
            text-align: center;
            position: relative;
          }

          .demo-container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(26, 26, 26, 0.8);
            border: 1px solid var(--neon-green);
            border-radius: 12px;
            padding: 2rem;
            position: relative;
          }

          .demo-title {
            font-size: 2rem;
            margin-bottom: 1rem;
            color: var(--neon-green);
          }

          .demo-controls {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 2rem 0;
          }

          .demo-button {
            padding: 1rem;
            background: transparent;
            border: 1px solid var(--neon-purple);
            color: var(--neon-purple);
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: inherit;
          }

          .demo-button:hover {
            background: var(--neon-purple);
            color: var(--dark-bg);
            box-shadow: 0 0 15px var(--neon-purple);
          }

          .demo-output {
            min-height: 100px;
            border: 1px solid var(--neon-blue);
            border-radius: 6px;
            padding: 1rem;
            margin: 1rem 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          /* Features Section */
          .features-section {
            padding: 4rem 2rem;
            background: linear-gradient(
              45deg,
              var(--darker-bg),
              var(--dark-bg)
            );
          }

          .features-container {
            max-width: 1400px;
            margin: 0 auto;
          }

          .features-title {
            text-align: center;
            font-size: 3rem;
            margin-bottom: 3rem;
            color: var(--neon-yellow);
          }

          .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
          }

          .feature-card {
            background: rgba(26, 26, 26, 0.8);
            border: 1px solid transparent;
            border-radius: 12px;
            padding: 2rem;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }

          .feature-card:hover {
            border-color: var(--neon-blue);
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 255, 255, 0.3);
          }

          .feature-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }

          .feature-title {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: var(--neon-blue);
          }

          .feature-description {
            opacity: 0.8;
            line-height: 1.6;
          }

          .feature-showcase {
            margin-top: 2rem;
            padding: 2rem;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 8px;
            position: relative;
          }

          .code-block {
            background: var(--darker-bg);
            border: 1px solid var(--neon-green);
            border-radius: 6px;
            padding: 1rem;
            margin: 1rem 0;
            font-family: "Fira Code", monospace;
            font-size: 0.9rem;
            color: var(--neon-green);
            overflow-x: auto;
          }

          /* Stats Section */
          .stats-section {
            padding: 4rem 2rem;
            text-align: center;
          }

          .stats-container {
            max-width: 1000px;
            margin: 0 auto;
          }

          .stats-title {
            font-size: 2.5rem;
            margin-bottom: 2rem;
            color: var(--neon-pink);
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
            margin: 2rem 0;
          }

          .stat-item {
            padding: 2rem;
            background: rgba(26, 26, 26, 0.8);
            border: 1px solid var(--neon-purple);
            border-radius: 12px;
            transition: all 0.3s ease;
          }

          .stat-item:hover {
            transform: scale(1.05);
            box-shadow: 0 0 20px var(--neon-purple);
          }

          .stat-number {
            font-size: 2.5rem;
            font-weight: 900;
            margin-bottom: 0.5rem;
          }

          .stat-label {
            opacity: 0.8;
            font-size: 0.9rem;
          }

          /* Footer */
          .footer {
            padding: 3rem 2rem;
            text-align: center;
            border-top: 1px solid var(--neon-blue);
            background: var(--darker-bg);
          }

          .footer-content {
            max-width: 1400px;
            margin: 0 auto;
          }

          .footer-links {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
          }

          .footer-links a {
            color: var(--text-dim);
            text-decoration: none;
            transition: color 0.3s ease;
          }

          .footer-links a:hover {
            color: var(--neon-blue);
          }

          /* Live Indicator */
          .live-indicator {
            position: fixed;
            top: 80px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            border: 1px solid var(--neon-green);
            border-radius: 20px;
            padding: 0.5rem 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.8rem;
            z-index: 1000;
          }

          .live-dot {
            width: 8px;
            height: 8px;
            background: var(--neon-green);
            border-radius: 50%;
            animation: pulse 2s infinite;
          }

          /* Animations */
          @keyframes pulse {
            0%,
            100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.5;
              transform: scale(0.8);
            }
          }

          @keyframes bounce {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          @keyframes glow {
            0%,
            100% {
              box-shadow: 0 0 5px var(--neon-blue);
            }
            50% {
              box-shadow: 0 0 20px var(--neon-blue);
            }
          }

          @keyframes slide {
            0% {
              transform: translateX(-100%);
              opacity: 0;
            }
            100% {
              transform: translateX(0);
              opacity: 1;
            }
          }

          .animate-in {
            animation: slide 0.5s ease-out;
          }

          .animate-fade-in {
            animation: fadeIn 0.5s ease-out;
          }

          .animate-slide-up {
            animation: slideUp 0.5s ease-out;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes slideUp {
            from {
              transform: translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          /* Demo Response Animations */
          .demo-response.pulse {
            animation: pulse 1s ease-in-out;
          }

          .demo-response.glow {
            animation: glow 1s ease-in-out;
          }

          .demo-response.bounce {
            animation: bounce 1s ease-in-out;
          }

          .demo-response.slide {
            animation: slide 0.5s ease-out;
          }

          /* Responsive Design */
          @media (max-width: 768px) {
            .nav-links {
              gap: 1rem;
            }

            .nav-links a {
              padding: 0.25rem 0.5rem;
              font-size: 0.9rem;
            }

            .hero-cta {
              flex-direction: column;
              align-items: center;
            }

            .cta-button {
              width: 100%;
              max-width: 300px;
            }

            .demo-controls {
              grid-template-columns: 1fr;
            }

            .features-grid {
              grid-template-columns: 1fr;
            }

            .stats-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .footer-links {
              flex-direction: column;
              gap: 1rem;
            }

            .live-indicator {
              top: 70px;
              right: 10px;
              font-size: 0.7rem;
            }
          }

          @media (max-width: 480px) {
            .stats-grid {
              grid-template-columns: 1fr;
            }

            .hero {
              padding: 0 1rem;
            }

            .demo-section,
            .features-section,
            .stats-section {
              padding: 2rem 1rem;
            }
          }
        </style>
      </head>
      <body wx-config='{"url": "ws://localhost:8787/ws", "debug": true}'>
        <!-- Live Connection Indicator -->
        <div id="live-stats" class="live-indicator">
          <span class="live-dot"></span>
          Demo Mode
        </div>

        <!-- Header -->
        <header class="header">
          <nav class="nav">
            <a href="/" class="logo">WSX</a>
            <ul class="nav-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#demo">Demo</a></li>
              <li><a href="/docs">Docs</a></li>
              <li>
                <a href="https://github.com/stukennedy/wsx" target="_blank"
                  >GitHub</a
                >
              </li>
            </ul>
          </nav>
        </header>

        <!-- Hero Section -->
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
            Real-Time Hypermedia Framework<br />
            <span class="retro-text">WebSockets meet HTMX</span>
          </h2>

          <div class="hero-cta">
            <a href="#demo" class="cta-button">Try Live Demo</a>
            <a href="/docs" class="cta-button secondary">Read Docs</a>
          </div>
        </section>

        <!-- Interactive Demo -->
        <section id="demo" class="demo-section">
          <div class="demo-container">
            <h2 class="demo-title neon-text">Experience WSX Live</h2>
            <p>
              Click any button to see real-time WebSocket hypermedia updates:
            </p>

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
              <span class="text-dim"
                >Click a button above to see WSX in action...</span
              >
            </div>

            <div class="demo-stats">
              <span class="text-dim">Live Counter: </span>
              <span id="demo-counter" class="neon-text">
                <span class="counter-value">0</span>
              </span>
            </div>
          </div>
        </section>

        <!-- Features Section -->
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

        <!-- Stats Section -->
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

        <!-- Footer -->
        <footer class="footer">
          <div class="footer-content">
            <div class="footer-links">
              <a href="/docs">Documentation</a>
              <a href="https://github.com/stukennedy/wsx" target="_blank"
                >GitHub</a
              >
              <a href="https://npm.im/@wsx/core" target="_blank">NPM</a>
              <a href="#demo">Demo</a>
              <a href="mailto:hello@wsx.dev">Contact</a>
            </div>

            <p class="text-dim">
              &copy; 2025 WSX Framework. Built with ❤️ for the real-time web.
            </p>
          </div>
        </footer>

        <script src="/wsx.js"></script>
      </body>
    </html>
  `);
};
