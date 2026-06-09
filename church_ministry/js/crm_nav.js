/**
 * CRM 側欄 · 總站殼內導航 SSOT（對齊 planning_nav.js）
 *
 * 模式：
 *   crm-content   — 只換 contentFrame，側欄保持 CRM
 *   planning      — 換規劃側欄 + 規劃內容頁
 *   ae-layout     — 換 A–E layout 側欄 + 事工內容頁
 *   shell         — 任意根相對 sidebar + content
 */
(function (global) {
  "use strict";

  function inParentShell() {
    try {
      return global.parent && global.parent !== global;
    } catch (err) {
      return false;
    }
  }

  function bust(url) {
    if (!url) return url;
    return url + (url.indexOf("?") >= 0 ? "&" : "?") + "v=" + Date.now();
  }

  function toRootUrl(rel) {
    rel = String(rel || "").replace(/^\/+/, "");
    if (!rel) return rel;
    if (
      rel.indexOf("church_ministry/") === 0 ||
      rel.indexOf("church_planning/") === 0 ||
      rel.indexOf("help/") === 0 ||
      rel.indexOf("ai_tools/") === 0 ||
      rel.indexOf("tools/") === 0 ||
      rel.indexOf("nav_hub/") === 0
    ) {
      return rel;
    }
    if (rel.indexOf("../") === 0) {
      return rel.replace(/^\.\.\//, "");
    }
    return "church_ministry/" + rel;
  }

  function parentFrames() {
    try {
      var p = global.parent;
      if (!p || p === global || !p.document) return null;
      var sb = p.document.getElementById("sidebarFrame");
      var cf = p.document.getElementById("contentFrame");
      if (sb && cf) return { parent: p, sidebar: sb, content: cf };
    } catch (err) {}
    return null;
  }

  function setContentUrl(url) {
    var fr = parentFrames();
    if (fr) {
      fr.content.src = bust(url);
      return true;
    }
    if (inParentShell()) {
      global.parent.postMessage({ type: "navigate", url: url }, "*");
      return true;
    }
    return false;
  }

  function setShellPair(sidebarUrl, contentUrl) {
    var fr = parentFrames();
    if (fr) {
      if (sidebarUrl) fr.sidebar.src = bust(sidebarUrl);
      if (contentUrl) fr.content.src = bust(contentUrl);
      return true;
    }
    if (inParentShell()) {
      global.parent.postMessage(
        {
          type: "bible100-shell",
          sidebarUrl: sidebarUrl || "",
          contentUrl: contentUrl || ""
        },
        "*"
      );
      return true;
    }
    return false;
  }

  function crmOpenContent(ev, relPath) {
    if (ev && typeof ev.preventDefault === "function") ev.preventDefault();
    var url = toRootUrl(relPath);
    if (setContentUrl(url)) return false;
    global.location.href = relPath.replace(/^church_ministry\//, "");
    return false;
  }

  function crmShellGo(ev, sidebarUrl, contentUrl) {
    if (ev && typeof ev.preventDefault === "function") ev.preventDefault();
    sidebarUrl = sidebarUrl || "";
    contentUrl = contentUrl || "";
    if (setShellPair(sidebarUrl, contentUrl)) return false;
    if (typeof global.bible100ShellNav === "function") {
      return global.bible100ShellNav(ev, { sidebarUrl: sidebarUrl, contentUrl: contentUrl });
    }
    if (contentUrl) global.location.href = contentUrl;
    return false;
  }

  function crmOpenPlanning(ev, relPath) {
    if (ev && typeof ev.preventDefault === "function") ev.preventDefault();
    relPath = String(relPath || "index_plan.html").replace(/^\/+/, "");
    if (relPath.indexOf("church_planning/") === 0) {
      relPath = relPath.slice("church_planning/".length);
    }
    return crmShellGo(
      ev,
      "church_planning/sidebar_plan.html",
      "church_planning/" + relPath
    );
  }

  function crmOpenHelp(ev, contentPath, sidebarPath) {
    return crmShellGo(
      ev,
      sidebarPath || "tools/tools-overview-sidebar.html",
      toRootUrl(contentPath)
    );
  }

  function crmOpenAeLayout(ev, focus, contentPath) {
    var sb =
      focus === "a"
        ? "church_ministry/sidebar_worship_journey.html"
        : "church_ministry/sidebar_church_layout_v1.html" +
          (focus ? "?focus=" + encodeURIComponent(focus) : "");
    return crmShellGo(ev, sb, toRootUrl(contentPath));
  }

  /** 統一入口：{ mode, path, sidebar, focus } */
  function crmNavigate(ev, spec) {
    spec = spec || {};
    if (ev && typeof ev.preventDefault === "function") ev.preventDefault();
    var mode = spec.mode || "crm-content";
    if (mode === "planning") {
      return crmOpenPlanning(ev, spec.path || "index_plan.html");
    }
    if (mode === "ae-layout") {
      return crmOpenAeLayout(ev, spec.focus || "", spec.path || "");
    }
    if (mode === "shell") {
      return crmShellGo(ev, spec.sidebar || "", toRootUrl(spec.path || ""));
    }
    return crmOpenContent(ev, spec.path || "");
  }

  global.crmOpenContent = crmOpenContent;
  global.crmShellGo = crmShellGo;
  global.crmOpenPlanning = crmOpenPlanning;
  global.crmOpenHelp = crmOpenHelp;
  global.crmOpenAeLayout = crmOpenAeLayout;
  global.crmNavigate = crmNavigate;
  global.crmToRootUrl = toRootUrl;
})(typeof window !== "undefined" ? window : this);
