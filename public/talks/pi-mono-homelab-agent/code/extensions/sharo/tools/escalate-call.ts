import type { ExtensionAPI, AgentToolResult } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";
import { env, curl } from "../config/index.js";
import { getTunnelUrl } from "../../../helpers/tunnel.js";

const params = Type.Object({
  message: Type.String({ description: "Message to speak (read aloud via TTS)" }),
});

export function register(pi: ExtensionAPI) {
  pi.registerTool({
    name: "escalate_call",
    label: "Escalate Call",
    description: "Call the owner via Twilio. Speaks the message, listens for a response.",
    parameters: params,
    async execute(_id: string, p: Static<typeof params>): Promise<AgentToolResult<undefined>> {
      const { sid, token, from, to } = env.twilio;

      // Retry up to 6 times waiting for tunnel (30s total)
      let tunnel = getTunnelUrl();
      for (let i = 0; i < 6 && !tunnel; i++) {
        console.log(`[escalate_call] Tunnel not ready, retrying in 5s (${i + 1}/6)...`);
        await new Promise(r => setTimeout(r, 5000));
        tunnel = getTunnelUrl();
      }
      if (!tunnel) {
        return { content: [{ type: "text", text: "Tunnel not ready after 3 retries — cannot make calls right now." }], details: undefined };
      }
      const answerUrl = `${tunnel}/voice/answer`;
      const body = new URLSearchParams({ To: to, From: from, Url: answerUrl, Method: "POST" }).toString();
      const auth = Buffer.from(`${sid}:${token}`).toString("base64");

      const res = JSON.parse(curl("POST",
        `https://api.twilio.com/2010-04-01/Accounts/${sid}/Calls.json`,
        body, {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        }));

      return {
        content: [{ type: "text", text: res.sid ? `Calling... (${res.sid})` : `Failed: ${JSON.stringify(res)}` }],
        details: undefined,
      };
    },
  });
}
