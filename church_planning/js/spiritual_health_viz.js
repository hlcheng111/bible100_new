/**
 * Tab ③ 信徒靈命 · 五維度橫條
 */
(function (global) {
  "use strict";

  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
  }

  function barColor(score) {
    if (score == null) return "#94a3b8";
    if (score >= 4) return "#10b981";
    if (score >= 2.8) return "#d97706";
    return "#ef4444";
  }

  function renderHealthBlock(run, opts) {
    opts = opts || {};
    if (!run || !global.SpiritualPack) return "";
    var d = run.derived || {};
    var dimScores = d.dim_scores || {};
    var labels = SpiritualPack.DIM_LABELS || {};
    var html = "";
    Object.keys(dimScores).forEach(function (k) {
      var s = dimScores[k];
      var pct = s != null ? Math.max(8, (s / 5) * 100) : 8;
      html +=
        '<div class="spiritual-bar-row"><div class="flex justify-between text-xs font-bold mb-1"><span>' +
        esc(labels[k] || k) +
        "</span><span>" +
        (s != null ? s.toFixed(1) : "—") +
        '/5</span></div><div class="spiritual-bar-track"><div class="spiritual-bar-fill" data-width="' +
        pct +
        '" style="width:0;background:' +
        barColor(s) +
        '"></div></div></div>';
    });
    return (
      '<div class="spiritual-viz-wrap" data-animate="' +
      (opts.animate ? "1" : "0") +
      '"><p class="text-sm mb-2"><strong>整體</strong> ' +
      (d.overall_score != null ? d.overall_score : "—") +
      " / 5 · " +
      esc(d.overall_level || "—") +
      "</p>" +
      html +
      "</div>"
    );
  }

  function animateHealth(host) {
    var wrap = host ? host.querySelector(".spiritual-viz-wrap") : document.querySelector(".spiritual-viz-wrap");
    if (!wrap || wrap.getAttribute("data-animate") !== "1") return;
    wrap.querySelectorAll(".spiritual-bar-fill").forEach(function (el, i) {
      var w = el.getAttribute("data-width") || "0";
      setTimeout(function () { el.style.width = w + "%"; }, 60 + i * 70);
    });
  }

  global.SpiritualHealthViz = { renderHealthBlock: renderHealthBlock, animateHealth: animateHealth };
})(typeof window !== "undefined" ? window : global);
