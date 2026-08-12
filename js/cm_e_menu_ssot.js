/**
 * CM E 区侧栏 SSOT — 4 层 IA（無示範層）
 */
(function (global) {
  "use strict";

  var ZONE_BUILD = "20260805e";
  var CRM = "e_social";

  function href(path, opts) {
    path = String(path || "");
    opts = opts || {};
    var crm = opts.crm != null ? opts.crm : CRM;
    var R = global.B100SidebarRender;
    if (!R || !R.appendQuery) return path;
    var url = R.appendQuery(path, "crm_from", crm);
    if (opts.role) url = R.appendQuery(url, "role", opts.role);
    if (opts.step != null && opts.step !== "") url = R.appendQuery(url, "step", String(opts.step));
    return url;
  }

  var ZONE = {
    id: "e",
    label: "E 社會服務",
    en: "Social Service",
    i18nKey: "cm.sb.sec.e",
    theme: "cm",
    focusZone: "e",
    sbGroup: "併",
    headHref: href("_landing/social.html"),
    primary: [
      {
        id: "e_volunteer",
        label: "義工排班",
        en: "Volunteer Shifts",
        i18nKey: "cm.e.volunteer.primary",
        href: href("tools/volunteer_shift/index.html", { role: "leader", step: 1 }),
        primary: true,
        dataAttrs: 'data-m3-entry="volunteer"',
      },
    ],
    categories: [
      {
        id: "e_social_min",
        num: "1",
        summary: "社會服務事工",
        en: "Social Service Ministry",
        open: true,
        items: [
          {
            id: "e_shift",
            label: "排班工作桌",
            en: "Shift Desk",
            href: href("tools/volunteer_shift/index.html", { role: "leader", step: 1 }),
            children: [
              {
                id: "e_shift_main",
                label: "義工排班",
                en: "Volunteer shifts",
                i18nKey: "cm.sb.volunteer",
                href: href("tools/volunteer_shift/index.html", { role: "leader", step: 1 }),
              },
              {
                id: "e_swap",
                label: "請假調班",
                en: "Leave swap",
                i18nKey: "cm.sb.leave.swap",
                href: href("tools/volunteer_shift/leave_swap.html", { role: "leader", step: 1 }),
              },
            ],
          },
          {
            id: "e_community",
            label: "會眾入口 Church Center",
            en: "Church Center",
            i18nKey: "cm.sb.community",
            href: href("congregation/index.html", { crm: "e_congregation", role: "member" }),
            dataAttrs: 'data-m3-entry="congregation"',
            children: [
              {
                id: "e_academy",
                label: "會眾自助（QR 主路）",
                en: "Member self-service",
                href: href("congregation/index.html", { crm: "e_congregation", role: "member" }),
              },
              {
                id: "e_cc_leader",
                label: "同工管理預覽",
                en: "Leader preview",
                href: href("congregation/index.html", { crm: "e_congregation", role: "leader" }),
              },
              {
                id: "e_post",
                label: "志工崗位／配對",
                en: "Volunteer posts",
                i18nKey: "cm.sb.e.post",
                href: href("modules/volunteer/volunteer-integrated.html", { role: "leader", step: 1 }),
              },
            ],
          },
        ],
      },
    ],
  };

  global.CmEMenu = {
    ZONE_BUILD: ZONE_BUILD,
    CRM: CRM,
    ZONE: ZONE,
    href: href,
  };
})(typeof window !== "undefined" ? window : this);
