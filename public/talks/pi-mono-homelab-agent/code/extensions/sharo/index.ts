import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { registerTools } from "./tools/index.js";
import { registerHooks } from "./hooks/index.js";

export default function (pi: ExtensionAPI) {
  console.log("[sharo-ext] Registering tools and hooks...");
  registerTools(pi);
  registerHooks(pi);
  console.log("[sharo-ext] Registration complete.");
}
