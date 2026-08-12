/**
 * D 區外展真鏈 · 本機需求／活動草稿（不上儀表板成熟度％）
 * key: bible100_outreach_desk_v1
 * 交接探訪：sessionStorage bible100_outreach_handoff_v1
 */
(function (global) {
  "use strict";

  var STORE_KEY = "bible100_outreach_desk_v1";
  var HANDOFF_KEY = "bible100_outreach_handoff_v1";

  function nowIso() {
    try {
      return new Date().toISOString();
    } catch (e) {
      return "";
    }
  }

  function load() {
    try {
      var raw = global.localStorage.getItem(STORE_KEY);
      var o = raw ? JSON.parse(raw) : null;
      if (!o || typeof o !== "object") o = { schema_version: 1, items: [] };
      if (!Array.isArray(o.items)) o.items = [];
      o.schema_version = 1;
      return o;
    } catch (e) {
      return { schema_version: 1, items: [] };
    }
  }

  function save(data) {
    data = data || load();
    data.updated_at = nowIso();
    data.schema_version = 1;
    global.localStorage.setItem(STORE_KEY, JSON.stringify(data));
    return data;
  }

  function listItems() {
    return load().items.slice();
  }

  function addItem(partial) {
    var data = load();
    var item = {
      id: "out_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      area: String((partial && partial.area) || "").trim() || "未分區",
      topic: String((partial && partial.topic) || "").trim() || "未命名需求",
      note: String((partial && partial.note) || "").trim(),
      contact: String((partial && partial.contact) || "").trim(),
      status: "open",
      created_at: nowIso()
    };
    data.items.unshift(item);
    save(data);
    return item;
  }

  function updateItemStatus(id, status) {
    var data = load();
    var hit = null;
    data.items.forEach(function (it) {
      if (String(it.id) === String(id)) {
        it.status = status || it.status;
        it.updated_at = nowIso();
        hit = it;
      }
    });
    if (hit) save(data);
    return hit;
  }

  function setHandoff(item) {
    var payload = {
      at: nowIso(),
      source: "outreach-strategy",
      item_id: item && item.id,
      area: item && item.area,
      topic: item && item.topic,
      note: item && item.note,
      contact: item && item.contact,
      summary:
        "【外展 D 真鏈】" +
        (item && item.area ? item.area + " · " : "") +
        (item && item.topic ? item.topic : "") +
        (item && item.contact ? " · 聯絡：" + item.contact : "") +
        (item && item.note ? "\n" + item.note : "")
    };
    try {
      global.sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(payload));
    } catch (e) {}
    return payload;
  }

  function consumeHandoff() {
    try {
      var raw = global.sessionStorage.getItem(HANDOFF_KEY);
      if (!raw) return null;
      global.sessionStorage.removeItem(HANDOFF_KEY);
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function peekHandoff() {
    try {
      var raw = global.sessionStorage.getItem(HANDOFF_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  global.OutreachDeskStore = {
    STORE_KEY: STORE_KEY,
    HANDOFF_KEY: HANDOFF_KEY,
    load: load,
    save: save,
    listItems: listItems,
    addItem: addItem,
    updateItemStatus: updateItemStatus,
    setHandoff: setHandoff,
    consumeHandoff: consumeHandoff,
    peekHandoff: peekHandoff
  };
})(typeof window !== "undefined" ? window : this);
