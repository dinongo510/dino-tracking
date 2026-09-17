/**
 * Dino Tracking - Service Worker (v2.0)
 * Robust PWA offline caching with iOS Safari Redirection fix
 */

const CACHE_NAME = 'dino-tracking-v6';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/data.js',
  '/js/supabase_sync.js',
  '/js/ai_coach.js',
  '/js/audio.js',
  '/js/storage.js',
  '/js/charts.js',
  '/js/app.js',
  '/manifest.json'
];

// Helper to strip the redirected flag for iOS Safari (WebKit) compatibility.
// When a fetch request follows a redirect, response.redirected is true.
// Passing a response with redirected: true to event.respondWith() throws a TypeError on iOS Safari.
function sanitizeResponse(response) {
  if (!response) return response;
  if (response.redirected) {
    const cleanHeaders = new Headers(response.headers);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: cleanHeaders
    });
  }
  return response;
}

// Installation: Cache static core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use map with individual catches so a single failure doesn't block installation
      return Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Failed to cache ${url}:`, err);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// Activation: Clear previous cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log(`[SW] Deleting legacy cache: ${key}`);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Interceptor: Safari-Safe Routing & Caching
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // 1. Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // 2. Only handle HTTP/HTTPS schemes (ignore chrome-extension, data:, etc.)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 3. Navigation requests (HTML document loads) -> Network-First with Offline Cache Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const sanitized = sanitizeResponse(networkResponse);
          if (sanitized && sanitized.status === 200) {
            const responseToCache = sanitized.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return sanitized;
        })
        .catch(() => {
          return caches.match('/index.html')
            .then((cachedHtml) => cachedHtml || caches.match('/'));
        })
    );
    return;
  }

  // 4. Same-origin Static Assets (CSS, JS, Fonts, Images) -> Cache-First with Network Fallback
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(request, { ignoreSearch: true }).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((networkResponse) => {
            const sanitized = sanitizeResponse(networkResponse);
            if (sanitized && sanitized.status === 200) {
              const responseToCache = sanitized.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return sanitized;
          })
          .catch((err) => {
            console.warn(`[SW] Asset fetch failed for ${request.url}:`, err);
            // Return empty fallback or let browser handle it
            return new Response('', { status: 408, statusText: 'Request Timeout' });
          });
      })
    );
    return;
  }

  // 5. Cross-origin requests (Google Fonts, CDNs) -> Network-First with cache fallback
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        const sanitized = sanitizeResponse(networkResponse);
        if (sanitized && (sanitized.status === 200 || sanitized.type === 'opaque')) {
          const responseToCache = sanitized.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return sanitized;
      })
      .catch(() => {
        return caches.match(request, { ignoreSearch: true });
      })
  );
});
