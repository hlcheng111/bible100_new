/**
 * 側欄專用：不依賴 target="contentFrame"（file:// 下不可靠）。
 * 標記：<a href="#" data-b100-path="相對於本頁的 path 或絕對 URL">…</a>
 * 點擊後僅 parent.postMessage → 由 ai_lab / index / index_v5 監聽並設定 #contentFrame.src
 */
(function () {
  'use strict';
  var MSG = 'bible100-sidebar-content-nav';

  document.addEventListener(
    'click',
    function (e) {
      var a = e.target.closest && e.target.closest('a[data-b100-path]');
      if (!a) return;
      e.preventDefault();
      var rel = a.getAttribute('data-b100-path');
      if (!rel) return;
      var url;
      try {
        url = new URL(rel, window.location.href).href;
      } catch (err) {
        url = rel;
      }
      try {
        window.parent.postMessage({ type: MSG, url: url }, '*');
      } catch (err2) {}
    },
    true
  );
})();
