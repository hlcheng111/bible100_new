/**
 * C 區 · 裝備旅程路線圖 SSOT（對齊 A 區 AeWorshipJourneyRegistry）
 */
(function (global) {
  "use strict";

  var ROUTES = [
    {
      id: "sunday",
      emoji: "📚",
      title: "主日學日常徑",
      blurb: "班級、點名、學員綁定 memberId",
      stops: [
        { label: "① 學籍·班級", tab: "roster" },
        { label: "② 出席·預警", tab: "attendance" }
      ]
    },
    {
      id: "equip",
      emoji: "🎯",
      title: "門訓裝備徑",
      blurb: "B 區寫入 · C 區唯讀銜接",
      stops: [
        { label: "③ 門訓銜接", tab: "discipleship" },
        { label: "B 門徒訓練", path: "../fellowship/pastoral-training.html?crm_from=c_education" }
      ]
    },
    {
      id: "teacher",
      emoji: "👩‍🏫",
      title: "教師備課徑",
      blurb: "課程模板 · AI 草稿 · 年度目標",
      stops: [{ label: "④ 教師·課程", tab: "teaching" }]
    },
    {
      id: "cross",
      emoji: "🔗",
      title: "跨站資源徑",
      blurb: "請用左側欄切換模組側欄",
      stops: [
        { label: "聖經教材", shell: { sidebarUrl: "bible_study/sidebar.html", contentUrl: "bible_study/dashboard.html?lang=CN" } },
        { label: "全校學籍", shell: { sidebarUrl: "school_management/sidebar.html", contentUrl: "school_management/dashboard.html" } },
        { label: "門訓動力站", shell: { contentUrl: "church_ministry/modules/development/discipleship-training.html" } },
        { label: "AI 工具", shell: { sidebarUrl: "ai_tools/sidebar.html", contentUrl: "ai_tools/dashboard.html" } }
      ]
    }
  ];

  var STORYLINE = [
    { act: 1, title: "認路", hint: "看懂三套資料邊界與 5 Tab 分工" },
    { act: 2, title: "名冊", hint: "班級 CRUD · 學員對齊會友主檔" },
    { act: 3, title: "點名", hint: "缺席 3 次自動拋 B 區 education_absence" },
    { act: 4, title: "門訓", hint: "唯讀 pastoralDiscipleship" },
    { act: 5, title: "備課", hint: "教材模板與 AI 草稿（人審）" }
  ];

  global.AeEducationJourneyRegistry = {
    ROUTES: ROUTES,
    STORYLINE: STORYLINE
  };
})(typeof window !== "undefined" ? window : this);
