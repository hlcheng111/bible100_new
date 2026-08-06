/**
 * 學校管理 · Landing A–E 部門運作說明 SSOT
 * 與 sidebar.html 分組一致 · 對齊 SCHOOL_IMPROVEMENT_PLAN W0–W8
 */
window.SCHOOL_DEPARTMENTS = {
  build: "20260810a",
  principles: [
    { icon: "👤", zh: "人", en: "People", text: "對齊中央會友庫 <code>member_id</code>；學生／教師不重複維護姓名主檔。" },
    { icon: "📋", zh: "事", en: "Operations", text: "主日學（教會 C 區）與學校學籍桌分工；選課／編班／成績在本模組。" },
    { icon: "💰", zh: "錢", en: "Finance", text: "學費登記在 <code>schoolMasterDatabase</code>；月末匯出至教會財政 <code>financeSystemData</code>。" }
  ],
  dataNote: "資料存於本機 <code>localStorage · schoolMasterDatabase</code>。新機預設空庫；需示範請至「系統 → 載入示範」。請每週「匯出全庫 JSON」備份。",
  waves: [
    { id: "W0", zh: "治理／備份", en: "Trust & backup", page: "school_management/manage/system/database.html", status: "ready" },
    { id: "W1", zh: "會友連結", en: "Member link", page: "school_management/manage/students/add.html", status: "ready" },
    { id: "W2", zh: "學費／教會帳", en: "Tuition export", page: "school_management/manage/finance/tuition.html", status: "ready" },
    { id: "W3", zh: "學年／招生／結業", en: "Academic & grad", page: "school_management/course_completion.html", status: "ready" },
    { id: "W4", zh: "課表／小測", en: "Schedule & exams", page: "school_management/manage/courses/schedule.html", status: "ready" },
    { id: "W5", zh: "物業／場地", en: "Property", page: "school_management/manage/property/index.html", status: "ready" },
    { id: "W6", zh: "教會連結", en: "Church link", page: "school_management/manage/church_link/index.html", status: "ready" },
    { id: "W7", zh: "家長通知草稿", en: "Parent notify", page: "school_management/manage/communication/parent.html", status: "ready" },
    { id: "W8", zh: "AI 草稿助手", en: "AI drafts", page: "school_management/manage/ai_prompts_tabs.html", status: "ready" },
  ],
  groups: [
    {
      id: "A",
      titleZh: "招生入學",
      titleEn: "Enrollment",
      who: "招生組 · 行政 · 家長",
      flow: "简章宣传 → 学员入口报名 → 教务审核取录 → 课程注册",
      dataKeys: ["students", "student.enrollments", "meta.academicYears"],
      wave: "W3",
      pages: [
        { label: "招生簡章 Brochure", path: "school_management/enrollment_brochure.html", desc: "可列印 · 文案可編輯" },
        { label: "學員入口 Portal", path: "school_management/portal/index.html", desc: "选课／缴费／成绩" },
        { label: "结业登记 Graduation", path: "school_management/course_completion.html", desc: "及格判定 · 回写 CentralMemberDB", highlight: true }
      ]
    },
    {
      id: "B",
      titleZh: "學籍教務",
      titleEn: "Academic",
      who: "教務 · 註冊組 · 排課同工",
      flow: "学生建档 → 开设课程 → 编班 → 教师授課",
      dataKeys: ["students", "courses", "class.classes", "teacher.schedules"],
      wave: "W4",
      pages: [
        { label: "學生 Students", path: "school_management/manage/students_tabs.html", desc: "资料 · CSV · 会友连结 W1" },
        { label: "課程 Courses", path: "school_management/manage/courses_tabs.html", desc: "列表 · 课表 · 备课链 C 区" },
        { label: "班級 Classes", path: "school_management/manage/classes_tabs.html", desc: "分班 · 科目" },
        { label: "教師 Teachers", path: "school_management/manage/teachers_tabs.html", desc: "档案 · 授课统计" }
      ]
    },
    {
      id: "C",
      titleZh: "教學評估",
      titleEn: "Assessment",
      who: "任课教师 · 教务",
      flow: "小测建卷 → 登分 → 活动记录 → 毕业判定",
      dataKeys: ["grade.grades", "grade.exams", "activity.activities"],
      wave: "W4",
      pages: [
        { label: "成績 Grades", path: "school_management/manage/grades_tabs.html", desc: "管理 · 小测 · 证书" },
        { label: "活動 Activities", path: "school_management/manage/activities_tabs.html", desc: "活动 · 竞赛 · 社团" }
      ]
    },
    {
      id: "D",
      titleZh: "校務財務",
      titleEn: "Admin",
      who: "财务 · 校务 · 系统管理员",
      flow: "学费登记 → 收据 → 导出教会账 → 通告 → 场地",
      dataKeys: ["finance.payments", "communication.notices", "property.rooms", "meta"],
      wave: "W2",
      pages: [
        { label: "財務 Finance", path: "school_management/manage/finance_tabs.html", desc: "学费 W2 · A3 对账导出" },
        { label: "溝通 Communication", path: "school_management/manage/communication_tabs.html", desc: "公告 · 家长通知 W7" },
        { label: "物業 Property", path: "school_management/manage/property_tabs.html", desc: "场地 · 租约 W5" },
        { label: "系統 System", path: "school_management/manage/system_tabs.html", desc: "学年 · 备份 W0 · 示范" }
      ]
    },
    {
      id: "E",
      titleZh: "整合",
      titleEn: "Integration",
      who: "校长 · 牧长 · 教務主任",
      flow: "跨模块对齐 → 主日学衔接 → 仪表板 KPI → AI 草稿",
      dataKeys: ["CentralMemberDB", "educationSystemData", "bible100_crm_intent_v2"],
      wave: "W6",
      pages: [
        { label: "跨模組整合", path: "school_management/manage/module_integration.html", desc: "门训 · AI · 事工" },
        { label: "教會連結 W6", path: "school_management/manage/church_link/index.html", desc: "名册对齐 · 缺席预填" },
        { label: "儀表板 Dashboard", path: "school_management/dashboard.html", desc: "统计 · 会友连结比 W1" },
        { label: "AI Prompt W8", path: "school_management/manage/ai_prompts/index.html", desc: "招生 · 评语 · 出题" }
      ]
    }
  ]
};
