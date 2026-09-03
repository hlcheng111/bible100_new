/**
 * CRM Hub · 日常手活 A–E 路線圖（與 registry / 側欄同步）
 */
(function (doc, win) {
  "use strict";

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function escJs(s) {
    return String(s || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  }

  function render(hostId) {
    var host = doc.getElementById(hostId || "crmHubAeRoadmap");
    var reg = win.CrmJourneyRegistry;
    if (!host || !reg || !reg.aeZones) return;

    var html =
      '<section class="crm-hub-ae">' +
      '<h2 class="crm-intro-section__title">🎼 日常手活 A–E · 與側欄同步</h2>' +
      '<p class="crm-intro-section__lead">每區一個<strong>主工作桌</strong>，展開可看同區工具格子。完成後頂欄或頁內 <strong>回 CRM 旅程</strong>。</p>' +
      '<div class="crm-hub-ae__zones">';

    reg.aeZones.forEach(function (zone) {
      var p = zone.primary;
      var href = reg.toolHref(p.path, p.role, p.step, "hub");
      var primaryLink;
      if (zone.id === "c" && reg.cZoneShellLinks && reg.cZoneShellLinks[0]) {
        var shell = reg.cZoneShellLinks[0];
        primaryLink =
          '<a class="crm-journey-link" href="#" onclick="return bible100ShellNav(event,{sidebarUrl:\'' +
          escJs(shell.sidebarUrl) +
          "',contentUrl:'" +
          escJs(shell.contentUrl.replace("crm_from=sidebar", "crm_from=hub")) +
          "'});return false;\">▶ " +
          esc(p.label) +
          "（主入口 · 換 C 側欄）</a>";
      } else {
        primaryLink =
          '<a class="crm-journey-link" href="' + esc(href) + '">▶ ' + esc(p.label) + "（主入口）</a>";
      }
      var pages = reg.subpagesByZone[zone.id] || [];
      html +=
        '<details class="crm-hub-ae__zone">' +
        "<summary><span>" +
        esc(zone.emoji) +
        " " +
        esc(zone.label) +
        "</span> <small>" +
        esc(zone.forWhom) +
        "</small></summary>" +
        '<p class="crm-hub-ae__primary">' +
        primaryLink +
        "</p>" +
        '<div class="crm-hub-ae__grid">';

      pages.forEach(function (pg) {
        if (pg.primary) return;
        var ph = reg.toolHref(pg.path, pg.role || p.role, pg.step != null ? pg.step : p.step, "hub");
        html +=
          '<a class="crm-journey-link crm-hub-ae__cell" href="' +
          esc(ph) +
          '">' +
          esc(pg.label) +
          (pg.blurb ? "<small>" + esc(pg.blurb) + "</small>" : "") +
          "</a>";
      });

      html += "</div></details>";
    });

    html +=
      "</div>" +
      '<p class="crm-hub-ae__foot"><a class="crm-journey-link" href="../help/interconnect-roadmap.html">📖 全站游客手册</a>' +
      ' · <button type="button" class="crm-intro-inline-link crm-intro-inline-link--btn" id="crmHubAeTriangle">🏛️ 三扇門導覽</button></p>' +
      "</section>";

    host.innerHTML = html;

    var tri = doc.getElementById("crmHubAeTriangle");
    if (tri && win.B100TriangleNav && typeof win.B100TriangleNav.goDoor === "function") {
      tri.addEventListener("click", function () {
        win.B100TriangleNav.goDoor("journey");
      });
    } else if (tri) {
      tri.addEventListener("click", function () {
        win.location.href = "guide_crm_journey_hub.html?tab=journey&role=staff";
      });
    }
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", function () {
      render("crmHubAeRoadmap");
    });
  } else {
    render("crmHubAeRoadmap");
  }
})(document, window);
