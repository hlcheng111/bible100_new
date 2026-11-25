/**
 * Page 5 · 門徒裝備與訓練（深度業務 UI）
 * Tab1 屬靈階梯 · Tab2 修課補課 · Tab3 提摩太篩選 · Tab4 師資教材
 */
(function (win, doc) {
  "use strict";

  var H = win.PastoralDataHub;
  if (!H) return;

  var state = { tab: "ladder", memberId: null };

  function $(id) {
    return doc.getElementById(id);
  }

  function switchTab(name) {
    state.tab = name;
    doc.querySelectorAll(".ptr-tab").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === name);
    });
    ["ladder", "progress", "pipeline", "resources"].forEach(function (t) {
      var p = $("ptr-panel-" + t);
      if (p) p.classList.toggle("active", t === name);
    });
    renderAll();
    if (win.history && win.history.replaceState) {
      win.history.replaceState(null, "", "#tab-" + name);
    }
  }

  function ladderStatusClass(st) {
    if (st === "done") return "ptr-ladder-done";
    if (st === "active") return "ptr-ladder-active";
    if (st === "available") return "ptr-ladder-open";
    return "ptr-ladder-lock";
  }

  function renderLadder() {
    var host = $("ptr-panel-ladder");
    if (!host) return;
    var members = H.getMembers();
    var q = new URLSearchParams(win.location.search || "");
    if (q.get("memberId")) state.memberId = q.get("memberId");
    var html =
      '<div class="por-filter"><label>查看學員 <select id="ptr-ladder-member"><option value="">— 選會友看階梯 —</option>' +
      members
        .map(function (m) {
          return '<option value="' + m.id + '"' + (String(state.memberId) === String(m.id) ? " selected" : "") + ">" + H.esc(m.name) + "</option>";
        })
        .join("") +
      "</select></label></div>";
    html += '<div class="sg-card"><h3>屬靈成長階梯</h3><p class="muted">慕道 → 初信造就 → 門徒訓練 → 組長預備 · 與 lifecycle + 修課狀態聯動</p>';
    if (!state.memberId) {
      html += '<p class="muted">請選擇會友，或從 <a href="pastoral-org-roster.html?crm_from=b_pastoral#tab-profiles">組織名冊 360</a> 跳入。</p>';
    } else {
      var ladder = H.getSpiritualLadderForMember(state.memberId);
      html += '<div class="ptr-ladder-track">';
      ladder.forEach(function (row, idx) {
        html +=
          '<div class="ptr-ladder-step ' +
          ladderStatusClass(row.status) +
          '"><span class="ptr-ladder-n">' +
          (idx + 1) +
          "</span><strong>" +
          H.esc(row.step.label) +
          "</strong><br><small>" +
          H.esc(row.statusLabel) +
          (row.course ? " · " + H.esc(row.course.title) : "") +
          "</small></div>";
        if (idx < ladder.length - 1) html += '<span class="ptr-ladder-arrow">→</span>';
      });
      html += "</div>";
      html += "<p>" + H.memberLinkHtml(state.memberId, "會友主檔") + " · 生命週期 " + H.lifecycleLabel(H.getMemberLifecycleStage(state.memberId)) + "</p>";
    }
    html += '<h4 style="margin-top:14px">訓練班時間表</h4><table class="pa-table"><thead><tr><th>課程</th><th>類型</th><th>時間</th><th>講員</th></tr></thead><tbody>';
    H.getCourses().forEach(function (c) {
      var typeMap = { foundation: "初信造就", disciple: "門徒訓練", leader: "組長預備" };
      html +=
        "<tr><td>" +
        H.esc(c.title) +
        "</td><td>" +
        H.esc(typeMap[c.type] || c.type) +
        "</td><td>" +
        H.esc(c.schedule) +
        "</td><td>" +
        H.esc(c.instructor) +
        "</td></tr>";
    });
    html += "</tbody></table></div>";
    host.innerHTML = html;
    var sel = $("ptr-ladder-member");
    if (sel) {
      sel.onchange = function () {
        state.memberId = sel.value || null;
        renderLadder();
      };
    }
  }

  function renderProgress() {
    var host = $("ptr-panel-progress");
    if (!host) return;
    var store = H.getTrainingStore();
    var members = H.getMembers();
    var html = '<div class="sg-card"><h3>修課進度</h3><table class="pa-table"><thead><tr><th>學員</th><th>課程</th><th>狀態</th></tr></thead><tbody>';
    store.enrollments.forEach(function (e) {
      var c = H.getCourses().find(function (x) {
        return x.id === e.courseId;
      });
      var m = H.getMemberById(e.memberId);
      html +=
        "<tr><td>" +
        H.memberLinkHtml(e.memberId, m ? m.name : e.memberId) +
        "</td><td>" +
        H.esc(c ? c.title : e.courseId) +
        '</td><td><select class="ptr-status-sel" data-mid="' +
        e.memberId +
        '" data-cid="' +
        e.courseId +
        '">' +
        ["enrolled", "in_progress", "completed", "exempt"]
          .map(function (st) {
            return '<option value="' + st + '"' + (e.status === st ? " selected" : "") + ">" + H.enrollmentStatusLabel(st) + "</option>";
          })
          .join("") +
        "</select></td></tr>";
    });
    html += "</tbody></table></div>";

    html +=
      '<div class="sg-card"><h3>補課追蹤</h3>' +
      '<select id="ptr-mk-member" class="sg-select"><option value="">學員</option>' +
      members
        .map(function (m) {
          return '<option value="' + m.id + '">' + H.esc(m.name) + "</option>";
        })
        .join("") +
      '</select><select id="ptr-mk-course" class="sg-select">' +
      H.getCourses()
        .map(function (c) {
          return '<option value="' + c.id + '">' + H.esc(c.title) + "</option>";
        })
        .join("") +
      '</select><input id="ptr-mk-missed" type="date" class="sg-input"><input id="ptr-mk-makeup" type="date" class="sg-input">' +
      '<input id="ptr-mk-note" class="sg-input" placeholder="補課備註">' +
      '<button type="button" class="sg-btn ptr-btn" id="ptr-mk-save">登記補課</button>';
    if (!store.makeupSessions.length) html += '<p class="muted">暫無補課記錄</p>';
    store.makeupSessions.forEach(function (mk) {
      var m = H.getMemberById(mk.memberId);
      var c = H.getCourses().find(function (x) {
        return x.id === mk.courseId;
      });
      html +=
        '<div class="sg-list-item">' +
        H.memberLinkHtml(mk.memberId, m ? m.name : mk.memberId) +
        " · " +
        H.esc(c ? c.title : mk.courseId) +
        " · 缺課 " +
        H.esc(mk.missedDate) +
        " → 補課 " +
        H.esc(mk.makeupDate) +
        " · " +
        H.esc(mk.status) +
        (mk.note ? "<br><small>" + H.esc(mk.note) + "</small>" : "") +
        "</div>";
    });
    html += "</div>";
    host.innerHTML = html;
    host.querySelectorAll(".ptr-status-sel").forEach(function (s) {
      s.onchange = function () {
        H.setEnrollment(s.getAttribute("data-mid"), s.getAttribute("data-cid"), s.value);
        renderProgress();
      };
    });
    var mkSave = $("ptr-mk-save");
    if (mkSave) {
      mkSave.onclick = function () {
        var mid = ($("ptr-mk-member") && $("ptr-mk-member").value) || "";
        var cid = ($("ptr-mk-course") && $("ptr-mk-course").value) || "";
        if (!mid || !cid) return;
        H.addMakeupSession({
          memberId: mid,
          courseId: cid,
          missedDate: ($("ptr-mk-missed") && $("ptr-mk-missed").value) || H.todayISO(),
          makeupDate: ($("ptr-mk-makeup") && $("ptr-mk-makeup").value) || H.todayISO(),
          note: ($("ptr-mk-note") && $("ptr-mk-note").value) || ""
        });
        renderProgress();
      };
    }
  }

  function renderPipeline() {
    var host = $("ptr-panel-pipeline");
    if (!host) return;
    var cands = H.getTimothyCandidates({ all: false });
    var pool = H.getTrainingStore().timothyPool || [];
    var html =
      '<div class="sg-card"><h3>提摩太篩選 · 準組長梯隊</h3>' +
      '<p class="muted">規則：出席率 ≥ ' +
      H.TIMOTHY_MIN_ATTENDANCE +
      "% · 門徒結業或組長預備正修 · 綜合分 ≥ 60 · 可鏈 Planning SHAPE 恩賜</p>";
    if (win.PastoralCrossModuleBridge && win.PastoralCrossModuleBridge.pullGiftAssessmentForMember) {
      html +=
        '<button type="button" class="sg-btn sm ptr-btn" id="ptr-sync-gifts">從 Planning 同步恩賜（全庫掃描）</button> ';
    }
    html += '<a href="../../church_planning/tools/shape-gifts-assessment.html" target="_parent">→ SHAPE 恩賜測評</a></div>';

    html += '<div class="sg-card"><h4>推薦候選（' + cands.length + "）</h4>";
    if (!cands.length) html += '<p class="muted">暫無達標候選 · 請完善出席與修課數據</p>';
    cands.forEach(function (c) {
      html +=
        '<div class="sg-list-item"><strong>' +
        H.memberLinkHtml(c.memberId, c.name) +
        '</strong> · 綜合分 <span class="ptr-roi">' +
        c.score +
        "</span> · 出席 " +
        (c.attendanceRate != null ? c.attendanceRate + "%" : "—") +
        " · " +
        H.lifecycleLabel(c.lifecycle) +
        (c.gifts && c.gifts.primary ? " · 恩賜 " + H.esc(c.gifts.primary) : "") +
        (c.inPool ? ' <span class="ok">已在池</span>' : "") +
        '<br><button type="button" class="sg-btn sm ptr-pool-btn" data-mid="' +
        c.memberId +
        '">加入提摩太池</button></div>';
    });
    html += "</div>";

    html += '<div class="sg-card"><h4>提摩太池（' + pool.length + "）</h4>";
    pool.forEach(function (t) {
      var m = H.getMemberById(t.memberId);
      html +=
        '<div class="sg-list-item">' +
        H.memberLinkHtml(t.memberId, m ? m.name : t.memberId) +
        " · 分 " +
        (t.score || "—") +
        (t.note ? " · " + H.esc(t.note) : "") +
        "</div>";
    });
    html += '<p><a href="pastoral-org-roster.html?crm_from=b_pastoral#tab-lifecycle">→ 組織名冊 · 生命週期</a></p></div>';
    host.innerHTML = html;

    host.querySelectorAll(".ptr-pool-btn").forEach(function (btn) {
      btn.onclick = function () {
        H.promoteToTimothyPool(btn.getAttribute("data-mid"), "UI 篩選入池");
        renderPipeline();
      };
    });
    var syncG = $("ptr-sync-gifts");
    if (syncG && win.PastoralCrossModuleBridge) {
      syncG.onclick = function () {
        var n = win.PastoralCrossModuleBridge.syncAllPlanningGifts();
        alert("已同步 " + (n || 0) + " 位會友恩賜至 profiles360");
        renderPipeline();
      };
    }
  }

  function renderResources() {
    var host = $("ptr-panel-resources");
    if (!host) return;
    var store = H.getTrainingStore();
    var html = '<div class="sg-card"><h3>師資與教材庫</h3>';
    store.resources.forEach(function (r) {
      var c = H.getCourses().find(function (x) {
        return x.id === r.courseId;
      });
      html +=
        '<div class="sg-list-item"><strong>' +
        H.esc(r.title) +
        "</strong> · " +
        H.esc(r.type) +
        (c ? " · " + H.esc(c.title) : "") +
        "</div>";
    });
    html +=
      '<p class="muted">修課同步 <a href="../education/education-integrated.html?crm_from=b_pastoral">主日學學籍</a> · 數據備份見 <a href="index.html#data-ops">團契總覽</a></p></div>';
    host.innerHTML = html;
  }

  function renderAll() {
    if (state.tab === "ladder") renderLadder();
    if (state.tab === "progress") renderProgress();
    if (state.tab === "pipeline") renderPipeline();
    if (state.tab === "resources") renderResources();
  }

  function boot() {
    H.ensurePastoralSeed(false);
    doc.querySelectorAll(".ptr-tab").forEach(function (btn) {
      btn.onclick = function () {
        switchTab(btn.getAttribute("data-tab"));
      };
    });
    var seed = $("ptr-seed-btn");
    if (seed) {
      seed.onclick = function () {
        H.ensurePastoralSeed(true);
        renderAll();
        seed.textContent = "已載入示範";
      };
    }
    var hash = (win.location.hash || "").replace("#tab-", "");
    var tabMap = { courses: "ladder", ladder: "ladder", progress: "progress", pipeline: "pipeline", resources: "resources" };
    if (hash && tabMap[hash]) switchTab(tabMap[hash]);
    else renderAll();
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window, document);
