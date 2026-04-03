import type { ExtensionAPI, AgentToolResult } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";
import { createCard, moveCard, addComment } from "../config/fizzy.js";

const params = Type.Object({
  action: Type.Union([Type.Literal("create"), Type.Literal("move"), Type.Literal("comment")]),
  title: Type.Optional(Type.String()),
  column: Type.Optional(Type.String({ description: "New, Diagnosing, Awaiting Human, or Resolved" })),
  card_number: Type.Optional(Type.Number()),
  comment: Type.Optional(Type.String()),
});

type Result = AgentToolResult<undefined>;

export function register(pi: ExtensionAPI) {
  pi.registerTool({
    name: "board_update",
    label: "Board Update",
    description: "Create, move, or comment on a Fizzy board card. Tracks incidents: New → Diagnosing → Awaiting Human → Resolved.",
    parameters: params,
    async execute(_id: string, p: Static<typeof params>): Promise<Result> {
      if (p.action === "create") {
        const card = createCard(p.title || "Untitled incident", p.column);
        return { content: [{ type: "text", text: `Card #${card.number} created.` }], details: undefined };
      }

      if (p.action === "move") {
        moveCard(p.card_number!, p.column!);
        return { content: [{ type: "text", text: `Card #${p.card_number} → ${p.column}` }], details: undefined };
      }

      if (p.action === "comment") {
        addComment(p.card_number!, p.comment || "");
        return { content: [{ type: "text", text: `Comment added to #${p.card_number}` }], details: undefined };
      }

      return { content: [{ type: "text", text: "Unknown action" }], details: undefined };
    },
  });
}
