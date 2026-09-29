/**
 * DO 模組活化 · Plan↔Do 橋接、教會規模 profile、一戶教會種子
 * 依賴：ChurchDataBridge（可選 AssessmentRunStore、SmartMinistryCanonical）
 */
(function (global) {
  "use strict";

  var PROFILE_KEY = "bible100_do_church_profile";
  var ROLE_KEY = "bible100_do_dashboard_role";

  var SIZES = {
    household: {
      id: "household",
      label: "一戶教會",
      hint: "2–15 人 · 家庭小組／植堂初期",
      seed: "household"
    },
    small: {
      id: "small",
      label: "小型教會",
      hint: "約 16–80 人",
      seed: "maturity"
    },
    medium: {
      id: "medium",
      label: "中型教會",
      hint: "約 81–300 人",
      seed: "maturity"
    },
    large: {
      id: "large",
      label: "大型教會",
      hint: "300+ 人 · 完整 KPI 與角色面板",
      seed: "maturity"
    }
  };

  var PLAN_TOOL_LABELS = {
    urgent: "重要 vs 緊急",
    swot: "SWOT",
    ministry8020: "80/20 聚焦",
    smart: "SMART 目標",
    shape: "SHAPE 恩賜",
    matchmaker: "事奉媒合",
    ncd: "NCD 教會健康",
    alda: "ALDA 領導力"
  };

  function readJson(key) {
    try {
      return JSON.parse(global.localStorage.getItem(key) || "null");
    } catch (e) {
      return null;
    }
  }

  function writeJson(key, obj) {
    try {
      global.localStorage.setItem(key, JSON.stringify(obj));
      return true;
    } catch (e2) {
      return false;
    }
  }

  function getProfile() {
    var raw = readJson(PROFILE_KEY);
    if (raw && raw.size && SIZES[raw.size]) {
      return {
        size: raw.size,
        label: SIZES[raw.size].label,
        updated_at: raw.updated_at || null
      };
    }
    return { size: "small", label: SIZES.small.label, updated_at: null };
  }

  function setProfileSize(sizeId) {
    if (!SIZES[sizeId]) return getProfile();
    var p = {
      schema_version: 1,
      size: sizeId,
      updated_at: new Date().toISOString()
    };
    writeJson(PROFILE_KEY, p);
    return getProfile();
  }

  function getDashboardRole() {
    try {
      var r = global.localStorage.getItem(ROLE_KEY);
      if (r === "leader" || r === "staff" || r === "member") return r;
    } catch (e) {}
    var prof = getProfile();
    return prof.size === "large" || prof.size === "medium" ? "leader" : "staff";
  }

  function setDashboardRole(role) {
    try {
      global.localStorage.setItem(ROLE_KEY, role);
    } catch (e) {}
  }

  function notifyDataChanged(domain) {
    var Bridge = global.ChurchDataBridge;
    if (Bridge && typeof Bridge.notifyDomainChanged === "function") {
      Bridge.notifyDomainChanged(domain || "all");
      return;
    }
    try {
      global.dispatchEvent(
        new CustomEvent("b100-cm-data-changed", {
          detail: { domain: domain || "all", at: new Date().toISOString() }
        })
      );
    } catch (e2) {}
  }

  function getPlanDoSnapshot() {
    var items = [];
    var store = global.AssessmentRunStore;
    if (store && store.listRuns) {
      (store.listRuns(null, 8) || []).forEach(function (row) {
        items.push({
          tool_id: row.tool_id,
          label: PLAN_TOOL_LABELS[row.tool_id] || row.tool_id,
          timestamp: row.timestamp,
          risk_count: (row.risk_flags || []).length
        });
      });
    } else {
      try {
        var idx = readJson("bible100_assessment_runs");
        if (Array.isArray(idx)) {
          idx.slice(-6).reverse().forEach(function (row) {
            items.push({
              tool_id: row.tool_id,
              label: PLAN_TOOL_LABELS[row.tool_id] || row.tool_id,
              timestamp: row.timestamp,
              risk_count: (row.risk_flags || []).length
            });
          });
        }
      } catch (e3) {}
    }
    var pending = 0;
    var Bridge = global.ChurchDataBridge;
    if (Bridge && Bridge.listPendingMinistrySuggestions) {
      pending = (Bridge.listPendingMinistrySuggestions() || []).length;
    }
    var maturity = null;
    if (Bridge && Bridge.getCrmMaturitySummary) {
      try {
        maturity = Bridge.getCrmMaturitySummary();
      } catch (e4) {}
    }
    return {
      generated_at: new Date().toISOString(),
      planning_runs: items,
      pending_ministry_matches: pending,
      crm_maturity_percent: maturity && maturity.percent != null ? maturity.percent : null
    };
  }

  function buildHouseholdMembers() {
    var today = new Date().toISOString().split("T")[0];
    var d14 = new Date();
    d14.setDate(d14.getDate() - 10);
    var visitDate = d14.toISOString().split("T")[0];
    return [
      { id: 9001, memberId: 9001, name: "陳弟兄", fullName: "陳弟兄", gender: "男", role: "戶長", spiritual_journey_stage: "leader", spiritual_stage: "leader", status: "in_communion", first_visit_date: visitDate, phone: "0912-001", zone: "家庭小組" },
      { id: 9002, memberId: 9002, name: "陳師母", fullName: "陳師母", gender: "女", role: "配偶", spiritual_journey_stage: "serving", spiritual_stage: "serving", status: "in_communion", first_visit_date: visitDate, phone: "0912-002", zone: "家庭小組" },
      { id: 9003, memberId: 9003, name: "陳小明", fullName: "陳小明", gender: "男", role: "青少年", spiritual_journey_stage: "growing", spiritual_stage: "growing", status: "in_communion", first_visit_date: today, phone: "", zone: "家庭小組" },
      { id: 9004, memberId: 9004, name: "陳小華", fullName: "陳小華", gender: "女", role: "兒童", spiritual_journey_stage: "new_believer", spiritual_stage: "new_believer", status: "in_communion", baptized: true, first_visit_date: today, zone: "家庭小組" },
      { id: 9005, memberId: 9005, name: "陳爺爺", fullName: "陳爺爺", gender: "男", role: "長輩", spiritual_journey_stage: "seeker", spiritual_stage: "seeker", status: "pending_transfer", first_visit_date: today, zone: "家庭小組" },
      { id: 9006, memberId: 9006, name: "陳婆婆", fullName: "陳婆婆", gender: "女", role: "長輩", spiritual_journey_stage: "growing", spiritual_stage: "growing", status: "in_communion", zone: "家庭小組" },
      { id: 9007, memberId: 9007, name: "李阿姨", fullName: "李阿姨", gender: "女", role: "親友", spiritual_journey_stage: "seeker", spiritual_stage: "seeker", status: "pending_transfer", first_visit_date: today, zone: "家庭小組" }
    ];
  }

  function applyHouseholdDemoSeed(Bridge) {
    if (!Bridge) return { ok: false, reason: "no_bridge" };
    if (Bridge.isProductionMode && Bridge.isProductionMode()) {
      return { ok: false, reason: "production_skip" };
    }
    var members = buildHouseholdMembers();
    var seed = {
      members: members,
      groups: [{ id: "hh1", groupId: "hh1", name: "陳家家庭小組", zone: "家庭小組", leader: "陳弟兄" }],
      groupMemberships: members.map(function (m) {
        return { memberId: m.memberId, groupId: "hh1", role: m.role || "member" };
      }),
      ministries: [],
      ministryAssignments: [],
      trainings: [{ memberId: 9003, courseName: "青少年主日學", date: new Date().toISOString().slice(0, 10) }],
      attendance: [],
      zones: [{ zoneId: "Z-HH", zoneName: "家庭小組" }],
      _seedVersion: "do_household_v1",
      _is_demo: true
    };
    if (Bridge.saveMemberSystemData) {
      Bridge.saveMemberSystemData(seed);
    }
    var vol = {
      positions: [
        { id: 1, name: "家庭敬拜帶領", category: "worship", needPeople: 1 },
        { id: 2, name: "兒童故事時間", category: "education", needPeople: 1 },
        { id: 3, name: "週間關懷電話", category: "pastoral", needPeople: 2 }
      ],
      ministries: [
        { id: 1, name: "家庭敬拜帶領", category: "worship", needPeople: 1 },
        { id: 2, name: "兒童故事時間", category: "education", needPeople: 1 }
      ],
      assignments: [{ id: 1, memberId: 9001, memberName: "陳弟兄", ministryId: 1, ministryName: "家庭敬拜帶領", status: "active" }],
      schedules: [],
      trainings: []
    };
    if (Bridge.saveVolunteerSystemData) Bridge.saveVolunteerSystemData(vol);
    var fin = Bridge.getFinanceData ? Bridge.getFinanceData() : { transactions: [] };
    if (!fin.transactions) fin.transactions = [];
    var month = new Date().toISOString().slice(0, 7);
    fin.transactions.push({
      id: Date.now(),
      txn_id: "HH-INC-1",
      type: "income",
      category: "offering",
      categoryName: "奉獻",
      amount: 3200,
      date: month + "-01",
      description: "陳家家庭奉獻（示範）",
      member_id: 9001,
      status: "approved"
    });
    if (Bridge.saveFinanceSystemData) Bridge.saveFinanceSystemData(fin);
    members.slice(0, 4).forEach(function (m, idx) {
      if (!Bridge.appendPastoralEvent) return;
      try {
        Bridge.appendPastoralEvent({
          member_id: m.memberId,
          event_type: idx === 0 ? "visitation" : "newcomer_followup",
          summary: "一戶教會示範：" + m.name + " 關懷紀錄",
          source_module: "do_household_seed",
          ts: new Date().toISOString()
        });
      } catch (eP) {}
    });
    if (Bridge.saveVisitationMission) {
      Bridge.saveVisitationMission({
        id: "hh_vis_1",
        type: "newcomer",
        target: "陳爺爺",
        targetMemberId: 9005,
        date: new Date().toISOString().slice(0, 10),
        status: "planned",
        team: "陳弟兄",
        notes: "一戶教會：長輩初訪跟進"
      });
    }
    var canon = global.SmartMinistryCanonical;
    if (canon) {
      if (canon.migrateLegacyToCanonical) {
        try { canon.migrateLegacyToCanonical({ force: false }); } catch (eM) {}
      }
      members.slice(0, 3).forEach(function (m) {
        var tid = String(m.memberId);
        if (canon.upsertTalent) {
          canon.upsertTalent({ talent_id: tid, member_id: tid, name: m.name, status: "active" });
        }
        if (canon.attachAssessmentToTalent) {
          canon.attachAssessmentToTalent(tid, "shape", { instrument_version: "household-v1" }, {
            scores: { serving: 4, teaching: 2 },
            ai_summary: "一戶教會示範恩賜（請人工確認）"
          });
        }
      });
      var mins = canon.listMinistriesCatalog ? canon.listMinistriesCatalog() : [];
      if (!mins.length && canon.syncVolunteerPositionsToCatalog) {
        try { canon.syncVolunteerPositionsToCatalog(); mins = canon.listMinistriesCatalog() || []; } catch (eS) {}
      }
      if (mins.length && canon.addMinistryAssignment) {
        canon.addMinistryAssignment({
          talent_id: "9002",
          ministry_id: mins[0].ministry_id || mins[0].id,
          ministry_name: mins[0].name,
          status: "proposed",
          source: "do_household_seed"
        });
      }
    }
    notifyDataChanged("all");
    var summary = Bridge.getCrmMaturitySummary ? Bridge.getCrmMaturitySummary() : { percent: 0 };
    return { ok: true, kind: "household", members: members.length, percent: summary.percent };
  }

  function applySeedForProfile(sizeId) {
    var Bridge = global.ChurchDataBridge;
    if (!Bridge) return { ok: false, reason: "no_bridge" };
    var sz = SIZES[sizeId] || SIZES.small;
    if (sz.seed === "household") return applyHouseholdDemoSeed(Bridge);
    if (Bridge.applyCrmMaturitySeed) {
      var r = Bridge.applyCrmMaturitySeed();
      if (r && r.ok) notifyDataChanged("all");
      return r;
    }
    return { ok: false, reason: "no_seed" };
  }

  function shellNavPlanDo(ev, sidebarUrl, contentUrl) {
    if (typeof global.bible100ShellNav === "function") {
      global.bible100ShellNav(ev, { sidebarUrl: sidebarUrl, contentUrl: contentUrl });
      return false;
    }
    try {
      global.parent.postMessage(
        { type: "bible100-shell", sidebarUrl: sidebarUrl, contentUrl: contentUrl },
        "*"
      );
    } catch (e) {}
    return false;
  }

  function renderPlanDoBanner(mountId) {
    var el = typeof mountId === "string" ? global.document.getElementById(mountId) : mountId;
    if (!el) return;
    var snap = getPlanDoSnapshot();
    var runs = snap.planning_runs || [];
    var runText = runs.length
      ? runs.slice(0, 3).map(function (r) {
          return r.label + (r.risk_count ? " ⚠" + r.risk_count : "");
        }).join(" · ")
      : "尚無規劃量表紀錄（Plan 可獨立；填寫後會出現在此）";
    el.className = "do-plan-bridge-banner";
    el.innerHTML =
      '<div class="do-plan-bridge-banner__head">' +
      "<strong>🔗 Plan → Do</strong> · 六維破口看「健康雷達」；日常 KPI 看本頁 SPAC" +
      "</div>" +
      '<div class="do-plan-bridge-banner__body">' +
      "<span>最近規劃：" + runText + "</span>" +
      (snap.pending_ministry_matches
        ? ' · <span class="do-plan-bridge-banner__hot">待確認媒合 ' + snap.pending_ministry_matches + " 筆</span>"
        : "") +
      (snap.crm_maturity_percent != null ? " · 就緒度 " + snap.crm_maturity_percent + "%" : "") +
      "</div>" +
      '<div class="do-plan-bridge-banner__actions">' +
      '<a href="#" class="do-plan-bridge-banner__btn" data-do-link="admin">⬅ G 行政 landing</a>' +
      '<a href="#" class="do-plan-bridge-banner__btn do-plan-bridge-banner__btn--war" data-do-link="war">📊 健康雷達（Plan）</a>' +
      '<a href="#" class="do-plan-bridge-banner__btn" data-do-link="match">🎯 事奉媒合</a>' +
      "</div>";

    var adminBtn = el.querySelector('[data-do-link="admin"]');
    var warBtn = el.querySelector('[data-do-link="war"]');
    var matchBtn = el.querySelector('[data-do-link="match"]');
    if (adminBtn) {
      adminBtn.addEventListener("click", function (ev) {
        return shellNavPlanDo(ev, "church_planning/sidebar_plan_v5_preview.html", "church_planning/landing_g_admin.html");
      });
    }
    if (warBtn) {
      warBtn.addEventListener("click", function (ev) {
        return shellNavPlanDo(ev, "church_planning/sidebar_plan_v5_preview.html", "church_planning/cta-os-war-room.html");
      });
    }
    if (matchBtn) {
      matchBtn.addEventListener("click", function (ev) {
        return shellNavPlanDo(
          ev,
          "church_planning/sidebar_plan_v5_preview.html",
          "church_planning/ministry-position-matchmaker.html"
        );
      });
    }
  }

  function renderChurchSizePicker(mountId, onChange) {
    var el = typeof mountId === "string" ? global.document.getElementById(mountId) : mountId;
    if (!el) return;
    var prof = getProfile();
    el.className = "do-church-size-bar";
    var html = '<span class="do-church-size-bar__label">教會規模：</span>';
    Object.keys(SIZES).forEach(function (id) {
      var s = SIZES[id];
      var active = prof.size === id ? " is-active" : "";
      html +=
        '<button type="button" class="do-church-size-bar__chip' + active + '" data-size="' + id + '" title="' + s.hint + '">' +
        s.label +
        "</button>";
    });
    html +=
      '<button type="button" class="do-church-size-bar__seed" id="doApplyProfileSeed">🌱 載入此規模示範資料</button>';
    el.innerHTML = html;
    el.querySelectorAll("[data-size]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-size");
        setProfileSize(id);
        renderChurchSizePicker(el, onChange);
        applyRoleLayout();
        if (typeof onChange === "function") onChange(getProfile());
      });
    });
    var seedBtn = el.querySelector("#doApplyProfileSeed");
    if (seedBtn && !seedBtn.__bound) {
      seedBtn.__bound = true;
      seedBtn.addEventListener("click", function () {
        seedBtn.disabled = true;
        seedBtn.textContent = "注入中…";
        var r = applySeedForProfile(getProfile().size);
        seedBtn.disabled = false;
        seedBtn.textContent = "🌱 載入此規模示範資料";
        if (!r || r.ok === false) {
          global.alert("種子載入失敗：" + ((r && r.reason) || "未知"));
          return;
        }
        if (typeof onChange === "function") onChange(getProfile());
        notifyDataChanged("all");
        try { global.location.reload(); } catch (eR) {}
      });
    }
  }

  function applyRoleLayout() {
    var prof = getProfile();
    var role = getDashboardRole();
    var hideLeader = prof.size === "household" || (prof.size === "small" && role !== "leader");
    ["crm-role-dashboard-card", "crm-kpi-v1-card"].forEach(function (id) {
      var node = global.document.getElementById(id);
      if (node) node.style.display = hideLeader ? "none" : "";
    });
    var today = global.document.getElementById("crm-today-desk-card");
    if (today && prof.size === "household") {
      today.style.borderLeftWidth = "6px";
    }
  }

  function initDashboard(opts) {
    opts = opts || {};
    renderPlanDoBanner(opts.planBannerMount || "do-plan-bridge-mount");
    renderChurchSizePicker(opts.sizeBarMount || "do-church-size-mount", opts.onProfileChange);
    applyRoleLayout();
    var params = {};
    try {
      params.from = new URLSearchParams(global.location.search || "").get("crm_from") || "";
    } catch (eP) {}
    if (params.from === "planning_step6" || params.from === "planning_g_admin" || params.from === "planning") {
      var prof = getProfile();
      if (!prof.updated_at && global.ChurchDataBridge) {
        var n = (global.ChurchDataBridge.getMembers && global.ChurchDataBridge.getMembers()) || [];
        if (n.length < 3) setProfileSize("household");
      }
    }
  }

  function refreshAll() {
    notifyDataChanged("all");
  }

  global.DoOpsActivation = {
    PROFILE_KEY: PROFILE_KEY,
    SIZES: SIZES,
    getProfile: getProfile,
    setProfileSize: setProfileSize,
    getDashboardRole: getDashboardRole,
    setDashboardRole: setDashboardRole,
    getPlanDoSnapshot: getPlanDoSnapshot,
    applyHouseholdDemoSeed: applyHouseholdDemoSeed,
    applySeedForProfile: applySeedForProfile,
    renderPlanDoBanner: renderPlanDoBanner,
    renderChurchSizePicker: renderChurchSizePicker,
    applyRoleLayout: applyRoleLayout,
    initDashboard: initDashboard,
    notifyDataChanged: notifyDataChanged,
    refreshAll: refreshAll
  };
})(typeof window !== "undefined" ? window : this);
