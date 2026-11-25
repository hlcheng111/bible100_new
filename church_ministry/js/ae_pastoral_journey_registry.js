/**
 * B 牧養 · 牧羊旅程 SSOT（教會話，非工程黑話）
 * 六問 · 三面鏡子 · 六條牧養路
 */
(function (win) {
  "use strict";

  var BASE = "modules/";
  var PLAN = "../../church_planning/";

  /** 三面鏡子：我是誰 · 我在哪裡 · 我去哪裡 */
  var MIRRORS = [
    {
      id: "who",
      emoji: "🪞",
      title: "我是誰",
      churchAsk: "神賜我什麼性格與恩賜？",
      blurb: "調查量表幫助認識自己，不是給人貼標籤。",
      tools: [
        { label: "恩賜探索", path: PLAN + "shape-gifts-assessment.html" },
        { label: "性格傾向（DISC）", path: PLAN + "disc-profile-assessment.html" },
        { label: "CRM 旅程 · 認識恩賜", path: "../guide_crm_journey_hub.html?tab=matchmaker&role=member" }
      ]
    },
    {
      id: "where",
      emoji: "🪟",
      title: "我在哪裡",
      churchAsk: "我看見的自己，與別人看見的，差在哪裡？",
      blurb: "約哈里窗：減少盲點，好在小組裡彼此造就。",
      tools: [
        { label: "約哈里窗", path: PLAN + "johari-window-assessment.html" },
        { label: "會友檔案（時間軸）", path: BASE + "members/member-integrated.html" }
      ]
    },
    {
      id: "whither",
      emoji: "🧭",
      title: "我去哪裡",
      churchAsk: "誰負責、誰配合、誰該被告知？",
      blurb: "事奉搭配白話：負責 · 配合 · 知情（RACI），由牧者與同工確認。",
      tools: [
        { label: "事奉媒合", path: "../guide_crm_journey_hub.html?tab=matchmaker&role=staff" },
        { label: "崗位配對", path: PLAN + "ministry-position-matchmaker.html" },
        { label: "志工事奉", path: BASE + "volunteer/volunteer-integrated.html" }
      ]
    }
  ];

  /** 牧養六問（故事線） */
  var SIX_QUESTIONS = [
    { id: "from", title: "人從何來", hint: "崇拜、課程、朋友、外展——記第一次接觸" },
    { id: "doing", title: "人在做什麼", hint: "最近有來崇拜、小組、團契嗎" },
    { id: "belong", title: "人屬什麼", hint: "小組、團契、服事團隊" },
    { id: "grow", title: "人如何長大", hint: "主日學、門訓、微小進步" },
    { id: "serve", title: "人如何服事", hint: "崗位與負荷，別一個人扛太多" },
    { id: "care", title: "誰幫他 · 他能幫誰", hint: "探訪、組長、資深信徒接力" }
  ];

  /** 同行者（導覽角色，非行政職級） */
  var COMPANIONS = [
    {
      id: "han",
      name: "瀚聲牧者",
      emoji: "⛪",
      tagline: "看全群、做決斷",
      forWhom: "主任牧師、區牧、長執"
    },
    {
      id: "lin",
      name: "林心組長",
      emoji: "🌾",
      tagline: "顧組員、記小事",
      forWhom: "小組長、團契負責人"
    },
    {
      id: "an",
      name: "安慈同工",
      emoji: "🤝",
      tagline: "接電話、跑探訪",
      forWhom: "探訪、招待、關懷同工"
    },
    {
      id: "xin",
      name: "信實弟兄",
      emoji: "🕊️",
      tagline: "只想被牧養、不想填表",
      forWhom: "會眾、初信、來賓"
    }
  ];

  var ROUTES = [
    {
      id: "sheep",
      companionId: "xin",
      emoji: "🕊️",
      title: "被牧養之路",
      questionId: "care",
      blurb: "看本週代禱與主題，不被點名統計。",
      start: BASE + "support/visitation_index.html#info",
      stops: [
        { label: "關懷說明（會眾版）", path: BASE + "support/visitation_index.html", hash: "info" },
        { label: "敬拜預備（會眾）", path: BASE + "worship/worship-together.html" }
      ],
      status: "b7"
    },
    {
      id: "cell-member",
      companionId: "xin",
      emoji: "🏠",
      title: "小組之家",
      questionId: "belong",
      blurb: "我在哪一組、這周聚會說什麼。",
      start: BASE + "fellowship/small-groups.html",
      stops: [
        { label: "小組名冊", path: BASE + "fellowship/small-groups.html" },
        { label: "教育／查經", path: BASE + "education/education-integrated.html" }
      ],
      status: "b3"
    },
    {
      id: "cell-leader",
      companionId: "lin",
      emoji: "🌾",
      title: "組長禾場",
      questionId: "grow",
      blurb: "一週快評、組員誰需要多關心；AI 只幫整理草稿。",
      start: BASE + "fellowship/small-groups.html?view=leader",
      stops: [
        { label: "小組管理", path: BASE + "fellowship/small-groups.html?view=leader" },
        { label: "探訪接案", path: BASE + "support/visitation_index.html" }
      ],
      status: "b3"
    },
    {
      id: "care",
      companionId: "an",
      emoji: "🤝",
      title: "關懷之路",
      questionId: "care",
      blurb: "探訪、病患、久未出席——清單清楚，少漏人。",
      start: BASE + "support/visitation_index.html",
      stops: [
        { label: "探訪事工", path: BASE + "support/visitation_index.html" },
        { label: "會友主檔", path: BASE + "members/member-integrated.html" }
      ],
      status: "live"
    },
    {
      id: "outreach",
      companionId: "an",
      emoji: "📣",
      title: "迎新人之路",
      questionId: "from",
      blurb: "新朋友、決志、招待轉交；可牧養也可外展。",
      start: BASE + "support/visitation_index.html",
      stops: [
        { label: "新朋友探訪", path: BASE + "support/visitation_index.html" },
        { label: "外展策略", path: BASE + "expansion/outreach-strategy.html" },
        { label: "青年團契活動", path: BASE + "development/youth-ministry-dev.html?crm_from=b_youth&step=3" }
      ],
      status: "b5"
    },
    {
      id: "fellowship",
      companionId: "lin",
      emoji: "👥",
      title: "團契的圈",
      questionId: "belong",
      blurb: "年齡、地區、職業——找同路人，不必勉強進不適合的組。",
      start: BASE + "fellowship/fellowship-circles.html",
      stops: [
        { label: "團契圈子", path: BASE + "fellowship/fellowship-circles.html" },
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
      blurb: "六問一覽、本週破口、鏈教會健康規劃。",
      start: BASE + "support/visitation_index.html",
      stops: [
        { label: "探訪總覽", path: BASE + "support/visitation_index.html" },
        { label: "健康規劃", path: PLAN + "index_plan.html" }
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
