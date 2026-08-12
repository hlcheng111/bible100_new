/**
 * AI Lab · 4 Tab 整合壳
 */
(function (g, doc) {
  "use strict";

  var TAB_SRC = {
    prompt: null,
    guide: "../pages/guide_reading_hub.html?crm_from=ai_wb",
    quiz: "../pages/ai_quiz_generator.html?crm_from=ai_wb",
    serve: "../pages/crm_automation_console.html?crm_from=ai_wb",
  };

  function $(id) {
    return doc.getElementById(id);
  }

  function switchTab(tab) {
    doc.querySelectorAll(".ai-shell-tab").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-tab") === tab);
    });
    var panel = $("ai-panel-prompt");
    var frame = $("ai-integrated-subframe");
    if (tab === "prompt") {
      if (panel) panel.hidden = false;
      if (frame) frame.hidden = true;
    } else {
      if (panel) panel.hidden = true;
      if (frame) {
        frame.hidden = false;
        var src = TAB_SRC[tab];
        if (src) frame.src = src + (src.indexOf("?") >= 0 ? "&" : "?") + "v=" + Date.now();
      }
    }
    try {
      var u = new URL(g.location.href);
      u.hash = "tab-" + tab;
      if (g.history.replaceState) g.history.replaceState(null, "", u.pathname + u.search + u.hash);
    } catch (eH) {
      g.location.hash = "tab-" + tab;
    }
  }

  function resolveTab() {
    var h = (g.location.hash || "").replace("#tab-", "");
    if (TAB_SRC[h] !== undefined || h === "prompt") return h || "prompt";
    return "prompt";
  }

  doc.querySelectorAll(".ai-shell-tab").forEach(function (btn) {
    btn.onclick = function () {
      switchTab(btn.getAttribute("data-tab"));
    };
  });

  g.AiWorkbenchShell = { switchTab: switchTab };

  switchTab(resolveTab());
})(window, document);
