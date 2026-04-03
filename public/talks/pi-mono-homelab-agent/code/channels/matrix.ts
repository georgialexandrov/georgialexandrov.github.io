/**
 * Matrix transport — long-poll sync, drain messages, send replies.
 */

import type { ChatAdapter, Incoming } from "./channel.js";
import { env } from "../env.js";

const HOMESERVER = env.MATRIX_HOMESERVER;
const TOKEN = env.MATRIX_TOKEN;
const ROOM = env.MATRIX_ROOM_ID;
const SELF = "@sharo-agent:matrix.org";
const OWNER = env.MATRIX_OWNER_ID;

let syncToken: string | null = null;
let txnId = Date.now();
let lastSyncData: any = null;

async function matrixRequest(method: string, path: string, body?: unknown) {
  const res = await fetch(`${HOMESERVER}${path}`, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`Matrix ${res.status}: ${method} ${path} — ${text}`);
    return null;
  }
  const ct = res.headers.get("content-type") ?? "";
  return ct.includes("application/json") ? res.json() : {};
}

async function sync(timeout = 0, signal?: AbortSignal): Promise<any> {
  const params = new URLSearchParams({
    timeout: String(timeout),
    filter: JSON.stringify({ room: { timeline: { limit: timeout === 0 ? 0 : 50 } } }),
  });
  if (syncToken) params.set("since", syncToken);

  const res = await fetch(`${HOMESERVER}/_matrix/client/v3/sync?${params}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    signal,
  });
  if (!res.ok) throw new Error(`Sync ${res.status}: ${await res.text()}`);
  const data = await res.json();
  syncToken = data.next_batch;
  return data;
}

function extractMessages(data: any): Incoming[] {
  const room = data?.rooms?.join?.[ROOM];
  if (!room) return [];
  return (room.timeline?.events || [])
    .filter((e: any) => e.type === "m.room.message" && e.content?.msgtype === "m.text" && e.sender === OWNER)
    .map((e: any) => ({ body: e.content.body, source: "matrix" }));
}

export function createMatrixChatAdapter(): ChatAdapter {
  return {
    name: "matrix",

    async send(text: string) {
      await matrixRequest(
        "PUT",
        `/_matrix/client/v3/rooms/${encodeURIComponent(ROOM)}/send/m.room.message/${txnId++}`,
        { msgtype: "m.text", body: text },
      );
    },

    async setTyping(typing: boolean) {
      await matrixRequest(
        "PUT",
        `/_matrix/client/v3/rooms/${encodeURIComponent(ROOM)}/typing/${encodeURIComponent(SELF)}`,
        typing ? { typing: true, timeout: 30000 } : { typing: false },
      );
    },

    async wait(signal?: AbortSignal) {
      lastSyncData = await sync(30000, signal);
    },

    drain(): Incoming[] {
      if (!lastSyncData) return [];
      const data = lastSyncData;
      lastSyncData = null;
      return extractMessages(data);
    },

    async init() {
      await sync(0);
      await sync(0);
      await this.send("Sharo online.");
    },
  };
}
