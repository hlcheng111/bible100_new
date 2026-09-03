/**
 * SWOT · ACS 殼（20題快評 · NCD 預載 · Tab③ 唯一報告出口）
 */
(function (global) {
  "use strict";

  var lastRun = null;
  var activeCross = "WO";
  var surveyTrack = "quick";

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function switchToReport() {
    if (global.StrategicHybridShell) StrategicHybridShell.switchTab("report");
  }

  function switchSurveyTrack(track) {
    surveyTrack = track === "workshop" ? "workshop" : "quick";
    var q = document.getElementById("swot-track-quick");
    var w = document.getElementById("swot-track-workshop");
    if (q) q.classList.toggle("hidden", surveyTrack !== "quick");
    if (w) w.classList.toggle("hidden", surveyTrack !== "workshop");
    document.querySelectorAll("[data-swot-track]").forEach(function (btn) {
      var on = btn.getAttribute("data-swot-track") === surveyTrack;
      btn.classList.toggle("strategic-tab-active", on);
    });
  }

  function renderNcdWeaknessLock() {
    var host = document.getElementById("swot-ncd-lock-banner");
    if (!host) {
      var survey = document.getElementById("strategic-tab-survey");
      if (survey) {
        survey.insertAdjacentHTML(
          "afterbegin",
          '<div id="swot-ncd-lock-banner" class="hidden mx-4 mt-3 p-3 rounded-lg border-2 border-rose-300 bg-rose-50"></div>'
        );
        host = document.getElementById("swot-ncd-lock-banner");
      }
    }
    if (!host || !global.SwotPack || typeof SwotPack.loadUpstreamChain !== "function") return;
    var chain = SwotPack.loadUpstreamChain();
    var min = chain && chain.ncd_minimum;
    if (!min || !min.label) {
      host.classList.add("hidden");
      return;
    }
    host.innerHTML =
      '<p class="text-sm text-rose-900 m-0"><strong>🔗 NCD 鎖定劣勢 W：</strong>「' +
      esc(min.label) +
      "」（" +
      esc(String(min.score != null ? min.score : "—")) +
      '/5）— <span class="font-bold">矩陣已剛性匯入</span>；Tab③ W 象限優先對話此破口。</p>';
    host.classList.remove("hidden");
  }

  function likertLbl(s) {
    return global.AcsSurveyStandard ? AcsSurveyStandard.likertLabel(s, "agree") : String(s);
  }

  function renderQuickSurvey() {
    var host = document.getElementById("swot-quick-survey-wrap");
    if (!host || !global.SwotPack) return;
    var lastQuad = "";
    var legend = global.AcsSurveyStandard ? AcsSurveyStandard.likertLegendHtml("agree") : "";
    var html =
      '<h2 class="font-black text-amber-900 text-lg mb-1">⚡ A 軌 · 四象限 20 題快評</h2>' +
      '<p class="text-sm text-slate-600 mb-2">約 5 分鐘 · W 題高分代表破口嚴重；完成後開啟 Tab ③ TOWS 矩陣。</p>' +
      legend +
      '<form id="swot-quick-form" onsubmit="return SwotAcsShell.submitQuick(event)">';
    SwotPack.QUESTIONS.forEach(function (q, i) {
      if (q.quad !== lastQuad) {
        lastQuad = q.quad;
        html +=
          '<p class="text-xs font-black text-indigo-900 mt-4 mb-2 border-b border-indigo-100 pb-1">' +
          esc(SwotPack.QUAD_LABELS[q.quad] || q.quad) +
          "</p>";
      }
      html +=
        '<fieldset class="acs-fieldset"><legend class="text-xs font-bold">' +
        esc(q.id) +
        " · 第 " +
        (i + 1) +
        '/20 題</legend><p class="text-sm mb-2">' +
        esc(q.label) +
        '</p><div class="acs-likert-row acs-likert-row--anchored">';
      for (var s = 1; s <= 5; s++) {
        html +=
          '<label><input type="radio" name="' +
          q.id +
          '" value="' +
          s +
          '" required> ' +
          likertLbl(s) +
          "</label>";
      }
      html += "</div></fieldset>";
    });
    html +=
      '<div class="grid md:grid-cols-2 gap-3 mt-3 p-3 bg-amber-50 rounded-lg">' +
      '<label class="text-sm font-bold">教會名稱<input name="church_name" class="w-full mt-1 border rounded p-2 bg-white" /></label>' +
      '<label class="text-sm font-bold">填寫身份<select name="role" class="w-full mt-1 border rounded p-2 bg-white"><option value="board">長執</option><option value="staff">同工</option></select></label>' +
      "</div>" +
      '<p id="swot-quick-error" class="text-red-600 text-xs mt-2 hidden"></p>' +
      (global.AcsSurveyStandard
        ? AcsSurveyStandard.submitButtonHtml("→ Tab ③ TOWS 矩陣報告")
        : '<button type="submit" class="acs-btn acs-btn--primary mt-3 w-full py-3">提交並生成報告</button>') +
      "</form>";
    host.innerHTML = html;
    renderNcdWeaknessLock();
  }

  function answersFromForm(form) {
    var map = {};
    SwotPack.QUESTIONS.forEach(function (q) {
      var el = form.querySelector('input[name="' + q.id + '"]:checked');
      if (el) map[q.id] = Number(el.value);
    });
    return map;
  }

  function renderMethodologyPanel(run) {
    if (!run) run = lastRun;
    if (!run && global.SwotPack) {
      var prev = SwotPack.buildNcdPreviewRun();
      if (prev.ok) run = prev.run;
      else {
        var demo = SwotPack.buildDemoRun();
        if (demo.ok) {
          run = demo.run;
          run._fallback_demo = true;
        }
      }
    }
    var minEl = document.getElementById("swot-coaching-ncd-lock");
    var balanceEl = document.getElementById("swot-coaching-balance-model");
    var contractEl = document.getElementById("swot-coaching-contract-json");
    if (!run || !run.derived) {
      if (minEl) minEl.textContent = "（載入中…）";
      return;
    }
    var c = run.derived.swot_contract || run.swot_contract;
    var m = c && c.matrix_result;
    var fallbackNote = run._fallback_demo || run.is_preview ? ' <span class="text-amber-700">（L1 Fallback 預覽）</span>' : "";
    if (minEl) {
      minEl.innerHTML =
        "<strong>NCD→SWOT：</strong>S_avg=" +
        esc(String(m && m.weights && m.weights.S_avg)) +
        " · W_avg=" +
        esc(String(m && m.weights && m.weights.W_avg)) +
        " · Delta_Variance=<strong>" +
        esc(String(m && m.Delta_Variance)) +
        "</strong> · 主軸 <strong>" +
        esc(c && c.primary_strategy) +
        "</strong>" +
        fallbackNote;
    }
    if (balanceEl && m) {
      balanceEl.innerHTML =
        "<p><strong>步驟一（路加 14:31 數算代價）：</strong>P_SO=" +
        esc(String(m.P_raw && m.P_raw.SO)) +
        " vs P_WO=" +
        esc(String(m.P_raw && m.P_raw.WO)) +
        " · conflict_SO_WO=" +
        esc(String(m.conflict_SO_WO)) +
        " · Δ=" +
        esc(String(m.Delta_Variance)) +
        "</p>" +
        (m.pastoral_override ? '<p class="text-rose-800 font-bold text-sm mt-2">' + esc(m.pastoral_override) + "</p>" : "");
    }
    if (contractEl && c) {
      try {
        contractEl.textContent = JSON.stringify(c, null, 2);
      } catch (e) {
        contractEl.textContent = "{}";
      }
    }
    var aiPre = document.getElementById("swot-ai-prompt-text");
    if (aiPre && global.SwotPack) aiPre.textContent = SwotPack.buildAiPrompt(run);
  }

  function renderReport(run, opts) {
    opts = opts || {};
    if (!run) return;
    lastRun = run;
    var empty = document.getElementById("swot-report-empty");
    var content = document.getElementById("swot-report-content");
    if (!empty || !content) return;
    empty.classList.add("hidden");
    content.classList.remove("hidden");

    var banner = document.getElementById("swot-report-ncd-banner");
    if (banner) {
      if (run.is_preview) {
        banner.innerHTML =
          '<p class="text-sm text-indigo-900"><strong>🔗 NCD 鏈路預覽：</strong>偵測到 NCD 最小因子，已自動生成 TOWS 戰略矩陣預覽骨架（結構 ' +
          esc(String(run.derived && run.derived.matrix_result && run.derived.matrix_result.weights.S_avg)) +
          " · 靈性 " +
          esc(String(run.derived && run.derived.matrix_result && run.derived.matrix_result.weights.W_avg)) +
          "）。</p>";
        banner.classList.remove("hidden");
      } else if (run.is_demo) {
        banner.innerHTML = '<p class="text-sm text-amber-900"><strong>示範資料</strong> · 事工機器堂會痛點預設</p>';
        banner.classList.remove("hidden");
      } else {
        banner.classList.add("hidden");
      }
    }

    var badge = document.getElementById("swot-report-demo-badge");
    if (badge) badge.classList.toggle("hidden", !(run.is_demo || run.is_preview));

    var summary = document.getElementById("swot-report-summary");
    if (summary && run.derived) {
      var m = run.derived.matrix_result;
      var wQuad = run.derived.quadrants && run.derived.quadrants.W;
      var wLock =
        wQuad && wQuad.ncd_locked
          ? '<div class="mt-2 p-3 bg-rose-50 border-2 border-rose-300 rounded-lg text-sm text-rose-950"><strong>W 劣勢（NCD 鎖定）：</strong>' +
            esc(wQuad.primary || "—") +
            "</div>"
          : "";
      var extra = m && m.pastoral_override
        ? '<div class="mt-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-900 font-bold">' +
          esc(m.pastoral_override) +
          "</div>"
        : "";
      summary.innerHTML =
        "<p><strong>戰略摘要：</strong>" +
        esc(run.derived.summary_line || "—") +
        "</p>" +
        wLock +
        extra;
    }
    if (summary && global.AcsReportGold && AcsReportGold.mountAfterSummary) {
      AcsReportGold.mountAfterSummary(summary, run, "swot");
    }

    var matrixHost = document.getElementById("swot-report-matrix");
    if (matrixHost && global.SwotMatrixViz) {
      activeCross = (run.derived && run.derived.focus_strategy) || "WO";
      matrixHost.innerHTML = SwotMatrixViz.renderMatrixBlock(run.derived, activeCross, run);
      var svgWrap = matrixHost.querySelector(".swot-matrix-svg-wrap");
      if (svgWrap) {
        SwotMatrixViz.bindCrossClicks(svgWrap, run.derived, function (id) {
          activeCross = id;
        });
      }
    }
    renderMethodologyPanel(run);
  }

  function autoPreviewReport() {
    if (!global.SwotPack) return;
    var latest = SwotPack.ensureAssessmentRun();
    if (latest && !latest.is_demo) {
      renderReport(latest, {});
      return;
    }
    var prev = SwotPack.buildNcdPreviewRun();
    if (prev.ok) {
      renderReport(prev.run, { preview: true });
      return;
    }
    var demo = SwotPack.buildDemoRun();
    if (demo.ok) renderReport(demo.run, { demo: true });
  }

  function loadDemoReport() {
    if (!global.SwotPack) return;
    var built = SwotPack.buildDemoRun();
    if (built.ok) {
      renderReport(built.run, { demo: true });
      switchToReport();
    }
  }

  function submitQuick(ev) {
    ev.preventDefault();
    var form = document.getElementById("swot-quick-form");
    var err = document.getElementById("swot-quick-error");
    if (!form || !global.SwotPack) return false;
    var saved = SwotPack.saveQuizRun(answersFromForm(form), {
      church_name: form.church_name && form.church_name.value,
      role: form.role && form.role.value
    });
    if (!saved.ok) {
      if (err) {
        err.textContent = (saved.errors || []).join(" ");
        err.classList.remove("hidden");
      }
      return false;
    }
    if (err) err.classList.add("hidden");
    renderReport(saved.run, {});
    switchToReport();
    return false;
  }

  function commitWorkshop(payload) {
    if (!global.SwotPack) return { ok: false, errors: ["SwotPack 未載入"] };
    var saved = SwotPack.saveWorkshopRun(payload);
    if (saved.ok && saved.run) {
      renderReport(saved.run, {});
      switchToReport();
    }
    return saved;
  }

  function copyAiPrompt(btn) {
    var pre = document.getElementById("swot-ai-prompt-text");
    if (!pre) return;
    var t = pre.textContent || "";
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () {
        if (btn) btn.textContent = "已複製 ✓";
      });
    }
  }

  function init() {
    if (!global.SwotPack) {
      console.warn("SwotAcsShell: SwotPack not loaded");
      return;
    }
    global.loadDemoReport = loadDemoReport;
    global.SwotAcsShellCommitWorkshop = commitWorkshop;
    renderNcdWeaknessLock();
    renderQuickSurvey();
    switchSurveyTrack("quick");
    autoPreviewReport();
    renderMethodologyPanel(null);
  }

  global.SwotAcsShell = {
    init: init,
    switchSurveyTrack: switchSurveyTrack,
    loadDemoReport: loadDemoReport,
    submitQuick: submitQuick,
    renderReport: renderReport,
    commitWorkshop: commitWorkshop,
    copyAiPrompt: copyAiPrompt,
    autoPreviewReport: autoPreviewReport
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(typeof window !== "undefined" ? window : global);
