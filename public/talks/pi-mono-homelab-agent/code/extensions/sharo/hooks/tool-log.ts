import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { appendFileSync } from "node:fs";

const LOG_FILE = "/tmp/sharo-tool-log.txt";

function log(line: string) {
  const ts = new Date().toISOString().slice(11, 19);
  appendFileSync(LOG_FILE, `[${ts}] ${line}\n`);
}

export function register(pi: ExtensionAPI) {
  pi.on("tool_call", async (event) => {
    const input = event.input as Record<string, string>;
    const summary = event.toolName === "bash"
      ? input.command?.slice(0, 120)
      : `${event.toolName}(${JSON.stringify(input).slice(0, 100)})`;
    log(`CALL  ${summary}`);
    return undefined;
  });

  pi.on("tool_result", async (event) => {
    const text = event.content
      .filter((c): c is { type: "text"; text: string } => c.type === "text")
      .map((c) => c.text)
      .join(" ")
      .slice(0, 150);
    const tag = event.isError ? "BLOCK" : "OK   ";
    log(`${tag} ${event.toolName}: ${text}`);
    return undefined;
  });
}
