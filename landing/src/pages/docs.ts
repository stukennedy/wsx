import { Context } from "hono";
import { html } from "@wsx/core";

export const docsPage = (c: Context) => {
  return c.html(html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>WSX Documentation</title>
        <meta
          name="description"
          content="Complete documentation for the WSX real-time hypermedia framework."
        />

        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
              sans-serif;
            background: #0a0a0a;
            color: #fff;
            line-height: 1.6;
          }

          .docs-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
          }

          .docs-title {
            font-size: 3rem;
            margin-bottom: 1rem;
            background: linear-gradient(45deg, #00ffff, #ff0080);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .docs-subtitle {
            font-size: 1.25rem;
            margin-bottom: 2rem;
            opacity: 0.8;
          }

          .docs-iframe {
            width: 100%;
            height: 80vh;
            border: 2px solid #00ffff;
            border-radius: 12px;
            background: #fff;
            margin-bottom: 2rem;
          }

          .docs-links {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            justify-content: center;
          }

          .docs-link {
            padding: 0.75rem 1.5rem;
            background: transparent;
            border: 2px solid #00ffff;
            color: #00ffff;
            text-decoration: none;
            border-radius: 6px;
            transition: all 0.3s ease;
            font-weight: 500;
          }

          .docs-link:hover {
            background: #00ffff;
            color: #0a0a0a;
            box-shadow: 0 0 20px #00ffff;
          }

          .docs-link.secondary {
            border-color: #ff0080;
            color: #ff0080;
          }

          .docs-link.secondary:hover {
            background: #ff0080;
            box-shadow: 0 0 20px #ff0080;
          }

          @media (max-width: 768px) {
            .docs-container {
              padding: 1rem;
            }

            .docs-title {
              font-size: 2rem;
            }

            .docs-iframe {
              height: 70vh;
            }

            .docs-links {
              flex-direction: column;
              align-items: center;
            }

            .docs-link {
              width: 100%;
              max-width: 300px;
              text-align: center;
            }
          }
        </style>
      </head>
      <body>
        <div class="docs-container">
          <h1 class="docs-title">WSX Documentation</h1>
          <p class="docs-subtitle">
            Complete documentation for the WSX real-time hypermedia framework
          </p>

          <!-- Embedded Mintlify Docs -->
          <iframe
            src="https://docs.wsx.sh"
            class="docs-iframe"
            title="WSX Documentation"
            frameborder="0"
            allowfullscreen
          ></iframe>

          <div class="docs-links">
            <a href="/" class="docs-link secondary">← Back to Home</a>
            <a href="https://docs.wsx.sh" target="_blank" class="docs-link"
              >Open in New Tab</a
            >
            <a
              href="https://github.com/stukennedy/wsx"
              target="_blank"
              class="docs-link"
              >GitHub Repository</a
            >
          </div>
        </div>
      </body>
    </html>
  `);
};
