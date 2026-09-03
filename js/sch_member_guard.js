/**
 * School · CentralMemberDB 護欄（禁止野蠚生長名冊 · W0）
 */
(function (g) {
  "use strict";

  var BUILD = "20260806sch";

  function getCentral() {
    if (g.CentralMemberDB && typeof g.CentralMemberDB.get === "function") {
      return g.CentralMemberDB.get();
    }
    try {
      var raw = localStorage.getItem("memberSystemData");
      return raw ? JSON.parse(raw) : { members: [] };
    } catch (e) {
      return { members: [] };
    }
  }

  function memberExists(memberId) {
    if (memberId == null || memberId === "") return false;
    var data = getCentral();
    var members = Array.isArray(data.members) ? data.members : [];
    var text = String(memberId);
    return members.some(function (m) {
      var id = m.memberId != null ? m.memberId : m.id;
      return String(id) === text;
    });
  }

  function isLinked(value) {
    if (!g.schoolDB || !g.schoolDB.isCentralMemberLink) return false;
    return g.schoolDB.isCentralMemberLink(value);
  }

  /**
   * 驗證新增／取錄學生。
   * pending：可無 memberId；active：必須已連結中央會友。
   */
  function validateStudentRecord(record, mode) {
    mode = mode || "insert";
    var rec = record || {};
    var status = rec.status || "active";
    var errors = [];

    if (!rec.name || !String(rec.name).trim()) {
      errors.push("姓名不可空白");
    }

    if (status === "active" && mode !== "pending_only") {
      if (!rec.memberId && !rec.member_id) {
        errors.push("在學學生必須從中央會友庫選人（member_id）");
      } else {
        var mid = rec.memberId || rec.member_id;
        if (!isLinked(mid)) {
          errors.push("member_id 未對齊中央會友庫，請先至教會會友庫建檔再連結");
        } else if (!memberExists(mid)) {
          errors.push("中央會友庫找不到此 member_id：" + mid);
        }
      }
    }

    return { ok: errors.length === 0, errors: errors };
  }

  /** 從中央會友建立學校學籍（SSOT 正路） */
  function createStudentFromMember(memberId, extra) {
    if (!g.schoolDB) throw new Error("schoolDB 未載入");
    extra = extra || {};
    if (!memberExists(memberId)) {
      throw new Error("中央會友庫無此會友，請先到教會事工建檔");
    }
    var data = getCentral();
    var members = data.members || [];
    var m = members.find(function (x) {
      var id = x.memberId != null ? x.memberId : x.id;
      return String(id) === String(memberId);
    });
    if (!m) throw new Error("找不到會友");

    var payload = {
      name: extra.name || m.name || m.fullName || "",
      gender: extra.gender || m.gender || "男",
      contact: extra.contact || m.phone || m.email || "",
      memberId: String(memberId),
      member_id: String(memberId),
      status: extra.status || "active",
      class_id: extra.class_id || extra.classId || 1,
      enrollmentDate: extra.enrollmentDate || new Date().toISOString().slice(0, 10),
      source: "central_member_ssot",
    };

    var v = validateStudentRecord(payload, "insert");
    if (!v.ok) throw new Error(v.errors.join("；"));

    return g.schoolDB.insert("students", payload);
  }

  /** 取錄：pending → active，強制 member 連結 */
  function admitStudent(studentId, memberId) {
    if (!g.schoolDB) throw new Error("schoolDB 未載入");
    var s = (g.schoolDB.data.students || []).find(function (x) {
      return x.id === studentId;
    });
    if (!s) throw new Error("找不到學生");
    if (memberId) {
      g.schoolDB.linkStudentToMember(studentId, memberId);
      s = g.schoolDB.data.students.find(function (x) {
        return x.id === studentId;
      });
    }
    var v = validateStudentRecord(Object.assign({}, s, { status: "active" }), "insert");
    if (!v.ok) throw new Error(v.errors.join("；"));
    return g.schoolDB.update("students", studentId, { status: "active" });
  }

  g.SchMemberGuard = {
    BUILD: BUILD,
    memberExists: memberExists,
    isLinked: isLinked,
    validateStudentRecord: validateStudentRecord,
    createStudentFromMember: createStudentFromMember,
    admitStudent: admitStudent,
    getCentralMembers: function () {
      if (g.schoolDB && g.schoolDB.getCentralMembers) return g.schoolDB.getCentralMembers();
      var data = getCentral();
      return (data.members || []).map(function (m) {
        return {
          id: String(m.memberId != null ? m.memberId : m.id),
          name: m.name || m.fullName || "",
        };
      });
    },
  };
})(typeof window !== "undefined" ? window : this);
