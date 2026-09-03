/**
 * G 規劃行政 · 防迷航頂欄 + 底部「下一步」（Hub iframe 內）
 */
(function (global) {
  "use strict";

  var HOME = "index_plan.html";

  function inHub() {
    try {
      return global.parent && global.parent !== global;
    } catch (e) {
      return false;
    }
  }

  function journeyDots() {
    var g = global.PlanningPhaseGate;
    var done = 0;
    var total = 3;
    var hint = "待填靈命快評";
    if (g && g.getJourneyState) {
      var s = g.getJourneyState();
      if (s.phase1Done) done += 1;
      if (s.warRoomScanned) done += 1;
      if (s.phase3Unlocked) done += 1;
      if (s.phase1Done && !s.warRoomScanned) hint = "去看戰情室";
      else if (s.warRoomScanned) hint = "可選深化工具";
    }
    var dots = "";
    for (var i = 0; i < total; i++) {
      dots += '<span class="pzr-dot' + (i < done ? " pzr-dot--on" : "") + '"></span>';
    }
    return { dots: dots, done: done, total: total, hint: hint };
  }

  function nextAction(pageId) {
    var g = global.PlanningPhaseGate;
    var s = g && g.getJourneyState ? g.getJourneyState() : {};
    if (pageId === HOME || pageId === "index_plan") {
      if (!s.phase1Done) {
        return { label: "下一步 👉 填靈命快評（~10 分鐘）", toolId: "spiritual" };
      }
      if (!s.warRoomScanned) {
        return { label: "下一步 👉 健康雷達戰情室", href: "cta-os-war-room.html" };
      }
      return { label: "下一步 👉 健康診斷中心", href: "assessment-os-hub.html" };
    }
    if (pageId === "assessment-os-hub") {
      if (!s.phase1Done) {
        return { label: "下一步 👉 13 題靈命快評", toolId: "spiritual" };
      }
      return { label: "下一步 👉 戰情室看結果", href: "cta-os-war-room.html" };
    }
    if (pageId === "cta-os-war-room") {
      if (!s.phase1Done) {
        return { label: "下一步 👉 先去填靈命快評", toolId: "spiritual" };
      }
      return { label: "下一步 👉 回起步指南", href: HOME };
    }
    if (s.phase1Done && !s.warRoomScanned) {
      return { label: "下一步 👉 戰情室看結果", href: "cta-os-war-room.html" };
    }
    return { label: "下一步 👉 回起步指南", href: HOME };
  }

  function pageIdFromPath() {
    try {
      var p = String(global.location.pathname || "");
      var file = p.split("/").pop() || "";
      return file.replace(/\.html$/i, "").split("?")[0] || "index_plan";
    } catch (e) {
      return "index_plan";
    }
  }

  function navClick(next) {
    if (next.toolId && global.planningOpenByToolId) {
      return (
        'onclick="return planningOpenByToolId(event,' +
        JSON.stringify(next.toolId) +
        ');" href="' +
        (global.PlanningToolRegistry && global.PlanningToolRegistry.pathById
          ? global.PlanningToolRegistry.pathById(next.toolId) || "#"
          : "#") +
        '"'
      );
    }
    var href = next.href || HOME;
    return (
      'onclick="return planningOpenContent(event,' +
      JSON.stringify(href) +
      ');" href="' +
      href +
      '"'
    );
  }

  function mountTop(host, opts) {
    if (!host) return;
    opts = opts || {};
    var pid = opts.pageId || pageIdFromPath();
    var isHome = pid === "index_plan" || pid === HOME.replace(".html", "");
    var j = journeyDots();
    var homeLink = "";
    if (!isHome && global.planningOpenContent) {
      homeLink =
        '<a href="' +
        HOME +
        '" class="planning-zone-rail__home" onclick="return planningOpenContent(event,' +
        JSON.stringify(HOME) +
        ');">🏠 回起步指南</a>';
    }
    host.innerHTML =
      '<div class="planning-zone-rail">' +
      homeLink +
      '<div class="planning-zone-rail__zone">G 規劃行政<small>Plan &amp; Admin</small></div>' +
      '<div class="planning-zone-rail__progress">' +
      j.dots +
      " " +
      j.done +
      "/" +
      j.total +
      " · " +
      j.hint +
      "</div></div>";
  }

  function mountTripleHint(host) {
    if (!host) return;
    host.innerHTML =
      "<p><strong>在哪？</strong> G 規劃行政 · 教會健康檢查旅程</p>" +
      "<p><strong>做什麼？</strong> 先 13 題靈命快評（約 10 分鐘）</p>" +
      "<p><strong>做完？</strong> 到戰情室看六維紅綠燈，再按需選工具</p>";
    if (host.classList && !host.classList.contains("planning-guide-box")) {
      host.classList.add("planning-guide-box");
    }
  }

  function mountBottom(host, opts) {
    if (!host) return;
    opts = opts || {};
    var pid = opts.pageId || pageIdFromPath();
    var next = nextAction(pid);
    host.innerHTML =
      '<div class="planning-zone-next">' +
      '<p class="planning-zone-next__label">不確定往哪走？跟著按鈕就好。</p>' +
      "<a " +
      navClick(next) +
      ' class="planning-zone-next__btn">' +
      next.label +
      "</a></div>";
  }

  function boot(opts) {
    if (!inHub() && !opts.force) return;
    opts = opts || {};
    mountTop(document.getElementById("planning-zone-rail-top"), opts);
    mountTripleHint(document.getElementById("planning-zone-rail-hint"));
    mountBottom(document.getElementById("planning-zone-rail-bottom"), opts);
  }

  global.PlanningZoneRail = {
    boot: boot,
    mountTop: mountTop,
    mountBottom: mountBottom,
    mountTripleHint: mountTripleHint,
    journeyDots: journeyDots,
    nextAction: nextAction
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      boot({});
    });
  } else {
    boot({});
  }
})(typeof window !== "undefined" ? window : this);
