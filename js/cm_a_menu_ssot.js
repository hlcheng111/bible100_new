/**
 * CM A 区侧栏 SSOT — 4 层 IA 范本（無示範層）
 * 渲染：js/cm_sidebar_zone_render.js + js/b100_sidebar_render.js
 */
(function (global) {
  "use strict";

  var ZONE_BUILD = "20260805e";
  var CRM = "a_worship";

  function href(path, crm) {
    path = String(path || "");
    crm = crm || CRM;
    var R = global.B100SidebarRender;
    if (R && R.appendQuery) return R.appendQuery(path, "crm_from", crm);
    return path + (path.indexOf("?") >= 0 ? "&" : "?") + "crm_from=" + encodeURIComponent(crm);
  }

  var ZONE = {
    id: "a",
    label: "A 敬拜音樂",
    en: "Worship & Music",
    i18nKey: "cm.sb.sec.a",
    theme: "cm",
    focusZone: "a",
    sbGroup: "併",
    headHref: href("_landing/worship.html"),
    primary: [
      {
        id: "a_gathering",
        label: "聚會出席",
        en: "Gathering Attendance",
        i18nKey: "cm.a.gathering",
        href: href("modules/worship/worship-sunday-desk.html"),
        primary: true,
      },
    ],
    categories: [
      {
        id: "a_worship_min",
        num: "1",
        summary: "敬拜音樂事工",
        en: "Worship Music Ministry",
        open: true,
        items: [
          {
            id: "a_sunday",
            label: "敬拜主日",
            en: "Sunday Worship",
            href: href("modules/worship/worship-sunday-desk.html"),
          },
          {
            id: "a_team",
            label: "敬拜团队",
            en: "Worship Team",
            href: href("modules/worship/worship-team-management.html"),
          },
          {
            id: "a_choir",
            label: "詩班",
            en: "Choir",
            href: href("modules/worship/choir-team.html"),
            children: [
              {
                id: "a_choir_adult",
                label: "成人詩班",
                en: "Adult Choir",
                href: href("modules/worship/choir-team.html#adult"),
              },
              {
                id: "a_choir_child",
                label: "兒童詩班",
                en: "Children Choir",
                href: href("modules/worship/choir-team.html#children"),
              },
              {
                id: "a_choir_praise",
                label: "敬拜隊",
                en: "Praise Team",
                href: href("modules/worship/choir-team.html#praise"),
              },
            ],
          },
          {
            id: "a_av",
            label: "樂器与音響",
            en: "Instruments & AV",
            href: href("modules/worship/instrument-team.html"),
          },
          {
            id: "a_songs",
            label: "詩歌資源",
            en: "Hymn Resources",
            href: href("modules/worship/song-library.html"),
          },
        ],
      },
    ],
  };

  global.CmAMenu = {
    ZONE_BUILD: ZONE_BUILD,
    CRM: CRM,
    ZONE: ZONE,
    href: href,
  };
})(typeof window !== "undefined" ? window : this);
