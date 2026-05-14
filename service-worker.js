// Service Worker - Control Eventos
// Versión: 20260514_1315

const CACHE_NAME = "control-eventos-20260514_1315";
const APP_SHELL = [
  "./",
  "./index.html?v=20260514_1315",
  "./manifest.webmanifest?v=20260514_1315"
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
  const url = new URL(req.url);

  // Para documentos HTML: primero red, luego caché. Evita que cargue versiones viejas.
  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith(
      fetch(req)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put("./index.html?v=20260514_1315", copy));
          return response;
        })
        .catch(() => caches.match("./index.html?v=20260514_1315").then(r => r || caches.match("./index.html")))
    );
    return;
  }

  // Para el resto: caché con actualización en segundo plano.
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
