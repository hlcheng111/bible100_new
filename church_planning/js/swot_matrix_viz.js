/**
 * SWOT · Weihrich TOWS 交叉矩陣（純 SVG · 優先級評分 · Delta 係數）
 */
(function (global) {
  "use strict";

  var CROSS_META = {
    SO: { label: "SO 增長", color: "#059669", bg: "#d1fae5" },
    ST: { label: "ST 多元", color: "#0284c7", bg: "#e0f2fe" },
    WO: { label: "WO 轉變", color: "#dc2626", bg: "#fee2e2", primary: true },
    WT: { label: "WT 防禦", color: "#7c3aed", bg: "#ede9fe" }
  };

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function getMatrix(derived) {
    derived = derived || {};
    var c = derived.swot_contract || {};
    return derived.matrix_result || c.matrix_result || {};
  }

  function crossMatrixSvg(activeId, matrix) {
    activeId = activeId || "WO";
    matrix = matrix || {};
    var scores = matrix.cross_scores || {};
    var w = 520;
    var h = 380;
    var pad = 56;
    var cellW = (w - pad * 2) / 2;
    var cellH = (h - pad * 2) / 2;
    var x0 = pad;
    var y0 = pad;
    var svg = [
      '<svg class="swot-matrix-svg" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="Weihrich TOWS 交叉戰略矩陣">',
      '<text x="' + w / 2 + '" y="16" text-anchor="middle" font-size="10" font-weight="800" fill="#92400e">Weihrich TOWS 矩陣 · 優先級 P/100 · 點擊查看 Δ 係數</text>'
    ];

    svg.push(
      '<text x="' + (x0 + cellW * 0.5) + '" y="' + (y0 - 12) + '" text-anchor="middle" font-size="10" font-weight="800" fill="#0369a1">O 機會 (O_j)</text>',
      '<text x="' + (x0 + cellW * 1.5) + '" y="' + (y0 - 12) + '" text-anchor="middle" font-size="10" font-weight="800" fill="#b45309">T 威脅 (T_k)</text>',
      '<text x="' + (x0 - 14) + '" y="' + (y0 + cellH * 0.55) + '" text-anchor="end" font-size="10" font-weight="800" fill="#047857" transform="rotate(-90 ' + (x0 - 14) + " " + (y0 + cellH * 0.55) + ')">S 優勢 (S_w)</text>',
      '<text x="' + (x0 - 14) + '" y="' + (y0 + cellH * 1.55) + '" text-anchor="end" font-size="10" font-weight="800" fill="#be123c" transform="rotate(-90 ' + (x0 - 14) + " " + (y0 + cellH * 1.55) + ')">W 劣勢 (W_i)</text>'
    );

    var cells = [
      { id: "SO", cx: 0, cy: 0 },
      { id: "ST", cx: 1, cy: 0 },
      { id: "WO", cx: 0, cy: 1 },
      { id: "WT", cx: 1, cy: 1 }
    ];

    cells.forEach(function (c) {
      var meta = CROSS_META[c.id];
      var x = x0 + c.cx * cellW;
      var y = y0 + c.cy * cellH;
      var on = c.id === activeId;
      var stroke = on ? meta.color : "#e2e8f0";
      var sw = on ? 3 : 1.5;
      var pri = scores[c.id] != null ? scores[c.id] : "—";
      var isPrimary = matrix.primary_strategy === c.id;
      svg.push(
        '<rect class="swot-cross-cell" data-cross="' +
          c.id +
          '" x="' +
          x +
          '" y="' +
          y +
          '" width="' +
          cellW +
          '" height="' +
          cellH +
          '" rx="8" fill="' +
          meta.bg +
          '" stroke="' +
          stroke +
          '" stroke-width="' +
          sw +
          '" style="cursor:pointer"/>',
        '<text x="' +
          (x + cellW / 2) +
          '" y="' +
          (y + cellH / 2 - 10) +
          '" text-anchor="middle" font-size="12" font-weight="900" fill="' +
          meta.color +
          '">' +
          esc(meta.label) +
          "</text>",
        '<text x="' +
          (x + cellW / 2) +
          '" y="' +
          (y + cellH / 2 + 6) +
          '" text-anchor="middle" font-size="11" font-weight="800" fill="#1e293b">P=' +
          pri +
          "</text>",
        '<text x="' +
          (x + cellW / 2) +
          '" y="' +
          (y + cellH / 2 + 22) +
          '" text-anchor="middle" font-size="7" fill="#64748b">' +
          (isPrimary ? "★ 主軸" : "交叉策略") +
          "</text>"
      );
    });

    if (matrix.Delta_Variance != null) {
      svg.push(
        '<text x="' +
          w / 2 +
          '" y="' +
          (h - 8) +
          '" text-anchor="middle" font-size="9" font-weight="700" fill="#dc2626">Delta_Variance=' +
          matrix.Delta_Variance +
          " · conflict_SO_WO=" +
          (matrix.conflict_SO_WO != null ? matrix.conflict_SO_WO : "—") +
          "</text>"
      );
    }

    svg.push("</svg>");
    return svg.join("");
  }

  function strategyCardHtml(cross, activeId, matrix) {
    activeId = activeId || "WO";
    cross = cross || {};
    matrix = matrix || {};
    var strat = cross[activeId];
    if (!strat) return "";
    var meta = CROSS_META[activeId];
    var delta = strat.delta_coefficient != null ? strat.delta_coefficient : (matrix.delta_per_cross && matrix.delta_per_cross[activeId]);
    return (
      '<div class="swot-strategy-card" id="swot-strategy-card" style="border-left:4px solid ' +
      meta.color +
      ';background:' +
      meta.bg +
      '20">' +
      "<h4>" +
      esc(strat.title) +
      "</h4>" +
      '<p class="text-sm">' +
      esc(strat.body) +
      "</p>" +
      '<p class="text-xs font-bold mt-2">優先級 P=' +
      esc(String(strat.priority_score != null ? strat.priority_score : "—")) +
      "/100 · Δ 係數=" +
      esc(String(delta != null ? delta : "—")) +
      (strat.leverage ? " · 槓桿：" + esc(strat.leverage) : "") +
      "</p>" +
      (matrix.pastoral_override && activeId === "WO"
        ? '<p class="text-xs text-rose-800 font-bold mt-2">' + esc(matrix.pastoral_override) + "</p>"
        : "") +
      "</div>"
    );
  }

  function algorithmTraceHtml(matrix) {
    matrix = matrix || {};
    var w = matrix.weights || {};
  return (
      '<div class="acs-card swot-algo-trace text-xs">' +
      "<h4>📐 calculateMatrix() 運算軌跡（Weihrich_TOWS_v1）</h4>" +
      "<p><strong>S_avg</strong>=" +
      esc(String(w.S_avg != null ? w.S_avg : w.S_w)) +
      " · <strong>W_avg</strong>=" +
      esc(String(w.W_avg != null ? w.W_avg : w.W_i)) +
      " · <strong>O_avg</strong>=" +
      esc(String(w.O_avg != null ? w.O_avg : w.O_j)) +
      " · <strong>T_avg</strong>=" +
      esc(String(w.T_avg != null ? w.T_avg : w.T_k)) +
      "</p>" +
      "<p>P_raw: SO=" +
      esc(String(matrix.P_raw && matrix.P_raw.SO)) +
      " · WO=" +
      esc(String(matrix.P_raw && matrix.P_raw.WO)) +
      " · <strong>Delta_Variance</strong>=" +
      esc(String(matrix.Delta_Variance)) +
      " · conflict_SO_WO=" +
      esc(String(matrix.conflict_SO_WO)) +
      "</p>" +
      '<p class="text-slate-500">' +
      esc(matrix.literature || "") +
      "</p></div>"
    );
  }

  function deltaTableHtml(deltaRows) {
    deltaRows = deltaRows || [];
    var body = deltaRows
      .map(function (row) {
        var alert = String(row.delta || "").indexOf("Delta_Variance") >= 0 ? ' class="swot-delta-row--alert"' : "";
        return (
          "<tr" +
          alert +
          "><td><strong>" +
          esc(row.axis) +
          "</strong></td><td>" +
          esc(row.tension) +
          "</td><td>" +
          esc(row.delta) +
          "</td><td class=\"text-xs\">" +
          esc(row.resolution) +
          "</td></tr>"
        );
      })
      .join("");
    return (
      '<table class="acs-table swot-delta-table"><thead><tr><th>交叉軸</th><th>張力</th><th>Δ / 係數</th><th>收網策略</th></tr></thead><tbody>' +
      body +
      "</tbody></table>"
    );
  }

  function quadrantSummaryHtml(quadrants) {
    quadrants = quadrants || {};
    return ["S", "W", "O", "T"]
      .map(function (k) {
        var q = quadrants[k] || {};
        var cls = k === "W" ? " swot-quad--weak" : k === "S" ? " swot-quad--strong" : "";
        return (
          '<div class="swot-quad-chip' +
          cls +
          '"><span class="swot-quad-key">' +
          k +
          (q.weight != null ? " " + q.weight : "") +
          "</span><p>" +
          esc(q.primary || "—") +
          (q.ncd_locked ? ' <span class="swot-ncd-badge">NCD 鎖定</span>' : "") +
          "</p></div>"
        );
      })
      .join("");
  }

  /** 經典 SWOT 四象限輸入摘要（2×2 SVG） */
  function renderSwotSourceQuad(derived) {
    derived = derived || {};
    var quadrants = derived.quadrants || (derived.swot_contract && derived.swot_contract.quadrants) || {};
    var matrix = getMatrix(derived);
    var w = matrix.weights || {};
    var cells = [
      { id: "S", label: "S 優勢", sub: "內部 · 恩賜邊界", color: "#059669", bg: "#d1fae5", x: 0, y: 0, avg: w.S_avg },
      { id: "W", label: "W 劣勢", sub: "內部 · 靈性破口", color: "#dc2626", bg: "#fee2e2", x: 1, y: 0, avg: w.W_avg },
      { id: "O", label: "O 機會", sub: "外部 · 聖靈開門", color: "#0284c7", bg: "#e0f2fe", x: 0, y: 1, avg: w.O_avg },
      { id: "T", label: "T 威脅", sub: "外部 · 爭戰壓力", color: "#7c3aed", bg: "#ede9fe", x: 1, y: 1, avg: w.T_avg }
    ];
    var svgW = 480;
    var svgH = 300;
    var pad = 52;
    var cellW = (svgW - pad * 2) / 2;
    var cellH = (svgH - pad * 2) / 2;
    var svg =
      '<svg class="swot-source-quad-svg" viewBox="0 0 ' +
      svgW +
      " " +
      svgH +
      '" role="img" aria-label="SWOT 四象限輸入摘要">';
    svg +=
      '<text x="' +
      svgW / 2 +
      '" y="18" text-anchor="middle" font-size="10" font-weight="800" fill="#92400e">SWOT 四象限 · 輸入權重摘要</text>';
    svg +=
      '<text x="' +
      (pad + cellW * 0.5) +
      '" y="' +
      (pad - 10) +
      '" text-anchor="middle" font-size="9" font-weight="800" fill="#047857">內部 Internal</text>';
    svg +=
      '<text x="' +
      (pad + cellW * 1.5) +
      '" y="' +
      (pad + cellH * 2 + 22) +
      '" text-anchor="middle" font-size="9" font-weight="800" fill="#0369a1">外部 External</text>';
    cells.forEach(function (c) {
      var q = quadrants[c.id] || {};
      var x = pad + c.x * cellW;
      var y = pad + c.y * cellH;
      var locked = q.ncd_locked && c.id === "W";
      svg +=
        '<rect x="' +
        x +
        '" y="' +
        y +
        '" width="' +
        cellW +
        '" height="' +
        cellH +
        '" rx="8" fill="' +
        c.bg +
        '" stroke="' +
        (locked ? "#dc2626" : c.color) +
        '" stroke-width="' +
        (locked ? 3 : 1.5) +
        '"/>';
      svg +=
        '<text x="' +
        (x + cellW / 2) +
        '" y="' +
        (y + 22) +
        '" text-anchor="middle" font-size="11" font-weight="900" fill="' +
        c.color +
        '">' +
        esc(c.label) +
        "</text>";
      svg +=
        '<text x="' +
        (x + cellW / 2) +
        '" y="' +
        (y + 36) +
        '" text-anchor="middle" font-size="8" fill="#64748b">' +
        esc(c.sub) +
        "</text>";
      svg +=
        '<text x="' +
        (x + cellW / 2) +
        '" y="' +
        (y + cellH / 2 + 4) +
        '" text-anchor="middle" font-size="9" font-weight="800" fill="#1e293b">avg=' +
        esc(String(c.avg != null ? c.avg : "—")) +
        "</text>";
      var primary = q.primary || "—";
      var lines = primary.length > 28 ? primary.slice(0, 26) + "…" : primary;
      svg +=
        '<text x="' +
        (x + cellW / 2) +
        '" y="' +
        (y + cellH / 2 + 22) +
        '" text-anchor="middle" font-size="7.5" fill="#334155">' +
        esc(lines) +
        "</text>";
      if (locked) {
        svg +=
          '<text x="' +
          (x + cellW / 2) +
          '" y="' +
          (y + cellH - 8) +
          '" text-anchor="middle" font-size="7" font-weight="800" fill="#dc2626">NCD 鎖定 W</text>';
      }
    });
    svg += "</svg>";
    return (
      '<div class="swot-source-quad-wrap">' +
      svg +
      '<div class="swot-quad-row swot-quad-row--compact">' +
      quadrantSummaryHtml(quadrants) +
      "</div></div>"
    );
  }

  function renderMatrixBlock(derived, activeId, run) {
    derived = derived || {};
    activeId = activeId || derived.focus_strategy || "WO";
    var contract = derived.swot_contract || {};
    var matrix = getMatrix(derived);
    var cross = derived.cross_strategies || contract.cross_strategies || {};
    var quadrants = derived.quadrants || contract.quadrants || {};
    var delta = derived.delta_analysis || contract.delta_analysis || [];
    var ncd = contract.ncd_link || {};
    var overrideBanner =
      matrix.pastoral_override && activeId === "WO"
        ? '<div class="swot-pastoral-override">' + esc(matrix.pastoral_override) + "</div>"
        : matrix.pastoral_override
          ? '<div class="swot-pastoral-override swot-pastoral-override--dim">' + esc(matrix.pastoral_override) + "</div>"
          : "";
    var heart =
      run && global.AcsReportGold && AcsReportGold.renderReportHeart
        ? AcsReportGold.renderReportHeart(AcsReportGold.buildSwotReportHeart(run))
        : !run && global.AcsReportGold && derived.summary_line
          ? AcsReportGold.renderReportHeart(
              AcsReportGold.buildSwotReportHeart({ derived: derived, is_demo: !!derived.is_preview })
            )
          : "";

    return (
      '<div class="acs-report-block swot-matrix-block">' +
      heart +
      '<div class="acs-report-block"><h3 class="acs-report-block__title">🧭 SWOT 四象限輸入摘要</h3>' +
      renderSwotSourceQuad(derived) +
      "</div>" +
      "<h3>📊 Weihrich TOWS 交叉戰略矩陣</h3>" +
      overrideBanner +
      '<p class="acs-matrix-lead">非靜態 2×2。系統執行 <code>calculateMatrix()</code>：將 NCD 八維轉為 S_w / W_i，與 O_j / T_k 交叉耦合，輸出 SO/ST/WO/WT <strong>優先級 P（0–100）</strong>與 <strong>Delta_Variance</strong>。</p>' +
      algorithmTraceHtml(matrix) +
      '<div class="swot-matrix-svg-wrap" id="swot-matrix-svg-host">' +
      crossMatrixSvg(activeId, matrix) +
      "</div>" +
      '<div id="swot-strategy-host">' +
      strategyCardHtml(cross, activeId, matrix) +
      "</div>" +
      "<h4>Δ 路線衝突落差分析</h4>" +
      deltaTableHtml(delta) +
      '<p class="acs-step-hint">NCD→SWOT 鏈路通電 · 最小因子「<strong>' +
      esc(ncd.minimum_factor_label || "—") +
      "</strong>」 · Delta_Variance=<strong>" +
      esc(String(ncd.Delta_Variance != null ? ncd.Delta_Variance : matrix.Delta_Variance)) +
      "</strong> · <strong>swot_contract v2 已通電</strong></p>" +
      "</div>"
    );
  }

  function bindCrossClicks(host, derived, onSelect) {
    if (!host) return;
    var matrix = getMatrix(derived);
    var cross = derived.cross_strategies || (derived.swot_contract && derived.swot_contract.cross_strategies);
    host.querySelectorAll(".swot-cross-cell").forEach(function (el) {
      el.addEventListener("click", function () {
        var id = el.getAttribute("data-cross");
        if (onSelect) onSelect(id);
        var stratHost = document.getElementById("swot-strategy-host");
        var svgHost = document.getElementById("swot-matrix-svg-host");
        if (svgHost) svgHost.innerHTML = crossMatrixSvg(id, matrix);
        if (stratHost && cross) stratHost.innerHTML = strategyCardHtml(cross, id, matrix);
        bindCrossClicks(host, derived, onSelect);
      });
    });
  }

  global.SwotMatrixViz = {
    renderMatrixBlock: renderMatrixBlock,
    renderSwotSourceQuad: renderSwotSourceQuad,
    crossMatrixSvg: crossMatrixSvg,
    strategyCardHtml: strategyCardHtml,
    algorithmTraceHtml: algorithmTraceHtml,
    deltaTableHtml: deltaTableHtml,
    bindCrossClicks: bindCrossClicks,
    CROSS_META: CROSS_META
  };
})(typeof window !== "undefined" ? window : global);
