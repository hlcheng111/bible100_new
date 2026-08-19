/**
 * Hub Base · 頁面層級標籤（Phase 3b）
 * data-b100-page-tier="canonical|transitional|demo"
 * demo 頁自動注入紅色 DEMO 橫幅（除非 ?dev=1 且 data-b100-demo-quiet=1）
 */
(function (global) {
  "use strict";

  var DEMO_PATHS = [
    /talent_pool_demo\.html/i,
    /export_talent_stats_demo\.html/i,
    /matching_demo\.js/i,
    /demo_gift_fixtures/i,
    /\/console\.html$/i,
    /ai_matching\.html/i,
    /ai_team_optimizer\.html/i,
    /ai_performance_analyzer\.html/i,
  ];

  function isDemoPath(path) {
    path = path || (global.location && global.location.pathname) || "";
    return DEMO_PATHS.some(function (re) {
      return re.test(path);
    });
  }

  function tierFromBody() {
    var b = global.document && global.document.body;
    if (!b) return "";
    return String(b.getAttribute("data-b100-page-tier") || "").trim();
  }

  function injectBanner(html, className) {
    if (!global.document || !global.document.body) return;
    if (global.document.getElementById("b100-hub-page-badge")) return;
    var bar = global.document.createElement("div");
    bar.id = "b100-hub-page-badge";
    bar.className = className || "b100-page-badge";
    bar.innerHTML = html;
    bar.setAttribute("role", "note");
    global.document.body.insertBefore(bar, global.document.body.firstChild);
    if (!global.document.getElementById("b100-hub-page-badge-style")) {
      var st = global.document.createElement("style");
      st.id = "b100-hub-page-badge-style";
      st.textContent =
        ".b100-page-badge{position:sticky;top:0;z-index:9999;padding:8px 14px;font-size:12px;line-height:1.45;font-family:'Noto Sans TC','Microsoft YaHei',sans-serif}" +
        ".b100-page-badge--demo{background:#fef2f2;border-bottom:2px solid #dc2626;color:#991b1b;font-weight:700}" +
        ".b100-page-badge--transitional{background:#fffbeb;border-bottom:2px solid #f59e0b;color:#92400e}" +
        ".b100-page-badge--canonical{background:#ecfdf5;border-bottom:1px solid #86efac;color:#065f46;font-size:11px}" +
        ".b100-page-badge a{color:inherit;font-weight:700;margin-left:8px}";
      global.document.head.appendChild(st);
    }
  }

  function init() {
    var tier = tierFromBody();
    var demo = tier === "demo" || isDemoPath();
    var q = "";
    try {
      q = new URLSearchParams(global.location.search || "").get("dev");
    } catch (e) {}

    if (demo) {
      injectBanner(
        "⛔ DEMO 僅示範 · 資料<strong>不進</strong>正式 Hub 底座 · 請用主線配對工作台" +
          ' <a href="../hub-audit-viewer.html" target="_blank">審計檢視</a>',
        "b100-page-badge b100-page-badge--demo"
      );
      return;
    }
    if (tier === "transitional") {
      injectBanner(
        "⚠️ 過渡頁 · 部分寫入尚未完全接入 Hub Base · 專家巡查用",
        "b100-page-badge b100-page-badge--transitional"
      );
      return;
    }
    if (tier === "canonical") {
      injectBanner("✅ Hub-canonical · 寫入經 Hub Base / canonical API", "b100-page-badge b100-page-badge--canonical");
    }
  }

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  global.HubPageBadge = { init: init, isDemoPath: isDemoPath };
})(typeof window !== "undefined" ? window : global);
