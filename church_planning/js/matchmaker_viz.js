/**
 * 媒合中心 · 職位輪廓 vs 同工現況（牧者語視覺化）
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
      '<svg class="matchmaker-overlay-svg" viewBox="0 0 420 440" role="img" aria-label="職位與同工輪廓對照圖">',
      '<text x="210" y="18" text-anchor="middle" font-size="11" font-weight="800" fill="#4338ca">這崗位 vs 這位同工（私下參考）</text>'
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
      '<text x="28" y="409" font-size="9" fill="#64748b">崗位大概需要</text>',
      '<rect x="110" y="400" width="10" height="10" fill="rgba(99,102,241,0.35)" stroke="#4338ca" stroke-width="2"/>',
      '<text x="126" y="409" font-size="9" fill="#64748b">同工目前</text>',
      "</svg>"
    );
    return svg.join("");
  }

  function pastoralCompanionTable(fit) {
    fit = fit || {};
    var axes = fit.axes || [];
    var MC = global.MatchmakerCore;
    var copy = (MC && MC.GAP_PASTORAL_COPY) || {};
    var body = axes
      .map(function (ax) {
        var tone =
          ax.status === "gap"
            ? " match-row--gap"
            : ax.status === "overflow"
              ? " match-row--overflow"
              : "";
        var tag = ax.status === "gap" ? "陪跑" : ax.status === "overflow" ? "亮點" : "均衡";
        var pastoral =
          ax.status === "overflow" && copy[ax.key]
            ? copy[ax.key].overflow
            : ax.status === "gap" && copy[ax.key]
              ? copy[ax.key].gap
              : "與這崗位大致相合——仍請面談確認試任節奏。";
        return (
          "<tr class=\"match-pastoral-row" +
          tone +
          '"><td><strong>' +
          esc(ax.plain_label || ax.label) +
          '</strong><span class="match-tag">' +
          tag +
          "</span></td><td>" +
          esc(pastoral) +
          "</td></tr>"
        );
      })
      .join("");
    return (
      '<div class="match-pastoral-block">' +
      "<h4>⭐ 牧養陪伴對照——面談前先看這張（非任免依據）</h4>" +
      '<p class="acs-matrix-lead">每一行右邊的話，您可以改寫成對同工說的語氣。</p>' +
      '<table class="acs-table match-pastoral-table"><thead><tr><th>面向</th><th>您可以怎樣陪</th></tr></thead><tbody>' +
      body +
      "</tbody></table></div>"
    );
  }

  function renderMisplacementGuide(fit) {
    fit = fit || {};
    var gaps = (fit.axes || []).filter(function (a) {
      return a.status === "gap";
    });
    var intro =
      '<p class="acs-matrix-lead match-misplacement-intro">恩賜「放錯位置」很常見，不代表人不夠好——往往是還沒找到對的節奏與同伴。</p>';
    if (!gaps.length) {
      return (
        '<div class="match-misplacement-guide">' +
        "<h4>🌿 恩賜錯置牧養指南</h4>" +
        intro +
        '<div class="acs-affirm">未見明顯「陪跑區」——仍請您禱告、面談，確認同工意願與節奏。</div></div>'
      );
    }
    var MC = global.MatchmakerCore;
    var copy = (MC && MC.GAP_PASTORAL_COPY) || {};
    var items = gaps
      .map(function (ax) {
        var text = (copy[ax.key] && copy[ax.key].gap) || "宜安排陪跑與試任，不作淘汰。";
        return "<li><strong>" + esc(ax.plain_label || ax.label) + "：</strong>" + esc(text) + "</li>";
      })
      .join("");
    return (
      '<div class="match-misplacement-guide">' +
      "<h4>🌿 恩賜錯置牧養指南（陪跑區）</h4>" +
      intro +
      '<p class="acs-step-hint">以下不是考核判決；正式調崗仍須您面談、拍板。</p>' +
      "<ul class=\"acs-pastoral-list\">" +
      items +
      "</ul></div>"
    );
  }

  function renderOverlayBlock(fit, bundle, opts) {
    opts = opts || {};
    fit = fit || {};
    bundle = bundle || {};
    var isDemo = !!opts.isDemo || !!bundle.is_demo;
    var MC = global.MatchmakerCore;
    var axisKeys = (MC && MC.MATCH_AXES ? MC.MATCH_AXES : []).map(function (a) {
      return a.key;
    });
    var axisLabels = (MC && MC.MATCH_AXES ? MC.MATCH_AXES : []).map(function (a) {
      return a.plain || a.label;
    });
    if (!axisKeys.length) {
      axisKeys = ["shape_peak", "ksa_capability", "ksa_attitude", "alda_vision", "alda_delivery", "disc_precision"];
      axisLabels = ["恩賜", "能力", "心志", "方向", "做成", "精準"];
    }

    var role = (MC && MC.ROLE_BLUEPRINTS && MC.ROLE_BLUEPRINTS[fit.role_id]) || {};
    var required = role.thresholds || {};
    var actual = fit.person || {};

    var coverageNote = "";
    if (bundle.coverage) {
      var loadedCount = 0;
      Object.keys(bundle.coverage).forEach(function (k) {
        if (bundle.coverage[k]) loadedCount += 1;
      });
      if (loadedCount === 0) {
        coverageNote =
          "目前尚未帶入問卷記錄——這份圖用「一般參考值」示範。要分析真實同工，請回 Tab② 帶入恩賜或能力問卷。";
      } else {
        coverageNote =
          "已帶入 " +
          loadedCount +
          " 份問卷記錄（缺的部分用一般參考值補上，僅供私下分辨）。";
      }
    }

    var pctHint = isDemo
      ? "示範常顯示較高數字，僅供熟悉版面——不是某人的真實成績。"
      : "不是考試分數；數字高 = 較合拍，仍要面談確認。";

    var affirm =
      fit.overall_pct >= 85
        ? "私下參考較合拍——建議您約談後談 6–12 週試任；請勿投影或公開張貼。"
        : fit.overall_pct >= 70
          ? "中度合拍——可談試任；陪跑區請對照上方表格。"
          : "較需陪跑——心志高、技能弱可走師徒制；崗位不合可微調，不作淘汰。";

    var demoBanner = isDemo
      ? ""
      : "";

    return (
      pastoralCompanionTable(fit) +
      renderMisplacementGuide(fit) +
      '<div class="acs-report-block matchmaker-overlay-block">' +
      "<h3>📊 圖：這崗位 vs 這位同工（私下參考）</h3>" +
      '<p class="acs-matrix-lead">① 虛線 = 這崗位「大概需要」的輪廓 · ② 實線 = 這位同工「目前」的輪廓 · ③ 凹下去 ≠ 不合格，= <strong>需要有人陪、別讓他燒盡</strong></p>' +
      '<p class="acs-step-hint">私下參考合拍度：<strong>' +
      (fit.overall_pct != null ? fit.overall_pct : "—") +
      "%</strong> — " +
      pctHint +
      (bundle.person_name ? " · 同工：" + esc(bundle.person_name) : "") +
      "</p>" +
      (fit.role_note ? '<p class="acs-step-hint">' + esc(fit.role_note) + "</p>" : "") +
      (coverageNote ? '<p class="acs-step-hint">' + esc(coverageNote) + "</p>" : "") +
      '<div class="matchmaker-overlay-wrap">' +
      overlaySvg(required, actual, axisKeys, axisLabels) +
      "</div>" +
      '<div class="acs-affirm">' +
      esc(affirm) +
      "</div></div>"
    );
  }

  global.MatchmakerViz = {
    renderOverlayBlock: renderOverlayBlock,
    overlaySvg: overlaySvg,
    pastoralCompanionTable: pastoralCompanionTable,
    renderMisplacementGuide: renderMisplacementGuide
  };
})(typeof window !== "undefined" ? window : global);
