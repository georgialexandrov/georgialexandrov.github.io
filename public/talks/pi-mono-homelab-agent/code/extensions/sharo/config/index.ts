import { execSync } from "node:child_process";

// --- Environment ---
export const env = {
  matrix: {
    server: process.env.MATRIX_HOMESERVER || "https://matrix.org",
    room: process.env.MATRIX_ROOM_ID || "",
    token: process.env.MATRIX_TOKEN || "",
  },
  fizzy: {
    url: process.env.FIZZY_URL || "https://fizzy.home.georgi.alexandrov.dev",
    token: process.env.FIZZY_TOKEN || "",
    board: process.env.FIZZY_BOARD_ID || "",
    prefix: process.env.FIZZY_ACCOUNT_PREFIX || "1",
    columns: {
      "New": process.env.FIZZY_COL_NEW || "",
      "Diagnosing": process.env.FIZZY_COL_DIAGNOSING || "",
      "Awaiting Human": process.env.FIZZY_COL_AWAITING || "",
      "Resolved": process.env.FIZZY_COL_RESOLVED || "",
    } as Record<string, string>,
  },
  twilio: {
    sid: process.env.TWILIO_ACCOUNT_SID || "",
    token: process.env.TWILIO_AUTH_TOKEN || "",
    from: process.env.TWILIO_FROM_NUMBER || "",
    to: process.env.TWILIO_TO_NUMBER || "",
    webhook: process.env.TWILIO_WEBHOOK_URL || "",
  },
};

// --- Shell helpers ---
export function run(cmd: string, timeout = 15000): string {
  return execSync(cmd, { timeout }).toString().trim();
}

export function curl(method: string, url: string, body?: string, headers: Record<string, string> = {}): string {
  const h = Object.entries(headers).map(([k, v]) => `-H '${k}: ${v}'`).join(" ");
  const d = body ? `-d '${body.replace(/'/g, "'\\''")}'` : "";
  return run(`curl -s -X ${method} ${h} ${d} '${url}'`, 30000);
}
