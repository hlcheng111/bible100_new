/**
 * 領袖健康診斷 · ACS 殼（30 封閉題 · 七維 rollup · 兩節問卷）
 */
(function (global) {
  "use strict";

  var DRAFT_KEY = "bible100_pastoral_survey_draft";
  var PART1_CATS = ["A", "B", "C"];
  var PART2_CATS = ["D", "E", "F"];
  var currentPart = 1;

  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
  }

  function switchTab(id) {
    if (global.B100AcsBoot) B100AcsBoot.switchTab(id);
    else if (global.__b100SwitchTab) __b100SwitchTab(id);
  }

  function loadDraft() {
    try {
      var raw = localStorage.getItem(DRAFT_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveDraft(map) {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(map || {}));
    } catch (e) {}
  }

  function collectFormMap(form) {
    var map = {};
    if (!form || !global.PastoralPack) return map;
    PastoralPack.QUESTIONS.forEach(function (q) {
      var el = form.querySelector('input[name="' + q.id + '"]:checked');
      if (el) map[q.id] = Number(el.value);
    });
    return map;
  }

  function countAnswered(map) {
    return Object.keys(map || {}).length;
  }

  function updateProgress(form) {
    var map = collectFormMap(form);
    var merged = Object.assign({}, loadDraft(), map);
    saveDraft(merged);
    var n = countAnswered(merged);
    var bar = document.getElementById("pastoral-progress-fill");
    var label = document.getElementById("pastoral-progress-label");
    if (bar) bar.style.width = Math.round((n / 30) * 100) + "%";
    if (label) label.textContent = "已填 " + n + " / 30 題";
  }

  function likertLbl(s) {
    return global.AcsSurveyStandard ? AcsSurveyStandard.likertLabel(s, "fit") : String(s);
  }

  function renderQuestionsForCats(cats, startIdx) {
    var html = "";
    var idx = startIdx || 0;
    cats.forEach(function (cat) {
      html += '<p class="text-xs font-black text-violet-800 mt-3 border-b pb-1">類別 ' + cat + "</p>";
      PastoralPack.QUESTIONS.filter(function (q) {
        return q.id.charAt(0) === cat;
      }).forEach(function (q) {
        idx += 1;
        html +=
          '<fieldset class="acs-fieldset"><legend class="text-xs font-bold">第 ' +
          idx +
          "/30</legend><p class=\"text-sm mb-2\">" +
          esc(q.label) +
          '</p><div class="acs-likert-row acs-likert-row--anchored">';
        for (var s = 1; s <= 5; s++) {
          html += '<label><input type="radio" name="' + q.id + '" value="' + s + '"> ' + likertLbl(s) + "</label>";
        }
        html += "</div></fieldset>";
      });
    });
    return html;
  }

  function restoreDraftToForm(form) {
    var draft = loadDraft();
    Object.keys(draft).forEach(function (qid) {
      var el = form.querySelector('input[name="' + qid + '"][value="' + draft[qid] + '"]');
      if (el) el.checked = true;
    });
    updateProgress(form);
  }

  function bindFormEvents(form) {
    form.querySelectorAll('input[type="radio"]').forEach(function (inp) {
      inp.addEventListener("change", function () {
        updateProgress(form);
      });
    });
  }

  function showPart(part) {
    currentPart = part;
    var p1 = document.getElementById("pastoral-part-1");
    var p2 = document.getElementById("pastoral-part-2");
    var nav1 = document.getElementById("pastoral-part-nav-1");
    var nav2 = document.getElementById("pastoral-part-nav-2");
    if (p1) p1.classList.toggle("hidden", part !== 1);
    if (p2) p2.classList.toggle("hidden", part !== 2);
    if (nav1) nav1.classList.toggle("pastoral-part-tab--active", part === 1);
    if (nav2) nav2.classList.toggle("pastoral-part-tab--active", part === 2);
  }

  function goPart2(ev) {
    if (ev) ev.preventDefault();
    var form = document.getElementById("pastoral-form");
    saveDraft(Object.assign({}, loadDraft(), collectFormMap(form)));
    showPart(2);
    form = document.getElementById("pastoral-form");
    if (form) restoreDraftToForm(form);
    var host = document.getElementById("pastoral-survey-wrap");
    if (host) host.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goPart1(ev) {
    if (ev) ev.preventDefault();
    var form = document.getElementById("pastoral-form");
    saveDraft(Object.assign({}, loadDraft(), collectFormMap(form)));
    showPart(1);
  }

  function renderSurvey() {
    var host = document.getElementById("pastoral-survey-wrap");
    if (!host || !global.PastoralPack) return;

    var html =
      '<h2 class="font-black text-violet-900 text-lg mb-1">30 題領袖健康快評</h2>' +
      '<p class="text-xs text-slate-600 mb-2">分兩節各 15 題 · 可隨時離開 · <strong>已填答案暫存本機</strong>，下次開啟可續填 · 非考核</p>' +
      '<div class="pastoral-progress-wrap mb-3" aria-label="填答進度">' +
      '<div class="pastoral-progress-track"><div id="pastoral-progress-fill" class="pastoral-progress-fill"></div></div>' +
      '<p id="pastoral-progress-label" class="text-xs text-violet-800 font-bold mt-1 mb-0">已填 0 / 30 題</p></div>' +
      '<p class="acs-likert-legend text-xs text-slate-600 mb-3 p-2 bg-violet-50 rounded border border-violet-100">' +
      (global.AcsSurveyStandard ? AcsSurveyStandard.likertLegendHtml("fit") : '<p class="acs-likert-legend text-xs text-slate-600 mb-3 p-2 bg-violet-50 rounded border border-violet-100"><strong>錨點：</strong>1＝幾乎沒有／不符合　…　5＝幾乎總是／非常符合。請依<strong>真實近況</strong>選，無需討好。</p>') +
      '<nav class="flex gap-2 mb-3" aria-label="問卷分節">' +
      '<button type="button" id="pastoral-part-nav-1" class="pastoral-part-tab pastoral-part-tab--active">第一節 · 題 1–15（A–C）</button>' +
      '<button type="button" id="pastoral-part-nav-2" class="pastoral-part-tab">第二節 · 題 16–30（D–F）</button></nav>' +
      '<form id="pastoral-form" onsubmit="return PastoralAcsShell.submitQuick(event)">' +
      '<div id="pastoral-part-1">' +
      renderQuestionsForCats(PART1_CATS, 0) +
      '<button type="button" class="acs-btn acs-btn--primary mt-3 w-full py-3" onclick="PastoralAcsShell.goPart2(event)">下一節（16–30 題）→</button></div>' +
      '<div id="pastoral-part-2" class="hidden">' +
      renderQuestionsForCats(PART2_CATS, 15) +
      '<div class="flex gap-2 mt-3">' +
      '<button type="button" class="acs-btn flex-1 py-3" onclick="PastoralAcsShell.goPart1(event)">← 上一節</button>' +
      '<div class="flex flex-col gap-1 mt-3">' +
      '<button type="submit" class="acs-btn acs-btn--primary flex-1 py-3">提交並生成報告</button>' +
      '<p class="text-xs text-slate-500 text-center m-0">→ Tab ③ 分析報告</p></div></div>' +
      '<p id="pastoral-form-error" class="text-red-600 text-xs hidden mt-2"></p></form>';

    host.innerHTML = html;

    document.getElementById("pastoral-part-nav-1").addEventListener("click", goPart1);
    document.getElementById("pastoral-part-nav-2").addEventListener("click", goPart2);

    var form = document.getElementById("pastoral-form");
    bindFormEvents(form);
    restoreDraftToForm(form);
    showPart(1);
  }

  function renderReport(run, opts) {
    if (!run) return;
    document.getElementById("pastoral-report-content").classList.remove("hidden");
    document.getElementById("pastoral-report-empty").classList.add("hidden");
    document.getElementById("pastoral-demo-badge").classList.toggle("hidden", !run.is_demo);
    var summary = document.getElementById("pastoral-report-summary");
    if (summary) {
      summary.innerHTML =
        "<p class=\"text-sm m-0\">" +
        (run.is_demo ? "<strong>示範報告</strong> · " : "") +
        "資料預設留本機 · 非考核 · 僅供個人與同行牧者參考</p>";
    }
    var viz = document.getElementById("pastoral-report-viz");
    if (viz && global.PastoralHealthViz) {
      viz.innerHTML = PastoralHealthViz.renderHealthBlock(run, { animate: !!opts.animate });
      if (opts.animate) setTimeout(function () { PastoralHealthViz.animateHealth(viz); }, 200);
    }
    if (global.PastoralPastoralDesk) PastoralPastoralDesk.applyDeskState(run);
  }

  function loadDemoReport() {
    var b = PastoralPack.buildDemoRun();
    if (!b.ok) return;
    switchTab("report");
    setTimeout(function () { renderReport(b.run, { animate: true }); }, 200);
  }

  function submitQuick(ev) {
    ev.preventDefault();
    var form = document.getElementById("pastoral-form");
    var err = document.getElementById("pastoral-form-error");
    var map = Object.assign({}, loadDraft(), collectFormMap(form));
    saveDraft(map);
    var built = PastoralPack.buildRun(map, { label: "快評" });
    if (!built.ok) {
      if (err) {
        err.textContent = (built.errors || []).join(" ") || "請完成更多題目後再提交（至少需填答）。";
        err.classList.remove("hidden");
      }
      if (countAnswered(map) < 20) showPart(countAnswered(map) > 15 ? 2 : 1);
      return false;
    }
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (e) {}
    AssessmentRunStore.saveRun(built.run);
    switchTab("report");
    renderReport(built.run, { animate: true });
    return false;
  }

  global.loadDemoReport = loadDemoReport;

  function init() {
    if (!global.PastoralPack) {
      if (global.B100AcsBoot) B100AcsBoot.showBootError("PastoralPack 未載入");
      return;
    }
    if (global.B100AcsBoot) B100AcsBoot.clearBootError();
    if (global.PastoralPastoralDesk) PastoralPastoralDesk.mountStaticDesk();
    var chain = PastoralPack.loadUpstreamChain && PastoralPack.loadUpstreamChain();
    var b = document.getElementById("pastoral-upstream-banner");
    if (b && chain && chain.ok) {
      b.innerHTML = '<p class="text-sm text-violet-900">已連結靈命整體 ' + chain.spiritual_overall + "</p>";
      b.classList.remove("hidden");
    }
    renderSurvey();
    var latest = AssessmentRunStore && AssessmentRunStore.loadLatest("pastoral");
    if (latest && !latest.is_demo) renderReport(latest, {});
  }

  global.PastoralAcsShell = {
    init: init,
    submitQuick: submitQuick,
    loadDemoReport: loadDemoReport,
    renderReport: renderReport,
    goPart1: goPart1,
    goPart2: goPart2
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(typeof window !== "undefined" ? window : global);
