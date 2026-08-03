/**
 * 神國管家·季度事工行動迴圈檢核儀 · 殼層（快評 · 活體上游 · 恩跡儀表盤）
 */
(function (global) {
  "use strict";

  var lastRun = null;

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function showToast(msg) {
    var el = document.getElementById("pdca-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("pdca-toast--show");
    setTimeout(function () {
      el.classList.remove("pdca-toast--show");
    }, 3200);
  }

  function switchToReport(smooth) {
    if (global.StrategicHybridShell) StrategicHybridShell.switchTab("report");
    setTimeout(function () {
      var panel = document.getElementById("strategic-tab-report");
      if (panel && panel.scrollIntoView) {
        panel.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
      }
      var header = document.querySelector(".pdca-steward-header");
      if (header && smooth) {
        document.querySelectorAll("[data-strategic-tab='report']").forEach(function (btn) {
          btn.classList.add("strategic-tab-active");
        });
      }
    }, smooth ? 120 : 40);
  }

  function renderUpstreamBanner() {
    var el = document.getElementById("pdca-upstream-banner");
    if (!el || !global.PdcaPack) return;
    var chain = PdcaPack.loadUpstreamChain();
    if (!chain.ok) {
      el.innerHTML =
        '<p class="text-sm text-amber-900">尚未連結上游診斷資料。可先完成 <a href="Church_Governance_SWOT_matrix.html" class="underline font-bold">戰略矩陣</a>；或點「先看示範報告」體驗儀表。</p>';
      el.classList.remove("hidden");
      return;
    }
    var parts = [];
    if (chain.runs.swot) parts.push("戰略主軸 " + esc(chain.swot_primary || "—"));
    if (chain.kpi_health != null) parts.push("目標健康 " + chain.kpi_health);
    if (chain.ncd_minimum) parts.push("健康破口「" + esc(chain.ncd_minimum.label) + "」");
    el.innerHTML =
      '<p class="text-sm text-indigo-900"><strong>已連結本季診斷：</strong>' +
      parts.join(" · ") +
      (chain.pastoral_override ? ' · <span class="text-rose-800 font-bold">牧養覆寫 WO</span>' : "") +
      "</p>";
    el.classList.remove("hidden");
  }

  function renderQuickSurvey() {
    var host = document.getElementById("pdca-quick-survey-wrap");
    if (!host || !global.PdcaPack) return;
    var anchor = PdcaPack.loadUpstreamChain();
    var anchorHtml = "";
    if (anchor.pastoral_override || anchor.swot_primary === "WO") {
      anchorHtml = '<div class="pdca-wo-anchor mb-3">' + esc(PdcaPack.WO_ANCHOR_MSG) + "</div>";
    } else if (anchor.swot_primary) {
      anchorHtml =
        '<p class="text-xs text-indigo-800 bg-indigo-50 border border-indigo-200 rounded-lg p-2 mb-3">戰略主軸：<strong>' +
        esc(anchor.swot_primary) +
        "</strong> — 計畫題請對齊此主軸。</p>";
    }
    var lastPhase = "";
    var html =
      '<h2 class="font-black text-violet-900 text-lg mb-1">A 軌 · 12 題誠實快評</h2>' +
      '<p class="text-sm text-slate-600 mb-3">約 8 分鐘 · <strong>1＝非常不同意 · 5＝非常同意</strong>。完成後將帶您到【3. 恩跡年表儀表盤】。</p>' +
      anchorHtml +
      '<form id="pdca-quick-form" onsubmit="return PdcaAcsShell.submitQuick(event)">';
    PdcaPack.QUESTIONS.forEach(function (q, i) {
      if (q.phase !== lastPhase) {
        lastPhase = q.phase;
        html +=
          '<p class="text-xs font-black text-violet-900 mt-4 mb-2 border-b border-violet-100 pb-1">' +
          esc(PdcaPack.PHASE_LABELS[q.phase] || q.phase) +
          "</p>";
      }
      html +=
        '<fieldset class="acs-fieldset"><legend class="text-xs font-bold">第 ' +
        (i + 1) +
        '/12 題</legend><p class="text-sm mb-2">' +
        esc(q.label) +
        '</p><div class="acs-likert-row">';
      for (var s = 1; s <= 5; s++) {
        html += '<label><input type="radio" name="' + q.id + '" value="' + s + '" required> ' + s + "</label>";
      }
      html += "</div></fieldset>";
    });
    html +=
      '<div class="grid md:grid-cols-2 gap-3 mt-3 p-3 bg-violet-50 rounded-lg">' +
      '<label class="text-sm font-bold">事工／節期<input name="ministry_context" class="w-full mt-1 border rounded p-2 bg-white" placeholder="2026 Q2 門訓" /></label>' +
      '<label class="text-sm font-bold">本季聚焦<input name="season_focus" class="w-full mt-1 border rounded p-2 bg-white" /></label>' +
      "</div>" +
      '<p id="pdca-quick-error" class="text-red-600 text-xs mt-2 hidden"></p>' +
      '<button type="submit" class="acs-btn acs-btn--primary mt-3 w-full py-3">✓ 提交 → 前往恩跡年表儀表盤</button>' +
      "</form>";
    host.innerHTML = html;
  }

  function answersFromForm(form) {
    var map = {};
    PdcaPack.QUESTIONS.forEach(function (q) {
      var el = form.querySelector('input[name="' + q.id + '"]:checked');
      if (el) map[q.id] = Number(el.value);
    });
    return map;
  }

  function renderMethodologyPanel(run) {
    if (global.PdcaPastoralDesk) {
      PdcaPastoralDesk.applyDeskState(run || lastRun);
    }
  }

  function renderReport(run, opts) {
    opts = opts || {};
    if (!run) return;
    lastRun = run;
    var empty = document.getElementById("pdca-report-empty");
    var content = document.getElementById("pdca-report-content");
    if (!empty || !content) return;
    empty.classList.add("hidden");
    content.classList.remove("hidden");

    var demoBadge = document.getElementById("pdca-report-demo-badge");
    if (demoBadge) {
      demoBadge.classList.toggle("hidden", !run.is_demo);
    }

    var banner = document.getElementById("pdca-report-chain-banner");
    if (banner) {
      if (run.is_preview) {
        banner.innerHTML =
          '<p class="text-sm text-indigo-900"><strong>上游戰略預覽</strong>（非本次提交，僅供對照）</p>';
        banner.classList.remove("hidden");
      } else if (run.is_demo) {
        banner.innerHTML =
          '<p class="text-sm text-amber-900"><strong>示範模式</strong>：落差 Δ=2.8 警戒示範 · 指針將動態轉入紅區</p>';
        banner.classList.remove("hidden");
      } else {
        banner.classList.add("hidden");
      }
    }

    var summary = document.getElementById("pdca-report-summary");
    if (summary && run.derived) {
      var line = run.derived.summary_line || "—";
      summary.innerHTML =
        "<p class=\"text-base\"><strong>本季摘要：</strong>" +
        esc(line) +
        "</p>";
    }
    if (summary && global.AcsReportGold && AcsReportGold.mountAfterSummary) {
      AcsReportGold.mountAfterSummary(summary, run, "pdca");
    }

    var matrixHost = document.getElementById("pdca-report-matrix");
    if (matrixHost && global.PdcaCycleViz) {
      matrixHost.innerHTML = PdcaCycleViz.renderMatrixBlock(run.derived || run, {
        animate: !!opts.animate
      });
      if (opts.animate) {
        setTimeout(function () {
          PdcaCycleViz.animateDeltaNeedle(matrixHost);
        }, opts.animateDelay || 200);
      }
    }
    renderMethodologyPanel(run);
  }

  function autoPreviewReport() {
    if (!global.PdcaPack) return;
    var latest = AssessmentRunStore && AssessmentRunStore.loadLatest("pdca");
    if (latest && !latest.is_demo) {
      renderReport(latest, {});
      return;
    }
    var prev = PdcaPack.buildPreviewFromUpstream();
    if (prev.ok) {
      renderReport(prev.run, { preview: true });
      return;
    }
  }

  function loadDemoReport() {
    if (!global.PdcaPack) {
      showToast("模組尚未載入，請重新整理頁面。");
      return;
    }
    var built = PdcaPack.buildDemoRun();
    if (!built.ok) {
      showToast("示範資料載入失敗：" + (built.errors || []).join(" "));
      return;
    }
    showToast("示範已載入 · 正在帶您到【3. 恩跡年表儀表盤】…");
    switchToReport(true);
    setTimeout(function () {
      renderReport(built.run, { demo: true, animate: true, animateDelay: 350 });
      if (built.run.pdca_contract && built.run.pdca_contract.check_variance.deming_alert) {
        setTimeout(function () {
          showToast("Δ=2.8 已進入警戒 · 請查看【4. 聖靈的修剪】");
        }, 1800);
      }
    }, 280);
  }

  function submitQuick(ev) {
    ev.preventDefault();
    var form = document.getElementById("pdca-quick-form");
    var err = document.getElementById("pdca-quick-error");
    if (!form || !global.PdcaPack) return false;
    var saved = PdcaPack.saveQuizRun(answersFromForm(form), {
      ministry_context: form.ministry_context && form.ministry_context.value,
      season_focus: form.season_focus && form.season_focus.value
    });
    if (!saved.ok) {
      if (err) {
        err.textContent = (saved.errors || []).join(" ");
        err.classList.remove("hidden");
      }
      return false;
    }
    if (err) err.classList.add("hidden");
    showToast("已儲存 · 前往恩跡年表儀表盤");
    switchToReport(true);
    setTimeout(function () {
      renderReport(saved.run, { animate: true, animateDelay: 200 });
    }, 200);
    return false;
  }

  function switchSurveyTrack(track) {
    var q = document.getElementById("pdca-track-quick");
    var w = document.getElementById("pdca-track-workshop");
    if (q) q.classList.toggle("hidden", track !== "quick");
    if (w) w.classList.toggle("hidden", track !== "workshop");
    document.querySelectorAll("[data-pdca-track]").forEach(function (btn) {
      var on = btn.getAttribute("data-pdca-track") === track;
      btn.classList.toggle("strategic-tab-active", on);
    });
    if (track === "workshop" && global.PdcaWorkshopApp) {
      PdcaWorkshopApp.mount();
    }
  }

  function onWorkshopComplete(run) {
    if (!run) return;
    showToast("工作坊已合流 · 前往恩跡年表儀表盤");
    switchToReport(true);
    setTimeout(function () {
      renderReport(run, { animate: true, animateDelay: 280 });
    }, 280);
  }

  function init() {
    if (!global.PdcaPack) {
      console.warn("PdcaAcsShell: PdcaPack not loaded");
      return;
    }
    if (global.PdcaPastoralDesk) PdcaPastoralDesk.mountStaticDesk();
    global.loadDemoReport = loadDemoReport;
    renderUpstreamBanner();
    renderQuickSurvey();
    switchSurveyTrack("quick");
    autoPreviewReport();
    renderMethodologyPanel(null);
  }

  global.PdcaAcsShell = {
    init: init,
    submitQuick: submitQuick,
    loadDemoReport: loadDemoReport,
    renderReport: renderReport,
    switchSurveyTrack: switchSurveyTrack,
    autoPreviewReport: autoPreviewReport,
    onWorkshopComplete: onWorkshopComplete,
    showToast: showToast
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(typeof window !== "undefined" ? window : global);
