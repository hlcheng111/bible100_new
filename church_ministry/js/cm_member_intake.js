/**
 * CM · 表單回覆 → 會友草稿（P5，D 宣教外展／A4 入庫）
 *
 * 流程：同工把 Google 表單（或試算表）的回覆「複製貼上」→ 本檔解析成「草稿」→ 人逐筆確認 → 才寫入會友名冊。
 * 規則（不可偏）：
 *  1. 草稿不是會友：確認前不寫入名冊；寫入只走 ChurchDataBridge 的會友儲存函式（由面板呼叫，本檔不寫入）。
 *  2. 不連網、不呼叫 AI、不自動判斷屬靈狀態（屬靈階段由人在畫面選）。
 *  3. 敏感欄位（代禱、病痛、身分證、奉獻…）一律不匯入，並列出「未匯入的欄位」。
 *  4. 疑似重複（電話或電郵相同）預設擋下，須人明確確認；同名只提醒。
 *  5. 缺資料不報錯：姓名沒填＝無效草稿；其餘缺漏只提醒。
 *
 * 給小白：下面 HEADER_ALIASES 可用記事本增減（表單的問題標題寫法不同時，把它加進去）。
 * 規格：church_ministry/docs/MRM_ENGINEERING_PLAN_V1.md §5.7
 */
