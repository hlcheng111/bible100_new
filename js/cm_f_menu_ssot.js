/**
 * CM F 区侧栏 SSOT — 转回曲库双栏（playlist + catalog_sort）
 */
(function (global) {
  "use strict";

  var ZONE_BUILD = "20260930a";

  var ZONE = {
    id: "f",
    label: "F 樂以載道",
    en: "Practical Hymnology",
    i18nKey: "cm.sb.sec.fhymn",
    theme: "cm",
    focusZone: "f",
    sbGroup: "併",
    headHref: "../hymn_management/practical_hymnology/landing.html?crm_from=f_hymns",
    headNav: "module",
    headModuleSidebar: "hymn_management/sidebar_lexidao.html",
    headModuleContent: "hymn_management/practical_hymnology/landing.html?crm_from=f_hymns",
    primary: [
      {
        id: "f_hymn_main",
        label: "樂以載道",
        en: "Practical Hymnology",
        i18nKey: "cm.sb.f.hymn.main",
        href: "../hymn_management/practical_hymnology/landing.html",
        primary: true,
        nav: "module",
        moduleSidebar: "hymn_management/sidebar_lexidao.html",
        moduleContent: "hymn_management/practical_hymnology/landing.html",
      },
    ],
    categories: [
      {
        id: "f_hymn_min",
        num: "1",
        summary: "詩歌應用事工",
        en: "Hymn Application Ministry",
        open: true,
        items: [
          {
            id: "f_lib",
            label: "曲譜表選歌",
            en: "Sortable hymn table",
            href: "../hymn_management/hymn_catalog_sort.html",
            nav: "module",
            moduleSidebar: "hymn_management/sidebar_lexidao.html",
            moduleContent: "hymn_management/hymn_catalog_sort.html",
          },
          {
            id: "f_lexidao",
            label: "樂以載道（換模組）",
            en: "Practical Hymnology module",
            href: "../hymn_management/practical_hymnology/landing.html",
            nav: "module",
            moduleSidebar: "hymn_management/sidebar_lexidao.html",
            moduleContent: "hymn_management/practical_hymnology/landing.html",
          },
          {
            id: "f_index",
            label: "整全資訊曲譜",
            en: "default.htm index",
            i18nKey: "cm.sb.f.hymn.index",
            href: "../hymn_management/hymn/default.htm",
            nav: "module",
            moduleSidebar: "hymn_management/sidebar.html",
            moduleContent: "hymn_management/hymn/default.htm",
          },
        ],
      },
    ],
  };

  global.CmFMenu = {
    ZONE_BUILD: ZONE_BUILD,
    ZONE: ZONE,
  };
})(typeof window !== "undefined" ? window : this);
