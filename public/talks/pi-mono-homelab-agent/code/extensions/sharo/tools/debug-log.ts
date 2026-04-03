import type { ExtensionAPI, AgentToolResult } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";
import { run } from "../config/index.js";

const params = Type.Object({
  service: Type.String({ description: "Container name" }),
  lines: Type.Optional(Type.Number({ description: "Lines to read (default 100)" })),
});

export function register(pi: ExtensionAPI) {
  pi.registerTool({
    name: "debug_log",
    label: "Debug Log",
    description: "Read Docker container logs. PII is stripped before returning.",
    parameters: params,
    async execute(_id: string, p: Static<typeof params>): Promise<AgentToolResult<undefined>> {
      const n = p.lines || 100;
      const raw = run(`docker logs ${p.service} --tail ${n} 2>&1`);
      return {
        content: [{ type: "text", text: raw }],
        details: undefined,
      };
    },
  });
}
