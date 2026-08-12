/**
 * B100 · 模块顶栏2 / Hub landing / focus 侧栏 SSOT（study · school · ai）
 */
(function (global) {
  "use strict";

  var NAV_BUILD = "20260812data";

  var SIDEBAR_FORBIDDEN = [
    /(^|[/?#])bible_study\/sidebar\.html/i,
    /(^|[/?#])school_management\/sidebar\.html/i,
    /(^|[/?#])ai_tools\/sidebar_lab\.html/i,
    /(^|[/?#])ai_tools\/sidebar\.html/i,
    /(^|[/?#])smart_ministry\/sidebar\.html/i,
  ];

  var MODULE_SHELL_FORBIDDEN = [
    /(^|[/?#])bible_study\/index\.html/i,
    /(^|[/?#])school_management\/index\.html/i,
    /(^|[/?#])ai_tools\/ai_lab\.html/i,
  ];

  var MODULES = {
    study: {
      modeId: "study",
      labelZh: "聖經研讀",
      labelEn: "Bible Study",
      sidebar: "bible_study/sidebar.html",
      defaultContent: "bible_study/_landing/home.html",
      zones: [
        {
          id: "home",
          focus: "",
          labelShort: "路線",
          labelZh: "路線圖",
          labelEn: "Route map",
          content: "bible_study/_landing/home.html",
        },
        {
          id: "track",
          focus: "track",
          labelShort: "跑道",
          labelZh: "聖經跑道",
          labelEn: "Bible Track",
          content: "bible_app/shell/index.html",
        },
        {
          id: "tools",
          focus: "tools",
          labelShort: "工具",
          labelZh: "核心捷徑",
          labelEn: "Tools",
          content: "bible_study/_landing/tools.html",
          desk: true,
        },
        {
          id: "versions",
          focus: "versions",
          labelShort: "版本",
          labelZh: "聖經版本",
          labelEn: "Versions",
          content: "bible_study/parallel_mode_v3.html",
        },
        {
          id: "commentary",
          focus: "commentary",
          labelShort: "釋經",
          labelZh: "釋經參讀",
          labelEn: "Commentary",
          content:
            "bible_study/comprehensive_exegesis_reader.html?book=創世記&chapter=1",
          desk: true,
        },
        {
          id: "geo",
          focus: "geo",
          labelShort: "地理",
          labelZh: "地理歷史",
          labelEn: "Geo. Hist.",
          content: "bible_study/_landing/geography_history.html",
        },
      ],
    },
    school: {
      modeId: "school",
      labelZh: "學校管理",
      labelEn: "School Management",
      sidebar: "school_management/sidebar.html",
      defaultContent: "school_management/_landing/home.html",
      zones: [
        {
          id: "home",
          focus: "",
          labelShort: "路線",
          labelZh: "路線圖",
          labelEn: "Route map",
          content: "school_management/_landing/home.html",
        },
        {
          id: "workbench",
          focus: "workbench",
          labelShort: "工作台",
          labelZh: "教務工作台",
          labelEn: "Workbench",
          content: "school_management/manage/academic_integrated.html",
          desk: true,
        },
        {
          id: "enrollment",
          focus: "enrollment",
          labelShort: "A",
          labelZh: "A 招生入學",
          labelEn: "Enrollment",
          content: "school_management/enrollment_brochure.html",
          topBar: false,
        },
        {
          id: "academic",
          focus: "academic",
          labelShort: "B",
          labelZh: "B 學籍教務",
          labelEn: "Academic",
          content: "school_management/manage/students_tabs.html",
          desk: true,
          topBar: false,
        },
        {
          id: "graduation",
          focus: "graduation",
          labelShort: "結業",
          labelZh: "結業登記",
          labelEn: "Graduation",
          content: "school_management/course_completion.html",
          desk: true,
          appendChurchId: true,
        },
      ],
    },
    ai: {
      modeId: "ai",
      labelZh: "AI 輔助",
      labelEn: "AI Lab",
      sidebar: "ai_tools/sidebar_lab.html",
      defaultContent: "ai_tools/_landing/home.html",
      zones: [
        {
          id: "home",
          focus: "",
          labelShort: "路線",
          labelZh: "路線圖",
          labelEn: "Route map",
          content: "ai_tools/_landing/home.html",
        },
        {
          id: "workbench",
          focus: "workbench",
          labelShort: "工作台",
          labelZh: "備課創作",
          labelEn: "Workbench",
          content:
            "ai_tools/tools/ai_workbench_integrated.html?crm_from=hub_workbench#tab-prompt",
          desk: true,
        },
        {
          id: "ministry",
          focus: "ministry",
          labelShort: "事工",
          labelZh: "事工應用",
          labelEn: "Ministry AI",
          content: "ai_tools/pages/crm_automation_console.html",
        },
        {
          id: "plan",
          focus: "plan",
          labelShort: "規劃",
          labelZh: "規劃落地",
          labelEn: "Plan",
          content: "church_planning/index_plan.html",
        },
      ],
    },
  };

  function moduleById(modeId) {
    return MODULES[String(modeId || "").toLowerCase()] || null;
  }

  function zoneById(modeId, zoneId) {
    var mod = moduleById(modeId);
    if (!mod || !mod.zones) return null;
    zoneId = String(zoneId || "").toLowerCase();
    for (var i = 0; i < mod.zones.length; i++) {
      if (mod.zones[i].id === zoneId) return mod.zones[i];
    }
    return null;
  }

  function sidebarUrlForZone(modeId, zoneId) {
    var mod = moduleById(modeId);
    if (!mod) return "";
    var base = mod.sidebar.split("?")[0];
    var zone = zoneById(modeId, zoneId);
    if (!zone || !zone.focus) return base;
    return base + "?focus=" + encodeURIComponent(zone.focus);
  }

  function isForbiddenContentUrl(url) {
    if (!url) return false;
    var u = String(url).replace(/\\/g, "/");
    for (var i = 0; i < SIDEBAR_FORBIDDEN.length; i++) {
      if (SIDEBAR_FORBIDDEN[i].test(u)) return true;
    }
    return false;
  }

  function isModuleShellUrl(url) {
    if (!url) return false;
    var u = String(url).replace(/\\/g, "/");
    for (var j = 0; j < MODULE_SHELL_FORBIDDEN.length; j++) {
      if (MODULE_SHELL_FORBIDDEN[j].test(u)) return true;
    }
    return false;
  }

  function recoverModuleShellInContent(url) {
    if (!isModuleShellUrl(url)) return null;
    var u = String(url).replace(/\\/g, "/");
    if (/bible_study\/index/i.test(u)) return shellPairForFocus("study", "home");
    if (/school_management\/index/i.test(u)) return shellPairForFocus("school", "home");
    if (/ai_tools\/ai_lab\.html/i.test(u)) return shellPairForFocus("ai", "workbench");
    return null;
  }

  function sanitizeContentUrl(url, fallback) {
    if (isForbiddenContentUrl(url)) {
      var sbPair = recoverSidebarInContent(url);
      if (sbPair && sbPair.contentUrl) return sbPair.contentUrl;
    }
    if (isModuleShellUrl(url)) {
      var shPair = recoverModuleShellInContent(url);
      if (shPair && shPair.contentUrl) return shPair.contentUrl;
    }
    return url;
  }

  function recoverSidebarInContent(url) {
    if (!isForbiddenContentUrl(url)) return null;
    var u = String(url).replace(/\\/g, "/");
    if (/bible_study\/sidebar/i.test(u)) return shellPairForFocus("study", "home");
    if (/school_management\/sidebar/i.test(u)) return shellPairForFocus("school", "home");
    if (/ai_tools\/sidebar/i.test(u)) return shellPairForFocus("ai", "home");
    if (/smart_ministry\/sidebar/i.test(u)) return shellPairForFocus("ai", "ministry");
    return null;
  }

  function shellPairForFocus(modeId, zoneId) {
    var mod = moduleById(modeId);
    var zone = zoneById(modeId, zoneId || "home");
    if (!mod || !zone) return null;
    if (zone.moduleNav) {
      return {
        sidebarUrl: zone.moduleSidebar || mod.sidebar,
        contentUrl: zone.moduleContent || zone.content,
      };
    }
    return {
      sidebarUrl: sidebarUrlForZone(modeId, zoneId || "home"),
      contentUrl: zone.content,
    };
  }

  function sitePair(modeId, zoneId) {
    return shellPairForFocus(modeId, zoneId);
  }

  function detectModeFromPath(path) {
    path = String(path || "").replace(/\\/g, "/").toLowerCase();
    if (path.indexOf("bible_study/") >= 0) return "study";
    if (path.indexOf("school_management/") >= 0) return "school";
    if (path.indexOf("ai_tools/") >= 0 || path.indexOf("smart_ministry/") >= 0) {
      return "ai";
    }
    return "";
  }

  function detectZoneFromPath(modeId, path) {
    var mod = moduleById(modeId);
    if (!mod) return "home";
    path = String(path || "").replace(/\\/g, "/").toLowerCase();
    var found = "home";
    if (modeId === "ai") {
      if (/smart_ministry|church_ministry|languages\/(index_ch|ad)|church_planning|crm_automation|outreach/i.test(path)) {
        if (/church_planning/i.test(path)) return "plan";
        return "ministry";
      }
      if (/guide_reading|bible_prompt|workbench_integrated|lesson_plan|quiz|creative|text_to|media|homework|agent|ai_lab_landing|ai_qa/i.test(path)) {
        return "workbench";
      }
    }
    mod.zones.forEach(function (z) {
      if (z.id === "home") return;
      var key = z.content.split("?")[0].split("#")[0].toLowerCase();
      if (path.indexOf(key) >= 0) found = z.id;
    });
    if (/data_sources\.html/i.test(path)) found = "tools";
    if (/parallel_mode_v3/i.test(path)) found = "versions";
    if (/academic_integrated/i.test(path)) found = "workbench";
    if (/enrollment_brochure|portal\//i.test(path)) found = "enrollment";
    if (/manage\/students|manage\/courses|manage\/classes|manage\/teachers/i.test(path)) {
      found = "academic";
    }
    if (/course_completion/i.test(path)) found = "graduation";
    return found;
  }

  function secondaryNavItemFromZone(modeId, zone) {
    var mod = moduleById(modeId);
    if (!mod || !zone) return null;
    var item = {
      labelZh: zone.labelZh,
      labelShort: zone.labelShort,
      labelEn: zone.labelEn || "",
      focusZone: zone.id,
      path: zone.content,
      sidebar: sidebarUrlForZone(modeId, zone.id),
    };
    if (zone.appendChurchId) item.appendChurchId = true;
    return item;
  }

  function secondaryNavForMode(modeId, opts) {
    opts = opts || {};
    var mod = moduleById(modeId);
    if (!mod || !mod.zones) return [];
    var out = [];
    if (opts.includeSiteHome) {
      out.push({ action: "home", labelZh: "🏠 全站", labelEn: "Site Home" });
    }
    mod.zones.forEach(function (z) {
      if (z.topBar === false) return;
      var it = secondaryNavItemFromZone(modeId, z);
      if (it) out.push(it);
    });
    return out;
  }

  function resolveNavItemPair(modeId, item) {
    if (!item) return null;
    var zoneId = item.focusZone || item.zoneId || "";
    if (!zoneId && item.path) {
      zoneId = detectZoneFromPath(modeId, item.path);
    }
    if (item.moduleNav && item.focusZone) {
      zoneId = item.focusZone;
    }
    return shellPairForFocus(modeId, zoneId || "home");
  }

  global.B100ModuleNavSsot = {
    NAV_BUILD: NAV_BUILD,
    MODULES: MODULES,
    moduleById: moduleById,
    zoneById: zoneById,
    sidebarUrlForZone: sidebarUrlForZone,
    shellPairForFocus: shellPairForFocus,
    sitePair: sitePair,
    resolveNavItemPair: resolveNavItemPair,
    isForbiddenContentUrl: isForbiddenContentUrl,
    isModuleShellUrl: isModuleShellUrl,
    sanitizeContentUrl: sanitizeContentUrl,
    recoverSidebarInContent: recoverSidebarInContent,
    recoverModuleShellInContent: recoverModuleShellInContent,
    detectModeFromPath: detectModeFromPath,
    detectZoneFromPath: detectZoneFromPath,
    secondaryNavItemFromZone: secondaryNavItemFromZone,
    secondaryNavForMode: secondaryNavForMode,
  };
})(typeof window !== "undefined" ? window : this);
