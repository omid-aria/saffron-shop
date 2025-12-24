import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// ثبت Service Worker برای PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// بازگرداندن ساختار اصلی پروژه برای جلوگیری از خطای Vercel و GitHub Actions
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
