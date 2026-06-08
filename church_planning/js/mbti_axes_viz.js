/**
 * MBTI 四軸 · 雙向能量推拉條（純 SVG，不依賴 Chart.js）
 */
(function (global) {
  "use strict";

  var AXES = [
    { key: "EI", left: "E", leftLabel: "外向 E", right: "I", rightLabel: "內向 I", leftColor: "#f59e0b", rightColor: "#6366f1" },
    { key: "SN", left: "S", leftLabel: "實感 S", right: "N", rightLabel: "直覺 N", leftColor: "#059669", rightColor: "#8b5cf6" },
    { key: "TF", left: "T", leftLabel: "思考 T", right: "F", rightLabel: "情感 F", leftColor: "#0284c7", rightColor: "#ec4899" },
    { key: "JP", left: "J", leftLabel: "判斷 J", right: "P", rightLabel: "感知 P", leftColor: "#4338ca", rightColor: "#14b8a6" }
  ];

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function pct(derived, axisKey, side) {
    var ap = (derived && derived.axis_percents && derived.axis_percents[axisKey]) || {};
    return Number(ap[side]) || 50;
  }

  /** 單軸雙向能量槽 SVG */
  function axisSliderSvg(ax, derived, y, w) {
    var pad = 8;
    var trackW = w - pad * 2;
    var trackH = 22;
    var cx = pad + trackW / 2;
    var leftPct = pct(derived, ax.key, ax.left);
    var rightPct = pct(derived, ax.key, ax.right);
    var dominant = leftPct >= rightPct ? ax.left : ax.right;
    var domPct = Math.max(leftPct, rightPct);
    var margin = Math.abs(leftPct - 50);
    var fillW = (margin / 50) * (trackW / 2);
    var fillX = leftPct >= rightPct ? cx - fillW : cx;
    var fillColor = leftPct >= rightPct ? ax.leftColor : ax.rightColor;
    var markerX = pad + (leftPct / 100) * trackW;
    var balanceLabel = margin < 8 ? "平衡型" : margin < 20 ? "偏態" : "極端型";

    return (
      '<g class="mbti-axis-row" transform="translate(0,' +
      y +
      ')">' +
      '<text x="' +
      pad +
      '" y="-4" font-size="10" font-weight="800" fill="#334155">' +
      esc(ax.leftLabel) +
      " ↔ " +
      esc(ax.rightLabel) +
      "</text>" +
      '<text x="' +
      (w - pad) +
      '" y="-4" text-anchor="end" font-size="9" font-weight="700" fill="#64748b">' +
      esc(balanceLabel) +
      "</text>" +
      '<rect x="' +
      pad +
      '" y="4" width="' +
      trackW +
      '" height="' +
      trackH +
      '" rx="11" fill="#f1f5f9" stroke="#e2e8f0"/>' +
      '<line x1="' +
      cx +
      '" y1="4" x2="' +
      cx +
      '" y2="' +
      (4 + trackH) +
      '" stroke="#94a3b8" stroke-width="2" stroke-dasharray="3 2"/>' +
      '<rect x="' +
      fillX +
      '" y="6" width="' +
      Math.max(fillW, 2) +
      '" height="' +
      (trackH - 4) +
      '" rx="9" fill="' +
      fillColor +
      '" opacity="0.88"/>' +
      '<circle cx="' +
      markerX +
      '" cy="' +
      (4 + trackH / 2) +
      '" r="9" fill="#fff" stroke="' +
      fillColor +
      '" stroke-width="3"/>' +
      '<text x="' +
      pad +
      '" y="' +
      (trackH + 18) +
      '" font-size="9" font-weight="800" fill="' +
      ax.leftColor +
      '">' +
      ax.left +
      " " +
      leftPct +
      "%</text>" +
      '<text x="' +
      (w - pad) +
      '" y="' +
      (trackH + 18) +
      '" text-anchor="end" font-size="9" font-weight="800" fill="' +
      ax.rightColor +
      '">' +
      ax.right +
      " " +
      rightPct +
      "%</text>" +
      '<text x="' +
      cx +
      '" y="' +
      (trackH + 18) +
      '" text-anchor="middle" font-size="10" font-weight="900" fill="#1e293b">→ ' +
      esc(dominant) +
      " " +
      domPct +
      "%</text></g>"
    );
  }

  function allAxesSvg(derived) {
    var w = 440;
    var rowH = 52;
    var h = 24 + AXES.length * rowH;
    var parts = [
      '<svg class="mbti-axes-svg" viewBox="0 0 ' +
        w +
        " " +
        h +
        '" role="img" aria-label="MBTI 四軸雙向能量推拉條">',
      '<text x="' +
        (w / 2) +
        '" y="16" text-anchor="middle" font-size="11" font-weight="800" fill="#4338ca">四軸能量傾斜 · 中心 50% = 平衡點</text>'
    ];
    AXES.forEach(function (ax, i) {
      parts.push(axisSliderSvg(ax, derived, 20 + i * rowH, w));
    });
    parts.push("</svg>");
    return parts.join("");
  }

  function deltaTableHtml(derived) {
    var rows = AXES.map(function (ax) {
      var leftPct = pct(derived, ax.key, ax.left);
      var rightPct = pct(derived, ax.key, ax.right);
      var margin = Math.abs(leftPct - 50);
      var dom = leftPct >= rightPct ? ax.left : ax.right;
      var alert = margin >= 20 ? " mbti-delta--alert" : "";
      return (
        "<tr><td><strong>" +
        esc(ax.left + "↔" + ax.right) +
        '</strong></td><td class="mbti-num">' +
        leftPct +
        "% / " +
        rightPct +
        '%</td><td class="mbti-num">' +
        esc(dom) +
        '</td><td class="mbti-num' +
        alert +
        '">±' +
        margin +
        "%</td></tr>"
      );
    }).join("");
    return (
      '<table class="acs-table mbti-delta-table"><thead><tr><th>維度</th><th>左% / 右%</th><th>主傾向</th><th>離平衡點</th></tr></thead><tbody>' +
      rows +
      "</tbody></table>"
    );
  }

  /**
   * @param {object} derived - run.derived（須含 axis_percents、code）
   */
  function renderAxesBlock(derived) {
    derived = derived || {};
    var code = derived.mbti_code || derived.code || "????";
    var churchLabel = derived.type_label_church || derived.church_type_label || "";
    var note =
      derived.energy_note ||
      "離平衡點 ±20% 以上為「極端型」— 與同字母但接近 51% 的同工並不相同；牧養節奏須看百分比，不能只看四個字母。";

    return (
      '<div class="acs-report-block mbti-axes-block">' +
      "<h3>📊 MBTI 四軸雙向能量槽 · " +
      esc(code) +
      "</h3>" +
      (churchLabel ? '<p class="acs-step-hint">堂會事奉特寫：<strong>' + esc(churchLabel) + "</strong></p>" : "") +
      '<p class="acs-matrix-lead">指針位置 = 能量傾斜百分比；中心虛線為 50/50 平衡點。<strong>非 MBTI® 官方</strong>，不作臨床診斷；供 SHAPE P 軸 Fallback 與牧者對話。</p>' +
      '<div class="mbti-axes-wrap">' +
      allAxesSvg(derived) +
      "</div>" +
      "<h4>Δ 能量落差分析</h4>" +
      deltaTableHtml(derived) +
      '<div class="acs-affirm">' +
      esc(note) +
      "</div></div>"
    );
  }

  global.MbtiAxesViz = {
    renderAxesBlock: renderAxesBlock,
    allAxesSvg: allAxesSvg
  };
})(typeof window !== "undefined" ? window : global);
