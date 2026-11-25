/**
 * 舊財務頁輔助（P6 後續）——驗證、錯誤白話、CSV、舊獨立帳（financialData）的一次性匯入準備。
 * 本檔不寫財務資料：所有寫入都由頁面經 ChurchDataBridge 完成。
 * 唯一的 storage 寫入：匯入完成後記一個「已匯入」標記，避免重複匯入。
 */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CmFinanceLegacy = api;
})(typeof window !== "undefined" ? window : this, function (root) {
  "use strict";

  var LEGACY_KEY = "financialData";
  var IMPORTED_KEY = "bible100_cm_finance_legacy_imported_v1";

  /** 舊頁第一次打開會自動塞的示範資料；看到這些就不是真帳，不提供匯入 */
  var DEMO_SIGNATURES = [
    "income|2025-10-01|50000|主日奉獻",
    "income|2025-10-08|48000|主日奉獻",
    "expense|2025-10-05|5000|10月水電費",
    "expense|2025-10-07|30000|同工薪資",
    /* 舊版（簡體）頁面已寫進使用者瀏覽器的示範資料，簽名也要認得 */
    "income|2025-10-01|50000|主日奉献",
    "income|2025-10-08|48000|主日奉献",
    "expense|2025-10-05|5000|10月水电费",
    "expense|2025-10-07|30000|同工薪资"
  ];

  function validDate(s) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(s || ""))) return false;
    var d = new Date(s + "T00:00:00Z");
    return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
  }

  function validateEntry(input) {
    var errors = [];
    var amount = Number(input && input.amount);
    if (!isFinite(amount) || amount <= 0) errors.push("金額要大於 0。");
    var date = String((input && input.date) || "");
    if (!validDate(date)) errors.push("日期要填「年-月-日」。");
    return { ok: errors.length === 0, errors: errors, amount: amount, date: date };
  }

  function errorText(e) {
    var code = e && e.code;
    if (code === "RBAC_DENIED") return "你的角色沒有財務寫入權限（需要「財務」或「牧者」）。沒有改動任何資料。";
    if (code === "FINANCE_DATA_CONTAMINATION_ERROR") return "目前是正式模式，不能寫入示範資料。沒有改動任何資料。";
    return "操作失敗：" + (e && e.message ? e.message : "未知錯誤") + "。";
  }

  function csvCell(v) {
    var s = String(v === undefined || v === null ? "" : v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  }

  function toCsv(rows) {
    var lines = [["類型", "日期", "類別", "金額", "說明", "交易編號"].map(csvCell).join(",")];
    (rows || []).forEach(function (t) {
      lines.push(
        [t.type === "expense" ? "支出" : "收入", t.date, t.categoryName || t.category, t.amount, t.description, t.txn_id]
          .map(csvCell)
          .join(",")
      );
    });
    return "\ufeff" + lines.join("\r\n");
  }

  /** 解析舊獨立帳；回傳可匯入的交易（已排除壞資料） */
  function parseLegacy(raw) {
    var out = { offer: false, count: 0, skipped: 0, demo: false, entries: [] };
    if (!raw) return out;
    var o;
    try {
      o = JSON.parse(raw);
    } catch (e) {
      return out;
    }
    if (!o || typeof o !== "object") return out;
    var all = [];
    ["income", "expense"].forEach(function (type) {
      (Array.isArray(o[type]) ? o[type] : []).forEach(function (r) {
        all.push({ type: type, r: r || {} });
      });
    });
    if (!all.length) return out;
    var sigs = all.map(function (x) {
      return [x.type, x.r.date, x.r.amount, x.r.note].join("|");
    });
    if (sigs.every(function (s) { return DEMO_SIGNATURES.indexOf(s) >= 0; })) {
      out.demo = true;
      return out;
    }
    all.forEach(function (x) {
      var v = validateEntry({ date: x.r.date, amount: x.r.amount });
      if (!v.ok) {
        out.skipped++;
        return;
      }
      var cat = String(x.r.category || "其他");
      out.entries.push({
        type: x.type,
        category: cat,
        categoryName: cat,
        amount: v.amount,
        date: v.date,
        description: String(x.r.note || cat),
        source: "legacy_financialData"
      });
    });
    out.count = out.entries.length;
    out.offer = out.count > 0;
    return out;
  }

  function storage() {
    try {
      return root.localStorage || null;
    } catch (e) {
      return null;
    }
  }

  function readLegacy() {
    var s = storage();
    if (!s) return parseLegacy("");
    if (s.getItem(IMPORTED_KEY)) return parseLegacy("");
    var raw = s.getItem(LEGACY_KEY);
    if (raw) return parseLegacy(raw);
    /* 較早版本的橋接層會把舊格式整包搬進 financeSystemData（頂層 income／expense、沒有交易清單）；只讀、不改 */
    try {
      var fin = JSON.parse(s.getItem("financeSystemData") || "null");
      if (fin && typeof fin === "object" && !(Array.isArray(fin.transactions) && fin.transactions.length) &&
          (Array.isArray(fin.income) || Array.isArray(fin.expense))) {
        return parseLegacy(JSON.stringify({ income: fin.income, expense: fin.expense }));
      }
    } catch (e) {}
    return parseLegacy("");
  }

  function markImported() {
    var s = storage();
    if (s) s.setItem(IMPORTED_KEY, "1");
  }

  return {
    LEGACY_KEY: LEGACY_KEY,
    IMPORTED_KEY: IMPORTED_KEY,
    validateEntry: validateEntry,
    errorText: errorText,
    csvCell: csvCell,
    toCsv: toCsv,
    parseLegacy: parseLegacy,
    readLegacy: readLegacy,
    markImported: markImported
  };
});
