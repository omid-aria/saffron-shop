
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

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
