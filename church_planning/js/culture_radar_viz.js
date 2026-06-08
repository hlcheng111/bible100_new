/**
 * Tab ③ 文化契合度 · CVAM 四維雷達圖（純 SVG）
 */
(function (global) {
  "use strict";

  var CVAM_ORDER = ["clan", "adhocracy", "market", "hierarchy"];
  var CVAM_SHORT = { clan: "牧養", adhocracy: "外展", market: "推動", hierarchy: "治理" };

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;");
  }

  function point(cx, cy, r, angleDeg, pct) {
    var a = ((angleDeg - 90) * Math.PI) / 180;
    var rad = (Math.max(0, Math.min(100, pct)) / 100) * r;
    return { x: cx + rad * Math.cos(a), y: cy + rad * Math.sin(a) };
  }

  function renderRadarBlock(derived, opts) {
    opts = opts || {};
    var cvam = (derived && derived.cvam_scores) || {};
    var cx = 160;
    var cy = 160;
    var r = 110;
    var grid = "";
    [25, 50, 75, 100].forEach(function (pct) {
      var pts = CVAM_ORDER.map(function (k, i) {
        var p = point(cx, cy, r, i * 90, pct);
        return p.x + "," + p.y;
      }).join(" ");
      grid += '<polygon points="' + pts + '" fill="none" stroke="#e9d5ff" stroke-width="1"/>';
    });
    var axes = "";
    CVAM_ORDER.forEach(function (k, i) {
      var p = point(cx, cy, r, i * 90, 100);
      axes +=
        '<line x1="' + cx + '" y1="' + cy + '" x2="' + p.x + '" y2="' + p.y + '" stroke="#c4b5fd" stroke-width="1"/>' +
        '<text x="' + (p.x + (p.x > cx ? 8 : p.x < cx ? -8 : 0)) + '" y="' + (p.y + (p.y > cy ? 14 : -6)) + '" text-anchor="middle" font-size="11" font-weight="700" fill="#5b21b6">' +
        esc(CVAM_SHORT[k]) + "</text>";
    });
    var dataPts = CVAM_ORDER.map(function (k, i) {
      var v = cvam[k] != null ? cvam[k] : 0;
      var p = point(cx, cy, r, i * 90, v);
      return { k: k, v: v, x: p.x, y: p.y };
    });
    var poly = dataPts.map(function (p) { return p.x + "," + p.y; }).join(" ");
    var dots = dataPts
      .map(function (p) {
        return '<circle class="culture-radar-dot" data-pct="' + p.v + '" cx="' + p.x + '" cy="' + p.y + '" r="5" fill="#7c3aed"/>';
      })
      .join("");
    var cv = derived && derived.culture_deviation_cv != null ? derived.culture_deviation_cv : "—";
    var tbs = derived && derived.trust_breach_score != null ? derived.trust_breach_score : 0;
    var resonance = derived && derived.culture_resonance_score != null ? derived.culture_resonance_score : "—";
    return (
      '<div class="culture-radar-wrap" id="culture-radar-wrap" data-animate="' + (opts.animate ? "1" : "0") + '">' +
      '<div class="culture-radar-stats">' +
      '<span><strong>文化共鳴</strong> ' + resonance + '/100</span>' +
      '<span><strong>偏離 Cv</strong> ' + cv + '</span>' +
      '<span class="' + (tbs >= 50 ? "culture-trust-alert" : "") + '"><strong>信任破口</strong> ' + tbs + '/100</span>' +
      "</div>" +
      '<svg class="culture-radar-svg" viewBox="0 0 320 320" width="100%" max-width="400" aria-label="CVAM 四維文化雷達">' +
      grid +
      axes +
      '<polygon class="culture-radar-poly" points="' + poly + '" fill="rgba(124,58,237,0.25)" stroke="#7c3aed" stroke-width="2.5" data-target-poly="' + poly + '"/>' +
      dots +
      "</svg>" +
      '<ul class="culture-radar-legend text-xs">' +
      CVAM_ORDER.map(function (k) {
        var lbl = global.CulturePack && CulturePack.CVAM_LABELS ? CulturePack.CVAM_LABELS[k] : k;
        return "<li><strong>" + esc(lbl) + "</strong> " + (cvam[k] != null ? cvam[k] : "—") + "%</li>";
      }).join("") +
      "</ul></div>"
    );
  }

  function animateRadar(host) {
    var wrap = host ? host.querySelector(".culture-radar-wrap") : document.getElementById("culture-radar-wrap");
    if (!wrap || wrap.getAttribute("data-animate") !== "1") return;
    var poly = wrap.querySelector(".culture-radar-poly");
    var cx = 160;
    var cy = 160;
    if (poly) {
      var collapsed = CVAM_ORDER.map(function (_, i) {
        var p = point(cx, cy, 110, i * 90, 0);
        return p.x + "," + p.y;
      }).join(" ");
      poly.setAttribute("points", collapsed);
      requestAnimationFrame(function () {
        setTimeout(function () {
          poly.setAttribute("points", poly.getAttribute("data-target-poly") || collapsed);
        }, 80);
      });
    }
    wrap.querySelectorAll(".culture-radar-dot").forEach(function (dot, idx) {
      var target = Number(dot.getAttribute("data-pct")) || 0;
      var i = idx;
      var p0 = point(cx, cy, 110, i * 90, 0);
      dot.setAttribute("cx", p0.x);
      dot.setAttribute("cy", p0.y);
      setTimeout(function () {
        var p1 = point(cx, cy, 110, i * 90, target);
        dot.setAttribute("cx", p1.x);
        dot.setAttribute("cy", p1.y);
      }, 120 + idx * 60);
    });
  }

  global.CultureRadarViz = {
    renderRadarBlock: renderRadarBlock,
    animateRadar: animateRadar
  };
})(typeof window !== "undefined" ? window : global);
