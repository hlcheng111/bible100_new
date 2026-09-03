/**
 * ALDA 事奉生命週期 · 四維雷達 + 成熟度 Δ 表（純 SVG）
 * A=願景 · L=學習 · D=執行 · Ag=敏捷
 */
(function (global) {
  "use strict";

  var DIM_ORDER = ["A", "L", "D", "Ag"];
  var DIM_LABELS = {
    A: "看方向",
    L: "持續學習",
    D: "把事情做成",
    Ag: "變局中調整"
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

  function badgeForScore(v) {
    v = Number(v) || 0;
    if (global.AcsReportGold && AcsReportGold.renderStatusBadge) {
      if (v >= STAGE_THRESH) return AcsReportGold.renderStatusBadge("ok", "穩定");
      if (v >= 2.5) return AcsReportGold.renderStatusBadge("mid", "成長中");
      return AcsReportGold.renderStatusBadge("low", "陪跑中");
    }
    return v >= STAGE_THRESH ? "穩定" : "陪跑中";
  }

  var GROWTH_COMPANION = {
    A: {
      plain: "看方向",
      companion: "異象太大時，拆成 90 天小實驗；與牧者對齊再推動，不必一次推全部。"
    },
    L: {
      plain: "持續學習",
      companion: "安排 shadow、讀書會或微課程，不要獨自硬扛新事；先肯定已有服事。"
    },
    D: {
      plain: "把事情做成",
      companion: "減少重複行政，騰出反思；戰功值得肯定，也留空間更新方法。"
    },
    Ag: {
      plain: "變局中調整",
      companion: "計劃變更時先與一位同工對齊，小步調整；變革不必全有或全無。"
    }
  };

  var QUAD_DIMS = [
    { key: "A", pos: "tl", title: "看方向", color: "#7c3aed", hint: "異象太大—拆成 90 天小實驗，與牧者對齊" },
    { key: "L", pos: "tr", title: "持續學習", color: "#0284c7", hint: "裝備探索—shadow 與讀書會，不必獨扛" },
    { key: "Ag", pos: "bl", title: "變局中調整", color: "#059669", hint: "變革節奏—先與同工對齊，小步試" },
    { key: "D", pos: "br", title: "把事情做成", color: "#d97706", hint: "可靠交付—減行政重複，騰出反思" }
  ];

  function renderAldaQuadGrid(derived) {
    derived = derived || {};
    var lc = derived.lifecycle || { A: 3, L: 3, D: 3, Ag: 3 };
    var th = derived.lifecycle_threshold != null ? derived.lifecycle_threshold : STAGE_THRESH;
    var weakest = null;
    var minV = 99;
    DIM_ORDER.forEach(function (k) {
      var v = Number(lc[k]) || 0;
      if (v < minV) {
        minV = v;
        weakest = k;
      }
    });
    var cells = QUAD_DIMS.map(function (c) {
      var val = Number(lc[c.key]) || 0;
      var isWeak = weakest === c.key || val < th;
      return (
        '<div class="acs-quad-cell acs-quad-cell--' +
        c.pos +
        (isWeak ? " acs-quad-cell--active" : "") +
        '" style="border-color:' +
        c.color +
        '">' +
        '<div class="acs-quad-cell__head"><strong>' +
        esc(c.title) +
        "</strong> " +
        badgeForScore(val) +
        '<span class="acs-quad-cell__pct">' +
        val.toFixed(1) +
        "</span></div>" +
        '<p class="acs-quad-cell__harm">陪伴参考線 ' +
        th +
        " · 本輪分數 " +
        val.toFixed(1) +
        "</p>" +
        '<p class="acs-quad-cell__action"><strong>陪伴提示：</strong>' +
        esc(c.hint) +
        "</p></div>"
      );
    }).join("");
    return (
      '<div class="acs-quad-grid" aria-label="ALDA 四維生命週期四格">' +
      '<p class="acs-quad-grid__hint">四格對照 · 虛線 = 陪伴参考 · 亮框 = 本季最宜陪跑（非考核）</p>' +
      cells +
      "</div>"
    );
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
      '<text x="200" y="18" text-anchor="middle" font-size="11" font-weight="800" fill="#4338ca">ALDA 四維生命週期成長輪廓</text>'
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

  function growthCompanionTable(derived) {
    var lc = derived.lifecycle || { A: 3, L: 3, D: 3, Ag: 3 };
    var body = DIM_ORDER.map(function (key) {
      var v = Number(lc[key]) || 0;
      var gc = GROWTH_COMPANION[key] || { plain: key, companion: "與牧者談一個小步突破。" };
      var tone = v < STAGE_THRESH ? " alda-delta--alert" : "";
      return (
        "<tr><td><strong>" +
        esc(gc.plain) +
        '</strong><span class="alda-num' +
        tone +
        '"> · ' +
        v.toFixed(1) +
        "</span></td><td>" +
        esc(gc.companion) +
        "</td></tr>"
      );
    }).join("");
      return (
        '<table class="acs-table alda-growth-table"><thead><tr><th>面向</th><th>牧養陪伴建議</th></tr></thead><tbody>' +
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
        " — 分數偏低的那一面向，宜先陪跑，不作淘汰。";
    var tagFn =
      global.CoachingDeskContent && CoachingDeskContent.pastorPracticeTag
        ? CoachingDeskContent.pastorPracticeTag.bind(CoachingDeskContent)
        : function () {
            return "";
          };

    return (
      '<div class="acs-report-block alda-lifecycle-block" id="alda-zone-radar">' +
      "<h3>帶領生命週期一覽</h3>" +
      tagFn("private", "先看四格與下方表格，在安靜中為同工禱告，看見亮點與本季陪跑區。") +
      '<p class="acs-matrix-lead">四個面向：<strong>看方向 · 持續學習 · 把事情做成 · 變局中調整</strong>。分數僅供<strong>陪伴參考</strong>，不是考核判決。</p>' +
      '<p class="acs-step-hint">階段輪廓：<strong>' +
      esc(pos.profile_label || "—") +
      "</strong> · 帶領風格：" +
      esc(derived.primary || "—") +
      "／" +
      esc(derived.secondary || "—") +
      "</p>" +
      renderAldaQuadGrid(derived) +
      '<div class="alda-radar-wrap">' +
      lifecycleRadarSvg(lc) +
      "</div>" +
      "<h4 class=\"acs-report-zone-title\">【牧養雷達】同工優勢與成長守護區（非考核）</h4>" +
      tagFn("both", "表格右欄可直接當話題；談話時先肯定，再聊哪一軸想有人陪。") +
      growthCompanionTable(derived) +
      '<div class="acs-affirm">' +
      esc(note) +
      "</div></div>"
    );
  }

  global.AldaLifecycleViz = {
    renderLifecycleBlock: renderLifecycleBlock,
    renderAldaQuadGrid: renderAldaQuadGrid,
    lifecycleRadarSvg: lifecycleRadarSvg,
    DIM_ORDER: DIM_ORDER,
    DIM_LABELS: DIM_LABELS
  };
})(typeof window !== "undefined" ? window : global);
