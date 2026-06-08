/**
 * MinistryPathBridge · 六步事奉配對路線（可點擊跳轉）
 */
(function (global) {
  "use strict";

  var REPORT_HREF = {
    shape: "shape-gifts-assessment.html#report",
    johari: "johari-window-assessment.html#report",
    disc: "disc-profile-assessment.html#report",
    mbti: "mbti-self-awareness.html#report",
    alda: "alda-leadership-assessment.html#report",
    competency: "ministry-competency-assessment.html#report"
  };

  var STEPS = [
    {
      n: 1,
      title: "SHAPE 恩賜",
      lead: "答「做什麼事」",
      toolId: "shape",
      href: "shape-gifts-assessment.html",
      kind: "content"
    },
    {
      n: 2,
      title: "Johari 自評",
      lead: "我的內省 · 24 題",
      toolId: "johari",
      href: "johari-window-assessment.html#survey-self",
      kind: "content"
    },
    {
      n: 3,
      title: "DISC + MBTI",
      lead: "溝通與決策節奏",
      toolIds: ["disc", "mbti"],
      href: "disc-profile-assessment.html",
      kind: "content",
      extraLink: { label: "MBTI", href: "mbti-self-awareness.html" }
    },
    {
      n: 4,
      title: "Johari 他評",
      lead: "邀請 2–3 人 · 360 鏡子",
      check: "peer",
      href: "johari-window-assessment.html#survey-peer",
      kind: "content",
      minPeers: 2
    },
    {
      n: 5,
      title: "看出路卡",
      lead: "就位／試任／拓荒",
      check: "path_cards",
      href: "shape-gifts-assessment.html#report",
      kind: "content"
    },
    {
      n: 6,
      title: "事奉媒合中心",
      lead: "牧者約談 → 正式登記",
      check: "hitl",
      href: "church_ministry/guide_crm_journey_hub.html?tab=matchmaker",
      kind: "root"
    }
  ];

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function resolveHref(step, options) {
    if (step.n === 5 && options && options.currentToolId && REPORT_HREF[options.currentToolId]) {
      return REPORT_HREF[options.currentToolId];
    }
    return step.href;
  }

  function navigateTo(href, kind, ev) {
    if (ev && typeof ev.preventDefault === "function") ev.preventDefault();
    href = String(href || "");
    if (kind === "root" && global.planningOpenRoot) {
      return global.planningOpenRoot(ev || { preventDefault: function () {} }, href);
    }
    if (global.planningOpenContent) {
      return global.planningOpenContent(ev || { preventDefault: function () {} }, href);
    }
    try {
      global.location.href = href;
    } catch (e) {}
    return false;
  }

  function getProgress(store) {
    store = store || global.AssessmentRunStore;
    var out = {
      shape: false,
      johari: false,
      disc: false,
      mbti: false,
      peers: 0,
      path_cards: false,
      hitl: false,
      subjectName: ""
    };
    if (!store || !store.loadLatest) return out;
    out.shape = !!store.loadLatest("shape");
    var j = store.loadLatest("johari");
    out.johari = !!j;
    out.disc = !!store.loadLatest("disc");
    out.mbti = !!store.loadLatest("mbti");
    if (j && j.profile && j.profile.name) out.subjectName = String(j.profile.name).trim();
    if (store.listPeerRuns) {
      out.peers = store.listPeerRuns(out.subjectName || null).length;
    }
    ["shape", "johari", "disc", "mbti"].forEach(function (id) {
      var r = store.loadLatest(id);
      if (r && r.path_cards && r.path_cards.length) out.path_cards = true;
    });
    try {
      out.hitl = !!global.localStorage.getItem("bible100_path_hitl_reviewed");
    } catch (e) {}
    return out;
  }

  function stepDone(step, prog) {
    if (step.toolId) return !!prog[step.toolId];
    if (step.toolIds) {
      return step.toolIds.every(function (id) {
        return !!prog[id];
      });
    }
    if (step.check === "peer") return prog.peers >= (step.minPeers || 2);
    if (step.check === "path_cards") return prog.path_cards;
    if (step.check === "hitl") return prog.hitl;
    return false;
  }

  function renderHtml(options) {
    options = options || {};
    var compact = !!options.compact;
    var prog = getProgress(options.store);
    var doneCount = STEPS.filter(function (s) {
      return stepDone(s, prog);
    }).length;

    var rows = STEPS.map(function (step) {
      var done = stepDone(step, prog);
      var badge = done ? "✅" : "⬜";
      var href = resolveHref(step, options);
      var extra = "";
      if (step.check === "peer" && prog.peers > 0 && !done) {
        extra = ' <span class="mpwf-note">（已收 ' + prog.peers + " 份他評）</span>";
      }
      if (step.toolIds && (prog.disc || prog.mbti) && !done) {
        extra =
          ' <span class="mpwf-note">（' +
          (prog.disc ? "DISC✓" : "DISC—") +
          " · " +
          (prog.mbti ? "MBTI✓" : "MBTI—") +
          "）</span>";
      }
      var linkExtra = "";
      if (step.extraLink) {
        linkExtra =
          ' · <a class="mpwf-link" href="#" data-mpwf-href="' +
          esc(step.extraLink.href) +
          '" data-mpwf-kind="content">' +
          esc(step.extraLink.label) +
          "</a>";
      }
      return (
        '<li class="mpwf-step' +
        (done ? " mpwf-step--done" : "") +
        '">' +
        '<span class="mpwf-badge" aria-hidden="true">' +
        badge +
        "</span>" +
        '<span class="mpwf-num">' +
        step.n +
        ".</span> " +
        '<a class="mpwf-link mpwf-link--main" href="#" data-mpwf-href="' +
        esc(href) +
        '" data-mpwf-kind="' +
        esc(step.kind) +
        '">' +
        esc(step.title) +
        "</a>" +
        linkExtra +
        ' <span class="mpwf-lead">— ' +
        esc(step.lead) +
        extra +
        "</span></li>"
      );
    }).join("");

    var peerHint =
      prog.peers < 2
        ? '<p class="mpwf-foot">步驟 4：請邀請 <strong>2–3 位</strong>同工填 Johari 他評（可點上方連結直達）。</p>'
        : '<p class="mpwf-foot">步驟 4：已收 <strong>' +
          prog.peers +
          "</strong> 份他評" +
          (prog.subjectName ? "（" + esc(prog.subjectName) + "）" : "") +
          "。</p>";

    return (
      '<section class="mpwf' +
      (compact ? " mpwf--compact" : "") +
      '" aria-label="六步事奉配對路線">' +
      '<h3 class="mpwf-title">🧭 六步事奉配對路線</h3>' +
      '<p class="mpwf-intro">點任一步驟<strong>直接跳轉</strong>該工具。系統不會自動幫您排班；正式派任須牧者確認。</p>' +
      '<p class="mpwf-progress">進度：<strong>' +
      doneCount +
      " / " +
      STEPS.length +
      "</strong></p>" +
      '<ol class="mpwf-list">' +
      rows +
      "</ol>" +
      peerHint +
      '<p class="mpwf-foot mpwf-foot--hitl">步驟 6：在 <a class="mpwf-link" href="#" data-mpwf-href="church_ministry/guide_crm_journey_hub.html?tab=matchmaker" data-mpwf-kind="root">事奉媒合中心</a> 完成約談與正式登記。</p>' +
      "</section>"
    );
  }

  function bindNavigation(container) {
    if (!container) return;
    container.addEventListener("click", function (ev) {
      var a = ev.target.closest("[data-mpwf-href]");
      if (!a) return;
      ev.preventDefault();
      navigateTo(a.getAttribute("data-mpwf-href"), a.getAttribute("data-mpwf-kind") || "content", ev);
    });
  }

  function injectStyles() {
    if (global.document.getElementById("mpwf-styles")) return;
    var style = global.document.createElement("style");
    style.id = "mpwf-styles";
    style.textContent =
      ".mpwf{border:2px solid #c7d2fe;border-radius:14px;background:linear-gradient(135deg,#eef2ff,#f8fafc);padding:14px 16px;margin:0 0 16px;font-size:12px;line-height:1.65;color:#334155}" +
      ".mpwf--compact{padding:10px 12px;font-size:11px}" +
      ".mpwf-title{margin:0 0 6px;font-size:14px;font-weight:800;color:#312e81}" +
      ".mpwf-intro,.mpwf-progress,.mpwf-foot{margin:0 0 8px;font-size:11px;color:#475569}" +
      ".mpwf-list{margin:0;padding-left:0;list-style:none}" +
      ".mpwf-step{margin:0 0 6px;padding:6px 8px;border-radius:8px;background:rgba(255,255,255,0.65)}" +
      ".mpwf-step--done{background:rgba(209,250,229,0.5)}" +
      ".mpwf-badge{margin-right:4px}" +
      ".mpwf-num{font-weight:800;color:#4338ca}" +
      ".mpwf-link{color:#1e40af;font-weight:700;text-decoration:underline;cursor:pointer}" +
      ".mpwf-link:hover{color:#4338ca}" +
      ".mpwf-lead{color:#64748b;font-weight:400}" +
      ".mpwf-note{color:#7c3aed;font-size:10px}" +
      ".mpwf-foot--hitl{margin-top:10px;padding-top:8px;border-top:1px solid #e2e8f0}";
    global.document.head.appendChild(style);
  }

  function mount(container, options) {
    if (!container) return;
    injectStyles();
    container.innerHTML = renderHtml(options);
    bindNavigation(container);
  }

  global.MinistryPathWorkflow = {
    STEPS: STEPS,
    getProgress: getProgress,
    stepDone: stepDone,
    renderHtml: renderHtml,
    mount: mount,
    navigateTo: navigateTo
  };
})(typeof window !== "undefined" ? window : global);
