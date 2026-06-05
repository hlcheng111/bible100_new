/**
 * PersistenceProvider
 * Hybrid storage adapter: local cache + Supabase KV sync.
 * API: getItem/setItem/removeItem (localStorage-compatible, sync signature).
 */
(function (global) {
  "use strict";

  var DEFAULTS = {
    mode: "local", // local | hybrid | cloud
    churchId: "default",
    cachePrefix: "b100_cache_",
    supabaseUrl: "",
    supabaseAnonKey: "",
    tableName: "church_kv_store"
  };
  var LS_CFG_PREFIX = "b100_supabase_";

  function readMeta(name) {
    try {
      var el = document.querySelector('meta[name="' + name + '"]');
      return el ? String(el.content || "").trim() : "";
    } catch (e) {
      return "";
    }
  }

  function getChurchId() {
    try {
      var params = new URLSearchParams(global.location && global.location.search ? global.location.search : "");
      return params.get("church_id") || global.CURRENT_CHURCH_ID || "default";
    } catch (e) {
      return "default";
    }
  }

  function readLocalCfg(name) {
    try {
      return String(localStorage.getItem(LS_CFG_PREFIX + name) || "").trim();
    } catch (e) {
      return "";
    }
  }

  function saveLocalCfg(cfg) {
    try {
      if (cfg.mode != null) localStorage.setItem(LS_CFG_PREFIX + "mode", String(cfg.mode));
      if (cfg.supabaseUrl != null) localStorage.setItem(LS_CFG_PREFIX + "url", String(cfg.supabaseUrl));
      if (cfg.supabaseAnonKey != null) localStorage.setItem(LS_CFG_PREFIX + "anon_key", String(cfg.supabaseAnonKey));
      if (cfg.tableName != null) localStorage.setItem(LS_CFG_PREFIX + "table", String(cfg.tableName));
    } catch (e) {}
  }

  function loadSupabaseScriptIfNeeded() {
    if (global.supabase && typeof global.supabase.createClient === "function") return;
    try {
      var exists = document.querySelector('script[data-b100-supabase="1"]');
      if (exists) return;
      var s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      s.async = true;
      s.defer = true;
      s.setAttribute("data-b100-supabase", "1");
      document.head.appendChild(s);
    } catch (e) {}
  }

  function Provider(config) {
    this.cfg = Object.assign({}, DEFAULTS, config || {});
    this.cfg.churchId = String(this.cfg.churchId || getChurchId() || "default");
    this.client = null;
    if ((this.cfg.mode === "hybrid" || this.cfg.mode === "cloud") && this.cfg.supabaseUrl && this.cfg.supabaseAnonKey) {
      loadSupabaseScriptIfNeeded();
      this._tryInitClient();
    }
  }

  Provider.prototype._tryInitClient = function () {
    try {
      if (global.supabase && typeof global.supabase.createClient === "function") {
        this.client = global.supabase.createClient(this.cfg.supabaseUrl, this.cfg.supabaseAnonKey);
      }
    } catch (e) {
      this.client = null;
    }
  };

  Provider.prototype._cacheKey = function (key) {
    return this.cfg.cachePrefix + key;
  };

  Provider.prototype._kvRow = function (key, value) {
    return {
      church_id: this.cfg.churchId,
      key: String(key),
      value_text: value == null ? null : String(value),
      updated_at: new Date().toISOString()
    };
  };

  Provider.prototype._syncUpsert = function (key, value) {
    var self = this;
    if (!this.client) this._tryInitClient();
    if (!this.client) return;
    this.client
      .from(this.cfg.tableName)
      .upsert(this._kvRow(key, value), { onConflict: "church_id,key" })
      .then(function () {})
      .catch(function () {});
  };

  Provider.prototype.getItem = function (key) {
    try {
      var local = localStorage.getItem(key);
      if (local != null) return local;
      var cache = localStorage.getItem(this._cacheKey(key));
      return cache;
    } catch (e) {
      return null;
    }
  };

  Provider.prototype.setItem = function (key, value) {
    try {
      localStorage.setItem(key, value);
      localStorage.setItem(this._cacheKey(key), value);
    } catch (e) {}
    if (this.cfg.mode === "hybrid" || this.cfg.mode === "cloud") {
      this._syncUpsert(key, value);
    }
  };

  Provider.prototype.removeItem = function (key) {
    try {
      localStorage.removeItem(key);
      localStorage.removeItem(this._cacheKey(key));
    } catch (e) {}
    if (!this.client) this._tryInitClient();
    if (!this.client) return;
    this.client
      .from(this.cfg.tableName)
      .delete()
      .eq("church_id", this.cfg.churchId)
      .eq("key", String(key))
      .then(function () {})
      .catch(function () {});
  };

  Provider.prototype.getJson = function (key, fallback) {
    var raw = this.getItem(key);
    if (raw == null || raw === "") return fallback == null ? null : fallback;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return fallback == null ? null : fallback;
    }
  };

  Provider.prototype.setJson = function (key, value) {
    try {
      this.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  };

  Provider.prototype.getChurchScopedKey = function (baseKey, churchId) {
    var cid = String(churchId || this.cfg.churchId || "default").trim() || "default";
    return String(baseKey) + "::" + cid;
  };

  function buildConfig() {
    var mode =
      readMeta("bible100-persistence-mode") ||
      global.__BIBLE100_PERSISTENCE_MODE__ ||
      readLocalCfg("mode") ||
      "local";
    return {
      mode: mode,
      churchId: getChurchId(),
      supabaseUrl: readMeta("bible100-supabase-url") || global.__SUPABASE_URL__ || readLocalCfg("url") || "",
      supabaseAnonKey: readMeta("bible100-supabase-anon-key") || global.__SUPABASE_ANON_KEY__ || readLocalCfg("anon_key") || "",
      tableName: readMeta("bible100-supabase-kv-table") || readLocalCfg("table") || "church_kv_store"
    };
  }

  var singleton = null;
  global.PersistenceProvider = {
    getInstance: function (cfg) {
      if (!singleton) singleton = new Provider(cfg || buildConfig());
      return singleton;
    },
    configure: function (cfg) {
      var merged = Object.assign({}, buildConfig(), cfg || {});
      saveLocalCfg(merged);
      singleton = new Provider(merged);
      return singleton;
    },
    getConfig: function () {
      var p = singleton || new Provider(buildConfig());
      return Object.assign({}, p.cfg);
    },
    getChurchId: function () {
      var p = singleton || new Provider(buildConfig());
      return String(p.cfg.churchId || "default");
    }
  };
})(typeof window !== "undefined" ? window : this);

