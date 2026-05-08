// Twilight Zone — Service Worker (v3)
// Strategy:
//   - Media (videos/images): cache-first with long TTL — instant repeat-visit playback
//   - HTML pages: stale-while-revalidate — show cached page immediately, refresh in background
//   - CSS/JS: stale-while-revalidate — fast paint, fresh on next visit
//   - Fonts: cache-first (immutable from Google CDN)

const VERSION = 'tz-v3';
const RUNTIME = `${VERSION}-runtime`;
const MEDIA = `${VERSION}-media`;
const PAGES = `${VERSION}-pages`;

const VIDEO_RE = /\/videos\/.+\.mp4$/;
const IMAGE_RE = /\.(jpg|jpeg|png|webp|svg|ico)$/i;
const ASSET_RE = /\.(css|js)$/i;
const FONT_RE = /fonts\.(googleapis|gstatic)\.com/;

self.addEventListener('install', (event) => {
  // Pre-cache the core shell so first repeat visit paints instantly
  event.waitUntil(
    caches.open(PAGES).then((c) =>
      c.addAll(['/', '/styles.css', '/script.js']).catch(() => null)
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Wipe old SW caches that don't match current version
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.startsWith(VERSION))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// --- helpers ---

const cacheFirst = (cacheName) => (request) =>
  caches.open(cacheName).then((cache) =>
    cache.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && response.status === 200) {
          cache.put(request, response.clone()).catch(() => {});
        }
        return response;
      });
    })
  );

const staleWhileRevalidate = (cacheName) => (request) =>
  caches.open(cacheName).then((cache) =>
    cache.match(request).then((cached) => {
      const networkPromise = fetch(request)
        .then((response) => {
          if (response.ok && response.status === 200) {
            cache.put(request, response.clone()).catch(() => {});
          }
          return response;
        })
        .catch(() => cached);
      // Return cached immediately if available, otherwise wait for network
      return cached || networkPromise;
    })
  );

// --- routing ---

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and most cross-origin (allow fonts)
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin && !FONT_RE.test(url.href)) return;

  // Fonts: cache-first (immutable)
  if (FONT_RE.test(url.href)) {
    event.respondWith(cacheFirst(MEDIA)(request));
    return;
  }

  // Videos + images: cache-first long TTL
  if (VIDEO_RE.test(url.pathname) || IMAGE_RE.test(url.pathname)) {
    event.respondWith(cacheFirst(MEDIA)(request));
    return;
  }

  // CSS / JS: stale-while-revalidate
  if (ASSET_RE.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(RUNTIME)(request));
    return;
  }

  // HTML pages: stale-while-revalidate (instant repeat-visit paint)
  if (
    request.mode === 'navigate' ||
    (request.headers.get('accept') || '').includes('text/html')
  ) {
    event.respondWith(staleWhileRevalidate(PAGES)(request));
    return;
  }
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
