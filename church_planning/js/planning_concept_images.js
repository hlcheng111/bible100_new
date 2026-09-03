/**
 * G 規劃 · Tab① 概念圖（image_plan/C/）
 * 用法：<div data-concept-tool="urgent" data-concept-base=""></div>
 * 子目錄頁：data-concept-base="../"
 */
(function (global) {
  "use strict";

  var CONCEPT = {
    spiritual: {
      file: "C01_spiritual.png",
      alt: "信徒靈命健康五維示意",
      cap: "看懂功效：起步體檢看整體靈命輪廓，不是考核排名。"
    },
    pastoral: {
      file: "C02_pastoral.jpeg",
      alt: "領袖健康診斷示意",
      cap: "看懂功效：領袖自我覺察與牧養負擔，供面談參考。"
    },
    shape: {
      file: "C03_shape.jpg",
      alt: "SHAPE 五向度恩賜示意",
      cap: "看懂功效：S/H/A/P/E 交會，答「適合做什麼事」，不是比較優劣。"
    },
    competency: {
      file: "C04_competency.png",
      alt: "事奉能力評估示意",
      cap: "看懂功效：能力可培育，熱情與恩賜需一併對讀。"
    },
    alda: {
      file: "C05_alda.png",
      alt: "ALDA 領導力示意",
      cap: "看懂功效：長執帶領基準，修飾事奉節奏與決策風格。"
    },
    urgent: {
      file: "C07_urgent.jpg",
      alt: "重要與緊急四象限示意",
      cap: "看懂功效：看精力落在哪一格；目標是把 Q2 排進日曆，不是逼更多救火。"
    },
    pdca: {
      file: "C08_pdca.jpg",
      alt: "PDCA 計劃執行檢核迴圈示意",
      cap: "看懂功效：Plan 定標竿後，用季度檢核對照日常行政。"
    },
    johari: {
      file: "C09_johari.png",
      alt: "Johari 窗戶盲點示意",
      cap: "看懂功效：團隊互為鏡子，看見盲點與可公開的優勢。"
    },
    disc: {
      file: "C10_disc.png",
      alt: "DISC 行為風格示意",
      cap: "看懂功效：答「怎麼溝通與協作」，不取代恩賜呼召。"
    },
    mbti: {
      file: "C11_mbti.webp",
      alt: "MBTI 自我覺察示意",
      cap: "看懂功效：偏好與決策節奏參考，須與 SHAPE 一併解讀。"
    },
    ministry8020: {
      file: "C12_ministry8020.jpg",
      alt: "80/20 事奉聚焦示意",
      cap: "看懂功效：找出少數關鍵事工，避免精力分散。"
    },
    swot: {
      file: "C13_swot.png",
      alt: "SWOT TOWS 戰略交叉矩陣示意",
      cap: "看懂功效：內外因子交叉產出可執行策略，不是停在盤點。"
    },
    culture: {
      file: "C14_culture.jpg",
      alt: "教會文化契合示意",
      cap: "看懂功效：價值觀與事工節奏是否同向，供團隊對話。"
    },
    smart: {
      file: "C15_smart.png",
      alt: "SMART 目標設定示意",
      cap: "看懂功效：把異象寫成可檢核的具體目標。"
    },
    kpiokr: {
      file: "C16_kpiokr.png",
      alt: "KPI OKR 對齊示意",
      cap: "看懂功效：衡量是否走在標竿上，不是 KPI 競賽。"
    },
    ncd: {
      file: "C17_ncd.avif",
      alt: "NCD 木桶最小因子示意",
      cap: "看懂功效：最短板決定今年唯一攻堅主軸，不是每條河道同時開挖。"
    },
    raci: {
      file: "C18_raci.png",
      alt: "RACI 權責分工示意",
      cap: "看懂功效：釐清誰是 A（當責），避免「大家都在做、沒人負責」。"
    }
  };

  var LANDING_KEYS = ["spiritual", "urgent", "shape", "swot", "ncd", "raci"];

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function srcFor(toolId, base) {
    var c = CONCEPT[toolId];
    if (!c) return "";
    base = base || "";
    if (base && base.charAt(base.length - 1) !== "/") base += "/";
    return base + "image_plan/C/" + c.file;
  }

  function renderFigure(toolId, base) {
    var c = CONCEPT[toolId];
    if (!c) return "";
    var src = srcFor(toolId, base);
    return (
      '<figure class="acs-concept-fig">' +
      '<img src="' +
      esc(src) +
      '" alt="' +
      esc(c.alt) +
      '" class="acs-concept-diagram" loading="lazy" decoding="async">' +
      '<figcaption class="acs-concept-caption">' +
      esc(c.cap) +
      "</figcaption></figure>"
    );
  }

  function mount(el) {
    if (!el || el.getAttribute("data-concept-mounted") === "1") return;
    var toolId = el.getAttribute("data-concept-tool");
    if (!toolId) return;
    var html = renderFigure(toolId, el.getAttribute("data-concept-base") || "");
    if (!html) return;
    el.innerHTML = html;
    el.setAttribute("data-concept-mounted", "1");
  }

  function mountAll(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll("[data-concept-tool]").forEach(mount);
  }

  function renderLandingGrid(base) {
    base = base || "";
    var items = LANDING_KEYS.map(function (id) {
      var c = CONCEPT[id];
      if (!c) return "";
      var href =
        id === "raci"
          ? "planning/raci-reflection.html"
          : id === "spiritual"
            ? "Church_Governance_spiritual_health.html"
            : id === "urgent"
              ? "Church_Governance_urgent_matrix.html"
              : id === "shape"
                ? "shape-gifts-assessment.html"
                : id === "swot"
                  ? "Church_Governance_SWOT_matrix.html"
                  : id === "ncd"
                    ? "Church_Health_NCD_planning.html"
                    : "#";
      var onclick =
        'return planningOpenContent(event,\'' + href.replace(/^\.\//, "") + "');";
      return (
        '<a href="' +
        esc(href) +
        '" class="lp-concept-card" onclick="' +
        esc(onclick) +
        '">' +
        '<img src="' +
        esc(srcFor(id, base)) +
        '" alt="' +
        esc(c.alt) +
        '" loading="lazy" decoding="async">' +
        "<span>" +
        esc(c.alt.replace("示意", "")) +
        "</span></a>"
      );
    });
    return '<div class="lp-concept-grid" aria-label="量表概念圖速覽">' + items.join("") + "</div>";
  }

  function boot() {
    mountAll(document);
    var landing = document.getElementById("lp-concept-grid-mount");
    if (landing) {
      landing.innerHTML = renderLandingGrid(landing.getAttribute("data-concept-base") || "");
    }
  }

  global.PlanningConceptImage = {
    CONCEPT: CONCEPT,
    srcFor: srcFor,
    renderFigure: renderFigure,
    renderLandingGrid: renderLandingGrid,
    mount: mount,
    mountAll: mountAll
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(typeof window !== "undefined" ? window : this);
