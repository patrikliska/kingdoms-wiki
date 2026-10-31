import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Where the site is served from: '/kingdoms-wiki/' on GitHub Pages, '/' on our own domain.
 * Set by the deploy workflow; local dev and e2e use '/'.
 */
const base = process.env.BASE_PATH ?? '/';

/** Shown in reports: package version + commit on CI (e.g. 0.1.0+6a88511). */
const commit = process.env.GITHUB_SHA?.slice(0, 7);
const appVersion = `${process.env.npm_package_version ?? '0.0.0'}${commit ? `+${commit}` : ''}`;

export default defineConfig({
  base,
  define: { __APP_VERSION__: JSON.stringify(appVersion) },
  server: {
    // Dev only: the report form posts to /api/report, `pnpm report:dev` answers it.
    proxy: { '/api/report': { target: 'http://localhost:8787', rewrite: () => '/' } },
  },
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
    include: ['src/**/*.test.{ts,tsx}', 'worker/**/*.test.ts'],
    environment: 'node',
  },
});
