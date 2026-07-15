"use client";

import { useEffect, useState } from "react";

/**
 * Registers the service worker for PWA offline support.
 * Also exposes install/update status for the InstallPrompt component.
 */
export default function ServiceWorkerRegister() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setUpdateAvailable(true);
            }
          });
        });
      } catch (err) {
        // SW registration failed — non-fatal
        console.warn("SW registration failed:", err);
      }
    };

    register();
  }, []);

  useEffect(() => {
    if (!updateAvailable) return;
    const apply = async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.waiting) {
        reg.waiting.postMessage("SKIP_WAITING");
      }
      window.location.reload();
    };
    apply();
  }, [updateAvailable]);

  return null;
}
