/**
 * W5 · 主日崇拜一鍵策劃 Kanban / 全景 UI（部長視角）
 */
(function (win, doc) {
  "use strict";

  var STEPS = [
    { id: "pulpit", label: "講題已定", icon: "📖" },
    { id: "songs", label: "選歌中", icon: "🎵" },
    { id: "teams", label: "人力鎖定", icon: "👥" },
    { id: "rehearsal", label: "總彩排", icon: "🎼" },
    { id: "ready", label: "主日就緒", icon: "✅" }
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
        '" title="點擊推進狀態">' +
        '<span class="w5-step-icon">' +
        step.icon +
        "</span>" +
        '<span class="w5-step-label">' +
        esc(step.label) +
        "</span>" +
        '<span class="w5-step-state">' +
        esc(st === "done" ? "完成" : st === "draft" ? "進行中" : st === "blocked" ? "卡關" : "待開始") +
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
        : "<p class=\"w5-muted\">尚未選歌 · <a href=\"congregational-songs.html\">會眾詩歌</a></p>";
    return (
      '<div class="w5-panorama">' +
      '<div class="w5-pane"><h4>📖 講台</h4>' +
      "<p><strong>" +
      esc(p.speaker || "—") +
      "</strong></p>" +
      "<p>" +
      esc(p.sermonTitle || "待定講題") +
      "</p>" +
      "<p class=\"w5-muted\">" +
      esc(p.scripture || "") +
      '</p><a href="pulpit-ministry.html">編輯講台 →</a></div>' +
      '<div class="w5-pane"><h4>🎵 詩歌</h4>' +
      songsHtml +
      '<a href="song-library.html">詩歌庫 →</a></div>' +
      '<div class="w5-pane"><h4>👥 祭司與兵器</h4>' +
      "<p>主領：" +
      esc(t.worship_lead || "—") +
      "</p>" +
      "<p>詩班：" +
      esc(t.choir || "—") +
      "</p>" +
      "<p>音響：" +
      esc(t.sound || "—") +
      " · 直播：" +
      esc(t.stream || "—") +
      "</p>" +
      "<p>招待：" +
      esc(t.hospitality || "—") +
      '</p><a href="worship-team-management.html">敬拜團 →</a> · <a href="../media/audio-team.html">音響 →</a></div>' +
      '<div class="w5-pane"><h4>📋 禮儀</h4>' +
      "<p>主題：" +
      esc(plan.theme || "—") +
      "</p>" +
      "<p>聖歷：" +
      esc(plan.liturgySeason || "—") +
      (plan.liturgyColor ? ' <span class="w5-color-' + esc(plan.liturgyColor) + '">●</span>' : "") +
      "</p>" +
      "<p>彩排：" +
      esc(rh.date || "—") +
      " " +
      esc(rh.time || "") +
      " @ " +
      esc(rh.place || "") +
      '</p><a href="worship-management.html">崇拜禮儀 →</a></div>' +
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
        "<h3>🏛️ 主日崇拜一鍵策劃</h3>" +
        "<p>在同一張畫面聯動：講台 · 詩歌 · 敬拜團 · 詩班 · 影音 · 招待。</p>" +
        '<button type="button" class="volunteer-btn" id="w5SeedDemo">🔍 先看示範崇拜（聖靈降臨期）</button> ' +
        '<button type="button" class="volunteer-btn" id="w5NewPlan">➕ 新建本場策劃</button>' +
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
      "<h3>🏛️ 主日崇拜策劃 · " +
      esc(plan.date) +
      "</h3>" +
      '<div class="w5-plan-actions">' +
      '<button type="button" class="volunteer-btn" id="w5SeedDemo">示範</button>' +
      '<button type="button" class="volunteer-btn" id="w5NewPlan">新建</button>' +
      '<button type="button" class="volunteer-btn" id="w5SyncSub">↻ 從子頁同步</button>' +
      '<button type="button" class="volunteer-btn" id="w5PushSub">↗ 寫回講台</button>' +
      '<button type="button" class="volunteer-btn" id="w5ExportCsv" data-w2-report="worship-plan-csv">⬇ 策劃 CSV</button>' +
      '<button type="button" class="volunteer-btn" id="w5PrintPlan" data-w2-report="worship-plan-print">🖨 列印簡報</button>' +
      '<select id="w5PlanSelect" class="w5-select"></select>' +
      "</div></div>" +
      alerts +
      renderPipelineBar(plan) +
      renderPanorama(plan) +
      '<p class="w5-muted">數據鍵 <code>worship_sunday_plan_v1</code> · 點擊流程格可推進狀態（人審後存檔，不自動派工）</p>' +
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
        alert("已寫回講台講道計劃（pulpit_sermons）");
      });
    }
    var csvBtn = doc.getElementById("w5ExportCsv");
    if (csvBtn) {
      csvBtn.addEventListener("click", function () {
        exportPlanCsv(plan);
      });
    }
    var printBtn = doc.getElementById("w5PrintPlan");
    if (printBtn) {
      printBtn.addEventListener("click", function () {
        printPlanBrief(plan);
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

  function csvEsc(v) {
    var s = v == null ? "" : String(v);
    if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  /** W2 · 主日策劃長執報告 */
  function exportPlanCsv(plan) {
    var p = plan.pulpit || {};
    var t = plan.teams || {};
    var rh = plan.rehearsal || {};
    var songs = plan.songs || [];
    var lines = [
      ["field", "value"].join(","),
      ["date", plan.date].map(csvEsc).join(","),
      ["theme", plan.theme || ""].map(csvEsc).join(","),
      ["liturgySeason", plan.liturgySeason || ""].map(csvEsc).join(","),
      ["speaker", p.speaker || ""].map(csvEsc).join(","),
      ["sermonTitle", p.sermonTitle || ""].map(csvEsc).join(","),
      ["scripture", p.scripture || ""].map(csvEsc).join(","),
      ["worship_lead", t.worship_lead || ""].map(csvEsc).join(","),
      ["choir", t.choir || ""].map(csvEsc).join(","),
      ["sound", t.sound || ""].map(csvEsc).join(","),
      ["stream", t.stream || ""].map(csvEsc).join(","),
      ["hospitality", t.hospitality || ""].map(csvEsc).join(","),
      ["rehearsal", (rh.date || "") + " " + (rh.time || "") + " @ " + (rh.place || "")].map(csvEsc).join(",")
    ];
    songs.forEach(function (s, i) {
      lines.push(["song_" + (i + 1), (s.slot || "") + " " + (s.title || "")].map(csvEsc).join(","));
    });
    STEPS.forEach(function (step) {
      var st = (plan.pipeline && plan.pipeline[step.id]) || "pending";
      lines.push(["pipeline_" + step.id, st].map(csvEsc).join(","));
    });
    var blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    var a = doc.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "worship_plan_" + (plan.date || "draft") + ".csv";
    a.click();
  }

  function printPlanBrief(plan) {
    var p = plan.pulpit || {};
    var t = plan.teams || {};
    var rh = plan.rehearsal || {};
    var songs = (plan.songs || [])
      .map(function (s) {
        return "<li>" + esc(s.slot) + " · " + esc(s.title) + "</li>";
      })
      .join("");
    var pipe = STEPS.map(function (step) {
      var st = (plan.pipeline && plan.pipeline[step.id]) || "pending";
      return "<li>" + esc(step.label) + "：" + esc(st) + "</li>";
    }).join("");
    var w = win.open("", "_blank");
    if (!w) {
      alert("無法開啟列印視窗（請允許彈出）");
      return;
    }
    w.document.write(
      '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>主日策劃簡報</title>' +
        "<style>body{font-family:Microsoft JhengHei,sans-serif;font-size:13px;padding:18px;line-height:1.5}" +
        "h1{font-size:18px}h2{font-size:14px;margin-top:16px}ul{margin:6px 0}</style></head><body>" +
        "<h1>主日崇拜策劃 · " +
        esc(plan.date) +
        "</h1>" +
        "<p>主題：" +
        esc(plan.theme || "—") +
        " · 聖歷：" +
        esc(plan.liturgySeason || "—") +
        "</p>" +
        "<h2>講台</h2><p>" +
        esc(p.speaker || "—") +
        " · " +
        esc(p.sermonTitle || "待定") +
        "<br>" +
        esc(p.scripture || "") +
        "</p>" +
        "<h2>詩歌</h2><ul>" +
        (songs || "<li>（無）</li>") +
        "</ul>" +
        "<h2>人力</h2><p>主領：" +
        esc(t.worship_lead || "—") +
        " · 詩班：" +
        esc(t.choir || "—") +
        "<br>音響：" +
        esc(t.sound || "—") +
        " · 直播：" +
        esc(t.stream || "—") +
        " · 招待：" +
        esc(t.hospitality || "—") +
        "</p>" +
        "<h2>彩排</h2><p>" +
        esc(rh.date || "—") +
        " " +
        esc(rh.time || "") +
        " @ " +
        esc(rh.place || "") +
        "</p>" +
        "<h2>流程狀態</h2><ul>" +
        pipe +
        "</ul>" +
        "<script>window.onload=function(){window.print();}</" +
        "script></body></html>"
    );
    w.document.close();
  }

  win.AeWorshipPlanPipeline = { render: render, openPlanTab: openPlanTab, STEPS: STEPS, exportPlanCsv: exportPlanCsv, printPlanBrief: printPlanBrief };

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
