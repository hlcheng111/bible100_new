/**
 * Hub 內嵌偵測：總站 index_v5 右欄時收斂重複導覽
 */
(function (global, doc) {
  "use strict";

  function inHubShell() {
    try {
      if (global.parent && global.parent !== global && global.parent.document) {
        var top = global.parent.document;
        if (top.getElementById("contentFrame") && top.getElementById("sidebarFrame")) return true;
      }
    } catch (e) {}
    return false;
  }

  function apply() {
    if (inHubShell()) doc.body.classList.add("b100-hub-embedded");
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", apply);
  else apply();

  global.CmHubDetect = { inHubShell: inHubShell, apply: apply };
})(window, document);
