import type { ExtensionAPI, AgentToolResult } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";
import { run } from "../config/index.js";

const COMPOSE_ROOT = "/opt/docker-data";

const BLOCKED_KEYS = [
  "image", "build", "dockerfile", "privileged", "network_mode",
  "cap_add", "cap_drop", "devices", "pid", "ipc", "security_opt",
  "entrypoint", "command",
];

const params = Type.Object({
  service: Type.String({ description: "Directory name under /opt/docker-data (e.g. 'caddy', 'observability')" }),
  action: Type.Union([Type.Literal("read"), Type.Literal("patch")]),
  patch: Type.Optional(Type.String({ description: "YAML snippet to merge (only for patch action)" })),
});

type Result = AgentToolResult<undefined>;

function result(text: string): Result {
  return { content: [{ type: "text", text }], details: undefined };
}

export function register(pi: ExtensionAPI) {
  pi.registerTool({
    name: "compose_edit",
    label: "Compose Edit",
    description: `Read or patch a docker-compose file under ${COMPOSE_ROOT}. Cannot change: ${BLOCKED_KEYS.join(", ")}.`,
    parameters: params,
    async execute(_id: string, p: Static<typeof params>): Promise<Result> {
      const dir = p.service.replace(/[^a-zA-Z0-9_-]/g, "");
      const candidates = ["compose.yaml", "compose.yml", "docker-compose.yml", "docker-compose.yaml"];
      const found = candidates
        .map((f) => `${COMPOSE_ROOT}/${dir}/${f}`)
        .find((path) => { try { run(`test -f ${path}`); return true; } catch { return false; } });

      if (!found) {
        return result(`No compose file in ${COMPOSE_ROOT}/${dir}/`);
      }

      if (p.action === "read") {
        return result(run(`cat ${found}`));
      }

      // Patch action — validate no blocked keys
      const patch = p.patch || "";
      for (const key of BLOCKED_KEYS) {
        if (new RegExp(`\\b${key}\\s*:`, "i").test(patch)) {
          return result(`Blocked: cannot modify '${key}' in compose files.`);
        }
      }

      // Write patch to temp, merge with yq, validate, write back
      const tmp = `/tmp/sharo-patch-${Date.now()}.yaml`;
      run(`cat <<'PATCH' > ${tmp}\n${patch}\nPATCH`);

      try {
        const merged = run(`yq eval-all 'select(fileIndex == 0) *+ select(fileIndex == 1)' ${found} ${tmp}`);
        for (const key of BLOCKED_KEYS) {
          if (new RegExp(`\\b${key}\\s*:`, "i").test(merged)) {
            return result(`Blocked: merged result contains '${key}'.`);
          }
        }
        run(`cp ${found} ${found}.bak`);
        run(`cat <<'MERGED' > ${found}\n${merged}\nMERGED`);
        return result(`Patched ${found}. Backup at ${found}.bak`);
      } finally {
        run(`rm -f ${tmp}`);
      }
    },
  });
}
