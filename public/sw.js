// Service Worker خیلی ساده و امن
self.addEventListener('install', () => {
  console.log('SW: Installed');
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  console.log('SW: Activated');
});

// فقط صفحه اصلی رو سرو می‌کنه، بقیه رو به شبکه بفرست
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request));
  }
});
