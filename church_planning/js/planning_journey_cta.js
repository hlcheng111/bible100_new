/**
 * 量表填完 · 報告 Tab 底部固定 CTA（戰情室／儀表板）
 */
(function (global) {
  "use strict";

  function injectReportCta(toolId) {
    var panel = document.getElementById("strategic-tab-report");
    if (!panel || panel.querySelector(".planning-journey-cta")) return;

    var cfg = global.PlanningPhaseConfig;
    var cta = cfg && cfg.postCompleteCta ? cfg.postCompleteCta(toolId) : { warRoom: true };
    var html =
      '<div class="planning-journey-cta">' +
      "<p><strong>✅ 填完了，下一步？</strong> 這是對話的起點，不是考核排名。請與牧者禱告、面談後再作決定。</p>" +
      '<div class="planning-journey-cta__actions">';
    if (cta.warRoom !== false) {
      html +=
        '<a href="#" class="pp-btn pp-btn--primary" onclick="return planningOpenContent(event,\'cta-os-war-room.html\');">' +
        (cta.label || "→ 回健康雷達戰情室看六維結果") +
        "</a> ";
    }
    html +=
      '<a href="#" class="pp-btn" onclick="return planningOpenContent(event,\'assessment-os-hub.html\');">📋 健康診斷中心</a>';
    if (cta.dashboard) {
      html +=
        ' <a href="#" class="pp-btn" onclick="return planningOpenContent(event,\'dashboard.html\');">📈 戰情數據盤</a>';
    }
    if (cta.matchmaker) {
      html +=
        ' <a href="#" class="pp-btn" onclick="return planningOpenRoot(event,\'church_planning/ministry-position-matchmaker.html\');">🟢 事奉媒合中心</a>';
    }
    html += "</div></div>";

    var wrap = document.createElement("div");
    wrap.innerHTML = html;
    panel.appendChild(wrap.firstChild);
  }

  function hookInitPage() {
    var boot = global.B100AcsBoot;
    if (!boot || boot.__journeyCtaHooked) return;
    var orig = boot.initPage;
    boot.initPage = function (toolKey) {
      if (typeof orig === "function") orig(toolKey);
      if (toolKey) injectReportCta(toolKey);
    };
    boot.__journeyCtaHooked = true;
  }

  global.PlanningJourneyCta = {
    injectReportCta: injectReportCta,
    hookInitPage: hookInitPage
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hookInitPage);
  } else {
    hookInitPage();
  }
})(typeof window !== "undefined" ? window : this);
