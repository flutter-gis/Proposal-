/**
 * logger.ts
 *
 * Structured logging for the Wilderness Romance PWA.
 *
 * Eight log levels, each with a distinct purpose and color when printed
 * to the browser console:
 *
 *   info    — general informational messages (default)
 *   warn    — recoverable warnings
 *   error   — errors that should be investigated
 *   click   — user click/tap events (for behavioral analytics)
 *   mount   — React component mount/unmount lifecycle
 *   state   — state transitions (prefs changes, page changes, etc.)
 *   nav     — navigation events (page changes, hash changes, popstate)
 *   audio   — sound engine events (play, stop, switchTo, errors)
 *
 * Logs are sent to three sinks simultaneously:
 *   1. Browser console (color-coded by level)
 *   2. In-memory ring buffer (last 500 entries) — queryable via getBuffer()
 *   3. localStorage (last 200 entries) — persists across page reloads
 *
 * Usage:
 *   import { log } from "@/lib/logger";
 *   log.info("App started");
 *   log.click("celebrate-button");
 *   log.audio("switchTo", { from: "goldenHour", to: "celebration" });
 *
 * To retrieve logs for debugging:
 *   import { getBuffer, exportLogs } from "@/lib/logger";
 *   console.table(getBuffer());
 *   // Or download as a text file:
 *   exportLogs(); // triggers a .txt download
 */

export type LogLevel =
  | "info"
  | "warn"
  | "error"
  | "click"
  | "mount"
  | "state"
  | "nav"
  | "audio";

export interface LogEntry {
  ts: number;            // epoch milliseconds
  level: LogLevel;
  msg: string;
  ctx?: Record<string, unknown>;
}

const LEVELS: LogLevel[] = [
  "info", "warn", "error", "click", "mount", "state", "nav", "audio",
];

// Per-level console styling — each level gets a distinct color + label
const LEVEL_STYLE: Record<LogLevel, { color: string; label: string }> = {
  info:  { color: "#3b82f6", label: "INFO"  },
  warn:  { color: "#f59e0b", label: "WARN"  },
  error: { color: "#ef4444", label: "ERROR" },
  click: { color: "#10b981", label: "CLICK" },
  mount: { color: "#8b5cf6", label: "MOUNT" },
  state: { color: "#06b6d4", label: "STATE" },
  nav:   { color: "#ec4899", label: "NAV"   },
  audio: { color: "#f97316", label: "AUDIO" },
};

const RING_BUFFER_MAX = 500;
const LOCALSTORAGE_MAX = 200;
const LOCALSTORAGE_KEY = "wr-logs";

// In-memory ring buffer (most recent at the end)
const buffer: LogEntry[] = [];

function loadFromLocalStorage(): LogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCALSTORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveToLocalStorage() {
  if (typeof window === "undefined") return;
  try {
    // Only persist the last LOCALSTORAGE_MAX entries to stay under
    // typical 5MB localStorage limits (each entry is ~100–500 bytes).
    const slice = buffer.slice(-LOCALSTORAGE_MAX);
    window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(slice));
  } catch {
    // localStorage might be full or disabled — silently ignore
  }
}

function emit(level: LogLevel, msg: string, ctx?: Record<string, unknown>) {
  const entry: LogEntry = { ts: Date.now(), level, msg, ctx };

  // 1. Push to ring buffer (drop oldest if at capacity)
  buffer.push(entry);
  if (buffer.length > RING_BUFFER_MAX) {
    buffer.splice(0, buffer.length - RING_BUFFER_MAX);
  }

  // 2. Persist to localStorage (throttled implicitly — only on actual log)
  saveToLocalStorage();

  // 3. Print to console with color coding
  if (typeof console !== "undefined") {
    const style = LEVEL_STYLE[level];
    const time = new Date(entry.ts).toISOString().slice(11, 23); // HH:MM:SS.mmm
    const prefix = `%c[${time}] ${style.label}%c ${msg}`;
    const css1 = `color:${style.color};font-weight:bold`;
    const css2 = `color:inherit`;
    if (level === "error") {
      console.error(prefix, css1, css2, ctx ?? "");
    } else if (level === "warn") {
      console.warn(prefix, css1, css2, ctx ?? "");
    } else {
      console.log(prefix, css1, css2, ctx ?? "");
    }
  }
}

// Build the public API: log.info(...), log.click(...), etc.
type LogFn = (msg: string, ctx?: Record<string, unknown>) => void;
type LogAPI = Record<LogLevel, LogFn> & {
  /** Retrieve the in-memory ring buffer (most recent 500 entries). */
  getBuffer: () => LogEntry[];
  /** Retrieve logs persisted to localStorage (most recent 200 entries). */
  getPersisted: () => LogEntry[];
  /** Clear both the ring buffer and localStorage. Returns to a clean state. */
  clear: () => void;
  /** Trigger a .txt download of all logs (buffer + persisted). Useful for bug reports. */
  exportLogs: () => void;
};

export const log: LogAPI = {
  ...Object.fromEntries(
    LEVELS.map((lvl) => [lvl, (msg: string, ctx?: Record<string, unknown>) => emit(lvl, msg, ctx)])
  ) as Record<LogLevel, LogFn>,

  getBuffer: () => [...buffer],

  getPersisted: () => loadFromLocalStorage(),

  clear: () => {
    buffer.length = 0;
    if (typeof window !== "undefined") {
      try { window.localStorage.removeItem(LOCALSTORAGE_KEY); } catch {}
    }
  },

  exportLogs: () => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    const all = [...loadFromLocalStorage(), ...buffer];
    // Deduplicate by ts+msg (a log might be in both persisted and buffer)
    const seen = new Set<string>();
    const unique = all.filter((e) => {
      const key = `${e.ts}|${e.level}|${e.msg}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).sort((a, b) => a.ts - b.ts);

    const text = unique.map((e) => {
      const time = new Date(e.ts).toISOString();
      const ctxStr = e.ctx ? ` ${JSON.stringify(e.ctx)}` : "";
      return `[${time}] ${e.level.toUpperCase().padEnd(5)} ${e.msg}${ctxStr}`;
    }).join("\n");

    const blob = new Blob([`# Wilderness Romance Logs\n# Exported ${new Date().toISOString()}\n\n${text}\n`], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wilderness-romance-logs-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
