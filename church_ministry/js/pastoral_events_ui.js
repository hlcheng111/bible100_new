/**
 * Page 4 · 圣工与活动通告（深度业务 UI）
 * Tab1 小组传递率 · Tab2 小组 PK 报名 · Tab3 服侍冲突校验 · Tab4 复盘物资库
 */
(function (win, doc) {
  "use strict";

  var H = win.PastoralDataHub;
  if (!H) return;

  var state = { tab: "announce", selectedReg: null };

  function $(id) {
    return doc.getElementById(id);
  }

  function switchTab(name) {
    state.tab = name;
    doc.querySelectorAll(".pev-tab").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === name);
    });
    ["announce", "register", "rota", "archive"].forEach(function (t) {
      var p = $("pev-panel-" + t);
      if (p) p.classList.toggle("active", t === name);
    });
    renderAll();
    if (win.history && win.history.replaceState) {
      win.history.replaceState(null, "", "#tab-" + name);
    }
  }

  function relayStatusLabel(st) {
    if (st === "prayed") return '<span class="pev-signal green">已入组祷告</span>';
    if (st === "relayed") return '<span class="pev-signal amber">已转发</span>';
    return '<span class="pev-signal red">未回应</span>';
  }

  function renderAnnounce() {
    var host = $("pev-panel-announce");
    if (!host) return;
    var board = H.getEventsBoard();
    var groups = H.getGroups();
    var html =
      '<div class="sg-card"><h3>发布新通告</h3>' +
      '<input id="pev-ann-title" class="sg-input" placeholder="标题">' +
      '<textarea id="pev-ann-body" class="sg-input" rows="2" placeholder="内容 · 发布后各组长需确认转发／入组祷告"></textarea>' +
      '<label>层级 <select id="pev-ann-level" class="sg-select"><option value="church">全教会</option><option value="district">牧区</option></select></label> ' +
      '<button type="button" class="sg-btn pev-btn" id="pev-ann-save">发布</button></div>';

    if (!board.announcements.length) {
      html += '<p class="muted">暂无通告 · 可点「载入示范数据」</p>';
    }

    board.announcements.forEach(function (a) {
      var stats = H.getAnnouncementRelayStats(a.id);
      var cls = a.level === "church" ? "pev-level-church" : "pev-level-district";
      html +=
        '<div class="sg-card ' +
        cls +
        '"><h3>' +
        H.esc(a.title) +
        '</h3><p class="muted">' +
        H.esc(a.date) +
        (a.region ? " · " + H.esc(a.region) : "") +
        "</p><p>" +
        H.esc(a.body) +
        "</p>";
      if (stats) {
        html +=
          '<div class="pev-relay-kpi">' +
          '<div class="sg-stat"><span class="n">' +
          stats.relayRate +
          '%</span><span class="l">传递率</span></div>' +
          '<div class="sg-stat"><span class="n">' +
          stats.prayRate +
          '%</span><span class="l">入组祷告率</span></div>' +
          '<div class="sg-stat warn"><span class="n">' +
          stats.pending +
          '</span><span class="l">零回应小组</span></div></div>';
        html += '<div class="pev-kpi-bar"><span style="width:' + stats.relayRate + '%"></span></div>';
        html += '<table class="pa-table pev-relay-table"><thead><tr><th>小组</th><th>组长</th><th>状态</th><th>操作</th></tr></thead><tbody>';
        groups.forEach(function (g) {
          var ack = (a.groupAcks && a.groupAcks[String(g.id)]) || { status: "pending" };
          var leaderLink = g.leaderMemberId ? H.memberLinkHtml(g.leaderMemberId, g.leader) : H.esc(g.leader || "—");
          html +=
            "<tr><td>" +
            H.esc(g.name) +
            "</td><td>" +
            leaderLink +
            "</td><td>" +
            relayStatusLabel(ack.status) +
            "</td><td>" +
            (ack.status === "pending" || ack.status === "relayed"
              ? '<button type="button" class="sg-btn sm pev-relay-btn" data-aid="' +
                a.id +
                '" data-gid="' +
                g.id +
                '" data-st="relayed">确认转发</button> ' +
                '<button type="button" class="sg-btn sm pev-relay-btn" data-aid="' +
                a.id +
                '" data-gid="' +
                g.id +
                '" data-st="prayed">已入组祷告</button>'
              : "—") +
            "</td></tr>";
        });
        html += "</tbody></table>";
        if (stats.zeroResponse.length) {
          html += '<p class="sg-todo">📌 零回应：' + stats.zeroResponse.map(function (z) {
            return H.esc(z.groupName);
          }).join("、") + "</p>";
        }
      }
      html += "</div>";
    });

    host.innerHTML = html;
    var save = $("pev-ann-save");
    if (save) {
      save.onclick = function () {
        var title = ($("pev-ann-title") && $("pev-ann-title").value) || "";
        if (!title.trim()) return;
        H.addAnnouncement({
          title: title.trim(),
          body: ($("pev-ann-body") && $("pev-ann-body").value) || "",
          level: ($("pev-ann-level") && $("pev-ann-level").value) || "church"
        });
        renderAnnounce();
      };
    }
    host.querySelectorAll(".pev-relay-btn").forEach(function (btn) {
      btn.onclick = function () {
        var gid = parseInt(btn.getAttribute("data-gid"), 10);
        var g = H.getGroups().find(function (x) {
          return Number(x.id) === gid;
        });
        H.confirmAnnouncementRelay(btn.getAttribute("data-aid"), gid, btn.getAttribute("data-st"), g && g.leaderMemberId);
        renderAnnounce();
      };
    });
  }

  function renderRegister() {
    var host = $("pev-panel-register");
    if (!host) return;
    var board = H.getEventsBoard();
    var members = H.getMembers();
    var groups = H.getGroups();
    if (!state.selectedReg && board.registrations.length) state.selectedReg = board.registrations[0].id;

    var html =
      '<div class="sg-card"><h3>新建联合活动（可开启小组 PK 报名）</h3>' +
      '<input id="pev-reg-title" class="sg-input" placeholder="活动名称">' +
      '<input id="pev-reg-date" type="date" class="sg-input">' +
      '<input id="pev-reg-cap" type="number" class="sg-input" placeholder="名额" value="30">' +
      '<label><input type="checkbox" id="pev-reg-pk" checked> 小组 PK 报名排行</label> ' +
      '<button type="button" class="sg-btn pev-btn" id="pev-reg-save">建立报名</button></div>';

    board.registrations.forEach(function (reg) {
      var enrolled = (reg.enrolled || []).length;
      var active = state.selectedReg === reg.id;
      html +=
        '<div class="sg-card' +
        (active ? " pev-reg-active" : "") +
        '"><h3>' +
        H.esc(reg.eventTitle) +
        (reg.pkMode ? ' <span class="pev-pk-badge">小组 PK</span>' : "") +
        '</h3><p class="muted">' +
        H.esc(reg.date) +
        " · 已报 " +
        enrolled +
        "/" +
        (reg.capacity || "—") +
        (reg.fee ? " · 费用 $" + reg.fee : "") +
        '</p><button type="button" class="sg-btn sm pev-pick-reg" data-reg="' +
        reg.id +
        '">查看排行</button>';

      if (active) {
        var lb = H.getRegistrationLeaderboard(reg.id);
        html += '<table class="pa-table"><thead><tr><th>排名</th><th>小组</th><th>报名率</th><th>已报/名册</th><th>批量报名</th></tr></thead><tbody>';
        lb.forEach(function (row, idx) {
          html +=
            "<tr><td>" +
            (idx + 1) +
            "</td><td>" +
            H.esc(row.groupName) +
            " · " +
            H.esc(row.leaderName) +
            '</td><td><div class="pev-kpi-bar"><span style="width:' +
            row.rate +
            '%"></span></div> ' +
            row.rate +
            "%</td><td>" +
            row.enrolledCount +
            "/" +
            row.rosterCount +
            '</td><td><button type="button" class="sg-btn sm pev-group-enroll" data-reg="' +
            reg.id +
            '" data-gid="' +
            row.groupId +
            '">组长批量勾选</button></td></tr>';
        });
        html += "</tbody></table>";

        html += "<p><strong>个别报名</strong></p>";
        (reg.enrolled || []).forEach(function (e) {
          html += (e.memberId ? H.memberLinkHtml(e.memberId, e.name) : H.esc(e.name)) + " ";
          if (e.memberId && reg.fee) {
            if (e.feeStatus === "paid") {
              html += '<span class="ok">已缴费</span> ';
            } else {
              html +=
                '<button type="button" class="sg-btn sm pev-pay-btn" data-reg="' +
                reg.id +
                '" data-mid="' +
                e.memberId +
                '">登记缴费</button> ';
            }
          }
        });
        html +=
          '<br><select class="pev-enroll-sel sg-select" data-reg="' +
          reg.id +
          '"><option value="">帮组员报名</option>' +
          members
            .map(function (m) {
              return '<option value="' + m.id + '">' + H.esc(m.name) + "</option>";
            })
            .join("") +
          "</select>";
      }
      html += "</div>";
    });

    host.innerHTML = html;
    var save = $("pev-reg-save");
    if (save) {
      save.onclick = function () {
        var title = ($("pev-reg-title") && $("pev-reg-title").value) || "";
        if (!title.trim()) return;
        var reg = H.addEventRegistration({
          eventTitle: title.trim(),
          date: ($("pev-reg-date") && $("pev-reg-date").value) || H.todayISO(),
          capacity: parseInt(($("pev-reg-cap") && $("pev-reg-cap").value) || "30", 10),
          pkMode: $("pev-reg-pk") && $("pev-reg-pk").checked
        });
        state.selectedReg = reg.id;
        renderRegister();
      };
    }
    host.querySelectorAll(".pev-pick-reg").forEach(function (btn) {
      btn.onclick = function () {
        state.selectedReg = btn.getAttribute("data-reg");
        renderRegister();
      };
    });
    host.querySelectorAll(".pev-group-enroll").forEach(function (btn) {
      btn.onclick = function () {
        H.enrollGroupForEvent(btn.getAttribute("data-reg"), parseInt(btn.getAttribute("data-gid"), 10));
        renderRegister();
      };
    });
    host.querySelectorAll(".pev-enroll-sel").forEach(function (sel) {
      sel.onchange = function () {
        if (!sel.value) return;
        H.enrollMemberForEvent(sel.getAttribute("data-reg"), sel.value);
        renderRegister();
      };
    });
    host.querySelectorAll(".pev-pay-btn").forEach(function (btn) {
      btn.onclick = function () {
        var X = win.PastoralCrossModuleBridge;
        if (!X || !X.recordActivityRegistrationFee) return;
        var res = X.recordActivityRegistrationFee(btn.getAttribute("data-mid"), btn.getAttribute("data-reg"));
        if (res && res.ok) {
          alert("已写入财务模块 · " + (res.txn && res.txn.txn_id ? res.txn.txn_id : ""));
          renderRegister();
        } else {
          alert("缴费登记失败：" + (res && res.error ? res.error : "未知"));
        }
      };
    });
  }

  function renderRota() {
    var host = $("pev-panel-rota");
    if (!host) return;
    var board = H.getEventsBoard();
    var members = H.getMembers();
    var html =
      '<div class="sg-card"><h3>新增轮值（自动校验小组聚会冲突 + 近 ' +
      H.ROTA_LOOKBACK_WEEKS +
      " 周频次）</h3>" +
      '<input id="pev-rot-slot" class="sg-input" placeholder="岗位（如：主日招待）">' +
      '<input id="pev-rot-time" class="sg-input" placeholder="时段（如：周六 15:00）">' +
      '<select id="pev-rot-member" class="sg-select" multiple size="4"><option value="">选择同工（可多选）</option>' +
      members
        .map(function (m) {
          return '<option value="' + m.id + '">' + H.esc(m.name) + "</option>";
        })
        .join("") +
      '</select><p class="muted">近 ' +
      H.ROTA_LOOKBACK_WEEKS +
      " 周服侍 ≥ " +
      H.ROTA_FREQ_WARN +
      " 次将爆红警示</p>" +
      '<button type="button" class="sg-btn pev-btn" id="pev-rot-save">储存并校验</button></div>';

    html += '<div class="sg-card"><h3>服侍轮值表 · ' + H.esc(H.isoWeekKey(H.todayISO())) + "</h3>";
    if (!board.rotas.length) html += '<p class="muted">暂无轮值</p>';
    board.rotas.forEach(function (r) {
      var warnHtml = "";
      (r.warnings || []).forEach(function (w) {
        warnHtml +=
          '<div class="pev-rota-warn ' +
          (w.severity === "critical" ? "critical" : "") +
          '">⚠ ' +
          H.esc(w.name) +
          "：" +
          H.esc(w.message) +
          "</div>";
      });
      var names = (r.memberIds || [])
        .map(function (mid) {
          var m = H.getMemberById(mid);
          return m ? H.memberLinkHtml(mid, m.name) : mid;
        })
        .join(" · ");
      if (!names && r.assignees) names = (r.assignees || []).map(H.esc).join(" · ");
      html +=
        '<div class="sg-list-item' +
        ((r.warnings || []).some(function (w) {
          return w.severity === "critical";
        })
          ? " alert"
          : "") +
        '"><strong>' +
        H.esc(r.slot) +
        "</strong>" +
        (r.slotTime ? " · " + H.esc(r.slotTime) : "") +
        " · " +
        H.esc(r.weekKey) +
        "<br>" +
        names +
        warnHtml +
        "</div>";
    });
    html += '<p class="muted"><a href="../worship/worship-integrated.html?crm_from=b_pastoral">→ 敬拜主桌</a></p></div>';
    host.innerHTML = html;

    var save = $("pev-rot-save");
    if (save) {
      save.onclick = function () {
        var slot = ($("pev-rot-slot") && $("pev-rot-slot").value) || "";
        if (!slot.trim()) return;
        var sel = $("pev-rot-member");
        var mids = [];
        if (sel) {
          Array.prototype.forEach.call(sel.selectedOptions, function (opt) {
            if (opt.value) mids.push(parseInt(opt.value, 10));
          });
        }
        var res = H.addRotaWithValidation({
          slot: slot.trim(),
          slotTime: ($("pev-rot-time") && $("pev-rot-time").value) || "",
          memberIds: mids
        });
        if (res.warnings.length) {
          alert(
            "已储存，但有 " +
              res.warnings.length +
              " 条警示：\n" +
              res.warnings
                .map(function (w) {
                  return w.name + " — " + w.message;
                })
                .join("\n")
          );
        }
        renderRota();
      };
    }
  }

  function renderArchive() {
    var host = $("pev-panel-archive");
    if (!host) return;
    var board = H.getEventsBoard();
    var html =
      '<div class="sg-card"><h3>归档大型活动 · 复盘物资库</h3>' +
      '<input id="pev-arc-title" class="sg-input" placeholder="活动名称">' +
      '<textarea id="pev-arc-vision" class="sg-input" rows="2" placeholder="异象／目标"></textarea>' +
      '<input id="pev-arc-budget-p" type="number" class="sg-input" placeholder="预算计划 $">' +
      '<input id="pev-arc-budget-a" type="number" class="sg-input" placeholder="实际支出 $">' +
      '<input id="pev-arc-vendor" class="sg-input" placeholder="供应商（名称:项目:金额，逗号分隔）">' +
      '<textarea id="pev-arc-materials" class="sg-input" rows="2" placeholder="可复用物资／文档（每行一项）"></textarea>' +
      '<textarea id="pev-arc-lessons" class="sg-input" rows="2" placeholder="Lessons Learned"></textarea>' +
      '<button type="button" class="sg-btn pev-btn" id="pev-arc-save">归档入库</button></div>';

    html += '<div class="sg-card"><h3>历年事工复盘知识库</h3>';
    board.archives.forEach(function (a) {
      html +=
        '<div class="sg-list-item pev-archive-item"><strong>' +
        H.esc(a.title) +
        "</strong> · " +
        a.year;
      if (a.vision) html += "<br><em>异象：</em>" + H.esc(a.vision);
      if (a.budgetPlanned != null || a.budgetActual != null) {
        html +=
          "<br>预算：计划 $" +
          (a.budgetPlanned != null ? a.budgetPlanned : "—") +
          " / 实际 $" +
          (a.budgetActual != null ? a.budgetActual : "—");
        if (a.budgetPlanned && a.budgetActual) {
          var diff = a.budgetActual - a.budgetPlanned;
          html += diff > 0 ? ' <span class="pev-signal red">超支 $' + diff + "</span>" : ' <span class="ok">节余</span>';
        }
      }
      if (a.vendors && a.vendors.length) {
        html += "<br>供应商：" + a.vendors.map(function (v) {
          return H.esc(v.name) + "（" + H.esc(v.item) + " $" + v.cost + "）";
        }).join("；");
      }
      if (a.materials && a.materials.length) {
        html += "<br>物资库：" + a.materials.map(H.esc).join(" · ");
      }
      if (a.lessonsLearned) html += "<br><strong>复盘：</strong>" + H.esc(a.lessonsLearned);
      if (a.summary) html += "<br>" + H.esc(a.summary);
      if (a.tags && a.tags.length) html += "<br><small>标签：" + a.tags.map(H.esc).join("、") + "</small>";
      html += "</div>";
    });
    html += "</div>";
    host.innerHTML = html;

    var save = $("pev-arc-save");
    if (save) {
      save.onclick = function () {
        var title = ($("pev-arc-title") && $("pev-arc-title").value) || "";
        if (!title.trim()) return;
        var vendors = (($("pev-arc-vendor") && $("pev-arc-vendor").value) || "")
          .split(/[,，]/)
          .map(function (s) {
            return s.trim();
          })
          .filter(Boolean)
          .map(function (chunk) {
            var parts = chunk.split(/[:：]/);
            return { name: parts[0] || "", item: parts[1] || "", cost: Number(parts[2]) || 0 };
          });
        H.addEventArchiveRich({
          title: title.trim(),
          vision: ($("pev-arc-vision") && $("pev-arc-vision").value) || "",
          budgetPlanned: parseFloat(($("pev-arc-budget-p") && $("pev-arc-budget-p").value) || "0") || null,
          budgetActual: parseFloat(($("pev-arc-budget-a") && $("pev-arc-budget-a").value) || "0") || null,
          vendors: vendors,
          materials: (($("pev-arc-materials") && $("pev-arc-materials").value) || "")
            .split("\n")
            .map(function (s) {
              return s.trim();
            })
            .filter(Boolean),
          lessonsLearned: ($("pev-arc-lessons") && $("pev-arc-lessons").value) || "",
          summary: ($("pev-arc-lessons") && $("pev-arc-lessons").value) || ""
        });
        renderArchive();
      };
    }
  }

  function renderAll() {
    if (state.tab === "announce") renderAnnounce();
    if (state.tab === "register") renderRegister();
    if (state.tab === "rota") renderRota();
    if (state.tab === "archive") renderArchive();
  }

  function boot() {
    H.ensurePastoralSeed(false);
    doc.querySelectorAll(".pev-tab").forEach(function (btn) {
      btn.onclick = function () {
        switchTab(btn.getAttribute("data-tab"));
      };
    });
    var seed = $("pev-seed-btn");
    if (seed) {
      seed.onclick = function () {
        H.ensurePastoralSeed(true);
        renderAll();
        seed.textContent = "已载入示范";
      };
    }
    var hash = (win.location.hash || "").replace("#tab-", "");
    if (hash && ["announce", "register", "rota", "archive"].indexOf(hash) >= 0) switchTab(hash);
    else renderAll();
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window, document);
