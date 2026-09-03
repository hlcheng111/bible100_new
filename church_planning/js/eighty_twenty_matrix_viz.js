/**
 * Tab ③ 80/20 · 帕累托長尾分布矩陣（純 SVG）+ 累積曲線 + 聚焦四象限
 */
(function (global) {
  "use strict";

  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
  }

  function resolveInput(input) {
    if (input && input.derived && (input.tool_id || input.is_demo != null)) {
      return { run: input, derived: input.derived };
    }
    return { run: null, derived: input || {} };
  }

  /** 帕累托累積曲線（依價值排序的累積人力 %） */
  function paretoCurveSvg(rows, padL, chartW, chartH, baseY) {
    rows = rows.slice().sort(function (a, b) { return b.valueScore - a.valueScore; });
    if (!rows.length) return "";
    var totalEffort = rows.reduce(function (a, r) { return a + (r.effortLoad || 1); }, 0) || 1;
    var cum = 0;
    var pts = [{ x: padL, y: baseY }];
    rows.forEach(function (r, i) {
      cum += r.effortLoad || 1;
      var x = padL + (cum / totalEffort) * chartW;
      var y = baseY - ((i + 1) / rows.length) * chartH * 0.85;
      pts.push({ x: x, y: y });
    });
    var path =
      "M" +
      pts[0].x +
      " " +
      pts[0].y +
      pts
        .slice(1)
        .map(function (p) { return " L" + p.x.toFixed(1) + " " + p.y.toFixed(1); })
        .join("");
    var x80 = padL + chartW * 0.2;
    return (
      '<path class="pareto-curve" d="' +
      path +
      '" fill="none" stroke="#7c3aed" stroke-width="2.5" stroke-dasharray="6 3" opacity="0.85"/>' +
      '<line x1="' +
      x80 +
      '" y1="' +
      (baseY - chartH) +
      '" x2="' +
      x80 +
      '" y2="' +
      baseY +
      '" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4 3"/>' +
      '<text x="' +
      (x80 + 3) +
      '" y="' +
      (baseY - chartH + 12) +
      '" font-size="8" fill="#64748b">20%人力</text>' +
      '<text x="' +
      (padL + 4) +
      '" y="' +
      (baseY - chartH + 12) +
      '" font-size="8" font-weight="800" fill="#7c3aed">累積帕累托</text>'
    );
  }

  /** 價值 × 耗損 四象限散點（氣泡大小＝精力） */
  function focusQuadSvg(rows) {
    rows = rows || [];
    var w = 360;
    var h = 260;
    var pad = 44;
    var plotW = w - pad * 2;
    var plotH = h - pad * 2;
    var midX = pad + plotW / 2;
    var midY = pad + plotH / 2;
    var maxVal = 1;
    rows.forEach(function (r) {
      maxVal = Math.max(maxVal, Math.abs(r.valueScore), Math.abs(r.wasteScore));
    });
    var svg =
      '<svg class="8020-focus-quad-svg" viewBox="0 0 ' +
      w +
      " " +
      h +
      '" role="img" aria-label="事工價值與耗損四象限">' +
      '<rect x="' +
      pad +
      '" y="' +
      pad +
      '" width="' +
      plotW +
      '" height="' +
      plotH +
      '" fill="#f8fafc" stroke="#e2e8f0" rx="6"/>' +
      '<line x1="' +
      midX +
      '" y1="' +
      pad +
      '" x2="' +
      midX +
      '" y2="' +
      (pad + plotH) +
      '" stroke="#cbd5e1" stroke-width="1"/>' +
      '<line x1="' +
      pad +
      '" y1="' +
      midY +
      '" x2="' +
      (pad + plotW) +
      '" y2="' +
      midY +
      '" stroke="#cbd5e1" stroke-width="1"/>' +
      '<text x="' +
      (pad + 6) +
      '" y="' +
      (pad + 12) +
      '" font-size="8" font-weight="800" fill="#059669">★ 高價值·低耗損</text>' +
      '<text x="' +
      (midX + 6) +
      '" y="' +
      (pad + 12) +
      '" font-size="8" fill="#64748b">高耗損</text>' +
      '<text x="' +
      (pad + 6) +
      '" y="' +
      (pad + plotH - 4) +
      '" font-size="8" fill="#64748b">低價值</text>' +
      '<text x="' +
      (midX + 6) +
      '" y="' +
      (pad + plotH - 4) +
      '" font-size="8" font-weight="800" fill="#dc2626">剪枝區</text>';
    rows.forEach(function (r, i) {
      var vx = (r.valueScore / maxVal) * (plotW / 2 - 8);
      var wx = (r.wasteScore / maxVal) * (plotW / 2 - 8);
      var cx = r.valueScore >= maxVal / 2 ? midX + vx * 0.5 : pad + plotW / 2 - wx * 0.5;
      var cy = r.wasteScore <= maxVal / 2 ? midY - (r.valueScore / maxVal) * (plotH / 2 - 10) : midY + (r.wasteScore / maxVal) * (plotH / 2 - 10);
      var rad = 5 + (r.effortLoad || 3) * 1.2;
      var fill = r.forced_prune ? "#ef4444" : r.isPruneCandidate ? "#fca5a5" : "#0e7490";
      svg +=
        '<circle cx="' +
        cx.toFixed(1) +
        '" cy="' +
        cy.toFixed(1) +
        '" r="' +
        rad.toFixed(1) +
        '" fill="' +
        fill +
        '" opacity="0.75" stroke="#fff" stroke-width="1.5"/>' +
        '<text x="' +
        cx.toFixed(1) +
        '" y="' +
        (cy + rad + 10).toFixed(1) +
        '" text-anchor="middle" font-size="6" fill="#334155">' +
        esc(String(r.name).slice(0, 6)) +
        "</text>";
    });
    svg += "</svg>";
    return svg;
  }

  function renderMatrixBlock(input, opts) {
    opts = opts || {};
    var resolved = resolveInput(input);
    var run = resolved.run;
    var derived = resolved.derived;
    var analysis = derived.analysis || {};
    var rows = analysis.rows || [];
    var maxVal = 1;
    rows.forEach(function (r) {
      maxVal = Math.max(maxVal, Math.abs(r.valueScore), Math.abs(r.wasteScore));
    });
    var barW = 22;
    var gap = 6;
    var chartH = 140;
    var padL = 30;
    var svgW = Math.max(320, rows.length * (barW + gap) + padL + 20);
    var chartW = svgW - padL - 10;
    var baseY = chartH + 20;
    var bars = "";
    rows.forEach(function (r, i) {
      var x = padL + i * (barW + gap);
      var vH = (Math.max(0, r.valueScore) / maxVal) * chartH;
      var wH = (Math.max(0, r.wasteScore) / maxVal) * chartH * 0.6;
      var prune = r.isPruneCandidate;
      var forced = r.forced_prune;
      bars +=
        '<rect class="8020-bar-value" x="' +
        x +
        '" y="' +
        (baseY - vH) +
        '" width="' +
        barW +
        '" height="0" data-target-h="' +
        vH +
        '" fill="' +
        (forced ? "#ef4444" : prune ? "#fca5a5" : "#0e7490") +
        '" rx="2"/>' +
        '<rect class="8020-bar-waste" x="' +
        x +
        '" y="' +
        (baseY - wH) +
        '" width="' +
        barW * 0.4 +
        '" height="0" data-target-h="' +
        wH +
        '" fill="#f97316" opacity="0.7" rx="1"/>' +
        '<text x="' +
        (x + barW / 2) +
        '" y="' +
        (baseY + 18) +
        '" text-anchor="middle" font-size="7" fill="#334155" transform="rotate(-35 ' +
        (x + barW / 2) +
        " " +
        (baseY + 18) +
        ')">' +
        esc(String(r.name).slice(0, 8)) +
        "</text>";
      if (forced) {
        bars +=
          '<text x="' +
          (x + barW / 2) +
          '" y="14" text-anchor="middle" font-size="7" font-weight="900" fill="#991b1b">強制剪枝</text>';
      } else if (prune) {
        bars +=
          '<text x="' +
          (x + barW / 2) +
          '" y="14" text-anchor="middle" font-size="8" font-weight="800" fill="#b91c1c">剪枝</text>';
      }
    });
    var impact = derived.impact_ratio != null ? derived.impact_ratio : "—";
    var pruneN = derived.prune_count != null ? derived.prune_count : 0;
    var forcedN =
      analysis.forced_prune_count != null
        ? analysis.forced_prune_count
        : rows.filter(function (r) { return r.forced_prune; }).length;
    var forcedNames = rows
      .filter(function (r) { return r.forced_prune; })
      .map(function (p) { return esc(p.name); })
      .join("、");
    var heart =
      run && global.AcsReportGold && AcsReportGold.renderReportHeart
        ? AcsReportGold.renderReportHeart(AcsReportGold.build8020ReportHeart(run))
        : "";
    return (
      '<div class="8020-matrix-wrap" id="8020-matrix-wrap" data-animate="' +
      (opts.animate ? "1" : "0") +
      '">' +
      heart +
      '<div class="8020-matrix-stats">' +
      "<span><strong>效益比 Impact_Ratio</strong> " +
      impact +
      "</span>" +
      "<span><strong>剪枝候選</strong> " +
      pruneN +
      " 項</span>" +
      (forcedN > 0
        ? '<span class="8020-forced-prune-stat"><strong>強制剪枝</strong> ' +
          forcedN +
          " 項（KPI 卡關）</span>"
        : "") +
      "<span><strong>前20%人力占比</strong> " +
      (analysis.effort_top20_pct != null ? analysis.effort_top20_pct : "—") +
      "%</span>" +
      "</div>" +
      '<div class="acs-report-block"><h3 class="acs-report-block__title">📈 帕累托長尾 + 累積曲線</h3>' +
      '<svg class="8020-matrix-svg" viewBox="0 0 ' +
      svgW +
      " " +
      (chartH + 50) +
      '" width="100%" aria-label="帕累托長尾分布">' +
      '<text x="8" y="16" font-size="9" fill="#64748b">高價值</text>' +
      '<text x="8" y="28" font-size="9" fill="#64748b">高耗損</text>' +
      '<line x1="24" y1="20" x2="' +
      (svgW - 10) +
      '" y2="20" stroke="#e2e8f0"/>' +
      bars +
      paretoCurveSvg(rows, padL, chartW, chartH, baseY) +
      "</svg></div>" +
      (rows.length
        ? '<div class="acs-report-block"><h3 class="acs-report-block__title">🎯 價值 × 耗損聚焦圖（氣泡＝精力）</h3>' +
          focusQuadSvg(rows) +
          "</div>"
        : "") +
      (pruneN > 0
        ? '<div class="8020-prune-zone">🔴 <strong>剪枝剪除區</strong>：' +
          (analysis.prune_candidates || [])
            .map(function (p) { return esc(p.name); })
            .join("、") +
          " — 建議進入 Tab④ 長執決策腳本。</div>"
        : "") +
      (forcedN > 0
        ? '<div class="8020-forced-prune-zone" role="alert">⛔ <strong>紅色強制剪枝警告</strong>（KPI 資源卡關）：' +
          forcedNames +
          " — 長執會宜優先止血，暫緩新招募。</div>"
        : "") +
      "</div>"
    );
  }

  function animateMatrix(host) {
    var wrap = host ? host.querySelector(".8020-matrix-wrap") : document.getElementById("8020-matrix-wrap");
    if (!wrap || wrap.getAttribute("data-animate") !== "1") return;
    wrap.querySelectorAll("[data-target-h]").forEach(function (rect, i) {
      var h = Number(rect.getAttribute("data-target-h")) || 0;
      var y = Number(rect.getAttribute("y")) || 0;
      rect.setAttribute("height", "0");
      setTimeout(function () {
        rect.setAttribute("height", String(h));
        rect.setAttribute("y", String(y));
      }, 80 + i * 40);
    });
  }

  global.EightyTwentyMatrixViz = {
    renderMatrixBlock: renderMatrixBlock,
    animateMatrix: animateMatrix,
    focusQuadSvg: focusQuadSvg,
    paretoCurveSvg: paretoCurveSvg
  };
})(typeof window !== "undefined" ? window : global);
