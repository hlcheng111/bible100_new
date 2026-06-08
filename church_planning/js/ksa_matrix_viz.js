/**
 * KSA 事奉能力 · 雙軸九宮格定位矩陣（純 SVG）
 * X = (Knowledge + Skills) / 2 · Y = Attitude
 */
(function (global) {
  "use strict";

  var ZONE_LABELS = [
    ["熱血新人區", "成長培育區", "高技低心風險"],
    ["態度優先區", "均衡發展區", "技能達標區"],
    ["待點燃區", "陪跑試任區", "領袖核心區"]
  ];

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function scoreToPct(v) {
    v = Number(v) || 1;
    return Math.round(((v - 1) / 4) * 100);
  }

  function zoneIndex(pct) {
    if (pct < 34) return 0;
    if (pct < 67) return 1;
    return 2;
  }

  function profileLabel(xPct, yPct) {
    var xi = zoneIndex(xPct);
    var yi = zoneIndex(yPct);
    if (xi === 2 && yi === 2) return "領袖核心區 · 三者兼具";
    if (xi <= 1 && yi >= 1 && xi < 2) return "高心志、低技能 · 熱血新人（宜陪跑）";
    if (xi >= 1 && yi <= 1) return "高技能、低心志 · 倦怠老手（宜激勵）";
    return ZONE_LABELS[2 - yi][xi] || "均衡發展";
  }

  function matrixSvg(derived) {
    var ksa = derived.ksa_overall || { K: 3, S: 3, A: 3 };
    var k = Number(ksa.K) || 0;
    var s = Number(ksa.S) || 0;
    var a = Number(ksa.A) || 0;
    var cap = (k + s) / 2;
    var xPct = scoreToPct(cap);
    var yPct = scoreToPct(a);
    var w = 400;
    var h = 360;
    var pad = 52;
    var gw = w - pad * 2;
    var gh = h - pad * 2 - 24;
    var cellW = gw / 3;
    var cellH = gh / 3;
    var px = pad + (xPct / 100) * gw;
    var py = pad + gh - (yPct / 100) * gh;
    var zi = zoneIndex(xPct);
    var zj = zoneIndex(yPct);
    var activeLabel = ZONE_LABELS[2 - zj][zi];

    var svg = [
      '<svg class="ksa-matrix-svg" viewBox="0 0 ' +
        w +
        " " +
        h +
        '" role="img" aria-label="KSA 雙軸九宮格定位矩陣">',
      '<text x="' +
        (w / 2) +
        '" y="18" text-anchor="middle" font-size="11" font-weight="800" fill="#4338ca">KSA 雙軸定位 · X=(K+S)/2 · Y=態度 A</text>'
    ];

    for (var row = 0; row < 3; row++) {
      for (var col = 0; col < 3; col++) {
        var cx = pad + col * cellW;
        var cy = pad + row * cellH;
        var isActive = col === zi && row === 2 - zj;
        svg.push(
          '<rect x="' +
            cx +
            '" y="' +
            cy +
            '" width="' +
            cellW +
            '" height="' +
            cellH +
            '" fill="' +
            (isActive ? "#ddd6fe" : "#f8fafc") +
            '" stroke="' +
            (isActive ? "#7c3aed" : "#e2e8f0") +
            '" stroke-width="' +
            (isActive ? 2.5 : 1) +
            '" rx="4"/>'
        );
        svg.push(
          '<text x="' +
            (cx + cellW / 2) +
            '" y="' +
            (cy + cellH / 2 + 4) +
            '" text-anchor="middle" font-size="8" font-weight="' +
            (isActive ? "800" : "600") +
            '" fill="' +
            (isActive ? "#5b21b6" : "#94a3b8") +
            '">' +
            esc(ZONE_LABELS[row][col]) +
            "</text>"
        );
      }
    }

    svg.push(
      '<line x1="' +
        pad +
        '" y1="' +
        (pad + gh) +
        '" x2="' +
        (pad + gw) +
        '" y2="' +
        (pad + gh) +
        '" stroke="#64748b" stroke-width="2"/>'
    );
    svg.push(
      '<line x1="' +
        pad +
        '" y1="' +
        pad +
        '" x2="' +
        pad +
        '" y2="' +
        (pad + gh) +
        '" stroke="#64748b" stroke-width="2"/>'
    );
    svg.push(
      '<text x="' +
        (pad + gw / 2) +
        '" y="' +
        (h - 8) +
        '" text-anchor="middle" font-size="9" font-weight="700" fill="#334155">X · 能力軸 (K+S)/2 → ' +
        cap.toFixed(1) +
        "</text>"
    );
    svg.push(
      '<text x="12" y="' +
        (pad + gh / 2) +
        '" text-anchor="middle" font-size="9" font-weight="700" fill="#334155" transform="rotate(-90 12 ' +
        (pad + gh / 2) +
        ')">Y · 態度 A</text>'
    );
    svg.push(
      '<circle cx="' +
        px +
        '" cy="' +
        py +
        '" r="11" fill="#fff" stroke="#7c3aed" stroke-width="3"/>'
    );
    svg.push(
      '<circle cx="' +
        px +
        '" cy="' +
        py +
        '" r="4" fill="#7c3aed"/>'
    );
    svg.push(
      '<text x="' +
        (px + 14) +
        '" y="' +
        (py - 8) +
        '" font-size="9" font-weight="800" fill="#5b21b6">' +
        esc(activeLabel) +
        "</text>"
    );
    svg.push("</svg>");
    return { svg: svg.join(""), xPct: xPct, yPct: yPct, cap: cap, a: a, profile: profileLabel(xPct, yPct) };
  }

  function deltaTableHtml(derived) {
    var ksa = derived.ksa_overall || {};
    var th = derived.threshold != null ? derived.threshold : 3;
    var rows = [
      { key: "K", label: "知識 K", v: ksa.K },
      { key: "S", label: "技能 S", v: ksa.S },
      { key: "A", label: "態度 A", v: ksa.A },
      { key: "CAP", label: "能力軸 (K+S)/2", v: ((Number(ksa.K) + Number(ksa.S)) / 2) || 0 }
    ];
    var body = rows
      .map(function (r) {
        var v = Number(r.v) || 0;
        var delta = round1(v - th);
        var alert = v < th ? " ksa-delta--alert" : "";
        return (
          "<tr><td><strong>" +
          esc(r.label) +
          '</strong></td><td class="ksa-num">' +
          v +
          '</td><td class="ksa-num">' +
          th +
          '</td><td class="ksa-num' +
          alert +
          '">' +
          (delta >= 0 ? "+" : "") +
          delta +
          "</td></tr>"
        );
      })
      .join("");
    return (
      '<table class="acs-table ksa-delta-table"><thead><tr><th>維度</th><th>得分</th><th>門檻</th><th>Δ</th></tr></thead><tbody>' +
      body +
      "</tbody></table>"
    );
  }

  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  function renderMatrixBlock(derived) {
    derived = derived || {};
    var plot = matrixSvg(derived);
    var note =
      derived.matrix_note ||
      plot.profile +
        " — 門檻 " +
        (derived.threshold != null ? derived.threshold : 3) +
        " 分以下宜 explore 試任陪跑，不作淘汰。";

    return (
      '<div class="acs-report-block ksa-matrix-block">' +
      "<h3>📊 KSA 雙軸九宮格定位矩陣</h3>" +
      '<p class="acs-matrix-lead">橫軸 = <strong>(知識 K + 技能 S) / 2</strong>；縱軸 = <strong>態度 A</strong>。落點一眼分辨熱血新人、倦怠老手或核心領袖區。<strong>恩賜（SHAPE）決定呼召；KSA 決定能不能做。</strong></p>' +
      '<p class="acs-step-hint">輪廓：<strong>' +
      esc(plot.profile) +
      "</strong> · K" +
      (derived.ksa_overall && derived.ksa_overall.K != null ? derived.ksa_overall.K : "?") +
      " / S" +
      (derived.ksa_overall && derived.ksa_overall.S != null ? derived.ksa_overall.S : "?") +
      " / A" +
      (derived.ksa_overall && derived.ksa_overall.A != null ? derived.ksa_overall.A : "?") +
      "</p>" +
      '<div class="ksa-matrix-wrap">' +
      plot.svg +
      "</div>" +
      "<h4>Δ 失衡度分析（相對門檻 " +
      (derived.threshold != null ? derived.threshold : 3) +
      "）</h4>" +
      deltaTableHtml(derived) +
      '<div class="acs-affirm">' +
      esc(note) +
      "</div></div>"
    );
  }

  global.KsaMatrixViz = {
    renderMatrixBlock: renderMatrixBlock,
    matrixSvg: matrixSvg,
    profileLabel: profileLabel
  };
})(typeof window !== "undefined" ? window : global);
