// DINO Coach service worker — scope /coach/ (tách hẳn khỏi sw.js của app cá nhân)
// Chỉ cache vỏ app tĩnh của /coach/. KHÔNG cache request tới Supabase hay CDN dữ liệu.
const VERSION = 'dcoach-v19';
const SHELL = [
  '/coach', '/coach/', '/coach/index.html', '/coach/manifest.json', '/coach/css/coach.css',
  '/coach/js/app.js', '/coach/js/config.js', '/coach/js/supabaseClient.js', '/coach/js/auth.js',
  '/coach/js/router.js', '/coach/js/ui.js',
  '/coach/js/views/auth.js', '/coach/js/views/coach/home.js', '/coach/js/views/client/home.js',
  '/coach/js/views/coach/client.js', '/coach/js/views/client/intake.js', '/coach/js/views/client/body.js',
  '/coach/js/views/shared/body.js', '/coach/js/views/shared/photos.js', '/coach/js/lib/image.js', '/coach/js/lib/files.js', '/coach/js/lib/exercises.js', '/coach/js/views/coach/library.js', '/coach/js/views/shared/exercise.js', '/coach/js/lib/intake.js', '/coach/js/lib/formulas.js',
  '/coach/js/lib/plan.js', '/coach/js/lib/planStore.js', '/coach/js/views/coach/plan.js', '/coach/js/views/coach/session.js', '/coach/js/views/client/plan.js',
  '/coach/js/lib/sessionLog.js', '/coach/js/lib/logStore.js', '/coach/js/views/client/log.js', '/coach/js/views/coach/review.js', '/coach/js/views/coach/inbox.js', '/coach/js/views/shared/chat.js',
  '/coach/js/lib/nutrition.js', '/coach/js/lib/nutritionStore.js', '/coach/js/views/coach/nutrition.js', '/coach/js/views/coach/foods.js', '/coach/js/views/client/eat.js', '/coach/js/lib/theme.js',
  '/coach/js/lib/checkin.js', '/coach/js/lib/checkinStore.js', '/coach/js/views/client/checkin.js', '/coach/js/views/coach/checkin.js', '/coach/js/views/shared/phaseReport.js',
  '/coach/js/lib/charts.js', '/coach/js/lib/dashboard.js', '/coach/js/lib/dashboardStore.js', '/coach/js/views/shared/dashboard.js',
  '/coach/icons/icon-192.png', '/coach/icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('dcoach-') && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || !url.pathname.startsWith('/coach')) return;
  // Network-first cho HTML (luôn lấy bản mới khi có mạng), cache-first cho tài nguyên tĩnh
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match('/coach').then((r) => r || caches.match('/coach/index.html'))));
    return;
  }
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); }
      return res;
    }))
  );
});
