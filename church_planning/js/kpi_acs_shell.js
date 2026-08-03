/**
 * KPI/OKR 對齊 · ACS 殼（12題快評 · 漏斗儀表 · 活體 SWOT/NCD 上游）
 */
(function (global) {
  "use strict";

  var lastRun = null;

  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }

  function showToast(msg) {
    var el = document.getElementById("kpi-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("kpi-toast--show");
    setTimeout(function () { el.classList.remove("kpi-toast--show"); }, 3200);
  }

  function switchTab(id, smooth) {
    if (global.B100AcsBoot && B100AcsBoot.switchTab) B100AcsBoot.switchTab(id);
    else if (global.StrategicHybridShell) StrategicHybridShell.switchTab(id);
    else if (global.__b100SwitchTab) __b100SwitchTab(id);
  }

  function switchToReport(smooth) {
    switchTab("report", smooth);
    setTimeout(function () {
      var panel = document.getElementById("strategic-tab-report");
      if (panel && panel.scrollIntoView) panel.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    }, smooth ? 120 : 40);
  }

  function renderUpstreamBanner() {
    var el = document.getElementById("kpi-upstream-banner");
    if (!el || !global.KpiPack) return;
    var chain = KpiPack.loadUpstreamChain();
    if (!chain.ok) {
      el.innerHTML =
        '<p class="text-sm text-amber-900">建議先完成 <a href="Church_Governance_SWOT_matrix.html" class="underline font-bold">戰略矩陣</a> 與 <a href="Church_Health_NCD_planning.html" class="underline font-bold">教會健康</a>；或點示範報告體驗漏斗。</p>';
      el.classList.remove("hidden");
      return;
    }
    var parts = [];
    if (chain.swot_primary) parts.push("戰略主軸 " + esc(chain.swot_primary));
    if (chain.ncd_minimum) parts.push("NCD「" + esc(chain.ncd_minimum.label) + "」");
    if (chain.culture_trust_breach >= 50) parts.push("文化信任破口 " + chain.culture_trust_breach);
    if (chain.has_8020_run) parts.push("已接 80/20 工作坊");
    el.innerHTML = '<p class="text-sm text-indigo-900"><strong>已連結上游：</strong>' + parts.join(" · ") + "</p>";
    el.classList.remove("hidden");
  }

  function renderQuickSurvey() {
    var host = document.getElementById("kpi-quick-survey-wrap");
    if (!host || !global.KpiPack) return;
    var lastSec = "";
    var html =
      '<h2 class="font-black text-indigo-900 text-lg mb-1">12 題 KPI/OKR 快評</h2>' +
      '<p class="text-sm text-slate-600 mb-3">約 12 分鐘 · 非人事考核 · 完成後前往【3. 對齊漏斗儀表】。</p>' +
      '<form id="kpi-quick-form" onsubmit="return KpiAcsShell.submitQuick(event)">' +
      '<label class="block text-sm font-bold mb-2">本季焦點<input name="focus_label" class="w-full mt-1 border rounded p-2" placeholder="2026 青年門訓"/></label>';
    KpiPack.QUESTIONS.forEach(function (q, i) {
      if (q.section && q.section !== lastSec) {
        lastSec = q.section;
        html += '<p class="text-xs font-black text-indigo-800 mt-4 mb-2 border-b pb-1">' + esc(q.section) + "</p>";
      }
      html +=
        '<fieldset class="acs-fieldset"><legend class="text-xs font-bold">第 ' + (i + 1) + "/12 題</legend><p class=\"text-sm mb-2\">" +
        esc(q.label) +
        '</p><div class="acs-likert-row">';
      for (var s = 1; s <= 5; s++) html += '<label><input type="radio" name="' + q.id + '" value="' + s + '" required> ' + s + "</label>";
      html += "</div></fieldset>";
    });
    html +=
      '<p id="kpi-quick-error" class="text-red-600 text-xs mt-2 hidden"></p>' +
      '<button type="submit" class="acs-btn acs-btn--primary mt-3 w-full py-3">✓ 提交 → 對齊漏斗儀表</button></form>';
    host.innerHTML = html;
  }

  function answersFromForm(form) {
    var map = {};
    KpiPack.QUESTIONS.forEach(function (q) {
      var el = form.querySelector('input[name="' + q.id + '"]:checked');
      if (el) map[q.id] = Number(el.value);
    });
    return map;
  }

  function renderReport(run, opts) {
    opts = opts || {};
    if (!run) return;
    lastRun = run;
    var content = document.getElementById("kpi-report-content");
    if (!content) return;
    content.classList.remove("hidden");
    var empty = document.getElementById("kpi-report-empty");
    if (empty) empty.classList.add("hidden");
    var badge = document.getElementById("kpi-report-demo-badge");
    if (badge) badge.classList.toggle("hidden", !run.is_demo);
    var banner = document.getElementById("kpi-report-banner");
    if (banner) {
      if (run.is_demo) {
        banner.innerHTML = '<p class="text-sm text-amber-900"><strong>示範模式</strong>：資源卡關示範 · 漏斗將動態展開</p>';
        banner.classList.remove("hidden");
      } else banner.classList.add("hidden");
    }
    var summary = document.getElementById("kpi-report-summary");
    if (summary && run.derived) {
      var d = run.derived;
      summary.innerHTML =
        "<p><strong>聖工健康度</strong> " + (d.pillar_health_score != null ? d.pillar_health_score : "—") +
        "/100 · <strong>資源卡關率</strong> " + (d.resource_stuck_rate != null ? d.resource_stuck_rate : 0) + "%</p>";
      if ((run.risk_flags || []).indexOf("RESOURCE_STUCK") >= 0) {
        summary.innerHTML +=
          '<p class="text-rose-800 font-bold mt-2">⚠️ 卡關率 ≥70%：請開啟 <a href="Church_Governance_8020_focus.html" class="underline">80/20 資源聚焦儀</a></p>';
      }
    }
    if (summary && global.AcsReportGold && AcsReportGold.mountAfterSummary) {
      AcsReportGold.mountAfterSummary(summary, run, "kpiokr");
    }
    var viz = document.getElementById("kpi-report-viz");
    if (viz && global.KpiFunnelViz) {
      viz.innerHTML = KpiFunnelViz.renderFunnelBlock(run.derived || {}, { animate: !!opts.animate });
      if (opts.animate) setTimeout(function () { KpiFunnelViz.animateFunnel(viz); }, opts.animateDelay || 200);
    }
    if (global.KpiPastoralDesk) KpiPastoralDesk.applyDeskState(run);
  }

  function loadDemoReport() {
    if (!global.KpiPack) { showToast("模組尚未載入"); return; }
    var built = KpiPack.buildDemoRun();
    if (!built.ok) { showToast("示範載入失敗"); return; }
    showToast("示範已載入 · 正在帶您到【3. 對齊漏斗儀表】…");
    switchToReport(true);
    setTimeout(function () {
      renderReport(built.run, { animate: true, animateDelay: 300 });
      var stuck = built.run.derived && built.run.derived.resource_stuck_rate;
      if (stuck >= 70) setTimeout(function () { showToast("資源卡關觸發 · 請查看【4. 忠心管家決策桌】"); }, 1600);
    }, 280);
  }

  function submitQuick(ev) {
    ev.preventDefault();
    var form = document.getElementById("kpi-quick-form");
    var err = document.getElementById("kpi-quick-error");
    if (!form || !global.KpiPack) return false;
    var built = KpiPack.buildRun(answersFromForm(form), {
      focus_label: form.focus_label && form.focus_label.value
    });
    if (!built.ok) {
      if (err) { err.textContent = (built.errors || []).join(" "); err.classList.remove("hidden"); }
      return false;
    }
    if (err) err.classList.add("hidden");
    if (global.AssessmentRunStore) AssessmentRunStore.saveRun(built.run);
    showToast("已儲存 · 前往對齊漏斗儀表");
    switchToReport(true);
    setTimeout(function () { renderReport(built.run, { animate: true, animateDelay: 200 }); }, 200);
    return false;
  }

  global.loadDemoReport = loadDemoReport;

  function init() {
    if (!global.KpiPack) {
      if (global.B100AcsBoot) B100AcsBoot.showBootError("KpiPack 未載入");
      return;
    }
    if (global.B100AcsBoot) B100AcsBoot.clearBootError();
    if (global.KpiPastoralDesk) KpiPastoralDesk.mountStaticDesk();
    renderUpstreamBanner();
    renderQuickSurvey();
    var latest = global.AssessmentRunStore && AssessmentRunStore.loadLatest("kpiokr");
    if (latest && !latest.is_demo) renderReport(latest, {});
  }

  global.KpiAcsShell = {
    init: init,
    submitQuick: submitQuick,
    loadDemoReport: loadDemoReport,
    renderReport: renderReport,
    switchTab: switchTab
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(typeof window !== "undefined" ? window : global);
