/**
 * 出席生產線導航條
 * Host: <div data-att-line="register|issue|checkin|pastoral|board|handbook"></div>
 * 可選 data-att-line-base="../../" 相對 church_ministry/
 */
(function (global, doc) {
  "use strict";

  var STEPS = [
    {
      id: "register",
      n: "1",
      short: "填表",
      title: "第 1 站 · 新人填表",
      job: "新人（或代填）寫姓名、電話、想參加邊啲聚會。送出後會進入「待審」排隊。",
      ok: "成功：畫面出現「已收到登記」，發碼臺會多一筆待審。",
      path: "modules/fellowship/newcomer-self-register.html",
      blank: true
    },
    {
      id: "issue",
      n: "2",
      short: "發碼",
      title: "第 2 站 · 教會發身份碼",
      job: "負責人核對待審名單 → 撳「發 QR」→ 得到短碼＋QR 圖。請截圖／列印交俾新人。",
      ok: "成功：彈出大短碼與 QR；待審變少、已發碼變多。",
      path: "modules/fellowship/newcomer-qr-desk.html"
    },
    {
      id: "checkin",
      n: "3",
      short: "簽到",
      title: "第 3 站 · 現場簽到",
      job: "選主日／小組／詩班場次 →「開始聚會」→ 手輸短碼（或貼 B100|編號|短碼）Enter。",
      ok: "成功：提示簽到成功或「已於 HH:MM 打卡」；本場名單有呢個人。",
      path: "modules/fellowship/attendance-checkin.html?crm_from=att_line"
    },
    {
      id: "board",
      n: "4",
      short: "睇數",
      title: "第 4 站 · 睇更新（可選）",
      job: "行政儀表／團契頁「新人卡」睇待審、今日發碼。確認流水有冇斷。",
      ok: "成功：數字同發碼臺對得上。",
      path: "dashboard_church_layout_v1_content.html"
    },
    {
      id: "pastoral",
      n: "5",
      short: "牧養",
      title: "第 5 站 · 小組牧養跟進",
      job: "小組工作桌：載入試用名單（若空）→ ② 點名 → 有連續缺席先去 ③ 預警 → 確認後先 ④／探訪。",
      ok: "成功：有人可點、預警有名單（試用包）、探訪唔會自動打擾。",
      path: "modules/fellowship/pastoral-integrated.html?crm_from=att_line#tab-attendance"
    }
  ];

  var BOOK = "docs/ATTENDANCE_OPS_HANDBOOK.html";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function cmPrefix() {
    var p = String((global.location && global.location.pathname) || "").replace(/\\/g, "/");
    var i = p.toLowerCase().indexOf("/church_ministry/");
    if (i < 0) return "church_ministry/";
    var rel = p.slice(i + "/church_ministry/".length);
    var depth = (rel.match(/\//g) || []).length;
    return depth ? new Array(depth + 1).join("../") : "";
  }

  function href(base, path) {
    if (!path) return "#";
    return base + path.replace(/^\//, "");
  }

  function stepIndex(id) {
    for (var i = 0; i < STEPS.length; i++) {
      if (STEPS[i].id === id) return i;
    }
    return 0;
  }

  function render(host) {
    var here = host.getAttribute("data-att-line") || "register";
    if (here === "handbook") here = "register";
    var base = host.getAttribute("data-att-line-base");
    if (base == null || base === "") base = cmPrefix();
    var idx = stepIndex(here);
    var cur = STEPS[idx];
    var prev = idx > 0 ? STEPS[idx - 1] : null;
    var next = idx < STEPS.length - 1 ? STEPS[idx + 1] : null;

    var pills = STEPS.map(function (s, i) {
      var cls = "att-line__step";
      if (i < idx) cls += " is-done";
      else if (i === idx) cls += " is-here";
      else cls += " is-soon";
      var link = href(base, s.path);
      return (
        '<a class="' +
        cls +
        '" href="' +
        esc(link) +
        '"' +
        (s.blank ? ' target="_blank" rel="noopener"' : "") +
        '><span class="att-line__num">' +
        esc(s.n) +
        "</span>" +
        esc(s.short) +
        "</a>"
      );
    }).join("");

    var nav = "";
    if (prev) {
      nav +=
        '<a class="att-line__btn att-line__btn--ghost" href="' +
        esc(href(base, prev.path)) +
        '"' +
        (prev.blank ? ' target="_blank" rel="noopener"' : "") +
        ">← 上站：" +
        esc(prev.short) +
        "</a>";
    }
    if (next) {
      nav +=
        '<a class="att-line__btn" href="' +
        esc(href(base, next.path)) +
        '"' +
        (next.blank ? ' target="_blank" rel="noopener"' : "") +
        ">下一站：" +
        esc(next.short) +
        " →</a>";
    }
    nav +=
      '<a class="att-line__btn att-line__btn--book" href="' +
      esc(href(base, BOOK + "#step-" + cur.id)) +
      '">📘 手冊講解呢一站</a>';

    host.className = ("att-line " + (host.className || "")).trim();
    host.setAttribute("role", "region");
    host.setAttribute("aria-label", "出席生產線導航");
    host.innerHTML =
      '<p class="att-line__eyebrow">出席生產線 · 第 ' +
      esc(cur.n) +
      "／5 站</p>" +
      '<p class="att-line__where">你而家喺：' +
      esc(cur.title) +
      "</p>" +
      '<p class="att-line__job">' +
      esc(cur.job) +
      "</p>" +
      '<div class="att-line__steps">' +
      pills +
      "</div>" +
      '<div class="att-line__nav">' +
      nav +
      "</div>" +
      '<p class="att-line__ok">點先算完成本站？' +
      esc(cur.ok) +
      "</p>";
  }

  function boot() {
    doc.querySelectorAll("[data-att-line]").forEach(function (host) {
      if (host.getAttribute("data-att-line-booted") === "1") return;
      host.setAttribute("data-att-line-booted", "1");
      render(host);
    });
  }

  global.AttendanceProcessStrip = { boot: boot, render: render, STEPS: STEPS };

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : this, document);
