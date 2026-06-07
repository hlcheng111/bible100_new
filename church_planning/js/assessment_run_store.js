/**
 * 教會規劃量表 · assessment_run 統一存儲（v1 本機 localStorage）
 * 依賴：無（可選 PersistenceProvider / ChurchToolkit storage）
 */
(function (global) {
  "use strict";

  var SCHEMA_VERSION = 1;
  var RUNS_KEY = "bible100_assessment_runs";
  var MAX_RUNS = 200;
  var LATEST_PREFIX = "bible100_assessment_latest_";

  function storageGet(key) {
    try {
      if (global.ChurchToolkit && typeof global.ChurchToolkit.storageGet === "function") {
        return global.ChurchToolkit.storageGet(key);
      }
      if (global.PersistenceProvider && typeof global.PersistenceProvider.getInstance === "function") {
        return global.PersistenceProvider.getInstance().getItem(key);
      }
    } catch (e) {
      /* fallback */
    }
    return global.localStorage.getItem(key);
  }

  function storageSet(key, value) {
    try {
      if (global.ChurchToolkit && typeof global.ChurchToolkit.storageSet === "function") {
        global.ChurchToolkit.storageSet(key, value);
        return;
      }
      if (global.PersistenceProvider && typeof global.PersistenceProvider.getInstance === "function") {
        global.PersistenceProvider.getInstance().setItem(key, value);
        return;
      }
    } catch (e2) {
      /* fallback */
    }
    global.localStorage.setItem(key, value);
  }

  function readJson(key) {
    try {
      var raw = storageGet(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function writeJson(key, obj) {
    storageSet(key, JSON.stringify(obj));
  }

  function latestKey(toolId) {
    return LATEST_PREFIX + String(toolId || "").trim();
  }

  function validateRun(run) {
    var errors = [];
    if (!run || typeof run !== "object") {
      errors.push("run 必須為物件");
      return { ok: false, errors: errors };
    }
    if (run.schema_version !== SCHEMA_VERSION) {
      errors.push("schema_version 須為 " + SCHEMA_VERSION);
    }
    if (!run.tool_id || typeof run.tool_id !== "string") {
      errors.push("缺少 tool_id");
    }
    if (!run.timestamp || !isFinite(Number(run.timestamp))) {
      errors.push("缺少有效 timestamp");
    }
    if (run.authenticity_score != null && !isFinite(Number(run.authenticity_score))) {
      errors.push("authenticity_score 無效");
    }
    if (!run.feature_vector || typeof run.feature_vector !== "object") {
      errors.push("缺少 feature_vector");
    }
    if (!Array.isArray(run.raw_answers)) {
      errors.push("raw_answers 須為陣列");
    }
    if (!Array.isArray(run.risk_flags)) {
      errors.push("risk_flags 須為陣列");
    }
    return { ok: errors.length === 0, errors: errors };
  }

  function normalizeRun(run) {
    var out = Object.assign({}, run);
    out.schema_version = SCHEMA_VERSION;
    out.timestamp = Number(run.timestamp) || Date.now();
    out.member_id = run.member_id != null ? run.member_id : null;
    out.profile = run.profile && typeof run.profile === "object" ? run.profile : {};
    out.authenticity_score =
      run.authenticity_score != null ? Math.round(Number(run.authenticity_score) * 1000) / 1000 : null;
    out.risk_flags = Array.isArray(run.risk_flags) ? run.risk_flags.slice() : [];
    out.raw_answers = Array.isArray(run.raw_answers) ? run.raw_answers.slice() : [];
    return out;
  }

  function loadRunsIndex() {
    var arr = readJson(RUNS_KEY);
    return Array.isArray(arr) ? arr : [];
  }

  function saveRun(run) {
    var normalized = normalizeRun(run);
    var check = validateRun(normalized);
    if (!check.ok) {
      return { ok: false, errors: check.errors };
    }

    writeJson(latestKey(normalized.tool_id), normalized);

    var index = loadRunsIndex();
    index.push({
      tool_id: normalized.tool_id,
      timestamp: normalized.timestamp,
      member_id: normalized.member_id,
      authenticity_score: normalized.authenticity_score,
      risk_flags: normalized.risk_flags.slice(),
      derived: normalized.derived ? Object.assign({}, normalized.derived) : null
    });
    if (index.length > MAX_RUNS) {
      index = index.slice(index.length - MAX_RUNS);
    }
    writeJson(RUNS_KEY, index);

    return { ok: true, run: normalized };
  }

  function loadLatest(toolId) {
    if (!toolId) return null;
    return readJson(latestKey(toolId));
  }

  function listRuns(toolId, limit) {
    var index = loadRunsIndex();
    var filtered = toolId
      ? index.filter(function (row) {
          return row.tool_id === toolId;
        })
      : index;
    filtered = filtered.slice().sort(function (a, b) {
      return (b.timestamp || 0) - (a.timestamp || 0);
    });
    if (limit != null && isFinite(limit) && limit > 0) {
      filtered = filtered.slice(0, limit);
    }
    return filtered;
  }

  function clearLatest(toolId) {
    if (!toolId) return;
    try {
      if (global.localStorage) global.localStorage.removeItem(latestKey(toolId));
    } catch (e) {
      /* ignore */
    }
  }

  global.AssessmentRunStore = {
    SCHEMA_VERSION: SCHEMA_VERSION,
    RUNS_KEY: RUNS_KEY,
    LATEST_PREFIX: LATEST_PREFIX,
    latestKey: latestKey,
    validateRun: validateRun,
    saveRun: saveRun,
    loadLatest: loadLatest,
    listRuns: listRuns,
    clearLatest: clearLatest
  };
})(typeof window !== "undefined" ? window : global);
