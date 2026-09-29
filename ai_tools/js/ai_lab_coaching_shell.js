/**
 * AI Lab · 小白辅导壳 Tab 切换（对齐 PDCA strategic-tab 行为）
 */
(function (g, doc) {
  "use strict";

  var toastEl;

  function showToast(msg) {
    if (!toastEl) {
      toastEl = doc.getElementById("alc-toast");
    }
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("alc-toast--show");
    clearTimeout(showToast._tid);
    showToast._tid = setTimeout(function () {
      toastEl.classList.remove("alc-toast--show");
    }, 3500);
  }

  function gotoTab(tabId, subId) {
    switchTab(tabId);
    if (subId) {
      switchSub(subId);
    }
  }

  function collectValidTabs() {
    var tabs = [];
    doc.querySelectorAll(".alc-tab-btn[data-alc-tab]").forEach(function (btn) {
      var id = btn.getAttribute("data-alc-tab");
      if (id && tabs.indexOf(id) < 0) tabs.push(id);
    });
    return tabs;
  }

  function resolveHash(raw, options) {
    options = options || {};
    var hash = String(raw || "").replace(/^#/, "");
    var aliases = options.hashAliases || {};
    if (aliases[hash]) hash = aliases[hash];
    return hash;
  }

  function switchTab(tabId) {
    doc.querySelectorAll(".alc-tab-btn[data-alc-tab]").forEach(function (btn) {
      var on = btn.getAttribute("data-alc-tab") === tabId;
      btn.classList.toggle("alc-tab-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    doc.querySelectorAll(".alc-panel").forEach(function (panel) {
      panel.classList.toggle("alc-panel-active", panel.id === "alc-panel-" + tabId);
    });
    try {
      g.history.replaceState(null, "", "#" + tabId);
    } catch (eH) {}
    try {
      g.scrollTo({ top: 0, behavior: "smooth" });
    } catch (eS) {
      g.scrollTo(0, 0);
    }
  }

  function switchSub(subId) {
    doc.querySelectorAll(".alc-sub-btn[data-alc-sub]").forEach(function (btn) {
      var on = btn.getAttribute("data-alc-sub") === subId;
      btn.classList.toggle("alc-sub-active", on);
    });
    doc.querySelectorAll(".alc-sub-panel").forEach(function (panel) {
      panel.classList.toggle("alc-sub-active", panel.id === "alc-sub-" + subId);
    });
  }

  function bootTabs(defaultTab, options) {
    options = options || {};
    var valid = options.validTabs || collectValidTabs();
    if (!valid.length) valid = ["intro", "how", "do"];
    doc.querySelectorAll(".alc-tab-btn[data-alc-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        switchTab(btn.getAttribute("data-alc-tab"));
      });
    });
    doc.querySelectorAll("[data-alc-goto-tab]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        if (el.tagName === "A") e.preventDefault();
        gotoTab(el.getAttribute("data-alc-goto-tab"), el.getAttribute("data-alc-goto-sub") || "");
      });
    });
    doc.querySelectorAll(".alc-stage-tab[data-alc-goto-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        gotoTab(btn.getAttribute("data-alc-goto-tab"), btn.getAttribute("data-alc-goto-sub") || "");
      });
    });
    doc.querySelectorAll(".alc-sub-btn[data-alc-sub]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        switchSub(btn.getAttribute("data-alc-sub"));
      });
    });
    doc.querySelectorAll("[data-alc-goto-sub]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        if (el.tagName === "A") e.preventDefault();
        var subId = el.getAttribute("data-alc-goto-sub");
        if (subId) switchSub(subId);
      });
    });
    var hash = resolveHash(g.location.hash, options);
    var init = valid.indexOf(hash) >= 0 ? hash : defaultTab || valid[0] || "intro";
    switchTab(init);
    if (options.subFromHash && options.subFromHash[hash]) {
      switchSub(options.subFromHash[hash]);
    }
  }

  g.AiLabCoachingShell = {
    switchTab: switchTab,
    switchSub: switchSub,
    gotoTab: gotoTab,
    bootTabs: bootTabs,
    collectValidTabs: collectValidTabs,
    showToast: showToast,
  };
})(typeof window !== "undefined" ? window : this, document);
