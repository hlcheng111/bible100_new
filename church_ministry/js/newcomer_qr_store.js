/**
 * 新人自助登記 + 身份碼／QR（試用）
 * 鍵：bible100_newcomer_qr_v1
 * 會友寫入 memberSystemData（member_id SSOT）；不另造永久 ID
 */
(function (global) {
  "use strict";

  var STORE_KEY = "bible100_newcomer_qr_v1";
  var SCHEMA = 1;
  var VENUES = [
    { id: "worship", label: "主日崇拜", eventType: "worship" },
    { id: "cell", label: "團契小組", eventType: "cell" },
    { id: "choir", label: "詩班練習", eventType: "choir" }
  ];

  function nowIso() {
    return new Date().toISOString();
  }

  function todayISO() {
    return nowIso().slice(0, 10);
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

  function emptyStore() {
    return {
      schema_version: SCHEMA,
      applications: [],
      issued: [],
      meta: { updatedAt: null }
    };
  }

  function getStore() {
    var s = getJson(STORE_KEY);
    if (!s || typeof s !== "object") s = emptyStore();
    if (!Array.isArray(s.applications)) s.applications = [];
    if (!Array.isArray(s.issued)) s.issued = [];
    return s;
  }

  function saveStore(s) {
    s.meta = s.meta || {};
    s.meta.updatedAt = nowIso();
    setJson(STORE_KEY, s);
    try {
      global.dispatchEvent(new CustomEvent("bible100-newcomer-updated", { detail: getStats() }));
    } catch (eD) {}
    return s;
  }

  function uid(prefix) {
    return (prefix || "nc") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
  }

  function digits(s) {
    return String(s == null ? "" : s).replace(/\D/g, "");
  }

  function makeCheckinCode() {
    var alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var out = "";
    var i;
    for (i = 0; i < 6; i++) {
      out += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return out;
  }

  function payloadFor(memberId, code) {
    return "B100|" + String(memberId) + "|" + String(code);
  }

  function parsePayload(raw) {
    var s = String(raw || "").trim();
    if (!s) return null;
    if (s.indexOf("B100|") === 0) {
      var parts = s.split("|");
      if (parts.length >= 3) {
        return { memberId: parts[1], checkinCode: parts[2], raw: s };
      }
    }
    /* 純短碼 */
    if (/^[A-Z0-9]{4,8}$/i.test(s)) {
      return { memberId: null, checkinCode: s.toUpperCase(), raw: s };
    }
    return null;
  }

  function loadMemberSystem() {
    try {
      if (global.ChurchDataBridge && global.ChurchDataBridge.getMemberSystemData) {
        return global.ChurchDataBridge.getMemberSystemData() || { members: [], groups: [], groupMemberships: [] };
      }
    } catch (e) {}
    return getJson("memberSystemData") || { members: [], groups: [], groupMemberships: [] };
  }

  function saveMemberSystem(ms) {
    if (global.ChurchDataBridge && global.ChurchDataBridge.saveMemberSystemData) {
      try {
        global.ChurchDataBridge.saveMemberSystemData(ms, { skipRbac: true });
        return;
      } catch (eS) {}
    }
    setJson("memberSystemData", ms);
  }

  function nextMemberId(ms) {
    var maxId = 1000;
    (ms.members || []).forEach(function (m) {
      var n = Number(m.id || m.memberId) || 0;
      if (n > maxId) maxId = n;
    });
    return maxId + 1;
  }

  function findMemberByPhone(ms, phone) {
    var d = digits(phone);
    if (!d) return null;
    return (
      (ms.members || []).find(function (m) {
        return digits(m.phone) === d || digits(m.mobile) === d;
      }) || null
    );
  }

  function findMemberById(ms, id) {
    var sid = String(id);
    return (
      (ms.members || []).find(function (m) {
        return String(m.id) === sid || String(m.memberId) === sid;
      }) || null
    );
  }

  function findMemberByCode(code) {
    var c = String(code || "").toUpperCase();
    if (!c) return null;
    var ms = loadMemberSystem();
    return (
      (ms.members || []).find(function (m) {
        return String(m.checkinCode || "").toUpperCase() === c;
      }) || null
    );
  }

  /* 新朋友登記後多少天內要有人主動關心 */
  var FOLLOWUP_DAYS = 3;
  var ORG_KEY = "pastoral_org_v1";

  function addDaysISO(days) {
    var d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  /**
   * 寫入 B 牧養「待辦任務」（pastoral_org_v1.handoverTasks，與 PastoralDataHub 同一份）。
   * 直接寫 localStorage：自助登記頁不一定載入 PastoralDataHub。
   * 同一位會友已有「待處理」的 newcomer_followup 時不重複建立。
   */
  function ensureFollowupTask(memberId, name, days) {
    try {
      var org = null;
      try {
        org = JSON.parse(global.localStorage.getItem(ORG_KEY) || "null");
      } catch (e0) {}
      if (!org || typeof org !== "object") {
        org = { schema_version: 2, leaders: {}, memberMatrix: {}, handoverTasks: [], profiles360: {} };
      }
      if (!Array.isArray(org.handoverTasks)) org.handoverTasks = [];
      var dup = org.handoverTasks.some(function (t) {
        return t.type === "newcomer_followup" && String(t.memberId) === String(memberId) && t.status === "pending";
      });
      if (dup) return { ok: true, created: false };
      org.handoverTasks.unshift({
        id: "ho_nf_" + Date.now() + "_" + String(memberId),
        type: "newcomer_followup",
        status: "pending",
        memberId: memberId,
        memberName: name,
        reason: "新朋友自助登記 · " + days + " 天內主動關心（致電或訊息問候）",
        dueInDays: days,
        dueDate: addDaysISO(days),
        createdAt: nowIso(),
        source: "newcomer_self_register"
      });
      if (org.handoverTasks.length > 200) org.handoverTasks = org.handoverTasks.slice(0, 200);
      global.localStorage.setItem(ORG_KEY, JSON.stringify(org));
      return { ok: true, created: true };
    } catch (e) {
      return { ok: false, error: String(e && e.message || e) };
    }
  }

  /**
   * 手機自助登記（在家）
   */
  function submitSelfRegister(form) {
    form = form || {};
    var name = String(form.name || "").trim();
    var phone = digits(form.phone);
    if (!name || name.length < 2) return { ok: false, error: "請填姓名（至少 2 字）" };
    if (phone.length < 8) return { ok: false, error: "請填有效電話（至少 8 位數字）" };

    var venues = Array.isArray(form.venues) ? form.venues.slice() : [];
    venues = venues.filter(function (v) {
      return VENUES.some(function (x) {
        return x.id === v;
      });
    });
    if (!venues.length) venues = ["worship"];

    var ms = loadMemberSystem();
    if (!ms.members) ms.members = [];

    var existing = findMemberByPhone(ms, phone);
    var memberId;
    var isNewMember = false;
    var existingWasVisitor = !!(existing && (!existing.status || existing.status === "visitor" || existing.status === "pending_newcomer"));

    if (existing) {
      memberId = existing.id != null ? existing.id : existing.memberId;
      existing.name = name;
      existing.fullName = name;
      existing.phone = phone;
      existing.email = form.email || existing.email || "";
      existing.updatedAt = nowIso();
      existing.source = existing.source || "newcomer_self_register";
      if (!existing.status || existing.status === "visitor") {
        existing.status = "pending_newcomer";
      }
      existing.interestedVenues = venues;
    } else {
      isNewMember = true;
      memberId = nextMemberId(ms);
      ms.members.push({
        id: memberId,
        memberId: memberId,
        name: name,
        fullName: name,
        phone: phone,
        email: String(form.email || "").trim(),
        gender: form.gender || "",
        status: "pending_newcomer",
        spiritual_journey_stage: "seeker",
        baptized: false,
        interestedVenues: venues,
        source: "newcomer_self_register",
        membershipDate: todayISO(),
        first_visit_date: todayISO(),
        checkinCode: null,
        createdAt: nowIso(),
        updatedAt: nowIso()
      });
    }
    saveMemberSystem(ms);

    /* 新朋友自助登記 → 自動建立「3 天內關心」任務（同一人只會有一張待辦） */
    if (isNewMember || existingWasVisitor) {
      ensureFollowupTask(memberId, name, FOLLOWUP_DAYS);
    }

    var store = getStore();
    var dup = store.applications.find(function (a) {
      return a.status === "pending" && digits(a.phone) === phone;
    });
    if (dup) {
      dup.name = name;
      dup.venues = venues;
      dup.note = String(form.note || "").trim();
      dup.memberId = memberId;
      dup.updatedAt = nowIso();
      saveStore(store);
      return { ok: true, application: dup, memberId: memberId, reused: true, isNewMember: isNewMember };
    }

    var app = {
      id: uid("app"),
      memberId: memberId,
      name: name,
      phone: phone,
      email: String(form.email || "").trim(),
      venues: venues,
      note: String(form.note || "").trim(),
      status: "pending",
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    store.applications.unshift(app);
    if (store.applications.length > 300) store.applications = store.applications.slice(0, 300);
    saveStore(store);
    return { ok: true, application: app, memberId: memberId, reused: false, isNewMember: isNewMember };
  }

  function listPending() {
    return getStore().applications.filter(function (a) {
      return a.status === "pending";
    });
  }

  function listIssued(limit) {
    var rows = getStore().issued.slice().sort(function (a, b) {
      return String(b.issuedAt || "").localeCompare(String(a.issuedAt || ""));
    });
    return limit ? rows.slice(0, limit) : rows;
  }

  /**
   * 負責人審核並發出身份碼／QR
   */
  function approveAndIssue(appId, opts) {
    opts = opts || {};
    var store = getStore();
    var app = store.applications.find(function (a) {
      return String(a.id) === String(appId);
    });
    if (!app) return { ok: false, error: "找不到申請" };
    if (app.status === "issued" && !opts.reissue) {
      return { ok: false, error: "已發過碼；若要重發請選「重新發碼」" };
    }

    var venues = Array.isArray(opts.venues) && opts.venues.length ? opts.venues : app.venues || ["worship"];
    var code = makeCheckinCode();
    var ms = loadMemberSystem();
    var m = findMemberById(ms, app.memberId);
    if (!m) return { ok: false, error: "會友主檔找不到此人" };

    /* 避免短碼撞車 */
    var guard = 0;
    while (findMemberByCode(code) && guard < 20) {
      code = makeCheckinCode();
      guard += 1;
    }

    var mid = m.id != null ? m.id : m.memberId;
    var payload = payloadFor(mid, code);
    m.checkinCode = code;
    m.qrPayload = payload;
    m.status = "in_communion";
    m.spiritual_journey_stage = m.spiritual_journey_stage || "newcomer";
    m.interestedVenues = venues;
    m.qrIssuedAt = nowIso();
    m.updatedAt = nowIso();
    saveMemberSystem(ms);

    app.status = "issued";
    app.issuedAt = nowIso();
    app.checkinCode = code;
    app.qrPayload = payload;
    app.venues = venues;
    app.updatedAt = nowIso();

    var card = {
      id: uid("qr"),
      applicationId: app.id,
      memberId: mid,
      name: m.name || app.name,
      phone: m.phone || app.phone,
      checkinCode: code,
      qrPayload: payload,
      venues: venues,
      issuedAt: nowIso(),
      issuedBy: opts.operator || "desk"
    };
    store.issued.unshift(card);
    if (store.issued.length > 400) store.issued = store.issued.slice(0, 400);
    saveStore(store);

    ensureVenueEvents(venues);

    return { ok: true, card: card, member: m, application: app };
  }

  function reissueForMember(memberId, opts) {
    opts = opts || {};
    var store = getStore();
    var app = store.applications.find(function (a) {
      return String(a.memberId) === String(memberId);
    });
    if (!app) {
      /* 無申請紀錄：補一筆 */
      var ms = loadMemberSystem();
      var m = findMemberById(ms, memberId);
      if (!m) return { ok: false, error: "找不到會友" };
      app = {
        id: uid("app"),
        memberId: memberId,
        name: m.name,
        phone: m.phone,
        email: m.email || "",
        venues: opts.venues || m.interestedVenues || ["worship"],
        note: "desk_reissue",
        status: "pending",
        createdAt: nowIso(),
        updatedAt: nowIso()
      };
      store.applications.unshift(app);
      saveStore(store);
    }
    app.status = "pending";
    return approveAndIssue(app.id, { venues: opts.venues || app.venues, operator: opts.operator, reissue: true });
  }

  function ensureVenueEvents(venues) {
    var S = global.AttendanceCheckinStore;
    if (!S || !S.createEvent || !S.listEvents) return;
    var d = todayISO();
    var existing = S.listEvents({ date: d }) || [];
    (venues || []).forEach(function (vid) {
      var meta = VENUES.find(function (v) {
        return v.id === vid;
      });
      if (!meta) return;
      var has = existing.some(function (e) {
        return e.type === meta.eventType && e.date === d;
      });
      if (has) return;
      try {
        S.createEvent({
          type: meta.eventType,
          title: meta.label + " · 試用 · " + d,
          date: d,
          startsAt: d + (meta.eventType === "worship" ? "T10:00:00" : meta.eventType === "choir" ? "T14:00:00" : "T19:30:00"),
          location: "試用場"
        });
      } catch (eC) {}
    });
  }

  function resolveCheckinQuery(query) {
    var parsed = parsePayload(query);
    if (parsed && parsed.memberId) {
      var ms = loadMemberSystem();
      var m = findMemberById(ms, parsed.memberId);
      if (m && (!parsed.checkinCode || String(m.checkinCode || "").toUpperCase() === String(parsed.checkinCode).toUpperCase())) {
        return m;
      }
    }
    if (parsed && parsed.checkinCode) {
      return findMemberByCode(parsed.checkinCode);
    }
    return findMemberByCode(String(query || "").trim());
  }

  function getStats() {
    var store = getStore();
    var pending = store.applications.filter(function (a) {
      return a.status === "pending";
    }).length;
    var issued = store.issued.length;
    var today = todayISO();
    var issuedToday = store.issued.filter(function (c) {
      return String(c.issuedAt || "").slice(0, 10) === today;
    }).length;
    var appsToday = store.applications.filter(function (a) {
      return String(a.createdAt || "").slice(0, 10) === today;
    }).length;
    return {
      pending: pending,
      issued: issued,
      issuedToday: issuedToday,
      appsToday: appsToday,
      updatedAt: store.meta && store.meta.updatedAt,
      recentIssued: listIssued(5),
      recentPending: listPending().slice(0, 5)
    };
  }

  function venueLabel(id) {
    var v = VENUES.find(function (x) {
      return x.id === id;
    });
    return v ? v.label : id;
  }

  global.NewcomerQrStore = {
    STORE_KEY: STORE_KEY,
    VENUES: VENUES,
    submitSelfRegister: submitSelfRegister,
    listPending: listPending,
    listIssued: listIssued,
    approveAndIssue: approveAndIssue,
    reissueForMember: reissueForMember,
    parsePayload: parsePayload,
    resolveCheckinQuery: resolveCheckinQuery,
    findMemberByCode: findMemberByCode,
    getStats: getStats,
    venueLabel: venueLabel,
    payloadFor: payloadFor,
    getStore: getStore,
    ensureFollowupTask: ensureFollowupTask,
    FOLLOWUP_DAYS: FOLLOWUP_DAYS
  };
})(typeof window !== "undefined" ? window : this);
