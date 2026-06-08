/**
 * Tab ③ KPI/OKR · 事工推進漏斗（純 SVG）
 */
(function (global) {
  "use strict";

  var STAGES = [
    { key: "vision_tether_score", label: "異象對齊", color: "#6366f1" },
    { key: "kr_clarity_score", label: "KR 可見", color: "#818cf8" },
    { key: "review_rhythm_score", label: "回顧節奏", color: "#a5b4fc" },
    { key: "pastoral_balance_score", label: "生命平衡", color: "#c7d2fe" }
  ];

  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
  }

  function renderFunnelBlock(derived, opts) {
    opts = opts || {};
    var align = derived && derived.alignment_percent != null ? derived.alignment_percent : derived && derived.vision_tether_score;
    var health = derived && derived.pillar_health_score != null ? derived.pillar_health_score : 0;
    var stuck = derived && derived.resource_stuck_rate != null ? derived.resource_stuck_rate : 0;
    var w = 280;
    var stagesHtml = "";
    STAGES.forEach(function (st, i) {
      var score = derived && derived[st.key] != null ? derived[st.key] : 0;
      var widthPct = 40 + (score / 100) * 55;
      stagesHtml +=
        '<div class="kpi-funnel-stage" style="width:' + widthPct + '%;background:' + st.color + '" data-width="' + widthPct + '">' +
        '<span class="kpi-funnel-label">' + esc(st.label) + "</span>" +
        '<span class="kpi-funnel-score">' + score + "%</span></div>";
    });
    var needleAngle = -90 + (Math.max(0, Math.min(100, align || health)) / 100) * 180;
    return (
      '<div class="kpi-funnel-wrap" id="kpi-funnel-wrap" data-animate="' + (opts.animate ? "1" : "0") + '">' +
      '<div class="kpi-funnel-head">' +
      '<span><strong>聖工健康度</strong> ' + health + "/100</span>" +
      '<span><strong>異象對齊</strong> ' + (align != null ? align : "—") + "%</span>" +
      '<span class="' + (stuck >= 70 ? "kpi-stuck-alert" : "") + '"><strong>資源卡關率</strong> ' + stuck + "%</span>" +
      "</div>" +
      '<div class="kpi-funnel-stages">' + stagesHtml + "</div>" +
      '<svg class="kpi-align-gauge" viewBox="0 0 200 120" width="100%" max-width="320" aria-label="對齊度指針">' +
      '<path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e0e7ff" stroke-width="14" stroke-linecap="round"/>' +
      '<path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#kpiGaugeGrad)" stroke-width="14" stroke-linecap="round"/>' +
      '<defs><linearGradient id="kpiGaugeGrad" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0%" stop-color="#22c55e"/><stop offset="55%" stop-color="#eab308"/><stop offset="100%" stop-color="#ef4444"/></linearGradient></defs>' +
      '<g class="kpi-needle-group" data-target-angle="' + needleAngle + '" transform="rotate(-90 100 100)">' +
      '<line x1="100" y1="100" x2="100" y2="35" stroke="#312e81" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="100" cy="100" r="6" fill="#312e81"/></g>' +
      '<text x="100" y="115" text-anchor="middle" font-size="12" font-weight="800" fill="#312e81">對齊 ' + (align != null ? align : health) + "%</text>" +
      "</svg></div>"
    );
  }

  function animateFunnel(host) {
    var wrap = host ? host.querySelector(".kpi-funnel-wrap") : document.getElementById("kpi-funnel-wrap");
    if (!wrap || wrap.getAttribute("data-animate") !== "1") return;
    wrap.querySelectorAll(".kpi-funnel-stage").forEach(function (el, i) {
      var target = el.getAttribute("data-width") || "40";
      el.style.width = "28%";
      setTimeout(function () { el.style.width = target + "%"; }, 100 + i * 90);
    });
    var needle = wrap.querySelector(".kpi-needle-group");
    if (needle) {
      var targetA = Number(needle.getAttribute("data-target-angle")) || -90;
      needle.setAttribute("transform", "rotate(-90 100 100)");
      setTimeout(function () {
        needle.setAttribute("transform", "rotate(" + targetA + " 100 100)");
      }, 400);
    }
  }

  global.KpiFunnelViz = {
    renderFunnelBlock: renderFunnelBlock,
    animateFunnel: animateFunnel
  };
})(typeof window !== "undefined" ? window : global);
