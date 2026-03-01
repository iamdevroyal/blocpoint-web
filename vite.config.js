import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['blocpoint-fav-white.png', 'blocpoint-fav.png', 'robots.txt', 'icons/**/*'],
      manifest: {
        name: 'Blocpoint',
        short_name: 'Blocpoint',
        description: 'Blocpoint user app – your financial liquidity hub.',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/onboarding',
        icons: [
          {
            src: '/icons/android/launchericon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/android/launchericon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/android/launchericon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icons/android/launchericon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        categories: ['finance', 'productivity'],
        screenshots: [
          {
            src: '/blocpoint.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Blocpoint Dashboard'
          },
          {
            src: '/blocpoint.png',
            sizes: '720x1280',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Blocpoint Mobile'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // SPA fallback — any uncached navigation loads the app shell (index.html)
        navigateFallback: 'index.html',
        // Don't intercept API requests with the fallback
        navigateFallbackDenylist: [/^\/api\//, /^\/storage\//],
        runtimeCaching: [
          {
            // Network-first for all API calls with 5s timeout before cache
            urlPattern: ({ url }) => url.pathname.startsWith('/api/v1/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'blocpoint-api',
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
})
