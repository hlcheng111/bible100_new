/**
 * B 牧养 · 牧羊旅程 SSOT（教会话，非工程黑话）
 * 六问 · 三面镜子 · 六条牧养路
 */
(function (win) {
  "use strict";

  var BASE = "modules/";
  var PLAN = "../../church_planning/";

  /** 三面镜子：我是谁 · 我在哪里 · 我去哪里 */
  var MIRRORS = [
    {
      id: "who",
      emoji: "🪞",
      title: "我是谁",
      churchAsk: "神赐我什么性格与恩赐？",
      blurb: "调查量表帮助认识自己，不是给人贴标签。",
      tools: [
        { label: "恩赐探索", path: PLAN + "shape-gifts-assessment.html" },
        { label: "性格倾向（DISC）", path: PLAN + "disc-profile-assessment.html" },
        { label: "CRM 旅程 · 认识恩赐", path: "../guide_crm_journey_hub.html?tab=matchmaker&role=member" }
      ]
    },
    {
      id: "where",
      emoji: "🪟",
      title: "我在哪里",
      churchAsk: "我看见的自己，与别人看见的，差在哪里？",
      blurb: "约哈里窗：减少盲点，好在小组里彼此造就。",
      tools: [
        { label: "约哈里窗", path: PLAN + "johari-window-assessment.html" },
        { label: "会友档案（时间轴）", path: BASE + "members/member-integrated.html" }
      ]
    },
    {
      id: "whither",
      emoji: "🧭",
      title: "我去哪里",
      churchAsk: "谁负责、谁配合、谁该被告知？",
      blurb: "事奉搭配白话：负责 · 配合 · 知情（RACI），由牧者与同工确认。",
      tools: [
        { label: "事奉媒合", path: "../guide_crm_journey_hub.html?tab=matchmaker&role=staff" },
        { label: "岗位配对", path: PLAN + "ministry-position-matchmaker.html" },
        { label: "志工事奉", path: BASE + "volunteer/volunteer-integrated.html" }
      ]
    }
  ];

  /** 牧养六问（故事线） */
  var SIX_QUESTIONS = [
    { id: "from", title: "人从何来", hint: "崇拜、课程、朋友、外展——记第一次接触" },
    { id: "doing", title: "人在做什么", hint: "最近有来崇拜、小组、团契吗" },
    { id: "belong", title: "人属什么", hint: "小组、团契、服事团队" },
    { id: "grow", title: "人如何长大", hint: "主日学、门训、微小进步" },
    { id: "serve", title: "人如何服事", hint: "岗位与负荷，别一个人扛太多" },
    { id: "care", title: "谁帮他 · 他能帮谁", hint: "探访、组长、资深信徒接力" }
  ];

  /** 同行者（导览角色，非行政职级） */
  var COMPANIONS = [
    {
      id: "han",
      name: "瀚声牧者",
      emoji: "⛪",
      tagline: "看全群、做决断",
      forWhom: "主任牧师、区牧、长执"
    },
    {
      id: "lin",
      name: "林心组长",
      emoji: "🌾",
      tagline: "顾组员、记小事",
      forWhom: "小组长、团契负责人"
    },
    {
      id: "an",
      name: "安慈同工",
      emoji: "🤝",
      tagline: "接电话、跑探访",
      forWhom: "探访、招待、关怀同工"
    },
    {
      id: "xin",
      name: "信实弟兄",
      emoji: "🕊️",
      tagline: "只想被牧养、不想填表",
      forWhom: "会众、初信、来宾"
    }
  ];

  var ROUTES = [
    {
      id: "sheep",
      companionId: "xin",
      emoji: "🕊️",
      title: "被牧养之路",
      questionId: "care",
      blurb: "看本周代祷与主题，不被点名统计。",
      start: BASE + "support/visitation_index.html#info",
      stops: [
        { label: "关怀说明（会众版）", path: BASE + "support/visitation_index.html", hash: "info" },
        { label: "敬拜预备（会众）", path: BASE + "worship/worship-together.html" }
      ],
      status: "b7"
    },
    {
      id: "cell-member",
      companionId: "xin",
      emoji: "🏠",
      title: "小组之家",
      questionId: "belong",
      blurb: "我在哪一组、这周聚会说什么。",
      start: BASE + "fellowship/small-groups.html",
      stops: [
        { label: "小组名册", path: BASE + "fellowship/small-groups.html" },
        { label: "教育／查经", path: BASE + "education/education-integrated.html" }
      ],
      status: "b3"
    },
    {
      id: "cell-leader",
      companionId: "lin",
      emoji: "🌾",
      title: "组长禾场",
      questionId: "grow",
      blurb: "一周快评、组员谁需要多关心；AI 只帮整理草稿。",
      start: BASE + "fellowship/small-groups.html?view=leader",
      stops: [
        { label: "小组管理", path: BASE + "fellowship/small-groups.html?view=leader" },
        { label: "探访接案", path: BASE + "support/visitation_index.html" }
      ],
      status: "b3"
    },
    {
      id: "care",
      companionId: "an",
      emoji: "🤝",
      title: "关怀之路",
      questionId: "care",
      blurb: "探访、病患、久未出席——清单清楚，少漏人。",
      start: BASE + "support/visitation_index.html",
      stops: [
        { label: "探访事工", path: BASE + "support/visitation_index.html" },
        { label: "会友主档", path: BASE + "members/member-integrated.html" }
      ],
      status: "live"
    },
    {
      id: "outreach",
      companionId: "an",
      emoji: "📣",
      title: "迎新人之路",
      questionId: "from",
      blurb: "新朋友、决志、招待转交；可牧养也可外展。",
      start: BASE + "support/visitation_index.html",
      stops: [
        { label: "新朋友探访", path: BASE + "support/visitation_index.html" },
        { label: "外展策略", path: BASE + "expansion/outreach-strategy.html" },
        { label: "青年团契活动", path: BASE + "development/youth-ministry-dev.html?crm_from=b_youth&step=3" }
      ],
      status: "b5"
    },
    {
      id: "fellowship",
      companionId: "lin",
      emoji: "👥",
      title: "团契的圈",
      questionId: "belong",
      blurb: "年龄、地区、职业——找同路人，不必勉强进不适合的组。",
      start: BASE + "fellowship/fellowship-circles.html",
      stops: [
        { label: "团契圈子", path: BASE + "fellowship/fellowship-circles.html" },
        { label: "事奉媒合", path: "../guide_crm_journey_hub.html?tab=matchmaker" }
      ],
      status: "b4"
    },
    {
      id: "shepherd",
      companionId: "han",
      emoji: "⛪",
      title: "牧者守望",
      questionId: "from",
      blurb: "六问一览、本周破口、链教会健康规划。",
      start: BASE + "support/visitation_index.html",
      stops: [
        { label: "探访总览", path: BASE + "support/visitation_index.html" },
        { label: "健康规划", path: PLAN + "index_plan.html" }
      ],
      status: "b2"
    }
  ];

  function companionById(id) {
    for (var i = 0; i < COMPANIONS.length; i++) {
      if (COMPANIONS[i].id === id) return COMPANIONS[i];
    }
    return null;
  }

  win.AePastoralJourneyRegistry = {
    MIRRORS: MIRRORS,
    SIX_QUESTIONS: SIX_QUESTIONS,
    COMPANIONS: COMPANIONS,
    ROUTES: ROUTES,
    companionById: companionById
  };
})(window);
