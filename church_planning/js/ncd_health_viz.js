/**
 * NCD 教會健康 · 八維雷達 + 最小因子木桶短板分析（純 SVG）
 */
(function (global) {
  "use strict";

  var THRESHOLD = 3.0;

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function polar(cx, cy, radius, angleRad) {
    return { x: cx + radius * Math.cos(angleRad), y: cy + radius * Math.sin(angleRad) };
  }

  function round1(n) {
    return Math.round(Number(n) * 10) / 10;
  }

  function getDims(derived) {
    if (global.NcdPack && NcdPack.INTL_DIMS) return NcdPack.INTL_DIMS;
    return (derived.eight_dimensions || []).map(function (d) {
      return { id: d.id, label: d.label };
    });
  }

  function radarSvg(dimScores, minId) {
    var dims = global.NcdPack ? NcdPack.INTL_DIMS : [];
    if (!dims.length) return "";
    var cx = 220;
    var cy = 220;
    var maxR = 130;
    var n = dims.length;
    var svg = [
      '<svg class="ncd-health-radar-svg" viewBox="0 0 440 440" role="img" aria-label="NCD 八維健康雷達圖">',
      '<text x="220" y="16" text-anchor="middle" font-size="11" font-weight="800" fill="#4338ca">NCD 八維健康雷達 · 紅色軸＝最小因子（木桶短板）</text>'
    ];

    [1, 2, 3, 4, 5].forEach(function (lv) {
      var r = (lv / 5) * maxR;
      var stroke = lv === 3 ? "#f87171" : "#e2e8f0";
      var dash = lv === 3 ? ' stroke-dasharray="5 4"' : "";
      svg.push(
        '<circle cx="' +
          cx +
          '" cy="' +
          cy +
          '" r="' +
          r +
          '" fill="none" stroke="' +
          stroke +
          '" stroke-width="' +
          (lv === 3 ? "1.5" : "1") +
          '"' +
          dash +
          "/>"
      );
    });

    var dataPts = [];
    dims.forEach(function (dim, i) {
      var val = Math.min(5, Math.max(0, Number(dimScores[dim.id]) || 0));
      var ang = (Math.PI * 2 * i) / n - Math.PI / 2;
      var outer = polar(cx, cy, maxR, ang);
      svg.push(
        '<line x1="' +
          cx +
          '" y1="' +
          cy +
          '" x2="' +
          outer.x.toFixed(1) +
          '" y2="' +
          outer.y.toFixed(1) +
          '" stroke="#cbd5e1" stroke-width="1"/>'
      );
      var dp = polar(cx, cy, (val / 5) * maxR, ang);
      dataPts.push(dp.x.toFixed(1) + "," + dp.y.toFixed(1));
      var lbl = polar(cx, cy, maxR + 28, ang);
      var isMin = dim.id === minId;
      svg.push(
        '<text x="' +
          lbl.x.toFixed(1) +
          '" y="' +
          (lbl.y + 3).toFixed(1) +
          '" text-anchor="middle" font-size="8" font-weight="' +
          (isMin ? "900" : "700") +
          '" fill="' +
          (isMin ? "#dc2626" : "#4338ca") +
          '">' +
          esc(dim.label.length > 6 ? dim.label.slice(0, 6) + "…" : dim.label) +
          "</text>"
      );
      svg.push(
        '<text x="' +
          lbl.x.toFixed(1) +
          '" y="' +
          (lbl.y + 14).toFixed(1) +
          '" text-anchor="middle" font-size="9" font-weight="800" fill="' +
          (isMin ? "#dc2626" : "#64748b") +
          '">' +
          val.toFixed(1) +
          "</text>"
      );
    });

    svg.push(
      '<polygon points="' +
        dataPts.join(" ") +
        '" fill="rgba(79,70,229,0.2)" stroke="#4338ca" stroke-width="2.5"/>'
    );
    dims.forEach(function (dim, i) {
      var val = Math.min(5, Math.max(0, Number(dimScores[dim.id]) || 0));
      var ang = (Math.PI * 2 * i) / n - Math.PI / 2;
      var dp = polar(cx, cy, (val / 5) * maxR, ang);
      var isMin = dim.id === minId;
      svg.push(
        '<circle cx="' +
          dp.x.toFixed(1) +
          '" cy="' +
          dp.y.toFixed(1) +
          '" r="' +
          (isMin ? "6" : "4") +
          '" fill="' +
          (isMin ? "#dc2626" : "#4338ca") +
          '" stroke="#fff" stroke-width="1.5"/>'
      );
    });
    svg.push("</svg>");
    return svg.join("");
  }

  function deltaTableHtml(derived) {
    var dims = global.NcdPack ? NcdPack.INTL_DIMS : [];
    var scores = derived.dim_scores || {};
    var min = derived.minimum_factor || {};
    var body = dims
      .map(function (dim) {
        var v = Number(scores[dim.id]) || 0;
        var delta = round1(v - THRESHOLD);
        var isMin = dim.id === min.id;
        var alert = v < THRESHOLD ? " ncd-delta--alert" : "";
        return (
          "<tr" +
          (isMin ? ' class="ncd-delta-row--min"' : "") +
          "><td><strong>" +
          esc(dim.label) +
          (isMin ? " ⚠ 最小因子" : "") +
          '</strong></td><td class="ncd-num">' +
          v.toFixed(1) +
          '</td><td class="ncd-num">' +
          THRESHOLD +
          '</td><td class="ncd-num' +
          alert +
          '">' +
          (delta >= 0 ? "+" : "") +
          delta +
          "</td></tr>"
        );
      })
      .join("");
    return (
      '<table class="acs-table ncd-delta-table"><thead><tr><th>維度</th><th>得分</th><th>健康門檻</th><th>Δ</th></tr></thead><tbody>' +
      body +
      "</tbody></table>"
    );
  }

  function renderHealthBlock(derived) {
    derived = derived || {};
    var scores = derived.dim_scores || {};
    var min = derived.minimum_factor || {};
    var note =
      derived.ncd_note ||
      (min.label
        ? "最小因子「" +
          min.label +
          "」(" +
          (min.score != null ? min.score : "—") +
          " 分) — 本年度 PDCA 唯一攻堅主軸。"
        : "完成測評後顯示最小因子。");

    return (
      '<div class="acs-report-block ncd-health-block">' +
      "<h3>📊 NCD 八維度健康雷達（木桶最小因子）</h3>" +
      '<p class="acs-matrix-lead">虛線環 = 健康門檻 3.0；<strong>紅色軸與紅點 = 限制整個堂會發展的木桶短板</strong>。湧泉能湧多高，取決於最窄河道。</p>' +
      '<p class="acs-step-hint">最小因子：<strong class="text-rose-800">' +
      esc(min.label || "—") +
      "</strong> · " +
      esc(String(min.score != null ? min.score : "—")) +
      " / 5 · 整體 " +
      esc(derived.healthLabel || "—") +
      "（均分 " +
      esc(String(derived.overallNormalized != null ? derived.overallNormalized : "—")) +
      "）</p>" +
      '<div class="ncd-health-radar-wrap">' +
      radarSvg(scores, min.id) +
      "</div>" +
      "<h4>Δ 短板衝擊分析（相對門檻 " +
      THRESHOLD +
      "）</h4>" +
      deltaTableHtml(derived) +
      '<div class="acs-affirm">' +
      esc(note) +
      "</div></div>"
    );
  }

  global.NcdHealthViz = {
    renderHealthBlock: renderHealthBlock,
    radarSvg: radarSvg,
    deltaTableHtml: deltaTableHtml
  };
})(typeof window !== "undefined" ? window : global);
