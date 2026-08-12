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

  /** 延伸版本（暫不寫入戰情室） */
  function planningOpenExtended(ev, extId) {
    if (ev && typeof ev.preventDefault === "function") ev.preventDefault();
    var reg = global.PlanningToolRegistry;
    var rel = reg && reg.extendedPathById ? reg.extendedPathById(extId) : null;
    if (!rel) {
      return planningOpenContent(ev, "assessment-os-hub.html#extended-missing-" + extId);
    }
    return planningOpenContent(ev, rel);
  }

  /** 跨模組根相對路徑（如 knowledge/）— 只換右欄；跨「規劃↔行政」請用 planningOpenAdmin */
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

  function appendQueryParam(url, key, value) {
    url = String(url || "");
    if (!key || value == null || value === "") return url;
    if (new RegExp("[?&]" + key + "=").test(url)) return url;
    var parts = { base: url, hash: "" };
    if (global.GDoAdminMenu && global.GDoAdminMenu.splitHash) {
      parts = global.GDoAdminMenu.splitHash(url);
    } else {
      var hi = url.indexOf("#");
      if (hi >= 0) {
        parts = { base: url.slice(0, hi), hash: url.slice(hi) };
      }
    }
    var base = parts.base;
    base += (base.indexOf("?") >= 0 ? "&" : "?") + encodeURIComponent(key) + "=" + encodeURIComponent(String(value));
    return base + parts.hash;
  }

  /**
   * 進入 DO 執行頁：只換右欄，保留 G 側欄（Plan + Do 同一條主路）。
   * contentRel 例：church_ministry/dashboard.html
   */
  function planningOpenDo(ev, contentRel, opts) {
    if (ev && typeof ev.preventDefault === "function") ev.preventDefault();
    opts = opts || {};
    var contentUrl = String(contentRel || "church_ministry/dashboard.html").replace(/^\/+/, "");
    var fromTag = opts.crmFrom != null ? opts.crmFrom : "planning_step6";
    if (fromTag) contentUrl = appendQueryParam(contentUrl, "crm_from", fromTag);
    if (typeof global.bible100ShellNav === "function") {
      return global.bible100ShellNav(ev, { contentUrl: contentUrl });
    }
    if (inParentShell()) {
      try {
        global.parent.postMessage({ type: "navigate", url: contentUrl }, "*");
        return false;
      } catch (ePm) { /* fall through */ }
    }
    return planningOpenRoot(ev, contentUrl);
  }

  /** @deprecated 別名：G 區已統一 sidebar_plan_v5_preview，不再換 DO 獨立側欄 */
  function planningOpenAdmin(ev, contentRel, opts) {
    return planningOpenDo(ev, contentRel, opts);
  }

  global.planningOpenContent = planningOpenContent;
  global.planningOpenByToolId = planningOpenByToolId;
  global.planningOpenExtended = planningOpenExtended;
  global.planningOpenRoot = planningOpenRoot;
  global.planningOpenDo = planningOpenDo;
  global.planningOpenAdmin = planningOpenAdmin;
  global.planningRootUrl = shellUrl;
})(typeof window !== "undefined" ? window : this);
