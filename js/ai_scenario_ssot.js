/**
 * AI Lab · 情境導向 SSOT（小白一句話任務 · W1）
 */
(function (g) {
  "use strict";

  var BUILD = "20260806ai";

  var SCENARIOS = [
    {
      id: "ss_quiz_5",
      emoji: "📝",
      label: "我要幫兒童主日學出一份 5 條問題的測驗",
      prompt:
        "請為 8–10 歲兒童主日學設計 5 道聖經測驗題（含選擇題與簡答各若干），主題：好撒瑪利亞人的比喻。每題附參考經文（和合本），並附簡短教師備註。",
      bridge: "education_quiz",
      workbench: "prompt",
    },
    {
      id: "care_sms",
      emoji: "💬",
      label: "我要寫本週小組長的關懷短訊",
      prompt:
        "請草擬一則給小組組員的關懷短訊（150 字內），語氣溫暖、不嘮叨，提及本週聚會經文主題，並邀請對方回覆是否需要代禱。注明：僅為草稿，需牧者/組長人工修改後發送。",
      bridge: "pastoral_care",
      workbench: "prompt",
    },
    {
      id: "visit_note",
      emoji: "🤝",
      label: "探訪後我要整理探訪記錄草稿",
      prompt:
        "請將以下探訪口述整理為結構化探訪記錄草稿（探訪對象、日期、祷告事项、跟进建议、需转介事项），200–300 字：\n[在此贴上口述内容]",
      bridge: "visitation",
      workbench: "serve",
    },
    {
      id: "lesson_plan",
      emoji: "📖",
      label: "我要写一份主日学教案大纲",
      prompt:
        "请为主日学教师撰写 45 分钟教案大纲：经课主题、目标、破冰、经文阅读、讨论三问、应用与祷告。受众：成人查经小组。请标明需人工神学审核。",
      bridge: "education_quiz",
      workbench: "prompt",
    },
    {
      id: "shift_voice",
      emoji: "📅",
      label: "我要用口述安排下周义工排班",
      prompt:
        "下周六崇拜需要：诗班 4 人、招待 2 人、儿童主日学 3 位老师。请列出排班建议表格草稿，并注明需事工负责人确认。",
      bridge: "volunteer_shift",
      workbench: "serve",
    },
    {
      id: "outreach_copy",
      emoji: "🌍",
      label: "我要写社区外展邀请短文案",
      prompt:
        "请草拟一则社区亲子活动邀请（120字内），含时间地点占位、欢迎非信徒、不含压力式用语。附社交媒体贴文版本。",
      bridge: "outreach",
      workbench: "prompt",
    },
  ];

  var PLATFORMS = [
    { id: "chatgpt", label: "ChatGPT", url: "https://chat.openai.com/", color: "#10a37f" },
    { id: "gemini", label: "Gemini", url: "https://gemini.google.com/", color: "#4285f4" },
    { id: "kimi", label: "Kimi", url: "https://www.kimi.com/", color: "#7c3aed" },
    { id: "claude", label: "Claude", url: "https://claude.ai/", color: "#d97706" },
  ];

  g.AiScenarioSsot = {
    BUILD: BUILD,
    SCENARIOS: SCENARIOS,
    PLATFORMS: PLATFORMS,
    byId: function (id) {
      for (var i = 0; i < SCENARIOS.length; i++) {
        if (SCENARIOS[i].id === id) return SCENARIOS[i];
      }
      return null;
    },
  };
})(typeof window !== "undefined" ? window : this);
