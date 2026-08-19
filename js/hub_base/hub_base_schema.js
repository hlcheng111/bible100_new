/**
 * Hub Base · 五域 Schema 契約（Phase 1 · Wave 1 底座）
 *
 * 本檔定義全站資料契約與 canonical 對照，不另建業務 storage 桶。
 * 所有業務頁面禁止自建永久欄位；新增欄位須先更新本契約與對應 *_DATA_RULES.md。
 */
(function (global) {
  "use strict";

  var SCHEMA_VERSION = 1;

  /**
   * @typedef {Object} SchemaFieldDef
   * @property {string} type
   * @property {boolean} [required]
   * @property {string} [desc]
   */

  var HubBaseSchema = {
    VERSION: SCHEMA_VERSION,

    /** 各域契約摘要 */
    DOMAINS: {
      member_crm: "member_crm",
      ministry_catalog: "ministry_catalog",
      talent_pool: "talent_pool",
      audit_log: "audit_log",
      pdca_run: "pdca_run",
    },

    /**
     * 1. 會友 CRM 主檔
     * Canonical: memberSystemData · CentralMemberDB
     * 規格: js/central_member_db.js · member-integrated
     */
    MEMBER_CRM: {
      domain: "member_crm",
      schema_version: SCHEMA_VERSION,
      canonicalKey: "memberSystemData",
      canonicalApi: "CentralMemberDB",
      spaceIdField: "churchId",
      desc: "中央會友主檔（含小組、事工指派、出席等）",
      rootFields: {
        churchId: { type: "string", required: true, desc: "教會空間 ID（= spaceId）" },
        members: { type: "array", required: true, desc: "會友列" },
        groups: { type: "array", required: false, desc: "小組" },
        ministries: { type: "array", required: false, desc: "CM 事工目錄快照" },
        groupMemberships: { type: "array", required: false, desc: "小組成員" },
        ministryAssignments: { type: "array", required: false, desc: "CM 事工指派" },
        trainings: { type: "array", required: false, desc: "培訓記錄" },
        attendance: { type: "array", required: false, desc: "出席" },
        donations: { type: "array", required: false, desc: "奉獻（可選）" },
      },
      memberFields: {
        id: { type: "number|string", required: true, desc: "會友 ID" },
        memberId: { type: "number|string", required: true, desc: "對齊 id" },
        name: { type: "string", required: true, desc: "姓名" },
        churchId: { type: "string", required: false, desc: "所屬空間" },
        gifts: { type: "string", required: false, desc: "恩賜標籤（展示）" },
        skills: { type: "string", required: false, desc: "技能" },
        health: { type: "object", required: false, desc: "靈命健康快照（A1/A2/A3）" },
      },
    },

    /**
     * 2. 事工工庫
     * Canonical: bible100_smart_ministry_main.ministries · SmartMinistryCanonical
     * CM 區域目錄另見 memberSystemData.ministries（遷移期並存，以 SM canonical 配對為準）
     */
    MINISTRY_CATALOG: {
      domain: "ministry_catalog",
      schema_version: SCHEMA_VERSION,
      canonicalKey: "bible100_smart_ministry_main",
      canonicalApi: "SmartMinistryCanonical",
      collection: "ministries",
      spaceIdField: "church_id",
      desc: "事工／崗位目錄（A–G 分類、缺口、狀態）",
      itemFields: {
        id: { type: "string", required: true, desc: "崗位 ID" },
        name: { type: "string", required: true, desc: "崗位名" },
        zone: { type: "string", required: false, desc: "A–G 區碼（對齊 CM_ZONES）" },
        category: { type: "string", required: false, desc: "細分類" },
        required_gifts: { type: "array|string", required: false, desc: "所需恩賜" },
        headcount_gap: { type: "number", required: false, desc: "人數缺口" },
        status: { type: "string", required: false, desc: "open|filled|paused" },
        department: { type: "string", required: false, desc: "所屬部門" },
        church_id: { type: "string", required: false, desc: "所屬空間" },
      },
    },

    /**
     * 3. 人材池
     * Canonical: bible100_smart_ministry_main.talents · talent_id = member_id
     * 規格: smart_ministry/docs/SMART_MINISTRY_DATA_RULES.md
     */
    TALENT_POOL: {
      domain: "talent_pool",
      schema_version: SCHEMA_VERSION,
      canonicalKey: "bible100_smart_ministry_main",
      canonicalApi: "SmartMinistryCanonical",
      collection: "talents",
      spaceIdField: "church_id",
      desc: "智慧事奉人才池（恩賜、可服事時間、匹配權重）",
      itemFields: {
        talent_id: { type: "string", required: true, desc: "主鍵 = member_id" },
        member_id: { type: "string", required: true, desc: "對齊會友" },
        name: { type: "string", required: false, desc: "姓名" },
        gift: { type: "string", required: false, desc: "恩賜摘要" },
        mbti: { type: "string", required: false, desc: "MBTI（可選）" },
        service_status: { type: "string", required: false, desc: "serving|pause|released" },
        matching_constraints: { type: "object", required: false, desc: "配對硬性/人工確認規則" },
        tags_source: { type: "string", required: false, desc: "gifts_test|shape|manual_leader|assessment" },
        leader_confirmed_at: { type: "string", required: false, desc: "同工人工確認恩賜標籤時間（受保護）" },
        church_id: { type: "string", required: false, desc: "所屬空間" },
        created_at: { type: "string", required: false, desc: "ISO 時間" },
        updated_at: { type: "string", required: false, desc: "ISO 時間" },
      },
    },

    /**
     * 4. 全站操作審計日誌（Hub Base 新增；非業務 canonical）
     * Storage: bible100_audit_log
     */
    AUDIT_LOG: {
      domain: "audit_log",
      schema_version: SCHEMA_VERSION,
      canonicalKey: "bible100_audit_log",
      canonicalApi: "HubBase",
      spaceIdField: "spaceId",
      desc: "跨域操作審計（變更前後、角色、備註）",
      entryFields: {
        id: { type: "string", required: true, desc: "審計列 ID" },
        spaceId: { type: "string", required: true, desc: "教會空間" },
        timestamp: { type: "string", required: true, desc: "ISO 時間" },
        role: { type: "string", required: false, desc: "操作時模擬角色" },
        actor: { type: "string", required: false, desc: "操作者標識（本機可空）" },
        domain: { type: "string", required: true, desc: "member_crm|talent_pool|…" },
        action: { type: "string", required: true, desc: "read|write|export|import|…" },
        target_id: { type: "string", required: false, desc: "對象 ID" },
        before: { type: "object|null", required: false, desc: "變更前快照（摘要）" },
        after: { type: "object|null", required: false, desc: "變更後快照（摘要）" },
        note: { type: "string", required: false, desc: "備註" },
        source: { type: "string", required: false, desc: "頁面或 API 來源" },
      },
    },

    /**
     * 5. PDCA / 量表 Run
     * Canonical: bible100_assessment_runs + bible100_assessment_latest_{toolId}
     * API: AssessmentRunStore
     */
    PDCA_RUN: {
      domain: "pdca_run",
      schema_version: SCHEMA_VERSION,
      canonicalKey: "bible100_assessment_runs",
      canonicalApi: "AssessmentRunStore",
      spaceIdField: "church_id",
      desc: "Planning 量表與 PDCA 循環記錄",
      runFields: {
        schema_version: { type: "number", required: true, desc: "Run schema 版本" },
        tool_id: { type: "string", required: true, desc: "pdca|swot|kpiokr|…" },
        timestamp: { type: "number", required: true, desc: "Unix ms" },
        member_id: { type: "string|number|null", required: false, desc: "關聯會友" },
        church_id: { type: "string", required: false, desc: "所屬空間" },
        feature_vector: { type: "object", required: true, desc: "特徵向量" },
        raw_answers: { type: "array", required: true, desc: "原始作答" },
        risk_flags: { type: "array", required: true, desc: "風險旗標" },
        derived: { type: "object", required: false, desc: "衍生摘要（含 PDCA 契約）" },
        pdca_contract: { type: "object", required: false, desc: "Plan/Do/Check/Act 對照" },
      },
    },

    /** 依 domain 取得契約 */
    getByDomain: function (domain) {
      var map = {
        member_crm: HubBaseSchema.MEMBER_CRM,
        ministry_catalog: HubBaseSchema.MINISTRY_CATALOG,
        talent_pool: HubBaseSchema.TALENT_POOL,
        audit_log: HubBaseSchema.AUDIT_LOG,
        pdca_run: HubBaseSchema.PDCA_RUN,
      };
      return map[domain] || null;
    },

    /** 列出全部五域 */
    listAll: function () {
      return [
        HubBaseSchema.MEMBER_CRM,
        HubBaseSchema.MINISTRY_CATALOG,
        HubBaseSchema.TALENT_POOL,
        HubBaseSchema.AUDIT_LOG,
        HubBaseSchema.PDCA_RUN,
      ];
    },
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = HubBaseSchema;
  } else {
    global.HubBaseSchema = HubBaseSchema;
  }
})(typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : this);
