/**
 * AI Lab · 同工常用 Prompt 範本（localStorage · W3）
 */
(function (g) {
  "use strict";

  var KEY = "bible100_ai_prompt_presets";
  var SCHEMA = 1;

  function read() {
    try {
      var raw = g.localStorage.getItem(KEY);
      if (!raw) return { schema_version: SCHEMA, presets: [] };
      var d = JSON.parse(raw);
      if (!d || !Array.isArray(d.presets)) return { schema_version: SCHEMA, presets: [] };
      return d;
    } catch (e) {
      return { schema_version: SCHEMA, presets: [] };
    }
  }

  function write(d) {
    d.schema_version = SCHEMA;
    g.localStorage.setItem(KEY, JSON.stringify(d));
  }

  function list() {
    return read().presets.slice().sort(function (a, b) {
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });
  }

  function save(preset) {
    var d = read();
    var id = preset.id || "preset_" + Date.now();
    var now = Date.now();
    var item = {
      id: id,
      title: String(preset.title || "我的範本").slice(0, 80),
      body: String(preset.body || ""),
      bridge: preset.bridge || null,
      updatedAt: now,
    };
    var idx = -1;
    d.presets.forEach(function (p, i) {
      if (p.id === id) idx = i;
    });
    if (idx >= 0) d.presets[idx] = item;
    else d.presets.unshift(item);
    if (d.presets.length > 40) d.presets = d.presets.slice(0, 40);
    write(d);
    return item;
  }

  function remove(id) {
    var d = read();
    d.presets = d.presets.filter(function (p) {
      return p.id !== id;
    });
    write(d);
  }

  g.AiPromptPresets = { list: list, save: save, remove: remove, KEY: KEY };
})(typeof window !== "undefined" ? window : this);
