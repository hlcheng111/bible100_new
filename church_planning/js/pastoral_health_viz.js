/**
 * Tab ③ 領袖健康 · 七維橫條 + report-heart + 牧養場景警訊
 */
(function (global) {
  "use strict";

  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
  }

  function barColor(s) {
    if (s == null) return "#94a3b8";
    if (s >= 4) return "#10b981";
    if (s >= 2.8) return "#d97706";
    return "#ef4444";
  }

  function renderRiskFlags(run) {
    var flags = run.risk_flags || [];
    if (!flags.length) return "";
    var scene = (global.PastoralPack && PastoralPack.FLAG_SCENE_COPY) || {};
    var html = '<div class="pastoral-risk-flags mt-3 pt-3 border-t border-violet-100">';
    html += '<p class="text-xs font-black text-violet-900 mb-2">煙霧探測 · 值得長執先談的事</p><ul class="text-sm space-y-2 pl-4 mb-0">';
    flags.forEach(function (f) {
      var copy = scene[f] || (PastoralPack.FLAG_DESCRIPTIONS && PastoralPack.FLAG_DESCRIPTIONS[f]) || f;
      html += "<li>" + esc(copy) + "</li>";
    });
    html += "</ul></div>";
    return html;
  }

  function renderHealthBlock(run, opts) {
    if (!run || !global.PastoralPack) return "";
    var d = run.derived || {};
    var dim = d.dim_scores || {};
    var labels = PastoralPack.DIM_LABELS || {};
    var heart =
      global.AcsReportGold && AcsReportGold.renderReportHeart
        ? AcsReportGold.renderReportHeart(AcsReportGold.buildPastoralReportHeart(run))
        : "";
    var bars = "";
    Object.keys(dim).forEach(function (k) {
      var s = dim[k];
      var pct = s != null ? Math.max(8, (s / 5) * 100) : 8;
      bars +=
        '<div class="pastoral-bar-row"><div class="flex justify-between text-xs font-bold mb-1"><span>' +
        esc(labels[k] || k) +
        '</span><span>' +
        (s != null ? s.toFixed(1) : "—") +
        '/5</span></div><div class="pastoral-bar-track"><div class="pastoral-bar-fill" data-width="' +
        pct +
        '" style="width:0;background:' +
        barColor(s) +
        '"></div></div></div>';
    });
    return (
      '<div class="pastoral-viz-wrap" data-animate="' +
      (opts.animate ? "1" : "0") +
      '">' +
      heart +
      '<p class="text-sm mb-2">' +
      esc(d.tier_copy || "") +
      " · <strong>整體</strong> " +
      (d.overall_score != null ? d.overall_score : "—") +
      "/5</p>" +
      bars +
      renderRiskFlags(run) +
      "</div>"
    );
  }

  function animateHealth(host) {
    var w = host ? host.querySelector(".pastoral-viz-wrap") : document.querySelector(".pastoral-viz-wrap");
    if (!w || w.getAttribute("data-animate") !== "1") return;
    w.querySelectorAll(".pastoral-bar-fill").forEach(function (el, i) {
      setTimeout(function () {
        el.style.width = (el.getAttribute("data-width") || 0) + "%";
      }, 60 + i * 60);
    });
  }

  global.PastoralHealthViz = { renderHealthBlock: renderHealthBlock, animateHealth: animateHealth };
})(typeof window !== "undefined" ? window : global);
