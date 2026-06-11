/**
 * church_ministry/index.html · Standalone 雙欄殼 relay + focus=c
 */
(function (w, doc) {
  "use strict";

  var P = w.CmShellPaths;
  var EDU_SIDEBAR = "sidebar_c_education_journey.html";
  var EDU_CONTENT =
    "modules/education/education-integrated.html?crm_from=cm_index&role=teacher#tab-guide";

  function bust(url) {
    return P && P.bust ? P.bust(url) : url;
  }

  function resolve(url) {
    return P && P.resolveShellUrl ? P.resolveShellUrl(url) : url;
  }

  function absIframeSrc(url) {
    if (!url) return url;
    var r = resolve(url);
    if (/^https?:\/\//i.test(r) || String(r).indexOf("file:") === 0) return r;
    try {
      return new URL(r, w.location.href).href;
    } catch (eA) {
      return r;
    }
  }

  function applyShell(sidebarUrl, contentUrl) {
    var sb = doc.getElementById("sidebarFrame");
    var cf = doc.getElementById("contentFrame");
    if (sb && sidebarUrl) sb.src = bust(absIframeSrc(sidebarUrl));
    if (cf && contentUrl) cf.src = bust(absIframeSrc(contentUrl));
  }

  function applyFocusFromQuery() {
    var focus = "";
    try {
      focus = (new URLSearchParams(w.location.search || "").get("focus") || "").toLowerCase();
    } catch (eF) {}
    if (focus === "c") {
      applyShell(EDU_SIDEBAR, EDU_CONTENT);
      return true;
    }
    if (focus === "b") {
      applyShell(
        "sidebar_pastoral_journey.html",
        "modules/support/visitation_index.html?crm_from=cm_index"
      );
      return true;
    }
    if (focus === "a") {
      applyShell("sidebar_worship_journey.html", "_landing/worship.html?crm_from=cm_index");
      return true;
    }
    return false;
  }

  function bindTopbar() {
    var map = {
      "btn-focus-dash": { sb: "sidebar_church_layout_v1.html", cf: "dashboard_church_layout_v1.html" },
      "btn-focus-c": { sb: EDU_SIDEBAR, cf: EDU_CONTENT },
      "btn-focus-crm": {
        sb: "sidebar_crm_journey.html",
        cf: "guide_crm_journey_hub.html?tab=journey&role=teacher"
      },
      "btn-focus-tools": { sb: "sidebar.html", cf: "dashboard.html" }
    };
    Object.keys(map).forEach(function (id) {
      var btn = doc.getElementById(id);
      if (!btn) return;
      btn.addEventListener("click", function (ev) {
        if (ev.preventDefault) ev.preventDefault();
        applyShell(map[id].sb, map[id].cf);
      });
    });
  }

  function bindRelay() {
    w.addEventListener("message", function (event) {
      var d = event.data;
      if (!d) return;
      if (w.parent && w.parent !== w) {
        w.parent.postMessage(d, "*");
        return;
      }
      if (d.type === "navigate" && d.url) {
        var cf = doc.getElementById("contentFrame");
        if (!cf) return;
        var u = d.url;
        if (/^https?:\/\//i.test(u) || String(u).indexOf("file:") === 0) {
          cf.src = bust(u);
        } else {
          cf.src = bust(resolve(u));
        }
        return;
      }
      if (d.type === "bible100-shell") {
        applyShell(d.sidebarUrl, d.contentUrl);
      }
    });
  }

  function bindHubMode() {
    if (w.B100HubDetect && w.B100HubDetect.isInSiteHub && w.B100HubDetect.isInSiteHub()) {
      doc.body.classList.add("b100-hub-embedded");
      var tb = doc.getElementById("cmTopbar");
      if (tb) tb.style.display = "none";
    }
  }

  function init() {
    bindRelay();
    bindTopbar();
    bindHubMode();
    if (!applyFocusFromQuery()) {
      /* 預設：A/B/C/D 側欄 + 事工儀表板 */
    }
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
  else init();
})(window, document);
