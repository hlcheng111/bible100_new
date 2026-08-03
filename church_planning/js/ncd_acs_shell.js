/**
 * NCD · 四 Tab 殼（自管切換 · 不依賴 CoachingDesk · 純 SVG/HTML 報告）
 */
(function (global) {
  "use strict";

  var TAB_IDS = ["intro", "survey", "report", "coaching"];
  var lastReportRun = null;

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function switchTab(id) {
    if (TAB_IDS.indexOf(id) < 0) return;
    TAB_IDS.forEach(function (k) {
      var panel = document.getElementById("tab-" + k);
      if (panel) {
        panel.classList.toggle("hidden", k !== id);
      }
    });
    document.querySelectorAll("[data-ncd-tab]").forEach(function (btn) {
      var on = btn.getAttribute("data-ncd-tab") === id;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    if (id !== "survey" && history.replaceState) {
      var h = id === "intro" ? "" : "#" + id;
      history.replaceState(null, "", h || location.pathname + location.search);
    }
  }

  function buildBarrelHtml(run) {
    var d = run && run.derived;
    if (!d || !d.dim_scores || !global.NcdPack) return "";
    var min = d.minimum_factor || {};
    var dims = NcdPack.INTL_DIMS;
    var planks = dims
      .map(function (dim) {
        var val = Number(d.dim_scores[dim.id]) || 0;
        var pct = Math.round((val / 5) * 100);
        var isMin = dim.id === min.id;
        var isWeak = val < 3;
        var cls = "ncd-barrel-plank";
        if (isMin) cls += " ncd-barrel-plank--min";
        else if (isWeak) cls += " ncd-barrel-plank--weak";
        return (
          '<div class="' +
          cls +
          '" title="' +
          esc(dim.label) +
          " " +
          val +
          '/5">' +
          '<div class="ncd-barrel-fill" style="height:' +
          pct +
          '%"></div>' +
          (isMin ? '<div class="ncd-barrel-saw" aria-hidden="true">⚠</div>' : "") +
          '<span class="ncd-barrel-score">' +
          val +
          "</span>" +
          '<span class="ncd-barrel-label">' +
          esc(dim.label.length > 5 ? dim.label.slice(0, 5) + "…" : dim.label) +
          "</span></div>"
        );
      })
      .join("");
    return (
      '<h3 class="font-black text-indigo-900">🪣 湧泉木桶圖（八維健康木板）</h3>' +
      '<p class="text-xs text-slate-600 mb-3">湧泉理論：水能湧多高，取決於<strong>最短木板</strong>。紅色＝最小因子（本年度 PDCA 主攻破口）；橙色＝低於 3.0 分。</p>' +
      '<div class="ncd-barrel-chart" role="img" aria-label="NCD 八維木桶圖">' +
      planks +
      "</div>" +
      '<p class="text-xs text-rose-800 font-bold mt-2">最小因子：「' +
      esc(min.label || "—") +
      "」 " +
      esc(String(min.score != null ? min.score : "—")) +
      " 分</p>"
    );
  }

  function buildRadarSvg(run) {
    var d = run && run.derived;
    if (!d || !d.dim_scores || !global.NcdPack) return "";
    var dims = NcdPack.INTL_DIMS;
    var min = d.minimum_factor || {};
    var cx = 200;
    var cy = 200;
    var maxR = 120;
    var n = dims.length;
    var svg = '<svg viewBox="0 0 400 400" class="ncd-radar-svg" role="img" aria-label="NCD 八維雷達">';
    [1, 2, 3, 4, 5].forEach(function (lv) {
      var r = (lv / 5) * maxR;
      svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#e2e8f0" stroke-width="1"/>';
    });
    var pts = [];
    dims.forEach(function (dim, i) {
      var angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      var val = Number(d.dim_scores[dim.id]) || 0;
      var r = (val / 5) * maxR;
      pts.push((cx + Math.cos(angle) * r).toFixed(1) + "," + (cy + Math.sin(angle) * r).toFixed(1));
      var lx = cx + Math.cos(angle) * (maxR + 24);
      var ly = cy + Math.sin(angle) * (maxR + 24);
      var isMin = dim.id === min.id;
      svg +=
        '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + Math.cos(angle) * maxR) + '" y2="' + (cy + Math.sin(angle) * maxR) + '" stroke="#cbd5e1" stroke-width="1"/>' +
        '<text x="' + lx + '" y="' + ly + '" text-anchor="middle" font-size="8" fill="' + (isMin ? "#dc2626" : "#4338ca") + '" font-weight="' + (isMin ? "800" : "600") + '">' +
        esc(dim.label.length > 5 ? dim.label.slice(0, 5) + "…" : dim.label) +
        "</text>";
    });
    svg +=
      '<polygon points="' + pts.join(" ") + '" fill="rgba(79,70,229,0.25)" stroke="#4338ca" stroke-width="2"/>' +
      "</svg>";
    return (
      '<div class="acs-card mt-2"><h3 class="font-black text-indigo-900 text-sm">📊 八維雷達（輔助視角）</h3><div class="ncd-radar-wrap">' +
      svg +
      "</div></div>"
    );
  }

  function buildDimAdviceHtml(run) {
    if (!run || !run.derived || !global.NcdPack) return "";
    var d = run.derived;
    var min = d.minimum_factor || {};
    var rows = NcdPack.INTL_DIMS.map(function (dim) {
      var val = Number(d.dim_scores[dim.id]) || 0;
      var advice = (NcdPack.STRATEGY_ADVICE && NcdPack.STRATEGY_ADVICE[dim.id]) || {};
      var isMin = dim.id === min.id;
      return (
        '<div class="ncd-dim-advice-row' +
        (isMin ? " ncd-dim-advice-row--min" : "") +
        '"><div class="flex justify-between items-center"><strong>' +
        esc(dim.label) +
        "</strong><span>" +
        val +
        "/5" +
        (isMin ? " ⚠ 最小因子" : "") +
        '</span></div><p class="text-xs text-slate-600 mt-1">' +
        esc(advice.diagnosis || "") +
        '</p><p class="text-xs text-emerald-800 mt-1"><strong>建議：</strong>' +
        esc(advice.plan || "") +
        "</p></div>"
      );
    }).join("");
    return (
      '<div class="acs-card"><h3 class="font-black text-indigo-900">📋 八維成績與白話建議</h3><div class="space-y-3">' +
      rows +
      "</div></div>"
    );
  }

  function buildNcdAiPrompt(run) {
    if (!run || !run.derived) {
      return "請先完成 Tab ② 24 題快評或點 Tab ③「示範報告」。";
    }
    var d = run.derived;
    var min = d.minimum_factor || {};
    var card = run.strategy_cards && run.strategy_cards[0];
    var name = (run.profile && run.profile.name) || "本教會";
    var size =
      run.profile && run.profile.church_size === "1000"
        ? "大型"
        : run.profile && run.profile.church_size === "500"
          ? "中型"
          : "中小型";
    return [
      "你現在是教會規劃顧問，熟悉 Natural Church Development（NCD）與 Church OS 治理（SWOT → SMART → PDCA）。",
      "",
      "我們是「" + name + "」（" + size + "教會），剛完成 NCD 國際八維健康診斷。",
      "整體健康：" + (d.healthLabel || "—") + "，均分 " + (d.overallNormalized != null ? d.overallNormalized : "—") + " / 5。",
      "最小因子（木桶短板）：「" + (min.label || "—") + "」" + (min.score != null ? min.score + " 分" : "") + "。",
      "系統診斷：" + (min.diagnosis || card && card.diagnosis || "—"),
      "",
      "請根據以上破口，提供：",
      "1）本季唯一攻堅主軸（6–8 週可檢核的一個小改變）；",
      "2）長執退修會 3 個討論問題；",
      "3）SMART 目標草稿一句；",
      "4）PDCA 雙月檢核指標。",
      "",
      "勿編造經文；不確定處請明說需查證；語氣像牧養陪伴，不像人事考核。"
    ].join("\n");
  }

  function buildRetreatDraft(run) {
    var min = run && run.derived && run.derived.minimum_factor;
    var card = run && run.strategy_cards && run.strategy_cards[0];
    return (
      "【長執會年度退修會開會草案 · NCD 最小因子】\n\n" +
      "一、感謝與肯定：先數算過去一季神保守的恩典。\n\n" +
      "二、身體檢查摘要：戰略破口為「" +
      (min ? min.label : "（請先測評）") +
      "」" +
      (min && min.score != null ? "（" + min.score + " 分）" : "") +
      "。\n" +
      (min && min.diagnosis ? "診斷：" + min.diagnosis + "\n" : "") +
      "\n三、本季只推一個改變（6–8 週可檢核）：\n" +
      (card && card.plan ? card.plan : "（完成測評後自動帶入）") +
      "\n\n四、禱告與決議：是否寫入 SMART 與 PDCA。\n\n" +
      "五、下次檢核日：________"
    );
  }

  function buildVisionDraft(run) {
    var min = run && run.derived && run.derived.minimum_factor;
    return (
      "【主任牧師異象傳遞指令草稿】\n弟兄姊妹，我們是基督的身體。今年聚焦「" +
      (min ? min.label : "健康破口") +
      "」的補強，讓每一根枝子都連於真葡萄樹。"
    );
  }

  function renderCoachingPanel(run) {
    var minEl = document.getElementById("ncd-coaching-min-factor");
    var algoEl = document.getElementById("ncd-coaching-algorithm-table");
    var retreatEl = document.getElementById("acs-ncd-retreat");
    var visionEl = document.getElementById("acs-ncd-vision");
    var swotEl = document.getElementById("ncd-coaching-swot-note");
    var smartEl = document.getElementById("ncd-coaching-smart-draft");
    if (!run || !run.derived) return;
    var min = run.derived.minimum_factor || {};
    if (minEl) {
      minEl.className = "acs-memo";
      var memo =
        "最小因子「" +
        esc(min.label || "—") +
        "」（" +
        esc(String(min.score != null ? min.score : "—")) +
        " 分）— " +
        esc(min.diagnosis || "");
      if (run.derived.ncd_contract || run.ncd_contract) memo += " · NCD 契約已通電";
      minEl.innerHTML = memo;
    }
    if (algoEl && global.NcdPack && NcdPack.buildAlgorithmSummary) {
      algoEl.innerHTML = NcdPack.buildAlgorithmSummary(run);
    }
    if (retreatEl) retreatEl.textContent = buildRetreatDraft(run);
    if (visionEl) visionEl.textContent = buildVisionDraft(run);
    if (swotEl && global.NcdPack) swotEl.textContent = NcdPack.prefillSwotNote(run) || "（無）";
    if (smartEl && global.NcdPack) smartEl.textContent = NcdPack.prefillSmartDraft(run) || "（無）";
  }

  function renderStrategyCard(run) {
    var card = run && run.strategy_cards && run.strategy_cards[0];
    if (!card) return "";
    return (
      '<div class="acs-card" style="border-left:4px solid #dc2626;background:#fff7ed">' +
      "<h2 class=\"font-black text-rose-900 serif-title\">" +
      esc(card.title) +
      "</h2>" +
      '<p class="text-sm mt-2"><strong>系統診斷：</strong>' +
      esc(card.diagnosis) +
      "</p>" +
      '<p class="text-sm mt-2"><strong>五年計劃建議：</strong>' +
      esc(card.plan) +
      "</p>" +
      '<p class="text-xs text-slate-600 mt-2">' +
      esc(card.pdca_note) +
      "</p></div>"
    );
  }

  function renderReport(run, isDemo) {
    if (!run) return;
    lastReportRun = run;
    var empty = document.getElementById("ncd-report-empty");
    var content = document.getElementById("ncd-report-content");
    if (!empty || !content) return;
    empty.classList.add("hidden");
    content.classList.remove("hidden");
    var badge = document.getElementById("ncd-report-demo-badge");
    if (badge) badge.classList.toggle("hidden", !isDemo);
    var d = run.derived || {};
    var min = d.minimum_factor || {};
    var summary = document.getElementById("ncd-report-summary");
    if (summary) {
      summary.innerHTML =
        "<p><strong>整體：</strong>" +
        esc(d.healthLabel || "—") +
        " · 均分 " +
        esc(String(d.overallNormalized != null ? d.overallNormalized : "—")) +
        " / 5</p>" +
        '<p class="text-rose-800 font-bold mt-2">🚨 最小因子：「' +
        esc(min.label || "—") +
        "」 " +
        esc(String(min.score != null ? min.score : "—")) +
        " 分</p>";
    }
    if (summary && global.AcsReportGold && AcsReportGold.mountAfterSummary) {
      AcsReportGold.mountAfterSummary(summary, run, "ncd");
    }
    var barrelHost = document.getElementById("ncd-report-barrel");
    if (barrelHost) barrelHost.innerHTML = buildBarrelHtml(run);
    var radarHost = document.getElementById("ncd-report-radar");
    if (radarHost) {
      if (global.NcdHealthViz) radarHost.innerHTML = NcdHealthViz.renderHealthBlock(d);
      else radarHost.innerHTML = buildRadarSvg(run);
    }
    var adviceHost = document.getElementById("ncd-report-dim-advice");
    if (adviceHost) adviceHost.innerHTML = buildDimAdviceHtml(run);
    var stratHost = document.getElementById("ncd-report-strategy");
    if (stratHost) stratHost.innerHTML = renderStrategyCard(run);
    var aiPre = document.getElementById("ncd-ai-prompt-text");
    if (aiPre) aiPre.textContent = buildNcdAiPrompt(run);
    renderCoachingPanel(run);
  }

  function renderQuickSurvey() {
    var host = document.getElementById("ncd-quick-survey-wrap");
    if (!host || !global.NcdPack) return;
    var Q = NcdPack.QUESTIONS;
    var lastDim = "";
    var html =
      '<h2 class="font-black text-indigo-900 text-xl mb-2">【核心快評】國際標準八維健康度（24 題）</h2>' +
      '<p class="text-sm text-slate-600 mb-3">約 10 分鐘 · <strong>1＝非常不同意 · 5＝非常同意</strong>。涵蓋恩賜、領導、靈性、組織、崇拜、小組、佈道、關係八維。</p>' +
      '<form id="ncd-quick-form" onsubmit="return NcdAcsShell.submitQuick(event)">';
    Q.forEach(function (q, i) {
      if (q.dim !== lastDim) {
        lastDim = q.dim;
        html +=
          '<p class="text-xs font-black text-indigo-800 mt-4 mb-2 border-b border-indigo-100 pb-1">' +
          esc(NcdPack.DIM_LABELS[q.dim] || q.dim) +
          "</p>";
      }
      html +=
        '<fieldset class="border rounded p-3 mb-2 bg-white"><legend class="text-xs font-bold">第 ' +
        (i + 1) +
        ' / 24 題</legend><p class="text-sm mb-2">' +
        esc(q.label) +
        '</p><div class="flex flex-wrap gap-3">';
      for (var s = 1; s <= 5; s++) {
        html +=
          '<label class="text-xs font-semibold"><input type="radio" name="q_' +
          q.id +
          '" value="' +
          s +
          '" required> ' +
          s +
          "</label>";
      }
      html += "</div></fieldset>";
    });
    html +=
      '<div class="grid md:grid-cols-2 gap-3 mt-3 p-3 bg-indigo-50 rounded-lg">' +
      '<label class="text-sm font-bold">教會名稱（選填）<input name="church_name" class="w-full mt-1 border rounded p-2 bg-white" placeholder="例：XX 教會" /></label>' +
      '<label class="text-sm font-bold">規模<select name="church_size" class="w-full mt-1 border rounded p-2 bg-white"><option value="100">小型</option><option value="500">中型</option><option value="1000">大型</option></select></label>' +
      "</div>" +
      '<p id="ncd-quick-error" class="text-red-600 text-xs mt-2 hidden"></p>' +
      '<button type="submit" class="acs-btn acs-btn--primary mt-3 text-base px-6 py-3">✓ 提交 24 題快評 → 查看 Tab ③ 報告</button>' +
      "</form>";
    host.innerHTML = html;
  }

  function answersFromQuickForm(form) {
    var map = {};
    NcdPack.QUESTIONS.forEach(function (q) {
      var el = form.querySelector('input[name="q_' + q.id + '"]:checked');
      if (el) map[q.id] = Number(el.value);
    });
    return map;
  }

  function loadDemoReport() {
    if (!global.NcdPack) return;
    var built = NcdPack.buildDemoRun();
    if (built.ok) {
      renderReport(built.run, true);
      switchTab("report");
    }
  }

  function submitQuick(ev) {
    ev.preventDefault();
    var form = document.getElementById("ncd-quick-form");
    var err = document.getElementById("ncd-quick-error");
    if (!form || !global.NcdPack) return false;
    var built = NcdPack.buildRunFromAnswers(answersFromQuickForm(form), {
      name: form.church_name.value,
      church_size: form.church_size.value
    });
    if (!built.ok) {
      if (err) {
        err.textContent = (built.errors || []).join(" ");
        err.classList.remove("hidden");
      }
      return false;
    }
    if (err) err.classList.add("hidden");
    var saved = global.AssessmentRunStore ? AssessmentRunStore.saveRun(built.run) : { ok: false };
    if (!saved.ok) {
      if (err) {
        err.textContent = (saved.errors || ["存檔失敗"]).join(" ");
        err.classList.remove("hidden");
      }
      return false;
    }
    if (global.CTAOSBridge && global.CTAOSBridge.generate) {
      try {
        CTAOSBridge.generate("ncd");
      } catch (e) {}
    }
    renderReport(saved.run, false);
    switchTab("report");
    return false;
  }

  function onHealthSaved() {
    if (!global.NcdPack) return;
    var run = NcdPack.ensureAssessmentRun();
    if (run) {
      renderReport(run, false);
      switchTab("report");
    }
  }

  function savePdcaPrefill(run) {
    if (!run || !global.NcdPack) return;
    try {
      localStorage.setItem(
        NcdPack.PDCA_PREFILL_KEY || "chp2026-ncd-pdca-prefill",
        JSON.stringify({
          version: 1,
          savedAt: new Date().toISOString(),
          minimum_factor: run.derived ? run.derived.minimum_factor : null,
          swot_note: NcdPack.prefillSwotNote(run),
          smart_draft: NcdPack.prefillSmartDraft(run)
        })
      );
    } catch (e) {}
  }

  function getRun() {
    return global.NcdPack ? NcdPack.ensureAssessmentRun() : null;
  }

  function copyText(id, btn) {
    var pre = document.getElementById(id);
    if (!pre) return;
    var t = pre.textContent || "";
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () {
        if (btn) btn.textContent = "已複製 ✓";
      });
    }
  }

  function copyAiPrompt(btn) {
    copyText("ncd-ai-prompt-text", btn);
  }

  function openSwot(ev) {
    var run = getRun();
    if (run) savePdcaPrefill(run);
    if (global.planningOpenContent) planningOpenContent(ev, "Church_Governance_SWOT_matrix.html");
    return false;
  }

  function openSmart(ev) {
    var run = getRun();
    if (run) savePdcaPrefill(run);
    if (global.planningOpenContent) planningOpenContent(ev, "Church_Governance_SMART_goals.html");
    return false;
  }

  function init() {
    if (!global.NcdPack) {
      console.warn("NcdAcsShell: NcdPack not loaded");
      return;
    }
    global.switchTab = switchTab;
    global.loadDemoReport = loadDemoReport;
    renderQuickSurvey();
    var latest = NcdPack.ensureAssessmentRun();
    if (latest && !latest.is_demo) renderReport(latest, false);
    global.addEventListener("ncd:health-saved", onHealthSaved);
    var hash = (location.hash || "").replace(/^#/, "");
    if (hash && TAB_IDS.indexOf(hash) >= 0) switchTab(hash);
    else switchTab("intro");
  }

  global.NcdAcsShell = {
    init: init,
    switchTab: switchTab,
    submitQuick: submitQuick,
    loadDemoReport: loadDemoReport,
    renderReport: renderReport,
    copyText: copyText,
    copyAiPrompt: copyAiPrompt,
    openSwot: openSwot,
    openSmart: openSmart
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(typeof window !== "undefined" ? window : global);
