/**
 * CM D 区侧栏 SSOT — 4 层 IA（無示範層）
 */
(function (global) {
  "use strict";

  var ZONE_BUILD = "20260805e";
  var CRM = "d_outreach";

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

  function outTab(tab) {
    return href("modules/expansion/outreach-integrated.html#tab-" + tab, { role: "staff", step: 2 });
  }

  var ZONE = {
    id: "d",
    label: "D 外展差傳",
    en: "Outreach & Mission",
    i18nKey: "cm.sb.sec.d",
    theme: "cm",
    focusZone: "d",
    sbGroup: "併",
    headHref: href("_landing/outreach.html"),
    primary: [
      {
        id: "d_needs",
        label: "需求登記",
        en: "Needs Intake",
        i18nKey: "cm.d.needs.primary",
        href: outTab("needs"),
        primary: true,
        dataAttrs: 'data-m6-d-chain="1"',
      },
    ],
    categories: [
      {
        id: "d_outreach_min",
        num: "1",
        summary: "外展差傳事工",
        en: "Outreach & Mission Ministry",
        open: true,
        items: [
          {
            id: "d_desk",
            label: "外展工作桌",
            en: "Outreach Desk · 3 Tab",
            i18nKey: "cm.sb.outreach.desk",
            href: outTab("needs"),
            dataAttrs: 'data-m6-d-chain="1"',
            children: [
              { id: "d_tab_needs", label: "需求登記", en: "Needs", href: outTab("needs") },
              { id: "d_tab_follow", label: "跟進狀態", en: "Follow-up", href: outTab("followup") },
              { id: "d_tab_comm", label: "社區調研", en: "Community", href: outTab("community") },
            ],
          },
          {
            id: "d_chain",
            label: "需求真鏈（單頁）",
            en: "Needs chain (single page)",
            i18nKey: "cm.sb.outreach",
            href: href("modules/expansion/outreach-strategy.html", { role: "staff", step: 2 }),
            dataAttrs: 'data-m6-d-chain="1"',
          },
        ],
      },
    ],
  };

  global.CmDMenu = {
    ZONE_BUILD: ZONE_BUILD,
    CRM: CRM,
    ZONE: ZONE,
    href: href,
    outTab: outTab,
  };
})(typeof window !== "undefined" ? window : this);
