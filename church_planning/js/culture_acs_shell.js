/**
 * 文化契合度 · ACS 殼（24題快評 · CVAM 雷達 · 活體 NCD 上游）
 */
(function (global) {
  "use strict";

  var lastRun = null;

  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }

  function showToast(msg) {
    var el = document.getElementById("culture-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("culture-toast--show");
    setTimeout(function () { el.classList.remove("culture-toast--show"); }, 3200);
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
    var el = document.getElementById("culture-upstream-banner");
    if (!el || !global.CulturePack) return;
    var chain = CulturePack.loadUpstreamChain();
    if (!chain.ok) {
      el.innerHTML =
        '<p class="text-sm text-amber-900">尚未連結 <a href="Church_Health_NCD_planning.html" class="underline font-bold">教會健康</a> 資料。可先完成 NCD，或點「先看示範報告」體驗雷達。</p>';
      el.classList.remove("hidden");
      return;
    }
    var parts = [];
    if (chain.ncd_minimum) parts.push("NCD 破口「" + esc(chain.ncd_minimum.label) + "」");
    if (chain.ncd_relation_focus) parts.push(esc(chain.ncd_relation_focus));
    if (chain.swot_primary) parts.push("戰略主軸 " + esc(chain.swot_primary));
    el.innerHTML = '<p class="text-sm text-violet-900"><strong>已連結上游：</strong>' + parts.join(" · ") + "</p>";
    el.classList.remove("hidden");
  }

  function likertLbl(s) {
    return global.AcsSurveyStandard ? AcsSurveyStandard.likertLabel(s, "agree") : String(s);
  }

  function renderQuickSurvey() {
    var host = document.getElementById("culture-quick-survey-wrap");
    if (!host || !global.CulturePack) return;
    var lastSec = "";
    var legend = global.AcsSurveyStandard ? AcsSurveyStandard.likertLegendHtml("agree") : "";
    var html =
      '<h2 class="font-black text-violet-900 text-lg mb-1">24 題文化契合快評</h2>' +
      '<p class="text-sm text-slate-600 mb-2">約 20 分鐘 · 完成後將帶您到【3. 文化雷達儀表】。</p>' +
      legend +
      '<form id="culture-quick-form" onsubmit="return CultureAcsShell.submitQuick(event)">' +
      '<label class="block text-sm font-bold mb-2">教會／團隊標籤<input name="church_label" class="w-full mt-1 border rounded p-2" placeholder="某某教會長執團隊"/></label>';
    CulturePack.QUESTIONS.forEach(function (q, i) {
      if (q.section && q.section !== lastSec) {
        lastSec = q.section;
        html += '<p class="text-xs font-black text-violet-800 mt-4 mb-2 border-b pb-1">' + esc(q.section) + "</p>";
      }
      html +=
        '<fieldset class="acs-fieldset"><legend class="text-xs font-bold">第 ' + (i + 1) + "/24 題</legend><p class=\"text-sm mb-2\">" +
        esc(q.label) +
        '</p><div class="acs-likert-row acs-likert-row--anchored">';
      for (var s = 1; s <= 5; s++) {
        html += '<label><input type="radio" name="' + q.id + '" value="' + s + '" required> ' + likertLbl(s) + "</label>";
      }
      html += "</div></fieldset>";
    });
    html +=
      '<p id="culture-quick-error" class="text-red-600 text-xs mt-2 hidden"></p>' +
      (global.AcsSurveyStandard
        ? AcsSurveyStandard.submitButtonHtml("→ Tab ③ 文化雷達儀表")
        : '<button type="submit" class="acs-btn acs-btn--primary mt-3 w-full py-3">提交並生成報告</button>') +
      "</form>";
    host.innerHTML = html;
  }

  function answersFromForm(form) {
    var map = {};
    CulturePack.QUESTIONS.forEach(function (q) {
      var el = form.querySelector('input[name="' + q.id + '"]:checked');
      if (el) map[q.id] = Number(el.value);
    });
    return map;
  }

  function renderReport(run, opts) {
    opts = opts || {};
    if (!run) return;
    lastRun = run;
    var content = document.getElementById("culture-report-content");
    if (!content) return;
    content.classList.remove("hidden");
    var empty = document.getElementById("culture-report-empty");
    if (empty) empty.classList.add("hidden");
    var badge = document.getElementById("culture-report-demo-badge");
    if (badge) badge.classList.toggle("hidden", !run.is_demo);
    var banner = document.getElementById("culture-report-banner");
    if (banner) {
      if (run.is_demo) {
        banner.innerHTML = '<p class="text-sm text-amber-900"><strong>示範模式</strong>：信任破口示範 · 雷達將動態展開</p>';
        banner.classList.remove("hidden");
      } else banner.classList.add("hidden");
    }
    var summary = document.getElementById("culture-report-summary");
    if (summary) {
      var d = run.derived || {};
      summary.innerHTML =
        "<p><strong>文化共鳴</strong> " + (d.culture_resonance_score != null ? d.culture_resonance_score : "—") +
        "/100 · <strong>偏離 Cv</strong> " + (d.culture_deviation_cv != null ? d.culture_deviation_cv : "—") +
        " · <strong>信任破口</strong> " + (d.trust_breach_score != null ? d.trust_breach_score : 0) + "/100</p>";
      if ((run.risk_flags || []).indexOf("TRUST_BREACH") >= 0) {
        summary.innerHTML += '<p class="text-rose-800 font-bold mt-2">⚠️ 團隊信任 &lt;3.0：建議優先 NCD「相親相愛的關係」，再推五年擴建。</p>';
      }
    }
    if (summary && global.AcsReportGold && AcsReportGold.mountAfterSummary) {
      AcsReportGold.mountAfterSummary(summary, run, "culture");
    }
    var viz = document.getElementById("culture-report-viz");
    if (viz && global.CultureRadarViz) {
      viz.innerHTML = CultureRadarViz.renderRadarBlock(run.derived || {}, { animate: !!opts.animate });
      if (opts.animate) setTimeout(function () { CultureRadarViz.animateRadar(viz); }, opts.animateDelay || 200);
    }
    var flags = document.getElementById("culture-report-flags");
    if (flags && global.CulturePack) {
      var fh = (run.risk_flags || [])
        .map(function (f) { return "<li><strong>" + f + "</strong>：" + esc(CulturePack.FLAG_DESCRIPTIONS[f] || "") + "</li>"; })
        .join("");
      flags.innerHTML = fh ? "<ul class='text-sm space-y-1'>" + fh + "</ul>" : "";
    }
    if (global.CulturePastoralDesk) CulturePastoralDesk.applyDeskState(run);
  }

  function loadDemoReport() {
    if (!global.CulturePack) {
      showToast("模組尚未載入");
      if (global.B100AcsBoot) B100AcsBoot.showBootError("culture_pack 未載入 — 請檢查 js/tool_packs/culture_pack.js");
      return;
    }
    var built = CulturePack.buildDemoRun();
    if (!built.ok) { showToast("示範載入失敗"); return; }
    showToast("示範已載入 · 正在帶您到【3. 文化雷達儀表】…");
    switchToReport(true);
    setTimeout(function () {
      renderReport(built.run, { animate: true, animateDelay: 300 });
      if ((built.run.risk_flags || []).indexOf("TRUST_BREACH") >= 0) {
        setTimeout(function () { showToast("信任破口觸發 · 請查看【4. 文化重建長執會】"); }, 1600);
      }
    }, 280);
  }

  function submitQuick(ev) {
    ev.preventDefault();
    var form = document.getElementById("culture-quick-form");
    var err = document.getElementById("culture-quick-error");
    if (!form || !global.CulturePack) return false;
    var built = CulturePack.buildRun(answersFromForm(form), {
      church_label: form.church_label && form.church_label.value
    });
    if (!built.ok) {
      if (err) { err.textContent = (built.errors || []).join(" "); err.classList.remove("hidden"); }
      return false;
    }
    if (err) err.classList.add("hidden");
    if (global.AssessmentRunStore) AssessmentRunStore.saveRun(built.run);
    showToast("已儲存 · 前往文化雷達儀表");
    switchToReport(true);
    setTimeout(function () { renderReport(built.run, { animate: true, animateDelay: 200 }); }, 200);
    return false;
  }

  global.loadDemoReport = loadDemoReport;

  function init() {
    if (!global.CulturePack) {
      if (global.B100AcsBoot) B100AcsBoot.showBootError("CulturePack 未載入");
      return;
    }
    if (global.B100AcsBoot) B100AcsBoot.clearBootError();
    if (global.CulturePastoralDesk) CulturePastoralDesk.mountStaticDesk();
    renderUpstreamBanner();
    renderQuickSurvey();
    var latest = global.AssessmentRunStore && AssessmentRunStore.loadLatest("culture");
    if (latest && !latest.is_demo) renderReport(latest, {});
  }

  global.CultureAcsShell = {
    init: init,
    submitQuick: submitQuick,
    loadDemoReport: loadDemoReport,
    renderReport: renderReport,
    switchTab: switchTab
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(typeof window !== "undefined" ? window : global);
