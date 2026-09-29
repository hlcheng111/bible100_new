/**
 * C 區 · 跨模組互聯（B 牧養 · 聖經研讀 · 學校管理 · AI 工具）
 */
(function (global) {
  "use strict";

  var PASTORAL_EVENTS_KEY = "pastoral_events_v1";
  var LESSON_DRAFT_KEY = "education_lesson_drafts_v1";
  var REPORT_DRAFT_KEY = "education_leader_report_drafts_v1";

  function bridge() {
    return global.ChurchDataBridge || null;
  }

  function hub() {
    return global.EducationDataHub || null;
  }

  function pastoralHub() {
    return global.PastoralDataHub || null;
  }

  function pastoralBridge() {
    return global.PastoralCrossModuleBridge || null;
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
      list.push({
        event_id: "pe_" + Date.now(),
        member_id: String(mid),
        event_type: payload.event_type || "care_note",
        ts: payload.ts || nowIso(),
        summary: payload.summary || "",
        source_module: payload.source_module || "education_cross_module",
        metadata: payload.metadata || {},
        created_at: nowIso()
      });
      if (list.length > 5000) list = list.slice(list.length - 5000);
      global.localStorage.setItem(PASTORAL_EVENTS_KEY, JSON.stringify(list));
    } catch (e2) {}
  }

  function onEducationAbsenceAlert(warning) {
    warning = warning || {};
    var memberId = warning.memberId;
    var name = warning.name || "學員";
    var className = warning.className || "主日學";
    var streak = warning.streak || 3;
    var H = pastoralHub();
    if (H && H.addHandoverTask) {
      H.addHandoverTask({
        type: "education_absence",
        memberId: memberId,
        memberName: name,
        reason: "【教育部預警】主日學「" + className + "」學員 " + name + " 已連續 " + streak + " 次缺席，請小組長協助探訪關懷。",
        dueInDays: 7,
        source: "educationSystemData",
        link: "../modules/support/visitation_index.html?crm_from=c_education&memberId=" + encodeURIComponent(String(memberId || ""))
      });
    }
    if (memberId) {
      safePastoralEvent({
        member_id: memberId,
        event_type: "absence_alert",
        summary: "主日學連續缺席 " + streak + " 次 · " + className,
        source_module: "education_attendance",
        metadata: { className: className, streak: streak }
      });
    }
    return true;
  }

  function recordAttendanceWithCare(classId, date, records) {
    var H = hub();
    if (!H) return { ok: false };
    var result = H.recordAttendanceSession(classId, date, records);
    var warnings = H.listAbsentWarnings();
    var triggered = [];
    warnings.forEach(function (w) {
      var recent = (records || []).some(function (r) {
        return Number(r.studentId) === Number(w.studentId) && !r.present;
      });
      if (recent && w.streak >= H.ABSENCE_ALERT_COUNT) {
        onEducationAbsenceAlert(w);
        triggered.push(w);
      }
    });
    (records || []).forEach(function (r) {
      if (!r.note) return;
      var student = H.getRawData().students.find(function (s) {
        return Number(s.id) === Number(r.studentId);
      });
      var mid = student && (student.memberId || student.parentMemberId);
      if (mid) {
        safePastoralEvent({
          member_id: mid,
          event_type: "care_note",
          summary: "主日學點名備註：" + r.note,
          source_module: "education_attendance",
          metadata: { classId: classId, date: date }
        });
      }
    });
    return { ok: true, session: result, triggered: triggered };
  }

  function getMergedTrainingForMember(memberId) {
    if (pastoralBridge() && pastoralBridge().getMergedTrainingRows) {
      return pastoralBridge().getMergedTrainingRows(memberId, []);
    }
    var B = bridge();
    if (!B || !B.getEducationSystemData) return [];
    var edu = B.getEducationSystemData();
    return (edu.pastoralDiscipleship || []).filter(function (x) {
      return String(x.memberId) === String(memberId);
    });
  }

  function getFellowshipParticipation(memberId) {
    var P = pastoralHub();
    if (!P || !P.getMemberAttendanceRate) return { score: null, label: "資料收集不足，需 B 區小組出席同步" };
    try {
      var rate = P.getMemberAttendanceRate(memberId);
      if (rate == null || isNaN(rate)) return { score: null, label: "尚無小組出席紀錄" };
      return { score: Math.round(rate), label: rate + "%", detail: "團契參與度" };
    } catch (e) {
      return { score: null, label: "資料收集不足" };
    }
  }

  function getMinistryParticipation(memberId) {
    var P = pastoralHub();
    if (!P || !P.getMemberMatrix) return { score: null, label: "資料收集不足，需 A/B 事奉紀錄" };
    try {
      var mx = P.getMemberMatrix(memberId);
      if (!mx || !mx.ministryTags || !mx.ministryTags.length) {
        return { score: null, label: "尚無事奉崗位紀錄" };
      }
      return { score: Math.min(100, mx.ministryTags.length * 25), label: mx.ministryTags.length + " 項服事", detail: "事奉投入度" };
    } catch (e) {
      return { score: null, label: "資料收集不足" };
    }
  }

  function getCrossModuleMetrics(memberId) {
    var H = hub();
    return {
      truth: H ? H.getTruthPrepScore(memberId) : { score: null, label: "—" },
      fellowship: getFellowshipParticipation(memberId),
      ministry: getMinistryParticipation(memberId)
    };
  }

  function getModuleLinks(prefix) {
    prefix = prefix || "../..";
    return {
      bibleStudy: {
        label: "聖經研讀 · 教材庫",
        items: [
          { label: "研讀總台（中文）", url: "../../../bible_study/dashboard.html?lang=CN", lang: "CN" },
          { label: "Bible Study（English）", url: "../../../bible_study/dashboard.html?lang=EN", lang: "EN" },
          { label: "Nghiên Cứu Kinh Thánh（Tiếng Việt）", url: "../../../bible_study/dashboard.html?lang=VI", lang: "VI" },
          { label: "多語言教材 languages/", url: "../../../languages/CN/index.html", lang: "multi" }
        ]
      },
      school: {
        label: "全校學籍 · 學校管理",
        url: "../../../school_management/dashboard.html",
        hint: "schoolMasterDatabase · 多校區學籍"
      },
      disciple: {
        label: "門訓動力站",
        url: "../../../disciple_dynamics/dashboard.html",
        hint: "長期裝備地圖"
      },
      ai: {
        label: "AI 工具中心",
        url: "../../../ai_tools/dashboard.html",
        hint: "備課草稿 · 教育部報告（需 API Key）"
      },
      pastoral: {
        label: "B 區 · 門徒訓練",
        url: prefix + "/modules/fellowship/pastoral-training.html?crm_from=c_education"
      },
      member: {
        label: "會友主檔",
        url: prefix + "/modules/members/member-integrated.html#tab-growth"
      },
      visitation: {
        label: "探訪關懷",
        url: prefix + "/modules/support/visitation_index.html?crm_from=c_education"
      }
    };
  }

  function memberProfileUrl(memberId, prefix) {
    var B = bridge();
    if (B && B.urlMemberProfile) return B.urlMemberProfile(memberId, prefix || "../");
    return "../members/member-integrated.html?memberId=" + encodeURIComponent(String(memberId));
  }

  function shellNavSchool(event) {
    if (global.bible100ShellNav) {
      return global.bible100ShellNav(event, {
        sidebarUrl: "school_management/sidebar.html",
        contentUrl: "school_management/dashboard.html"
      });
    }
    return true;
  }

  function shellNavBible(event, lang) {
    var url = "bible_study/dashboard.html" + (lang ? "?lang=" + lang : "");
    if (global.bible100ShellNav) {
      return global.bible100ShellNav(event, {
        sidebarUrl: "bible_study/sidebar.html",
        contentUrl: url
      });
    }
    return true;
  }

  function shellNavAi(event) {
    if (global.bible100ShellNav) {
      return global.bible100ShellNav(event, {
        sidebarUrl: "ai_tools/sidebar.html",
        contentUrl: "ai_tools/dashboard.html"
      });
    }
    return true;
  }

  function shellNavDisciple(event) {
    if (global.bible100ShellNav) {
      return global.bible100ShellNav(event, {
        sidebarUrl: "disciple_dynamics/sidebar.html",
        contentUrl: "disciple_dynamics/dashboard.html"
      });
    }
    return true;
  }

  global.EducationCrossModuleBridge = {
    onEducationAbsenceAlert: onEducationAbsenceAlert,
    recordAttendanceWithCare: recordAttendanceWithCare,
    getMergedTrainingForMember: getMergedTrainingForMember,
    getCrossModuleMetrics: getCrossModuleMetrics,
    getModuleLinks: getModuleLinks,
    memberProfileUrl: memberProfileUrl,
    shellNavSchool: shellNavSchool,
    shellNavBible: shellNavBible,
    shellNavAi: shellNavAi,
    shellNavDisciple: shellNavDisciple,
    safePastoralEvent: safePastoralEvent,
    LESSON_DRAFT_KEY: LESSON_DRAFT_KEY,
    REPORT_DRAFT_KEY: REPORT_DRAFT_KEY
  };
})(typeof window !== "undefined" ? window : this);
