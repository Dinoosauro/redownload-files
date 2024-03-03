import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA({
    manifest: {
      // caches the assets/icons mentioned (assets/* includes all the assets present in your src/ directory) 
      name: 'Redownload Files',
      short_name: 'Redownload Files',
      start_url: '/',
      background_color: '#212529',
      theme_color: '#0d6efd',
      icons: [
        {
          src: '/icon.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      // defining cached files formats
      globPatterns: ["**\/*.{js,css,html,png}"],
      runtimeCaching: [{
        urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'jsdelivr-static-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
          },
          cacheableResponse: {
            statuses: [0, 200]
          },
        }
      }],
      cleanupOutdatedCaches: true, // delete old caches
      skipWaiting: true, // skip waiting phase
      clientsClaim: true // claim clients immediately
    }
  })
  ],
  build: {
    outDir: "./dist",
    rollupOptions: {
      input: ["./index.html", "./public/streamSaver/mitm.html"]
    }
  }
})
