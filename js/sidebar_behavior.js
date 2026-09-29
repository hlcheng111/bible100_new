// Unified sidebar behavior for iframe-based modules (Bible100 NAV contract).
(function () {
  const SITE_ROOT_PREFIXES = [
    "bible_app/",
    "church_planning/",
    "church_ministry/",
    "bible_study/",
    "school_management/",
    "ai_tools/",
    "hymn_management/",
    "help/",
    "knowledge/",
    "nav_hub/",
    "languages/",
    "smart_ministry/",
    "qna/",
    "disciple_dynamics/",
    "config/",
    "js/",
    "css/",
  ];

  const stripDotSlash = (href) => String(href || "").replace(/^\.?\//, "");

  /** 已是相對總站根的路徑（如 church_planning/foo.html），不可再對側欄 URL 做 new URL 解析 */
  const isSiteRootRelativePath = (href) => {
    const h = stripDotSlash(href).split(/[?#]/)[0];
    return SITE_ROOT_PREFIXES.some((p) => h.indexOf(p) === 0);
  };

  const isExternalLink = (href) => {
    if (!href) return true;
    const lower = href.toLowerCase();
    return (
      lower.startsWith("http://") ||
      lower.startsWith("https://") ||
      lower.startsWith("mailto:") ||
      lower.startsWith("tel:") ||
      lower.startsWith("javascript:") ||
      lower.startsWith("#")
    );
  };

  const isInShell = () => {
    try {
      if (!window.parent || window.parent === window) return false;
      try {
        if (window.parent.document && window.parent.document.getElementById("contentFrame")) {
          return true;
        }
      } catch (eDoc) {}
      return true;
    } catch (err) {
      return false;
    }
  };

  const getParentContentFrame = () => {
    try {
      if (window.parent && window.parent !== window) {
        try {
          const el = window.parent.document.getElementById("contentFrame");
          if (el) return el;
        } catch (eDoc) {}
        try {
          const fr = window.parent.frames && window.parent.frames["contentFrame"];
          if (fr && fr.frameElement) return fr.frameElement;
        } catch (eFr) {}
      }
    } catch (err) {
      return null;
    }
    return null;
  };

  const resolveNavHref = (link) => {
    if (!link) return "";
    return (
      link.getAttribute("data-b100-site-path") ||
      link.getAttribute("data-b100-path") ||
      link.getAttribute("href") ||
      ""
    );
  };

  const resolveUrl = (href, base) => {
    try {
      return new URL(href, base);
    } catch (err) {
      return null;
    }
  };

  const normalizePath = (urlObj) => {
    if (!urlObj) return "";
    return urlObj.pathname.replace(/\/+/g, "/");
  };

  const hrefToSiteRootRelative = (href) => {
    if (!href || isExternalLink(href)) return null;
    const cleaned = stripDotSlash(href);
    if (isSiteRootRelativePath(cleaned)) {
      return cleaned;
    }
    const resolved = resolveUrl(href, window.location.href);
    if (!resolved) return null;
    const path = normalizePath(resolved);
    // 站根：依頂層模組目錄推算（不依賴 bible100_new / _2 資料夾名）
    const markers = [
      "/bible_study/", "/bible_app/", "/church_ministry/", "/church_planning/",
      "/ai_tools/", "/school_management/", "/smart_ministry/", "/qna/",
      "/hymn_management/", "/languages/", "/disciple_dynamics/", "/nav_hub/",
      "/help/", "/data/", "/config/", "/css/", "/js/"
    ];
    const lower = path.toLowerCase();
    let best = -1;
    for (let i = 0; i < markers.length; i++) {
      const at = lower.indexOf(markers[i]);
      if (at >= 0 && (best < 0 || at < best)) best = at;
    }
    if (best >= 0) {
      return path.slice(best + 1) + resolved.search + resolved.hash;
    }
    let idx = path.search(/\/bible100[^\/]*\//i);
    if (idx >= 0) {
      const end = path.indexOf("/", idx + 1);
      if (end > idx) {
        return path.slice(end + 1) + resolved.search + resolved.hash;
      }
    }
    const cmIdx = path.indexOf("/church_ministry/");
    if (cmIdx >= 0) {
      return path.slice(cmIdx + 1) + resolved.search + resolved.hash;
    }
    const cpIdx = path.indexOf("/church_planning/");
    if (cpIdx >= 0) {
      return path.slice(cpIdx + 1) + resolved.search + resolved.hash;
    }
    const bsIdx = path.indexOf("/bible_study/");
    if (bsIdx >= 0) {
      return path.slice(bsIdx + 1) + resolved.search + resolved.hash;
    }
    const smIdx = path.indexOf("/school_management/");
    if (smIdx >= 0) {
      return path.slice(smIdx + 1) + resolved.search + resolved.hash;
    }
    const aiIdx = path.indexOf("/ai_tools/");
    if (aiIdx >= 0) {
      return path.slice(aiIdx + 1) + resolved.search + resolved.hash;
    }
    return null;
  };

  const toShellContentUrl = (href) => {
    const fromRoot = hrefToSiteRootRelative(href);
    if (fromRoot) return fromRoot;
    const resolved = resolveUrl(href, window.location.href);
    if (!resolved) return null;
    const path = normalizePath(resolved);
    const idx = path.indexOf("/church_ministry/");
    if (idx >= 0) {
      return path.slice(idx + 1) + resolved.search + resolved.hash;
    }
    const cpIdx = path.indexOf("/church_planning/");
    if (cpIdx >= 0) {
      return path.slice(cpIdx + 1) + resolved.search + resolved.hash;
    }
    const bsIdx = path.indexOf("/bible_study/");
    if (bsIdx >= 0) {
      return path.slice(bsIdx + 1) + resolved.search + resolved.hash;
    }
    const smIdx = path.indexOf("/school_management/");
    if (smIdx >= 0) {
      return path.slice(smIdx + 1) + resolved.search + resolved.hash;
    }
    const aiIdx = path.indexOf("/ai_tools/");
    if (aiIdx >= 0) {
      return path.slice(aiIdx + 1) + resolved.search + resolved.hash;
    }
    const basePath = normalizePath(resolveUrl(window.location.href));
    const baseIdx = basePath.indexOf("/church_ministry/");
    if (baseIdx >= 0 && href && !/^(https?:|mailto:|tel:|javascript:|#|\/)/i.test(href)) {
      const rel = resolved.pathname.replace(/\/+/g, "/");
      const tail = rel.slice(rel.indexOf("/church_ministry/") + "/church_ministry/".length);
      if (tail) return "church_ministry/" + tail + resolved.search + resolved.hash;
    }
    const baseCp = basePath.indexOf("/church_planning/");
    if (baseCp >= 0 && href && !/^(https?:|mailto:|tel:|javascript:|#|\/)/i.test(href) && !isSiteRootRelativePath(href)) {
      // 側欄內相對檔名（如 Church_Governance_pastoral_health.html）→ 補上模組前綴
      const file = stripDotSlash(href).replace(/^\.\.\//, "");
      if (file && file.indexOf("/") === -1) {
        return "church_planning/" + file;
      }
    }
    const baseBs = basePath.indexOf("/bible_study/");
    if (baseBs >= 0 && href && !/^(https?:|mailto:|tel:|javascript:|#|\/)/i.test(href) && !isSiteRootRelativePath(href)) {
      const file = stripDotSlash(href).replace(/^\.\.\//, "");
      if (file) {
        return file.indexOf("bible_study/") === 0 ? file : "bible_study/" + file;
      }
    }
    return null;
  };

  const bustUrl = (url) => {
    const hashIdx = url.indexOf("#");
    if (hashIdx >= 0) {
      const base = url.slice(0, hashIdx);
      const hash = url.slice(hashIdx);
      return base + (base.indexOf("?") >= 0 ? "&" : "?") + "v=" + Date.now() + hash;
    }
    return url + (url.indexOf("?") >= 0 ? "&" : "?") + "v=" + Date.now();
  };

  const parentIsSiteHub = () => {
    try {
      const path = window.parent.location.pathname.replace(/\\/g, "/");
      return /\/index_v5\.html$/i.test(path) || /\/bible100[^\/]*\/index\.html$/i.test(path);
    } catch (err) {
      return false;
    }
  };

  const parentIsModuleShell = () => {
    try {
      const path = window.parent.location.pathname.replace(/\\/g, "/");
      // 總站根殼不是模組殼
      if (/\/index_v5\.html$/i.test(path) || /\/bible100[^\/]*\/index\.html$/i.test(path)) {
        return false;
      }
      // 例：/church_ministry/index.html（本機 HTTP 根＝站根時路徑可不含包名）
      return /\/[^/]+\/index\.html$/i.test(path);
    } catch (err) {
      return false;
    }
  };

  const G_PLAN_SIDEBAR = "church_planning/sidebar_plan_v5_preview.html";

  const isCmSidebarLayoutUrl = (url) => {
    if (!url) return false;
    if (window.CmZoneNavSsot && window.CmZoneNavSsot.isSidebarLayoutUrl) {
      return window.CmZoneNavSsot.isSidebarLayoutUrl(url);
    }
    return /(^|[/?#])sidebar_church_layout_v1\.html/i.test(String(url).replace(/\\/g, "/"));
  };

  const navigateCmSidebarPair = (url) => {
    const Nav = window.CmZoneNavSsot;
    if (!Nav || !Nav.recoverFromSidebarInContent) return false;
    const pair = Nav.recoverFromSidebarInContent(url);
    if (!pair) return false;
    if (typeof window.bible100ShellNav === "function") {
      if (
        window.bible100ShellNav(null, {
          sidebarUrl: pair.sidebarUrl,
          contentUrl: pair.contentUrl,
        })
      ) {
        return true;
      }
    }
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          {
            type: "bible100-shell",
            sidebarUrl: pair.sidebarUrl,
            contentUrl: pair.contentUrl,
          },
          "*"
        );
        return true;
      }
    } catch (ePair) {}
    return false;
  };

  const navigateModuleSidebarPair = (url) => {
    const Nav = window.B100ModuleNavSsot;
    if (!Nav || !Nav.recoverSidebarInContent) return false;
    const pair = Nav.recoverSidebarInContent(url);
    if (!pair) return false;
    if (typeof window.bible100ShellNav === "function") {
      if (
        window.bible100ShellNav(null, {
          sidebarUrl: pair.sidebarUrl,
          contentUrl: pair.contentUrl,
        })
      ) {
        return true;
      }
    }
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          {
            type: "bible100-shell",
            sidebarUrl: pair.sidebarUrl,
            contentUrl: pair.contentUrl,
          },
          "*"
        );
        return true;
      }
    } catch (eModPair) {}
    return false;
  };

  /** NAV-CONTENT：只換右欄；church_planning/* 在總站殼內改為 G v3 雙欄 */
  const navigateContentViaShell = (href) => {
    if (!href || isExternalLink(href)) return false;
    try {
      const shellUrlEarly = toShellContentUrl(href);
      if (shellUrlEarly && isCmSidebarLayoutUrl(shellUrlEarly)) {
        if (navigateCmSidebarPair(shellUrlEarly)) return true;
      }
      if (
        shellUrlEarly &&
        window.B100ModuleNavSsot &&
        window.B100ModuleNavSsot.isForbiddenContentUrl(shellUrlEarly)
      ) {
        if (navigateModuleSidebarPair(shellUrlEarly)) return true;
      }
    } catch (eSbEarly) {}
    try {
      const shellUrl = toShellContentUrl(href);
      if (shellUrl && shellUrl.indexOf("church_planning/") === 0 && parentIsSiteHub()) {
        if (typeof window.bible100ShellNav === "function") {
          if (window.bible100ShellNav(null, { sidebarUrl: G_PLAN_SIDEBAR, contentUrl: shellUrl })) {
            return true;
          }
        }
        if (window.parent && window.parent !== window) {
          window.parent.postMessage(
            { type: "bible100-shell", sidebarUrl: G_PLAN_SIDEBAR, contentUrl: shellUrl },
            "*"
          );
          return true;
        }
      }
    } catch (eGPlan) { /* fall through */ }
    try {
      if (window.parent && window.parent !== window) {
        try {
          const cf = window.parent.document.getElementById("contentFrame");
          if (cf) {
            let targetSrc = "";
            if (parentIsSiteHub()) {
              // 總站右欄：用根相對 church_ministry/...（由 shell_nav 再解析）
              const shellUrl = toShellContentUrl(href);
              if (!shellUrl) return false;
              targetSrc = shellUrl;
            } else {
              // 模組 Standalone（含本機 HTTP 根＝repo）：一律用絕對 URL，
              // 避免 church_ministry/... 相對到 index.html 變成雙重路徑 404
              targetSrc = new URL(href, window.location.href).href;
            }
            cf.src = bustUrl(targetSrc);
            try {
              window.parent.postMessage({ type: "ai-tools-content-loading" }, "*");
            } catch (eLoad) {}
            return true;
          }
        } catch (eDirect) {}
        const shellUrl = toShellContentUrl(href);
        if (shellUrl) {
          window.parent.postMessage({ type: "navigate", url: shellUrl }, "*");
          try {
            window.parent.postMessage({ type: "ai-tools-content-loading" }, "*");
          } catch (e2) {}
          return true;
        }
        try {
          const shellUrl = toShellContentUrl(href);
          if (shellUrl) {
            window.parent.postMessage({ type: "navigate", url: shellUrl }, "*");
            try {
              window.parent.postMessage({ type: "ai-tools-content-loading" }, "*");
            } catch (e2) {}
            return true;
          }
          if (isSiteRootRelativePath(href)) {
            window.parent.postMessage({ type: "navigate", url: stripDotSlash(href) }, "*");
            try {
              window.parent.postMessage({ type: "ai-tools-content-loading" }, "*");
            } catch (e3) {}
            return true;
          }
        } catch (eNav) {}
      }
    } catch (err) {}
    if (typeof window.bible100OpenContent === "function") {
      const shellUrl = toShellContentUrl(href);
      if (shellUrl && window.bible100OpenContent(null, shellUrl)) return true;
    }
    return false;
  };

  /** NAV-MODULE：左+右雙欄 */
  const navigateModuleViaShell = (link) => {
    if (!link) return false;
    let sidebarUrl = link.getAttribute("data-b100-sidebar") || "";
    let contentUrl = link.getAttribute("data-b100-content") || "";
    const href = link.getAttribute("href");
    if (!contentUrl && href && !isExternalLink(href)) {
      contentUrl = hrefToSiteRootRelative(href) || "";
    }
    if (!sidebarUrl && !contentUrl) return false;
    if (typeof window.bible100ShellNav === "function") {
      if (window.bible100ShellNav(null, { sidebarUrl: sidebarUrl, contentUrl: contentUrl })) {
        return true;
      }
    }
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          { type: "bible100-shell", sidebarUrl: sidebarUrl, contentUrl: contentUrl },
          "*"
        );
        return true;
      }
    } catch (ePm) {}
    return false;
  };

  const getNavMode = (link) => {
    if (link.hasAttribute("data-b100-msb-nav") || link.hasAttribute("data-b100-route-nav")) {
      return "";
    }
    const mode = link.getAttribute("data-b100-nav");
    if (mode === "content" || mode === "module" || mode === "exit") return mode;
    if (link.getAttribute("data-b100-shell-nav") === "content") return "content";
    if (link.getAttribute("data-b100-path")) return "content";
    return "";
  };

  const navigateContentViaFrames = (href) => {
    if (!href || isExternalLink(href)) return false;
    try {
      if (!window.parent || window.parent === window) return false;
      const fr = window.parent.frames && window.parent.frames["contentFrame"];
      if (!fr) return false;
      let targetSrc = "";
      if (parentIsSiteHub()) {
        const shellUrl = toShellContentUrl(href) || (isSiteRootRelativePath(href) ? stripDotSlash(href) : "");
        if (!shellUrl) return false;
        targetSrc = shellUrl;
      } else {
        targetSrc = new URL(href, window.location.href).href;
      }
      fr.location.href = bustUrl(targetSrc);
      try {
        window.parent.postMessage({ type: "ai-tools-content-loading" }, "*");
      } catch (eLoad) {}
      return true;
    } catch (eFrNav) {
      return false;
    }
  };

  const handleUnifiedNavClick = (link) => {
    const mode = getNavMode(link);
    if (mode === "module") return navigateModuleViaShell(link);
    if (mode === "content" || mode === "exit") {
      const href = resolveNavHref(link);
      if (mode === "exit" && link.getAttribute("target") === "_blank") return false;
      return navigateContentViaShell(href);
    }
    return false;
  };

  const fallbackContentViaBase = (link) => {
    const href = resolveNavHref(link);
    if (!href || isExternalLink(href)) return false;
    if (!isInShell()) return false;
    const cf = getParentContentFrame();
    if (cf) {
      try {
        if (parentIsSiteHub() && isSiteRootRelativePath(href)) {
          cf.src = bustUrl(stripDotSlash(href));
          return true;
        }
        if (parentIsSiteHub()) {
          const shellUrl = toShellContentUrl(href);
          if (shellUrl) {
            cf.src = bustUrl(shellUrl);
            return true;
          }
          if (isSiteRootRelativePath(href)) {
            cf.src = bustUrl(stripDotSlash(href));
            return true;
          }
          return false;
        }
        cf.src = bustUrl(new URL(href, window.location.href).href);
        return true;
      } catch (eFb) {}
    }
    return false;
  };

  const markActiveLink = (contentSrc) => {
    const links = Array.from(document.querySelectorAll("a[href]"));
    const baseForContent = window.parent ? window.parent.location.href : window.location.href;
    const contentUrl = resolveUrl(contentSrc, baseForContent);
    const contentPath = normalizePath(contentUrl);

    links.forEach((link) => {
      link.classList.remove("is-active");
    });
    document.querySelectorAll("summary.is-active").forEach((s) => s.classList.remove("is-active"));

    if (!contentPath) return;
    let matched = null;
    links.forEach((link) => {
      const raw = link.getAttribute("data-b100-path") || link.getAttribute("href");
      const linkUrl = resolveUrl(raw, window.location.href);
      const linkPath = normalizePath(linkUrl);
      if (linkPath && contentPath.endsWith(linkPath)) {
        matched = link;
      }
    });

    if (matched) {
      matched.classList.add("is-active");
      const detail = matched.closest("details");
      if (detail) {
        detail.open = true;
        const summary = detail.querySelector("summary");
        if (summary) summary.classList.add("is-active");
      }
    }
  };

  const applyTargets = () => {
    const contentFrame = getParentContentFrame();
    if (!contentFrame) return;
    const links = Array.from(document.querySelectorAll("a[href]"));
    links.forEach((link) => {
      if (link.getAttribute("data-b100-path")) return;
      if (link.getAttribute("data-b100-nav")) return;
      if (link.getAttribute("data-b100-shell-nav")) return;
      if (link.hasAttribute("data-cm-focus-switch")) return;
      if (link.hasAttribute("data-cm-focus-expand")) return;
      if (link.closest(".sb-kit-zone--rail")) return;
      const href = link.getAttribute("href");
      if (href && /^\?focus=/i.test(href)) return;
      if (isExternalLink(href)) return;
      if (link.getAttribute("onclick")) return;
      link.setAttribute("target", "contentFrame");
    });
  };

  const STORAGE_KEY_PREFIX = "sidebar_detail_";

  const restoreDetailsState = () => {
    document.querySelectorAll("details[id]").forEach((el) => {
      const saved = localStorage.getItem(STORAGE_KEY_PREFIX + el.id);
      if (saved === "closed") el.open = false;
      else if (saved === "open") el.open = true;
    });
  };

  const listenDetailsToggle = () => {
    document.querySelectorAll("details[id]").forEach((el) => {
      el.addEventListener("toggle", () => {
        localStorage.setItem(STORAGE_KEY_PREFIX + el.id, el.open ? "open" : "closed");
      });
    });
  };

  const init = () => {
    applyTargets();
    restoreDetailsState();
    listenDetailsToggle();

    const contentFrame = getParentContentFrame();

    document.addEventListener(
      "click",
      (e) => {
        const link = e.target.closest("a[href]");
        if (!link) return;
        const href = link.getAttribute("href");
        const pathAttr = link.getAttribute("data-b100-path");
        const navMode = getNavMode(link);

        if (navMode) {
          let ok = handleUnifiedNavClick(link);
          if (!ok) ok = fallbackContentViaBase(link);
          if (!ok) ok = navigateContentViaFrames(resolveNavHref(link));
          if (ok) {
            e.preventDefault();
            e.stopPropagation();
            const markHref = pathAttr || resolveNavHref(link) || href;
            try {
              markActiveLink(new URL(markHref, window.location.href).href);
            } catch (err) {
              markActiveLink(markHref);
            }
            return;
          }
          if (!isExternalLink(href) && !link.getAttribute("target")) {
            link.setAttribute("target", "contentFrame");
          }
          return;
        }

        if (isExternalLink(href) && !pathAttr) return;
        if (link.getAttribute("onclick")) return;

        if (window.parent && window.parent !== window) {
          const navHref = pathAttr || href;
          if (navigateContentViaShell(navHref)) {
            e.preventDefault();
            e.stopPropagation();
            if (pathAttr) {
              try {
                markActiveLink(new URL(pathAttr, window.location.href).href);
              } catch (err) {
                markActiveLink(pathAttr);
              }
            } else {
              markActiveLink(href);
            }
            return;
          }
        }

        if (!contentFrame) return;
        if (pathAttr) {
          try {
            markActiveLink(new URL(pathAttr, window.location.href).href);
          } catch (err) {
            markActiveLink(pathAttr);
          }
        } else {
          markActiveLink(href);
        }
        try {
          if (window.parent && (link.getAttribute("target") === "contentFrame" || pathAttr)) {
            window.parent.postMessage({ type: "ai-tools-content-loading" }, "*");
          }
        } catch (err) {}
      },
      true
    );

    if (!contentFrame) return;

    const updateActive = () => {
      const src = contentFrame.getAttribute("src") || "";
      markActiveLink(src);
    };

    updateActive();

    let lastSrc = contentFrame.getAttribute("src") || "";
    setInterval(() => {
      const current = contentFrame.getAttribute("src") || "";
      if (current !== lastSrc) {
        lastSrc = current;
        markActiveLink(current);
      }
    }, 1000);
  };

  window.B100SidebarNav = {
    navigateContent: navigateContentViaShell,
    navigateModule: navigateModuleViaShell,
    hrefToSiteRootRelative: hrefToSiteRootRelative,
    isInShell: isInShell
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
