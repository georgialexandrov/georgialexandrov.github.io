import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

const NOTES_DIR = process.env.NOTES_DIR || "/home/sova/notes";

const ALLOWED = [
  /^ls\b/,
  /^docker\s+(ps|logs|inspect|stats|restart|start|stop)\b/,
  /^docker\s+compose\s+(up|down|restart|logs|ps)\b/,
  /^systemctl\s+(status|is-active|restart|start|stop)\b/,
  /^journalctl\b/, /^dmesg\b/, /^uptime\b/, /^free\b/,
  /^df\b/, /^du\s/,
];

const SENSITIVE_PATHS = [
  /\.env\b/, /\.env\.\w+/,
  /\/\.ssh\//, /\/\.gnupg\//,
  /\/\.pi\/agent\/auth\.json/,
  /credentials/i, /secrets/i,
  /\/etc\/shadow/, /\/etc\/gshadow/,
  /\.docker\/config\.json/,
  /\.kube\/config/,
  /password/i, /token/i,
];

function touchesSensitivePath(text: string): boolean {
  return SENSITIVE_PATHS.some((p) => p.test(text));
}

export function register(pi: ExtensionAPI) {
  pi.on("tool_call", async (event, _ctx) => {
    const input = event.input as Record<string, string>;

    // Block read/write/edit of sensitive files
    if (event.toolName === "read" || event.toolName === "write" || event.toolName === "edit") {
      const path = input.file_path || input.path || "";
      if (touchesSensitivePath(path)) {
        return { block: true, reason: `🐕 That smells like secrets. Not going near "${path}".` };
      }
      return undefined;
    }

    // Bash: block notes dir (must use read tool), block sensitive paths, whitelist commands
    if (event.toolName === "bash") {
      const cmd = (input.command || "").trim();
      if (cmd.includes(NOTES_DIR)) {
        return { block: true, reason: `🐕 Use the read tool for my notes. No bash shortcuts.` };
      }
      if (touchesSensitivePath(cmd)) {
        return { block: true, reason: `🐕 That command touches sensitive files. Not allowed.` };
      }
      const firstCmd = cmd.split("|")[0].trim();
      if (!ALLOWED.some((p) => p.test(firstCmd))) {
        return { block: true, reason: `🐕 Not allowed to run: "${cmd.slice(0, 80)}".` };
      }
    }

    return undefined;
  });
}
