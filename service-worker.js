// Service Worker - Control Eventos
// Versión: contador_manual_nombre

const CACHE_NAME = 'control-eventos-contador-manual-nombre';
const APP_SHELL = [
  "./",
  "./index.html?v=contador_manual_nombre",
  "./manifest.webmanifest?v=contador_manual_nombre"
];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL).catch(() => null))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;

  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith(
      fetch(req, { cache: "no-store" })
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put("./index.html?v=contador_manual_nombre", copy));
          return response;
        })
        .catch(() => caches.match("./index.html?v=contador_manual_nombre").then(r => r || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return response;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
