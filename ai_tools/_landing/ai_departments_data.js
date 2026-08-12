/**
 * AI 輔助 · Landing A–E 部門運作說明 SSOT
 * 釐清：備課 AI ≠ 事奉配對 ≠ CRM 預填
 */
window.AI_LAB_DEPARTMENTS = {
  build: "20260811b",
  aiHowWorkflow: {
    title: "AI 協作通用四步（全站 W0 護欄）",
    steps: [
      { n: "1", zh: "站內填表", en: "Fill form", detail: "選 A–E 區工作台，填經文/情境/目標（不送 API key）" },
      { n: "2", zh: "複製 Prompt", en: "Copy prompt", detail: "一鍵複製；自動附加 B100PromptGuardrails（經文為錨、不編造）" },
      { n: "3", zh: "外部 AI 草稿", en: "External AI", detail: "貼到 ChatGPT / Gemini / Kimi 等免費平台" },
      { n: "4", zh: "人工審核", en: "Human review", detail: "老師/牧者定稿；PII 不上雲；不取代屬靈權威" }
    ]
  },
  crossModuleAi: [
    {
      module: "教會事工 CM-C",
      zone: "C",
      zh: "主日學 · 教育五 Tab",
      how: "教案／小測 Prompt（B 區）→ 人審 → 嵌入 C 區工作桌；不寫 CRM raw。",
      path: "church_ministry/modules/education/education-integrated.html"
    },
    {
      module: "教會事工 CM-D",
      zone: "D",
      zh: "探訪、差傳、排班",
      how: "口述 → CRM 預填（D）→ 確認後寫入事工表；外展文案用 Prompt 草稿。",
      path: "church_ministry/modules/expansion/outreach-integrated.html"
    },
    {
      module: "教會規劃 Plan",
      zone: "E",
      zh: "SWOT · KPI · PDCA",
      how: "量表結果 → 複製摘要 → AI 列策略草稿 → 長老會議定案 → 季度復盤 Prompt。",
      path: "church_planning/Church_Governance_SWOT_matrix.html"
    },
    {
      module: "學校 School",
      zone: "B",
      zh: "教案 · 小測 · 家長信",
      how: "B 區 Prompt 生成器 → 人審 → 學校 E 區 ai_prompts 匯總（W8 鉤子）。",
      path: "school_management/manage/ai_prompts/index.html"
    },
    {
      module: "教材 AD/CH",
      zone: "A/C",
      zh: "進深 · 兒童創作",
      how: "A 導讀產出 → C 轉圖/音 → 嵌入 languages/ad 或 index_ch 課件。",
      path: "languages/index_ch.html"
    }
  ],
  whenToUse: [
    {
      title: "備課 AI · Teach",
      when: "寫教案、測驗、師訓大纲、作業輔導",
      not: "不是填 CRM 表、不是崗位配對",
      zone: "B"
    },
    {
      title: "事奉配對 · Smart Ministry",
      when: "恩賜問卷、崗位媒合、團隊事奉（在 B 區）",
      not: "不是查經導讀、不是口述探訪",
      zone: "B"
    },
    {
      title: "CRM 口述預填 · Serve",
      when: "探訪後填表、排班、行政減壓（在 D 區）",
      not: "不是備課、不是寫講道",
      zone: "D"
    }
  ],
  churchGoals: [
    { icon: "🌍", zh: "佈道宣教差傳", en: "Mission", goal: "更遠更廣", zone: "D", path: "church_ministry/modules/expansion/outreach-integrated.html" },
    { icon: "📖", zh: "培訓進修培靈", en: "Formation", goal: "更深更細", zone: "B", path: "ai_tools/tools/ai_workbench_integrated.html#tab-prompt" },
    { icon: "📊", zh: "規劃治理整修", en: "Plan & Gov", goal: "更穩更對焦", zone: "E", path: "church_planning/index_plan.html" }
  ],
  principles: [
    { icon: "🛡️", zh: "草稿須人審", text: "填表 → 複製 Prompt → 外部免費 AI → <strong>人工審核</strong>；不取代牧者／老師。" },
    { icon: "📖", zh: "經文為錨", text: "必引用經文、不編造、不宣稱屬靈權威（<code>B100PromptGuardrails</code>）。" },
    { icon: "🔒", zh: "PII 紅線", text: "會友／學生 raw 不進 NotebookLM、不上公開 API。" }
  ],
  waves: [
    { id: "W0", zh: "AI 治理／護欄", en: "Guardrails", how: "先讀 ethics_ai：草稿須人審、PII 紅線、不編造經文", page: "ai_tools/ethics_ai.html", status: "ready" },
    { id: "W1", zh: "Landing + A–E", en: "Route map", how: "選區再進工具；本頁對照「何時用哪个」", page: "ai_tools/_landing/home.html", status: "ready" },
    { id: "W2", zh: "統一 Prompt 工作台", en: "Prompt desk", how: "填表→複製→外部 AI→人審；B 區備課主入口", page: "ai_tools/tools/bible_prompt_generator.html", status: "ready" },
    { id: "W3", zh: "師訓階梯 L1–L4", en: "Teacher ladder", how: "Lesson Plan + Quiz 草稿；Smart Ministry 同屬 B", page: "ai_tools/pages/ai_lesson_plan.html", status: "ready" },
    { id: "W4", zh: "Plan–Do 閉環", en: "PDCA loop", how: "SWOT 量表→AI 策略草稿→執行→Lab 復盤 Prompt", page: "church_planning/index_plan.html", status: "ready" },
    { id: "W5", zh: "Context Pack", en: "Scripture ctx", how: "導讀 Hub 附經文脈絡；對照 AD 進深", page: "ai_tools/pages/guide_reading_hub.html", status: "ready" },
    { id: "W6", zh: "創作管線 CH/AD", en: "Create pipeline", how: "Prompt→圖/音/視頻平台；服務兒童 CH 教材", page: "ai_tools/tools/creative_tools_landing.html", status: "ready" },
    { id: "W7", zh: "多語草稿", en: "VI/ID bridge", how: "Prompt 保留中文源文；小語種 AI 草稿須回查", page: "ai_tools/tools/bible_prompt_generator.html", status: "ready" },
    { id: "W8", zh: "跨模組鉤子", en: "CM/School hooks", how: "CRM 口述、學校 ai_prompts、事工儀表板銜接", page: "ai_tools/pages/crm_automation_console.html", status: "ready" }
  ],
  groups: [
    {
      id: "A",
      titleZh: "导读学经",
      titleEn: "Learn",
      who: "经文学员 · 查经小组",
      flow: "导读 → 神学 Q&A → 平台选 AI → AD 进深教材作进阶来源",
      dataKeys: ["guide_reading_hub", "languages/ad"],
      wave: "W5",
      pages: [
        { label: "圣经神学 AI 导读 Guide", path: "ai_tools/pages/guide_reading_hub.html", desc: "主工作站 · 查经", highlight: true },
        { label: "AI 平台导览 Platforms", path: "ai_tools/_landing/ai_platforms.html", desc: "免费平台选型" },
        { label: "进深版 AD · OT 教材", path: "languages/ad/OT/chapters/index.html", desc: "Advanced 内容来源" },
        { label: "伦理与安全 Ethics", path: "ai_tools/ethics_ai.html", desc: "W0 护栏说明" }
      ]
    },
    {
      id: "B",
      titleZh: "备课师训",
      titleEn: "Teach",
      who: "主日学老师 · 师训 · 事奉配对",
      flow: "Prompt 教案 → 测验 → Smart Ministry Console 恩赐配对",
      dataKeys: ["bible_prompt", "smart_ministry", "school/edu_teaching"],
      wave: "W3",
      pages: [
        { label: "圣经 Prompt 生成器", path: "ai_tools/tools/bible_prompt_generator.html", desc: "W2 统一备课入口", highlight: true },
        { label: "课程计划 Lesson Plan", path: "ai_tools/pages/ai_lesson_plan.html", desc: "师训 L2–L3" },
        { label: "测验生成 Quiz", path: "ai_tools/pages/ai_quiz_generator.html", desc: "小测草稿" },
        { label: "★ Smart Ministry Console", path: "smart_ministry/console.html", desc: "事奉配对 · 在 B 区非 CRM" },
        { label: "智慧事奉路线图", path: "smart_ministry/landing.html", desc: "恩赐 · 媒合总览" }
      ]
    },
    {
      id: "C",
      titleZh: "创作表达",
      titleEn: "Create",
      who: "儿童主日学 · 媒体同工",
      flow: "文字→图/音/视频 Prompt → 服务 CH 儿童教材与 Learn 产出",
      dataKeys: ["creative_tools", "languages/ch"],
      wave: "W6",
      pages: [
        { label: "创作工具总览 Creative", path: "ai_tools/tools/creative_tools_landing.html", desc: "Prompt + 平台链", highlight: true },
        { label: "文字转图像 Image", path: "ai_tools/pages/ai_text_to_image.html", desc: "课件插图" },
        { label: "文字转语音 TTS", path: "ai_tools/pages/ai_text_to_speech.html", desc: "儿童故事" },
        { label: "儿童版 CH 教材入口", path: "languages/index_ch.html", desc: "Children 内容母库" }
      ]
    },
    {
      id: "D",
      titleZh: "事工牧养",
      titleEn: "Serve",
      who: "牧养 · 行政 · 差传",
      flow: "口述预填 CRM → 探访跟进 · 佈道宣教更遠更廣",
      dataKeys: ["bible100_crm_intent_v2", "member_id"],
      wave: "W8",
      pages: [
        { label: "★ CRM 口述预填 Console", path: "ai_tools/pages/crm_automation_console.html", desc: "5F 减压 · 不自动存", highlight: true },
        { label: "外展差传 Outreach", path: "church_ministry/modules/expansion/outreach-integrated.html", desc: "更遠更廣 · D 区事工" },
        { label: "教会事工仪表板", path: "church_ministry/dashboard.html", desc: "4F 执行层" }
      ]
    },
    {
      id: "E",
      titleZh: "规划落地",
      titleEn: "Plan",
      who: "长老 · 牧长 · 规划同工",
      flow: "SWOT/KPI → 执行 → Lab 复盘 Prompt → PDCA 更好",
      aiHow: "完成 SWOT 量表后，复制结果摘要 → 用 Prompt 请 AI 列出 SO/WO 策略草稿 → 长老会议人审 → 写入 index_plan 执行表。",
      dataKeys: ["planning_kpi", "planning_pdca"],
      wave: "W4",
      pages: [
        { label: "教会规划索引 Plan", path: "church_planning/index_plan.html", desc: "更稳更对焦 · 规划主索引", highlight: true, aiHow: "诊断→AI草稿→执行→季度复盘" },
        { label: "SWOT 矩阵", path: "church_planning/Church_Governance_SWOT_matrix.html", desc: "★ 用 AI 协助交叉策略", highlight: true, aiHow: "量表→复制→外部AI→人审" },
        { label: "Lab 完整目录", path: "ai_tools/ai_lab_landing.html", desc: "全部 B 区 legacy 页" }
      ]
    }
  ]
};
