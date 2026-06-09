/**
 * CRM 旅程 · 側欄與互聯 SSOT
 * 原則：自動化為誰、做什麼、小白敢點 — 單一資料源，Hub 頁籤整併另波次。
 */
(function (global) {
  "use strict";

  var HUB_JOURNEY = "guide_crm_journey_hub.html?tab=journey";

  var ROLES = [
    {
      id: "member",
      emoji: "📖",
      label: "會友／學生",
      forWhom: "剛來教會、想認識恩賜與服事方向的人",
      autoDoes: "AI 只預填註冊與測驗草稿，不自動派工",
      hubUrl: HUB_JOURNEY + "&role=member"
    },
    {
      id: "teacher",
      emoji: "👩‍🏫",
      label: "老師／組長",
      forWhom: "備課、點名、週報與探訪跟進壓力大的帶領者",
      autoDoes: "Copilot 整理週報與備課草稿，請您審核後使用",
      hubUrl: HUB_JOURNEY + "&role=teacher"
    },
    {
      id: "staff",
      emoji: "🙋",
      label: "事工同工",
      forWhom: "排班、探訪、名冊與跨部門媒合的第一線同工",
      autoDoes: "預填空檔與探訪待辦，邀請與派工仍由人決定",
      hubUrl: HUB_JOURNEY + "&role=staff"
    },
    {
      id: "leader",
      emoji: "⛪",
      label: "牧者／長執",
      forWhom: "要看全局戰情、評估與決策，不處理日常打卡",
      autoDoes: "彙整待辦與評估雷達，決策權在您",
      hubUrl: "guide_crm_journey_hub.html?tab=vision&role=leader"
    }
  ];

  /** A–E 各區 primary（波 2 先 A，其餘區保留一個主工作桌） */
  var AE_ZONES = [
    {
      id: "a",
      emoji: "🎼",
      label: "A · 敬拜及音樂",
      focus: "a",
      forWhom: "敬拜統籌、團隊負責人",
      landing: {
        path: "_landing/worship.html",
        label: "敬拜花园 · 选导游",
        blurb: "服事旅程公园导览"
      },
      primary: {
        path: "modules/worship/worship-integrated.html?view=leader",
        label: "部长 · 主日策划",
        role: "leader",
        step: 0
      }
    },
    {
      id: "b",
      emoji: "👥",
      label: "B · 牧養及小組",
      focus: "b",
      forWhom: "小組長、探訪同工",
      landing: {
        path: "_landing/fellowship.html",
        label: "牧養團契中心 · 導覽",
        blurb: "小組與探訪總覽"
      },
      primary: {
        path: "modules/support/visitation_index.html",
        label: "探訪工作桌",
        role: "staff",
        step: 5
      }
    },
    {
      id: "c",
      emoji: "📚",
      label: "C · 教育培訓",
      focus: "c",
      forWhom: "主日學／門訓帶領",
      landing: {
        path: "_landing/education.html",
        label: "教育培訓中心 · 導覽",
        blurb: "主日學與裝備總覽"
      },
      primary: {
        path: "modules/education/education-integrated.html",
        label: "主日學工作桌",
        role: "teacher",
        step: 0
      }
    },
    {
      id: "d",
      emoji: "🌍",
      label: "D · 外展差傳",
      focus: "d",
      forWhom: "外展與宣教策劃",
      landing: {
        path: "modules/expansion/community-assessment.html",
        label: "外展導覽 · 社區調研",
        blurb: "區域評估與起點"
      },
      primary: {
        path: "modules/expansion/outreach-strategy.html",
        label: "外展策略工作桌",
        role: "staff",
        step: 2
      }
    },
    {
      id: "e",
      emoji: "⚙️",
      label: "E · 行政支援",
      focus: "admin",
      forWhom: "會友、財務、志工與行政",
      landing: {
        path: "ministry_core.html",
        label: "事工總覽 · 導覽",
        blurb: "E 區模組索引"
      },
      primary: {
        path: "dashboard.html",
        label: "事工戰情儀表板",
        role: "leader",
        step: 1,
        pattern: "P-WORKBENCH"
      }
    }
  ];

  /** 5F 規劃首頁（CRM 側欄頂部「回教會規劃」直鏈；捷徑列表不含此項以免重複） */
  var PLANNING_INDEX = "index_plan.html";

  /** 5F 規劃捷徑（不含 index_plan，與「回教會規劃」去重） */
  var PLANNING_SHORTCUTS = [
    {
      path: "assessment-os-hub.html",
      label: "🏥 健康診斷中心",
      blurb: "問卷與評估 · 依教會大小選工具"
    },
    {
      path: "dashboard.html",
      label: "📊 規劃戰情儀表板",
      blurb: "唯讀 KPI 總覽"
    },
    {
      path: "cta-os-war-room.html",
      label: "🏛️ CTA 健康雷達戰情室",
      blurb: "六維雷達與跨工具風險"
    }
  ];

  var UTILS = [
    {
      id: "trial30",
      label: "⏱️ 30 分鐘試玩路線",
      path: "guide_crm_trial_30min.html",
      blurb: "小白第一次來建議走這條"
    },
    {
      id: "automation",
      label: "🤖 營運自動化（只預填）",
      path: "../ai_tools/pages/crm_automation_console.html",
      blurb: "口述需求 → 表單草稿",
      shell: true,
      sidebarUrl: "../ai_tools/sidebar_lab.html",
      contentUrl: "../ai_tools/pages/crm_automation_console.html"
    }
  ];

  var BY_ROLE = {};
  ROLES.forEach(function (r) {
    BY_ROLE[r.id] = r;
  });

  function toolHref(path, role, step, from) {
    path = String(path || "");
    if (!path || path.indexOf("javascript:") === 0 || path.indexOf("#") === 0) return path;
    if (/^https?:\/\//i.test(path)) return path;
    var sep = path.indexOf("?") >= 0 ? "&" : "?";
    var q = "crm_from=" + encodeURIComponent(from || "sidebar");
    if (role) q += "&role=" + encodeURIComponent(role);
    if (step != null && step !== "") q += "&step=" + encodeURIComponent(String(step));
    return path + sep + q;
  }

  /** 5F 規劃頁 · CRM 側欄點擊只開右欄 iframe（左欄保持 CRM） */
  function planningHref(path, from) {
    path = String(path || "")
      .replace(/^\/+/, "")
      .replace(/^church_planning\//, "");
    return "church_planning/" + toolHref(path, null, null, from || "sidebar");
  }

  function normPathKey(p) {
    return String(p || "")
      .replace(/\\/g, "/")
      .split("?")[0]
      .split("#")[0]
      .replace(/^\.\//, "")
      .toLowerCase();
  }

  function layoutHref(focus) {
    return (
      "#" +
      " onclick=\"return bible100ShellNav(event,{sidebarUrl:'church_ministry/sidebar_church_layout_v1.html" +
      (focus ? "?focus=" + focus : "") +
      "',contentUrl:'church_ministry/" +
      (focus === "a"
        ? "_landing/worship.html"
        : focus === "b"
          ? "modules/support/visitation_index.html"
          : "dashboard.html") +
      "'});\""
    );
  }

  /** 波 2c · A–E 子頁 SSOT（與 layout_v1 側欄對齊） */
  var AE_SUBPAGES = [
    { zone: "a", group: "🌳 服事旅程·公园", path: "_landing/worship.html", label: "敬拜花园导览", blurb: "选导游·路线", primary: true, role: "member", step: 0 },
    { zone: "a", group: "🌳 服事旅程·公园", path: "modules/worship/worship-together.html", label: "会众筑坛", blurb: "只读预备", role: "member", step: 1 },
    { zone: "a", group: "🌳 服事旅程·公园", path: "modules/worship/worship-integrated.html?view=volunteer", label: "同工·今日祭坛", blurb: "我的服事", role: "staff", step: 2 },
    { zone: "a", group: "🌳 服事旅程·公园", path: "modules/worship/worship-integrated.html?view=leader", label: "部长·主日策划", blurb: "一键策划", role: "leader", step: 0 },
    { zone: "a", group: "敬拜管理", path: "modules/worship/pulpit-ministry.html", label: "講壇事奉", blurb: "講員排期" },
    { zone: "a", group: "敬拜管理", path: "modules/worship/sermon-notes-admin.html", label: "講道筆記模板", blurb: "預備存檔" },
    { zone: "a", group: "敬拜管理", path: "modules/worship/hospitality.html", label: "招待事奉", blurb: "現場接待" },
    { zone: "a", group: "音樂與詩歌", path: "modules/worship/worship-integrated.html", label: "敬拜工作台", blurb: "部长全功能", role: "leader", step: 0 },
    { zone: "a", group: "音樂與詩歌", path: "modules/worship/worship-team-management.html", label: "敬拜團隊", blurb: "團隊行政" },
    { zone: "a", group: "音樂與詩歌", path: "modules/worship/choir-team.html", label: "詩班團隊", blurb: "聲部練習" },
    { zone: "a", group: "音樂與詩歌", path: "modules/worship/instrument-team.html", label: "器樂團隊", blurb: "樂手編配" },
    { zone: "a", group: "音樂與詩歌", path: "modules/worship/congregational-songs.html", label: "會眾詩歌", blurb: "主日選歌" },
    { zone: "a", group: "音樂與詩歌", path: "modules/worship/sheet-music.html", label: "樂譜管理", blurb: "樂譜資產" },
    { zone: "a", group: "音樂與詩歌", path: "modules/worship/song-library.html", label: "詩歌庫", blurb: "全庫索引" },
    { zone: "a", group: "音樂與詩歌", path: "modules/worship/worship-management.html", label: "崇拜禮儀", blurb: "場次流程" },
    { zone: "a", group: "音樂與詩歌", path: "modules/worship/worship-reports.html", label: "崇拜報表", blurb: "統計圖表" },
    { zone: "a", group: "音樂與詩歌", path: "modules/worship/attendance-management.html", label: "崇拜出席", blurb: "點名出席" },
    { zone: "a", group: "影音製作", path: "modules/media/audio-team.html", label: "音響團隊", blurb: "音控現場" },
    { zone: "a", group: "影音製作", path: "modules/media/live-streaming.html", label: "視頻直播", blurb: "直播排程" },

    { zone: "b", group: "牧養探訪", path: "modules/support/visitation_index.html", label: "探訪工作桌", blurb: "主入口", primary: true, role: "staff", step: 5 },
    { zone: "b", group: "牧養探訪", path: "modules/development/youth-ministry-dev.html", label: "青年事工發展", blurb: "牧者／領袖" },

    { zone: "c", group: "教育培訓", path: "modules/education/education-integrated.html", label: "主日學工作桌", blurb: "主入口", primary: true, role: "teacher", step: 0 },
    { zone: "c", group: "教育培訓", path: "modules/development/development-plan.html", label: "教育發展計劃", blurb: "文件" },

    { zone: "d", group: "社區與宣教", path: "modules/expansion/outreach-strategy.html", label: "外展策略地圖", blurb: "主入口", primary: true, role: "staff", step: 2 },
    { zone: "d", group: "社區與宣教", path: "modules/expansion/community-assessment.html", label: "社區需求調研", blurb: "區域評估" },
    { zone: "d", group: "社區與宣教", path: "modules/expansion/mission-opportunities.html", label: "宣教機會", blurb: "機會探索" },
    { zone: "d", group: "社區與宣教", path: "modules/expansion/new-ministry-planning.html", label: "新事工規劃", blurb: "啟動計劃" },
    { zone: "d", group: "植堂與分堂", path: "modules/expansion/church-planting.html", label: "植堂計劃", blurb: "植堂管理" },
    { zone: "d", group: "植堂與分堂", path: "modules/expansion/branch-management.html", label: "分堂管理", blurb: "分堂協調" },
    { zone: "d", group: "植堂與分堂", path: "modules/expansion/mission-expansion.html", label: "宣教拓展", blurb: "拓展追蹤" },
    { zone: "d", group: "創新與新媒體", path: "modules/expansion/cross-cultural.html", label: "跨文化事工", blurb: "文化橋樑" },
    { zone: "d", group: "創新與新媒體", path: "modules/innovation/new-media.html", label: "新媒體事工", blurb: "線上觸及" },
    { zone: "d", group: "創新與新媒體", path: "modules/innovation/innovation-projects.html", label: "創新項目", blurb: "試驗專案" },
    { zone: "d", group: "創新與新媒體", path: "modules/innovation/technology-integration.html", label: "科技應用", blurb: "工具整合" },

    { zone: "e", group: "戰情與志工", path: "dashboard.html", label: "事工戰情儀表板", blurb: "主入口", primary: true, role: "leader", step: 1 },
    { zone: "e", group: "戰情與志工", path: "modules/volunteer/volunteer-integrated.html", label: "志工事工", blurb: "志工管理" },
    { zone: "e", group: "戰情與志工", path: "congregation/index.html", label: "會眾入口", blurb: "社區學苑" },
    { zone: "e", group: "會員與財政", path: "people/people_list.html", label: "人員總覽", blurb: "名冊索引" },
    { zone: "e", group: "會員與財政", path: "modules/members/member-integrated.html", label: "會友事工", blurb: "會友主檔" },
    { zone: "e", group: "會員與財政", path: "modules/finance/finance-integrated.html", label: "財務事工", blurb: "奉獻帳目" },
    { zone: "e", group: "資產與社群", path: "modules/administration/financial-management.html", label: "財務管理", blurb: "行政財務" },
    { zone: "e", group: "資產與社群", path: "modules/equipment/equipment-management.html", label: "設備管理", blurb: "資產清冊" },
    { zone: "e", group: "資產與社群", path: "modules/library/library-management.html", label: "圖書管理", blurb: "館藏" },
    { zone: "e", group: "資產與社群", path: "community-overview.html", label: "社群與捐款人", blurb: "關係總覽" },
    { zone: "e", group: "研究與統計", path: "modules/research/index.html", label: "研究統計索引", blurb: "KPI 橋接" },
    { zone: "e", group: "研究與統計", path: "modules/research/member-statistics.html", label: "會眾統計", blurb: "人口分析" },
    { zone: "e", group: "研究與統計", path: "modules/research/ministry-performance.html", label: "事工成效", blurb: "績效" },
    { zone: "e", group: "研究與統計", path: "modules/research/growth-trends.html", label: "增長趨勢", blurb: "趨勢圖" },
    { zone: "e", group: "研究與統計", path: "modules/research/engagement-analysis.html", label: "參與度分析", blurb: "參與熱圖" },
    { zone: "e", group: "媒體與科技", path: "modules/media/video-production.html", label: "影片製作", blurb: "影音產出" },
    { zone: "e", group: "媒體與科技", path: "modules/tech/ai-assistant.html", label: "AI 助手", blurb: "教會內 AI" },
    { zone: "e", group: "媒體與科技", path: "modules/tech/smart-recommendation.html", label: "數位事工", blurb: "推薦引擎" },
    { zone: "e", group: "媒體與科技", path: "modules/innovation/digital-transformation.html", label: "數位化轉型", blurb: "轉型路線" },
    { zone: "e", group: "工具與支援", path: "modules/support/smart-reminders.html", label: "智能提醒", blurb: "待辦提醒" },
    { zone: "e", group: "工具與支援", path: "modules/support/workflow.html", label: "Workflow 跟進", blurb: "流程" },
    { zone: "e", group: "工具與支援", path: "theme-settings.html", label: "Church Center 主題", blurb: "外觀" },
    { zone: "e", group: "工具與支援", path: "custom-page-editor.html", label: "自訂頁面", blurb: "會眾頁" },
    { zone: "e", group: "行政管理", path: "vision_and_plan.html", label: "願景與藍圖", blurb: "方向" },
    { zone: "e", group: "行政管理", path: "roadmap-overview.html", label: "路線圖總覽", blurb: "全模組" },
    { zone: "e", group: "行政管理", path: "ministry_core.html", label: "事工總覽", blurb: "核心" },
    { zone: "e", group: "行政管理", path: "ai-and-compliance.html", label: "AI 決策與合規", blurb: "規劃中" }
  ];

  var subpagesByZone = { a: [], b: [], c: [], d: [], e: [] };
  AE_SUBPAGES.forEach(function (p) {
    if (subpagesByZone[p.zone]) subpagesByZone[p.zone].push(p);
  });

  /** 依路徑查 registry 建議 role/step（須在 AE_SUBPAGES 定義之後） */
  var PATH_LOOKUP = {};
  AE_SUBPAGES.forEach(function (pg) {
    var key = normPathKey(pg.path);
    if (key) PATH_LOOKUP[key] = { role: pg.role, step: pg.step, zone: pg.zone };
  });
  AE_ZONES.forEach(function (z) {
    if (!z.primary || !z.primary.path) return;
    var key = normPathKey(z.primary.path);
    if (key && !PATH_LOOKUP[key]) {
      PATH_LOOKUP[key] = { role: z.primary.role, step: z.primary.step, zone: z.id };
    }
  });

  function contextForPath(path) {
    return PATH_LOOKUP[normPathKey(path)] || null;
  }

  global.CrmJourneyRegistry = {
    hubJourney: HUB_JOURNEY,
    roles: ROLES,
    aeZones: AE_ZONES,
    planningIndex: PLANNING_INDEX,
    planningShortcuts: PLANNING_SHORTCUTS,
    aeSubpages: AE_SUBPAGES,
    subpagesByZone: subpagesByZone,
    utils: UTILS,
    byRole: BY_ROLE,
    toolHref: toolHref,
    planningHref: planningHref,
    contextForPath: contextForPath,
    normPathKey: normPathKey,
    layoutFocusParam: function (focus) {
      return focus ? "?focus=" + encodeURIComponent(focus) : "";
    }
  };
})(typeof window !== "undefined" ? window : this);
