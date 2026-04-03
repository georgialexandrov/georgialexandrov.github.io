import type { Model } from "@mariozechner/pi-ai";

const QWEN_URL = process.env.QWEN_URL || "http://localhost:8088";

export const qwenModel: Model<"openai-completions"> = {
  id: "qwen3.5",
  name: "Qwen 3.5 (local)",
  api: "openai-completions",
  provider: "local-qwen",
  baseUrl: `${QWEN_URL}/v1`,
  reasoning: false,
  input: ["text"],
  cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
  contextWindow: 8192,
  maxTokens: 2048,
};
