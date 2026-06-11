/**
 * 侧栏在 shell 外单独打开时：移除 base target=contentFrame，
 * 内容链改为 target=_top，避免在侧栏 iframe 内「开向自己」。
 */
(function (w, doc) {
  "use strict";

  function inShell() {
    try {
      if (w.parent && w.parent !== w) {
        try {
          if (w.parent.document && w.parent.document.getElementById("contentFrame")) {
            return true;
          }
        } catch (eDoc) {}
        /* file:// 下常無法讀 parent.document，但仍為 index_v5 子 iframe */
        return true;
      }
    } catch (eShell) {}
    return false;
  }

  if (inShell()) return;

  var base = doc.querySelector('base[target="contentFrame"]');
  if (base && base.parentNode) base.parentNode.removeChild(base);

  function isInternalContentLink(href) {
    if (!href || href === "#") return false;
    var lower = href.toLowerCase();
    if (lower.indexOf("javascript:") === 0 || lower.indexOf("mailto:") === 0 || lower.indexOf("tel:") === 0) {
      return false;
    }
    if (lower.indexOf("http://") === 0 || lower.indexOf("https://") === 0) return false;
    return true;
  }

  function applyStandaloneTargets() {
    doc.querySelectorAll("a[href]").forEach(function (a) {
      if (a.getAttribute("onclick")) return;
      if (a.getAttribute("data-b100-nav")) return;
      if (a.getAttribute("data-b100-shell-nav")) return;
      var href = a.getAttribute("href");
      if (!isInternalContentLink(href)) return;
      a.setAttribute("target", "_top");
    });
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", applyStandaloneTargets);
  } else {
    applyStandaloneTargets();
  }
})(typeof window !== "undefined" ? window : this, document);
