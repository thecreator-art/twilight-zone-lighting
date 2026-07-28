// Twilight Zone — Service Worker (v4: SELF-DESTRUCT)
//
// The previous SW (v3) pre-cached "/" on install and served HTML with a
// stale-while-revalidate strategy that only wrote to cache on a 200 response.
// Once the site started returning 503, the cached homepage could never be
// replaced — returning visitors kept seeing the old site forever, served
// entirely from the service worker with no network involvement.
//
// This version takes no control of any request. On activation it wipes every
// cache, unregisters itself, and force-navigates open tabs so they re-request
// from the network.
//
// NOTE: /sw.js is exempted from the maintenance middleware matcher, otherwise
// the browser would fetch the 503 HTML page in place of this script and the
// old SW would stay installed indefinitely.

self.addEventListener('install', () => {
  // Take over immediately rather than waiting for existing tabs to close.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // 1. Delete every cache bucket this origin owns (tz-v3-pages, -media, -runtime).
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));

      // 2. Remove this service worker registration entirely.
      await self.registration.unregister();

      // 3. Reload any open tabs so they hit the network instead of the dead SW.
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => {
        try { client.navigate(client.url); } catch (_) { /* older browsers */ }
      });
    })()
  );
});

// Deliberately NO fetch handler — every request goes straight to the network.
