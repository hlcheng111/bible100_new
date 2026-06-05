/**
 * 偵測 file://、推算相對於 bible100_new 根的路徑，並產生建議的本機 HTTP 網址。
 * reader / parallel_mode_v3 等頁在無資料時共用。
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

  /** 例如 /bible_study/reader.html（供掛在 http://127.0.0.1:PORT 之後） */
  w.bible100RelativePathFromRoot = function () {
    var path = '';
    try {
      path = decodeURIComponent(w.location.pathname || '');
    } catch (e2) {
      path = w.location.pathname || '';
    }
    path = String(path).replace(/\\/g, '/');
    var lower = path.toLowerCase();
    var key = 'bible100_new';
    var idx = lower.indexOf(key + '/');
    var skip = key.length + 1;
    if (idx < 0) {
      idx = lower.indexOf(key);
      skip = key.length;
    }
    if (idx >= 0) {
      var after = path.slice(idx + skip).replace(/^\/+/, '');
      return '/' + after;
    }
    var m = path.match(/bible_study\/[^/]+\.html?$/i);
    if (m) return '/' + m[0];
    return '/bible_study/reader.html';
  };

  w.bible100SuggestedHttpUrls = function (ports) {
    ports = ports || [8765, 5500, 8000, 8080];
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

  /** file 且帶 ?autoredirect=http 時，導向第一個建議埠（預設 8765） */
  w.bible100MaybeAutoredirectFromFile = function (ports) {
    try {
      var q = new w.URLSearchParams(w.location.search || '');
      if (q.get('autoredirect') !== 'http') return;
      if (!w.bible100IsFileProtocol()) return;
      var list = w.bible100SuggestedHttpUrls(ports || [8765]);
      if (list.length && list[0].href) {
        w.location.replace(list[0].href);
      }
    } catch (e4) {}
  };
})(typeof window !== 'undefined' ? window : this);
