/**
 * 80/20 資源聚焦儀 · ACS 殼（工作坊合流 · 帕累托矩陣 · 活體上游）
 */
(function (global) {
  "use strict";

  var lastRun = null;

  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }

  function showToast(msg) {
    var el = document.getElementById("8020-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("8020-toast--show");
    setTimeout(function () { el.classList.remove("8020-toast--show"); }, 3200);
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
    var el = document.getElementById("8020-upstream-banner");
    if (!el || !global.EightytwentyPack) return;
    var chain = EightytwentyPack.loadUpstreamChain();
    if (!chain.ok) {
      el.innerHTML =
        '<p class="text-sm text-amber-900">建議先完成 NCD／SWOT／KPI；或點「先看示範報告」體驗帕累托矩陣。</p>';
      el.classList.remove("hidden");
      return;
    }
    var parts = [];
    if (chain.ncd_minimum) parts.push("NCD「" + esc(chain.ncd_minimum.label) + "」");
    if (chain.swot_primary) parts.push("戰略 " + esc(chain.swot_primary));
    if (chain.kpi_resource_stuck != null) parts.push("KPI 卡關 " + chain.kpi_resource_stuck + "%");
    el.innerHTML = '<p class="text-sm text-cyan-900"><strong>已連結上游：</strong>' + parts.join(" · ") + "</p>";
    el.classList.remove("hidden");
  }

  function renderWorkshopForm() {
    var host = document.getElementById("8020-workshop-wrap");
    if (!host) return;
    var html =
      '<h2 class="font-black text-cyan-900 text-lg mb-2">團隊工作坊 · 列出 10 大事工</h2>' +
      '<p class="text-sm text-slate-600 mb-3">2–6 位核心同工 · 只填事工名稱與 1–5 評分（使命契合／果效／行政耗損）· 勿填個資。</p>' +
      '<label class="text-sm font-bold">教會名稱<input id="8020-church" class="w-full border rounded p-2 mt-1 mb-3"/></label>' +
      '<div id="8020-rows" class="space-y-2"></div>' +
      '<button type="button" class="acs-btn mt-2" onclick="EightytwentyAcsShell.addRow()">+ 新增事工列</button>' +
      '<p id="8020-form-error" class="text-red-600 text-xs mt-2 hidden"></p>' +
      '<button type="button" class="acs-btn acs-btn--primary mt-3 w-full py-3" onclick="EightytwentyAcsShell.submitWorkshop()">✓ 完成工作坊 → 帕累托矩陣</button>';
    host.innerHTML = html;
    for (var i = 0; i < 5; i++) EightytwentyAcsShell.addRow();
  }

  function rowHtml(idx) {
    return (
      '<div class="8020-row border rounded p-2 text-xs grid gap-1 md:grid-cols-6" data-idx="' + idx + '">' +
      '<input class="8020-name border rounded p-1 md:col-span-2" placeholder="事工名稱 #' + (idx + 1) + '"/>' +
      '<label>使命<input class="8020-m border rounded p-1 w-full" type="number" min="1" max="5" placeholder="1-5"/></label>' +
      '<label>果效<input class="8020-f border rounded p-1 w-full" type="number" min="1" max="5" placeholder="1-5"/></label>' +
      '<label>耗損<input class="8020-a border rounded p-1 w-full" type="number" min="1" max="5" placeholder="1-5"/></label>' +
      '<label>人力<input class="8020-e border rounded p-1 w-full" type="number" min="1" max="5" placeholder="1-5"/></label></div>'
    );
  }

  function collectRows() {
    var rows = [];
    document.querySelectorAll(".8020-row").forEach(function (el) {
      var name = (el.querySelector(".8020-name") || {}).value;
      if (!String(name || "").trim()) return;
      rows.push({
        name: name,
        missionFit: Number((el.querySelector(".8020-m") || {}).value),
        fruit: Number((el.querySelector(".8020-f") || {}).value),
        adminBurden: Number((el.querySelector(".8020-a") || {}).value),
        effortLoadIndex: Number((el.querySelector(".8020-e") || {}).value) || Number((el.querySelector(".8020-a") || {}).value)
      });
    });
    return rows;
  }

  function renderReport(run, opts) {
    opts = opts || {};
    if (!run) return;
    lastRun = run;
    var content = document.getElementById("8020-report-content");
    if (!content) return;
    content.classList.remove("hidden");
    var empty = document.getElementById("8020-report-empty");
    if (empty) empty.classList.add("hidden");
    var badge = document.getElementById("8020-report-demo-badge");
    if (badge) badge.classList.toggle("hidden", !run.is_demo);
    var summary = document.getElementById("8020-report-summary");
    if (summary && run.derived) {
      summary.innerHTML =
        "<p><strong>Impact_Ratio</strong> " + (run.derived.impact_ratio != null ? run.derived.impact_ratio : "—") +
        " · <strong>剪枝候選</strong> " + (run.derived.prune_count != null ? run.derived.prune_count : 0) + " 項</p>";
    }
    var viz = document.getElementById("8020-report-viz");
    if (viz && global.EightyTwentyMatrixViz) {
      viz.innerHTML = EightyTwentyMatrixViz.renderMatrixBlock(run.derived || {}, { animate: !!opts.animate });
      if (opts.animate) setTimeout(function () { EightyTwentyMatrixViz.animateMatrix(viz); }, opts.animateDelay || 200);
    }
    if (global.EightytwentyPastoralDesk) EightytwentyPastoralDesk.applyDeskState(run);
  }

  function loadDemoReport() {
    if (!global.EightytwentyPack) { showToast("模組尚未載入"); return; }
    var built = EightytwentyPack.buildDemoRun();
    if (!built.ok) { showToast("示範載入失敗"); return; }
    showToast("示範已載入 · 正在帶您到【3. 帕累托矩陣】…");
    switchToReport(true);
    setTimeout(function () {
      renderReport(built.run, { animate: true, animateDelay: 300 });
      if (built.run.derived && built.run.derived.prune_count > 0) {
        setTimeout(function () { showToast("剪枝區已標註 · 請查看【4. 聖靈剪枝決策會】"); }, 1600);
      }
    }, 280);
  }

  function submitWorkshop() {
    if (!global.EightytwentyPack) return;
    var err = document.getElementById("8020-form-error");
    var built = EightytwentyPack.buildRun(collectRows(), {
      church_name: (document.getElementById("8020-church") || {}).value || ""
    });
    if (!built.ok) {
      if (err) { err.textContent = (built.errors || []).join(" "); err.classList.remove("hidden"); }
      return;
    }
    if (err) err.classList.add("hidden");
    if (global.AssessmentRunStore) AssessmentRunStore.saveRun(built.run);
    showToast("工作坊已合流 · 前往帕累托矩陣");
    switchToReport(true);
    setTimeout(function () { renderReport(built.run, { animate: true, animateDelay: 200 }); }, 200);
  }

  function addRow() {
    var host = document.getElementById("8020-rows");
    if (!host) return;
    var idx = host.querySelectorAll(".8020-row").length;
    host.insertAdjacentHTML("beforeend", rowHtml(idx));
  }

  global.loadDemoReport = loadDemoReport;

  function init() {
    if (!global.EightytwentyPack) {
      if (global.B100AcsBoot) B100AcsBoot.showBootError("EightytwentyPack 未載入");
      return;
    }
    if (global.B100AcsBoot) B100AcsBoot.clearBootError();
    if (global.EightytwentyPastoralDesk) EightytwentyPastoralDesk.mountStaticDesk();
    renderUpstreamBanner();
    renderWorkshopForm();
    var latest = global.AssessmentRunStore && AssessmentRunStore.loadLatest("ministry8020");
    if (latest && !latest.is_demo) renderReport(latest, {});
  }

  global.EightytwentyAcsShell = {
    init: init,
    loadDemoReport: loadDemoReport,
    renderReport: renderReport,
    submitWorkshop: submitWorkshop,
    addRow: addRow,
    switchTab: switchTab
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(typeof window !== "undefined" ? window : global);
