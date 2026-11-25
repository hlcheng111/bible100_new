/**
 * CM · 紅旗（需牧者即時關心）清單設定
 *
 * 原則（MRM 工程計畫 P1）：
 *  - 紅旗由「人」勾選標記，不經 AI、不由系統自動判斷。
 *  - 不分規模檔位（微／小／中／大一律開啟）。
 *  - 本檔可用記事本直接改：增刪 DEFAULT_FLAGS 的項目即可，不需懂程式。
 *  - 通知稿只負責「整理文字」，發送由人完成（複製後交給牧者）。
 *
 * 規格：church_ministry/docs/MRM_ENGINEERING_PLAN_V1.md §P1
 */
(function (global) {
  "use strict";

  /**
   * 紅旗項目（牧者可增刪）
   * - id：穩定代碼（寫入事件流，改名請保留 id）
   * - crisis：true 代表危機情境，通知稿會多一行「先確保安全」提示
   */
  var DEFAULT_FLAGS = [
    { id: "hospital", label_zh: "住院／重病／手術", label_en: "Hospital / serious illness", crisis: false },
    { id: "bereavement", label_zh: "喪親／家人離世", label_en: "Bereavement", crisis: false },
    { id: "job_loss", label_zh: "失業／經濟急難", label_en: "Job loss / financial crisis", crisis: false },
    { id: "self_harm", label_zh: "提到想傷害自己或不想活", label_en: "Self-harm / suicidal words", crisis: true },
    { id: "violence", label_zh: "家暴／人身安全有危險", label_en: "Violence / personal safety", crisis: true },
    { id: "abuse", label_zh: "兒童或長者受虐、不當對待", label_en: "Child / elder abuse", crisis: true }
  ];

  /** 至少要讓幾位牧者／負責同工知悉 */
  var NOTIFY_MIN = 2;

  function getFlags() {
    var list = DEFAULT_FLAGS.filter(function (f) {
      return f && f.id && f.label_zh;
    });
    return list.length ? list.slice() : [{ id: "other", label_zh: "其他需要即時關心", label_en: "Other", crisis: false }];
  }

  function labelFor(flagId) {
    var all = getFlags();
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === flagId) return all[i].label_zh;
    }
    return String(flagId || "");
  }

  function hasCrisis(flagIds) {
    var ids = flagIds || [];
    var all = getFlags();
    return all.some(function (f) {
      return f.crisis && ids.indexOf(f.id) >= 0;
    });
  }

  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function formatTime(d) {
    d = d || new Date();
    return (
      d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()) +
      " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes())
    );
  }

  /**
   * 產生「通知稿」純文字（不依賴任何儲存；寫入失敗時仍可使用）
   * opts: { name, memberId, flagIds[], markedBy, time(Date) }
   */
  function buildNoticeText(opts) {
    opts = opts || {};
    var ids = opts.flagIds || [];
    var labels = ids.map(labelFor).join("、") || "（未勾選）";
    var who = opts.name ? opts.name + (opts.memberId ? "（" + opts.memberId + "）" : "") : "（未選會友）";
    var lines = [
      "【紅旗・請今天內聯絡】",
      "對象：" + who,
      "類別：" + labels,
      "標記：" + (opts.markedBy || "同工") + " · " + formatTime(opts.time),
      "請至少 " + NOTIFY_MIN + " 位牧者／負責同工知悉，並由人直接聯絡（電話或當面）。"
    ];
    if (hasCrisis(ids)) {
      lines.push("此類別屬危機情境：請先確保當事人安全；必要時請聯絡當地緊急服務或專業協助。");
    }
    lines.push("細節請口頭說明，請勿在群組或訊息中寫出隱私內容。");
    lines.push("（本通知稿由系統整理；紅旗由人標記，並非 AI 判斷。）");
    return lines.join("\n");
  }

  /* ---- P2：紅旗狀態機（open → ack → done；可 snoozed；done 可再開） ---- */

  var STATUS_EVENT_TYPE = "red_flag_status";
  var STATUSES = ["open", "ack", "done", "snoozed"];
  var STATUS_LABEL_ZH = { open: "待處理", ack: "已認領", done: "已完成", snoozed: "暫緩" };

  function statusLabel(s) {
    return STATUS_LABEL_ZH[s] || "待處理";
  }

  function tsOf(e) {
    return String((e && (e.ts || e.created_at)) || "");
  }

  /**
   * 由事件流推導每個紅旗（alert_id = 紅旗 event_id）的目前狀態。
   * 規則：沒有任何 red_flag_status 事件 → open；有則取 ts 最新者。
   * 純函式，不讀寫儲存。
   * 回傳 { [alert_id]: { status, updated_at, flagEvent } }
   */
  function deriveFlagStatuses(events) {
    var list = Array.isArray(events) ? events : [];
    var out = {};
    list.forEach(function (e) {
      if (e && e.event_type === "red_flag" && e.event_id) {
        out[e.event_id] = { status: "open", updated_at: tsOf(e), flagEvent: e };
      }
    });
    var latest = {};
    list.forEach(function (e) {
      if (!e || e.event_type !== STATUS_EVENT_TYPE) return;
      var aid = e.metadata && e.metadata.alert_id;
      if (!aid || !out[aid]) return;
      if (!latest[aid] || tsOf(e) >= tsOf(latest[aid])) latest[aid] = e;
    });
    Object.keys(latest).forEach(function (aid) {
      var st = latest[aid].metadata.status;
      out[aid].status = STATUSES.indexOf(st) >= 0 ? st : "open";
      out[aid].updated_at = tsOf(latest[aid]);
    });
    return out;
  }

  /**
   * 每週 Check 摘要（純文字，給人貼到 PDCA 的 Check 欄；系統不替人寫 Act）。
   * opts: { flagEvents: [red_flag 事件], statuses: deriveFlagStatuses 結果, absenceCount, weekStartMs, nowMs }
   */
  function buildWeeklySummaryText(opts) {
    opts = opts || {};
    var flags = opts.flagEvents || [];
    var statuses = opts.statuses || {};
    var start = Number(opts.weekStartMs || 0);
    var inWeek = flags.filter(function (e) {
      var t = Date.parse(tsOf(e));
      return !isNaN(t) && t >= start;
    });
    var counts = { open: 0, ack: 0, done: 0, snoozed: 0 };
    inWeek.forEach(function (e) {
      var s = statuses[e.event_id] ? statuses[e.event_id].status : "open";
      counts[s] = (counts[s] || 0) + 1;
    });
    var lines = [
      "【本週 Check 摘要 · 紅旗與缺席】",
      "紅旗（本週新增）：" + inWeek.length + " 筆",
      "  待處理 " + counts.open + "｜已認領 " + counts.ack + "｜已完成 " + counts.done + "｜暫緩 " + counts.snoozed,
      "未聚會達門檻、待探訪：" + (opts.absenceCount || 0) + " 人",
      "（由系統依紀錄整理；成效判斷與下週行動由牧者填寫。）"
    ];
    return lines.join("\n");
  }

  var api = {
    SCHEMA_VERSION: 1,
    EVENT_TYPE: "red_flag",
    STATUS_EVENT_TYPE: STATUS_EVENT_TYPE,
    STATUSES: STATUSES,
    NOTIFY_MIN: NOTIFY_MIN,
    DEFAULT_FLAGS: DEFAULT_FLAGS,
    getFlags: getFlags,
    labelFor: labelFor,
    hasCrisis: hasCrisis,
    buildNoticeText: buildNoticeText,
    formatTime: formatTime,
    statusLabel: statusLabel,
    deriveFlagStatuses: deriveFlagStatuses,
    buildWeeklySummaryText: buildWeeklySummaryText
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    global.CmRedFlagConfig = api;
  }
})(typeof window !== "undefined" ? window : this);
