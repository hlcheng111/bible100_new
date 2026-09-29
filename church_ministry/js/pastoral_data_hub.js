/**
 * B 牧养 · 数据联动 SSOT（小组工作桌 + 出席统计 + memberId 互链）
 * 依赖 ChurchDataBridge（memberSystemData / visitation / pastoral_events）
 */
(function (global) {
  "use strict";

  var WORKSPACE_KEY = "pastoral_small_groups_v1";
  var GROUP_ATTENDANCE_KEY = "group_attendance_v1";
  var LIFECYCLE_KEY = "pastoral_lifecycle_v1";
  var EVENTS_BOARD_KEY = "pastoral_events_board_v1";
  var TRAINING_KEY = "pastoral_training_v1";
  var STRATEGY_KEY = "pastoral_strategy_v1";
  var ORG_KEY = "pastoral_org_v1";
  var DRAFTS_KEY = "worship_visitation_drafts_v1";
  var ABSENCE_ALERT_WEEKS = 3;
  var NEWCOMER_PLACEMENT_WEEKS = 4;
  var BAPTISM_REFERRAL_MONTHS = 6;

  var LIFECYCLE_STAGES = [
    { id: "newcomer", label: "新朋友" },
    { id: "stable", label: "稳定聚会" },
    { id: "growing", label: "领袖培养" },
    { id: "at_risk", label: "流失预警" }
  ];

  var HEALTH_STATUSES = [
    { id: "hot", label: "火热服侍", css: "hot" },
    { id: "stable", label: "平稳", css: "stable" },
    { id: "burnout_risk", label: "耗尽预警", css: "burnout" }
  ];

  var AGE_ZONES = [
    { id: "youth", label: "青少区" },
    { id: "career", label: "职青区" },
    { id: "adult", label: "成人区" },
    { id: "senior", label: "长青区" },
    { id: "family", label: "夫妇/家庭" }
  ];

  var MINISTRY_TAG_OPTS = [
    { id: "worship", label: "敬拜赞美" },
    { id: "usher", label: "大堂招待" },
    { id: "media", label: "新媒体音控" },
    { id: "training", label: "门训在读" },
    { id: "children", label: "儿童事工" }
  ];

  var PAIN_CATEGORIES = ["经济", "情绪", "婚姻", "教养", "职场", "信心", "健康"];
  var ROTA_FREQ_WARN = 2;
  var ROTA_LOOKBACK_WEEKS = 3;
  var FOLLOWUP_CYCLES = ["3日内", "1周内", "2周内", "1个月内", "季度跟进"];
  var SENSITIVITY_LEVELS = [
    { id: "normal", label: "一般" },
    { id: "high", label: "高敏（牧者可见）" }
  ];
  var PRAYER_SIGNAL = { normal: "green", high: "red" };
  var TIMOTHY_MIN_ATTENDANCE = 70;
  var VIEWER_ROLES = ["pastor", "district", "leader", "member", "guest"];
  var PASTORAL_BUNDLE_KEYS = [
    WORKSPACE_KEY,
    GROUP_ATTENDANCE_KEY,
    LIFECYCLE_KEY,
    EVENTS_BOARD_KEY,
    TRAINING_KEY,
    STRATEGY_KEY,
    ORG_KEY,
    DRAFTS_KEY,
    "memberSystemData",
    "pastoral_events_v1"
  ];
  var SPIRITUAL_LADDER = [
    { id: "seeker", label: "慕道/新朋友", courseType: null, order: 0 },
    { id: "foundation", label: "初信造就", courseType: "foundation", order: 1 },
    { id: "disciple", label: "门徒训练", courseType: "disciple", order: 2 },
    { id: "leader", label: "组长预备", courseType: "leader", order: 3 }
  ];
  var ASSESSMENT_RUNS_KEY = "bible100_assessment_runs";
  var ASSESSMENT_LATEST_PREFIX = "bible100_assessment_latest_";

  function bridge() {
    return global.ChurchDataBridge || null;
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

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function isoWeekKey(dateStr) {
    var d = new Date(dateStr || Date.now());
    if (isNaN(d.getTime())) d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    var y = d.getFullYear();
    var jan1 = new Date(y, 0, 1);
    var w = Math.ceil(((d - jan1) / 86400000 + 1) / 7);
    return y + "-W" + String(w).padStart(2, "0");
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function memberSystem() {
    var B = bridge();
    if (B && B.getMemberSystemData) return B.getMemberSystemData();
    return getJson("memberSystemData") || { members: [], groups: [], groupMemberships: [], attendance: [] };
  }

  function saveMemberSystem(ms) {
    var B = bridge();
    if (B && B.saveMemberSystemData) {
      try {
        B.saveMemberSystemData(ms, { skipRbac: true });
        return;
      } catch (e) {}
    }
    setJson("memberSystemData", ms);
  }

  function getWorkspace() {
    var w = getJson(WORKSPACE_KEY);
    if (!w || typeof w !== "object") {
      w = { schema_version: 2, activeGroupId: null, meetings: [], goals: [], checkins: [], notices: [] };
    }
    if (!w.meetings) w.meetings = [];
    if (!w.goals) w.goals = [];
    if (!w.checkins) w.checkins = [];
    if (!w.notices) w.notices = [];
    if (!w.groupPrayerAlerts) w.groupPrayerAlerts = [];
    return w;
  }

  function saveWorkspace(w) {
    setJson(WORKSPACE_KEY, w);
  }

  function migratePastoralStores() {
    var w = getWorkspace();
    if (!w.schema_version || w.schema_version < 2) w.schema_version = 2;
    if (!w.groupPrayerAlerts) w.groupPrayerAlerts = [];
    saveWorkspace(w);

    var ev = getEventsBoard();
    if (!ev.schema_version || ev.schema_version < 2) ev.schema_version = 2;
    (ev.announcements || []).forEach(function (ann) {
      ensureAnnouncementGroupAcks(ann);
    });
    saveEventsBoard(ev);

    var tr = getTrainingStore();
    if (!tr.schema_version || tr.schema_version < 2) tr.schema_version = 2;
    if (!tr.makeupSessions) tr.makeupSessions = [];
    if (!tr.timothyPool) tr.timothyPool = [];
    saveTrainingStore(tr);

    var st = getStrategyStore();
    if (!st.schema_version) st.schema_version = 1;
    saveStrategyStore(st);

    var org = getOrgStore();
    if (!org.schema_version || org.schema_version < 2) org.schema_version = 2;
    saveOrgStore(org);

    return { migratedAt: nowIso(), schema: 2 };
  }

  function getGroupAttendanceStore() {
    var s = getJson(GROUP_ATTENDANCE_KEY);
    if (!s || typeof s !== "object") s = { schema_version: 1, sessions: [] };
    if (!Array.isArray(s.sessions)) s.sessions = [];
    return s;
  }

  function saveGroupAttendanceStore(s) {
    setJson(GROUP_ATTENDANCE_KEY, s);
  }

  function getLifecycleStore() {
    var s = getJson(LIFECYCLE_KEY);
    if (!s || typeof s !== "object") s = { schema_version: 1, members: {} };
    if (!s.members) s.members = {};
    return s;
  }

  function saveLifecycleStore(s) {
    setJson(LIFECYCLE_KEY, s);
  }

  function getMembers() {
    var B = bridge();
    if (B && B.getMembers) return B.getMembers() || [];
    return memberSystem().members || [];
  }

  function getGroups() {
    var B = bridge();
    if (B && B.getGroups) return B.getGroups() || [];
    return memberSystem().groups || [];
  }

  function getMemberById(id) {
    var sid = String(id);
    var members = getMembers();
    return (
      members.find(function (m) {
        return String(m.id) === sid || String(m.memberId) === sid;
      }) || null
    );
  }

  function findMemberIdByName(name) {
    var m = getMembers().find(function (x) {
      return x.name === name;
    });
    return m ? m.id : null;
  }

  function membersInGroup(groupId) {
    var gid = Number(groupId);
    var ms = memberSystem();
    var ids = (ms.groupMemberships || [])
      .filter(function (gm) {
        return Number(gm.groupId) === gid;
      })
      .map(function (gm) {
        return gm.memberId;
      });
    return ids
      .map(function (mid) {
        return getMemberById(mid);
      })
      .filter(Boolean);
  }

  function memberProfileUrl(memberId, tab) {
    tab = tab || "growth";
    var base = "../members/member-integrated.html?crm_from=b_pastoral";
    if (global.AePastoralStoryNav && global.AePastoralStoryNav.memberGrowthUrl) {
      return global.AePastoralStoryNav.memberGrowthUrl("../", memberId);
    }
    if (memberId == null || memberId === "") return base + "#tab=" + tab;
    return base + "#tab=" + tab + "&memberId=" + encodeURIComponent(String(memberId));
  }

  function memberLinkHtml(memberId, label, tab) {
    if (memberId == null || memberId === "") return esc(label || "—");
    return (
      '<a href="' +
      memberProfileUrl(memberId, tab) +
      '" class="pdm-member-link" title="会友主档 · memberId ' +
      esc(memberId) +
      '">' +
      esc(label || "会友") +
      "</a>"
    );
  }

  /** 载入示范：会友 + 小组 + 牧职树 + 工作区目标 */
  function ensurePastoralSeed(force) {
    migratePastoralStores();
    var ms = memberSystem();
    if (!ms.members) ms.members = [];
    if (!ms.groups) ms.groups = [];
    if (!ms.groupMemberships) ms.groupMemberships = [];
    if (!ms.attendance) ms.attendance = [];

    if (force || ms.members.length < 8) {
      var baseId = ms.members.length ? Math.max.apply(null, ms.members.map(function (m) { return Number(m.id) || 0; })) : 0;
      var seedMembers = [
        { name: "陈弟兄", gender: "男", age: 38, zone: "北区", gifts: "教导,治理", baptized: true, status: "in_communion", birthday: "06-12" },
        { name: "李姊妹", gender: "女", age: 32, zone: "九龙", gifts: "服事,怜悯", baptized: true, status: "in_communion", birthday: "06-10" },
        { name: "王长老", gender: "男", age: 62, zone: "北区", gifts: "怜悯,治理", baptized: true, status: "in_communion" },
        { name: "张牧者", gender: "男", age: 45, zone: "全教會", role: "pastor", baptized: true, status: "in_communion" },
        { name: "林区长", gender: "女", age: 40, zone: "北区", role: "district", baptized: true, status: "in_communion" },
        { name: "黄姊妹", gender: "女", age: 28, zone: "九龙", gifts: "服事", baptized: true, status: "in_communion", spiritual_journey_stage: "growing" },
        { name: "赵弟兄", gender: "男", age: 24, zone: "九龙", gifts: "传福音", baptized: true, status: "in_communion", spiritual_journey_stage: "new_believer" },
        { name: "周姊妹", gender: "女", age: 55, zone: "北区", gifts: "怜悯", baptized: true, status: "in_communion" },
        { name: "吴弟兄", gender: "男", age: 30, zone: "港岛", gifts: "教导", baptized: false, status: "in_communion", spiritual_journey_stage: "seeker" },
        { name: "郑姊妹", gender: "女", age: 19, zone: "港岛", gifts: "音乐", baptized: true, status: "in_communion" }
      ];
      seedMembers.forEach(function (sm, i) {
        var id = baseId + i + 1;
        if (ms.members.some(function (m) { return m.name === sm.name; })) return;
        ms.members.push(
          Object.assign(
            {
              id: id,
              memberId: id,
              phone: "09" + String(10000000 + id).slice(-8),
              email: "",
              membershipDate: "2024-01-15",
              first_visit_date: "2023-11-01"
            },
            sm
          )
        );
      });
    }

    if (force || ms.groups.length < 3) {
      var groupDefs = [
        {
          id: 1,
          name: "北区夫妇小组",
          leaderName: "陈弟兄",
          pastor: "张牧者",
          districtLeader: "林区长",
          region: "北区",
          ageBand: "夫妇",
          category: "family",
          location: "北区",
          meetingDay: "周五 20:00",
          memberNames: ["陈弟兄", "周姊妹", "林区长", "黄姊妹"]
        },
        {
          id: 2,
          name: "社青职场圈",
          leaderName: "李姊妹",
          pastor: "张牧者",
          districtLeader: "李姊妹",
          region: "九龙",
          ageBand: "社青",
          category: "workplace",
          location: "九龙",
          meetingDay: "周六 15:00",
          memberNames: ["李姊妹", "赵弟兄", "吴弟兄", "郑姊妹"]
        },
        {
          id: 3,
          name: "长者关怀组",
          leaderName: "王长老",
          pastor: "张牧者",
          districtLeader: "林区长",
          region: "北区",
          ageBand: "长青",
          category: "senior",
          location: "北区",
          meetingDay: "周三 14:00",
          memberNames: ["王长老", "周姊妹", "林区长"]
        }
      ];
      ms.groups = groupDefs.map(function (gd) {
        var lid = findMemberIdByName(gd.leaderName);
        return {
          id: gd.id,
          name: gd.name,
          leaderMemberId: lid,
          leader: gd.leaderName,
          pastor: gd.pastor,
          districtLeader: gd.districtLeader,
          region: gd.region,
          ageBand: gd.ageBand,
          category: gd.category,
          location: gd.location,
          meetingDay: gd.meetingDay,
          memberCount: gd.memberNames.length
        };
      });
      var gmid = 1;
      ms.groupMemberships = [];
      groupDefs.forEach(function (gd) {
        gd.memberNames.forEach(function (nm) {
          var mid = findMemberIdByName(nm);
          if (mid == null) return;
          ms.groupMemberships.push({
            id: gmid++,
            memberId: mid,
            groupId: gd.id,
            role: nm === gd.leaderName ? "组长" : "组员"
          });
        });
      });
    }

    saveMemberSystem(ms);

    var w = getWorkspace();
    if (force || !w.goals.length) {
      w.activeGroupId = 1;
      w.goals = [
        { id: "g1", groupId: 1, title: "本季带出 2 位固定祷告伙伴", period: "2026 Q2", pct: 45, gospelFriends: 1 },
        { id: "g2", groupId: 2, title: "职场弟兄每月一次联合祷告", period: "2026 Q2", pct: 30, gospelFriends: 2 }
      ];
      w.notices = [
        { id: "n1", date: todayISO(), text: "区长通知：下月联合祷告会 6/15 北区堂", level: "info" }
      ];
      var wk = isoWeekKey(todayISO());
      w.meetings = w.meetings.filter(function (m) { return m.weekKey !== wk; });
      w.meetings.push({
        id: "mtg_" + wk + "_1",
        groupId: 1,
        weekKey: wk,
        scripture: "约翰福音 15:1-8 · 常在我里面",
        icebreaker: "分享一件本周微小胜利",
        prayers: ["为久未出席肢体代祷", "为营会报名祷告"]
      });
      saveWorkspace(w);
    }

    seedEventsTrainingStrategy(force);
    seedOrgDepthData(force);

    return { members: ms.members.length, groups: ms.groups.length };
  }

  function getOrgStore() {
    var s = getJson(ORG_KEY);
    if (!s || typeof s !== "object") {
      s = {
        schema_version: 2,
        leaders: {},
        memberMatrix: {},
        handoverTasks: [],
        profiles360: {}
      };
    }
    if (!s.leaders) s.leaders = {};
    if (!s.memberMatrix) s.memberMatrix = {};
    if (!Array.isArray(s.handoverTasks)) s.handoverTasks = [];
    if (!s.profiles360) s.profiles360 = {};
    return s;
  }

  function saveOrgStore(s) {
    setJson(ORG_KEY, s);
  }

  function inferAgeZone(m, grp) {
    var band = grp && grp.ageBand ? String(grp.ageBand) : "";
    if (/青少|少年|青年团/.test(band)) return "youth";
    if (/社青|职青|职场/.test(band)) return "career";
    if (/长青|长者/.test(band)) return "senior";
    if (/夫妇|家庭/.test(band)) return "family";
    if (m && m.age != null) {
      if (m.age < 18) return "youth";
      if (m.age <= 35) return "career";
      if (m.age <= 60) return "adult";
      return "senior";
    }
    return "adult";
  }

  function getMemberMatrix(memberId) {
    var s = getOrgStore();
    var key = String(memberId);
    if (s.memberMatrix[key]) return s.memberMatrix[key];
    var m = getMemberById(memberId);
    var grp = getMemberPrimaryGroup(memberId);
    return {
      spiritualIdentity: getMemberLifecycleStage(memberId) === "newcomer" ? "新朋友" : "稳定组员",
      ageZone: inferAgeZone(m, grp),
      geoZone: (m && m.zone) || (grp && grp.region) || "",
      ministryTags: []
    };
  }

  function setMemberMatrix(memberId, patch) {
    var s = getOrgStore();
    var key = String(memberId);
    var base = getMemberMatrix(memberId);
    s.memberMatrix[key] = Object.assign(base, patch || {});
    saveOrgStore(s);
    return s.memberMatrix[key];
  }

  function getLeaderRecord(memberId) {
    var s = getOrgStore();
    return s.leaders[String(memberId)] || null;
  }

  function setLeaderRecord(memberId, patch) {
    var s = getOrgStore();
    var key = String(memberId);
    var prev = s.leaders[key] || {};
    s.leaders[key] = Object.assign(
      {
        groupId: null,
        role: "group_leader",
        serviceYears: 0,
        lastMentorMeetingDate: null,
        healthStatus: "stable",
        burnoutReason: "",
        mentorMemberId: null
      },
      prev,
      patch || {}
    );
    saveOrgStore(s);
    return s.leaders[key];
  }

  function healthLabel(status) {
    var f = HEALTH_STATUSES.find(function (x) {
      return x.id === status;
    });
    return f ? f.label : status || "—";
  }

  function healthCss(status) {
    var f = HEALTH_STATUSES.find(function (x) {
      return x.id === status;
    });
    return f ? f.css : "stable";
  }

  function weeksSince(dateStr) {
    if (!dateStr) return 0;
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return 0;
    return Math.floor((Date.now() - d.getTime()) / (7 * 86400000));
  }

  function monthsSince(dateStr) {
    if (!dateStr) return 0;
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return 0;
    return Math.floor((Date.now() - d.getTime()) / (30 * 86400000));
  }

  function getOrgTreeEnriched() {
    var tree = getPastoralOrgTree();
    var out = [];
    Object.keys(tree).forEach(function (pastor) {
      var districts = tree[pastor];
      Object.keys(districts).forEach(function (district) {
        districts[district].forEach(function (node) {
          var lid = node.leaderId;
          var lr = lid ? getLeaderRecord(lid) : null;
          var rate = lid ? getMemberAttendanceRate(lid, node.group.id) : null;
          var grpRate = getAttendanceTrend(node.group.id, 4);
          var avgRate =
            grpRate.length > 0
              ? Math.round(grpRate.reduce(function (a, b) { return a + b.rate; }, 0) / grpRate.length)
              : null;
          out.push({
            pastor: pastor,
            district: district,
            group: node.group,
            leaderId: lid,
            leaderName: node.leaderName,
            memberCount: node.memberCount,
            leaderHealth: lr || { healthStatus: "stable" },
            groupAttendanceRate: avgRate
          });
        });
      });
    });
    return out;
  }

  function getLeaderHealthKpis() {
    var nodes = getOrgTreeEnriched();
    var leaders = nodes.filter(function (n) {
      return n.leaderId;
    });
    var hot = 0;
    var burnout = 0;
    var stable = 0;
    leaders.forEach(function (n) {
      var st = (n.leaderHealth && n.leaderHealth.healthStatus) || "stable";
      if (st === "hot") hot += 1;
      else if (st === "burnout_risk") burnout += 1;
      else stable += 1;
    });
    var total = leaders.length || 1;
    var w = getWorkspace();
    var wk = isoWeekKey(todayISO());
    var groups = getGroups();
    var reported = groups.filter(function (g) {
      return w.checkins.some(function (c) {
        return c.weekKey === wk && Number(c.groupId) === Number(g.id);
      });
    }).length;
    return {
      leaderTotal: leaders.length,
      hotCount: hot,
      stableCount: stable,
      burnoutCount: burnout,
      hotPct: Math.round((hot / total) * 100),
      stablePct: Math.round((stable / total) * 100),
      weeklyReportRate: groups.length ? Math.round((reported / groups.length) * 100) : 0
    };
  }

  function getMembersMatrixFiltered(filters) {
    filters = filters || {};
    return getMembers()
      .map(function (m) {
        var mx = getMemberMatrix(m.id);
        var grp = getMemberPrimaryGroup(m.id);
        var ministries = (mx.ministryTags || []).map(function (tid) {
          var t = MINISTRY_TAG_OPTS.find(function (x) {
            return x.id === tid;
          });
          return t ? t.label : tid;
        });
        return {
          member: m,
          matrix: mx,
          group: grp,
          ministryLabels: ministries
        };
      })
      .filter(function (row) {
        if (filters.ageZone && row.matrix.ageZone !== filters.ageZone) return false;
        if (filters.geoZone && row.matrix.geoZone !== filters.geoZone) return false;
        if (filters.ministryTag && (row.matrix.ministryTags || []).indexOf(filters.ministryTag) < 0) return false;
        if (filters.q) {
          var q = String(filters.q).toLowerCase();
          if (String(row.member.name || "").toLowerCase().indexOf(q) < 0) return false;
        }
        return true;
      });
  }

  function addHandoverTask(task) {
    var s = getOrgStore();
    var rec = Object.assign(
      {
        id: "ho_" + Date.now(),
        status: "pending",
        createdAt: nowIso(),
        dueDate: todayISO()
      },
      task
    );
    s.handoverTasks.unshift(rec);
    if (s.handoverTasks.length > 200) s.handoverTasks = s.handoverTasks.slice(0, 200);
    saveOrgStore(s);
    return rec;
  }

  function completeHandoverTask(taskId) {
    var s = getOrgStore();
    var t = s.handoverTasks.find(function (x) {
      return x.id === taskId;
    });
    if (t) t.status = "done";
    saveOrgStore(s);
  }

  function evaluateLifecycleRules() {
    var created = [];
    getMembers().forEach(function (m) {
      var stage = getMemberLifecycleStage(m.id);
      var groups = getMemberGroupIds(m.id);
      var firstVisit = m.first_visit_date || m.firstVisitDate || m.membershipDate;
      var wks = weeksSince(firstVisit);

      if ((stage === "newcomer" || m.spiritual_journey_stage === "seeker") && groups.length === 0 && wks >= NEWCOMER_PLACEMENT_WEEKS) {
        var exists = getOrgStore().handoverTasks.some(function (t) {
          return t.type === "newcomer_placement" && String(t.memberId) === String(m.id) && t.status === "pending";
        });
        if (!exists) {
          created.push(
            addHandoverTask({
              type: "newcomer_placement",
              memberId: m.id,
              memberName: m.name,
              reason: "新朋友满 " + NEWCOMER_PLACEMENT_WEEKS + " 周尚未落户小组",
              dueInDays: 3
            })
          );
        }
      }

      if (stage === "stable" && groups.length > 0 && !m.baptized && monthsSince(m.membershipDate || firstVisit) >= BAPTISM_REFERRAL_MONTHS) {
        var existsB = getOrgStore().handoverTasks.some(function (t) {
          return t.type === "baptism_pool" && String(t.memberId) === String(m.id) && t.status === "pending";
        });
        if (!existsB) {
          created.push(
            addHandoverTask({
              type: "baptism_pool",
              memberId: m.id,
              memberName: m.name,
              reason: "稳定聚会满 " + BAPTISM_REFERRAL_MONTHS + " 个月 · 推介受浸",
              dueInDays: 14
            })
          );
        }
      }

      var streak = (getLifecycleStore().members[String(m.id)] || {}).absenceStreak || 0;
      if (streak >= ABSENCE_ALERT_WEEKS) {
        setMemberLifecycleStage(m.id, "at_risk");
        var existsA = getOrgStore().handoverTasks.some(function (t) {
          return t.type === "absence_followup" && String(t.memberId) === String(m.id) && t.status === "pending";
        });
        if (!existsA) {
          created.push(
            addHandoverTask({
              type: "absence_followup",
              memberId: m.id,
              memberName: m.name,
              reason: "连续 " + streak + " 周缺席 · 流失预警",
              dueInDays: 2
            })
          );
        }
      }
    });
    return created;
  }

  function getLifecyclePools() {
    evaluateLifecycleRules();
    var s = getOrgStore();
    var newcomers = [];
    var stable = [];
    var atRisk = [];
    var pipeline = getLeaderPipeline();
    getMembers().forEach(function (m) {
      var stage = getMemberLifecycleStage(m.id);
      var row = { member: m, stage: stage, matrix: getMemberMatrix(m.id), group: getMemberPrimaryGroup(m.id) };
      if (stage === "newcomer") newcomers.push(row);
      else if (stage === "at_risk") atRisk.push(row);
      else if (stage === "growing") pipeline.push({ memberId: m.id, name: m.name, stage: stage, status: "growing", gifts: m.gifts });
      else stable.push(row);
    });
    var pendingTasks = s.handoverTasks.filter(function (t) {
      return t.status === "pending";
    });
    return { newcomers: newcomers, stable: stable, atRisk: atRisk, leaderPipeline: pipeline, handoverTasks: pendingTasks };
  }

  function assignMemberToGroup(memberId, groupId, leaderMemberId) {
    var ms = memberSystem();
    if (!ms.groupMemberships) ms.groupMemberships = [];
    var exists = ms.groupMemberships.some(function (gm) {
      return String(gm.memberId) === String(memberId) && Number(gm.groupId) === Number(groupId);
    });
    if (!exists) {
      var maxId = ms.groupMemberships.reduce(function (a, gm) {
        return Math.max(a, Number(gm.id) || 0);
      }, 0);
      ms.groupMemberships.push({
        id: maxId + 1,
        memberId: Number(memberId),
        groupId: Number(groupId),
        role: "组员"
      });
      saveMemberSystem(ms);
    }
    setMemberLifecycleStage(memberId, "stable");
    var s = getOrgStore();
    s.handoverTasks.forEach(function (t) {
      if (String(t.memberId) === String(memberId) && t.type === "newcomer_placement" && t.status === "pending") {
        t.status = "done";
        t.completedAt = nowIso();
        t.assignedGroupId = groupId;
      }
    });
    saveOrgStore(s);
    var m = getMemberById(memberId);
    var g = getGroups().find(function (x) {
      return Number(x.id) === Number(groupId);
    });
    safeAppendEvent({
      member_id: memberId,
      event_type: "handover_placement",
      summary: "落户小组 · " + (g ? g.name : groupId) + (leaderMemberId ? " · 组长跟进" : ""),
      source_module: "pastoral_org",
      metadata: { groupId: groupId, leaderMemberId: leaderMemberId }
    });
    return true;
  }

  function safeAppendEvent(payload) {
    var X = global.PastoralCrossModuleBridge;
    if (X && X.safePastoralEvent) return X.safePastoralEvent(payload);
    var B = bridge();
    if (B && B.appendPastoralEvent) {
      try {
        return B.appendPastoralEvent(payload);
      } catch (e) {}
    }
    return null;
  }

  function pushToStrategyDesk(memberId, reason, opts) {
    opts = opts || {};
    var m = getMemberById(memberId);
    var name = m ? m.name : String(memberId);
    var st = getStrategyStore();
    st.visitLogs.unshift({
      id: "vl_strat_" + Date.now(),
      date: todayISO(),
      targetMemberId: memberId,
      targetName: name,
      author: opts.author || "系统自动",
      summary: reason,
      painCategory: opts.painCategory || "",
      sensitivity: opts.sensitivity || "normal",
      followupCycle: opts.followupCycle || "1周内"
    });
    saveStrategyStore(st);
    if (m && (opts.type === "absence_followup" || !opts.skipVisitation)) {
      createVisitationDraft(m, getMemberPrimaryGroup(memberId) && getMemberPrimaryGroup(memberId).id, ABSENCE_ALERT_WEEKS);
    }
    safeAppendEvent({
      member_id: memberId,
      event_type: opts.type || "strategy_escalation",
      summary: reason,
      source_module: "pastoral_org",
      metadata: { pushedTo: "pastoral_strategy_v1" }
    });
    completeHandoverTasksForMember(memberId, opts.taskType || "absence_followup");
    return true;
  }

  function pushLeaderBurnoutToStrategy(leaderMemberId) {
    var lr = getLeaderRecord(leaderMemberId);
    var m = getMemberById(leaderMemberId);
    var reason = "组长耗尽预警 · " + (lr && lr.burnoutReason ? lr.burnoutReason : "需区长导师面谈");
    addHandoverTask({
      type: "leader_care",
      memberId: leaderMemberId,
      memberName: m ? m.name : leaderMemberId,
      reason: reason,
      dueInDays: 1
    });
  }

  function completeHandoverTasksForMember(memberId, type) {
    var s = getOrgStore();
    s.handoverTasks.forEach(function (t) {
      if (String(t.memberId) === String(memberId) && t.status === "pending" && (!type || t.type === type)) {
        t.status = "done";
        t.completedAt = nowIso();
      }
    });
    saveOrgStore(s);
  }

  function getProfile360(memberId) {
    var s = getOrgStore();
    var key = String(memberId);
    var stored = s.profiles360[key] || { visitNotes: [], giftAssessment: null, prayerChain: [], pastorComment: "" };
    var m = getMemberById(memberId);
    var enrollments = getEnrollmentsForMember(memberId);
    var courses = getCourses();
    var trainingPath = enrollments.map(function (e) {
      var c = courses.find(function (x) {
        return x.id === e.courseId;
      });
      return (c ? c.title : e.courseId) + "（" + enrollmentStatusLabel(e.status) + "）";
    });
    var timeline = [];
    if (global.PastoralCrossModuleBridge && global.PastoralCrossModuleBridge.getMemberGrowthTimeline) {
      timeline = global.PastoralCrossModuleBridge.getMemberGrowthTimeline(memberId, 12);
    } else {
      var B = bridge();
      if (B && B.listPastoralEvents) timeline = B.listPastoralEvents(memberId, 12) || [];
    }
    return {
      member: m,
      visitNotes: stored.visitNotes || [],
      giftAssessment: stored.giftAssessment,
      prayerChain: stored.prayerChain || [],
      pastorComment: stored.pastorComment || "",
      trainingPath: trainingPath,
      matrix: getMemberMatrix(memberId),
      group: getMemberPrimaryGroup(memberId),
      lifecycle: getMemberLifecycleStage(memberId),
      timeline: timeline
    };
  }

  function seedOrgDepthData(force) {
    var s = getOrgStore();
    if (!force && Object.keys(s.leaders).length > 3) return;

    var ms = memberSystem();
    if (!ms.members.some(function (m) { return m.name === "甄慕道"; })) {
      var baseId = Math.max.apply(null, ms.members.map(function (m) { return Number(m.id) || 0; }).concat([0])) + 1;
      ms.members.push({
        id: baseId,
        memberId: baseId,
        name: "甄慕道",
        gender: "男",
        age: 27,
        zone: "港岛",
        gifts: "传福音",
        baptized: false,
        status: "in_communion",
        spiritual_journey_stage: "seeker",
        first_visit_date: "2026-05-05",
        membershipDate: "2026-05-05",
        phone: "0912345678"
      });
      saveMemberSystem(ms);
      setMemberLifecycleStage(baseId, "newcomer");
    }

    var chenId = findMemberIdByName("陈弟兄");
    var liId = findMemberIdByName("李姊妹");
    var wangId = findMemberIdByName("王长老");
    var zhenId = findMemberIdByName("甄慕道");
    var zhaoId = findMemberIdByName("赵弟兄");
    var wuId = findMemberIdByName("吴弟兄");
    var linId = findMemberIdByName("林区长");

    if (chenId) {
      setLeaderRecord(chenId, {
        groupId: 1,
        serviceYears: 2.5,
        lastMentorMeetingDate: "2026-06-01",
        healthStatus: "hot",
        mentorMemberId: linId
      });
    }
    if (liId) {
      setLeaderRecord(liId, {
        groupId: 2,
        serviceYears: 1.2,
        lastMentorMeetingDate: "2026-05-20",
        healthStatus: "burnout_risk",
        burnoutReason: "职场加班严重 + 连续主日/小组服侍无替补",
        mentorMemberId: linId
      });
    }
    if (wangId) {
      setLeaderRecord(wangId, { groupId: 3, serviceYears: 5, healthStatus: "stable", lastMentorMeetingDate: "2026-05-28" });
    }

    if (zhaoId) {
      setMemberMatrix(zhaoId, {
        ageZone: "career",
        geoZone: "九龙",
        ministryTags: ["worship", "training"],
        spiritualIdentity: "稳定组员"
      });
    }
    if (wuId) {
      setMemberMatrix(wuId, {
        ageZone: "career",
        geoZone: "港岛",
        ministryTags: ["media", "training"],
        spiritualIdentity: "慕道友"
      });
      setMemberLifecycleStage(wuId, "newcomer");
    }
    if (chenId) {
      setMemberMatrix(chenId, { ageZone: "family", geoZone: "北区", ministryTags: ["children"], spiritualIdentity: "组长" });
    }

    s = getOrgStore();
    if (force || !s.profiles360[String(zhaoId || "")]) {
      if (zhaoId) {
        s.profiles360[String(zhaoId)] = {
          visitNotes: [
            {
              date: "2026-03-12",
              visitor: "林区长",
              painCategory: "职场",
              sensitivity: "high",
              summary: "转职压力大、加班频繁，主日服侍有心无力；已安排弹性代祷，生命状态回升中。"
            }
          ],
          giftAssessment: {
            primary: "教导",
            secondary: "关怀",
            scores: { 教导: 89, 关怀: 82 },
            pastorComment: "具圣经逻辑与同理心，准组长梯队。"
          },
          prayerChain: [
            { date: "2026-05-01", request: "母亲手术", status: "answered", note: "手术顺利，信心坚固" }
          ],
          pastorComment: "提摩太梯队 · 出席稳定"
        };
      }
      saveOrgStore(s);
    }

    evaluateLifecycleRules();
  }

  function seedEventsTrainingStrategy(force) {
    var ev = getEventsBoard();
    if (force || !ev.announcements.length) {
      var zhaoId = findMemberIdByName("赵弟兄");
      var zhengId = findMemberIdByName("郑姊妹");
      var liId = findMemberIdByName("李姊妹");
      ev.schema_version = 2;
      ev.announcements = [
        {
          id: "ann1",
          date: todayISO(),
          title: "全教会联合祷告会",
          body: "6/15 北区堂 19:30 · 各区小组请转发组员并入组祷告",
          level: "church",
          region: "全教會",
          requireRelay: true,
          groupAcks: {
            "1": { status: "prayed", groupName: "北区夫妇小组", relayedAt: "2026-06-08T10:00:00.000Z", prayedAt: "2026-06-08T12:00:00.000Z" },
            "2": { status: "relayed", groupName: "社青职场圈", relayedAt: "2026-06-09T09:00:00.000Z", prayedAt: null },
            "3": { status: "pending", groupName: "长者关怀组", relayedAt: null, prayedAt: null }
          }
        },
        {
          id: "ann2",
          date: todayISO(),
          title: "北区牧区组长例会",
          body: "本周五 10:00 · 林区长主持 · 请确认阅读",
          level: "district",
          region: "北区",
          requireRelay: true,
          groupAcks: {
            "1": { status: "relayed", groupName: "北区夫妇小组", relayedAt: "2026-06-09T08:00:00.000Z" },
            "3": { status: "pending", groupName: "长者关怀组" }
          }
        }
      ];
      ev.registrations = [
        {
          id: "reg1",
          eventTitle: "夏季青年营会 · 小组 PK 报名",
          date: "2026-07-20",
          capacity: 40,
          enrolled: [
            { memberId: zhaoId, name: "赵弟兄", feeStatus: "pending" },
            { memberId: zhengId, name: "郑姊妹", feeStatus: "paid", txnId: "TXN-DEMO-001" }
          ],
          fee: 800,
          status: "open",
          pkMode: true,
          groupEnrollments: {
            "2": { enrolledAt: "2026-06-01T00:00:00.000Z", memberIds: [zhaoId, zhengId].filter(Boolean) }
          }
        }
      ];
      var wk = isoWeekKey(todayISO());
      var liName = "李姊妹";
      var liWarnings = liId
        ? [
            {
              memberId: liId,
              name: liName,
              type: "meeting_clash",
              severity: "warn",
              message: "与小组聚会时间冲突（周六 15:00）"
            },
            {
              memberId: liId,
              name: liName,
              type: "overload",
              severity: "critical",
              message: "近 " + ROTA_LOOKBACK_WEEKS + " 周服侍 3 次（≥" + ROTA_FREQ_WARN + " 爆红）"
            }
          ]
        : [];
      ev.rotas = [
        {
          id: "rot1",
          weekKey: wk,
          slot: "主日招待",
          slotTime: "主日 09:00",
          assignees: ["黄姊妹", "吴弟兄"],
          memberIds: resolveAssigneeMemberIds(["黄姊妹", "吴弟兄"]),
          warnings: []
        },
        {
          id: "rot2",
          weekKey: wk,
          slot: "周六下午敬拜带领",
          slotTime: "周六 15:00",
          assignees: ["李姊妹"],
          memberIds: liId ? [liId] : [],
          warnings: liWarnings
        },
        {
          id: "rot3",
          weekKey: wk,
          slot: "主日音控",
          slotTime: "主日 10:30",
          assignees: ["李姊妹"],
          memberIds: liId ? [liId] : [],
          warnings: liId ? validateServingAssignment([liId], "主日音控", "主日 10:30", wk) : []
        }
      ];
      ev.archives = [
        {
          id: "arc1",
          title: "2025 圣诞布道会",
          year: 2025,
          summary: "北区堂联合布道 · 物资与流程可复用",
          tags: ["布道", "节期"],
          vision: "以圣诞市集接触社区家庭，带出 30+ 首次来访者",
          budgetPlanned: 12000,
          budgetActual: 11500,
          vendors: [
            { name: "恩典印刷", item: "邀请卡 500 份", cost: 800 },
            { name: "北区堂务", item: "茶点物资", cost: 2200 }
          ],
          materials: ["流程表 v3", "志愿者岗位卡", "音响检查清单"],
          lessonsLearned: "招待动线需提前 30 分钟彩排；儿童区人手比预估多 2 人"
        }
      ];
      saveEventsBoard(ev);
    }

    var tr = getTrainingStore();
    if (force || !tr.courses.length) {
      tr.courses = [
        { id: "c1", title: "初信造就班", schedule: "周二 19:30", type: "foundation", instructor: "张牧者" },
        { id: "c2", title: "门徒训练一", schedule: "周四 20:00", type: "disciple", instructor: "王长老" },
        { id: "c3", title: "组长预备班", schedule: "每月首周六 09:00", type: "leader", instructor: "林区长" }
      ];
      tr.enrollments = [];
      tr.resources = [
        { id: "r1", courseId: "c1", title: "初信造就 · 第一课 PPT", type: "slides" },
        { id: "r2", courseId: "c2", title: "门徒训练录音 2026-05", type: "audio" }
      ];
      var enrollPairs = [
        ["赵弟兄", "c1", "in_progress"],
        ["黄姊妹", "c2", "completed"],
        ["陈弟兄", "c3", "in_progress"],
        ["李姊妹", "c3", "completed"]
      ];
      enrollPairs.forEach(function (row, i) {
        var mid = findMemberIdByName(row[0]);
        if (mid == null) return;
        tr.enrollments.push({ id: "enr_" + i, memberId: mid, courseId: row[1], status: row[2] });
      });
      tr.schema_version = 2;
      tr.makeupSessions = [
        {
          id: "mk1",
          memberId: findMemberIdByName("赵弟兄"),
          courseId: "c1",
          missedDate: "2026-06-01",
          makeupDate: "2026-06-08",
          status: "scheduled",
          note: "与小组冲突，改补课"
        }
      ];
      var zhaoId = findMemberIdByName("赵弟兄");
      tr.timothyPool = zhaoId
        ? [{ memberId: zhaoId, addedAt: "2026-05-20T00:00:00.000Z", note: "出席稳定 · 初信班正修", score: 82 }]
        : [];
      saveTrainingStore(tr);
    }

    var st = getStrategyStore();
    if (force || !st.visitLogs.length) {
      st.visitLogs = [
        {
          id: "vl1",
          date: todayISO(),
          targetMemberId: findMemberIdByName("陈弟兄"),
          targetName: "陈弟兄",
          author: "张牧者",
          summary: "组长牧养面谈 · 本季倍增目标跟进",
          painCategory: "职场",
          sensitivity: "normal",
          followupCycle: "1周内"
        },
        {
          id: "vl2",
          date: todayISO(),
          targetMemberId: findMemberIdByName("黄姊妹"),
          targetName: "黄姊妹",
          author: "林区长",
          summary: "婚姻沟通张力 · 已安排夫妇辅导资源，需保密跟进",
          painCategory: "婚姻",
          sensitivity: "high",
          followupCycle: "3日内"
        }
      ];
      st.proposals = [
        {
          id: "pr1",
          title: "九龙区新职场小组开拓",
          author: "李姊妹",
          status: "discussion",
          body: "社青职场圈已有基础，建议 Q3 分堂试点",
          budget: 6000,
          manpower: 3,
          expectedReach: 24
        }
      ];
      st.prayerItems = [
        {
          id: "pw1",
          date: todayISO(),
          request: "为连续缺席肢体代祷 · 请组长本周入组祷告",
          urgency: "high",
          groupId: 1,
          pushedToGroups: false
        },
        {
          id: "pw2",
          date: todayISO(),
          request: "为营会义工招募祷告",
          urgency: "normal",
          groupId: null
        }
      ];
      saveStrategyStore(st);
      pushPrayerToWorkspace("pw1");
    }
  }

  function setActiveGroup(groupId) {
    var w = getWorkspace();
    w.activeGroupId = groupId != null ? Number(groupId) : null;
    saveWorkspace(w);
  }

  function getActiveGroup() {
    var w = getWorkspace();
    var gid = w.activeGroupId != null ? w.activeGroupId : (getGroups()[0] && getGroups()[0].id);
    if (gid == null) return null;
    return getGroups().find(function (g) {
      return Number(g.id) === Number(gid);
    }) || null;
  }

  function getMeetingForWeek(groupId, weekKey) {
    weekKey = weekKey || isoWeekKey(todayISO());
    var w = getWorkspace();
    return (
      w.meetings.find(function (m) {
        return Number(m.groupId) === Number(groupId) && m.weekKey === weekKey;
      }) || null
    );
  }

  function saveWeeklyMeeting(groupId, payload) {
    var w = getWorkspace();
    var wk = payload.weekKey || isoWeekKey(todayISO());
    var existing = getMeetingForWeek(groupId, wk);
    var rec = Object.assign(
      {
        id: existing ? existing.id : "mtg_" + wk + "_" + groupId,
        groupId: Number(groupId),
        weekKey: wk,
        scripture: "",
        icebreaker: "",
        prayers: []
      },
      existing || {},
      payload
    );
    if (typeof rec.prayers === "string") {
      rec.prayers = rec.prayers.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
    }
    w.meetings = w.meetings.filter(function (m) {
      return !(Number(m.groupId) === Number(groupId) && m.weekKey === wk);
    });
    w.meetings.push(rec);
    saveWorkspace(w);
    return rec;
  }

  function recordGroupAttendanceSession(groupId, date, records) {
    date = date || todayISO();
    var wk = isoWeekKey(date);
    var store = getGroupAttendanceStore();
    var sessionId = "sess_" + groupId + "_" + wk;
    store.sessions = store.sessions.filter(function (s) {
      return s.session_id !== sessionId;
    });
    var session = {
      session_id: sessionId,
      groupId: Number(groupId),
      date: date,
      weekKey: wk,
      records: records || [],
      savedAt: new Date().toISOString()
    };
    store.sessions.push(session);
    if (store.sessions.length > 500) store.sessions = store.sessions.slice(-500);
    saveGroupAttendanceStore(store);

    var ms = memberSystem();
    if (!ms.attendance) ms.attendance = [];
    records.forEach(function (r) {
      var mid = r.memberId;
      var present = r.status === "present";
      ms.attendance.push({
        id: Date.now() + Math.random(),
        memberId: mid,
        date: date,
        present: present,
        context: "group:" + groupId,
        groupId: Number(groupId),
        source: GROUP_ATTENDANCE_KEY,
        note: r.note || ""
      });
    });
    saveMemberSystem(ms);

    var alerts = processAbsenceAlerts(groupId);
    return { session: session, alerts: alerts };
  }

  function getSessionsForGroup(groupId, limit) {
    var store = getGroupAttendanceStore();
    var out = store.sessions
      .filter(function (s) {
        return Number(s.groupId) === Number(groupId);
      })
      .sort(function (a, b) {
        return String(b.date || "").localeCompare(String(a.date || ""));
      });
    limit = Number(limit || 0);
    if (limit > 0) out = out.slice(0, limit);
    return out;
  }

  function consecutiveAbsenceWeeks(memberId, groupId) {
    var sessions = getSessionsForGroup(groupId, 12).sort(function (a, b) {
      return String(a.date || "").localeCompare(String(b.date || ""));
    });
    var streak = 0;
    for (var i = sessions.length - 1; i >= 0; i--) {
      var sess = sessions[i];
      var rec = (sess.records || []).find(function (r) {
        return String(r.memberId) === String(memberId);
      });
      if (!rec) continue;
      if (rec.status === "absent") streak += 1;
      else break;
    }
    return streak;
  }

  function processAbsenceAlerts(groupId) {
    var created = [];
    var members = membersInGroup(groupId);
    members.forEach(function (m) {
      var streak = consecutiveAbsenceWeeks(m.id, groupId);
      var life = getLifecycleStore();
      var key = String(m.id);
      if (!life.members[key]) life.members[key] = { stage: "stable", absenceStreak: 0, lastAlertWeek: null };
      life.members[key].absenceStreak = streak;
      if (streak >= ABSENCE_ALERT_WEEKS) {
        life.members[key].stage = "at_risk";
        var wk = isoWeekKey(todayISO());
        if (life.members[key].lastAlertWeek !== wk) {
          life.members[key].lastAlertWeek = wk;
          createVisitationDraft(m, groupId, streak);
          created.push({ memberId: m.id, name: m.name, streak: streak });
        }
      } else if (streak === 0 && life.members[key].stage === "at_risk") {
        life.members[key].stage = "stable";
      }
      saveLifecycleStore(life);
    });
    return created;
  }

  function createVisitationDraft(member, groupId, streak) {
    var name = member.name || "会友";
    var mid = member.id;
    var reason = "连续 " + streak + " 周小组缺席（自动预警）";

    try {
      var drafts = getJson(DRAFTS_KEY) || [];
      if (!Array.isArray(drafts)) drafts = [];
      drafts.push({
        id: "abs_" + mid + "_" + Date.now(),
        memberId: mid,
        memberName: name,
        reason: reason,
        note: "小组 groupId=" + groupId + " · 请牧者／组长人工决定是否探访",
        serviceDate: todayISO(),
        status: "pending",
        source: "group_attendance_alert",
        createdAt: new Date().toISOString()
      });
      setJson(DRAFTS_KEY, drafts);
    } catch (eD) {}

    var B = bridge();
    if (B && B.getVisitationData && B.saveVisitationData) {
      try {
        var vis = B.getVisitationData();
        if (!vis.missions) vis.missions = [];
        var exists = vis.missions.some(function (mission) {
          return (
            String(mission.targetMemberId) === String(mid) &&
            mission.status === "pending" &&
            mission.origin === "group_absence"
          );
        });
        if (!exists) {
          vis.missions.push({
            id: "mission_abs_" + mid + "_" + Date.now(),
            name: name + " · 小组缺席跟进",
            target: name,
            targetMemberId: mid,
            type: "关怀",
            origin: "group_absence",
            status: "pending",
            date: todayISO(),
            team: "",
            notes: reason
          });
          B.saveVisitationData(vis);
        }
      } catch (eV) {}
    }

    if (B && B.savePastoralFollowup) {
      try {
        B.savePastoralFollowup({
          member_id: mid,
          member_name: name,
          reason: reason,
          priority: "high",
          status: "pending",
          source: "group_attendance_v1",
          note: "联动规则：连续缺席 ≥ " + ABSENCE_ALERT_WEEKS + " 周"
        });
      } catch (eF) {}
    }

    if (B && B.appendPastoralEvent) {
      try {
        B.appendPastoralEvent({
          member_id: mid,
          event_type: "absence_alert",
          summary: reason,
          source_module: "pastoral_data_hub",
          metadata: { groupId: groupId, streak: streak }
        });
      } catch (eP) {}
    }
  }

  function listAbsenceAlerts() {
    var store = getLifecycleStore();
    var alerts = [];
    Object.keys(store.members || {}).forEach(function (mid) {
      var row = store.members[mid];
      if (row && row.absenceStreak >= ABSENCE_ALERT_WEEKS) {
        var m = getMemberById(mid);
        alerts.push({
          memberId: mid,
          name: m ? m.name : mid,
          streak: row.absenceStreak,
          stage: row.stage
        });
      }
    });
    return alerts;
  }

  function getAttendanceTrend(groupId, weeks) {
    weeks = Number(weeks || 8);
    var sessions = getSessionsForGroup(groupId, weeks).reverse();
    return sessions.map(function (sess) {
      var total = (sess.records || []).length;
      var present = (sess.records || []).filter(function (r) {
        return r.status === "present";
      }).length;
      return {
        weekKey: sess.weekKey,
        date: sess.date,
        rate: total > 0 ? Math.round((present / total) * 100) : 0,
        present: present,
        total: total
      };
    });
  }

  function getDashboardForGroup(groupId) {
    var g = getGroups().find(function (x) {
      return Number(x.id) === Number(groupId);
    });
    var roster = membersInGroup(groupId);
    var w = getWorkspace();
    var wk = isoWeekKey(todayISO());
    var birthdays = roster.filter(function (m) {
      if (!m.birthday) return false;
      var parts = String(m.birthday).split("-");
      if (parts.length < 2) return false;
      var now = new Date();
      return String(now.getMonth() + 1).padStart(2, "0") === parts[0].padStart(2, "0") &&
        String(now.getDate()).padStart(2, "0") === parts[1].padStart(2, "0");
    });
    var checkinPending = !w.checkins.some(function (c) {
      return c.weekKey === wk && Number(c.groupId) === Number(groupId);
    });
    var alerts = listAbsenceAlerts().filter(function (a) {
      return roster.some(function (m) {
        return String(m.id) === String(a.memberId);
      });
    });
    return {
      group: g,
      rosterCount: roster.length,
      goals: w.goals.filter(function (goal) {
        return Number(goal.groupId) === Number(groupId);
      }),
      birthdays: birthdays,
      checkinPending: checkinPending,
      absenceAlerts: alerts,
      meeting: getMeetingForWeek(groupId, wk),
      prayerAlerts: getPrayerAlertsForGroup(groupId),
      pendingAnnouncementRelays: getPendingRelaysForGroup(groupId)
    };
  }

  function saveCheckin(groupId, note, needVisit, absentMemberIds) {
    var w = getWorkspace();
    var wk = isoWeekKey(todayISO());
    w.checkins.push({
      id: "chk_" + Date.now(),
      groupId: Number(groupId),
      weekKey: wk,
      date: todayISO(),
      note: note || "",
      needVisit: !!needVisit,
      absentMemberIds: absentMemberIds || []
    });
    saveWorkspace(w);
    if (needVisit && note && note.trim()) {
      try {
        var drafts = getJson(DRAFTS_KEY) || [];
        drafts.push({
          id: "sg_" + Date.now(),
          memberName: "小组快评待指派",
          reason: "小组一周快评",
          note: note.trim(),
          serviceDate: todayISO(),
          status: "pending",
          source: "small_groups_checkin",
          createdAt: new Date().toISOString()
        });
        setJson(DRAFTS_KEY, drafts);
      } catch (e) {}
    }
    (absentMemberIds || []).forEach(function (mid) {
      var m = getMemberById(mid);
      if (m) createVisitationDraft(m, groupId, consecutiveAbsenceWeeks(mid, groupId) || 1);
    });
  }

  function getEventsBoard() {
    var s = getJson(EVENTS_BOARD_KEY);
    if (!s || typeof s !== "object") {
      s = { schema_version: 2, announcements: [], registrations: [], rotas: [], archives: [] };
    }
    if (!s.schema_version || s.schema_version < 2) s.schema_version = 2;
    ["announcements", "registrations", "rotas", "archives"].forEach(function (k) {
      if (!Array.isArray(s[k])) s[k] = [];
    });
    s.announcements.forEach(function (ann) {
      ensureAnnouncementGroupAcks(ann);
    });
    return s;
  }

  function saveEventsBoard(s) {
    setJson(EVENTS_BOARD_KEY, s);
  }

  function ensureAnnouncementGroupAcks(ann) {
    if (!ann.groupAcks) ann.groupAcks = {};
    getGroups().forEach(function (g) {
      var key = String(g.id);
      if (!ann.groupAcks[key]) {
        ann.groupAcks[key] = {
          status: "pending",
          groupName: g.name,
          leaderMemberId: g.leaderMemberId || null,
          relayedAt: null,
          prayedAt: null
        };
      }
    });
    return ann;
  }

  function addAnnouncement(payload) {
    var s = getEventsBoard();
    var rec = Object.assign(
      { id: "ann_" + Date.now(), date: todayISO(), level: "info", region: "", requireRelay: true },
      payload
    );
    ensureAnnouncementGroupAcks(rec);
    s.announcements.unshift(rec);
    saveEventsBoard(s);
    var w = getWorkspace();
    w.notices.unshift({ id: "n_" + Date.now(), date: todayISO(), text: payload.title || "", level: payload.level || "info" });
    if (w.notices.length > 30) w.notices = w.notices.slice(0, 30);
    saveWorkspace(w);
    return rec;
  }

  function getAnnouncementRelayStats(annId) {
    var s = getEventsBoard();
    var ann = s.announcements.find(function (a) {
      return a.id === annId;
    });
    if (!ann) return null;
    ensureAnnouncementGroupAcks(ann);
    var groups = getGroups();
    var relayed = 0;
    var prayed = 0;
    var pending = 0;
    var zeroResponse = [];
    groups.forEach(function (g) {
      var ack = ann.groupAcks[String(g.id)] || { status: "pending" };
      if (ack.status === "prayed") prayed += 1;
      else if (ack.status === "relayed") relayed += 1;
      else {
        pending += 1;
        zeroResponse.push({ groupId: g.id, groupName: g.name, leaderMemberId: g.leaderMemberId });
      }
    });
    var total = groups.length || 1;
    return {
      annId: annId,
      title: ann.title,
      total: groups.length,
      relayed: relayed,
      prayed: prayed,
      pending: pending,
      zeroResponse: zeroResponse,
      relayRate: Math.round(((relayed + prayed) / total) * 100),
      prayRate: Math.round((prayed / total) * 100)
    };
  }

  function confirmAnnouncementRelay(annId, groupId, status, leaderMemberId) {
    var s = getEventsBoard();
    var ann = s.announcements.find(function (a) {
      return a.id === annId;
    });
    if (!ann) return null;
    ensureAnnouncementGroupAcks(ann);
    var key = String(groupId);
    if (!ann.groupAcks[key]) ann.groupAcks[key] = { status: "pending" };
    ann.groupAcks[key].status = status === "prayed" ? "prayed" : "relayed";
    ann.groupAcks[key].leaderMemberId = leaderMemberId || ann.groupAcks[key].leaderMemberId;
    var ts = nowIso();
    if (status === "prayed") ann.groupAcks[key].prayedAt = ts;
    else ann.groupAcks[key].relayedAt = ts;
    saveEventsBoard(s);
    return ann.groupAcks[key];
  }

  function getPendingRelaysForGroup(groupId) {
    var gid = String(groupId);
    return getEventsBoard().announcements
      .filter(function (ann) {
        if (ann.requireRelay === false) return false;
        ensureAnnouncementGroupAcks(ann);
        var ack = ann.groupAcks[gid];
        return !ack || ack.status === "pending";
      })
      .map(function (ann) {
        return { annId: ann.id, title: ann.title, date: ann.date, level: ann.level };
      });
  }

  function getRegistrationLeaderboard(regId) {
    var s = getEventsBoard();
    var reg = s.registrations.find(function (r) {
      return r.id === regId;
    });
    if (!reg) return [];
    var enrolledIds = (reg.enrolled || []).map(function (e) {
      return String(e.memberId);
    });
    return getGroups()
      .map(function (g) {
        var roster = membersInGroup(g.id);
        var enrolled = roster.filter(function (m) {
          return enrolledIds.indexOf(String(m.id)) >= 0;
        }).length;
        var rate = roster.length ? Math.round((enrolled / roster.length) * 100) : 0;
        return {
          groupId: g.id,
          groupName: g.name,
          leaderName: g.leader || "—",
          rosterCount: roster.length,
          enrolledCount: enrolled,
          rate: rate
        };
      })
      .sort(function (a, b) {
        return b.rate - a.rate || b.enrolledCount - a.enrolledCount;
      });
  }

  function enrollGroupForEvent(regId, groupId) {
    var roster = membersInGroup(groupId);
    roster.forEach(function (m) {
      enrollMemberForEvent(regId, m.id);
    });
    var s = getEventsBoard();
    var reg = s.registrations.find(function (r) {
      return r.id === regId;
    });
    if (reg) {
      if (!reg.groupEnrollments) reg.groupEnrollments = {};
      reg.groupEnrollments[String(groupId)] = {
        enrolledAt: nowIso(),
        memberIds: roster.map(function (m) {
          return m.id;
        })
      };
      saveEventsBoard(s);
    }
    return reg;
  }

  function resolveAssigneeMemberIds(assignees) {
    return (assignees || [])
      .map(function (nameOrId) {
        if (nameOrId == null) return null;
        if (typeof nameOrId === "number" || /^\d+$/.test(String(nameOrId))) {
          return getMemberById(nameOrId) ? Number(nameOrId) : null;
        }
        return findMemberIdByName(String(nameOrId).trim());
      })
      .filter(function (x) {
        return x != null;
      });
  }

  function parseWeekKeyNum(wk) {
    var m = /^(\d+)-W(\d+)$/i.exec(String(wk || ""));
    if (!m) return null;
    return Number(m[1]) * 100 + Number(m[2]);
  }

  function countMemberRotaWeeks(memberId, lookbackWeeks) {
    lookbackWeeks = Number(lookbackWeeks || ROTA_LOOKBACK_WEEKS);
    var cur = parseWeekKeyNum(isoWeekKey(todayISO()));
    if (cur == null) return 0;
    var minWk = cur - lookbackWeeks;
    var s = getEventsBoard();
    var count = 0;
    s.rotas.forEach(function (rot) {
      var wn = parseWeekKeyNum(rot.weekKey);
      if (wn == null || wn < minWk || wn > cur) return;
      var mids = rot.memberIds && rot.memberIds.length ? rot.memberIds : resolveAssigneeMemberIds(rot.assignees);
      if (
        mids.some(function (mid) {
          return String(mid) === String(memberId);
        })
      ) {
        count += 1;
      }
    });
    return count;
  }

  function slotConflictsWithGroupMeeting(slot, slotTime, meetingDay) {
    if (!meetingDay) return false;
    var meetingMatch = String(meetingDay).match(/周[一二三四五六日]|主日/);
    if (!meetingMatch) return false;
    var mDay = meetingMatch[0];
    var slotStr = String(slot || "") + " " + String(slotTime || "");
    if (slotStr.indexOf(mDay) >= 0) return true;
    if (mDay === "主日" && /主日|周日/.test(slotStr)) return true;
    return false;
  }

  function validateServingAssignment(memberIds, slot, slotTime, weekKey) {
    var warnings = [];
    (memberIds || []).forEach(function (mid) {
      var m = getMemberById(mid);
      var grp = getMemberPrimaryGroup(mid);
      if (grp && slotConflictsWithGroupMeeting(slot, slotTime, grp.meetingDay)) {
        warnings.push({
          memberId: mid,
          name: m ? m.name : mid,
          type: "meeting_clash",
          severity: "warn",
          message: "与小组聚会时间冲突（" + grp.meetingDay + "）"
        });
      }
      var freq = countMemberRotaWeeks(mid, ROTA_LOOKBACK_WEEKS);
      if (freq >= ROTA_FREQ_WARN) {
        warnings.push({
          memberId: mid,
          name: m ? m.name : mid,
          type: "overload",
          severity: "critical",
          message: "近 " + ROTA_LOOKBACK_WEEKS + " 周服侍 " + freq + " 次（≥" + ROTA_FREQ_WARN + " 爆红）"
        });
      }
    });
    return warnings;
  }

  function addRotaWithValidation(payload) {
    var memberIds = payload.memberIds && payload.memberIds.length
      ? payload.memberIds.map(Number)
      : resolveAssigneeMemberIds(payload.assignees);
    var warnings = validateServingAssignment(memberIds, payload.slot, payload.slotTime, payload.weekKey);
    var entry = addRotaEntry(
      Object.assign({}, payload, {
        memberIds: memberIds,
        warnings: warnings,
        validationAt: nowIso()
      })
    );
    return { entry: entry, warnings: warnings };
  }

  function addEventArchiveRich(payload) {
    return addEventArchive(
      Object.assign(
        {
          vision: "",
          budgetPlanned: null,
          budgetActual: null,
          vendors: [],
          materials: [],
          lessonsLearned: ""
        },
        payload
      )
    );
  }

  function getAggregateRelayRate() {
    var board = getEventsBoard();
    if (!board.announcements.length) return null;
    var sum = 0;
    var n = 0;
    board.announcements.forEach(function (ann) {
      var st = getAnnouncementRelayStats(ann.id);
      if (st) {
        sum += st.relayRate;
        n += 1;
      }
    });
    return n ? Math.round(sum / n) : null;
  }

  function addEventRegistration(payload) {
    var s = getEventsBoard();
    s.registrations.push(Object.assign({ id: "reg_" + Date.now(), enrolled: [], status: "open" }, payload));
    saveEventsBoard(s);
    return s.registrations[s.registrations.length - 1];
  }

  function enrollMemberForEvent(regId, memberId) {
    var s = getEventsBoard();
    var reg = s.registrations.find(function (r) {
      return r.id === regId;
    });
    if (!reg) return null;
    var m = getMemberById(memberId);
    if (!m) return null;
    if (!reg.enrolled) reg.enrolled = [];
    if (
      reg.enrolled.some(function (e) {
        return String(e.memberId) === String(memberId);
      })
    ) {
      return reg;
    }
    reg.enrolled.push({
      memberId: memberId,
      name: m.name,
      feeStatus: reg.fee ? "pending" : null,
      enrolledAt: new Date().toISOString()
    });
    saveEventsBoard(s);

    var X = global.PastoralCrossModuleBridge;
    if (X && X.safePastoralEvent) {
      X.safePastoralEvent({
        member_id: memberId,
        event_type: "activity_registration",
        summary: "报名 · " + (reg.eventTitle || "活动") + (reg.fee ? " · 待缴费 $" + reg.fee : ""),
        source_module: "pastoral_events",
        metadata: { regId: regId }
      });
    } else {
      var B = bridge();
      if (B && B.appendPastoralEvent) {
        try {
          B.appendPastoralEvent({
            member_id: memberId,
            event_type: "activity_registration",
            summary: "报名 · " + (reg.eventTitle || "活动"),
            source_module: "pastoral_events",
            metadata: { regId: regId }
          });
        } catch (e) {}
      }
    }
    return reg;
  }

  function addRotaEntry(payload) {
    var s = getEventsBoard();
    s.rotas.push(Object.assign({ id: "rot_" + Date.now(), weekKey: isoWeekKey(todayISO()), assignees: [] }, payload));
    saveEventsBoard(s);
    return s.rotas[s.rotas.length - 1];
  }

  function addEventArchive(payload) {
    var s = getEventsBoard();
    s.archives.unshift(Object.assign({ id: "arc_" + Date.now(), year: new Date().getFullYear() }, payload));
    saveEventsBoard(s);
    return s.archives[0];
  }

  function getTrainingStore() {
    var s = getJson(TRAINING_KEY);
    if (!s || typeof s !== "object") {
      s = { schema_version: 2, courses: [], enrollments: [], resources: [], makeupSessions: [], timothyPool: [] };
    }
    if (!s.schema_version || s.schema_version < 2) s.schema_version = 2;
    if (!Array.isArray(s.courses)) s.courses = [];
    if (!Array.isArray(s.enrollments)) s.enrollments = [];
    if (!Array.isArray(s.resources)) s.resources = [];
    if (!Array.isArray(s.makeupSessions)) s.makeupSessions = [];
    if (!Array.isArray(s.timothyPool)) s.timothyPool = [];
    return s;
  }

  function saveTrainingStore(s) {
    setJson(TRAINING_KEY, s);
  }

  function getCourses() {
    return getTrainingStore().courses.slice();
  }

  function getEnrollmentsForMember(memberId) {
    return getTrainingStore().enrollments.filter(function (e) {
      return String(e.memberId) === String(memberId);
    });
  }

  function setEnrollment(memberId, courseId, status) {
    var s = getTrainingStore();
    var ex = s.enrollments.find(function (e) {
      return String(e.memberId) === String(memberId) && e.courseId === courseId;
    });
    if (ex) ex.status = status;
    else s.enrollments.push({ id: "enr_" + Date.now(), memberId: memberId, courseId: courseId, status: status });
    saveTrainingStore(s);

    var X = global.PastoralCrossModuleBridge;
    if (X && X.syncTrainingToEducation) {
      X.syncTrainingToEducation(memberId, courseId, status);
    }
  }

  function enrollmentStatusLabel(status) {
    var map = { in_progress: "正修", completed: "已修", exempt: "免修", enrolled: "已报名" };
    return map[status] || status || "—";
  }

  function getLeaderPipeline() {
    var s = getTrainingStore();
    var leaderCourse = s.courses.find(function (c) {
      return c.type === "leader";
    });
    if (!leaderCourse) return [];
    return s.enrollments
      .filter(function (e) {
        return e.courseId === leaderCourse.id && (e.status === "in_progress" || e.status === "completed");
      })
      .map(function (e) {
        var m = getMemberById(e.memberId);
        var life = getLifecycleStore().members[String(e.memberId)] || {};
        return {
          memberId: e.memberId,
          name: m ? m.name : e.memberId,
          status: e.status,
          stage: life.stage || "stable",
          gifts: m && m.gifts ? m.gifts : ""
        };
      });
  }

  function getStrategyStore() {
    var s = getJson(STRATEGY_KEY);
    if (!s || typeof s !== "object") {
      s = { schema_version: 1, visitLogs: [], proposals: [], prayerItems: [] };
    }
    if (!Array.isArray(s.visitLogs)) s.visitLogs = [];
    if (!Array.isArray(s.proposals)) s.proposals = [];
    if (!Array.isArray(s.prayerItems)) s.prayerItems = [];
    return s;
  }

  function saveStrategyStore(s) {
    setJson(STRATEGY_KEY, s);
  }

  function addVisitLog(payload) {
    var s = getStrategyStore();
    var rec = Object.assign({ id: "vl_" + Date.now(), date: todayISO(), author: "" }, payload);
    s.visitLogs.unshift(rec);
    saveStrategyStore(s);
    var B = bridge();
    if (B && B.appendPastoralEvent && payload.targetMemberId) {
      try {
        B.appendPastoralEvent({
          member_id: payload.targetMemberId,
          event_type: "pastor_visit_log",
          summary: payload.summary || "",
          source_module: "pastoral_strategy"
        });
      } catch (e) {}
    }
    return rec;
  }

  function addStrategyProposal(payload) {
    var s = getStrategyStore();
    var rec = Object.assign({ id: "pr_" + Date.now(), status: "discussion", author: "" }, payload);
    s.proposals.unshift(rec);
    saveStrategyStore(s);
    return rec;
  }

  function getPrayerAlertsForGroup(groupId) {
    var w = getWorkspace();
    if (!w.groupPrayerAlerts) return [];
    return w.groupPrayerAlerts.filter(function (a) {
      return Number(a.groupId) === Number(groupId) && !a.dismissed;
    });
  }

  function pushPrayerToWorkspace(prayerId) {
    var st = getStrategyStore();
    var item = st.prayerItems.find(function (p) {
      return p.id === prayerId;
    });
    if (!item) return false;
    var w = getWorkspace();
    if (!w.groupPrayerAlerts) w.groupPrayerAlerts = [];
    var targets = item.groupId != null ? [item.groupId] : getGroups().map(function (g) {
      return g.id;
    });
    targets.forEach(function (gid) {
      w.groupPrayerAlerts.unshift({
        id: "gpa_" + prayerId + "_" + gid,
        prayerId: prayerId,
        groupId: gid,
        request: item.request,
        urgency: item.urgency || "normal",
        signal: PRAYER_SIGNAL[item.urgency] || "green",
        pushedAt: nowIso()
      });
    });
    item.pushedToGroups = true;
    item.pushedAt = nowIso();
    saveStrategyStore(st);
    saveWorkspace(w);
    return true;
  }

  function addPrayerItem(payload) {
    var s = getStrategyStore();
    var rec = Object.assign(
      { id: "pw_" + Date.now(), date: todayISO(), urgency: "normal", groupId: null, pushedToGroups: false },
      payload
    );
    s.prayerItems.unshift(rec);
    saveStrategyStore(s);
    if (rec.urgency === "high" && payload.autoPush !== false) {
      pushPrayerToWorkspace(rec.id);
    }
    return rec;
  }

  function simulateProposalImpact(proposalId) {
    var st = getStrategyStore();
    var p = st.proposals.find(function (x) {
      return x.id === proposalId;
    });
    if (!p) return null;
    var budget = Number(p.budget || 0);
    var manpower = Number(p.manpower || 0);
    var reach = Number(p.expectedReach || 0);
    var roiScore = 0;
    if (budget > 0 && reach > 0) roiScore = Math.round((reach / budget) * 1000 + manpower * 5);
    else if (reach > 0) roiScore = reach * 10 + manpower * 8;
    var summary =
      "预估触达 " +
      reach +
      " 人 · 人力 " +
      manpower +
      " 人月 · 预算 $" +
      budget +
      (roiScore >= 80 ? " · 建议优先排期" : roiScore >= 40 ? " · 可纳入季度讨论" : " · 需补充效益论证");
    return {
      proposalId: proposalId,
      title: p.title,
      budget: budget,
      manpower: manpower,
      expectedReach: reach,
      roiScore: roiScore,
      summary: summary
    };
  }

  function getChurchHealthIndex() {
    var members = getMembers();
    var total = members.length || 1;
    var baptized = members.filter(function (m) {
      return m.baptized;
    }).length;
    var seekers = members.filter(function (m) {
      return m.spiritual_journey_stage === "seeker" || !m.baptized;
    }).length;
    var baptismConversionRate = seekers > 0 ? Math.round((baptized / total) * 100) : Math.round((baptized / total) * 100);

    var tr = getTrainingStore();
    var trained = {};
    tr.enrollments.forEach(function (e) {
      if (e.status === "in_progress" || e.status === "completed" || e.status === "enrolled") {
        trained[String(e.memberId)] = true;
      }
    });
    var trainingPenetration = Math.round((Object.keys(trained).length / total) * 100);

    var atRisk = listAbsenceAlerts().length;
    var org = getOrgStore();
    var reclaimed = (org.handoverTasks || []).filter(function (t) {
      return t.type === "absence_followup" && t.status === "done";
    }).length;
    var riskTasks = (org.handoverTasks || []).filter(function (t) {
      return t.type === "absence_followup";
    }).length;
    var reclaimRate = riskTasks > 0 ? Math.round((reclaimed / riskTasks) * 100) : atRisk === 0 ? 100 : 0;

    return {
      baptismConversionRate: baptismConversionRate,
      trainingPenetration: trainingPenetration,
      reclaimRate: reclaimRate,
      groupRelayRate: getAggregateRelayRate(),
      atRiskCount: atRisk,
      memberCount: members.length
    };
  }

  function getMemberGroupIds(memberId) {
    var ms = memberSystem();
    return (ms.groupMemberships || [])
      .filter(function (gm) {
        return String(gm.memberId) === String(memberId);
      })
      .map(function (gm) {
        return gm.groupId;
      });
  }

  function getMemberPrimaryGroup(memberId) {
    var ids = getMemberGroupIds(memberId);
    if (!ids.length) return null;
    return getGroups().find(function (g) {
      return Number(g.id) === Number(ids[0]);
    });
  }

  function getMemberAttendanceRate(memberId, groupId) {
    groupId = groupId != null ? Number(groupId) : null;
    var sessions = groupId != null ? getSessionsForGroup(groupId, 8) : [];
    if (!sessions.length) {
      var gid = getMemberPrimaryGroup(memberId);
      if (gid) sessions = getSessionsForGroup(gid.id, 8);
    }
    if (!sessions.length) return null;
    var total = 0;
    var present = 0;
    sessions.forEach(function (sess) {
      var rec = (sess.records || []).find(function (r) {
        return String(r.memberId) === String(memberId);
      });
      if (!rec) return;
      total += 1;
      if (rec.status === "present") present += 1;
    });
    if (!total) return null;
    return Math.round((present / total) * 100);
  }

  function getMemberLifecycleStage(memberId) {
    var life = getLifecycleStore();
    var row = life.members[String(memberId)];
    if (row && row.stage) return row.stage;
    var m = getMemberById(memberId);
    if (m && m.spiritual_journey_stage === "new_believer") return "newcomer";
    if (m && m.spiritual_journey_stage === "seeker") return "newcomer";
    return "stable";
  }

  function setMemberLifecycleStage(memberId, stage) {
    var life = getLifecycleStore();
    var key = String(memberId);
    if (!life.members[key]) life.members[key] = { absenceStreak: 0, lastAlertWeek: null };
    life.members[key].stage = stage;
    saveLifecycleStore(life);
  }

  function lifecycleLabel(stage) {
    var found = LIFECYCLE_STAGES.find(function (s) {
      return s.id === stage;
    });
    return found ? found.label : stage || "—";
  }

  function getMemberSummary(memberId) {
    var m = getMemberById(memberId);
    if (!m) return null;
    var grp = getMemberPrimaryGroup(memberId);
    var rate = getMemberAttendanceRate(memberId, grp && grp.id);
    return {
      member: m,
      group: grp,
      attendanceRate: rate,
      lifecycle: getMemberLifecycleStage(memberId),
      enrollments: getEnrollmentsForMember(memberId),
      absenceStreak: (getLifecycleStore().members[String(memberId)] || {}).absenceStreak || 0
    };
  }

  function getPastoralOrgTree() {
    var groups = getGroups();
    var pastors = {};
    groups.forEach(function (g) {
      var pastor = g.pastor || "未指派牧者";
      if (!pastors[pastor]) pastors[pastor] = {};
      var district = g.districtLeader || g.region || "未分区";
      if (!pastors[pastor][district]) pastors[pastor][district] = [];
      pastors[pastor][district].push({
        group: g,
        leaderId: g.leaderMemberId,
        leaderName: g.leader || "—",
        memberCount: membersInGroup(g.id).length,
        region: g.region,
        ageBand: g.ageBand
      });
    });
    return pastors;
  }

  function getMembersFiltered(filters) {
    filters = filters || {};
    var members = getMembers().slice();
    if (filters.region) {
      members = members.filter(function (m) {
        return (m.zone || "") === filters.region || getMemberPrimaryGroup(m.id) && getMemberPrimaryGroup(m.id).region === filters.region;
      });
    }
    if (filters.ageBand) {
      members = members.filter(function (m) {
        var g = getMemberPrimaryGroup(m.id);
        return g && g.ageBand === filters.ageBand;
      });
    }
    if (filters.stage) {
      members = members.filter(function (m) {
        return getMemberLifecycleStage(m.id) === filters.stage;
      });
    }
    if (filters.q) {
      var q = String(filters.q).toLowerCase();
      members = members.filter(function (m) {
        return String(m.name || "").toLowerCase().indexOf(q) >= 0;
      });
    }
    return members;
  }

  function getDistinctRegions() {
    var set = {};
    getGroups().forEach(function (g) {
      if (g.region) set[g.region] = true;
    });
    getMembers().forEach(function (m) {
      if (m.zone) set[m.zone] = true;
    });
    return Object.keys(set).sort();
  }

  function getDistinctAgeBands() {
    var set = {};
    getGroups().forEach(function (g) {
      if (g.ageBand) set[g.ageBand] = true;
    });
    return Object.keys(set).sort();
  }

  function getViewerRole() {
    try {
      var q = global.location && global.location.search ? new URLSearchParams(global.location.search) : null;
      var role = (q && q.get("role")) || global.sessionStorage.getItem("crm_role") || "";
      role = String(role || "leader").toLowerCase();
      if (VIEWER_ROLES.indexOf(role) >= 0) return role;
      if (q && q.get("crm_from") === "b_pastoral") return "leader";
      return "leader";
    } catch (e) {
      return "leader";
    }
  }

  function canViewSensitive(role) {
    role = role || getViewerRole();
    return role === "pastor" || role === "district";
  }

  function filterVisitLogForViewer(log, role) {
    role = role || getViewerRole();
    if (!log) return null;
    if (log.sensitivity === "high" && !canViewSensitive(role)) {
      return {
        id: log.id,
        date: log.date,
        targetMemberId: log.targetMemberId,
        targetName: log.targetName,
        author: log.author,
        summary: "（高敏记录 · 仅牧者/区长可见）",
        painCategory: log.painCategory ? "已分类" : "",
        sensitivity: "high",
        followupCycle: log.followupCycle,
        redacted: true
      };
    }
    return log;
  }

  function getSpiritualLadderForMember(memberId) {
    var enrollments = getEnrollmentsForMember(memberId);
    var courses = getCourses();
    var stage = getMemberLifecycleStage(memberId);
    return SPIRITUAL_LADDER.map(function (step) {
      var course = step.courseType
        ? courses.find(function (c) {
            return c.type === step.courseType;
          })
        : null;
      var enr = course
        ? enrollments.find(function (e) {
            return e.courseId === course.id;
          })
        : null;
      var status = "locked";
      if (step.id === "seeker" && (stage === "newcomer" || stage === "stable" || stage === "growing")) status = "done";
      if (course && enr) {
        if (enr.status === "completed") status = "done";
        else if (enr.status === "in_progress" || enr.status === "enrolled") status = "active";
        else status = "available";
      } else if (course && !enr && step.order <= 2 && stage !== "at_risk") status = "available";
      return {
        step: step,
        course: course,
        enrollment: enr,
        status: status,
        statusLabel: { locked: "未开放", available: "可报名", active: "正修", done: "已完成" }[status] || status
      };
    });
  }

  function getTimothyCandidates(opts) {
    opts = opts || {};
    var minRate = opts.minAttendance != null ? opts.minAttendance : TIMOTHY_MIN_ATTENDANCE;
    var poolIds = getTrainingStore().timothyPool.map(function (t) {
      return String(t.memberId);
    });
    return getMembers()
      .map(function (m) {
        var rate = getMemberAttendanceRate(m.id);
        var ladder = getSpiritualLadderForMember(m.id);
        var leaderStep = ladder.find(function (x) {
          return x.step.id === "leader";
        });
        var discipleStep = ladder.find(function (x) {
          return x.step.id === "disciple";
        });
        var score = 0;
        if (rate != null && rate >= minRate) score += 30;
        if (discipleStep && discipleStep.status === "done") score += 25;
        if (leaderStep && (leaderStep.status === "active" || leaderStep.status === "done")) score += 25;
        if (getMemberLifecycleStage(m.id) === "growing") score += 10;
        var p360 = getProfile360(m.id);
        if (p360.giftAssessment && p360.giftAssessment.primary) score += 10;
        var inPool = poolIds.indexOf(String(m.id)) >= 0;
        return {
          memberId: m.id,
          name: m.name,
          attendanceRate: rate,
          lifecycle: getMemberLifecycleStage(m.id),
          score: score,
          inPool: inPool,
          gifts: p360.giftAssessment || (m.gifts ? { primary: m.gifts.split(",")[0] } : null),
          qualifies: score >= 60 && rate != null && rate >= minRate
        };
      })
      .filter(function (row) {
        return opts.all || row.qualifies || row.inPool;
      })
      .sort(function (a, b) {
        return b.score - a.score;
      });
  }

  function addMakeupSession(payload) {
    var s = getTrainingStore();
    var rec = Object.assign(
      {
        id: "mk_" + Date.now(),
        status: "scheduled",
        missedDate: todayISO(),
        makeupDate: todayISO()
      },
      payload
    );
    s.makeupSessions.unshift(rec);
    saveTrainingStore(s);
    return rec;
  }

  function promoteToTimothyPool(memberId, note) {
    var s = getTrainingStore();
    var key = String(memberId);
    if (
      !s.timothyPool.some(function (t) {
        return String(t.memberId) === key;
      })
    ) {
      var cand = getTimothyCandidates({ all: true }).find(function (c) {
        return String(c.memberId) === key;
      });
      s.timothyPool.unshift({
        memberId: memberId,
        addedAt: nowIso(),
        note: note || "",
        score: cand ? cand.score : 0
      });
      saveTrainingStore(s);
      setMemberLifecycleStage(memberId, "growing");
    }
    return true;
  }

  function getPastoralTaskInbox(filters) {
    filters = filters || {};
    var gid = filters.groupId != null ? Number(filters.groupId) : null;
    var tasks = [];
    var prioRank = { critical: 0, high: 1, medium: 2, low: 3 };

    listAbsenceAlerts().forEach(function (a) {
      if (gid != null) {
        var inG = membersInGroup(gid).some(function (m) {
          return String(m.id) === String(a.memberId);
        });
        if (!inG) return;
      }
      tasks.push({
        id: "abs_" + a.memberId,
        type: "absence",
        memberId: a.memberId,
        name: a.name,
        summary: "连续缺席 " + a.streak + " 周 · 待探访跟进",
        priority: "high",
        link: "../support/visitation_index.html?crm_from=b_pastoral&memberId=" + encodeURIComponent(a.memberId),
        source: "group_attendance_v1"
      });
    });

    try {
      var drafts = getJson(DRAFTS_KEY) || [];
      if (Array.isArray(drafts)) {
        drafts
          .filter(function (d) {
            return d.status === "pending";
          })
          .forEach(function (d) {
            tasks.push({
              id: "draft_" + (d.id || d.memberId),
              type: "visitation_draft",
              memberId: d.memberId,
              name: d.memberName || "待指派",
              summary: d.reason || d.note || "探访草稿",
              priority: d.source === "group_attendance_alert" ? "high" : "medium",
              link: "../support/visitation_index.html?crm_from=b_pastoral",
              source: DRAFTS_KEY,
              draftId: d.id
            });
          });
      }
    } catch (eD) {}

    getOrgStore().handoverTasks
      .filter(function (t) {
        return t.status === "pending";
      })
      .forEach(function (t) {
        tasks.push({
          id: "ho_" + t.id,
          type: t.type || "handover",
          memberId: t.memberId,
          name: t.memberName || "—",
          summary: t.reason || t.type,
          priority: t.type === "leader_care" || t.type === "absence_followup" || t.type === "education_absence" ? "high" : "medium",
          link: t.link || "pastoral-org-roster.html?crm_from=b_pastoral#tab-lifecycle",
          source: t.source || ORG_KEY,
          taskId: t.id
        });
      });

    if (gid != null) {
      getPendingRelaysForGroup(gid).forEach(function (r) {
        tasks.push({
          id: "relay_" + r.annId,
          type: "announcement_relay",
          memberId: null,
          name: "组长",
          summary: "待转发通告 · " + r.title,
          priority: "medium",
          link: "pastoral-events.html?crm_from=b_pastoral#tab-announce",
          source: EVENTS_BOARD_KEY
        });
      });
      getPrayerAlertsForGroup(gid).forEach(function (p) {
        if (p.urgency !== "high") return;
        tasks.push({
          id: "prayer_" + p.id,
          type: "urgent_prayer",
          memberId: null,
          name: "全组",
          summary: p.request,
          priority: "critical",
          link: "pastoral-strategy.html?crm_from=b_pastoral#tab-prayer",
          source: WORKSPACE_KEY
        });
      });
    }

    tasks.sort(function (a, b) {
      return (prioRank[a.priority] || 9) - (prioRank[b.priority] || 9);
    });
    if (filters.limit) tasks = tasks.slice(0, Number(filters.limit));
    return tasks;
  }

  function completePastoralTask(taskId) {
    var id = String(taskId || "");
    if (id.indexOf("draft_") === 0) {
      var draftKey = id.replace("draft_", "");
      var drafts = getJson(DRAFTS_KEY) || [];
      drafts.forEach(function (d) {
        if (d.id === draftKey || String(d.memberId) === draftKey.replace("abs_", "")) {
          d.status = "done";
          d.completedAt = nowIso();
        }
      });
      setJson(DRAFTS_KEY, drafts);
      return true;
    }
    if (id.indexOf("ho_") === 0) {
      completeHandoverTask(id.replace("ho_", ""));
      return true;
    }
    return false;
  }

  function registerYouthNewcomer(payload) {
    payload = payload || {};
    var name = String(payload.name || "").trim();
    if (!name) return { ok: false, error: "missing_name" };
    var ms = memberSystem();
    var m = ms.members.find(function (x) {
      return x.name === name;
    });
    if (!m) {
      var baseId = Math.max.apply(null, ms.members.map(function (x) {
        return Number(x.id) || 0;
      }).concat([0])) + 1;
      m = {
        id: baseId,
        memberId: baseId,
        name: name,
        phone: payload.phone || "",
        zone: payload.zone || "港岛",
        spiritual_journey_stage: "seeker",
        baptized: false,
        status: "in_communion",
        first_visit_date: todayISO(),
        membershipDate: todayISO()
      };
      ms.members.push(m);
      saveMemberSystem(ms);
    }
    setMemberLifecycleStage(m.id, "newcomer");
    addHandoverTask({
      type: "newcomer_placement",
      memberId: m.id,
      memberName: m.name,
      reason: "青年活动登记 · " + (payload.activity || "新朋友"),
      dueInDays: 7
    });
    safeAppendEvent({
      member_id: m.id,
      event_type: "youth_newcomer",
      summary: "青年团契登记 · " + (payload.activity || "活动"),
      source_module: "youth_ministry",
      metadata: payload
    });
    evaluateLifecycleRules();
    return { ok: true, memberId: m.id, member: m };
  }

  function exportPastoralBundle() {
    var bundle = {
      schema_version: 2,
      exportedAt: nowIso(),
      module: "church_ministry_b_pastoral",
      stores: {}
    };
    PASTORAL_BUNDLE_KEYS.forEach(function (key) {
      var val = getJson(key);
      if (val != null) bundle.stores[key] = val;
    });
    return bundle;
  }

  function importPastoralBundle(bundle, opts) {
    opts = opts || {};
    if (!bundle || !bundle.stores || typeof bundle.stores !== "object") {
      return { ok: false, error: "invalid_bundle" };
    }
    if (!opts.merge && !opts.skipConfirm && global.confirm && !global.confirm("导入将覆盖现有牧养 localStorage 数据，确定继续？")) {
      return { ok: false, error: "cancelled" };
    }
    Object.keys(bundle.stores).forEach(function (key) {
      if (PASTORAL_BUNDLE_KEYS.indexOf(key) >= 0) setJson(key, bundle.stores[key]);
    });
    migratePastoralStores();
    return { ok: true, keys: Object.keys(bundle.stores) };
  }

  function downloadPastoralBundle() {
    var bundle = exportPastoralBundle();
    var blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    var a = global.document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "pastoral_bundle_" + todayISO() + ".json";
    a.click();
    return bundle;
  }

  function getFellowshipCircleStats() {
    return AGE_ZONES.map(function (z) {
      var rows = getMembersMatrixFiltered({ ageZone: z.id });
      var groups = getGroups().filter(function (g) {
        var band = String(g.ageBand || "");
        if (z.id === "youth" && /青少|少年|青年/.test(band)) return true;
        if (z.id === "career" && /社青|职青|职场/.test(band)) return true;
        if (z.id === "family" && /夫妇|家庭/.test(band)) return true;
        if (z.id === "senior" && /长青|长者/.test(band)) return true;
        return z.id === "adult" && !/青少|社青|夫妇|长青/.test(band);
      });
      return {
        ageZone: z.id,
        label: z.label,
        memberCount: rows.length,
        groupCount: groups.length,
        groups: groups.map(function (g) {
          return { id: g.id, name: g.name, region: g.region };
        })
      };
    });
  }

  function getPendingPastoralTasks() {
    return getPastoralTaskInbox().map(function (t) {
      return {
        type: t.type,
        memberId: t.memberId,
        name: t.name,
        summary: t.summary,
        priority: t.priority === "critical" ? "high" : t.priority
      };
    });
  }

  function trySyncPastoralBundleToCloud() {
    var cfg = global.cloudConfig || global.B100CloudConfig || null;
    if (!cfg || !cfg.supabaseUrl) {
      return { ok: false, reason: "supabase_not_configured", hint: "配置 cloud_config.js 后可扩展上传" };
    }
    var bundle = exportPastoralBundle();
    return {
      ok: false,
      reason: "manual_upload_required",
      hint: "已准备 bundle · 请用 Supabase Storage 或 Edge Function 上传",
      bundleKeys: Object.keys(bundle.stores || {})
    };
  }

  function getYearlyPastoralReport() {
    var members = getMembers();
    var baptized = members.filter(function (m) {
      return m.baptized;
    }).length;
    var groups = getGroups();
    var tr = getTrainingStore();
    var completed = tr.enrollments.filter(function (e) {
      return e.status === "completed";
    }).length;
    var atRisk = listAbsenceAlerts().length;
    var newcomers = members.filter(function (m) {
      return getMemberLifecycleStage(m.id) === "newcomer";
    }).length;
    var health = getChurchHealthIndex();
    return {
      year: new Date().getFullYear(),
      memberCount: members.length,
      groupCount: groups.length,
      baptizedCount: baptized,
      trainingCompletions: completed,
      atRiskCount: atRisk,
      newcomerCount: newcomers,
      pendingTasks: getPendingPastoralTasks().length,
      healthIndex: health
    };
  }

  global.PastoralDataHub = {
    WORKSPACE_KEY: WORKSPACE_KEY,
    GROUP_ATTENDANCE_KEY: GROUP_ATTENDANCE_KEY,
    ABSENCE_ALERT_WEEKS: ABSENCE_ALERT_WEEKS,
    ensurePastoralSeed: ensurePastoralSeed,
    getMembers: getMembers,
    getGroups: getGroups,
    getMemberById: getMemberById,
    membersInGroup: membersInGroup,
    memberProfileUrl: memberProfileUrl,
    memberLinkHtml: memberLinkHtml,
    getWorkspace: getWorkspace,
    saveWorkspace: saveWorkspace,
    setActiveGroup: setActiveGroup,
    getActiveGroup: getActiveGroup,
    getMeetingForWeek: getMeetingForWeek,
    saveWeeklyMeeting: saveWeeklyMeeting,
    recordGroupAttendanceSession: recordGroupAttendanceSession,
    getGroupAttendanceStore: getGroupAttendanceStore,
    getSessionsForGroup: getSessionsForGroup,
    getAttendanceTrend: getAttendanceTrend,
    listAbsenceAlerts: listAbsenceAlerts,
    getDashboardForGroup: getDashboardForGroup,
    saveCheckin: saveCheckin,
    isoWeekKey: isoWeekKey,
    todayISO: todayISO,
    esc: esc,
    LIFECYCLE_STAGES: LIFECYCLE_STAGES,
    getPastoralOrgTree: getPastoralOrgTree,
    getMembersFiltered: getMembersFiltered,
    getDistinctRegions: getDistinctRegions,
    getDistinctAgeBands: getDistinctAgeBands,
    getMemberSummary: getMemberSummary,
    getMemberLifecycleStage: getMemberLifecycleStage,
    setMemberLifecycleStage: setMemberLifecycleStage,
    lifecycleLabel: lifecycleLabel,
    getMemberAttendanceRate: getMemberAttendanceRate,
    getEventsBoard: getEventsBoard,
    saveEventsBoard: saveEventsBoard,
    addAnnouncement: addAnnouncement,
    addEventRegistration: addEventRegistration,
    enrollMemberForEvent: enrollMemberForEvent,
    addRotaEntry: addRotaEntry,
    addRotaWithValidation: addRotaWithValidation,
    addEventArchive: addEventArchive,
    addEventArchiveRich: addEventArchiveRich,
    getAnnouncementRelayStats: getAnnouncementRelayStats,
    confirmAnnouncementRelay: confirmAnnouncementRelay,
    getPendingRelaysForGroup: getPendingRelaysForGroup,
    getRegistrationLeaderboard: getRegistrationLeaderboard,
    enrollGroupForEvent: enrollGroupForEvent,
    validateServingAssignment: validateServingAssignment,
    countMemberRotaWeeks: countMemberRotaWeeks,
    ROTA_FREQ_WARN: ROTA_FREQ_WARN,
    ROTA_LOOKBACK_WEEKS: ROTA_LOOKBACK_WEEKS,
    getTrainingStore: getTrainingStore,
    getCourses: getCourses,
    getEnrollmentsForMember: getEnrollmentsForMember,
    setEnrollment: setEnrollment,
    enrollmentStatusLabel: enrollmentStatusLabel,
    getLeaderPipeline: getLeaderPipeline,
    getStrategyStore: getStrategyStore,
    addVisitLog: addVisitLog,
    addStrategyProposal: addStrategyProposal,
    addPrayerItem: addPrayerItem,
    pushPrayerToWorkspace: pushPrayerToWorkspace,
    getPrayerAlertsForGroup: getPrayerAlertsForGroup,
    simulateProposalImpact: simulateProposalImpact,
    getChurchHealthIndex: getChurchHealthIndex,
    FOLLOWUP_CYCLES: FOLLOWUP_CYCLES,
    SENSITIVITY_LEVELS: SENSITIVITY_LEVELS,
    PRAYER_SIGNAL: PRAYER_SIGNAL,
    getPendingPastoralTasks: getPendingPastoralTasks,
    getYearlyPastoralReport: getYearlyPastoralReport,
    ORG_KEY: ORG_KEY,
    HEALTH_STATUSES: HEALTH_STATUSES,
    AGE_ZONES: AGE_ZONES,
    MINISTRY_TAG_OPTS: MINISTRY_TAG_OPTS,
    PAIN_CATEGORIES: PAIN_CATEGORIES,
    NEWCOMER_PLACEMENT_WEEKS: NEWCOMER_PLACEMENT_WEEKS,
    BAPTISM_REFERRAL_MONTHS: BAPTISM_REFERRAL_MONTHS,
    getOrgStore: getOrgStore,
    getOrgTreeEnriched: getOrgTreeEnriched,
    getLeaderHealthKpis: getLeaderHealthKpis,
    getLeaderRecord: getLeaderRecord,
    setLeaderRecord: setLeaderRecord,
    healthLabel: healthLabel,
    healthCss: healthCss,
    getMemberMatrix: getMemberMatrix,
    setMemberMatrix: setMemberMatrix,
    getMembersMatrixFiltered: getMembersMatrixFiltered,
    getLifecyclePools: getLifecyclePools,
    evaluateLifecycleRules: evaluateLifecycleRules,
    assignMemberToGroup: assignMemberToGroup,
    pushToStrategyDesk: pushToStrategyDesk,
    pushLeaderBurnoutToStrategy: pushLeaderBurnoutToStrategy,
    getProfile360: getProfile360,
    addHandoverTask: addHandoverTask,
    completeHandoverTask: completeHandoverTask,
    migratePastoralStores: migratePastoralStores,
    SPIRITUAL_LADDER: SPIRITUAL_LADDER,
    TIMOTHY_MIN_ATTENDANCE: TIMOTHY_MIN_ATTENDANCE,
    getSpiritualLadderForMember: getSpiritualLadderForMember,
    getTimothyCandidates: getTimothyCandidates,
    addMakeupSession: addMakeupSession,
    promoteToTimothyPool: promoteToTimothyPool,
    getPastoralTaskInbox: getPastoralTaskInbox,
    completePastoralTask: completePastoralTask,
    registerYouthNewcomer: registerYouthNewcomer,
    getViewerRole: getViewerRole,
    canViewSensitive: canViewSensitive,
    filterVisitLogForViewer: filterVisitLogForViewer,
    exportPastoralBundle: exportPastoralBundle,
    importPastoralBundle: importPastoralBundle,
    downloadPastoralBundle: downloadPastoralBundle,
    PASTORAL_BUNDLE_KEYS: PASTORAL_BUNDLE_KEYS,
    trySyncPastoralBundleToCloud: trySyncPastoralBundleToCloud,
    getFellowshipCircleStats: getFellowshipCircleStats
  };
})(typeof window !== "undefined" ? window : this);
