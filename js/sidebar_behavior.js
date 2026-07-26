// Unified sidebar behavior for iframe-based modules (Bible100 NAV contract).
(function () {
  const SITE_ROOT_PREFIXES = [
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
        return window.parent.document.getElementById("contentFrame");
      }
    } catch (err) {
      return null;
    }
    return null;
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
    const idx = path.indexOf("/bible100_new/");
    if (idx >= 0) {
      return path.slice(idx + "/bible100_new/".length) + resolved.search + resolved.hash;
    }
    const cmIdx = path.indexOf("/church_ministry/");
    if (cmIdx >= 0) {
      return path.slice(cmIdx + 1) + resolved.search + resolved.hash;
    }
    const cpIdx = path.indexOf("/church_planning/");
    if (cpIdx >= 0) {
      return path.slice(cpIdx + 1) + resolved.search + resolved.hash;
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
      return /\/index_v5\.html$/i.test(path) || /\/bible100_new\/index\.html$/i.test(path);
    } catch (err) {
      return false;
    }
  };

  const parentIsModuleShell = () => {
    try {
      const path = window.parent.location.pathname.replace(/\\/g, "/");
      // 總站根殼不是模組殼
      if (/\/index_v5\.html$/i.test(path) || /\/bible100_new\/index\.html$/i.test(path)) {
        return false;
      }
      // 例：/church_ministry/index.html（本機 HTTP 根＝bible100_new 時路徑不含 bible100_new）
      return /\/[^/]+\/index\.html$/i.test(path);
    } catch (err) {
      return false;
    }
  };

  /** NAV-CONTENT：只換右欄；成功才 true（失敗時讓 href 降級） */
  const navigateContentViaShell = (href) => {
    if (!href || isExternalLink(href)) return false;
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
          window.parent.postMessage(
            { type: "navigate", url: new URL(href, window.location.href).href },
            "*"
          );
          return true;
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
    const mode = link.getAttribute("data-b100-nav");
    if (mode) return mode;
    if (link.getAttribute("data-b100-shell-nav") === "content") return "content";
    if (link.getAttribute("data-b100-path")) return "content";
    return "";
  };

  const handleUnifiedNavClick = (link) => {
    const mode = getNavMode(link);
    if (mode === "module") return navigateModuleViaShell(link);
    if (mode === "content" || mode === "exit") {
      const href = link.getAttribute("data-b100-path") || link.getAttribute("href");
      if (mode === "exit" && link.getAttribute("target") === "_blank") return false;
      return navigateContentViaShell(href);
    }
    return false;
  };

  const fallbackContentViaBase = (link) => {
    const href = link.getAttribute("data-b100-path") || link.getAttribute("href");
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
      const href = link.getAttribute("href");
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
          if (ok) {
            e.preventDefault();
            e.stopPropagation();
            const markHref = pathAttr || href;
            try {
              markActiveLink(new URL(markHref, window.location.href).href);
            } catch (err) {
              markActiveLink(markHref);
            }
            return;
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
