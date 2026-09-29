/**
 * B 牧养 · 跨模块互联（会友 growth 时间轴 · 活动报名费 · C 区学籍）
 * 依赖 ChurchDataBridge + PastoralDataHub
 */
(function (global) {
  "use strict";

  var PASTORAL_EVENTS_KEY = "pastoral_events_v1";

  function bridge() {
    return global.ChurchDataBridge || null;
  }

  function hub() {
    return global.PastoralDataHub || null;
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function safePastoralEvent(payload) {
    var B = bridge();
    if (B && B.appendPastoralEvent) {
      try {
        return B.appendPastoralEvent(payload);
      } catch (e) {}
    }
    try {
      var list = JSON.parse(global.localStorage.getItem(PASTORAL_EVENTS_KEY) || "[]");
      if (!Array.isArray(list)) list = [];
      var mid = payload.member_id != null ? payload.member_id : payload.memberId;
      var rec = {
        event_id: "pe_" + Date.now(),
        member_id: String(mid),
        event_type: payload.event_type || "care_note",
        ts: payload.ts || nowIso(),
        summary: payload.summary || "",
        source_module: payload.source_module || "pastoral_cross_module",
        metadata: payload.metadata || {},
        created_at: nowIso()
      };
      list.push(rec);
      if (list.length > 5000) list = list.slice(list.length - 5000);
      global.localStorage.setItem(PASTORAL_EVENTS_KEY, JSON.stringify(list));
      return rec;
    } catch (e2) {
      return null;
    }
  }

  function eventTypeLabel(t) {
    var map = {
      profile: "档案",
      gift_assessment: "恩赐评估",
      small_group_report: "小组回报",
      care_mission: "关怀任务",
      ministry_assignment: "事奉配岗",
      pastoral_event: "牧养事件",
      absence_alert: "缺席预警",
      absence: "缺席",
      attendance: "出席",
      activity_registration: "活动报名",
      event_fee_paid: "活动缴费",
      event_fee_pending: "待缴费",
      training_enrollment: "训练修课",
      pastor_visit_log: "牧者探访",
      care_call: "关怀"
    };
    return map[t] || t || "记录";
  }

  function hubTimelineExtras(memberId) {
    var H = hub();
    if (!H) return [];
    var id = String(memberId);
    var out = [];

    try {
      var st = H.getStrategyStore();
      (st.visitLogs || []).forEach(function (v) {
        if (v.targetMemberId != null && String(v.targetMemberId) !== id) return;
        out.push({
          event_id: "vl_" + (v.id || ""),
          event_type: "pastor_visit_log",
          ts: v.date || nowIso(),
          member_id: id,
          source: "pastoral_strategy_v1",
          summary: (v.author ? v.author + " · " : "") + (v.summary || "牧者探访日志"),
          link: "../fellowship/pastoral-strategy.html?crm_from=b_pastoral#tab-visits"
        });
      });
    } catch (e) {}

    try {
      var board = H.getEventsBoard();
      (board.registrations || []).forEach(function (reg) {
        (reg.enrolled || []).forEach(function (e) {
          if (e.memberId == null || String(e.memberId) !== id) return;
          var feeNote = reg.fee ? " · 费用 $" + reg.fee + (e.feeStatus === "paid" ? "（已缴）" : "（待缴）") : "";
          out.push({
            event_id: "reg_" + reg.id + "_" + id,
            event_type: e.feeStatus === "paid" ? "event_fee_paid" : "activity_registration",
            ts: reg.date || nowIso(),
            member_id: id,
            source: "pastoral_events_board_v1",
            summary: "报名 · " + (reg.eventTitle || "活动") + feeNote,
            link: "../fellowship/pastoral-events.html?crm_from=b_pastoral#tab-register",
            metadata: { regId: reg.id, feeStatus: e.feeStatus, txnId: e.txnId }
          });
        });
      });
    } catch (e2) {}

    try {
      H.getEnrollmentsForMember(memberId).forEach(function (enr) {
        var c = H.getCourses().find(function (x) {
          return x.id === enr.courseId;
        });
        out.push({
          event_id: "tr_" + enr.id,
          event_type: "training_enrollment",
          ts: nowIso(),
          member_id: id,
          source: "pastoral_training_v1",
          summary: (c ? c.title : enr.courseId) + " · " + H.enrollmentStatusLabel(enr.status),
          link: "../fellowship/pastoral-training.html?crm_from=b_pastoral&memberId=" + encodeURIComponent(id)
        });
      });
    } catch (e3) {}

    return out;
  }

  function getMemberGrowthTimeline(memberId, limit) {
    var id = String(memberId == null ? "" : memberId);
    var events = [];
    var B = bridge();

    if (B && typeof B.getMember360Timeline === "function") {
      events = (B.getMember360Timeline(id, 0) || []).map(function (e) {
        return Object.assign({}, e, { label: eventTypeLabel(e.event_type) });
      });
    } else if (B && B.listPastoralEvents) {
      events = (B.listPastoralEvents(id, 80) || []).map(function (e) {
        return {
          event_id: e.event_id,
          event_type: e.event_type || "pastoral_event",
          ts: e.ts || e.created_at,
          member_id: id,
          source: e.source_module || "pastoral_events_v1",
          summary: e.summary || e.event_type,
          label: eventTypeLabel(e.event_type)
        };
      });
    }

    var seen = {};
    events.forEach(function (e) {
      seen[String(e.event_id)] = true;
    });
    hubTimelineExtras(id).forEach(function (e) {
      if (!seen[String(e.event_id)]) {
        e.label = eventTypeLabel(e.event_type);
        events.push(e);
        seen[String(e.event_id)] = true;
      }
    });

    events.sort(function (a, b) {
      return String(b.ts || "").localeCompare(String(a.ts || ""));
    });

    var n = Number(limit || 50);
    if (n > 0) events = events.slice(0, n);
    return events;
  }

  function recordActivityRegistrationFee(memberId, regId) {
    var H = hub();
    var B = bridge();
    if (!H || !B || !B.saveFinanceTransaction) return { ok: false, error: "bridge_unavailable" };

    var board = H.getEventsBoard();
    var reg = (board.registrations || []).find(function (r) {
      return r.id === regId;
    });
    if (!reg) return { ok: false, error: "registration_not_found" };
    var fee = Number(reg.fee || 0);
    if (!fee) return { ok: false, error: "no_fee" };

    var m = H.getMemberById(memberId);
    try {
      var tx = B.saveFinanceTransaction(
        {
          type: "income",
          amount: fee,
          category: "event_fee",
          categoryName: "活动报名费",
          description: (reg.eventTitle || "教会活动") + " · " + (m ? m.name : "会友") + " (memberId " + memberId + ")",
          memberId: memberId,
          memberName: m ? m.name : "",
          status: "approved",
          source: "pastoral_events_board_v1",
          source_ref: regId
        },
        { operator_id: "pastoral_b_zone" }
      );
      (reg.enrolled || []).forEach(function (e) {
        if (String(e.memberId) === String(memberId)) {
          e.feeStatus = "paid";
          e.txnId = tx.txn_id;
          e.paidAt = nowIso();
        }
      });
      H.saveEventsBoard(board);
      safePastoralEvent({
        member_id: memberId,
        event_type: "event_fee_paid",
        summary: "活动报名缴费 $" + fee + " · " + (reg.eventTitle || ""),
        source_module: "pastoral_events",
        metadata: { regId: regId, txnId: tx.txn_id }
      });
      return { ok: true, txn: tx };
    } catch (e) {
      return { ok: false, error: e.message || "finance_save_failed" };
    }
  }

  function createPendingActivityFee(memberId, regId) {
    var H = hub();
    if (!H) return;
    var board = H.getEventsBoard();
    var reg = (board.registrations || []).find(function (r) {
      return r.id === regId;
    });
    if (!reg || !reg.fee) return;
    (reg.enrolled || []).forEach(function (e) {
      if (String(e.memberId) === String(memberId) && !e.feeStatus) {
        e.feeStatus = "pending";
      }
    });
    H.saveEventsBoard(board);
    safePastoralEvent({
      member_id: memberId,
      event_type: "event_fee_pending",
      summary: "活动报名待缴费 $" + reg.fee + " · " + (reg.eventTitle || ""),
      source_module: "pastoral_events",
      metadata: { regId: regId, amount: reg.fee }
    });
  }

  function syncTrainingToEducation(memberId, courseId, status) {
    var H = hub();
    var B = bridge();
    if (!H || !B || !B.getEducationSystemData || !B.saveEducationSystemData) return false;

    var course = H.getCourses().find(function (c) {
      return c.id === courseId;
    });
    var m = H.getMemberById(memberId);
    var edu = B.getEducationSystemData();
    if (!edu.pastoralDiscipleship) edu.pastoralDiscipleship = [];

    var ex = edu.pastoralDiscipleship.find(function (x) {
      return String(x.memberId) === String(memberId) && x.pastoralCourseId === courseId;
    });
    var rec = {
      id: ex && ex.id ? ex.id : "pd_" + Date.now(),
      memberId: memberId,
      memberName: m ? m.name : "",
      pastoralCourseId: courseId,
      courseTitle: course ? course.title : courseId,
      status: status,
      statusLabel: H.enrollmentStatusLabel(status),
      syncedAt: nowIso(),
      source: "pastoral_training_v1"
    };
    if (ex) Object.assign(ex, rec);
    else edu.pastoralDiscipleship.push(rec);
    B.saveEducationSystemData(edu);

    safePastoralEvent({
      member_id: memberId,
      event_type: "training_enrollment",
      summary: (course ? course.title : courseId) + " · " + H.enrollmentStatusLabel(status) + "（已同步主日学学籍）",
      source_module: "pastoral_training",
      metadata: { courseId: courseId, status: status }
    });
    return true;
  }

  function getEducationDiscipleshipForMember(memberId) {
    var B = bridge();
    if (!B || !B.getEducationSystemData) return [];
    var edu = B.getEducationSystemData();
    return (edu.pastoralDiscipleship || []).filter(function (x) {
      return String(x.memberId) === String(memberId);
    });
  }

  function getMergedTrainingRows(memberId, localTrainings) {
    var H = hub();
    var rows = [];
    (localTrainings || []).forEach(function (t) {
      rows.push({
        courseName: t.courseName,
        completedDate: t.completedDate || "—",
        instructor: t.instructor || "—",
        grade: t.grade || "—",
        source: "会友主档",
        id: t.id
      });
    });
    if (H) {
      H.getEnrollmentsForMember(memberId).forEach(function (enr) {
        var c = H.getCourses().find(function (x) {
          return x.id === enr.courseId;
        });
        rows.push({
          courseName: c ? c.title : enr.courseId,
          completedDate: enr.status === "completed" ? "已结业" : H.enrollmentStatusLabel(enr.status),
          instructor: c ? c.instructor : "—",
          grade: H.enrollmentStatusLabel(enr.status),
          source: "B · 门徒训练",
          link: "../fellowship/pastoral-training.html?crm_from=b_pastoral&memberId=" + memberId
        });
      });
    }
    getEducationDiscipleshipForMember(memberId).forEach(function (d) {
      rows.push({
        courseName: d.courseTitle,
        completedDate: d.syncedAt ? String(d.syncedAt).slice(0, 10) : "—",
        instructor: "主日学/C区",
        grade: d.statusLabel || d.status,
        source: "C · 学籍同步",
        link: "../education/education-integrated.html?crm_from=b_pastoral"
      });
    });
    return rows;
  }

  function financeUrlForMember(memberId) {
    return "../finance/finance-integrated.html?crm_from=b_pastoral&memberId=" + encodeURIComponent(String(memberId));
  }

  function readAssessmentJson(key) {
    try {
      return JSON.parse(global.localStorage.getItem(key) || "null");
    } catch (e) {
      return null;
    }
  }

  function giftLabelFromShapeRun(run) {
    if (!run || !run.derived) return null;
    var d = run.derived;
    var primary = d.top_gift || (d.shape_engine_contract && d.shape_engine_contract.top_gift);
    var scores = d.gift_scores || {};
    var secondary = "";
    Object.keys(scores).forEach(function (k) {
      if (k !== primary && scores[k] >= (scores[primary] || 0) - 0.5) secondary = k;
    });
    return {
      primary: primary || "teaching",
      secondary: secondary,
      scores: scores,
      topHeart: d.top_heart,
      syncedAt: nowIso(),
      source: "church_planning_shape",
      toolId: "shape"
    };
  }

  function pullGiftAssessmentForMember(memberId) {
    var H = hub();
    if (!H) return null;
    var id = String(memberId);
    var run = readAssessmentJson("bible100_assessment_latest_shape");
    if (run && run.member_id != null && String(run.member_id) !== id) {
      run = null;
    }
    if (!run) {
      var index = readAssessmentJson("bible100_assessment_runs");
      if (Array.isArray(index)) {
        var row = index
          .filter(function (r) {
            return r.tool_id === "shape" && r.member_id != null && String(r.member_id) === id;
          })
          .sort(function (a, b) {
            return (b.timestamp || 0) - (a.timestamp || 0);
          })[0];
        if (row) run = readAssessmentJson("bible100_assessment_latest_shape");
      }
    }
    if (!run || run.tool_id !== "shape") return null;
    var gift = giftLabelFromShapeRun(run);
    if (!gift) return null;
    var s = H.getOrgStore();
    if (!s.profiles360[id]) s.profiles360[id] = { visitNotes: [], prayerChain: [] };
    s.profiles360[id].giftAssessment = gift;
    try {
      global.localStorage.setItem("pastoral_org_v1", JSON.stringify(s));
    } catch (e) {}
    safePastoralEvent({
      member_id: id,
      event_type: "gift_assessment",
      summary: "SHAPE 恩赐同步 · " + gift.primary,
      source_module: "church_planning",
      metadata: { toolId: "shape" }
    });
    return gift;
  }

  function syncAllPlanningGifts() {
    var H = hub();
    if (!H) return 0;
    var n = 0;
    H.getMembers().forEach(function (m) {
      if (pullGiftAssessmentForMember(m.id)) n += 1;
    });
    return n;
  }

  function onVisitationCompleted(memberId, formValues) {
    var H = hub();
    if (!H || memberId == null) return;
    var name = (formValues && formValues.person) || "";
    var summary = (formValues && formValues.summary) || "探访完成";
    H.completePastoralTask("draft_abs_" + memberId);
    try {
      var drafts = JSON.parse(global.localStorage.getItem("worship_visitation_drafts_v1") || "[]");
      if (Array.isArray(drafts)) {
        drafts.forEach(function (d) {
          if (String(d.memberId) === String(memberId) && d.status === "pending") {
            d.status = "done";
            d.completedAt = nowIso();
          }
        });
        global.localStorage.setItem("worship_visitation_drafts_v1", JSON.stringify(drafts));
      }
    } catch (e) {}
    H.addVisitLog({
      targetMemberId: memberId,
      targetName: name || memberId,
      author: (formValues && formValues.worker) || "探访同工",
      summary: summary,
      painCategory: "",
      sensitivity: "normal",
      followupCycle: "1周内",
      source: "visitation_index_writeback"
    });
    safePastoralEvent({
      member_id: memberId,
      event_type: "care_call",
      summary: "探访完成 · " + summary.slice(0, 120),
      source_module: "visitation_index",
      metadata: { writeback: "pastoral_strategy_v1" }
    });
  }

  global.PastoralCrossModuleBridge = {
    safePastoralEvent: safePastoralEvent,
    getMemberGrowthTimeline: getMemberGrowthTimeline,
    eventTypeLabel: eventTypeLabel,
    recordActivityRegistrationFee: recordActivityRegistrationFee,
    createPendingActivityFee: createPendingActivityFee,
    syncTrainingToEducation: syncTrainingToEducation,
    getEducationDiscipleshipForMember: getEducationDiscipleshipForMember,
    getMergedTrainingRows: getMergedTrainingRows,
    financeUrlForMember: financeUrlForMember,
    pullGiftAssessmentForMember: pullGiftAssessmentForMember,
    syncAllPlanningGifts: syncAllPlanningGifts,
    onVisitationCompleted: onVisitationCompleted
  };
})(typeof window !== "undefined" ? window : this);
