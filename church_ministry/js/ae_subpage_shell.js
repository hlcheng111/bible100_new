/**
 * A–E 子頁自動殼：頂部互聯條 + 底部同區路線圖格子
 * 由 scripts/patch_ae_subpage_shell.py 注入；亦可手動載入。
 */
(function (doc, win) {
  "use strict";

  var PATH_ZONE_RULES = [
    { re: /\/modules\/worship\//i, zone: "a" },
    { re: /\/modules\/media\//i, zone: "a" },
    { re: /\/modules\/support\/visitation/i, zone: "b" },
    { re: /\/modules\/fellowship\//i, zone: "b" },
    { re: /\/modules\/development\/youth/i, zone: "b" },
    { re: /\/modules\/education\//i, zone: "c" },
    { re: /\/modules\/development\/development-plan/i, zone: "c" },
    { re: /\/modules\/expansion\//i, zone: "d" },
    { re: /\/modules\/innovation\//i, zone: "d" },
    { re: /\/tools\/volunteer_shift\//i, zone: "e" },
    { re: /\/modules\/volunteer\//i, zone: "e" },
    { re: /\/congregation\//i, zone: "e" },
    { re: /\/modules\/(members|finance|administration|equipment|library|research|tech|support)\//i, zone: "f" },
    { re: /\/(dashboard|people\/|theme-settings|custom-page-editor|vision_and_plan|roadmap-overview|ministry_core|ai-and-compliance|community-overview)\.html/i, zone: "f" },
    { re: /\/church_ministry\/dashboard\.html/i, zone: "f" }
  ];

  function normPath(p) {
    return String(p || "")
      .replace(/\\/g, "/")
      .split("?")[0]
      .split("#")[0]
      .toLowerCase();
  }

  function currentRelPath() {
    var p = normPath(win.location.pathname || "");
    var idx = p.indexOf("/church_ministry/");
    if (idx >= 0) return p.slice(idx + "/church_ministry/".length);
    if (p.indexOf("church_ministry/") === 0) return p.slice("church_ministry/".length);
    return p.replace(/^\//, "");
  }

  function detectZone(rel) {
    var bodyZone = doc.body && doc.body.getAttribute("data-b100-ae-zone");
    if (bodyZone) return bodyZone;
    var hit = null;
    PATH_ZONE_RULES.some(function (rule) {
      if (rule.re.test("/" + rel) || rule.re.test(rel)) {
        hit = rule.zone;
        return true;
      }
      return false;
    });
    return hit;
  }

  function cmPrefix(rel) {
    var depth = (rel.match(/\//g) || []).length;
    if (depth <= 0) return "";
    return new Array(depth + 1).join("../");
  }

  function sitePrefix(cmPre) {
    return cmPre + "../";
  }

  function zoneMeta(zoneId) {
    var reg = win.CrmJourneyRegistry;
    if (!reg || !reg.aeZones) return null;
    for (var i = 0; i < reg.aeZones.length; i++) {
      if (reg.aeZones[i].id === zoneId) return reg.aeZones[i];
    }
    return null;
  }

  function hubUrl(role) {
    if (role === "teacher") return "modules/development/discipleship-training.html";
    return "dashboard.html";
  }

  function injectTopStrip(zoneId, cmPre) {
    if (doc.getElementById("ae-primary-nav-strip")) return;
    var zm = zoneMeta(zoneId);
    if (!zm || !zm.primary) return;
    var z = win.AePrimaryNav && win.AePrimaryNav.zones ? win.AePrimaryNav.zones[zoneId] : null;
    if (!z && zm.primary) {
      z = {
        emoji: zm.emoji,
        label: zm.label,
        role: zm.primary.role,
        step: zm.primary.step,
        path: zm.primary.path,
        focus: zm.focus
      };
    }
    if (!z) return;

    if (!doc.body.getAttribute("data-b100-ae-zone")) {
      doc.body.setAttribute("data-b100-ae-zone", zoneId);
    }
    if (!doc.body.getAttribute("data-b100-ae-prefix")) {
      doc.body.setAttribute("data-b100-ae-prefix", cmPre);
    }
    if (!doc.body.getAttribute("data-b100-module")) {
      doc.body.setAttribute("data-b100-module", "church_ministry");
    }
    if (!doc.body.getAttribute("data-b100-pattern")) {
      doc.body.setAttribute("data-b100-pattern", "P-AE-SUB");
    }

    var strip = doc.createElement("div");
    strip.id = "ae-primary-nav-strip";
    strip.className = "ae-primary-nav-strip ae-nav-slim";
    var deskMap = {
      a: cmPre + "desks/worship-team.html",
      b: cmPre + "desks/pastoral.html",
      c: cmPre + "modules/education/education-integrated.html",
      d: cmPre + "desks/outreach.html",
      e: cmPre + "modules/volunteer/volunteer-integrated.html",
      f: cmPre + "desks/admin.html"
    };
    var deskHref = deskMap[zoneId] || cmPre + "desks/index.html";
    var homeHref = cmPre + "desks/index.html";
    strip.innerHTML =
      '<a class="ae-nav-home" href="' +
      homeHref +
      '">← 15 主桌</a>' +
      '<span class="ae-nav-zone">' +
      z.emoji +
      " " +
      (zm.label || z.label) +
      "</span>" +
      '<a href="' +
      deskHref +
      '">本區主桌</a>' +
      '<a href="' +
      cmPre +
      'load_central_member_seed.html" class="ae-nav-muted" target="_parent">📥 示範會友</a>';
    doc.body.insertBefore(strip, doc.body.firstChild);
  }

  function injectRoadmap(zoneId, rel, cmPre) {
    /* 預設不再注入「同區格子側欄」——改由殼左欄／本區主桌承載 */
    if (doc.getElementById("ae-zone-roadmap")) return;
    var chrome = doc.body && doc.body.getAttribute("data-b100-ae-chrome");
    if (chrome !== "full") return;
    var reg = win.CrmJourneyRegistry;
    if (!reg || !reg.subpagesByZone) return;
    var pages = reg.subpagesByZone[zoneId];
    if (!pages || !pages.length) return;

    var wrap = doc.createElement("aside");
    wrap.id = "ae-zone-roadmap";
    wrap.className = "ae-zone-roadmap";
    wrap.setAttribute("aria-label", "本區路線圖");

    var zm = zoneMeta(zoneId);
    var title = (zm ? zm.emoji + " " + zm.label : zoneId.toUpperCase()) + " · 同區工具一覽";
    var html =
      '<p class="ae-zone-roadmap__title">' + title + "</p>" +
      '<p class="ae-zone-roadmap__hint">進階：完整工具清單（預設已隱藏）</p>';

    var lastGroup = "";
    pages.forEach(function (pg) {
      if (pg.group && pg.group !== lastGroup) {
        lastGroup = pg.group;
        html += '<div class="ae-zone-roadmap__group">' + pg.group + "</div>";
      }
      var href = reg.toolHref(pg.path, pg.role || (zm && zm.primary && zm.primary.role), pg.step);
      var cur = normPath(rel) === normPath(pg.path);
      var cls = "ae-zone-roadmap__cell" + (pg.primary ? " is-primary" : "") + (cur ? " is-current" : "");
      html +=
        '<a class="' + cls + '" href="' + cmPre + href + '">' + pg.label +
        (pg.blurb ? "<small>" + pg.blurb + "</small>" : "") + "</a>";
    });

    wrap.innerHTML = html;
    doc.body.appendChild(wrap);
  }

  function isEducationIntegratedPage() {
    try {
      var p = String(win.location.pathname || "").replace(/\\/g, "/").toLowerCase();
      return p.indexOf("education-integrated.html") >= 0;
    } catch (e) {
      return false;
    }
  }

  function isEducationCZone() {
    var z = doc.body && doc.body.getAttribute("data-b100-ae-zone");
    if (z === "c") return true;
    return isEducationIntegratedPage();
  }

  /** C 區主殼自管 5 Tab；子頁不注入 AE 通用殼 */
  function bootEducationShell() {
    if (isEducationIntegratedPage()) return true;
    if (doc.body && doc.body.getAttribute("data-b100-pattern") === "P-AE-EDU-SHELL") return true;
    return false;
  }

  function shouldHideInHub() {
    if (win.B100HubEmbed && win.B100HubEmbed.shouldHideChrome) {
      return win.B100HubEmbed.shouldHideChrome();
    }
    try {
      if (win.parent && win.parent !== win && win.frameElement) {
        var n = win.frameElement.id || win.frameElement.getAttribute("name") || "";
        if (n === "contentFrame") {
          if (doc.body) doc.body.classList.add("b100-hub-embedded");
          if (win.B100HubEmbed && win.B100HubEmbed.apply) win.B100HubEmbed.apply();
          return true;
        }
      }
    } catch (eHub) { /* ignore */ }
    return false;
  }

  function injectHubHiddenStyles() {
    if (doc.getElementById("b100-hub-embed-style")) return;
    var st = doc.createElement("style");
    st.id = "b100-hub-embed-style";
    st.textContent =
      "body.b100-hub-embedded #ae-primary-nav-strip," +
      "body.b100-hub-embedded .crm-ctx-bar," +
      "body.b100-hub-embedded nav.top-nav,body.b100-hub-embedded .top-nav," +
      "body.b100-hub-embedded nav.anchor-nav,body.b100-hub-embedded .anchor-nav{display:none!important;}";
    (doc.head || doc.documentElement).appendChild(st);
  }

  function boot() {
    if (bootEducationShell()) return;
    if (win.B100HubEmbed && win.B100HubEmbed.apply) {
      win.B100HubEmbed.apply();
    }
    var chrome = doc.body && doc.body.getAttribute("data-b100-ae-chrome");
    if (chrome === "off") return;
    if (shouldHideInHub()) {
      injectHubHiddenStyles();
      return;
    }
    var rel = currentRelPath();
    var zoneId = detectZone(rel);
    if (!zoneId) return;
    var cmPre = cmPrefix(rel);
    injectTopStrip(zoneId, cmPre);
    if (chrome !== "minimal") {
      injectRoadmap(zoneId, rel, cmPre);
    }
    if (win.CrmContextBar && typeof win.CrmContextBar.render === "function") {
      var params = new URLSearchParams(win.location.search || "");
      if (!params.get("crm_from")) {
        params.set("crm_from", "sidebar");
        var zm = zoneMeta(zoneId);
        if (zm && zm.primary && !params.get("role")) {
          try {
            var u = win.location.pathname + "?" + params.toString();
            if (win.history && win.history.replaceState) {
              win.history.replaceState(null, "", u);
            }
          } catch (eH) {}
        }
      }
      win.CrmContextBar.render();
    }
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  win.AeSubpageShell = {
    boot: boot,
    detectZone: detectZone,
    currentRelPath: currentRelPath,
    isEducationIntegratedPage: isEducationIntegratedPage,
    isEducationCZone: isEducationCZone,
    bootEducationShell: bootEducationShell
  };
})(document, window);
