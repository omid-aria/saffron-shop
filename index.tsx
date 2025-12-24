import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// ثبت Service Worker برای PWA - این کد مهمه!
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ SW registered successfully');
        
        // بررسی اینکه آیا PWA قابل نصبه
        window.addEventListener('beforeinstallprompt', (e) => {
          console.log('✅ PWA install prompt ready');
          e.preventDefault();
        });
      })
      .catch(error => {
        console.log('❌ SW registration failed:', error);
      });
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
