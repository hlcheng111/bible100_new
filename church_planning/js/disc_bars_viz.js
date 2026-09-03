/**
 * DISC 四軸 · 自評風格 vs 工作壓力修飾風格（純 SVG 分組柱狀圖）
 */
(function (global) {
  "use strict";

  var AXES = [
    { key: "D", label: "D 推進", color: "#dc2626", bg: "#fee2e2" },
    { key: "I", label: "I 影響", color: "#d97706", bg: "#fef3c7" },
    { key: "S", label: "S 穩定", color: "#059669", bg: "#d1fae5" },
    { key: "C", label: "C 嚴謹", color: "#0284c7", bg: "#e0f2fe" }
  ];

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function score(d, prefix, key) {
    var bag = prefix === "stress" ? d.stress_scores || {} : d.scores || {};
    return Number(bag[key]) || 0;
  }

  /** 分組柱狀圖 + 折線連接壓力輪廓 */
  function groupedBarsSvg(derived) {
    var w = 420;
    var h = 280;
    var padL = 44;
    var padR = 16;
    var padT = 36;
    var padB = 52;
    var chartW = w - padL - padR;
    var chartH = h - padT - padB;
    var maxVal = 5;
    var groupW = chartW / AXES.length;
    var barW = groupW * 0.28;
    var gap = groupW * 0.08;

    var svg = [
      '<svg class="disc-bars-svg" viewBox="0 0 ' +
        w +
        " " +
        h +
        '" role="img" aria-label="DISC 自評與壓力修飾四軸對比">'
    ];

    for (var ring = 1; ring <= 5; ring++) {
      var y = padT + chartH - (ring / maxVal) * chartH;
      svg.push(
        '<line x1="' +
          padL +
          '" y1="' +
          y +
          '" x2="' +
          (w - padR) +
          '" y2="' +
          y +
          '" stroke="#e2e8f0" stroke-width="1"/>'
      );
      svg.push(
        '<text x="' +
          (padL - 6) +
          '" y="' +
          (y + 4) +
          '" text-anchor="end" font-size="9" fill="#94a3b8">' +
          ring +
          "</text>"
      );
    }

    var stressPts = [];

    AXES.forEach(function (ax, i) {
      var gx = padL + i * groupW + groupW / 2;
      var nat = score(derived, "natural", ax.key);
      var str = score(derived, "stress", ax.key);
      var natH = (nat / maxVal) * chartH;
      var strH = (str / maxVal) * chartH;
      var natX = gx - barW - gap / 2;
      var strX = gx + gap / 2;
      var baseY = padT + chartH;

      svg.push(
        '<rect x="' +
          natX +
          '" y="' +
          (baseY - natH) +
          '" width="' +
          barW +
          '" height="' +
          natH +
          '" fill="' +
          ax.color +
          '" opacity="0.85" rx="3"/>'
      );
      svg.push(
        '<rect x="' +
          strX +
          '" y="' +
          (baseY - strH) +
          '" width="' +
          barW +
          '" height="' +
          strH +
          '" fill="' +
          ax.color +
          '" opacity="0.35" stroke="' +
          ax.color +
          '" stroke-width="2" stroke-dasharray="4 2" rx="3"/>'
      );
      svg.push(
        '<text x="' +
          natX +
          '" y="' +
          (baseY - natH - 4) +
          '" font-size="9" font-weight="800" fill="' +
          ax.color +
          '">' +
          nat +
          "</text>"
      );
      svg.push(
        '<text x="' +
          strX +
          '" y="' +
          (baseY - strH - 4) +
          '" font-size="9" font-weight="800" fill="#64748b">' +
          str +
          "</text>"
      );
      svg.push(
        '<text x="' +
          gx +
          '" y="' +
          (h - 28) +
          '" text-anchor="middle" font-size="11" font-weight="800" fill="#1e293b">' +
          esc(ax.label) +
          "</text>"
      );
      stressPts.push({ x: strX + barW / 2, y: baseY - strH });
    });

    if (stressPts.length === 4) {
      var line =
        "M" +
        stressPts[0].x +
        " " +
        stressPts[0].y +
        " L" +
        stressPts[1].x +
        " " +
        stressPts[1].y +
        " L" +
        stressPts[2].x +
        " " +
        stressPts[2].y +
        " L" +
        stressPts[3].x +
        " " +
        stressPts[3].y;
      svg.push(
        '<path d="' +
          line +
          '" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4" opacity="0.7"/>'
      );
      stressPts.forEach(function (p) {
        svg.push('<circle cx="' + p.x + '" cy="' + p.y + '" r="4" fill="#fff" stroke="#64748b" stroke-width="2"/>');
      });
    }

    svg.push(
      '<text x="' +
        (padL + 4) +
        '" y="18" font-size="10" font-weight="800" fill="#4338ca">■ 自評風格</text>'
    );
    svg.push(
      '<text x="' +
        (padL + 88) +
        '" y="18" font-size="10" font-weight="800" fill="#64748b">▨ 工作壓力修飾</text>'
    );
    svg.push("</svg>");
    return svg.join("");
  }

  function deltaTableHtml(derived) {
    var rows = AXES.map(function (ax) {
      var nat = score(derived, "natural", ax.key);
      var str = score(derived, "stress", ax.key);
      var delta = Math.round((str - nat) * 10) / 10;
      var deltaStr = (delta >= 0 ? "+" : "") + delta;
      var alert = Math.abs(delta) >= 0.8 ? " disc-delta--alert" : "";
      return (
        "<tr><td><strong>" +
        esc(ax.label) +
        '</strong></td><td class="disc-num">' +
        nat +
        '</td><td class="disc-num">' +
        str +
        '</td><td class="disc-num' +
        alert +
        '">' +
        deltaStr +
        "</td></tr>"
      );
    }).join("");
    return (
      '<table class="acs-table disc-compare-table"><thead><tr><th>軸</th><th>自評</th><th>壓力修飾</th><th>Δ</th></tr></thead><tbody>' +
      rows +
      "</tbody></table>"
    );
  }

  /**
   * DISC 四格風格輪（D/I/S/C · 自評 vs 壓力修飾）
   */
  function renderDiscQuadrantGrid(derived) {
    derived = derived || {};
    var nat = derived.scores || {};
    var str = derived.stress_scores || {};
    var cells = [
      { key: "D", cls: "acs-disc-trait--d", corner: "推進" },
      { key: "I", cls: "acs-disc-trait--i", corner: "影響" },
      { key: "S", cls: "acs-disc-trait--s", corner: "穩定" },
      { key: "C", cls: "acs-disc-trait--c", corner: "嚴謹" }
    ];
    var primary = derived.primary || "";
    var stressPrimary = derived.stress_primary || "";
    var html =
      '<div class="acs-quad-grid disc-style-quad" role="img" aria-label="DISC 四型輪廓格">';
    cells.forEach(function (c) {
      var n = score(derived, "natural", c.key);
      var s = score(derived, "stress", c.key);
      var delta = Math.round((s - n) * 10) / 10;
      var activeNat = c.key === primary ? " acs-quad-cell--active" : "";
      var activeStr = c.key === stressPrimary && stressPrimary !== primary ? " disc-quad-cell--stress" : "";
      html +=
        '<div class="acs-quad-cell ' +
        c.cls +
        activeNat +
        activeStr +
        '">' +
        '<p class="acs-quad-cell__title">' +
        esc(c.key) +
        " · " +
        esc(c.corner) +
        "</p>" +
        '<p class="disc-quad-scores"><span class="disc-quad-nat">' +
        n +
        '</span><span class="disc-quad-sep">→</span><span class="disc-quad-str">' +
        s +
        "</span></p>" +
        '<p class="acs-quad-cell__harm">自評 → 壓力修飾 · Δ' +
        (delta >= 0 ? "+" : "") +
        delta +
        "</p>" +
        (c.key === primary
          ? '<span class="acs-quad-cell__tag">主型</span>'
          : c.key === stressPrimary && stressPrimary !== primary
            ? '<span class="acs-quad-cell__tag">壓力修飾</span>'
            : "") +
        "</div>";
    });
    html += "</div>";
    return html;
  }

  /**
   * @param {object} derived - run.derived（須含 scores、stress_scores）
   */
  function renderCompareBlock(derived) {
    derived = derived || {};
    if (!derived.scores) return "";
    var primary = derived.primary_label || derived.primary || "—";
    var stressPrimary =
      derived.stress_primary_label ||
      (derived.stress_primary && global.DiscPack && DiscPack.STYLE_LABELS
        ? DiscPack.STYLE_LABELS[derived.stress_primary]
        : derived.stress_primary) ||
      "—";
    var note =
      derived.stress_note ||
      "壓力修飾輪廓反映事工張力下的溝通調適，不是「真實性格改變」；供牧者談節奏與互補配搭。";

    return (
      '<div class="acs-report-block disc-bars-block">' +
      "<h3>📊 DISC 四軸對比 · 自評風格 vs 工作壓力修飾</h3>" +
      '<p class="acs-matrix-lead">左柱（實色）＝16 題自評自然風格；右柱（虛線框）＝堂會事工壓力下的修飾輪廓。灰虛線連接壓力輪廓，一眼看出「服事時像誰」。<strong>不修飾事奉大類</strong>（SHAPE 決定）。</p>' +
      '<p class="acs-step-hint">主型：<strong>' +
      esc(primary) +
      "</strong> · 壓力下主修飾：<strong>" +
      esc(stressPrimary) +
      "</strong></p>" +
      '<div class="acs-report-block"><h3 class="acs-report-block__title">🎯 四型輪廓格（一眼主型）</h3>' +
      renderDiscQuadrantGrid(derived) +
      "</div>" +
      '<div class="disc-bars-wrap">' +
      groupedBarsSvg(derived) +
      "</div>" +
      deltaTableHtml(derived) +
      '<div class="acs-affirm">' +
      esc(note) +
      "</div></div>"
    );
  }

  global.DiscBarsViz = {
    renderCompareBlock: renderCompareBlock,
    renderDiscQuadrantGrid: renderDiscQuadrantGrid,
    groupedBarsSvg: groupedBarsSvg
  };
})(typeof window !== "undefined" ? window : global);
