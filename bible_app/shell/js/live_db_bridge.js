/**

 * file:// 预览时探测本机 serve（8080 总站优先，3000 兼容），供读经器从 HTTP 载经库。

 */

(function (global) {

  'use strict';



  var ENDPOINTS = [

    {

      base: 'http://127.0.0.1:8080',

      probe: '/js/site_http_probe.js',

      flag: '__B100_SITE_HTTP__',

    },

    {

      base: 'http://127.0.0.1:3000',

      probe: '/js/site_http_probe.js',

      flag: '__B100_SITE_HTTP__',

    },

    {

      base: 'http://127.0.0.1:3000',

      probe: '/bible_app/shell/js/probe.js',

      flag: '__B100_SERVER_LIVE__',

    },

  ];



  var liveBase = null;

  var cached = null;

  var pending = null;



  function isFile() {

    try {

      return global.location.protocol === 'file:';

    } catch (e) {

      return false;

    }

  }



  function applyLiveBase(base) {

    liveBase = base;

    cached = !!base;

    if (base) {

      try {

        global.__B100_SERVER_LIVE__ = true;

        global.__B100_SITE_HTTP__ = true;

        global.__B100_LIVE_DB_BASE__ = base + '/bible_app/app/assets/bible/';

        global.__B100_LIVE_SITE_BASE__ = base;

      } catch (eSet) {}

    }

    return cached;

  }



  function getLiveBase() {

    return liveBase;

  }



  function isLive() {

    return !!liveBase;

  }



  function getDbBase() {

    if (!liveBase) return null;

    return liveBase + '/bible_app/app/assets/bible/';

  }



  function getShellUrl() {

    var base = liveBase || 'http://127.0.0.1:8080';

    return base + '/bible_app/shell/index.html';

  }



  function getHubUrl() {

    var base = liveBase || 'http://127.0.0.1:8080';

    return base + '/index_v5.html';

  }



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

        resolve(ok ? cfg.base : null);

      }

      global.document.head.appendChild(s);

    });

  }



  function probeEndpoints() {

    var chain = Promise.resolve(null);

    ENDPOINTS.forEach(function (cfg) {

      chain = chain.then(function (found) {

        if (found) return found;

        return scriptProbe(cfg);

      });

    });

    return chain;

  }



  function probe(retries) {

    if (!isFile()) {

      liveBase = null;

      cached = true;

      return Promise.resolve(false);

    }

    if (cached !== null && liveBase) return Promise.resolve(true);

    if (pending) return pending;

    retries = retries == null ? 2 : retries;



    pending = probeEndpoints().then(function (base) {

      if (!base && retries > 0) {

        return new Promise(function (resolve) {

          global.setTimeout(function () {

            pending = null;

            cached = null;

            probe(retries - 1).then(resolve);

          }, 1200);

        });

      }

      applyLiveBase(base);

      pending = null;

      return !!base;

    });



    return pending;

  }



  function notifyChildFrames() {

    if (!isLive() || !getDbBase()) return;

    try {

      var cf = global.document.getElementById('contentFrame');

      if (cf && cf.contentWindow) {

        cf.contentWindow.postMessage(

          {

            type: 'b100-live-server',

            dbBase: getDbBase(),

            shellUrl: getShellUrl(),

            hubUrl: getHubUrl(),

          },

          '*'

        );

      }

    } catch (eCf) {}

  }



  function pageUrl(rel) {

    rel = String(rel || '').replace(/^\//, '');

    var base = liveBase || 'http://127.0.0.1:8080';

    if (rel.indexOf('pages/') === 0) {

      return base + '/bible_app/shell/' + rel;

    }

    return base + '/bible_app/shell/pages/' + rel;

  }



  function resolvePageHref(rel) {

    if (!isFile()) return rel;

    if (!isLive()) return rel;

    return pageUrl(rel);

  }



  function ensureReaderPage() {

    if (!isFile()) return Promise.resolve(false);

    var name = ((global.location.pathname || '').split('/').pop() || '').split('?')[0];

    if (!/^bible66\.html$/i.test(name)) return Promise.resolve(false);

    return probe(2).then(function (ok) {

      if (!ok) return false;

      var target = pageUrl('bible66.html' + (global.location.search || '') + (global.location.hash || ''));

      try {

        if (global.location.href.replace(/#.*$/, '') === target.replace(/#.*$/, '')) return false;

      } catch (eSame) {}

      global.location.replace(target);

      return true;

    });

  }



  global.addEventListener('message', function (ev) {

    var d = ev && ev.data;

    if (!d || d.type !== 'b100-live-server') return;

    if (d.dbBase) {

      try {

        global.__B100_LIVE_DB_BASE__ = d.dbBase;

        var m = String(d.dbBase).match(/^(https?:\/\/[^/]+)/);

        if (m) applyLiveBase(m[1]);

      } catch (eBase) {}

    }

    cached = true;

  });



  function afterLiveProbe(fn) {

    if (!fn) return Promise.resolve();

    if (!isFile()) {

      fn();

      return Promise.resolve();

    }

    return probe(2).then(function () {

      fn();

    });

  }



  global.B100LiveDb = {

    ENDPOINTS: ENDPOINTS,

    isFile: isFile,

    isLive: isLive,

    getLiveBase: getLiveBase,

    getDbBase: getDbBase,

    getShellUrl: getShellUrl,

    getHubUrl: getHubUrl,

    pageUrl: pageUrl,

    resolvePageHref: resolvePageHref,

    ensureReaderPage: ensureReaderPage,

    afterLiveProbe: afterLiveProbe,

    probe: probe,

    notifyChildFrames: notifyChildFrames,

  };



  if (isFile()) {

    probe(2).then(function () {

      notifyChildFrames();

    });

  } else {

    var h = (global.location.hostname || '').toLowerCase();

    if (h === 'localhost' || h === '127.0.0.1') {

      try {

        applyLiveBase(global.location.protocol + '//' + global.location.host);

      } catch (eHost) {

        cached = true;

      }

    } else {

      cached = true;

    }

  }

})(typeof window !== 'undefined' ? window : global);

