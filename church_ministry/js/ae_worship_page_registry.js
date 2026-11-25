/**
 * A 敬拜 16 檔 · 六項內容註冊表（W1）
 * pageId = 文件名不含 .html
 */
(function (win) {
  "use strict";

  var NEXT_DEFAULT = [
    { href: "worship-integrated.html", label: "🎵 敬拜主桌" },
    { href: "worship-management.html", label: "📋 崇拜流程" },
    { href: "worship-reports.html", label: "📊 崇拜報表" },
    { href: "modules/support/visitation_index.html", label: "💬 CRM 探訪" }
  ];

  var BRIDGE_HTML =
    '<div class="bridge-grid">' +
    '<div class="bridge-item"><strong>會友主檔</strong>memberId ↔ memberSystemData</div>' +
    '<div class="bridge-item"><strong>註冊報名</strong>新同工試崗 · CRM 旅程</div>' +
    '<div class="bridge-item"><strong>活動交費</strong>外出／退修佔位</div>' +
    '<div class="bridge-item"><strong>樂譜庫</strong><a href="sheet-music.html">sheet-music</a></div>' +
    '<div class="bridge-item"><strong>人才媒合</strong>guide_crm_journey_hub</div>' +
    '<div class="bridge-item"><strong>AI</strong>只預填草稿，人審核後寫入</div>' +
    "</div>";

  function p(cfg) {
    return Object.assign(
      {
        mode: "full",
        toolLabel: "⑦ 本頁工具",
        rosterKey: "",
        bridgeHtml: BRIDGE_HTML,
        nextLinks: NEXT_DEFAULT.slice()
      },
      cfg
    );
  }

  win.AeWorshipPageRegistry = {
    "worship-integrated": p({
      mode: "lite",
      title: "敬拜事工工作台",
      emoji: "🎵",
      meaning:
        "敬拜主桌統籌本週服事：團隊、場次、曲目與出席。與詩班、器樂、禮儀、報表同一數據脈絡。",
      org: "敬拜總監 · 主領 · 各團隊負責人；人員以 memberId 對齊會友主檔。",
      training: "新同工 4 周融入；年度敬拜培訓與禮儀對齊。",
      performance: "主日、節期、聯合崇拜場次見「崇拜禮儀」與本週戰情。",
      activities: "退修、敬拜營、聯合練習等活動報名（W1+ 對接 CRM）。",
      scores: "曲目與樂譜鏈 <a href=\"sheet-music.html\">樂譜管理</a>、<a href=\"song-library.html\">詩歌庫</a>。"
    }),
    "pulpit-ministry": p({
      mode: "tool",
      title: "講台事奉",
      emoji: "📖",
      meaning: "講道是敬拜核心信息；本頁管理講員檔案、全年講道計劃與服事統計。",
      org: "主任牧師／講道協調 · 講員池（內聘、客席）；講員 memberId 對齊會友。",
      training: "講道培訓、進深課程、新講員陪練計劃。",
      performance: "主日講道、節期信息、外出講道日期表。",
      activities: "講員退修、同工會、教材研讀小組。",
      scores: "講道提綱、系列大綱（可鏈資料庫佔位）。",
      rosterKey: "pulpit_speakers"
    }),
    "sermon-notes-admin": p({
      mode: "tool",
      title: "講道筆記模板",
      emoji: "📝",
      meaning: "統一會眾筆記格式，幫助跟講、複習與小組分享。",
      org: "文宣／教育同工維護模板；與講台事奉系列對齊。",
      training: "教導會眾如何做筆記；新模板培訓。",
      performance: "按主日周次發佈對應模板。",
      activities: "筆記分享會、小組討論題配套。",
      scores: "模板文件、系列 PDF 佔位。"
    }),
    hospitality: p({
      mode: "tool",
      title: "招待事奉",
      emoji: "🤝",
      meaning: "以微笑迎接，幫助會眾與訪客在崇拜中安心專注。",
      org: "招待組長 · 門廳／停車位／兒童引導崗位。",
      training: "禮儀、安全、特殊需要接待培訓。",
      performance: "主日各場招待排班。",
      activities: "招待退修、聯合外展接待。",
      scores: "接待流程表、應急聯絡單。",
      rosterKey: "hospitality_volunteers"
    }),
    "worship-team-management": p({
      mode: "tool",
      title: "敬拜團隊",
      emoji: "🎸",
      meaning: "主領、鍵盤、吉他、鼓等敬拜團排班與曲目管理。",
      org: "敬拜團長 · 各崗位負責人；與詩班、音響對齊。",
      training: "每週排練、新樂手融入、禮儀培訓。",
      performance: "主日敬拜排班、節期特別場。",
      activities: "敬拜退修、聯合排練。",
      scores: "曲目庫、和絃譜鏈 sheet-music。",
      rosterKey: "worshipTeamData"
    }),
    "choir-team": p({ mode: "skip", title: "詩班團隊", emoji: "🎵" }),
    "instrument-team": p({
      mode: "tool",
      title: "器樂團隊",
      emoji: "🎻",
      meaning: "絃樂、管樂等器樂獻奏與排練管理。",
      org: "器樂團長 · 聲部／樂器組負責人。",
      training: "分聲部排練、讀譜與合奏訓練。",
      performance: "主日、節期器樂獻奏場次。",
      activities: "器樂聯誼、聯合詩班練習。",
      scores: "器樂樂譜、分譜管理。",
      rosterKey: "instrument_team_members"
    }),
    "congregational-songs": p({
      mode: "tool",
      title: "會眾詩歌",
      emoji: "🎶",
      meaning: "會眾詩歌選擇與敬拜流程中的會眾參與環節。",
      org: "敬拜團／詩班協同選擇會眾詩。",
      training: "會眾學歌、新歌教唱計劃。",
      performance: "主日會眾詩單與節期詩歌。",
      activities: "詩歌工作坊、社區學歌。",
      scores: "歌詞、歌譜鏈詩歌庫。"
    }),
    "sheet-music": p({
      mode: "tool",
      title: "樂譜管理",
      emoji: "📄",
      meaning: "樂譜資產入庫、聲部分配與借閱追蹤。",
      org: "樂譜管理員 · 各團隊聲部負責人。",
      training: "版權與掃描規範、分類培訓。",
      performance: "主日曲目樂譜備齊檢查。",
      activities: "樂譜整理義工日。",
      scores: "本頁即樂譜 SSOT；鏈 hymn_management。"
    }),
    "song-library": p({
      mode: "tool",
      title: "詩歌庫",
      emoji: "📚",
      meaning: "全庫詩歌索引：主題、調性、版權與使用記錄。",
      org: "敬拜統籌維護索引；團隊按權限選用。",
      training: "新歌評估、神學審核流程。",
      performance: "主日／節期歌單引用本庫。",
      activities: "詩歌徵集、翻譯協作。",
      scores: "與 sheet-music、會眾詩歌互聯。"
    }),
    "worship-management": p({
      mode: "tool",
      title: "崇拜禮儀",
      emoji: "📋",
      meaning: "主日流程：進堂、敬拜、信息、回應、差遣。",
      org: "崇拜總監 · 與講台、敬拜團、詩班、招待對齊。",
      training: "禮儀培訓、節期崇拜模式。",
      performance: "各場崇拜流程表與日期。",
      activities: "聯合崇拜、外出崇拜流程適配。",
      scores: "流程單、曲目與經文對照。"
    }),
    "worship-reports": p({
      mode: "skip",
      title: "崇拜統計報表",
      emoji: "📊"
    }),
    "attendance-management": p({
      mode: "skip",
      title: "崇拜出席",
      emoji: "✅",
      nextLinks: [
        { href: "worship-integrated.html", label: "🎵 敬拜主桌" },
        { href: "modules/support/visitation_index.html", label: "💬 缺席探訪" },
        { href: "worship-reports.html", label: "📊 報表" }
      ]
    }),
    "audio-team": p({
      mode: "tool",
      title: "音響團隊",
      emoji: "🔊",
      meaning: "主日音響、錄音與設備運維。",
      org: "音響組長 · 調音師輪值；與直播組配合。",
      training: "設備操作、應急演練。",
      performance: "主日、節期、外出音響排班。",
      activities: "設備保養日、技術培訓。",
      scores: "設備清單、場景預設。",
      nextLinks: NEXT_DEFAULT
    }),
    "live-streaming": p({
      mode: "tool",
      title: "視頻直播",
      emoji: "📹",
      meaning: "崇拜直播、多平台推流與錄像歸檔。",
      org: "直播組長 · 攝像／導播／字幕崗位。",
      training: "直播 SOP、版權與隱私。",
      performance: "主日直播場次與回放鏈接。",
      activities: "設備測試、聯合彩排。",
      scores: "片頭片尾、流媒體資產。",
      nextLinks: NEXT_DEFAULT
    })
  };
})(window);
