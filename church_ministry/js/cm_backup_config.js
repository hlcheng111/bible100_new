/**
 * 備份設定檔（P6）——小白可自行修改最上面幾項。
 *
 * 新增了一類本機資料要一起備份？在 GROUPS 裡加一行 { key: "…", label_zh: "…" } 就好。
 * 「備份涵蓋的 key」會與 js/church_data_bridge.js 的 *_KEY 對照；少一個，測試會提醒。
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CmBackupConfig = api;
})(typeof window !== "undefined" ? window : this, function () {
  "use strict";

  /** 幾天沒備份就提醒（一般教會一個月一次就夠；想更勤就改小） */
  var REMIND_AFTER_DAYS = 30;

  /** 備份檔辨識碼與格式版本（改格式時遞增 SCHEMA_VERSION） */
  var APP_ID = "bible100_church_ministry_backup";
  var SCHEMA_VERSION = 1;

  /** 記錄「上次備份時間」的 key（只存這臺電腦；不會放進備份檔） */
  var LAST_BACKUP_KEY = "bible100_cm_last_backup_v1";

  /**
   * 備份涵蓋的本機資料。personal:true ＝ 含個人資料（會友、牧養、奉獻），檔案要像名冊一樣保管。
   */
  var GROUPS = [
    {
      id: "members",
      label_zh: "會友與牧養",
      personal: true,
      items: [
        { key: "memberSystemData", label_zh: "會友名冊" },
        { key: "churchMasterDatabase", label_zh: "教會主資料庫" },
        { key: "visitationData", label_zh: "探訪資料" },
        { key: "pastoral_events_v1", label_zh: "牧養事件紀錄" },
        { key: "pastoralFollowupData", label_zh: "跟進任務" },
        { key: "bible100_cm_member_drafts_v1", label_zh: "表單轉會友的未處理草稿" }
      ]
    },
    {
      id: "serving",
      label_zh: "事奉與排班",
      personal: false,
      items: [
        { key: "volunteerSystemData", label_zh: "義工與排班" },
        { key: "volunteerRsvpEvents", label_zh: "義工回覆" },
        { key: "volunteer_shift_settings_v1", label_zh: "排班規則設定" }
      ]
    },
    {
      id: "care",
      label_zh: "關懷計畫",
      personal: true,
      items: [
        { key: "careAnnualPlanData", label_zh: "年度關懷計畫" },
        { key: "careBoardData", label_zh: "關懷看板" }
      ]
    },
    {
      id: "education",
      label_zh: "教育與門訓",
      personal: true,
      items: [
        { key: "educationSystemData", label_zh: "教育系統資料" },
        { key: "church_ministry_a_education", label_zh: "主日學／崇拜教育資料" }
      ]
    },
    {
      id: "finance",
      label_zh: "財務（敏感）",
      personal: true,
      items: [
        { key: "financeSystemData", label_zh: "財務資料" },
        { key: "financialData", label_zh: "財務舊版資料" },
        { key: "financeReconciliationData", label_zh: "對帳資料" },
        { key: "bible100_cm_finance_legacy_imported_v1", label_zh: "舊財務帳是否已匯入的標記" }
      ]
    },
    {
      id: "smart",
      label_zh: "智慧事奉",
      personal: true,
      items: [{ key: "bible100_smart_ministry_main", label_zh: "人才與事奉配對" }]
    },
    {
      id: "audit",
      label_zh: "操作紀錄",
      personal: false,
      items: [{ key: "churchAuditLog", label_zh: "操作紀錄（審計）" }]
    },
    {
      id: "settings",
      label_zh: "顯示設定",
      personal: false,
      items: [{ key: "b100_planning_preview_size", label_zh: "教會規模檔位" }]
    }
  ];

  function allKeys() {
    var out = [];
    GROUPS.forEach(function (g) {
      g.items.forEach(function (it) {
        out.push(it.key);
      });
    });
    return out;
  }

  function itemFor(key) {
    for (var i = 0; i < GROUPS.length; i++) {
      for (var j = 0; j < GROUPS[i].items.length; j++) {
        if (GROUPS[i].items[j].key === key) {
          return { key: key, label_zh: GROUPS[i].items[j].label_zh, group: GROUPS[i].id, group_zh: GROUPS[i].label_zh, personal: GROUPS[i].personal };
        }
      }
    }
    return null;
  }

  return {
    REMIND_AFTER_DAYS: REMIND_AFTER_DAYS,
    APP_ID: APP_ID,
    SCHEMA_VERSION: SCHEMA_VERSION,
    LAST_BACKUP_KEY: LAST_BACKUP_KEY,
    GROUPS: GROUPS,
    allKeys: allKeys,
    itemFor: itemFor
  };
});
