/**
 * CM landings · 如實功能引導（短 EN · 真入口 · 無示範 dept · 無雙殼）
 * layout: mosaic | timeline | loop | tabs | funnel | net | board | steps
 */
(function (global) {
  "use strict";

  function R(href, t, tEn, d) {
    return { href: href, t: t, tEn: tEn || "", d: d || "" };
  }
  function N(id, name, nameEn, hint, blurb, routes) {
    return {
      id: id,
      name: name,
      nameEn: nameEn,
      hint: hint,
      hintEn: "",
      title: name,
      titleEn: nameEn,
      blurb: blurb,
      blurbEn: "",
      routes: routes || [],
    };
  }

  var TODAY = "../dashboard_church_layout_v1_content.html";
  var EDU = "../modules/education/education-integrated.html";
  var OUT = "../modules/expansion/outreach-integrated.html";

  var ZONES = {
    gateway: {
      id: "gateway",
      layout: "mosaic",
      code: "GATE",
      titleZh: "教會總羅盤",
      titleEn: "Compass",
      kicker: "Church",
      lead: "先點一區，看這區能做什麼，再進門。八區顏色不同，好認路。",
      leadEn: "Pick a zone, see what it does, then enter.",
      primaryHref: "#cm-mosaic",
      primaryLabel: "選一區",
      primaryLabelEn: "Pick zone",
      ghostHref: TODAY,
      ghostLabel: "今日告示",
      ghostLabelEn: "Today",
      preface: "點色塊 → 下方出現路線 → 進正式頁。不開第二套側欄。",
      prefaceEn: "Tap → routes below → real pages.",
      flows: [
        { id: "sunday", label: "主日", labelEn: "Sunday", focus: "a" },
        { id: "care", label: "關懷", labelEn: "Care", focus: "b" },
        { id: "teach", label: "教導", labelEn: "Teach", focus: "c" },
        { id: "mark", label: "點名", labelEn: "Attend", focus: "h" },
      ],
      tiles: [
        {
          id: "a",
          name: "崇拜聖樂",
          nameEn: "Worship",
          hint: "主日桌 · 詩班",
          hintEn: "Sunday · Choir",
          tone: "藍金",
          blurb: "排主日流程、管聖樂團隊。小白先開「主日工作桌」。",
          blurbEn: "Sunday flow & choir. Start at Sunday desk.",
        },
        {
          id: "b",
          name: "牧養關懷",
          nameEn: "Care",
          hint: "整合 · 探訪 · 預警",
          hintEn: "Desk · Visit · Alert",
          tone: "綠",
          blurb: "看該關心誰、記探訪、跟進。小白先開「牧養整合」。",
          blurbEn: "Who needs care, visits, follow-up. Start at pastoral desk.",
        },
        {
          id: "c",
          name: "教育培訓",
          nameEn: "Teach",
          hint: "主日學五 Tab",
          hintEn: "SS desk",
          tone: "靛",
          blurb: "主日學名冊、出席、門訓、備課都在教育工作桌。",
          blurbEn: "Roster, attendance, discipleship, prep — one desk.",
        },
        {
          id: "d",
          name: "宣教外展",
          nameEn: "Outreach",
          hint: "需求 · 新人 · 跟進",
          hintEn: "Needs · Welcome",
          tone: "橙",
          blurb: "登記需求、接待新人、再交棒牧養／出席。",
          blurbEn: "Needs, welcome newcomers, hand to care.",
        },
        {
          id: "e",
          name: "社關服事",
          nameEn: "Social",
          hint: "義工排班",
          hintEn: "Volunteers",
          tone: "玫",
          blurb: "義工排班、請假調班、會眾入口。",
          blurbEn: "Shifts, leave swap, church center.",
        },
        {
          id: "f",
          name: "樂以載道",
          nameEn: "Hymns",
          hint: "學／找／研究／用",
          hintEn: "Learn · Find · Use",
          tone: "金",
          blurb: "聖詩深工（會換到聖詩側欄）。已是完整範本。",
          blurbEn: "Full hymn map (switches sidebar).",
        },
        {
          id: "g",
          name: "規劃行政",
          nameEn: "Plan",
          hint: "索引 · 決策包",
          hintEn: "Index · Packs",
          tone: "橄欖",
          blurb: "規劃工具與決策包。深工具在規劃索引裡。",
          blurbEn: "Plan tools & decision packs.",
        },
        {
          id: "h",
          name: "出席系統",
          nameEn: "Attend",
          hint: "報到 · 名冊 · 手冊",
          hintEn: "Check-in · Roster",
          tone: "青",
          blurb: "現場報到、牧養出席、先讀手冊再點名。",
          blurbEn: "Check-in, pastoral roster, handbook.",
        },
      ],
    },

    a: {
      id: "a",
      layout: "timeline",
      code: "A",
      titleZh: "A 崇拜聖樂",
      titleEn: "Worship",
      kicker: "A",
      lead: "主日要做事：先開工作桌，再管詩班。按時間順序點一步。",
      leadEn: "Sunday work: desk first, then choir.",
      primaryHref: "../modules/worship/worship-sunday-desk.html",
      primaryLabel: "開主日工作桌",
      primaryLabelEn: "Sunday desk",
      ghostHref: "gateway.html",
      ghostLabel: "回總羅盤",
      ghostLabelEn: "Compass",
      preface: "下面是這區真功能。點一步，路線出現在下方。",
      prefaceEn: "Real tools. Tap a step — routes below.",
      nodes: [
        N("desk", "主日工作桌", "Desk", "今日主日流程", "小白從這裡開始：排流程、看當日提醒。", [
          R("../modules/worship/worship-sunday-desk.html", "進入主日工作桌", "Open desk", "正式主入口"),
        ]),
        N("choir", "聖樂詩班", "Choir", "團隊與曲目", "管詩班、曲目，接上主日敬拜。", [
          R("../modules/worship/choir-team.html", "打開詩班頁", "Choir page", "團隊名單"),
        ]),
        N("hymn", "聖詩深工", "Hymns", "換到 F 區", "要學／找／用聖詩，進樂以載道（會換側欄）。", [
          R("../../hymn_management/practical_hymnology/landing.html", "打開樂以載道", "Hymn map", "換模組"),
        ]),
        N("back", "回總羅盤", "Compass", "換區", "做完回總圖選下一區。", [
          R("gateway.html", "教會總羅盤", "Compass", ""),
        ]),
      ],
    },

    b: {
      id: "b",
      layout: "loop",
      code: "B",
      titleZh: "B 牧養關懷",
      titleEn: "Care",
      kicker: "B",
      lead: "關懷閉環：整合桌看全貌 → 探訪 → 預警再跟進。",
      leadEn: "Desk → visit → alerts.",
      primaryHref: "../modules/fellowship/pastoral-integrated.html",
      primaryLabel: "開牧養整合",
      primaryLabelEn: "Care desk",
      ghostHref: "gateway.html",
      ghostLabel: "回總羅盤",
      ghostLabelEn: "Compass",
      preface: "點一環，下方出現可點的真頁。",
      prefaceEn: "Tap a ring — real pages below.",
      nodes: [
        N("desk", "牧養整合", "Desk", "關懷總桌", "小白從這裡看故事與該跟進的人。", [
          R("../modules/fellowship/pastoral-integrated.html", "進入牧養整合", "Open desk", "主入口"),
        ]),
        N("visit", "探訪", "Visit", "名單與紀錄", "記探訪、排下次跟進。", [
          R("../modules/fellowship/pastoral_visitation_panel.html", "打開探訪面板", "Visits", ""),
          R("../modules/support/visitation_index.html", "探訪索引", "Index", ""),
        ]),
        N("alert", "預警", "Alerts", "該關心誰", "優先名單；也可接到出席。", [
          R("../modules/fellowship/pastoral_alerts_panel.html", "打開預警", "Alerts", ""),
          R("attendance.html", "去出席系統", "Attend", "H 區"),
        ]),
      ],
    },

    c: {
      id: "c",
      layout: "tabs",
      code: "C",
      titleZh: "C 教育培訓",
      titleEn: "Teach",
      kicker: "C",
      lead: "主日學都在「教育工作桌」五個 Tab。點 Tab 看怎麼進。",
      leadEn: "One SS desk, five tabs.",
      primaryHref: EDU + "#tab-guide",
      primaryLabel: "開教育工作桌",
      primaryLabelEn: "SS desk",
      ghostHref: "gateway.html",
      ghostLabel: "回總羅盤",
      ghostLabelEn: "Compass",
      preface: "正式入口只有教育工作桌（不是示範工作台）。",
      prefaceEn: "Real desk only — no demo bench.",
      nodes: [
        N("guide", "導覽", "Guide", "工作桌首 Tab", "進桌先看導覽，知道五 Tab 怎麼用。", [
          R(EDU + "#tab-guide", "打開導覽 Tab", "Guide", "主入口"),
        ]),
        N("roster", "學籍", "Roster", "班級名冊", "學生與班級名單。", [
          R(EDU + "#tab-roster", "打開學籍 Tab", "Roster", ""),
        ]),
        N("attend", "出席", "Attend", "課堂點名", "主日學出席；也可進 H 區報到。", [
          R(EDU + "#tab-attendance", "打開出席 Tab", "Attend", ""),
          R("attendance.html", "H 出席系統", "H Attend", ""),
        ]),
        N("disc", "門訓", "Disciple", "門徒培育", "門訓相關 Tab。", [
          R(EDU + "#tab-discipleship", "打開門訓 Tab", "Disciple", ""),
        ]),
        N("teach", "備課", "Teach", "教材備課", "備課 Tab；更深可去聖經研讀。", [
          R(EDU + "#tab-teaching", "打開備課 Tab", "Teach", ""),
          R("../../bible_study/workbench.html", "聖經研讀", "Study", "跨模組"),
        ]),
      ],
    },

    d: {
      id: "d",
      layout: "funnel",
      code: "D",
      titleZh: "D 宣教外展",
      titleEn: "Outreach",
      kicker: "D",
      lead: "外展漏斗：登記需求 → 接待新人 → 交棒關懷。",
      leadEn: "Needs → welcome → handoff.",
      primaryHref: OUT + "#tab-needs",
      primaryLabel: "開外展工作桌",
      primaryLabelEn: "Outreach desk",
      ghostHref: "gateway.html",
      ghostLabel: "回總羅盤",
      ghostLabelEn: "Compass",
      preface: "愈往下愈接到門內。點一層看入口。",
      prefaceEn: "Tap a layer — enter below.",
      nodes: [
        N("needs", "需求登記", "Needs", "外展工作桌", "小白從需求 Tab 開始。", [
          R(OUT + "#tab-needs", "打開需求 Tab", "Needs", "主入口"),
          R(OUT + "#tab-followup", "跟進狀態", "Follow", ""),
        ]),
        N("new", "新人接待", "Welcome", "QR 櫃台", "現場接待、自助登記。", [
          R("../modules/fellowship/newcomer-qr-desk.html", "新人 QR 櫃台", "QR desk", ""),
          R("../modules/fellowship/newcomer-self-register.html", "自助登記", "Self-reg", ""),
        ]),
        N("hand", "交棒", "Handoff", "牧養／出席", "進門後交給 B 或 H。", [
          R("pastoral.html", "B 牧養", "Care", ""),
          R("attendance.html", "H 出席", "Attend", ""),
        ]),
      ],
    },

    e: {
      id: "e",
      layout: "net",
      code: "E",
      titleZh: "E 社關服事",
      titleEn: "Social",
      kicker: "E",
      lead: "社關先從義工排班做起，再連會眾入口與牧養。",
      leadEn: "Shifts first, then links.",
      primaryHref: "../tools/volunteer_shift/index.html",
      primaryLabel: "開義工排班",
      primaryLabelEn: "Shifts",
      ghostHref: "gateway.html",
      ghostLabel: "回總羅盤",
      ghostLabelEn: "Compass",
      preface: "點節點，下方進真頁。",
      prefaceEn: "Tap a node — enter below.",
      nodes: [
        N("shift", "義工排班", "Shifts", "排班主桌", "小白從這裡排本週義工。", [
          R("../tools/volunteer_shift/index.html", "打開排班", "Shifts", "主入口"),
          R("../tools/volunteer_shift/leave_swap.html", "請假調班", "Leave", ""),
        ]),
        N("cong", "會眾入口", "Center", "Church Center", "會友／會眾入口頁。", [
          R("../congregation/index.html", "打開會眾入口", "Center", ""),
        ]),
        N("care", "接牧養", "Care", "交棒 B", "需關懷時進牧養區。", [
          R("pastoral.html", "B 牧養", "Care", ""),
        ]),
      ],
    },

    g: {
      id: "g",
      layout: "board",
      code: "G",
      titleZh: "G 規劃行政",
      titleEn: "Plan",
      kicker: "G",
      lead: "先看規劃索引，再收決策包。不開第二套空殼。",
      leadEn: "Plan index, then packs.",
      primaryHref: "../../church_planning/index_plan.html",
      primaryLabel: "開規劃索引",
      primaryLabelEn: "Plan index",
      ghostHref: "gateway.html",
      ghostLabel: "回總羅盤",
      ghostLabelEn: "Compass",
      preface: "點一欄進真頁（內容頁，不是側欄檔）。",
      prefaceEn: "Content pages only.",
      nodes: [
        N("index", "規劃索引", "Index", "工具地圖", "SWOT／SMART／PDCA 從這裡找。", [
          R("../../church_planning/index_plan.html", "打開規劃索引", "Index", "主入口"),
        ]),
        N("pack", "決策包", "Packs", "待確認", "討論收成可追的決策。", [
          R("../../church_planning/decision_pack_inbox.html", "打開決策包", "Packs", ""),
        ]),
        N("admin", "行政桌", "Admin", "營運", "行政營運工作桌。", [
          R("../modules/admin/admin-integrated.html", "打開行政桌", "Admin", ""),
          R(TODAY, "今日告示板", "Today", "內容頁"),
        ]),
      ],
    },

    h: {
      id: "h",
      layout: "steps",
      code: "H",
      titleZh: "H 出席系統",
      titleEn: "Attend",
      kicker: "H",
      lead: "三步做事：報到 → 看名冊 → 不懂先讀手冊。",
      leadEn: "Check-in → roster → handbook.",
      primaryHref: "../modules/fellowship/attendance-checkin.html",
      primaryLabel: "開報到點名",
      primaryLabelEn: "Check-in",
      ghostHref: "gateway.html",
      ghostLabel: "回總羅盤",
      ghostLabelEn: "Compass",
      preface: "正式教區。點一步，下方進頁。",
      prefaceEn: "Tap a step — enter below.",
      nodes: [
        N("1", "報到點名", "Check-in", "現場報到", "聚會現場從此點名。", [
          R("../modules/fellowship/attendance-checkin.html", "打開報到", "Check-in", "主入口"),
          R("../modules/fellowship/newcomer-qr-desk.html", "新人 QR", "QR", ""),
        ]),
        N("2", "牧養出席", "Roster", "名冊對齊", "看出席與該跟進的人。", [
          R("../modules/fellowship/pastoral-attendance.html", "打開牧養出席", "Roster", ""),
          R("pastoral.html", "去牧養", "Care", "B 區"),
        ]),
        N("3", "營運手冊", "Guide", "怎麼用", "不熟流程先讀這份。", [
          R("../docs/ATTENDANCE_OPS_HANDBOOK.html", "打開手冊", "Guide", ""),
        ]),
      ],
    },
  };

  function get(id) {
    return ZONES[String(id || "").toLowerCase()] || null;
  }

  global.CmCompassZones = {
    ZONES: ZONES,
    get: get,
  };
})(typeof window !== "undefined" ? window : globalThis);
