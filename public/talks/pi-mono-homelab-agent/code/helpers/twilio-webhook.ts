/**
 * Twilio voice webhook server.
 *
 * Handles two endpoints:
 * - POST /voice/answer  — initial call pickup, starts the gather loop
 * - POST /voice/gather  — receives speech transcription, sends to agent, responds with TTS
 */

import { createServer } from "node:http";
import { parse } from "node:querystring";

const PORT = Number(process.env.TWILIO_WEBHOOK_PORT || 8091);

export type SpeechHandler = (speech: string) => Promise<string>;

let onSpeech: SpeechHandler = async (s) => `You said: ${s}`;

export function setHandler(handler: SpeechHandler) {
  onSpeech = handler;
}

function twimlResponse(twiml: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${twiml}</Response>`;
}

function gatherTwiml(prompt: string): string {
  return twimlResponse(
    `<Say voice="Polly.Matthew">${escapeXml(prompt)}</Say>` +
    `<Gather input="speech" timeout="5" speechTimeout="auto" action="/voice/gather" method="POST">` +
    `</Gather>` +
    `<Say voice="Polly.Matthew">I didn't hear anything. Goodbye.</Say>`
  );
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function parseBody(req: any): Promise<Record<string, string>> {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk: string) => (data += chunk));
    req.on("end", () => resolve(parse(data) as Record<string, string>));
  });
}

const server = createServer(async (req, res) => {
  const url = req.url?.split("?")[0];

  if (req.method === "POST" && url === "/voice/answer") {
    console.log("[twilio-webhook] Call answered");
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(gatherTwiml("Hello, this is Sharo. How can I help?"));
    return;
  }

  if (req.method === "POST" && url === "/voice/gather") {
    const body = await parseBody(req);
    const speech = body.SpeechResult || "";
    console.log(`[twilio-webhook] Speech received: "${speech}"`);

    if (!speech) {
      res.writeHead(200, { "Content-Type": "text/xml" });
      res.end(twimlResponse(`<Say voice="Polly.Matthew">I didn't catch that. Goodbye.</Say>`));
      return;
    }

    try {
      const reply = await onSpeech(speech);
      console.log(`[twilio-webhook] Replying: "${reply.slice(0, 200)}"`);
      res.writeHead(200, { "Content-Type": "text/xml" });
      res.end(gatherTwiml(reply));
    } catch (e: any) {
      console.error(`[twilio-webhook] Handler error: ${e.message}`);
      res.writeHead(200, { "Content-Type": "text/xml" });
      res.end(gatherTwiml("Sorry, I had a problem processing that. Can you repeat?"));
    }
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

export function startTwilioWebhook() {
  server.listen(PORT, () => {
    console.log(`[twilio-webhook] Listening on port ${PORT}`);
  });
}
