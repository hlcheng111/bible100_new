/**
 * B100 · 模块统一 Landing 顶壳（study / school / ai）
 * 范本：church_ministry/js/cm_landing_shell.js
 */
(function (global, doc) {
  "use strict";

  var SHELL_BUILD = "20260812clean";

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function getModeId(opts) {
    if (opts && opts.modeId) return opts.modeId;
    var body = doc.body;
    if (!body) return "";
    return body.getAttribute("data-b100-module-mode") || "";
  }

  function getZoneId(opts) {
    if (opts && opts.zoneId) return opts.zoneId;
    var body = doc.body;
    if (body && body.getAttribute("data-b100-landing-zone")) {
      return body.getAttribute("data-b100-landing-zone");
    }
    var Nav = global.B100ModuleNavSsot;
    var modeId = getModeId(opts);
    if (Nav && modeId) {
      return Nav.detectZoneFromPath(modeId, global.location.pathname || "");
    }
    return "home";
  }

  function inHub() {
    try {
      if (global.B100HubEmbed) {
        if (global.B100HubEmbed.inHubContentFrame && global.B100HubEmbed.inHubContentFrame()) {
          return true;
        }
        if (global.B100HubEmbed.inModuleShell && global.B100HubEmbed.inModuleShell()) {
          return true;
        }
      }
      return !!(global.parent && global.parent !== global);
    } catch (e) {
      return false;
    }
  }

  function navClick(modeId, zone) {
    var R = global.B100ModuleLandingRegistry;
    if (!R || !zone) return "";
    var urls = R.siteUrls(modeId, zone.id);
    if (!urls) return "";
    if (urls.moduleNav && typeof global.bible100ShellNav === "function") {
      return (
        'onclick="return bible100ShellNav(event,{sidebarUrl:' +
        JSON.stringify(urls.sidebarUrl) +
        ",contentUrl:" +
        JSON.stringify(urls.contentUrl) +
        '});" '
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

  function renderAddressStrip(modeId, currentZoneId) {
    var Nav = global.B100ModuleNavSsot;
    var mod = Nav ? Nav.moduleById(modeId) : null;
    if (!mod) return "";
    var parts = [
      '<nav class="cm-land-addr" aria-label="' + esc(mod.labelZh) + ' sections">',
      '<span class="cm-land-addr__label">區</span>',
    ];
    mod.zones.forEach(function (z) {
      var active = z.id === currentZoneId ? " cm-land-addr__chip--on" : "";
      var urls = global.B100ModuleLandingRegistry
        ? global.B100ModuleLandingRegistry.siteUrls(modeId, z.id)
        : null;
      var siteUrl = urls ? urls.contentUrl : "#";
      var href =
        typeof global.B100_siteHref === "function" && siteUrl && siteUrl !== "#"
          ? global.B100_siteHref(siteUrl)
          : siteUrl;
      var zhLabel = z.labelZh.replace(/^[路線Lab註冊事奉工具\s]*/, "") || z.labelZh;
      parts.push(
        '<a class="cm-land-addr__chip' +
          active +
          '" href="' +
          esc(href) +
          '" ' +
          navClick(modeId, z) +
          ' title="' +
          esc(zhLabel + " · " + (z.labelEn || mod.labelEn)) +
          '"><strong>' +
          esc(z.labelShort) +
          "</strong> " +
          esc(zhLabel) +
          '<span class="cm-land-addr__en">' +
          esc(z.labelEn || "") +
          "</span></a>"
      );
    });
    parts.push("</nav>");
    return parts.join("");
  }

  function renderTitle(modeId, zoneId) {
    var Nav = global.B100ModuleNavSsot;
    var mod = Nav ? Nav.moduleById(modeId) : null;
    var zone = Nav ? Nav.zoneById(modeId, zoneId) : null;
    if (!mod || !zone) return "";
    return (
      '<header class="cm-land-head">' +
      "<h1>" +
      esc(zone.labelZh) +
      "</h1>" +
      '<p class="cm-land-head__en">' +
      esc(mod.labelEn + " · " + (zone.labelEn || "")) +
      "</p></header>"
    );
  }

  function mount(hostId, opts) {
    opts = opts || {};
    var host = doc.getElementById(hostId || "b100-landing-shell-top");
    if (!host) return false;
    var modeId = getModeId(opts);
    var zoneId = getZoneId(opts);
    if (!modeId) return false;
    var hub = inHub();
    if (hub) {
      host.innerHTML = "";
      if (global.B100HubEmbed && global.B100HubEmbed.quietLandingDom) {
        global.B100HubEmbed.quietLandingDom();
      }
      host.setAttribute("data-b100-land-shell", SHELL_BUILD);
      if (doc.body) {
        doc.body.classList.add("b100-land-shell-active", "b100-land-shell-hub");
        doc.body.classList.toggle("b100-land-zone-home", zoneId === "home");
      }
      return true;
    }
    var html = "";
    html += renderAddressStrip(modeId, zoneId);
    if (zoneId !== "home") {
      html += renderTitle(modeId, zoneId);
    }
    host.innerHTML = html;
    host.setAttribute("data-b100-land-shell", SHELL_BUILD);
    if (doc.body) {
      doc.body.classList.add("b100-land-shell-active");
      doc.body.classList.remove("b100-land-shell-hub");
      doc.body.classList.toggle("b100-land-shell-hub", hub);
      doc.body.classList.toggle("b100-land-zone-home", zoneId === "home");
    }
    return true;
  }

  function boot(opts) {
    opts = opts || {};
    if (!global.B100ModuleNavSsot || !global.B100ModuleLandingRegistry) {
      global.setTimeout(function () {
        boot(opts);
      }, 40);
      return;
    }
    if (global.B100HubEmbed && global.B100HubEmbed.apply) {
      global.B100HubEmbed.apply();
    }
    mount(opts.hostId, opts);
  }

  global.B100LandingShell = {
    SHELL_BUILD: SHELL_BUILD,
    boot: boot,
    mount: mount,
  };

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", function () {
      boot({});
    });
  } else {
    boot({});
  }
})(typeof window !== "undefined" ? window : this, document);
