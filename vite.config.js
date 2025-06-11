import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/Logo.png', 'icons/Logo.png'],
      manifest: {
        name: 'NicaDriver',
        short_name: 'NicaDriver',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#FF6F00',
        icons: [
          {
            src: '/icons/Logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/Logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000 // permite archivos hasta 5 MB
      }
    })
  ]
});
