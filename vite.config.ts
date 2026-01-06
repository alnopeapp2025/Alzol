import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/Alzol/', 
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'sound2.mp3'], // Added sound2.mp3 explicitly
      manifest: {
        name: 'مخزنك - إدارة المخزن',
        short_name: 'مخزنك',
        description: 'تطبيق لإدارة المخازن والمبيعات والمصروفات',
        theme_color: '#00695c',
        background_color: '#FFF9C4',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/Alzol/',
        start_url: '/Alzol/',
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
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3,wav}'], // Added mp3 and wav to globPatterns
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
            }
          },
          {
            urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
            }
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
