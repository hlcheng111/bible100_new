/**
 * CM B 区侧栏 SSOT — 4 Tab 牧養工作桌為主路（W6 · 對標 C 區）
 */
(function (global) {
  "use strict";

  var ZONE_BUILD = "20260806w6";
  var CRM = "b_pastoral";

  function href(path, opts) {
    path = String(path || "");
    opts = opts || {};
    var crm = opts.crm != null ? opts.crm : CRM;
    var R = global.B100SidebarRender;
    if (!R || !R.appendQuery) {
      var url = path + (path.indexOf("?") >= 0 ? "&" : "?") + "crm_from=" + encodeURIComponent(crm);
      if (opts.role) url += "&role=" + encodeURIComponent(opts.role);
      return url;
    }
    var url = R.appendQuery(path, "crm_from", crm);
    if (opts.role) url = R.appendQuery(url, "role", opts.role);
    return url;
  }

  function pastTab(tab, opts) {
    opts = opts || {};
    return href("modules/fellowship/pastoral-integrated.html#tab-" + tab, {
      crm: opts.crm,
      role: opts.role || "leader",
    });
  }

  var ZONE = {
    id: "b",
    label: "B 牧養小組",
    en: "Pastoral & Groups",
    i18nKey: "cm.sb.sec.b",
    theme: "cm",
    focusZone: "b",
    sbGroup: "併",
    headHref: pastTab("groups", { crm: "b_landing" }),
    primary: [
      {
        id: "b_pastoral_desk",
        label: "牧養小組工作桌",
        en: "Pastoral Desk · 4 Tab",
        i18nKey: "cm.sb.b.pastoral.desk",
        href: pastTab("groups"),
        primary: true,
        dataAttrs: 'data-m3-entry="pastoral_desk"',
      },
    ],
    categories: [
      {
        id: "b_pastoral_min",
        num: "1",
        summary: "牧養小組事工",
        en: "Pastoral & Small Groups",
        open: true,
        items: [
          {
            id: "b_desk",
            label: "牧養工作桌 · 4 Tab",
            en: "Pastoral Desk",
            i18nKey: "cm.sb.b.groups",
            href: pastTab("groups"),
            children: [
              { id: "b_tab_groups", label: "① 小組", en: "Groups", href: pastTab("groups") },
              { id: "b_tab_attend", label: "② 出席", en: "Attendance", href: pastTab("attendance") },
              { id: "b_tab_alerts", label: "③ 缺席預警", en: "Alerts", href: pastTab("alerts") },
              {
                id: "b_tab_visit",
                label: "④ 探訪佇列",
                en: "Visitation queue",
                href: pastTab("visitation"),
              },
            ],
          },
          {
            id: "b_absence_bridge",
            label: "缺席→探訪佇列",
            en: "Absence → Visitation",
            i18nKey: "cm.sb.b.absence.bridge",
            href: href("modules/support/visitation_index.html", { crm: "b_education_absence" }),
            dataAttrs: 'data-m2-step="visitation"',
          },
          {
            id: "b_org",
            label: "組織与名册",
            en: "Org & Roster",
            i18nKey: "cm.sb.b.org",
            href: href("modules/fellowship/pastoral-org-roster.html"),
          },
          {
            id: "b_overview",
            label: "團契總覽",
            en: "Fellowship Overview",
            i18nKey: "cm.sb.b.overview",
            href: href("modules/fellowship/index.html"),
          },
          {
            id: "b_group_types",
            label: "小組類型",
            en: "Group Types",
            i18nKey: "cm.sb.b.types",
            href: href("modules/fellowship/small-groups.html"),
            children: [
              {
                id: "b_youth",
                label: "青年團契",
                en: "Youth Fellowship",
                i18nKey: "cm.sb.b.youth",
                href: href("modules/development/youth-ministry-dev.html", { crm: "b_youth" }),
              },
              {
                id: "b_small_list",
                label: "小組列表",
                en: "Small Groups List",
                href: href("modules/fellowship/small-groups.html"),
              },
              {
                id: "b_circles",
                label: "團契圈子",
                en: "Fellowship Circles",
                href: href("modules/fellowship/fellowship-circles.html"),
              },
            ],
          },
          {
            id: "b_events",
            label: "活動通告",
            en: "Events",
            i18nKey: "cm.sb.b.events",
            href: href("modules/fellowship/pastoral-events.html"),
          },
          {
            id: "b_train",
            label: "门徒訓練",
            en: "Discipleship",
            i18nKey: "cm.sb.b.train",
            href: href("modules/fellowship/pastoral-training.html"),
          },
          {
            id: "b_visit",
            label: "探訪關懷",
            en: "Visitation & Care",
            i18nKey: "cm.sb.visit",
            href: href("modules/support/visitation_index.html"),
            dataAttrs: 'data-m2-step="visitation" data-m3-entry="visitation"',
            children: [
              {
                id: "b_visit_desk",
                label: "探訪工作桌 0-02",
                en: "Visitation Desk",
                href: href("modules/support/visitation_index.html"),
              },
              {
                id: "b_visit_f",
                label: "團契探訪",
                en: "Fellowship Visitation",
                href: href("modules/fellowship/visitation.html"),
              },
              {
                id: "b_strategy",
                label: "牧養戰略桌",
                en: "Pastoral Strategy",
                i18nKey: "cm.sb.b.strategy",
                href: href("modules/fellowship/pastoral-strategy.html"),
              },
            ],
          },
        ],
      },
    ],
  };

  global.CmBMenu = {
    ZONE_BUILD: ZONE_BUILD,
    CRM: CRM,
    ZONE: ZONE,
    href: href,
    pastTab: pastTab,
  };
})(typeof window !== "undefined" ? window : this);
