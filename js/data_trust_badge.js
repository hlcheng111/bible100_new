/**
 * Bible100 · 資料可信度層 v1（小白可讀）
 * 不寫入業務資料；僅顯示來源、模式、狀態與按鈕行為說明。
 */
(function (global) {
  'use strict';

  var STYLE_ID = 'b100-data-trust-style';
  var DEMO_LOADED_KEY = 'volunteer_shift_demo_loaded_at';
  var DEMO_VERSION_KEY = 'volunteer_shift_demo_version';
  var A2_DEMO_LOADED_KEY = 'visitation_followup_demo_loaded_at';
  var A2_DEMO_VERSION_KEY = 'visitation_followup_demo_loaded_at_version';
  var SCHOOL_DEMO_KEY = 'school_management_demo_loaded_at';
  var SCHOOL_STORAGE_KEY = 'schoolMasterDatabase';
  var PASTORAL_FOLLOWUP_KEY = 'pastoralFollowupData';
  var DEMO_SCHEDULE_SOURCE = 'a1_demo_seed';
  var DEMO_ASSIGN_SOURCE = 'a1_demo_seed';
  var A2_DEMO_TASK_SOURCE = 'a2_demo_seed';
  var A2_DEMO_MEMBER_IDS = { '801': 1, '802': 1, '803': 1 };
  var A3_DEMO_LOADED_KEY = 'finance_reconciliation_demo_loaded_at';
  var A3_DEMO_VERSION_KEY = 'finance_reconciliation_demo_loaded_at_version';
  var FINANCE_RECON_KEY = 'financeReconciliationData';
  var A3_DEMO_RECORD_SOURCE = 'a3_demo_seed';

  var STATE_LABELS = {
    real: '真實填寫資料',
    demo: 'A1 試用資料',
    empty: '尚無資料',
    disconnected: '尚未連接資料層',
    mixed: '試用資料 + 真實填寫資料'
  };

  var WRITE_LABELS = {
    read_only: '僅讀取，不會寫入',
    prefill_only: '只預填，不儲存',
    manual_save: '會寫入本機（需勾選人工確認）',
    auto_write: '會自動寫入（本頁未啟用）'
  };

  var NOTIFY_LABELS = {
    none: '不會自動通知',
    copy_only: '只產生文字，不會發送',
    browser_notification: '可能使用瀏覽器通知（未串教會通訊）',
    external_api: '可能呼叫外部 API（本環境未啟用）'
  };

  var PRIVACY_LABELS = {
    normal: '一般事工資料',
    sensitive: '敏感資料，請限授權同工查看',
    pastoral_sensitive: '牧養敏感資料，請限牧者／授權同工查看',
    finance_sensitive: '財務敏感資料，請限財務同工查看'
  };

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function injectStyles() {
    if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
    var css = document.createElement('style');
    css.id = STYLE_ID;
    css.textContent = [
      '.b100-data-trust{font-size:10px;line-height:1.55;color:#475569;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:8px;padding:10px 12px;margin:12px 0;}',
      '.b100-data-trust--top{margin-top:0;margin-bottom:14px;}',
      '.b100-data-trust dl{margin:0;display:grid;gap:4px;}',
      '.b100-data-trust dt{font-weight:700;color:#334155;display:inline;}',
      '.b100-data-trust dt::after{content:"：";}',
      '.b100-data-trust dd{margin:0 0 4px 0;display:inline;}',
      '.b100-data-trust dd::after{content:"";display:block;}',
      '.b100-data-trust .row{display:block;margin-bottom:4px;}',
      '.b100-data-trust .state-real{color:#047857;}',
      '.b100-data-trust .state-demo{color:#b45309;}',
      '.b100-data-trust .state-empty{color:#64748b;}',
      '.b100-data-trust .state-mixed{color:#7c3aed;}',
      '.b100-data-trust .state-disconnected{color:#b91c1c;}',
      '.b100-data-trust-actions{margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;}',
      '.b100-data-trust-actions button{font-size:10px;padding:4px 10px;border-radius:6px;border:1px solid #94a3b8;background:#fff;cursor:pointer;}',
      '.b100-action-trust{font-size:10px;color:#64748b;margin:4px 0 0;padding:4px 8px;background:#fffbeb;border-left:3px solid #f59e0b;border-radius:4px;line-height:1.45;}',
      '.b100-action-trust .tag{display:inline-block;margin-right:6px;font-weight:600;color:#92400e;}'
    ].join('');
    document.head.appendChild(css);
  }

  function getCloudConfig() {
    return global.CHURCH_CLOUD_CONFIG || {};
  }

  function getStorageModeLabel() {
    var c = getCloudConfig();
    var api = !!c.USE_API;
    var sheets = !!c.USE_SHEETS_SSOT;
    var mock = !!c.USE_MOCK_CLOUD;
    if (sheets && api) return { mode: 'mixed', zh: '混合模式（本機快取 + 雲端 API + Sheets）', storage: 'localStorage + API + Sheets' };
    if (sheets && mock) return { mode: 'mixed', zh: '混合模式（本機 + Mock 雲端 + Sheets）', storage: 'localStorage + Mock Cloud + Sheets' };
    if (sheets) return { mode: 'sheets', zh: '雲端 Sheets SSOT（含本機快取）', storage: 'Sheets / localStorage' };
    if (api && mock) return { mode: 'mixed', zh: '混合模式（本機 + API + Mock 雲端）', storage: 'localStorage + API' };
    if (api) return { mode: 'cloud_api', zh: '雲端 API 模式', storage: 'API / Supabase（依後端設定）' };
    if (mock) return { mode: 'mock_cloud', zh: 'Mock 雲端演示（雙寫本機）', storage: 'Mock Cloud + localStorage' };
    return { mode: 'local', zh: '本機模式', storage: 'localStorage' };
  }

  function formatTimestamp(iso) {
    if (!iso) return '—';
    var s = String(iso);
    if (s.length >= 16) return s.slice(0, 16).replace('T', ' ');
    return s;
  }

  function getDataFreshness(storageKey) {
    var key = storageKey || 'volunteerSystemData';
    var latest = '';
    var count = 0;
    try {
      if (!global.localStorage) return { key: key, last_updated: '—', count: 0 };
      var raw = global.localStorage.getItem(key);
      if (!raw) return { key: key, last_updated: '—', count: 0 };
      var data = JSON.parse(raw);
      if (key === 'volunteerSystemData' && Array.isArray(data.schedules)) {
        count = data.schedules.length;
        data.schedules.forEach(function (s) {
          var t = s.updated_at || s.created_at || '';
          if (t && t > latest) latest = t;
        });
      } else if (Array.isArray(data.members)) {
        count = data.members.length;
        data.members.forEach(function (m) {
          var t = m.updated_at || m.created_at || '';
          if (t && t > latest) latest = t;
        });
      }
      var cmRaw = global.localStorage.getItem('churchMasterDatabase');
      if (cmRaw) {
        var cm = JSON.parse(cmRaw);
        if (cm.volunteerSyncedAt && cm.volunteerSyncedAt > latest) latest = cm.volunteerSyncedAt;
      }
      if (key === DEMO_LOADED_KEY) {
        latest = global.localStorage.getItem(DEMO_LOADED_KEY) || latest;
      }
    } catch (e) {
      return { key: key, last_updated: '—', count: count, error: String(e.message || e) };
    }
    return { key: key, last_updated: formatTimestamp(latest), count: count, raw_iso: latest };
  }

  function volunteerShiftRowStats() {
    var demo = 0;
    var real = 0;
    try {
      var raw = global.localStorage && global.localStorage.getItem('volunteerSystemData');
      if (!raw) return { demo: 0, real: 0, total: 0 };
      var vol = JSON.parse(raw);
      (vol.schedules || []).forEach(function (s) {
        if (s.source === DEMO_SCHEDULE_SOURCE) demo += 1;
        else real += 1;
      });
      return { demo: demo, real: real, total: demo + real };
    } catch (e2) {
      return { demo: 0, real: 0, total: 0 };
    }
  }

  function isVolunteerShiftDemoLoaded() {
    try {
      return !!(global.localStorage && global.localStorage.getItem(DEMO_LOADED_KEY));
    } catch (e) {
      return false;
    }
  }

  function isVisitationFollowupDemoLoaded() {
    try {
      return !!(global.localStorage && global.localStorage.getItem(A2_DEMO_LOADED_KEY));
    } catch (e) {
      return false;
    }
  }

  function isFinanceReconciliationDemoLoaded() {
    try {
      return !!(global.localStorage && global.localStorage.getItem(A3_DEMO_LOADED_KEY));
    } catch (e) {
      return false;
    }
  }

  function financeReconciliationRowStats() {
    var demo = 0;
    var real = 0;
    try {
      var raw = global.localStorage && global.localStorage.getItem(FINANCE_RECON_KEY);
      if (!raw) return { demo: 0, real: 0, total: 0 };
      var store = JSON.parse(raw);
      (store.records || []).forEach(function (r) {
        if (r.source === A3_DEMO_RECORD_SOURCE) demo += 1;
        else real += 1;
      });
      return { demo: demo, real: real, total: demo + real };
    } catch (e2) {
      return { demo: 0, real: 0, total: 0 };
    }
  }

  function clearFinanceReconciliationA3Demo() {
    var removed = { records: 0 };
    try {
      var b = global.ChurchDataBridge;
      var store;
      if (b && b.getFinanceReconciliationData) {
        store = b.getFinanceReconciliationData();
      } else {
        store = JSON.parse(global.localStorage.getItem(FINANCE_RECON_KEY) || '{"records":[]}');
      }
      if (!Array.isArray(store.records)) store.records = [];
      var before = store.records.length;
      store.records = store.records.filter(function (r) {
        return r.source !== A3_DEMO_RECORD_SOURCE;
      });
      removed.records = before - store.records.length;
      if (b && b.saveFinanceReconciliationData) {
        b.saveFinanceReconciliationData(store);
      } else {
        store.updated_at = new Date().toISOString();
        global.localStorage.setItem(FINANCE_RECON_KEY, JSON.stringify(store));
      }
      global.localStorage.removeItem(A3_DEMO_LOADED_KEY);
      global.localStorage.removeItem(A3_DEMO_VERSION_KEY);
      if (global.FinanceReconciliationTool && typeof global.FinanceReconciliationTool.notifySync === 'function') {
        global.FinanceReconciliationTool.notifySync();
      }
      return {
        ok: true,
        removed: removed,
        removes_sources: [A3_DEMO_RECORD_SOURCE],
        keeps: 'financeReconciliationData.records（source≠a3_demo_seed）'
      };
    } catch (e) {
      return { ok: false, error: String(e.message || e) };
    }
  }

  function pastoralFollowupRowStats() {
    var demo = 0;
    var real = 0;
    try {
      var raw = global.localStorage && global.localStorage.getItem(PASTORAL_FOLLOWUP_KEY);
      if (!raw) return { demo: 0, real: 0, total: 0 };
      var store = JSON.parse(raw);
      (store.tasks || []).forEach(function (t) {
        if (t.source === A2_DEMO_TASK_SOURCE) demo += 1;
        else real += 1;
      });
      return { demo: demo, real: real, total: demo + real };
    } catch (e2) {
      return { demo: 0, real: 0, total: 0 };
    }
  }

  function markVolunteerShiftDemoLoaded(version) {
    try {
      if (!global.localStorage) return;
      global.localStorage.setItem(DEMO_LOADED_KEY, new Date().toISOString());
      global.localStorage.setItem(DEMO_VERSION_KEY, version || 'a1');
    } catch (e) {}
  }

  function classifyDataState(opts) {
    opts = opts || {};
    if (opts.data_state && STATE_LABELS[opts.data_state]) {
      return opts.data_state;
    }
    if (opts.disconnected || opts.key === false) return 'disconnected';
    var count = opts.count != null ? Number(opts.count) : 0;
    var rows = opts.source_key === 'volunteerSystemData.schedules' ? volunteerShiftRowStats() : null;
    var hasDemo = !!opts.demoFlag || isVolunteerShiftDemoLoaded();
    var demoRows = rows ? rows.demo > 0 : false;
    var realRows = rows ? rows.real > 0 : false;
    if (opts.has_demo_rows != null) demoRows = !!opts.has_demo_rows;
    if (opts.has_real_rows != null) realRows = !!opts.has_real_rows;
    if (!opts.key && count === 0) return 'disconnected';
    if (count === 0 && !hasDemo && !demoRows) return 'empty';
    if (demoRows && realRows) return 'mixed';
    if (hasDemo || demoRows || opts.demoFlag) {
      if (realRows || (count > 0 && !demoRows && !hasDemo)) return 'mixed';
      return count > 0 || demoRows || hasDemo ? 'demo' : 'empty';
    }
    if (count > 0 || realRows) return 'real';
    return 'empty';
  }

  function buildTrustHtml(options) {
    var o = options || {};
    injectStyles();
    var storageInfo = getStorageModeLabel();
    var storage = o.storage || storageInfo.storage;
    var modeZh = o.storage_mode_zh || storageInfo.zh;
    var freshness = o.last_updated;
    if (!freshness && o.source_key) {
      var fk = o.source_key.indexOf('volunteerSystemData') >= 0 ? 'volunteerSystemData' : null;
      if (fk) freshness = getDataFreshness(fk).last_updated;
    }
    freshness = freshness || '—';
    var state = classifyDataState(o);
    var stateClass = 'state-' + state;
    var stateLabel = o.data_state_label || STATE_LABELS[state] || state;
    var sourceLabel = o.source_label_zh || o.source_key || '—';
    var write = WRITE_LABELS[o.write_behavior] || o.write_behavior || WRITE_LABELS.read_only;
    var notify = NOTIFY_LABELS[o.notify_behavior] || o.notify_behavior || NOTIFY_LABELS.none;
    var privacy = PRIVACY_LABELS[o.privacy_level] || PRIVACY_LABELS.normal;
    var count = o.count != null ? o.count : '—';

    var html = '<div class="b100-data-trust' + (o.position === 'top' ? ' b100-data-trust--top' : '') + '" role="note" aria-label="資料可信度說明">';
    html += '<dl>';
    html += '<div class="row"><dt>資料來源</dt><dd>' + esc(sourceLabel) + (o.source_key ? ' <code>' + esc(o.source_key) + '</code>' : '') + '</dd></div>';
    html += '<div class="row"><dt>目前模式</dt><dd>' + esc(modeZh) + ' · <code>' + esc(storage) + '</code></dd></div>';
    html += '<div class="row"><dt>資料狀態</dt><dd class="' + stateClass + '">' + esc(stateLabel) + '</dd></div>';
    html += '<div class="row"><dt>資料筆數</dt><dd>' + esc(String(count)) + '</dd></div>';
    html += '<div class="row"><dt>更新時間</dt><dd>' + esc(freshness) + '</dd></div>';
    html += '<div class="row"><dt>寫入行為</dt><dd>' + esc(write) + '</dd></div>';
    html += '<div class="row"><dt>通知狀態</dt><dd>' + esc(notify) + '</dd></div>';
    if (o.privacy_level && o.privacy_level !== 'normal') {
      html += '<div class="row"><dt>隱私等級</dt><dd>' + esc(privacy) + '</dd></div>';
    }
    if (isVolunteerShiftDemoLoaded() && o.show_clear_demo !== false) {
      var ver = '';
      try { ver = global.localStorage.getItem(DEMO_VERSION_KEY) || 'a1'; } catch (eV) {}
      html += '<div class="row"><dt>試用標記</dt><dd>目前含 A1 試用資料（版本 ' + esc(ver) + '）</dd></div>';
    }
    html += '</dl>';
    if (o.extra_note) {
      html += '<p style="margin:8px 0 0;font-size:10px;color:#475569;">' + esc(o.extra_note) + '</p>';
    }
    if (state === 'demo' || state === 'mixed' || isVolunteerShiftDemoLoaded()) {
      html += '<p style="margin:8px 0 0;font-size:10px;color:#92400e;">⚠️ 試用／示範數字僅供示範，不可當正式營運 KPI 對外報告。</p>';
    }
    if (o.show_clear_demo && isVolunteerShiftDemoLoaded()) {
      html += '<div class="b100-data-trust-actions">';
      html += '<button type="button" data-b100-clear-demo="volunteer_shift">清除 A1 demo 資料</button>';
      html += '<span style="font-size:10px;color:#64748b;align-self:center;">或改以「新增排班」正式填寫</span>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function wireClearDemoButtons(root, opts) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll('[data-b100-clear-demo="volunteer_shift"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var r = clearVolunteerShiftA1Demo();
        if (opts && typeof opts.on_clear_demo === 'function') opts.on_clear_demo(r);
        if (global.VolunteerShiftTool && typeof global.VolunteerShiftTool.notifySync === 'function') {
          global.VolunteerShiftTool.notifySync();
        }
        try { window.location.reload(); } catch (eR) {}
      });
    });
  }

  function renderDataTrustBadge(opts) {
    opts = opts || {};
    var html = buildTrustHtml(opts);
    var mount = opts.mount;
    if (typeof mount === 'string') mount = document.getElementById(mount);
    if (mount) {
      mount.innerHTML = html;
      wireClearDemoButtons(mount, opts);
      if (typeof opts.on_mount === 'function') opts.on_mount(mount);
    }
    return html;
  }

  function renderActionTrustNotice(opts) {
    opts = opts || {};
    injectStyles();
    var tags = [];
    if (opts.write_behavior) tags.push(WRITE_LABELS[opts.write_behavior] || opts.write_behavior);
    if (opts.notify_behavior) tags.push(NOTIFY_LABELS[opts.notify_behavior] || opts.notify_behavior);
    if (opts.requires_human_confirmation) tags.push('需人工確認');
    if (opts.risk_hint) tags.push(opts.risk_hint);
    if (opts.privacy_level && opts.privacy_level !== 'normal') {
      tags.push(PRIVACY_LABELS[opts.privacy_level] || opts.privacy_level);
    }
    if (!tags.length) return '';
    var html = '<div class="b100-action-trust" role="note">' +
      tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') +
      '</div>';
    var mount = opts.mount;
    if (typeof mount === 'string') mount = document.getElementById(mount);
    if (mount) mount.innerHTML = html;
    return html;
  }

  function clearVisitationFollowupA2Demo() {
    var removed = { tasks: 0, members: 0 };
    try {
      var b = global.ChurchDataBridge;
      var store;
      if (b && b.getPastoralFollowupData) {
        store = b.getPastoralFollowupData();
      } else {
        store = JSON.parse(global.localStorage.getItem(PASTORAL_FOLLOWUP_KEY) || '{"tasks":[]}');
      }
      if (!Array.isArray(store.tasks)) store.tasks = [];
      var before = store.tasks.length;
      store.tasks = store.tasks.filter(function (t) {
        return t.source !== A2_DEMO_TASK_SOURCE;
      });
      removed.tasks = before - store.tasks.length;
      if (b && b.savePastoralFollowupData) {
        b.savePastoralFollowupData(store);
      } else {
        store.updated_at = new Date().toISOString();
        global.localStorage.setItem(PASTORAL_FOLLOWUP_KEY, JSON.stringify(store));
      }

      if (b && b.getMemberSystemData && b.saveMemberSystemData) {
        var ms = b.getMemberSystemData();
        if (Array.isArray(ms.members)) {
          var membBefore = ms.members.length;
          ms.members = ms.members.filter(function (m) {
            var id = String(m.memberId != null ? m.memberId : m.id);
            if (!A2_DEMO_MEMBER_IDS[id]) return true;
            return !m._is_demo;
          });
          removed.members = membBefore - ms.members.length;
          b.saveMemberSystemData(ms, { skipRbac: true });
        }
      }

      global.localStorage.removeItem(A2_DEMO_LOADED_KEY);
      global.localStorage.removeItem(A2_DEMO_VERSION_KEY);
      if (global.VisitationFollowupTool && typeof global.VisitationFollowupTool.notifySync === 'function') {
        global.VisitationFollowupTool.notifySync();
      }
      return {
        ok: true,
        removed: removed,
        keeps: 'pastoralFollowupData.tasks（source≠a2_demo_seed）與非 _is_demo 會友'
      };
    } catch (e) {
      return { ok: false, error: String(e.message || e) };
    }
  }

  function clearSchoolDemoMarker() {
    var schoolDataBytesBefore = 0;
    try {
      var raw = global.localStorage && global.localStorage.getItem(SCHOOL_STORAGE_KEY);
      if (raw) schoolDataBytesBefore = raw.length;
      global.localStorage.removeItem(SCHOOL_DEMO_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed.meta && typeof parsed.meta === 'object') {
          parsed.meta.isDemoSeed = false;
          parsed.meta.demoMarkerClearedAt = new Date().toISOString();
          global.localStorage.setItem(SCHOOL_STORAGE_KEY, JSON.stringify(parsed));
        }
      }
      if (global.schoolDB && global.schoolDB.data && global.schoolDB.data.meta) {
        global.schoolDB.data.meta.isDemoSeed = false;
      }
      var rawAfter = global.localStorage.getItem(SCHOOL_STORAGE_KEY);
      return {
        ok: true,
        marker_cleared: true,
        school_data_preserved: !!rawAfter,
        school_data_bytes: rawAfter ? rawAfter.length : 0,
        bytes_unchanged: !!rawAfter && schoolDataBytesBefore > 0,
        keeps: 'schoolMasterDatabase 學生／教師／課程列（僅清除 marker 與 meta.isDemoSeed）'
      };
    } catch (e) {
      return { ok: false, error: String(e.message || e) };
    }
  }

  function getMarkerInfo(key, versionKey) {
    var loadedAt = null;
    var version = null;
    try {
      if (global.localStorage) {
        loadedAt = global.localStorage.getItem(key);
        if (versionKey) version = global.localStorage.getItem(versionKey);
      }
    } catch (e) {}
    return {
      key: key,
      active: !!loadedAt,
      loaded_at: loadedAt ? formatTimestamp(loadedAt) : '—',
      raw_loaded_at: loadedAt,
      version: version || '—'
    };
  }

  function getDemoGovernanceSummary() {
    var volRows = volunteerShiftRowStats();
    var pfRows = pastoralFollowupRowStats();
    var finRows = financeReconciliationRowStats();
    var school = getSchoolDataStats();
    var a1Marker = getMarkerInfo(DEMO_LOADED_KEY, DEMO_VERSION_KEY);
    var a2Marker = getMarkerInfo(A2_DEMO_LOADED_KEY, A2_DEMO_VERSION_KEY);
    var a3Marker = getMarkerInfo(A3_DEMO_LOADED_KEY, A3_DEMO_VERSION_KEY);
    var schoolMarker = getMarkerInfo(SCHOOL_DEMO_KEY, null);
    schoolMarker.meta_is_demo_seed = school.isDemoSeed;
    var storage = getStorageModeLabel();
    var hubDemo = isVolunteerShiftDemoLoaded() || isVisitationFollowupDemoLoaded() ||
      isFinanceReconciliationDemoLoaded() || isSchoolDemoMarked();
    var hubReal = volRows.real > 0 || pfRows.real > 0 || finRows.real > 0 || school.total > 0;
    var hubState = 'empty';
    if (hubDemo && hubReal) hubState = 'mixed';
    else if (hubDemo) hubState = 'demo';
    else if (hubReal) hubState = 'real';

    return {
      ok: true,
      storage_mode: storage,
      markers: {
        volunteer_shift: a1Marker,
        visitation_followup: a2Marker,
        finance_reconciliation: a3Marker,
        school_management: schoolMarker
      },
      datasets: {
        volunteerSystemData_schedules: {
          source_key: 'volunteerSystemData.schedules',
          demo_source: DEMO_SCHEDULE_SOURCE,
          demo: volRows.demo,
          real: volRows.real,
          total: volRows.total
        },
        pastoralFollowupData_tasks: {
          source_key: 'pastoralFollowupData.tasks',
          demo_source: A2_DEMO_TASK_SOURCE,
          demo: pfRows.demo,
          real: pfRows.real,
          total: pfRows.total
        },
        financeReconciliationData_records: {
          source_key: 'financeReconciliationData.records',
          demo_source: A3_DEMO_RECORD_SOURCE,
          demo: finRows.demo,
          real: finRows.real,
          total: finRows.total
        },
        schoolMasterDatabase: {
          source_key: SCHOOL_STORAGE_KEY,
          students: school.students,
          teachers: school.teachers,
          courses: school.courses,
          total: school.total,
          is_demo_seed_meta: school.isDemoSeed
        }
      },
      trust_states: {
        a1: classifyDataState({
          source_key: 'volunteerSystemData.schedules',
          count: volRows.total,
          demoFlag: a1Marker.active,
          has_demo_rows: volRows.demo > 0,
          has_real_rows: volRows.real > 0
        }),
        a2: classifyDataState({
          source_key: 'pastoralFollowupData.tasks',
          count: pfRows.total,
          demoFlag: a2Marker.active,
          has_demo_rows: pfRows.demo > 0,
          has_real_rows: pfRows.real > 0
        }),
        a3: classifyDataState({
          source_key: 'financeReconciliationData.records',
          count: finRows.total,
          demoFlag: a3Marker.active,
          has_demo_rows: finRows.demo > 0,
          has_real_rows: finRows.real > 0
        }),
        school: classifyDataState({
          key: SCHOOL_STORAGE_KEY,
          count: school.total,
          demoFlag: schoolMarker.active || school.isDemoSeed,
          has_real_rows: school.total > 0 && !school.isDemoSeed
        }),
        hub: hubState
      },
      hub_state_label: STATE_LABELS[hubState] || hubState,
      warnings: [
        'demo KPI 不可當正式決策報告',
        '不會自動通知 LINE／WhatsApp',
        '牧養敏感 note 不在治理頁顯示全文'
      ]
    };
  }

  function clearVolunteerShiftA1Demo() {
    var removed = { schedules: 0, assignments: 0, members: 0, ministries: 0 };
    try {
      var b = global.ChurchDataBridge;
      var vol = b && b.getVolunteerData ? b.getVolunteerData() : JSON.parse(global.localStorage.getItem('volunteerSystemData') || '{}');
      if (!Array.isArray(vol.schedules)) vol.schedules = [];
      var before = vol.schedules.length;
      vol.schedules = vol.schedules.filter(function (s) {
        return s.source !== DEMO_SCHEDULE_SOURCE;
      });
      removed.schedules = before - vol.schedules.length;
      if (Array.isArray(vol.ministries)) {
        var mb = vol.ministries.length;
        vol.ministries = vol.ministries.filter(function (m) {
          var id = String(m.id);
          var name = String(m.name || '');
          if ((id === '901' || id === '902') && name.indexOf('A1') >= 0) return false;
          return true;
        });
        removed.ministries = mb - vol.ministries.length;
      }
      if (b && b.saveVolunteerSystemData) b.saveVolunteerSystemData(vol);
      else global.localStorage.setItem('volunteerSystemData', JSON.stringify(vol));

      var smRaw = global.localStorage.getItem('bible100_smart_ministry_main');
      if (smRaw) {
        var sm = JSON.parse(smRaw);
        if (Array.isArray(sm.ministry_assignment)) {
          var ab = sm.ministry_assignment.length;
          sm.ministry_assignment = sm.ministry_assignment.filter(function (a) {
            return a.source !== DEMO_ASSIGN_SOURCE;
          });
          removed.assignments = ab - sm.ministry_assignment.length;
          global.localStorage.setItem('bible100_smart_ministry_main', JSON.stringify(sm));
        }
      }

      if (b && b.getMemberSystemData && b.saveMemberSystemData) {
        var ms = b.getMemberSystemData();
        var demoIds = { '901': 1, '902': 1, '903': 1 };
        if (Array.isArray(ms.members)) {
          var membBefore = ms.members.length;
          ms.members = ms.members.filter(function (m) {
            var id = String(m.memberId != null ? m.memberId : m.id);
            if (!demoIds[id]) return true;
            return !m._is_demo;
          });
          removed.members = membBefore - ms.members.length;
          b.saveMemberSystemData(ms, { skipRbac: true });
        }
      }

      global.localStorage.removeItem(DEMO_LOADED_KEY);
      global.localStorage.removeItem(DEMO_VERSION_KEY);
      return {
        ok: true,
        removed: removed,
        removes_sources: [DEMO_SCHEDULE_SOURCE, DEMO_ASSIGN_SOURCE, 'demo 會友 _is_demo 901-903', 'demo 崗位 A1'],
        keeps: 'volunteerSystemData.schedules（source≠a1_demo_seed）與正式會友／崗位'
      };
    } catch (e) {
      return { ok: false, error: String(e.message || e) };
    }
  }

  function markSchoolDemoLoaded() {
    try {
      if (global.localStorage) global.localStorage.setItem(SCHOOL_DEMO_KEY, new Date().toISOString());
    } catch (e) {}
  }

  function isSchoolDemoMarked() {
    try {
      return !!(global.localStorage && global.localStorage.getItem(SCHOOL_DEMO_KEY));
    } catch (e) {
      return false;
    }
  }

  function isSchoolSeedRow(row) {
    if (!row || typeof row !== 'object') return false;
    if (row.source === 'school_demo_seed') return true;
    // 真實資料由 insert() 產生 13 位時間戳 ID；種子列 ID 皆 < 10 億。
    return typeof row.id === 'number' && row.id > 0 && row.id < 1000000000;
  }

  function getSchoolDataStats() {
    var students = 0;
    var teachers = 0;
    var courses = 0;
    var seedRows = 0;
    var realRows = 0;
    var isDemoSeed = false;
    var lastUpdated = '';
    try {
      var d = null;
      if (global.schoolDB && global.schoolDB.data) {
        d = global.schoolDB.data;
      } else {
        var raw = global.localStorage && global.localStorage.getItem(SCHOOL_STORAGE_KEY);
        if (raw) d = JSON.parse(raw);
      }
      if (d) {
        students = (d.students || []).length;
        teachers = (d.teachers || []).length;
        courses = (d.courses || []).length;
        [d.students, d.teachers, d.courses].forEach(function (arr) {
          (arr || []).forEach(function (row) {
            if (isSchoolSeedRow(row)) seedRows += 1;
            else realRows += 1;
          });
        });
        if (d.meta && d.meta.isDemoSeed) isDemoSeed = true;
        if (d.meta && d.meta.seedLoadedAt) lastUpdated = d.meta.seedLoadedAt;
      }
      if (!lastUpdated) {
        var fr = getDataFreshness(SCHOOL_STORAGE_KEY);
        lastUpdated = fr.last_updated || '—';
      } else {
        lastUpdated = formatTimestamp(lastUpdated);
      }
    } catch (e2) {}
    var total = students + teachers + courses;
    return {
      students: students,
      teachers: teachers,
      courses: courses,
      total: total,
      seedRows: seedRows,
      realRows: realRows,
      isDemoSeed: isDemoSeed || isSchoolDemoMarked() || seedRows > 0,
      last_updated: lastUpdated
    };
  }

  function buildSchoolTrustOptions(extra) {
    var stats = getSchoolDataStats();
    var hasStore = !!(global.schoolDB || (global.localStorage && global.localStorage.getItem(SCHOOL_STORAGE_KEY)));
    // W0：以列級種子特徵（ID／source）判定，示範與真實混合時顯示 mixed。
    var state;
    if (!hasStore) state = 'disconnected';
    else if (stats.total === 0) state = 'empty';
    else if (stats.seedRows > 0 && stats.realRows > 0) state = 'mixed';
    else if (stats.seedRows > 0 || stats.isDemoSeed) state = 'demo';
    else state = 'real';
    var stateLabels = {
      demo: '示範／種子資料',
      mixed: '示範種子 + 真實填寫資料（可到「系統 → 資料備份」清除種子）',
      real: '真實填寫資料'
    };
    var o = {
      source_key: SCHOOL_STORAGE_KEY,
      source_label_zh: '學校管理（學生／教師／課程等）',
      count: stats.total,
      last_updated: stats.last_updated,
      demoFlag: stats.isDemoSeed,
      data_state: state,
      data_state_label: stateLabels[state],
      write_behavior: 'manual_save',
      notify_behavior: 'none',
      privacy_level: 'sensitive',
      show_clear_demo: false,
      position: 'top'
    };
    if (extra && typeof extra === 'object') {
      Object.keys(extra).forEach(function (k) { o[k] = extra[k]; });
    }
    return o;
  }

  function buildChurchMinistryIndexTrustOptions(extra) {
    var memberCount = 0;
    var demoFlag = isVolunteerShiftDemoLoaded();
    try {
      if (global.ChurchDataBridge && global.ChurchDataBridge.getMembers) {
        memberCount = (global.ChurchDataBridge.getMembers() || []).length;
      }
    } catch (e) {}
    var state = memberCount > 0 ? (demoFlag ? 'mixed' : 'real') : (demoFlag ? 'demo' : 'empty');
    var o = {
      source_key: 'memberSystemData + volunteerSystemData + visitation + Smart Ministry',
      source_label_zh: '教會 CRM 總入口（會友、義工排班 A1、CTV、探訪部分）',
      count: memberCount,
      demoFlag: demoFlag,
      data_state: state,
      write_behavior: 'read_only',
      notify_behavior: 'none',
      privacy_level: 'pastoral_sensitive',
      show_clear_demo: true,
      position: 'top',
      extra_note: '本機 localStorage 優先；示範／A1 數字不可當正式 KPI 對外報告。'
    };
    if (extra && typeof extra === 'object') {
      Object.keys(extra).forEach(function (k) { o[k] = extra[k]; });
    }
    return o;
  }

  function buildAiLabTrustOptions(extra) {
    var isFile = false;
    try {
      isFile = global.location && global.location.protocol === 'file:';
    } catch (e) {}
    var o = {
      source_key: 'bible100_crm_intent_v2 + AI 工具頁（不寫入 CRM SSOT）',
      source_label_zh: 'AI Lab（備課／導讀／創作／營運自動化）',
      count: '—',
      data_state: 'disconnected',
      data_state_label: '輔助與生成（多數不連教會 CRM 寫入層）',
      write_behavior: 'prefill_only',
      notify_behavior: 'none',
      show_clear_demo: false,
      position: 'top',
      extra_note: '營運自動化為 prefill_only；語音需 localhost／HTTPS' + (isFile ? '（file:// 不可用麥克風）' : '') + '。不會自動寫入教會 CRM。'
    };
    if (extra && typeof extra === 'object') {
      Object.keys(extra).forEach(function (k) { o[k] = extra[k]; });
    }
    return o;
  }

  function renderSchoolEntryTrust(mount, extra) {
    return renderDataTrustBadge(buildSchoolTrustOptions(Object.assign({ mount: mount }, extra || {})));
  }

  function renderChurchMinistryEntryTrust(mount, extra) {
    return renderDataTrustBadge(buildChurchMinistryIndexTrustOptions(Object.assign({ mount: mount }, extra || {})));
  }

  function renderAiLabEntryTrust(mount, extra) {
    return renderDataTrustBadge(buildAiLabTrustOptions(Object.assign({ mount: mount }, extra || {})));
  }

  global.DataTrustBadge = {
    DEMO_LOADED_KEY: DEMO_LOADED_KEY,
    DEMO_VERSION_KEY: DEMO_VERSION_KEY,
    A2_DEMO_LOADED_KEY: A2_DEMO_LOADED_KEY,
    SCHOOL_DEMO_KEY: SCHOOL_DEMO_KEY,
    A2_DEMO_TASK_SOURCE: A2_DEMO_TASK_SOURCE,
    getStorageModeLabel: getStorageModeLabel,
    getDataFreshness: getDataFreshness,
    classifyDataState: classifyDataState,
    renderDataTrustBadge: renderDataTrustBadge,
    renderActionTrustNotice: renderActionTrustNotice,
    markVolunteerShiftDemoLoaded: markVolunteerShiftDemoLoaded,
    isVolunteerShiftDemoLoaded: isVolunteerShiftDemoLoaded,
    clearVolunteerShiftA1Demo: clearVolunteerShiftA1Demo,
    clearVisitationFollowupA2Demo: clearVisitationFollowupA2Demo,
    clearFinanceReconciliationA3Demo: clearFinanceReconciliationA3Demo,
    clearSchoolDemoMarker: clearSchoolDemoMarker,
    getDemoGovernanceSummary: getDemoGovernanceSummary,
    isVisitationFollowupDemoLoaded: isVisitationFollowupDemoLoaded,
    isFinanceReconciliationDemoLoaded: isFinanceReconciliationDemoLoaded,
    pastoralFollowupRowStats: pastoralFollowupRowStats,
    financeReconciliationRowStats: financeReconciliationRowStats,
    volunteerShiftRowStats: volunteerShiftRowStats,
    A3_DEMO_LOADED_KEY: A3_DEMO_LOADED_KEY,
    markSchoolDemoLoaded: markSchoolDemoLoaded,
    isSchoolDemoMarked: isSchoolDemoMarked,
    getSchoolDataStats: getSchoolDataStats,
    buildSchoolTrustOptions: buildSchoolTrustOptions,
    buildChurchMinistryIndexTrustOptions: buildChurchMinistryIndexTrustOptions,
    buildAiLabTrustOptions: buildAiLabTrustOptions,
    renderSchoolEntryTrust: renderSchoolEntryTrust,
    renderChurchMinistryEntryTrust: renderChurchMinistryEntryTrust,
    renderAiLabEntryTrust: renderAiLabEntryTrust
  };
})(typeof window !== 'undefined' ? window : this);
