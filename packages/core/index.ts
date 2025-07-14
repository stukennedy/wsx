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
} from "./types";

// Convenience function to create a WSX server with an adapter
export function createWSXServer(adapter: import("./types").WSXServerAdapter) {
  return new WSXServer(adapter);
}

export { html } from "./utils";
