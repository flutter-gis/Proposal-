// Wilderness Romance Adventure - Service Worker
// Provides offline caching for the PWA experience.
const CACHE_NAME = "wilderness-romance-v5";
const STATIC_ASSETS = [
  "/",
  "/offline",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

// Install: pre-cache the shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: stale-while-revalidate for same-origin GET requests
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Skip non-http(s) requests (e.g. chrome-extension)
  if (!url.protocol.startsWith("http")) return;

  // Skip Next.js dev/HMR requests
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;

  // For images from external CDNs (sfile.chatglm.cn), use cache-first
  if (url.hostname.includes("chatglm.cn") || url.hostname.includes("sfile")) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        }).catch(() => cached);
      })
    );
    return;
  }

  // For map tiles (openstreetmap, cartocdn), cache-first
  if (url.hostname.includes("cartocdn") || url.hostname.includes("tile.openstreetmap")) {
    event.respondWith(
      caches.match(req).then((cached) => {
        return cached || fetch(req).then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // For same-origin navigation requests, network-first with fallback to cache
  // then to /offline page (G-07)
  if (url.origin === self.location.origin) {
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
            (cached) =>
              cached ||
              caches.match("/") ||
              caches.match("/offline")
          )
        )
    );
    return;
  }

  // Default: try network, fallback to cache
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});

// Allow page to trigger skipWaiting via postMessage
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
