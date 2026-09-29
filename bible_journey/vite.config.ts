import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * 離線 ZIP / file:// 雙擊：必須用相對路徑 './'
 * Vercel／根網域 PWA：BJ_BASE=/ PWA_BUILD=1
 * 雲端子路徑：BJ_BASE=/bible_journey/ PWA_BUILD=1
 */
const base = process.env.BJ_BASE ?? './';

/** 設 PWA_BUILD=1 啟用 Service Worker + Web App Manifest（需 HTTPS） */
const pwaBuild = process.env.PWA_BUILD === '1';

export default defineConfig({
  base,
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  plugins: [
    ...(pwaBuild
      ? [
          VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            /** 使用 public/manifest.webmanifest，避免與 index 重複注入 */
            manifest: false,
            includeAssets: [
              'icons/icon-192.png',
              'icons/icon-512.png',
              'icons/apple-touch-icon.png',
              'manifest.webmanifest',
            ],
            workbox: {
              /** 勿 precache 全本 1189 章經文 JSON（會撐爆安裝） */
              globPatterns: [
                '**/*.{js,css,html,ico,png,svg,webmanifest}',
                'data/tracks/**/*.json',
              ],
              navigateFallback: 'index.html',
              runtimeCaching: [
                {
                  urlPattern: ({ url }) => /\/data\/bible\/.+\.json$/i.test(url.pathname),
                  handler: 'CacheFirst',
                  options: {
                    cacheName: 'bible-chapters-v1',
                    expiration: {
                      maxEntries: 120,
                      maxAgeSeconds: 60 * 60 * 24 * 45,
                    },
                    cacheableResponse: { statuses: [0, 200] },
                  },
                },
                {
                  urlPattern: ({ url }) => /\/data\/(tracks|coach)\/.+\.json$/i.test(url.pathname),
                  handler: 'StaleWhileRevalidate',
                  options: {
                    cacheName: 'track-coach-json-v1',
                    expiration: {
                      maxEntries: 40,
                      maxAgeSeconds: 60 * 60 * 24 * 14,
                    },
                  },
                },
              ],
            },
            devOptions: { enabled: false },
          }),
        ]
      : []),
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
});
