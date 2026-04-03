/**
 * SHARO — main loop.
 *
 * Functional core: session (pi-mono agent)
 * Imperative shell: chat adapters composed into IO
 *
 * The agent doesn't know how messages arrive or where replies go.
 */

import { createSharoSession } from "./helpers/sharo-session.js";
import { promptAgent } from "./helpers/prompt.js";
import { composeAdapters } from "./helpers/compose.js";
import { createSlashCommands } from "./helpers/slash-commands.js";
import { audit } from "./helpers/audit.js";
import { wasRecentlyRebooted, REBOOT_INVESTIGATION_PROMPT } from "./helpers/startup-probe.js";
import { startTwilioWebhook, setHandler } from "./helpers/twilio-webhook.js";
import { startTunnel } from "./helpers/tunnel.js";
import { createMatrixChatAdapter } from "./channels/matrix.js";
import { createWebChatAdapter } from "./channels/web-bridge.js";
import { env } from "./env.js";

async function main() {
  console.log("[sharo] Creating session...");
  let session = await createSharoSession();
  console.log("[sharo] Session ready.");

  const web = createWebChatAdapter(env.WEB_BRIDGE_PORT);
  const matrix = createMatrixChatAdapter();
  const chat = composeAdapters([matrix, web], web);

  const slash = createSlashCommands({
    getSession: () => session,
    resetSession: async () => { session = await createSharoSession(); },
    chat,
  });

  // Twilio voice — webhook + tunnel
  setHandler(async (speech: string) => {
    await chat.broadcast(`[via phone] 📞 ${speech}`, "matrix");
    const reply = await promptAgent(session, `[Phone call] The caller says: "${speech}". Respond briefly — this will be read aloud.`);
    if (reply) await chat.broadcast(`[via phone] 🐕 ${reply}`, "matrix");
    return reply || "I'm not sure what to say to that.";
  });
  startTwilioWebhook();
  try {
    const url = await startTunnel(8091);
    console.log(`[sharo] Tunnel ready: ${url}`);
  } catch (e: any) {
    console.error(`[sharo] Tunnel failed: ${e.message}`);
  }

  console.log("[sharo] Initializing adapters...");
  await chat.init();
  console.log("[sharo] Ready.");

  if (wasRecentlyRebooted()) {
    console.log("[sharo] Recent reboot detected — investigating...");
    try {
      const reply = await promptAgent(session, REBOOT_INVESTIGATION_PROMPT);
      if (reply) {
        audit(`OUT [startup-probe] ${reply.slice(0, 500)}`);
        await chat.broadcast(reply, "matrix");
      }
    } catch (e: any) {
      console.error(`[sharo] Startup probe failed: ${e.message}`);
    }
  }

  console.log("[sharo] Entering loop.");

  while (true) {
    try {
      const messages = await chat.receive();
      console.log(`[sharo] Received ${messages.length} message(s)`);

      for (const msg of messages) {
        audit(`IN [${msg.source}] ${msg.body}`);

        const cmd = msg.body.trim().split(/\s+/)[0];
        if (slash[cmd]) {
          await slash[cmd](msg);
          continue;
        }

        chat.addUserMessage(msg.body, msg.source);
        await chat.typing(true);
        try {
          const reply = await promptAgent(session, msg.body);
          if (reply) {
            audit(`OUT ${reply.slice(0, 500)}`);
            await chat.broadcast(reply, msg.source);
          }
        } finally {
          await chat.typing(false);
        }
      }
    } catch (e: any) {
      console.error(`[sync] Error: ${e.message}`);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

main();
