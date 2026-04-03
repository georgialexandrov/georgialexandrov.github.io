import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import type { TextContent, ImageContent, ToolResultMessage, UserMessage } from "@mariozechner/pi-ai";

const PII = [
  /sk-[a-zA-Z0-9_\-]{20,}/g,
  /ghp_[a-zA-Z0-9]{36,}/g,
  /Bearer\s+[a-zA-Z0-9\-_.]+/g,
  /postgres:\/\/[^\s]+/g,
  /AKIA[0-9A-Z]{16}/g,
  /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----[\s\S]*?-----END/g,
  /password\s*[=:]\s*\S+/gi,
  /api[_-]?key\s*[=:]\s*\S+/gi,
  /secret\s*[=:]\s*\S+/gi,
];

function redact(text: string): string {
  return PII.reduce((t, p) => t.replace(p, "[REDACTED]"), text);
}

function isToolResult(msg: unknown): msg is ToolResultMessage {
  return typeof msg === "object" && msg !== null && "role" in msg && (msg as ToolResultMessage).role === "toolResult";
}

function isUser(msg: unknown): msg is UserMessage {
  return typeof msg === "object" && msg !== null && "role" in msg && (msg as UserMessage).role === "user";
}

function isSensitive(msg: ToolResultMessage): boolean {
  return typeof msg.details === "object" && msg.details !== null && (msg.details as Record<string, unknown>).sensitive === true;
}

function redactParts(parts: (TextContent | ImageContent)[]): (TextContent | ImageContent)[] {
  return parts.map((p) =>
    p.type === "text" ? { ...p, text: redact(p.text) } : p
  );
}

export function register(pi: ExtensionAPI) {
  pi.on("context", async (event, _ctx) => {
    const messages = event.messages.map((msg) => {
      if (isToolResult(msg)) {
        if (isSensitive(msg)) {
          return { ...msg, content: [{ type: "text" as const, text: "[SCRUBBED — sensitive data was delivered locally and removed from cloud context]" }] };
        }
        return { ...msg, content: redactParts(msg.content) };
      }

      if (isUser(msg)) {
        if (typeof msg.content === "string") {
          return { ...msg, content: redact(msg.content) };
        }
        return { ...msg, content: redactParts(msg.content) };
      }

      return msg;
    });
    return { messages };
  });
}
