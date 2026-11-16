/*
 * Service worker SENCILLO y seguro para GitHub Pages.
 * - Páginas (navegación): red primero; si no hay conexión, la última copia guardada
 *   o la home. Así nunca se sirve una versión vieja cuando hay red.
 * - /_astro/* (archivos con hash, inmutables): caché primero.
 * - Todo lo demás: pasa directo a la red (no se toca).
 * Para cambiar de estrategia, subir VERSION (borra las cachés anteriores).
 * Para DESACTIVARLO en producción: ver README ("Apagar el service worker").
 */
const VERSION = 'fs-v4';
const PAGES = `${VERSION}-pages`;
const ASSETS = `${VERSION}-assets`;
const OFFLINE_FALLBACK = ['/', '/en/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PAGES).then((cache) => Promise.allSettled(OFFLINE_FALLBACK.map((url) => cache.add(url)))).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(PAGES).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match(url.pathname.startsWith('/en/') ? '/en/' : '/'))),
    );
    return;
  }

  if (url.pathname.startsWith('/_astro/')) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(ASSETS).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
});
