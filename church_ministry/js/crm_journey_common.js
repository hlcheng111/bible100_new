/**
 * CRM Journey Landing v4 — 一頁三頁籤 + 左窄右寬（人求事 / 事求人）。
 */
(function (global) {
  "use strict";

  var ROLE_KEY = "crm_journey_role_v1";
  var STEP_KEY = "crm_journey_step_v1";
  var TAB_KEY = "crm_journey_tab_v1";
  var DEPT_KEY = "crm_journey_dept_v1";

  var ROLES = {
    member: { id: "member", emoji: "📖", pickZh: "我是會友／學生", shortZh: "會友／學生" },
    teacher: { id: "teacher", emoji: "👩‍🏫", pickZh: "我是老師／小組長", shortZh: "老師／組長" },
    staff: { id: "staff", emoji: "🙋", pickZh: "我是事工主責／同工", shortZh: "事工同工" },
    leader: { id: "leader", emoji: "⛪", pickZh: "我是牧者／長執", shortZh: "牧者／長執" }
  };

  var JOURNEY_ROLES = ["member", "teacher", "staff"];
  var ROLE_STEP_LIMITS = { member: 5, teacher: 7, staff: 8, leader: 6 };

  function buildVersionSuffix() {
    try {
      if (global.bible100CacheBust) return "";
      if (global.BIBLE100_BUILD_VERSION) return (global.location.search.indexOf("v=") >= 0 ? "" : "");
    } catch (e0) {}
    return "";
  }

  function appendHubContextToUrl(href, role, step) {
    if (!href || href.indexOf("javascript:") === 0 || href.indexOf("#") === 0) return href;
    if (/^https?:\/\//i.test(href)) return href;
    var sep = href.indexOf("?") >= 0 ? "&" : "?";
    var q = "crm_from=hub";
    if (role) q += "&role=" + encodeURIComponent(role);
    if (step != null && step !== "") q += "&step=" + encodeURIComponent(String(step));
    var out = href + sep + q;
    if (global.bible100CacheBust) return global.bible100CacheBust(out);
    return out + (out.indexOf("v=") >= 0 ? "" : sep + "v=" + Date.now());
  }

  function automationConsoleHref(from, pain) {
    var base = "../ai_tools/pages/crm_automation_console.html";
    var q = [];
    if (from) q.push("from=" + encodeURIComponent(from));
    if (pain) q.push("pain=" + encodeURIComponent(pain));
    q.push("crm_from=hub");
    var out = base + (q.length ? "?" + q.join("&") : "");
    if (global.bible100CacheBust) return global.bible100CacheBust(out);
    return out;
  }

  var CAPABILITY_PILLS = {
    trial: { text: "✓ 試用", cls: "crm-cap-pill--trial" },
    demo: { text: "Demo", cls: "crm-cap-pill--demo" },
    "ai-sim": { text: "AI 模擬", cls: "crm-cap-pill--ai" },
    ai: { text: "AI 草稿", cls: "crm-cap-pill--ai" }
  };

  function capabilityForHref(href) {
    if (!href) return null;
    var h = String(href).replace(/\\/g, "/").toLowerCase();
    if (h.indexOf("crm_automation") >= 0) return "ai-sim";
    if (
      h.indexOf("volunteer_shift") >= 0 ||
      h.indexOf("member-integrated") >= 0 ||
      h.indexOf("visitation_index") >= 0 ||
      h.indexOf("visitation_followup") >= 0 ||
      h.indexOf("load_crm") >= 0 ||
      h.indexOf("finance-integrated") >= 0 ||
      (h.indexOf("dashboard.html") >= 0 && h.indexOf("church_ministry") >= 0) ||
      h.indexOf("church_planning/") >= 0 ||
      h.indexOf("assessment-os") >= 0 ||
      h.indexOf("cta-os") >= 0
    ) return "trial";
    if (h.indexOf("copilot") >= 0 || h.indexOf("group-report") >= 0) return "ai";
    if (
      h.indexOf("spiritual_gifts") >= 0 ||
      h.indexOf("talent_ministry") >= 0 ||
      h.indexOf("/_landing/") >= 0 ||
      h.indexOf("roadmap-overview") >= 0
    ) return "demo";
    return null;
  }

  function capabilityPillHtml(href) {
    var cap = capabilityForHref(href);
    if (!cap || !CAPABILITY_PILLS[cap]) return "";
    var p = CAPABILITY_PILLS[cap];
    return ' <span class="crm-cap-pill ' + p.cls + '" title="功能成熟度">' + esc(p.text) + "</span>";
  }

  var PAIN_ACCORDION = [
    {
      id: "admin",
      emoji: "📅",
      titleZh: "行政排班，追到心累？",
      painZh: "每週追班表、排班、點名，訊息散落在 LINE，越追越焦慮。",
      cureZh: "A1 義工排班：系統依空檔預填，您核對即可；邀請稿只供複製，不會自動發送。",
      linkZh: "開啟 A1 排班",
      href: "tools/volunteer_shift/index.html",
      gate: "staff"
    },
    {
      id: "people",
      emoji: "👥",
      titleZh: "找不到人、關懷斷線？",
      painZh: "新人來了不知誰來跟進；探訪記錄在各人手機，換同工就斷線。",
      cureZh: "探訪工作桌 + A2 跟進：白話待辦清單，貼文字就能整理（不含敏感全文公開）。",
      linkZh: "探訪工作桌",
      href: "modules/support/visitation_index.html",
      gate: "staff"
    },
    {
      id: "gifts",
      emoji: "✨",
      titleZh: "恩賜與事奉，對不上號？",
      painZh: "弟兄姊妹想服事，卻不知道適合哪個崗位；部門缺人只能靠印象邀請。",
      cureZh: "恩賜測驗 + CTV 事奉配對：先認識恩賜，再由牧者／主責人工邀請（建議≠派工）。",
      linkZh: "恩賜測驗",
      href: "../smart_ministry/spiritual_gifts.html"
    }
  ];

  var MEMBER_INVITE_DRAFT =
    "【服事關懷邀請｜草稿，請小組長／牧者審核後再轉傳】\n\n" +
    "親愛的弟兄姊妹：感謝你願意為主服事。根據你在恩賜測驗中的方向，" +
    "教會可能有適合你的崗位。請與你的小組長或牧者聊聊，再一起決定下一步。\n\n" +
    "（此為系統示範文字，請勿視為正式派工。）";

  var ENTRY_MAP = {
    learning: {
      role: "member",
      bannerZh: "你從教材／四寶來 — 建議先完成會友註冊與恩賜測驗，再到「事奉媒合中心」尋找方向。"
    },
    school: {
      role: "teacher",
      bannerZh: "你從學校模組來 — 建議走「老師／小組長」減壓路線。"
    },
    bible_study: {
      role: "member",
      bannerZh: "你從聖經研讀來 — 恩賜測驗可幫你連到合適事工。"
    }
  };

  /** Canonical journey data (alias JOURNEY_BY_ROLE for tests/docs). */
  var JOURNEY_MAPS = {
    member: {
      roleNameZh: "會友／學生",
      roleNameEn: "Member / Student",
      hitl: null,
      steps: [
        {
          id: 0,
          labelZh: "就緒",
          labelEn: "Ready",
          contextZh: "剛來到教會新環境",
          contextEn: "New to church",
          descZh: "口述或貼上簡歷，AI 只預填基本資料，免去手寫繁瑣表單。",
          descEn: "Voice or paste text — AI prefill only, you review before save.",
          toolNameZh: "會友註冊",
          toolNameEn: "Register",
          url: "../smart_ministry/registration.html"
        },
        {
          id: 1,
          labelZh: "認識人",
          labelEn: "Discover",
          contextZh: "探索神給我的命定",
          contextEn: "Discover your calling",
          descZh: "5 分鐘恩賜測驗 — 結果需與牧者對談，非自動派工；是「信徒找工」的靈魂起點。",
          descEn: "Gifts survey — discuss with leaders; not auto-assigned.",
          toolNameZh: "恩賜測驗",
          toolNameEn: "Gifts survey",
          url: "../smart_ministry/spiritual_gifts.html"
        },
        {
          id: 2,
          labelZh: "配對",
          labelEn: "Match",
          contextZh: "希望參與團契與事奉",
          contextEn: "Ready to serve",
          descZh: "依恩賜結果，在下方「事奉媒合中心」看部門缺工與 AI 提示。",
          descEn: "Use the matchmaker below for dept fit & open roles.",
          toolNameZh: "開啟事奉媒合中心",
          toolNameEn: "Open matchmaker",
          switchToMatchmakerTab: true
        },
        {
          id: 3,
          labelZh: "執行",
          labelEn: "Join in",
          contextZh: "進入穩定的裝備與聚會",
          contextEn: "Join a group",
          descZh: "查看小組與團契門戶，向小組長表達參與意願。",
          descEn: "Small groups portal — connect with your cell.",
          toolNameZh: "團契小組",
          toolNameEn: "Small groups",
          url: "modules/fellowship/small-groups-integrated.html"
        },
        {
          id: 4,
          labelZh: "戰情",
          labelEn: "Overview",
          contextZh: "看懂自己的成長軌跡",
          contextEn: "See your progress",
          descZh: "個人進度多在教材與小組；可從聖經研讀儀表板回顧。",
          descEn: "Progress in learning & cell — Bible study dashboard.",
          toolNameZh: "聖經研讀",
          toolNameEn: "Bible study",
          url: "../bible_study/dashboard.html"
        },
        {
          id: 5,
          labelZh: "決策",
          labelEn: "Next step",
          contextZh: "從學習走向更深裝備",
          contextEn: "Go deeper",
          descZh: "進入主日學／學校裝備系統，與恩賜、事奉方向銜接。",
          descEn: "School module for deeper equipping.",
          toolNameZh: "學校管理",
          toolNameEn: "School",
          url: "../school_management/dashboard.html"
        }
      ]
    },
    teacher: {
      roleNameZh: "班級老師／小組長",
      roleNameEn: "Teacher / facilitator",
      hitl: null,
      steps: [
        {
          id: 0,
          labelZh: "週四",
          labelEn: "Thursday",
          contextZh: "週四備課前：對名冊、重複登打",
          contextEn: "Weekly class prep stress",
          descZh: "一鍵查看班級學員名冊，減少重複登打。",
          descEn: "Class roster — less duplicate data entry.",
          toolNameZh: "主日學簡表",
          toolNameEn: "SS hub",
          url: "modules/education/education-integrated.html",
          gate: "staff"
        },
        {
          id: 1,
          labelZh: "週五",
          labelEn: "Friday",
          contextZh: "週五聚會前：備課時間不夠",
          contextEn: "New students in class",
          descZh: "AI 依年齡與背景產生破冰與教材草稿 — 請人工審核後使用。",
          descEn: "AI Lab drafts — you review before use.",
          toolNameZh: "AI Lab 智能備課",
          toolNameEn: "AI Lab prep",
          url: "../ai_tools/ai_lab_landing.html"
        },
        {
          id: 2,
          labelZh: "週六",
          labelEn: "Saturday",
          contextZh: "週六預備：要把學生分到合適小組",
          contextEn: "Group students well",
          descZh: "參考恩賜數據建議分組 — 邀請仍由牧者／組長人工發出。",
          descEn: "Gift-aware grouping — invites stay human-led.",
          toolNameZh: "團契小組",
          toolNameEn: "Small groups",
          url: "modules/fellowship/small-groups-integrated.html",
          gate: "staff"
        },
        {
          id: 3,
          labelZh: "週日",
          labelEn: "Sunday",
          contextZh: "週日聚會後：寫週報沒時間",
          contextEn: "No time for reports",
          descZh: "口述或貼上筆記，Copilot 整理週報草稿。",
          descEn: "Group report Copilot — draft only.",
          toolNameZh: "小組報告 Copilot",
          toolNameEn: "Group Copilot",
          url: "modules/fellowship/group-report-copilot.html",
          gate: "staff"
        },
        {
          id: 4,
          labelZh: "週一",
          labelEn: "Monday care",
          contextZh: "週一跟進：誰很久沒來了？",
          contextEn: "Who has been absent?",
          descZh: "探訪工作桌 — 貼文字整理關懷紀錄，下一棒不斷線。",
          descEn: "Visitation desk — paste notes, keep care chain.",
          toolNameZh: "探訪工作跟進台",
          toolNameEn: "Visitation desk",
          url: "modules/support/visitation_index.html",
          gate: "staff"
        },
        {
          id: 5,
          labelZh: "週二",
          labelEn: "Tuesday stats",
          contextZh: "週二檢視：班級出席與關懷警示",
          contextEn: "Class attendance KPIs",
          descZh: "圖表化出席與 KPI 白話摘要。",
          descEn: "School dashboard — plain-language KPIs.",
          toolNameZh: "學校管理統計",
          toolNameEn: "School stats",
          url: "../school_management/dashboard.html",
          gate: "staff"
        },
        {
          id: 6,
          labelZh: "週三",
          labelEn: "Wednesday plan",
          contextZh: "週三規劃：優化下一季教學與牧養",
          contextEn: "Next quarter pastoral plan",
          descZh: "依班級痛點產生牧養策略草稿 — 決策權在您。",
          descEn: "Pastoral draft — decisions stay with you.",
          toolNameZh: "AI 牧養草稿",
          toolNameEn: "Pastoral draft",
          url: "modules/support/ai-pastoral-draft.html",
          gate: "staff"
        }
      ]
    },
    staff: {
      roleNameZh: "事工主責／同工",
      roleNameEn: "Ministry staff",
      hitl: null,
      steps: [
        {
          id: 0,
          labelZh: "就緒",
          labelEn: "Ready",
          contextZh: "活動辦不完，排班排到心累",
          contextEn: "Scheduling exhaustion",
          descZh: "系統預填有空時段，您核對即可 — 不會自動發訊息。",
          descEn: "Shift prefill — you confirm; no auto messages.",
          toolNameZh: "A1 義工排班",
          toolNameEn: "A1 Shifts",
          url: "tools/volunteer_shift/index.html",
          gate: "staff"
        },
        {
          id: 1,
          labelZh: "認識人",
          labelEn: "Discover",
          contextZh: "事工缺人，不知道誰能幫忙",
          contextEn: "Need workers",
          descZh: "從全教會恩賜庫篩選 — 建議≠派工，請人工邀請。",
          descEn: "CTV matching — suggest only.",
          toolNameZh: "CTV 事奉配對",
          toolNameEn: "CTV matching",
          url: "../smart_ministry/talent_ministry_matching.html",
          gate: "staff"
        },
        {
          id: 2,
          labelZh: "媒合",
          labelEn: "Match board",
          contextZh: "排班有缺口、找不到合適同工",
          contextEn: "Scheduling gaps — need workers",
          descZh: "開啟事奉媒合中心，看部門急缺與 CTV 建議方向。",
          descEn: "Open matchmaker — urgent roles & CTV hints.",
          toolNameZh: "事奉媒合中心",
          toolNameEn: "Matchmaker hub",
          switchToMatchmakerTab: true
        },
        {
          id: 3,
          labelZh: "權責",
          labelEn: "Align",
          contextZh: "跨部門分工混亂、權責不清",
          contextEn: "Unclear RACI",
          descZh: "用 RACI 定義主責／配合／通知，減少互推。",
          descEn: "RACI matrix for clarity.",
          toolNameZh: "RACI 權責劃分",
          toolNameEn: "RACI",
          url: "../church_planning/planning/raci-reflection.html",
          gate: "staff"
        },
        {
          id: 4,
          labelZh: "名冊",
          labelEn: "Roster",
          contextZh: "不知道誰有空、聯絡方式散落各處",
          contextEn: "Scattered member contacts",
          descZh: "會友通訊錄整合頁 — 一頁看清基本資料與事奉標記。",
          descEn: "Member hub — contacts & ministry tags.",
          toolNameZh: "會友通訊錄",
          toolNameEn: "Member directory",
          url: "modules/members/member-integrated.html",
          gate: "staff"
        },
        {
          id: 5,
          labelZh: "執行",
          labelEn: "Action",
          contextZh: "關懷記錄散落在個人 LINE",
          contextEn: "Scattered care notes",
          descZh: "統一探訪工作桌，貼文字即可整理紀錄。",
          descEn: "Visitation desk — paste & organize.",
          toolNameZh: "探訪工作桌",
          toolNameEn: "Visitation desk",
          url: "modules/support/visitation_index.html",
          gate: "staff"
        },
        {
          id: 6,
          labelZh: "戰情",
          labelEn: "Dashboard",
          contextZh: "執行到一半，看不清成效",
          contextEn: "Need progress data",
          descZh: "A2 探訪跟進數據 — 白話待辦，不含敏感全文。",
          descEn: "A2 follow-up — todos without full notes.",
          toolNameZh: "A2 探訪跟進",
          toolNameEn: "A2 Follow-up",
          url: "tools/visitation_followup/index.html",
          gate: "staff"
        },
        {
          id: 7,
          labelZh: "決策",
          labelEn: "Automate",
          contextZh: "年度事工流於形式",
          contextEn: "Process bottlenecks",
          descZh: "口述需求 → 營運自動化只預填表單。",
          descEn: "CRM automation — prefill only.",
          toolNameZh: "營運自動化",
          toolNameEn: "CRM automation",
          url: automationConsoleHref("staff", "automate"),
          gate: "staff"
        }
      ]
    },
    leader: {
      roleNameZh: "牧者／長執",
      roleNameEn: "Pastor / elder",
      hitl: {
        zh: "系統幫你整理待辦與預填，決策與牧養仍在你。",
        en: "We organize todos and prefill — pastoral decisions stay with you."
      },
      steps: [
        {
          id: 0,
          labelZh: "就緒",
          labelEn: "Ready",
          contextZh: "先看見成果，才有信心推行",
          contextEn: "See value fast",
          descZh: "先載入試用種子資料，再看戰情儀表板；這是上雲試用的第一步。",
          descEn: "Load demo seed, then open dashboard (trial first step).",
          toolNameZh: "載入試用資料（種子）",
          toolNameEn: "Load seed",
          url: "load_central_member_seed.html"
        },
        {
          id: 1,
          labelZh: "認識人",
          labelEn: "Discover",
          contextZh: "先看戰情，再談治理與評估",
          contextEn: "Start with dashboard",
          descZh: "查看 CRM 就緒度與四類工作桌待辦（demo 可先達到 ≥70% 的示範效果）。",
          descEn: "Open dashboard to see maturity and work desks.",
          toolNameZh: "開啟戰情儀表板",
          toolNameEn: "Dashboard",
          url: "dashboard.html",
          gate: "staff"
        },
        {
          id: 2,
          labelZh: "配對",
          labelEn: "Govern",
          contextZh: "大型決策缺乏權責共識",
          contextEn: "Governance gaps",
          descZh: "RACI 治理體系 — 長執與教牧團隊同心有序。",
          descEn: "RACI for board & pastoral team.",
          toolNameZh: "RACI 治理體系",
          toolNameEn: "RACI",
          url: "../church_planning/planning/raci-reflection.html"
        },
        {
          id: 3,
          labelZh: "評估",
          labelEn: "Assess",
          contextZh: "看不清教會成熟度與下一步重點",
          contextEn: "Church maturity unclear",
          descZh: "教會評估 OS — 白話問卷與雷達圖，輔助長執決策。",
          descEn: "Assessment OS — plain surveys & radar.",
          toolNameZh: "教會評估 OS",
          toolNameEn: "Assessment OS",
          url: "../church_planning/assessment-os-hub.html",
          gate: "staff"
        },
        {
          id: 4,
          labelZh: "戰情",
          labelEn: "War room",
          contextZh: "開會抓不到重點",
          contextEn: "Too many documents",
          descZh: "CTA 戰情室 — 白話跨工具風險與分析。",
          descEn: "CTA war room — plain cross-tool view.",
          toolNameZh: "CTA 戰情室",
          toolNameEn: "CTA war room",
          url: "../church_planning/cta-os-war-room.html"
        },
        {
          id: 5,
          labelZh: "決策",
          labelEn: "Vision",
          contextZh: "制定下一階段異象",
          contextEn: "Next season vision",
          descZh: "將異象化為可落地規劃與自動化架構。",
          descEn: "Planning index — vision to action.",
          toolNameZh: "教會規劃索引",
          toolNameEn: "Planning index",
          url: "../church_planning/index_plan.html"
        }
      ]
    }
  };

  var JOURNEY_BY_ROLE = JOURNEY_MAPS;

  var MINISTRY_DEPTS = [
    { key: "worship", zh: "敬拜及音樂", en: "Worship", emoji: "🎼", href: "_landing/worship.html" },
    { key: "pastoral", zh: "牧養及小組", en: "Pastoral & groups", emoji: "👥", href: "_landing/fellowship.html" },
    { key: "kids", zh: "兒童及門訓", en: "Kids & discipleship", emoji: "📚", href: "_landing/education.html" },
    { key: "outreach", zh: "外展及差傳", en: "Outreach", emoji: "🌍", href: "_landing/expansion.html" },
    { key: "admin", zh: "F. 行政支援", en: "Admin", emoji: "⚙️", href: "dashboard.html" },
    { key: "planning", zh: "教會規劃 OS", en: "Planning OS", emoji: "🧭", href: "../church_planning/index_plan.html" }
  ];

  var TOOL_GROUPS = [
    {
      zh: "問卷與認識人",
      en: "Surveys & people",
      items: [
        { zh: "會友註冊", href: "../smart_ministry/registration.html" },
        { zh: "恩賜測驗", href: "../smart_ministry/spiritual_gifts.html" },
        { zh: "教會評估 OS", href: "../church_planning/assessment-os-hub.html", gate: "staff" },
        { zh: "會友通訊錄", href: "modules/members/member-integrated.html", gate: "staff" }
      ]
    },
    {
      zh: "計劃與決策",
      en: "Planning",
      items: [
        { zh: "教會規劃索引", href: "../church_planning/index_plan.html" },
        { zh: "RACI 權責", href: "../church_planning/planning/raci-reflection.html" },
        { zh: "CTA 戰情室", href: "../church_planning/cta-os-war-room.html" },
        { zh: "路線圖總覽", href: "roadmap-overview.html", gate: "staff" }
      ]
    },
    {
      zh: "事工執行（CRM 工具）",
      en: "Ministry tools",
      items: [
        { zh: "A1 義工排班", href: "tools/volunteer_shift/index.html", gate: "staff" },
        { zh: "A2 探訪跟進", href: "tools/visitation_followup/index.html", gate: "staff" },
        { zh: "探訪工作桌", href: "modules/support/visitation_index.html", gate: "staff" },
        { zh: "CTV 事奉配對", href: "../smart_ministry/talent_ministry_matching.html", gate: "staff" },
        { zh: "A3 財務對帳（可選）", href: "tools/finance_reconciliation/index.html", gate: "leader" }
      ]
    },
    {
      zh: "AI 與教會自動化",
      en: "AI & automation",
      items: [
        { zh: "營運自動化（只預填）", href: "../ai_tools/pages/crm_automation_console.html", gate: "staff" },
        { zh: "AI Lab", href: "../ai_tools/ai_lab_landing.html" },
        { zh: "小組報告 Copilot", href: "modules/fellowship/group-report-copilot.html", gate: "staff" },
        { zh: "AI 牧養草稿", href: "modules/support/ai-pastoral-draft.html", gate: "staff" }
      ]
    },
    {
      zh: "學校與主日學",
      en: "School & SS",
      items: [
        { zh: "學校管理", href: "../school_management/dashboard.html", gate: "staff" },
        { zh: "主日學簡表", href: "modules/education/education-integrated.html", gate: "staff" },
        { zh: "團契小組", href: "modules/fellowship/small-groups-integrated.html", gate: "staff" }
      ]
    }
  ];

  /** Tab 1：教會 CRM 八大原義 → 現有功能頁入口（相對路徑，自 hub 根目錄） */
  var CRM_EIGHT_PRINCIPLES = [
    {
      id: "identity",
      step: 1,
      emoji: "🪪",
      shortZh: "身份",
      titleZh: "身份管理",
      descZh: "Person 主檔 + member_id：名冊、屬靈狀態、群組、堂點、角色；AI 可輔助判斷慕道／初信／流失風險（建議≠決策）。",
      links: [
        { zh: "📋 會友註冊", href: "../smart_ministry/registration.html" },
        { zh: "👥 會友通訊錄", href: "modules/members/member-integrated.html", gate: "staff" },
        { zh: "✨ 恩賜測驗", href: "../smart_ministry/spiritual_gifts.html" }
      ]
    },
    {
      id: "relations",
      step: 2,
      emoji: "🤝",
      shortZh: "關係",
      titleZh: "關係追蹤",
      descZh: "Touchpoints 事件流：探訪、通話、陪談寫回時間軸；AI 整理摘要與標籤（只預填，同工核對後儲存）。",
      links: [
        { zh: "💬 探訪工作桌", href: "modules/support/visitation_index.html", gate: "staff" },
        { zh: "📞 A2 探訪跟進", href: "tools/visitation_followup/index.html", gate: "staff" },
        { zh: "🕐 會友 360 時間軸", href: "modules/members/member-360-timeline.html", gate: "staff" },
        { zh: "✍️ AI 牧養草稿", href: "modules/support/ai-pastoral-draft.html", gate: "staff" }
      ]
    },
    {
      id: "groups",
      step: 3,
      emoji: "👥",
      shortZh: "分組",
      titleZh: "分組管理",
      descZh: "小組長只看本組、區牧看區、牧者看全教會；多堂點可分而治之、統而合之。",
      links: [
        { zh: "🏠 小組事工整合", href: "modules/fellowship/small-groups-integrated.html", gate: "staff" },
        { zh: "🤝 團契管理", href: "modules/fellowship/fellowship-management.html", gate: "staff" }
      ]
    },
    {
      id: "process",
      step: 4,
      emoji: "🛤️",
      shortZh: "流程",
      titleZh: "流程管理",
      descZh: "Milestone：受洗、課程、加入小組、服事、帶領；系統提示下一步（規則 + AI 建議，人工確認）。",
      links: [
        { zh: "📈 屬靈階段漏斗", href: "modules/research/spiritual-stage-funnel.html", gate: "staff" },
        { zh: "📋 教會評估 OS", href: "../church_planning/assessment-os-hub.html", gate: "staff" },
        { zh: "⚙️ 工作流程", href: "modules/support/workflow.html", gate: "staff" }
      ]
    },
    {
      id: "tasks",
      step: 5,
      emoji: "✅",
      shortZh: "任務",
      titleZh: "任務與跟進管理",
      descZh: "新人 SLA、流失預警、危機事件 → 待辦任務；人類完成並簡短回報，AI 整理入檔。",
      links: [
        { zh: "📊 事工儀表板待辦", href: "dashboard.html", gate: "staff" },
        { zh: "🛠️ 營運自動化控制台", href: "../ai_tools/pages/crm_automation_console.html", gate: "staff" },
        { zh: "📅 A1 義工排班", href: "tools/volunteer_shift/index.html", gate: "staff" }
      ]
    },
    {
      id: "growth",
      step: 6,
      emoji: "🌱",
      shortZh: "成長",
      titleZh: "成長追蹤",
      descZh: "AI 成長分析 + 里程碑：停滯、突破、階段建議；領袖做屬靈分辨。",
      links: [
        { zh: "🎓 主日學整合", href: "modules/education/education-integrated.html", gate: "staff" },
        { zh: "🔗 CTV 事奉配對", href: "../smart_ministry/talent_ministry_matching.html", gate: "staff" },
        { zh: "🙋 我的事奉旅程", href: "#", dataSwitchTab: "journey" }
      ]
    },
    {
      id: "health",
      step: 7,
      emoji: "🩺",
      shortZh: "健康",
      titleZh: "健康分析",
      descZh: "小組／堂點健康、流失率、成長率、危機與同工負荷；AI 週／月摘要（儀表板合併）。",
      links: [
        { zh: "🔬 研究模組 KPI", href: "modules/research/index.html", gate: "staff" },
        { zh: "📉 趨勢分析", href: "modules/research/trend-analysis.html", gate: "staff" },
        { zh: "❤️ 教會健康規劃", href: "../church_planning/Church_Health_NCD_planning.html", gate: "staff" },
        { zh: "🏛️ CTA 戰情室", href: "../church_planning/cta-os-war-room.html", gate: "staff" }
      ]
    },
    {
      id: "mission",
      step: 8,
      emoji: "🌍",
      shortZh: "外展",
      titleZh: "使命與外展管理",
      descZh: "外展名單、活動後跟進、再訪與植堂；長期追蹤與 AI 提醒（不自動發送）。",
      links: [
        { zh: "🌱 會眾關懷模式", href: "modules/development/congregation-care.html", gate: "staff" },
        { zh: "🤝 探訪關懷系統", href: "modules/support/visitation.html", gate: "staff" },
        { zh: "🌐 多語種翻譯助手", href: "../help/translate.html" }
      ]
    }
  ];

  var CRM_AI_ROLES = [
    {
      id: "pastoral",
      emoji: "🕊️",
      titleZh: "Pastoral AI（牧養 AI）",
      descZh: "任務分派建議、關懷草稿、危機預警提示、整理紀錄。",
      links: [
        { zh: "AI 牧養草稿", href: "modules/support/ai-pastoral-draft.html", gate: "staff" },
        { zh: "探訪工作桌 Copilot", href: "modules/support/visitation_index.html", gate: "staff" }
      ]
    },
    {
      id: "smallgroup",
      emoji: "🏠",
      titleZh: "Small Group AI（小組 AI）",
      descZh: "小組健康分析、組長提醒、流失預警、成長建議。",
      links: [
        { zh: "小組報告 Copilot", href: "modules/fellowship/group-report-copilot.html", gate: "staff" },
        { zh: "小組事工整合", href: "modules/fellowship/small-groups-integrated.html", gate: "staff" }
      ]
    },
    {
      id: "discipleship",
      emoji: "📖",
      titleZh: "Discipleship AI（門徒 AI）",
      descZh: "成長路徑、里程碑、階段判斷與下一步建議。",
      links: [
        { zh: "恩賜測驗", href: "../smart_ministry/spiritual_gifts.html" },
        { zh: "屬靈階段漏斗", href: "modules/research/spiritual-stage-funnel.html", gate: "staff" }
      ]
    },
    {
      id: "admin",
      emoji: "⚙️",
      titleZh: "Admin AI（行政 AI）",
      descZh: "自動整理紀錄、產生報表草稿、排班預填。",
      links: [
        { zh: "營運自動化控制台", href: "../ai_tools/pages/crm_automation_console.html", gate: "staff" },
        { zh: "A1 義工排班", href: "tools/volunteer_shift/index.html", gate: "staff" }
      ]
    },
    {
      id: "outreach",
      emoji: "🌍",
      titleZh: "Outreach AI（外展 AI）",
      descZh: "活動後跟進、名單分類、跟進方式建議。",
      links: [
        { zh: "會眾關懷模式", href: "modules/development/congregation-care.html", gate: "staff" },
        { zh: "探訪關懷系統", href: "modules/support/visitation.html", gate: "staff" }
      ]
    },
    {
      id: "crisis",
      emoji: "🆘",
      titleZh: "Crisis AI（危機 AI）",
      descZh: "危機事件分類、處理建議、分派提示（儀表板 + 探訪優先，敏感調查僅牧者）。",
      links: [
        { zh: "事工儀表板待辦", href: "dashboard.html", gate: "staff" },
        { zh: "探訪工作桌", href: "modules/support/visitation_index.html", gate: "staff" }
      ]
    }
  ];

  /** Tab 2：人求事 · 五節點生命週期（依身分）— 文案集中於此，UI 由 renderStageAccordions 驅動 */
  var BELIEVER_JOURNEY_BY_ROLE = {
    member: [
      {
        id: "gifts",
        step: 1,
        emoji: "✨",
        shortZh: "恩賜",
        titleZh: "恩賜性格",
        descZh: "您不是「待填補的名額」，而是神所造的獨特器皿。約 5 分鐘的恩賜測驗，只幫您說出心裡的火種在哪裡；結果要與小組長或牧者一起禱告、對話，絕不會變成自動派工單。",
        links: [
          { zh: "🧬 恩賜測驗", href: "../smart_ministry/spiritual_gifts.html" },
          { zh: "📋 會友註冊", href: "../smart_ministry/registration.html" }
        ]
      },
      {
        id: "training",
        step: 2,
        emoji: "📚",
        shortZh: "培訓",
        titleZh: "門徒培訓",
        descZh: "成長不是趕進度，而是有人陪您走。依小組與教會節奏，連到主日學、學校與聖經研讀；系統只幫您找得到課程門路，不評分、不催促，把節奏留給您與帶領者的生命對話。",
        links: [
          { zh: "🎓 學校管理", href: "../school_management/dashboard.html" },
          { zh: "📖 主日學整合", href: "modules/education/education-integrated.html", gate: "staff" },
          { zh: "📜 聖經研讀", href: "../bible_study/dashboard.html" }
        ]
      },
      {
        id: "match",
        step: 3,
        emoji: "🤝",
        shortZh: "媒合",
        titleZh: "智能媒合",
        descZh: "這裡沒有強塞的事工，只有懂您的陪伴。AI 會依恩賜性格，悄悄為您引薦最能發揮熱情的服事方向；去或留，完全由您與牧長在禱告中決定——系統絕不自動指派，也不會代發任何訊息。",
        links: [
          { zh: "💼 開啟事奉媒合中心", dataSwitchTab: "matchmaker" },
          { zh: "🔗 CTV 配對說明", href: "../smart_ministry/talent_ministry_matching.html", gate: "staff" }
        ]
      },
      {
        id: "shift",
        step: 4,
        emoji: "📅",
        shortZh: "服事",
        titleZh: "參與服事",
        descZh: "服事是回應愛，不是補洞。先與小組長喝杯茶、聊聊「我想試試」；若教會已與您確認崗位，同工只在 A1 為您預填時段，您核對即可——不必在群組裡被追問「這週可不可以」。",
        links: [
          { zh: "🏠 團契小組", href: "modules/fellowship/small-groups-integrated.html" },
          { zh: "📅 A1 排班（同工）", href: "tools/volunteer_shift/index.html", gate: "staff" }
        ]
      },
      {
        id: "feedback",
        step: 5,
        emoji: "🌱",
        shortZh: "回饋",
        titleZh: "靈命回饋",
        descZh: "偶爾停下來，看見神在您身上的作為：研讀、聚會、禱告中的亮點與软弱。記錄只是幫您記得恩典；真正溫暖您的，仍是主日後那句「最近好嗎」——科技只當僕人，不當替身。",
        links: [
          { zh: "📊 研讀進度", href: "../bible_study/dashboard.html" },
          { zh: "📝 小組週報 Copilot", href: "modules/fellowship/group-report-copilot.html", gate: "staff" }
        ]
      }
    ],
    teacher: [
      {
        id: "ready",
        step: 1,
        emoji: "📋",
        shortZh: "就緒",
        titleZh: "班級就緒",
        descZh: "每週開班前，最怕名單對不起來、家長問了答不出。一鍵開啟班級名冊，減少重複登打，把省下來的十分鐘還給禱告與預備教材。",
        links: [{ zh: "主日學簡表", href: "modules/education/education-integrated.html", gate: "staff" }]
      },
      {
        id: "discover",
        step: 2,
        emoji: "👋",
        shortZh: "認識",
        titleZh: "認識學員",
        descZh: "面對新臉孔或不同年齡層，難免緊張。AI Lab 可依班級背景產生破冰話題與教材草稿——請您像牧者一樣審閱、刪改後再用，讓科技補助準備，不取代您與學生真實的關心。",
        links: [{ zh: "AI Lab 備課", href: "../ai_tools/ai_lab_landing.html" }]
      },
      {
        id: "match",
        step: 3,
        emoji: "🧩",
        shortZh: "分組",
        titleZh: "分組媒合",
        descZh: "分組不只是湊人數，而是幫助彼此被牧養。可參考恩賜與性格方向作建議；實際分組與邀請仍由您／牧者決定，避免讓數據變成標籤貼在弟兄姊妹身上。",
        links: [{ zh: "團契小組", href: "modules/fellowship/small-groups-integrated.html", gate: "staff" }]
      },
      {
        id: "report",
        step: 4,
        emoji: "📝",
        shortZh: "週報",
        titleZh: "週報整理",
        descZh: "聚會後腦中很多感動，卻沒力氣寫週報。口述或貼上凌亂筆記，Copilot 幫您整理成結構草稿；送出前請再讀一遍，保留您的語氣與牧養溫度。",
        links: [{ zh: "小組報告 Copilot", href: "modules/fellowship/group-report-copilot.html", gate: "staff" }]
      },
      {
        id: "review",
        step: 5,
        emoji: "📊",
        shortZh: "回顧",
        titleZh: "學期回顧",
        descZh: "學期末，用白話圖表看見出席與關懷重點，而不是一堆看不懂的數字。回顧是為了下一季更會牧養，不是為了排名；您仍是班級的靈魂人物，儀表板只是您的副手。",
        links: [{ zh: "學校管理統計", href: "../school_management/dashboard.html", gate: "staff" }]
      }
    ],
    staff: [
      {
        id: "shift",
        step: 1,
        emoji: "📅",
        shortZh: "排班",
        titleZh: "排班就緒",
        descZh: "告別在群組裡追「這週誰可以」。A1 依同工登記的空檔預填初版班表，您核對後再發佈；系統不會自動傳 LINE，避免尷尬與誤會，也讓弟兄姊妹保留說「不」的空間。",
        links: [{ zh: "A1 義工排班", href: "tools/volunteer_shift/index.html", gate: "staff" }]
      },
      {
        id: "talent",
        step: 2,
        emoji: "👥",
        shortZh: "人才",
        titleZh: "人才庫",
        descZh: "急缺時，印象邀請往往錯過最合適的人。CTV 從恩賜測驗與服事意願中提出「可能適合」名單——請您以禱告與牧養知悉做最終邀請，建議永遠不等於派工。",
        links: [{ zh: "CTV 事奉配對", href: "../smart_ministry/talent_ministry_matching.html", gate: "staff" }]
      },
      {
        id: "match",
        step: 3,
        emoji: "💼",
        shortZh: "媒合",
        titleZh: "部門媒合",
        descZh: "把散落的缺工表收斂到一個看板：現正急缺、AI 溫馨提示、可複製的邀請稿。點「缺 N」即可跳到邀請區，讓招募變成有溫度的牧養行動，而不是冷冰冰的數字。",
        links: [{ zh: "事奉媒合中心", dataSwitchTab: "matchmaker" }]
      },
      {
        id: "care",
        step: 4,
        emoji: "💬",
        shortZh: "探訪",
        titleZh: "探訪執行",
        descZh: "探訪後最累的是寫紀錄。在工作桌口述或貼上關懷碎屑，AI 幫您整理摘要；您親自核對後才寫入，保障隱私，也讓下一棒同工接得上。",
        links: [{ zh: "探訪工作桌", href: "modules/support/visitation_index.html", gate: "staff" }]
      },
      {
        id: "desk",
        step: 5,
        emoji: "📊",
        shortZh: "戰情",
        titleZh: "戰情決策",
        descZh: "儀表板把「該先處理誰」整理成三類待辦：未跟進新人、風險關懷、可晉升階段。您專注做決定與行動，其餘整理交給僕人系統——但每個名字背後仍是活生生的人。",
        links: [{ zh: "事工儀表板", href: "dashboard.html", gate: "staff" }]
      }
    ],
    leader: [
      {
        id: "vision",
        step: 1,
        emoji: "🎯",
        shortZh: "願景",
        titleZh: "願景對齊",
        descZh: "牧會不是天天救火。先與長執、同工在教會規劃索引對齊年度異象與重點，讓後面的數據、排班與配對都服事於同一幅圖畫，而不是各自為政。",
        links: [{ zh: "教會規劃索引", href: "../church_planning/index_plan.html", gate: "staff" }]
      },
      {
        id: "health",
        step: 2,
        emoji: "❤️",
        shortZh: "NCD",
        titleZh: "健康盤點（NCD 視角）",
        descZh: "結合 NCD 八大健康特質，在 CTA 戰情室與健康規劃看板看見全教會體質——哪裡興旺、哪裡邊際、哪裡需要禱告介入。數據為禱告與決策服務；不發冰冷簡訊，而是幫您看見「恩賜導向事奉」該落在哪裡。",
        links: [
          { zh: "CTA 戰情室", href: "../church_planning/cta-os-war-room.html", gate: "staff" },
          { zh: "教會健康規劃", href: "../church_planning/Church_Health_NCD_planning.html", gate: "staff" }
        ]
      },
      {
        id: "match",
        step: 3,
        emoji: "💼",
        shortZh: "人才",
        titleZh: "人才戰略",
        descZh: "跨部門檢視急缺與恩賜線索，避免「有恩賜的累到死、沒被邀請的漸漸冷淡」。您在媒合中心看的是決策資訊，最後仍要以牧養心腸發出邀請，而非行政命令。",
        links: [{ zh: "事奉媒合中心", dataSwitchTab: "matchmaker" }]
      },
      {
        id: "raci",
        step: 4,
        emoji: "📋",
        shortZh: "權責",
        titleZh: "權責 RACI",
        descZh: "事工一多，最容易重工與互相等待。RACI 幫助釐清誰決策、誰執行、誰諮詢、誰被告知——減少摩擦，讓弟兄姊妹知道自己被重視、也被保護。",
        links: [{ zh: "RACI 權責", href: "../church_planning/planning/raci-reflection.html", gate: "staff" }]
      },
      {
        id: "auto",
        step: 5,
        emoji: "🛠️",
        shortZh: "自動",
        titleZh: "自動化",
        descZh: "營運自動化控制台只做「預填與提醒」：表單、任務、報表草稿。關鍵呼召、紀戒與擴堂仍由您與聖靈同工；科技把庶務搬走，把時間還給講台與探訪。",
        links: [{ zh: "自動化控制台", href: "../ai_tools/pages/crm_automation_console.html", gate: "staff" }]
      }
    ]
  };

  /** Tab 3：事求人 · 管理者五節點（捲動目標在媒合看板內） */
  var MATCHMAKER_MANAGER_STAGES = [
    {
      id: "gap",
      step: 1,
      emoji: "📋",
      shortZh: "缺口",
      titleZh: "盤點缺口",
      descZh: "先看表格：哪個崗位缺幾人。數字是起點，不是壓力計——幫您誠實面對需要，再一起禱告尋找合宜同工。",
      scrollTo: "crm-match-urgent"
    },
    {
      id: "ai",
      step: 2,
      emoji: "🤖",
      shortZh: "偵測",
      titleZh: "AI 偵測人才",
      descZh: "閱讀 AI 溫馨提示：誰可能具備相關恩賜、誰近期較少服事。這是邀請的靈感，不是點名單。",
      scrollTo: "crm-match-ai-hint"
    },
    {
      id: "invite",
      step: 3,
      emoji: "💌",
      shortZh: "邀請",
      titleZh: "複製邀請稿",
      descZh: "點「缺 N」或到此區：複製邀請草稿，依關係潤飾後再傳；系統絕不代您發送。",
      scrollTo: "crm-match-invite"
    },
    {
      id: "shift",
      step: 4,
      emoji: "📅",
      shortZh: "排班",
      titleZh: "智能排班",
      descZh: "人找到了，要排得下去。到 A1 核對預填班表，讓新同工不被時間表拖垮。",
      scrollTo: "crm-match-shift"
    },
    {
      id: "care",
      step: 5,
      emoji: "🕊️",
      shortZh: "牧養",
      titleZh: "同工牧養",
      descZh: "服事之後更要問「你還好嗎」。探訪與牧養草稿，把關懷寫進時間軸，避免用完即丟。",
      scrollTo: "crm-match-pastoral"
    }
  ];

  var MATCHMAKER_DATA = {
    worship: {
      titleZh: "🎼 敬拜及音樂",
      titleEn: "Worship",
      aiHintZh: "💡 AI 偵測（敬拜第一線）：上週主日後，3 位新朋友完成恩賜測驗，在「音樂／多媒體」展現明顯熱情；另有 1 位社青願意跟鍵盤實習，尚未敲定時間。建議先禱告，再複製下方邀請稿、依關係潤飾後轉傳——系統絕不代發 LINE 或 WhatsApp。",
      aiHintEn: "3 members with music/media gifts — copy invite draft.",
      deptPage: "_landing/worship.html",
      urgentJobs: [
        { nameZh: "主日崇拜影音剪輯", nameEn: "Sunday AV edit", needed: 2, current: 0, typeZh: "活動工作", typeEn: "Event" },
        { nameZh: "第一堂崇拜鍵盤手", nameEn: "Keyboard", needed: 1, current: 0, typeZh: "常態事奉", typeEn: "Ongoing" },
        { nameZh: "音響控制隨班實習", nameEn: "Sound trainee", needed: 3, current: 1, typeZh: "培訓崗位", typeEn: "Training" }
      ]
    },
    pastoral: {
      titleZh: "👥 牧養及小組",
      titleEn: "Pastoral & groups",
      aiHintZh: "💡 AI 偵測（小組第一線）：2 位學員完成門徒裝備，上週探訪紀錄顯示願意接待新朋友；適合邀請小組長實習，但仍須牧者面談確認，不可一鍵派任。",
      aiHintEn: "2 students ready for cell-leader internship.",
      deptPage: "_landing/fellowship.html",
      urgentJobs: [
        { nameZh: "開放家庭核心接待同工", nameEn: "Host homes", needed: 3, current: 1, typeZh: "常態事奉", typeEn: "Ongoing" },
        { nameZh: "新朋友關懷跟進員", nameEn: "Newcomer care", needed: 4, current: 2, typeZh: "活動工作", typeEn: "Event" }
      ]
    },
    kids: {
      titleZh: "📚 兒童及門訓",
      titleEn: "Kids & discipleship",
      aiHintZh: "💡 AI 偵測（主日學第一線）：5 位社青具「教導」恩賜，其中 2 位上週已協助兒童課堂；可在 CTV 查看名單，邀請前請與家長／帶班老師一同分辨。",
      aiHintEn: "5 young adults with teaching gifts.",
      deptPage: "_landing/education.html",
      urgentJobs: [
        { nameZh: "兒童主日學助教（AI 備課輔助）", nameEn: "SS assistant", needed: 3, current: 1, typeZh: "常態事奉", typeEn: "Ongoing" }
      ]
    },
    outreach: {
      titleZh: "🌍 外展及差傳",
      titleEn: "Outreach",
      aiHintZh: "💡 多語系流程：同工核對 AI 翻譯草稿即可上線。",
      aiHintEn: "Review AI translation drafts.",
      deptPage: "_landing/expansion.html",
      urgentJobs: [
        { nameZh: "小語種教材翻譯／校對同工", nameEn: "Multilingual helper", needed: 2, current: 0, typeZh: "活動工作", typeEn: "Event" }
      ]
    },
    admin: {
      titleZh: "⚙️ F. 行政支援",
      titleEn: "Admin",
      aiHintZh: "💡 搭配「少填表」：每週約 10 分鐘核對預填即可。",
      aiHintEn: "Low admin with prefill.",
      deptPage: "dashboard.html",
      urgentJobs: [
        { nameZh: "主日接待與點名簽到行政", nameEn: "Usher / check-in", needed: 3, current: 2, typeZh: "常態事奉", typeEn: "Ongoing" }
      ]
    },
    planning: {
      titleZh: "🧭 教會規劃 OS",
      titleEn: "Planning OS",
      aiHintZh: "💡 適合熟悉 RACI 或管理恩賜的執事加入規劃組。",
      aiHintEn: "RACI-familiar elders welcome.",
      deptPage: "../church_planning/index_plan.html",
      urgentJobs: [
        { nameZh: "策略專案管理／流程優化同工", nameEn: "Strategy PM", needed: 1, current: 0, typeZh: "策略崗位", typeEn: "Strategy" }
      ]
    }
  };

  var CTV_URL = "../smart_ministry/talent_ministry_matching.html";
  var GIFTS_URL = "../smart_ministry/spiritual_gifts.html";
  var REGISTER_URL = "../smart_ministry/registration.html";

  var state = { masterTab: "journey", role: "member", step: 0, matchDept: "worship" };

  var ROLE_ALIASES = { student: "member", pastor: "leader" };

  function esc(s) {
    var d = global.document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function linkTarget() {
    try {
      if (global.parent && global.parent !== global && global.parent.document.getElementById("contentFrame")) {
        return "contentFrame";
      }
    } catch (e) {}
    return "_parent";
  }

  function bindLinks(root) {
    var tgt = linkTarget();
    (root || global.document).querySelectorAll("a.crm-journey-link").forEach(function (a) {
      if (!a.getAttribute("target")) a.setAttribute("target", tgt);
    });
  }

  function showGateToast(msg) {
    var t = global.document.getElementById("crmGateToast");
    if (!t) {
      t = global.document.createElement("div");
      t.id = "crmGateToast";
      t.className = "crm-gate-toast";
      t.setAttribute("role", "status");
      global.document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("is-visible");
    clearTimeout(showGateToast._tid);
    showGateToast._tid = setTimeout(function () {
      t.classList.remove("is-visible");
    }, 3200);
  }

  function bindGateHints(root) {
    (root || global.document).querySelectorAll("a[data-gate]").forEach(function (a) {
      a.addEventListener("click", function (ev) {
        var gate = a.getAttribute("data-gate");
        var role = state.role || "member";
        if (gate === "staff" && (role === "staff" || role === "teacher")) {
          showGateToast("💡 溫馨提示：此功能已為【" + (ROLES[role] ? ROLES[role].shortZh : "同工") + "】開通，請放心點擊。");
          return;
        }
        if (gate === "staff" && role === "member") {
          if (!global.confirm("此功能主要給同工／老師。會友可先走綠色旅程前幾站；仍要開啟嗎？")) ev.preventDefault();
        }
        if (gate === "leader" && role !== "leader" && role !== "staff") {
          if (!global.confirm("此頁含教會管理資訊。建議先走「執事牧者」藍色 Tab；仍要開啟嗎？")) ev.preventDefault();
        }
      });
    });
  }

  function renderRoleBadge(role) {
    var el = global.document.getElementById("crmRoleBadge");
    if (!el) return;
    role = normalizeRole(role);
    if (!ROLES[role] || role === "leader") {
      el.hidden = true;
      return;
    }
    var r = ROLES[role];
    var modeHint =
      role === "staff"
        ? "可跨部門媒合、A1 排班、5F 口述預填"
        : role === "teacher"
          ? "牧養週 7 站：備課、週報、探訪"
          : "成長 5 站：恩賜、小組、服事";
    el.hidden = false;
    el.className = "crm-role-badge crm-role-badge--" + role;
    el.innerHTML =
      "<span class=\"crm-role-badge__emoji\">" + r.emoji + "</span>" +
      "<span class=\"crm-role-badge__text\"><strong>您目前：【" + esc(r.shortZh) + "】模式</strong> — " + esc(modeHint) + "</span>";
  }

  function setRoleStorage(role) {
    try {
      if (role) global.localStorage.setItem(ROLE_KEY, role);
      else global.localStorage.removeItem(ROLE_KEY);
    } catch (e) {}
  }

  function getStepIndex() {
    try {
      var s = Number(global.localStorage.getItem(STEP_KEY));
      if (isFinite(s) && s >= 0 && s <= 5) return s;
    } catch (e) {}
    return 0;
  }

  function setStepStorage(n) {
    try {
      global.localStorage.setItem(STEP_KEY, String(n));
    } catch (e) {}
  }

  function getTabFromStorage() {
    try {
      var t = global.localStorage.getItem(TAB_KEY);
      if (t === "intro" || t === "journey" || t === "vision" || t === "matchmaker") return t;
    } catch (e) {}
    return null;
  }

  function setTabStorage(tab) {
    try {
      if (tab) global.localStorage.setItem(TAB_KEY, tab);
    } catch (e) {}
  }

  function getDeptFromStorage() {
    try {
      var d = global.localStorage.getItem(DEPT_KEY);
      if (d && MATCHMAKER_DATA[d]) return d;
    } catch (e) {}
    return null;
  }

  function setDeptStorage(dept) {
    try {
      if (dept) global.localStorage.setItem(DEPT_KEY, dept);
    } catch (e) {}
  }

  function normalizeRole(role) {
    return ROLE_ALIASES[role] || role;
  }

  function switchMasterTab(tabKey, options) {
    options = options || {};
    state.masterTab = tabKey;
    try {
      global.document.body.classList.remove("crm-hub-tab-intro", "crm-hub-tab-journey", "crm-hub-tab-vision", "crm-hub-tab-matchmaker");
      global.document.body.classList.add("crm-hub-tab-" + tabKey);
    } catch (bodyCls) {}
    ["intro", "journey", "vision", "matchmaker"].forEach(function (key) {
      var sec = global.document.getElementById("master-sec-" + key);
      var btn = global.document.getElementById("tab-btn-" + key);
      if (sec) sec.hidden = key !== tabKey;
      if (btn) {
        btn.classList.toggle("is-active", key === tabKey);
        btn.setAttribute("aria-selected", key === tabKey ? "true" : "false");
      }
    });
    setTabStorage(tabKey);
    try {
      var u = new URL(global.location.href);
      u.searchParams.set("tab", tabKey);
      global.history.replaceState({}, "", u.pathname + u.search);
    } catch (e) {}
    if (tabKey === "journey") {
      var journeyRole = state.role;
      if (!journeyRole || JOURNEY_ROLES.indexOf(journeyRole) < 0) {
        try {
          var saved = global.localStorage.getItem(ROLE_KEY);
          journeyRole = saved && JOURNEY_ROLES.indexOf(saved) >= 0 ? saved : "member";
        } catch (e2) {
          journeyRole = "member";
        }
      }
      state.role = journeyRole;
      state.step = getStepIndex();
      syncOnboardUI(journeyRole);
      selectRole(journeyRole, state.step);
      highlightRoleNav(journeyRole);
    }
    if (tabKey === "vision") {
      state.role = "leader";
      state.step = getStepIndex();
      setRoleStorage("leader");
      renderVisionPanel(state.step);
    }
    if (tabKey === "matchmaker") {
      var prefill =
        options.prefill ||
        (global.MatchmakerPrefill && typeof global.MatchmakerPrefill.load === "function" && global.MatchmakerPrefill.load());
      var mode = options.prefillMode || options.mode || (prefill && prefill.mode) || "";
      var dept =
        options.dept ||
        (prefill && prefill.suggested_dept) ||
        state.matchDept ||
        getDeptFromStorage() ||
        "worship";
      if (!MATCHMAKER_DATA[dept]) dept = (prefill && prefill.suggested_dept) || "worship";
      filterMatch(dept, { prefill: prefill, mode: mode, scrollPrefill: !!prefill });
      highlightDeptNav(dept);
      if (mode) {
        try {
          var uMode = new URL(global.location.href);
          uMode.searchParams.set("mode", mode);
          if (dept) uMode.searchParams.set("dept", dept);
          global.history.replaceState({}, "", uMode.pathname + uMode.search);
        } catch (modeUrlErr) {}
      }
    }
  }

  function updateUrlRoleStep(role, step) {
    try {
      var u = new URL(global.location.href);
      if (role) {
        u.searchParams.set("role", role);
        u.searchParams.set("step", String(step));
      }
      global.history.replaceState({}, "", u.pathname + u.search);
    } catch (e) {}
  }

  function renderRoleNav() {
    var host = global.document.getElementById("crmJourneyRoleNav");
    if (!host) return;
    host.innerHTML = Object.keys(ROLES).map(function (key) {
      var r = ROLES[key];
      var active = key === state.role ? " is-active" : "";
      return '<button type="button" class="crm-side-nav__btn' + active + '" id="role-btn-' + key + '" data-role="' + key + '" title="' + esc(r.pickZh) + '">' +
        '<span class="crm-side-nav__emoji" aria-hidden="true">' + r.emoji + "</span>" +
        '<span class="crm-side-nav__label">' + esc(r.shortZh) + "</span></button>";
    }).join("");
    host.querySelectorAll(".crm-side-nav__btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        selectRole(btn.getAttribute("data-role"), 0);
      });
    });
  }

  function highlightRoleNav(role) {
    global.document.querySelectorAll("#crmJourneyRoleNav .crm-side-nav__btn").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-role") === role);
    });
  }

  function highlightDeptNav(deptKey) {
    global.document.querySelectorAll("#crmMatchmakerDepts .crm-side-nav__btn").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-dept") === deptKey);
    });
  }

  function renderInlineLinks(links) {
    var tgt = linkTarget();
    return (links || []).map(function (it) {
      if (it.dataScrollTo) {
        return '<button type="button" class="crm-intro-inline-link crm-intro-inline-link--btn" data-scroll-to="' + esc(it.dataScrollTo) + '">' + esc(it.zh) + " ➔</button>";
      }
      if (it.dataSwitchTab) {
        return '<button type="button" class="crm-intro-inline-link crm-intro-inline-link--btn" data-switch-tab="' + esc(it.dataSwitchTab) + '">' + esc(it.zh) + " ➔</button>";
      }
      var gate = it.gate ? ' data-gate="' + it.gate + '"' : "";
      return '<a class="crm-journey-link crm-intro-inline-link" href="' + esc(it.href) + '" target="' + tgt + '"' + gate + ">" + esc(it.zh) + capabilityPillHtml(it.href) + " ➔</a>";
    }).join('<span class="crm-intro-inline-sep" aria-hidden="true">·</span>');
  }

  function bindRoadmapScroll(host) {
    if (!host) return;
    host.querySelectorAll("[data-scroll-to]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-scroll-to");
        var el = id ? global.document.getElementById(id) : null;
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          if (el.tagName === "DETAILS") el.open = true;
        }
      });
    });
  }

  function bindSwitchTabButtons(root) {
    (root || global.document).querySelectorAll("[data-switch-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        switchMasterTab(btn.getAttribute("data-switch-tab"));
      });
    });
  }

  function bindLocalNav(rootSelector) {
    var root = global.document.querySelector(rootSelector);
    if (!root) return;
    root.querySelectorAll("[data-scroll-section]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-scroll-section");
        var el = id ? global.document.getElementById(id) : null;
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /**
   * 通用橫向路線圖（Tab 1 / 2 / 3 共用樣式）
   * opts: { hostId, kicker, ariaLabel, stages[], metaHtml? }
   */
  function renderJourneyRoadmap(opts) {
    var host = global.document.getElementById(opts.hostId);
    if (!host || !opts.stages || !opts.stages.length) return;
    var steps = opts.stages.map(function (p, idx) {
      var arrow = idx < opts.stages.length - 1
        ? '<span class="crm-intro-roadmap__connector" aria-hidden="true"></span>'
        : "";
      var scrollId = p.scrollTo || (opts.scrollIdPrefix ? opts.scrollIdPrefix + p.id : "");
      var tip = p.titleZh + (p.descZh ? " — " + p.descZh : "");
      return '<button type="button" class="crm-intro-roadmap__step" data-scroll-to="' + esc(scrollId) + '" title="' + esc(tip) + '">' +
        '<span class="crm-intro-roadmap__num">' + p.step + "</span>" +
        '<span class="crm-intro-roadmap__emoji" aria-hidden="true">' + p.emoji + "</span>" +
        '<span class="crm-intro-roadmap__label">' + esc(p.shortZh) + "</span></button>" + arrow;
    }).join("");
    var meta = opts.metaHtml ? '<p class="crm-intro-roadmap__meta">' + opts.metaHtml + "</p>" : "";
    host.innerHTML =
      '<div class="crm-intro-roadmap__panel">' +
      '<p class="crm-intro-roadmap__kicker">' + esc(opts.kicker) + "</p>" +
      '<nav class="crm-intro-roadmap__track" aria-label="' + esc(opts.ariaLabel) + '">' + steps + "</nav>" +
      meta +
      "</div>";
    bindRoadmapScroll(host);
    bindLinks(host);
    bindGateHints(host);
  }

  function renderStageAccordions(opts) {
    var host = global.document.getElementById(opts.hostId);
    if (!host || !opts.stages) return;
    var prefix = opts.idPrefix || "crm-stage-";
    host.innerHTML = opts.stages.map(function (p, idx) {
      var openAttr = opts.openFirst && idx === 0 ? " open" : "";
      return '<details class="crm-intro-principle" id="' + esc(prefix + p.id) + '"' + openAttr + ">" +
        '<summary class="crm-intro-principle__summary">' +
        '<span class="crm-intro-principle__step">' + p.step + "</span>" +
        '<span class="crm-intro-principle__emoji" aria-hidden="true">' + p.emoji + "</span>" +
        "<strong>" + esc(p.titleZh) + "</strong></summary>" +
        '<div class="crm-intro-principle__body">' +
        "<p>" + esc(p.descZh) + "</p>" +
        '<p class="crm-intro-principle__links">' + renderInlineLinks(p.links) + "</p></div></details>";
    }).join("");
    bindSwitchTabButtons(host);
    bindRoadmapScroll(host);
    bindLinks(host);
    bindGateHints(host);
  }

  function renderIntroRoadmap() {
    var tgt = linkTarget();
    renderJourneyRoadmap({
      hostId: "crmIntroRoadmap",
      kicker: "🗺️ CRM 神經系統路線圖 · 八大原義流轉",
      ariaLabel: "八大原義路線",
      scrollIdPrefix: "crm-principle-",
      stages: CRM_EIGHT_PRINCIPLES,
      metaHtml:
        '<a class="crm-journey-link crm-intro-inline-link" href="roadmap-overview.html" target="' + tgt + '">📍 完整工程路線圖</a>' +
        '<span class="crm-intro-inline-sep" aria-hidden="true">·</span>' +
        '<a class="crm-journey-link crm-intro-inline-link" href="dashboard.html" target="' + tgt + '" data-gate="staff">📊 成熟度儀表板</a>' +
        '<span class="crm-intro-inline-sep" aria-hidden="true">·</span>' +
        '<a class="crm-journey-link crm-intro-inline-link" href="../help/church_ministry_manual.html" target="' + tgt + '">📖 功能頁總手冊</a>'
    });
  }

  function renderIntroEightPrinciples() {
    renderStageAccordions({
      hostId: "crmIntroEightList",
      stages: CRM_EIGHT_PRINCIPLES,
      idPrefix: "crm-principle-",
      openFirst: true
    });
  }

  function renderJourneyTabPanel(role) {
    role = normalizeRole(role);
    var stages = BELIEVER_JOURNEY_BY_ROLE[role] || BELIEVER_JOURNEY_BY_ROLE.member;
    var map = JOURNEY_MAPS[role];
    var kicker = "🙋 " + (map ? map.roleNameZh : "會友") + " · 五節點事奉生命週期";
    renderJourneyRoadmap({
      hostId: "crmJourneyRoadmap",
      kicker: kicker,
      ariaLabel: "我的事奉旅程路線",
      scrollIdPrefix: "crm-journey-stage-",
      stages: stages
    });
    renderStageAccordions({
      hostId: "crmJourneyStagesList",
      stages: stages,
      idPrefix: "crm-journey-stage-",
      openFirst: true
    });
  }

  function renderMatchmakerTabPanel() {
    renderJourneyRoadmap({
      hostId: "crmMatchmakerRoadmap",
      kicker: "💼 部門管理者路線 · 盤點缺口到同工牧養",
      ariaLabel: "事奉媒合管理者路線",
      stages: MATCHMAKER_MANAGER_STAGES
    });
    renderStageAccordions({
      hostId: "crmMatchmakerStagesList",
      stages: MATCHMAKER_MANAGER_STAGES.map(function (s) {
        return {
          id: s.id,
          step: s.step,
          emoji: s.emoji,
          titleZh: s.titleZh,
          descZh: s.descZh,
          links: [{ zh: "📍 跳到看板對應區", dataScrollTo: s.scrollTo }]
        };
      }),
      idPrefix: "crm-match-stage-",
      openFirst: false
    });
  }

  function bindJourneyPanel() {
    bindLocalNav("#master-sec-journey .crm-tab-local-nav");
  }

  function bindMatchmakerPanel() {
    bindLocalNav("#master-sec-matchmaker .crm-tab-local-nav");
    renderMatchmakerTabPanel();
    mountMatchmakerImportPlaceholder();
  }

  function mountMatchmakerImportPlaceholder() {
    var board = global.document.getElementById("matchmaker-board");
    if (!board || board.querySelector("#crm-matchmaker-import")) return;
    if (!board.querySelector(".crm-matchmaker__board-placeholder")) return;
    if (!global.MatchmakerPrefill || typeof global.MatchmakerPrefill.renderImportPanelHtml !== "function") return;
    board.insertAdjacentHTML("beforeend", global.MatchmakerPrefill.renderImportPanelHtml());
    global.MatchmakerPrefill.bindImportPanel(board.querySelector("#crm-matchmaker-import"), function (envelope) {
      switchMasterTab("matchmaker", {
        dept: envelope.suggested_dept,
        prefill: envelope,
        prefillMode: envelope.mode,
        scrollPrefill: true
      });
    });
  }

  function renderIntroAiRoles() {
    var host = global.document.getElementById("crmIntroAiList");
    if (!host) return;
    host.innerHTML =
      '<div class="crm-intro-ai-grid">' +
      CRM_AI_ROLES.map(function (r) {
        return '<article class="crm-intro-ai-card" id="crm-ai-' + esc(r.id) + '">' +
          '<h4 class="crm-intro-ai-card__title">' + r.emoji + " " + esc(r.titleZh) + "</h4>" +
          "<p class=\"crm-intro-ai-card__desc\">" + esc(r.descZh) + "</p>" +
          '<p class="crm-intro-ai-card__links">' + renderInlineLinks(r.links) + "</p></article>";
      }).join("") +
      "</div>";
    bindLinks(host);
    bindGateHints(host);
  }

  function bindIntroLocalNav() {
    var intro = global.document.getElementById("master-sec-intro");
    if (!intro) return;
    intro.querySelectorAll(".crm-intro-local-nav__btn[data-scroll-section]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-scroll-section");
        var el = id ? global.document.getElementById(id) : null;
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function bindIntroStaticPanel() {
    var intro = global.document.getElementById("master-sec-intro");
    if (!intro || !intro.getAttribute("data-intro-static")) return;
    renderIntroRoadmap();
    renderIntroEightPrinciples();
    renderIntroAiRoles();
    renderIntroToolCatalog();
    bindIntroLocalNav();
    intro.querySelectorAll(".crm-intro-dept-btn[data-dept]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        switchMasterTab("matchmaker", { dept: btn.getAttribute("data-dept") });
      });
    });
    intro.querySelectorAll("[data-goto-matchmaker-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        switchMasterTab("matchmaker");
      });
    });
    bindLinks(intro);
    bindGateHints(intro);
  }

  function renderIntroAccordion() {
    var host = global.document.getElementById("crmIntroAccordion");
    if (!host) return;
    var tgt = linkTarget();
    host.innerHTML = PAIN_ACCORDION.map(function (item) {
      var gate = item.gate ? ' data-gate="' + item.gate + '"' : "";
      return '<details class="crm-pain-acc__item">' +
        "<summary>" + item.emoji + " " + esc(item.titleZh) + "</summary>" +
        '<div class="crm-pain-acc__body">' +
        '<p class="crm-pain-acc__pain"><strong>😓 痛點：</strong>' + esc(item.painZh) + "</p>" +
        '<p class="crm-pain-acc__cure"><strong>💚 解藥：</strong>' + esc(item.cureZh) + "</p>" +
        '<a class="crm-journey-link crm-pain-acc__link" href="' + esc(item.href) + '" target="' + tgt + '"' + gate + ">" + esc(item.linkZh) + " ➔</a>" +
        "</div></details>";
    }).join("");
    bindLinks(host);
    bindGateHints(host);
  }

  function renderIntroMinistryTags() {
    var host = global.document.getElementById("crmIntroMinistryTags");
    if (!host) return;
    host.innerHTML = MINISTRY_DEPTS.map(function (d) {
      return '<button type="button" class="crm-intro-tag" data-dept="' + d.key + '" title="' + esc(d.zh) + '">' + d.emoji + " " + esc(d.zh) + "</button>";
    }).join("");
    host.querySelectorAll(".crm-intro-tag").forEach(function (btn) {
      btn.addEventListener("click", function () {
        switchMasterTab("matchmaker", { dept: btn.getAttribute("data-dept") });
      });
    });
  }

  function renderIntroToolCatalog() {
    var host = global.document.getElementById("crmIntroToolCatalog");
    if (!host) return;
    var tgt = linkTarget();
    host.innerHTML = TOOL_GROUPS.map(function (g) {
      var items = g.items.map(function (it) {
        var gate = it.gate ? ' data-gate="' + it.gate + '"' : "";
        return '<li><a class="crm-journey-link" href="' + esc(it.href) + '" target="' + tgt + '"' + gate + ">" + esc(it.zh) + "</a></li>";
      }).join("");
      return '<details class="crm-tool-group"><summary>' + esc(g.zh) + "</summary><ul>" + items + "</ul></details>";
    }).join("");
    bindLinks(host);
    bindGateHints(host);
  }

  function renderJourneyHeader(role) {
    var host = global.document.getElementById("crmJourneyHeader");
    var map = JOURNEY_MAPS[role];
    if (!host || !map) return;
    var hitl = map.hitl ? '<p class="crm-hitl">' + esc(map.hitl.zh) + "</p>" : "";
    host.innerHTML = "<p class=\"crm-journey-kicker\"><strong>" + esc(map.roleNameZh) + "</strong> — 減壓故事線</p>" + hitl;
  }

  function renderStepper(role, stepIdx, opts) {
    opts = opts || {};
    var host = global.document.getElementById(opts.hostId || "crmStepper");
    var map = JOURNEY_MAPS[role];
    if (!host || !map) return;
    host.innerHTML = map.steps.map(function (s) {
      var cls = s.id === stepIdx ? " is-current" : s.id < stepIdx ? " is-done" : "";
      return '<button type="button" class="crm-step-dot' + cls + '" data-step="' + s.id + '" title="' + esc(s.labelZh) + '">' +
        "<span>" + s.id + "</span>" +
        '<span class="crm-step-dot__label">' + esc(s.labelZh) + "</span></button>";
    }).join("");
    host.querySelectorAll(".crm-step-dot").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var nextStep = Number(btn.getAttribute("data-step"));
        if (opts.onStep) opts.onStep(nextStep);
        else goToStep(role, nextStep);
      });
    });
  }

  function renderStepCard(role, stepIdx, opts) {
    opts = opts || {};
    var host = global.document.getElementById(opts.hostId || "crmStepCard");
    var map = JOURNEY_MAPS[role];
    if (!host || !map) return;
    var step = map.steps[stepIdx];
    if (!step) return;
    var maxStep = map.steps.length - 1;
    var tgt = linkTarget();
    var action = "";
    if (step.switchToMatchmakerTab) {
      action = '<button type="button" class="crm-cta-primary crm-cta-primary--btn" data-goto-matchmaker-tab">📍 ' + esc(step.toolNameZh) + "</button>";
    } else if (step.url) {
      var gate = step.gate ? ' data-gate="' + step.gate + '"' : "";
      var cardHref = appendHubContextToUrl(step.url, role, stepIdx);
      action = '<a class="crm-journey-link crm-cta-primary" href="' + esc(cardHref) + '" target="' + tgt + '"' + gate + ">⚡ " + esc(step.toolNameZh) + capabilityPillHtml(step.url) + "</a>";
    }
    var inviteBlock = "";
    if (role === "member" && stepIdx === 1) {
      inviteBlock =
        '<div class="crm-invite-draft">' +
        "<h4>💌 服事邀請信草稿（請牧者／小組長審核後再轉傳）</h4>" +
        '<pre class="crm-invite-draft__text" id="crmInviteDraftText">' + esc(MEMBER_INVITE_DRAFT) + "</pre>" +
        '<button type="button" class="crm-btn-ghost" id="btnCopyInviteDraft">複製草稿</button>' +
        '<p class="crm-invite-draft__note">完成恩賜測驗後，可將此草稿貼給關懷同工參考；系統不會自動 LINE 發送。</p></div>';
    }
    host.innerHTML =
      '<div class="crm-step-card__meta">階段 ' + step.id + " · " + esc(step.labelZh) + "</div>" +
      '<h3 class="crm-step-card__context"><span class="crm-step-card__context-label">遭遇情境</span>' + esc(step.contextZh) + "</h3>" +
      "<p class=\"crm-step-card__desc\">" + esc(step.descZh) + "</p>" +
      inviteBlock +
      '<div class="crm-step-card__actions">' + action + "</div>" +
      '<div class="crm-step-nav">' +
      (stepIdx > 0 ? '<button type="button" class="crm-btn-ghost" data-step-prev>← 上一步</button>' : "<span></span>") +
      (stepIdx < maxStep ? '<button type="button" class="crm-btn-ghost" data-step-next>下一步 →</button>' : "<span></span>") +
      "</div>";
    var copyBtn = host.querySelector("#btnCopyInviteDraft");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var text = MEMBER_INVITE_DRAFT;
        if (global.navigator.clipboard && global.navigator.clipboard.writeText) {
          global.navigator.clipboard.writeText(text).then(function () {
            global.alert("已複製邀請信草稿，請審核後再轉傳。");
          }).catch(function () {
            global.alert(text);
          });
        } else {
          global.alert(text);
        }
      });
    }
    var matchTabBtn = host.querySelector("[data-goto-matchmaker-tab]");
    if (matchTabBtn) matchTabBtn.addEventListener("click", function () { switchMasterTab("matchmaker"); });
    var prev = host.querySelector("[data-step-prev]");
    var next = host.querySelector("[data-step-next]");
    if (prev) {
      prev.addEventListener("click", function () {
        if (opts.onPrev) opts.onPrev(stepIdx - 1);
        else goToStep(role, stepIdx - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        if (opts.onNext) opts.onNext(stepIdx + 1);
        else goToStep(role, stepIdx + 1);
      });
    }
    bindLinks(host);
    bindGateHints(host);
  }

  function selectRole(role, stepIdx) {
    role = normalizeRole(role);
    if (!JOURNEY_MAPS[role]) return;
    state.role = role;
    state.step = stepIdx;
    setRoleStorage(role);
    setStepStorage(stepIdx);
    highlightRoleNav(role);
    renderJourneyTabPanel(role);
    renderJourneyHeader(role);
    renderStepper(role, stepIdx);
    renderStepCard(role, stepIdx);
    updateUrlRoleStep(role, stepIdx);
  }

  function goToStep(role, stepIdx) {
    selectRole(role, stepIdx);
  }

  function getDeptMeta(key) {
    for (var i = 0; i < MINISTRY_DEPTS.length; i++) {
      if (MINISTRY_DEPTS[i].key === key) return MINISTRY_DEPTS[i];
    }
    return null;
  }

  function renderMatchmakerDepts() {
    var host = global.document.getElementById("crmMatchmakerDepts");
    if (!host) return;
    host.innerHTML = Object.keys(MATCHMAKER_DATA).map(function (key) {
      var meta = getDeptMeta(key);
      var active = key === state.matchDept ? " is-active" : "";
      var emoji = meta ? meta.emoji : "🧭";
      var short = meta ? meta.zh : MATCHMAKER_DATA[key].titleZh;
      var full = meta ? emoji + " " + meta.zh : MATCHMAKER_DATA[key].titleZh;
      return '<button type="button" class="crm-side-nav__btn' + active + '" id="dept-btn-' + key + '" data-dept="' + key + '" title="' + esc(full) + '">' +
        '<span class="crm-side-nav__emoji" aria-hidden="true">' + emoji + "</span>" +
        '<span class="crm-side-nav__label">' + esc(short) + "</span></button>";
    }).join("");
    host.querySelectorAll(".crm-side-nav__btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterMatch(btn.getAttribute("data-dept"));
      });
    });
  }

  function renderPipelineHtml() {
    return (
      '<div class="crm-pipeline">' +
      '<h4 class="crm-pipeline__title">🧭 全自動找工流轉路總圖</h4>' +
      '<div class="crm-pipeline__grid">' +
      '<div class="crm-pipeline__step crm-pipeline__step--1"><strong>1. 恩賜性格</strong><p>測驗結果配對</p></div>' +
      '<div class="crm-pipeline__step crm-pipeline__step--2"><strong>2. 門徒培訓</strong><p>裝備教材銜接</p></div>' +
      '<div class="crm-pipeline__step crm-pipeline__step--3"><strong>3. 智能媒合</strong><p>CTV 建議邀請</p></div>' +
      '<div class="crm-pipeline__step crm-pipeline__step--4"><strong>4. 自動排班</strong><p>A1 輕鬆出更</p></div>' +
      "</div></div>"
    );
  }

  // --- Onboarding (3-screen) -------------------------------------------------

  function renderOnboardRoleButtons(role) {
    var host = global.document.getElementById("crmOnboardRoleButtons");
    if (!host) return;
    var html = "";
    JOURNEY_ROLES.forEach(function (k) {
      var r = ROLES[k];
      if (!r) return;
      var active = role === r.id ? " is-active" : "";
      html +=
        '<button type="button" class="crm-onboard-role-btn crm-onboard-role-btn--' +
        r.id +
        active +
        '" data-role="' +
        r.id +
        '">' +
        r.emoji +
        " " +
        esc(r.shortZh) +
        "</button>";
    });
    host.innerHTML = html;
  }

  var VISION_META = {
    titleZh: "執事牧者 · 戰略視野",
    needZh: "你遇到：會議多、戰情看不清、推動數位化沒信心",
    useZh: "可以用：種子示範 → 戰情儀表 → RACI 治理 → 評估 OS → CTA 戰情 → 規劃落地",
    floorZh: "1F 戰情 → 2F 決策 → 3F 規劃（鳥瞰全棧）"
  };

  var ONBOARD_ROLE_META = {
    leader: VISION_META,
    staff: {
      titleZh: "事工主責／同工",
      needZh: "你遇到：排班追到心累、缺人、權責亂、探訪記錄斷線",
      useZh: "可以用：A1 排班 → CTV 配對 → 媒合中心 → RACI → 探訪 → 自動化（8 站最完整）",
      floorZh: "3F 人才 → 4F 執行 → 5F 輔助"
    },
    teacher: {
      titleZh: "老師／小組長",
      needZh: "你遇到：帶班行政多、週報沒時間、誰久沒來不清楚",
      useZh: "可以用：週四名冊 → 週五備課 → 週日週報 → 週一探訪 → 週二戰情 → 週三策略（7 站牧養週）",
      floorZh: "4F 執行 → 5F 輔助"
    },
    member: {
      titleZh: "會友／學生",
      needZh: "你遇到：剛來教會不知下一步、想服事不知從哪開始",
      useZh: "可以用：認識自己 → 恩賜測驗 → 媒合中心 → 加入小組 → 更深裝備（5 站成長線）",
      floorZh: "3F 人才（人求事）"
    }
  };

  var ONBOARD_STORY_LABELS = {
    member: [
      "我剛來，想認識自己",
      "尋找恩賜方向",
      "想服事，找對位置",
      "加入屬靈家庭",
      "更深裝備成長"
    ],
    teacher: [
      "週四｜班級名冊",
      "週五｜聚會前備課",
      "週六｜恩賜分組",
      "週日聚會後｜寫週報",
      "週一｜探訪跟進",
      "週二｜出席戰情",
      "週三｜牧養策略"
    ],
    staff: [
      "痛點① 排班心累",
      "痛點② 缺人苦求",
      "痛點③ 跨部門媒合",
      "痛點④ 權責混亂",
      "痛點⑤ 名冊分散",
      "痛點⑥ 探訪斷線",
      "痛點⑦ 跟進漏接",
      "痛點⑧ 流程瓶頸"
    ],
    leader: [
      "先看見成果",
      "戰情一頁清",
      "權責共識",
      "教會評估 OS",
      "跨工具戰情",
      "異象落地規劃"
    ]
  };

  var ROLE_FLOORS = {
    member: ["3F 人才", "3F 人才", "3F 媒合", "4F 小組", "4F 裝備"],
    teacher: ["4F 執行", "4F 執行", "3F 人才", "4F 執行", "4F 執行", "4F 戰情", "5F 輔助"],
    staff: ["4F 執行", "3F 人才", "3F 媒合", "2F 決策", "4F 執行", "4F 執行", "4F 執行", "5F 輔助"],
    leader: ["1F 戰情", "1F 戰情", "2F 決策", "2F 評估", "2F 戰情室", "3F 規劃"]
  };

  var ONBOARD_COPY = {
    leader: {
      0: { pain: "系統空空如也，長執看不出價值。", tool: "載入試用種子", solve: "3 分鐘內看見示範會友與資料就緒。" },
      1: { pain: "會議資料分散，抓不到待辦。", tool: "戰情儀表板", solve: "CRM 就緒度與四類工作桌一頁看清。" },
      2: { pain: "權責不清，重複派工內耗。", tool: "RACI 治理", solve: "誰主責、誰配合，會議不再互推。" },
      3: { pain: "看不清教會成熟度與下一步。", tool: "教會評估 OS", solve: "白話問卷與雷達圖，輔助長執決策。" },
      4: { pain: "跨工具開會，風險看不全。", tool: "CTA 戰情室", solve: "白話合成評估與預警。" },
      5: { pain: "異象有了，落地路徑模糊。", tool: "教會規劃索引", solve: "將異象化為可執行規劃與自動化架構。" }
    },
    staff: {
      0: { pain: "排班追到心累、LINE 散落。", tool: "A1 義工排班", solve: "預填空檔，你核對後複製邀請稿。" },
      1: { pain: "活動缺人，只能群組苦求。", tool: "CTV 事奉配對", solve: "看恩賜建議名單；人工邀請。" },
      2: { pain: "排班有缺口、找不到合適同工。", tool: "事奉媒合中心", solve: "看部門急缺與八大後台入口。" },
      3: { pain: "跨部門分工混亂。", tool: "RACI 權責", solve: "減少重複與漏接。" },
      4: { pain: "不知道誰有空、聯絡方式散落。", tool: "會友通訊錄", solve: "一頁看清基本資料與事奉標記。" },
      5: { pain: "探訪記錄在各人手機。", tool: "探訪工作桌", solve: "貼文字整理，下一棒不斷線。" },
      6: { pain: "跟進待辦容易漏。", tool: "A2 探訪跟進", solve: "白話待辦清單。" },
      7: { pain: "年度事工流於形式。", tool: "營運自動化", solve: "口述需求，只預填表單。" }
    },
    teacher: {
      0: { pain: "週四開班前要對名冊、重複登打。", tool: "主日學簡表", solve: "一頁看清班級學員。" },
      1: { pain: "週五備課時間不夠。", tool: "AI Lab 備課", solve: "產生草稿，你審核後使用。" },
      2: { pain: "週六分組只靠印象。", tool: "團契小組", solve: "參考恩賜建議；邀請仍人工。" },
      3: { pain: "週日聚會後寫週報沒時間。", tool: "小組報告 Copilot", solve: "口述變結構化週報草稿。" },
      4: { pain: "週一跟進：誰很久沒來？", tool: "探訪工作跟進台", solve: "貼文字整理關懷紀錄。" },
      5: { pain: "週二檢視出席與 KPI。", tool: "學校統計", solve: "出席與 KPI 白話摘要。" },
      6: { pain: "週三規劃下一季牧養。", tool: "AI 牧養草稿", solve: "依痛點產生策略草稿，你決定。" }
    },
    member: {
      0: { pain: "新人不知怎麼登記。", tool: "會友註冊", solve: "口述或貼上，AI 只預填基本資料。" },
      1: { pain: "不知道自己恩賜方向。", tool: "恩賜測驗", solve: "5 分鐘起點；與牧者對談，非自動派工。" },
      2: { pain: "想服事不知找誰。", tool: "事奉媒合中心", solve: "看部門缺工與方向提示。" },
      3: { pain: "想加入團契不知入口。", tool: "團契小組", solve: "向小組長表達意願。" },
      4: { pain: "想更深裝備。", tool: "聖經研讀／學校", solve: "學習軌跡與課程銜接。" }
    }
  };

  function renderRoleNeedBanner(role) {
    var host = global.document.getElementById("crmRoleNeedBanner");
    if (!host) return;
    var meta = ONBOARD_ROLE_META[role] || ONBOARD_ROLE_META.member;
    host.className = "crm-role-need-banner crm-role-need-banner--" + role;
    host.innerHTML =
      '<h3 class="crm-role-need-banner__title">' + esc(meta.titleZh) + " 專屬路線</h3>" +
      '<p class="crm-role-need-banner__need"><strong>你遇到／需要：</strong>' + esc(meta.needZh) + "</p>" +
      '<p class="crm-role-need-banner__use"><strong>可以用：</strong>' + esc(meta.useZh) + "</p>" +
      '<p class="crm-role-need-banner__floor"><span class="crm-onboard-floor-chip">' + esc(meta.floorZh) + "</span></p>";
  }

  function renderTimelineToHost(host, role) {
    if (!host) return;
    role = normalizeRole(role);
    var journey = JOURNEY_MAPS[role] || JOURNEY_MAPS.member;
    var limit = ROLE_STEP_LIMITS[role] || 5;
    var storyLabels = ONBOARD_STORY_LABELS[role] || [];
    var floors = ROLE_FLOORS[role] || [];
    var html = "";
    journey.steps.slice(0, limit).forEach(function (s, idx) {
      var c = (ONBOARD_COPY[role] && ONBOARD_COPY[role][s.id]) || null;
      var floor = floors[idx] || "";
      var storyTitle = storyLabels[idx] || ("步驟 " + (idx + 1));
      html += '<article class="crm-onboard-step crm-onboard-step--' + esc(role) + '">';
      html += '<div class="crm-onboard-step__idx"><span>' + (idx + 1) + "</span></div>";
      html += '<div class="crm-onboard-step__body">';
      html += '<h4 class="crm-onboard-step__title">' + esc(storyTitle) + "</h4>";
      if (floor) html += '<span class="crm-onboard-floor-chip">' + esc(floor) + "</span>";
      html += '<ul class="crm-onboard-step__four">';
      html += "<li><strong>你遇到</strong>：" + esc((c && c.pain) || s.contextZh || s.descZh || "—") + "</li>";
      html += "<li><strong>可以用</strong>：" + esc((c && c.tool) || s.toolNameZh || "本步工具") + "</li>";
      html += "<li><strong>AI 做什麼</strong>：只預填、提醒、整理草稿（不取代牧者）。</li>";
      html += "<li><strong>看見／解決</strong>：" + esc((c && c.solve) || s.descZh || "完成本步即可往下。") + "</li>";
      html += "</ul>";

      if (s.switchToMatchmakerTab) {
        html += '<button type="button" class="crm-onboard-step__cta" data-goto-matchmaker-tab>💼 開啟事奉媒合中心</button>';
      } else if (s.url) {
        var stepHref = appendHubContextToUrl(s.url, role, s.id);
        html +=
          '<a class="crm-journey-link crm-onboard-step__link" href="' + esc(stepHref) + '"' +
          (s.gate ? ' data-gate="' + esc(s.gate) + '"' : "") + ">" +
          esc("👉 前往：" + (s.toolNameZh || "開啟")) + capabilityPillHtml(s.url) + "</a>";
      }
      if (role === "staff" && s.id === 0) {
        html +=
          '<a class="crm-journey-link crm-onboard-step__link crm-onboard-step__link--5f" href="' +
          esc(automationConsoleHref("staff", "shift")) + '"' +
          (s.gate ? ' data-gate="' + esc(s.gate) + '"' : "") +
          ">☕ 排班太累？先去 5F 口述預填</a>";
      }
      if (role === "teacher" && s.id === 3) {
        html +=
          '<a class="crm-journey-link crm-onboard-step__link crm-onboard-step__link--5f" href="' +
          esc(automationConsoleHref("teacher", "report")) + '"' +
          (s.gate ? ' data-gate="' + esc(s.gate) + '"' : "") +
          ">☕ 週報太累？5F 口述整理草稿</a>";
      }
      if (role === "teacher" && s.id === 4) {
        html +=
          '<a class="crm-journey-link crm-onboard-step__link crm-onboard-step__link--5f" href="' +
          esc(automationConsoleHref("teacher", "visit")) + '"' +
          (s.gate ? ' data-gate="' + esc(s.gate) + '"' : "") +
          ">☕ 探訪筆記難整理？5F 預填跟進</a>";
      }
      html += "</div></article>";
    });
    host.innerHTML = html;
    bindLinks(host);
    bindGateHints(host);
    host.querySelectorAll("[data-goto-matchmaker-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () { switchMasterTab("matchmaker"); });
    });
  }

  function renderOnboardTimeline(role) {
    renderTimelineToHost(global.document.getElementById("crmOnboardTimeline"), role);
  }

  function renderVisionBanner() {
    var host = global.document.getElementById("crmVisionBanner");
    if (!host) return;
    var meta = VISION_META;
    host.className = "crm-role-need-banner crm-role-need-banner--leader";
    host.innerHTML =
      '<h3 class="crm-role-need-banner__title">' + esc(meta.titleZh) + "</h3>" +
      '<p class="crm-role-need-banner__need"><strong>你遇到／需要：</strong>' + esc(meta.needZh) + "</p>" +
      '<p class="crm-role-need-banner__use"><strong>可以用：</strong>' + esc(meta.useZh) + "</p>" +
      '<p class="crm-role-need-banner__floor"><span class="crm-onboard-floor-chip">' + esc(meta.floorZh) + "</span></p>";
  }

  function goToVisionStep(stepIdx) {
    state.role = "leader";
    state.step = stepIdx;
    setRoleStorage("leader");
    setStepStorage(stepIdx);
    renderVisionPanel(stepIdx);
    updateUrlRoleStep("leader", stepIdx);
  }

  function renderVisionPanel(stepIdx) {
    stepIdx = stepIdx != null && isFinite(stepIdx) ? stepIdx : getStepIndex();
    renderVisionBanner();
    renderTimelineToHost(global.document.getElementById("crmVisionTimeline"), "leader");
    var stages = BELIEVER_JOURNEY_BY_ROLE.leader || BELIEVER_JOURNEY_BY_ROLE.member;
    renderJourneyRoadmap({
      hostId: "crmVisionRoadmap",
      kicker: "⛪ 牧者戰略 · 鳥瞰六站",
      ariaLabel: "牧者戰略路線",
      scrollIdPrefix: "crm-vision-stage-",
      stages: stages
    });
    var headerHost = global.document.getElementById("crmVisionHeader");
    var map = JOURNEY_MAPS.leader;
    if (headerHost && map) {
      var hitl = map.hitl ? '<p class="crm-hitl">' + esc(map.hitl.zh) + "</p>" : "";
      headerHost.innerHTML = "<p class=\"crm-journey-kicker\"><strong>" + esc(map.roleNameZh) + "</strong> — 從高度看、從遠處看</p>" + hitl;
    }
    renderStepper("leader", stepIdx, { hostId: "crmVisionStepper", onStep: goToVisionStep });
    renderStepCard("leader", stepIdx, { hostId: "crmVisionStepCard", onPrev: goToVisionStep, onNext: goToVisionStep });
  }

  function syncOnboardUI(role) {
    role = normalizeRole(role || state.role || "member");
    if (JOURNEY_ROLES.indexOf(role) < 0) role = "member";
    renderOnboardRoleButtons(role);
    renderRoleNeedBanner(role);
    renderRoleBadge(role);
    renderOnboardTimeline(role);
    highlightRoleNav(role);
  }

  function bindOnboardRoleButtons() {
    var host = global.document.getElementById("crmOnboardRoleButtons");
    if (!host) return;
    host.addEventListener("click", function (e) {
      var btn = e.target && e.target.closest ? e.target.closest("button[data-role]") : null;
      if (!btn) return;
      var role = btn.getAttribute("data-role") || "member";
      setRoleStorage(role);
      switchMasterTab("journey");
      syncOnboardUI(role);
      selectRole(role, getStepIndex());
      try {
        var params = new URLSearchParams(global.location.search || "");
        params.set("role", role);
        params.set("tab", "journey");
        var next = global.location.pathname + "?" + params.toString();
        global.history.replaceState(null, "", next);
      } catch (urlErr) {}
    });
  }

  function filterMatch(deptKey, options) {
    options = options || {};
    var data = MATCHMAKER_DATA[deptKey];
    var board = global.document.getElementById("matchmaker-board");
    if (!data || !board) return;
    state.matchDept = deptKey;
    var tgt = linkTarget();
    var memberPath = state.role === "member";

    var rows = (data.urgentJobs || []).map(function (job) {
      var gap = job.needed - job.current;
      return "<tr><td>" + esc(job.nameZh) + "</td>" +
        "<td><span class=\"crm-job-type\">" + esc(job.typeZh) + "</span></td>" +
        '<td class="crm-job-num">' + job.needed + "</td>" +
        '<td class="crm-job-gap"><button type="button" class="crm-job-gap-link" data-scroll-to="crm-match-invite">缺 ' + gap + "</button></td></tr>";
    }).join("");

    var tableHtml =
      "<h3 class=\"crm-matchmaker__board-title\">" + esc(data.titleZh) + " · 現正急缺</h3>" +
      '<div id="crm-match-urgent" class="crm-jobs-table-wrap"><table class="crm-jobs-table"><thead><tr>' +
      "<th>職責／活動</th><th>屬性</th><th>需求</th><th>缺口</th></tr></thead><tbody>" + rows + "</tbody></table></div>";

    var hint = '<p id="crm-match-ai-hint" class="crm-matchmaker__hint">' + esc(data.aiHintZh) + "</p>";

    var inviteBlock = "";
    if (!memberPath) {
      inviteBlock =
        '<div class="crm-matchmaker__invite-draft">' +
        "<h4>💌 牧養邀請稿草稿（請審核後再轉傳 · 不自動發送）</h4>" +
        '<pre class="crm-invite-draft__text">' + esc(MEMBER_INVITE_DRAFT) + "</pre>" +
        '<button type="button" class="crm-btn-ghost" id="btnCopyMatchInviteDraft">複製邀請稿</button></div>';
    }

    var actions;
    if (memberPath) {
      actions =
        '<div id="crm-match-invite" class="crm-matchmaker__actions">' +
        '<a class="crm-journey-link crm-cta-primary" href="' + esc(GIFTS_URL) + '" target="' + tgt + '">✨ 先完成恩賜測驗（再考慮承擔崗位）</a>' +
        '<a class="crm-journey-link crm-btn-ghost" href="' + esc(REGISTER_URL) + '" target="' + tgt + '">📝 更新我的資料／表達意願</a>' +
        '<button type="button" class="crm-btn-ghost" data-goto-journey-gifts">↩ 回到「我的事奉旅程」</button></div>';
    } else {
      actions =
        '<div id="crm-match-invite" class="crm-matchmaker__actions">' +
        inviteBlock +
        '<a class="crm-journey-link crm-cta-primary" href="' + esc(CTV_URL) + '" target="' + tgt + '" data-gate="staff">進入 CTV 事奉配對 ➔</a>' +
        '<a class="crm-journey-link crm-btn-ghost" href="' + esc(data.deptPage) + '" target="' + tgt + '">部門介紹頁</a></div>';
    }

    var shiftBlock =
      '<div id="crm-match-shift" class="crm-matchmaker__section">' +
      "<h4>📅 智能排班</h4>" +
      "<p>同工答應後，用 A1 把「誰、何時、哪崗」排清楚；系統只預填，您核對後再發佈，絕不代發群組訊息。</p>" +
      '<p><a class="crm-journey-link crm-intro-inline-link" href="tools/volunteer_shift/index.html" target="' + tgt + '" data-gate="staff">📅 開啟 A1 義工排班桌 ➔</a></p></div>';

    var pastoralBlock =
      '<div id="crm-match-pastoral" class="crm-matchmaker__section">' +
      "<h4>🕊️ 同工牧養</h4>" +
      "<p>服事不是用完即丟。探訪與牧養草稿寫入事件流，讓下一棒帶領者仍看見神的作為與您的關心。</p>" +
      '<p><a class="crm-journey-link crm-intro-inline-link" href="modules/support/visitation_index.html" target="' + tgt + '" data-gate="staff">💬 探訪工作桌 ➔</a>' +
      '<span class="crm-intro-inline-sep" aria-hidden="true">·</span>' +
      '<a class="crm-journey-link crm-intro-inline-link" href="modules/support/ai-pastoral-draft.html" target="' + tgt + '" data-gate="staff">✍️ AI 牧養草稿 ➔</a></p></div>';

    board.innerHTML = tableHtml + hint + actions + shiftBlock + pastoralBlock + renderPipelineHtml();
    if (global.MatchmakerPrefill && typeof global.MatchmakerPrefill.renderImportPanelHtml === "function") {
      board.insertAdjacentHTML("beforeend", global.MatchmakerPrefill.renderImportPanelHtml());
      global.MatchmakerPrefill.bindImportPanel(board.querySelector("#crm-matchmaker-import"), function (envelope) {
        filterMatch(envelope.suggested_dept || deptKey, {
          prefill: envelope,
          mode: envelope.mode,
          scrollPrefill: true
        });
      });
    }
    if (global.PathCardsHitlPanel && typeof global.PathCardsHitlPanel.mount === "function") {
      global.PathCardsHitlPanel.mount(board, {
        prefill: options.prefill,
        mode: options.mode || (options.prefill && options.prefill.mode)
      });
    }
    board.classList.add("crm-board--filled");
    setDeptStorage(deptKey);
    bindLinks(board);
    bindGateHints(board);
    bindRoadmapScroll(board);

    if (options.prefill && options.scrollPrefill !== false) {
      setTimeout(function () {
        var el =
          board.querySelector("#crm-matchmaker-prefill") ||
          board.querySelector("#crm-path-hitl-panel");
        if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }

    if (options.prefill) {
      var toastMsg =
        options.prefill.mode === "job_seek_talent"
          ? "🔍 工找人：已載入 Tab ④ 預填包，請對照急缺與出路卡人工確認。"
          : "📋 人找工：已載入 Tab ④ 預填包，請審核出路卡後再登記試任。";
      showGateToast(toastMsg);
    }

    var copyInvite = board.querySelector("#btnCopyMatchInviteDraft");
    if (copyInvite) {
      copyInvite.addEventListener("click", function () {
        var text = MEMBER_INVITE_DRAFT;
        if (global.navigator.clipboard && global.navigator.clipboard.writeText) {
          global.navigator.clipboard.writeText(text).then(function () {
            global.alert("已複製邀請稿，請審核後再轉傳。");
          }).catch(function () { global.alert(text); });
        } else {
          global.alert(text);
        }
      });
    }

    var giftsBack = board.querySelector("[data-goto-journey-gifts]");
    if (giftsBack) {
      giftsBack.addEventListener("click", function () {
        switchMasterTab("journey");
        selectRole("member", 1);
      });
    }

    highlightDeptNav(deptKey);
  }

  function applyEntry() {
    var banner = global.document.getElementById("crmEntryBanner");
    var govFlags =
      global.GovernanceCrmBridge && typeof global.GovernanceCrmBridge.mountEntryBanner === "function"
        ? global.GovernanceCrmBridge.mountEntryBanner()
        : null;
    if (global.MatchmakerPrefill && typeof global.MatchmakerPrefill.consumeUrlImport === "function") {
      var imported = global.MatchmakerPrefill.consumeUrlImport();
      if (imported && banner) {
        banner.hidden = false;
        banner.innerHTML = esc("📥 已從 QR／連結匯入 Tab ④ 預填包 — 請審核後再登記試任。");
      }
      if (imported) {
        try {
          var impParams = new URLSearchParams(global.location.search || "");
          if (impParams.get("tab") !== "matchmaker") {
            switchMasterTab("matchmaker", {
              dept: imported.suggested_dept,
              prefill: imported,
              prefillMode: imported.mode
            });
            return;
          }
        } catch (impErr) {}
      }
    }
    try {
      var params = new URLSearchParams(global.location.search || "");
      var entry = params.get("entry");
      var role = normalizeRole(params.get("role") || "");
      var tab = params.get("tab");
      var dept = params.get("dept");
      if (entry && ENTRY_MAP[entry]) {
        var e = ENTRY_MAP[entry];
        if (banner) {
          banner.hidden = false;
          banner.innerHTML = esc(e.bannerZh);
        }
        switchMasterTab("journey");
        selectRole(e.role, getStepIndex());
        return;
      }
      if (banner && !govFlags) banner.hidden = true;
      if (tab === "matchmaker") {
        var prefill =
          global.MatchmakerPrefill && typeof global.MatchmakerPrefill.load === "function" && global.MatchmakerPrefill.load();
        var mode = params.get("mode") || (prefill && prefill.mode) || "";
        var deptKey = dept || (prefill && prefill.suggested_dept) || state.matchDept;
        if (role && JOURNEY_ROLES.indexOf(role) >= 0) syncOnboardUI(role);
        if (prefill && banner) {
          banner.hidden = false;
          banner.innerHTML = esc(
            mode === "job_seek_talent" || (prefill.mode === "job_seek_talent" && !mode)
              ? "🔍 工找人：已從 Tab ④ 帶入預填包 — 請對照左側部門急缺，人工確認後再邀請。"
              : "📋 人找工：已從 Tab ④ 帶入出路卡與邀請草稿 — 請審核後再登記試任。"
          );
        }
        switchMasterTab("matchmaker", { dept: deptKey, prefill: prefill, prefillMode: mode });
        return;
      }
      if (tab === "intro") {
        switchMasterTab("intro");
        if (role && JOURNEY_ROLES.indexOf(role) >= 0) syncOnboardUI(role);
        return;
      }
      if (tab === "vision" || role === "leader") {
        var visionStep = Number(params.get("step"));
        if (!isFinite(visionStep)) visionStep = getStepIndex();
        setRoleStorage("leader");
        setStepStorage(visionStep);
        switchMasterTab("vision");
        renderVisionPanel(visionStep);
        return;
      }
      if (role && JOURNEY_ROLES.indexOf(role) >= 0) {
        var step = Number(params.get("step"));
        if (!isFinite(step)) step = getStepIndex();
        state.role = role;
        setRoleStorage(role);
        switchMasterTab("journey");
        syncOnboardUI(role);
        selectRole(role, step);
        return;
      }
      var savedTab = getTabFromStorage();
      if (savedTab === "vision") {
        switchMasterTab("vision");
        return;
      }
      switchMasterTab(tab === "journey" ? "journey" : savedTab || "journey");
      syncOnboardUI(JOURNEY_ROLES.indexOf(state.role) >= 0 ? state.role : "member");
    } catch (e2) {
      switchMasterTab("journey");
      syncOnboardUI(state.role || "member");
    }
  }

  function bindHelpModal() {
    var modal = global.document.getElementById("crmHelpModal");
    var openBtn = global.document.getElementById("btnCrmHelpMore");
    var closeBtn = global.document.getElementById("btnCrmHelpClose");
    if (!modal || !openBtn) return;
    openBtn.addEventListener("click", function () { modal.hidden = false; });
    function close() { modal.hidden = true; }
    if (closeBtn) closeBtn.addEventListener("click", close);
    modal.addEventListener("click", function (ev) { if (ev.target === modal) close(); });
  }

  function initLanding() {
    global.document.body.classList.add("lang-zh-only");
    var savedDept = getDeptFromStorage();
    if (savedDept) state.matchDept = savedDept;
    try {
      var savedRole = global.localStorage.getItem(ROLE_KEY);
      if (savedRole && JOURNEY_MAPS[normalizeRole(savedRole)]) state.role = normalizeRole(savedRole);
      state.step = getStepIndex();
    } catch (e0) {}
    renderRoleNav();
    renderMatchmakerDepts();
    bindIntroStaticPanel();
    bindJourneyPanel();
    bindMatchmakerPanel();
    bindOnboardRoleButtons();
    var onboardRole = JOURNEY_ROLES.indexOf(state.role) >= 0 ? state.role : "member";
    syncOnboardUI(onboardRole);
    if (onboardRole && JOURNEY_MAPS[onboardRole]) {
      renderJourneyTabPanel(onboardRole);
    }
    global.document.querySelectorAll(".crm-master-tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        switchMasterTab(btn.getAttribute("data-tab"));
      });
    });
    bindHelpModal();
    applyEntry();
  }

  function initRedirect(roleOrEntry) {
    var url = "guide_crm_journey_hub.html";
    if (roleOrEntry === "learning") url += "?entry=learning";
    else if (roleOrEntry === "leader") url += "?tab=vision&role=leader";
    else if (roleOrEntry && ROLES[roleOrEntry]) url += "?role=" + roleOrEntry + "&tab=journey";
    else if (roleOrEntry === "teachers") url += "?role=teacher";
    else if (roleOrEntry === "leaders") url += "?tab=vision&role=leader";
    try {
      global.location.replace(url);
    } catch (e) {
      global.location.href = url;
    }
  }

  function educationZoneShellPair(opts) {
    opts = opts || {};
    var tab = opts.tab || "guide";
    var crm = opts.crmFrom || "hub";
    var role = opts.role || "teacher";
    /* 預設深鏈 #tab-guide；亦可 roster / attendance / discipleship / teaching */
    return {
      sidebarUrl: "church_ministry/sidebar_church_layout_v1.html?focus=c",
      contentUrl:
        "church_ministry/modules/education/education-integrated.html?crm_from=" +
        encodeURIComponent(crm) +
        "&role=" +
        encodeURIComponent(role) +
        (tab === "guide" ? "#tab-guide" : "#tab-" + tab)
    };
  }

  global.CrmJourneyBrand = {
    ROLES: ROLES,
    JOURNEY_MAPS: JOURNEY_MAPS,
    JOURNEY_BY_ROLE: JOURNEY_BY_ROLE,
    MATCHMAKER_DATA: MATCHMAKER_DATA,
    TOOL_GROUPS: TOOL_GROUPS,
    CRM_EIGHT_PRINCIPLES: CRM_EIGHT_PRINCIPLES,
    CRM_AI_ROLES: CRM_AI_ROLES,
    BELIEVER_JOURNEY_BY_ROLE: BELIEVER_JOURNEY_BY_ROLE,
    MATCHMAKER_MANAGER_STAGES: MATCHMAKER_MANAGER_STAGES,
    renderJourneyRoadmap: renderJourneyRoadmap,
    MINISTRY_DEPTS: MINISTRY_DEPTS,
    educationZoneShellPair: educationZoneShellPair,
    initLanding: initLanding,
    initRedirect: initRedirect,
    switchMasterTab: switchMasterTab,
    selectRole: selectRole,
    filterMatch: filterMatch,
    linkTarget: linkTarget
  };
})(typeof window !== "undefined" ? window : this);
