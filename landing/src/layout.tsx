import { Hono, Env } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";

const RootLayout = jsxRenderer(({ children }) => (
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>WSX - Real-Time Hypermedia Framework</title>
      <meta
        name="description"
        content="WSX brings HTMX-style patterns to WebSocket communications for real-time, reactive web applications."
      />

      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Fira+Code:wght@300;400;500&display=swap"
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/main.css" />
    </head>
    <body>
      <header class="header">
        <nav class="nav">
          <a href="/" class="logo">
            WSX
          </a>
          <ul class="nav-links">
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#demo">Demo</a>
            </li>
            <li>
              <a href="/docs">Docs</a>
            </li>
            <li>
              <a href="https://github.com/stukennedy/wsx" target="_blank">
                GitHub
              </a>
            </li>
          </ul>
        </nav>
      </header>
      {children}
    </body>
  </html>
));

export const applyLayouts = <T extends Env>(app: Hono<T>) => {
  app.use(RootLayout);
};
