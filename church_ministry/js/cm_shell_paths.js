/**
 * 教會事工 · Hub 根相對路徑 ↔ 模組內相對路徑（Standalone 雙欄殼用）
 */
(function (w) {
  "use strict";

  function normPath(path) {
    return String(path || "").replace(/\\/g, "/");
  }

  function isCmIndexShell(win) {
    try {
      win = win || w;
      return /\/church_ministry\/index\.html$/i.test(normPath(win.location.pathname));
    } catch (e) {
      return false;
    }
  }

  function inCmStandaloneTree() {
    if (isCmIndexShell(w)) return true;
    try {
      var cur = w;
      for (var i = 0; i < 6 && cur; i++) {
        if (isCmIndexShell(cur)) return true;
        if (!cur.parent || cur.parent === cur) break;
        cur = cur.parent;
      }
    } catch (eP) {}
    return false;
  }

  /** bible100ShellNav 根相對 URL → 目前殼可用的 iframe src */
  function resolveShellUrl(url) {
    url = String(url || "").replace(/^\.?\//, "");
    if (!url) return url;
    if (/^https?:\/\//i.test(url)) return url;

    if (url.indexOf("../") === 0 || url.indexOf("./") === 0) {
      return url;
    }
    if (inCmStandaloneTree()) {
      if (url.indexOf("church_ministry/") === 0) {
        return url.slice("church_ministry/".length);
      }
      return "../" + url;
    }
    return url;
  }

  function bust(url) {
    if (!url) return url;
    var h = url.indexOf("#");
    if (h >= 0) {
      var b = url.slice(0, h);
      return b + (b.indexOf("?") >= 0 ? "&" : "?") + "v=" + Date.now() + url.slice(h);
    }
    return url + (url.indexOf("?") >= 0 ? "&" : "?") + "v=" + Date.now();
  }

  w.CmShellPaths = {
    isCmIndexShell: isCmIndexShell,
    inCmStandaloneTree: inCmStandaloneTree,
    resolveShellUrl: resolveShellUrl,
    bust: bust
  };
})(typeof window !== "undefined" ? window : this);
