import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'icons/*'],
      manifest: {
        name: 'BlocPoint',
        short_name: 'BlocPoint',
        description: 'BlocPoint user app – your financial liquidity hub.',
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
            label: 'BlocPoint Dashboard'
          },
          {
            src: '/blocpoint.png',
            sizes: '720x1280',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'BlocPoint Mobile'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            // Placeholder for future API caching; safe no-op for now.
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
