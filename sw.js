const CACHE_NAME = "language-teacher-shell-v1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./src/app/app.js",
  "./src/app/router.js",
  "./src/app/state.js",
  "./src/ui/components/app-header.js",
  "./src/ui/components/bottom-nav.js",
  "./src/ui/screens/today.js",
  "./src/ui/screens/practice.js",
  "./src/ui/screens/words.js",
  "./src/ui/screens/progress.js",
  "./src/ui/screens/settings.js",
  "./src/ui/styles/tokens.css",
  "./src/ui/styles/base.css",
  "./src/ui/styles/layout.css",
  "./src/ui/styles/components.css",
  "./src/ui/styles/responsive.css",
  "./src/storage/db.js",
  "./src/storage/schema.js",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === "opaque") {
            return response;
          }
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
