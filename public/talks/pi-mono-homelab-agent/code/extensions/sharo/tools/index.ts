import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { register as healthCheck } from "./health-check.js";
import { register as systemInfo } from "./system-info.js";
import { register as debugLog } from "./debug-log.js";
import { register as pipelineCheck } from "./pipeline-check.js";
import { register as notify } from "./notify.js";
import { register as boardUpdate } from "./board-update.js";
import { register as escalateCall } from "./escalate-call.js";
import { register as composeEdit } from "./compose-edit.js";
import { register as fizzyOtp } from "./fizzy-otp.js";
export function registerTools(pi: ExtensionAPI) {
  healthCheck(pi);
  systemInfo(pi);
  debugLog(pi);
  pipelineCheck(pi);
  notify(pi);
  boardUpdate(pi);
  escalateCall(pi);
  composeEdit(pi);
  fizzyOtp(pi);
}
