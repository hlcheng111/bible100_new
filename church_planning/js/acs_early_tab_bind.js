/**
 * 第一屏 Tab 切換（coaching_desk.init 前即可點擊）
 */
(function () {
  "use strict";

  function fallbackSwitch(id) {
    ["intro", "survey", "report", "coaching"].forEach(function (k) {
      var p = document.getElementById("tab-" + k);
      if (p) p.classList.toggle("hidden", k !== id);
    });
    document.querySelectorAll("[data-acs-tab]").forEach(function (b) {
      var on = b.getAttribute("data-acs-tab") === id;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  function bind() {
    document.querySelectorAll("[data-acs-tab]").forEach(function (btn) {
      if (btn.getAttribute("data-acs-early-bound") === "true") return;
      btn.setAttribute("data-acs-early-bound", "true");
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-acs-tab");
        if (typeof window.switchTab === "function") window.switchTab(id);
        else fallbackSwitch(id);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
