/**
 * index_v5 Hub 减噪补丁（外置以便 file:// F5 仍加载新版）
 * - 繁中/英文介面：模式钮与 compact 顶栏2 去掉英文副标
 * - 监听顶栏重绘后再次清理
 */
(function (global, doc) {
  "use strict";

  var CLEAN_BUILD = "20260812clean";

  function getLoc() {
    if (global.B100ChromeI18n && global.B100ChromeI18n.getLocale) {
      return global.B100ChromeI18n.getLocale();
    }
    try {
      return global.localStorage.getItem("b100_ui_locale") || "zh-Hant";
    } catch (e) {
      return "zh-Hant";
    }
  }

  function shouldStripEn() {
    var loc = getLoc();
    return loc !== "vi" && loc !== "id";
  }

  function stripEnLabels(root) {
    if (!shouldStripEn()) return;
    root = root || doc;
    root.querySelectorAll(".mode-btn .t-en").forEach(function (el) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
    root.querySelectorAll(".sub-btn--compact .t-en").forEach(function (el) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
  }

  function observeChrome() {
    var hosts = ["modeButtonsHost", "contextBar"];
    hosts.forEach(function (id) {
      var node = doc.getElementById(id);
      if (!node || node.getAttribute("data-b100-clean-obs") === "1") return;
      node.setAttribute("data-b100-clean-obs", "1");
      try {
        var obs = new MutationObserver(function () {
          stripEnLabels(node.parentNode || doc);
        });
        obs.observe(node, { childList: true, subtree: true });
      } catch (eObs) {}
    });
  }

  function patchLocaleChange() {
    var prev = global.B100ChromeI18nOnChange;
    global.B100ChromeI18nOnChange = function () {
      if (typeof prev === "function") prev();
      global.setTimeout(function () {
        stripEnLabels(doc);
      }, 0);
    };
  }

  function boot() {
    doc.documentElement.setAttribute("data-index-v5-hub-clean", CLEAN_BUILD);
    stripEnLabels(doc);
    observeChrome();
    patchLocaleChange();
    global.setTimeout(function () {
      stripEnLabels(doc);
    }, 300);
    global.setTimeout(function () {
      stripEnLabels(doc);
    }, 1200);
  }

  global.IndexV5HubClean = {
    CLEAN_BUILD: CLEAN_BUILD,
    stripEnLabels: stripEnLabels,
    boot: boot,
  };

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(typeof window !== "undefined" ? window : this, document);
