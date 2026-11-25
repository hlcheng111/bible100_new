/**
 * 中央會友庫 · memberSystemData（父檔 SSOT）
 * 與 churchMasterDatabase 雙向同步 memberId / member_id
 */
(function (win) {
  "use strict";

  var STORAGE_KEY = "memberSystemData";

  function emptyData() {
    return {
      members: [],
      groups: [],
      ministries: [],
      groupMemberships: [],
      ministryAssignments: [],
      trainings: [],
      attendance: [],
      donations: []
    };
  }

  function normalizeMemberId(m) {
    if (!m) return m;
    if (m.id != null && m.memberId == null) m.memberId = m.id;
    if (m.memberId != null && m.member_id == null) {
      m.member_id = /^cm-/.test(String(m.memberId)) ? String(m.memberId) : "cm-" + m.memberId;
    }
    return m;
  }

  function syncToMaster(data) {
    try {
      if (!win.churchDB || !win.churchDB.data) return;
      var master = win.churchDB.data;
      master.members = (data.members || []).map(function (m) {
        var copy = Object.assign({}, m);
        normalizeMemberId(copy);
        return copy;
      });
      win.churchDB.save();
    } catch (e) { /* optional */ }
  }

  function syncFromMaster(data) {
    try {
      if (!win.churchDB || !win.churchDB.data || !win.churchDB.data.members) return data;
      if ((data.members || []).length) return data;
      data.members = win.churchDB.data.members.map(function (m) {
        return normalizeMemberId(Object.assign({}, m));
      });
      return data;
    } catch (e) {
      return data;
    }
  }

  function buildSeedMembers(count) {
    var surnames = ["王", "李", "張", "陳", "林", "黃", "劉", "周", "吳", "鄭"];
    var given = ["弟兄", "姊妹", "信友", "恩友", "義人", "善人", "牧友", "傳友"];
    var out = [];
    for (var i = 1; i <= count; i++) {
      out.push(normalizeMemberId({
        id: i,
        memberId: i,
        name: surnames[i % surnames.length] + given[i % given.length] + i,
        gender: i % 2 ? "男" : "女",
        age: 20 + (i % 50),
        phone: "09" + String(10000000 + i).slice(-8),
        email: "member" + i + "@example.org",
        baptized: i % 3 !== 0,
        membershipDate: "2024-" + String((i % 12) + 1).padStart(2, "0") + "-15",
        status: "active",
        gifts: i % 4 === 0 ? "音樂" : "服事",
        skills: i % 5 === 0 ? "詩班,主領" : ""
      }));
    }
    return out;
  }

  var CentralMemberDB = {
    STORAGE_KEY: STORAGE_KEY,

    get: function () {
      var raw = localStorage.getItem(STORAGE_KEY);
      var data = raw ? JSON.parse(raw) : emptyData();
      if (!data.members) data.members = [];
      data = syncFromMaster(data);
      data.members.forEach(normalizeMemberId);
      return data;
    },

    set: function (data) {
      (data.members || []).forEach(normalizeMemberId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      syncToMaster(data);
      return data;
    },

    getMemberCount: function () {
      return (this.get().members || []).length;
    },

    findById: function (id) {
      var key = String(id);
      return (this.get().members || []).find(function (m) {
        return String(m.id) === key || String(m.memberId) === key;
      }) || null;
    },

    search: function (keyword, limit) {
      var k = String(keyword || "").trim().toLowerCase();
      if (!k) return [];
      var list = this.get().members || [];
      var hits = list.filter(function (m) {
        return (m.name && m.name.toLowerCase().indexOf(k) !== -1) ||
          (m.phone && String(m.phone).indexOf(k) !== -1) ||
          (m.email && m.email.toLowerCase().indexOf(k) !== -1);
      });
      return hits.slice(0, limit || 20);
    },

    loadSeedIfEmpty: function (opts) {
      opts = opts || {};
      var data = this.get();
      var force = !!opts.force;
      if (!force && data.members && data.members.length) {
        return { loaded: false, message: "已有 " + data.members.length + " 筆會友，未覆寫。勾選「強制覆寫」可重載示範。" };
      }
      data.members = buildSeedMembers(220);
      this.set(data);
      return { loaded: true, message: "已載入 220 筆示範會友（memberSystemData）。" };
    },

    loadFromPeopleJson: function (url, cb) {
      var self = this;
      var fetchUrl = url || "../data/people.json";
      if (typeof fetch !== "function") {
        if (cb) cb({ ok: false, message: "file:// 下請用「載入 200+ 筆」；people.json 需 HTTP 服務器。" });
        return;
      }
      fetch(fetchUrl)
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.json();
        })
        .then(function (json) {
          var data = self.get();
          var incoming = json.members || (Array.isArray(json) ? json : []);
          if (!incoming.length) throw new Error("JSON 無 members");
          var nextId = 1;
          data.members = incoming.map(function (m, idx) {
            var id = m.id != null ? m.id : nextId++;
            return normalizeMemberId(Object.assign({}, m, { id: id, memberId: m.memberId != null ? m.memberId : id }));
          });
          self.set(data);
          if (cb) cb({ ok: true, message: "已從 people.json 匯入 " + data.members.length + " 人。" });
        })
        .catch(function (err) {
          if (cb) cb({ ok: false, message: "匯入失敗：" + err.message });
        });
    }
  };

  win.CentralMemberDB = CentralMemberDB;
})(window);
