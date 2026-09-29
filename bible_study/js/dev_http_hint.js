/**
 * Detect file://, build repo-relative HTTP URLs for reader / parallel v3.
 */
(function (w) {
  'use strict';

  w.bible100IsFileProtocol = function () {
    try {
      return w.location && w.location.protocol === 'file:';
    } catch (e) {
      return false;
    }
  };

  /** e.g. /bible_study/parallel_mode_v3.html (after http://127.0.0.1:PORT) */
  w.bible100RelativePathFromRoot = function () {
    var path = '';
    try {
      path = decodeURIComponent(w.location.pathname || '');
    } catch (e2) {
      path = w.location.pathname || '';
    }
    path = String(path).replace(/\\/g, '/');
    var m = path.match(/bible100_new(?:_\d+)?\/(.+)$/i);
    if (m && m[1]) {
      return '/' + m[1].replace(/^\/+/, '');
    }
    m = path.match(/bible_study\/[^/]+\.html?$/i);
    if (m) return '/' + m[0];
    return '/bible_study/reader.html';
  };

  w.bible100SuggestedHttpUrls = function (ports) {
    ports = ports || [3000, 8765, 5500, 8000, 8080];
    var tail = w.bible100RelativePathFromRoot();
    return ports.map(function (p) {
      return { port: p, href: 'http://127.0.0.1:' + p + tail };
    });
  };

  w.bible100CopyText = function (text) {
    if (w.navigator.clipboard && w.navigator.clipboard.writeText) {
      return w.navigator.clipboard.writeText(text).then(function () {
        return true;
      }).catch(function () {
        return false;
      });
    }
    try {
      var ta = w.document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      w.document.body.appendChild(ta);
      ta.select();
      var ok = w.document.execCommand('copy');
      w.document.body.removeChild(ta);
      return Promise.resolve(ok);
    } catch (e3) {
      return Promise.resolve(false);
    }
  };

  w.bible100MaybeAutoredirectFromFile = function (ports) {
    try {
      var q = new w.URLSearchParams(w.location.search || '');
      if (q.get('autoredirect') !== 'http') return;
      if (!w.bible100IsFileProtocol()) return;
      var list = w.bible100SuggestedHttpUrls(ports || [3000, 8765]);
      if (list.length && list[0].href) {
        w.location.replace(list[0].href);
      }
    } catch (e4) {}
  };
})(typeof window !== 'undefined' ? window : this);
