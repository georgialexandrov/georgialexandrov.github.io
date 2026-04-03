import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { register as commandFilter } from "./command-filter.js";
import { register as qwenPiiGate } from "./qwen-pii-gate.js";
import { register as piiFilter } from "./pii-filter.js";
import { register as toolLog } from "./tool-log.js";

export function registerHooks(pi: ExtensionAPI) {
  toolLog(pi);
  commandFilter(pi);
  qwenPiiGate(pi);
  piiFilter(pi);
}
