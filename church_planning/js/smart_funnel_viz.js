/**
 * Tab ③ SMART · 戰略漏斗 + PDCA 四齒輪（自 smart-assessment 抽離 SSOT 視覺）
 */
(function (global) {
  "use strict";

  var FUNNEL_ORDER = ["S_clarity", "M_measurability", "R_relevance", "T_time_fit", "A_feasibility", "Care_health"];
  var DIM_KEYS = ["S_clarity", "M_measurability", "A_feasibility", "R_relevance", "T_time_fit", "Care_health"];

  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
  }

  function funnelColor(score, thresholds) {
    if (score == null || !isFinite(score)) return "rgba(148,163,184,0.5)";
    if (score >= thresholds.green) return "rgba(16,185,129,0.85)";
    if (score >= thresholds.yellow) return "rgba(184,137,81,0.9)";
    return "rgba(239,68,68,0.85)";
  }

  function renderDashboardBlock(run, opts) {
    opts = opts || {};
    if (!run || !global.SmartPack) return "";
    var d = run.derived || {};
    var dimScores = d.dim_scores || {};
    var thresholds = SmartPack.THRESHOLDS || { green: 4, yellow: 2.8 };
    var guide = d.pdca_guide || SmartPack.buildPdcaGuide(dimScores, d);
    var pdcaItems = guide && guide.items ? guide.items : [];

    var funnelHtml = "";
    FUNNEL_ORDER.forEach(function (key) {
      var score = dimScores[key];
      var pct = score != null && isFinite(score) ? Math.max(28, (score / 5) * 100) : 28;
      var label = (SmartPack.DIM_LABELS[key] || key).replace("｜", " · ");
      funnelHtml +=
        '<div class="smart-funnel-stage" data-width="' +
        pct +
        '" style="width:28%;background:' +
        funnelColor(score, thresholds) +
        '">' +
        '<span class="smart-funnel-label">' +
        esc(label) +
        "</span>" +
        '<span class="smart-funnel-score">' +
        (score != null ? score.toFixed(1) + " / 5" : "—") +
        "</span></div>";
    });

    var gearsHtml = pdcaItems.length
      ? pdcaItems
          .map(function (g) {
            var fill = g.invert ? Math.min(100, g.score != null ? g.score : 0) : g.score != null ? g.score : 0;
            var bg =
              g.level === "red"
                ? "rgba(239,68,68,0.5)"
                : g.level === "yellow"
                  ? "rgba(184,137,81,0.45)"
                  : "rgba(16,185,129,0.45)";
            return (
              '<div class="smart-pdca-gear"><div class="smart-pdca-gear-fill" data-target-h="' +
              fill +
              '" style="height:0;background:' +
              bg +
              '"></div>' +
              '<span class="smart-pdca-letter">' +
              esc(g.letter) +
              '</span><span class="smart-pdca-val">' +
              esc(g.score_display || "—") +
              '</span><span class="smart-pdca-diag">' +
              esc(g.diagnosis || "") +
              "</span></div>"
            );
          })
          .join("")
      : '<p class="text-xs text-slate-500">尚無 PDCA 診斷</p>';

    var pastoralHtml = pdcaItems
      .map(function (item) {
        var icon = item.level === "red" ? "🚨" : item.level === "yellow" ? "⚠️" : "✅";
        return (
          '<div class="smart-pdca-card smart-pdca-level-' +
          esc(item.level || "unknown") +
          '">' +
          '<p class="font-bold text-sm">' +
          icon +
          " 【" +
          esc(item.letter) +
          "】 " +
          esc(item.diagnosis || "") +
          "</p>" +
          '<p class="text-xs text-slate-600 mt-1">' +
          esc(item.pastoral || "") +
          "</p>" +
          '<p class="text-xs font-bold mt-1">' +
          esc(item.action || "") +
          "</p></div>"
        );
      })
      .join("");

    return (
      '<div class="smart-dashboard-wrap" id="smart-dashboard-wrap" data-animate="' +
      (opts.animate ? "1" : "0") +
      '">' +
      '<div class="smart-dashboard-head">' +
      '<span><strong>對齊</strong> ' +
      (d.alignment_score != null ? d.alignment_score : "—") +
      "/100</span>" +
      '<span><strong>負載</strong> ' +
      (d.load_cost_score != null ? d.load_cost_score : "—") +
      "/100</span>" +
      '<span><strong>可行</strong> ' +
      (d.feasibility_score != null ? d.feasibility_score : "—") +
      "/100</span>" +
      "</div>" +
      '<div class="smart-dashboard smart-funnel-root" id="smart-funnel-root">' +
      funnelHtml +
      "</div>" +
      '<p class="text-xs text-slate-500 mt-2">' +
      esc(guide.intro || "") +
      "</p>" +
      '<div class="smart-pdca-gears" id="pdca-gears-root">' +
      gearsHtml +
      "</div>" +
      '<div class="smart-pdca-pastoral mt-3" id="pdca-pastoral-root">' +
      pastoralHtml +
      "</div></div>"
    );
  }

  function animateDashboard(host) {
    var wrap = host ? host.querySelector(".smart-dashboard-wrap") : document.getElementById("smart-dashboard-wrap");
    if (!wrap || wrap.getAttribute("data-animate") !== "1") return;
    wrap.querySelectorAll(".smart-funnel-stage").forEach(function (el, i) {
      var target = el.getAttribute("data-width") || "28";
      el.style.width = "28%";
      setTimeout(function () {
        el.style.width = target + "%";
      }, 80 + i * 70);
    });
    wrap.querySelectorAll(".smart-pdca-gear-fill").forEach(function (el, i) {
      var h = el.getAttribute("data-target-h") || "0";
      setTimeout(function () {
        el.style.height = h + "%";
      }, 200 + i * 90);
    });
  }

  global.SmartFunnelViz = {
    renderDashboardBlock: renderDashboardBlock,
    animateDashboard: animateDashboard
  };
})(typeof window !== "undefined" ? window : global);
