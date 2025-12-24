import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Service Worker رو موقتا غیرفعال می‌کنیم
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js')
//       .then(registration => {
//         console.log('✅ SW registered successfully');
//       })
//       .catch(error => {
//         console.log('❌ SW registration failed:', error);
//       });
//   });
// }

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
