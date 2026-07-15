// Wilderness Romance Adventure - Service Worker (v6)
// Provides offline caching for the PWA experience, with full app-shell
// precaching and a "Download for Offline" message handler (H-04).
const CACHE_NAME = "wilderness-romance-v6";
const STATIC_ASSETS = [
  "/",
  "/offline",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

// ── Install: pre-cache the shell ────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()) // don't fail install if some assets 404
  );
});

// ── Activate: clean up old caches ───────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch: routing strategy ─────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (!url.protocol.startsWith("http")) return;
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;

  // External CDN images — cache-first
  if (url.hostname.includes("chatglm.cn") || url.hostname.includes("sfile")) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req)
          .then((res) => {
            if (res && res.status === 200) {
              const clone = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
            }
            return res;
          })
          .catch(() => cached);
      })
    );
    return;
  }

  // Map tiles — cache-first
  if (url.hostname.includes("cartocdn") || url.hostname.includes("tile.openstreetmap")) {
    event.respondWith(
      caches.match(req).then((cached) => {
        return (
          cached ||
          fetch(req).then((res) => {
            if (res && res.status === 200) {
              const clone = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
            }
            return res;
          })
        );
      })
    );
    return;
  }

  // Google Fonts — stale-while-revalidate (long-lived)
  if (url.hostname.includes("fonts.googleapis.com") || url.hostname.includes("fonts.gstatic.com")) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(req).then((cached) => {
          const fetchPromise = fetch(req)
            .then((res) => {
              if (res && res.status === 200) cache.put(req, res.clone());
              return res;
            })
            .catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // Same-origin navigations — network-first, fall back to cached "/" then "/offline"
  if (url.origin === self.location.origin && req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        })
        .catch(() =>
          caches.match(req).then(
            (cached) => cached || caches.match("/") || caches.match("/offline")
          )
        )
    );
    return;
  }

  // Same-origin static assets (JS/CSS/images) — stale-while-revalidate
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(req).then((cached) => {
          const fetchPromise = fetch(req)
            .then((res) => {
              if (res && res.status === 200) cache.put(req, res.clone());
              return res;
            })
            .catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // Default: try network, fall back to cache
  event.respondWith(fetch(req).catch(() => caches.match(req)));
});

// ── Message handler: "Download for Offline" (H-04) ──────────────────────
// The page calls `navigator.serviceWorker.controller.postMessage({
//   type: "DOWNLOAD_FOR_OFFLINE",
//   urls: ["/trip", "/proposal", ...]
// })` to explicitly cache additional pages and assets.
self.addEventListener("message", async (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }
  if (event.data?.type === "DOWNLOAD_FOR_OFFLINE") {
    const urls = Array.isArray(event.data.urls) ? event.data.urls : [];
    try {
      const cache = await caches.open(CACHE_NAME);
      await Promise.all(
        urls.map(async (u) => {
          try {
            const res = await fetch(u, { cache: "reload" });
            if (res && res.status === 200) await cache.put(u, res.clone());
          } catch {
            // skip individual failures
          }
        })
      );
      const allClients = await self.clients.matchAll();
      allClients.forEach((c) =>
        c.postMessage({ type: "OFFLINE_DOWNLOAD_COMPLETE", count: urls.length })
      );
    } catch {
      // ignore
    }
  }
});
