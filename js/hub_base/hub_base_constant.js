/**
 * Hub Base · 全局常量（Phase 1 · Wave 1 底座）
 *
 * 本檔為 facade 配套常量，不取代各域 canonical store。
 * 正式寫入仍走：CentralMemberDB / SmartMinistryCanonical / AssessmentRunStore。
 */
(function (global) {
  "use strict";

  var HubBaseConstant = {
    VERSION: "1.0.0",
    BUILD: "20260819hb",

    /** 模擬角色（localStorage；階段一僅 API，不改頂欄 UI） */
    ROLES: {
      member: {
        id: "member",
        label: "普通會友",
        level: 1,
      },
      ministry_leader: {
        id: "ministry_leader",
        label: "事工負責人",
        level: 2,
      },
      admin: {
        id: "admin",
        label: "管理員",
        level: 3,
      },
    },

    /** 預設角色 */
    DEFAULT_ROLE: "member",

    /** 角色模擬 localStorage 鍵 */
    ROLE_STORAGE_KEY: "bible100_hub_base_sim_role",

    /**
     * 教會事工 A–G 區（對齊 js/cm_zone_nav_ssot.js · CmZoneNavSsot.ZONES）
     * hub_base 只做對照；路由 SSOT 仍在 cm_zone_nav_ssot。
     */
    CM_ZONES: [
      { id: "gateway", focus: "", label: "路線總覽" },
      { id: "a", focus: "a", label: "A 敬拜音樂" },
      { id: "b", focus: "b", label: "B 牧養小組" },
      { id: "c", focus: "c", label: "C 聖經門訓" },
      { id: "d", focus: "d", label: "D 外展差傳" },
      { id: "e", focus: "e", label: "E 社會服務" },
      { id: "f", focus: "f", label: "F 詩歌應用" },
      { id: "g", focus: "g", label: "G 規劃行政" },
    ],

    /** Canonical localStorage 鍵（唯讀對照；寫入須經 facade 委派 canonical API） */
    STORAGE_KEYS: {
      member: "memberSystemData",
      smartMinistry: "bible100_smart_ministry_main",
      assessmentRuns: "bible100_assessment_runs",
      assessmentLatestPrefix: "bible100_assessment_latest_",
      audit: "bible100_audit_log",
    },

    /** Canonical 全域 API 名稱（facade 委派目標） */
    CANONICAL_APIS: {
      member: "CentralMemberDB",
      smartMinistry: "SmartMinistryCanonical",
      assessment: "AssessmentRunStore",
    },

    /** USB 匯出包版本 */
    BUNDLE_VERSION: 1,

    /** 審計日誌上限（本機） */
    MAX_AUDIT_ENTRIES: 500,

    /** spaceId 別名：對外統一 spaceId，對內映射 churchId / church_id */
    SPACE_ID_ALIASES: ["spaceId", "churchId", "church_id"],
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = HubBaseConstant;
  } else {
    global.HubBaseConstant = HubBaseConstant;
  }
})(typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : this);
