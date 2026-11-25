/**
 * Bible100 · 教會規模 → 導航密度（不刪功能，只 hide／摺疊／「更多」）
 * 鍵：b100_planning_preview_size（與規劃共用：micro | small | medium | large）
 * 規劃模組只有三條路線圖，medium 在規劃頁併入「中大型」路線，但鍵值保持 medium 不被覆寫。
 */
(function (global) {
  "use strict";

  var SIZE_KEY = "b100_planning_preview_size";
  var REVEAL_KEY = "b100_size_nav_reveal_all";

  /* 人數以主日平均出席計；區間與 js/cm_size_tier_config.js 一致（下限含、上限不含） */
  var LABELS = {
    micro: "微型 · 不滿 50 人",
    small: "小型 · 50–149 人",
    medium: "中型 · 150–499 人",
    large: "大型 · 500 人以上"
  };

  /** 密度表（現碼三鈕＝micro/small/large；medium 供別名／未來） */
  var DENSITY = {
    micro: {
      visibleDepts: ["A", "B"],
      planningMode: "suggest_fold_advanced",
      hint: "微型堂先看敬拜＋牧養；其餘（含社會／詩歌／行政）在「更多」。",
      showLargeTip: false
    },
    small: {
      visibleDepts: ["A", "B", "C", "G"],
      planningMode: "suggest_fold_advanced",
      hint: "小型堂先看敬拜／牧養／門訓／行政(G)；外展／社會／詩歌在「更多」。",
      showLargeTip: false
    },
    medium: {
      visibleDepts: ["A", "B", "C", "D", "E", "F", "G"],
      planningMode: "suggest_fold_advanced",
      hint: "中型堂（150–499 人）：A–G 部門工作臺全開；規劃進階工具預設摺疊。",
      showLargeTip: false
    },
    large: {
      visibleDepts: ["A", "B", "C", "D", "E", "F", "G"],
      planningMode: "all_open",
      hint: "完整模式：A–G 部門與工具全開。",
      showLargeTip: true
    }
  };

  var ALIAS = {
    micro: "micro",
    small: "small",
    medium: "medium",
    large: "large",
    "微": "micro",
    "小": "small",
    "中": "medium",
    "大": "large",
    "微型": "micro",
    "小型": "small",
    "中型": "medium",
    "大型": "large",
    "中大型": "large"
  };

  function lsGet(key) {
    try {
      return global.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function lsSet(key, val) {
    try {
      global.localStorage.setItem(key, val);
    } catch (e2) { /* ignore */ }
  }

  function ssGet(key) {
    try {
      return global.sessionStorage.getItem(key);
    } catch (e3) {
      return null;
    }
  }

  function ssSet(key, val) {
    try {
      if (val == null) global.sessionStorage.removeItem(key);
      else global.sessionStorage.setItem(key, val);
    } catch (e4) { /* ignore */ }
  }

  function normalize(raw) {
    var s = String(raw || "micro").trim();
    if (ALIAS[s]) return ALIAS[s];
    s = s.toLowerCase();
    if (ALIAS[s]) return ALIAS[s];
    return DENSITY[s] ? s : "micro";
  }

  function get() {
    return normalize(lsGet(SIZE_KEY) || "micro");
  }

  function set(size) {
    var s = normalize(size);
    /* 寫入仍以規劃三鈕為主；medium 可寫入供密度讀 */
    lsSet(SIZE_KEY, s === "medium" ? "medium" : s);
    return s;
  }

  /** 檔位內容以 cm_size_tier_config.js 為準（單一真相）；沒載入設定檔時才用本檔內建表 */
  function configDensity(size) {
    var C = global.CmSizeTierConfig;
    if (!C || typeof C.tierById !== "function") return null;
    var t = C.tierById(size);
    if (!t || !Array.isArray(t.visible_depts)) return null;
    return {
      visibleDepts: t.visible_depts.slice(),
      planningMode: t.fold_advanced ? "suggest_fold_advanced" : "all_open",
      hint: t.hint_zh || "",
      showLargeTip: !!t.show_large_tip
    };
  }

  function getDensity(size) {
    var s = normalize(size || get());
    return configDensity(s) || DENSITY[s] || DENSITY.micro;
  }

  /** hidden 屬性會被 display:inline-block 之類的樣式蓋掉，這裡補一條保險（只注入一次） */
  function ensureStyle() {
    if (!document || !document.head || document.getElementById("b100-size-nav-style")) return;
    var st = document.createElement("style");
    st.id = "b100-size-nav-style";
    st.textContent = ".b100-size-hidden,[data-size-feature][hidden],[data-size-dept][hidden],[data-size-reveal-btn][hidden],[data-size-reveal-hint][hidden]{display:none!important}";
    document.head.appendChild(st);
  }

  /** 這個標記了 data-size-feature 的元素，在目前檔位是否要預設顯示 */
  function featureShown(featureId, size) {
    var C = global.CmSizeTierConfig;
    if (!C || typeof C.featureVisible !== "function") return true; /* 沒設定檔：不亂藏 */
    return C.featureVisible(featureId, normalize(size));
  }

  function isRevealed() {
    return ssGet(REVEAL_KEY) === "1";
  }

  function revealAll(rootEl) {
    ssSet(REVEAL_KEY, "1");
    applyDensity(rootEl || document);
    try {
      global.dispatchEvent(new CustomEvent("b100-size-reveal", { detail: { revealed: true } }));
    } catch (e5) { /* ignore */ }
  }

  function clearReveal() {
    ssSet(REVEAL_KEY, null);
  }

  function shouldFoldAdvanced(size) {
    var d = getDensity(size);
    if (isRevealed()) return false;
    return d.planningMode === "suggest_fold_advanced";
  }

  function applyDensity(rootEl) {
    var root = rootEl && rootEl.querySelector ? rootEl : document;
    var size = get();
    var d = getDensity(size);
    var revealed = isRevealed();
    var visible = d.visibleDepts || [];

    if (document.body) {
      document.body.setAttribute("data-church-size", size);
      document.body.setAttribute("data-b100-fold-advanced", shouldFoldAdvanced(size) ? "1" : "0");
      document.body.setAttribute("data-b100-reveal-all", revealed ? "1" : "0");
    }

    var hiddenCount = 0;
    root.querySelectorAll("[data-size-dept]").forEach(function (el) {
      var code = (el.getAttribute("data-size-dept") || "").toUpperCase();
      var show = revealed || visible.indexOf(code) >= 0;
      el.classList.toggle("b100-size-hidden", !show);
      el.hidden = !show;
      if (!show) hiddenCount++;
    });

    ensureStyle();
    root.querySelectorAll("[data-size-feature]").forEach(function (el) {
      var show = revealed || featureShown(el.getAttribute("data-size-feature"), size);
      el.classList.toggle("b100-size-hidden", !show);
      el.hidden = !show;
      if (!show) hiddenCount++;
    });

    root.querySelectorAll("[data-size-density-hint]").forEach(function (el) {
      el.textContent = d.hint || "";
    });

    root.querySelectorAll("[data-size-label]").forEach(function (el) {
      el.textContent = LABELS[size] || size;
    });

    root.querySelectorAll("[data-size-large-tip]").forEach(function (el) {
      var on = !!(d.showLargeTip && !revealed);
      el.hidden = !on;
      el.classList.toggle("b100-size-hidden", !on);
    });

    root.querySelectorAll("[data-size-reveal-btn]").forEach(function (btn) {
      var need = hiddenCount > 0 && !revealed;
      btn.hidden = !need;
      btn.setAttribute("aria-expanded", revealed ? "true" : "false");
    });

    root.querySelectorAll("[data-size-reveal-tools-btn]").forEach(function (btn) {
      var need = shouldFoldAdvanced(size);
      btn.hidden = !need;
    });

    root.querySelectorAll("[data-size-fold-panel]").forEach(function (panel) {
      var fold = shouldFoldAdvanced(size);
      if (panel.tagName === "DETAILS") {
        panel.open = !fold || revealed;
      } else {
        panel.hidden = fold && !revealed;
      }
    });

    return { size: size, density: d, revealed: revealed, hiddenCount: hiddenCount };
  }

  function bindRevealButtons(rootEl) {
    var root = rootEl && rootEl.querySelector ? rootEl : document;
    root.querySelectorAll("[data-size-reveal-btn], [data-size-reveal-tools-btn]").forEach(function (btn) {
      if (btn._b100SizeBound) return;
      btn._b100SizeBound = true;
      btn.addEventListener("click", function () {
        revealAll(root);
      });
    });
  }

  global.B100ChurchSize = {
    SIZE_KEY: SIZE_KEY,
    REVEAL_KEY: REVEAL_KEY,
    LABELS: LABELS,
    DENSITY: DENSITY,
    get: get,
    set: set,
    normalize: normalize,
    getDensity: getDensity,
    featureShown: featureShown,
    isRevealed: isRevealed,
    revealAll: revealAll,
    clearReveal: clearReveal,
    shouldFoldAdvanced: shouldFoldAdvanced,
    applyDensity: applyDensity,
    bindRevealButtons: bindRevealButtons
  };
})(typeof window !== "undefined" ? window : this);
