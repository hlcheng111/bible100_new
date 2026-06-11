/**
 * Hub 嵌入 vs Standalone 身分感知（子頁可隱藏重複頂欄）
 */
(function (w, doc) {
  "use strict";

  function isInSiteHub() {
    try {
      if (w.self === w.top) return false;
      var cur = w;
      for (var i = 0; i < 8 && cur; i++) {
        try {
          if (cur.document) {
            var sb = cur.document.getElementById("sidebarFrame");
            var cf = cur.document.getElementById("contentFrame");
            if (sb && cf) return true;
          }
        } catch (eDoc) {}
        try {
          if (!cur.parent || cur.parent === cur) break;
          cur = cur.parent;
        } catch (eUp) {
          break;
        }
      }
    } catch (e) {}
    return w.self !== w.top;
  }

  function apply() {
    if (!doc.body) return;
    if (isInSiteHub()) {
      doc.body.classList.add("b100-hub-embedded");
      doc.body.classList.remove("b100-standalone");
    } else {
      doc.body.classList.add("b100-standalone");
      doc.body.classList.remove("b100-hub-embedded");
    }
  }

  w.B100HubDetect = { isInSiteHub: isInSiteHub, apply: apply };

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", apply);
  else apply();
})(typeof window !== "undefined" ? window : this, document);
