/**
 * 出席 · 今日一件事 + 互動路線圖（零業務寫入，僅導航＋本機回測勾選）
 * Host: <div data-att-route="b_pastoral"></div>
 * 可選: data-att-base="../"  （相對 church_ministry/ 的前綴；省略則自動推算）
 * 文檔: docs/ATTENDANCE_GOVERNANCE.md
 */
(function (global, doc) {
  "use strict";

  var CHECK_KEY = "bible100_att_route_check_v1";
  var ROLE_KEY = "bible100_att_route_role_v1";

  var ROLES = [
    { id: "beginner", label: "小白／招待" },
    { id: "leader", label: "小組長" },
    { id: "choir", label: "詩班長" },
    { id: "pastor", label: "牧者／資深" }
  ];

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function cmPrefix() {
    var p = String((global.location && global.location.pathname) || "").replace(/\\/g, "/");
    var i = p.toLowerCase().indexOf("/church_ministry/");
    if (i < 0) {
      /* school or outside */
      var j = p.toLowerCase().indexOf("/school_management/");
      if (j >= 0) {
        var relS = p.slice(j + "/school_management/".length);
        var dS = (relS.match(/\//g) || []).length;
        return new Array(dS + 1).join("../") + "../church_ministry/";
      }
      return "church_ministry/";
    }
    var rel = p.slice(i + "/church_ministry/".length);
    var depth = (rel.match(/\//g) || []).length;
    return depth ? new Array(depth + 1).join("../") : "";
  }

  function schoolPrefix() {
    var p = String((global.location && global.location.pathname) || "").replace(/\\/g, "/");
    var j = p.toLowerCase().indexOf("/school_management/");
    if (j < 0) return "../school_management/";
    var rel = p.slice(j + "/school_management/".length);
    var depth = (rel.match(/\//g) || []).length;
    return depth ? new Array(depth + 1).join("../") : "";
  }

  function href(base, path) {
    if (!path) return "#";
    if (/^https?:\/\//i.test(path) || path.charAt(0) === "#") return path;
    return base + path.replace(/^\//, "");
  }

  function loadChecks() {
    try {
      return JSON.parse(global.localStorage.getItem(CHECK_KEY) || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  function saveChecks(obj) {
    try {
      global.localStorage.setItem(CHECK_KEY, JSON.stringify(obj));
    } catch (e) {}
  }

  function loadRole(routeId) {
    try {
      var all = JSON.parse(global.localStorage.getItem(ROLE_KEY) || "{}") || {};
      return all[routeId] || "beginner";
    } catch (e) {
      return "beginner";
    }
  }

  function saveRole(routeId, role) {
    try {
      var all = JSON.parse(global.localStorage.getItem(ROLE_KEY) || "{}") || {};
      all[routeId] = role;
      global.localStorage.setItem(ROLE_KEY, JSON.stringify(all));
    } catch (e) {}
  }

  /** 每一步「資料何來何去」（白話一句；📥來源 → 📤去向）。主線＝bible100_attendance_checkin_v1 */
  var FLOW = {
    "a_sunday:u1": "📥 會友名冊 → 📤 按「存本場」寫入出席主線（簽到臺同一個桶）",
    "a_sunday:u2": "📥 ① 標為缺席的人 → 📤 探訪草稿（B 區探訪清單；同工確認才派人）",
    "a_sunday:u3": "📥 已存的主日場次（主線）→ 📤 只讀；崇拜報表看同一份",
    "a_sunday:u4": "📥 畫面上的名冊 → 📤 CSV／列印（不回寫）；小組點名請走 B 簽到臺",
    "a_worship:a1": "📥 會友名冊 → 📤 按「存本場」寫入出席主線（簽到臺同一個桶）",
    "a_worship:a2": "📥 ① 標為缺席的人 → 📤 探訪草稿（B 區探訪清單；同工確認才派人）",
    "a_worship:a3": "📥 已存的主日場次（主線）→ 📤 只讀；崇拜報表看同一份",
    "a_worship:a4": "📥 畫面上的名冊 → 📤 CSV／列印（不回寫）；也可接著轉探訪草稿",
    "b_pastoral:b1": "📥 中央會友與小組 → 📤 工作桌各 Tab 共用",
    "b_pastoral:b2": "📥 小組名冊 → 📤 出席主線；小組批量會同步週報（預警用）",
    "b_pastoral:b3": "📥 主線＋週報 → 📤 缺席預警名單（只建議）",
    "b_pastoral:b4": "📥 預警名單 → 📤 探訪佇列（人確認才派）",
    "b_checkin:c1": "📥 中央會友 → 📤 本場名單",
    "b_checkin:c2": "📥 本場名單 → 📤 出席主線（重複打卡只提示）",
    "b_checkin:c3": "📥 主線本場 → 📤 CSV 帶走（不回寫）",
    "b_checkin:c4": "📥 主線＋週報 → 📤 走勢與預警",
    "b_stats:s1": "📥 小組週報（含簽到臺小組批量同步）→ 📤 走勢圖",
    "b_stats:s2": "📥 週報歷史 → 📤 只讀",
    "b_stats:s3": "📥 連續缺席 → 📤 預警名單",
    "b_stats:s4": "📥 —  → 📤 回簽到臺寫主線",
    "b_visit:v1": "📥 缺席點名／預警 → 📤 探訪佇列",
    "b_visit:v2": "📥 佇列 → 📤 同工確認後派人",
    "b_visit:v3": "📥 探訪結果 → 📤 回寫可追的紀錄",
    "b_visit:v4": "📥 探訪結果 → 📤 預警名單更新",
    "school:sc1": "📥 學校名冊 → 📤 student.attendance（永久分域）",
    "school:sc2": "📥 勾選 → 📤 本機 schoolDB；用 member_id 對齊會友",
    "school:sc3": "📥 成績 → 📤 結業可回寫會友（非教會點名）",
    "school:sc4": "📥 — → 📤 教會小組點名走 B 簽到臺"
  };

  /** 路徑相對 church_ministry/ */
  function profiles(base, schBase) {
    var desk = "modules/fellowship/pastoral-integrated.html?crm_from=att_route&role=leader";
    var checkin = "modules/fellowship/attendance-checkin.html?crm_from=att_route";
    var stats = "modules/fellowship/pastoral-attendance.html?crm_from=att_route";
    var visit = "modules/support/visitation_index.html?crm_from=att_route";
    var sunday = "modules/worship/worship-sunday-desk.html?crm_from=att_route";
    var worshipLand = "_landing/worship.html";
    var schoolAtt = schBase + "manage/attendance/index.html";

    function stepsB(role) {
      var common = [
        {
          id: "b1",
          k: "①",
          t: "進入牧養工作桌",
          d: "左欄 B 或團契 landing → 4 Tab 殼",
          path: desk + "#tab-groups"
        },
        {
          id: "b2",
          k: "②",
          t: "現場點名（登記）",
          d: role === "leader" ? "用「組長批量」勾選後儲存" : "手輸編號／電話 Enter；重複會顯示已打卡時間",
          path: desk + "#tab-attendance"
        },
        {
          id: "b3",
          k: "③",
          t: "缺席預警",
          d: "有點名先有名單；連續缺席才進跟進",
          path: desk + "#tab-alerts"
        },
        {
          id: "b4",
          k: "④",
          t: "探訪佇列（人確認）",
          d: "系統只建議，不自動派工打擾會友",
          path: desk + "#tab-visitation"
        }
      ];
      if (role === "pastor") {
        common[1].d = "可抽查簽到臺；日常以預警與探訪為主";
        common[1].path = stats;
      }
      if (role === "choir") {
        common[1].d = "簽到臺新建「詩班／練習」場次，或本組批量";
        common[1].path = checkin;
      }
      return common;
    }

    function ctaB(role) {
      if (role === "pastor") {
        return { label: "今日：睇缺席預警 →", path: desk + "#tab-alerts" };
      }
      if (role === "choir") {
        return { label: "今日：詩班／練習點名 →", path: checkin };
      }
      if (role === "leader") {
        return { label: "今日：組長批量點名 →", path: desk + "#tab-attendance" };
      }
      return { label: "今日：去現場點名 →", path: desk + "#tab-attendance" };
    }

    return {
      b_pastoral: {
        theme: "",
        eyebrow: "B · 牧養出席閉環",
        title: "今日一件事 · 互動路線圖",
        lead: "登記＝點名 · 睇圖＝統計 · 跟進＝預警→探訪（人確認）。小白跟步驟勾選，可作回測。",
        bucket: "bible100_attendance_checkin_v1 · group_attendance_v1",
        doc: "docs/ATTENDANCE_GOVERNANCE.md",
        steps: stepsB,
        cta: ctaB
      },
      b_checkin: {
        theme: "",
        eyebrow: "B · 簽到臺",
        title: "今日一件事 · 你在「登記」站",
        lead: "選／建場次 → 開始聚會 → 手輸或組長批量。睇走勢請去出席統計，唔好喺呢度迷路。",
        bucket: "bible100_attendance_checkin_v1",
        doc: "docs/ATTENDANCE_GOVERNANCE.md",
        steps: function (role) {
          return [
            { id: "c1", k: "1", t: "載入示範／確認會友", d: "無名單先撳頁頂「載入示範」", path: null },
            {
              id: "c2",
              k: "2",
              t: role === "leader" ? "組長批量勾選" : "手輸編號／電話簽到",
              d: "重複打卡會顯示已於 HH:MM 打卡",
              path: null
            },
            { id: "c3", k: "3", t: "睇本場已登記", d: "確認人數後可匯出 CSV", path: null },
            {
              id: "c4",
              k: "4",
              t: "去統計／預警",
              d: "趨勢與缺席跟進",
              path: role === "pastor" ? desk + "#tab-alerts" : stats
            }
          ];
        },
        cta: function (role) {
          if (role === "pastor") return { label: "去缺席預警 →", path: desk + "#tab-alerts" };
          return { label: "本頁即登記站 · 向下開始", path: "#ac-event-select" };
        }
      },
      b_stats: {
        theme: "",
        eyebrow: "B · 出席統計",
        title: "今日一件事 · 你在「睇圖」站",
        lead: "呢度係週報／趨勢／預警，唔係門口掃碼。要登記請回簽到臺。",
        bucket: "group_attendance_v1（週報）· 簽到臺另桶",
        doc: "docs/ATTENDANCE_GOVERNANCE.md",
        steps: function () {
          return [
            { id: "s1", k: "1", t: "選小組、提交／檢視週報", d: "與簽到臺小組批量可同步", path: null },
            { id: "s2", k: "2", t: "看出席率走勢", d: "Tab 趨勢", path: null },
            { id: "s3", k: "3", t: "處理異常預警", d: "或回工作桌 Tab③", path: desk + "#tab-alerts" },
            { id: "s4", k: "4", t: "要登記？回簽到臺", d: "現場點名", path: checkin }
          ];
        },
        cta: function () {
          return { label: "要登記 → 現場點名", path: checkin };
        }
      },
      b_visit: {
        theme: "",
        eyebrow: "B · 探訪（跟進站）",
        title: "今日一件事 · 缺席→探訪",
        lead: "名單宜來自點名／預警。推送須同工確認，不自動打擾會友。",
        bucket: "探訪佇列 · 來源可含缺席點名",
        doc: "docs/ATTENDANCE_GOVERNANCE.md",
        steps: function () {
          return [
            { id: "v1", k: "1", t: "確認來源＝缺席／關懷", d: "無點名則先去簽到臺", path: checkin },
            { id: "v2", k: "2", t: "人確認後才派探訪", d: "HITL", path: null },
            { id: "v3", k: "3", t: "寫探訪結果", d: "回寫可追", path: null },
            { id: "v4", k: "4", t: "回工作桌睇預警", d: "閉環", path: desk + "#tab-alerts" }
          ];
        },
        cta: function () {
          return { label: "先確認有無點名資料 →", path: checkin };
        }
      },
      a_worship: {
        theme: "worship",
        eyebrow: "A · 敬拜出席",
        title: "今日一件事 · 崇拜 vs 詩班",
        lead: "主日會眾點名→主日一桌；詩班練習→B 簽到臺（詩班）。兩邊都寫進同一條出席主線。",
        bucket: "bible100_attendance_checkin_v1（主線）· 舊 attendanceRecords 自動鏡射",
        doc: "docs/ATTENDANCE_GOVERNANCE.md",
        steps: function (role) {
          if (role === "choir") {
            return [
              { id: "a1", k: "1", t: "開詩班／練習場次", d: "B 簽到臺類型＝詩班", path: checkin },
              { id: "a2", k: "2", t: "批量或手輸點名", d: "本隊 roster", path: checkin },
              { id: "a3", k: "3", t: "匯出／對照排班", d: "可選", path: sunday },
              { id: "a4", k: "4", t: "回敬拜主桌", d: "策劃", path: "modules/worship/worship-integrated.html" }
            ];
          }
          return [
            { id: "a1", k: "①", t: "點名", d: "崇拜會眾登記", path: sunday + "#roll" },
            { id: "a2", k: "②", t: "缺席跟進", d: "缺席→探訪草稿", path: sunday + "#absent" },
            { id: "a3", k: "③", t: "本週數字", d: "存本場後看出席率", path: sunday + "#stats" },
            { id: "a4", k: "④", t: "匯出／報表", d: "帶走或看崇拜報表", path: sunday + "#export" }
          ];
        },
        cta: function (role) {
          if (role === "choir") return { label: "今日：詩班點名（簽到臺）→", path: checkin };
          return { label: "今日：主日一桌點名 →", path: sunday };
        }
      },
      a_sunday: {
        theme: "worship",
        eyebrow: "A · 主日一桌",
        title: "今日一件事 · 崇拜登記站",
        lead: "十分鐘：① 點名 → ② 缺席 → ③ 數字 → ④ 匯出。每步下面小字＝資料從哪來、去哪。",
        bucket: "bible100_attendance_checkin_v1（主線）· 舊 attendanceRecords 自動鏡射",
        doc: "docs/ATTENDANCE_GOVERNANCE.md",
        steps: function () {
          return [
            { id: "u1", k: "①", t: "點名", d: "勾選出席", path: "#roll" },
            { id: "u2", k: "②", t: "缺席跟進", d: "缺席→探訪草稿", path: "#absent" },
            { id: "u3", k: "③", t: "本週數字", d: "出席率", path: "#stats" },
            { id: "u4", k: "④", t: "匯出", d: "帶走／接著跟進", path: "#export" }
          ];
        },
        cta: function () {
          return { label: "本頁向下開始點名", path: "#btnSaveRoll" };
        }
      },
      school: {
        theme: "school",
        eyebrow: "學校 · 堂課點名",
        title: "今日一件事 · 與教會分域",
        lead: "學校點名寫 student.attendance；與教會崇拜／小組桶分開，但學籍應對齊 member_id。結業回寫會友≠教會現場點名。",
        bucket: "student.attendance · member_id 橋接",
        doc: "../church_ministry/docs/ATTENDANCE_GOVERNANCE.md",
        steps: function () {
          return [
            {
              id: "sc1",
              k: "1",
              t: "教務工作臺／今天點名",
              d: "選課程→勾出席",
              pathAbs: schoolAtt
            },
            { id: "sc2", k: "2", t: "儲存堂課出席", d: "本機 schoolDB", pathAbs: schoolAtt },
            { id: "sc3", k: "3", t: "成績／結業（另線）", d: "及格可回寫會友", pathAbs: schBase + "manage/grades_tabs.html" },
            {
              id: "sc4",
              k: "4",
              t: "教會小組點名？",
              d: "請走教會 B 簽到臺",
              path: checkin
            }
          ];
        },
        cta: function () {
          return { label: "今日：學校堂課點名 →", pathAbs: schoolAtt };
        }
      },
      _base: base,
      _worshipLand: worshipLand
    };
  }

  function resolvePath(base, step, cta) {
    if (cta && cta.pathAbs) return cta.pathAbs;
    if (step && step.pathAbs) return step.pathAbs;
    var path = (cta && cta.path) || (step && step.path);
    if (path == null) return null;
    if (path.charAt(0) === "#") return path;
    return href(base, path);
  }

  function render(host) {
    var routeId = host.getAttribute("data-att-route") || "b_pastoral";
    var base = host.getAttribute("data-att-base");
    if (base == null || base === "") base = cmPrefix();
    var schBase = host.getAttribute("data-att-school-base");
    if (schBase == null || schBase === "") schBase = schoolPrefix();
    var pack = profiles(base, schBase);
    var conf = pack[routeId];
    if (!conf) {
      host.innerHTML = '<p class="att-route__lead">未知路線：' + esc(routeId) + "</p>";
      return;
    }

    var role = loadRole(routeId);
    var checks = loadChecks();
    var steps = conf.steps(role) || [];
    var cta = conf.cta(role) || { label: "開始", path: "#" };
    var ctaHref = resolvePath(base, null, cta);
    var theme = conf.theme ? " att-route--" + conf.theme : "";
    var doneN = 0;
    steps.forEach(function (st) {
      if (checks[routeId + ":" + st.id]) doneN += 1;
    });

    var rolesHtml = ROLES.map(function (r) {
      return (
        '<button type="button" class="att-route__role' +
        (r.id === role ? " is-on" : "") +
        '" data-role="' +
        esc(r.id) +
        '">' +
        esc(r.label) +
        "</button>"
      );
    }).join("");

    var stepsHtml = steps
      .map(function (st) {
        var key = routeId + ":" + st.id;
        var on = !!checks[key];
        var link = resolvePath(base, st, null);
        var linkHtml = link
          ? '<a class="att-route__step-link" href="' + esc(link) + '"' + (link.charAt(0) === "#" ? "" : ' data-b100-nav="content"') + ' title="' + esc(st.t) + '">' + (link.charAt(0) === "#" ? "本頁 ↓" : "去 →") + "</a>"
          : "";
        return (
          '<li class="att-route__step' +
          (on ? " is-done" : "") +
          '" data-step="' +
          esc(st.id) +
          '">' +
          '<div class="att-route__step-row">' +
          '<input type="checkbox" class="att-route__check" data-check="' +
          esc(key) +
          '"' +
          (on ? " checked" : "") +
          ' title="回測勾選" />' +
          '<span class="att-route__step-k">' +
          esc(st.k) +
          "</span>" +
          '<span class="att-route__step-t">' +
          esc(st.t) +
          "</span>" +
          '<span class="att-route__step-d">' +
          esc(st.d) +
          "</span>" +
          linkHtml +
          "</div>" +
          (st.flow || FLOW[routeId + ":" + st.id] ? '<p class="att-route__flow">' + esc(st.flow || FLOW[routeId + ":" + st.id]) + "</p>" : "") +
          "</li>"
        );
      })
      .join("");

    host.className = ("att-route" + theme + " " + (host.className || "")).trim();
    host.setAttribute("role", "region");
    host.setAttribute("aria-label", "出席今日一件事與路線圖");
    var roleLabel = (ROLES.find(function (r) { return r.id === role; }) || {}).label || role;
    var doneHtml = (function () {
      if (!(doneN >= steps.length && steps.length)) return "";
      var next1 = ctaHref || href(base, "modules/fellowship/pastoral-integrated.html?crm_from=att_done#tab-attendance");
      var next2 = null;
      var lab1 = "開始實做 →";
      var lab2 = null;
      if (routeId === "b_pastoral" || routeId === "b_checkin" || routeId === "b_stats" || routeId === "b_visit") {
        next1 = href(base, "modules/fellowship/pastoral-integrated.html?crm_from=att_done#tab-attendance");
        next2 = href(base, "modules/fellowship/pastoral-integrated.html?crm_from=att_done#tab-alerts");
        lab1 = "開始今晚點名 →";
        lab2 = "睇缺席預警 →";
      } else if (routeId === "a_worship" || routeId === "a_sunday") {
        next1 = href(base, "modules/worship/worship-sunday-desk.html?crm_from=att_done");
        next2 = href(base, "modules/fellowship/attendance-checkin.html?crm_from=choir&type=choir");
        lab1 = "主日會眾點名 →";
        lab2 = "詩班／練習簽到 →";
      } else if (routeId === "school") {
        next1 = href(schBase, "manage/academic_integrated.html?crm_from=att_done");
        lab1 = "開教務工作臺載入試用 →";
      }
      return (
        '<div class="att-route__done">✅ 路線認得啦！下一步：' +
        '<a class="att-route__cta" href="' + esc(next1) + '" data-b100-nav="content">' + esc(lab1) + "</a>" +
        (next2
          ? '<a class="att-route__cta att-route__cta--secondary" href="' + esc(next2) + '" data-b100-nav="content">' + esc(lab2) + "</a>"
          : "") +
        "</div>"
      );
    })();
    host.innerHTML =
      '<div class="att-route__head">' +
      '<span class="att-route__eyebrow">' + esc(conf.eyebrow) + "</span>" +
      '<h2 class="att-route__title">' + esc(conf.title) + "</h2>" +
      '<span class="att-route__progress">回測 ' + doneN + "／" + steps.length + "</span>" +
      "</div>" +
      '<p class="att-route__lead">' + esc(conf.lead) + "</p>" +
      '<div class="att-route__bar">' +
      '<div class="att-route__roles" role="toolbar" aria-label="角色">' + rolesHtml + "</div>" +
      '<a class="att-route__cta" href="' + esc(ctaHref || "#") + '"' +
      (ctaHref && ctaHref.charAt(0) !== "#" ? ' data-b100-nav="content"' : "") +
      ' title="以「' + esc(roleLabel) + '」身份">' + esc(cta.label) + "</a>" +
      "</div>" +
      doneHtml +
      '<ol class="att-route__steps">' + stepsHtml + "</ol>" +
      '<details class="att-route__meta"><summary>資料桶與說明</summary>' +
      "資料桶：<code>" + esc(conf.bucket) + "</code> · 綱要：<code>" + esc(conf.doc) + "</code>" +
      '<div class="att-route__tools">' +
      '<button type="button" class="att-route__tool" data-att-reset>清除本路線回測勾選</button>' +
      '<a class="att-route__tool" href="' + esc(href(base, "docs/ATTENDANCE_GOVERNANCE.md")) + '" target="_blank" rel="noopener">開治理綱要</a>' +
      "</div></details>";

    host.querySelectorAll(".att-route__role").forEach(function (btn) {
      btn.onclick = function () {
        saveRole(routeId, btn.getAttribute("data-role"));
        render(host);
      };
    });
    host.querySelectorAll(".att-route__check").forEach(function (cb) {
      cb.onchange = function () {
        var key = cb.getAttribute("data-check");
        var all = loadChecks();
        if (cb.checked) all[key] = 1;
        else delete all[key];
        saveChecks(all);
        render(host);
      };
    });
    var reset = host.querySelector("[data-att-reset]");
    if (reset) {
      reset.onclick = function () {
        var all = loadChecks();
        Object.keys(all).forEach(function (k) {
          if (k.indexOf(routeId + ":") === 0) delete all[k];
        });
        saveChecks(all);
        render(host);
      };
    }
  }

  function boot() {
    doc.querySelectorAll("[data-att-route]").forEach(function (host) {
      if (host.getAttribute("data-att-booted") === "1") return;
      host.setAttribute("data-att-booted", "1");
      render(host);
    });
  }

  global.AttendanceRouteKit = {
    boot: boot,
    render: render,
    CHECK_KEY: CHECK_KEY,
    ROLES: ROLES
  };

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : this, document);
