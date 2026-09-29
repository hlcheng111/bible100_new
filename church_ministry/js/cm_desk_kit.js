/**
 * 子頁薄殼：回主桌 + 一句话用途（B 磨平同水準）
 */
(function (doc, win) {
  "use strict";

  function cmPre() {
    var p = String(win.location.pathname || "").replace(/\\/g, "/");
    var i = p.toLowerCase().indexOf("/church_ministry/");
    if (i < 0) return "";
    var rel = p.slice(i + "/church_ministry/".length);
    var depth = (rel.match(/\//g) || []).length;
    return depth ? new Array(depth + 1).join("../") : "";
  }

  function pageId() {
    var p = String(win.location.pathname || "").replace(/\\/g, "/");
    var file = p.split("/").pop() || "";
    return file.replace(/\.html$/i, "").split("?")[0];
  }

  function boot() {
    if (doc.getElementById("cm-desk-bar")) return;
    if (doc.body && doc.body.getAttribute("data-cm-desk-kit") === "off") return;
    if (/\/desks\//i.test(win.location.pathname || "")) return;
    // 勿污染 Standalone 雙欄殼與側欄
    if (doc.getElementById("contentFrame") || doc.getElementById("sidebarFrame")) return;
    if (doc.body && /P-CM-STANDALONE|sidebar/i.test(doc.body.getAttribute("data-b100-pattern") || "")) return;
    var reg = win.CmDeskRegistry;
    if (!reg) return;
    var pid = pageId();
    var deskId = reg.pageToDesk[pid];
    var desk = deskId ? reg.deskById(deskId) : null;
    var pre = cmPre();
    var bar = doc.createElement("div");
    bar.id = "cm-desk-bar";
    bar.className = "cm-desk-bar";
    var mapHref = pre + "desks/index.html";
    var deskHref = desk ? pre + desk.href : mapHref;
    bar.innerHTML =
      '<a href="' + mapHref + '">← 15 主桌</a>' +
      (desk
        ? '<a href="' + deskHref + '">回「' + desk.title + '」</a>'
        : "") +
      '<span class="cm-desk-title">' +
      (doc.title || pid).split("|")[0].trim() +
      "</span>" +
      (desk
        ? '<span class="cm-desk-blurb">隸屬：' + desk.emoji + " " + desk.title + " · " + desk.blurb + "</span>"
        : '<span class="cm-desk-blurb">進階子頁 · 請從主桌進入</span>');
    doc.body.insertBefore(bar, doc.body.firstChild);
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(document, window);
