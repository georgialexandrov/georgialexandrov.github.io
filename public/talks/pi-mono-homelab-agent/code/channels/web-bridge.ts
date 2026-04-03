/**
 * Web bridge transport — SSE + POST endpoint for connecting a web UI.
 *
 * GET  /events   → SSE stream (replays history on connect, then live events)
 * POST /message  → send a message to the agent
 */

import http from "node:http";
import type { ChatAdapter, Incoming } from "./channel.js";

type ChatEntry = { role: "user" | "assistant"; text: string; source: string; ts: number };

export type WebChatAdapter = ChatAdapter & {
  addMessage(role: "user" | "assistant", text: string, source: string): void;
  clearHistory(): void;
};

export function createWebChatAdapter(port: number): WebChatAdapter {
  const sseClients = new Set<http.ServerResponse>();
  const pending: Array<{ body: string }> = [];
  const history: ChatEntry[] = [];
  let wake: (() => void) | null = null;

  function sseBroadcast(data: string) {
    for (const client of sseClients) {
      client.write(`data: ${data}\n\n`);
    }
  }

  function addMessage(role: "user" | "assistant", text: string, source: string) {
    const entry: ChatEntry = { role, text, source, ts: Date.now() };
    history.push(entry);
    sseBroadcast(JSON.stringify({ type: "message", role: entry.role, text: entry.text, source: entry.source, ts: entry.ts }));
  }

  const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.url === "/events" && req.method === "GET") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      res.write(":\n\n");

      for (const entry of history) {
        const data = JSON.stringify({ type: "message", role: entry.role, text: entry.text, source: entry.source, ts: entry.ts });
        res.write(`data: ${data}\n\n`);
      }

      sseClients.add(res);
      req.on("close", () => sseClients.delete(res));
      return;
    }

    if (req.url === "/message" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const { text } = JSON.parse(body);
          if (text) {
            pending.push({ body: text });
            if (wake) {
              wake();
              wake = null;
            }
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true }));
        } catch {
          res.writeHead(400);
          res.end("Bad request");
        }
      });
      return;
    }

    res.writeHead(404);
    res.end("Not found");
  });

  server.listen(port, () => console.log(`[web] Bridge on :${port}`));

  return {
    name: "web",

    async send(text: string) {
      addMessage("assistant", text, "web");
    },

    async setTyping(typing: boolean) {
      sseBroadcast(JSON.stringify({ type: "typing", typing, ts: Date.now() }));
    },

    async wait(signal?: AbortSignal) {
      if (pending.length > 0) return;
      return new Promise<void>((resolve) => {
        wake = resolve;
        signal?.addEventListener("abort", () => {
          if (wake === resolve) {
            wake = null;
            resolve();
          }
        });
      });
    },

    drain(): Incoming[] {
      return pending.splice(0).map((m) => ({ body: m.body, source: "web" }));
    },

    async init() {},

    addMessage,

    clearHistory() {
      history.length = 0;
      sseBroadcast(JSON.stringify({ type: "clear", ts: Date.now() }));
    },
  };
}
