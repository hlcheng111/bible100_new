/**
 * 敬拜事工 · 服事旅程（公園導覽 SSOT）
 * 隱喻：參觀公園、百花齊放、導遊領路、賞花買花
 */
(function (win) {
  "use strict";

  var BASE = "modules/worship/";

  var GUIDES = [
    {
      id: "meili",
      name: "美莉導遊",
      emoji: "🌸",
      tagline: "溫柔、適合第一次來園的人",
      forWhom: "詩班員、基層同工、事奉小白"
    },
    {
      id: "yixuan",
      name: "以軒園長",
      emoji: "👑",
      tagline: "全景視野、適合統籌決策",
      forWhom: "敬拜部長、牧者、長執"
    },
    {
      id: "jiahe",
      name: "家禾老師",
      emoji: "⛪",
      tagline: "重禮儀與聖歷、適合崇拜學脈絡",
      forWhom: "崇拜學教授、禮儀策劃"
    },
    {
      id: "xinyi",
      name: "欣怡志工",
      emoji: "🕊️",
      tagline: "不統計、只預備、適合會眾",
      forWhom: "平信徒、外堂來賓、會眾"
    }
  ];

  /** 故事線：從「路過」到「栽種」 */
  var STORYLINE = [
    { act: "1", title: "入園 · 看見花園", hint: "認識敬拜不是行政台，而是祭壇" },
    { act: "2", title: "賞花 · 找到你的花", hint: "按恩賜試崗：詩班、音控、招待…" },
    { act: "3", title: "買花 · 帶回家栽種", hint: "排練、樂譜、本週服事小卡" },
    { act: "4", title: "守望 · 園丁彼此照應", hint: "缺席關懷、探訪、部長守望" }
  ];

  var ROUTES = [
    {
      id: "congregation",
      guideId: "xinyi",
      emoji: "🕊️",
      title: "會眾築壇徑",
      storyAct: "1",
      blurb: "只看本週詩歌與主題，不被點名統計。",
      start: BASE + "worship-together.html",
      stops: [
        { label: "會眾築壇", path: BASE + "worship-together.html" },
        { label: "本週詩歌試聽區", path: BASE + "congregational-songs.html", note: "只讀參考" }
      ]
    },
    {
      id: "volunteer",
      guideId: "meili",
      emoji: "🙋",
      title: "同工服事徑",
      storyAct: "3",
      blurb: "我的排練、我的譜、我的排班——溫暖、防呆。",
      start: BASE + "worship-integrated.html?view=volunteer",
      stops: [
        { label: "今日祭壇", path: BASE + "worship-integrated.html?view=volunteer" },
        { label: "詩班花園", path: BASE + "choir-team.html#choir-flow" },
        { label: "樂譜小徑", path: BASE + "sheet-music.html" }
      ]
    },
    {
      id: "leader",
      guideId: "yixuan",
      emoji: "🏛️",
      title: "部長總控徑",
      storyAct: "2",
      blurb: "主日一鍵策劃、人力、禮儀、報表同一故事線。",
      start: BASE + "worship-integrated.html?view=leader#plan",
      stops: [
        { label: "主日策劃大腦", path: BASE + "worship-integrated.html?view=leader", hash: "plan" },
        { label: "敬拜工作台", path: BASE + "worship-integrated.html?view=leader" },
        { label: "探訪守望", path: "modules/support/visitation_index.html?crm_from=worship" }
      ]
    },
    {
      id: "liturgy",
      guideId: "jiahe",
      emoji: "📖",
      title: "聖言禮儀徑",
      storyAct: "2",
      blurb: "講台、禮儀、講道筆記——以禮樂承載福音。",
      start: BASE + "worship-management.html",
      stops: [
        { label: "崇拜禮儀", path: BASE + "worship-management.html" },
        { label: "講壇事奉", path: BASE + "pulpit-ministry.html" },
        { label: "講道筆記", path: BASE + "sermon-notes-admin.html" }
      ]
    },
    {
      id: "priesthood",
      guideId: "meili",
      emoji: "🎼",
      title: "祭司兵器徑",
      storyAct: "3",
      blurb: "敬拜團、詩班、器樂、詩歌庫、影音同工鏈。",
      start: BASE + "worship-team-management.html",
      stops: [
        { label: "敬拜團", path: BASE + "worship-team-management.html" },
        { label: "詩班", path: BASE + "choir-team.html" },
        { label: "詩歌庫", path: BASE + "song-library.html" },
        { label: "音響", path: "modules/media/audio-team.html" },
        { label: "直播", path: "modules/media/live-streaming.html" }
      ]
    },
    {
      id: "hospitality",
      guideId: "xinyi",
      emoji: "🤝",
      title: "門廳迎客徑",
      storyAct: "4",
      blurb: "招待、出席錄入、報表——以微笑守門戶。",
      start: BASE + "hospitality.html",
      stops: [
        { label: "招待事奉", path: BASE + "hospitality.html" },
        { label: "崇拜出席", path: BASE + "attendance-management.html" },
        { label: "崇拜報表", path: BASE + "worship-reports.html" }
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
