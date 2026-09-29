/**
 * 全站模块功能页 · 两层地图（源自部署报告模块清单，仅保留可试用功能页）
 * 工具总览 / Sitemap 共用；不含 dashboard、工程报告上半部。
 */
(function (g) {
  "use strict";

  g.B100_SITE_MODULES_MAP = {
    title: "全站模块 · 功能页地图",
    lead: "各模块 landing 与侧栏已是地图；本页只列<strong>建议试用的功能页</strong>（两层：模块 → 页面）。",
    modules: [
      {
        id: "material",
        icon: "📚",
        title: "教材与培训 Languages",
        tries: [
          { label: "百步四宝路线", path: "languages/_landing/home.html", sidebar: "languages/index_cn.html" },
          { label: "中文百步入口", path: "languages/landing_new_cn.html", sidebar: "languages/index_cn.html" },
          { label: "旧约 OT100", path: "languages/ot_landing.html", sidebar: "languages/index_cn.html" },
          { label: "新约 NT100", path: "languages/nt_landing.html", sidebar: "languages/index_cn.html" },
          { label: "信仰四宝 T4", path: "languages/t4_landing.html", sidebar: "languages/index_cn.html" }
        ]
      },
      {
        id: "study",
        icon: "📖",
        title: "圣经研读 Bible Study",
        tries: [
          { label: "研读路线", path: "bible_study/_landing/home.html", sidebar: "bible_study/sidebar.html" },
          { label: "译本对照", path: "bible_study/parallel_mode_v3.html", sidebar: "bible_study/sidebar.html" },
          { label: "综合解读", path: "bible_study/comprehensive_exegesis_reader.html?book=創世記&chapter=1", sidebar: "bible_study/sidebar.html" },
          { label: "词典", path: "bible_study/dictionary_reader.html", sidebar: "bible_study/sidebar.html" },
          { label: "串珠", path: "bible_study/crossref_reader.html", sidebar: "bible_study/sidebar.html" },
          { label: "全文搜索", path: "bible_study/search_reader.html", sidebar: "bible_study/sidebar.html" }
        ]
      },
      {
        id: "qna",
        icon: "❓",
        title: "圣经难题 Q&A",
        tries: [
          { label: "Q&A 工作台", path: "qna/index.html", sidebar: "about:blank" },
          { label: "难题路线图", path: "qna/_landing/home.html", sidebar: "about:blank" }
        ]
      },
      {
        id: "church",
        icon: "⛪",
        title: "教会事工 Church Ministry",
        tries: [
          { label: "A 敬拜音乐", path: "church_ministry/_landing/worship.html", sidebar: "church_ministry/sidebar_church_layout_v1.html?focus=a" },
          { label: "B 牧养小组", path: "church_ministry/modules/fellowship/small-groups-integrated.html", sidebar: "church_ministry/sidebar_church_layout_v1.html?focus=b" },
          { label: "C 儿童门训", path: "church_ministry/modules/education/education-integrated.html", sidebar: "church_ministry/sidebar_church_layout_v1.html?focus=c" },
          { label: "D 外展差传", path: "church_ministry/modules/expansion/outreach-strategy.html", sidebar: "church_ministry/sidebar_church_layout_v1.html?focus=d" },
          { label: "E 社会服务", path: "church_ministry/tools/volunteer_shift/index.html", sidebar: "church_ministry/sidebar_church_layout_v1.html?focus=e" },
          { label: "F 诗歌应用", path: "hymn_management/index.html", sidebar: "hymn_management/sidebar_playlist.html" },
          { label: "G 规划行政", path: "church_planning/index_plan.html", sidebar: "church_planning/sidebar_plan_v5_preview.html" },
          { label: "探访工作台", path: "church_ministry/modules/support/visitation_index.html", sidebar: "church_ministry/sidebar_church_layout_v1.html?focus=b" }
        ]
      },
      {
        id: "school",
        icon: "🏫",
        title: "学校管理 School",
        tries: [
          { label: "校园路线", path: "school_management/_landing/home.html", sidebar: "school_management/sidebar.html" },
          { label: "课程注册", path: "school_management/course_completion.html", sidebar: "school_management/sidebar.html" },
          { label: "学生管理", path: "school_management/manage/students/index.html", sidebar: "school_management/sidebar.html" }
        ]
      },
      {
        id: "ai",
        icon: "🤖",
        title: "AI 工具 AI Tools",
        tries: [
          { label: "AI 路线", path: "ai_tools/_landing/home.html", sidebar: "ai_tools/sidebar_lab.html" },
          { label: "圣经 AI Lab", path: "ai_tools/ai_lab_landing.html", sidebar: "ai_tools/sidebar_lab.html" },
          { label: "文生图/创作", path: "ai_tools/tools/creative_tools_landing.html", sidebar: "ai_tools/sidebar_lab.html" }
        ]
      },
      {
        id: "smart",
        icon: "💡",
        title: "智慧事奉 Smart Ministry",
        tries: [
          { label: "事奉入口", path: "smart_ministry/landing.html", sidebar: "smart_ministry/sidebar.html" },
          { label: "人才事工配对", path: "smart_ministry/talent_ministry_matching.html", sidebar: "smart_ministry/sidebar.html" }
        ]
      },
      {
        id: "hymn",
        icon: "🎵",
        title: "诗歌管理 Hymn",
        tries: [
          { label: "2015 首播放", path: "hymn_management/index.html", sidebar: "hymn_management/sidebar_playlist.html" },
          { label: "诗歌编辑", path: "hymn_management/hymn_editor.html", sidebar: "hymn_management/sidebar_playlist.html" },
          { label: "PPT 生成", path: "hymn_management/ppt_generator.html", sidebar: "hymn_management/sidebar_playlist.html" }
        ]
      }
    ]
  };

  /* 兼容旧名 */
  g.B100_SITEMAP_GUIDE = {
    intro: g.B100_SITE_MODULES_MAP.lead,
    modules: g.B100_SITE_MODULES_MAP.modules.map(function (m) {
      return {
        id: m.id,
        icon: m.icon,
        title: m.title,
        hint: "",
        landing: m.tries && m.tries[0] ? { path: m.tries[0].path, sidebar: m.tries[0].sidebar } : null,
        tries: m.tries || []
      };
    })
  };
})(typeof window !== "undefined" ? window : this);
