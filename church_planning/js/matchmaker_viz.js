/**
 * 媒合中心 · 職位門檻（虛線）vs 同工現況（實線）雙層雷達重疊圖（純 SVG）
 */
(function (global) {
  "use strict";

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

  function polygonPoints(cx, cy, maxR, n, values, keys) {
    var pts = [];
    keys.forEach(function (key, i) {
      var val = Math.min(5, Math.max(0, Number(values[key]) || 0));
      var ang = (Math.PI * 2 * i) / n - Math.PI / 2;
      var p = polar(cx, cy, (val / 5) * maxR, ang);
      pts.push(p.x.toFixed(1) + "," + p.y.toFixed(1));
    });
    return pts.join(" ");
  }

  function overlaySvg(required, actual, axisKeys, axisLabels) {
    var cx = 210;
    var cy = 220;
    var maxR = 125;
    var n = axisKeys.length;
    var rings = [1, 2, 3, 4, 5];
    var svg = [
      '<svg class="matchmaker-overlay-svg" viewBox="0 0 420 440" role="img" aria-label="職位門檻與同工現況雙層雷達重疊圖">',
      '<text x="210" y="18" text-anchor="middle" font-size="11" font-weight="800" fill="#4338ca">跨維度恩賜適配 · 虛線=職位門檻 · 實線=同工現況</text>'
    ];

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
          '" fill="none" stroke="#e2e8f0" stroke-width="1" opacity="0.7"/>'
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
          '" stroke="#cbd5e1" stroke-width="1"/>'
      );
      var lbl = polar(cx, cy, maxR + 30, axisAng);
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
          '" font-size="8" font-weight="700" fill="#475569">' +
          esc(axisLabels[a] || axisKeys[a]) +
          "</text>"
      );
    }

    svg.push(
      '<polygon points="' +
        polygonPoints(cx, cy, maxR, n, required, axisKeys) +
        '" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="6 4" opacity="0.95"/>'
    );
    svg.push(
      '<polygon points="' +
        polygonPoints(cx, cy, maxR, n, actual, axisKeys) +
        '" fill="rgba(99,102,241,0.22)" stroke="#4338ca" stroke-width="2.5"/>'
    );

    axisKeys.forEach(function (key, i) {
      var val = Math.min(5, Math.max(0, Number(actual[key]) || 0));
      var ang = (Math.PI * 2 * i) / n - Math.PI / 2;
      var dp = polar(cx, cy, (val / 5) * maxR, ang);
      svg.push(
        '<circle cx="' +
          dp.x.toFixed(1) +
          '" cy="' +
          dp.y.toFixed(1) +
          '" r="5" fill="#4338ca" stroke="#fff" stroke-width="1.5"/>'
      );
    });

    svg.push(
      '<rect x="12" y="400" width="10" height="10" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 3"/>',
      '<text x="28" y="409" font-size="9" fill="#64748b">職位門檻</text>',
      '<rect x="100" y="400" width="10" height="10" fill="rgba(99,102,241,0.35)" stroke="#4338ca" stroke-width="2"/>',
      '<text x="116" y="409" font-size="9" fill="#64748b">同工現況</text>',
      "</svg>"
    );
    return svg.join("");
  }

  function deltaTableHtml(fit) {
    fit = fit || {};
    var axes = fit.axes || [];
    var body = axes
      .map(function (ax) {
        var alert = ax.status === "gap" ? " match-delta--gap" : ax.status === "overflow" ? " match-delta--overflow" : "";
        var icon = ax.status === "gap" ? "⚠" : ax.status === "overflow" ? "✦" : "✓";
        return (
          "<tr><td><strong>" +
          esc(ax.label) +
          '</strong></td><td class="match-num">' +
          ax.required +
          '</td><td class="match-num">' +
          ax.actual +
          '</td><td class="match-num' +
          alert +
          '">' +
          (ax.delta >= 0 ? "+" : "") +
          ax.delta +
          '</td><td class="match-num">' +
          icon +
          " " +
          ax.fit_pct +
          "%</td></tr>"
        );
      })
      .join("");
    return (
      '<table class="acs-table match-delta-table"><thead><tr><th>維度</th><th>門檻</th><th>現況</th><th>Δ</th><th>適配</th></tr></thead><tbody>' +
      body +
      "</tbody></table>"
    );
  }

  function renderOverlayBlock(fit, bundle) {
    fit = fit || {};
    bundle = bundle || {};
    var MC = global.MatchmakerCore;
    var axisKeys = (MC && MC.MATCH_AXES ? MC.MATCH_AXES : []).map(function (a) {
      return a.key;
    });
    var axisLabels = (MC && MC.MATCH_AXES ? MC.MATCH_AXES : []).map(function (a) {
      return a.label;
    });
    if (!axisKeys.length) {
      axisKeys = ["shape_peak", "ksa_capability", "ksa_attitude", "alda_vision", "alda_delivery", "disc_precision"];
      axisLabels = axisKeys;
    }

    var role = (MC && MC.ROLE_BLUEPRINTS && MC.ROLE_BLUEPRINTS[fit.role_id]) || {};
    var required = role.thresholds || {};
    var actual = fit.person || {};

    var coverageNote = "";
    if (bundle.coverage) {
      var done = [];
      var miss = [];
      Object.keys(bundle.coverage).forEach(function (k) {
        if (bundle.coverage[k]) done.push(k);
        else miss.push(k);
      });
      coverageNote =
        "已通電：" +
        (done.length ? done.join(", ") : "—") +
        (miss.length ? " · 缺：" + miss.join(", ") + "（已用 Fallback）" : "");
    }

    return (
      '<div class="acs-report-block matchmaker-overlay-block">' +
      "<h3>📊 跨維度恩賜雷達重疊圖（" +
      esc(fit.role_label || "職位") +
      "）</h3>" +
      '<p class="acs-matrix-lead">虛線 = 職位剛性門檻；實線 = 同工六戰聚合現況。<strong>溢出（✦）= 適配亮點；塌陷（⚠）= 牧養補足區。</strong></p>' +
      '<p class="acs-step-hint">綜合適配度：<strong>' +
      (fit.overall_pct != null ? fit.overall_pct : "—") +
      "%</strong> · " +
      esc(fit.role_note || "") +
      (bundle.person_name ? " · 同工：" + esc(bundle.person_name) : "") +
      "</p>" +
      (coverageNote ? '<p class="acs-step-hint">' + esc(coverageNote) + "</p>" : "") +
      '<div class="matchmaker-overlay-wrap">' +
      overlaySvg(required, actual, axisKeys, axisLabels) +
      "</div>" +
      "<h4>Δ 缺口媒合分析表</h4>" +
      deltaTableHtml(fit) +
      '<div class="acs-affirm">' +
      esc(
        fit.overall_pct >= 85
          ? "高度適配 — 建議牧者約談後進入試任或正式授權（仍 HITL）。"
          : fit.overall_pct >= 70
            ? "中度適配 — 可試任；塌陷維度請對照 Tab ④ 牧養指南陪跑。"
            : "待陪跑 — 心志高能力低時走師徒制；性格錯置時微調崗位，不作淘汰。"
      ) +
      "</div></div>"
    );
  }

  global.MatchmakerViz = {
    renderOverlayBlock: renderOverlayBlock,
    overlaySvg: overlaySvg,
    deltaTableHtml: deltaTableHtml
  };
})(typeof window !== "undefined" ? window : global);
