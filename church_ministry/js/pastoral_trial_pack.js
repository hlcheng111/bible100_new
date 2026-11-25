/**
 * B 牧養 · 試用教會包（~40 人）+ 快速查詢結果
 * 依賴 PastoralDataHub；載入後掛 ensureTrialChurch / queryQuickFilter
 */
(function (global) {
  "use strict";

  var SURNAMES = "陳林黃張李王吳劉蔡楊許鄭謝郭洪曾邱".split("");
  var GIVEN = "恩惠安平信望愛喜樂美善真誠勇智慧忠義".split("");

  function hub() {
    return global.PastoralDataHub;
  }

  function weeksAgoISO(n) {
    var d = new Date();
    d.setDate(d.getDate() - Math.round(n * 7));
    return d.toISOString().slice(0, 10);
  }

  function ensureTrialChurch(force) {
    var H = hub();
    if (!H) return { ok: false, error: "no_hub" };
    force = !!force;
    H.ensurePastoralSeed(force);

    var ms = null;
    try {
      var B = global.ChurchDataBridge;
      ms = B && B.getMemberSystemData ? B.getMemberSystemData() : null;
    } catch (e) {}
    if (!ms) {
      try {
        ms = JSON.parse(global.localStorage.getItem("memberSystemData") || "{}");
      } catch (e2) {
        ms = { members: [], groups: [], groupMemberships: [], attendance: [] };
      }
    }
    if (!ms.members) ms.members = [];
    if (!ms.groups) ms.groups = [];
    if (!ms.groupMemberships) ms.groupMemberships = [];

    var needPeople = force || ms.members.length < 35;
    if (needPeople) {
      var maxId = 0;
      ms.members.forEach(function (m) {
        var n = Number(m.id || m.memberId) || 0;
        if (n > maxId) maxId = n;
      });
      var zones = ["北區", "九龍", "港島", "新界"];
      var genders = ["男", "女"];
      var i;
      for (i = 0; i < 40; i++) {
        var id = maxId + i + 1;
        var name = SURNAMES[i % SURNAMES.length] + GIVEN[i % GIVEN.length] + (i < 10 ? "0" + i : String(i));
        if (ms.members.some(function (m) { return m.name === name; })) continue;
        var isNew = i >= 34;
        var isAtRiskSeed = i >= 28 && i < 34;
        ms.members.push({
          id: id,
          memberId: id,
          name: name,
          fullName: name,
          gender: genders[i % 2],
          age: 18 + (i % 50),
          zone: zones[i % zones.length],
          phone: "09" + String(20000000 + id).slice(-8),
          baptized: !isNew,
          status: "in_communion",
          membershipDate: isNew ? weeksAgoISO(3) : "2023-06-01",
          first_visit_date: isNew ? weeksAgoISO(5) : "2023-01-15",
          spiritual_journey_stage: isNew ? "seeker" : isAtRiskSeed ? "growing" : "serving",
          gifts: i % 3 === 0 ? "服事" : "教導"
        });
      }

      var groupDefs = [
        { id: 101, name: "試用·北區家庭組", leaderIdx: 0, memberIdx: [0, 1, 2, 3, 4, 5, 6, 7, 8, 28] },
        { id: 102, name: "試用·社青組", leaderIdx: 10, memberIdx: [10, 11, 12, 13, 14, 15, 16, 17, 29, 30] },
        { id: 103, name: "試用·長青組", leaderIdx: 18, memberIdx: [18, 19, 20, 21, 22, 23, 31] },
        { id: 104, name: "試用·青年組", leaderIdx: 24, memberIdx: [24, 25, 26, 27, 32, 33] }
      ];
      /* keep existing small groups; add trial groups if missing */
      groupDefs.forEach(function (gd) {
        if (ms.groups.some(function (g) { return Number(g.id) === gd.id; })) return;
        var leader = ms.members[gd.leaderIdx] || ms.members[0];
        ms.groups.push({
          id: gd.id,
          name: gd.name,
          leaderMemberId: leader ? leader.id : null,
          leader: leader ? leader.name : "",
          region: "試用區",
          ageBand: "混合",
          category: "trial",
          meetingDay: "週五 20:00",
          memberCount: gd.memberIdx.length
        });
        gd.memberIdx.forEach(function (mi, j) {
          var m = ms.members[mi];
          if (!m) return;
          var exists = ms.groupMemberships.some(function (gm) {
            return Number(gm.groupId) === gd.id && String(gm.memberId) === String(m.id);
          });
          if (exists) return;
          ms.groupMemberships.push({
            id: "tgm_" + gd.id + "_" + m.id,
            memberId: m.id,
            groupId: gd.id,
            role: j === 0 ? "組長" : "組員"
          });
        });
      });

      /* newcomers 34–39: no group */
      ms.groupMemberships = ms.groupMemberships.filter(function (gm) {
        var m = ms.members.find(function (x) {
          return String(x.id) === String(gm.memberId);
        });
        if (!m) return true;
        var idx = ms.members.indexOf(m);
        return idx < 34;
      });

      if (global.ChurchDataBridge && global.ChurchDataBridge.saveMemberSystemData) {
        try {
          global.ChurchDataBridge.saveMemberSystemData(ms, { skipRbac: true });
        } catch (eS) {
          global.localStorage.setItem("memberSystemData", JSON.stringify(ms));
        }
      } else {
        global.localStorage.setItem("memberSystemData", JSON.stringify(ms));
      }
    }

    /* 6 weeks attendance: mark indices 28–33 absent last 3 weeks */
    seedAbsenceHistory(H, force || needPeople);

    if (H.evaluateLifecycleRules) H.evaluateLifecycleRules();

    /* ensure a few pending handovers with source pastoral */
    seedHandoverExtras(H, force || needPeople);

    /* optional check-in demo events */
    if (global.AttendanceCheckinStore) {
      try {
        if (global.AttendanceCheckinStore.ensureSeedAll) {
          global.AttendanceCheckinStore.ensureSeedAll();
        } else if (global.AttendanceCheckinStore.ensureDemoEvents) {
          global.AttendanceCheckinStore.ensureDemoEvents();
        }
      } catch (eA) {}
    }

    var members = H.getMembers ? H.getMembers().length : 0;
    var groups = H.getGroups ? H.getGroups().length : 0;
    var alerts = H.listAbsenceAlerts ? H.listAbsenceAlerts().length : 0;
    var pending = (H.getOrgStore().handoverTasks || []).filter(function (t) {
      return t.status === "pending";
    }).length;

    try {
      global.localStorage.setItem("bible100_pastoral_trial_meta", JSON.stringify({
        loadedAt: new Date().toISOString(),
        members: members,
        groups: groups,
        alerts: alerts,
        pending: pending
      }));
    } catch (eM) {}

    return { ok: true, members: members, groups: groups, alerts: alerts, pending: pending };
  }

  function seedAbsenceHistory(H, doIt) {
    if (!doIt || !H.recordGroupAttendanceSession || !H.membersInGroup) return;
    var trialGids = [101, 102, 103, 104];
    trialGids.forEach(function (gid) {
      var roster = H.membersInGroup(gid);
      if (!roster.length) return;
      var w;
      for (w = 5; w >= 0; w--) {
        var date = weeksAgoISO(w);
        var records = roster.map(function (m, idx) {
          var mid = m.id != null ? m.id : m.memberId;
          var forceAbsent = idx >= roster.length - 2 && w <= 2;
          return { memberId: mid, status: forceAbsent ? "absent" : "present" };
        });
        H.recordGroupAttendanceSession(gid, date, records);
      }
    });
  }

  function seedHandoverExtras(H, doIt) {
    if (!doIt || !H.addHandoverTask) return;
    var org = H.getOrgStore();
    var pending = (org.handoverTasks || []).filter(function (t) {
      return t.status === "pending";
    });
    if (pending.length >= 3) return;
    var members = H.getMembers() || [];
    var pick = members.slice(-6);
    pick.forEach(function (m, i) {
      var mid = m.id != null ? m.id : m.memberId;
      var exists = (org.handoverTasks || []).some(function (t) {
        return String(t.memberId) === String(mid) && t.status === "pending";
      });
      if (exists) return;
      H.addHandoverTask({
        type: i % 2 === 0 ? "absence_followup" : "newcomer_placement",
        memberId: mid,
        memberName: m.name,
        reason: i % 2 === 0 ? "連續缺席 · 試用示範關懷" : "新朋友滿 4 周尚未落戶小組",
        source: "b_pastoral_trial",
        dueInDays: 2
      });
    });
  }

  function memberGroupLabel(H, memberId) {
    var g = H.getMemberPrimaryGroup ? H.getMemberPrimaryGroup(memberId) : null;
    return g ? g.name : "（未入組）";
  }

  function queryQuickFilter(filter) {
    var H = hub();
    if (!H) return { title: "未載入", rows: [], tab: "groups" };
    if (H.evaluateLifecycleRules) H.evaluateLifecycleRules();
    var rows = [];
    var title = "查詢結果";
    var tab = "groups";
    var members = H.getMembers() || [];

    if (filter === "absence_streak_ge_2" || filter === "absence_2") {
      title = "缺席 ≥ 2 次（連續週）";
      tab = "alerts";
      var life = H.getLifecycleStore ? H.getLifecycleStore() : { members: {} };
      Object.keys(life.members || {}).forEach(function (mid) {
        var row = life.members[mid];
        if (row && Number(row.absenceStreak || 0) >= 2) {
          var m = H.getMemberById(mid);
          rows.push({
            memberId: mid,
            name: m ? m.name : mid,
            detail: "連續缺席 " + row.absenceStreak + " 週 · " + memberGroupLabel(H, mid),
            action: "alerts"
          });
        }
      });
      if (!rows.length) {
        (H.listAbsenceAlerts() || []).forEach(function (a) {
          rows.push({
            memberId: a.memberId,
            name: a.name,
            detail: "連續缺席 " + a.streak + " 週",
            action: "alerts"
          });
        });
      }
    } else if (filter === "lifecycle_at_risk" || filter === "at_risk") {
      title = "流失預警";
      tab = "alerts";
      members.forEach(function (m) {
        var mid = m.id != null ? m.id : m.memberId;
        if (H.getMemberLifecycleStage(mid) === "at_risk") {
          rows.push({
            memberId: mid,
            name: m.name,
            detail: "生命週期＝流失預警 · " + memberGroupLabel(H, mid),
            action: "alerts"
          });
        }
      });
    } else if (filter === "no_group") {
      title = "未入小組";
      tab = "groups";
      members.forEach(function (m) {
        var mid = m.id != null ? m.id : m.memberId;
        var gids = H.getMemberGroupIds ? H.getMemberGroupIds(mid) : [];
        if (!gids || !gids.length) {
          rows.push({
            memberId: mid,
            name: m.name,
            detail: "尚無小組歸屬 · 建議認領入組",
            action: "groups"
          });
        }
      });
    } else if (filter === "lifecycle_newcomer" || filter === "newcomer") {
      title = "新朋友";
      tab = "groups";
      members.forEach(function (m) {
        var mid = m.id != null ? m.id : m.memberId;
        var stage = H.getMemberLifecycleStage(mid);
        if (stage === "newcomer" || m.spiritual_journey_stage === "seeker") {
          rows.push({
            memberId: mid,
            name: m.name,
            detail: "階段：" + (stage || m.spiritual_journey_stage) + " · " + memberGroupLabel(H, mid),
            action: "groups"
          });
        }
      });
    } else if (filter === "handover_pending" || filter === "pending_ho") {
      title = "待推送／待處理探訪";
      tab = "visitation";
      (H.getOrgStore().handoverTasks || [])
        .filter(function (t) {
          return t.status === "pending";
        })
        .forEach(function (t) {
          rows.push({
            memberId: t.memberId,
            name: t.memberName || t.memberId,
            detail: (t.reason || t.type || "") + (t.source ? " · " + t.source : ""),
            action: "visitation",
            taskId: t.id
          });
        });
    }

    return { title: title, rows: rows, tab: tab, filter: filter };
  }

  function attach() {
    var H = hub();
    if (!H) return;
    H.ensureTrialChurch = ensureTrialChurch;
    H.queryQuickFilter = queryQuickFilter;
  }

  attach();
  global.PastoralTrialPack = {
    ensureTrialChurch: ensureTrialChurch,
    queryQuickFilter: queryQuickFilter,
    attach: attach
  };
})(typeof window !== "undefined" ? window : this);
