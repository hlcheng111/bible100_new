/**
 * Tab ③ 信徒靈命 · 五維橫條 + 達標燈（對齊金標）
 */
(function (global) {
  "use strict";

  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
  }

  function levelFromScore(s) {
    if (s == null || !isFinite(s)) return { level: "mid", label: "—" };
    if (s >= 4) return { level: "ok", label: "良好" };
    if (s >= 2.8) return { level: "mid", label: "尚可" };
    return { level: "low", label: "需留意" };
  }

  function barColor(score) {
    var lv = levelFromScore(score);
    if (lv.level === "ok") return "#10b981";
    if (lv.level === "mid") return "#d97706";
    return "#ef4444";
  }

  function badge(score) {
    var lv = levelFromScore(score);
    if (global.AcsReportGold && AcsReportGold.renderStatusBadge) {
      return AcsReportGold.renderStatusBadge(lv.level, lv.label);
    }
    return esc(lv.label);
  }

  function renderHealthBlock(run, opts) {
    opts = opts || {};
    if (!run || !global.SpiritualPack) return "";
    var d = run.derived || {};
    var dimScores = d.dim_scores || {};
    var labels = SpiritualPack.DIM_LABELS || {};
    var heart =
      global.AcsReportGold && AcsReportGold.renderReportHeart
        ? AcsReportGold.renderReportHeart(AcsReportGold.buildSpiritualReportHeart(run))
        : "";
    var overallLv = levelFromScore(d.overall_score);
    var bars = "";
    Object.keys(labels).forEach(function (k) {
      var s = dimScores[k];
      var pct = s != null ? Math.max(8, (s / 5) * 100) : 8;
      var hint = (SpiritualPack.DIM_HINTS && SpiritualPack.DIM_HINTS[k]) || "";
      bars +=
        '<div class="spiritual-bar-row">' +
        '<div class="flex justify-between text-xs font-bold mb-1 flex-wrap gap-1">' +
        "<span>" +
        esc(labels[k] || k) +
        "</span><span>" +
        badge(s) +
        " <span>" +
        (s != null ? s.toFixed(1) : "—") +
        "/5</span></span></div>" +
        '<div class="spiritual-bar-track"><div class="spiritual-bar-fill" data-width="' +
        pct +
        '" style="width:0;background:' +
        barColor(s) +
        '"></div></div>' +
        (hint ? '<p class="text-xs text-slate-500 mt-1 mb-0">' + esc(hint) + "</p>" : "") +
        "</div>";
    });
    return (
      '<div class="spiritual-viz-wrap" data-animate="' +
      (opts.animate ? "1" : "0") +
      '">' +
      heart +
      '<p class="text-sm mb-2">' +
      badge(d.overall_score) +
      ' <strong>整體</strong> ' +
      (d.overall_score != null ? d.overall_score : "—") +
      " / 5 · " +
      esc(d.overall_level || overallLv.label) +
      "</p>" +
      bars +
      "</div>"
    );
  }

  function animateHealth(host) {
    var wrap = host ? host.querySelector(".spiritual-viz-wrap") : document.querySelector(".spiritual-viz-wrap");
    if (!wrap || wrap.getAttribute("data-animate") !== "1") return;
    wrap.querySelectorAll(".spiritual-bar-fill").forEach(function (el, i) {
      var w = el.getAttribute("data-width") || "0";
      setTimeout(function () {
        el.style.width = w + "%";
      }, 60 + i * 70);
    });
  }

  global.SpiritualHealthViz = { renderHealthBlock: renderHealthBlock, animateHealth: animateHealth };
})(typeof window !== "undefined" ? window : global);
