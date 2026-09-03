/**
 * AI Lab · Hub 顶栏2 / 侧栏 SSOT（W0）
 */
(function (g) {
  "use strict";

  var BUILD = "20260806ai";

  g.AiZoneNavSsot = {
    BUILD: BUILD,
    workbenchIntegrated:
      "ai_tools/tools/ai_workbench_integrated.html?crm_from=hub_workbench#tab-prompt",
    homeLanding: "ai_tools/_landing/home.html",
    sidebar: "ai_tools/sidebar_lab.html",
    scenarioUrl: function (scenarioId) {
      return (
        "ai_tools/tools/ai_workbench_integrated.html?crm_from=scenario&scenario=" +
        encodeURIComponent(scenarioId) +
        "#tab-prompt"
      );
    },
  };
})(typeof window !== "undefined" ? window : this);
