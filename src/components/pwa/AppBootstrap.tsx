"use client";

/**
 * AppBootstrap.tsx
 *
 * Runs FIRST on app startup, before any other component mounts. Performs
 * one-time cleanup tasks:
 *
 *   1. Clear all service worker caches (Cache Storage API)
 *   2. Unregister all service workers (will re-register on next load)
 *   3. Clear sessionStorage
 *
 * CRITICAL: This cleanup only runs when the app's BUILD_VERSION changes
 * (stored in localStorage). On every other load, this component is a
 * no-op — otherwise we'd defeat the service worker's offline cache,
 * forcing the user to re-download everything on every visit.
 *
 * The version is sourced from `process.env.NEXT_PUBLIC_BUILD_VERSION`
 * (set at build time) and falls back to a hash of the build timestamp
 * baked into the bundle. If you want to force a fresh-loads for all
 * users on the next deploy, bump the version.
 *
 * Mounted at the top of the tree in `src/app/layout.tsx`, BEFORE
 * ServiceWorkerRegister, so the cleanup happens before SW re-registration.
 */

import { useEffect } from "react";

const VERSION_KEY = "wr-app-version";
const CURRENT_VERSION =
  process.env.NEXT_PUBLIC_BUILD_VERSION ||
  // Fall back to a build-time constant; Next.js inlines this at compile time.
  // If neither is set, we use a session-stable random value so cleanup
  // runs once per session but not on every navigation.
  "dev-session-" + (typeof sessionStorage !== "undefined"
    ? sessionStorage.getItem("wr-session-id") || (() => {
        const id = Math.random().toString(36).slice(2);
        sessionStorage.setItem("wr-session-id", id);
        return id;
      })()
    : "ssr");

async function clearServiceWorkerCaches(): Promise<void> {
  if (typeof caches === "undefined") return;
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  } catch {
    // Cache Storage may be unavailable (private browsing) — ignore
  }
}

async function unregisterServiceWorkers(): Promise<void> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
  } catch {
    // Ignore — SW may be unavailable
  }
}

function clearSessionStorage(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    // Preserve the session ID we just minted so we don't immediately
    // re-trigger another fresh-load in the same session.
    const sessionId = sessionStorage.getItem("wr-session-id");
    sessionStorage.clear();
    if (sessionId) sessionStorage.setItem("wr-session-id", sessionId);
  } catch {
    // Ignore
  }
}

export default function AppBootstrap() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Read the version we last saw. If it differs from the current build
    // version, run the cleanup. Otherwise no-op.
    let lastVersion: string | null = null;
    try {
      lastVersion = window.localStorage.getItem(VERSION_KEY);
    } catch {
      // localStorage unavailable
    }

    if (lastVersion === CURRENT_VERSION) {
      // Same version as last visit — skip cleanup to preserve offline cache.
      return;
    }

    // Version changed (or first visit) — perform full cleanup.
    (async () => {
      await clearServiceWorkerCaches();
      await unregisterServiceWorkers();
      clearSessionStorage();
      try {
        window.localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      } catch {
        // Ignore
      }
    })();
  }, []);

  // This component renders nothing — it's a side-effect-only bootstrap.
  return null;
}
