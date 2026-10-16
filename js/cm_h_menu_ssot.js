/**
 * CM H 區側欄 SSOT — 出席系統（與頂欄2／gateway EN 一本帳對齊）
 */
(function (global) {
  "use strict";

  var ZONE_BUILD = "20261016h";
  var CRM = "h_attendance";

  function href(path, crm) {
    path = String(path || "");
    crm = crm || CRM;
    var R = global.B100SidebarRender;
    if (R && R.appendQuery) return R.appendQuery(path, "crm_from", crm);
    return path + (path.indexOf("?") >= 0 ? "&" : "?") + "crm_from=" + encodeURIComponent(crm);
  }

  var ZONE = {
    id: "h",
    label: "H 出席系統",
    en: "H Attend",
    i18nKey: "cm.sb.sec.h",
    theme: "cm",
    focusZone: "h",
    sbGroup: "併",
    headHref: href("_landing/attendance.html"),
    primary: [
      {
        id: "h_hub",
        label: "出席總覽",
        en: "Attendance Hub",
        i18nKey: "cm.h.hub",
        href: href("_landing/attendance.html"),
        primary: true
      }
    ],
    categories: [
      {
        id: "h_venues",
        num: "1",
        summary: "依場合點名",
        en: "By Venue",
        open: true,
        items: [
          {
            id: "h_worship",
            label: "崇拜／主日點名",
            en: "Sunday Worship Roll",
            href: href("modules/worship/worship-sunday-desk.html#roll")
          },
          {
            id: "h_checkin",
            label: "團契／現場簽到",
            en: "Fellowship Check-in",
            href: href("modules/fellowship/attendance-checkin.html")
          },
          {
            id: "h_pastoral",
            label: "小組出席統計",
            en: "Cell Attendance Stats",
            href: href("modules/fellowship/pastoral-attendance.html")
          },
          {
            id: "h_edu",
            label: "主日學出席",
            en: "Education Attendance",
            href: href("modules/education/education-integrated.html#tab-attendance")
          }
        ]
      },
      {
        id: "h_newcomer",
        num: "2",
        summary: "新人發碼",
        en: "Newcomer QR",
        open: false,
        items: [
          {
            id: "h_qr",
            label: "發碼台",
            en: "QR Desk",
            href: href("modules/fellowship/newcomer-qr-desk.html")
          },
          {
            id: "h_reg",
            label: "新人自助登記",
            en: "Self Register",
            href: href("modules/fellowship/newcomer-self-register.html"),
            target: "_blank"
          },
          {
            id: "h_handbook",
            label: "運作說明",
            en: "Ops Handbook",
            href: href("docs/ATTENDANCE_OPS_HANDBOOK.html")
          }
        ]
      }
    ]
  };

  global.CmHMenu = {
    ZONE_BUILD: ZONE_BUILD,
    ZONE: ZONE
  };
})(typeof window !== "undefined" ? window : this);
