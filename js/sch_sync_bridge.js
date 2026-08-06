/**
 * School · 全庫匯出／合併匯入（防覆寫災難 · W0）
 */
(function (g) {
  "use strict";

  var BUILD = "20260806sch";

  function checksum(obj) {
    try {
      return String(JSON.stringify(obj).length) + "-" + (obj.students ? obj.students.length : 0);
    } catch (e) {
      return "0";
    }
  }

  function buildExportBundle() {
    if (!g.schoolDB) throw new Error("schoolDB 未載入");
    var data = g.schoolDB.data;
    return {
      schema: "bible100.schoolMasterDatabase.v1",
      exported_at: new Date().toISOString(),
      checksum: checksum(data),
      device_hint: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 80) : "",
      data: data,
    };
  }

  function downloadJson(filename, obj) {
    var blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
    }, 500);
  }

  function quickBackupDownload() {
    var bundle = buildExportBundle();
    var stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    downloadJson("schoolMasterDatabase_backup_" + stamp + ".json", bundle);
    return bundle;
  }

  /** 比對本地與匯入包，回報衝突摘要 */
  function detectConflicts(incomingData) {
    if (!g.schoolDB) return { error: "schoolDB 未載入" };
    var local = g.schoolDB.data;
    var remote = incomingData || {};
    var report = { students: 0, teachers: 0, payments: 0, notes: [] };

    function countIdOverlap(localArr, remoteArr, key) {
      localArr = localArr || [];
      remoteArr = remoteArr || [];
      var localIds = {};
      localArr.forEach(function (r) {
        if (r && r.id != null) localIds[r.id] = r;
      });
      var overlap = 0;
      remoteArr.forEach(function (r) {
        if (r && r.id != null && localIds[r.id]) {
          overlap++;
          if (JSON.stringify(localIds[r.id]) !== JSON.stringify(r)) {
            report.notes.push(key + " id=" + r.id + " 內容不同");
          }
        }
      });
      return overlap;
    }

    report.students = countIdOverlap(local.students, remote.students, "students");
    report.teachers = countIdOverlap(local.teachers, remote.teachers, "teachers");
    report.payments = countIdOverlap(
      local.finance && local.finance.payments,
      remote.finance && remote.finance.payments,
      "finance.payments"
    );
    report.hasConflict = report.notes.length > 0 || report.students + report.teachers + report.payments > 0;
    return report;
  }

  /**
   * 匯入：replace 覆蓋；merge 保留本地較新 updatedAt
   */
  function importBundle(jsonText, mode) {
    mode = mode || "replace";
    if (!g.schoolDB) throw new Error("schoolDB 未載入");
    var parsed = JSON.parse(jsonText);
    var incoming = parsed.data || parsed;
    if (!incoming || typeof incoming !== "object") {
      throw new Error("備份格式錯誤");
    }

    if (mode === "replace") {
      var res = g.schoolDB.importAll(JSON.stringify(incoming));
      if (!res.ok) throw new Error(res.error || "匯入失敗");
      return { mode: "replace", conflicts: detectConflicts(incoming) };
    }

    var local = g.schoolDB.data;
    var merged = JSON.parse(JSON.stringify(local));

    function mergeArray(path, localArr, remoteArr) {
      localArr = localArr || [];
      remoteArr = remoteArr || [];
      var byId = {};
      localArr.forEach(function (r) {
        if (r && r.id != null) byId[r.id] = r;
      });
      remoteArr.forEach(function (r) {
        if (!r || r.id == null) return;
        if (!byId[r.id]) {
          byId[r.id] = r;
          return;
        }
        var la = byId[r.id].updatedAt || "";
        var ra = r.updatedAt || "";
        if (ra > la) byId[r.id] = r;
      });
      return Object.keys(byId)
        .map(function (k) {
          return byId[k];
        })
        .sort(function (a, b) {
          return (a.id || 0) - (b.id || 0);
        });
    }

    merged.students = mergeArray("students", merged.students, incoming.students);
    merged.teachers = mergeArray("teachers", merged.teachers, incoming.teachers);
    merged.courses = mergeArray("courses", merged.courses, incoming.courses);
    if (incoming.finance && incoming.finance.payments) {
      if (!merged.finance) merged.finance = {};
      merged.finance.payments = mergeArray(
        "payments",
        merged.finance.payments,
        incoming.finance.payments
      );
    }
    if (incoming.student && incoming.student.enrollments) {
      if (!merged.student) merged.student = {};
      merged.student.enrollments = mergeArray(
        "enrollments",
        merged.student.enrollments,
        incoming.student.enrollments
      );
    }
    if (incoming.student && incoming.student.attendance) {
      if (!merged.student) merged.student = {};
      merged.student.attendance = mergeArray(
        "attendance",
        merged.student.attendance,
        incoming.student.attendance
      );
    }
    if (!merged.meta) merged.meta = {};
    merged.meta.lastMergedAt = new Date().toISOString();
    merged.meta.mergeFromChecksum = parsed.checksum || checksum(incoming);

    var res2 = g.schoolDB.importAll(JSON.stringify(merged));
    if (!res2.ok) throw new Error(res2.error || "合併匯入失敗");
    return { mode: "merge", conflicts: detectConflicts(incoming) };
  }

  g.SchSyncBridge = {
    BUILD: BUILD,
    buildExportBundle: buildExportBundle,
    quickBackupDownload: quickBackupDownload,
    detectConflicts: detectConflicts,
    importBundle: importBundle,
    downloadJson: downloadJson,
  };
})(typeof window !== "undefined" ? window : this);
