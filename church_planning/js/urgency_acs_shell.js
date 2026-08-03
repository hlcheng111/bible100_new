/**

 * 重要 vs 緊急 · ACS 殼（14 題 · 四象限 · 活體 spiritual 上游）

 */

(function (global) {

  "use strict";



  function esc(s) {

    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;");

  }



  function showToast(msg) {

    var el = document.getElementById("urgency-toast");

    if (!el) return;

    el.textContent = msg;

    el.classList.add("urgency-toast--show");

    setTimeout(function () {

      el.classList.remove("urgency-toast--show");

    }, 3200);

  }



  function switchTab(id) {

    if (global.B100AcsBoot && B100AcsBoot.switchTab) B100AcsBoot.switchTab(id);

    else if (global.__b100SwitchTab) __b100SwitchTab(id);

  }



  function switchToReport() {

    switchTab("report");

    setTimeout(function () {

      var panel = document.getElementById("strategic-tab-report");

      if (panel && panel.scrollIntoView) panel.scrollIntoView({ behavior: "smooth", block: "start" });

    }, 120);

  }



  function renderUpstreamBanner() {

    var el = document.getElementById("urgency-upstream-banner");

    if (!el || !global.UrgencyPack) return;

    var chain = UrgencyPack.loadUpstreamChain();

    if (!chain.ok) {

      el.innerHTML =

        '<p class="text-sm text-amber-900">建議先完成 <a href="Church_Governance_spiritual_health.html" class="underline font-bold">信徒靈命健康</a>；或點示範報告體驗四象限。</p>';

      el.classList.remove("hidden");

      return;

    }

    el.innerHTML =

      '<p class="text-sm text-amber-900"><strong>已連結靈命：</strong>整體 ' +

      (chain.spiritual_overall != null ? chain.spiritual_overall : "—") +

      "（" +

      esc(chain.spiritual_level || "—") +

      "）</p>";

    el.classList.remove("hidden");

  }



  function renderSurvey() {

    var host = document.getElementById("urgency-survey-wrap");

    if (!host || !global.UrgencyPack) return;

    var lastQ = "";

    var html =

      '<h2 class="font-black text-amber-900 text-lg mb-1">14 題 Eisenhower 快評</h2>' +

      '<p class="text-sm text-slate-600 mb-3">約 15 分鐘 · 非效率競賽 · 完成後前往 Tab ③ 四象限報告。</p>' +

      '<form id="urgency-form" onsubmit="return UrgencyAcsShell.submitQuick(event)">' +

      '<label class="block text-sm font-bold mb-2">姓名（選填）<input name="name" class="w-full mt-1 border rounded p-2"/></label>' +

      '<label class="block text-sm font-bold mb-2">角色<input name="role" class="w-full mt-1 border rounded p-2" placeholder="小組長"/></label>';

    UrgencyPack.QUESTIONS.forEach(function (q, i) {

      if (q.quadrant && q.quadrant !== lastQ) {

        lastQ = q.quadrant;

        html +=

          '<p class="text-xs font-black text-amber-800 mt-4 mb-2 border-b pb-1">' +

          esc(UrgencyPack.QUADRANT_LABELS[q.quadrant] || q.quadrant) +

          "</p>";

      }

      if (!q.quadrant && q.reverse) {

        html += '<p class="text-xs font-black text-slate-700 mt-4 mb-2 border-b pb-1">真實度檢核</p>';

      }

      html +=

        '<fieldset class="acs-fieldset"><legend class="text-xs font-bold">第 ' +

        (i + 1) +

        "/14 題</legend><p class=\"text-sm mb-2\">" +

        esc(q.label) +

        '</p><div class="acs-likert-row">';

      for (var s = 1; s <= 5; s++) {

        html += '<label><input type="radio" name="' + q.id + '" value="' + s + '" required> ' + s + "</label>";

      }

      html += "</div></fieldset>";

    });

    html +=

      '<p id="urgency-form-error" class="text-red-600 text-xs hidden"></p>' +

      '<button type="submit" class="acs-btn acs-btn--primary mt-3 w-full py-3">✓ 提交 → 分析報告</button></form>';

    host.innerHTML = html;

  }



  function answersFromForm(form) {

    var map = {};

    UrgencyPack.QUESTIONS.forEach(function (q) {

      var el = form.querySelector('input[name="' + q.id + '"]:checked');

      if (el) map[q.id] = Number(el.value);

    });

    return map;

  }



  function renderFlags(run) {

    var zone = document.getElementById("urgency-flags-zone");

    if (!zone) return;

    var flags = (run && run.risk_flags) || [];

    if (!flags.length) {

      zone.innerHTML =

        '<h3 class="text-sm font-black text-amber-900 mb-1">風險旗標</h3><p class="text-sm m-0">目前無明顯象限預警；仍建議與導師確認 Q2 固定時段。</p>';

      return;

    }

    zone.innerHTML =

      '<h3 class="text-sm font-black text-amber-900 mb-1">風險旗標</h3><ul class="list-disc pl-4 text-sm m-0">' +

      flags

        .map(function (f) {

          return "<li>" + esc((UrgencyPack.FLAG_DESCRIPTIONS && UrgencyPack.FLAG_DESCRIPTIONS[f]) || f) + "</li>";

        })

        .join("") +

      "</ul>";

  }



  function renderReport(run, opts) {

    opts = opts || {};

    if (!run) return;

    var content = document.getElementById("urgency-report-content");

    if (!content) return;

    content.classList.remove("hidden");

    var empty = document.getElementById("urgency-report-empty");

    if (empty) empty.classList.add("hidden");

    var badge = document.getElementById("urgency-demo-badge");

    if (badge) badge.classList.toggle("hidden", !run.is_demo);

    var banner = document.getElementById("urgency-report-banner");

    if (banner) {

      if (run.is_demo) {

        banner.innerHTML =

          '<p class="text-sm text-amber-900"><strong>示範模式</strong>：典型「Q1 偏高 · Q2 偏低」過勞同工輪廓，供預覽 Tab ③ 效用。</p>';

        banner.classList.remove("hidden");

      } else {

        banner.classList.add("hidden");

      }

    }

    var summary = document.getElementById("urgency-report-summary");

    if (summary && run.derived) {

      summary.innerHTML =

        '<p class="text-sm m-0"><strong>作答真實度</strong> ' +

        (run.authenticity_score != null ? Math.round(run.authenticity_score * 100) + "%" : "—") +

        " · 資料預設留本機 · 非考核</p>";

    }
    if (summary && global.AcsReportGold && AcsReportGold.mountAfterSummary) {
      AcsReportGold.mountAfterSummary(summary, run, "urgent");
    }

    var viz = document.getElementById("urgency-report-viz");

    if (viz && global.UrgencyMatrixViz) {

      viz.innerHTML = UrgencyMatrixViz.renderMatrixBlock(run, { animate: !!opts.animate });

      if (opts.animate) setTimeout(function () { UrgencyMatrixViz.animateMatrix(viz); }, 200);

    }

    renderFlags(run);

    if (global.UrgencyPastoralDesk) UrgencyPastoralDesk.applyDeskState(run);

  }



  function loadDemoReport() {

    if (!global.UrgencyPack) {

      showToast("模組尚未載入");

      return;

    }

    var built = UrgencyPack.buildDemoRun();

    if (!built.ok) {

      showToast("示範載入失敗");

      return;

    }

    showToast("示範已載入 · 前往分析報告…");

    switchToReport();

    setTimeout(function () {

      renderReport(built.run, { animate: true });

    }, 280);

  }



  function submitQuick(ev) {

    ev.preventDefault();

    var form = document.getElementById("urgency-form");

    var err = document.getElementById("urgency-form-error");

    if (!form || !global.UrgencyPack) return false;

    var built = UrgencyPack.buildRun(answersFromForm(form), {

      name: form.name && form.name.value,

      role: form.role && form.role.value

    });

    if (!built.ok) {

      if (err) {

        err.textContent = (built.errors || []).join(" ");

        err.classList.remove("hidden");

      }

      return false;

    }

    if (err) err.classList.add("hidden");

    if (global.AssessmentRunStore) AssessmentRunStore.saveRun(built.run);

    showToast("已儲存 · 前往分析報告");

    switchToReport();

    setTimeout(function () {

      renderReport(built.run, { animate: true });

    }, 200);

    return false;

  }



  global.loadDemoReport = loadDemoReport;



  function init() {

    if (!global.UrgencyPack) {

      if (global.B100AcsBoot) B100AcsBoot.showBootError("UrgencyPack 未載入");

      return;

    }

    if (global.B100AcsBoot) B100AcsBoot.clearBootError();

    if (global.UrgencyPastoralDesk) UrgencyPastoralDesk.mountStaticDesk();

    renderUpstreamBanner();

    renderSurvey();

    var latest = global.AssessmentRunStore && AssessmentRunStore.loadLatest("urgent");

    if (latest && !latest.is_demo) renderReport(latest, {});

  }



  global.UrgencyAcsShell = {

    init: init,

    submitQuick: submitQuick,

    loadDemoReport: loadDemoReport,

    renderReport: renderReport

  };



  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);

  else init();

})(typeof window !== "undefined" ? window : global);

