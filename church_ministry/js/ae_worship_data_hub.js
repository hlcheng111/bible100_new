/**
 * W3 · A 敬拜数据枢纽（子页聚合 · 完整性 · 探访／财务草稿）
 */
(function (win) {
  "use strict";

  var SNAPSHOT_KEY = "worship_data_hub_snapshot_v1";
  var VISITATION_KEY = "worship_visitation_drafts_v1";
  var FINANCE_PREFILL_KEY = "worship_finance_prefill_v1";
  var HUB_DATA_KEY = "worshipMinistryData";

  function readJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJson(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  function listMasterMembers() {
    if (win.CentralMemberDB) return win.CentralMemberDB.get().members || [];
    if (win.churchDB && win.churchDB.data) return win.churchDB.data.members || [];
    return [];
  }

  function memberIdsSet() {
    var set = {};
    listMasterMembers().forEach(function (m) {
      if (m.id != null) set[String(m.id)] = true;
      if (m.memberId != null) set[String(m.memberId)] = true;
    });
    return set;
  }

  function collectSnapshot() {
    var team = readJson("worshipTeamData", { members: [], schedules: [], songs: [] });
    var choir = readJson("choir_members", []);
    var flow = readJson("church_ministry_choir_flow_v1", {});
    var attendance = readJson("attendanceRecords", []);
    var intents = readJson("worship_crm_intents_v1", []);
    var aiDrafts = readJson("worship_rehearsal_drafts_v1", []);
    var visitation = readJson(VISITATION_KEY, []);
    var hub = readJson(HUB_DATA_KEY, null);
    var nextPractice = (flow.practices || [])
      .filter(function (p) { return p.date; })
      .sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); })[0] || null;
    var nextPerf = (flow.performances || [])
      .filter(function (p) { return p.date; })
      .sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); })[0] || null;
    var absentToday = attendance.filter(function (r) {
      return r.status === "absent" && r.date === new Date().toISOString().slice(0, 10);
    });
    var snap = {
      at: new Date().toISOString(),
      worshipTeam: {
        members: (team.members || []).length,
        schedules: (team.schedules || []).length,
        linkedMembers: (team.members || []).filter(function (m) { return m.memberId != null; }).length
      },
      choir: { members: choir.length },
      flow: {
        practices: (flow.practices || []).length,
        performances: (flow.performances || []).length,
        nextPractice: nextPractice,
        nextPerformance: nextPerf
      },
      hub: hub ? {
        teams: (hub.teams || []).length,
        services: (hub.services || []).length,
        songs: (hub.songs || []).length
      } : null,
      attendance: {
        total: attendance.length,
        absentToday: absentToday.length
      },
      crm: {
        intents: intents.filter(function (i) { return i.status === "draft"; }).length,
        visitationDrafts: visitation.filter(function (v) { return v.status !== "done"; }).length
      },
      ai: { rehearsalDrafts: aiDrafts.filter(function (d) { return d.status === "pending_review"; }).length }
    };
    writeJson(SNAPSHOT_KEY, snap);
    return snap;
  }

  function validateIntegrity() {
    var issues = [];
    var ids = memberIdsSet();
    var team = readJson("worshipTeamData", { members: [] });
    (team.members || []).forEach(function (m) {
      if (m.memberId != null && !ids[String(m.memberId)]) {
        issues.push("敬拜团成员 " + m.name + " memberId=" + m.memberId + " 无会友主档");
      }
      if (!m.memberId && m.name) {
        issues.push("敬拜团成员 " + m.name + " 未对齐 memberId");
      }
    });
    readJson("choir_members", []).forEach(function (m) {
      if (m.memberId != null && !ids[String(m.memberId)]) {
        issues.push("诗班 " + m.name + " memberId 孤儿");
      }
    });
    return { ok: issues.length === 0, issues: issues, checkedAt: new Date().toISOString() };
  }

  function pullTeamSchedulesToHub() {
    var team = readJson("worshipTeamData", { schedules: [] });
    var hub = readJson(HUB_DATA_KEY, { teams: [], teamMembers: [], services: [], assignments: [], songs: [] });
    if (!hub.services) hub.services = [];
    (team.schedules || []).forEach(function (s, idx) {
      var exists = hub.services.some(function (sv) { return sv.date === s.date && sv.source === "worshipTeamData"; });
      if (!exists && s.date) {
        hub.services.push({
          id: Date.now() + idx,
          date: s.date,
          serviceType: "主日崇拜",
          theme: "敬拜团排班同步",
          status: "pending",
          source: "worshipTeamData",
          meta: { lead: s.lead, keyboard: s.keyboard }
        });
      }
    });
    writeJson(HUB_DATA_KEY, hub);
    if (win.churchDB && win.churchDB.data && win.churchDB.data.worship) {
      win.churchDB.data.worship.services = hub.services;
      win.churchDB.save();
    }
    return hub.services.length;
  }

  function addVisitationDraft(record) {
    var list = readJson(VISITATION_KEY, []);
    var members = listMasterMembers();
    var hit = members.filter(function (m) {
      return m.name === record.memberName || String(m.id) === String(record.memberId);
    })[0];
    list.unshift({
      id: "vd-" + Date.now(),
      memberId: hit ? (hit.memberId || hit.id) : record.memberId,
      memberName: record.memberName || (hit && hit.name) || "未知",
      reason: "崇拜缺席关怀",
      serviceDate: record.date,
      status: "draft",
      note: record.notes || "",
      source: "attendance-management",
      createdAt: new Date().toISOString()
    });
    writeJson(VISITATION_KEY, list.slice(0, 50));
    return list[0];
  }

  function scanAttendanceForVisitation() {
    var attendance = readJson("attendanceRecords", []);
    var added = 0;
    attendance.filter(function (r) { return r.status === "absent"; }).forEach(function (r) {
      var list = readJson(VISITATION_KEY, []);
      var dup = list.some(function (v) {
        return v.memberName === r.memberName && v.serviceDate === r.date;
      });
      if (!dup) {
        addVisitationDraft(r);
        added++;
      }
    });
    return added;
  }

  function parseDate(s) {
    if (!s) return null;
    var d = new Date(String(s).slice(0, 10));
    return isNaN(d.getTime()) ? null : d;
  }

  function weeksBetween(d1, d2) {
    return Math.round(Math.abs(d2 - d1) / (7 * 24 * 60 * 60 * 1000));
  }

  /** W6 · 连续缺席预警（默认 3 周内 ≥3 次 absent） */
  function scanBurnoutSignals(opts) {
    opts = opts || {};
    var minAbsences = opts.minAbsences || 3;
    var windowWeeks = opts.windowWeeks || 4;
    var attendance = readJson("attendanceRecords", []);
    var cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - windowWeeks * 7);
    var byMember = {};
    attendance
      .filter(function (r) {
        return r.status === "absent";
      })
      .forEach(function (r) {
        var d = parseDate(r.date);
        if (!d || d < cutoff) return;
        var key = r.memberName || String(r.memberId || "unknown");
        if (!byMember[key]) byMember[key] = { name: key, dates: [], memberId: r.memberId };
        byMember[key].dates.push(r.date);
      });
    var signals = [];
    Object.keys(byMember).forEach(function (k) {
      var item = byMember[k];
      if (item.dates.length >= minAbsences) {
        signals.push({
          memberName: item.name,
          memberId: item.memberId,
          weeksAbsent: item.dates.length,
          reason: "连续/多次崇拜缺席",
          dates: item.dates.slice(0, 5),
          severity: item.dates.length >= 5 ? "high" : "medium"
        });
      }
    });
    return signals;
  }

  function markVisitationDraftDone(id) {
    var list = readJson(VISITATION_KEY, []);
    var hit = list.filter(function (d) {
      return String(d.id) === String(id);
    })[0];
    if (hit) {
      hit.status = "done";
      hit.doneAt = new Date().toISOString();
      writeJson(VISITATION_KEY, list);
    }
    return hit;
  }

  function financePrefillFromIntent(intent) {
    var prefill = {
      at: new Date().toISOString(),
      category: "敬拜活动交费",
      amount: "",
      memo: (intent && intent.label) || "敬拜活动",
      intentType: intent && intent.type,
      page: intent && intent.page,
      status: "draft"
    };
    writeJson(FINANCE_PREFILL_KEY, prefill);
    return prefill;
  }

  function visitationHubUrl(cmPre) {
    return (cmPre || "../../") + "modules/support/visitation_index.html?crm_from=worship&intent=absence";
  }

  function financeHubUrl(cmPre) {
    return (cmPre || "../../") + "modules/finance/finance-integrated.html?crm_from=worship&intent=activity_fee";
  }

  win.WorshipDataHub = {
    SNAPSHOT_KEY: SNAPSHOT_KEY,
    VISITATION_KEY: VISITATION_KEY,
    FINANCE_PREFILL_KEY: FINANCE_PREFILL_KEY,
    collectSnapshot: collectSnapshot,
    validateIntegrity: validateIntegrity,
    pullTeamSchedulesToHub: pullTeamSchedulesToHub,
    addVisitationDraft: addVisitationDraft,
    scanAttendanceForVisitation: scanAttendanceForVisitation,
    financePrefillFromIntent: financePrefillFromIntent,
    visitationHubUrl: visitationHubUrl,
    financeHubUrl: financeHubUrl,
    readVisitationDrafts: function () { return readJson(VISITATION_KEY, []); },
    readFinancePrefill: function () { return readJson(FINANCE_PREFILL_KEY, null); },
    scanBurnoutSignals: scanBurnoutSignals,
    markVisitationDraftDone: markVisitationDraftDone
  };
})(window);
