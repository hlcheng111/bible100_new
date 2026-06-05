/**
 * Bible100 PWA Service Worker
 * 快取核心頁面，支援離線首頁與常用模組
 */
const CACHE_NAME = 'bible100-v1';
const CORE_URLS = [
  './',
  './index.html',
  './js/global-tools.js',
  './js/coming-soon.js',
  './config/modules.json',
  './config/paths.json',
  './config/languages.json',
  './help/global-tools.htm',
  './help/translate.html',
  './help/my-saved.html',
  './nav_hub/dashboard.html',
  './bible_study/dashboard.html',
  './church_ministry/dashboard.html',
  './school_management/dashboard.html',
  './ai_tools/dashboard.html',
  './disciple_dynamics/dashboard.html',
  './qna/qna_landing.htm',
  './languages/landing_new_cn.html',
  './languages/landP_cn.html',
  './hymn_management/index.html',
  './hymn_management/landing.html',
  './hymn_management/sidebar.html',
  './hymn_management/dashboard.html',
  './hymn_management/data/source-hymns.json'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(CORE_URLS).catch(function () {});
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.mode !== 'navigate' && !e.request.url.match(/\.(js|css|json|htm|html)$/i)) return;
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      if (cached) return cached;
      return fetch(e.request).then(function (r) {
        if (r.ok && e.request.method === 'GET' && e.request.url.startsWith(self.location.origin)) {
          var clone = r.clone();
          caches.open(CACHE_NAME).then(function (c) { c.put(e.request, clone); });
        }
        return r;
      }).catch(function () {
        if (e.request.mode === 'navigate') return caches.match('./index.html').then(function (m) { return m || new Response('Offline', { status: 503 }); });
        return new Response('', { status: 503 });
      });
    })
  );
});
