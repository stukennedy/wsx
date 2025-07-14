import { Context } from "hono";

export const docsPage = async (c: Context) => {
  // If the request is to the docs subdirectory
  // Then Proxy to Mintlify
  const DOCS_URL = "https://continuata.mintlify.app/";
  const CUSTOM_URL = "wsx.sh";

  let url = new URL(c.req.url);
  url.hostname = DOCS_URL;

  let proxyRequest = new Request(url, c.req.raw);

  proxyRequest.headers.set("Host", DOCS_URL);
  // proxyRequest.headers.set("X-Forwarded-Host", CUSTOM_URL);
  proxyRequest.headers.set("X-Forwarded-Proto", "https");

  return await fetch(proxyRequest);
};
