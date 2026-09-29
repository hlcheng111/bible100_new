/**
 * D 區外展工作桌 · 3 Tab 殼
 */
(function (global, doc) {
  "use strict";

  var TAB_SRC = {
    needs: "outreach-strategy.html",
    followup: "outreach_followup.html",
    community: "community-assessment.html"
  };

  function $(id) {
    return doc.getElementById(id);
  }

  function bust(url) {
    if (!url) return url;
    return url + (url.indexOf("?") >= 0 ? "&" : "?") + "v=" + Date.now();
  }

  function buildFrameSrc(tab) {
    var base = TAB_SRC[tab] || TAB_SRC.needs;
    var q = [];
    try {
      var sp = new URLSearchParams(global.location.search || "");
      var crm = sp.get("crm_from");
      if (crm) q.push("crm_from=" + encodeURIComponent(crm));
    } catch (e) {}
    return base + (q.length ? "?" + q.join("&") : "");
  }

  function setTabActive(tab) {
    doc.querySelectorAll(".out-shell-tab").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tab);
    });
  }

  function switchTab(tab) {
    if (!TAB_SRC[tab]) tab = "needs";
    var frame = $("out-integrated-subframe");
    if (frame) frame.src = bust(buildFrameSrc(tab));
    setTabActive(tab);
    try {
      global.location.hash = "tab-" + tab;
    } catch (eH) {}
  }

  function resolveInitialTab() {
    var hash = (global.location.hash || "").replace("#tab-", "");
    if (TAB_SRC[hash]) return hash;
    return "needs";
  }

  function init() {
    doc.querySelectorAll(".out-shell-tab").forEach(function (btn) {
      btn.onclick = function () {
        switchTab(btn.getAttribute("data-tab"));
      };
    });
    switchTab(resolveInitialTab());
  }

  global.OutreachIntegratedShell = { switchTab: switchTab };

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
  else init();
})(window, document);
