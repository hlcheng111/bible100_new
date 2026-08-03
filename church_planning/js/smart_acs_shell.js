/**
 * 教會版 SMART · ACS 殼（15 題快評 · 漏斗 + PDCA 齒輪 · 活體 NCD/SWOT/KPI/culture 上游）
 */
(function (global) {
  "use strict";

  var lastRun = null;

  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }

  function showToast(msg) {
    var el = document.getElementById("smart-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("smart-toast--show");
    setTimeout(function () { el.classList.remove("smart-toast--show"); }, 3200);
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
    var el = document.getElementById("smart-upstream-banner");
    if (!el || !global.SmartPack) return;
    var chain = SmartPack.loadUpstreamChain();
    if (!chain.ok) {
      el.innerHTML =
        '<p class="text-sm text-amber-900">建議先完成 <a href="Church_Governance_SWOT_matrix.html" class="underline font-bold">戰略矩陣</a>、' +
        '<a href="Church_Governance_KPI_alignment.html" class="underline font-bold">KPI 對齊</a> 或 <a href="Church_Health_NCD_planning.html" class="underline font-bold">教會健康</a>；或點示範報告體驗漏斗。</p>';
      el.classList.remove("hidden");
      return;
    }
    var parts = [];
    if (chain.swot_primary) parts.push("戰略主軸 " + esc(chain.swot_primary));
    if (chain.ncd_minimum) parts.push("NCD「" + esc(chain.ncd_minimum.label) + "」");
    if (chain.kpi_health != null) parts.push("KPI 健康 " + chain.kpi_health);
    if (chain.culture_trust_breach >= 50) parts.push("文化信任破口 " + chain.culture_trust_breach);
    el.innerHTML = '<p class="text-sm text-emerald-900"><strong>已連結上游：</strong>' + parts.join(" · ") + "</p>";
    el.classList.remove("hidden");
  }

  function renderQuickSurvey() {
    var host = document.getElementById("smart-quick-survey-wrap");
    if (!host || !global.SmartPack) return;
    var lastSec = "";
    var html =
      '<h2 class="font-black text-emerald-900 text-lg mb-1">15 題 SMART+Care 快評</h2>' +
      '<p class="text-sm text-slate-600 mb-3">約 15 分鐘 · 一次評<strong>一個計畫</strong> · 非人事考核 · 完成後前往【3. 目標漏斗儀表】。</p>' +
      '<form id="smart-quick-form" onsubmit="return SmartAcsShell.submitQuick(event)">' +
      '<label class="block text-sm font-bold mb-2">計畫名稱<input name="plan_name" class="w-full mt-1 border rounded p-2" placeholder="探訪久未出席會友"/></label>' +
      '<label class="block text-sm font-bold mb-2">季別／試行期<input name="season_label" class="w-full mt-1 border rounded p-2" placeholder="2026 Q2"/></label>';
    SmartPack.QUESTIONS.forEach(function (q, i) {
      if (q.section && q.section !== lastSec) {
        lastSec = q.section;
        html += '<p class="text-xs font-black text-emerald-800 mt-4 mb-2 border-b pb-1">' + esc(q.section) + "</p>";
      }
      html +=
        '<fieldset class="acs-fieldset"><legend class="text-xs font-bold">第 ' + (i + 1) + "/15 題</legend><p class=\"text-sm mb-2\">" +
        esc(q.label) +
        '</p><div class="acs-likert-row">';
      for (var s = 1; s <= 5; s++) html += '<label><input type="radio" name="' + q.id + '" value="' + s + '" required> ' + s + "</label>";
      html += "</div></fieldset>";
    });
    html +=
      '<p id="smart-quick-error" class="text-red-600 text-xs mt-2 hidden"></p>' +
      '<button type="submit" class="acs-btn acs-btn--primary mt-3 w-full py-3">✓ 提交 → 目標漏斗儀表</button></form>';
    host.innerHTML = html;
  }

  function answersFromForm(form) {
    var map = {};
    SmartPack.QUESTIONS.forEach(function (q) {
      var el = form.querySelector('input[name="' + q.id + '"]:checked');
      if (el) map[q.id] = Number(el.value);
    });
    return map;
  }

  function renderFlags(run) {
    var zone = document.getElementById("smart-flags-zone");
    if (!zone) return;
    var flags = (run && run.risk_flags) || [];
    if (!flags.length) {
      zone.innerHTML = "<p>目前無明顯結構性預警；仍建議與牧者確認試行節奏。</p>";
      return;
    }
    zone.innerHTML =
      "<ul class=\"list-disc pl-4 space-y-1\">" +
      flags
        .map(function (f) {
          return "<li>" + esc((SmartPack.FLAG_DESCRIPTIONS && SmartPack.FLAG_DESCRIPTIONS[f]) || f) + "</li>";
        })
        .join("") +
      "</ul>";
  }

  function renderReport(run, opts) {
    opts = opts || {};
    if (!run) return;
    lastRun = run;
    var content = document.getElementById("smart-report-content");
    if (!content) return;
    content.classList.remove("hidden");
    var empty = document.getElementById("smart-report-empty");
    if (empty) empty.classList.add("hidden");
    var badge = document.getElementById("smart-report-demo-badge");
    if (badge) badge.classList.toggle("hidden", !run.is_demo);
    var banner = document.getElementById("smart-report-banner");
    if (banner) {
      if (run.is_demo) {
        banner.innerHTML =
          '<p class="text-sm text-amber-900"><strong>示範模式</strong>：對齊迷霧 + 負載偏高示範 · 漏斗將動態展開</p>';
        banner.classList.remove("hidden");
      } else banner.classList.add("hidden");
    }
    var summary = document.getElementById("smart-report-summary");
    if (summary && run.derived) {
      var d = run.derived;
      var p = run.profile || {};
      summary.innerHTML =
        "<p><strong>" +
        esc(p.plan_name || "未命名計畫") +
        "</strong>" +
        (p.season_label ? " · " + esc(p.season_label) : "") +
        "</p><p class=\"mt-1\">" +
        esc(d.metric_bridge || "—") +
        "</p>";
      if ((run.risk_flags || []).indexOf("LOAD_HIGH") >= 0) {
        summary.innerHTML +=
          '<p class="text-rose-800 font-bold mt-2">⚠️ 負載偏高：請開啟【4. SMART 守門決策桌】宣讀「加一砍一」模板</p>';
      }
    }
    if (summary && global.AcsReportGold && AcsReportGold.mountAfterSummary) {
      AcsReportGold.mountAfterSummary(summary, run, "smart");
    }
    var viz = document.getElementById("smart-report-viz");
    if (viz && global.SmartFunnelViz) {
      viz.innerHTML = SmartFunnelViz.renderDashboardBlock(run, { animate: !!opts.animate });
      if (opts.animate) setTimeout(function () { SmartFunnelViz.animateDashboard(viz); }, opts.animateDelay || 200);
    }
    renderFlags(run);
    if (global.SmartPastoralDesk) SmartPastoralDesk.applyDeskState(run);
  }

  function loadDemoReport() {
    if (!global.SmartPack) { showToast("模組尚未載入"); return; }
    var built = SmartPack.buildDemoRun();
    if (!built.ok) { showToast("示範載入失敗"); return; }
    showToast("示範已載入 · 正在帶您到【3. 目標漏斗儀表】…");
    switchToReport(true);
    setTimeout(function () {
      renderReport(built.run, { animate: true, animateDelay: 300 });
      if ((built.run.risk_flags || []).indexOf("LOAD_HIGH") >= 0) {
        setTimeout(function () { showToast("負載偏高 · 請查看【4. SMART 守門決策桌】"); }, 1600);
      }
    }, 280);
  }

  function submitQuick(ev) {
    ev.preventDefault();
    var form = document.getElementById("smart-quick-form");
    var err = document.getElementById("smart-quick-error");
    if (!form || !global.SmartPack) return false;
    var built = SmartPack.buildRun(answersFromForm(form), {
      plan_name: form.plan_name && form.plan_name.value,
      season_label: form.season_label && form.season_label.value
    });
    if (!built.ok) {
      if (err) { err.textContent = (built.errors || []).join(" "); err.classList.remove("hidden"); }
      return false;
    }
    if (err) err.classList.add("hidden");
    if (global.AssessmentRunStore) AssessmentRunStore.saveRun(built.run);
    showToast("已儲存 · 前往目標漏斗儀表");
    switchToReport(true);
    setTimeout(function () { renderReport(built.run, { animate: true, animateDelay: 200 }); }, 200);
    return false;
  }

  global.loadDemoReport = loadDemoReport;

  function init() {
    if (!global.SmartPack) {
      if (global.B100AcsBoot) B100AcsBoot.showBootError("SmartPack 未載入");
      return;
    }
    if (global.B100AcsBoot) B100AcsBoot.clearBootError();
    if (global.SmartPastoralDesk) SmartPastoralDesk.mountStaticDesk();
    renderUpstreamBanner();
    renderQuickSurvey();
    var latest = global.AssessmentRunStore && AssessmentRunStore.loadLatest("smart");
    if (latest && !latest.is_demo) renderReport(latest, {});
  }

  global.SmartAcsShell = {
    init: init,
    submitQuick: submitQuick,
    loadDemoReport: loadDemoReport,
    renderReport: renderReport,
    switchTab: switchTab
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(typeof window !== "undefined" ? window : global);
