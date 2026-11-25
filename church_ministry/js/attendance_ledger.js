/**
 * 出席總帳（AttendanceLedger）· 把「三套出席資料」收成一條主線
 *
 * 主線（唯一正式桶）  bible100_attendance_checkin_v1   ← AttendanceCheckinStore 寫入
 * 派生（自動同步）    group_attendance_v1              ← 小組批量點名時由事件桶同步，供「連續缺席預警」讀
 * 舊桶（只讀＋遷移）  attendanceRecords                ← 舊「主日一桌」寫法；本檔會遷進主線，並繼續鏡射一份（舊報表不斷線）
 * 永久分域            school student.attendance        ← 學校堂課；不混入教會桶，只用 member_id 對齊
 *
 * 規則：
 *  1. 新點名只寫主線（主日一桌經 saveSunday）。
 *  2. 讀（報表、預警、探訪橋）一律問本檔，不直接解析舊桶。
 *  3. 編號只認中央會友的數字 memberId（見 MemberIdBridge.normalizeId）。
 *
 * 讀取不需要 AttendanceCheckinStore；寫入需要（桌面頁面要先載入 attendance_checkin_store.js）。
 * 文檔：docs/ATTENDANCE_GOVERNANCE.md §3
 */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.AttendanceLedger = api;
})(typeof window !== "undefined" ? window : this, function (root) {
  "use strict";

  var EVENT_KEY = "bible100_attendance_checkin_v1";
  var WEEKLY_KEY = "group_attendance_v1";
  var LEGACY_KEY = "attendanceRecords";
  var MIGRATED_KEY = "bible100_attendance_legacy_migrated_v1";

  function ls() {
    try {
      return root.localStorage;
    } catch (e) {
      return null;
    }
  }

  function readJson(key, fallback) {
    var st = ls();
    if (!st) return fallback;
    try {
      var raw = st.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJson(key, val) {
    var st = ls();
    if (st) st.setItem(key, JSON.stringify(val));
  }

  function store() {
    return root.AttendanceCheckinStore || null;
  }

  function eventStore() {
    var s = readJson(EVENT_KEY, null);
    if (!s || typeof s !== "object") s = { events: [], attendance: [] };
    if (!Array.isArray(s.events)) s.events = [];
    if (!Array.isArray(s.attendance)) s.attendance = [];
    return s;
  }

  function normId(raw) {
    var B = root.MemberIdBridge;
    if (B && B.normalizeId) {
      var n = B.normalizeId(raw);
      if (n) return n;
    }
    return String(raw == null ? "" : raw);
  }

  function memberName(id) {
    var key = String(id);
    var list = [];
    if (root.MemberIdBridge && root.MemberIdBridge.listMembers) list = root.MemberIdBridge.listMembers();
    if (!list.length) {
      var ms = readJson("memberSystemData", null);
      list = (ms && ms.members) || [];
    }
    var hit = list.filter(function (m) {
      return String(m.memberId != null ? m.memberId : m.id) === key || String(m.id) === key;
    })[0];
    return hit ? hit.name || hit.chineseName || hit.fullName || "" : "";
  }

  function serviceKey(date, service) {
    return "sunday|" + date + "|" + (service || "");
  }

  function sundayTitle(date, service) {
    return "主日崇拜 · " + date + (service ? " · " + service : "");
  }

  function serviceOfEvent(ev) {
    var k = String(ev.sessionKey || "");
    if (k.indexOf("sunday|") === 0) return k.split("|").slice(2).join("|");
    return "";
  }

  function findSundayEvent(date, service) {
    var key = serviceKey(date, service);
    return (
      eventStore().events.filter(function (e) {
        return e.sessionKey === key;
      })[0] || null
    );
  }

  function marksFromRows(rows) {
    var marks = {};
    rows.forEach(function (a) {
      marks[String(a.memberId)] = a.status === "absent" ? "A" : a.status === "leave" ? "A" : "P";
    });
    return marks;
  }

  /** 舊桶（主日一桌舊寫法）：一場一筆 {date, service, marks, ...} */
  function legacySessions() {
    var list = readJson(LEGACY_KEY, []);
    return Array.isArray(list) ? list.filter(function (r) { return r && r.marks && typeof r.marks === "object"; }) : [];
  }

  function rateOf(present, total) {
    return total ? Math.round((present / total) * 100) : 0;
  }

  /** 鏡射到舊桶（舊報表 worship-reports 等仍讀 attendanceRecords） */
  function mirrorLegacy(rec) {
    var all = readJson(LEGACY_KEY, []);
    if (!Array.isArray(all)) all = [];
    all = all.filter(function (r) {
      return !(r && r.date === rec.date && r.service === rec.service);
    });
    all.push(rec);
    writeJson(LEGACY_KEY, all);
  }

  /**
   * 存一場主日點名。
   * opts: { date, service, marks:{id:'P'|'A'}, memberIds:[…名冊所有人] }
   * 沒標記的人不寫入（算「未點」，不算缺席）。
   */
  function saveSunday(opts) {
    opts = opts || {};
    var S = store();
    if (!S) return { ok: false, error: "no_checkin_store" };
    var date = opts.date;
    var service = opts.service || "";
    var marks = opts.marks || {};
    var ids = (opts.memberIds && opts.memberIds.length ? opts.memberIds : Object.keys(marks)).map(String);
    var ev = S.findOrCreateEvent({
      key: serviceKey(date, service),
      type: "worship",
      date: date,
      title: sundayTitle(date, service),
      location: "大堂"
    });
    var rows = [];
    var present = 0;
    var absent = 0;
    ids.forEach(function (id) {
      var m = marks[id];
      if (m === "P") {
        rows.push({ memberId: normId(id), status: "present" });
        present++;
      } else if (m === "A") {
        rows.push({ memberId: normId(id), status: "absent" });
        absent++;
      }
    });
    var r = S.saveSessionRows(ev.id, rows, { checkinMethod: "sunday_desk", operator: "usher", expected: ids.length });
    if (!r.ok) return r;
    var total = ids.length;
    var rate = rateOf(present, total);
    mirrorLegacy({
      id: Date.now(),
      date: date,
      service: service,
      marks: JSON.parse(JSON.stringify(marks)),
      present: present,
      absent: absent,
      total: total,
      rate: rate,
      eventId: ev.id,
      savedAt: new Date().toISOString()
    });
    return { ok: true, eventId: ev.id, present: present, absent: absent, total: total, rate: rate };
  }

  /** 讀某場主日的點名結果：主線優先，沒有才看舊桶 */
  function loadSunday(date, service) {
    var ev = findSundayEvent(date, service);
    if (ev) {
      var rows = eventStore().attendance.filter(function (a) {
        return String(a.eventId) === String(ev.id);
      });
      return { source: "event", eventId: ev.id, marks: marksFromRows(rows) };
    }
    var hit = legacySessions().filter(function (r) {
      return r.date === date && (r.service || "") === (service || "");
    })[0];
    if (hit) return { source: "legacy", marks: hit.marks };
    return null;
  }

  /** 把舊桶的每一場搬進主線（可重複執行；已搬的不重搬） */
  function migrateLegacy() {
    var S = store();
    if (!S) return { migrated: 0, skipped: 0, reason: "no_checkin_store" };
    var done = readJson(MIGRATED_KEY, {});
    var migrated = 0;
    var skipped = 0;
    legacySessions().forEach(function (r) {
      var k = serviceKey(r.date, r.service || "");
      if (done[k] || findSundayEvent(r.date, r.service || "")) {
        skipped++;
        return;
      }
      var ev = S.findOrCreateEvent({
        key: k,
        type: "worship",
        date: r.date,
        title: sundayTitle(r.date, r.service || ""),
        location: "大堂"
      });
      var rows = Object.keys(r.marks).map(function (id) {
        return { memberId: normId(id), status: r.marks[id] === "P" ? "present" : "absent" };
      });
      S.saveSessionRows(ev.id, rows, { checkinMethod: "legacy_migrate", operator: "migrate", expected: r.total || rows.length });
      done[k] = ev.id;
      migrated++;
    });
    writeJson(MIGRATED_KEY, done);
    return { migrated: migrated, skipped: skipped };
  }

  /** 每場一筆摘要（主線）；opts.type 可限類型（例 "worship"） */
  function sessions(opts) {
    opts = opts || {};
    var es = eventStore();
    var out = es.events
      .filter(function (ev) {
        return !opts.type || ev.type === opts.type;
      })
      .map(function (ev) {
        var rows = es.attendance.filter(function (a) {
          return String(a.eventId) === String(ev.id);
        });
        var present = rows.filter(function (a) {
          return a.status === "present" || a.status === "late";
        }).length;
        var absent = rows.filter(function (a) {
          return a.status === "absent";
        }).length;
        var total = ev.expected > 0 ? ev.expected : present + absent; /* 分母＝應到（名冊）人數；沒記錄就用已點人數 */
        return {
          eventId: ev.id,
          type: ev.type,
          date: ev.date,
          service: serviceOfEvent(ev),
          title: ev.title,
          present: present,
          absent: absent,
          total: total,
          rate: rateOf(present, total),
          source: "event"
        };
      })
      .filter(function (x) {
        return x.total > 0;
      });
    return out.sort(function (a, b) {
      return String(a.date).localeCompare(String(b.date));
    });
  }

  /**
   * 舊式「一人一列」讀法（ae_worship_data_hub 的探訪橋／缺席預警用）。
   * { date, service, memberId, memberName, status:'present'|'absent'|'late' }
   */
  function flatRows(opts) {
    opts = opts || {};
    var es = eventStore();
    var evById = {};
    es.events.forEach(function (ev) {
      evById[String(ev.id)] = ev;
    });
    var out = [];
    es.attendance.forEach(function (a) {
      var ev = evById[String(a.eventId)];
      if (!ev) return;
      if (opts.type && ev.type !== opts.type) return;
      out.push({
        date: ev.date,
        service: serviceOfEvent(ev),
        eventId: ev.id,
        memberId: a.memberId,
        memberName: memberName(a.memberId) || "會友 " + a.memberId,
        status: a.status
      });
    });
    return out;
  }

  /** 「資料何來何去」白話摘要，給頁面顯示用 */
  function summary() {
    var es = eventStore();
    var weekly = readJson(WEEKLY_KEY, { sessions: [] });
    var legacy = legacySessions();
    var done = readJson(MIGRATED_KEY, {});
    var unmigrated = legacy.filter(function (r) {
      return !done[serviceKey(r.date, r.service || "")] && !findSundayEvent(r.date, r.service || "");
    }).length;
    return {
      main: { key: EVENT_KEY, events: es.events.length, rows: es.attendance.length },
      weekly: { key: WEEKLY_KEY, sessions: (weekly.sessions || []).length },
      legacy: { key: LEGACY_KEY, sessions: legacy.length, unmigrated: unmigrated },
      school: { key: "student.attendance", note: "學校堂課，永久分域，只用 member_id 對齊" }
    };
  }

  return {
    EVENT_KEY: EVENT_KEY,
    WEEKLY_KEY: WEEKLY_KEY,
    LEGACY_KEY: LEGACY_KEY,
    serviceKey: serviceKey,
    saveSunday: saveSunday,
    loadSunday: loadSunday,
    migrateLegacy: migrateLegacy,
    sessions: sessions,
    flatRows: flatRows,
    summary: summary
  };
});
