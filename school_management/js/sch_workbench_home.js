/**
 * School · 工作台情境卡片
 */
(function (g, doc) {
  "use strict";

  function renderScenarios() {
    var host = doc.getElementById("sch-wb-scenarios");
    if (!host || !g.SchScenarioSsot) return;
    host.innerHTML = g.SchScenarioSsot.SCENARIOS.map(function (s) {
      return (
        '<button type="button" class="sch-wb-scenario" data-sch-scenario="' +
        s.id +
        '"><strong>' +
        s.emoji +
        " " +
        s.label +
        "</strong><small>" +
        s.hint +
        "</small></button>"
      );
    }).join("");

    host.querySelectorAll("[data-sch-scenario]").forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute("data-sch-scenario");
        var sc = g.SchScenarioSsot.byId(id);
        if (!sc || !g.SchWorkbenchShell) return;
        g.SchWorkbenchShell.switchTab(sc.tab);
      };
    });
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", renderScenarios);
  } else {
    renderScenarios();
  }
})(window, document);
