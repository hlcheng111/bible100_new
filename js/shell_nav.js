/**
 * 在 index_v5 雙 iframe 殼內：同時切換 sidebarFrame + contentFrame。
 * 子頁（側欄或內容框）呼叫 bible100ShellNav(ev, { sidebarUrl, contentUrl })。
 * 路徑為相對於 bible100_new 根目錄（與 index_v5.html 同層）。
 * 省略的欄位不會改動對應 iframe。
 */
(function (w) {
  w.bible100ShellNav = function (ev, opts) {
    if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();
    opts = opts || {};
    var sb = opts.sidebarUrl;
    var cf = opts.contentUrl;
    try {
      if (w.parent && w.parent !== w) {
        w.parent.postMessage(
          { type: 'bible100-shell', sidebarUrl: sb || '', contentUrl: cf || '' },
          '*'
        );
        return false;
      }
    } catch (err) {}
    if (cf) {
      w.location.href = cf;
    } else if (sb) {
      w.location.href = sb;
    }
    return false;
  };
  /** 僅替換 contentFrame（側欄不變），供 help／qna 等。url 為根相對，如 help/global-tools.htm */
  w.bible100OpenContent = function (ev, url) {
    if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();
    if (!url) return false;
    try {
      if (w.parent && w.parent !== w) {
        w.parent.postMessage({ type: 'navigate', url: url }, '*');
        return false;
      }
    } catch (err2) {}
    w.location.href = url;
    return false;
  };
})(typeof window !== 'undefined' ? window : this);
