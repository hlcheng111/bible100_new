/**
 * C 區 · 主日學／教育培訓 SSOT（educationSystemData）
 * 依賴 ChurchDataBridge；對齊 memberId 與 B 區 pastoralDiscipleship
 */
(function (global) {
  "use strict";

  var SCHEMA_VERSION = 2;
  var DEV_PLAN_LEGACY = "devPlanData";
  var ABSENCE_ALERT_COUNT = 3;
  var TEACHER_OVERLOAD_CLASSES = 2;

  var CURRICULUM_TEMPLATES = [
    { id: "daguan", label: "生命之光", weeks: 52, lang: "zh-TW" },
    { id: "ocs", label: "海外校園", weeks: 13, lang: "zh-TW" },
    { id: "adult_ss", label: "成人主日學系統教材", weeks: 12, lang: "zh-TW" },
    { id: "bible100", label: "Bible100 百步學經", weeks: 100, lang: "multi" }
  ];

  var EDUCATION_BUNDLE_KEYS = ["educationSystemData", "church_ministry_a_education"];

  function bridge() {
    return global.ChurchDataBridge || null;
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function esc(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function emptyStore() {
    return {
      schema_version: SCHEMA_VERSION,
      classes: [],
      students: [],
      teachers: [],
      curriculum: [],
      attendance: [],
      assessments: [],
      pastoralDiscipleship: [],
      annualGoals: [],
      outcomes: [],
      curriculumTemplates: CURRICULUM_TEMPLATES.slice(),
      meta: { lastAttendanceSession: null, migratedAt: null }
    };
  }

  function normalizeStore(raw) {
    var d = Object.assign(emptyStore(), raw || {});
    d.schema_version = SCHEMA_VERSION;
    if (!Array.isArray(d.classes)) d.classes = [];
    if (!Array.isArray(d.students)) d.students = [];
    if (!Array.isArray(d.teachers)) d.teachers = [];
    if (!Array.isArray(d.curriculum)) d.curriculum = [];
    if (!Array.isArray(d.attendance)) d.attendance = [];
    if (!Array.isArray(d.assessments)) d.assessments = [];
    if (!Array.isArray(d.pastoralDiscipleship)) d.pastoralDiscipleship = [];
    if (!Array.isArray(d.annualGoals)) d.annualGoals = [];
    if (!Array.isArray(d.outcomes)) d.outcomes = [];
    if (!d.meta) d.meta = {};
    return d;
  }

  function getRawData() {
    var B = bridge();
    if (!B || !B.getEducationSystemData) return emptyStore();
    return normalizeStore(B.getEducationSystemData());
  }

  function saveRawData(data) {
    var B = bridge();
    if (!B || !B.saveEducationSystemData) return false;
    var copy = normalizeStore(data);
    copy.meta = copy.meta || {};
    copy.meta.updatedAt = nowIso();
    B.saveEducationSystemData(copy);
    return true;
  }

  function migrateEducationStores() {
    var d = getRawData();
    var changed = false;

    try {
      var legacy = global.localStorage.getItem(DEV_PLAN_LEGACY);
      if (legacy) {
        var plans = JSON.parse(legacy);
        if (Array.isArray(plans) && plans.length) {
          plans.forEach(function (p) {
            var exists = d.annualGoals.some(function (g) {
              return g.legacyDevPlanId === p.id;
            });
            if (!exists) {
              d.annualGoals.push({
                id: "dg_" + (p.id || Date.now()),
                title: p.name || "發展計劃",
                period: p.period || "",
                targetValue: 100,
                targetUnit: "%",
                currentValue: p.progress != null ? p.progress : 0,
                goal: p.goal || "",
                legacyDevPlanId: p.id,
                source: "devPlanData"
              });
              changed = true;
            }
          });
          global.localStorage.removeItem(DEV_PLAN_LEGACY);
        }
      }
    } catch (eM) {}

    if (d.schema_version < SCHEMA_VERSION) {
      d.schema_version = SCHEMA_VERSION;
      changed = true;
    }
    if (changed) {
      d.meta.migratedAt = nowIso();
      saveRawData(d);
    }
    return d;
  }

  function ensureEducationSeed() {
    migrateEducationStores();
    var d = getRawData();
    if (d.classes.length > 0) return d;

    var members = [];
    var B = bridge();
    if (B && B.getMemberSystemData) {
      try {
        members = (B.getMemberSystemData().members || []).slice(0, 8);
      } catch (e) {}
    }

    d.classes = [
      { id: 1, name: "幼幼班", ageRange: "3-5歲", category: "toddler", teacherId: 1, capacity: 20, location: "一樓教室", schedule: "主日 9:00" },
      { id: 2, name: "兒童班", ageRange: "6-9歲", category: "children", teacherId: 2, capacity: 25, location: "二樓教室", schedule: "主日 9:00" },
      { id: 3, name: "少年班", ageRange: "10-12歲", category: "youth", teacherId: 3, capacity: 20, location: "三樓教室", schedule: "主日 9:00" }
    ];

    d.teachers = [
      { id: 1, memberId: members[0] ? members[0].id : 1, memberName: members[0] ? members[0].name : "張老師", specialty: "幼兒教育", classId: 1, certified: true, yearsOfService: 3, rating: "優秀" },
      { id: 2, memberId: members[1] ? members[1].id : 2, memberName: members[1] ? members[1].name : "李老師", specialty: "兒童教學", classId: 2, certified: true, yearsOfService: 5, rating: "優秀" },
      { id: 3, memberId: members[2] ? members[2].id : 3, memberName: members[2] ? members[2].name : "王老師", specialty: "青少年輔導", classId: 3, certified: false, yearsOfService: 2, rating: "良好" }
    ];

    var sid = 1;
    d.classes.forEach(function (cls) {
      for (var i = 0; i < 5; i++) {
        var m = members[sid % Math.max(members.length, 1)];
        d.students.push({
          id: sid,
          name: m ? m.name + "（學員）" : "學員" + sid,
          memberId: m ? m.id : null,
          classId: cls.id,
          age: cls.category === "toddler" ? 4 : cls.category === "children" ? 8 : 11,
          parentMemberId: m ? m.id : null
        });
        sid++;
      }
    });

    var baseDate = new Date();
    d.curriculum = [
      { id: 1, classId: 1, teacherId: 1, date: todayISO(), topic: "神愛世人", scripture: "約 3:16", materials: "生命之光 第1課", status: "planned", templateId: "daguan" },
      { id: 2, classId: 2, teacherId: 2, date: todayISO(), topic: "耶穌的門徒", scripture: "太 4:18-22", materials: "海外校園", status: "planned", templateId: "ocs" }
    ];

    saveRawData(d);
    return getRawData();
  }

  function getMembers() {
    var B = bridge();
    if (!B || !B.getMemberSystemData) return [];
    try {
      return B.getMemberSystemData().members || [];
    } catch (e) {
      return [];
    }
  }

  function resolveMemberName(memberId) {
    var m = getMembers().find(function (x) {
      return String(x.id) === String(memberId) || String(x.memberId) === String(memberId);
    });
    return m ? m.name : "";
  }

  function matchMembersByName(name) {
    var q = String(name || "").trim().toLowerCase();
    if (!q) return [];
    return getMembers()
      .filter(function (m) {
        var n = String(m.name || "").toLowerCase();
        return n === q || n.indexOf(q) >= 0 || q.indexOf(n) >= 0;
      })
      .slice(0, 5)
      .map(function (m) {
        return { memberId: m.id || m.memberId, name: m.name, phone: m.phone || "" };
      });
  }

  function addClass(payload) {
    var d = getRawData();
    var id = Math.max.apply(null, d.classes.map(function (c) { return Number(c.id) || 0; }).concat([0])) + 1;
    var rec = Object.assign({ id: id, teacherId: null }, payload);
    d.classes.push(rec);
    saveRawData(d);
    return rec;
  }

  function updateClass(id, patch) {
    var d = getRawData();
    var cls = d.classes.find(function (c) { return Number(c.id) === Number(id); });
    if (!cls) return null;
    Object.assign(cls, patch);
    saveRawData(d);
    return cls;
  }

  function deleteClass(id) {
    var d = getRawData();
    var nid = Number(id);
    d.classes = d.classes.filter(function (c) { return Number(c.id) !== nid; });
    d.students = d.students.filter(function (s) { return Number(s.classId) !== nid; });
    d.curriculum = d.curriculum.filter(function (c) { return Number(c.classId) !== nid; });
    d.attendance = d.attendance.filter(function (a) { return Number(a.classId) !== nid; });
    saveRawData(d);
    return true;
  }

  function addTeacher(payload) {
    var d = getRawData();
    var id = Math.max.apply(null, d.teachers.map(function (t) { return Number(t.id) || 0; }).concat([0])) + 1;
    var rec = Object.assign({ id: id, certified: false, yearsOfService: 0, rating: "合格", classId: null }, payload);
    if (rec.memberId && !rec.memberName) rec.memberName = resolveMemberName(rec.memberId);
    d.teachers.push(rec);
    saveRawData(d);
    return rec;
  }

  function updateTeacher(id, patch) {
    var d = getRawData();
    var t = d.teachers.find(function (x) { return Number(x.id) === Number(id); });
    if (!t) return null;
    Object.assign(t, patch);
    if (t.memberId) t.memberName = resolveMemberName(t.memberId) || t.memberName;
    saveRawData(d);
    return t;
  }

  function deleteTeacher(id) {
    var d = getRawData();
    d.teachers = d.teachers.filter(function (t) { return Number(t.id) !== Number(id); });
    saveRawData(d);
    return true;
  }

  function assignTeacherToClass(teacherId, classId) {
    var d = getRawData();
    var t = d.teachers.find(function (x) { return Number(x.id) === Number(teacherId); });
    var cls = d.classes.find(function (c) { return Number(c.id) === Number(classId); });
    if (!t || !cls) return null;
    d.teachers.forEach(function (x) {
      if (Number(x.classId) === Number(classId)) x.classId = null;
    });
    t.classId = Number(classId);
    cls.teacherId = Number(teacherId);
    saveRawData(d);
    return { teacher: t, class: cls };
  }

  function getTeacherLoad(teacherId) {
    var d = getRawData();
    var tid = Number(teacherId);
    var classes = d.classes.filter(function (c) { return Number(c.teacherId) === tid; });
    var t = d.teachers.find(function (x) { return Number(x.id) === tid; });
    if (t && t.classId) {
      var also = d.classes.filter(function (c) { return Number(c.id) === Number(t.classId); });
      classes = classes.concat(also.filter(function (c) {
        return classes.every(function (x) { return x.id !== c.id; });
      }));
    }
    return classes.length;
  }

  function addStudent(payload) {
    var d = getRawData();
    var id = Math.max.apply(null, d.students.map(function (s) { return Number(s.id) || 0; }).concat([0])) + 1;
    var rec = Object.assign({ id: id }, payload);
    d.students.push(rec);
    saveRawData(d);
    return rec;
  }

  function addCurriculum(payload) {
    var d = getRawData();
    var id = Math.max.apply(null, d.curriculum.map(function (c) { return Number(c.id) || 0; }).concat([0])) + 1;
    var rec = Object.assign({ id: id, status: "planned" }, payload);
    d.curriculum.push(rec);
    saveRawData(d);
    return rec;
  }

  function deleteCurriculum(id) {
    var d = getRawData();
    d.curriculum = d.curriculum.filter(function (c) { return Number(c.id) !== Number(id); });
    saveRawData(d);
    return true;
  }

  function applyCurriculumTemplate(templateId, classId, startDate) {
    var tpl = CURRICULUM_TEMPLATES.find(function (t) { return t.id === templateId; });
    if (!tpl) return { ok: false, error: "unknown_template" };
    var d = getRawData();
    var cls = d.classes.find(function (c) { return Number(c.id) === Number(classId); });
    if (!cls) return { ok: false, error: "class_not_found" };
    var teacher = d.teachers.find(function (t) { return Number(t.classId) === Number(classId); }) ||
      d.teachers.find(function (t) { return Number(t.id) === Number(cls.teacherId); });
    var start = startDate ? new Date(startDate) : new Date();
    var added = 0;
    var weeks = Math.min(tpl.weeks, 12);
    for (var w = 0; w < weeks; w++) {
      var dt = new Date(start);
      dt.setDate(dt.getDate() + w * 7);
      var cid = Math.max.apply(null, d.curriculum.map(function (c) { return Number(c.id) || 0; }).concat([0])) + 1 + w;
      d.curriculum.push({
        id: cid,
        classId: Number(classId),
        teacherId: teacher ? teacher.id : null,
        date: dt.toISOString().slice(0, 10),
        topic: tpl.label + " · 第 " + (w + 1) + " 課",
        scripture: "—",
        materials: tpl.label,
        status: w === 0 ? "planned" : "planned",
        templateId: templateId
      });
      added++;
    }
    saveRawData(d);
    return { ok: true, added: added, template: tpl.label };
  }

  function recordAttendanceSession(classId, date, records) {
    var d = getRawData();
    var sessionKey = "CLS_" + classId + "_" + String(date || todayISO()).replace(/-/g, "");
    records = records || [];
    records.forEach(function (r) {
      var student = d.students.find(function (s) { return Number(s.id) === Number(r.studentId); });
      var rec = {
        id: sessionKey + "_" + r.studentId,
        sessionKey: sessionKey,
        classId: Number(classId),
        studentId: Number(r.studentId),
        memberId: student && (student.memberId || student.parentMemberId) ? (student.memberId || student.parentMemberId) : r.memberId,
        date: date || todayISO(),
        present: !!r.present,
        note: r.note || ""
      };
      var ex = d.attendance.findIndex(function (a) { return a.id === rec.id; });
      if (ex >= 0) d.attendance[ex] = rec;
      else d.attendance.push(rec);
    });
    d.meta.lastAttendanceSession = { classId: classId, date: date || todayISO(), key: sessionKey };
    saveRawData(d);
    return { sessionKey: sessionKey, count: records.length };
  }

  function getAbsentStreak(studentId) {
    var d = getRawData();
    var records = d.attendance
      .filter(function (a) { return Number(a.studentId) === Number(studentId); })
      .sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
    var streak = 0;
    for (var i = 0; i < records.length; i++) {
      if (!records[i].present) streak++;
      else break;
    }
    return streak;
  }

  function listAbsentWarnings() {
    var d = getRawData();
    var out = [];
    d.students.forEach(function (s) {
      var streak = getAbsentStreak(s.id);
      if (streak >= ABSENCE_ALERT_COUNT) {
        var cls = d.classes.find(function (c) { return Number(c.id) === Number(s.classId); });
        out.push({
          studentId: s.id,
          memberId: s.memberId || s.parentMemberId,
          name: s.name,
          classId: s.classId,
          className: cls ? cls.name : "—",
          streak: streak
        });
      }
    });
    return out;
  }

  function getOverallAttendanceRate() {
    var d = getRawData();
    if (!d.attendance.length) return null;
    var present = d.attendance.filter(function (a) { return a.present; }).length;
    return Math.round((present / d.attendance.length) * 100);
  }

  function getWeeklyAttendanceTrend(weeks) {
    weeks = weeks || 8;
    var d = getRawData();
    var buckets = {};
    d.attendance.forEach(function (a) {
      var wk = String(a.date || "").slice(0, 10);
      if (!wk) return;
      if (!buckets[wk]) buckets[wk] = { total: 0, present: 0 };
      buckets[wk].total++;
      if (a.present) buckets[wk].present++;
    });
    var keys = Object.keys(buckets).sort().slice(-weeks);
    if (!keys.length) return { labels: [], data: [], empty: true };
    return {
      labels: keys.map(function (k, i) { return "週" + (i + 1); }),
      data: keys.map(function (k) {
        var b = buckets[k];
        return b.total ? Math.round((b.present / b.total) * 100) : 0;
      }),
      empty: false
    };
  }

  function getTruthPrepScore(memberId) {
    var d = getRawData();
    var total = d.curriculum.length;
    if (!total) return { score: null, label: "資料收集不足" };
    var completed = d.curriculum.filter(function (c) { return c.status === "completed"; }).length;
    var student = d.students.find(function (s) {
      return String(s.memberId) === String(memberId) || String(s.parentMemberId) === String(memberId);
    });
    if (!student) return { score: null, label: "非主日學學員" };
    var clsLessons = d.curriculum.filter(function (c) { return Number(c.classId) === Number(student.classId); });
    var done = clsLessons.filter(function (c) { return c.status === "completed"; }).length;
    var pct = clsLessons.length ? Math.round((done / clsLessons.length) * 100) : 0;
    return { score: pct, label: done + "/" + clsLessons.length + " 課", detail: "真理裝備度" };
  }

  function exportEducationBundle() {
    migrateEducationStores();
    var bundle = {
      schema_version: SCHEMA_VERSION,
      exportedAt: nowIso(),
      module: "church_ministry_c_education",
      stores: {}
    };
    EDUCATION_BUNDLE_KEYS.forEach(function (key) {
      try {
        var val = global.localStorage.getItem(key);
        if (val) bundle.stores[key] = JSON.parse(val);
      } catch (e) {}
    });
    var B = bridge();
    if (B && B.getEducationAModuleData) {
      bundle.stores.church_ministry_a_education = B.getEducationAModuleData();
    }
    return bundle;
  }

  function importEducationBundle(bundle, opts) {
    opts = opts || {};
    if (!bundle || !bundle.stores) return { ok: false, error: "invalid_bundle" };
    if (!opts.skipConfirm && global.confirm && !global.confirm("匯入將覆寫現有教育模組資料，確定繼續？")) {
      return { ok: false, error: "cancelled" };
    }
    Object.keys(bundle.stores).forEach(function (key) {
      if (EDUCATION_BUNDLE_KEYS.indexOf(key) >= 0) {
        global.localStorage.setItem(key, JSON.stringify(bundle.stores[key]));
      }
    });
    if (bridge() && bridge().saveEducationAModuleData && bundle.stores.church_ministry_a_education) {
      bridge().saveEducationAModuleData(bundle.stores.church_ministry_a_education);
    }
    migrateEducationStores();
    return { ok: true, keys: Object.keys(bundle.stores) };
  }

  function downloadEducationBundle() {
    var bundle = exportEducationBundle();
    var blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    var a = global.document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "education_bundle_" + todayISO() + ".json";
    a.click();
    return bundle;
  }

  function csvEsc(v) {
    var s = v == null ? "" : String(v);
    if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  function downloadBlobCsv(filename, lines) {
    var blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    var a = global.document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  }

  /** W2 · 學籍名冊 CSV */
  function downloadRosterCsv() {
    var d = getRawData();
    var lines = [["student_id", "name", "class", "member_id", "parent_member_id"].join(",")];
    d.students.forEach(function (s) {
      var cls = d.classes.find(function (c) { return Number(c.id) === Number(s.classId); });
      lines.push(
        [s.id, s.name, cls ? cls.name : "", s.memberId || "", s.parentMemberId || ""].map(csvEsc).join(",")
      );
    });
    downloadBlobCsv("edu_roster_" + todayISO() + ".csv", lines);
    return d.students.length;
  }

  /** W2 · 出席紀錄 CSV */
  function downloadAttendanceCsv() {
    var d = getRawData();
    var lines = [["date", "class", "student", "present", "note", "member_id"].join(",")];
    d.attendance.forEach(function (a) {
      var cls = d.classes.find(function (c) { return Number(c.id) === Number(a.classId); });
      var st = d.students.find(function (s) { return Number(s.id) === Number(a.studentId); });
      lines.push(
        [
          a.date || "",
          cls ? cls.name : a.classId,
          st ? st.name : a.studentId,
          a.present ? "yes" : "no",
          a.note || "",
          a.memberId || ""
        ]
          .map(csvEsc)
          .join(",")
      );
    });
    downloadBlobCsv("edu_attendance_" + todayISO() + ".csv", lines);
    return d.attendance.length;
  }

  /** W2 · 缺席預警 CSV（可交探訪） */
  function downloadAbsentWarningsCsv() {
    var warnings = listAbsentWarnings();
    var lines = [["name", "class", "streak", "member_id"].join(",")];
    warnings.forEach(function (w) {
      lines.push([w.name, w.className, w.streak, w.memberId || ""].map(csvEsc).join(","));
    });
    downloadBlobCsv("edu_absent_warnings_" + todayISO() + ".csv", lines);
    return warnings.length;
  }

  function printRosterBrief() {
    var d = getRawData();
    var rows = d.students
      .map(function (s) {
        var cls = d.classes.find(function (c) { return Number(c.id) === Number(s.classId); });
        return (
          "<tr><td>" +
          esc(s.name) +
          "</td><td>" +
          esc(cls ? cls.name : "—") +
          "</td><td>" +
          esc(s.memberId || s.parentMemberId || "") +
          "</td></tr>"
        );
      })
      .join("");
    var w = global.open("", "_blank");
    if (!w) {
      alert("無法開啟列印視窗");
      return;
    }
    w.document.write(
      '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>主日學名冊</title>' +
        "<style>body{font-family:Microsoft JhengHei,sans-serif;font-size:12px;padding:16px}" +
        "table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px;text-align:left}</style></head><body>" +
        "<h1>主日學名冊（" +
        d.students.length +
        "）</h1><table><thead><tr><th>姓名</th><th>班級</th><th>member_id</th></tr></thead><tbody>" +
        (rows || "<tr><td colspan='3'>無</td></tr>") +
        "</tbody></table><script>window.onload=function(){window.print();}</" +
        "script></body></html>"
    );
    w.document.close();
  }

  global.EducationDataHub = {
    SCHEMA_VERSION: SCHEMA_VERSION,
    ABSENCE_ALERT_COUNT: ABSENCE_ALERT_COUNT,
    TEACHER_OVERLOAD_CLASSES: TEACHER_OVERLOAD_CLASSES,
    CURRICULUM_TEMPLATES: CURRICULUM_TEMPLATES,
    migrateEducationStores: migrateEducationStores,
    ensureEducationSeed: ensureEducationSeed,
    getRawData: getRawData,
    saveRawData: saveRawData,
    getMembers: getMembers,
    resolveMemberName: resolveMemberName,
    matchMembersByName: matchMembersByName,
    addClass: addClass,
    updateClass: updateClass,
    deleteClass: deleteClass,
    addTeacher: addTeacher,
    updateTeacher: updateTeacher,
    deleteTeacher: deleteTeacher,
    assignTeacherToClass: assignTeacherToClass,
    getTeacherLoad: getTeacherLoad,
    addStudent: addStudent,
    addCurriculum: addCurriculum,
    deleteCurriculum: deleteCurriculum,
    applyCurriculumTemplate: applyCurriculumTemplate,
    recordAttendanceSession: recordAttendanceSession,
    getAbsentStreak: getAbsentStreak,
    listAbsentWarnings: listAbsentWarnings,
    getOverallAttendanceRate: getOverallAttendanceRate,
    getWeeklyAttendanceTrend: getWeeklyAttendanceTrend,
    getTruthPrepScore: getTruthPrepScore,
    exportEducationBundle: exportEducationBundle,
    importEducationBundle: importEducationBundle,
    downloadEducationBundle: downloadEducationBundle,
    downloadRosterCsv: downloadRosterCsv,
    downloadAttendanceCsv: downloadAttendanceCsv,
    downloadAbsentWarningsCsv: downloadAbsentWarningsCsv,
    printRosterBrief: printRosterBrief,
    esc: esc,
    todayISO: todayISO
  };
})(typeof window !== "undefined" ? window : this);
