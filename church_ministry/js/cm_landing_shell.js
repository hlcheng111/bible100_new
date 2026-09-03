/**
 * CM · 统一 Landing 顶壳（A–G 地址条 + 区标题 + 语言列）
 * 契约：docs/governance/B100_SHELL_UNIFIED_V1.md Step 5
 */
(function (global, doc) {
  "use strict";

  var SHELL_BUILD = "20260805f";

  function inHub() {
    try {
      if (global.B100HubEmbed && global.B100HubEmbed.inHubContentFrame) {
        return global.B100HubEmbed.inHubContentFrame();
      }
      return global.parent && global.parent !== global;
    } catch (e) {
      return false;
    }
  }

  function detectZoneId() {
    var body = doc.body;
    if (!body) return "";
    var ae = body.getAttribute("data-b100-ae-zone");
    if (ae) return String(ae).toLowerCase();
    try {
      var p = String(global.location.pathname || "").replace(/\\/g, "/").toLowerCase();
      if (p.indexOf("_landing/worship") >= 0) return "a";
      if (p.indexOf("_landing/fellowship") >= 0) return "b";
      if (p.indexOf("_landing/education") >= 0) return "c";
      if (p.indexOf("_landing/outreach") >= 0) return "d";
      if (p.indexOf("_landing/social") >= 0) return "e";
      if (p.indexOf("_landing/hymns") >= 0) return "f";
      if (p.indexOf("_landing/gateway") >= 0) return "gateway";
    } catch (e2) { /* ignore */ }
    return "";
  }

  function navClick(zone) {
    var R = global.CmZoneLandingRegistry;
    if (!R) return "";
    var urls = R.siteUrls(zone);
    if (!urls) return "";
    if (urls.moduleNav && typeof global.bible100ShellNav === "function") {
      return (
        'onclick="return bible100ShellNav(event,{sidebarUrl:' +
        JSON.stringify(urls.moduleNav.sidebar) +
        ",contentUrl:" +
        JSON.stringify(urls.moduleNav.content) +
        ',nav:\'module\'});" '
      );
    }
    if (typeof global.bible100ShellNav === "function") {
      return (
        'onclick="return bible100ShellNav(event,{sidebarUrl:' +
        JSON.stringify(urls.sidebarUrl) +
        ",contentUrl:" +
        JSON.stringify(urls.contentUrl) +
        '});" '
      );
    }
    return "";
  }

  function renderAddressStrip(currentId) {
    var R = global.CmZoneLandingRegistry;
    if (!R) return "";
    var parts = ['<nav class="cm-land-addr" aria-label="CM A-G zones">'];
    parts.push('<span class="cm-land-addr__label">区</span>');
    R.ZONES.forEach(function (z) {
      if (z.id === "gateway") return;
      var active = z.id === currentId ? " cm-land-addr__chip--on" : "";
      var urls = R.siteUrls(z);
      var href = urls ? urls.contentUrl : "#";
      parts.push(
        '<a class="cm-land-addr__chip' +
          active +
          '" href="' +
          href +
          '" ' +
          navClick(z) +
          'title="' +
          z.en +
          '"><strong>' +
          z.letter +
          "</strong> " +
          z.label +
          "</a>"
      );
    });
    parts.push("</nav>");
    return parts.join("");
  }

  function renderLangRow() {
    if (inHub()) return "";
    return (
      '<div class="cm-land-lang" role="group" aria-label="Language">' +
      '<span class="cm-land-lang__label" data-i18n="cm.lang.label">语言</span>' +
      '<button type="button" class="cm-land-lang__btn" data-locale="zh-Hant">中</button>' +
      '<button type="button" class="cm-land-lang__btn" data-locale="en">EN</button>' +
      '<button type="button" class="cm-land-lang__btn" data-locale="vi">VI</button>' +
      '<button type="button" class="cm-land-lang__btn" data-locale="id">ID</button>' +
      "</div>"
    );
  }

  function renderTitle(zone) {
    if (!zone || zone.id === "gateway") return "";
    return (
      '<header class="cm-land-head">' +
      "<h1>" +
      (zone.letter ? zone.letter + " · " : "") +
      zone.label +
      "</h1>" +
      '<p class="cm-land-head__en">' +
      zone.en +
      "</p></header>"
    );
  }

  function wireLang(host) {
    if (!host || inHub()) return;
    host.querySelectorAll(".cm-land-lang__btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var loc = btn.getAttribute("data-locale");
        if (global.B100ChromeI18n && global.B100ChromeI18n.setLocale) {
          global.B100ChromeI18n.setLocale(loc);
        }
        host.querySelectorAll(".cm-land-lang__btn").forEach(function (b) {
          b.classList.toggle("on", b === btn);
        });
      });
    });
  }

  function mount(hostId, zoneId) {
    var host = doc.getElementById(hostId || "cm-landing-shell-top");
    if (!host) return false;
    zoneId = zoneId || detectZoneId();
    var R = global.CmZoneLandingRegistry;
    var zone = R ? R.zoneById(zoneId) : null;
    host.innerHTML =
      renderAddressStrip(zoneId) + renderLangRow() + (zone ? renderTitle(zone) : "");
    host.setAttribute("data-cm-land-shell", SHELL_BUILD);
    wireLang(host);
    return true;
  }

  function boot(opts) {
    opts = opts || {};
    if (!global.CmZoneLandingRegistry) {
      global.setTimeout(function () {
        boot(opts);
      }, 40);
      return;
    }
    mount(opts.hostId, opts.zone);
  }

  global.CmLandingShell = {
    SHELL_BUILD: SHELL_BUILD,
    boot: boot,
    mount: mount,
    detectZoneId: detectZoneId,
  };

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", function () {
      boot({});
    });
  } else {
    boot({});
  }
})(typeof window !== "undefined" ? window : this, document);
