/**
 * bible100 backend bootstrap (modular init)
 * Unified Supabase config injection + ChurchDataBridgePhase1 startup.
 */
(function (global) {
  "use strict";

  function readMeta(name) {
    try {
      var el = document.querySelector('meta[name="' + name + '"]');
      return el ? String(el.content || "").trim() : "";
    } catch (e) {
      return "";
    }
  }

  function readEnvLike(name) {
    try {
      if (typeof process !== "undefined" && process && process.env && process.env[name]) {
        return String(process.env[name]).trim();
      }
    } catch (e) {}
    return "";
  }

  function getBackendConfig() {
    var cfg = global.BIBLE100_CONFIG || {};
    var supabaseUrl =
      cfg.supabaseUrl ||
      global.__SUPABASE_URL__ ||
      readMeta("bible100-supabase-url") ||
      readEnvLike("BIBLE100_SUPABASE_URL");
    var supabaseAnonKey =
      cfg.supabaseAnonKey ||
      global.__SUPABASE_ANON_KEY__ ||
      readMeta("bible100-supabase-anon-key") ||
      readEnvLike("BIBLE100_SUPABASE_ANON_KEY");

    return {
      supabaseUrl: supabaseUrl || "",
      supabaseAnonKey: supabaseAnonKey || "",
      queueStorageKey: cfg.queueStorageKey || "church_data_bridge_phase1_queue",
      leaderPipelinePolicy: cfg.leaderPipelinePolicy || {
        mode: "hybrid",
        thresholdCourseIds: ["LEADER_STAGE3", "DISCIPLE_MASTER"],
        stage3Credits: 12
      }
    };
  }

  function initBridge() {
    if (!global.ChurchDataBridgePhase1 || !global.ChurchDataBridgePhase1.getInstance) {
      return null;
    }
    var cfg = getBackendConfig();
    return global.ChurchDataBridgePhase1.getInstance(cfg);
  }

  var bridge = initBridge();
  global.Bible100Backend = {
    getConfig: getBackendConfig,
    getBridge: function () {
      return bridge || initBridge();
    }
  };
})(typeof window !== "undefined" ? window : this);

