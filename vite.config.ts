import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Where the site is served from: '/kingdoms-wiki/' on GitHub Pages, '/' on our own domain.
 * Set by the deploy workflow; local dev and e2e use '/'.
 */
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Kingdoms Companion',
        short_name: 'Kingdoms',
        description: 'Rychlá příručka pro hráče Travian Kingdoms',
        lang: 'cs',
        theme_color: '#2f5d3a',
        background_color: '#f4ecd8',
        display: 'standalone',
        start_url: base,
        scope: base,
        icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        // Czech + English only need the Latin subsets of the fonts.
        globIgnores: ['**/*cyrillic*', '**/*greek*', '**/*vietnamese*'],
        // Relative to the service worker, so it works under any base path.
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 20 } },
          },
        ],
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'node',
  },
});
