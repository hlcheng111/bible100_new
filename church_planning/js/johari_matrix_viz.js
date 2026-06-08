/**
 * Johari 周哈里窗 · 四象限交叉比對（純 HTML/SVG，不依賴 Chart.js）
 */
(function (global) {
  "use strict";

  var QUADS = [
    { key: "open", label: "開放區 Open", hint: "我知 · 他知", color: "#059669", bg: "#d1fae5" },
    { key: "blind", label: "盲點區 Blind", hint: "我不知 · 他知", color: "#d97706", bg: "#fef3c7" },
    { key: "hidden", label: "隱藏區 Hidden", hint: "我知 · 他不知", color: "#7c3aed", bg: "#ede9fe" },
    { key: "unknown", label: "未知區 Unknown", hint: "我不知 · 他不知", color: "#0284c7", bg: "#e0f2fe" }
  ];

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function pct(d, prefix) {
    prefix = prefix || "";
    return Number(d[prefix + "open_pct"] != null ? d[prefix + "open_pct"] : d.open_pct) || 0;
  }

  function quadPct(d, key, prefix) {
    var k = (prefix || "") + key + "_pct";
    return Number(d[k] != null ? d[k] : d[key + "_pct"]) || 0;
  }

  function flexGridHtml(d, title) {
    var cells = QUADS.map(function (q) {
      var v = quadPct(d, q.key);
      return (
        '<div class="acs-johari-cell acs-johari-cell--' +
        q.key +
        '" style="flex-grow:' +
        Math.max(v, 8) +
        '"><span class="acs-johari-label">' +
        esc(q.label) +
        '</span><span class="acs-johari-pct">' +
        v +
        '%</span><span class="acs-johari-hint">' +
        esc(q.hint) +
        "</span></div>"
      );
    }).join("");
    return (
      '<div class="johari-matrix-panel">' +
      (title ? "<h4>" + esc(title) + "</h4>" : "") +
      '<div class="acs-johari-grid">' +
      cells +
      "</div></div>"
    );
  }

  /** 經典 2×2 窗格 SVG（面積 ∝ 百分比） */
  function classicWindowSvg(selfD) {
    var w = 360;
    var h = 280;
    var pad = 48;
    var innerW = w - pad * 2;
    var innerH = h - pad * 2;
    var o = quadPct(selfD, "open");
    var b = quadPct(selfD, "blind");
    var hi = quadPct(selfD, "hidden");
    var u = quadPct(selfD, "unknown");
    var topSum = Math.max(o + b, 1);
    var botSum = Math.max(hi + u, 1);
    var topH = innerH * 0.5;
    var botH = innerH - topH;
    var openW = (o / topSum) * innerW;
    var blindW = innerW - openW;
    var hiddenW = (hi / botSum) * innerW;
    var unknownW = innerW - hiddenW;
    var x0 = pad;
    var y0 = pad;

    function rect(x, y, rw, rh, fill, label, val) {
      return (
        '<rect x="' +
        x +
        '" y="' +
        y +
        '" width="' +
        rw +
        '" height="' +
        rh +
        '" fill="' +
        fill +
        '" stroke="#fff" stroke-width="3" rx="6"/>' +
        '<text x="' +
        (x + rw / 2) +
        '" y="' +
        (y + rh / 2 - 6) +
        '" text-anchor="middle" font-size="11" font-weight="800" fill="#1e293b">' +
        esc(label) +
        "</text>" +
        '<text x="' +
        (x + rw / 2) +
        '" y="' +
        (y + rh / 2 + 12) +
        '" text-anchor="middle" font-size="16" font-weight="900" fill="#1e293b">' +
        esc(String(val)) +
        "%</text>"
      );
    }

    var svg =
      '<svg class="johari-classic-svg" viewBox="0 0 ' +
      w +
      " " +
      h +
      '" role="img" aria-label="周哈里窗四象限">' +
      '<text x="' +
      (w / 2) +
      '" y="22" text-anchor="middle" font-size="10" font-weight="800" fill="#64748b">他人知道 ↑</text>' +
      '<text x="16" y="' +
      (h / 2) +
      '" text-anchor="middle" font-size="10" font-weight="800" fill="#64748b" transform="rotate(-90 16 ' +
      h / 2 +
      ')">自己知道</text>' +
      rect(x0, y0, openW, topH, "#d1fae5", "Open 開放", o) +
      rect(x0 + openW, y0, blindW, topH, "#fef3c7", "Blind 盲點", b) +
      rect(x0, y0 + topH, hiddenW, botH, "#ede9fe", "Hidden 隱藏", hi) +
      rect(x0 + hiddenW, y0 + topH, unknownW, botH, "#e0f2fe", "Unknown 未知", u) +
      "</svg>";
    return svg;
  }

  function compareBarsHtml(selfD, peerD) {
    if (!peerD) return "";
    var rows = QUADS.map(function (q) {
      var s = quadPct(selfD, q.key);
      var p = quadPct(peerD, q.key);
      var delta = p - s;
      var deltaStr = (delta >= 0 ? "+" : "") + delta;
      var deltaClass = Math.abs(delta) >= 8 ? " johari-delta--alert" : "";
      return (
        "<tr><td><strong>" +
        esc(q.label) +
        '</strong></td><td class="johari-num">' +
        s +
        '%</td><td class="johari-num">' +
        p +
        '%</td><td class="johari-num' +
        deltaClass +
        '">' +
        deltaStr +
        "</td></tr>"
      );
    }).join("");
    return (
      '<div class="johari-compare-block">' +
      "<h4>🔀 自評 × 他評交叉比對（" +
      esc(String(peerD.peer_count || "—")) +
      " 份他評均值）</h4>" +
      '<p class="acs-matrix-lead">Δ = 他評 − 自評。Blind Δ 明顯為正 → 肢體看見的比本人多，宜 360 回饋；Hidden Δ 為負 → 本人藏起較多，宜建立安全感。</p>' +
      '<table class="acs-table johari-compare-table"><thead><tr><th>象限</th><th>自評</th><th>他評</th><th>Δ</th></tr></thead><tbody>' +
      rows +
      "</tbody></table></div>"
    );
  }

  /**
   * @param {object} derived - run.derived
   */
  function renderFullMatrix(derived) {
    derived = derived || {};
    var peer = derived.peer_overlay || null;
    var blended = derived.blended || null;
    var html =
      '<div class="acs-report-block johari-matrix-block">' +
      "<h3>🪟 周哈里窗四象限 · 交叉比對矩陣</h3>" +
      '<p class="acs-matrix-lead">上：經典窗格（面積 ∝ 自評比例）。下：四宮格與他評對照。<strong>不是考核</strong>，供禱告與牧者對話。</p>' +
      '<div class="johari-classic-wrap">' +
      classicWindowSvg(derived) +
      "</div>" +
      flexGridHtml(derived, "自評 24 題匯總");
    if (peer) {
      html += flexGridHtml(peer, "他評 24 題匯總（均值）");
      html += compareBarsHtml(derived, peer);
    } else {
      html +=
        '<div class="acs-pastoral-note">尚未收他評。請 Tab ② 切換「他評 24 題」，邀請 2–3 位同工填寫後，本區會顯示<strong>自評×他評交叉比對</strong>。</div>';
    }
    if (blended && blended.note) {
      html += '<div class="acs-affirm">360 合成提示：' + esc(blended.note) + "</div>";
    }
    html += "</div>";
    return html;
  }

  global.JohariMatrixViz = {
    renderFullMatrix: renderFullMatrix,
    flexGridHtml: flexGridHtml,
    classicWindowSvg: classicWindowSvg
  };
})(typeof window !== "undefined" ? window : global);
