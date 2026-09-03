/**
 * 學校 Landing · 渲染 A–E 部門卡與 W0–W8 波次表
 */
(function (global, doc) {
  "use strict";

  function esc(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function navAttrs(path) {
    var href = path;
    if (typeof global.B100_siteHref === "function") {
      href = global.B100_siteHref(path);
    }
    var cf = path.replace(/\\/g, "/");
    var onclick =
      "return bible100ShellNav(event,{sidebarUrl:'school_management/sidebar.html',contentUrl:'" +
      cf.replace(/'/g, "\\'") +
      "'})";
    return { href: href, onclick: onclick };
  }

  function renderPrinciples(data) {
    var host = doc.getElementById("school-principles");
    if (!host || !data.principles) return;
    host.innerHTML = data.principles
      .map(function (p) {
        return (
          '<div class="b100-school-principle">' +
          '<span class="b100-school-principle__icon">' +
          esc(p.icon) +
          "</span>" +
          "<strong>" +
          esc(p.zh) +
          " · " +
          esc(p.en) +
          "</strong> " +
          p.text +
          "</div>"
        );
      })
      .join("");
  }

  function renderWaves(data) {
    var host = doc.getElementById("school-waves");
    if (!host || !data.waves) return;
    var rows = data.waves
      .map(function (w) {
        var nav = navAttrs(w.page);
        var badge =
          w.status === "ready"
            ? '<span class="b100-school-wave__ok">✓ 已落地</span>'
            : '<span class="b100-school-wave__todo">待建</span>';
        return (
          "<tr>" +
          "<td><strong>" +
          esc(w.id) +
          "</strong></td>" +
          "<td>" +
          esc(w.zh) +
          " <small>" +
          esc(w.en) +
          "</small></td>" +
          "<td>" +
          badge +
          "</td>" +
          '<td><a href="' +
          esc(nav.href) +
          '" onclick="' +
          esc(nav.onclick) +
          '">進入 →</a></td>' +
          "</tr>"
        );
      })
      .join("");
    host.innerHTML =
      '<table class="b100-school-waves"><thead><tr><th>波次</th><th>主題</th><th>狀態</th><th>入口</th></tr></thead><tbody>' +
      rows +
      "</tbody></table>";
  }

  function renderDepartments(data) {
    var host = doc.getElementById("school-departments");
    if (!host || !data.groups) return;
    host.innerHTML = data.groups
      .map(function (g) {
        var pages = (g.pages || [])
          .map(function (p) {
            var nav = navAttrs(p.path);
            var hi = p.highlight ? ' <span class="b100-school-page__hi">★</span>' : "";
            return (
              '<li><a href="' +
              esc(nav.href) +
              '" onclick="' +
              esc(nav.onclick) +
              '">' +
              esc(p.label) +
              hi +
              "</a>" +
              (p.desc ? '<span class="b100-school-page__desc">' + esc(p.desc) + "</span>" : "") +
              "</li>"
            );
          })
          .join("");
        var keys = (g.dataKeys || []).map(function (k) {
          return "<code>" + esc(k) + "</code>";
        }).join(" · ");
        return (
          '<article class="b100-path-card b100-path-card--school b100-school-dept" id="school-dept-' +
          esc(g.id) +
          '">' +
          '<div class="b100-path-card__icon">' +
          esc(g.id) +
          "</div>" +
          '<h3 class="b100-path-card__title">' +
          esc(g.titleZh) +
          " · " +
          esc(g.titleEn) +
          "</h3>" +
          '<p class="b100-path-card__sub"><strong>誰用：</strong>' +
          esc(g.who) +
          "</p>" +
          '<p class="b100-path-card__sub"><strong>流程：</strong>' +
          esc(g.flow) +
          "</p>" +
          '<p class="b100-path-card__who"><strong>資料：</strong> ' +
          keys +
          " · 波次 " +
          esc(g.wave) +
          "</p>" +
          '<ul class="b100-school-pages">' +
          pages +
          "</ul>" +
          "</article>"
        );
      })
      .join("");
  }

  function renderScenariosLanding() {
    var host = doc.getElementById("sch-landing-scenarios");
    if (!host || !global.SchScenarioSsot) return;
    host.innerHTML = global.SchScenarioSsot.SCENARIOS.map(function (s) {
      var path = "school_management/manage/academic_integrated.html" + (s.hash ? "#" + s.hash : "");
      var nav = navAttrs(path);
      return (
        '<div class="b100-school-principle">' +
        '<a href="' +
        esc(nav.href) +
        '" onclick="' +
        esc(nav.onclick) +
        '">' +
        '<span class="b100-school-principle__icon">' +
        esc(s.emoji) +
        "</span><strong>" +
        esc(s.label) +
        "</strong></a><br><span style=\"font-size:10px;color:#64748b\">" +
        esc(s.hint) +
        "</span></div>"
      );
    }).join("");
  }

  function boot() {
    var data = global.SCHOOL_DEPARTMENTS;
    if (!data) return;
    renderPrinciples(data);
    renderScenariosLanding();
    renderWaves(data);
    renderDepartments(data);
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(typeof window !== "undefined" ? window : this, document);
