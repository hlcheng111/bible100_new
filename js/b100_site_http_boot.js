/**
 * B100 · 总站 HTTP 启动引导
 * file:// 下探测本机 serve（8080 总站优先，3000 兼容旧跑道 bat）
 */
(function (global) {
  'use strict';

  var SITE_BUILD = '20260813http';

  var ENDPOINTS = [
    {
      id: 'site8080',
      base: 'http://127.0.0.1:8080',
      probe: '/js/site_http_probe.js',
      flag: '__B100_SITE_HTTP__',
    },
    {
      id: 'site3000',
      base: 'http://127.0.0.1:3000',
      probe: '/js/site_http_probe.js',
      flag: '__B100_SITE_HTTP__',
    },
    {
      id: 'track3000',
      base: 'http://127.0.0.1:3000',
      probe: '/bible_app/shell/js/probe.js',
      flag: '__B100_SERVER_LIVE__',
    },
  ];

  var cachedLive = null;

  function scriptProbe(cfg) {
    return new Promise(function (resolve) {
      var done = false;
      var timer = global.setTimeout(function () {
        finish(false);
      }, 4000);
      var prev = global[cfg.flag];
      global[cfg.flag] = false;
      var s = global.document.createElement('script');
      s.src = cfg.base + cfg.probe + '?' + Date.now();
      s.onload = function () {
        finish(!!global[cfg.flag]);
        global[cfg.flag] = prev;
        s.remove();
      };
      s.onerror = function () {
        finish(false);
        global[cfg.flag] = prev;
        s.remove();
      };
      function finish(ok) {
        if (done) return;
        done = true;
        global.clearTimeout(timer);
        resolve(!!ok);
      }
      global.document.head.appendChild(s);
    });
  }

  function probeAny() {
    if (cachedLive) return Promise.resolve(cachedLive);
    var chain = Promise.resolve(null);
    ENDPOINTS.forEach(function (cfg) {
      chain = chain.then(function (found) {
        if (found) return found;
        return scriptProbe(cfg).then(function (ok) {
          return ok ? { base: cfg.base, id: cfg.id } : null;
        });
      });
    });
    return chain.then(function (found) {
      cachedLive = found;
      return found;
    });
  }

  function siteIndexUrl(base, relPath) {
    relPath = String(relPath || 'index.html').replace(/^\//, '');
    return base + '/' + relPath + (global.location.search || '') + (global.location.hash || '');
  }

  function redirectIfLive(relPath, onFail) {
    if (global.location.protocol !== 'file:') return Promise.resolve(false);
    return probeAny().then(function (live) {
      if (live) {
        global.location.replace(siteIndexUrl(live.base, relPath || 'index.html'));
        return true;
      }
      if (typeof onFail === 'function') onFail();
      return false;
    });
  }

  function trackShellUrl(base) {
    base = base || (cachedLive && cachedLive.base) || 'http://127.0.0.1:8080';
    return base + '/bible_app/shell/index.html?v=20260813http&fresh=1';
  }

  function hubStudyTrackUrl(base) {
    base = base || (cachedLive && cachedLive.base) || 'http://127.0.0.1:8080';
    return base + '/index.html?b100_mode=study&b100_track=1';
  }

  global.B100SiteHttpBoot = {
    SITE_BUILD: SITE_BUILD,
    ENDPOINTS: ENDPOINTS,
    probeAny: probeAny,
    redirectIfLive: redirectIfLive,
    siteIndexUrl: siteIndexUrl,
    trackShellUrl: trackShellUrl,
    hubStudyTrackUrl: hubStudyTrackUrl,
  };
})(typeof window !== 'undefined' ? window : globalThis);
