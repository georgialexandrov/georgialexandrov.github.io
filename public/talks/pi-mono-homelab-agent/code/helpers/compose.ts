import type { ChatAdapter, Incoming } from "../channels/channel.js";
import type { WebChatAdapter } from "../channels/web-bridge.js";

export type ChatIO = {
  receive(): Promise<Incoming[]>;
  broadcast(text: string, source: string): Promise<void>;
  typing(on: boolean): Promise<void>;
  addUserMessage(text: string, source: string): void;
  clearHistory(): void;
  init(): Promise<void>;
};

export function composeAdapters(adapters: ChatAdapter[], web: WebChatAdapter): ChatIO {
  return {
    async receive() {
      const abort = new AbortController();
      const races = adapters.map((a) =>
        a.wait(abort.signal).catch((e: any) => {
          if (e.name !== "AbortError") throw e;
        }),
      );
      await Promise.race(races);
      abort.abort();

      const messages: Incoming[] = [];
      for (const a of adapters) messages.push(...a.drain());
      return messages;
    },

    async broadcast(text: string, source: string) {
      for (const a of adapters) {
        if (a.name === "web") {
          // Web chat shows source via label — send clean text + source metadata
          web.addMessage("assistant", text, source);
        } else {
          const label = a.name !== source ? `[${source}] ${text}` : text;
          await a.send(label);
        }
      }
    },

    async typing(on: boolean) {
      for (const a of adapters) {
        await a.setTyping(on).catch(() => {});
      }
    },

    addUserMessage(text: string, source: string) {
      web.addMessage("user", text, source);
      // Relay to non-web, non-source adapters (e.g. matrix→web already handled above)
      for (const a of adapters) {
        if (a.name !== source && a.name !== "web") {
          a.send(`[${source}] ${text}`);
        }
      }
    },

    clearHistory() {
      web.clearHistory();
    },

    async init() {
      for (const a of adapters) await a.init();
    },
  };
}
