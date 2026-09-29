/**
 * B100 · 壳内统一导航（侧栏 + 右栏 + 顶栏 mode 同步）
 */
(function (g) {
  "use strict";

  function shellRouteNav(opts, e) {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    if (e && typeof e.stopPropagation === "function") e.stopPropagation();
    opts = opts || {};

    if (typeof g.B100_resolveNav === "function") {
      opts = g.B100_resolveNav(opts);
    }

    if (opts.action === "siteHome") {
      try {
        if (g.parent && g.parent !== g && typeof g.parent.loadSiteHome === "function") {
          g.parent.loadSiteHome();
          return true;
        }
      } catch (errHome) {}
    }

    try {
      if (g.parent && g.parent !== g && typeof g.parent.navigateShell === "function") {
        g.parent.navigateShell(opts);
        return true;
      }
    } catch (errNav) {}

    if (opts.mode) {
      try {
        if (g.parent && g.parent !== g && typeof g.parent.applyMode === "function") {
          g.parent.applyMode(opts.mode);
          return true;
        }
      } catch (errMode) {}
    }

    if (opts.sidebarUrl != null || opts.contentUrl) {
      if (typeof g.bible100ShellNav === "function") {
        return g.bible100ShellNav(e, {
          sidebarUrl: opts.sidebarUrl || "about:blank",
          contentUrl: opts.contentUrl || "about:blank"
        });
      }
    }
    return false;
  }

  g.b100ShellRouteNav = shellRouteNav;
})(typeof window !== "undefined" ? window : this);
