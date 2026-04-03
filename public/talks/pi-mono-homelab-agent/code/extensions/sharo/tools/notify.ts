import type { ExtensionAPI, AgentToolResult } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";
import { env, curl } from "../config/index.js";

const params = Type.Object({
  message: Type.String({ description: "Message to send" }),
});

export function register(pi: ExtensionAPI) {
  pi.registerTool({
    name: "notify",
    label: "Notify",
    description: "Send a message to Matrix chat.",
    parameters: params,
    async execute(_id: string, p: Static<typeof params>): Promise<AgentToolResult<undefined>> {
      const { server, room, token } = env.matrix;
      const txnId = `sharo-${Date.now()}`;
      const url = `${server}/_matrix/client/v3/rooms/${encodeURIComponent(room)}/send/m.room.message/${txnId}`;
      const body = JSON.stringify({ msgtype: "m.text", body: p.message });

      curl("PUT", url, body, {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      });

      return {
        content: [{ type: "text", text: "Sent." }],
        details: undefined,
      };
    },
  });
}
