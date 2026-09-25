/**
 * Dino Tracking - Service Worker (v2.0)
 * Robust PWA offline caching with iOS Safari Redirection fix
 */

const APP_VERSION = '2.3';
const CACHE_NAME = 'dino-tracking-v12';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  `/css/style.css?v=${APP_VERSION}`,
  `/js/data.js?v=${APP_VERSION}`,
  `/js/audio.js?v=${APP_VERSION}`,
  `/js/timer.js?v=${APP_VERSION}`,
  `/js/storage.js?v=${APP_VERSION}`,
  `/js/supabase_sync.js?v=${APP_VERSION}`,
  `/js/charts.js?v=${APP_VERSION}`,
  `/js/ai_coach.js?v=${APP_VERSION}`,
  `/js/app.js?v=${APP_VERSION}`,
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
  self.skipWaiting();
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
});

// Activation: Clear previous cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key.startsWith('dino-tracking-') && key !== CACHE_NAME) {
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

  // 4. Same-origin Static Assets (CSS, JS, Fonts, Images) -> Network-First with Cache Fallback (Preserve Query String)
  if (url.origin === location.origin) {
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
          // Strictly match URL including query parameters without ignoreSearch
          return caches.match(request);
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
        return caches.match(request);
      })
  );
});
