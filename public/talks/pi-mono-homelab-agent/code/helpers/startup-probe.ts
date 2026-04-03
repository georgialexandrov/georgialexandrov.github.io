import { execSync } from "node:child_process";

const REBOOT_THRESHOLD_SECONDS = 600; // 10 minutes

/** Returns true if the system was recently rebooted (uptime < threshold). */
export function wasRecentlyRebooted(): boolean {
  try {
    const uptime = parseFloat(
      execSync("cat /proc/uptime", { encoding: "utf-8" }).split(" ")[0]
    );
    return uptime < REBOOT_THRESHOLD_SECONDS;
  } catch {
    return false;
  }
}

/** Prompt to send Sharo when it detects a recent reboot. */
export const REBOOT_INVESTIGATION_PROMPT = `The server just rebooted unexpectedly. Uptime is very low. Something crashed. Investigate.

You have registered tools — use them directly, don't search for scripts:
- health_check, system_info, debug_log for diagnostics
- board_update to create a ticket with your findings (title, description, and a comment with suggestions)
- notify to send me a Matrix message
- escalate_call to CALL me on the phone with a short spoken summary of what you found
- bash for anything else you need to check

Sniff around. Find what crashed and why. After you have a diagnosis:
1. Create a ticket with description and suggestions
2. Send a Matrix message
3. Call me on the phone — keep the spoken message short and clear, summarize what crashed and why`;
