/**
 * 戰略工具混合殼 · 4-Tab 切換（Tab ①④ 須在 HTML 硬寫）
 */
(function (global) {
  "use strict";

  var TAB_IDS = ["intro", "survey", "report", "methodology"];

  function switchStrategicTab(id) {
    if (TAB_IDS.indexOf(id) < 0) return;
    TAB_IDS.forEach(function (k) {
      var panel = document.getElementById("strategic-tab-" + k);
      if (panel) panel.classList.toggle("hidden", k !== id);
    });
    document.querySelectorAll("[data-strategic-tab]").forEach(function (btn) {
      var on = btn.getAttribute("data-strategic-tab") === id;
      btn.classList.toggle("strategic-tab-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    if (id === "survey" && global.StrategicToolBridge && StrategicToolBridge.ncdMinimumFactor) {
      var banner = document.getElementById("ncd-prefill-banner");
      if (banner) {
        var min = StrategicToolBridge.ncdMinimumFactor();
        if (min) {
          banner.hidden = false;
          banner.innerHTML =
            "<strong>NCD 破口已接通</strong>：最小因子「" +
            min.label +
            "」— 深度工作坊將嘗試預填 SWOT 劣勢欄。";
        } else {
          banner.hidden = true;
        }
      }
    }
  }

  function bindStrategicTabs() {
    document.querySelectorAll("[data-strategic-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        switchStrategicTab(btn.getAttribute("data-strategic-tab"));
      });
    });
    var hash = (location.hash || "").replace(/^#/, "");
    if (hash && TAB_IDS.indexOf(hash) >= 0) {
      switchStrategicTab(hash);
    } else {
      var def = (document.body && document.body.getAttribute("data-strategic-default")) || "intro";
      if (TAB_IDS.indexOf(def) >= 0) switchStrategicTab(def);
      else switchStrategicTab("intro");
    }
  }

  global.StrategicHybridShell = {
    switchTab: switchStrategicTab,
    bind: bindStrategicTabs
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindStrategicTabs);
  } else {
    bindStrategicTabs();
  }
})(typeof window !== "undefined" ? window : global);