(function (global) {
  "use strict";

  /** 表單問題標題 → 會友欄位（標題「包含」這些字就算） */
  var HEADER_ALIASES = {
    name: ["姓名", "名字", "全名", "中文姓名", "fullname", "name"],
    phone: ["電話", "手機", "聯絡電話", "mobile", "phone", "電話", "手機"],
    email: ["電郵", "電子郵件", "郵箱", "email", "e-mail", "電郵", "郵箱"],
    gender: ["性別", "性別", "gender"],
    birthday: ["生日", "出生日期", "出生", "birthday", "birth"],
    address: ["地址", "住址", "address"],
    inviter: ["介紹人", "邀請人", "誰邀請", "誰介紹", "介紹人", "邀請人", "referrer"],
    note: ["備註", "備註", "其他意見", "其他", "note", "remark"],
    timestamp: ["時間戳記", "時間戳", "填表時間", "timestamp", "提交時間"]
  };

  /** 標題含這些字：不匯入（敏感，只留在原表單） */
  var SENSITIVE_HEADER_WORDS = [
    "代禱", "代禱", "禱告", "禱告", "祈禱", "prayer", "密碼", "密碼", "身份證", "身分證", "護照", "護照",
    "病", "健康", "疾病", "財務", "財", "奉獻", "奉獻", "信用卡", "銀行", "銀行", "家暴", "輔導", "輔導"
  ];

  var MAX_ROWS = 500;

  /* ───────── 解析 ───────── */

  function stripBom(s) {
    return s && s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
  }

  /** 解析 TSV（試算表複製）或 CSV（含引號、引號內換行、"" 轉義） */
  function parseTable(text) {
    var s = stripBom(String(text == null ? "" : text)).replace(/\r\n?/g, "\n");
    var firstLine = s.split("\n")[0] || "";
    var delim = firstLine.indexOf("\t") >= 0 ? "\t" : ",";
    var rows = [];
    var row = [];
    var cell = "";
    var inQ = false;
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (inQ) {
        if (ch === '"') {
          if (s.charAt(i + 1) === '"') {
            cell += '"';
            i++;
          } else {
            inQ = false;
          }
        } else {
          cell += ch;
        }
      } else if (ch === '"' && cell === "") {
        inQ = true;
      } else if (ch === delim) {
        row.push(cell);
        cell = "";
      } else if (ch === "\n") {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += ch;
      }
    }
    if (cell !== "" || row.length) {
      row.push(cell);
      rows.push(row);
    }
    rows = rows.filter(function (r) {
      return r.some(function (c) {
        return String(c).trim() !== "";
      });
    });
    if (!rows.length) return { headers: [], rows: [], truncated: false, delimiter: delim };
    var headers = rows[0].map(function (h) {
      return String(h).trim();
    });
    var body = rows.slice(1);
    var truncated = body.length > MAX_ROWS;
    if (truncated) body = body.slice(0, MAX_ROWS);
    return { headers: headers, rows: body, truncated: truncated, delimiter: delim === "\t" ? "tab" : "comma" };
  }

  function normHeader(h) {
    return String(h == null ? "" : h)
      .toLowerCase()
      .replace(/[\s\u3000*＊:：?？()（）\[\]【】_]/g, "");
  }

  function hasAny(s, words) {
    for (var i = 0; i < words.length; i++) {
      if (s.indexOf(words[i]) >= 0) return true;
    }
    return false;
  }

  /** 標題 → 欄位對應；敏感欄位與看不懂的欄位放進 ignored */
  function mapHeaders(headers) {
    var mapping = {}; // field → column index
    var ignored = []; // {header, reason}
    (headers || []).forEach(function (h, idx) {
      var n = normHeader(h);
      if (!n) return;
      if (hasAny(n, SENSITIVE_HEADER_WORDS.map(normHeader))) {
        ignored.push({ header: h, reason: "敏感欄位，不匯入（請留在原表單，由牧者處理）" });
        return;
      }
      var matched = "";
      Object.keys(HEADER_ALIASES).some(function (field) {
        if (hasAny(n, HEADER_ALIASES[field].map(normHeader))) {
          matched = field;
          return true;
        }
        return false;
      });
      if (!matched) {
        ignored.push({ header: h, reason: "看不出對應哪個欄位，未匯入" });
        return;
      }
      if (mapping[matched] !== undefined) {
        ignored.push({ header: h, reason: "已用前面的「" + headers[mapping[matched]] + "」，這欄未匯入" });
        return;
      }
      mapping[matched] = idx;
    });
    return { mapping: mapping, ignored: ignored };
  }

  /* ───────── 欄位整理 ───────── */

  function cleanName(s) {
    return String(s == null ? "" : s).replace(/\s+/g, " ").trim();
  }

  function digitsOf(s) {
    return String(s == null ? "" : s).replace(/\D/g, "");
  }

  function cleanPhone(s) {
    var raw = String(s == null ? "" : s).trim();
    if (!raw) return { value: "", warn: "" };
    var plus = raw.charAt(0) === "+";
    var d = digitsOf(raw);
    if (d.length < 6 || d.length > 15) return { value: "", warn: "電話號碼位數不對（" + raw + "），已留空" };
    return { value: (plus ? "+" : "") + d, warn: "" };
  }

  function cleanEmail(s) {
    var raw = String(s == null ? "" : s).trim().toLowerCase();
    if (!raw) return { value: "", warn: "" };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) return { value: "", warn: "電郵格式不對（" + raw + "），已留空" };
    return { value: raw, warn: "" };
  }

  function cleanGender(s) {
    var v = String(s == null ? "" : s).trim().toLowerCase();
    if (!v) return "";
    if (v === "男" || v === "男性" || v === "male" || v === "m") return "男";
    if (v === "女" || v === "女性" || v === "female" || v === "f") return "女";
    return "";
  }

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  /** 只接受 yyyy-mm-dd、yyyy/m/d、yyyy年m月d日（日月順序有歧義的寫法一律不收） */
  function parseDateLoose(s) {
    var m = /^\s*(\d{4})[-\/年](\d{1,2})[-\/月](\d{1,2})/.exec(String(s == null ? "" : s));
    if (!m) return null;
    var y = Number(m[1]);
    var mo = Number(m[2]);
    var d = Number(m[3]);
    var dt = new Date(Date.UTC(y, mo - 1, d));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
    return y + "-" + pad(mo) + "-" + pad(d);
  }

  function todayYmd(nowMs) {
    var d = new Date(nowMs);
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function ageFrom(ymd, nowYmd) {
    var a = ymd.split("-").map(Number);
    var b = nowYmd.split("-").map(Number);
    var age = b[0] - a[0];
    if (b[1] < a[1] || (b[1] === a[1] && b[2] < a[2])) age--;
    return age;
  }

  function lastDigits(d, n) {
    return d.length >= n ? d.slice(-n) : d;
  }

  function samePhone(a, b) {
    var da = digitsOf(a);
    var db = digitsOf(b);
    if (!da || !db) return false;
    if (da === db) return true;
    return da.length >= 8 && db.length >= 8 && lastDigits(da, 8) === lastDigits(db, 8);
  }

  function memberName(m) {
    return cleanName((m && (m.name || m.fullName)) || "");
  }

  /** 草稿對現有名冊的疑似重複（寫入前會再查一次，避免畫面放久了名冊已變） */
  function duplicatesAgainst(d, existingMembers) {
    var out = [];
    (Array.isArray(existingMembers) ? existingMembers : []).forEach(function (m) {
      if (!m) return;
      var who = memberName(m) || String(m.memberId != null ? m.memberId : m.id);
      if (d.phone && samePhone(d.phone, m.phone)) out.push({ kind: "phone", strong: true, who: who, where: "名冊" });
      if (d.email && m.email && String(m.email).trim().toLowerCase() === d.email)
        out.push({ kind: "email", strong: true, who: who, where: "名冊" });
      if (d.name && memberName(m) === d.name) out.push({ kind: "name", strong: false, who: who, where: "名冊" });
    });
    return out;
  }

  /* ───────── 草稿 ───────── */

  /**
   * @param {{headers:string[], rows:string[][]}} table
   * @param {Array} existingMembers 現有會友（只讀，用來查重）
   * @param {{nowMs?:number, batchId?:string}} [opts]
   */
  function buildDrafts(table, existingMembers, opts) {
    opts = opts || {};
    var nowMs = isFinite(Number(opts.nowMs)) ? Number(opts.nowMs) : Date.now();
    var today = todayYmd(nowMs);
    var batch = opts.batchId || nowMs.toString(36);
    var existing = Array.isArray(existingMembers) ? existingMembers : [];
    var hm = mapHeaders((table && table.headers) || []);
    var map = hm.mapping;
    var drafts = [];

    function get(row, field) {
      var idx = map[field];
      return idx === undefined ? "" : String(row[idx] == null ? "" : row[idx]).trim();
    }

    ((table && table.rows) || []).forEach(function (row, i) {
      var warnings = [];
      var name = cleanName(get(row, "name"));
      var ph = cleanPhone(get(row, "phone"));
      var em = cleanEmail(get(row, "email"));
      if (ph.warn) warnings.push(ph.warn);
      if (em.warn) warnings.push(em.warn);
      var gender = cleanGender(get(row, "gender"));
      if (get(row, "gender") && !gender) warnings.push("性別看不懂（" + get(row, "gender") + "），已留空");

      var birthday = "";
      var age = "";
      var bRaw = get(row, "birthday");
      if (bRaw) {
        var b = parseDateLoose(bRaw);
        var a = b ? ageFrom(b, today) : null;
        if (b && a >= 0 && a <= 120) {
          birthday = b;
          age = a;
        } else {
          warnings.push("生日格式或日期不對（" + bRaw + "），已略過；請用 年-月-日");
        }
      }

      var ts = parseDateLoose(get(row, "timestamp"));
      var firstVisit = ts && ts <= today ? ts : today;

      var noteParts = [];
      if (get(row, "inviter")) noteParts.push("介紹人：" + get(row, "inviter"));
      if (get(row, "note")) noteParts.push("表單備註：" + get(row, "note"));

      var d = {
        draft_id: "fd_" + batch + "_" + (i + 1),
        row_no: i + 2, // 試算表列號（第 1 列是標題）
        name: name,
        phone: ph.value,
        email: em.value,
        gender: gender,
        birthday: birthday,
        age: age,
        address: get(row, "address"),
        first_visit_date: firstVisit,
        notes: noteParts.join("；"),
        warnings: warnings,
        duplicates: [], // {kind:'phone'|'email'|'name', strong:boolean, who:string, where:'名冊'|'本批'}
        status: "ready"
      };
      if (!d.name) {
        d.status = "invalid";
        d.warnings.unshift("沒有姓名，無法建立會友");
      }
      if (!d.phone && !d.email) d.warnings.push("沒有電話也沒有電郵，之後無法聯絡，請補資料");
      drafts.push(d);
    });

    // 查重：對名冊 + 同一批
    drafts.forEach(function (d, idx) {
      if (d.status === "invalid") return;
      d.duplicates = duplicatesAgainst(d, existing);
      for (var j = 0; j < idx; j++) {
        var o = drafts[j];
        if (o.status === "invalid") continue;
        if (d.phone && o.phone && samePhone(d.phone, o.phone))
          d.duplicates.push({ kind: "phone", strong: true, who: o.name + "（第 " + o.row_no + " 列）", where: "本批" });
        if (d.email && o.email && d.email === o.email)
          d.duplicates.push({ kind: "email", strong: true, who: o.name + "（第 " + o.row_no + " 列）", where: "本批" });
        if (d.name && o.name === d.name && !(d.phone && o.phone) && !(d.email && o.email))
          d.duplicates.push({ kind: "name", strong: false, who: o.name + "（第 " + o.row_no + " 列）", where: "本批" });
      }
      if (d.duplicates.some(function (x) { return x.strong; })) d.status = "duplicate";
      else if (d.duplicates.length || d.warnings.length) d.status = "check";
    });

    return {
      drafts: drafts,
      mapping: map,
      ignored: hm.ignored,
      has_name_column: map.name !== undefined,
      truncated: !!(table && table.truncated)
    };
  }

  /** 下一個會友編號：沿用名冊現行做法（數字最大值 + 1），不另造 ID 體系 */
  function nextMemberId(existingMembers) {
    var max = 0;
    (Array.isArray(existingMembers) ? existingMembers : []).forEach(function (m) {
      var id = Number(m && (m.memberId != null ? m.memberId : m.id));
      if (isFinite(id) && id > max) max = id;
    });
    return max + 1;
  }

  /**
   * 由「已確認」的草稿做成會友紀錄（不寫入）。
   * @param {object} draft
   * @param {Array} existingMembers
   * @param {{stage?:string, id?:number}} [opts] stage＝人選的屬靈階段（預設 seeker 慕道友）
   */
  function toMemberRecord(draft, existingMembers, opts) {
    opts = opts || {};
    var id = opts.id != null ? opts.id : nextMemberId(existingMembers);
    var rec = {
      id: id,
      memberId: id,
      name: draft.name,
      gender: draft.gender || "",
      age: draft.age === "" ? "" : draft.age,
      phone: draft.phone || "",
      email: draft.email || "",
      baptized: false,
      membershipDate: "",
      spiritual_journey_stage: opts.stage || "seeker",
      first_visit_date: draft.first_visit_date,
      firstVisitDate: draft.first_visit_date,
      source: "form_intake",
      intake_draft_id: draft.draft_id
    };
    if (draft.birthday) rec.birthday = draft.birthday;
    if (draft.address) rec.address = draft.address;
    if (draft.notes) rec.notes = draft.notes;
    return rec;
  }

  /** 一行說明（畫面與報告共用） */
  function describeDuplicates(d) {
    return (d.duplicates || [])
      .map(function (x) {
        var k = x.kind === "phone" ? "電話相同" : x.kind === "email" ? "電郵相同" : "同名";
        return k + "：" + x.who + "（" + x.where + "）";
      })
      .join("；");
  }

  var api = {
    HEADER_ALIASES: HEADER_ALIASES,
    SENSITIVE_HEADER_WORDS: SENSITIVE_HEADER_WORDS,
    MAX_ROWS: MAX_ROWS,
    parseTable: parseTable,
    mapHeaders: mapHeaders,
    buildDrafts: buildDrafts,
    nextMemberId: nextMemberId,
    duplicatesAgainst: duplicatesAgainst,
    toMemberRecord: toMemberRecord,
    describeDuplicates: describeDuplicates,
    samePhone: samePhone
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    global.CmMemberIntake = api;
  }
})(typeof window !== "undefined" ? window : this);
