/**
 * Tab ③ 重要 vs 緊急 · 四格矩陣 + 橫條 + 達標燈（金標）
 */
(function (global) {
  "use strict";

  var COLORS = { Q1: "#ef4444", Q2: "#10b981", Q3: "#f59e0b", Q4: "#64748b" };
  var ACTION_TAGS = { q1: "即做", q2: "排程", q3: "委派", q4: "清除" };

  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
  }

  function badge(item) {
    if (global.AcsReportGold && AcsReportGold.renderStatusBadge) {
      return AcsReportGold.renderStatusBadge(item.level, item.label);
    }
    return esc(item.label || "");
  }

  function renderDonutChart(derived) {
    derived = derived || {};
    var segs = [
      { id: "q2", pct: Number(derived.q2_pct) || 0, color: COLORS.Q2, label: "Q2 深度" },
      { id: "q1", pct: Number(derived.q1_pct) || 0, color: COLORS.Q1, label: "Q1 救火" },
      { id: "q3", pct: Number(derived.q3_pct) || 0, color: COLORS.Q3, label: "Q3 委派" },
      { id: "q4", pct: Number(derived.q4_pct) || 0, color: COLORS.Q4, label: "Q4 清除" }
    ];
    var cx = 110;
    var cy = 110;
    var rOut = 88;
    var rIn = 52;
    var start = -Math.PI / 2;
    var paths = "";
    var legend = "";
    segs.forEach(function (s) {
      if (s.pct <= 0) return;
      var angle = (s.pct / 100) * Math.PI * 2;
      var end = start + angle;
      var x1o = cx + rOut * Math.cos(start);
      var y1o = cy + rOut * Math.sin(start);
      var x2o = cx + rOut * Math.cos(end);
      var y2o = cy + rOut * Math.sin(end);
      var x1i = cx + rIn * Math.cos(end);
      var y1i = cy + rIn * Math.sin(end);
      var x2i = cx + rIn * Math.cos(start);
      var y2i = cy + rIn * Math.sin(start);
      var large = angle > Math.PI ? 1 : 0;
      paths +=
        '<path d="M' +
        x1o.toFixed(1) +
        " " +
        y1o.toFixed(1) +
        " A" +
        rOut +
        " " +
        rOut +
        " 0 " +
        large +
        " 1 " +
        x2o.toFixed(1) +
        " " +
        y2o.toFixed(1) +
        " L" +
        x1i.toFixed(1) +
        " " +
        y1i.toFixed(1) +
        " A" +
        rIn +
        " " +
        rIn +
        " 0 " +
        large +
        " 0 " +
        x2i.toFixed(1) +
        " " +
        y2i.toFixed(1) +
        ' Z" fill="' +
        s.color +
        '" opacity="0.92"/>';
      start = end;
      legend +=
        '<span class="urgency-donut-legend__item"><i style="background:' +
        s.color +
        '"></i>' +
        esc(s.label) +
        " " +
        s.pct +
        "%</span>";
    });
    return (
      '<div class="urgency-donut-wrap">' +
      '<svg class="urgency-donut-svg" viewBox="0 0 220 220" role="img" aria-label="四象限精力環形圖">' +
      paths +
      '<text x="' +
      cx +
      '" y="' +
      (cy - 4) +
      '" text-anchor="middle" font-size="10" font-weight="800" fill="#78350f">精力</text>' +
      '<text x="' +
      cx +
      '" y="' +
      (cy + 10) +
      '" text-anchor="middle" font-size="9" fill="#92400e">分布</text>' +
      "</svg>" +
      '<div class="urgency-donut-legend">' +
      legend +
      "</div></div>"
    );
  }

  function renderQuadGrid(interp, derived) {
    var cells = [
      { id: "q2", pos: "tl", title: "Q2 重要不緊急", item: interp.q2, pct: derived.q2_pct, color: COLORS.Q2 },
      { id: "q1", pos: "tr", title: "Q1 重要且緊急", item: interp.q1, pct: derived.q1_pct, color: COLORS.Q1 },
      { id: "q4", pos: "bl", title: "Q4 不重要不緊急", item: interp.q4, pct: derived.q4_pct, color: COLORS.Q4 },
      { id: "q3", pos: "br", title: "Q3 緊急不重要", item: interp.q3, pct: derived.q3_pct, color: COLORS.Q3 }
    ];
    var grid = cells
      .map(function (c) {
        var it = c.item || {};
        return (
          '<div class="acs-quad-cell acs-quad-cell--' +
          c.pos +
          '" style="border-color:' +
          c.color +
          '">' +
          '<div class="acs-quad-cell__head"><strong>' +
          esc(c.title) +
          "</strong> " +
          '<span class="acs-quad-cell__tag">' +
          esc(ACTION_TAGS[c.id] || "") +
          "</span> " +
          badge(it) +
          '<span class="acs-quad-cell__pct">' +
          (c.pct != null ? c.pct : "—") +
          "%</span></div>" +
          '<p class="acs-quad-cell__harm">' +
          esc(it.harm || "") +
          "</p>" +
          '<p class="acs-quad-cell__action"><strong>教會版行動：</strong>' +
          esc(it.action || "") +
          "</p></div>"
        );
      })
      .join("");
    return (
      '<div class="acs-quad-grid" aria-label="Eisenhower 四象限分布">' +
      '<p class="acs-quad-grid__hint">四格百分比加總 100%，代表過去一段時間<strong>精力／注意力</strong>的相對比例（非手錶計時）。</p>' +
      grid +
      "</div>"
    );
  }

  function renderMatrixBlock(run, opts) {
    opts = opts || {};
    if (!run || !global.UrgencyPack) return "";
    var d = run.derived || {};
    var interp = run.interpretation || UrgencyPack.interpretDerived(d);
    var heart =
      global.AcsReportGold && AcsReportGold.renderReportHeart
        ? AcsReportGold.renderReportHeart(AcsReportGold.buildUrgentReportHeart(run))
        : "";

    var rows = [
      { key: "q1", label: "Q1 重要且緊急", pct: d.q1_pct, item: interp.q1 },
      { key: "q2", label: "Q2 重要不緊急", pct: d.q2_pct, item: interp.q2 },
      { key: "q3", label: "Q3 緊急不重要", pct: d.q3_pct, item: interp.q3 },
      { key: "q4", label: "Q4 不重要不緊急", pct: d.q4_pct, item: interp.q4 }
    ];
    var bars = rows
      .map(function (r) {
        var pct = r.pct != null ? r.pct : 0;
        var it = r.item || {};
        return (
          '<div class="urgency-bar-row">' +
          '<div class="urgency-bar-head"><span>' +
          esc(r.label) +
          "</span><span>" +
          badge(it) +
          ' <span class="font-bold">' +
          pct +
          "%</span></span></div>" +
          '<div class="urgency-bar-track"><div class="urgency-bar-fill urgency-bar-' +
          r.key +
          '" data-width="' +
          pct +
          '" style="width:0;background:' +
          COLORS[r.key.toUpperCase()] +
          '"></div></div></div>"
        );
      })
      .join("");

    return (
      '<div class="urgency-matrix-wrap" id="urgency-matrix-wrap" data-animate="' +
      (opts.animate ? "1" : "0") +
      '">' +
      heart +
      '<div class="acs-report-block"><h3 class="acs-report-block__title">🍩 精力環形圖（一眼比例）</h3>' +
      renderDonutChart(d) +
      "</div>" +
      renderQuadGrid(interp, d) +
      '<div class="acs-report-block"><h3 class="acs-report-block__title">比例橫條（比較用）</h3>' +
      '<p class="text-xs text-slate-600 mb-2">' +
      esc(interp.use || "") +
      "</p>" +
      bars +
      "</div></div>"
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
