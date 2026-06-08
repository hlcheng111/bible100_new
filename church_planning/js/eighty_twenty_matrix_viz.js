/**
 * Tab ③ 80/20 · 帕累托長尾分布矩陣（純 SVG）
 */
(function (global) {
  "use strict";

  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
  }

  function renderMatrixBlock(derived, opts) {
    opts = opts || {};
    var analysis = (derived && derived.analysis) || {};
    var rows = analysis.rows || [];
    var maxVal = 1;
    rows.forEach(function (r) {
      maxVal = Math.max(maxVal, Math.abs(r.valueScore), Math.abs(r.wasteScore));
    });
    var barW = 22;
    var gap = 6;
    var chartH = 140;
    var svgW = Math.max(320, rows.length * (barW + gap) + 40);
    var bars = "";
    rows.forEach(function (r, i) {
      var x = 30 + i * (barW + gap);
      var vH = (Math.max(0, r.valueScore) / maxVal) * chartH;
      var wH = (Math.max(0, r.wasteScore) / maxVal) * chartH * 0.6;
      var prune = r.isPruneCandidate;
      var forced = r.forced_prune;
      bars +=
        '<rect class="8020-bar-value" x="' + x + '" y="' + (chartH - vH + 20) + '" width="' + barW + '" height="0" data-target-h="' + vH + '" fill="' + (forced ? "#ef4444" : prune ? "#fca5a5" : "#0e7490") + '" rx="2"/>' +
        '<rect class="8020-bar-waste" x="' + x + '" y="' + (chartH - wH + 20) + '" width="' + (barW * 0.4) + '" height="0" data-target-h="' + wH + '" fill="#f97316" opacity="0.7" rx="1"/>' +
        '<text x="' + (x + barW / 2) + '" y="' + (chartH + 38) + '" text-anchor="middle" font-size="7" fill="#334155" transform="rotate(-35 ' + (x + barW / 2) + " " + (chartH + 38) + ')">' +
        esc(String(r.name).slice(0, 8)) +
        "</text>";
      if (forced) {
        bars +=
          '<text x="' + (x + barW / 2) + '" y="14" text-anchor="middle" font-size="7" font-weight="900" fill="#991b1b">強制剪枝</text>';
      } else if (prune) {
        bars +=
          '<text x="' + (x + barW / 2) + '" y="14" text-anchor="middle" font-size="8" font-weight="800" fill="#b91c1c">剪枝</text>';
      }
    });
    var impact = derived && derived.impact_ratio != null ? derived.impact_ratio : "—";
    var pruneN = derived && derived.prune_count != null ? derived.prune_count : 0;
    var forcedN =
      analysis.forced_prune_count != null
        ? analysis.forced_prune_count
        : (analysis.rows || []).filter(function (r) { return r.forced_prune; }).length;
    var forcedNames = (analysis.rows || [])
      .filter(function (r) { return r.forced_prune; })
      .map(function (p) { return esc(p.name); })
      .join("、");
    return (
      '<div class="8020-matrix-wrap" id="8020-matrix-wrap" data-animate="' + (opts.animate ? "1" : "0") + '">' +
      '<div class="8020-matrix-stats">' +
      '<span><strong>效益比 Impact_Ratio</strong> ' + impact + "</span>" +
      '<span><strong>剪枝候選</strong> ' + pruneN + " 項</span>" +
      (forcedN > 0
        ? '<span class="8020-forced-prune-stat"><strong>強制剪枝</strong> ' + forcedN + " 項（KPI 卡關）</span>"
        : "") +
      '<span><strong>前20%人力占比</strong> ' + (analysis.effort_top20_pct != null ? analysis.effort_top20_pct : "—") + "%</span>" +
      "</div>" +
      '<svg class="8020-matrix-svg" viewBox="0 0 ' + svgW + " " + (chartH + 50) + '" width="100%" aria-label="帕累托長尾分布">' +
      '<text x="8" y="16" font-size="9" fill="#64748b">高價值</text>' +
      '<text x="8" y="28" font-size="9" fill="#64748b">高耗損</text>' +
      '<line x1="24" y1="20" x2="' + (svgW - 10) + '" y2="20" stroke="#e2e8f0"/>' +
      bars +
      "</svg>" +
      (pruneN > 0
        ? '<div class="8020-prune-zone">🔴 <strong>剪枝剪除區</strong>：' +
          analysis.prune_candidates
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
    animateMatrix: animateMatrix
  };
})(typeof window !== "undefined" ? window : global);
