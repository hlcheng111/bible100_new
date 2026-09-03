/**
 * G 規劃 · PREVIEW 側欄 v2.1（規模 · 小白/長執 · 主路 · 進度 · 索引抽屜）
 */
(function (global) {
  "use strict";

  var SIZE_KEY = "b100_planning_preview_size";
  var OPEN_CAT_KEY = "b100_planning_open_cat";
  var DEFAULT_MODE = "expert";

  var PATH_LABELS = {
    micro: "📍 微型快徑：靈命 → RACI → 戰情室",
    small: "📍 小型路徑：Phase 1 全做 → Phase 2 選做 → 戰情室",
    large: "📍 中大型：Phase 1 含 NCD → Phase 2/3 逐步 → 戰情室"
  };

  var MAIN_PATHS = {
    micro: [
      { n: 1, label: "靈命健康", href: "Church_Governance_spiritual_health.html", sub: "Spiritual Health · 約 10 分鐘" },
      { n: 2, label: "權責梳理 · RACI", href: "planning/raci-reflection.html", sub: "Job Clarity" },
      { n: 3, label: "健康雷達戰情室", href: "cta-os-war-room.html", sub: "六維紅綠燈" }
    ],
    small: [
      { n: 1, label: "靈命健康", href: "Church_Governance_spiritual_health.html", sub: "Spiritual Health" },
      { n: 2, label: "領袖健康", href: "Church_Governance_pastoral_health.html", sub: "Leader Care" },
      { n: 3, label: "教會健康 · NCD", href: "Church_Health_NCD_planning.html", sub: "Church Health" },
      { n: 4, label: "恩賜探索 · SHAPE", href: "shape-gifts-assessment.html", sub: "Gift Profile · 選 2～4 項" },
      { n: 5, label: "戰略盤點 · SWOT", href: "Church_Governance_SWOT_matrix.html", sub: "Strategy Map" },
      { n: 6, label: "健康雷達戰情室", href: "cta-os-war-room.html", sub: "主線出口" }
    ],
    large: [
      { n: 1, label: "靈命健康", href: "Church_Governance_spiritual_health.html", sub: "Spiritual Health" },
      { n: 2, label: "教會健康 · NCD", href: "Church_Health_NCD_planning.html", sub: "Church Health" },
      { n: 3, label: "領導基準 · ALDA", href: "alda-leadership-assessment.html", sub: "Leadership" },
      { n: 4, label: "戰略盤點 · SWOT", href: "Church_Governance_SWOT_matrix.html", sub: "Strategy Map" },
      { n: 5, label: "目標設定 · SMART", href: "Church_Governance_SMART_goals.html", sub: "Clear Goals" },
      { n: 6, label: "指標對齊 · KPI", href: "Church_Governance_KPI_alignment.html", sub: "KPI Alignment" },
      { n: 7, label: "季度跟進 · PDCA", href: "Church_Governance_PDCA_cycle.html", sub: "Review Cycle" },
      { n: 8, label: "健康雷達戰情室", href: "cta-os-war-room.html", sub: "整合決策" }
    ]
  };

  var OPTIONAL_FOR = {
    micro: ["ncd", "pastoral", "shape", "competency", "johari", "alda", "swot", "smart", "kpiokr", "pdca", "urgent", "ministry8020", "culture", "disc", "mbti", "matchmaker"],
    small: ["alda", "competency", "disc", "mbti", "matchmaker", "culture", "ministry8020", "urgent"],
    large: []
  };

  function lsGet(key, fallback) {
    try {
      return global.localStorage.getItem(key) || fallback;
    } catch (e) {
      return fallback;
    }
  }

  function lsSet(key, val) {
    try {
      global.localStorage.setItem(key, val);
    } catch (e2) { /* ignore */ }
  }

  function progressPercent() {
    var gate = global.PlanningPhaseGate;
    if (gate && gate.phase1Progress) {
      var p = gate.phase1Progress();
      var base = p.total ? Math.round((p.done / p.total) * 40) : 0;
      if (gate.warRoomScanned && gate.warRoomScanned()) base = Math.max(base, 70);
      if (gate.phase3Unlocked && gate.phase3Unlocked()) base = Math.max(base, 85);
      return Math.min(100, base);
    }
    return 15;
  }

  function renderMainPath(size) {
    var host = document.getElementById("sb-main-path");
    if (!host) return;
    var steps = MAIN_PATHS[size] || MAIN_PATHS.micro;
    host.innerHTML = steps
      .map(function (s) {
        return (
          '<a href="' +
          s.href +
          '" target="contentFrame" class="sb-main-path__btn">' +
          '<span class="sb-main-path__num">' +
          s.n +
          "</span>" +
          "<span><strong>" +
          s.label +
          "</strong><small>" +
          (s.sub || "") +
          "</small></span></a>"
        );
      })
      .join("");
  }

  function applyToolVisibility(size) {
    var opt = OPTIONAL_FOR[size] || [];
    document.querySelectorAll("[data-tool-id]").forEach(function (el) {
      var id = el.getAttribute("data-tool-id");
      var isOpt = opt.indexOf(id) >= 0;
      el.classList.toggle("is-optional", isOpt);
      if (size === "micro" && (id === "ncd" || id === "pastoral")) {
        el.setAttribute("data-optional-label", "選做");
      } else {
        el.removeAttribute("data-optional-label");
      }
    });
  }

  function restoreOpenCategory() {
    var host = document.getElementById("sb-plan-categories");
    if (!host) return;
    var cats = host.querySelectorAll(":scope > .sb-g-cat");
    if (!cats.length) return;
    var saved = lsGet(OPEN_CAT_KEY, "");
    var opened = false;
    cats.forEach(function (d) {
      var match = saved && d.getAttribute("data-g-cat") === saved;
      d.open = !!match;
      if (match) opened = true;
    });
    if (!opened && cats[0]) cats[0].open = true;
  }

  function applyMode(mode) {
    mode = mode || DEFAULT_MODE;
    var body = document.body;
    body.setAttribute("data-sb-mode", mode);
    var lab = document.getElementById("sb-lab-zone");
    if (lab) lab.hidden = true;
    collapseCategoriesForNovice(mode);
    var gMenu = document.getElementById("sb-g-menu");
    if (gMenu) gMenu.hidden = false;
  }

  function collapseCategoriesForNovice(mode) {
    if (mode !== "novice") return;
    document.querySelectorAll("#sb-plan-categories .sb-g-cat").forEach(function (d) {
      d.open = false;
    });
    document.querySelectorAll(".sb-g-admin-sub").forEach(function (d) {
      d.open = false;
    });
    var adminFolder = document.getElementById("sb-folder-admin");
    var planFolder = document.getElementById("sb-folder-plan");
    if (adminFolder) adminFolder.open = true;
    if (planFolder) planFolder.open = true;
  }

  function applySize(size) {
    size = MAIN_PATHS[size] ? size : "micro";
    lsSet(SIZE_KEY, size);
    document.querySelectorAll("[data-size]").forEach(function (btn) {
      if (btn.classList.contains("size-pill")) {
        btn.classList.toggle("is-active", btn.getAttribute("data-size") === size);
      }
    });
    var pathEl = document.getElementById("sb-path-label");
    if (pathEl) pathEl.textContent = PATH_LABELS[size] || PATH_LABELS.micro;
    renderMainPath(size);
    applyToolVisibility(size);
    /* 換規模不重置已展開的類別（避免縮回第一類） */
    try {
      global.parent.postMessage({ type: "b100-planning-size", size: size }, "*");
    } catch (e) { /* ignore */ }
  }

  function updateProgressBar() {
    var pct = progressPercent();
    var fill = document.getElementById("sb-progress-fill");
    var text = document.getElementById("sb-progress-text");
    if (fill) fill.style.width = pct + "%";
    if (text) text.textContent = "規劃旅程約 " + pct + "%（填表與戰情室會更新）";
  }

  function bindAccordionSingleOpen() {
    var host = document.getElementById("sb-plan-categories");
    if (!host || host._b100AccordionBound) return;
    host._b100AccordionBound = true;
    host.addEventListener(
      "toggle",
      function (ev) {
        var d = ev.target;
        if (!d.classList || !d.classList.contains("sb-g-cat")) return;
        if (!d.open) return;
        var cat = d.getAttribute("data-g-cat");
        if (cat) lsSet(OPEN_CAT_KEY, cat);
        host.querySelectorAll(":scope > .sb-g-cat").forEach(function (other) {
          if (other !== d) other.open = false;
        });
      },
      true
    );
  }

  function bindIndexDrawer() {
    /* index drawer removed — 三層選單取代 */
  }

  function boot() {
    var size = lsGet(SIZE_KEY, "micro");
    applySize(size);
    applyMode(DEFAULT_MODE);
    updateProgressBar();

    document.querySelectorAll(".size-pill").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applySize(btn.getAttribute("data-size"));
      });
    });

    bindAccordionSingleOpen();
    restoreOpenCategory();
    bindIndexDrawer();

    global.addEventListener("storage", function () {
      applySize(lsGet(SIZE_KEY, "micro"));
      updateProgressBar();
    });
    setInterval(updateProgressBar, 8000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  global.PlanningSidebarPreviewV21 = {
    applySize: applySize,
    MAIN_PATHS: MAIN_PATHS,
    SIZE_KEY: SIZE_KEY
  };
})(typeof window !== "undefined" ? window : this);
