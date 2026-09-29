/**
 * CM F 区侧栏 SSOT — 4 层 IA（跨模块 hymn）
 */
(function (global) {
  "use strict";

  var ZONE_BUILD = "20260805e";

  var ZONE = {
    id: "f",
    label: "F 詩歌應用",
    en: "Hymns · 2000+ scores",
    i18nKey: "cm.sb.sec.fhymn",
    theme: "cm",
    focusZone: "f",
    sbGroup: "併",
    headHref: "_landing/hymns.html",
    primary: [
      {
        id: "f_hymn_main",
        label: "詩歌曲庫",
        en: "Full hymn library",
        i18nKey: "cm.sb.f.hymn.main",
        href: "../hymn_management/dashboard.html",
        primary: true,
        nav: "module",
        moduleSidebar: "hymn_management/sidebar_playlist.html",
        moduleContent: "hymn_management/dashboard.html",
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
            label: "曲庫 Dashboard",
            en: "Hymn dashboard",
            href: "../hymn_management/dashboard.html",
            nav: "module",
            moduleSidebar: "hymn_management/sidebar_playlist.html",
            moduleContent: "hymn_management/dashboard.html",
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
