const CACHE_NAME = 'saffron-shop-v1';

self.addEventListener('install', event => {
  console.log('SW: Installing');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('SW: Activating');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // فقط برای درخواست‌های GET پاسخ بده
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // اگر در کش بود، برگردان
        if (response) {
          console.log('SW: Serving from cache', event.request.url);
          return response;
        }
        
        // در غیر این صورت، از شبکه بگیر
        console.log('SW: Fetching from network', event.request.url);
        return fetch(event.request)
          .catch(() => {
            // اگر شبکه هم کار نکرد، صفحه اصلی رو برگردان
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});
