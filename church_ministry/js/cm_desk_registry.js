/**
 * 教會事工 · 15 主桌收斂地圖（SSOT）
 * A＝主桌入口；B＝子頁磨到同水準後掛在主桌下（可進階，不進側欄主推）
 */
(function (w) {
  "use strict";

  var DESKS = [
    {
      id: "overview",
      emoji: "⛪",
      title: "事工總覽",
      blurb: "就緒度 · 今日三鈕",
      href: "dashboard_church_layout_v1.html",
      zone: "f"
    },
    {
      id: "members",
      emoji: "👥",
      title: "會友主檔",
      blurb: "名冊主鍵 · CSV",
      href: "modules/members/member-integrated.html",
      zone: "0"
    },
    {
      id: "visitation",
      emoji: "🤝",
      title: "探訪工作桌",
      blurb: "本週關懷待辦",
      href: "modules/support/visitation_index.html",
      zone: "b"
    },
    {
      id: "shifts",
      emoji: "📅",
      title: "義工排班",
      blurb: "排班主路徑",
      href: "tools/volunteer_shift/index.html",
      zone: "e"
    },
    {
      id: "volunteer",
      emoji: "👔",
      title: "志工崗位",
      blurb: "缺額配對 · 崗位",
      href: "modules/volunteer/volunteer-integrated.html",
      zone: "e"
    },
    {
      id: "worship-plan",
      emoji: "🏛️",
      title: "主日策劃",
      blurb: "部長策劃主桌",
      href: "modules/worship/worship-integrated.html?view=leader#plan",
      zone: "a"
    },
    {
      id: "sunday",
      emoji: "☀️",
      title: "主日一桌",
      blurb: "點名 · 缺席 · 數字",
      href: "modules/worship/worship-sunday-desk.html",
      zone: "a"
    },
    {
      id: "worship-team",
      emoji: "🎵",
      title: "敬拜團隊桌",
      blurb: "團隊／詩班／招待／講壇",
      href: "desks/worship-team.html",
      zone: "a"
    },
    {
      id: "pastoral",
      emoji: "🏠",
      title: "牧養小組桌",
      blurb: "四 Tab 工作桌",
      href: "modules/fellowship/pastoral-integrated.html",
      zone: "b"
    },
    {
      id: "education",
      emoji: "📚",
      title: "主日學工作桌",
      blurb: "五 Tab 殼",
      href: "modules/education/education-integrated.html",
      zone: "c"
    },
    {
      id: "outreach",
      emoji: "🌱",
      title: "外展真鏈桌",
      blurb: "需求→探訪",
      href: "modules/expansion/outreach-integrated.html",
      zone: "d"
    },
    {
      id: "congregation",
      emoji: "🚪",
      title: "會眾入口",
      blurb: "訪客／報名",
      href: "congregation/index.html",
      zone: "e"
    },
    {
      id: "finance",
      emoji: "💰",
      title: "財務工作桌",
      blurb: "交易 · 預算 · CSV",
      href: "modules/finance/finance-integrated.html",
      zone: "f"
    },
    {
      id: "admin",
      emoji: "🧰",
      title: "行政支援桌",
      blurb: "戰情 · 財務 · 會友",
      href: "modules/admin/admin-integrated.html",
      zone: "g"
    },
    {
      id: "how-to-walk",
      emoji: "🧭",
      title: "教會事工怎麼走",
      blurb: "規劃｜日常認路",
      href: "vision_and_plan.html#how-to-walk",
      zone: "0"
    }
  ];

  /** 子頁 → 所屬主桌（磨平後仍可深鏈） */
  var PAGE_TO_DESK = {
    "worship-sunday-desk": "sunday",
    "attendance-management": "sunday",
    "worship-reports": "sunday",
    "worship-integrated": "worship-plan",
    "pulpit-ministry": "worship-team",
    "hospitality": "worship-team",
    "worship-team-management": "worship-team",
    "choir-team": "worship-team",
    "instrument-team": "worship-team",
    "sermon-notes-admin": "worship-team",
    "congregational-songs": "worship-team",
    "sheet-music": "worship-team",
    "song-library": "worship-team",
    "worship-management": "worship-team",
    "audio-team": "worship-team",
    "live-streaming": "worship-team",
    "worship-together": "worship-plan",
    "pastoral-integrated": "pastoral",
    "small-groups-integrated": "pastoral",
    "pastoral-attendance": "pastoral",
    "pastoral-events": "pastoral",
    "pastoral-org-roster": "pastoral",
    "pastoral-strategy": "pastoral",
    "fellowship-circles": "pastoral",
    "youth-ministry-dev": "pastoral",
    "visitation_index": "visitation",
    "outreach-integrated": "outreach",
    "outreach-strategy": "outreach",
    "community-assessment": "outreach",
    "mission-opportunities": "outreach",
    "new-ministry-planning": "outreach",
    "church-planting": "outreach",
    "branch-management": "outreach",
    "mission-expansion": "outreach",
    "cross-cultural": "outreach",
    "new-media": "outreach",
    "innovation-projects": "outreach",
    "technology-integration": "outreach",
    "volunteer-integrated": "volunteer",
    "member-integrated": "members",
    "finance-integrated": "finance",
    "admin-integrated": "admin",
    "equipment-management": "admin",
    "library-management": "admin",
    "workflow": "admin",
    "smart-reminders": "admin",
    "technical-support": "admin",
    "education-integrated": "education",
    "dashboard": "overview",
    "dashboard_church_layout_v1": "overview"
  };

  function deskById(id) {
    for (var i = 0; i < DESKS.length; i++) if (DESKS[i].id === id) return DESKS[i];
    return null;
  }

  function deskHref(desk, cmPre) {
    cmPre = cmPre || "";
    if (!desk) return cmPre + "desks/index.html";
    return cmPre + desk.href;
  }

  w.CmDeskRegistry = {
    desks: DESKS,
    pageToDesk: PAGE_TO_DESK,
    deskById: deskById,
    deskHref: deskHref,
    count: DESKS.length
  };
})(typeof window !== "undefined" ? window : this);
