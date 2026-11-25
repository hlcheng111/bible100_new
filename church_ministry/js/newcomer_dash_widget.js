/**
 * 新人／QR 儀表小卡 — 掛 <div data-newcomer-dash></div>
 */
(function (global, doc) {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function prefix() {
    var p = String((global.location && global.location.pathname) || "").replace(/\\/g, "/");
    var i = p.toLowerCase().indexOf("/church_ministry/");
    if (i < 0) return "church_ministry/";
    var rel = p.slice(i + "/church_ministry/".length);
    var depth = (rel.match(/\//g) || []).length;
    return depth ? new Array(depth + 1).join("../") : "";
  }

  function render(host) {
    var N = global.NewcomerQrStore;
    if (!N || !host) return;
    var st = N.getStats();
    var base = host.getAttribute("data-nc-base");
    if (base == null || base === "") base = prefix();
    var recent = (st.recentIssued || [])
      .slice(0, 4)
      .map(function (c) {
        return (
          "<li><strong>" +
          esc(c.name) +
          "</strong> · " +
          esc(c.checkinCode) +
          " · " +
          esc(String(c.issuedAt || "").replace("T", " ").slice(0, 16)) +
          "</li>"
        );
      })
      .join("");
    var pending = (st.recentPending || [])
      .slice(0, 3)
      .map(function (a) {
        return "<li>" + esc(a.name) + " · 待審 #" + esc(a.memberId) + "</li>";
      })
      .join("");

    host.className = ("nc-dash " + (host.className || "")).trim();
    host.innerHTML =
      '<div class="nc-dash__box">' +
      '<p class="nc-dash__eyebrow">新人登記 · 本機更新</p>' +
      '<div class="nc-dash__nums">' +
      '<span><b>' +
      st.pending +
      "</b>待審</span>" +
      "<span><b>" +
      st.appsToday +
      "</b>今日申請</span>" +
      "<span><b>" +
      st.issuedToday +
      "</b>今日發碼</span>" +
      "</div>" +
      (pending
        ? '<p class="nc-dash__sub">排隊中</p><ul class="nc-dash__list">' + pending + "</ul>"
        : '<p class="nc-dash__empty">暫無待審新人</p>') +
      (recent
        ? '<p class="nc-dash__sub">最近發碼</p><ul class="nc-dash__list">' + recent + "</ul>"
        : "") +
      '<div class="nc-dash__actions">' +
      '<a class="nc-dash__cta" href="' +
      esc(base + "modules/fellowship/newcomer-qr-desk.html") +
      '" data-b100-nav="content">發碼臺 →</a>' +
      '<a class="nc-dash__cta nc-dash__cta--sec" href="' +
      esc(base + "modules/fellowship/newcomer-self-register.html") +
      '" target="_blank" rel="noopener">手機登記（新分頁）</a>' +
      '<a class="nc-dash__cta nc-dash__cta--sec" href="' +
      esc(base + "modules/fellowship/attendance-checkin.html?crm_from=nc_dash") +
      '" data-b100-nav="content">簽到臺</a>' +
      "</div>" +
      '<p class="nc-dash__meta">更新：' +
      esc(st.updatedAt ? String(st.updatedAt).replace("T", " ").slice(0, 19) : "—") +
      " · 桶 bible100_newcomer_qr_v1</p>" +
      "</div>";
  }

  function boot() {
    doc.querySelectorAll("[data-newcomer-dash]").forEach(function (host) {
      render(host);
    });
  }

  global.NewcomerDashWidget = { boot: boot, render: render };

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
  global.addEventListener("bible100-newcomer-updated", boot);
  global.addEventListener("storage", function (ev) {
    if (!ev.key || ev.key.indexOf("newcomer") >= 0 || ev.key === "memberSystemData") boot();
  });
})(typeof window !== "undefined" ? window : this, document);
