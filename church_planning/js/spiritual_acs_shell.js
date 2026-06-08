/**
 * 信徒靈命健康 · ACS 殼（13 題 · 五維 rollup）
 */
(function (global) {
  "use strict";

  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
  }

  function showToast(msg) {
    var el = document.getElementById("spiritual-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("spiritual-toast--show");
    setTimeout(function () { el.classList.remove("spiritual-toast--show"); }, 3200);
  }

  function switchTab(id) {
    if (global.B100AcsBoot && B100AcsBoot.switchTab) B100AcsBoot.switchTab(id);
    else if (global.__b100SwitchTab) __b100SwitchTab(id);
  }

  function renderSurvey() {
    var host = document.getElementById("spiritual-survey-wrap");
    if (!host || !global.SpiritualPack) return;
    var lastSec = "";
    var html =
      '<h2 class="font-black text-rose-900 text-lg mb-1">13 題靈命快評</h2>' +
      '<form id="spiritual-form" onsubmit="return SpiritualAcsShell.submitQuick(event)">';
    SpiritualPack.QUESTIONS.forEach(function (q, i) {
      if (q.section && q.section !== lastSec) {
        lastSec = q.section;
        html += '<p class="text-xs font-black text-rose-800 mt-4 mb-2 border-b pb-1">' + esc(q.section) + "</p>";
      }
      html +=
        '<fieldset class="acs-fieldset"><legend class="text-xs font-bold">第 ' +
        (i + 1) +
        '/13</legend><p class="text-sm mb-2">' +
        esc(q.label) +
        '</p><div class="acs-likert-row">';
      for (var s = 1; s <= 5; s++) html += '<label><input type="radio" name="' + q.id + '" value="' + s + '" required> ' + s + "</label>";
      html += "</div></fieldset>";
    });
    html +=
      '<p id="spiritual-form-error" class="text-red-600 text-xs hidden"></p>' +
      '<button type="submit" class="acs-btn acs-btn--primary mt-3 w-full py-3">✓ 提交 → 靈命儀表</button></form>';
    host.innerHTML = html;
  }

  function renderReport(run, opts) {
    opts = opts || {};
    if (!run) return;
    document.getElementById("spiritual-report-content").classList.remove("hidden");
    document.getElementById("spiritual-report-empty").classList.add("hidden");
    document.getElementById("spiritual-demo-badge").classList.toggle("hidden", !run.is_demo);
    var d = run.derived || {};
    document.getElementById("spiritual-report-summary").innerHTML =
      "<p>" + esc((run.coaching && run.coaching.growth) || "") + "</p>";
    var viz = document.getElementById("spiritual-report-viz");
    if (viz && global.SpiritualHealthViz) {
      viz.innerHTML = SpiritualHealthViz.renderHealthBlock(run, { animate: !!opts.animate });
      if (opts.animate) setTimeout(function () { SpiritualHealthViz.animateHealth(viz); }, 200);
    }
    if (global.SpiritualPastoralDesk) SpiritualPastoralDesk.applyDeskState(run);
  }

  function loadDemoReport() {
    var built = SpiritualPack.buildDemoRun();
    if (!built.ok) return;
    showToast("示範已載入");
    switchTab("report");
    setTimeout(function () { renderReport(built.run, { animate: true }); }, 200);
  }

  function submitQuick(ev) {
    ev.preventDefault();
    var form = document.getElementById("spiritual-form");
    var err = document.getElementById("spiritual-form-error");
    var map = {};
    SpiritualPack.QUESTIONS.forEach(function (q) {
      var el = form.querySelector('input[name="' + q.id + '"]:checked');
      if (el) map[q.id] = Number(el.value);
    });
    var built = SpiritualPack.buildRun(map, {});
    if (!built.ok) {
      if (err) { err.textContent = (built.errors || []).join(" "); err.classList.remove("hidden"); }
      return false;
    }
    AssessmentRunStore.saveRun(built.run);
    switchTab("report");
    renderReport(built.run, { animate: true });
    return false;
  }

  global.loadDemoReport = loadDemoReport;

  function init() {
    if (!global.SpiritualPack) {
      if (global.B100AcsBoot) B100AcsBoot.showBootError("SpiritualPack 未載入");
      return;
    }
    if (global.B100AcsBoot) B100AcsBoot.clearBootError();
    if (global.SpiritualPastoralDesk) SpiritualPastoralDesk.mountStaticDesk();
    renderSurvey();
    var latest = AssessmentRunStore && AssessmentRunStore.loadLatest("spiritual");
    if (latest && !latest.is_demo) renderReport(latest, {});
  }

  global.SpiritualAcsShell = { init: init, submitQuick: submitQuick, loadDemoReport: loadDemoReport, renderReport: renderReport };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(typeof window !== "undefined" ? window : global);
