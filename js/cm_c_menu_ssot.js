/**

 * CM C 区侧栏 SSOT — 4 层 IA（併入 education journey · focus=c 折叠）

 */

(function (global) {

  "use strict";



  var ZONE_BUILD = "20260811e";

  var CRM = "c_education";



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



  function eduTab(tab) {

    return href("modules/education/education-integrated.html#tab-" + tab, { role: "teacher" });

  }



  var ZONE = {

    id: "c",

    label: "C 聖經門訓",

    en: "Bible & Discipleship",

    i18nKey: "cm.sb.sec.c",

    theme: "cm",

    focusZone: "c",

    sbGroup: "併",

    headHref: href("_landing/education.html"),

    primary: [

      {

        id: "c_ss_primary",

        label: "主日學工作桌",

        en: "SS Desk · 5 Tab",

        i18nKey: "cm.sb.ss.desk",

        href: eduTab("guide"),

        primary: true,

      },

    ],

    categories: [

      {

        id: "c_ss_daily",

        num: "1",

        summary: "主日學日常",

        en: "Sunday School Daily",

        open: true,

        items: [

          {

            id: "c_ss_guide",

            label: "主日學工作桌",

            en: "SS Desk · Guide",

            i18nKey: "cm.sb.ss.desk",

            href: eduTab("guide"),

            children: [

              { id: "c_tab_guide", label: "導覽", en: "Guide", href: eduTab("guide") },

              { id: "c_tab_roster", label: "學籍", en: "Roster", href: eduTab("roster") },

              { id: "c_tab_attend", label: "出席", en: "Attendance", href: eduTab("attendance") },

              { id: "c_tab_disc", label: "門訓", en: "Discipleship", href: eduTab("discipleship") },

              { id: "c_tab_teach", label: "備課", en: "Teaching", href: eduTab("teaching") },

            ],

          },

          {

            id: "c_attend_warn",

            label: "出席 · 缺席預警",

            en: "Attendance · Absence",

            i18nKey: "cm.c.attend.primary",

            href: eduTab("attendance"),

          },

        ],

      },

      {

        id: "c_school_align",

        num: "2",

        summary: "C ↔ 學校學籍",

        en: "School roster alignment",

        open: true,

        items: [

          {

            id: "c_school_dash",

            label: "全校學籍 · 名冊對齊",

            en: "School roster",

            href: "../school_management/dashboard.html",

            nav: "module",

            moduleSidebar: "school_management/sidebar.html",

            moduleContent: "school_management/dashboard.html",

            extraClass: "sb-kit-item--ext",

          },

          {

            id: "c_absence_visit",

            label: "缺席→探訪佇列",

            en: "Absence → Visitation",

            href: href("modules/support/visitation_index.html", { crm: "c_education_absence" }),

          },

        ],

      },

      {

        id: "c_cross_module",

        num: "3",

        summary: "跨模組",

        en: "Cross-module",

        open: false,

        items: [

          {

            id: "c_bible_study",

            label: "聖經教材 · 多語研讀",

            en: "Bible Study",

            href: "../bible_study/comprehensive_exegesis_reader.html?book=創世記&chapter=1&lang=CN",

            nav: "module",

            moduleSidebar: "bible_study/sidebar.html",

            moduleContent:

              "bible_study/comprehensive_exegesis_reader.html?book=創世記&chapter=1&lang=CN",

            extraClass: "sb-kit-item--ext",

          },

          {

            id: "c_disciple",

            label: "門徒培訓管理",

            en: "Discipleship Training",

            i18nKey: "cm.sb.disciple",

            href: href("modules/development/discipleship-training.html"),

          },

          {

            id: "c_ai_lab",

            label: "AI 輔助 · Prompt",

            en: "AI Lab",

            href: "../ai_tools/tools/bible_prompt_generator.html",

            nav: "module",

            moduleSidebar: "ai_tools/sidebar_lab.html",

            moduleContent: "ai_tools/tools/bible_prompt_generator.html",

            extraClass: "sb-kit-item--ext",

          },

        ],

      },

      {

        id: "c_crm_return",

        num: "4",

        summary: "行政回航",

        en: "Back to CRM",

        open: false,

        items: [

          {

            id: "c_crm_hub",

            label: "回 CRM 旅程側欄",

            en: "CRM Journey sidebar",

            href: href("guide_crm_journey_hub.html?tab=journey", { role: "teacher", crm: "c_sidebar" }),

            nav: "module",

            moduleSidebar: "church_ministry/sidebar_crm_journey.html",

            moduleContent:

              "church_ministry/guide_crm_journey_hub.html?tab=journey&role=teacher",

            extraClass: "sb-kit-item--crm",

          },

        ],

      },

    ],

  };



  global.CmCMenu = {

    ZONE_BUILD: ZONE_BUILD,

    CRM: CRM,

    ZONE: ZONE,

    href: href,

    eduTab: eduTab,

  };

})(typeof window !== "undefined" ? window : this);


