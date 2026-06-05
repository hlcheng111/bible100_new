/**
 * 問卷共用 UX 小工具（非 scoring）：進度文字、Likert pill 狀態同步、報告小標題。
 * 健康類／恩賜卷可並用；路徑以 `church_planning/js/survey_ui_common.js` 為準，
 * `smart_ministry/` 下頁面請用 `../church_planning/js/survey_ui_common.js` 引入。
 */
(function (global) {
  "use strict";

  /**
   * @param {{ targetElement: Element|string, totalQuestions: number, answeredCount: number, template?: string }} opts
   * template 可選，預設「已答 {answered}／總 {total} 題」
   */
  function updateSurveyProgress(opts) {
    var el = opts.targetElement;
    if (typeof el === "string") el = document.getElementById(el);
    if (!el) return;
    var t = opts.totalQuestions != null ? Number(opts.totalQuestions) : 0;
    var a = opts.answeredCount != null ? Number(opts.answeredCount) : 0;
    var tpl = opts.template || "已答 {answered}／總 {total} 題";
    el.textContent = tpl.replace(/\{answered\}/g, String(a)).replace(/\{total\}/g, String(t));
  }

  function syncPillGroup(group) {
    if (!group) return;
    var labels = group.querySelectorAll("label.pill, label.survey-pill");
    for (var i = 0; i < labels.length; i++) {
      var lb = labels[i];
      var inp = lb.querySelector('input[type="radio"]');
      if (inp && inp.checked) lb.classList.add("survey-pill--on");
      else lb.classList.remove("survey-pill--on");
    }
  }

  /**
   * 在動態插入的 Likert pill 上同步 .survey-pill--on（與 :has(input:checked) 並存亦可）。
   * @param {Element|null} root
   */
  function bindLikertPillRadiogroups(root) {
    if (!root) return;
    if (!root._surveyPillChangeBound) {
      root._surveyPillChangeBound = true;
      root.addEventListener(
        "change",
        function (e) {
          var t = e.target;
          if (!t || t.type !== "radio") return;
          var qscale = t.closest(".q-scale");
          if (qscale) syncPillGroup(qscale);
        },
        true
      );
    }
    var groups = root.querySelectorAll(".q-scale");
    for (var g = 0; g < groups.length; g++) syncPillGroup(groups[g]);
  }

  /**
   * @param {string} text
   * @param {2|3} [level=3]
   * @returns {HTMLElement}
   */
  function renderReportSectionTitle(text, level) {
    var tag = level === 2 ? "h2" : "h3";
    var h = document.createElement(tag);
    h.className = "survey-report-section-title";
    h.textContent = text;
    return h;
  }

  global.SurveyUiCommon = {
    updateSurveyProgress: updateSurveyProgress,
    bindLikertPillRadiogroups: bindLikertPillRadiogroups,
    renderReportSectionTitle: renderReportSectionTitle
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
