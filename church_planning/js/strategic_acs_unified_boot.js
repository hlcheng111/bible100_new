/**
 * 戰略 ACS 頁 · file:// / iframe 保命 boot（須於其他 ACS 腳本之前載入）
 */
(function (global) {
  "use strict";

  var TAB_IDS = ["intro", "survey", "report", "methodology"];

  function switchTab(id) {
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
    try {
      if (global.StrategicHybridShell && typeof global.StrategicHybridShell.switchTab === "function") {
        global.StrategicHybridShell.switchTab(id);
      }
    } catch (e) { /* ignore */ }
  }

  function showBootError(msg) {
    var el = document.getElementById("acs-boot-error");
    if (!el) {
      el = document.createElement("div");
      el.id = "acs-boot-error";
      el.setAttribute("role", "alert");
      el.style.cssText =
        "position:fixed;top:0;left:0;right:0;z-index:9999;background:#7f1d1d;color:#fff;padding:10px 14px;font-size:13px;font-weight:700;";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.display = "block";
  }

  function clearBootError() {
    var el = document.getElementById("acs-boot-error");
    if (el) el.style.display = "none";
  }

  function bindTabButtons() {
    document.querySelectorAll("[data-strategic-tab]").forEach(function (btn) {
      if (btn.getAttribute("data-b100-tab-bound") === "1") return;
      btn.setAttribute("data-b100-tab-bound", "1");
      btn.addEventListener("click", function () {
        switchTab(btn.getAttribute("data-strategic-tab"));
      });
    });
  }

  function bindDemoButtons() {
    document.querySelectorAll("[data-b100-demo]").forEach(function (btn) {
      if (btn.getAttribute("data-b100-demo-bound") === "1") return;
      btn.setAttribute("data-b100-demo-bound", "1");
      btn.addEventListener("click", function (ev) {
        ev.preventDefault();
        if (typeof global.loadDemoReport === "function") {
          global.loadDemoReport();
        } else {
          showBootError("示範模組尚未載入，請重新整理；若仍失敗請用 HTTP 開啟本頁。");
        }
      });
    });
  }

  function showDefaultTab() {
    var def = (document.body && document.body.getAttribute("data-strategic-default")) || "intro";
    if (TAB_IDS.indexOf(def) < 0) def = "intro";
    switchTab(def);
  }

  function verifyDeps(toolKey) {
    var map = {
      culture: function () { return global.CulturePack && global.CultureAcsShell; },
      kpi: function () { return global.KpiPack && global.KpiAcsShell; },
      "8020": function () { return global.EightytwentyPack && global.EightytwentyAcsShell; },
      smart: function () { return global.SmartPack && global.SmartAcsShell; },
      urgent: function () { return global.UrgencyPack && global.UrgencyAcsShell; },
      spiritual: function () { return global.SpiritualPack && global.SpiritualAcsShell; },
      pastoral: function () { return global.PastoralPack && global.PastoralAcsShell; }
    };
    var fn = map[toolKey];
    if (fn && !fn()) {
      showBootError("腳本載入不完整（" + toolKey + "），請確認以 church_planning/ 內 HTML 開啟，或執行本地 HTTP 伺服器。");
      return false;
    }
    clearBootError();
    return true;
  }

  function initPage(toolKey) {
    showDefaultTab();
    bindTabButtons();
    bindDemoButtons();
    if (toolKey) verifyDeps(toolKey);
  }

  global.B100AcsBoot = {
    TAB_IDS: TAB_IDS,
    switchTab: switchTab,
    showBootError: showBootError,
    clearBootError: clearBootError,
    bindTabButtons: bindTabButtons,
    bindDemoButtons: bindDemoButtons,
    showDefaultTab: showDefaultTab,
    verifyDeps: verifyDeps,
    initPage: initPage
  };

  global.__b100SwitchTab = switchTab;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      bindTabButtons();
      bindDemoButtons();
      showDefaultTab();
    });
  } else {
    bindTabButtons();
    bindDemoButtons();
    showDefaultTab();
  }
})(typeof window !== "undefined" ? window : this);
