/**
 * W5 · 主日崇拜一键策划 Kanban / 全景 UI（部长视角）
 */
(function (win, doc) {
  "use strict";

  var STEPS = [
    { id: "pulpit", label: "讲题已定", icon: "📖" },
    { id: "songs", label: "选歌中", icon: "🎵" },
    { id: "teams", label: "人力锁定", icon: "👥" },
    { id: "rehearsal", label: "总彩排", icon: "🎼" },
    { id: "ready", label: "主日就绪", icon: "✅" }
  ];

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function statusClass(st) {
    if (st === "done") return "done";
    if (st === "draft") return "draft";
    if (st === "blocked") return "blocked";
    return "pending";
  }

  function renderPipelineBar(plan) {
    var html = '<div class="w5-pipeline" role="list">';
    STEPS.forEach(function (step, i) {
      var st = (plan.pipeline && plan.pipeline[step.id]) || "pending";
      html +=
        '<button type="button" class="w5-step ' +
        statusClass(st) +
        '" data-step="' +
        step.id +
        '" title="点击推进状态">' +
        '<span class="w5-step-icon">' +
        step.icon +
        "</span>" +
        '<span class="w5-step-label">' +
        esc(step.label) +
        "</span>" +
        '<span class="w5-step-state">' +
        esc(st === "done" ? "完成" : st === "draft" ? "进行中" : st === "blocked" ? "卡关" : "待开始") +
        "</span>" +
        "</button>";
      if (i < STEPS.length - 1) {
        html += '<span class="w5-arrow" aria-hidden="true">→</span>';
      }
    });
    html += "</div>";
    return html;
  }

  function renderPanorama(plan) {
    var p = plan.pulpit || {};
    var songs = plan.songs || [];
    var t = plan.teams || {};
    var rh = plan.rehearsal || {};
    var songsHtml =
      songs.length > 0
        ? "<ul>" +
          songs
            .map(function (s) {
              return "<li><em>" + esc(s.slot) + "</em> " + esc(s.title) + "</li>";
            })
            .join("") +
          "</ul>"
        : "<p class=\"w5-muted\">尚未选歌 · <a href=\"congregational-songs.html\">会众诗歌</a></p>";
    return (
      '<div class="w5-panorama">' +
      '<div class="w5-pane"><h4>📖 讲台</h4>' +
      "<p><strong>" +
      esc(p.speaker || "—") +
      "</strong></p>" +
      "<p>" +
      esc(p.sermonTitle || "待定讲题") +
      "</p>" +
      "<p class=\"w5-muted\">" +
      esc(p.scripture || "") +
      '</p><a href="pulpit-ministry.html">编辑讲台 →</a></div>' +
      '<div class="w5-pane"><h4>🎵 诗歌</h4>' +
      songsHtml +
      '<a href="song-library.html">诗歌库 →</a></div>' +
      '<div class="w5-pane"><h4>👥 祭司与兵器</h4>' +
      "<p>主领：" +
      esc(t.worship_lead || "—") +
      "</p>" +
      "<p>诗班：" +
      esc(t.choir || "—") +
      "</p>" +
      "<p>音响：" +
      esc(t.sound || "—") +
      " · 直播：" +
      esc(t.stream || "—") +
      "</p>" +
      "<p>招待：" +
      esc(t.hospitality || "—") +
      '</p><a href="worship-team-management.html">敬拜团 →</a> · <a href="../media/audio-team.html">音响 →</a></div>' +
      '<div class="w5-pane"><h4>📋 礼仪</h4>' +
      "<p>主题：" +
      esc(plan.theme || "—") +
      "</p>" +
      "<p>圣历：" +
      esc(plan.liturgySeason || "—") +
      (plan.liturgyColor ? ' <span class="w5-color-' + esc(plan.liturgyColor) + '">●</span>' : "") +
      "</p>" +
      "<p>彩排：" +
      esc(rh.date || "—") +
      " " +
      esc(rh.time || "") +
      " @ " +
      esc(rh.place || "") +
      '</p><a href="worship-management.html">崇拜礼仪 →</a></div>' +
      "</div>"
    );
  }

  function render(hostId) {
    if (win.AeWorshipRoleViews && win.AeWorshipRoleViews.getRole() === "volunteer") return;
    var host = doc.getElementById(hostId || "worship-sunday-plan-host");
    if (!host || !win.WorshipSundayPlan) return;
    if (win.WorshipPlanSync) win.WorshipPlanSync.syncAllFromSubpages();
    var P = win.WorshipSundayPlan;
    var plan = P.getActivePlan();
    if (!plan) {
      host.innerHTML =
        '<div class="w5-plan-empty">' +
        "<h3>🏛️ 主日崇拜一键策划</h3>" +
        "<p>在同一张画面联动：讲台 · 诗歌 · 敬拜团 · 诗班 · 影音 · 招待。</p>" +
        '<button type="button" class="volunteer-btn" id="w5SeedDemo">🔍 先看示范崇拜（圣灵降临期）</button> ' +
        '<button type="button" class="volunteer-btn" id="w5NewPlan">➕ 新建本场策划</button>' +
        "</div>";
      wireEmpty(host);
      return;
    }
    P.recomputePipeline(plan);
    var alerts =
      (plan.alerts || []).length > 0
        ? '<div class="worship-watch-panel">' + plan.alerts.map(function (a) { return "<p>⚠️ " + esc(a) + "</p>"; }).join("") + "</div>"
        : "";
    host.innerHTML =
      '<div class="w5-plan-root">' +
      '<div class="w5-plan-head">' +
      "<h3>🏛️ 主日崇拜策划 · " +
      esc(plan.date) +
      "</h3>" +
      '<div class="w5-plan-actions">' +
      '<button type="button" class="volunteer-btn" id="w5SeedDemo">示范</button>' +
      '<button type="button" class="volunteer-btn" id="w5NewPlan">新建</button>' +
      '<button type="button" class="volunteer-btn" id="w5SyncSub">↻ 从子页同步</button>' +
      '<button type="button" class="volunteer-btn" id="w5PushSub">↗ 写回讲台</button>' +
      '<select id="w5PlanSelect" class="w5-select"></select>' +
      "</div></div>" +
      alerts +
      renderPipelineBar(plan) +
      renderPanorama(plan) +
      '<p class="w5-muted">数据键 <code>worship_sunday_plan_v1</code> · 点击流程格可推进状态（人审后存档，不自动派工）</p>' +
      "</div>";
    wirePlan(host, plan);
  }

  function wireEmpty(host) {
    var seed = doc.getElementById("w5SeedDemo");
    var neu = doc.getElementById("w5NewPlan");
    if (seed) {
      seed.addEventListener("click", function () {
        win.WorshipSundayPlan.seedDemoPentecost();
        render(host.id);
      });
    }
    if (neu) {
      neu.addEventListener("click", function () {
        win.WorshipSundayPlan.createEmptyPlan();
        render(host.id);
      });
    }
  }

  function wirePlan(host, plan) {
    var P = win.WorshipSundayPlan;
    host.querySelectorAll(".w5-step").forEach(function (btn) {
      btn.addEventListener("click", function () {
        P.advanceStep(plan.id, btn.getAttribute("data-step"));
        render(host.id);
      });
    });
    var seed = doc.getElementById("w5SeedDemo");
    if (seed) {
      seed.addEventListener("click", function () {
        P.seedDemoPentecost();
        render(host.id);
      });
    }
    var neu = doc.getElementById("w5NewPlan");
    if (neu) {
      neu.addEventListener("click", function () {
        P.createEmptyPlan();
        render(host.id);
      });
    }
    var syncBtn = doc.getElementById("w5SyncSub");
    if (syncBtn && win.WorshipPlanSync) {
      syncBtn.addEventListener("click", function () {
        win.WorshipPlanSync.syncAllFromSubpages();
        render(host.id);
      });
    }
    var pushBtn = doc.getElementById("w5PushSub");
    if (pushBtn && win.WorshipPlanSync) {
      pushBtn.addEventListener("click", function () {
        win.WorshipPlanSync.syncAllToSubpages();
        alert("已写回讲台讲道计划（pulpit_sermons）");
      });
    }
    var sel = doc.getElementById("w5PlanSelect");
    if (sel) {
      var list = P.listPlans();
      sel.innerHTML = list
        .map(function (p) {
          return (
            '<option value="' +
            esc(p.id) +
            '"' +
            (String(p.id) === String(plan.id) ? " selected" : "") +
            ">" +
            esc(p.date + " " + (p.theme || "")) +
            "</option>"
          );
        })
        .join("");
      sel.addEventListener("change", function () {
        P.setActiveId(sel.value);
        render(host.id);
      });
    }
  }

  win.AeWorshipPlanPipeline = { render: render, openPlanTab: openPlanTab, STEPS: STEPS };

  function openPlanTab() {
    var tab = doc.querySelector('.tab[data-leader-only]');
    var content = doc.getElementById("tab-plan");
    if (!tab || !content) return false;
    doc.querySelectorAll(".tab").forEach(function (t) {
      t.classList.remove("active");
    });
    doc.querySelectorAll(".tab-content").forEach(function (tc) {
      tc.classList.remove("active");
    });
    tab.classList.add("active");
    content.classList.add("active");
    render("worship-sunday-plan-host");
    return true;
  }

  function boot() {
    var hash = (win.location.hash || "").replace(/^#/, "");
    if (hash === "plan") openPlanTab();
    else render("worship-sunday-plan-host");
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window, document);
