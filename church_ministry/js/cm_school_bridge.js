/**
 * C 區主日學 ↔ school_management 名冊對齊摘要（只讀）
 */
(function (global) {
  "use strict";

  function readJson(key, fallback) {
    try {
      var raw = global.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function getEducationStudents() {
    var edu = readJson("educationSystemData", {});
    return Array.isArray(edu.students) ? edu.students : [];
  }

  function getSchoolStudents() {
    var sm = readJson("schoolMasterDatabase", {});
    return Array.isArray(sm.students) ? sm.students : [];
  }

  function normMemberId(v) {
    if (v == null || v === "") return "";
    return String(v).trim();
  }

  function getRosterAlignmentSummary() {
    var eduStudents = getEducationStudents();
    var schoolStudents = getSchoolStudents();
    var eduLinked = 0;
    var schoolLinked = 0;
    var overlap = 0;
    var eduIds = {};
    eduStudents.forEach(function (s) {
      var mid = normMemberId(s.memberId || s.parentMemberId);
      if (mid) {
        eduLinked++;
        eduIds[mid] = true;
      }
    });
    schoolStudents.forEach(function (s) {
      var mid = normMemberId(s.memberId || s.member_id);
      if (mid) {
        schoolLinked++;
        if (eduIds[mid]) overlap++;
      }
    });
    var warnings = [];
    if (global.EducationDataHub && global.EducationDataHub.listAbsentWarnings) {
      warnings = global.EducationDataHub.listAbsentWarnings();
    }
    return {
      eduTotal: eduStudents.length,
      eduLinked: eduLinked,
      schoolTotal: schoolStudents.length,
      schoolLinked: schoolLinked,
      overlapMemberIds: overlap,
      absentWarnings: warnings.length,
      eduLinkRate: eduStudents.length ? Math.round((eduLinked / eduStudents.length) * 100) : null,
      schoolLinkRate: schoolStudents.length ? Math.round((schoolLinked / schoolStudents.length) * 100) : null
    };
  }

  function shellNavSchoolChurchLink(event) {
    if (global.bible100ShellNav) {
      return global.bible100ShellNav(event, {
        sidebarUrl: "school_management/sidebar.html",
        contentUrl: "school_management/dashboard.html?focus=church_link"
      });
    }
    return true;
  }

  function shellNavSchoolDashboard(event) {
    if (global.bible100ShellNav) {
      return global.bible100ShellNav(event, {
        sidebarUrl: "school_management/sidebar.html",
        contentUrl: "school_management/dashboard.html"
      });
    }
    return true;
  }

  global.CmSchoolBridge = {
    getRosterAlignmentSummary: getRosterAlignmentSummary,
    shellNavSchoolChurchLink: shellNavSchoolChurchLink,
    shellNavSchoolDashboard: shellNavSchoolDashboard
  };
})(typeof window !== "undefined" ? window : this);
