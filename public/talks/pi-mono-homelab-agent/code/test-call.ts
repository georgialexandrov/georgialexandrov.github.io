/**
 * Test: start webhook + Sharo agent session + make a Twilio call.
 * Run: npx tsx test-call.ts
 */

import { startTwilioWebhook, setHandler } from "./helpers/twilio-webhook.js";
import { createSharoSession } from "./helpers/sharo-session.js";
import { promptAgent } from "./helpers/prompt.js";
import { readFileSync } from "node:fs";

// Minimal .env loader
try {
  const lines = readFileSync(".env", "utf-8").split("\n");
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
} catch {}

const sid = process.env.TWILIO_ACCOUNT_SID!;
const token = process.env.TWILIO_AUTH_TOKEN!;
const from = process.env.TWILIO_FROM_NUMBER!;
const to = process.env.TWILIO_TO_NUMBER!;
const webhook = process.env.TWILIO_WEBHOOK_URL!;

async function main() {
  // 1. Start webhook
  startTwilioWebhook();

  // 2. Create agent session
  console.log("[test-call] Creating Sharo session...");
  const session = await createSharoSession();
  console.log("[test-call] Session ready.");

  // 3. Wire speech handler to agent
  setHandler(async (speech: string) => {
    console.log(`[test-call] Prompting agent with: "${speech}"`);
    const reply = await promptAgent(session, `[Phone call] The caller says: "${speech}". Respond briefly — this will be read aloud.`);
    return reply || "I'm not sure what to say to that.";
  });

  // 4. Make the call
  const answerUrl = `${webhook}/voice/answer`;
  console.log(`[test-call] Calling ${to} from ${from}`);

  const body = new URLSearchParams({ To: to, From: from, Url: answerUrl, Method: "POST" });
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Calls.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const data = await res.json();
  if (data.sid) {
    console.log(`[test-call] Call initiated: ${data.sid}`);
  } else {
    console.error(`[test-call] Failed:`, data);
  }
}

main().catch(console.error);
