export async function promptAgent(session: any, text: string): Promise<string> {
  let response = "";
  const unsub = session.subscribe((event: any) => {
    if (event.type === "message_update" && event.assistantMessageEvent.type === "text_delta") {
      response += event.assistantMessageEvent.delta;
    }
  });
  await session.prompt(text);
  unsub();
  return response.replace(/<\/?think>/g, "").trim();
}
