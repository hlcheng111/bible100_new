/**
 * CM A–E／H · 區級 landing 扇門 SSOT（與側欄層2 同名同址）
 */
(function (global) {
  "use strict";

  var BUILD = "20261016doors";

  function q(path, crm) {
    path = String(path || "");
    if (!crm || /crm_from=/.test(path)) return path;
    return path + (path.indexOf("?") >= 0 ? "&" : "?") + "crm_from=" + encodeURIComponent(crm);
  }

  /** @type {Object.<string, {labelZh:string,labelEn:string,lead:string,doors:Array}>} */
  var ZONES = {
    a: {
      labelZh: "A 敬拜音樂",
      labelEn: "A Worship",
      lead: "先選一扇門：主日一桌、詩班團隊，或聚會點名。",
      doors: [
        {
          label: "主日一桌",
          en: "Sunday Desk",
          blurb: "點名／數字／本週服事（日常主路）",
          href: q("modules/worship/worship-sunday-desk.html", "a_landing")
        },
        {
          label: "聚會點名",
          en: "Gathering Roll",
          blurb: "主日一桌 · 點名 Tab",
          href: q("modules/worship/worship-sunday-desk.html#roll", "a_landing")
        },
        {
          label: "敬拜團隊",
          en: "Worship Team",
          blurb: "服事編排與團隊",
          href: q("modules/worship/worship-team-management.html", "a_landing")
        },
        {
          label: "詩班",
          en: "Choir",
          blurb: "成人／兒童／敬拜隊",
          href: q("modules/worship/choir-team.html", "a_landing")
        }
      ]
    },
    b: {
      labelZh: "B 牧養小組",
      labelEn: "B Pastoral",
      lead: "小組、點名、關心缺席、探訪——先選今晚要做的事。",
      doors: [
        {
          label: "小組工作桌",
          en: "Groups Desk",
          blurb: "牧養 4 Tab · 從小組開始",
          href: q(
            "modules/fellowship/pastoral-integrated.html?role=leader#tab-groups",
            "b_landing"
          )
        },
        {
          label: "今晚點名",
          en: "Tonight Check-in",
          blurb: "現場簽到／短碼",
          href: q("modules/fellowship/attendance-checkin.html", "b_landing")
        },
        {
          label: "邊個要關心",
          en: "Care Alerts",
          blurb: "缺席預警 · 溫馨提示",
          href: q(
            "modules/fellowship/pastoral-integrated.html?role=leader#tab-alerts",
            "b_landing"
          )
        },
        {
          label: "探訪佇列",
          en: "Visitation",
          blurb: "待確認嘅關心名單",
          href: q(
            "modules/fellowship/pastoral-integrated.html?role=leader#tab-visitation",
            "b_landing"
          )
        },
        {
          label: "豐盛金齡",
          en: "Golden Age",
          blurb: "50+ 安全門 · 安息／服侍兩線",
          href: q("modules/fellowship/golden-age-hub.html", "b_landing")
        }
      ]
    },
    c: {
      labelZh: "C 聖經門訓",
      labelEn: "C Discipleship",
      lead: "主日學五件事：導覽、學籍、出席、門訓、備課——先選一扇門。",
      doors: [
        {
          label: "導覽故事",
          en: "Guide",
          blurb: "主日學工作桌 · 導覽 Tab",
          href: q(
            "modules/education/education-integrated.html?role=teacher#tab-guide",
            "c_landing"
          )
        },
        {
          label: "學籍名冊",
          en: "Roster",
          blurb: "班級與學員",
          href: q(
            "modules/education/education-integrated.html?role=teacher#tab-roster",
            "c_landing"
          )
        },
        {
          label: "出席",
          en: "Attendance",
          blurb: "點名與缺席預警",
          href: q(
            "modules/education/education-integrated.html?role=teacher#tab-attendance",
            "c_landing"
          )
        },
        {
          label: "門訓",
          en: "Discipleship",
          blurb: "門訓進程",
          href: q(
            "modules/education/education-integrated.html?role=teacher#tab-discipleship",
            "c_landing"
          )
        },
        {
          label: "備課",
          en: "Teaching",
          blurb: "教材與備課",
          href: q(
            "modules/education/education-integrated.html?role=teacher#tab-teaching",
            "c_landing"
          )
        }
      ]
    },
    d: {
      labelZh: "D 外展差傳",
      labelEn: "D Outreach",
      lead: "需求、跟進、社區——外展工作先選一扇門。",
      doors: [
        {
          label: "需求登記",
          en: "Needs",
          blurb: "外展工作桌 · 需求 Tab",
          href: q(
            "modules/expansion/outreach-integrated.html?role=staff#tab-needs",
            "d_landing"
          )
        },
        {
          label: "跟進狀態",
          en: "Follow-up",
          blurb: "外展跟進",
          href: q(
            "modules/expansion/outreach-integrated.html?role=staff#tab-followup",
            "d_landing"
          )
        },
        {
          label: "社區調研",
          en: "Community",
          blurb: "社區瞭解",
          href: q(
            "modules/expansion/outreach-integrated.html?role=staff#tab-community",
            "d_landing"
          )
        },
        {
          label: "需求真鏈",
          en: "Needs Chain",
          blurb: "單頁策略鏈",
          href: q("modules/expansion/outreach-strategy.html?role=staff", "d_landing")
        }
      ]
    },
    e: {
      labelZh: "E 社會服務",
      labelEn: "E Social",
      lead: "義工排班與會眾入口——先選本週要做的事。",
      doors: [
        {
          label: "義工排班",
          en: "Volunteer Shifts",
          blurb: "排班工作桌",
          href: q("tools/volunteer_shift/index.html?role=leader", "e_landing")
        },
        {
          label: "請假調班",
          en: "Leave Swap",
          blurb: "替班與請假",
          href: q("tools/volunteer_shift/leave_swap.html?role=leader", "e_landing")
        },
        {
          label: "會眾入口",
          en: "Church Center",
          blurb: "會友自助入口",
          href: q("congregation/index.html?role=member", "e_landing")
        },
        {
          label: "行政總覽",
          en: "Admin Desk",
          blurb: "今日工作區／儀表",
          href: q("dashboard_church_layout_v1_content.html", "e_landing")
        }
      ]
    },
    h: {
      labelZh: "H 出席系統",
      labelEn: "H Attendance",
      lead: "崇拜、團契、主日學、新人發碼——先選場合，再做事。",
      doors: [
        {
          label: "崇拜／主日點名",
          en: "Sunday Worship Roll",
          blurb: "主日一桌 · 勾選出席",
          href: q("modules/worship/worship-sunday-desk.html#roll", "h_landing")
        },
        {
          label: "團契／現場簽到",
          en: "Fellowship Check-in",
          blurb: "開始聚會 → 輸入短碼",
          href: q("modules/fellowship/attendance-checkin.html", "h_landing")
        },
        {
          label: "主日學出席",
          en: "Education Attendance",
          blurb: "C 區工作桌 · 出席 Tab",
          href: q(
            "modules/education/education-integrated.html#tab-attendance",
            "h_landing"
          )
        },
        {
          label: "新人發碼",
          en: "Newcomer QR",
          blurb: "審核排隊 → 出短碼／QR",
          href: q("modules/fellowship/newcomer-qr-desk.html", "h_landing")
        }
      ]
    }
  };

  function zone(id) {
    return ZONES[String(id || "").toLowerCase()] || null;
  }

  global.CmZoneDoorSsot = {
    BUILD: BUILD,
    ZONES: ZONES,
    zone: zone
  };
})(typeof window !== "undefined" ? window : this);
