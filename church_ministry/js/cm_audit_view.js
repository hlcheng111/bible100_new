/**
 * 操作紀錄（審計）檢視核心（P6）——純函式，唯讀。
 * 資料來源：ChurchDataBridge.getAuditLogs（key churchAuditLog）。這裡不新增、不修改、不刪除紀錄。
 *
 * 小白維護：想讓某個操作顯示成白話，就在 ACTION_LABELS 加一行。
 * 隱私：只顯示 PAYLOAD_LABELS 白名單內的欄位（筆數、欄位名之類）；財務金額等其他內容一律不顯示、不匯出。
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CmAuditView = api;
})(typeof window !== "undefined" ? window : this, function () {
  "use strict";

  /** 操作代碼 → { zh: 白話, kind: 分類 } */
  var ACTION_LABELS = {
    save_member_system_data: { zh: "儲存會友名冊", kind: "members" },
    member_field_updated: { zh: "修改會友欄位", kind: "members" },
    sanitize_member_system_data: { zh: "自動整理會友編號", kind: "members" },
    bootstrap_seed_applied: { zh: "載入初始資料", kind: "system" },
    persistence_provider_configured: { zh: "設定資料儲存方式", kind: "system" },
    member_system_imported: { zh: "匯入會友名冊", kind: "members" },
    save_visitation_data: { zh: "儲存探訪資料", kind: "pastoral" },
    save_pastoral_followup: { zh: "儲存跟進任務", kind: "pastoral" },
    small_group_voice_report_submitted: { zh: "送出小組回報", kind: "pastoral" },
    gift_assessment_snapshot_created: { zh: "建立恩賜測驗快照", kind: "education" },
    cta_assessment_synced: { zh: "同步測驗結果", kind: "education" },
    save_finance_system_data: { zh: "儲存財務資料", kind: "finance" },
    save_finance_reconciliation: { zh: "儲存對帳資料", kind: "finance" },
    pastoral_event_appended: { zh: "新增牧養事件", kind: "pastoral" },
    save_volunteer_system_data: { zh: "儲存義工與排班", kind: "serving" },
    save_volunteer_shift: { zh: "儲存單筆排班", kind: "serving" },
    save_volunteer_rsvp_events: { zh: "儲存義工回覆", kind: "serving" },
    sync_rsvp_from_schedules: { zh: "由排班同步義工回覆", kind: "serving" },
    save_disciple_classes_async: { zh: "儲存門訓班級", kind: "education" },
    save_education_system_data_async: { zh: "儲存教育資料", kind: "education" },
    finance_save_transaction: { zh: "儲存一筆財務交易", kind: "finance" },
    finance_soft_delete_transaction: { zh: "作廢一筆財務交易", kind: "finance" },
    backup_exported: { zh: "下載備份檔", kind: "backup" },
    backup_restored: { zh: "還原備份", kind: "backup" }
  };

  var KIND_LABELS = {
    members: "會友",
    pastoral: "牧養探訪",
    serving: "事奉排班",
    education: "教育門訓",
    finance: "財務",
    backup: "備份還原",
    system: "系統",
    other: "其他"
  };

  /** 允許顯示的細節欄位（白名單） */
  var PAYLOAD_LABELS = {
    members: "會友數",
    schedules: "班表數",
    classes: "班級數",
    count: "筆數",
    created: "新增",
    updated: "更新",
    events: "事件數",
    missions: "探訪項目數",
    field: "欄位",
    memberId: "會友編號",
    event_type: "事件類型",
    keys: "項目數"
  };

  var ROLE_LABELS = { pastor: "牧者", admin: "行政", group_leader: "小組長", volunteer: "義工" };

  var OPERATOR_LABELS = {
    bridge: "系統（程式寫入）",
    system: "系統",
    system_sanitizer: "系統（自動整理）",
    crm: "會友系統",
    discipleship: "門訓系統",
    education: "教育系統",
    backup: "備份功能",
    visitation_followup: "跟進工具",
    finance_reconciliation: "對帳工具",
    finance_module_ui: "財務工作臺（F-04）",
    finance_legacy_page: "舊財務頁"
  };

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function timeZh(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso || "");
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  function kindOf(action) {
    var m = ACTION_LABELS[action];
    return m ? m.kind : "other";
  }

  function whoZh(entry) {
    if (entry && entry.actor) return ROLE_LABELS[entry.actor] || String(entry.actor);
    var op = entry && entry.operator;
    return OPERATOR_LABELS[op] || (op ? String(op) : "系統");
  }

  function detailZh(payload) {
    if (!payload || typeof payload !== "object") return "";
    var parts = [];
    Object.keys(PAYLOAD_LABELS).forEach(function (k) {
      if (payload[k] === undefined || payload[k] === null || typeof payload[k] === "object") return;
      parts.push(PAYLOAD_LABELS[k] + " " + String(payload[k]));
    });
    return parts.join("、");
  }

  /** 一筆紀錄 → 給人看的列（只含白名單資訊） */
  function describe(entry) {
    entry = entry || {};
    var meta = ACTION_LABELS[entry.action];
    return {
      id: String(entry.id || ""),
      iso: String(entry.timestamp || ""),
      time_zh: timeZh(entry.timestamp),
      who_zh: whoZh(entry),
      kind: kindOf(entry.action),
      kind_zh: KIND_LABELS[kindOf(entry.action)],
      what_zh: meta ? meta.zh : "其他操作（" + String(entry.action || "未知") + "）",
      detail_zh: detailZh(entry.payload)
    };
  }

  /** 篩選＋新到舊排序。opts: { kind, text, sinceDays } */
  function listRows(entries, opts, now) {
    opts = opts || {};
    now = now || new Date();
    var rows = (Array.isArray(entries) ? entries : []).map(describe);
    var kind = opts.kind && opts.kind !== "all" ? opts.kind : "";
    var text = String(opts.text || "").trim().toLowerCase();
    var since = opts.sinceDays > 0 ? now.getTime() - opts.sinceDays * 86400000 : 0;
    rows = rows.filter(function (r) {
      if (kind && r.kind !== kind) return false;
      if (since) {
        var t = Date.parse(r.iso);
        if (isNaN(t) || t < since) return false;
      }
      if (text) {
        var hay = (r.what_zh + " " + r.who_zh + " " + r.detail_zh + " " + r.kind_zh).toLowerCase();
        if (hay.indexOf(text) < 0) return false;
      }
      return true;
    });
    rows.sort(function (a, b) {
      return a.iso < b.iso ? 1 : a.iso > b.iso ? -1 : 0;
    });
    return rows;
  }

  /** CSV 儲存格：防公式注入（= + - @ 開頭加單引號）並處理引號 */
  function csvCell(v) {
    var s = String(v === undefined || v === null ? "" : v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  }

  function toCsv(rows) {
    var head = ["時間", "誰", "分類", "做了什麼", "細節"];
    var lines = [head.map(csvCell).join(",")];
    (rows || []).forEach(function (r) {
      lines.push([r.time_zh, r.who_zh, r.kind_zh, r.what_zh, r.detail_zh].map(csvCell).join(","));
    });
    return "\ufeff" + lines.join("\r\n");
  }

  function toJson(rows) {
    return JSON.stringify(
      (rows || []).map(function (r) {
        return { time: r.iso, who: r.who_zh, kind: r.kind_zh, what: r.what_zh, detail: r.detail_zh };
      }),
      null,
      2
    );
  }

  return {
    ACTION_LABELS: ACTION_LABELS,
    KIND_LABELS: KIND_LABELS,
    PAYLOAD_LABELS: PAYLOAD_LABELS,
    describe: describe,
    listRows: listRows,
    toCsv: toCsv,
    toJson: toJson,
    csvCell: csvCell
  };
});
