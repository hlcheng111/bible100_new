/**
 * 側欄頁單獨以 file:// 或新分頁開啟時，沒有父層 contentFrame，將 target 改為 _top。
 * 在模組殼（index.html / index_v5）內嵌時：延遲多次檢查父層，避免誤判導致連結整頁跳走。
 *
 * 重要：側欄在 **iframe 內**（window !== window.top）時，**絕對不可**把 contentFrame 改成 _top，
 * 否則會整頁導向內容頁、右欄殼失效（誤判常見於 file:// 或父層 document 讀取時機）。
 */
(function () {
  /** 本頁是否嵌在任一 iframe 內（模組殼的 sidebarFrame 等） */
  function isEmbeddedInFrame() {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }

  function parentHasContentFrame() {
    try {
      var p = window.parent;
      if (!p || p === window) return false;
      // 先試 frames API，避免部分環境下 document 存取失敗而誤判
      if (p.frames && p.frames['contentFrame']) return true;
      var d = p.document;
      if (d && d.getElementById('contentFrame')) return true;
    } catch (e) { /* cross-origin */ }
    return false;
  }

  function applyStandaloneTargets() {
    var bases = document.getElementsByTagName('base');
    for (var i = 0; i < bases.length; i++) {
      var t = (bases[i].getAttribute('target') || '').toLowerCase();
      if (t === 'contentframe') bases[i].setAttribute('target', '_top');
    }
    document.querySelectorAll('a[href][target="contentFrame"]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href === '#' || href.indexOf('javascript:') === 0) return;
      a.setAttribute('target', '_top');
    });
  }

  function tryStandalone() {
    if (isEmbeddedInFrame()) return;
    if (parentHasContentFrame()) return;
    applyStandaloneTargets();
  }

  function scheduleDeferredChecks() {
    if (isEmbeddedInFrame()) return;
    if (parentHasContentFrame()) return;
    requestAnimationFrame(function () {
      if (isEmbeddedInFrame()) return;
      if (parentHasContentFrame()) return;
      requestAnimationFrame(function () {
        if (isEmbeddedInFrame()) return;
        if (parentHasContentFrame()) return;
        tryStandalone();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (isEmbeddedInFrame()) return;
    if (parentHasContentFrame()) return;
    scheduleDeferredChecks();
  });

  window.addEventListener('load', function () {
    if (isEmbeddedInFrame()) return;
    if (parentHasContentFrame()) return;
    tryStandalone();
  });
})();
