/**
 * B100 · 模块 landing 注册（读 js/b100_module_nav_ssot.js）
 */
(function (global) {
  "use strict";

  var REGISTRY_BUILD = "20260811c";

  function buildModule(modeId) {
    var Nav = global.B100ModuleNavSsot;
    var mod = Nav ? Nav.moduleById(modeId) : null;
    if (!mod) return null;
    return {
      modeId: mod.modeId,
      labelZh: mod.labelZh,
      labelEn: mod.labelEn,
      sidebar: mod.sidebar,
      defaultContent: mod.defaultContent,
      zones: (mod.zones || []).map(function (z) {
        return {
          id: z.id,
          labelShort: z.labelShort,
          labelZh: z.labelZh,
          labelEn: z.labelEn,
          content: z.content,
          desk: !!z.desk,
          moduleNav: !!z.moduleNav,
          moduleSidebar: z.moduleSidebar || "",
          moduleContent: z.moduleContent || "",
        };
      }),
    };
  }

  function siteUrls(modeId, zoneId) {
    var Nav = global.B100ModuleNavSsot;
    if (!Nav) return null;
    var pair = Nav.sitePair(modeId, zoneId || "home");
    if (!pair) return null;
    var zone = Nav.zoneById(modeId, zoneId);
    if (zone && zone.moduleNav) {
      return {
        sidebarUrl: zone.moduleSidebar,
        contentUrl: zone.moduleContent,
        moduleNav: true,
      };
    }
    return {
      sidebarUrl: pair.sidebarUrl,
      contentUrl: pair.contentUrl,
      moduleNav: false,
    };
  }

  global.B100ModuleLandingRegistry = {
    REGISTRY_BUILD: REGISTRY_BUILD,
    buildModule: buildModule,
    siteUrls: siteUrls,
  };
})(typeof window !== "undefined" ? window : this);
