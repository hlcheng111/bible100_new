/**
 * 敬拜事工 · 服事旅程（公园导览 SSOT）
 * 隐喻：参观公园、百花齐放、导游领路、赏花买花
 */
(function (win) {
  "use strict";

  var BASE = "modules/worship/";

  var GUIDES = [
    {
      id: "meili",
      name: "美莉导游",
      emoji: "🌸",
      tagline: "温柔、适合第一次来园的人",
      forWhom: "诗班员、基层同工、事奉小白"
    },
    {
      id: "yixuan",
      name: "以轩园长",
      emoji: "👑",
      tagline: "全景视野、适合统筹决策",
      forWhom: "敬拜部长、牧者、长执"
    },
    {
      id: "jiahe",
      name: "家禾老师",
      emoji: "⛪",
      tagline: "重礼仪与圣历、适合崇拜学脉络",
      forWhom: "崇拜学教授、礼仪策划"
    },
    {
      id: "xinyi",
      name: "欣怡志工",
      emoji: "🕊️",
      tagline: "不统计、只预备、适合会众",
      forWhom: "平信徒、外堂来宾、会众"
    }
  ];

  /** 故事线：从「路过」到「栽种」 */
  var STORYLINE = [
    { act: "1", title: "入园 · 看见花园", hint: "认识敬拜不是行政台，而是祭坛" },
    { act: "2", title: "赏花 · 找到你的花", hint: "按恩赐试岗：诗班、音控、招待…" },
    { act: "3", title: "买花 · 带回家栽种", hint: "排练、乐谱、本周服事小卡" },
    { act: "4", title: "守望 · 园丁彼此照应", hint: "缺席关怀、探访、部长守望" }
  ];

  var ROUTES = [
    {
      id: "congregation",
      guideId: "xinyi",
      emoji: "🕊️",
      title: "会众筑坛径",
      storyAct: "1",
      blurb: "只看本周诗歌与主题，不被点名统计。",
      start: BASE + "worship-together.html",
      stops: [
        { label: "会众筑坛", path: BASE + "worship-together.html" },
        { label: "本周诗歌试听区", path: BASE + "congregational-songs.html", note: "只读参考" }
      ]
    },
    {
      id: "volunteer",
      guideId: "meili",
      emoji: "🙋",
      title: "同工服事径",
      storyAct: "3",
      blurb: "我的排练、我的谱、我的排班——温暖、防呆。",
      start: BASE + "worship-integrated.html?view=volunteer",
      stops: [
        { label: "今日祭坛", path: BASE + "worship-integrated.html?view=volunteer" },
        { label: "诗班花园", path: BASE + "choir-team.html#choir-flow" },
        { label: "乐谱小径", path: BASE + "sheet-music.html" }
      ]
    },
    {
      id: "leader",
      guideId: "yixuan",
      emoji: "🏛️",
      title: "部长总控径",
      storyAct: "2",
      blurb: "主日一键策划、人力、礼仪、报表同一故事线。",
      start: BASE + "worship-integrated.html?view=leader#plan",
      stops: [
        { label: "主日策划大脑", path: BASE + "worship-integrated.html?view=leader", hash: "plan" },
        { label: "敬拜工作台", path: BASE + "worship-integrated.html?view=leader" },
        { label: "探访守望", path: "modules/support/visitation_index.html?crm_from=worship" }
      ]
    },
    {
      id: "liturgy",
      guideId: "jiahe",
      emoji: "📖",
      title: "圣言礼仪径",
      storyAct: "2",
      blurb: "讲台、礼仪、讲道笔记——以礼乐承载福音。",
      start: BASE + "worship-management.html",
      stops: [
        { label: "崇拜礼仪", path: BASE + "worship-management.html" },
        { label: "讲坛事奉", path: BASE + "pulpit-ministry.html" },
        { label: "讲道笔记", path: BASE + "sermon-notes-admin.html" }
      ]
    },
    {
      id: "priesthood",
      guideId: "meili",
      emoji: "🎼",
      title: "祭司兵器径",
      storyAct: "3",
      blurb: "敬拜团、诗班、器乐、诗歌库、影音同工链。",
      start: BASE + "worship-team-management.html",
      stops: [
        { label: "敬拜团", path: BASE + "worship-team-management.html" },
        { label: "诗班", path: BASE + "choir-team.html" },
        { label: "诗歌库", path: BASE + "song-library.html" },
        { label: "音响", path: "modules/media/audio-team.html" },
        { label: "直播", path: "modules/media/live-streaming.html" }
      ]
    },
    {
      id: "hospitality",
      guideId: "xinyi",
      emoji: "🤝",
      title: "门厅迎客径",
      storyAct: "4",
      blurb: "招待、出席录入、报表——以微笑守门户。",
      start: BASE + "hospitality.html",
      stops: [
        { label: "招待事奉", path: BASE + "hospitality.html" },
        { label: "崇拜出席", path: BASE + "attendance-management.html" },
        { label: "崇拜报表", path: BASE + "worship-reports.html" }
      ]
    }
  ];

  function routeById(id) {
    return ROUTES.filter(function (r) {
      return r.id === id;
    })[0];
  }

  function guideById(id) {
    return GUIDES.filter(function (g) {
      return g.id === id;
    })[0];
  }

  win.AeWorshipJourneyRegistry = {
    GUIDES: GUIDES,
    STORYLINE: STORYLINE,
    ROUTES: ROUTES,
    routeById: routeById,
    guideById: guideById
  };
})(window);
