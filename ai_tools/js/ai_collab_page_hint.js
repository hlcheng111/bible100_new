/**

 * AI 協作頁面提示 · 掛在「原模組頁」頂部（不另建新頁）

 */

(function (doc) {

  "use strict";



  var HINTS = {

    plan_swot: {

      zone: "规划 Plan",

      zh: "用 AI 协助 SWOT 诊断",

      en: "AI-assisted SWOT",

      steps:

        "① 在本页完成量表 → ② 复制摘要至 ChatGPT/Gemini → ③ 请 AI 列出 SO/WO/ST/WT 策略草稿 → ④ 同工会议人审后写入教会规划。",

      link: "ai_tools/tools/bible_prompt_generator.html",

      linkLabel: "备课 Prompt 生成器",

    },

    plan_index: {

      zone: "规划 Plan",

      zh: "规划与 AI 闭环",

      en: "Plan + AI loop",

      steps:

        "SWOT/KPI 诊断后 → 用 Prompt 生成「执行方案草稿」→ 教会事工落地 → 季度用 Lab 复盘 Prompt 更新 PDCA。",

      link: "church_planning/Church_Governance_SWOT_matrix.html",

      linkLabel: "SWOT 矩阵",

    },

    create_image: {

      zone: "创作 Create",

      zh: "文字转图 · AI 协作",

      en: "Text to Image",

      steps:

        "① 填经文/主题 → ② 复制 Prompt → ③ 贴到 DALL·E / Gemini / 即梦 → ④ 人审后用于课件。外连 iframe 首次可能较慢。",

      link: "ai_tools/tools/creative_tools_landing.html",

      linkLabel: "创作工具总览",

    },

    create_tts: {

      zone: "创作 Create",

      zh: "文字转语音 · AI 协作",

      en: "Text to Speech",

      steps: "填儿童故事稿 → 复制 Prompt → 贴 TTS 平台 → 人审音档后嵌入课件。",

      link: "ai_tools/tools/creative_tools_landing.html",

      linkLabel: "创作工具总览",

    },

    serve_crm: {

      zone: "事工 Ministry",

      zh: "CRM 口述预填",

      en: "CRM oral prefill",

      steps: "探访后口述 → AI 整理成表单字段草稿 → 同工确认后手动存入 CRM；不自动写入、不取代牧者判断。",

      link: "ai_tools/_landing/home.html",

      linkLabel: "AI 路线图",

    },

    teach_prompt: {

      zone: "工作台 Workbench",

      zh: "备课 Prompt 工作台",

      en: "Lesson Prompt desk",

      steps: "填年级/经文/目标 → 复制 Prompt → 外部 AI → 人审教案/测验。",

      link: "ai_tools/pages/guide_reading_hub.html",

      linkLabel: "圣经导读",

    },

    learn_guide: {

      zone: "工作台 Workbench",

      zh: "导读学经 · AI 协作",

      en: "Guide reading",

      steps: "选经文 → 复制导读 Prompt → 外部 AI 问答 → 对照 AD 进深教材；不编造经文。",

      link: "languages/ad/OT/chapters/index.html",

      linkLabel: "进深版 AD",

    },

    cm_outreach: {

      zone: "事工 Ministry",

      zh: "差传事工 + AI",

      en: "Outreach + AI",

      steps: "用 Prompt 起草探访见证、短讯、翻译草稿 → 人审后用于外展；PII 不上公开 API。",

      link: "ai_tools/pages/crm_automation_console.html",

      linkLabel: "CRM 口述",

    },

    cm_pastoral: {

      zone: "事工 Ministry",

      zh: "牧养小组 · AI 护栏",

      en: "Pastoral desk + AI",

      steps: "缺席预警旁有牧养建议卡片（规则模板）→ 人审后一键推送探访队列；非考核依据。",

      link: "ai_tools/tools/bible_prompt_generator.html",

      linkLabel: "备课 Prompt",

    },

    cm_admin: {

      zone: "事工 Ministry",

      zh: "行政营运 · 战情/财务",

      en: "Admin hub",

      steps: "战情与财务 CSV 导出 → 长执会议人审；规划 Tab 可换 church_planning 侧栏。",

      link: "church_planning/index_plan.html",

      linkLabel: "教会规划",

    },

    smart_ministry_console: {

      zone: "事工 Ministry",

      zh: "Smart Ministry · 恩赐配对",

      en: "Talent matching",

      steps: "问卷/人材池 → 岗位媒合草稿 → 人审后确认；不是 CRM 口述、不是备课 Prompt。",

      link: "ai_tools/tools/bible_prompt_generator.html",

      linkLabel: "备课 Prompt",

    },

    smart_ministry_landing: {

      zone: "事工 Ministry",

      zh: "智慧事奉路线图",

      en: "Smart Ministry journey",

      steps: "会友：恩赐问卷 → 同行；同工：Console 配对。AI 只协助整理草稿，不取代牧者。",

      link: "smart_ministry/console.html",

      linkLabel: "Console",

    },

    ch_index: {

      zone: "事工 Ministry",

      zh: "儿童版 CH · 与创作协作",

      en: "Children curriculum",

      steps: "C 区文字转图/音 Prompt 产出 → 人审 → 嵌入本 CH 课件；本页为教材母库非 AI 工具。",

      link: "ai_tools/pages/ai_text_to_image.html",

      linkLabel: "文字转图像",

    },

    ad_index: {

      zone: "工作台 Workbench",

      zh: "进深版 AD · 导读来源",

      en: "Advanced curriculum",

      steps: "A 区导读 Prompt 产出后 → 对照 AD 章节深化；AI 草稿须与教材交叉核对。",

      link: "ai_tools/pages/guide_reading_hub.html",

      linkLabel: "圣经导读",

    },

    cm_dashboard: {

      zone: "事工 Ministry",

      zh: "教会事工仪表板 + AI",

      en: "Church dashboard",

      steps: "行政数据在本页；口述减压请用 CRM 预填；文案/报告草稿用 Prompt 生成器。",

      link: "ai_tools/pages/crm_automation_console.html",

      linkLabel: "CRM 口述",

    },

    media_workflow: {

      zone: "媒体 Media",

      zh: "媒体教材三步",

      en: "Media workflow",

      steps: "① YouTube 嵌入单课 → ② 播放清单排系列 → ③ 长片才用时间戳。配合 Prompt 写导论/讨论题。",

      link: "ai_tools/tools/youtube_media_embed_tool.html",

      linkLabel: "YouTube 嵌入",

    },

    prompt_qa: {

      zone: "工作台 Workbench",

      zh: "问答 Prompt · 深化",

      en: "Q&A prompts",

      steps: "先在本页选情境生成 Prompt → 复制到外部 AI → 对照经文人审；可接到课程计划。",

      link: "ai_tools/tools/bible_prompt_generator.html",

      linkLabel: "Prompt 工作台",

    },

  };



  function esc(s) {

    return String(s || "")

      .replace(/&/g, "&amp;")

      .replace(/</g, "&lt;")

      .replace(/>/g, "&gt;");

  }



  function inject(key) {

    var h = HINTS[key];

    if (!h || doc.getElementById("b100-ai-collab-hint")) return;

    var root = doc.createElement("div");

    root.id = "b100-ai-collab-hint";

    root.setAttribute("role", "note");

    root.style.cssText =

      "margin:0 0 12px;padding:10px 12px;font-size:11px;line-height:1.55;" +

      "background:#f5f3ff;border:1px solid #c4b5fd;border-left:4px solid #7c3aed;border-radius:8px;color:#334155;";

    var href = h.link;

    if (typeof window !== "undefined" && typeof window.B100_siteHref === "function") {

      href = window.B100_siteHref(h.link);

    }

    root.innerHTML =

      "<strong style=\"color:#5b21b6\">🤖 " +

      esc(h.zone) +

      " · " +

      esc(h.zh) +

      "</strong> <small style=\"color:#64748b\">" +

      esc(h.en) +

      "</small><br>" +

      esc(h.steps) +

      (h.link

        ? ' <a href="' +

          esc(href) +

          '" style="color:#5b21b6;font-weight:700;">→ ' +

          esc(h.linkLabel) +

          "</a>"

        : "");

    var body = doc.body;

    if (!body) return;

    var first = body.firstElementChild;

    if (first) body.insertBefore(root, first);

    else body.appendChild(root);

  }



  function boot() {

    var body = doc.body;

    if (!body) return;

    var key = body.getAttribute("data-b100-ai-hint");

    if (key) inject(key);

  }



  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);

  else boot();



  if (typeof window !== "undefined") {

    window.B100AiCollabHint = { inject: inject, HINTS: HINTS };

  }

})(document);


