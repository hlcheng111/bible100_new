import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

/** 部署於 bible100 根目錄時為 /bible_journey/；本機 dev 用 / */
const base = process.env.BJ_BASE || '/';

/** Node 20+ 時設 PWA_BUILD=1 啟用 Service Worker 產生 */
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
            manifest: false,
            workbox: {
              globPatterns: ['**/*.{js,css,html,json,wasm}'],
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
});
