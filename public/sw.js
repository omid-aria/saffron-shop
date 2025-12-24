const CACHE_NAME = 'saffron-shop-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/data.json'
];

// نصب Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// فعال‌سازی و مدیریت درخواست‌ها
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // اگر در کش بود، برگردان
        if (response) {
          return response;
        }
        // در غیر این صورت، درخواست را از شبکه بگیر
        return fetch(event.request);
      }
    )
  );
});
