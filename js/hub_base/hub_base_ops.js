/**
 * Hub Base · Phase 3b 操作擴充
 * 審計篩選、健康檢查、異常流程（拒絕崗位／標籤保護）
 */
(function (global) {
  "use strict";

  function hub() {
    return global.HubBase || null;
  }

  function canonical() {
    return global.SmartMinistryCanonical || null;
  }

  function sid() {
    var H = hub();
    return H && H.getSpaceId ? H.getSpaceId() : "default";
  }

  function audit(entry) {
    var H = hub();
    if (H && H.logAudit) H.logAudit(entry);
  }

  function filterAuditEntries(options) {
    options = options || {};
    var H = hub();
    var rows = H && H.readAuditEntries ? H.readAuditEntries() : [];
    var memberId = options.member_id || options.target_id || "";
    var ministryId = options.ministry_id || "";
    var domain = options.domain || "";
    var action = options.action || "";
    var spaceFilter = options.spaceId || "";
    var since = options.since || "";
    var until = options.until || "";
    var keyword = (options.keyword || "").toLowerCase();

    return rows.filter(function (row) {
      if (domain && String(row.domain) !== domain) return false;
      if (action && String(row.action) !== action) return false;
      if (spaceFilter && String(row.spaceId) !== spaceFilter) return false;
      if (since && String(row.timestamp) < since) return false;
      if (until && String(row.timestamp) > until) return false;
      if (memberId) {
        var tid = String(memberId);
        var hit =
          String(row.target_id || "").indexOf(tid) >= 0 ||
          JSON.stringify(row.before || {}).indexOf(tid) >= 0 ||
          JSON.stringify(row.after || {}).indexOf(tid) >= 0;
        if (!hit) return false;
      }
      if (ministryId) {
        var mid = String(ministryId);
        var hitM =
          String(row.target_id || "").indexOf(mid) >= 0 ||
          JSON.stringify(row.before || {}).indexOf(mid) >= 0 ||
          JSON.stringify(row.after || {}).indexOf(mid) >= 0;
        if (!hitM) return false;
      }
      if (keyword) {
        var blob = JSON.stringify(row).toLowerCase();
        if (blob.indexOf(keyword) < 0) return false;
      }
      return true;
    });
  }

  function pushIssue(list, domain, id, field, message) {
    list.push({ domain: domain, id: id || "—", field: field, message: message });
  }

  function runHealthCheck() {
    var H = hub();
    var issues = [];
    var space = sid();
    var summary = {
      spaceId: space,
      checked_at: new Date().toISOString(),
      ok: true,
      counts: {},
    };

    var mem = H && H.readMembers ? H.readMembers() : null;
    if (mem && Array.isArray(mem.members)) {
      summary.counts.members = mem.members.length;
      mem.members.forEach(function (m) {
        if (m.id == null && m.memberId == null) pushIssue(issues, "member_crm", m.name, "id", "缺少 id/memberId");
        if (!m.name) pushIssue(issues, "member_crm", m.id || m.memberId, "name", "缺少姓名");
        if (mem.churchId == null && m.churchId == null) {
          pushIssue(issues, "member_crm", m.id || m.memberId, "churchId", "缺少 churchId（spaceId）");
        }
      });
    }

    var store = H && H.readSmartMinistryStore ? H.readSmartMinistryStore() : null;
    if (store) {
      summary.counts.talents = (store.talents || []).length;
      summary.counts.ministries = (store.ministries || []).length;
      summary.counts.assignments = (store.ministry_assignment || []).length;

      (store.talents || []).forEach(function (t) {
        var tid = t.talent_id || t.member_id || t.id;
        if (!tid) pushIssue(issues, "talent_pool", t.name, "talent_id", "缺少 talent_id");
        if (!t.name) pushIssue(issues, "talent_pool", tid, "name", "缺少姓名");
        if (!t.church_id && !store.meta) {
          pushIssue(issues, "talent_pool", tid, "church_id", "缺少 church_id");
        }
      });

      (store.ministries || []).forEach(function (m) {
        var mid = m.ministry_id || m.id;
        if (!mid) pushIssue(issues, "ministry_catalog", m.name, "id", "缺少 ministry_id");
        if (!m.name) pushIssue(issues, "ministry_catalog", mid, "name", "缺少崗位名");
      });

      (store.ministry_assignment || []).forEach(function (a) {
        if (!a.talent_id) pushIssue(issues, "assignment", a.id, "talent_id", "缺少 talent_id");
        if (!a.ministry_id) pushIssue(issues, "assignment", a.id, "ministry_id", "缺少 ministry_id");
        if (!a.status) pushIssue(issues, "assignment", a.id, "status", "缺少 status");
      });
    }

    summary.issue_count = issues.length;
    summary.ok = issues.length === 0;
    return { ok: summary.ok, summary: summary, issues: issues };
  }

  /**
   * Phase 5 預備：量表匯入恩賜標籤 — 人工確認過的不強制覆蓋
   */
  function proposeTalentTagImport(talentId, incoming, options) {
    options = options || {};
    var C = canonical();
    if (!C || !C.loadTalentById) {
      return { ok: false, error: "SmartMinistryCanonical unavailable" };
    }
    var tid = String(talentId || "");
    var row = C.loadTalentById(tid);
    if (!row) {
      return {
        ok: true,
        action: "apply_new",
        talent_id: tid,
        message: "尚無人才列，可直接建立",
        incoming: incoming,
      };
    }
    var protected_ = !!(row.leader_confirmed_at || row.tags_source === "manual_leader");
    var currentGift = String(row.gift || "").trim();
    var nextGift = String((incoming && incoming.gift) || incoming || "").trim();
    if (!nextGift) {
      return { ok: true, action: "noop", message: "無新恩賜資料", talent_id: tid };
    }
    if (protected_) {
      return {
        ok: true,
        action: "suggest_only",
        protected: true,
        talent_id: tid,
        current: { gift: currentGift, leader_confirmed_at: row.leader_confirmed_at },
        suggested: { gift: nextGift, tags_source: options.tags_source || "assessment" },
        message: "同工已人工確認標籤；僅顯示差異，須手動採納",
        diff: currentGift === nextGift ? null : { from: currentGift, to: nextGift },
      };
    }
    return {
      ok: true,
      action: "can_apply",
      talent_id: tid,
      current: { gift: currentGift },
      suggested: { gift: nextGift, tags_source: options.tags_source || "assessment" },
      message: "可套用（尚未人工確認）",
    };
  }

  function applyLeaderConfirmedTags(talentId, patch, meta) {
    meta = meta || {};
    var H = hub();
    var C = canonical();
    if (!C || !C.saveOrUpdateTalent) return { ok: false, error: "canonical unavailable" };
    if (H && !H.canPerform("write_talent")) return { ok: false, error: "forbidden" };
    var tid = String(talentId || "");
    var before = C.loadTalentById(tid);
    var row = Object.assign({}, patch || {}, {
      talent_id: tid,
      member_id: tid,
      leader_confirmed_at: new Date().toISOString(),
      tags_source: "manual_leader",
    });
    var res = C.saveOrUpdateTalent(row);
    audit({
      domain: "talent_pool",
      action: "leader_confirm_tags",
      target_id: tid,
      before: before ? { gift: before.gift, tags_source: before.tags_source } : null,
      after: { gift: row.gift, tags_source: row.tags_source },
      note: meta.note || "同工人工確認恩賜標籤",
      source: meta.source || "HubBaseOps.applyLeaderConfirmedTags",
    });
    return { ok: !!(res && res.success !== false), talent_id: tid };
  }

  /** 異常①：拒絕崗位 — 保留紀錄、標 rejected、寫審計 */
  function rejectAssignment(assignmentId, note) {
    var H = hub();
    var C = canonical();
    if (!C || !C.listMinistryAssignments || !C.updateMinistryAssignmentById) {
      return { ok: false, error: "canonical unavailable" };
    }
    if (H && !H.canPerform("write_talent")) return { ok: false, error: "forbidden" };
    var aid = String(assignmentId || "");
    var rows = C.listMinistryAssignments();
    var row = rows.find(function (r) {
      return String(r.id) === aid;
    });
    if (!row) return { ok: false, error: "not_found" };
    var before = Object.assign({}, row);
    var meta = Object.assign({}, row.metadata || {}, {
      invite_stage: "拒絕",
      invite_note: note || row.metadata && row.metadata.invite_note || "同工／會友婉拒崗位",
      rejected_at: new Date().toISOString(),
    });
    var upd = C.updateMinistryAssignmentById(aid, {
      status: "rejected",
      metadata: meta,
    });
    audit({
      domain: "talent_pool",
      action: "assignment_reject",
      target_id: String(row.talent_id) + ":" + String(row.ministry_id),
      before: { status: before.status, ministry: before.ministry_name, talent_id: before.talent_id },
      after: { status: "rejected", ministry: row.ministry_name, talent_id: row.talent_id },
      note: note || "拒絕崗位（保留歷史紀錄）",
      source: "HubBaseOps.rejectAssignment",
    });
    return { ok: !!(upd && upd.success), record: upd.record };
  }

  /** 異常②：中途退出 — 暫停／卸任服事、保留 assignment 歷史 */
  function pauseTalentService(talentId, note, status) {
    var H = hub();
    var C = canonical();
    if (!C || !C.setServiceStatus) return { ok: false, error: "canonical unavailable" };
    if (H && !H.canPerform("write_talent")) return { ok: false, error: "forbidden" };
    var tid = String(talentId || "");
    var st = status === "released" ? "released" : "pause";
    var before = C.loadTalentById ? C.loadTalentById(tid) : null;
    var res = C.setServiceStatus(tid, st, note || (st === "released" ? "卸任／調整崗位" : "中途退出／休息"));
    audit({
      domain: "talent_pool",
      action: st === "released" ? "service_released" : "service_pause",
      target_id: tid,
      before: before
        ? { service_status: before.service_status, status: before.status }
        : null,
      after: {
        service_status: st,
        status: st === "pause" ? "pause_service" : st === "released" ? "released" : "active",
      },
      note: note || "服事狀態變更（保留歷史 assignment）",
      source: "HubBaseOps.pauseTalentService",
    });
    return { ok: !!(res && res.success !== false), talent_id: tid, service_status: st };
  }

  var HubBaseOps = {
    filterAuditEntries: filterAuditEntries,
    runHealthCheck: runHealthCheck,
    proposeTalentTagImport: proposeTalentTagImport,
    applyLeaderConfirmedTags: applyLeaderConfirmedTags,
    rejectAssignment: rejectAssignment,
    pauseTalentService: pauseTalentService,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = HubBaseOps;
  } else {
    global.HubBaseOps = HubBaseOps;
    if (global.HubBase) {
      global.HubBase.filterAuditEntries = filterAuditEntries;
      global.HubBase.runHealthCheck = runHealthCheck;
      global.HubBase.proposeTalentTagImport = proposeTalentTagImport;
      global.HubBase.applyLeaderConfirmedTags = applyLeaderConfirmedTags;
      global.HubBase.rejectAssignment = rejectAssignment;
      global.HubBase.pauseTalentService = pauseTalentService;
    }
  }
})(typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : this);
