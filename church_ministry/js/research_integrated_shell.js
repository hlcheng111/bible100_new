/**
 * F 區研究統計 · 整合 Tab 殼（F-09～F-13 收斂）
 */
(function (global, doc) {
  "use strict";

  var TAB_SRC = {
    overview: "index.html",
    members: "member-statistics.html",
    ministry: "ministry-performance.html",
    growth: "growth-trends.html",
    engagement: "engagement-analysis.html"
  };

  function $(id) {
    return doc.getElementById(id);
  }

  function bust(url) {
    return url + (url.indexOf("?") >= 0 ? "&" : "?") + "v=" + Date.now();
  }

  function switchTab(tab) {
    if (!TAB_SRC[tab]) tab = "overview";
    var frame = $("res-integrated-subframe");
    if (frame) frame.src = bust(TAB_SRC[tab]);
    doc.querySelectorAll(".res-shell-tab").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tab);
    });
    try {
      global.location.hash = "tab-" + tab;
    } catch (e) {}
  }

  function resolveInitialTab() {
    var hash = (global.location.hash || "").replace("#tab-", "");
    return TAB_SRC[hash] ? hash : "overview";
  }

  function init() {
    doc.querySelectorAll(".res-shell-tab").forEach(function (btn) {
      btn.onclick = function () {
        switchTab(btn.getAttribute("data-tab"));
      };
    });
    switchTab(resolveInitialTab());
  }

  global.ResearchIntegratedShell = { switchTab: switchTab };

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
  else init();
})(window, document);
