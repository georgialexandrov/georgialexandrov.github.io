import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import type { TextContent, ToolResultMessage, AssistantMessage } from "@mariozechner/pi-ai";
import { appendFileSync } from "node:fs";

const NOTES_DIR = process.env.NOTES_DIR || "/home/sova/sharo/notes";
const LITELLM_URL = process.env.LITELLM_URL || "http://localhost:4000";
const LITELLM_KEY = process.env.LITELLM_MASTER_KEY || "";

const LOG_PATH = "/home/sova/sharo/sharo-pii-gate.log";

function log(msg: string) {
  const ts = new Date().toISOString();
  try { appendFileSync(LOG_PATH, `${ts}  ${msg}\n`); } catch { /* ignore */ }
}

const OBFUSCATE_PROMPT =
  `You are a strict privacy filter. Your ONLY job is to redact sensitive details from the text below.\n\n` +
  `SENSITIVE (MUST replace with [OBFUSCATED]):\n` +
  `- Physical locations and hiding spots (e.g. "behind the server rack" → "[OBFUSCATED]")\n` +
  `- Specific places, rooms, furniture, shelves\n` +
  `- Credentials, passwords, keys\n\n` +
  `SAFE (keep unchanged):\n` +
  `- Section headers, structure, humor, general notes\n` +
  `- Patrol schedules, health checks\n\n` +
  `Output ONLY the redacted text. No explanations. No thinking tags.\n\nText:\n`;

async function askQwen(prompt: string, maxTokens: number): Promise<string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (LITELLM_KEY) headers["Authorization"] = `Bearer ${LITELLM_KEY}`;

  const res = await fetch(`${LITELLM_URL}/v1/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: "qwen3.5",
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0,
    }),
  });
  if (!res.ok) {
    log(`  Qwen error: ${res.status} ${await res.text()}`);
    return "";
  }
  const data = await res.json() as { choices: Array<{ message: { content: string } }> };
  const raw = data.choices?.[0]?.message?.content || "";
  // Strip Qwen thinking block and stray tags
  return raw.replace(/<think>[\s\S]*?<\/think>/g, "").replace(/<\/?think>/g, "").trim();
}

function isToolResult(msg: unknown): msg is ToolResultMessage {
  return typeof msg === "object" && msg !== null && "role" in msg && (msg as ToolResultMessage).role === "toolResult";
}

function isAssistant(msg: unknown): msg is AssistantMessage {
  return typeof msg === "object" && msg !== null && "role" in msg && (msg as AssistantMessage).role === "assistant";
}

function idsMatch(toolCallId: string, blockId: string): boolean {
  if (toolCallId === blockId) return true;
  const prefix = toolCallId.split("|")[0];
  return prefix === blockId || blockId.startsWith(prefix);
}

function getToolCallPath(toolCallId: string, messages: unknown[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (!isAssistant(msg)) continue;
    for (const block of msg.content) {
      if (block.type === "toolCall" && idsMatch(toolCallId, block.id)) {
        const args = block.arguments as Record<string, unknown>;
        return (args.path || args.file_path || args.command || "") as string;
      }
    }
  }
  return "";
}

function touchesNotesDir(msg: unknown, messages: unknown[]): boolean {
  if (!isToolResult(msg)) return false;
  if (!["read", "write", "edit", "bash"].includes(msg.toolName)) return false;
  const path = getToolCallPath(msg.toolCallId, messages);
  return path.includes(NOTES_DIR);
}

function extractText(msg: ToolResultMessage): string {
  return msg.content
    .filter((c): c is TextContent => c.type === "text")
    .map((c) => c.text)
    .join(" ");
}


export function register(pi: ExtensionAPI) {
  pi.on("context", async (event, _ctx) => {
    log(`context event fired, ${event.messages.length} messages`);

    const indicesToObfuscate: number[] = [];
    for (let i = 0; i < event.messages.length; i++) {
      if (touchesNotesDir(event.messages[i], event.messages)) {
        indicesToObfuscate.push(i);
      }
    }

    log(`  indices to obfuscate: [${indicesToObfuscate.join(",")}]`);
    if (indicesToObfuscate.length === 0) return undefined;

    const messages = [...event.messages];

    for (const idx of indicesToObfuscate) {
      const toolMsg = messages[idx] as unknown as ToolResultMessage;
      const fileContent = extractText(toolMsg);

      log(`  BEFORE:\n${fileContent.slice(0, 500)}`);
      const cleaned = await askQwen(
        `${OBFUSCATE_PROMPT}${fileContent.slice(0, 2000)}`,
        500,
      );
      log(`  AFTER:\n${cleaned.slice(0, 500)}`);

      messages[idx] = {
        ...toolMsg,
        content: [{ type: "text" as const, text: cleaned || "[Local model could not process content]" }],
      };
    }

    return { messages };
  });
}
