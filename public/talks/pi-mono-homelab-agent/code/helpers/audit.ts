import path from "node:path";
import { appendFileSync } from "node:fs";

const AUDIT_LOG = path.join(process.cwd(), "sharo-audit.log");

export function audit(line: string) {
  const ts = new Date().toISOString();
  appendFileSync(AUDIT_LOG, `${ts}  ${line}\n`);
}
