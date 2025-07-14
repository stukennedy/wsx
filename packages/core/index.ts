// Core exports
import { WSXServer } from "./wsx-server";
export { WSXServer } from "./wsx-server";
export type {
  WSXRequest,
  WSXResponse,
  WSXOOBUpdate,
  WSXConnection,
  WSXHandler,
  WSXServerAdapter,
  WSXServerConfig,
} from "./types";

// Convenience function to create a WSX server with an adapter
export function createWSXServer(adapter: import("./types").WSXServerAdapter, config?: import("./types").WSXServerConfig) {
  return new WSXServer(adapter, config);
}

export { html } from "./utils";
