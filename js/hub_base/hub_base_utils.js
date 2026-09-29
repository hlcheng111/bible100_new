/**
 * Hub Base · Facade 工具庫（Phase 1 · Wave 1 底座）
 *
 * 【鐵律】本模組為全站統一入口（facade），不取代 canonical 寫入權：
 *   - 會友 → CentralMemberDB（memberSystemData）
 *   - 事奉 → SmartMinistryCanonical（bible100_smart_ministry_main）
 *   - 量表/PDCA → AssessmentRunStore（bible100_assessment_runs）
 *
 * 業務頁面後續遷移：// TODO V2: 後續遷移至 hub_base 底座
 */
(function (global) {
  "use strict";

  var C = global.HubBaseConstant || {};
  var KEYS = C.STORAGE_KEYS || {
    member: "memberSystemData",
    smartMinistry: "bible100_smart_ministry_main",
    assessmentRuns: "bible100_assessment_runs",
    audit: "bible100_audit_log",
  };
  var ROLE_KEY = C.ROLE_STORAGE_KEY || "bible100_hub_base_sim_role";
  var MAX_AUDIT = C.MAX_AUDIT_ENTRIES || 500;
  var BUNDLE_VERSION = C.BUNDLE_VERSION || 1;
  var ROLES = C.ROLES || { member: { id: "member", level: 1 }, ministry_leader: { id: "ministry_leader", level: 2 }, admin: { id: "admin", level: 3 } };

  function nowIso() {
    return new Date().toISOString();
  }

  function uid(prefix) {
    return (prefix || "hb") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
  }

  function safeParse(raw, fb) {
    try {
      return raw ? JSON.parse(raw) : fb;
    } catch (e) {
      return fb;
    }
  }

  function storageGet(key) {
    try {
      if (global.PersistenceProvider && typeof global.PersistenceProvider.getInstance === "function") {
        return global.PersistenceProvider.getInstance().getItem(key);
      }
    } catch (e) {}
    return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
  }

  function storageSet(key, value) {
    try {
      if (global.PersistenceProvider && typeof global.PersistenceProvider.getInstance === "function") {
        global.PersistenceProvider.getInstance().setItem(key, value);
        return true;
      }
    } catch (e2) {}
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, value);
      return true;
    }
    return false;
  }

  /** 對外 spaceId；對內映射 churchId / church_id */
  function getSpaceId() {
    try {
      if (global.HubBase && global.HubBase._overrideSpaceId) {
        return String(global.HubBase._overrideSpaceId);
      }
      if (global.CURRENT_CHURCH_ID) return String(global.CURRENT_CHURCH_ID).trim();
      if (global.location && global.location.search) {
        var sp = new URLSearchParams(global.location.search);
        var cid = sp.get("church_id") || sp.get("spaceId");
        if (cid && String(cid).trim()) return String(cid).trim();
      }
      if (global.CentralMemberDB && typeof global.CentralMemberDB.get === "function") {
        var db = global.CentralMemberDB.get();
        if (db && db.churchId) return String(db.churchId);
      }
    } catch (e) {}
    return "default";
  }

  function normalizeSpaceOnRecord(rec) {
    if (!rec || typeof rec !== "object") return rec;
    var sid = getSpaceId();
    if (rec.spaceId == null) rec.spaceId = sid;
    if (rec.churchId == null) rec.churchId = sid;
    if (rec.church_id == null) rec.church_id = sid;
    return rec;
  }

  function summarizeSnapshot(obj, maxLen) {
    if (obj == null) return null;
    maxLen = maxLen || 400;
    try {
      var s = JSON.stringify(obj);
      if (s.length <= maxLen) return obj;
      return { _truncated: true, preview: s.slice(0, maxLen) + "…" };
    } catch (e) {
      return { _error: "unserializable" };
    }
  }

  function loadAuditLog() {
    var data = safeParse(storageGet(KEYS.audit), null);
    if (!data || typeof data !== "object") {
      return { schema_version: 1, spaceId: getSpaceId(), entries: [] };
    }
    if (!Array.isArray(data.entries)) data.entries = [];
    if (data.schema_version == null) data.schema_version = 1;
    return data;
  }

  function saveAuditLog(data) {
    storageSet(KEYS.audit, JSON.stringify(data));
  }

  /**
   * 統一日誌寫入（Hub Base 新增能力）
   * @param {Object} entry — domain, action, target_id, before, after, note, source, actor
   */
  function logAudit(entry) {
    entry = entry || {};
    var log = loadAuditLog();
    var row = {
      id: uid("audit"),
      spaceId: entry.spaceId || getSpaceId(),
      timestamp: entry.timestamp || nowIso(),
      role: entry.role || getSimulatedRole(),
      actor: entry.actor || null,
      domain: String(entry.domain || "unknown"),
      action: String(entry.action || "unknown"),
      target_id: entry.target_id != null ? String(entry.target_id) : null,
      before: summarizeSnapshot(entry.before),
      after: summarizeSnapshot(entry.after),
      note: entry.note || "",
      source: entry.source || "",
    };
    log.entries.push(row);
    if (log.entries.length > MAX_AUDIT) {
      log.entries = log.entries.slice(log.entries.length - MAX_AUDIT);
    }
    log.updated_at = nowIso();
    saveAuditLog(log);
    return row;
  }

  function getSimulatedRole() {
    try {
      var raw = storageGet(ROLE_KEY);
      var r = raw ? String(raw).trim() : "";
      if (r && ROLES[r]) return r;
    } catch (e) {}
    return C.DEFAULT_ROLE || "member";
  }

  function setSimulatedRole(roleId) {
    var id = String(roleId || "").trim();
    if (!ROLES[id]) {
      return { ok: false, error: "invalid_role", allowed: Object.keys(ROLES) };
    }
    storageSet(ROLE_KEY, id);
    logAudit({
      domain: "hub_base",
      action: "role_switch",
      after: { role: id },
      note: "模擬角色切換（本機 UI 權限預演）",
      source: "HubBase.setSimulatedRole",
    });
    return { ok: true, role: id };
  }

  function roleLevel(roleId) {
    var r = ROLES[roleId || getSimulatedRole()];
    return r && r.level != null ? r.level : 1;
  }

  /**
   * 本機權限模擬（非真實登入）
   * action: read_member | write_member | read_talent | write_talent | export | import | admin
   */
  function canPerform(action) {
    var lvl = roleLevel(getSimulatedRole());
    var need = {
      read_member: 1,
      read_talent: 1,
      read_pdca: 1,
      write_member: 2,
      write_talent: 2,
      write_pdca: 2,
      export: 2,
      import: 3,
      admin: 3,
    };
    var min = need[action] != null ? need[action] : 3;
    return lvl >= min;
  }

  // ---------- Facade 讀取（委派 canonical）----------

  function readMembers() {
    if (global.CentralMemberDB && typeof global.CentralMemberDB.get === "function") {
      return global.CentralMemberDB.get();
    }
    return safeParse(storageGet(KEYS.member), null);
  }

  function readSmartMinistryStore() {
    if (global.SmartMinistryCanonical && typeof global.SmartMinistryCanonical.getStore === "function") {
      return global.SmartMinistryCanonical.getStore();
    }
    return safeParse(storageGet(KEYS.smartMinistry), null);
  }

  function readMinistryCatalog() {
    var store = readSmartMinistryStore();
    return store && Array.isArray(store.ministries) ? store.ministries.slice() : [];
  }

  function readTalentPool() {
    if (global.SmartMinistryCanonical && typeof global.SmartMinistryCanonical.listTalents === "function") {
      return global.SmartMinistryCanonical.listTalents();
    }
    var store = readSmartMinistryStore();
    return store && Array.isArray(store.talents) ? store.talents.slice() : [];
  }

  function readAssessmentRunIndex() {
    if (global.AssessmentRunStore && typeof global.AssessmentRunStore.listRuns === "function") {
      return global.AssessmentRunStore.listRuns(null, null);
    }
    var arr = safeParse(storageGet(KEYS.assessmentRuns), []);
    return Array.isArray(arr) ? arr : [];
  }

  function readAuditEntries(limit) {
    var log = loadAuditLog();
    var entries = log.entries.slice().reverse();
    if (limit != null && isFinite(limit) && limit > 0) {
      entries = entries.slice(0, limit);
    }
    return entries;
  }

  // ---------- Facade 寫入（委派 + 審計）----------

  function writeMembers(data, meta) {
    meta = meta || {};
    if (!canPerform("write_member")) {
      return { ok: false, error: "forbidden", need: "write_member" };
    }
    if (!global.CentralMemberDB || typeof global.CentralMemberDB.set !== "function") {
      return { ok: false, error: "CentralMemberDB unavailable" };
    }
    var normalized = normalizeSpaceOnRecord(Object.assign({}, data));
    var before = readMembers();
    var ok = global.CentralMemberDB.set(normalized);
    if (ok) {
      logAudit({
        domain: "member_crm",
        action: "write",
        before: before ? { memberCount: (before.members || []).length, churchId: before.churchId } : null,
        after: { memberCount: (normalized.members || []).length, churchId: normalized.churchId },
        note: meta.note || "",
        source: meta.source || "HubBase.writeMembers",
      });
    }
    return { ok: !!ok };
  }

  function writeSmartMinistryStore(data, meta) {
    meta = meta || {};
    if (!canPerform("write_talent")) {
      return { ok: false, error: "forbidden", need: "write_talent" };
    }
    if (!global.SmartMinistryCanonical || typeof global.SmartMinistryCanonical.saveStore !== "function") {
      return { ok: false, error: "SmartMinistryCanonical unavailable" };
    }
    var before = readSmartMinistryStore();
    var ok = global.SmartMinistryCanonical.saveStore(data);
    if (ok) {
      logAudit({
        domain: "talent_pool",
        action: "write_store",
        before: before
          ? {
              talents: (before.talents || []).length,
              ministries: (before.ministries || []).length,
              assignments: (before.ministry_assignment || []).length,
            }
          : null,
        after: {
          talents: (data.talents || []).length,
          ministries: (data.ministries || []).length,
          assignments: (data.ministry_assignment || []).length,
        },
        note: meta.note || "",
        source: meta.source || "HubBase.writeSmartMinistryStore",
      });
    }
    return { ok: !!ok };
  }

  function saveAssessmentRun(run, meta) {
    meta = meta || {};
    if (!canPerform("write_pdca")) {
      return { ok: false, error: "forbidden", need: "write_pdca" };
    }
    if (!global.AssessmentRunStore || typeof global.AssessmentRunStore.saveRun !== "function") {
      return { ok: false, error: "AssessmentRunStore unavailable" };
    }
    run = normalizeSpaceOnRecord(Object.assign({}, run));
    var result = global.AssessmentRunStore.saveRun(run);
    if (result && result.ok) {
      logAudit({
        domain: "pdca_run",
        action: "save_run",
        target_id: run.tool_id,
        after: { tool_id: run.tool_id, timestamp: run.timestamp },
        note: meta.note || "",
        source: meta.source || "HubBase.saveAssessmentRun",
      });
    }
    return result;
  }

  // ---------- 校驗 ----------

  function validateRecord(domain, record) {
    var schema = global.HubBaseSchema && global.HubBaseSchema.getByDomain
      ? global.HubBaseSchema.getByDomain(domain)
      : null;
    if (!schema) {
      return { ok: false, errors: ["unknown_domain:" + domain] };
    }
    var errors = [];
    var fields =
      schema.itemFields || schema.memberFields || schema.entryFields || schema.runFields || schema.rootFields;
    if (!record || typeof record !== "object") {
      return { ok: false, errors: ["record must be object"] };
    }
    Object.keys(fields || {}).forEach(function (key) {
      var def = fields[key];
      if (def && def.required && (record[key] == null || record[key] === "")) {
        errors.push("missing:" + key);
      }
    });
    if (schema.spaceIdField && record[schema.spaceIdField] == null) {
      record = normalizeSpaceOnRecord(record);
    }
    return { ok: errors.length === 0, errors: errors, record: record };
  }

  function validateBundle(bundle) {
    var errors = [];
    if (!bundle || typeof bundle !== "object") errors.push("bundle must be object");
    if (bundle && bundle.hub_base_bundle_version == null) errors.push("missing hub_base_bundle_version");
    if (bundle && !bundle.canonical) errors.push("missing canonical section");
    return { ok: errors.length === 0, errors: errors };
  }

  // ---------- 匯入匯出（USB 多 PC）----------

  function exportBundle(options) {
    options = options || {};
    if (!canPerform("export")) {
      return { ok: false, error: "forbidden", need: "export" };
    }
    var spaceId = getSpaceId();
    var bundle = {
      hub_base_bundle_version: BUNDLE_VERSION,
      exported_at: nowIso(),
      spaceId: spaceId,
      canonical: {
        memberSystemData: readMembers(),
        bible100_smart_ministry_main: readSmartMinistryStore(),
        bible100_assessment_runs: readAssessmentRunIndex(),
        bible100_audit_log: loadAuditLog(),
      },
      meta: {
        note: "Hub Base facade export; restore via HubBase.importBundle",
        generator: "HubBase.exportBundle",
      },
    };
    logAudit({
      domain: "hub_base",
      action: "export",
      after: {
        spaceId: spaceId,
        hasMember: !!bundle.canonical.memberSystemData,
        talentCount: bundle.canonical.bible100_smart_ministry_main
          ? (bundle.canonical.bible100_smart_ministry_main.talents || []).length
          : 0,
      },
      source: "HubBase.exportBundle",
    });
    if (options.asJsonString) {
      return { ok: true, json: JSON.stringify(bundle, null, 2), bundle: bundle };
    }
    return { ok: true, bundle: bundle };
  }

  function importBundle(bundle, options) {
    options = options || {};
    if (!canPerform("import")) {
      return { ok: false, error: "forbidden", need: "import" };
    }
    var check = validateBundle(bundle);
    if (!check.ok) return { ok: false, errors: check.errors };

    var targetSpace = options.spaceId || getSpaceId();
    var incomingSpace = bundle.spaceId || targetSpace;
    if (options.requireSpaceMatch && incomingSpace !== targetSpace) {
      return { ok: false, error: "space_mismatch", expected: targetSpace, got: incomingSpace };
    }

    var c = bundle.canonical || {};
    var results = [];

    if (c.memberSystemData && global.CentralMemberDB) {
      var md = normalizeSpaceOnRecord(Object.assign({}, c.memberSystemData, { churchId: incomingSpace }));
      var wr = writeMembers(md, { note: "importBundle", source: "HubBase.importBundle" });
      results.push({ key: KEYS.member, ok: !!(wr && wr.ok) });
    }
    if (c.bible100_smart_ministry_main && global.SmartMinistryCanonical) {
      var sm = Object.assign({}, c.bible100_smart_ministry_main);
      if (sm.meta) sm.meta.church_id = incomingSpace;
      var ws = writeSmartMinistryStore(sm, { note: "importBundle", source: "HubBase.importBundle" });
      results.push({ key: KEYS.smartMinistry, ok: !!(ws && ws.ok) });
    }
    if (c.bible100_assessment_runs && Array.isArray(c.bible100_assessment_runs)) {
      storageSet(KEYS.assessmentRuns, JSON.stringify(c.bible100_assessment_runs));
      results.push({ key: KEYS.assessmentRuns, ok: true });
    }
    if (c.bible100_audit_log) {
      storageSet(KEYS.audit, JSON.stringify(c.bible100_audit_log));
      results.push({ key: KEYS.audit, ok: true });
    }

    logAudit({
      domain: "hub_base",
      action: "import",
      after: { spaceId: incomingSpace, restored: results },
      source: "HubBase.importBundle",
    });

    return { ok: true, spaceId: incomingSpace, restored: results };
  }

  function downloadBundleJson(filename) {
    var exp = exportBundle({ asJsonString: true });
    if (!exp.ok) return exp;
    filename = filename || "bible100_hub_base_" + getSpaceId() + "_" + Date.now() + ".json";
    try {
      var blob = new Blob([exp.json], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      return { ok: true, filename: filename };
    } catch (e) {
      return { ok: false, error: String(e.message || e) };
    }
  }

  var HubBase = {
    VERSION: C.VERSION || "1.0.0",
    BUILD: C.BUILD || "20260819hb",
    KEYS: KEYS,

    getSpaceId: getSpaceId,
    logAudit: logAudit,
    readAuditEntries: readAuditEntries,

    readMembers: readMembers,
    writeMembers: writeMembers,
    readSmartMinistryStore: readSmartMinistryStore,
    writeSmartMinistryStore: writeSmartMinistryStore,
    readMinistryCatalog: readMinistryCatalog,
    readTalentPool: readTalentPool,
    readAssessmentRunIndex: readAssessmentRunIndex,
    saveAssessmentRun: saveAssessmentRun,

    exportBundle: exportBundle,
    importBundle: importBundle,
    downloadBundleJson: downloadBundleJson,

    validateRecord: validateRecord,
    validateBundle: validateBundle,

    getSimulatedRole: getSimulatedRole,
    setSimulatedRole: setSimulatedRole,
    canPerform: canPerform,

    /** 子模組引用（需先載入 constant / schema） */
    Constant: function () {
      return global.HubBaseConstant || C;
    },
    Schema: function () {
      return global.HubBaseSchema || null;
    },
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = HubBase;
  } else {
    global.HubBase = HubBase;
  }
})(typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : this);
