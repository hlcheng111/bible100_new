/**
 * ALDA 事奉生命週期 · 四維雷達 + 成熟度 Δ 表（純 SVG）
 * A=願景 · L=學習 · D=執行 · Ag=敏捷
 */
(function (global) {
  "use strict";

  var DIM_ORDER = ["A", "L", "D", "Ag"];
  var DIM_LABELS = {
    A: "A 願景 Aspiration",
    L: "L 學習 Learning",
    D: "D 執行 Delivery",
    Ag: "Ag 敏捷 Agility"
  };
  var STAGE_THRESH = 3.0;

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
    return Math.round(n * 10) / 10;
  }

  function lifecycleRadarSvg(lc) {
    lc = lc || { A: 3, L: 3, D: 3, Ag: 3 };
    var cx = 200;
    var cy = 210;
    var maxR = 120;
    var n = DIM_ORDER.length;
    var rings = [1, 2, 3, 4, 5];
    var svg = [
      '<svg class="alda-radar-svg" viewBox="0 0 400 420" role="img" aria-label="ALDA 四維生命週期雷達圖">',
      '<text x="200" y="18" text-anchor="middle" font-size="11" font-weight="800" fill="#4338ca">ALDA 帶領力生命週期雷達 · 漏斗能量環</text>'
    ];

    rings.forEach(function (level) {
      var r = (level / 5) * maxR;
      var pts = [];
      for (var i = 0; i < n; i++) {
        var ang = (Math.PI * 2 * i) / n - Math.PI / 2;
        var p = polar(cx, cy, r, ang);
        pts.push(p.x.toFixed(1) + "," + p.y.toFixed(1));
      }
      var stroke = level === STAGE_THRESH ? "#a78bfa" : "#c7d2fe";
      var sw = level === STAGE_THRESH ? "1.5" : "1";
      svg.push(
        '<polygon points="' +
          pts.join(" ") +
          '" fill="none" stroke="' +
          stroke +
          '" stroke-width="' +
          sw +
          '" stroke-dasharray="' +
          (level === STAGE_THRESH ? "4 3" : "none") +
          '" opacity="' +
          (level === 5 ? "0.95" : "0.55") +
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
    DIM_ORDER.forEach(function (key, i) {
      var val = Math.min(5, Math.max(0, Number(lc[key]) || 0));
      var ang = (Math.PI * 2 * i) / n - Math.PI / 2;
      var dp = polar(cx, cy, (val / 5) * maxR, ang);
      dataPts.push(dp.x.toFixed(1) + "," + dp.y.toFixed(1));
      var lbl = polar(cx, cy, maxR + 28, ang);
      var anchor = "middle";
      if (lbl.x < cx - 8) anchor = "end";
      else if (lbl.x > cx + 8) anchor = "start";
      svg.push(
        '<text x="' +
          lbl.x.toFixed(1) +
          '" y="' +
          (lbl.y + 4).toFixed(1) +
          '" text-anchor="' +
          anchor +
          '" font-size="9" font-weight="700" fill="#334155">' +
          esc(DIM_LABELS[key] || key) +
          "</text>"
      );
      svg.push(
        '<text x="' +
          lbl.x.toFixed(1) +
          '" y="' +
          (lbl.y + 16).toFixed(1) +
          '" text-anchor="' +
          anchor +
          '" font-size="9" font-weight="800" fill="#7c3aed">' +
          val.toFixed(1) +
          "</text>"
      );
    });

    svg.push(
      '<polygon points="' +
        dataPts.join(" ") +
        '" fill="rgba(124,58,237,0.18)" stroke="#7c3aed" stroke-width="2.5"/>'
    );

    var stageR = [maxR * 0.35, maxR * 0.6, maxR * 0.85];
    var stageLabels = ["試任陪跑", "小組長梯隊", "核心長執"];
    stageR.forEach(function (sr, idx) {
      svg.push(
        '<circle cx="' +
          cx +
          '" cy="' +
          cy +
          '" r="' +
          sr.toFixed(1) +
          '" fill="none" stroke="#fde68a" stroke-width="1" opacity="0.45"/>'
      );
      svg.push(
        '<text x="' +
          (cx + sr + 4) +
          '" y="' +
          (cy - 2) +
          '" font-size="7" fill="#b45309" opacity="0.85">' +
          esc(stageLabels[idx]) +
          "</text>"
      );
    });

    svg.push("</svg>");
    return svg.join("");
  }

  function deltaTableHtml(derived) {
    var lc = derived.lifecycle || { A: 3, L: 3, D: 3, Ag: 3 };
    var th = derived.lifecycle_threshold != null ? derived.lifecycle_threshold : STAGE_THRESH;
    var body = DIM_ORDER.map(function (key) {
      var v = Number(lc[key]) || 0;
      var delta = round1(v - th);
      var alert = v < th ? " alda-delta--alert" : "";
      return (
        "<tr><td><strong>" +
        esc(DIM_LABELS[key] || key) +
        '</strong></td><td class="alda-num">' +
        v.toFixed(1) +
        '</td><td class="alda-num">' +
        th +
        '</td><td class="alda-num' +
        alert +
        '">' +
        (delta >= 0 ? "+" : "") +
        delta +
        "</td></tr>"
      );
    }).join("");
    return (
      '<table class="acs-table alda-delta-table"><thead><tr><th>維度</th><th>得分</th><th>梯隊門檻</th><th>Δ</th></tr></thead><tbody>' +
      body +
      "</tbody></table>"
    );
  }

  function renderLifecycleBlock(derived) {
    derived = derived || {};
    var lc = derived.lifecycle || { A: 3, L: 3, D: 3, Ag: 3 };
    var pos = derived.lifecycle_position || {};
    var note =
      derived.lifecycle_note ||
      (pos.profile_label || "生命週期輪廓") +
        " — 門檻 " +
        (derived.lifecycle_threshold != null ? derived.lifecycle_threshold : STAGE_THRESH) +
        " 以下宜陪跑，不作淘汰。";

    return (
      '<div class="acs-report-block alda-lifecycle-block">' +
      "<h3>📊 ALDA 四維生命週期雷達／漏斗能量環</h3>" +
      '<p class="acs-matrix-lead">四軸：<strong>A 願景 · L 學習 · D 執行 · Ag 敏捷</strong>。虛線環 = 梯隊門檻 3.0；黃色漏斗環 = 試任→小組長→長執能量帶。<strong>帶領力是流動的，不是一次打分。</strong></p>' +
      '<p class="acs-step-hint">階段輪廓：<strong>' +
      esc(pos.profile_label || "—") +
      "</strong> · 主使徒「" +
      esc(derived.primary || "—") +
      "」／副使徒「" +
      esc(derived.secondary || "—") +
      "」</p>" +
      '<div class="alda-radar-wrap">' +
      lifecycleRadarSvg(lc) +
      "</div>" +
      "<h4>Δ 成熟度階梯（相對梯隊門檻 " +
      (derived.lifecycle_threshold != null ? derived.lifecycle_threshold : STAGE_THRESH) +
      "）</h4>" +
      deltaTableHtml(derived) +
      '<div class="acs-affirm">' +
      esc(note) +
      "</div></div>"
    );
  }

  global.AldaLifecycleViz = {
    renderLifecycleBlock: renderLifecycleBlock,
    lifecycleRadarSvg: lifecycleRadarSvg,
    DIM_ORDER: DIM_ORDER,
    DIM_LABELS: DIM_LABELS
  };
})(typeof window !== "undefined" ? window : global);
