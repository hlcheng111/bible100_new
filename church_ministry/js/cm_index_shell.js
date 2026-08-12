/**
 * church_ministry/index.html · Standalone 雙欄殼 relay + focus=c + locale
 * focus=a 日常主路 content：modules/worship/worship-sunday-desk.html（A 敬拜 · 主日一桌）
 */
(function (w, doc) {
  "use strict";

  var P = w.CmShellPaths;

  function bust(url) {
    return P && P.bust ? P.bust(url) : url;
  }

  function resolve(url) {
    return P && P.resolveShellUrl ? P.resolveShellUrl(url) : url;
  }

  function withLocale(url) {
    if (!url) return url;
    if (w.B100ChromeI18n && w.B100ChromeI18n.appendLocale) {
      return w.B100ChromeI18n.appendLocale(url);
    }
    return url;
  }

  function absIframeSrc(url) {
    if (!url) return url;
    var r = resolve(url);
    r = withLocale(r);
    if (/^https?:\/\//i.test(r) || String(r).indexOf("file:") === 0) return r;
    try {
      return new URL(r, w.location.href).href;
    } catch (eA) {
      return r;
    }
  }

  function currentFramePaths() {
    function pathOf(iframe) {
      if (!iframe) return "";
      try {
        var href =
          iframe.contentWindow &&
          iframe.contentWindow.location &&
          iframe.contentWindow.location.href;
        if (href && href.indexOf("about:") < 0) {
          var u = new URL(href);
          var marker = "/church_ministry/";
          var idx = u.pathname.indexOf(marker);
          if (idx >= 0) {
            return (
              u.pathname.slice(idx + marker.length) +
              (u.search || "") +
              (u.hash || "")
            );
          }
          return u.pathname.replace(/^\//, "") + (u.search || "") + (u.hash || "");
        }
      } catch (e) {}
      try {
        return (iframe.getAttribute("src") || "").replace(/^\.\//, "");
      } catch (e2) {
        return "";
      }
    }
    return {
      sb: pathOf(doc.getElementById("sidebarFrame")),
      cf: pathOf(doc.getElementById("contentFrame")),
    };
  }

  function applyShell(sidebarUrl, contentUrl) {
    var Nav = w.CmZoneNavSsot;
    if (contentUrl && Nav && Nav.isSidebarLayoutUrl && Nav.isSidebarLayoutUrl(contentUrl)) {
      var pair = Nav.recoverFromSidebarInContent(contentUrl);
      if (pair) {
        sidebarUrl = pair.sidebarUrl;
        contentUrl = pair.contentUrl;
        if (w.CmShellPaths && w.CmShellPaths.isCmIndexShell && w.CmShellPaths.isCmIndexShell(w)) {
          var focus = Nav.parseFocusFromUrl(pair.sidebarUrl);
          var z = focus ? Nav.zoneById(focus) : Nav.zoneById("gateway");
          if (z) {
            sidebarUrl = Nav.cmRelativeSidebar(z);
            contentUrl = Nav.cmRelativeLanding(z);
          } else {
            sidebarUrl = "sidebar_church_layout_v1.html";
            contentUrl = "_landing/gateway.html";
          }
        }
      }
    } else if (contentUrl && Nav && Nav.sanitizeContentUrl) {
      contentUrl = Nav.sanitizeContentUrl(contentUrl, "_landing/gateway.html");
    }
    var sb = doc.getElementById("sidebarFrame");
    var cf = doc.getElementById("contentFrame");
    if (sb && sidebarUrl) sb.src = bust(absIframeSrc(sidebarUrl));
    if (cf && contentUrl) cf.src = bust(absIframeSrc(contentUrl));
  }

  function stripLocale(url) {
    if (!url) return url;
    return url
      .replace(/([?&])locale=[^&#]*/g, "$1")
      .replace(/\?&/, "?")
      .replace(/[?&]$/, "")
      .replace(/\?#/, "#");
  }

  function reloadFramesForLocale() {
    var cur = currentFramePaths();
    var sb = stripLocale(cur.sb) || "sidebar_church_layout_v1.html";
    var cf = stripLocale(cur.cf) || "_landing/gateway.html";
    applyShell(sb, cf);
    if (w.B100ChromeI18n) w.B100ChromeI18n.broadcast(w.B100ChromeI18n.getLocale());
  }

  function applyFocusFromQuery() {
    var focus = "";
    var contentQ = "";
    try {
      var sp = new URLSearchParams(w.location.search || "");
      focus = (sp.get("focus") || "").toLowerCase();
      contentQ = (sp.get("content") || "").replace(/^\/+/, "");
      if (sp.get("locale") && w.B100ChromeI18n) {
        w.B100ChromeI18n.setLocale(sp.get("locale"), { silent: true });
      }
    } catch (eF) {}
    if (contentQ && !/^https?:/i.test(contentQ) && contentQ.indexOf("..") < 0) {
      var sbKeep = focus
        ? "sidebar_church_layout_v1.html?focus=" + encodeURIComponent(focus)
        : "sidebar_church_layout_v1.html";
      applyShell(sbKeep, contentQ);
      return true;
    }
    var R = w.CmZoneLandingRegistry;
    if (focus && R && R.zoneById && R.cmRelativeUrls) {
      var zone = R.zoneById(focus);
      var urls = zone ? R.cmRelativeUrls(zone) : null;
      if (urls) {
        applyShell(urls.sidebarUrl, urls.contentUrl);
        return true;
      }
    }
    if (focus === "desks") {
      applyShell("sidebar_church_layout_v1.html", "desks/index.html");
      return true;
    }
    return false;
  }

  function bindTopbar() {
    var map = {
      "btn-focus-tools": { sb: "sidebar.html", cf: "dashboard.html" },
      "btn-focus-qa": {
        sb: "sidebar_church_layout_v1.html",
        cf: "docs/qa_tracker_0af.html",
      },
    };
    Object.keys(map).forEach(function (id) {
      var btn = doc.getElementById(id);
      if (!btn) return;
      btn.addEventListener("click", function (ev) {
        if (ev.preventDefault) ev.preventDefault();
        applyShell(map[id].sb, map[id].cf);
      });
    });
  }

  function bindRelay() {
    w.addEventListener("message", function (event) {
      var d = event.data;
      if (!d) return;
      if (d.type === "b100-locale" && d.locale) {
        if (w.B100ChromeI18n) {
          w.B100ChromeI18n.setLocale(d.locale, { silent: true });
          if (w.CmChromeI18nPack) w.B100ChromeI18n.apply(w.CmChromeI18nPack, doc.body);
        }
        return;
      }
      if (w.parent && w.parent !== w) {
        w.parent.postMessage(d, "*");
        return;
      }
      if (d.type === "navigate" && d.url) {
        var cf = doc.getElementById("contentFrame");
        if (!cf) return;
        var u = d.url;
        if (/^https?:\/\//i.test(u) || String(u).indexOf("file:") === 0) {
          cf.src = bust(withLocale(u));
        } else {
          cf.src = bust(absIframeSrc(u));
        }
        return;
      }
      if (d.type === "bible100-shell") {
        applyShell(d.sidebarUrl, d.contentUrl);
      }
    });
  }

  function bindHubMode() {
    if (w.B100HubDetect && w.B100HubDetect.isInSiteHub && w.B100HubDetect.isInSiteHub()) {
      doc.body.classList.add("b100-hub-embedded");
      var tb = doc.getElementById("cmTopWrap");
      if (tb) tb.style.display = "none";
    }
  }

  function init() {
    bindRelay();
    bindTopbar();
    bindHubMode();
    if (!applyFocusFromQuery()) {
      applyShell("sidebar_church_layout_v1.html", "_landing/gateway.html");
    }
  }

  w.CmIndexShell = {
    applyShell: applyShell,
    reloadFramesForLocale: reloadFramesForLocale,
  };

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
  else init();
})(window, document);
