/**
 * AI Lab Landing · 渲染 A–E 与 W0–W8
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
    if (typeof global.B100_siteHref === "function") href = global.B100_siteHref(path);
    var cf = path.replace(/\\/g, "/");
    var sb = "ai_tools/sidebar_lab.html";
    if (/^smart_ministry\//.test(cf)) sb = "ai_tools/sidebar_lab.html";
    if (/^church_planning\//.test(cf)) sb = "church_planning/sidebar_plan_v5_preview.html";
    if (/^church_ministry\//.test(cf)) sb = "church_ministry/sidebar_church_layout_v1.html";
    if (/^languages\//.test(cf)) sb = "languages/index_cn.html";
    return {
      href: href,
      onclick:
        "return bible100ShellNav(event,{sidebarUrl:'" +
        sb.replace(/'/g, "\\'") +
        "',contentUrl:'" +
        cf.replace(/'/g, "\\'") +
        "'})"
    };
  }

  function renderWhenToUse(data) {
    var host = doc.getElementById("ai-when-to-use");
    if (!host || !data.whenToUse) return;
    host.innerHTML = data.whenToUse
      .map(function (w) {
        return (
          '<div class="b100-ai-clarity">' +
          '<strong>' +
          esc(w.title) +
          "（" +
          esc(w.zone) +
          " 区）</strong><br>" +
          "✅ " +
          esc(w.when) +
          "<br>" +
          "❌ " +
          esc(w.not) +
          "</div>"
        );
      })
      .join("");
  }

  function renderChurchGoals(data) {
    var host = doc.getElementById("ai-church-goals");
    if (!host || !data.churchGoals) return;
    host.innerHTML = data.churchGoals
      .map(function (g) {
        var nav = navAttrs(g.path);
        return (
          '<a class="b100-path-card b100-path-card--ai" href="' +
          esc(nav.href) +
          '" onclick="' +
          esc(nav.onclick) +
          '">' +
          '<div class="b100-path-card__icon">' +
          esc(g.icon) +
          "</div>" +
          '<h3 class="b100-path-card__title">' +
          esc(g.zh) +
          " · " +
          esc(g.en) +
          "</h3>" +
          '<p class="b100-path-card__sub">目标：" +
          esc(g.goal) +
          '" · ' +
          esc(g.zone) +
          " 区</p></a>"
        );
      })
      .join("");
  }

  function renderPrinciples(data) {
    var host = doc.getElementById("ai-principles");
    if (!host || !data.principles) return;
    host.innerHTML = data.principles
      .map(function (p) {
        return (
          '<div class="b100-ai-principle"><span class="b100-ai-principle__icon">' +
          esc(p.icon) +
          "</span> <strong>" +
          esc(p.zh) +
          "</strong> " +
          p.text +
          "</div>"
        );
      })
      .join("");
  }

  function renderWaves(data) {
    var host = doc.getElementById("ai-waves");
    if (!host || !data.waves) return;
    host.innerHTML =
      "<table class=\"b100-ai-waves\"><thead><tr><th>波次</th><th>主题</th><th>AI 协作 HOW</th><th>入口</th></tr></thead><tbody>" +
      data.waves
        .map(function (w) {
          var nav = navAttrs(w.page);
          return (
            "<tr><td><strong>" +
            esc(w.id) +
            "</strong></td><td>" +
            esc(w.zh) +
            " <small>" +
            esc(w.en) +
            "</small></td><td style=\"font-size:10px;color:#475569\">" +
            esc(w.how || "") +
            "</td>" +
            '<td><a href="' +
            esc(nav.href) +
            '" onclick="' +
            esc(nav.onclick) +
            '">进入 →</a></td></tr>'
          );
        })
        .join("") +
      "</tbody></table>";
  }

  function renderAiHowWorkflow(data) {
    var host = doc.getElementById("ai-how-workflow");
    if (!host || !data.aiHowWorkflow) return;
    var w = data.aiHowWorkflow;
    host.innerHTML =
      "<h3 class=\"b100-section-title\" style=\"margin-top:0\">🔁 " +
      esc(w.title) +
      "</h3><ol class=\"b100-ai-how-steps\">" +
      w.steps
        .map(function (s) {
          return (
            "<li><strong>" +
            esc(s.n) +
            ". " +
            esc(s.zh) +
            "</strong> <small>" +
            esc(s.en) +
            "</small><br><span class=\"b100-ai-page__desc\">" +
            esc(s.detail) +
            "</span></li>"
          );
        })
        .join("") +
      "</ol>";
  }

  function renderCrossModule(data) {
    var host = doc.getElementById("ai-cross-module");
    if (!host || !data.crossModuleAi) return;
    host.innerHTML = data.crossModuleAi
      .map(function (m) {
        var nav = navAttrs(m.path);
        return (
          '<article class="b100-path-card b100-path-card--ai">' +
          '<h3 class="b100-path-card__title">' +
          esc(m.module) +
          " · " +
          esc(m.zone) +
          " 区</h3>" +
          '<p class="b100-path-card__sub">' +
          esc(m.zh) +
          "</p>" +
          '<p class="b100-path-card__sub"><strong>AI 协作：</strong>' +
          esc(m.how) +
          '</p><a href="' +
          esc(nav.href) +
          '" onclick="' +
          esc(nav.onclick) +
          '">进入 →</a></article>"
        );
      })
      .join("");
  }

  function renderDepartments(data) {
    var host = doc.getElementById("ai-departments");
    if (!host || !data.groups) return;
    host.innerHTML = data.groups
      .map(function (g) {
        var pages = (g.pages || [])
          .map(function (p) {
            var nav = navAttrs(p.path);
            var hi = p.highlight ? ' <span class="b100-ai-page__hi">★</span>' : "";
            var aiHow = p.aiHow
              ? '<span class="b100-ai-page__desc">AI：' + esc(p.aiHow) + "</span>"
              : "";
            return (
              "<li><a href=\"" +
              esc(nav.href) +
              '" onclick="' +
              esc(nav.onclick) +
              '">' +
              esc(p.label) +
              hi +
              "</a>" +
              (p.desc ? '<span class="b100-ai-page__desc">' + esc(p.desc) + "</span>" : "") +
              aiHow +
              "</li>"
            );
          })
          .join("");
        return (
          '<article class="b100-path-card b100-path-card--ai b100-ai-dept" id="ai-dept-' +
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
          '<p class="b100-path-card__sub"><strong>谁用：</strong>' +
          esc(g.who) +
          "</p>" +
          '<p class="b100-path-card__sub"><strong>流程：</strong>' +
          esc(g.flow) +
          "</p>" +
          (g.aiHow
            ? '<p class="b100-path-card__sub"><strong>AI 协作：</strong>' + esc(g.aiHow) + "</p>"
            : "") +
          '<p class="b100-path-card__who"><strong>波次</strong> ' +
          esc(g.wave) +
          "</p>" +
          '<ul class="b100-ai-pages">' +
          pages +
          "</ul></article>"
        );
      })
      .join("");
  }

  function renderScenarioHome() {
    var host = doc.getElementById("ai-scenario-home");
    if (!host || !global.AiScenarioSsot) return;
    var ssot = global.AiScenarioSsot;
    host.innerHTML =
      '<p style="font-size:11px;color:#64748b;margin:0 0 10px;">点选任务 → 直达 4 Tab 工作台（已预填 Prompt）</p>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px;">' +
      ssot.SCENARIOS.map(function (s) {
        var path = "ai_tools/tools/ai_workbench_integrated.html?crm_from=home_scenario&scenario=" + encodeURIComponent(s.id) + "#tab-prompt";
        var nav = navAttrs(path);
        return (
          '<a href="' +
          esc(nav.href) +
          '" onclick="' +
          esc(nav.onclick) +
          '" style="display:flex;gap:10px;padding:14px;border:2px solid #e9d5ff;border-radius:12px;background:#faf5ff;text-decoration:none;color:#1e293b;font-size:12px;line-height:1.45;min-height:44px;">' +
          '<span style="font-size:1.4rem;">' +
          esc(s.emoji) +
          "</span><span>" +
          esc(s.label) +
          "</span></a>"
        );
      }).join("") +
      "</div>";
  }

  function boot() {
    var data = global.AI_LAB_DEPARTMENTS;
    renderScenarioHome();
    if (!data) return;
    renderWhenToUse(data);
    renderChurchGoals(data);
    renderPrinciples(data);
    renderAiHowWorkflow(data);
    renderWaves(data);
    renderCrossModule(data);
    renderDepartments(data);
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : this, document);
