/**
 * Page 2 · 组织与名册中心（深度业务 UI）
 */
(function (win, doc) {
  "use strict";

  var H = win.PastoralDataHub;
  if (!H) return;

  var state = {
    tab: "tree",
    matrix: { ageZone: "", geoZone: "", ministryTag: "", q: "" },
    profileId: null
  };

  function $(id) {
    return doc.getElementById(id);
  }

  function switchTab(name) {
    state.tab = name;
    doc.querySelectorAll(".por-tab").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === name);
    });
    doc.querySelectorAll("#por-panel-tree,#por-panel-roster,#por-panel-lifecycle,#por-panel-profiles").forEach(function (p) {
      p.classList.toggle("active", p.id === "por-panel-" + name);
    });
    renderAll();
    if (win.history && win.history.replaceState) {
      win.history.replaceState(null, "", "#tab-" + name);
    }
  }

  function renderTree() {
    var host = $("por-panel-tree");
    if (!host) return;
    var kpis = H.getLeaderHealthKpis();
    var nodes = H.getOrgTreeEnriched();
    var burnout = nodes.filter(function (n) {
      return n.leaderHealth && n.leaderHealth.healthStatus === "burnout_risk";
    });

    var html =
      '<div class="por-layout-2">' +
      '<div class="sg-card"><h3>牧养覆盖树 · 牧者 ➔ 区长 ➔ 组长</h3>' +
      (burnout.length
        ? '<p class="sg-card alert" style="padding:8px;font-size:11px;">⚠️ ' + burnout.length + " 个小组组长处于<strong>耗尽预警</strong>，需区长导师面谈</p>"
        : "") +
      '<p class="muted">字段：服侍年期 · 最后区长面谈 · 健康度 · 小组出席率</p>';

    var lastPastor = "";
    var lastDistrict = "";
    nodes.forEach(function (n) {
      if (n.pastor !== lastPastor) {
        if (lastPastor) html += "</div>";
        html +=
          '<div class="por-tree-zone" style="border-left:none;margin-left:0;padding-left:0"><strong>✝ ' +
          H.esc(n.pastor) +
          " 牧区</strong>";
        lastPastor = n.pastor;
        lastDistrict = "";
      }
      if (n.district !== lastDistrict) {
        html += '<div class="por-tree-zone"><strong>🛡 ' + H.esc(n.district) + "</strong>";
        lastDistrict = n.district;
      }
      var lh = n.leaderHealth || {};
      var hst = lh.healthStatus || "stable";
      var cardCls = hst === "burnout_risk" ? "burnout" : hst === "hot" ? "hot" : "";
      var leaderLink = n.leaderId ? H.memberLinkHtml(n.leaderId, n.leaderName) : H.esc(n.leaderName);
      html +=
        '<div class="por-leader-card ' +
        cardCls +
        '"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px">' +
        '<span><a href="small-groups-integrated.html?crm_from=b_pastoral&groupId=' +
        n.group.id +
        '">' +
        H.esc(n.group.name) +
        "</a> · 组长 " +
        leaderLink +
        "</span>" +
        '<span class="por-health-' +
        H.healthCss(hst) +
        '">' +
        (hst === "burnout_risk" ? "💔 " : hst === "hot" ? "🔥 " : "") +
        H.healthLabel(hst) +
        "</span></div>" +
        "<p class=\"muted\" style=\"margin:4px 0 0\">人数 " +
        n.memberCount +
        " · 出席约 " +
        (n.groupAttendanceRate != null ? n.groupAttendanceRate + "%" : "—") +
        " · 服侍 " +
        (lh.serviceYears != null ? lh.serviceYears + " 年" : "—") +
        (lh.lastMentorMeetingDate ? " · 面谈 " + lh.lastMentorMeetingDate : "") +
        "</p>";
      if (lh.burnoutReason) html += '<p style="margin:4px 0 0;color:#b91c1c;font-size:10px">' + H.esc(lh.burnoutReason) + "</p>";
      if (hst === "burnout_risk" && n.leaderId) {
        html +=
          '<button type="button" class="sg-btn sm por-burnout-btn" data-lid="' +
          n.leaderId +
          '" style="margin-top:6px;background:#be123c">推至战略桌 · 组长关怀</button>';
      }
      html += "</div>";
    });
    if (nodes.length) html += "</div></div>";

    html +=
      '</div><div class="sg-card"><h3>梯队健康度 KPI</h3>' +
      '<p class="muted" style="margin-bottom:10px">非行政点名 · 生命陪伴指标</p>' +
      kpiRow("本周组长快评汇报率", kpis.weeklyReportRate) +
      kpiRow("组长平稳/火热（无需介入）", kpis.stablePct + kpis.hotPct, "emerald") +
      '<p style="font-size:11px;margin:8px 0"><span class="por-health-burnout">耗尽预警 ' +
      kpis.burnoutCount +
      " 人</span> · 火热 " +
      kpis.hotCount +
      " · 平稳 " +
      kpis.stableCount +
      "</p>" +
      '<div class="sg-card alert" style="margin-top:8px;padding:10px;font-size:10px">战略提示：复活节季后 15% 核心组长出现疲态时，建议战略桌审议「合并聚会/安息周」提案。</div>' +
      "</div></div>";

    host.innerHTML = html;
    host.querySelectorAll(".por-burnout-btn").forEach(function (btn) {
      btn.onclick = function () {
        H.pushLeaderBurnoutToStrategy(parseInt(btn.getAttribute("data-lid"), 10));
        alert("已建立组长关怀专案并写入战略桌待办 · 请至牧养战略桌 Tab1 跟进");
        renderTree();
      };
    });
  }

  function kpiRow(label, pct, barCls) {
    return (
      '<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:10px"><span>' +
      label +
      '</span><strong>' +
      pct +
      '%</strong></div><div class="por-kpi-bar"><span class="' +
      (barCls || "") +
      '" style="width:' +
      Math.min(100, Number(pct) || 0) +
      '%"></span></div></div>'
    );
  }

  function matrixFilterBar() {
    var ageOpts = H.AGE_ZONES.map(function (z) {
      return (
        '<option value="' +
        z.id +
        '"' +
        (state.matrix.ageZone === z.id ? " selected" : "") +
        ">" +
        z.label +
        "</option>"
      );
    }).join("");
    var geo = H.getDistinctRegions();
    var geoOpts = geo
      .map(function (r) {
        return (
          '<option value="' +
          H.esc(r) +
          '"' +
          (state.matrix.geoZone === r ? " selected" : "") +
          ">" +
          H.esc(r) +
          "</option>"
        );
      })
      .join("");
    var minOpts = H.MINISTRY_TAG_OPTS.map(function (t) {
      return (
        '<option value="' +
        t.id +
        '"' +
        (state.matrix.ministryTag === t.id ? " selected" : "") +
        ">" +
        t.label +
        "</option>"
      );
    }).join("");
    return (
      '<div class="por-filter sg-card" style="margin-bottom:12px">' +
      '<label>分龄牧区 <select id="por-mx-age" class="sg-select"><option value="">全部</option>' +
      ageOpts +
      "</select></label> " +
      '<label>地理分区 <select id="por-mx-geo" class="sg-select"><option value="">全部</option>' +
      geoOpts +
      "</select></label> " +
      '<label>事工身份 <select id="por-mx-min" class="sg-select"><option value="">全部</option>' +
      minOpts +
      "</select></label> " +
      '<label>姓名 <input type="search" id="por-mx-q" class="sg-input" style="width:120px;display:inline-block" value="' +
      H.esc(state.matrix.q) +
      '"></label> ' +
      '<button type="button" class="sg-btn sm" id="por-mx-apply">交叉筛选</button></div>'
    );
  }

  function bindMatrixFilters(host) {
    var apply = host.querySelector("#por-mx-apply");
    if (!apply) return;
    apply.onclick = function () {
      state.matrix.ageZone = ($("por-mx-age") && $("por-mx-age").value) || "";
      state.matrix.geoZone = ($("por-mx-geo") && $("por-mx-geo").value) || "";
      state.matrix.ministryTag = ($("por-mx-min") && $("por-mx-min").value) || "";
      state.matrix.q = ($("por-mx-q") && $("por-mx-q").value) || "";
      renderRoster();
    };
  }

  function renderRoster() {
    var host = $("por-panel-roster");
    if (!host) return;
    var rows = H.getMembersMatrixFiltered(state.matrix);
    var html =
      matrixFilterBar() +
      '<div class="sg-card"><h3>多维标签矩阵名册（' +
      rows.length +
      " 人）</h3>" +
      '<p class="muted">【属灵身份】/【分龄】/【地理】/【跨界事工】— 一人多维度，非单一归类</p>' +
      '<table class="pa-table"><thead><tr><th>会友</th><th>属灵身份</th><th>分龄</th><th>地理</th><th>事工标签</th><th>小组</th><th>出席</th></tr></thead><tbody>';
    rows.forEach(function (row) {
      var m = row.member;
      var mx = row.matrix;
      var ageZ = H.AGE_ZONES.find(function (z) {
        return z.id === mx.ageZone;
      });
      var rate = H.getMemberAttendanceRate(m.id, row.group && row.group.id);
      html +=
        "<tr><td>" +
        H.memberLinkHtml(m.id, m.name) +
        "<br><small>#" +
        m.id +
        "</small></td>" +
        "<td>" +
        H.esc(mx.spiritualIdentity || H.lifecycleLabel(H.getMemberLifecycleStage(m.id))) +
        "</td>" +
        '<td><span class="por-matrix-tag age">' +
        H.esc(ageZ ? ageZ.label : mx.ageZone) +
        "</span></td>" +
        '<td><span class="por-matrix-tag geo">' +
        H.esc(mx.geoZone || "—") +
        "</span></td><td>";
      (mx.ministryTags || []).forEach(function (tid) {
        var t = H.MINISTRY_TAG_OPTS.find(function (x) {
          return x.id === tid;
        });
        html += '<span class="por-matrix-tag min">' + H.esc(t ? t.label : tid) + "</span> ";
      });
      if (!(mx.ministryTags || []).length) html += "—";
      html +=
        "</td><td>" +
        (row.group
          ? '<a href="small-groups-integrated.html?crm_from=b_pastoral&groupId=' + row.group.id + '">' + H.esc(row.group.name) + "</a>"
          : "—") +
        "</td><td>" +
        (rate != null ? rate + "%" : "—") +
        "</td></tr>";
    });
    html += "</tbody></table></div>";
    host.innerHTML = html;
    bindMatrixFilters(host);
  }

  function renderLifecycle() {
    var host = $("por-panel-lifecycle");
    if (!host) return;
    var pools = H.getLifecyclePools();
    var groups = H.getGroups();

    var html =
      '<div class="sg-card"><h3>生命周期状态机 · 转接引擎</h3>' +
      "<p class=\"muted\">新朋友满 " +
      H.NEWCOMER_PLACEMENT_WEEKS +
      " 周未落户 → 指派任务 · 稳定满 " +
      H.BAPTISM_REFERRAL_MONTHS +
      " 月 → 受浸推介池 · 连续 " +
      H.ABSENCE_ALERT_WEEKS +
      " 周缺席 → 战略桌探访</p>" +
      '<div class="por-lifecycle-grid">';

    html += lifecycleCol(
      "pool-new",
      "🌱 新朋友池",
      pools.newcomers.length,
      pools.newcomers
        .slice(0, 5)
        .map(function (row) {
          return memberTaskRow(row.member, "落户跟进", "newcomer");
        })
        .join("") || "<p class=\"muted\">暂无</p>"
    );

    html += lifecycleCol(
      "pool-stable",
      "🏡 稳定落户",
      pools.stable.length,
      "<p class=\"muted\">满 " +
        H.BAPTISM_REFERRAL_MONTHS +
        " 个月且未受浸者 → 自动进入受浸推介池（见待办）</p>"
    );

    html += lifecycleCol(
      "pool-risk",
      "⚠️ 流失预警",
      pools.atRisk.length,
      pools.atRisk
        .map(function (row) {
          var streak = (H.getMemberSummary(row.member.id) || {}).absenceStreak || H.ABSENCE_ALERT_WEEKS;
          return (
            '<div class="sg-list-item" style="margin-bottom:6px">' +
            H.memberLinkHtml(row.member.id, row.member.name) +
            ' <span class="stage-chip risk">连续 ' +
            streak +
            " 周缺席</span><br>" +
            '<button type="button" class="sg-btn sm por-strategy-btn" data-mid="' +
            row.member.id +
            '" style="margin-top:4px;background:#be123c">推战略桌 Tab1</button></div>'
          );
        })
        .join("") || "<p class=\"muted\">暂无预警</p>"
    );

    html += lifecycleCol(
      "pool-leader",
      "👑 领袖梯队",
      pools.leaderPipeline.length,
      pools.leaderPipeline
        .slice(0, 6)
        .map(function (p) {
          return "<div>" + H.memberLinkHtml(p.memberId, p.name) + " · " + H.enrollmentStatusLabel(p.status) + "</div>";
        })
        .join("") || "<p class=\"muted\">见门徒训练 Tab3</p>"
    );

    html += "</div></div>";

    if (pools.handoverTasks.length) {
      html += '<div class="sg-card"><h3>待办转接任务</h3><ul class="alert-list">';
      pools.handoverTasks.slice(0, 12).forEach(function (t) {
        html +=
          "<li><strong>" +
          H.esc(t.type) +
          "</strong> · " +
          (t.memberId ? H.memberLinkHtml(t.memberId, t.memberName || t.memberId) : H.esc(t.memberName)) +
          " — " +
          H.esc(t.reason) +
          "</li>";
      });
      html += "</ul></div>";
    }

    html += '<div class="sg-card"><h3>强制落户（新朋友 handover）</h3><p class="muted">区长/组长人工确认，写入 groupMemberships + pastoral_events</p>';
    html += '<select id="por-place-member" class="sg-select"><option value="">选择新朋友</option>';
    pools.newcomers.forEach(function (row) {
      html += '<option value="' + row.member.id + '">' + H.esc(row.member.name) + "</option>";
    });
    html += '</select> <select id="por-place-group" class="sg-select">';
    groups.forEach(function (g) {
      html += '<option value="' + g.id + '">' + H.esc(g.name) + "</option>";
    });
    html += '</select> <button type="button" class="sg-btn sm" id="por-place-save">确认落户</button></div>';

    host.innerHTML = html;

    host.querySelectorAll(".por-strategy-btn").forEach(function (btn) {
      btn.onclick = function () {
        var mid = btn.getAttribute("data-mid");
        H.pushToStrategyDesk(mid, "连续缺席流失预警 · 需深度探访", { type: "absence_followup", taskType: "absence_followup" });
        alert("已写入牧养战略桌探访日志 + 探访事工草稿");
        renderLifecycle();
      };
    });

    var placeSave = $("por-place-save");
    if (placeSave) {
      placeSave.onclick = function () {
        var mid = $("por-place-member") && $("por-place-member").value;
        var gid = $("por-place-group") && $("por-place-group").value;
        if (!mid || !gid) return;
        H.assignMemberToGroup(mid, gid);
        alert("已落户小组并关闭转接任务");
        renderLifecycle();
        renderRoster();
      };
    }
  }

  function lifecycleCol(cls, title, count, body) {
    return '<div class="por-lifecycle-col ' + cls + '"><strong>' + title + " (" + count + ")</strong><div style=\"margin-top:8px\">" + body + "</div></div>";
  }

  function memberTaskRow(member, label) {
    var groups = H.getGroups();
    var gopts = groups
      .map(function (g) {
        return '<option value="' + g.id + '">' + H.esc(g.name) + "</option>";
      })
      .join("");
    return (
      '<div class="sg-list-item" style="margin-bottom:6px;font-size:10px">' +
      H.memberLinkHtml(member.id, member.name) +
      "<br>" +
      label +
      '<br><select class="por-quick-group sg-select" data-mid="' +
      member.id +
      '" style="margin-top:4px;font-size:10px">' +
      gopts +
      '</select> <button type="button" class="sg-btn sm por-quick-place" data-mid="' +
      member.id +
      '">指派</button></div>'
    );
  }

  function renderProfiles() {
    var host = $("por-panel-profiles");
    if (!host) return;
    var members = H.getMembers();
    if (state.profileId == null && members[0]) state.profileId = members[0].id;

    var html = '<div class="por-360-layout"><div class="por-360-side sg-card"><h3>检索档案</h3>';
    html += '<input type="search" id="por-360-q" class="sg-input" placeholder="姓名…">';
    html += '<div id="por-360-list" style="margin-top:8px">';
    members.forEach(function (m) {
      html +=
        '<div class="por-360-pick' +
        (String(state.profileId) === String(m.id) ? " active" : "") +
        '" data-mid="' +
        m.id +
        '">#' +
        m.id +
        " " +
        H.esc(m.name) +
        "</div>";
    });
    html += "</div></div><div id=\"por-360-detail\"></div></div>";
    host.innerHTML = html;

    function filterList() {
      var q = ($("por-360-q") && $("por-360-q").value || "").toLowerCase();
      var list = $("por-360-list");
      if (!list) return;
      list.querySelectorAll(".por-360-pick").forEach(function (el) {
        var show = !q || el.textContent.toLowerCase().indexOf(q) >= 0;
        el.style.display = show ? "" : "none";
      });
    }

    host.querySelectorAll(".por-360-pick").forEach(function (el) {
      el.onclick = function () {
        state.profileId = parseInt(el.getAttribute("data-mid"), 10);
        renderProfiles();
      };
    });
    var qinp = $("por-360-q");
    if (qinp) qinp.oninput = filterList;

    renderProfileDetail();
  }

  function renderProfileDetail() {
    var detail = $("por-360-detail");
    if (!detail || state.profileId == null) return;
    var p = H.getProfile360(state.profileId);
    if (!p.member) {
      detail.innerHTML = "<p class=\"muted\">未找到会友</p>";
      return;
    }
    var m = p.member;
    var html =
      '<div class="sg-card"><h3>' +
      H.esc(m.name) +
      " · 360° 牧养全景</h3>" +
      "<p class=\"muted\">生命周期：<span class=\"stage-chip " +
      (p.lifecycle === "at_risk" ? "risk" : "") +
      '">' +
      H.lifecycleLabel(p.lifecycle) +
      "</span> · 小组：" +
      (p.group ? H.esc(p.group.name) : "—") +
      "</p></div>";

    html += '<div class="por-360-block"><strong>📋 探访痛点与关怀摘要</strong>';
    if (p.visitNotes.length) {
      p.visitNotes.forEach(function (v) {
        var note = v;
        if (v.sensitivity === "high" && H.filterVisitLogForViewer && !H.canViewSensitive()) {
          note = Object.assign({}, v, { summary: "（高敏记录 · 仅牧者/区长可见）", redacted: true });
        }
        html +=
          '<div style="margin-top:8px;padding:8px;background:#fff;border-radius:6px;border:1px solid #e2e8f0">' +
          "<small>" +
          H.esc(note.date) +
          " · " +
          H.esc(note.visitor) +
          (note.sensitivity === "high" ? ' <span class="por-sens-high">高敏感</span>' : "") +
          "</small><br><strong>" +
          H.esc(note.painCategory || "关怀") +
          "</strong><br>" +
          H.esc(note.summary) +
          "</div>";
      });
    } else html += '<p class="muted" style="margin-top:6px">尚无结构化探访摘要 · <a href="../support/visitation_index.html?crm_from=b_pastoral&memberId=' + m.id + '">探访事工</a></p>';
    html += "</div>";

    if (p.giftAssessment) {
      var g = p.giftAssessment;
      html +=
        '<div class="por-360-block" style="background:#fffbeb"><strong>✨ 恩赐测验</strong><br>核心：<strong>' +
        H.esc(g.primary) +
        "</strong>" +
        (g.secondary ? " + " + H.esc(g.secondary) : "") +
        (g.scores ? "（教导 " + (g.scores.教导 || g.scores["教导"]) + "%）" : "") +
        "<br>" +
        H.esc(g.pastorComment || "") +
        "</div>";
    }

    html += '<div class="por-360-block"><strong>🎓 门训轨迹</strong><br>' + (p.trainingPath.length ? H.esc(p.trainingPath.join(" ➔ ")) : "—") + "</div>";

    html += '<div class="por-360-block"><strong>🙏 代祷链</strong>';
    if (p.prayerChain.length) {
      p.prayerChain.forEach(function (pw) {
        html +=
          "<div style=\"margin-top:4px\">" +
          H.esc(pw.date) +
          " · " +
          H.esc(pw.request) +
          (pw.status === "answered" ? ' <span class="ok">✓ 已蒙应允</span>' : "") +
          (pw.note ? " — " + H.esc(pw.note) : "") +
          "</div>";
      });
    } else html += '<p class="muted">见战略桌代祷网络</p>';
    html += "</div>";

    html += '<div class="por-360-block"><strong>🛤️ 近期牧养事件轴</strong><ul style="margin:6px 0 0;padding-left:16px">';
    (p.timeline || []).slice(0, 8).forEach(function (ev) {
      html +=
        "<li style=\"margin-bottom:4px\"><small>" +
        String(ev.ts || "").slice(0, 10) +
        "</small> · " +
        H.esc(ev.summary || ev.event_type) +
        "</li>";
    });
    html += '</ul><a href="../members/member-integrated.html?crm_from=b_pastoral#tab=growth&memberId=' + m.id + '">完整 growth Tab</a></div>';

    detail.innerHTML = html;
  }

  function renderAll() {
    if (state.tab === "tree") renderTree();
    if (state.tab === "roster") renderRoster();
    if (state.tab === "lifecycle") renderLifecycle();
    if (state.tab === "profiles") renderProfiles();
  }

  function boot() {
    H.ensurePastoralSeed(false);
    H.evaluateLifecycleRules();
    doc.querySelectorAll(".por-tab").forEach(function (btn) {
      btn.onclick = function () {
        switchTab(btn.getAttribute("data-tab"));
      };
    });
    var seed = $("por-seed-btn");
    if (seed) {
      seed.onclick = function () {
        H.ensurePastoralSeed(true);
        H.evaluateLifecycleRules();
        renderAll();
        seed.textContent = "已载入深度示范";
      };
    }
    doc.addEventListener("click", function (ev) {
      var t = ev.target;
      if (t && t.classList && t.classList.contains("por-quick-place")) {
        var mid = t.getAttribute("data-mid");
        var sel = doc.querySelector('.por-quick-group[data-mid="' + mid + '"]');
        if (sel && sel.value) {
          H.assignMemberToGroup(mid, sel.value);
          renderLifecycle();
        }
      }
    });
    var hash = (win.location.hash || "").replace("#tab-", "");
    if (hash && ["tree", "roster", "lifecycle", "profiles"].indexOf(hash) >= 0) switchTab(hash);
    else renderAll();
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window, document);
