const CACHE_NAME = 'foodie-pwa-v1';
const STATIC_ASSETS = [
  '/',
  '/html/index.html',
  '/html/menu.html',
  '/html/checkout.html',
  '/html/order-history.html',
  '/html/offline.html',
  '/css/style.css',
  '/css/navbar.css',
  '/css/dark-mode.css',
  '/js/app.js',
  '/js/utils.js',
  '/js/cart-store.js',
  '/js/i18n.js',
  '/js/error-handler.js',
  '/imgs/logo.svg',
  '/imgs/favicon.webp'
];

// Install Event - Pre-cache Static Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching core PWA assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean Up Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Cache-First Strategy with Offline Fallback Page
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch background update for cache freshness
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {/* Ignore network errors for background update */});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Fallback page for HTML navigation requests
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/html/offline.html');
        }
      });
    })
  );
});
