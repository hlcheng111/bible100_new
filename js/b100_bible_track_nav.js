/**
 * Hub / sidebar: 聖經跑道入口（Hub 右欄 vs 完整版新分頁）
 * - Hub 右欄：bible_app/shell/index.html（file:// 可預覽；雲端可讀全庫若 .db 已上傳）
 * - 完整版：雲端 → /bible_app/ ；本機 → http://127.0.0.1:3000/bible_app/（需 bat）
 */
(function (w) {
  'use strict';

  var LOCAL_SERVE = 'http://127.0.0.1:3000/bible_app/';
  var PROBE_JS = 'http://127.0.0.1:3000/bible_app/shell/js/probe.js';

  function isFile() {
    try {
      return w.location.protocol === 'file:';
    } catch (e) {
      return false;
    }
  }

  function isLocalHttp() {
    var h = (w.location.hostname || '').toLowerCase();
    return w.location.protocol !== 'file:' && (h === 'localhost' || h === '127.0.0.1' || h === '::1');
  }

  function isCloud() {
    return !isFile() && !isLocalHttp();
  }

  /** Hub contentFrame 用（根相對） */
  function shellContentPath() {
    return 'bible_app/shell/index.html';
  }

  /** 新分頁完整版 URL */
  function fullTrackHref() {
    if (isCloud() || (isLocalHttp() && w.location.pathname.indexOf('/bible_app') >= 0)) {
      return w.location.origin + '/bible_app/';
    }
    if (isLocalHttp()) {
      return LOCAL_SERVE;
    }
    return LOCAL_SERVE;
  }

  function probeLocalServer(cb) {
    var done = false;
    var timer = w.setTimeout(function () {
      if (done) return;
      done = true;
      cb(false);
    }, 3500);
    var prev = w.__B100_SERVER_LIVE__;
    w.__B100_SERVER_LIVE__ = false;
    var s = w.document.createElement('script');
    s.src = PROBE_JS + '?' + Date.now();
    s.onload = function () {
      if (done) return;
      done = true;
      w.clearTimeout(timer);
      s.remove();
      cb(!!w.__B100_SERVER_LIVE__);
      w.__B100_SERVER_LIVE__ = prev;
    };
    s.onerror = function () {
      if (done) return;
      done = true;
      w.clearTimeout(timer);
      s.remove();
      cb(false);
    };
    w.document.head.appendChild(s);
  }

  function openFull(ev) {
    if (ev && ev.preventDefault) ev.preventDefault();
    var url = fullTrackHref();
    if (isCloud() || (isLocalHttp() && !isFile())) {
      w.open(url, '_blank', 'noopener,noreferrer');
      return false;
    }
    probeLocalServer(function (ok) {
      if (ok) {
        w.open(LOCAL_SERVE, '_blank', 'noopener,noreferrer');
        return;
      }
      var go = w.confirm(
        "完整版跑道需在本機先啟動「打開聖經跑道.bat」，再於新分頁開啟。\n\n現在開新分頁？"
      );
      if (go) w.open(LOCAL_SERVE, '_blank', 'noopener,noreferrer');
    });
    return false;
  }

  w.B100BibleTrackNav = {
    shellContentPath: shellContentPath,
    fullTrackHref: fullTrackHref,
    openFull: openFull,
    isCloud: isCloud,
    isFile: isFile,
    isLocalHttp: isLocalHttp,
  };
})(typeof window !== 'undefined' ? window : this);
