/**
 * 五工具族 · 共用四 Tab 專業殼（coaching_desk.js）
 * Tab: intro | survey | report | coaching
 */
(function (global) {
  "use strict";

  var TAB_IDS = ["intro", "survey", "report", "coaching"];
  var TAB_LABELS = {
    intro: "① 理念與說明",
    survey: "② 開始測評",
    report: "③ 分析報告",
    coaching: "④ 輔導員手冊"
  };

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function $(id, root) {
    return (root || document).getElementById(id);
  }

  /**
   * @param {object} opts
   * @param {string} opts.toolId - shape | johari | disc | mbti
   * @param {string} opts.title
   * @param {string} [opts.subtitle]
   * @param {string} [opts.breadcrumbHtml]
   * @param {string[]} [opts.tabs] - subset of TAB_IDS; default all 4
   * @param {string} [opts.surveyLabel] - override tab ② label (e.g. Johari sub-flow hint)
   * @param {function} [opts.onTabChange]
   * @param {function} [opts.onAfterCoachingRender] - (toolId, run, hostEl) after Tab ④ HTML
   * @param {object} [opts.tabLabels] - override TAB_LABELS per tab id
   * @param {function} [opts.getLatestRun] - () => run | null for coaching desk
   */
  function init(opts) {
    opts = opts || {};
    var toolId = opts.toolId || "shape";
    var tabs = opts.tabs || TAB_IDS.slice();
    var state = { active: "intro", toolId: toolId, opts: opts };

    mountHeader(opts, tabs, state);
    bindTabs(tabs, state);
    renderIntro(toolId);
    mountWorkflow(toolId);
    mountSurveyIntro(toolId);

    if (opts.onInit) opts.onInit(state);

    var hash = (location.hash || "").replace(/^#/, "");
    if (hash && tabs.indexOf(hash) >= 0) switchTab(hash, state);
    else if (hash === "survey-self" || hash === "survey-peer") {
      switchTab("survey", state);
      if (global.switchSurveySub) global.switchSurveySub(hash === "survey-peer" ? "peer" : "self");
    } else {
      switchTab("intro", state);
    }

    global.switchTab = function (id) {
      switchTab(id, state);
    };

    return {
      switchTab: function (id) {
        switchTab(id, state);
      },
      refreshCoaching: function (run) {
        renderCoachingDesk(toolId, run != null ? run : getRun(opts));
      },
      refreshReportExtras: function (run, hostId) {
        injectReportExtras(toolId, run, hostId || "acs-report-extras");
      },
      getState: function () {
        return state;
      }
    };
  }

  function getRun(opts) {
    if (opts.getLatestRun) return opts.getLatestRun();
    if (global.AssessmentRunStore && opts.toolId) {
      return global.AssessmentRunStore.loadLatest(opts.toolId);
    }
    return null;
  }

  function mountHeader(opts, tabs, state) {
    var wrap = $("acs-shell-root");
    if (!wrap) return;

    var bc =
      opts.breadcrumbHtml ||
      '<a href="#" onclick="return planningOpenContent(event,\'assessment-os-hub.html\');">健康診斷中心</a> · ' +
        esc(opts.toolId || "");

    var tabHtml = tabs
      .map(function (id) {
        var label =
          (opts.tabLabels && opts.tabLabels[id]) ||
          (id === "survey" && opts.surveyLabel ? opts.surveyLabel : TAB_LABELS[id] || id);
        return (
          '<button type="button" class="acs-tab" data-acs-tab="' +
          id +
          '" aria-selected="false">' +
          esc(label) +
          "</button>"
        );
      })
      .join("");

    var header = wrap.querySelector(".acs-sticky-header");
    if (header) {
      var bcEl = header.querySelector(".acs-breadcrumb");
      if (bcEl) bcEl.innerHTML = bc;
      var titleEl = header.querySelector(".acs-title");
      if (titleEl) titleEl.textContent = opts.title || "";
      var subEl = header.querySelector(".acs-subtitle");
      if (subEl) subEl.textContent = opts.subtitle || "";
      var tabsEl = header.querySelector(".acs-tabs");
      if (tabsEl && tabsEl.getAttribute("data-acs-hardcoded") !== "true") {
        tabsEl.innerHTML = tabHtml;
      } else if (tabsEl && opts.tabLabels) {
        tabsEl.querySelectorAll("[data-acs-tab]").forEach(function (btn) {
          var id = btn.getAttribute("data-acs-tab");
          if (opts.tabLabels[id]) btn.textContent = opts.tabLabels[id];
        });
      }
    }
  }

  function bindTabs(tabs, state) {
    document.querySelectorAll("[data-acs-tab]").forEach(function (btn) {
      if (btn.getAttribute("data-acs-bound") === "true") return;
      btn.setAttribute("data-acs-bound", "true");
      btn.addEventListener("click", function () {
        switchTab(btn.getAttribute("data-acs-tab"), state);
      });
    });
    state.tabs = tabs;
  }

  function switchTab(id, state) {
    if (!state.tabs || state.tabs.indexOf(id) < 0) return;
    state.active = id;
    TAB_IDS.forEach(function (k) {
      var panel = $("tab-" + k);
      if (panel) panel.classList.toggle("hidden", k !== id);
      if (panel) panel.classList.toggle("acs-panel", true);
    });
    document.querySelectorAll("[data-acs-tab]").forEach(function (btn) {
      var on = btn.getAttribute("data-acs-tab") === id;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    if (id === "coaching") {
      var coachingRun = getRun(state.opts);
      renderCoachingDesk(state.toolId, coachingRun);
      if (state.opts.onAfterCoachingRender) {
        state.opts.onAfterCoachingRender(state.toolId, coachingRun, $("tab-coaching-content"));
      }
    }
    if (state.opts.onTabChange) state.opts.onTabChange(id, state);
    if (id !== "survey" && history.replaceState) {
      var h = id === "intro" ? "" : "#" + id;
      history.replaceState(null, "", h || location.pathname + location.search);
    }
  }

  function renderIntro(toolId) {
    var host = $("tab-intro-content");
    if (!host) return;
    if (host.getAttribute("data-acs-hardcoded") === "true") return;
    if (!global.CoachingDeskContent) return;
    host.innerHTML = CoachingDeskContent.introHtml(toolId);
  }

  function mountWorkflow(toolId) {
    var wf = $("mpwf-intro");
    if (wf && global.MinistryPathWorkflow) {
      MinistryPathWorkflow.mount(wf, { compact: true, currentToolId: toolId });
    }
  }

  function mountSurveyIntro(toolId) {
    var host = $("acs-survey-intro");
    if (host && global.CoachingDeskContent && CoachingDeskContent.surveyIntroHtml) {
      host.innerHTML = CoachingDeskContent.surveyIntroHtml(toolId);
    }
  }

  function injectReportExtras(toolId, run, hostId) {
    var host = $(hostId);
    if (!host || !global.CoachingDeskContent) return;
    host.innerHTML = CoachingDeskContent.reportExtrasHtml(toolId, run);
  }

  function refreshHardcodedCoachingSlots(toolId, run, host) {
    if (!host || !global.CoachingDeskContent) return;
    var hasRun = !!(run && run.derived);
    var memoEl = host.querySelector("#acs-memo-run");
    if (memoEl) {
      if (hasRun && toolId === "shape") {
        var d = run.derived;
        memoEl.textContent =
          "熱情主軸「" +
          (d.top_heart || "—") +
          "」· " +
          (d.personality_note || "");
        memoEl.classList.remove("acs-memo--empty");
      } else if (hasRun && toolId === "johari") {
        var jd = run.derived;
        var jmemo =
          "開放區 " +
          (jd.open_pct != null ? jd.open_pct : "?") +
          "% · 盲點區 " +
          (jd.blind_pct != null ? jd.blind_pct : "?") +
          "% · 主區「" +
          (jd.dominant || "—") +
          "」";
        if (jd.blended && jd.blended.note) jmemo += " · " + jd.blended.note;
        else if (jd.peer_overlay) jmemo += " · 他評 " + jd.peer_overlay.peer_count + " 份";
        memoEl.textContent = jmemo;
        memoEl.classList.remove("acs-memo--empty");
      } else if (hasRun && toolId === "disc") {
        var dd = run.derived;
        var sc = dd.scores || {};
        var dmemo =
          "主型「" +
          (dd.primary_label || dd.primary || "—") +
          "」· D" +
          (sc.D != null ? sc.D : "?") +
          "/I" +
          (sc.I != null ? sc.I : "?") +
          "/S" +
          (sc.S != null ? sc.S : "?") +
          "/C" +
          (sc.C != null ? sc.C : "?");
        if (dd.stress_primary && dd.stress_primary !== dd.primary) {
          dmemo += " · 壓力修飾「" + (dd.stress_primary_label || dd.stress_primary) + "」";
        }
        memoEl.textContent = dmemo;
        memoEl.classList.remove("acs-memo--empty");
      } else if (hasRun && toolId === "competency") {
        var cd = run.derived;
        var mp = cd.matrix_position || {};
        var cmemo =
          "強項「" +
          (cd.primary_label || "—") +
          "」· 待補「" +
          (cd.weakest_label || "—") +
          "」· " +
          (mp.profile_label || "KSA 輪廓");
        if (cd.ksa_execution_contract) cmemo += " · 執行力契約已通電";
        memoEl.textContent = cmemo;
        memoEl.classList.remove("acs-memo--empty");
      } else if (hasRun && toolId === "mbti") {
        var md = run.derived;
        var ap = md.axis_percents || {};
        var mmemo =
          "類型「" +
          (md.mbti_code || md.code || "—") +
          "」" +
          (md.type_label_church ? " · " + md.type_label_church : "");
        if (ap.EI) mmemo += " · I" + (ap.EI.I != null ? ap.EI.I : "?") + "%";
        if (ap.SN) mmemo += " · N" + (ap.SN.N != null ? ap.SN.N : "?") + "%";
        if (ap.TF) mmemo += " · F" + (ap.TF.F != null ? ap.TF.F : "?") + "%";
        if (md.shape_p_fallback && md.shape_p_fallback.p_axis_label) {
          mmemo += " · P軸 Fallback 已通電";
        }
        memoEl.textContent = mmemo;
        memoEl.classList.remove("acs-memo--empty");
      } else if (!hasRun) {
        memoEl.textContent =
          "💡 當會友在 Tab ② 完成評測後，這裡會自動出現「生命特寫」。目前請先參閱下方約談指南，或請會友點 Tab ② 頂部「示範報告」。";
        memoEl.classList.add("acs-memo--empty");
      }
    }
    var inviteEl = host.querySelector("#acs-invite-draft");
    if (inviteEl && CoachingDeskContent.buildPastoralInvite) {
      inviteEl.textContent = CoachingDeskContent.buildPastoralInvite(toolId, run);
    }
    var aiEl = host.querySelector("#acs-ai-instruction");
    if (aiEl && CoachingDeskContent.buildAiInstruction) {
      aiEl.textContent = CoachingDeskContent.buildAiInstruction(toolId, run);
    }
  }

  function bindCoachingDeskUi(host, toolId, run) {
    if (!host) return;
    if (host.getAttribute("data-acs-coaching-bound") === "true") {
      bindPrefillExport(host, toolId, run);
      return;
    }
    host.setAttribute("data-acs-coaching-bound", "true");
    var copyInvite = host.querySelector("[data-acs-copy-invite]");
    if (copyInvite) {
      copyInvite.addEventListener("click", function () {
        var pre = host.querySelector("#acs-invite-draft");
        copyText(pre ? pre.textContent : "", copyInvite, "已複製 ✓", "複製邀請信草稿");
      });
    }
    var copyAi = host.querySelector("[data-acs-copy-ai]");
    if (copyAi) {
      copyAi.addEventListener("click", function () {
        var pre = host.querySelector("#acs-ai-instruction");
        copyText(pre ? pre.textContent : "", copyAi, "已複製 ✓", "複製 AI 指令");
      });
    }
    var copyBtn = host.querySelector("[data-acs-copy-prompt]");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var pre = host.querySelector("#acs-hitl-prompt") || host.querySelector("#acs-ai-instruction");
        copyText(pre ? pre.textContent : "", copyBtn, "已複製 ✓", "複製");
      });
    }
    host.querySelectorAll("[data-acs-matchmaker]").forEach(function (btn) {
      btn.addEventListener("click", function (ev) {
        var mode = btn.getAttribute("data-acs-matchmaker");
        if (global.MatchmakerPrefill && typeof global.MatchmakerPrefill.launch === "function") {
          global.MatchmakerPrefill.launch(mode, toolId, run, ev);
        }
      });
    });
    var scrollExport = host.querySelector("[data-acs-scroll-export]");
    if (scrollExport) {
      scrollExport.addEventListener("click", function () {
        var panel = host.querySelector("#acs-prefill-export-panel");
        if (panel && panel.scrollIntoView) panel.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    bindPrefillExport(host, toolId, run);
  }

  function renderCoachingDesk(toolId, run) {
    var host = $("tab-coaching-content");
    if (!host || !global.CoachingDeskContent) return;
    if (host.getAttribute("data-acs-hardcoded") === "true") {
      refreshHardcodedCoachingSlots(toolId, run, host);
      bindCoachingDeskUi(host, toolId, run);
      return;
    }
    host.innerHTML = CoachingDeskContent.coachingDeskHtml(toolId, run);
    bindCoachingDeskUi(host, toolId, run);
  }

  function bindPrefillExport(host, toolId, run) {
    if (!global.MatchmakerPrefill) return;
    var MP = global.MatchmakerPrefill;

    function currentEnvelope(mode) {
      return MP.buildEnvelope(mode || "talent_seek_job", toolId, run);
    }

    var exportBtn = host.querySelector("[data-acs-export-json]");
    if (exportBtn) {
      exportBtn.addEventListener("click", function () {
        var env = currentEnvelope("talent_seek_job");
        MP.save(env);
        var name = (env.subject_name || "prefill").replace(/[^\w\u4e00-\u9fff-]+/g, "_");
        MP.downloadJson(env, "bible100_" + name + "_prefill.json");
      });
    }

    var qrBtn = host.querySelector("[data-acs-show-qr]");
    var qrHost = host.querySelector("#acs-prefill-qr");
    if (qrBtn && qrHost) {
      qrBtn.addEventListener("click", function () {
        var env = currentEnvelope("talent_seek_job");
        MP.save(env);
        qrHost.classList.remove("hidden");
        MP.renderQr(qrHost, env);
      });
    }

    var pickFile = host.querySelector("[data-acs-pick-import-file]");
    var fileInput = host.querySelector("#acs-prefill-import-file");
    var importTa = host.querySelector("#acs-prefill-import-text");
    if (pickFile && fileInput) {
      pickFile.addEventListener("click", function () {
        fileInput.click();
      });
      fileInput.addEventListener("change", function () {
        var f = fileInput.files && fileInput.files[0];
        if (!f) return;
        var reader = new FileReader();
        reader.onload = function () {
          if (importTa) importTa.value = reader.result || "";
        };
        reader.readAsText(f, "utf-8");
      });
    }

    var importLaunch = host.querySelector("[data-acs-import-launch]");
    if (importLaunch) {
      importLaunch.addEventListener("click", function (ev) {
        var parsed = MP.parseImportText(importTa ? importTa.value : "");
        if (!parsed.ok) {
          alert((parsed.errors || ["匯入失敗"]).join(" "));
          return;
        }
        MP.importEnvelope(parsed.envelope);
        var url = MP.buildHubUrl(parsed.envelope.mode, parsed.envelope.suggested_dept);
        if (global.planningOpenRoot) global.planningOpenRoot(ev, url);
        else global.location.href = "../" + url.replace(/^\.\.\//, "");
      });
    }
  }

  function copyText(text, btn, okLabel, resetLabel) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        btn.textContent = okLabel;
        setTimeout(function () {
          btn.textContent = resetLabel;
        }, 2000);
      });
    }
  }

  global.CoachingDesk = {
    TAB_IDS: TAB_IDS,
    TAB_LABELS: TAB_LABELS,
    init: init,
    renderIntro: renderIntro,
    renderCoachingDesk: renderCoachingDesk,
    injectReportExtras: injectReportExtras
  };
})(typeof window !== "undefined" ? window : global);
