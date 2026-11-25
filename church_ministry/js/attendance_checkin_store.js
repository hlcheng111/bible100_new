/**
 * 出席點名 · 事件式 SSOT（W0/W1）
 * 鍵：bible100_attendance_checkin_v1
 * 入口 checkinMethod：manual_code | manual_phone | manual_name | leader_batch
 * （W3 再加 scan_* / meeting_qr / offline_sync）
 * 身份：member_id（對齊 PastoralDataHub / memberSystemData）；唔另造永久人員 ID
 */
(function (global) {
  "use strict";

  var STORE_KEY = "bible100_attendance_checkin_v1";
  var SCHEMA = 1;
  var EVENT_TYPES = [
    { id: "worship", label: "主日崇拜" },
    { id: "cell", label: "小組聚會" },
    { id: "fellowship", label: "團契" },
    { id: "choir", label: "詩班／練習" },
    { id: "other", label: "其他" }
  ];

  function nowIso() {
    return new Date().toISOString();
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function getJson(key) {
    try {
      var raw = global.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setJson(key, val) {
    global.localStorage.setItem(key, JSON.stringify(val));
  }

  function hub() {
    return global.PastoralDataHub || null;
  }

  function emptyStore() {
    return { schema_version: SCHEMA, events: [], attendance: [], visitors: [], meta: { updatedAt: null } };
  }

  function getStore() {
    var s = getJson(STORE_KEY);
    if (!s || typeof s !== "object") s = emptyStore();
    if (!Array.isArray(s.events)) s.events = [];
    if (!Array.isArray(s.attendance)) s.attendance = [];
    if (!Array.isArray(s.visitors)) s.visitors = [];
    if (!s.schema_version) s.schema_version = SCHEMA;
    return s;
  }

  function saveStore(s) {
    s.meta = s.meta || {};
    s.meta.updatedAt = nowIso();
    setJson(STORE_KEY, s);
    return s;
  }

  function uid(prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  function digits(s) {
    return String(s == null ? "" : s).replace(/\D/g, "");
  }

  function memberIdOf(m) {
    if (!m) return null;
    if (m.memberId != null && m.memberId !== "") return m.memberId;
    if (m.id != null && m.id !== "") return m.id;
    return null;
  }

  function getMembers() {
    var H = hub();
    if (H && H.getMembers) return H.getMembers() || [];
    var ms = getJson("memberSystemData") || {};
    return ms.members || [];
  }

  function getGroups() {
    var H = hub();
    if (H && H.getGroups) return H.getGroups() || [];
    var ms = getJson("memberSystemData") || {};
    return ms.groups || [];
  }

  function getMemberById(id) {
    var H = hub();
    if (H && H.getMemberById) return H.getMemberById(id);
    var sid = String(id);
    return (
      getMembers().find(function (m) {
        return String(m.id) === sid || String(m.memberId) === sid;
      }) || null
    );
  }

  function membersInGroup(groupId) {
    var H = hub();
    if (H && H.membersInGroup) return H.membersInGroup(groupId);
    var gid = Number(groupId);
    var ms = getJson("memberSystemData") || {};
    var ids = (ms.groupMemberships || [])
      .filter(function (gm) {
        return Number(gm.groupId) === gid;
      })
      .map(function (gm) {
        return gm.memberId;
      });
    return ids.map(getMemberById).filter(Boolean);
  }

  function findMembers(query) {
    var q = String(query || "").trim();
    if (!q) return [];
    var out = [];
    var seen = {};

    function push(m) {
      if (!m) return;
      var mid = String(memberIdOf(m) || "");
      if (!mid || seen[mid]) return;
      seen[mid] = 1;
      out.push(m);
    }

    /* 新人身份碼／QR 載荷 B100|memberId|code */
    try {
      if (global.NewcomerQrStore && global.NewcomerQrStore.resolveCheckinQuery) {
        push(global.NewcomerQrStore.resolveCheckinQuery(q));
      }
    } catch (eN) {}

    var qd = digits(q);
    var qUpper = q.toUpperCase();
    getMembers().forEach(function (m) {
      var mid = String(memberIdOf(m) || "");
      var phone = digits(m.phone || "");
      var name = String(m.name || m.fullName || "");
      var code = String(m.checkinCode || "").toUpperCase();
      var hit =
        mid === q ||
        mid === qd ||
        (code && (code === qUpper || qUpper.indexOf(code) >= 0)) ||
        (qd && phone && (phone === qd || phone.endsWith(qd) || phone.indexOf(qd) >= 0)) ||
        (name && name.indexOf(q) >= 0);
      if (hit) push(m);
    });
    return out.slice(0, 20);
  }

  function expectedRoster(event) {
    if (!event) return [];
    if (event.type === "cell" || event.type === "choir" || event.type === "fellowship") {
      if (event.groupId != null && event.groupId !== "") return membersInGroup(event.groupId);
    }
    return getMembers();
  }

  function listEvents(filter) {
    var events = getStore().events.slice().sort(function (a, b) {
      return String(b.date || "").localeCompare(String(a.date || "")) || String(b.startsAt || "").localeCompare(String(a.startsAt || ""));
    });
    if (!filter) return events;
    return events.filter(function (ev) {
      if (filter.type && ev.type !== filter.type) return false;
      if (filter.status && ev.status !== filter.status) return false;
      if (filter.date && ev.date !== filter.date) return false;
      return true;
    });
  }

  function getEvent(eventId) {
    return (
      getStore().events.find(function (e) {
        return String(e.id) === String(eventId);
      }) || null
    );
  }

  function createEvent(payload) {
    payload = payload || {};
    var type = payload.type || "cell";
    var date = payload.date || todayISO();
    var lateMins = Number(payload.lateAfterMinutes != null ? payload.lateAfterMinutes : 20);
    var startsAt = payload.startsAt || date + "T10:00:00";
    var lateAfter = payload.lateAfter || new Date(new Date(startsAt).getTime() + lateMins * 60000).toISOString();
    var openHours = Number(payload.openHours != null ? payload.openHours : 2);
    var checkinClosesAt =
      payload.checkinClosesAt || new Date(new Date(startsAt).getTime() + openHours * 3600000).toISOString();
    var title = payload.title || typeLabel(type) + " · " + date;
    var ev = {
      id: uid("evt"),
      title: title,
      type: type,
      date: date,
      startsAt: startsAt,
      lateAfter: lateAfter,
      checkinClosesAt: checkinClosesAt,
      groupId: payload.groupId != null && payload.groupId !== "" ? Number(payload.groupId) : null,
      location: payload.location || "",
      status: "draft",
      meetingToken: null,
      createdAt: nowIso()
    };
    var s = getStore();
    s.events.push(ev);
    saveStore(s);
    return ev;
  }

  function typeLabel(type) {
    var t = EVENT_TYPES.find(function (x) {
      return x.id === type;
    });
    return t ? t.label : type;
  }

  function startEvent(eventId) {
    var s = getStore();
    var ev = s.events.find(function (e) {
      return String(e.id) === String(eventId);
    });
    if (!ev) return { ok: false, error: "event_not_found" };
    ev.status = "open";
    ev.startedAt = nowIso();
    if (!ev.checkinClosesAt) {
      ev.checkinClosesAt = new Date(Date.now() + 2 * 3600000).toISOString();
    }
    saveStore(s);
    return { ok: true, event: ev };
  }

  function closeEvent(eventId) {
    var s = getStore();
    var ev = s.events.find(function (e) {
      return String(e.id) === String(eventId);
    });
    if (!ev) return { ok: false, error: "event_not_found" };
    ev.status = "closed";
    ev.closedAt = nowIso();
    saveStore(s);
    return { ok: true, event: ev };
  }

  function findAttendance(eventId, memberId) {
    var s = getStore();
    return (
      s.attendance.find(function (a) {
        return String(a.eventId) === String(eventId) && String(a.memberId) === String(memberId);
      }) || null
    );
  }

  function listAttendance(eventId) {
    return getStore().attendance.filter(function (a) {
      return String(a.eventId) === String(eventId);
    });
  }

  function resolveStatus(event, atIso) {
    var t = new Date(atIso || Date.now()).getTime();
    if (event && event.lateAfter) {
      var late = new Date(event.lateAfter).getTime();
      if (!isNaN(late) && t > late) return "late";
    }
    return "present";
  }

  /**
   * 單一寫入路徑。重複打卡 → ok:true, duplicate:true（唔當 error）
   */
  function checkIn(opts) {
    opts = opts || {};
    var eventId = opts.eventId;
    var memberId = opts.memberId;
    var method = opts.checkinMethod || "manual_code";
    var remark = opts.remark || "";
    var operator = opts.operator || "usher";
    var forceStatus = opts.status || null;

    var ev = getEvent(eventId);
    if (!ev) return { ok: false, error: "event_not_found" };
    if (ev.status === "closed") return { ok: false, error: "event_closed" };

    var member = getMemberById(memberId);
    if (!member) return { ok: false, error: "member_not_found" };
    var mid = memberIdOf(member);

    var existing = findAttendance(eventId, mid);
    if (existing && (existing.status === "present" || existing.status === "late")) {
      return {
        ok: true,
        duplicate: true,
        record: existing,
        message: "已於 " + formatTime(existing.checkedInAt) + " 打卡",
        member: member,
        event: ev
      };
    }

    var at = nowIso();
    var status = forceStatus || resolveStatus(ev, at);
    var rec = {
      eventId: ev.id,
      memberId: mid,
      personKey: "member:" + mid,
      status: status,
      checkinMethod: method,
      checkedInAt: at,
      remark: remark,
      operator: operator
    };

    var s = getStore();
    s.attendance = s.attendance.filter(function (a) {
      return !(String(a.eventId) === String(ev.id) && String(a.memberId) === String(mid));
    });
    s.attendance.push(rec);
    if (s.attendance.length > 5000) s.attendance = s.attendance.slice(-5000);
    saveStore(s);

    return { ok: true, duplicate: false, record: rec, member: member, event: ev, message: status === "late" ? "遲到簽到" : "簽到成功" };
  }

  function formatTime(iso) {
    if (!iso) return "—";
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return String(iso).slice(11, 16) || iso;
      return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    } catch (e) {
      return iso;
    }
  }

  /**
   * 組長批量：一次 transaction 寫入多筆；可同步舊 group_attendance_v1（缺席預警）
   */
  function saveLeaderBatch(eventId, rows, opts) {
    opts = opts || {};
    var ev = getEvent(eventId);
    if (!ev) return { ok: false, error: "event_not_found" };
    if (ev.status === "draft") startEvent(eventId);
    ev = getEvent(eventId);

    var results = [];
    (rows || []).forEach(function (row) {
      var status = row.status || "absent";
      if (status === "present" || status === "late") {
        results.push(
          checkIn({
            eventId: eventId,
            memberId: row.memberId,
            checkinMethod: "leader_batch",
            status: status === "late" ? "late" : null,
            remark: row.remark || "",
            operator: opts.operator || "leader"
          })
        );
      } else {
        var mid = row.memberId;
        var s = getStore();
        s.attendance = s.attendance.filter(function (a) {
          return !(String(a.eventId) === String(eventId) && String(a.memberId) === String(mid));
        });
        s.attendance.push({
          eventId: eventId,
          memberId: mid,
          personKey: "member:" + mid,
          status: status,
          checkinMethod: "leader_batch",
          checkedInAt: nowIso(),
          remark: row.remark || "",
          operator: opts.operator || "leader"
        });
        saveStore(s);
        results.push({ ok: true, duplicate: false, memberId: mid, status: status });
      }
    });

    var synced = null;
    if (opts.syncGroupWeekly !== false && ev.groupId != null && (ev.type === "cell" || ev.type === "fellowship")) {
      synced = syncToGroupWeekly(ev, rows);
    }

    return { ok: true, count: results.length, results: results, groupSync: synced };
  }

  /**
   * 工作桌（主日一桌等）用：以「場次鑰匙」找／建一場，不重複建。
   * spec: { key, type, date, title, location }；同一 key 只會有一場。
   */
  function findOrCreateEvent(spec) {
    spec = spec || {};
    var key = spec.key ? String(spec.key) : "";
    if (key) {
      var hit = getStore().events.find(function (e) {
        return e.sessionKey === key;
      });
      if (hit) return hit;
    }
    var ev = createEvent({
      type: spec.type || "worship",
      date: spec.date,
      title: spec.title,
      location: spec.location || ""
    });
    var s = getStore();
    var mine = s.events.find(function (e) {
      return e.id === ev.id;
    });
    if (mine) {
      if (key) mine.sessionKey = key;
      mine.status = "open";
      mine.startedAt = nowIso();
      saveStore(s);
      return mine;
    }
    return ev;
  }

  /**
   * 工作桌整場覆寫：整場名單一次寫入（含缺席）。
   * 與 checkIn 的差別：不要求人一定在 hub 名單內（名單來自桌面自己的來源），但仍用 memberId 當唯一鍵。
   * 單一寫入路徑仍是本檔（同一個桶 bible100_attendance_checkin_v1）。
   */
  function saveSessionRows(eventId, rows, opts) {
    opts = opts || {};
    var s = getStore();
    var ev = s.events.find(function (e) {
      return String(e.id) === String(eventId);
    });
    if (!ev) return { ok: false, error: "event_not_found" };
    var method = opts.checkinMethod || "desk_roll";
    var at = nowIso();
    if (opts.expected != null && isFinite(Number(opts.expected))) ev.expected = Number(opts.expected); /* 應到人數（名冊大小），算出席率的分母 */
    s.attendance = s.attendance.filter(function (a) {
      return String(a.eventId) !== String(eventId);
    });
    var n = 0;
    (rows || []).forEach(function (r) {
      var st = r.status === "absent" || r.status === "late" || r.status === "leave" ? r.status : "present";
      if (r.status === "unset") return;
      s.attendance.push({
        eventId: ev.id,
        memberId: r.memberId,
        personKey: "member:" + r.memberId,
        status: st,
        checkinMethod: method,
        checkedInAt: at,
        remark: r.remark || "",
        operator: opts.operator || "desk"
      });
      n++;
    });
    if (s.attendance.length > 5000) s.attendance = s.attendance.slice(-5000);
    saveStore(s);
    return { ok: true, count: n, eventId: ev.id };
  }

  function syncToGroupWeekly(ev, rows) {
    var H = hub();
    if (!H || !H.recordGroupAttendanceSession) return { ok: false, reason: "no_hub" };
    var records = (rows || []).map(function (r) {
      var st = r.status || "absent";
      if (st === "late") st = "present";
      if (st !== "present" && st !== "leave" && st !== "absent") st = "absent";
      return { memberId: r.memberId, status: st, note: "from_checkin:" + ev.id };
    });
    try {
      return { ok: true, result: H.recordGroupAttendanceSession(ev.groupId, ev.date || todayISO(), records) };
    } catch (e) {
      return { ok: false, reason: String(e && e.message ? e.message : e) };
    }
  }

  function eventStats(eventId) {
    var ev = getEvent(eventId);
    var rows = listAttendance(eventId);
    var roster = expectedRoster(ev);
    var present = rows.filter(function (a) {
      return a.status === "present" || a.status === "late";
    }).length;
    var late = rows.filter(function (a) {
      return a.status === "late";
    }).length;
    var leave = rows.filter(function (a) {
      return a.status === "leave";
    }).length;
    var expected = roster.length || present;
    var rate = expected ? Math.round((present / expected) * 1000) / 10 : 0;
    return { present: present, late: late, leave: leave, expected: expected, rate: rate, checkedIn: rows.length };
  }

  function ensureDemoEvents() {
    var s = getStore();
    if (s.events.length) return { ok: true, created: 0 };
    var groups = getGroups();
    var gid = groups[0] ? groups[0].id : null;
    var d = todayISO();
    createEvent({ type: "worship", title: "主日崇拜 · " + d, date: d, startsAt: d + "T10:00:00", location: "大堂" });
    if (gid != null) {
      createEvent({
        type: "cell",
        title: "小組聚會 · " + (groups[0].name || gid),
        date: d,
        startsAt: d + "T19:30:00",
        groupId: gid,
        location: "小組"
      });
    }
    return { ok: true, created: gid != null ? 2 : 1 };
  }

  function ensureSeedAll() {
    var H = hub();
    if (H && H.ensurePastoralSeed) {
      try {
        H.ensurePastoralSeed(false);
      } catch (e) {}
    }
    return ensureDemoEvents();
  }

  function exportEventCsv(eventId) {
    var ev = getEvent(eventId);
    var rows = listAttendance(eventId);
    var lines = ["eventId,title,memberId,name,status,checkinMethod,checkedInAt"];
    rows.forEach(function (a) {
      var m = getMemberById(a.memberId);
      var name = m ? m.name || m.fullName || "" : "";
      lines.push(
        [ev ? ev.id : "", ev ? ev.title : "", a.memberId, name, a.status, a.checkinMethod, a.checkedInAt]
          .map(function (x) {
            return '"' + String(x == null ? "" : x).replace(/"/g, '""') + '"';
          })
          .join(",")
      );
    });
    return lines.join("\n");
  }

  global.AttendanceCheckinStore = {
    STORE_KEY: STORE_KEY,
    EVENT_TYPES: EVENT_TYPES,
    getStore: getStore,
    listEvents: listEvents,
    getEvent: getEvent,
    createEvent: createEvent,
    startEvent: startEvent,
    closeEvent: closeEvent,
    checkIn: checkIn,
    saveLeaderBatch: saveLeaderBatch,
    findOrCreateEvent: findOrCreateEvent,
    saveSessionRows: saveSessionRows,
    findMembers: findMembers,
    getMemberById: getMemberById,
    getMembers: getMembers,
    getGroups: getGroups,
    membersInGroup: membersInGroup,
    expectedRoster: expectedRoster,
    listAttendance: listAttendance,
    findAttendance: findAttendance,
    eventStats: eventStats,
    ensureDemoEvents: ensureDemoEvents,
    ensureSeedAll: ensureSeedAll,
    exportEventCsv: exportEventCsv,
    typeLabel: typeLabel,
    formatTime: formatTime,
    todayISO: todayISO,
    memberIdOf: memberIdOf
  };
})(typeof window !== "undefined" ? window : globalThis);
