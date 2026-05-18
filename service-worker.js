// Service Worker - Control Eventos
// Versión: 20260518_botonera_sin_zoom

const CACHE_NAME = 'control-eventos-botonera-sin-zoom';
const APP_SHELL = [
  "./",
  "./index.html?v=botonera_sin_zoom",
  "./manifest.webmanifest?v=botonera_sin_zoom"
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
          caches.open(CACHE_NAME).then(cache => cache.put("./index.html?v=botonera_sin_zoom", copy));
          return response;
        })
        .catch(() => caches.match("./index.html?v=botonera_sin_zoom").then(r => r || caches.match("./index.html")))
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
