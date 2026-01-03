import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/Alzol/', // هذا السطر هو الأهم لحل مشكلة الشاشة البيضاء
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'مخزنك - إدارة المخزن',
        short_name: 'مخزنك',
        description: 'تطبيق لإدارة المخازن والمبيعات والمصروفات',
        theme_color: '#00695c',
        background_color: '#FFF9C4',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/Alzol/',      // تحديث النطاق ليطابق المسار الجديد
        start_url: '/Alzol/',  // تحديث رابط البدء
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
