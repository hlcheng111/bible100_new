/**
 * CM · Standalone + Registry · 区 landing 注册（读 js/cm_zone_nav_ssot.js）
 */
(function (global) {
  "use strict";

  var REGISTRY_BUILD = "20260806cm";

  function buildZonesFromNav() {
    var Nav = global.CmZoneNavSsot;
    if (!Nav || !Nav.ZONES) return [];
    return Nav.ZONES.map(function (z) {
      var relLanding = Nav.cmRelativeLanding(z);
      var row = {
        id: z.id,
        letter: z.labelShort === "總覽" ? "" : z.labelShort,
        label: z.labelZh.replace(/^[A-G]\s*/, ""),
        labelFull: z.labelZh,
        en: z.labelEn,
        landing: relLanding,
        sidebarFocus: z.focus || "",
      };
      if (z.id === "f") {
        row.moduleNav = {
          sidebar: "hymn_management/sidebar_playlist.html",
          content: "hymn_management/dashboard.html",
        };
      }
      return row;
    });
  }

  var ZONES = buildZonesFromNav();

  function zoneById(id) {
    id = String(id || "").toLowerCase();
    if (id === "admin") id = "g";
    for (var i = 0; i < ZONES.length; i++) {
      if (ZONES[i].id === id) return ZONES[i];
    }
    return null;
  }

  function siteUrls(zone) {
    if (!zone) return null;
    var Nav = global.CmZoneNavSsot;
    var navZone = Nav ? Nav.zoneById(zone.id) : null;
    if (navZone) {
      return {
        sidebarUrl: navZone.sidebar,
        contentUrl: Nav.sanitizeContentUrl(navZone.landing, "church_ministry/_landing/gateway.html"),
        moduleNav: zone.moduleNav || null,
      };
    }
    var sidebarUrl = zone.sidebarFocus
      ? "church_ministry/sidebar_church_layout_v1.html?focus=" + encodeURIComponent(zone.sidebarFocus)
      : "church_ministry/sidebar_church_layout_v1.html";
    var landing = zone.landing.indexOf("../") === 0 ? zone.landing.replace(/^\.\.\//, "") : "church_ministry/" + zone.landing;
    return {
      sidebarUrl: sidebarUrl,
      contentUrl: landing.replace(/\\/g, "/"),
      moduleNav: zone.moduleNav || null,
    };
  }

  function cmRelativeUrls(zone) {
    if (!zone) return null;
    var Nav = global.CmZoneNavSsot;
    var navZone = Nav ? Nav.zoneById(zone.id) : null;
    if (navZone) {
      return {
        sidebarUrl: Nav.cmRelativeSidebar(navZone),
        contentUrl: zone.landing,
        moduleNav: zone.moduleNav || null,
      };
    }
    var sidebarUrl = zone.sidebarFocus
      ? "sidebar_church_layout_v1.html?focus=" + encodeURIComponent(zone.sidebarFocus)
      : "sidebar_church_layout_v1.html";
    return {
      sidebarUrl: sidebarUrl,
      contentUrl: zone.landing,
      moduleNav: zone.moduleNav || null,
    };
  }

  global.CmZoneLandingRegistry = {
    REGISTRY_BUILD: REGISTRY_BUILD,
    ZONES: ZONES,
    zoneById: zoneById,
    siteUrls: siteUrls,
    cmRelativeUrls: cmRelativeUrls,
  };
})(typeof window !== "undefined" ? window : this);
