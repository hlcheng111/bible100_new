/**
 * index_plan · 教會規模 multimode + 路線圖（與 PREVIEW 側欄 localStorage 同步）
 */
(function (global) {
  "use strict";

  var SIZE_KEY = "b100_planning_preview_size";
  var MODE_KEY = "b100_planning_preview_mode";

  var ROADMAPS = {
    micro: {
      title: "微型教會 · ≤80 人",
      subtitle: "最小閉環 · 約 30 分鐘可跑完一輪",
      steps: [
        { n: 1, label: "靈命健康", sub: "Spiritual Health · 約 10 分鐘", href: "Church_Governance_spiritual_health.html", tool: "spiritual" },
        { n: 2, label: "權責梳理 · RACI", sub: "Job Clarity", href: "planning/raci-reflection.html", tool: "raci" },
        { n: 3, label: "健康雷達戰情室", sub: "六維紅綠燈", href: "cta-os-war-room.html", tool: null }
      ],
      note: "教會健康 NCD、Phase 2/3 可略；需要時再開「健康診斷中心」。"
    },
    small: {
      title: "小型教會 · 81–250 人",
      subtitle: "Phase 1 全做 + Phase 2 選 2～4 項 + 策略節奏",
      steps: [
        { n: 1, label: "Phase 1 · 靈命 + 領袖 + NCD", sub: "起步體檢", href: "assessment-os-hub.html", tool: null },
        { n: 2, label: "Phase 2 · 恩賜與團隊", sub: "SHAPE · Johari 等", href: "assessment-os-hub.html", tool: null },
        { n: 3, label: "Phase 3 · SWOT / PDCA", sub: "戰略節奏", href: "Church_Governance_SWOT_matrix.html", tool: "swot" },
        { n: 4, label: "戰情室整合", sub: "看六維結果", href: "cta-os-war-room.html", tool: null }
      ],
      note: "左欄 PREVIEW 可切「長執模式」看完整 Phase 樹。"
    },
    large: {
      title: "中大型教會 · 251+ 人",
      subtitle: "Phase 1 含 NCD + ALDA · Phase 2/3 逐步解鎖",
      steps: [
        { n: 1, label: "Phase 1 · 含 NCD 大表", sub: "靈命 · 領袖 · 教會健康", href: "Church_Health_NCD_planning.html", tool: "ncd" },
        { n: 2, label: "Phase 2 · 團隊深耕", sub: "SHAPE · 能力 · Johari · ALDA", href: "assessment-os-hub.html", tool: null },
        { n: 3, label: "Phase 3 · 戰略衝刺", sub: "SWOT · SMART · KPI · PDCA", href: "guides/guide_step5_strategy.html", tool: null },
        { n: 4, label: "戰情室 + 落地行政", sub: "決策 → 執行", href: "cta-os-war-room.html", tool: null }
      ],
      note: "進階工具（媒合、80/20、文化）依戰情室破口按需開。"
    }
  };

  function lsModeGet() {
    try {
      return global.localStorage.getItem(MODE_KEY) || "novice";
    } catch (e) {
      return "novice";
    }
  }

  function lsModeSet(mode) {
    try {
      global.localStorage.setItem(MODE_KEY, mode);
    } catch (e2) { /* ignore */ }
  }

  function applyMode(mode) {
    mode = mode === "expert" ? "expert" : "novice";
    lsModeSet(mode);
    document.querySelectorAll("[data-lp-mode]").forEach(function (btn) {
      btn.classList.toggle("lp-mode-btn--active", btn.getAttribute("data-lp-mode") === mode);
    });
    var hint = document.getElementById("lp-mode-hint");
    if (hint) {
      hint.textContent =
        mode === "novice"
          ? "小白模式：跟路線圖大按鈕走；完整 Phase 與量表索引請切「長執模式」並開 PREVIEW 殼左欄。"
          : "長執模式：可開 PREVIEW 殼看 Phase 樹、步 5 策略閉環、17 表索引與日常行政。";
    }
  }

  function lsGet() {
    try {
      return global.localStorage.getItem(SIZE_KEY) || "micro";
    } catch (e) {
      return "micro";
    }
  }

  function lsSet(size) {
    try {
      global.localStorage.setItem(SIZE_KEY, size);
    } catch (e2) { /* ignore */ }
  }

  function openHref(step) {
    if (step.tool && global.planningOpenByToolId) {
      return "return planningOpenByToolId(event,'" + step.tool + "');";
    }
    if (global.planningOpenContent) {
      return "return planningOpenContent(event,'" + step.href + "');";
    }
    return "";
  }

  function renderRoadmap(size) {
    var data = ROADMAPS[size] || ROADMAPS.micro;
    var titleEl = document.getElementById("lp-roadmap-title");
    var subEl = document.getElementById("lp-roadmap-sub");
    var noteEl = document.getElementById("lp-roadmap-note");
    var track = document.getElementById("lp-roadmap-track");
    if (titleEl) titleEl.textContent = data.title;
    if (subEl) subEl.textContent = data.subtitle;
    if (noteEl) noteEl.textContent = data.note;
    if (!track) return;
    track.innerHTML = data.steps
      .map(function (s, i) {
        var arrow = i < data.steps.length - 1 ? '<span class="lp-roadmap__arrow" aria-hidden="true">→</span>' : "";
        return (
          '<a href="' +
          s.href +
          '" class="lp-roadmap__step" onclick="' +
          openHref(s) +
          '">' +
          '<span class="lp-roadmap__num">' +
          s.n +
          "</span>" +
          "<span><strong>" +
          s.label +
          "</strong><small>" +
          (s.sub || "") +
          "</small></span></a>" +
          arrow
        );
      })
      .join("");
  }

  function applySize(size) {
    size = ROADMAPS[size] ? size : "micro";
    lsSet(size);
    document.querySelectorAll("[data-lp-size]").forEach(function (btn) {
      btn.classList.toggle("lp-size-card--active", btn.getAttribute("data-lp-size") === size);
    });
    renderRoadmap(size);
  }

  function boot() {
    document.querySelectorAll("[data-lp-size]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applySize(btn.getAttribute("data-lp-size"));
      });
    });
    document.querySelectorAll("[data-lp-mode]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyMode(btn.getAttribute("data-lp-mode"));
      });
    });
    applySize(lsGet());
    applyMode(lsModeGet());
    global.addEventListener("storage", function () {
      applySize(lsGet());
      applyMode(lsModeGet());
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  global.PlanningLandingMultimode = {
    ROADMAPS: ROADMAPS,
    applySize: applySize,
    applyMode: applyMode,
    SIZE_KEY: SIZE_KEY,
    MODE_KEY: MODE_KEY
  };
})(typeof window !== "undefined" ? window : this);
