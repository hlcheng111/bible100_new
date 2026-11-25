/**
 * 豐盛金齡 · 第三里程（V2）輕量本機工具箱
 * 鍵：bible100_golden_age_kit_v1 —— 同意／處境掃描／失敗指標／輕省察
 * 不另造人員 ID；不寫入 AI 牧養判斷；敏感資料僅本機。
 */
(function (global) {
  "use strict";
  var KEY = "bible100_golden_age_kit_v1";

  function empty() {
    return {
      schema_version: 1,
      consent: null,
      context_scans: [],
      failsafe_checks: [],
      reflections: [],
      meta: { updated_at: null }
    };
  }

  function load() {
    try {
      var raw = global.localStorage.getItem(KEY);
      if (!raw) return empty();
      var o = JSON.parse(raw);
      if (!o || typeof o !== "object") return empty();
      o.context_scans = o.context_scans || [];
      o.failsafe_checks = o.failsafe_checks || [];
      o.reflections = o.reflections || [];
      return o;
    } catch (e) {
      return empty();
    }
  }

  function save(store) {
    store.meta = store.meta || {};
    store.meta.updated_at = new Date().toISOString();
    global.localStorage.setItem(KEY, JSON.stringify(store));
    return store;
  }

  function saveConsent(rec) {
    var s = load();
    s.consent = {
      agreed: !!rec.agreed,
      name: String(rec.name || "").slice(0, 80),
      purpose_ack: !!rec.purpose_ack,
      retention_ack: !!rec.retention_ack,
      no_ai_judgment_ack: !!rec.no_ai_judgment_ack,
      at: new Date().toISOString()
    };
    return save(s);
  }

  function pushContextScan(row) {
    var s = load();
    s.context_scans.unshift({
      at: new Date().toISOString(),
      pains: row.pains || [],
      pressure_felt: !!row.pressure_felt,
      note: String(row.note || "").slice(0, 400)
    });
    s.context_scans = s.context_scans.slice(0, 24);
    return save(s);
  }

  function pushFailsafe(row) {
    var s = load();
    s.failsafe_checks.unshift({
      at: new Date().toISOString(),
      overload: !!row.overload,
      spiritual_pressure: !!row.spiritual_pressure,
      referral_stuck: !!row.referral_stuck,
      privacy_incident: !!row.privacy_incident,
      exit_by_pressure: !!row.exit_by_pressure,
      action: String(row.action || "continue").slice(0, 40),
      note: String(row.note || "").slice(0, 400)
    });
    s.failsafe_checks = s.failsafe_checks.slice(0, 24);
    return save(s);
  }

  function pushReflection(row) {
    var s = load();
    s.reflections.unshift({
      at: new Date().toISOString(),
      voluntary: true,
      body: String(row.body || "").slice(0, 80),
      heart: String(row.heart || "").slice(0, 80),
      spirit: String(row.spirit || "").slice(0, 80),
      open: String(row.open || "").slice(0, 400),
      serve_or_rest: String(row.serve_or_rest || "undecided").slice(0, 20)
    });
    s.reflections = s.reflections.slice(0, 36);
    return save(s);
  }

  function exportJson() {
    return JSON.stringify(load(), null, 2);
  }

  function clearAll() {
    global.localStorage.removeItem(KEY);
  }

  global.GoldenAgeKit = {
    KEY: KEY,
    load: load,
    saveConsent: saveConsent,
    pushContextScan: pushContextScan,
    pushFailsafe: pushFailsafe,
    pushReflection: pushReflection,
    exportJson: exportJson,
    clearAll: clearAll
  };
})(typeof window !== "undefined" ? window : this);
