/**
 * School · 閉環校驗（選課衝突、繳費連動 · W2）
 */
(function (g) {
  "use strict";

  var BUILD = "20260806sch";

  function db() {
    return g.schoolDB;
  }

  function parseTimeRange(text) {
    if (!text) return null;
    var m = String(text).match(/(\d{1,2}):(\d{2})\s*[-–—]\s*(\d{1,2}):(\d{2})/);
    if (!m) return null;
    return {
      start: parseInt(m[1], 10) * 60 + parseInt(m[2], 10),
      end: parseInt(m[3], 10) * 60 + parseInt(m[4], 10),
    };
  }

  function schedulesForCourse(courseId) {
    var d = db();
    if (!d || !d.data) return [];
    var sched = (d.data.course && d.data.course.schedules) || [];
    return sched.filter(function (s) {
      return String(s.courseId) === String(courseId);
    });
  }

  function enrolledCourseIds(studentId) {
    var d = db();
    if (!d || !d.data) return [];
    var en = (d.data.student && d.data.student.enrollments) || [];
    return en
      .filter(function (e) {
        return String(e.studentId) === String(studentId) && e.status !== "dropped";
      })
      .map(function (e) {
        return e.courseId;
      });
  }

  /** 檢查新選課是否與已選課程時間衝突 */
  function checkScheduleCollision(studentId, courseId) {
    var d = db();
    if (!d) return { ok: false, conflicts: [], error: "schoolDB 未載入" };

    var newSlots = schedulesForCourse(courseId);
    if (!newSlots.length) {
      return { ok: true, conflicts: [], note: "此課程尚無排課，跳過衝堂檢查" };
    }

    var existing = enrolledCourseIds(studentId);
    var conflicts = [];

    existing.forEach(function (cid) {
      if (String(cid) === String(courseId)) return;
      var oldSlots = schedulesForCourse(cid);
      newSlots.forEach(function (ns) {
        oldSlots.forEach(function (os) {
          if (ns.day !== os.day) return;
          var nt = parseTimeRange(ns.time);
          var ot = parseTimeRange(os.time);
          if (!nt || !ot) return;
          var overlap = nt.start < ot.end && ot.start < nt.end;
          if (overlap) {
            var courseA = (d.data.courses || []).find(function (c) {
              return String(c.id) === String(courseId);
            });
            var courseB = (d.data.courses || []).find(function (c) {
              return String(c.id) === String(cid);
            });
            conflicts.push({
              day: ns.day,
              time: ns.time,
              courseA: courseA ? courseA.name : courseId,
              courseB: courseB ? courseB.name : cid,
            });
          }
        });
      });
    });

    return { ok: conflicts.length === 0, conflicts: conflicts };
  }

  /** 選課（含衝堂與在學狀態校驗） */
  function enrollStudent(studentId, courseId, options) {
    options = options || {};
    var d = db();
    if (!d) throw new Error("schoolDB 未載入");

    var student = (d.data.students || []).find(function (s) {
      return String(s.id) === String(studentId);
    });
    if (!student) throw new Error("找不到學生");
    if (student.status === "pending") {
      throw new Error("待取錄學生不可選課，請教務先審核取錄");
    }

    var en = (d.data.student && d.data.student.enrollments) || [];
    if (
      en.some(function (e) {
        return String(e.studentId) === String(studentId) && String(e.courseId) === String(courseId);
      })
    ) {
      throw new Error("已選過此課程");
    }

    var collision = checkScheduleCollision(studentId, courseId);
    if (!collision.ok && !options.force) {
      var msg = collision.conflicts
        .map(function (c) {
          return "星期" + c.day + " " + c.time + "：「" + c.courseA + "」與「" + c.courseB + "」衝堂";
        })
        .join("\n");
      throw new Error("上課時間衝突：\n" + msg);
    }

    var semester = options.semester || (d.getDefaultSemester ? d.getDefaultSemester() : "2024-2");
    var row = d.insert("student.enrollments", {
      studentId: studentId,
      courseId: courseId,
      semester: semester,
      status: "active",
    });

    if (options.createTuition !== false && d.data.finance) {
      syncTuitionForEnrollment(studentId, courseId, semester);
    }

    return { enrollment: row, collision: collision };
  }

  /** 選課後自動建立待繳學費（若尚無同學期紀錄） */
  function syncTuitionForEnrollment(studentId, courseId, semester) {
    var d = db();
    if (!d) return null;
    var payments = (d.data.finance && d.data.finance.payments) || [];
    var exists = payments.some(function (p) {
      return (
        String(p.studentId) === String(studentId) &&
        p.semester === semester &&
        p.status === "pending" &&
        String(p.courseId || "") === String(courseId)
      );
    });
    if (exists) return null;

    var course = (d.data.courses || []).find(function (c) {
      return String(c.id) === String(courseId);
    });
    var amount = (course && course.tuition) || (course && course.fee) || 500;
    return d.insert("finance.payments", {
      studentId: studentId,
      courseId: courseId,
      amount: Number(amount) || 500,
      semester: semester,
      status: "pending",
      memo: "選課自動建立 · " + (course ? course.name : courseId),
    });
  }

  /** 標記已繳 + 寫入收支 transactions */
  function markPaidWithLedger(paymentId, options) {
    var d = db();
    if (!d) throw new Error("schoolDB 未載入");
    options = options || {};
    var payment = d.markPaymentPaid(paymentId, options);

    if (!d.data.finance.transactions) d.data.finance.transactions = [];
    var dup = d.data.finance.transactions.some(function (t) {
      return t.source_payment_id === paymentId;
    });
    if (!dup) {
      d.insert("finance.transactions", {
        type: "income",
        category: "school_tuition",
        amount: Number(payment.amount) || 0,
        memo: "學費已繳 · 收據 " + (payment.receiptNo || payment.id),
        at: payment.paymentDate || new Date().toISOString(),
        source_payment_id: paymentId,
      });
    }
    return payment;
  }

  g.SchValidation = {
    BUILD: BUILD,
    checkScheduleCollision: checkScheduleCollision,
    enrollStudent: enrollStudent,
    syncTuitionForEnrollment: syncTuitionForEnrollment,
    markPaidWithLedger: markPaidWithLedger,
  };
})(typeof window !== "undefined" ? window : this);
