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
    { re: /\/modules\/(members|finance|administration|equipment|library|research|tech|volunteer|support)\//i, zone: "e" },
    { re: /\/(dashboard|people\/|congregation\/|theme-settings|custom-page-editor|vision_and_plan|roadmap-overview|ministry_core|ai-and-compliance|community-overview)\.html/i, zone: "e" },
    { re: /\/church_ministry\/dashboard\.html/i, zone: "e" }
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
    if (role === "leader") return "guide_crm_journey_hub.html?tab=vision&role=leader";
    return "guide_crm_journey_hub.html?tab=journey&role=" + encodeURIComponent(role || "staff");
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
    strip.className = "ae-primary-nav-strip";
    var shell = typeof win.bible100ShellNav === "function";
    strip.innerHTML =
      '<span class="ae-nav-zone">' + z.emoji + " " + z.label + "</span>" +
      (shell
        ? '<a href="#" id="aeNavCrm">🗺️ 回 CRM 旅程</a><a href="#" class="ae-nav-muted" id="aeNavLayout">📂 本區完整側欄</a>'
        : '<a href="' + cmPre + hubUrl(z.role) + '">🗺️ 回 CRM 旅程</a>') +
      '<a href="' + cmPre + 'load_central_member_seed.html?crm_from=sidebar&amp;role=' +
      encodeURIComponent(z.role) +
      '" class="ae-nav-muted" target="_parent">📥 載入試用會友</a>';
    doc.body.insertBefore(strip, doc.body.firstChild);

    if (shell) {
      var crm = doc.getElementById("aeNavCrm");
      var lay = doc.getElementById("aeNavLayout");
      if (crm) {
        crm.onclick = function (ev) {
          if (ev.preventDefault) ev.preventDefault();
          win.bible100ShellNav(ev, {
            sidebarUrl: "church_ministry/sidebar_crm_journey.html",
            contentUrl: "church_ministry/" + hubUrl(z.role)
          });
          return false;
        };
      }
      if (lay) {
        lay.onclick = function (ev) {
          if (ev.preventDefault) ev.preventDefault();
          var sidebarUrl =
            z.focus === "a"
              ? "church_ministry/sidebar_worship_journey.html"
              : "church_ministry/sidebar_church_layout_v1.html?focus=" + z.focus;
          win.bible100ShellNav(ev, {
            sidebarUrl: sidebarUrl,
            contentUrl: "church_ministry/" + z.path
          });
          return false;
        };
      }
    }
  }

  function injectRoadmap(zoneId, rel, cmPre) {
    if (doc.getElementById("ae-zone-roadmap")) return;
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
      '<p class="ae-zone-roadmap__hint">點格子換工具頁；完成後用頂條 <strong>回 CRM 旅程</strong>。</p>';

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

  function boot() {
    var rel = currentRelPath();
    var zoneId = detectZone(rel);
    if (!zoneId) return;
    var cmPre = cmPrefix(rel);
    injectTopStrip(zoneId, cmPre);
    injectRoadmap(zoneId, rel, cmPre);
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

  win.AeSubpageShell = { boot: boot, detectZone: detectZone, currentRelPath: currentRelPath };
})(document, window);
