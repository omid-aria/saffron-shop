
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// استفاده از './' باعث می‌شود فایل‌ها در هر مسیری (ریشه یا زیرپوشه) به درستی لود شوند
export default defineConfig({
  plugins: [react()],
  base: './',
})
