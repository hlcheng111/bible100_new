/**
 * 教會營運工具 · 全站路徑 SSOT（規劃量表 + CRM 24 + 自動化）
 * 側欄／Hub 新增連結前必先登記於此。
 * 規劃問卷詳細欄位仍以 church_planning/js/planning_tool_registry.js 為準。
 *
 * path：相對 repo 根；Batch 2 可改檔名，保留 path 並填 targetPath。
 */
(function (global) {
  "use strict";

  var NAMING = {
    planning: { dir: "church_planning/tools/", file: "tool_{id}.html" },
    guide: { dir: "church_planning/guides/", file: "guide_step{n}_{topic}.html" },
    crm: { dir: "church_ministry/crm/", file: "crm_{id}.html" },
    crm_guide: { dir: "church_ministry/", file: "guide_crm_{topic}.html" },
    automation: { dir: "church_ministry/modules/tech/", file: "auto_{id}.html" }
  };

  var ENTRIES = [
    /* --- 5F 步驟導覽 --- */
    { layer: "guide", id: "step2_raci", label: "步驟2 權責導覽", path: "church_planning/guides/guide_step2_raci.html", status: "live", sidebar: "church_planning/sidebar_plan.html" },
    { layer: "guide", id: "step4_ctv", label: "步驟4 戰情室導覽", path: "church_planning/guides/guide_step4_ctv.html", status: "live", sidebar: "church_planning/sidebar_plan.html" },
    { layer: "guide", id: "step5_strategy", label: "步驟5 策略導覽", path: "church_planning/guides/guide_step5_strategy.html", status: "live", sidebar: "church_planning/sidebar_plan.html" },
    { layer: "guide", id: "step6_crm", label: "步驟6 CRM 降落", path: "church_planning/guides/guide_step6_crm.html", status: "live", sidebar: "church_planning/sidebar_plan.html" },

    /* --- 5F 規劃問卷（14+1 RACI）--- */
    { layer: "planning", id: "spiritual", label: "信徒靈命健康", path: "church_planning/信徒靈性生命健康自我審查.html", targetPath: "church_planning/tools/tool_spiritual.html", status: "live", sidebar: "church_planning/sidebar_plan.html" },
    { layer: "planning", id: "pastoral", label: "領袖健康診斷", path: "church_planning/pastoral-spiritual-survey-pro.html", targetPath: "church_planning/tools/tool_pastoral.html", status: "live", sidebar: "church_planning/sidebar_plan.html" },
    { layer: "planning", id: "shape", label: "SHAPE 恩賜", path: "church_planning/shape-gifts-assessment.html", targetPath: "church_planning/tools/tool_shape.html", status: "live", sidebar: "church_planning/sidebar_plan.html" },
    { layer: "planning", id: "competency", label: "事奉能力模型", path: "church_planning/ministry-competency-assessment.html", targetPath: "church_planning/tools/tool_competency.html", status: "live", sidebar: "church_planning/sidebar_plan.html" },
    { layer: "planning", id: "alda", label: "ALDA 領導力", path: "church_planning/12 Apostles Leadership Assessment.html", targetPath: "church_planning/tools/tool_alda.html", status: "live", sidebar: "church_planning/sidebar_plan.html" },
    { layer: "planning", id: "ministry8020", label: "教會版 80/20", path: "church_planning/ministry-8020-planning.html", targetPath: "church_planning/tools/tool_ministry8020.html", status: "live", sidebar: "church_planning/sidebar_plan.html" },
    { layer: "planning", id: "urgent", label: "重要 vs 緊急", path: "church_planning/important-urgent-matrix.html", targetPath: "church_planning/tools/tool_urgent.html", status: "live", sidebar: "church_planning/sidebar_plan.html" },
    { layer: "planning", id: "smart", label: "教會版 SMART", path: "church_planning/smart-planning.html", targetPath: "church_planning/tools/tool_smart.html", status: "live", sidebar: "church_planning/sidebar_plan.html" },
    { layer: "planning", id: "pdca", label: "教會版 PDCA", path: "church_planning/Church_Governance_PDCA_cycle.html", targetPath: "church_planning/tools/tool_pdca.html", status: "live", sidebar: "church_planning/sidebar_plan.html" },
    { layer: "planning", id: "kpiokr", label: "KPI/OKR 對齊", path: "church_planning/kpi-okr-alignment.html", targetPath: "church_planning/tools/tool_kpiokr.html", status: "live", sidebar: "church_planning/sidebar_plan.html" },
    { layer: "planning", id: "johari", label: "Johari 盲點", path: "church_planning/johari-window-assessment.html", targetPath: "church_planning/tools/tool_johari.html", status: "live", sidebar: "church_planning/sidebar_plan.html" },
    { layer: "planning", id: "swot", label: "教會版 SWOT", path: "church_planning/Church_Governance_SWOT_matrix.html", targetPath: "church_planning/tools/tool_swot.html", status: "live", sidebar: "church_planning/sidebar_plan.html" },
    { layer: "planning", id: "ncd", label: "NCD 教會健康", path: "church_planning/Church_Health_NCD_planning.html", targetPath: "church_planning/tools/tool_ncd.html", status: "live", sidebar: "church_planning/sidebar_plan.html" },
    { layer: "planning", id: "disc", label: "DISC 溝通風格", path: "church_planning/disc-profile-assessment.html", targetPath: "church_planning/tools/tool_disc.html", status: "planned", sidebar: "church_planning/sidebar_plan.html" },
    { layer: "planning", id: "mbti", label: "MBTI 性格傾向", path: "church_planning/mbti-self-awareness.html", targetPath: "church_planning/tools/tool_mbti.html", status: "planned", sidebar: "church_planning/sidebar_plan.html" },
    { layer: "planning", id: "culture", label: "文化契合度", path: "church_planning/culture-alignment-assessment.html", targetPath: "church_planning/tools/tool_culture.html", status: "planned", sidebar: "church_planning/sidebar_plan.html" },
    { layer: "planning", id: "raci", label: "RACI 權責反思", path: "church_planning/planning/raci-reflection.html", targetPath: "church_planning/tools/tool_raci.html", status: "live", sidebar: "church_planning/sidebar_plan.html" },
    { layer: "planning", id: "assessment_hub", label: "健康診斷中心", path: "church_planning/assessment-os-hub.html", status: "live", sidebar: "church_planning/sidebar_plan.html" },
    { layer: "planning", id: "war_room", label: "健康雷達戰情室", path: "church_planning/cta-os-war-room.html", status: "live", sidebar: "church_planning/sidebar_plan.html" },

    /* --- CRM 導覽（guide_crm_*）--- */
    { layer: "crm_guide", id: "journey_hub", label: "CRM 旅程 Hub", path: "church_ministry/guide_crm_journey_hub.html", status: "live", sidebar: "church_ministry/sidebar_crm_journey.html" },
    { layer: "crm_guide", id: "trial_30min", label: "CRM 30 分鐘試玩", path: "church_ministry/guide_crm_trial_30min.html", status: "live", sidebar: "church_ministry/sidebar_crm_journey.html" },
    { layer: "crm_guide", id: "for_leaders", label: "CRM 牧者導覽", path: "church_ministry/guide_crm_for_leaders.html", status: "live", sidebar: "church_ministry/sidebar_crm_journey.html" },

    /* --- CRM 24 工具（對齊 CHURCH_ERP_24_TOOLS_INVENTORY）--- */
    { layer: "crm", id: "doc_assets", label: "文檔資產管理", path: "church_ministry/modules/library/library-management.html", scene: "行政", status: "stub", sidebar: "church_ministry/sidebar_crm_journey.html" },
    { layer: "crm", id: "meeting_minutes", label: "會議記錄", path: "church_ministry/modules/fellowship/group-report-copilot.html", scene: "行政", status: "partial", sidebar: "church_ministry/sidebar_crm_journey.html" },
    { layer: "crm", id: "smart_directory", label: "智能通訊錄", path: "church_ministry/modules/members/member-integrated.html", scene: "行政", status: "live", sidebar: "church_ministry/sidebar_crm_journey.html" },
    { layer: "crm", id: "dept_weekly", label: "部門周報", path: "church_ministry/modules/fellowship/groups-reports.html", scene: "行政", status: "stub", sidebar: "church_ministry/sidebar_crm_journey.html" },
    { layer: "crm", id: "donation_online", label: "線上奉獻", path: "church_ministry/modules/finance/finance-integrated.html", scene: "財務", status: "partial", sidebar: "church_ministry/sidebar_crm_journey.html" },
    { layer: "crm", id: "finance_ledger", label: "收支記帳", path: "church_ministry/modules/finance/finance-management.html", scene: "財務", status: "partial", sidebar: "church_ministry/sidebar_crm_journey.html" },
    { layer: "crm", id: "bank_reconcile", label: "銀行對帳", path: "church_ministry/tools/finance_reconciliation/index.html", scene: "財務", status: "partial", sidebar: "church_ministry/sidebar_crm_journey.html" },
    { layer: "crm", id: "finance_reports", label: "財報奉獻單", path: "church_ministry/modules/finance/finance-reports.html", scene: "財務", status: "partial", sidebar: "church_ministry/sidebar_crm_journey.html" },
    { layer: "crm", id: "small_groups", label: "團契小組", path: "church_ministry/modules/fellowship/small-groups-integrated.html", scene: "事工", status: "live", sidebar: "church_ministry/sidebar_crm_journey.html" },
    { layer: "crm", id: "checkin_qr", label: "掃碼簽到", path: "church_ministry/modules/worship/attendance-management.html", scene: "事工", status: "partial", sidebar: "church_ministry/sidebar_crm_journey.html" },
    { layer: "crm", id: "ss_students", label: "主日學學員", path: "church_ministry/modules/education/education-integrated.html", scene: "事工", status: "partial", sidebar: "church_ministry/sidebar_crm_journey.html" },
    { layer: "crm", id: "event_registration", label: "活動報名", path: "school_management/course_completion.html", scene: "事工", status: "partial", sidebar: "church_ministry/sidebar_crm_journey.html" },
    { layer: "crm", id: "attendance_stats", label: "出席率統計", path: "church_ministry/modules/analytics/activity-statistics.html", scene: "事工", status: "stub", sidebar: "church_ministry/sidebar_crm_journey.html" },
    { layer: "crm", id: "volunteer_profile", label: "義工檔案", path: "church_ministry/modules/volunteer/volunteer-integrated.html", scene: "義工", status: "live", sidebar: "church_ministry/sidebar_crm_journey.html" },
    { layer: "crm", id: "volunteer_shift", label: "智能排班", path: "church_ministry/tools/volunteer_shift/index.html", scene: "義工", status: "live", sidebar: "church_ministry/sidebar_crm_journey.html" },
    { layer: "crm", id: "volunteer_leave", label: "請假調班", path: "", scene: "義工", status: "missing", sidebar: "church_ministry/sidebar_crm_journey.html" },
    { layer: "crm", id: "volunteer_hours", label: "工時累計", path: "church_ministry/modules/volunteer/volunteer-integrated.html", scene: "義工", status: "stub", sidebar: "church_ministry/sidebar_crm_journey.html" },
    { layer: "crm", id: "worship_order", label: "程序單", path: "church_ministry/modules/worship/worship-management.html", scene: "崇拜", status: "stub", sidebar: "church_ministry/sidebar_crm_journey.html" },
    { layer: "crm", id: "hymn_projection", label: "詩歌投影", path: "hymn_management/index.html", scene: "崇拜", status: "partial", sidebar: "church_ministry/sidebar_crm_journey.html" },
    { layer: "crm", id: "worship_attendance", label: "聚會人數", path: "church_ministry/modules/worship/attendance-management.html", scene: "崇拜", status: "partial", sidebar: "church_ministry/sidebar_crm_journey.html" },
    { layer: "crm", id: "worship_team_roles", label: "崗位聯動", path: "church_ministry/modules/worship/worship-integrated.html", scene: "崇拜", status: "partial", sidebar: "church_ministry/sidebar_crm_journey.html" },
    { layer: "crm", id: "visitation_followup", label: "探訪跟進", path: "church_ministry/tools/visitation_followup/index.html", scene: "外展", status: "live", sidebar: "church_ministry/sidebar_crm_journey.html" },
    { layer: "crm", id: "outreach_street", label: "街頭佈道", path: "church_ministry/modules/expansion/outreach-strategy.html", scene: "外展", status: "stub", sidebar: "church_ministry/sidebar_crm_journey.html" },
    { layer: "crm", id: "mission_supply", label: "短宣物資", path: "church_ministry/modules/mission/mission-ministry.html", scene: "外展", status: "stub", sidebar: "church_ministry/sidebar_crm_journey.html" },

    /* --- 自動化（已做／預備）--- */
    { layer: "automation", id: "crm_console", label: "CRM 自動化控制台", path: "ai_tools/pages/crm_automation_console.html", targetPath: "ai_tools/pages/auto_crm_console.html", status: "live", sidebar: "none" },
    { layer: "automation", id: "workflow", label: "自動化工作流", path: "church_ministry/modules/tech/automation-workflow.html", targetPath: "church_ministry/modules/tech/auto_workflow.html", status: "live", sidebar: "none" },
    { layer: "automation", id: "ai_assistant", label: "AI 營運助理", path: "church_ministry/modules/tech/ai-assistant.html", targetPath: "church_ministry/modules/tech/auto_ai_assistant.html", status: "partial", sidebar: "none" },
    { layer: "automation", id: "smart_recommendation", label: "智能推薦", path: "church_ministry/modules/tech/smart-recommendation.html", status: "stub", sidebar: "none" },
    { layer: "automation", id: "sync_observer", label: "數據同步紀錄", path: "index_v5.html#syncObserverDrawer", status: "live", sidebar: "index_v5.html" }
  ];

  var BY_ID = {};
  var BY_LAYER = {};
  ENTRIES.forEach(function (e) {
    BY_ID[e.layer + ":" + e.id] = e;
    if (!BY_LAYER[e.layer]) BY_LAYER[e.layer] = [];
    BY_LAYER[e.layer].push(e);
  });

  global.ChurchToolsManifest = {
    version: 1,
    naming: NAMING,
    entries: ENTRIES,
    byId: function (layer, id) {
      return BY_ID[layer + ":" + id] || null;
    },
    byLayer: function (layer) {
      return BY_LAYER[layer] ? BY_LAYER[layer].slice() : [];
    },
    livePaths: function () {
      return ENTRIES.filter(function (e) {
        return e.status === "live" && e.path;
      }).map(function (e) {
        return e.path;
      });
    }
  };
})(typeof window !== "undefined" ? window : this);
