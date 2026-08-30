/**
 * B100 · 导航 SSOT（侧栏树 + 路线图 · 唯一真相）
 * 顶栏进模块 → 旧工作侧栏；右栏 landing 路线图与侧栏同色、链接为真实路径。
 */
(function (g) {
  "use strict";

  g.B100_MODE_REGISTRY = {
    material: {
      workSidebar: "languages/index_cn.html",
      defaultContent: "languages/_landing/home.html"
    },
    study: {
      workSidebar: "bible_study/sidebar.html",
      defaultContent: "bible_study/_landing/home.html"
    },
    qna: {
      workSidebar: "about:blank",
      defaultContent: "qna/index.html"
    },
    church: {
      workSidebar: "church_ministry/sidebar_church_layout_v1.html",
      defaultContent: "church_ministry/_landing/gateway.html"
    },
    school: {
      workSidebar: "school_management/sidebar.html",
      defaultContent: "school_management/_landing/home.html"
    },
    ai: {
      workSidebar: "ai_tools/sidebar_lab.html",
      defaultContent: "ai_tools/_landing/home.html"
    },
    tools: {
      workSidebar: "nav_hub/sidebar_modules_map.html",
      defaultContent: "nav_hub/site_modules_sitemap.html"
    }
  };

  g.B100_SIDEBAR_META = {
    site: { title: "🗺️ 全站地圖", tone: "site", hint: "▸ 点模块展开；点链接前进（默认只显示第一层）。" },
    material: { title: "📚 教材與培訓", tone: "material", hint: "百步四寶 · 門訓動力 · 与右栏路线图同色。" },
    study: { title: "📖 聖經研讀", tone: "study", hint: "四阶主線 · 点 ▸ 展开分支。" },
    qna: { title: "❓ 聖經難題", tone: "qna", hint: "四层查题。" },
    church: { title: "⛪ 教會事工", tone: "church-plan", hint: "规划 · 行政 · 使命。" },
    school: { title: "🏫 學校管理", tone: "school", hint: "校园主線。" },
    ai: { title: "🤖 AI 輔助", tone: "ai", hint: "A–E 任務主線 · 草稿須人審。" },
    tools: { title: "🧰 工具總覽", tone: "tools", hint: "先選任務 · 圖示路線 · 詳表在進階。" }
  };

  g.B100_SIDEBAR_TREES = {
    site: {
      home: { label: "🏠 全站首頁", tone: "site", nav: { action: "siteHome" } },
      modules: [
        {
          label: "① 教材與培訓", tone: "material", enterLabel: "→ 进入模块",
          nav: { mode: "material" },
          children: [
            { label: "百步四寶路線圖", tone: "material", level: 2, nav: { mode: "material", contentUrl: "languages/_landing/home.html" } },
            { label: "舊約 OT100 總覽", tone: "material", level: 3, nav: { mode: "material", contentUrl: "languages/ot_landing.html" } },
            { label: "新約 NT100 總覽", tone: "material", level: 3, nav: { mode: "material", contentUrl: "languages/nt_landing.html" } },
            { label: "信仰四寶 T4", tone: "material", level: 3, nav: { mode: "material", contentUrl: "languages/t4_landing.html" } },
            { label: "門訓動力站 · 無愧工人", tone: "material", level: 2, nav: { mode: "material", sidebarUrl: "disciple_dynamics/sidebar.html", contentUrl: "disciple_dynamics/dashboard.html" } }
          ]
        },
        {
          label: "② 聖經研讀", tone: "study", enterLabel: "→ 进入模块",
          nav: { mode: "study" },
          children: [
            { label: "研讀路線圖", tone: "study", level: 2, nav: { mode: "study", contentUrl: "bible_study/_landing/home.html" } },
            { label: "譯本對照", tone: "study", level: 3, nav: { mode: "study", contentUrl: "bible_app/shell/pages/reader-multilang.html" } },
            { label: "聖經跑道", tone: "study", level: 2, nav: { mode: "study", contentUrl: "bible_app/shell/pages/landing.html" } },
            { label: "綜合解讀", tone: "study", level: 3, nav: { mode: "study", contentUrl: "bible_study/comprehensive_exegesis_reader.html?book=創世記&chapter=1" } }
          ]
        },
        {
          label: "③ 聖經難題", tone: "qna", enterLabel: "→ 进入模块",
          nav: { mode: "qna" },
          children: [
            { label: "難題路線圖", tone: "qna", level: 2, nav: { mode: "qna", contentUrl: "qna/_landing/home.html" } },
            { label: "Q&A 工作台", tone: "qna", level: 3, nav: { mode: "qna", contentUrl: "qna/index.html" } }
          ]
        },
        {
          label: "④ 教會事工", tone: "church-plan", enterLabel: "→ 进入模块",
          nav: { mode: "church" },
          children: [
            { label: "A–G 路線圖", tone: "church-plan", level: 2, nav: { mode: "church", contentUrl: "church_ministry/_landing/gateway.html" } },
            { label: "G 規劃行政", tone: "church-plan", level: 3, nav: { sidebarUrl: "church_planning/sidebar_plan_v5_preview.html", contentUrl: "church_planning/index_plan.html" } },
            { label: "數據儀表", tone: "church-admin", level: 3, nav: { sidebarUrl: "church_planning/sidebar_plan_v5_preview.html", contentUrl: "church_ministry/dashboard.html?crm_from=planning_step6" } },
            { label: "🎙️ 口述預填 5F", tone: "ai", level: 3, nav: { sidebarUrl: "church_planning/sidebar_plan_v5_preview.html", contentUrl: "ai_tools/pages/crm_automation_console.html" } }
          ]
        },
        {
          label: "⑤ 學校管理", tone: "school", enterLabel: "→ 进入模块",
          nav: { mode: "school" },
          children: [
            { label: "校園路線圖", tone: "school", level: 2, nav: { mode: "school", contentUrl: "school_management/_landing/home.html" } },
            { label: "A 招生入學", tone: "school", level: 3, nav: { mode: "school", contentUrl: "school_management/enrollment_brochure.html" } },
            { label: "B 學籍教務", tone: "school", level: 3, nav: { mode: "school", contentUrl: "school_management/manage/students_tabs.html" } },
            { label: "★ 課程註冊", tone: "school", level: 3, nav: { mode: "school", contentUrl: "school_management/course_completion.html" } },
            { label: "E 教會連結", tone: "church-admin", level: 3, nav: { mode: "school", contentUrl: "school_management/manage/church_link/index.html" } }
          ]
        },
        {
          label: "⑥ AI 輔助", tone: "ai", enterLabel: "→ 进入模块",
          nav: { mode: "ai" },
          children: [
            { label: "AI 路線圖", tone: "ai", level: 2, nav: { mode: "ai", contentUrl: "ai_tools/_landing/home.html" } },
            { label: "A 导读学经", tone: "ai", level: 3, nav: { mode: "ai", contentUrl: "ai_tools/pages/guide_reading_hub.html" } },
            { label: "B 备课师训", tone: "ai", level: 3, nav: { mode: "ai", contentUrl: "ai_tools/tools/bible_prompt_generator.html" } },
            { label: "D CRM 口述", tone: "ai", level: 3, nav: { mode: "ai", contentUrl: "ai_tools/pages/crm_automation_console.html" } }
          ]
        }
      ]
    },

    material: {
      route: { title: "📚 屏 1 · 教材與培訓 · 地鐵主線", lead: "百步四寶 → 教導 → 門訓動力（無愧工人）。左欄隨入口切換百步目錄或門訓側欄。" },
      home: { label: "🏠 路線首頁", tone: "material", nav: { mode: "material", contentUrl: "languages/_landing/home.html" } },
      modules: [
        {
          stationLabel: "S0", title: "認識動作版", desc: "讀 · 背 · 應用 · 教導", label: "S0 認識動作版", tone: "material",
          nav: { mode: "material", contentUrl: "languages/landing_new_cn.html" }
        },
        {
          stationLabel: "S1", title: "舊約百步 OT100", desc: "創世記 → 瑪拉基 · 100 步", label: "S1 舊約百步 OT100", tone: "material", highlight: true,
          nav: { mode: "material", contentUrl: "languages/ot_landing.html" },
          children: [
            { label: "OT 總覽", tone: "material", level: 2, nav: { mode: "material", contentUrl: "languages/ot_landing.html" } },
            { label: "OT 第一課", tone: "material", level: 3, nav: { mode: "material", contentUrl: "languages/cn/OT/chapters/chapter1.html" } }
          ]
        },
        {
          stationLabel: "S2", title: "新約百步 NT100", desc: "馬太 → 啟示 · 100 步", label: "S2 新約百步 NT100", tone: "material",
          nav: { mode: "material", contentUrl: "languages/nt_landing.html" },
          children: [
            { label: "NT 總覽", tone: "material", level: 2, nav: { mode: "material", contentUrl: "languages/nt_landing.html" } },
            { label: "NT 第一課", tone: "material", level: 3, nav: { mode: "material", contentUrl: "languages/cn/NT/chapters/chapter1.html" } }
          ]
        },
        {
          stationLabel: "S3", title: "信仰四寶 T4", desc: "約 3:16 · 主禱文 · 使徒信經 · 軍裝", label: "S3 信仰四寶 T4", tone: "material",
          nav: { mode: "material", contentUrl: "languages/t4_landing.html" }
        },
        {
          stationLabel: "S4", title: "我要教 · 助手→教師", desc: "五級階梯 · 備課工作流", label: "S4 ★ 我要教", tone: "material", highlight: true,
          nav: { mode: "material", contentUrl: "help/bible100_curriculum_manual.html" },
          children: [
            { label: "百步四寶總論手冊", tone: "material", level: 2, nav: { sidebarUrl: "help/sidebar_help.html", contentUrl: "help/bible100_curriculum_manual.html" } },
            { label: "AI 備課 Lab", tone: "ai", level: 3, nav: { sidebarUrl: "ai_tools/sidebar_lab.html", contentUrl: "ai_tools/ai_lab_landing.html" } }
          ]
        },
        {
          stationLabel: "S5", title: "門訓動力站 · 無愧工人", desc: "C–G 培訓教材 · Dashboard", label: "S5 門訓動力", tone: "material", highlight: true,
          nav: { mode: "material", sidebarUrl: "disciple_dynamics/sidebar.html", contentUrl: "disciple_dynamics/dashboard.html" },
          children: [
            { label: "培訓總覽 Dashboard", tone: "material", level: 2, nav: { mode: "material", sidebarUrl: "disciple_dynamics/sidebar.html", contentUrl: "disciple_dynamics/dashboard.html" } },
            { label: "無愧工人說明", tone: "material", level: 3, nav: { mode: "material", sidebarUrl: "disciple_dynamics/sidebar.html", contentUrl: "disciple_dynamics/dashboard.html#wuqian" } },
            { label: "基要真理", tone: "material", level: 3, nav: { mode: "material", sidebarUrl: "disciple_dynamics/sidebar.html", contentUrl: "disciple_dynamics/c/doctrine_basics.html" } }
          ]
        }
      ],
      footer: [{ label: "🏠 回全站", tone: "site", level: 2, nav: { action: "siteHome" } }]
    },

    study: {
      route: { title: "📖 屏 1 · 研讀主線", lead: "對照 → 解讀 → 工具 → 地理歷史 → 聖經跑道（每日讀經 App 殼）。" },
      home: { label: "🏠 路線首頁", tone: "study", nav: { mode: "study", contentUrl: "bible_study/_landing/home.html" } },
      modules: [
        { stationLabel: "1", title: "譯本對照", desc: "多語並排", label: "1 譯本對照", tone: "study", highlight: true, nav: { mode: "study", contentUrl: "bible_study/parallel_mode_v3.html" } },
        { stationLabel: "2", title: "綜合解讀", desc: "釋經參讀", label: "2 綜合解讀", tone: "study", nav: { mode: "study", contentUrl: "bible_study/comprehensive_exegesis_reader.html?book=創世記&chapter=1" } },
        {
          stationLabel: "3", title: "工具地圖", desc: "詞典 · 串珠 · 搜尋", label: "3 工具地圖", tone: "study",
          nav: { mode: "study", contentUrl: "bible_study/_landing/tools.html" },
          children: [
            { label: "詞典", tone: "study", level: 2, nav: { mode: "study", contentUrl: "bible_study/dictionary_reader.html" } },
            { label: "串珠", tone: "study", level: 2, nav: { mode: "study", contentUrl: "bible_study/crossref_reader.html" } }
          ]
        },
        { stationLabel: "4", title: "地理歷史", desc: "背景 · 地圖", label: "4 地理歷史", tone: "study", nav: { mode: "study", contentUrl: "bible_study/_landing/geography_history.html" } },
        {
          stationLabel: "5", title: "聖經跑道", desc: "每日關卡 · 四跑道 · shell", label: "5 ★ 聖經跑道", tone: "study", highlight: true,
          nav: { mode: "study", contentUrl: "bible_app/shell/pages/landing.html" },
          children: [
            { label: "跑道 landing（Hub 右欄）", tone: "study", level: 2, nav: { mode: "study", contentUrl: "bible_app/shell/pages/landing.html" } },
            { label: "正式入口 index（轉址）", tone: "study", level: 3, nav: { mode: "study", contentUrl: "bible_app/index.html" } }
          ]
        }
      ],
      footer: [{ label: "🏠 回全站", tone: "site", level: 2, nav: { action: "siteHome" } }]
    },

    qna: {
      route: { title: "❓ 屏 1 · 難題四層", lead: "大類 → 來源 → 題目 → 備課素材。" },
      home: { label: "🏠 路線首頁", tone: "qna", nav: { mode: "qna", contentUrl: "qna/_landing/home.html" } },
      modules: [
        {
          stationLabel: "L1", title: "大類入口", desc: "A/B/C 類", label: "L1 大類入口", tone: "qna",
          nav: { mode: "qna", contentUrl: "qna/index.html" },
          children: [
            { label: "A 類", tone: "qna", level: 2, nav: { mode: "qna", contentUrl: "qna/index.html?cat=A" } },
            { label: "B 類", tone: "qna", level: 2, nav: { mode: "qna", contentUrl: "qna/index.html?cat=B" } },
            { label: "C 類", tone: "qna", level: 2, nav: { mode: "qna", contentUrl: "qna/index.html?cat=C" } }
          ]
        },
        {
          stationLabel: "L2", title: "來源選擇", desc: "GotQuestions · Etspedia", label: "L2 來源選擇", tone: "qna",
          nav: { mode: "qna", contentUrl: "qna/index.html" },
          children: [
            { label: "GotQuestions", tone: "qna", level: 2, nav: { mode: "qna", contentUrl: "qna/index.html?cat=A&src=gotquestions" } },
            { label: "Etspedia", tone: "qna", level: 2, nav: { mode: "qna", contentUrl: "qna/index.html?cat=A&src=equiptoserve_etspedia" } }
          ]
        },
        { stationLabel: "L3", title: "題目與解答", desc: "原站 iframe", label: "L3 ★ 題目與解答", tone: "qna", highlight: true, nav: { mode: "qna", contentUrl: "qna/index.html" } },
        { stationLabel: "L4", title: "備課素材", desc: "AI 草稿", label: "L4 備課 · AI", tone: "ai", nav: { sidebarUrl: "ai_tools/sidebar_lab.html", contentUrl: "ai_tools/ai_lab_landing.html" } }
      ],
      footer: [{ label: "🏠 回全站", tone: "site", level: 2, nav: { action: "siteHome" } }]
    },

    church: {
      route: { title: "⛪ 教會事工 A–G", lead: "頂欄第二列即 A–G；右欄路線圖含會友主檔入口。" },
      home: { label: "🏠 路線首頁", tone: "church-plan", nav: { mode: "church", contentUrl: "church_ministry/_landing/gateway.html" } },
      modules: [
        { stationLabel: "A", title: "敬拜音樂", desc: "Worship · 主日聚會", label: "A 敬拜音樂", tone: "church-admin", nav: { sidebarUrl: "church_ministry/sidebar_church_layout_v1.html?focus=a", contentUrl: "church_ministry/modules/worship/worship-sunday-desk.html" } },
        { stationLabel: "B", title: "牧養小組", desc: "Pastoral · 探訪事工", label: "B 牧養小組", tone: "church-admin", nav: { sidebarUrl: "church_ministry/sidebar_church_layout_v1.html?focus=b", contentUrl: "church_ministry/modules/fellowship/small-groups-integrated.html" } },
        { stationLabel: "C", title: "聖經門訓", desc: "Discipleship · 主日學", label: "C 聖經門訓", tone: "church-admin", highlight: true, nav: { sidebarUrl: "church_ministry/sidebar_church_layout_v1.html?focus=c", contentUrl: "church_ministry/modules/education/education-integrated.html" } },
        { stationLabel: "D", title: "外展差傳", desc: "Outreach · 使命", label: "D 外展差傳", tone: "church-mission", nav: { sidebarUrl: "church_ministry/sidebar_church_layout_v1.html?focus=d", contentUrl: "church_ministry/modules/expansion/outreach-integrated.html#tab-needs" } },
        { stationLabel: "E", title: "社會服務", desc: "Social · 義工排班", label: "E 社會服務", tone: "church-admin", nav: { sidebarUrl: "church_ministry/sidebar_church_layout_v1.html?focus=e", contentUrl: "church_ministry/tools/volunteer_shift/index.html" } },
        { stationLabel: "F", title: "詩歌應用", desc: "Hymns · 2000+ 曲譜", label: "F 詩歌應用", tone: "tools", nav: { sidebarUrl: "hymn_management/sidebar_playlist.html", contentUrl: "hymn_management/dashboard.html" } },
        { stationLabel: "G", title: "規劃行政", desc: "Plan · Do · 量表", label: "G 規劃行政", tone: "church-plan", nav: { sidebarUrl: "church_planning/sidebar_plan_v5_preview.html", contentUrl: "church_planning/index_plan.html" } },
        { stationLabel: "👤", title: "會友主檔", desc: "Member registry · 6 tabs", label: "👤 會友主檔", tone: "church-admin", nav: { sidebarUrl: "church_ministry/sidebar_church_layout_v1.html", contentUrl: "church_ministry/modules/members/member-integrated.html#tab=overview" } }
      ],
      footer: [{ label: "🏠 回全站", tone: "site", level: 2, nav: { action: "siteHome" } }]
    },

    school: {
      route: { title: "🏫 收生→畢業主線", lead: "A 招生入学 → B 学籍教务 → C 教学评估 → D 校务财务 → E 整合衔接。" },
      home: { label: "🏠 路線首頁", tone: "school", nav: { mode: "school", contentUrl: "school_management/_landing/home.html" } },
      modules: [
        {
          stationLabel: "A",
          title: "招生入學",
          desc: "简章 · 入口 · 课程注册",
          label: "A 招生入學",
          tone: "school",
          highlight: true,
          nav: { mode: "school", contentUrl: "school_management/course_completion.html" },
          children: [
            { label: "招生簡章", tone: "school", nav: { mode: "school", contentUrl: "school_management/enrollment_brochure.html" } },
            { label: "學員入口", tone: "school", nav: { mode: "school", contentUrl: "school_management/portal/index.html" } },
            { label: "★ 課程註冊", tone: "school", nav: { mode: "school", contentUrl: "school_management/course_completion.html" } }
          ]
        },
        {
          stationLabel: "B",
          title: "學籍教務",
          desc: "学生 · 课程 · 班级 · 教师",
          label: "B 學籍教務",
          tone: "school",
          nav: { mode: "school", contentUrl: "school_management/manage/students_tabs.html" },
          children: [
            { label: "學生", tone: "school", nav: { mode: "school", contentUrl: "school_management/manage/students_tabs.html" } },
            { label: "課程", tone: "school", nav: { mode: "school", contentUrl: "school_management/manage/courses_tabs.html" } },
            { label: "班級", tone: "school", nav: { mode: "school", contentUrl: "school_management/manage/classes_tabs.html" } },
            { label: "教師", tone: "school", nav: { mode: "school", contentUrl: "school_management/manage/teachers_tabs.html" } }
          ]
        },
        {
          stationLabel: "C",
          title: "教學評估",
          desc: "成绩 · 活动 · 小测",
          label: "C 教學評估",
          tone: "school",
          nav: { mode: "school", contentUrl: "school_management/manage/grades_tabs.html" },
          children: [
            { label: "成績", tone: "school", nav: { mode: "school", contentUrl: "school_management/manage/grades_tabs.html" } },
            { label: "活動", tone: "school", nav: { mode: "school", contentUrl: "school_management/manage/activities_tabs.html" } },
            { label: "小測 W4", tone: "school", nav: { mode: "school", contentUrl: "school_management/manage/grades/exams.html" } }
          ]
        },
        {
          stationLabel: "D",
          title: "校務財務",
          desc: "财务 · 沟通 · 物业 · 系统",
          label: "D 校務財務",
          tone: "school",
          nav: { mode: "school", contentUrl: "school_management/manage/finance_tabs.html" },
          children: [
            { label: "財務 W2", tone: "school", nav: { mode: "school", contentUrl: "school_management/manage/finance/tuition.html" } },
            { label: "溝通 W7", tone: "school", nav: { mode: "school", contentUrl: "school_management/manage/communication/parent.html" } },
            { label: "物業 W5", tone: "school", nav: { mode: "school", contentUrl: "school_management/manage/property/index.html" } },
            { label: "系統 W0", tone: "school", nav: { mode: "school", contentUrl: "school_management/manage/system/database.html" } }
          ]
        },
        {
          stationLabel: "E",
          title: "整合",
          desc: "教会 · 仪表板 · AI",
          label: "E 整合",
          tone: "school",
          nav: { mode: "school", contentUrl: "school_management/dashboard.html" },
          children: [
            { label: "儀表板", tone: "school", nav: { mode: "school", contentUrl: "school_management/dashboard.html" } },
            { label: "教會連結 W6", tone: "church-admin", nav: { mode: "school", contentUrl: "school_management/manage/church_link/index.html" } },
            { label: "跨模組", tone: "school", nav: { mode: "school", contentUrl: "school_management/manage/module_integration.html" } },
            { label: "AI Prompt W8", tone: "ai", nav: { mode: "school", contentUrl: "school_management/manage/ai_prompts/index.html" } },
            { label: "主日學 C 區", tone: "church-admin", nav: { sidebarUrl: "church_ministry/sidebar_church_layout_v1.html?focus=c", contentUrl: "church_ministry/modules/education/education-integrated.html" } }
          ]
        }
      ],
      footer: [{ label: "🏠 回全站", tone: "site", level: 2, nav: { action: "siteHome" } }]
    },

    ai: {
      route: { title: "🤖 屏 1 · A–E 任務主線", lead: "Learn → Teach → Create → Serve → Plan。Smart Ministry 在 B；CRM 口述在 D。" },
      home: { label: "🏠 路線首頁", tone: "ai", nav: { mode: "ai", contentUrl: "ai_tools/_landing/home.html" } },
      modules: [
        {
          stationLabel: "A",
          title: "导读学经 Learn",
          desc: "查经 · AD 进深",
          label: "A 导读学经",
          tone: "ai",
          highlight: true,
          nav: { mode: "ai", contentUrl: "ai_tools/pages/guide_reading_hub.html" },
          children: [
            { label: "圣经导读 Guide", tone: "ai", nav: { mode: "ai", contentUrl: "ai_tools/pages/guide_reading_hub.html" } },
            { label: "进深版 AD", tone: "material", nav: { mode: "ai", contentUrl: "languages/ad/OT/chapters/index.html" } }
          ]
        },
        {
          stationLabel: "B",
          title: "备课师训 Teach",
          desc: "Prompt · Smart Ministry",
          label: "B 备课师训",
          tone: "ai",
          nav: { mode: "ai", contentUrl: "ai_tools/tools/bible_prompt_generator.html" },
          children: [
            { label: "Prompt 生成器", tone: "ai", nav: { mode: "ai", contentUrl: "ai_tools/tools/bible_prompt_generator.html" } },
            { label: "★ Smart Ministry", tone: "ai", nav: { mode: "ai", contentUrl: "smart_ministry/console.html" } },
            { label: "Lab 完整目录", tone: "ai", nav: { mode: "ai", contentUrl: "ai_tools/ai_lab_landing.html" } }
          ]
        },
        {
          stationLabel: "C",
          title: "创作表达 Create",
          desc: "图 · 音 · CH 儿童",
          label: "C 创作表达",
          tone: "ai",
          nav: { mode: "ai", contentUrl: "ai_tools/tools/creative_tools_landing.html" },
          children: [
            { label: "创作工具总览", tone: "ai", nav: { mode: "ai", contentUrl: "ai_tools/tools/creative_tools_landing.html" } },
            { label: "儿童版 CH", tone: "material", nav: { mode: "ai", contentUrl: "languages/index_ch.html" } }
          ]
        },
        {
          stationLabel: "D",
          title: "事工牧养 Serve",
          desc: "CRM 口述 · 差传",
          label: "D 事工牧养",
          tone: "ai",
          highlight: true,
          nav: { mode: "ai", contentUrl: "ai_tools/pages/crm_automation_console.html" },
          children: [
            { label: "★ CRM 口述预填", tone: "ai", nav: { mode: "ai", contentUrl: "ai_tools/pages/crm_automation_console.html" } },
            { label: "布道宣教", tone: "church-mission", nav: { sidebarUrl: "church_ministry/sidebar_church_layout_v1.html?focus=d", contentUrl: "church_ministry/modules/expansion/outreach-integrated.html" } }
          ]
        },
        {
          stationLabel: "E",
          title: "规划落地 Plan",
          desc: "SWOT · KPI · PDCA",
          label: "E 规划落地",
          tone: "church-plan",
          nav: { sidebarUrl: "church_planning/sidebar_plan_v5_preview.html", contentUrl: "church_planning/index_plan.html" },
          children: [
            { label: "教会规划", tone: "church-plan", nav: { sidebarUrl: "church_planning/sidebar_plan_v5_preview.html", contentUrl: "church_planning/index_plan.html" } },
            { label: "SWOT 矩阵", tone: "church-plan", nav: { sidebarUrl: "church_planning/sidebar_plan_v5_preview.html", contentUrl: "church_planning/Church_Governance_SWOT_matrix.html" } }
          ]
        }
      ],
      footer: [{ label: "🏠 回全站", tone: "site", level: 2, nav: { action: "siteHome" } }]
    },

    tools: {
      route: { title: "🧰 工具總覽", lead: "先選「我要做什麼」；迷路看圖與路線；詳細功能表在進階。" },
      home: { label: "🏠 路線首頁", tone: "tools", highlight: true, nav: { mode: "tools", contentUrl: "tools/_landing/home.html" } },
      modules: [
        {
          stationLabel: "1", title: "找頁面", desc: "目錄 · Sitemap", label: "1 找頁面", tone: "tools",
          nav: { sidebarUrl: "tools/tools-overview-sidebar.html", contentUrl: "nav_hub/index.html" },
          children: [
            { label: "目錄搜索", tone: "tools", level: 2, nav: { sidebarUrl: "tools/tools-overview-sidebar.html", contentUrl: "nav_hub/index.html" } },
            { label: "站點 Sitemap", tone: "tools", level: 2, nav: { sidebarUrl: "tools/tools-overview-sidebar.html", contentUrl: "nav_hub/sitemap_navigation.html" } }
          ]
        },
        {
          stationLabel: "2", title: "讀經研讀", desc: "對照 · 解讀", label: "2 讀經研讀", tone: "study",
          nav: { mode: "study", contentUrl: "bible_study/_landing/home.html" }
        },
        {
          stationLabel: "3", title: "依角色進站", desc: "會友 · 同工 · 牧者", label: "3 ★ 依角色", tone: "tools", highlight: true,
          nav: { sidebarUrl: "tools/tools-overview-sidebar.html", contentUrl: "help/role-task-start.html" }
        },
        {
          stationLabel: "4", title: "詳細功能表", desc: "分類 sitemap", label: "4 功能總表", tone: "tools",
          nav: { sidebarUrl: "tools/tools-overview-sidebar.html", contentUrl: "help/tools-overview.html" }
        }
      ],
      footer: [{ label: "🏠 回全站", tone: "site", level: 2, nav: { action: "siteHome" } }]
    }
  };

  g.B100_MODE_SIDEBAR_LANDING = {};
  Object.keys(g.B100_MODE_REGISTRY).forEach(function (k) {
    g.B100_MODE_SIDEBAR_LANDING[k] = g.B100_MODE_REGISTRY[k].workSidebar;
  });

  g.B100_resolveNav = function (raw) {
    var nav = raw ? JSON.parse(JSON.stringify(raw)) : {};
    var reg = g.B100_MODE_REGISTRY;
    if (nav.action === "siteHome") {
      nav.sidebarUrl = "help/sidebar_site_map.html";
      nav.contentUrl = "help/site_home.html";
      return nav;
    }
    if (nav.mode && reg[nav.mode]) {
      if (!nav.sidebarUrl) nav.sidebarUrl = reg[nav.mode].workSidebar;
      if (!nav.contentUrl) nav.contentUrl = reg[nav.mode].defaultContent;
    }
    return nav;
  };

  /** 产出带真实 href 的链接属性（壳内用 bible100ShellNav 同步双栏） */
  g.B100_navLinkAttrs = function (rawNav) {
    var nav = g.B100_resolveNav(rawNav || {});
    if (nav.action === "siteHome") {
      var homeHref =
        typeof g.B100_siteHref === "function"
          ? g.B100_siteHref("help/site_home.html")
          : "help/site_home.html";
      return {
        href: homeHref,
        onclick:
          "return bible100ShellNav(event,{sidebarUrl:'help/sidebar_site_map.html',contentUrl:'help/site_home.html'})"
      };
    }
    var cf = nav.contentUrl || "";
    var sb = nav.sidebarUrl || "";
    var href = cf || sb || "#";
    if (typeof g.B100_siteHref === "function" && href && href !== "#" && !/^(https?:|mailto:|#)/i.test(href)) {
      href = g.B100_siteHref(href);
    }
    if (sb && cf && sb !== "about:blank") {
      return {
        href: href,
        onclick:
          "return bible100ShellNav(event,{sidebarUrl:'" +
          String(sb).replace(/'/g, "\\'") +
          "',contentUrl:'" +
          String(cf).replace(/'/g, "\\'") +
          "'})"
      };
    }
    if (cf) {
      return { href: href, onclick: "return bible100ShellNav(event,{contentUrl:'" + String(cf).replace(/'/g, "\\'") + "'})" };
    }
    return { href: href, onclick: "" };
  };

  function moduleToStation(mod) {
    var st = {
      label: mod.stationLabel || mod.label,
      title: mod.title || mod.label,
      desc: mod.desc || "",
      tone: mod.tone,
      highlight: !!mod.highlight,
      nav: mod.nav ? JSON.parse(JSON.stringify(mod.nav)) : null
    };
    if (mod.children && mod.children.length) {
      st.branches = mod.children.map(function (ch) {
        return { label: ch.label, tone: ch.tone, nav: ch.nav ? JSON.parse(JSON.stringify(ch.nav)) : null };
      });
    }
    return st;
  }

  function buildSiteRouteMap() {
    var siteTitles = {
      material: { label: "①", title: "教材與培訓", desc: "百步四寶 · 核心", tone: "material", highlight: true, mode: "material" },
      study: { label: "②", title: "聖經研讀", desc: "對照 · 解讀 · 工具", tone: "study", mode: "study" },
      qna: { label: "③", title: "聖經難題", desc: "四層查题", tone: "qna", mode: "qna" },
      church: { label: "④", title: "教會事工", desc: "A–G 事工", tone: "church-plan", mode: "church" },
      school: { label: "⑤", title: "學校管理", desc: "学籍 · 课程", tone: "school", mode: "school" },
      ai: { label: "⑥", title: "AI 輔助", desc: "Lab · 草稿须人审", tone: "ai", mode: "ai" }
    };
    var order = ["material", "study", "qna", "church", "school", "ai"];
    return {
      title: "🗺️ 屏 1 · 全站六大模組",
      lead: "点一站进入模块（旧工作侧栏 + 路线图）；迷路请点顶栏模式按钮。",
      stations: order.map(function (modeId) {
        var t = siteTitles[modeId];
        return {
          label: t.label,
          title: t.title,
          desc: t.desc,
          tone: t.tone,
          highlight: !!t.highlight,
          nav: { mode: modeId }
        };
      })
    };
  }

  g.B100_buildRouteMaps = function () {
    var trees = g.B100_SIDEBAR_TREES;
    var maps = {};
    maps.site = buildSiteRouteMap();
    Object.keys(trees).forEach(function (key) {
      if (key === "site") return;
      var tree = trees[key];
      if (!tree.route) return;
      maps[key] = {
        title: tree.route.title,
        lead: tree.route.lead,
        stations: (tree.modules || []).map(moduleToStation)
      };
    });
    return maps;
  };

  g.B100_ROUTE_MAPS = g.B100_buildRouteMaps();
})(typeof window !== "undefined" ? window : this);
