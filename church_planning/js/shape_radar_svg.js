/**
 * SHAPE 九大屬靈恩賜 · 純 SVG 雷達圖（不依賴 Chart.js）
 */
(function (global) {
  "use strict";

  var GIFT_ORDER = [
    "teaching",
    "shepherding",
    "encouragement",
    "administration",
    "evangelism",
    "serving",
    "hospitality",
    "worship",
    "discernment"
  ];

  var GIFT_LABELS = {
    teaching: "教導",
    shepherding: "牧養",
    encouragement: "勸慰",
    administration: "治理",
    evangelism: "佈道",
    serving: "服事",
    hospitality: "款待",
    worship: "敬拜",
    discernment: "辨別"
  };

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function polar(cx, cy, radius, angleRad) {
    return { x: cx + radius * Math.cos(angleRad), y: cy + radius * Math.sin(angleRad) };
  }

  /**
   * @param {object} giftScores - derived.gift_scores from ShapePack run
   * @returns {string} HTML block with SVG
   */
  function renderRadarBlock(giftScores) {
    giftScores = giftScores || {};
    var cx = 200;
    var cy = 200;
    var maxR = 130;
    var n = GIFT_ORDER.length;
    var rings = [1, 2, 3, 4, 5];
    var svg = ['<svg class="shape-radar-svg" viewBox="0 0 400 400" role="img" aria-label="九大恩賜雷達圖">'];

    rings.forEach(function (level) {
      var r = (level / 5) * maxR;
      var pts = [];
      for (var i = 0; i < n; i++) {
        var ang = (Math.PI * 2 * i) / n - Math.PI / 2;
        var p = polar(cx, cy, r, ang);
        pts.push(p.x.toFixed(1) + "," + p.y.toFixed(1));
      }
      svg.push(
        '<polygon points="' +
          pts.join(" ") +
          '" fill="none" stroke="#c7d2fe" stroke-width="1" opacity="' +
          (level === 5 ? "0.9" : "0.55") +
          '"/>'
      );
    });

    for (var a = 0; a < n; a++) {
      var axisAng = (Math.PI * 2 * a) / n - Math.PI / 2;
      var outer = polar(cx, cy, maxR, axisAng);
      svg.push(
        '<line x1="' +
          cx +
          '" y1="' +
          cy +
          '" x2="' +
          outer.x.toFixed(1) +
          '" y2="' +
          outer.y.toFixed(1) +
          '" stroke="#e2e8f0" stroke-width="1"/>'
      );
    }

    var dataPts = [];
    var bars = "";
    GIFT_ORDER.forEach(function (key, i) {
      var val = Math.min(5, Math.max(0, Number(giftScores[key]) || 0));
      var ang = (Math.PI * 2 * i) / n - Math.PI / 2;
      var dp = polar(cx, cy, (val / 5) * maxR, ang);
      dataPts.push(dp.x.toFixed(1) + "," + dp.y.toFixed(1));
      var lbl = polar(cx, cy, maxR + 22, ang);
      var anchor = "middle";
      if (lbl.x < cx - 10) anchor = "end";
      else if (lbl.x > cx + 10) anchor = "start";
      svg.push(
        '<text x="' +
          lbl.x.toFixed(1) +
          '" y="' +
          (lbl.y + 4).toFixed(1) +
          '" text-anchor="' +
          anchor +
          '" font-size="11" font-weight="700" fill="#4338ca">' +
          esc(GIFT_LABELS[key]) +
          "</text>"
      );
      svg.push(
        '<text x="' +
          lbl.x.toFixed(1) +
          '" y="' +
          (lbl.y + 16).toFixed(1) +
          '" text-anchor="' +
          anchor +
          '" font-size="9" fill="#64748b">' +
          esc(val.toFixed(1)) +
          "</text>"
      );
    });

    svg.push(
      '<polygon points="' +
        dataPts.join(" ") +
        '" fill="rgba(99,102,241,0.25)" stroke="#4338ca" stroke-width="2.5"/>'
    );
    GIFT_ORDER.forEach(function (key, i) {
      var val = Math.min(5, Math.max(0, Number(giftScores[key]) || 0));
      var ang = (Math.PI * 2 * i) / n - Math.PI / 2;
      var dp = polar(cx, cy, (val / 5) * maxR, ang);
      svg.push('<circle cx="' + dp.x.toFixed(1) + '" cy="' + dp.y.toFixed(1) + '" r="4" fill="#4338ca"/>');
    });

    svg.push("</svg>");

    return (
      '<div class="acs-report-block shape-radar-wrap">' +
      "<h3>📡 九大屬靈恩賜健康度雷達</h3>" +
      '<p class="acs-matrix-lead">由 S 軸題項匯總九項恩賜輪廓（1–5）。<strong>不是排名</strong>；供與牧者交叉五向度，勿單一數字綁架呼召。</p>' +
      '<div class="shape-radar-svg-host">' +
      svg.join("") +
      "</div></div>"
    );
  }

  global.ShapeRadarSvg = {
    GIFT_ORDER: GIFT_ORDER,
    GIFT_LABELS: GIFT_LABELS,
    renderRadarBlock: renderRadarBlock
  };
})(typeof window !== "undefined" ? window : global);
