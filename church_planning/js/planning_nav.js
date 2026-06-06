/**
 * 教會規劃 · 總站殼內導航
 * - index_v5 內：postMessage 根相對 church_planning/…
 * - 單開側欄 file://：同目錄相對 href，不加 church_planning/ 前綴
 */
(function (global) {
  "use strict";

  function shellUrl(relPath) {
    relPath = String(relPath || "").replace(/^\/+/, "");
    if (global.PlanningToolRegistry && typeof global.PlanningToolRegistry.rootUrl === "function") {
      return global.PlanningToolRegistry.rootUrl(relPath);
    }
    if (relPath.indexOf("church_planning/") === 0) return relPath;
    return "church_planning/" + relPath;
  }

  function inParentShell() {
    try {
      return global.parent && global.parent !== global;
    } catch (err) {
      return false;
    }
  }

  /** guides/ 子目錄單開 file:// 時，相對路徑需回到 church_planning/ 根 */
  function planningLocalHref(relPath) {
    relPath = String(relPath || "").replace(/^\/+/, "");
    try {
      var href = String(global.location.href || "");
      if (/\/guides\//i.test(href) || /\\guides\\/i.test(href)) {
        return "../" + relPath.replace(/^\.\.\//, "");
      }
    } catch (err) { /* ignore */ }
    return relPath;
  }

  function planningOpenContent(ev, relPath) {
    if (ev && typeof ev.preventDefault === "function") ev.preventDefault();
    if (inParentShell()) {
      global.parent.postMessage({ type: "navigate", url: shellUrl(relPath) }, "*");
      return false;
    }
    global.location.href = planningLocalHref(relPath);
    return false;
  }

  function planningOpenByToolId(ev, toolId) {
    if (ev && typeof ev.preventDefault === "function") ev.preventDefault();
    var reg = global.PlanningToolRegistry;
    var rel = reg && reg.pathById ? reg.pathById(toolId) : null;
    if (!rel) {
      return planningOpenContent(ev, "assessment-os-hub.html#missing-" + toolId);
    }
    return planningOpenContent(ev, rel);
  }

  /** 跨模組根相對路徑（如 knowledge/、church_ministry/） */
  function planningOpenRoot(ev, rootRelPath) {
    if (ev && typeof ev.preventDefault === "function") ev.preventDefault();
    rootRelPath = String(rootRelPath || "").replace(/^\/+/, "");
    if (inParentShell()) {
      global.parent.postMessage({ type: "navigate", url: rootRelPath }, "*");
      return false;
    }
    global.location.href = "../" + rootRelPath.replace(/^\.\.\//, "");
    return false;
  }

  global.planningOpenContent = planningOpenContent;
  global.planningOpenByToolId = planningOpenByToolId;
  global.planningOpenRoot = planningOpenRoot;
  global.planningRootUrl = shellUrl;
})(typeof window !== "undefined" ? window : this);
