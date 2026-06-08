/**
 * Tab ③ 恩跡年表儀表盤 · 戴明落差指針（純 SVG + 動畫）
 */
(function (global) {
  "use strict";

  var DELTA_MAX = 4;
  var ALERT_THRESHOLD = 2.5;

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function getContract(derived) {
    return (derived && derived.pdca_contract) || {};
  }

  /** 汽車時速表式落差指針：0～4，警戒區 ≥2.5 */
  function deltaSpeedometerSvg(delta, opts) {
    opts = opts || {};
    var id = opts.id || "pdca-delta-needle";
    delta = delta != null && isFinite(delta) ? Math.max(0, Math.min(DELTA_MAX, Number(delta))) : 0;
    var alert = delta >= ALERT_THRESHOLD;
    var cx = 150;
    var cy = 150;
    var r = 100;
    var startA = -210;
    var sweep = 240;
    var targetA = startA + (delta / DELTA_MAX) * sweep;
    var ticks = "";
    for (var t = 0; t <= 8; t++) {
      var tv = (t / 8) * DELTA_MAX;
      var ta = ((startA + (tv / DELTA_MAX) * sweep) * Math.PI) / 180;
      var x1 = cx + (r - 12) * Math.cos(ta);
      var y1 = cy + (r - 12) * Math.sin(ta);
      var x2 = cx + r * Math.cos(ta);
      var y2 = cy + r * Math.sin(ta);
      var isRed = tv >= ALERT_THRESHOLD;
      ticks +=
        '<line x1="' +
        x1 +
        '" y1="' +
        y1 +
        '" x2="' +
        x2 +
        '" y2="' +
        y2 +
        '" stroke="' +
        (isRed ? "#fca5a5" : "#cbd5e1") +
        '" stroke-width="2"/>' +
        '<text x="' +
        (cx + (r - 28) * Math.cos(ta)) +
        '" y="' +
        (cy + (r - 28) * Math.sin(ta) + 4) +
        '" text-anchor="middle" font-size="10" fill="' +
        (isRed ? "#b91c1c" : "#64748b") +
        '">' +
        tv.toFixed(1) +
        "</text>";
    }
    var alertArcStart = startA + (ALERT_THRESHOLD / DELTA_MAX) * sweep;
    return (
      '<div class="pdca-speedo-wrap" id="' +
      esc(id) +
      '-wrap" data-delta="' +
      delta +
      '" data-animate="' +
      (opts.animate ? "1" : "0") +
      '">' +
      '<svg class="pdca-speedo" viewBox="0 0 300 200" width="100%" max-width="360" aria-label="落差變異數指針儀">' +
      '<defs><linearGradient id="pdca-speedo-bg" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0%" stop-color="#ecfdf5"/><stop offset="62%" stop-color="#fef3c7"/>' +
      '<stop offset="100%" stop-color="#fee2e2"/></linearGradient></defs>' +
      '<path d="M ' +
      (cx + r * Math.cos((startA * Math.PI) / 180)) +
      " " +
      (cy + r * Math.sin((startA * Math.PI) / 180)) +
      " A " +
      r +
      " " +
      r +
      " 0 1 1 " +
      (cx + r * Math.cos(((startA + sweep) * Math.PI) / 180)) +
      " " +
      (cy + r * Math.sin(((startA + sweep) * Math.PI) / 180)) +
      '" fill="none" stroke="url(#pdca-speedo-bg)" stroke-width="18" stroke-linecap="round"/>' +
      ticks +
      '<g class="pdca-needle-group" data-target-angle="' +
      targetA +
      '" transform="rotate(0 ' +
      cx +
      " " +
      cy +
      ')">' +
      '<line x1="' +
      cx +
      '" y1="' +
      cy +
      '" x2="' +
      cx +
      '" y2="' +
      (cy - r + 18) +
      '" stroke="' +
      (alert ? "#dc2626" : "#7c3aed") +
      '" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="' +
      cx +
      '" cy="' +
      cy +
      '" r="8" fill="#1e1b4b"/></g>' +
      '<text x="' +
      cx +
      '" y="' +
      (cy + 42) +
      '" text-anchor="middle" font-size="28" font-weight="900" fill="' +
      (alert ? "#dc2626" : "#312e81") +
      '" id="' +
      esc(id) +
      '-value">Δ ' +
      esc(String(delta)) +
      "</text>" +
      '<text x="' +
      cx +
      '" y="' +
      (cy + 62) +
      '" text-anchor="middle" font-size="11" fill="#64748b">計畫與執行落差</text>' +
      "</svg>" +
      (alert
        ? '<p class="pdca-alert-banner" role="alert">【警報】計畫與實際執行嚴重脫節（落差 Δ ≥ 2.5）！請前往【4. 聖靈的修剪】。</p>'
        : "") +
      "</div>"
    );
  }

  function velocityGaugeSvg(score) {
    score = score != null && isFinite(score) ? Number(score) : 0;
    var pct = Math.min(1, Math.max(0, score / 100));
    var angle = pct * 270 - 135;
    var rad = (angle * Math.PI) / 180;
    var cx = 90;
    var cy = 90;
    var r = 58;
    var x2 = cx + r * Math.cos(rad);
    var y2 = cy + r * Math.sin(rad);
    return (
      '<svg class="pdca-gauge" viewBox="0 0 180 120" width="180" height="120" aria-label="微小勝利推進率">' +
      '<path d="M ' +
      (cx - r) +
      " " +
      cy +
      " A " +
      r +
      " " +
      r +
      ' 0 1 1 ' +
      (cx + r) +
      " " +
      cy +
      '" fill="none" stroke="#e2e8f0" stroke-width="10"/>' +
      '<path d="M ' +
      (cx - r) +
      " " +
      cy +
      " A " +
      r +
      " " +
      r +
      " 0 " +
      (pct > 0.5 ? 1 : 0) +
      " 1 " +
      x2 +
      " " +
      y2 +
      '" fill="none" stroke="#7c3aed" stroke-width="10" stroke-linecap="round"/>' +
      '<text x="' +
      cx +
      '" y="' +
      (cy + 8) +
      '" text-anchor="middle" font-size="18" font-weight="800" fill="#312e81">' +
      esc(String(score)) +
      '</text><text x="' +
      cx +
      '" y="' +
      (cy + 28) +
      '" text-anchor="middle" font-size="9" fill="#64748b">微小勝利推進率</text></svg>'
    );
  }

  function varianceBar(P, D, delta) {
    P = P != null ? Number(P) : 0;
    D = D != null ? Number(D) : 0;
    var max = Math.max(P, D, 5);
    var pw = Math.round((P / max) * 100);
    var dw = Math.round((D / max) * 100);
    var alert = delta != null && delta >= ALERT_THRESHOLD;
    return (
      '<div class="pdca-variance-bars">' +
      '<p class="text-sm font-bold text-slate-700 mb-2">計畫與執行對照</p>' +
      '<div class="pdca-bar-row"><span class="pdca-bar-label">計畫 Plan</span><div class="pdca-bar-track"><div class="pdca-bar-fill pdca-bar-fill--plan" style="width:' +
      pw +
      '%"></div></div><span class="pdca-bar-val">' +
      esc(String(P)) +
      "</span></div>" +
      '<div class="pdca-bar-row"><span class="pdca-bar-label">執行 Do</span><div class="pdca-bar-track"><div class="pdca-bar-fill pdca-bar-fill--do" style="width:' +
      dw +
      '%"></div></div><span class="pdca-bar-val">' +
      esc(String(D)) +
      "</span></div>" +
      '<p class="text-sm mt-2 ' +
      (alert ? "text-rose-800 font-black" : "text-slate-700") +
      '">落差 Δ = 計畫 − 執行 = <strong>' +
      esc(delta != null ? String(delta) : "—") +
      "</strong>" +
      (alert ? " · 已觸發長執修剪協議" : "") +
      "</p></div>"
    );
  }

  function smallWinsHtml(wins) {
    wins = wins || [];
    if (!wins.length) return "";
    var rows = wins
      .map(function (w) {
        return (
          '<tr><td class="text-xs font-bold">雙週 ' +
          w.fortnight +
          "</td><td class=\"text-xs\">" +
          esc(w.label) +
          '</td><td class="text-xs text-slate-500">' +
          esc(w.status) +
          "</td></tr>"
        );
      })
      .join("");
    return (
      '<div class="pdca-small-wins mt-4"><h4 class="text-sm font-black text-violet-900">雙週微小勝利軌跡</h4>' +
      '<table class="acs-table text-xs mt-2"><thead><tr><th>期</th><th>可感知進度</th><th>狀態</th></tr></thead><tbody>' +
      rows +
      "</tbody></table></div>"
    );
  }

  function renderWorkshopNotesBlock(notes) {
    notes = notes || {};
    if (!notes.schema) return "";
    var plan = notes.plan || {};
    var doing = notes.do || {};
    var chk = notes.check || {};
    var act = notes.act || {};
    var planRows = (plan.rows || [])
      .map(function (r, i) {
        if (!r.action && !r.owner) return "";
        return (
          "<li class=\"text-sm\"><strong>行動 " +
          (i + 1) +
          "：</strong>" +
          esc(r.action) +
          " · 負責：" +
          esc(r.owner || "—") +
          " · " +
          esc(r.eta || "—") +
          "</li>"
        );
      })
      .filter(Boolean)
      .join("");
    var doRows = (doing.rows || [])
      .map(function (r, i) {
        if (!r.status && !r.note) return "";
        return (
          "<li class=\"text-sm\">第 " +
          (i + 1) +
          " 項 · " +
          esc(r.status || "—") +
          " — " +
          esc(r.note || "") +
          "</li>"
        );
      })
      .filter(Boolean)
      .join("");
    return (
      '<div class="acs-report-block pdca-workshop-notes mt-4">' +
      "<h3>質性工作坊決議（B 軌合流）</h3>" +
      (notes.season_focus
        ? '<p class="text-sm text-indigo-900 mb-2"><strong>本季聚焦：</strong>' + esc(notes.season_focus) + "</p>"
        : "") +
      (plan.problem ? '<p class="text-sm mb-2"><strong>Plan 背景：</strong>' + esc(plan.problem) + "</p>" : "") +
      (planRows ? '<ul class="list-disc pl-5 mb-3">' + planRows + "</ul>" : "") +
      (doing.progress_notes || doing.traffic_light
        ? '<p class="text-sm mb-2"><strong>Do：</strong>' +
          esc(trafficLabelDoing(doing.traffic_light)) +
          (doing.progress_notes ? " · " + esc(doing.progress_notes) : "") +
          "</p>"
        : "") +
      (doRows ? '<ul class="list-disc pl-5 mb-3">' + doRows + "</ul>" : "") +
      (chk.outcome || chk.gap
        ? '<p class="text-sm mb-2"><strong>Check：</strong>' +
          esc(chk.outcome || "") +
          (chk.gap ? " · 落差：" + esc(chk.gap) : "") +
          (chk.rhythm_score != null ? " · 節奏 " + chk.rhythm_score + "/5" : "") +
          "</p>"
        : "") +
      (act.keep || act.adjust || act.stop
        ? '<div class="text-sm space-y-1 mt-2"><p><strong>Act · 保留：</strong>' +
          esc(act.keep || "—") +
          "</p><p><strong>調整：</strong>" +
          esc(act.adjust || "—") +
          "</p><p><strong>止血／暫停：</strong>" +
          esc(act.stop || "—") +
          "</p></div>"
        : "") +
      (act.owner
        ? '<p class="text-xs text-slate-600 mt-2">負責：' +
          esc(act.owner) +
          " · 期限：" +
          esc(act.due_date || "—") +
          "</p>"
        : "") +
      "</div>"
    );
  }

  function trafficLabelDoing(v) {
    if (v === "yellow") return "黃燈";
    if (v === "red") return "紅燈";
    return "綠燈";
  }

  function renderMatrixBlock(derived, opts) {
    opts = opts || {};
    derived = derived || {};
    var c = getContract(derived);
    var plan = c.plan_metrics || {};
    var doing = c.do_progress || {};
    var chk = c.check_variance || {};
    var delta = chk.Delta_variance;
    var anchorBanner = plan.strategic_anchor_highlight
      ? '<div class="pdca-wo-anchor">' + esc(plan.strategic_anchor || "") + "</div>"
      : plan.strategic_anchor
        ? '<div class="pdca-anchor">' + esc(plan.strategic_anchor) + "</div>"
        : "";

    return (
      '<div class="acs-report-block pdca-matrix-block">' +
      "<h3>恩跡年表儀表盤 · 本季事工真實落差</h3>" +
      anchorBanner +
      deltaSpeedometerSvg(delta, { id: "pdca-delta-needle", animate: !!opts.animate }) +
      '<div class="pdca-gauge-row">' +
      velocityGaugeSvg(chk.velocity_score) +
      "</div>" +
      varianceBar(plan.P_target, doing.D_actual, delta) +
      smallWinsHtml(plan.small_wins) +
      renderWorkshopNotesBlock(c.workshop_notes) +
      "</div>"
    );
  }

  function animateDeltaNeedle(root) {
    root = root || document;
    var wrap = root.querySelector(".pdca-speedo-wrap[data-animate='1']");
    if (!wrap) wrap = root.querySelector(".pdca-speedo-wrap");
    if (!wrap) return;
    var needle = wrap.querySelector(".pdca-needle-group");
    if (!needle) return;
    var target = Number(needle.getAttribute("data-target-angle")) || 0;
    var cx = 150;
    var cy = 150;
    var start = -210;
    var duration = 1400;
    var t0 = null;
    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }
    function frame(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / duration);
      var angle = start + (target - start) * easeOutCubic(p);
      needle.setAttribute("transform", "rotate(" + angle + " " + cx + " " + cy + ")");
      if (p < 1) global.requestAnimationFrame(frame);
      else wrap.classList.add("pdca-speedo--landed");
    }
    needle.setAttribute("transform", "rotate(" + start + " " + cx + " " + cy + ")");
    if (global.requestAnimationFrame) global.requestAnimationFrame(frame);
    else needle.setAttribute("transform", "rotate(" + target + " " + cx + " " + cy + ")");
  }

  global.PdcaCycleViz = {
    renderMatrixBlock: renderMatrixBlock,
    renderWorkshopNotesBlock: renderWorkshopNotesBlock,
    deltaSpeedometerSvg: deltaSpeedometerSvg,
    animateDeltaNeedle: animateDeltaNeedle,
    varianceBar: varianceBar,
    ALERT_THRESHOLD: ALERT_THRESHOLD
  };
})(typeof window !== "undefined" ? window : global);
