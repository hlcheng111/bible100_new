/**
 * 小白 Sitemap · 推薦試用入口（與 landing_registry / b100_nav_ssot 對齊）
 * 全站 landing／側欄已是地圖；本資料只標「第一次該點哪裡」。
 */
(function (g) {
  "use strict";

  g.B100_SITEMAP_GUIDE = {
    intro:
      "各模組的 landing 與左欄目錄已是全站地圖。本頁只列出<strong>建議先試</strong>的功能頁，幫你在 iframe 內開啟，或另開新分頁。",
    modules: [
      {
        id: "material",
        icon: "📚",
        title: "教材與培訓",
        hint: "百步四寶 · OT/NT/T4",
        landing: {
          path: "languages/_landing/home.html",
          sidebar: "languages/index_cn.html"
        },
        tries: [
          { label: "中文百步入口", path: "languages/landing_new_cn.html", sidebar: "languages/index_cn.html" },
          { label: "舊約 OT100", path: "languages/ot_landing.html", sidebar: "languages/index_cn.html" },
          { label: "新約 NT100", path: "languages/nt_landing.html", sidebar: "languages/index_cn.html" },
          { label: "信仰四寶 T4", path: "languages/t4_landing.html", sidebar: "languages/index_cn.html" }
        ]
      },
      {
        id: "study",
        icon: "📖",
        title: "聖經研讀",
        hint: "對照 · 解讀 · 工具",
        landing: {
          path: "bible_study/_landing/home.html",
          sidebar: "bible_study/sidebar.html"
        },
        tries: [
          { label: "譯本對照", path: "bible_study/parallel_mode_v3.html", sidebar: "bible_study/sidebar.html" },
          { label: "綜合解讀", path: "bible_study/comprehensive_exegesis_reader.html?book=創世記&chapter=1", sidebar: "bible_study/sidebar.html" },
          { label: "研讀工具地圖", path: "bible_study/_landing/tools.html", sidebar: "bible_study/sidebar.html" }
        ]
      },
      {
        id: "qna",
        icon: "❓",
        title: "聖經難題",
        hint: "大類 · 來源 · 題目",
        landing: { path: "qna/_landing/home.html", sidebar: "about:blank" },
        tries: [{ label: "Q&A 工作台", path: "qna/index.html", sidebar: "about:blank" }]
      },
      {
        id: "church",
        icon: "⛪",
        title: "教會事工",
        hint: "A–E 事工 · 規劃 · 行政",
        landing: {
          path: "church_ministry/_landing/gateway.html",
          sidebar: "church_ministry/sidebar_church_layout_v1.html"
        },
        tries: [
          { label: "A 敬拜音樂", path: "church_ministry/_landing/worship.html", sidebar: "church_ministry/sidebar_church_layout_v1.html?focus=a" },
          { label: "B 牧養小組", path: "church_ministry/modules/fellowship/small-groups-integrated.html", sidebar: "church_ministry/sidebar_church_layout_v1.html?focus=b" },
          { label: "C 兒童門訓", path: "church_ministry/modules/education/education-integrated.html", sidebar: "church_ministry/sidebar_church_layout_v1.html?focus=c" },
          { label: "D 外展差傳", path: "church_ministry/modules/expansion/outreach-strategy.html", sidebar: "church_ministry/sidebar_church_layout_v1.html?focus=d" },
          { label: "E 社會服務", path: "church_ministry/tools/volunteer_shift/index.html", sidebar: "church_ministry/sidebar_church_layout_v1.html?focus=e" },
          { label: "F 詩歌應用", path: "hymn_management/index.html", sidebar: "hymn_management/sidebar_playlist.html" },
          { label: "G 規劃行政", path: "church_planning/index_plan.html", sidebar: "church_planning/sidebar_plan_v5_preview.html" }
        ]
      },
      {
        id: "school",
        icon: "🏫",
        title: "學校管理",
        hint: "課程 · 註冊",
        landing: {
          path: "school_management/_landing/home.html",
          sidebar: "school_management/sidebar.html"
        },
        tries: [
          { label: "校園總覽", path: "school_management/dashboard.html", sidebar: "school_management/sidebar.html" },
          { label: "課程註冊", path: "school_management/course_completion.html", sidebar: "school_management/sidebar.html" }
        ]
      },
      {
        id: "ai",
        icon: "🤖",
        title: "AI 輔助",
        hint: "Lab · 智慧事奉",
        landing: {
          path: "ai_tools/_landing/home.html",
          sidebar: "ai_tools/sidebar_lab.html"
        },
        tries: [
          { label: "聖經 AI Lab", path: "ai_tools/ai_lab_landing.html", sidebar: "ai_tools/sidebar_lab.html" },
          { label: "智慧事奉", path: "smart_ministry/landing.html", sidebar: "smart_ministry/sidebar.html" }
        ]
      }
    ]
  };
})(typeof window !== "undefined" ? window : this);
