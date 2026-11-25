/**
 * CM · 領袖培育路徑（C 區 · P3）設定與純函式
 *
 * 原則（MRM 工程計畫 V1 §1、§5.4）：
 *  - 只記「人」做的每一步；系統只整理進度、列出條件，**不自動晉升、不改會友資料**。
 *  - 不動屬靈階段五階（spiritual_journey_stage）；「見習／小組長」由事件流推導，不新增會友欄位。
 *  - 條件數字都在 CRITERIA，小白用記事本就能改（見下）。
 *  - 本檔不連網、不呼叫 AI；缺資料時降級，不丟錯。
 *
 * 事件類型：leader_path（走 ChurchDataBridge.appendPastoralEvent，權限 pastoral.write）
 * 規格：church_ministry/docs/MRM_ENGINEERING_PLAN_V1.md §5.4
 */
(function (global) {
  "use strict";

  var EVENT_TYPE = "leader_path";

  /** 小白可改：晉升前需要達成的條件 */
  var CRITERIA = {
    min_apprentice_days: 90, // 見習至少多少天（暫停期間不計）
    min_shadow_sessions: 3, // 至少「影隨」幾次（見習者在老手帶領下觀摩／帶一段）
    require_baptized: true // 是否要求已受洗（名冊有標示才算達成）；不需要請改 false
  };

  /** 步驟（程式用代碼請勿改；label_zh 可改成貴會習慣的說法） */
  var STEPS = ["invited", "apprentice", "shadow", "paused", "promoted"];
  var STEP_LABEL_ZH = {
    invited: "邀請見習",
    apprentice: "開始見習",
    shadow: "影隨一次",
    paused: "暫停見習",
    promoted: "牧者同意晉升為小組長"
  };

  /** 目前所在階段（由事件流推導） */
  var STAGE_LABEL_ZH = {
    none: "尚未開始",
    invited: "已邀請，等待開始",
    apprentice: "見習中",
    paused: "暫停中",
    leader: "已晉升小組長"
  };

  var DAY_MS = 24 * 60 * 60 * 1000;

  function stepLabel(step) {
    return STEP_LABEL_ZH[step] || String(step || "");
  }

  function stageLabel(stage) {
    return STAGE_LABEL_ZH[stage] || STAGE_LABEL_ZH.none;
  }

  function mergedCriteria(override) {
    var out = {
      min_apprentice_days: CRITERIA.min_apprentice_days,
      min_shadow_sessions: CRITERIA.min_shadow_sessions,
      require_baptized: CRITERIA.require_baptized
    };
    if (override && typeof override === "object") {
      if (isFinite(Number(override.min_apprentice_days))) out.min_apprentice_days = Number(override.min_apprentice_days);
      if (isFinite(Number(override.min_shadow_sessions))) out.min_shadow_sessions = Number(override.min_shadow_sessions);
      if (typeof override.require_baptized === "boolean") out.require_baptized = override.require_baptized;
    }
    return out;
  }

  /**
   * 由事件流推導單一會友的路徑狀態（純函式）。
   * @param {Array} events 該會友的 pastoral 事件（可含其他類型，會自動過濾）
   * @param {number} [nowMs] 現在時間（毫秒），預設 Date.now()
   * @returns {{stage, startMs, activeDays, shadowCount, promotedMs, lastStep, steps}}
   */
  function deriveLeaderPath(events, nowMs) {
    var now = isFinite(Number(nowMs)) ? Number(nowMs) : Date.now();
    var list = (Array.isArray(events) ? events : [])
      .filter(function (e) {
        return (
          e &&
          e.event_type === EVENT_TYPE &&
          e.metadata &&
          STEPS.indexOf(e.metadata.step) >= 0 &&
          isFinite(Date.parse(e.ts || e.created_at))
        );
      })
      .map(function (e) {
        return { step: e.metadata.step, ms: Date.parse(e.ts || e.created_at), ev: e };
      })
      .sort(function (a, b) {
        return a.ms - b.ms;
      });

    var stage = "none";
    var startMs = null;
    var activeMs = 0;
    var activeFrom = null; // 目前見習中的起點
    var shadowCount = 0;
    var promotedMs = null;
    var lastStep = null;

    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      if (stage === "leader") break; // 已晉升：後續紀錄不再改變狀態
      lastStep = s.step;
      if (s.step === "invited") {
        if (stage === "none") stage = "invited";
      } else if (s.step === "apprentice") {
        if (stage !== "apprentice") {
          stage = "apprentice";
          activeFrom = s.ms;
          if (startMs === null) startMs = s.ms;
        }
      } else if (s.step === "shadow") {
        if (startMs !== null && s.ms >= startMs) shadowCount++;
      } else if (s.step === "paused") {
        if (stage === "apprentice" && activeFrom !== null) {
          activeMs += Math.max(0, s.ms - activeFrom);
          activeFrom = null;
          stage = "paused";
        }
      } else if (s.step === "promoted") {
        if (stage === "apprentice" && activeFrom !== null) {
          activeMs += Math.max(0, s.ms - activeFrom);
          activeFrom = null;
        }
        stage = "leader";
        promotedMs = s.ms;
      }
    }
    if (stage === "apprentice" && activeFrom !== null) {
      activeMs += Math.max(0, now - activeFrom);
    }

    return {
      stage: stage,
      startMs: startMs,
      activeDays: Math.floor(activeMs / DAY_MS),
      shadowCount: shadowCount,
      promotedMs: promotedMs,
      lastStep: lastStep,
      steps: list.length
    };
  }

  /**
   * 晉升條件檢核（純函式）。ready=true 只代表「條件齊了，可請牧者考慮」，不是自動晉升。
   * @param {Object} path deriveLeaderPath 的結果
   * @param {Object|null} member 會友資料（只讀 baptized；找不到時該項顯示「待確認」）
   * @param {Object} [criteriaOverride]
   */
  function evaluatePromotion(path, member, criteriaOverride) {
    var c = mergedCriteria(criteriaOverride);
    var p = path || deriveLeaderPath([]);
    var items = [];

    items.push({
      id: "started",
      label: "已開始見習",
      met: p.stage === "apprentice" || p.stage === "leader",
      detail: p.stage === "apprentice" ? "見習中" : p.stage === "leader" ? "已晉升" : "尚未開始見習"
    });
    items.push({
      id: "days",
      label: "見習滿 " + c.min_apprentice_days + " 天",
      met: p.activeDays >= c.min_apprentice_days,
      detail: "已 " + p.activeDays + "／" + c.min_apprentice_days + " 天（暫停期間不計）"
    });
    items.push({
      id: "shadow",
      label: "影隨至少 " + c.min_shadow_sessions + " 次",
      met: p.shadowCount >= c.min_shadow_sessions,
      detail: "已 " + p.shadowCount + "／" + c.min_shadow_sessions + " 次"
    });
    if (c.require_baptized) {
      var known = member && typeof member.baptized === "boolean";
      items.push({
        id: "baptized",
        label: "已受洗",
        met: !!(known && member.baptized),
        detail: !member ? "找不到會友資料，待確認" : known ? (member.baptized ? "名冊標示已受洗" : "名冊標示尚未受洗") : "名冊未標示，待確認"
      });
    }

    var allMet = items.every(function (it) {
      return it.met;
    });
    return {
      criteria: c,
      items: items,
      ready: p.stage === "apprentice" && allMet,
      unmet: items.filter(function (it) {
        return !it.met;
      })
    };
  }

  /**
   * 組出要寫入事件流的內容（純函式，方便測試）。
   * @param {string} step STEPS 之一
   * @param {string} [dateStr] 使用者選的日期 YYYY-MM-DD（可補登過去日期；不可晚於今天）
   * @param {number} [nowMs]
   * @returns {{ok:boolean, reason?:string, payload?:Object}}
   */
  function buildStepPayload(step, dateStr, nowMs) {
    if (STEPS.indexOf(step) < 0) return { ok: false, reason: "未知的步驟" };
    var now = isFinite(Number(nowMs)) ? Number(nowMs) : Date.now();
    var ts = new Date(now);
    if (dateStr) {
      var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateStr));
      if (!m) return { ok: false, reason: "日期格式不對，請用 年-月-日" };
      var picked = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0, 0);
      if (isNaN(picked.getTime())) return { ok: false, reason: "日期不正確" };
      if (picked.getTime() > now + DAY_MS) return { ok: false, reason: "日期不能晚於今天" };
      ts = picked;
    }
    return {
      ok: true,
      payload: {
        event_type: EVENT_TYPE,
        ts: ts.toISOString(),
        summary: stepLabel(step),
        source_module: "leader_path_panel",
        metadata: { step: step, human_marked: true }
      }
    };
  }

  /** 此階段可做的下一步（小白只會看到有意義的按鈕） */
  function nextSteps(stage) {
    if (stage === "none") return ["invited", "apprentice"];
    if (stage === "invited") return ["apprentice"];
    if (stage === "apprentice") return ["shadow", "paused", "promoted"];
    if (stage === "paused") return ["apprentice"];
    return []; // leader
  }

  /** 可貼到牧者會議的純文字摘要（只整理，不下判斷） */
  function buildSummaryText(opts) {
    opts = opts || {};
    var p = opts.path || deriveLeaderPath([]);
    var ev = opts.evaluation || evaluatePromotion(p, null);
    var lines = [];
    lines.push("【領袖培育進度】" + (opts.name || "（未選會友）"));
    lines.push("目前階段：" + stageLabel(p.stage));
    if (p.stage === "apprentice" || p.stage === "paused" || p.stage === "leader") {
      lines.push("見習天數：" + p.activeDays + " 天；影隨次數：" + p.shadowCount + " 次");
    }
    if (p.stage !== "leader") {
      ev.items.forEach(function (it) {
        lines.push((it.met ? "✔ " : "○ ") + it.label + "（" + it.detail + "）");
      });
      lines.push(ev.ready ? "條件已齊，可請牧者考慮是否晉升。" : "條件尚未齊全。");
    }
    lines.push("※ 系統只整理進度，晉升與否由牧者決定。");
    return lines.join("\n");
  }

  var api = {
    EVENT_TYPE: EVENT_TYPE,
    CRITERIA: CRITERIA,
    STEPS: STEPS,
    STEP_LABEL_ZH: STEP_LABEL_ZH,
    STAGE_LABEL_ZH: STAGE_LABEL_ZH,
    stepLabel: stepLabel,
    stageLabel: stageLabel,
    deriveLeaderPath: deriveLeaderPath,
    evaluatePromotion: evaluatePromotion,
    buildStepPayload: buildStepPayload,
    nextSteps: nextSteps,
    buildSummaryText: buildSummaryText
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    global.CmLeaderPathConfig = api;
  }
})(typeof window !== "undefined" ? window : this);
