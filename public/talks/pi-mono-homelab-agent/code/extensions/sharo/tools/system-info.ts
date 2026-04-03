import type { ExtensionAPI, AgentToolResult } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { run } from "../config/index.js";

export function register(pi: ExtensionAPI) {
  pi.registerTool({
    name: "system_info",
    label: "System Info",
    description: "Read uptime, kernel log, and dmesg. Finds OOM kills, segfaults, panics.",
    parameters: Type.Object({}),
    async execute(): Promise<AgentToolResult<undefined>> {
      const uptime = run("uptime");
      const journal = run("journalctl -k --no-pager -n 50 2>/dev/null || echo 'n/a'");
      const dmesg = run("dmesg -T 2>/dev/null | tail -50 || echo 'n/a'");

      return {
        content: [{
          type: "text",
          text: `## Uptime\n${uptime}\n\n## Kernel log\n${journal}\n\n## dmesg\n${dmesg}`,
        }],
        details: undefined,
      };
    },
  });
}
