import { getModel } from "@mariozechner/pi-ai";
import {
  createAgentSession,
  DefaultResourceLoader,
  SessionManager,
  SettingsManager,
  AuthStorage,
  ModelRegistry,
  readTool,
  writeTool,
  editTool,
  bashTool,
} from "@mariozechner/pi-coding-agent";
import path from "node:path";
import { mkdirSync, readFileSync } from "node:fs";

function loadInstructions() {
  const systemPrompt = readFileSync(path.join(process.cwd(), "SYSTEM.md"), "utf-8");
  const agentsMd = readFileSync(path.join(process.cwd(), "AGENTS.md"), "utf-8");
  return systemPrompt + "\n\n" + agentsMd;
}

export async function createSharoSession() {
  const piAgentDir = `${process.env.HOME}/.pi/agent`;
  const sessionsDir = path.join(process.cwd(), ".sharo-sessions", `session-${Date.now()}`);
  mkdirSync(sessionsDir, { recursive: true });

  const instructions = loadInstructions();

  const resourceLoader = new DefaultResourceLoader({
    systemPromptOverride: () => instructions,
    extensionFactories: [
      async (pi) => {
        try {
          const ext = await import("../extensions/sharo/index.js");
          ext.default(pi);
          console.log("[sharo-ext] Extension loaded successfully");
        } catch (e: any) {
          console.error("[sharo-ext] FAILED to load extension:", e.message);
        }
      },
    ],
  });
  await resourceLoader.reload();

  const { session } = await createAgentSession({
    cwd: process.cwd(),
    agentDir: piAgentDir,
    model: getModel("openai-codex", "gpt-5.4"),
    thinkingLevel: "off",
    authStorage: AuthStorage.create(`${piAgentDir}/auth.json`),
    modelRegistry: new ModelRegistry(AuthStorage.create(`${piAgentDir}/auth.json`)),
    resourceLoader,
    tools: [readTool, writeTool, editTool, bashTool],
    sessionManager: SessionManager.continueRecent(process.cwd(), sessionsDir),
    settingsManager: SettingsManager.inMemory({
      compaction: { enabled: true },
      retry: { enabled: true, maxRetries: 2 },
    }),
  });

  return session;
}
