/** 在 index 分頁 iframe 內：隱藏與頂層重複的「前往下一步」大按鈕 */
(function () {
  try {
    var q = new URLSearchParams(location.search);
    var shell = q.get("shell") === "1";
    if (window.self !== window.top || shell) {
      document.documentElement.classList.add("planning-shell");
    }
  } catch (e) {}
})();
