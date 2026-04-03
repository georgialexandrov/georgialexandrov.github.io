/**
 * Tunnel manager — ngrok (primary) with cloudflared fallback.
 *
 * Spawns the tunnel process, parses the URL, respawns on crash.
 * The tunnel URL is available via getTunnelUrl() after start() resolves.
 */

import { spawn, type ChildProcess } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";

let tunnelUrl: string | null = null;
let child: ChildProcess | null = null;
let localPort: number = 8091;
let stopping = false;

const TUNNEL_FILE = "/tmp/sharo-tunnel-url";

export function getTunnelUrl(): string | null {
  try {
    const url = readFileSync(TUNNEL_FILE, "utf-8").trim();
    return url || null;
  } catch {
    return null;
  }
}

export function startTunnel(port: number): Promise<string> {
  localPort = port;
  stopping = false;
  return spawnNgrok();
}

/** Switch to cloudflared if ngrok is down. Call manually. */
export function startCloudflaredTunnel(port: number): Promise<string> {
  localPort = port;
  stopping = false;
  return spawnCloudflared();
}

export function stopTunnel() {
  stopping = true;
  if (child) {
    child.kill();
    child = null;
  }
  tunnelUrl = null;
  try { unlinkSync(TUNNEL_FILE); } catch {}
}

function setUrl(url: string) {
  tunnelUrl = url;
  writeFileSync(TUNNEL_FILE, url);
  console.log(`[tunnel] URL: ${url}`);
}

// ── ngrok ──────────────────────────────────────────────

function spawnNgrok(): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ngrok", ["http", String(localPort), "--log", "stdout", "--log-format", "json"], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    child = proc;

    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) { resolved = true; reject(new Error("ngrok: failed to start within 30s")); }
    }, 30000);

    function parseLine(line: string) {
      if (resolved) return;
      try {
        const obj = JSON.parse(line);
        // ngrok logs: msg="started tunnel" ... url="https://xxx.ngrok-free.app"
        if (obj.msg === "started tunnel" && obj.url?.startsWith("https://")) {
          resolved = true;
          setUrl(obj.url);
          clearTimeout(timeout);
          resolve(obj.url);
        }
      } catch {
        // ignore non-JSON lines
      }
    }

    proc.stdout?.on("data", (d: Buffer) => {
      for (const line of d.toString().split("\n")) {
        if (line.trim()) parseLine(line);
      }
    });

    proc.stderr?.on("data", (d: Buffer) => {
      const text = d.toString();
      if (text.trim()) console.log(`[tunnel:ngrok:stderr] ${text.trim()}`);
    });

    proc.on("exit", (code) => {
      console.log(`[tunnel:ngrok] Process exited (code ${code})`);
      child = null;
      if (stopping) tunnelUrl = null;
      if (!stopping) {
        console.log("[tunnel:ngrok] Respawning in 10s...");
        setTimeout(() => {
          if (!stopping) spawnNgrok().catch((e) => console.error(`[tunnel:ngrok] Respawn failed: ${e.message}`));
        }, 10000);
      }
    });
  });
}

// ── cloudflared (fallback) ─────────────────────────────

function spawnCloudflared(): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn("cloudflared", ["tunnel", "--url", `http://localhost:${localPort}`], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    child = proc;

    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) { resolved = true; reject(new Error("cloudflared: failed to start within 30s")); }
    }, 30000);

    function parseLine(line: string) {
      if (resolved) return;
      const match = line.match(/(https:\/\/[a-z0-9-]+\.trycloudflare\.com)/);
      if (match) {
        resolved = true;
        setUrl(match[1]);
        clearTimeout(timeout);
        resolve(match[1]);
      }
    }

    proc.stdout?.on("data", (d: Buffer) => {
      for (const line of d.toString().split("\n")) { if (line.trim()) parseLine(line); }
    });

    proc.stderr?.on("data", (d: Buffer) => {
      for (const line of d.toString().split("\n")) { if (line.trim()) parseLine(line); }
    });

    proc.on("exit", (code) => {
      console.log(`[tunnel:cloudflared] Process exited (code ${code})`);
      child = null;
      if (stopping) tunnelUrl = null;
      if (!stopping) {
        console.log("[tunnel:cloudflared] Respawning in 10s...");
        setTimeout(() => {
          if (!stopping) spawnCloudflared().catch((e) => console.error(`[tunnel:cloudflared] Respawn failed: ${e.message}`));
        }, 10000);
      }
    });
  });
}
