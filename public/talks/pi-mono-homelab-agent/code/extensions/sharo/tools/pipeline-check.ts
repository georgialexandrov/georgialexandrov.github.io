import type { ExtensionAPI, AgentToolResult } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { curl } from "../config/index.js";
import { qwenModel } from "../config/qwen.js";

export function register(pi: ExtensionAPI) {
  pi.registerTool({
    name: "pipeline_check",
    label: "Pipeline Check",
    description: "Check if the local Qwen LLM is responding.",
    parameters: Type.Object({}),
    async execute(): Promise<AgentToolResult<undefined>> {
      const res = JSON.parse(curl("GET", `${qwenModel.baseUrl.replace("/v1", "")}/health`));
      return {
        content: [{ type: "text", text: res.status === "ok" ? "Qwen: healthy" : `Qwen: ${JSON.stringify(res)}` }],
        details: undefined,
      };
    },
  });
}
