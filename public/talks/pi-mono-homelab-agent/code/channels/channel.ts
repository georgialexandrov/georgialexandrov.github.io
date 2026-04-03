/**
 * ChatAdapter — imperative shell for agent IO.
 *
 * Each transport (Matrix, web, future TUI/Slack/Telegram) implements this.
 * The agent session is the functional core — it doesn't know how messages
 * arrive or where replies go. ChatAdapters handle that.
 */

export type Incoming = { body: string; source: string };

export interface ChatAdapter {
  name: string;
  send(text: string): Promise<void>;
  setTyping(typing: boolean): Promise<void>;
  wait(signal?: AbortSignal): Promise<void>;
  drain(): Incoming[];
  init(): Promise<void>;
}
