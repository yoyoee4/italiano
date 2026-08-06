/* ═══════════════════════════════════════════════
   VolaLingo — Service Worker
   Offline-first PWA caching
   ═══════════════════════════════════════════════ */

const CACHE_NAME = 'volalingo-v5';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/styles.css',
  '/js/data.js',
  '/js/app.js',
  '/js/skill-tree.js',
  '/js/practice.js',
  '/js/content.js',
  '/js/features.js',
  '/js/games.js',
  '/js/speak.js',
  '/js/sentbuild.js',
  '/js/listening.js',
  '/manifest.json'
];

// Install — precache shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — network first, cache fallback
self.addEventListener('fetch', event => {
  // Skip non-GET and API calls
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('api.') || event.request.url.includes('rss2json')) return;
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // For navigation, return index.html (SPA)
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});
