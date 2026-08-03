/**
 * ACS Tab ② 金標 · Likert 錨點 + 提交按鈕（字典 SSOT）
 * @see docs/governance/PLANNING_TOOL_COPY_UI_DICTIONARY_V1.md
 */
(function (global) {
  "use strict";

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  /** @param {"agree"|"fit"} variant */
  function likertLegendHtml(variant) {
    if (variant === "fit") {
      return (
        '<p class="acs-likert-legend text-xs text-slate-600 mb-3 p-2 bg-slate-50 rounded border border-slate-200">' +
        "<strong>錨點：</strong>1＝幾乎沒有／不符合　…　5＝幾乎總是／非常符合。請依<strong>真實近況</strong>選，無需討好。</p>"
      );
    }
    return (
      '<p class="acs-likert-legend text-xs text-slate-600 mb-3 p-2 bg-slate-50 rounded border border-slate-200">' +
      "<strong>錨點：</strong>1＝非常不同意　…　5＝非常同意</p>"
    );
  }

  /** @param {number} score @param {"agree"|"fit"} variant */
  function likertLabel(score, variant) {
    var s = Number(score);
    if (variant === "fit") {
      if (s === 1) return "1 不符合";
      if (s === 5) return "5 非常符合";
      return String(s);
    }
    if (s === 1) return "1 非常不同意";
    if (s === 5) return "5 非常同意";
    return String(s);
  }

  function likertRowClass() {
    return "acs-likert-row acs-likert-row--anchored";
  }

  /** @param {string} [subtitle] Tab ③ 導向副標 */
  function submitButtonHtml(subtitle) {
    var sub = subtitle
      ? '<p class="text-xs text-slate-500 text-center mt-1 mb-0">' + esc(subtitle) + "</p>"
      : "";
    return (
      '<button type="submit" class="acs-btn acs-btn--primary mt-3 w-full py-3">提交並生成報告</button>' +
      sub
    );
  }

  /** 工作坊型 Tab ②（8020）· 同字典主文案 */
  function workshopSubmitButtonHtml(onclickAttr, subtitle) {
    var sub = subtitle
      ? '<p class="text-xs text-slate-500 text-center mt-1 mb-0">' + esc(subtitle) + "</p>"
      : "";
    return (
      '<button type="button" class="acs-btn acs-btn--primary mt-3 w-full py-3" onclick="' +
      esc(onclickAttr) +
      '">提交並生成報告</button>' +
      sub
    );
  }

  global.AcsSurveyStandard = {
    esc: esc,
    likertLegendHtml: likertLegendHtml,
    likertLabel: likertLabel,
    likertRowClass: likertRowClass,
    submitButtonHtml: submitButtonHtml,
    workshopSubmitButtonHtml: workshopSubmitButtonHtml
  };
})(typeof window !== "undefined" ? window : global);
