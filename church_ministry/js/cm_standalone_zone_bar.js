/**
 * CM Standalone · 顶栏 A–G（与 index_v5 顶栏2 同款 sub-btn）
 */
(function (global, doc) {
  "use strict";

  var BAR_BUILD = "20260811e";

  function applyZone(zone) {
    var shell = global.CmIndexShell;
    var R = global.CmZoneLandingRegistry;
    if (!shell || !zone) return;
    var urls = R && R.cmRelativeUrls ? R.cmRelativeUrls(zone) : null;
    if (!urls) return;
    if (urls.moduleNav && zone.id !== "f" && zone.id !== "g") {
      shell.applyShell(urls.moduleNav.sidebar, urls.moduleNav.content);
      return;
    }
    shell.applyShell(urls.sidebarUrl, urls.contentUrl);
  }

  function renderBar(host) {
    var Nav = global.CmZoneNavSsot;
    var R = global.CmZoneLandingRegistry;
    if (!host || !Nav) return;
    var html = "";
    Nav.ZONES.forEach(function (z) {
      if (z.id === "gateway") return;
      html +=
        '<button type="button" class="sub-btn sub-btn--compact" data-zone="' +
        z.id +
        '" title="' +
        (z.labelEn || z.labelZh) +
        '"><span class="t-zh">' +
        z.labelShort +
        " " +
        z.labelZh.replace(/^[A-G]\s*/, "") +
        "</span></button>";
    });
    html +=
      '<button type="button" class="sub-btn sub-btn--compact" data-zone="gateway" title="Gateway"><span class="t-zh">總覽</span></button>';
    host.innerHTML = html;
    host.setAttribute("data-cm-zone-bar", BAR_BUILD);
    host.querySelectorAll(".sub-btn[data-zone]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-zone");
        if (id === "gateway") {
          global.CmIndexShell.applyShell(
            "sidebar_church_layout_v1.html",
            "_landing/gateway.html"
          );
        } else {
          var z = R ? R.zoneById(id) : null;
          applyZone(z);
        }
        host.querySelectorAll(".sub-btn[data-zone]").forEach(function (b) {
          b.classList.toggle("on", b === btn);
        });
      });
    });
  }

  function syncTopOffset() {
    var wrap = doc.getElementById("cmTopWrap");
    if (!wrap) return;
    doc.documentElement.style.setProperty("--cm-top-offset", wrap.offsetHeight + "px");
  }

  function boot() {
    if (!global.CmZoneNavSsot || !global.CmIndexShell) {
      global.setTimeout(boot, 40);
      return;
    }
    if (!global.CmZoneLandingRegistry) {
      global.setTimeout(boot, 40);
      return;
    }
    renderBar(doc.getElementById("cmZoneBar"));
    syncTopOffset();
    global.addEventListener("resize", syncTopOffset);
  }

  global.CmStandaloneZoneBar = { BAR_BUILD: BAR_BUILD, boot: boot, applyZone: applyZone };

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : this, document);
