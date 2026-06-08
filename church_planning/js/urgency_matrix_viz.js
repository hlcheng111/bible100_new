/**
 * Tab ③ 重要 vs 緊急 · 四象限橫條儀表
 */
(function (global) {
  "use strict";

  var COLORS = { Q1: "#ef4444", Q2: "#10b981", Q3: "#f59e0b", Q4: "#64748b" };

  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
  }

  function renderMatrixBlock(run, opts) {
    opts = opts || {};
    if (!run || !global.UrgencyPack) return "";
    var d = run.derived || {};
    var interp = run.interpretation || UrgencyPack.interpretDerived(d);
    var rows = [
      { key: "q1", label: "Q1 重要且緊急", pct: d.q1_pct, item: interp.q1 },
      { key: "q2", label: "Q2 重要不緊急", pct: d.q2_pct, item: interp.q2 },
      { key: "q3", label: "Q3 緊急不重要", pct: d.q3_pct, item: interp.q3 },
      { key: "q4", label: "Q4 不重要不緊急", pct: d.q4_pct, item: interp.q4 }
    ];
    var bars = rows
      .map(function (r) {
        var pct = r.pct != null ? r.pct : 0;
        return (
          '<div class="urgency-bar-row">' +
          '<div class="urgency-bar-head"><span>' +
          esc(r.label) +
          '</span><span class="font-bold">' +
          pct +
          "%</span></div>" +
          '<div class="urgency-bar-track"><div class="urgency-bar-fill urgency-bar-' +
          r.key +
          '" data-width="' +
          pct +
          '" style="width:0;background:' +
          COLORS[r.key.toUpperCase()] +
          '"></div></div>' +
          '<p class="text-xs text-slate-600 mt-1">' +
          esc((r.item && r.item.action) || "") +
          "</p></div>"
        );
      })
      .join("");
    return (
      '<div class="urgency-matrix-wrap" id="urgency-matrix-wrap" data-animate="' +
      (opts.animate ? "1" : "0") +
      '">' +
      '<p class="text-xs text-slate-600 mb-3">' +
      esc(interp.preamble || "") +
      "</p>" +
      bars +
      "</div>"
    );
  }

  function animateMatrix(host) {
    var wrap = host ? host.querySelector(".urgency-matrix-wrap") : document.getElementById("urgency-matrix-wrap");
    if (!wrap || wrap.getAttribute("data-animate") !== "1") return;
    wrap.querySelectorAll(".urgency-bar-fill").forEach(function (el, i) {
      var w = el.getAttribute("data-width") || "0";
      setTimeout(function () {
        el.style.width = w + "%";
      }, 80 + i * 90);
    });
  }

  global.UrgencyMatrixViz = {
    renderMatrixBlock: renderMatrixBlock,
    animateMatrix: animateMatrix
  };
})(typeof window !== "undefined" ? window : global);
