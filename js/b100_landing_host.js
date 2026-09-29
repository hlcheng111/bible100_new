/**
 * B100 Landing · 偵測宿主（Hub iframe / Standalone / file）並套用 chrome 規則
 */
(function (global, doc) {
  "use strict";

  function detectHost() {
    try {
      if (global.parent && global.parent !== global) {
        var pid = global.parent.document && global.parent.document.getElementById("contentFrame");
        if (pid) return "hub";
      }
    } catch (eHub) {}
    if (doc.getElementById("sidebarFrame") && doc.getElementById("contentFrame")) {
      return "standalone";
    }
    if (global.location.protocol === "file:") return "file";
    return "direct";
  }

  function bootInfographicFallback(img) {
    if (!img || img.getAttribute("data-b100-fallback") === "1") return;
    img.setAttribute("data-b100-fallback", "1");
    img.addEventListener("error", function onErr() {
      img.style.display = "none";
      var alt = img.getAttribute("data-b100-fallback-text");
      var box = doc.createElement("div");
      box.className = "b100-infographic b100-infographic--missing";
      box.textContent = alt || "（資訊圖放置於 docs/image_b100_site/）";
      if (img.parentNode) img.parentNode.insertBefore(box, img.nextSibling);
    });
  }

  function bootTabs(root) {
    root = root || doc;
    var bar = root.querySelector(".b100-landing-tabs");
    if (!bar) return;
    var buttons = bar.querySelectorAll("button[data-b100-tab]");
    var panels = root.querySelectorAll(".b100-tab-panel");

    function activate(id) {
      buttons.forEach(function (btn) {
        btn.classList.toggle("is-active", btn.getAttribute("data-b100-tab") === id);
      });
      panels.forEach(function (panel) {
        panel.classList.toggle("is-active", panel.getAttribute("data-b100-tab-panel") === id);
      });
      try {
        global.location.hash = "tab-" + id;
      } catch (eH) {}
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        activate(btn.getAttribute("data-b100-tab"));
      });
    });

    var hash = (global.location.hash || "").replace(/^#tab-/, "");
    if (hash && bar.querySelector('[data-b100-tab="' + hash + '"]')) {
      activate(hash);
    } else if (buttons.length) {
      activate(buttons[0].getAttribute("data-b100-tab"));
    }
  }

  function boot() {
    var host = detectHost();
    if (doc.body) doc.body.setAttribute("data-b100-host", host);
    if (host === "hub" && global.B100HubEmbed && global.B100HubEmbed.quietLandingDom) {
      global.B100HubEmbed.quietLandingDom();
    }
    doc.querySelectorAll(".b100-infographic[data-b100-img]").forEach(bootInfographicFallback);
    bootTabs(doc);
  }

  global.B100LandingHost = { detectHost: detectHost, bootTabs: bootTabs };

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(typeof window !== "undefined" ? window : this, document);
