/**
 * Page 5 · 门徒装备与训练（深度业务 UI）
 * Tab1 属灵阶梯 · Tab2 修课补课 · Tab3 提摩太筛选 · Tab4 师资教材
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
      '<div class="por-filter"><label>查看学员 <select id="ptr-ladder-member"><option value="">— 选会友看阶梯 —</option>' +
      members
        .map(function (m) {
          return '<option value="' + m.id + '"' + (String(state.memberId) === String(m.id) ? " selected" : "") + ">" + H.esc(m.name) + "</option>";
        })
        .join("") +
      "</select></label></div>";
    html += '<div class="sg-card"><h3>属灵成长阶梯</h3><p class="muted">慕道 → 初信造就 → 门徒训练 → 组长预备 · 与 lifecycle + 修课状态联动</p>";
    if (!state.memberId) {
      html += '<p class="muted">请选择会友，或从 <a href="pastoral-org-roster.html?crm_from=b_pastoral#tab-profiles">组织名册 360</a> 跳入。</p>';
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
      html += "<p>" + H.memberLinkHtml(state.memberId, "会友主档") + " · 生命周期 " + H.lifecycleLabel(H.getMemberLifecycleStage(state.memberId)) + "</p>";
    }
    html += '<h4 style="margin-top:14px">训练班时间表</h4><table class="pa-table"><thead><tr><th>课程</th><th>类型</th><th>时间</th><th>讲员</th></tr></thead><tbody>';
    H.getCourses().forEach(function (c) {
      var typeMap = { foundation: "初信造就", disciple: "门徒训练", leader: "组长预备" };
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
    var html = '<div class="sg-card"><h3>修课进度</h3><table class="pa-table"><thead><tr><th>学员</th><th>课程</th><th>状态</th></tr></thead><tbody>';
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
      '<div class="sg-card"><h3>补课追踪</h3>' +
      '<select id="ptr-mk-member" class="sg-select"><option value="">学员</option>' +
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
      '<input id="ptr-mk-note" class="sg-input" placeholder="补课备注">' +
      '<button type="button" class="sg-btn ptr-btn" id="ptr-mk-save">登记补课</button>';
    if (!store.makeupSessions.length) html += '<p class="muted">暂无补课记录</p>';
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
        " · 缺课 " +
        H.esc(mk.missedDate) +
        " → 补课 " +
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
      '<div class="sg-card"><h3>提摩太筛选 · 准组长梯队</h3>' +
      '<p class="muted">规则：出席率 ≥ ' +
      H.TIMOTHY_MIN_ATTENDANCE +
      "% · 门徒结业或组长预备正修 · 综合分 ≥ 60 · 可链 Planning SHAPE 恩赐</p>";
    if (win.PastoralCrossModuleBridge && win.PastoralCrossModuleBridge.pullGiftAssessmentForMember) {
      html +=
        '<button type="button" class="sg-btn sm ptr-btn" id="ptr-sync-gifts">从 Planning 同步恩赐（全库扫描）</button> ';
    }
    html += '<a href="../../church_planning/tools/shape-gifts-assessment.html" target="_parent">→ SHAPE 恩赐测评</a></div>';

    html += '<div class="sg-card"><h4>推荐候选（' + cands.length + "）</h4>";
    if (!cands.length) html += '<p class="muted">暂无达标候选 · 请完善出席与修课数据</p>';
    cands.forEach(function (c) {
      html +=
        '<div class="sg-list-item"><strong>' +
        H.memberLinkHtml(c.memberId, c.name) +
        '</strong> · 综合分 <span class="ptr-roi">' +
        c.score +
        "</span> · 出席 " +
        (c.attendanceRate != null ? c.attendanceRate + "%" : "—") +
        " · " +
        H.lifecycleLabel(c.lifecycle) +
        (c.gifts && c.gifts.primary ? " · 恩赐 " + H.esc(c.gifts.primary) : "") +
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
    html += '<p><a href="pastoral-org-roster.html?crm_from=b_pastoral#tab-lifecycle">→ 组织名册 · 生命周期</a></p></div>';
    host.innerHTML = html;

    host.querySelectorAll(".ptr-pool-btn").forEach(function (btn) {
      btn.onclick = function () {
        H.promoteToTimothyPool(btn.getAttribute("data-mid"), "UI 筛选入池");
        renderPipeline();
      };
    });
    var syncG = $("ptr-sync-gifts");
    if (syncG && win.PastoralCrossModuleBridge) {
      syncG.onclick = function () {
        var n = win.PastoralCrossModuleBridge.syncAllPlanningGifts();
        alert("已同步 " + (n || 0) + " 位会友恩赐至 profiles360");
        renderPipeline();
      };
    }
  }

  function renderResources() {
    var host = $("ptr-panel-resources");
    if (!host) return;
    var store = H.getTrainingStore();
    var html = '<div class="sg-card"><h3>师资与教材库</h3>';
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
      '<p class="muted">修课同步 <a href="../education/education-integrated.html?crm_from=b_pastoral">主日学学籍</a> · 数据备份见 <a href="index.html#data-ops">团契总览</a></p></div>';
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
        seed.textContent = "已载入示范";
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
