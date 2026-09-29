/**
 * A 敬拜 16 档 · 六项内容注册表（W1）
 * pageId = 文件名不含 .html
 */
(function (win) {
  "use strict";

  var NEXT_DEFAULT = [
    { href: "worship-integrated.html", label: "🎵 敬拜主桌" },
    { href: "worship-management.html", label: "📋 崇拜流程" },
    { href: "worship-reports.html", label: "📊 崇拜报表" },
    { href: "modules/support/visitation_index.html", label: "💬 CRM 探访" }
  ];

  var BRIDGE_HTML =
    '<div class="bridge-grid">' +
    '<div class="bridge-item"><strong>会友主档</strong>memberId ↔ memberSystemData</div>' +
    '<div class="bridge-item"><strong>注册报名</strong>新同工试岗 · CRM 旅程</div>' +
    '<div class="bridge-item"><strong>活动交费</strong>外出／退修占位</div>' +
    '<div class="bridge-item"><strong>乐谱库</strong><a href="sheet-music.html">sheet-music</a></div>' +
    '<div class="bridge-item"><strong>人才媒合</strong>guide_crm_journey_hub</div>' +
    '<div class="bridge-item"><strong>AI</strong>只预填草稿，人审核后写入</div>' +
    "</div>";

  function p(cfg) {
    return Object.assign(
      {
        mode: "full",
        toolLabel: "⑦ 本页工具",
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
        "敬拜主桌统筹本周服事：团队、场次、曲目与出席。与诗班、器乐、礼仪、报表同一数据脉络。",
      org: "敬拜总监 · 主领 · 各团队负责人；人员以 memberId 对齐会友主档。",
      training: "新同工 4 周融入；年度敬拜培训与礼仪对齐。",
      performance: "主日、节期、联合崇拜场次见「崇拜礼仪」与本周战情。",
      activities: "退修、敬拜营、联合练习等活动报名（W1+ 对接 CRM）。",
      scores: "曲目与乐谱链 <a href=\"sheet-music.html\">乐谱管理</a>、<a href=\"song-library.html\">诗歌库</a>。"
    }),
    "pulpit-ministry": p({
      mode: "tool",
      title: "讲台事奉",
      emoji: "📖",
      meaning: "讲道是敬拜核心信息；本页管理讲员档案、全年讲道计划与服事统计。",
      org: "主任牧师／讲道协调 · 讲员池（内聘、客席）；讲员 memberId 对齐会友。",
      training: "讲道培训、进深课程、新讲员陪练计划。",
      performance: "主日讲道、节期信息、外出讲道日期表。",
      activities: "讲员退修、同工会、教材研读小组。",
      scores: "讲道提纲、系列大纲（可链资料库占位）。",
      rosterKey: "pulpit_speakers"
    }),
    "sermon-notes-admin": p({
      mode: "tool",
      title: "讲道笔记模板",
      emoji: "📝",
      meaning: "统一会众笔记格式，帮助跟讲、复习与小组分享。",
      org: "文宣／教育同工维护模板；与讲台事奉系列对齐。",
      training: "教导会众如何做笔记；新模板培训。",
      performance: "按主日周次发布对应模板。",
      activities: "笔记分享会、小组讨论题配套。",
      scores: "模板文件、系列 PDF 占位。"
    }),
    hospitality: p({
      mode: "tool",
      title: "招待事奉",
      emoji: "🤝",
      meaning: "以微笑迎接，帮助会众与访客在崇拜中安心专注。",
      org: "招待组长 · 门厅／停车位／儿童引导岗位。",
      training: "礼仪、安全、特殊需要接待培训。",
      performance: "主日各场招待排班。",
      activities: "招待退修、联合外展接待。",
      scores: "接待流程表、应急联络单。",
      rosterKey: "hospitality_volunteers"
    }),
    "worship-team-management": p({
      mode: "tool",
      title: "敬拜团队",
      emoji: "🎸",
      meaning: "主领、键盘、吉他、鼓等敬拜团排班与曲目管理。",
      org: "敬拜团长 · 各岗位负责人；与诗班、音响对齐。",
      training: "每周排练、新乐手融入、礼仪培训。",
      performance: "主日敬拜排班、节期特别场。",
      activities: "敬拜退修、联合排练。",
      scores: "曲目库、和弦谱链 sheet-music。",
      rosterKey: "worshipTeamData"
    }),
    "choir-team": p({ mode: "skip", title: "诗班团队", emoji: "🎵" }),
    "instrument-team": p({
      mode: "tool",
      title: "器乐团队",
      emoji: "🎻",
      meaning: "弦乐、管乐等器乐献奏与排练管理。",
      org: "器乐团长 · 声部／乐器组负责人。",
      training: "分声部排练、读谱与合奏训练。",
      performance: "主日、节期器乐献奏场次。",
      activities: "器乐联谊、联合诗班练习。",
      scores: "器乐乐谱、分谱管理。",
      rosterKey: "instrument_team_members"
    }),
    "congregational-songs": p({
      mode: "tool",
      title: "会众诗歌",
      emoji: "🎶",
      meaning: "会众诗歌选择与敬拜流程中的会众参与环节。",
      org: "敬拜团／诗班协同选择会众诗。",
      training: "会众学歌、新歌教唱计划。",
      performance: "主日会众诗单与节期诗歌。",
      activities: "诗歌工作坊、社区学歌。",
      scores: "歌词、歌谱链诗歌库。"
    }),
    "sheet-music": p({
      mode: "tool",
      title: "乐谱管理",
      emoji: "📄",
      meaning: "乐谱资产入库、声部分配与借阅追踪。",
      org: "乐谱管理员 · 各团队声部负责人。",
      training: "版权与扫描规范、分类培训。",
      performance: "主日曲目乐谱备齐检查。",
      activities: "乐谱整理义工日。",
      scores: "本页即乐谱 SSOT；链 hymn_management。"
    }),
    "song-library": p({
      mode: "tool",
      title: "诗歌库",
      emoji: "📚",
      meaning: "全库诗歌索引：主题、调性、版权与使用记录。",
      org: "敬拜统筹维护索引；团队按权限选用。",
      training: "新歌评估、神学审核流程。",
      performance: "主日／节期歌单引用本库。",
      activities: "诗歌征集、翻译协作。",
      scores: "与 sheet-music、会众诗歌互联。"
    }),
    "worship-management": p({
      mode: "tool",
      title: "崇拜礼仪",
      emoji: "📋",
      meaning: "主日流程：进堂、敬拜、信息、回应、差遣。",
      org: "崇拜总监 · 与讲台、敬拜团、诗班、招待对齐。",
      training: "礼仪培训、节期崇拜模式。",
      performance: "各场崇拜流程表与日期。",
      activities: "联合崇拜、外出崇拜流程适配。",
      scores: "流程单、曲目与经文对照。"
    }),
    "worship-reports": p({
      mode: "skip",
      title: "崇拜统计报表",
      emoji: "📊"
    }),
    "attendance-management": p({
      mode: "skip",
      title: "崇拜出席",
      emoji: "✅",
      nextLinks: [
        { href: "worship-integrated.html", label: "🎵 敬拜主桌" },
        { href: "modules/support/visitation_index.html", label: "💬 缺席探访" },
        { href: "worship-reports.html", label: "📊 报表" }
      ]
    }),
    "audio-team": p({
      mode: "tool",
      title: "音响团队",
      emoji: "🔊",
      meaning: "主日音响、录音与设备运维。",
      org: "音响组长 · 调音师轮值；与直播组配合。",
      training: "设备操作、应急演练。",
      performance: "主日、节期、外出音响排班。",
      activities: "设备保养日、技术培训。",
      scores: "设备清单、场景预设。",
      nextLinks: NEXT_DEFAULT
    }),
    "live-streaming": p({
      mode: "tool",
      title: "视频直播",
      emoji: "📹",
      meaning: "崇拜直播、多平台推流与录像归档。",
      org: "直播组长 · 摄像／导播／字幕岗位。",
      training: "直播 SOP、版权与隐私。",
      performance: "主日直播场次与回放链接。",
      activities: "设备测试、联合彩排。",
      scores: "片头片尾、流媒体资产。",
      nextLinks: NEXT_DEFAULT
    })
  };
})(window);
