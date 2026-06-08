/**
 * C0 PoC · 事奉媒合急缺示範資料（與 church_ministry MATCHMAKER_DATA.urgentJobs 對齊）
 * 評測頁不載入 crm_journey_common.js 時，由此提供只讀急缺；CRM 已載入時 bridge 優先讀 CrmJourneyBrand。
 */
(function (global) {
  "use strict";

  var MINISTRY_TO_DEPT = {
    care: "pastoral",
    teaching: "kids",
    worship: "worship",
    hospitality: "pastoral",
    admin: "admin",
    outreach: "outreach",
    media: "worship",
    planning: "planning"
  };

  var DATA = {
    worship: {
      titleZh: "🎼 敬拜及音樂",
      urgentJobs: [
        { nameZh: "主日崇拜影音剪輯", needed: 2, current: 0, typeZh: "活動工作" },
        { nameZh: "第一堂崇拜鍵盤手", needed: 1, current: 0, typeZh: "常態事奉" },
        { nameZh: "音響控制隨班實習", needed: 3, current: 1, typeZh: "培訓崗位" }
      ]
    },
    pastoral: {
      titleZh: "👥 牧養及小組",
      urgentJobs: [
        { nameZh: "開放家庭核心接待同工", needed: 3, current: 1, typeZh: "常態事奉" },
        { nameZh: "新朋友關懷跟進員", needed: 4, current: 2, typeZh: "活動工作" }
      ]
    },
    kids: {
      titleZh: "📚 兒童及門訓",
      urgentJobs: [
        { nameZh: "兒童主日學助教（AI 備課輔助）", needed: 3, current: 1, typeZh: "常態事奉" }
      ]
    },
    outreach: {
      titleZh: "🌍 外展及差傳",
      urgentJobs: [
        { nameZh: "小語種教材翻譯／校對同工", needed: 2, current: 0, typeZh: "活動工作" }
      ]
    },
    admin: {
      titleZh: "⚙️ 行政支援",
      urgentJobs: [
        { nameZh: "主日接待與點名簽到行政", needed: 3, current: 2, typeZh: "常態事奉" }
      ]
    },
    planning: {
      titleZh: "🧭 教會規劃 OS",
      urgentJobs: [
        { nameZh: "策略專案管理／流程優化同工", needed: 1, current: 0, typeZh: "策略崗位" }
      ]
    }
  };

  function deptForMinistryId(ministryId) {
    return MINISTRY_TO_DEPT[ministryId] || "pastoral";
  }

  function resolveDataSource() {
    if (global.CrmJourneyBrand && global.CrmJourneyBrand.MATCHMAKER_DATA) {
      return global.CrmJourneyBrand.MATCHMAKER_DATA;
    }
    return DATA;
  }

  function pickTopUrgentJob(deptKey) {
    var src = resolveDataSource();
    var block = src[deptKey];
    if (!block || !block.urgentJobs || !block.urgentJobs.length) return null;
    var best = null;
    var bestGap = 0;
    block.urgentJobs.forEach(function (job) {
      var gap = (Number(job.needed) || 0) - (Number(job.current) || 0);
      if (gap > bestGap) {
        bestGap = gap;
        best = job;
      }
    });
    if (!best || bestGap <= 0) return null;
    return {
      dept_key: deptKey,
      dept_title: block.titleZh || deptKey,
      name_zh: best.nameZh,
      type_zh: best.typeZh || "",
      gap: bestGap,
      needed: best.needed,
      current: best.current
    };
  }

  function matchOpenRoleForCard(card) {
    if (!card || !card.ministry_id) return null;
    var deptKey = deptForMinistryId(card.ministry_id);
    return pickTopUrgentJob(deptKey);
  }

  global.MatchmakerUrgentJobs = {
    DATA: DATA,
    MINISTRY_TO_DEPT: MINISTRY_TO_DEPT,
    deptForMinistryId: deptForMinistryId,
    resolveDataSource: resolveDataSource,
    pickTopUrgentJob: pickTopUrgentJob,
    matchOpenRoleForCard: matchOpenRoleForCard
  };
})(typeof window !== "undefined" ? window : global);
