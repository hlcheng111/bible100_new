/**
 * 備份／還原核心（P6）——純函式，不碰畫面、不連網；storage 由呼叫端傳入（瀏覽器用 localStorage）。
 *
 * 規則：
 *  - 只備份／還原 cm_backup_config.js 白名單內的 key；備份檔裡多出來的 key 一律忽略並回報。
 *  - 還原前先驗證格式；有任何錯誤就一個 key 都不寫（不會寫一半）。
 *  - 「上次備份時間」只存本機，不放進備份檔。
 *  - 還原是整份覆蓋「刻意動作」，畫面層必須讓人確認並先自動下載「還原前備份」。
 */
(function (root, factory) {
  var api = factory(typeof require === "function" && typeof module === "object" ? require("./cm_backup_config.js") : root.CmBackupConfig);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CmBackup = api;
})(typeof window !== "undefined" ? window : this, function (Cfg) {
  "use strict";

  var TIER_IDS = ["micro", "small", "medium", "large"];

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function stamp(d) {
    return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + "_" + pad(d.getHours()) + pad(d.getMinutes());
  }

  function fileName(now, prefix) {
    return (prefix || "bible100_backup") + "_" + stamp(now || new Date()) + ".json";
  }

  /** 讀出白名單內、目前有資料的 key → 備份物件 */
  function buildBackup(storage, now) {
    var keys = {};
    Cfg.allKeys().forEach(function (k) {
      var v = storage.getItem(k);
      if (v !== null && v !== undefined) keys[k] = String(v);
    });
    return {
      app: Cfg.APP_ID,
      schema_version: Cfg.SCHEMA_VERSION,
      created_at: (now || new Date()).toISOString(),
      contains_personal_data: true,
      keys: keys
    };
  }

  function valueProblem(key, value) {
    if (typeof value !== "string") return "內容格式不對（不是文字）";
    if (key === "b100_planning_preview_size") {
      return TIER_IDS.indexOf(value) >= 0 ? "" : "規模檔位不是 micro／small／medium／large";
    }
    try {
      JSON.parse(value);
    } catch (e) {
      return "內容不是正確的資料格式";
    }
    return "";
  }

  /** 驗證備份物件；ok=false 時 errors 是給人看的中文原因 */
  function validateBackup(obj) {
    var res = { ok: false, errors: [], items: [], ignored: [], created_at: "" };
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
      res.errors.push("這不是備份檔（不是正確的 JSON 物件）。");
      return res;
    }
    if (obj.app !== Cfg.APP_ID) {
      res.errors.push("這不是「教會事工」的備份檔。");
      return res;
    }
    if (obj.encrypted === true) {
      res.errors.push("這是加密備份，請先輸入密碼解開。");
      return res;
    }
    if (typeof obj.schema_version !== "number" || obj.schema_version > Cfg.SCHEMA_VERSION) {
      res.errors.push("備份檔版本比這個網站新，請先更新網站再還原。");
      return res;
    }
    if (!obj.keys || typeof obj.keys !== "object" || Array.isArray(obj.keys)) {
      res.errors.push("備份檔裡找不到資料內容。");
      return res;
    }
    res.created_at = String(obj.created_at || "");
    Object.keys(obj.keys).forEach(function (k) {
      var meta = Cfg.itemFor(k);
      if (!meta) {
        res.ignored.push(k);
        return;
      }
      var problem = valueProblem(k, obj.keys[k]);
      if (problem) {
        res.errors.push("「" + meta.label_zh + "」" + problem + "。");
        return;
      }
      res.items.push({
        key: k,
        label_zh: meta.label_zh,
        group_zh: meta.group_zh,
        personal: meta.personal,
        bytes: obj.keys[k].length
      });
    });
    if (!res.items.length && !res.errors.length) res.errors.push("備份檔裡沒有可還原的資料。");
    res.ok = res.errors.length === 0;
    return res;
  }

  /**
   * 還原：驗證通過才寫；selectedKeys 省略＝全部。
   * 回傳 { ok, errors, written:[key], skipped:[key] }
   */
  function restore(storage, obj, selectedKeys) {
    var v = validateBackup(obj);
    if (!v.ok) return { ok: false, errors: v.errors, written: [], skipped: [] };
    var want = Array.isArray(selectedKeys) ? selectedKeys : null;
    var written = [];
    var skipped = [];
    v.items.forEach(function (it) {
      if (want && want.indexOf(it.key) < 0) {
        skipped.push(it.key);
        return;
      }
      storage.setItem(it.key, obj.keys[it.key]);
      written.push(it.key);
    });
    return { ok: true, errors: [], written: written, skipped: skipped };
  }

  /* ---------- 上次備份提醒 ---------- */

  function markBackup(storage, now) {
    var iso = (now || new Date()).toISOString();
    storage.setItem(Cfg.LAST_BACKUP_KEY, iso);
    return iso;
  }

  function lastBackupAt(storage) {
    var raw = storage.getItem(Cfg.LAST_BACKUP_KEY);
    if (!raw) return null;
    var t = Date.parse(raw);
    return isNaN(t) ? null : new Date(t);
  }

  function daysSince(date, now) {
    return Math.floor(((now || new Date()).getTime() - date.getTime()) / 86400000);
  }

  /** 有沒有「已有重要資料」：只看會友名冊是否存在，避免全新系統一直被提醒 */
  function hasImportantData(storage) {
    var raw = storage.getItem("memberSystemData");
    if (!raw) return false;
    try {
      var o = JSON.parse(raw);
      return !!(o && Array.isArray(o.members) && o.members.length);
    } catch (e) {
      return false;
    }
  }

  /**
   * 提醒狀態：
   *  - none：沒有會友資料，不打擾
   *  - never：有資料但從沒備份
   *  - due：超過 REMIND_AFTER_DAYS 天
   *  - ok：近期有備份
   */
  function reminder(storage, now) {
    now = now || new Date();
    if (!hasImportantData(storage)) return { state: "none", days: null, text_zh: "" };
    var last = lastBackupAt(storage);
    if (!last) return { state: "never", days: null, text_zh: "還沒備份過。建議現在備份一份，存到 USB 或雲端硬碟。" };
    var d = daysSince(last, now);
    if (d >= Cfg.REMIND_AFTER_DAYS) {
      return { state: "due", days: d, text_zh: "已 " + d + " 天沒備份，建議再備份一份。" };
    }
    return { state: "ok", days: d, text_zh: d <= 0 ? "今天已備份。" : "上次備份在 " + d + " 天前。" };
  }

  return {
    fileName: fileName,
    buildBackup: buildBackup,
    validateBackup: validateBackup,
    restore: restore,
    markBackup: markBackup,
    lastBackupAt: lastBackupAt,
    reminder: reminder,
    hasImportantData: hasImportantData
  };
});
