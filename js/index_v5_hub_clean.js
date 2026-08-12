/**
 * @deprecated 20260811w3 — 已撤销「顶栏去英文」。保留空壳以免旧缓存 404。
 * 双语细字请用 css/b100_label.css + index_v5 mkSubNavBtn / mode-btn .t-en
 */
(function (global, doc) {
  "use strict";
  var CLEAN_BUILD = "20260812data";
  global.IndexV5HubClean = {
    CLEAN_BUILD: CLEAN_BUILD,
    stripEnLabels: function () {},
    boot: function () {
      doc.documentElement.setAttribute("data-index-v5-hub-clean", CLEAN_BUILD);
    },
  };
  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", global.IndexV5HubClean.boot);
  } else {
    global.IndexV5HubClean.boot();
  }
})(typeof window !== "undefined" ? window : this, document);
