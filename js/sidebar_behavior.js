// Unified sidebar behavior for iframe-based modules.
(function () {
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
      const href = link.getAttribute("href");
      if (isExternalLink(href)) return;
      if (!link.getAttribute("target")) {
        link.setAttribute("target", "contentFrame");
      }
    });
  };

  // --- Sidebar <details> state memory (localStorage) ---
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
    if (!contentFrame) return;

    const updateActive = () => {
      const src = contentFrame.getAttribute("src") || "";
      markActiveLink(src);
    };

    // Initial highlight
    updateActive();

    // Update on click + notify parent to show loading (for contentFrame)
    document.addEventListener("click", (e) => {
      const link = e.target.closest("a[href]");
      if (!link) return;
      const href = link.getAttribute("href");
      const pathAttr = link.getAttribute("data-b100-path");
      if (isExternalLink(href) && !pathAttr) return;
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
    });

    // Poll for iframe changes
    let lastSrc = contentFrame.getAttribute("src") || "";
    setInterval(() => {
      const current = contentFrame.getAttribute("src") || "";
      if (current !== lastSrc) {
        lastSrc = current;
        markActiveLink(current);
      }
    }, 1000);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
