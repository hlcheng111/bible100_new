/**
 * CM A–G · 顶栏2 / Hub / Standalone 导航 SSOT（与侧栏 focus + landing 对齐）
 */
(function (global) {
  "use strict";

  var NAV_BUILD = "20260806cm";

  var SIDEBAR_LAYOUT_RE = /(^|[/?#])sidebar_church_layout_v1\.html/i;

  var ZONES = [
    {
      id: "gateway",
      labelZh: "路線總覽",
      labelShort: "總覽",
      labelEn: "Gateway",
      landing: "church_ministry/_landing/gateway.html",
      sidebar: "church_ministry/sidebar_church_layout_v1.html",
      focus: "",
    },
    {
      id: "a",
      labelZh: "A 敬拜音樂",
      labelShort: "A",
      labelEn: "A Worship",
      landing: "church_ministry/modules/worship/worship-sunday-desk.html?crm_from=zone_a",
      sidebar: "church_ministry/sidebar_church_layout_v1.html?focus=a",
      focus: "a",
    },
    {
      id: "b",
      labelZh: "B 牧養小組",
      labelShort: "B",
      labelEn: "B Pastoral",
      landing:
        "church_ministry/modules/fellowship/pastoral-integrated.html?crm_from=zone_b&role=leader#tab-groups",
      sidebar: "church_ministry/sidebar_church_layout_v1.html?focus=b",
      focus: "b",
    },
    {
      id: "c",
      labelZh: "C 聖經門訓",
      labelShort: "C",
      labelEn: "C Discipleship",
      landing:
        "church_ministry/modules/education/education-integrated.html?crm_from=zone_c&role=teacher#tab-guide",
      sidebar: "church_ministry/sidebar_church_layout_v1.html?focus=c",
      focus: "c",
    },
    {
      id: "d",
      labelZh: "D 外展差傳",
      labelShort: "D",
      labelEn: "D Outreach",
      landing:
        "church_ministry/modules/expansion/outreach-integrated.html?crm_from=zone_d&role=staff#tab-needs",
      sidebar: "church_ministry/sidebar_church_layout_v1.html?focus=d",
      focus: "d",
    },
    {
      id: "e",
      labelZh: "E 社會服務",
      labelShort: "E",
      labelEn: "E Social",
      landing: "church_ministry/_landing/social.html",
      sidebar: "church_ministry/sidebar_church_layout_v1.html?focus=e",
      focus: "e",
    },
    {
      id: "f",
      labelZh: "F 詩歌應用",
      labelShort: "F",
      labelEn: "F Hymns",
      landing: "church_ministry/_landing/hymns.html",
      sidebar: "hymn_management/sidebar_playlist.html",
      focus: "f",
      moduleNav: true,
    },
    {
      id: "g",
      labelZh: "G 規劃行政",
      labelShort: "G",
      labelEn: "G Plan & Admin",
      landing:
        "church_ministry/modules/admin/admin-integrated.html?crm_from=zone_g#tab-dashboard",
      sidebar: "church_ministry/sidebar_church_layout_v1.html?focus=g",
      focus: "g",
    },
  ];

  var FORBIDDEN_CONTENT = [
    SIDEBAR_LAYOUT_RE,
    /(^|[/?#])church_ministry\/sidebar\.html/i,
    /church_ministry\/sidebar_c_education_journey\.html/i,
  ];

  function isSidebarLayoutUrl(url) {
    if (!url) return false;
    return SIDEBAR_LAYOUT_RE.test(String(url).replace(/\\/g, "/"));
  }

  function parseFocusFromUrl(url) {
    if (!url) return "";
    try {
      var u = String(url).replace(/\\/g, "/");
      var q = u.indexOf("?");
      if (q < 0) return "";
      var sp = new URLSearchParams(u.slice(q));
      var f = (sp.get("focus") || "").toLowerCase();
      return f === "admin" ? "g" : f;
    } catch (e) {
      return "";
    }
  }

  function shellPairForFocus(focusId) {
    var z = zoneById(focusId);
    if (!z) {
      return {
        sidebarUrl: "church_ministry/sidebar_church_layout_v1.html",
        contentUrl: "church_ministry/_landing/gateway.html",
      };
    }
    if (z.moduleNav && z.id === "f") {
      return {
        sidebarUrl: "church_ministry/sidebar_church_layout_v1.html?focus=f",
        contentUrl: z.landing,
      };
    }
    return {
      sidebarUrl: z.sidebar,
      contentUrl: z.landing,
    };
  }

  function recoverFromSidebarInContent(url) {
    if (!isSidebarLayoutUrl(url)) return null;
    var focus = parseFocusFromUrl(url);
    if (focus) return shellPairForFocus(focus);
    return {
      sidebarUrl: "church_ministry/sidebar_church_layout_v1.html",
      contentUrl: "church_ministry/_landing/gateway.html",
    };
  }

  function zoneById(id) {
    id = String(id || "").toLowerCase();
    if (id === "admin") id = "g";
    for (var i = 0; i < ZONES.length; i++) {
      if (ZONES[i].id === id) return ZONES[i];
    }
    return null;
  }

  function isForbiddenContentUrl(url) {
    return isSidebarLayoutUrl(url) || (function () {
      if (!url) return false;
      var u = String(url).replace(/\\/g, "/");
      for (var i = 1; i < FORBIDDEN_CONTENT.length; i++) {
        if (FORBIDDEN_CONTENT[i].test(u)) return true;
      }
      return false;
    })();
  }

  function sanitizeContentUrl(url, fallback) {
    if (isForbiddenContentUrl(url)) {
      var fix = recoverFromSidebarInContent(url);
      if (fix && fix.contentUrl) return fix.contentUrl;
      return fallback || "church_ministry/_landing/gateway.html";
    }
    return url;
  }

  function hubNavItem(zone) {
    if (!zone) return null;
    return {
      labelZh: zone.labelZh,
      labelShort: zone.labelShort,
      labelEn: zone.labelEn,
      navGroup: "desks",
      path: zone.moduleNav ? zone.landing : zone.landing,
      sidebar: zone.sidebar,
    };
  }

  function cmRelativeLanding(zone) {
    if (!zone) return "";
    if (zone.landing.indexOf("church_ministry/") === 0) {
      return zone.landing.replace(/^church_ministry\//, "");
    }
    if (zone.landing.indexOf("church_planning/") === 0) {
      return "../" + zone.landing;
    }
    if (zone.landing.indexOf("hymn_management/") === 0) {
      return "../" + zone.landing;
    }
    return zone.landing;
  }

  function cmRelativeSidebar(zone) {
    if (!zone) return "sidebar_church_layout_v1.html";
    if (zone.moduleNav && zone.id === "f") {
      return "sidebar_church_layout_v1.html?focus=f";
    }
    if (zone.focus) {
      return "sidebar_church_layout_v1.html?focus=" + encodeURIComponent(zone.focus);
    }
    return "sidebar_church_layout_v1.html";
  }

  global.CmZoneNavSsot = {
    NAV_BUILD: NAV_BUILD,
    ZONES: ZONES,
    zoneById: zoneById,
    hubNavItem: hubNavItem,
    isSidebarLayoutUrl: isSidebarLayoutUrl,
    parseFocusFromUrl: parseFocusFromUrl,
    shellPairForFocus: shellPairForFocus,
    recoverFromSidebarInContent: recoverFromSidebarInContent,
    isForbiddenContentUrl: isForbiddenContentUrl,
    sanitizeContentUrl: sanitizeContentUrl,
    cmRelativeLanding: cmRelativeLanding,
    cmRelativeSidebar: cmRelativeSidebar,
  };
})(typeof window !== "undefined" ? window : this);
