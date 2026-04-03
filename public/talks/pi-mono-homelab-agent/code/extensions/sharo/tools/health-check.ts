import type { ExtensionAPI, AgentToolResult } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { run } from "../config/index.js";

export function register(pi: ExtensionAPI) {
  pi.registerTool({
    name: "health_check",
    label: "Health Check",
    description: "Check which Docker containers are running and which are down.",
    parameters: Type.Object({}),
    async execute(): Promise<AgentToolResult<undefined>> {
      const output = run("docker ps -a --format '{{.Names}}\t{{.State}}\t{{.Status}}'");
      const services = output.split("\n").map((l) => l.split("\t"));
      const up = services.filter(([, s]) => s === "running");
      const down = services.filter(([, s]) => s !== "running" && !s.startsWith("removing"));
      const realDown = down.filter(([n]) => !n.match(/^yolo-(architect|builder)-/));

      return {
        content: [{
          type: "text",
          text: [
            `${up.length} running, ${realDown.length} down`,
            ...realDown.map(([n]) => `DOWN: ${n}`),
            ...up.map(([n]) => `OK: ${n}`),
          ].join("\n"),
        }],
        details: undefined,
      };
    },
  });
}
