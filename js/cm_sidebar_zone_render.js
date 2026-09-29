/**
 * CM A–G · 区域侧栏渲染（Kit + 各区 SSOT + focus 模式）
 */
(function (global) {
  "use strict";

  var RENDER_BUILD = "20260811f";

  function shellNavPair(sidebarUrl, contentUrl) {
    if (typeof global.bible100ShellNav === "function") {
      return global.bible100ShellNav(null, {
        sidebarUrl: sidebarUrl,
        contentUrl: contentUrl,
      });
    }
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage(
          {
            type: "bible100-shell",
            sidebarUrl: sidebarUrl,
            contentUrl: contentUrl,
          },
          "*"
        );
        return true;
      }
    } catch (eP) {}
    return false;
  }

  function navFocusZone(focusId) {
    var Nav = global.CmZoneNavSsot;
    if (!Nav || !Nav.shellPairForFocus) return false;
    var pair = Nav.shellPairForFocus(focusId);
    if (!pair) return false;
    var sb = pair.sidebarUrl;
    var cf = pair.contentUrl;
    if (global.CmShellPaths && global.CmShellPaths.inCmStandaloneTree) {
      try {
        if (global.CmShellPaths.isCmIndexShell(global.parent || global)) {
          sb = Nav.cmRelativeSidebar(Nav.zoneById(focusId)) || sb;
          cf = Nav.cmRelativeLanding(Nav.zoneById(focusId)) || cf;
        }
      } catch (eCm) {}
    }
    return shellNavPair(sb, cf);
  }

  function navFullMap() {
    try {
      if (
        global.CmShellPaths &&
        global.CmShellPaths.isCmIndexShell &&
        global.CmShellPaths.isCmIndexShell(global.parent || global)
      ) {
        return shellNavPair(
          "sidebar_church_layout_v1.html",
          "_landing/gateway.html"
        );
      }
    } catch (eFm) {}
    return shellNavPair(
      "church_ministry/sidebar_church_layout_v1.html",
      "church_ministry/_landing/gateway.html"
    );
  }

  var ZONE_SSOTS = {
    a: function () {
      return global.CmAMenu && global.CmAMenu.ZONE;
    },
    b: function () {
      return global.CmBMenu && global.CmBMenu.ZONE;
    },
    c: function () {
      return global.CmCMenu && global.CmCMenu.ZONE;
    },
    d: function () {
      return global.CmDMenu && global.CmDMenu.ZONE;
    },
    e: function () {
      return global.CmEMenu && global.CmEMenu.ZONE;
    },
    f: function () {
      return global.CmFMenu && global.CmFMenu.ZONE;
    }
  };

  var ZONE_HOSTS = [
    { hostId: "sb-zone-a", zoneId: "a", globalKey: "CmAMenu" },
    { hostId: "sb-zone-b", zoneId: "b", globalKey: "CmBMenu" },
    { hostId: "sb-zone-c", zoneId: "c", globalKey: "CmCMenu" },
    { hostId: "sb-zone-d", zoneId: "d", globalKey: "CmDMenu" },
    { hostId: "sb-zone-e", zoneId: "e", globalKey: "CmEMenu" },
    { hostId: "sb-zone-f", zoneId: "f", globalKey: "CmFMenu" }
  ];

  function getFocusZone() {
    var focus = "";
    try {
      focus = (new URLSearchParams(global.location.search).get("focus") || "").toLowerCase();
    } catch (e) {}
    if (focus === "admin") focus = "g";
    if (focus && !ZONE_SSOTS[focus]) return "";
    return focus;
  }

  function focusHref(zoneId) {
    return "?focus=" + encodeURIComponent(zoneId);
  }

  function renderZoneHost(hostId, zoneId, opts) {
    opts = opts || {};
    var host = typeof hostId === "string" ? global.document.getElementById(hostId) : hostId;
    if (!host) return false;
    var R = global.B100SidebarRender;
    var loader = ZONE_SSOTS[zoneId];
    if (!R || !loader) {
      host.innerHTML = '<p class="sb-kit-en">侧栏载入中…</p>';
      return false;
    }
    var zone = loader();
    if (!zone) {
      host.innerHTML = '<p class="sb-kit-en">SSOT 未就绪</p>';
      return false;
    }
    host.classList.remove("sb-kit-zone-host--active");
    if (opts.collapsed) {
      host.innerHTML = R.renderZoneRail(zone, { focusHref: focusHref(zoneId) });
    } else {
      host.innerHTML = R.renderZone(zone, { activeFocus: !!opts.activeFocus });
      if (opts.activeFocus) host.classList.add("sb-kit-zone-host--active");
    }
    host.setAttribute("data-sb-zone-build", RENDER_BUILD);
    if (global.B100ChromeI18n && global.B100ChromeI18n.apply) {
      try {
        global.B100ChromeI18n.apply(host);
      } catch (eI) { /* ignore */ }
    }
    return true;
  }

  function renderFocusFooter(focus) {
    var el = global.document.getElementById("sb-focus-footer");
    if (!el) return;
    if (!focus) {
      el.innerHTML = "";
      el.hidden = true;
      return;
    }
    el.hidden = false;
    el.innerHTML =
      '<a class="sb-kit-focus-expand" href="sidebar_church_layout_v1.html" target="_self" data-cm-focus-expand="1" ' +
      'title="Show all A-G zones">📋 展開 A–G 全地圖<small class="sb-kit-en"> · All zones</small></a>';
  }

  function focusBannerBody(focus) {
    var bodies = {
      a: "只顯示本區 · 右欄 landing · 下方可展開 A–G",
      b: "只顯示本區 · 右欄小組工作桌 · 下方可展開 A–G",
      c: "只顯示本區 · 右欄主日學 5 Tab · 下方可展開 A–G",
      d: "只顯示本區 · 右欄 landing · 下方可展開 A–G",
      e: "只顯示本區 · 右欄 landing · 下方可展開 A–G",
      f: "只顯示本區 · 右欄詩歌模組 · 下方可展開 A–G",
      g: "只顯示本區 · 右欄規劃行政 · 下方可展開 A–G",
    };
    return bodies[focus] || "只顯示本區 · 下方可展開 A–G 全地圖";
  }

  function applyFocusChrome(focus, useFocus) {
    var hint = global.document.getElementById("layout-m2-hint");
    if (hint) {
      hint.hidden = true;
      hint.setAttribute("aria-hidden", "true");
    }
    try {
      if (useFocus && focus) {
        global.document.body.setAttribute("data-cm-focus", focus);
      } else {
        global.document.body.removeAttribute("data-cm-focus");
      }
    } catch (eAttr) {}
    var homeSec = global.document.querySelector('.sidebar-section[data-sb-group="留"]');
    if (homeSec) homeSec.style.display = useFocus ? "none" : "";
  }

  function bootCmLayoutZones() {
    var focus = getFocusZone();
    var useFocus = !!focus;
    applyFocusChrome(focus, useFocus);
    ZONE_HOSTS.forEach(function (row) {
      var host = global.document.getElementById(row.hostId);
      if (!host) return;
      if (useFocus && row.zoneId !== focus) {
        host.innerHTML = "";
        host.style.display = "none";
        host.classList.remove("sb-kit-zone-host--active");
        host.setAttribute("data-sb-zone-collapsed", "1");
        return;
      }
      host.style.display = "";
      renderZoneHost(row.hostId, row.zoneId, {
        collapsed: false,
        activeFocus: useFocus && row.zoneId === focus,
      });
    });
    var gSec = global.document.querySelector('.sidebar-section[data-focus-zone="g"]');
    if (gSec) gSec.style.display = useFocus && focus !== "g" ? "none" : "";
    var banner = global.document.getElementById("sb-focus-banner");
    if (banner) {
      banner.hidden = true;
      banner.innerHTML = "";
      banner.setAttribute("aria-hidden", "true");
    }
    renderFocusFooter(focus);
  }

  function bindFocusNav() {
    global.document.addEventListener(
      "click",
      function (ev) {
        var expand = ev.target.closest("[data-cm-focus-expand]");
        if (expand) {
          ev.preventDefault();
          ev.stopPropagation();
          navFullMap();
          return;
        }
        var sw = ev.target.closest("[data-cm-focus-switch]");
        if (!sw) return;
        ev.preventDefault();
        ev.stopPropagation();
        navFocusZone(sw.getAttribute("data-cm-focus-switch"));
      },
      true
    );
  }

  function boot() {
    if (!global.B100SidebarRender) {
      global.setTimeout(boot, 40);
      return;
    }
    for (var i = 0; i < ZONE_HOSTS.length; i++) {
      var row = ZONE_HOSTS[i];
      if (global.document.getElementById(row.hostId) && !global[row.globalKey]) {
        global.setTimeout(boot, 40);
        return;
      }
    }
    bootCmLayoutZones();
    bindFocusNav();
  }

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  global.CmSidebarZoneRender = {
    RENDER_BUILD: RENDER_BUILD,
    getFocusZone: getFocusZone,
    renderZoneHost: renderZoneHost,
    bootCmLayoutZones: bootCmLayoutZones,
    ZONE_SSOTS: ZONE_SSOTS,
    ZONE_HOSTS: ZONE_HOSTS
  };
})(typeof window !== "undefined" ? window : this);
