import type { ExtensionAPI, AgentToolResult } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { completeSimple } from "@mariozechner/pi-ai";
import type { TextContent } from "@mariozechner/pi-ai";
import { run } from "../config/index.js";
import { qwenModel } from "../config/qwen.js";

interface SensitiveDetails {
  sensitive: boolean;
  scrubAfterDelivery: boolean;
}

const RAILS_CMD = 'docker exec fizzy bin/rails runner "ml = MagicLink.where(purpose: :sign_in).order(created_at: :desc).first; if ml; puts ml.code; else; puts :none; end"';

export function register(pi: ExtensionAPI) {
  pi.registerTool({
    name: "fizzy_otp",
    label: "Fizzy OTP",
    description: "Fetch the latest Fizzy login code. Runs entirely on local Qwen — the code never touches the cloud.",
    parameters: Type.Object({}),
    async execute(): Promise<AgentToolResult<SensitiveDetails>> {
      const code = run(RAILS_CMD, 30000).trim();

      if (code === "none") {
        return {
          content: [{ type: "text", text: "No pending login code. Request one from the Fizzy login page first." }],
          details: { sensitive: false, scrubAfterDelivery: false },
        };
      }

      const response = await completeSimple(qwenModel, {
        messages: [{
          role: "user",
          content: [{ type: "text", text: `The Fizzy login code is: ${code}. Tell the user this code in a short message. Mention it expires soon.` }],
          timestamp: Date.now(),
        }],
      }, { maxTokens: 100, temperature: 0.3 });

      const reply = response.content
        .filter((c): c is TextContent => c.type === "text")
        .map((c) => c.text)
        .join("");

      return {
        content: [{ type: "text", text: reply || `Your Fizzy code: ${code}` }],
        details: { sensitive: true, scrubAfterDelivery: true },
      };
    },
  });
}
