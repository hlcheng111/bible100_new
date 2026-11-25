/**
 * CM · 義工排班規則檢查（E 區 · P4）
 *
 * 只「檢查並提醒」，不會自動排人、不會改排班、不會通知任何人；
 * 排班與否由事工負責人決定。本檔不連網、不呼叫 AI；缺資料時降級，不丟錯。
 *
 * 給小白：下面 RULES 的數字都可以用記事本改，存檔後重新整理頁面即可。
 * 規格：church_ministry/docs/MRM_ENGINEERING_PLAN_V1.md §5.5
 *
 * 資料來源：volunteerSystemData.schedules（ChurchDataBridge.getVolunteerData()）
 *   每筆：{ id, memberId, memberName, ministryId, ministryName, date:'YYYY-MM-DD', shift,
 *           confirmed, leaveStatus:'leave_only'|'swapped', substituteMemberId }
 */
(function (global) {
  "use strict";

  /** 小白可改 */
  var RULES = {
    window_days: 30, // 往後檢查幾天
    max_per_month: 4, // 同一人每月最多排幾次
    max_per_week: 2, // 同一人每週（週一至週日）最多排幾次
    confirm_within_days: 7, // 幾天內要服事、卻還沒確認，就提醒
    imbalance_ratio: 1.5, // 某人次數超過「平均 × 此倍數」（且至少多 2 次）才提醒不均
    min_people_for_balance: 3 // 至少幾位服事者才檢查平均
  };

  var SEVERITY_LABEL_ZH = { high: "重要", mid: "注意", low: "參考" };
  var KIND_LABEL_ZH = {
    double_booked: "同時段重複排",
    uncovered_leave: "請假無人代班",
    over_week: "一週排太多次",
    over_month: "一個月排太多次",
    unconfirmed_soon: "快到了還沒確認",
    understaffed: "人數不足",
    uneven: "次數不平均"
  };

  var DAY_MS = 24 * 60 * 60 * 1000;

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function ymdLocal(ms) {
    var d = new Date(ms);
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function parseYmd(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
    if (!m) return null;
    var d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
    if (isNaN(d.getTime()) || d.getUTCMonth() !== Number(m[2]) - 1) return null;
    return d.getTime();
  }

  function addDaysYmd(ymd, n) {
    var ms = parseYmd(ymd);
    if (ms === null) return ymd;
    var d = new Date(ms + n * DAY_MS);
    return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate());
  }

  /** 週一為一週起點 */
  function weekKey(ymd) {
    var ms = parseYmd(ymd);
    if (ms === null) return "";
    var dow = (new Date(ms).getUTCDay() + 6) % 7; // 週一=0
    return addDaysYmd(ymd, -dow);
  }

  function mergeRules(override) {
    var out = {};
    Object.keys(RULES).forEach(function (k) {
      out[k] = RULES[k];
    });
    if (override && typeof override === "object") {
      Object.keys(RULES).forEach(function (k) {
        var v = Number(override[k]);
        if (isFinite(v) && v >= 0) out[k] = v;
      });
    }
    return out;
  }

  /** 有效服事者：已換班用代班者；請假無代班＝無人 */
  function effectiveMember(row) {
    if (row.leaveStatus === "leave_only") return null;
    if (row.leaveStatus === "swapped" && row.substituteMemberId != null && row.substituteMemberId !== "") {
      return { id: String(row.substituteMemberId), name: row.substituteMemberName || String(row.substituteMemberId) };
    }
    if (row.memberId == null || row.memberId === "") return null;
    return { id: String(row.memberId), name: row.memberName || String(row.memberId) };
  }

  function slotKey(row) {
    return String(row.date) + "|" + (String(row.shift || "").trim() || "(未填班次)");
  }

  function issue(kind, severity, extra) {
    var o = { kind: kind, kind_label: KIND_LABEL_ZH[kind], severity: severity, severity_label: SEVERITY_LABEL_ZH[severity] };
    Object.keys(extra).forEach(function (k) {
      o[k] = extra[k];
    });
    return o;
  }

  /**
   * 檢查排班。
   * @param {Array} schedules 排班資料
   * @param {Object} [opts] { ministries:[{id,name,needPeople}], nowMs, rules }
   */
  function checkSchedules(schedules, opts) {
    opts = opts || {};
    var rules = mergeRules(opts.rules);
    var nowMs = isFinite(Number(opts.nowMs)) ? Number(opts.nowMs) : Date.now();
    var from = ymdLocal(nowMs);
    var to = addDaysYmd(from, rules.window_days);

    var skipped = 0;
    var rows = [];
    (Array.isArray(schedules) ? schedules : []).forEach(function (s) {
      if (!s || parseYmd(s.date) === null) {
        skipped++;
        return;
      }
      if (s.date < from || s.date > to) return; // 窗口外不檢查（也不算跳過）
      rows.push(s);
    });

    var issues = [];

    // 1) 請假無人代班
    rows.forEach(function (r) {
      if (r.leaveStatus === "leave_only") {
        issues.push(
          issue("uncovered_leave", "high", {
            date: r.date,
            memberId: r.memberId != null ? String(r.memberId) : "",
            name: r.memberName || String(r.memberId || ""),
            schedule_ids: [r.id],
            message: r.date + " " + (r.ministryName || "") + "：" + (r.memberName || r.memberId || "有人") + " 已請假，還沒有代班的人。"
          })
        );
      }
    });

    // 2) 同時段重複排（同一人同一日期＋班次出現兩次以上）
    var bySlotMember = {};
    rows.forEach(function (r) {
      var m = effectiveMember(r);
      if (!m) return;
      var k = slotKey(r) + "#" + m.id;
      (bySlotMember[k] = bySlotMember[k] || { member: m, rows: [] }).rows.push(r);
    });
    Object.keys(bySlotMember).forEach(function (k) {
      var g = bySlotMember[k];
      if (g.rows.length < 2) return;
      var first = g.rows[0];
      var places = g.rows
        .map(function (r) {
          return r.ministryName || String(r.ministryId || "?");
        })
        .join("、");
      issues.push(
        issue("double_booked", "high", {
          date: first.date,
          memberId: g.member.id,
          name: g.member.name,
          schedule_ids: g.rows.map(function (r) { return r.id; }),
          message: first.date + "（" + (String(first.shift || "").trim() || "未填班次") + "）：" + g.member.name + " 被排了 " + g.rows.length + " 個崗位（" + places + "），無法同時服事。"
        })
      );
    });

    // 3) 次數：每週／每月；並累計每人總次數供平衡檢查
    var perWeek = {};
    var perMonth = {};
    var total = {};
    var seenSlot = {}; // 同一人同一時段只算一次，避免重複排放大次數
    rows.forEach(function (r) {
      var m = effectiveMember(r);
      if (!m) return;
      var sk = slotKey(r) + "#" + m.id;
      if (seenSlot[sk]) return;
      seenSlot[sk] = true;
      var wk = m.id + "|" + weekKey(r.date);
      var mk = m.id + "|" + r.date.slice(0, 7);
      (perWeek[wk] = perWeek[wk] || { member: m, count: 0, week: weekKey(r.date) }).count++;
      (perMonth[mk] = perMonth[mk] || { member: m, count: 0, month: r.date.slice(0, 7) }).count++;
      (total[m.id] = total[m.id] || { id: m.id, name: m.name, count: 0 }).count++;
    });
    Object.keys(perWeek).forEach(function (k) {
      var g = perWeek[k];
      if (rules.max_per_week > 0 && g.count > rules.max_per_week) {
        issues.push(
          issue("over_week", "mid", {
            date: g.week,
            memberId: g.member.id,
            name: g.member.name,
            message: g.member.name + " 在 " + g.week + " 起的一週內排了 " + g.count + " 次（建議最多 " + rules.max_per_week + " 次）。"
          })
        );
      }
    });
    Object.keys(perMonth).forEach(function (k) {
      var g = perMonth[k];
      if (rules.max_per_month > 0 && g.count > rules.max_per_month) {
        issues.push(
          issue("over_month", "mid", {
            date: g.month,
            memberId: g.member.id,
            name: g.member.name,
            message: g.member.name + " 在 " + g.month + " 排了 " + g.count + " 次（建議最多 " + rules.max_per_month + " 次）。"
          })
        );
      }
    });

    // 4) 快到了還沒確認
    var soonTo = addDaysYmd(from, rules.confirm_within_days);
    rows.forEach(function (r) {
      var m = effectiveMember(r);
      if (!m) return;
      if (r.confirmed === false && r.date <= soonTo) {
        issues.push(
          issue("unconfirmed_soon", "mid", {
            date: r.date,
            memberId: m.id,
            name: m.name,
            schedule_ids: [r.id],
            message: r.date + " " + (r.ministryName || "") + "：" + m.name + " 還沒確認，請盡快聯絡確認。"
          })
        );
      }
    });

    // 5) 人數不足（需有崗位清單與 needPeople）
    var needBy = {};
    (Array.isArray(opts.ministries) ? opts.ministries : []).forEach(function (m) {
      if (m && m.id != null && Number(m.needPeople) > 0) needBy[String(m.id)] = m;
    });
    var bySlotMinistry = {};
    rows.forEach(function (r) {
      var mid = r.ministryId != null ? String(r.ministryId) : "";
      if (!mid || !needBy[mid]) return;
      var k = mid + "|" + slotKey(r);
      var g = (bySlotMinistry[k] = bySlotMinistry[k] || { ministry: needBy[mid], date: r.date, shift: r.shift, people: {} });
      var m = effectiveMember(r);
      if (m) g.people[m.id] = true;
    });
    Object.keys(bySlotMinistry).forEach(function (k) {
      var g = bySlotMinistry[k];
      var have = Object.keys(g.people).length;
      var need = Number(g.ministry.needPeople);
      if (have < need) {
        issues.push(
          issue("understaffed", "mid", {
            date: g.date,
            memberId: "",
            name: "",
            message: g.date + " " + (g.ministry.name || "") + "：需要 " + need + " 人，目前只排到 " + have + " 人（缺 " + (need - have) + " 人）。"
          })
        );
      }
    });

    // 6) 次數平衡（只提醒，列出偏多者與偏少者作參考）
    var members = Object.keys(total).map(function (k) { return total[k]; });
    var balance = members.slice().sort(function (a, b) { return b.count - a.count; });
    if (members.length >= rules.min_people_for_balance) {
      var sum = members.reduce(function (n, m) { return n + m.count; }, 0);
      var avg = sum / members.length;
      var light = members.filter(function (m) { return m.count <= avg * 0.5; }).map(function (m) { return m.name; });
      members.forEach(function (m) {
        if (m.count > avg * rules.imbalance_ratio && m.count - avg >= 2) {
          issues.push(
            issue("uneven", "low", {
              date: "",
              memberId: m.id,
              name: m.name,
              message: m.name + " 這段期間排了 " + m.count + " 次，高於平均（約 " + (Math.round(avg * 10) / 10) + " 次）。" +
                (light.length ? "可考慮讓次數較少的人輪替：" + light.slice(0, 5).join("、") + "。" : "")
            })
          );
        }
      });
    }

    var order = { high: 0, mid: 1, low: 2 };
    issues.sort(function (a, b) {
      return order[a.severity] - order[b.severity] || String(a.date).localeCompare(String(b.date));
    });
    var counts = { high: 0, mid: 0, low: 0 };
    issues.forEach(function (i) { counts[i.severity]++; });

    return {
      rules: rules,
      window: { from: from, to: to },
      scanned: rows.length,
      skipped: skipped,
      issues: issues,
      counts: counts,
      balance: balance
    };
  }

  /** 可貼到群組或會議的檢查報告（純文字，僅供參考） */
  function buildReportText(result) {
    var r = result || checkSchedules([]);
    var lines = [];
    lines.push("【排班檢查（僅供參考）】" + r.window.from + " 至 " + r.window.to);
    lines.push("共檢查 " + r.scanned + " 筆排班；重要 " + r.counts.high + "、注意 " + r.counts.mid + "、參考 " + r.counts.low + "。");
    if (r.skipped) lines.push("另有 " + r.skipped + " 筆日期不正確，未檢查。");
    if (!r.issues.length) {
      lines.push(r.scanned ? "沒有發現需要處理的事項。" : "這段期間沒有排班資料。");
    } else {
      r.issues.forEach(function (i) {
        lines.push("・[" + i.severity_label + "] " + i.message);
      });
    }
    lines.push("※ 這是規則檢查的建議，排班由事工負責人決定；系統不會自動改班或通知任何人。");
    return lines.join("\n");
  }

  /** 給 AI 排班草稿用的「規則附註」，可貼在提示詞後面（人審後才使用） */
  function buildPromptRules(rulesOverride) {
    var r = mergeRules(rulesOverride);
    return [
      "【排班規則（請遵守，輸出僅為建議草稿）】",
      "1）同一人在同一天、同一班次不可排兩個崗位；",
      "2）每人每週最多 " + r.max_per_week + " 次、每月最多 " + r.max_per_month + " 次，並盡量讓次數平均；",
      "3）已請假的人不排，需代班者標「待確認」；",
      "4）人數不足的崗位要明確標出缺口，不要硬湊人數；",
      "5）" + r.confirm_within_days + " 天內要服事的人標「需盡快確認」；",
      "6）只列建議，人選由事工負責人確認；不要自動通知任何人；不使用真實電話或隱私資料。"
    ].join("\n");
  }

  var api = {
    RULES: RULES,
    KIND_LABEL_ZH: KIND_LABEL_ZH,
    SEVERITY_LABEL_ZH: SEVERITY_LABEL_ZH,
    checkSchedules: checkSchedules,
    buildReportText: buildReportText,
    buildPromptRules: buildPromptRules,
    weekKey: weekKey
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    global.CmShiftRules = api;
  }
})(typeof window !== "undefined" ? window : this);
