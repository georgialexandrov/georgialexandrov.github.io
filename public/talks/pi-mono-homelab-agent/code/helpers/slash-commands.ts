import type { Incoming } from "../channels/channel.js";
import type { ChatIO } from "./compose.js";

type SlashHandler = (msg: Incoming) => Promise<void>;

export function createSlashCommands(ctx: {
  getSession: () => any;
  resetSession: () => Promise<any>;
  chat: ChatIO;
}): Record<string, SlashHandler> {
  return {
    "/new": async (msg) => {
      await ctx.resetSession();
      ctx.chat.clearHistory();
      await ctx.chat.broadcast("*shakes off* Fresh start. What do you need?", msg.source);
    },

    "/compact": async (msg) => {
      ctx.chat.addUserMessage(msg.body, msg.source);
      await ctx.chat.typing(true);
      try {
        const extra = msg.body.trim().slice(8).trim() || undefined;
        const result = await ctx.getSession().compact(extra);
        await ctx.chat.broadcast(result.summary || "Context compacted.", msg.source);
      } finally {
        await ctx.chat.typing(false);
      }
    },
  };
}
