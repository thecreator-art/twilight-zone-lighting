// Twilight Zone — Service Worker
// Network-first for CSS/JS/HTML (so updates propagate)
// Cache-first for videos/images (instant repeat-visit playback)

const CACHE = 'tz-v2';
const VIDEO_RE = /\/videos\/.+\.mp4$/;
const IMAGE_RE = /\.(jpg|jpeg|png|webp|svg)$/;
const ASSET_RE = /\.(css|js)$/;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Wipe any old caches from previous SW versions
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // CACHE-FIRST: heavy media (videos + images) — they don't change often
  if (VIDEO_RE.test(url.pathname) || IMAGE_RE.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE).then((c) => c.put(request, clone)).catch(() => {});
          }
          return response;
        }).catch(() => cached);
      })
    );
    return;
  }

  // NETWORK-FIRST: CSS, JS, HTML — so edits propagate immediately
  if (ASSET_RE.test(url.pathname) || request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(request).then((response) => {
        if (response.ok && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then((c) => c.put(request, clone)).catch(() => {});
        }
        return response;
      }).catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html')))
    );
  }
});
