/**
 * Page 4 · 聖工與活動通告（深度業務 UI）
 * Tab1 小組傳遞率 · Tab2 小組 PK 報名 · Tab3 服侍衝突校驗 · Tab4 覆盤物資庫
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
    if (st === "prayed") return '<span class="pev-signal green">已入組禱告</span>';
    if (st === "relayed") return '<span class="pev-signal amber">已轉發</span>';
    return '<span class="pev-signal red">未回應</span>';
  }

  function renderAnnounce() {
    var host = $("pev-panel-announce");
    if (!host) return;
    var board = H.getEventsBoard();
    var groups = H.getGroups();
    var html =
      '<div class="sg-card"><h3>發佈新通告</h3>' +
      '<input id="pev-ann-title" class="sg-input" placeholder="標題">' +
      '<textarea id="pev-ann-body" class="sg-input" rows="2" placeholder="內容 · 發佈後各組長需確認轉發／入組禱告"></textarea>' +
      '<label>層級 <select id="pev-ann-level" class="sg-select"><option value="church">全教會</option><option value="district">牧區</option></select></label> ' +
      '<button type="button" class="sg-btn pev-btn" id="pev-ann-save">發佈</button></div>';

    if (!board.announcements.length) {
      html += '<p class="muted">暫無通告 · 可點「載入示範數據」</p>';
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
          '%</span><span class="l">傳遞率</span></div>' +
          '<div class="sg-stat"><span class="n">' +
          stats.prayRate +
          '%</span><span class="l">入組禱告率</span></div>' +
          '<div class="sg-stat warn"><span class="n">' +
          stats.pending +
          '</span><span class="l">零回應小組</span></div></div>';
        html += '<div class="pev-kpi-bar"><span style="width:' + stats.relayRate + '%"></span></div>';
        html += '<table class="pa-table pev-relay-table"><thead><tr><th>小組</th><th>組長</th><th>狀態</th><th>操作</th></tr></thead><tbody>';
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
                '" data-st="relayed">確認轉發</button> ' +
                '<button type="button" class="sg-btn sm pev-relay-btn" data-aid="' +
                a.id +
                '" data-gid="' +
                g.id +
                '" data-st="prayed">已入組禱告</button>'
              : "—") +
            "</td></tr>";
        });
        html += "</tbody></table>";
        if (stats.zeroResponse.length) {
          html += '<p class="sg-todo">📌 零回應：' + stats.zeroResponse.map(function (z) {
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
      '<div class="sg-card"><h3>新建聯合活動（可開啟小組 PK 報名）</h3>' +
      '<input id="pev-reg-title" class="sg-input" placeholder="活動名稱">' +
      '<input id="pev-reg-date" type="date" class="sg-input">' +
      '<input id="pev-reg-cap" type="number" class="sg-input" placeholder="名額" value="30">' +
      '<label><input type="checkbox" id="pev-reg-pk" checked> 小組 PK 報名排行</label> ' +
      '<button type="button" class="sg-btn pev-btn" id="pev-reg-save">建立報名</button></div>';

    board.registrations.forEach(function (reg) {
      var enrolled = (reg.enrolled || []).length;
      var active = state.selectedReg === reg.id;
      html +=
        '<div class="sg-card' +
        (active ? " pev-reg-active" : "") +
        '"><h3>' +
        H.esc(reg.eventTitle) +
        (reg.pkMode ? ' <span class="pev-pk-badge">小組 PK</span>' : "") +
        '</h3><p class="muted">' +
        H.esc(reg.date) +
        " · 已報 " +
        enrolled +
        "/" +
        (reg.capacity || "—") +
        (reg.fee ? " · 費用 $" + reg.fee : "") +
        '</p><button type="button" class="sg-btn sm pev-pick-reg" data-reg="' +
        reg.id +
        '">查看排行</button>';

      if (active) {
        var lb = H.getRegistrationLeaderboard(reg.id);
        html += '<table class="pa-table"><thead><tr><th>排名</th><th>小組</th><th>報名率</th><th>已報/名冊</th><th>批量報名</th></tr></thead><tbody>';
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
            '">組長批量勾選</button></td></tr>';
        });
        html += "</tbody></table>";

        html += "<p><strong>個別報名</strong></p>";
        (reg.enrolled || []).forEach(function (e) {
          html += (e.memberId ? H.memberLinkHtml(e.memberId, e.name) : H.esc(e.name)) + " ";
          if (e.memberId && reg.fee) {
            if (e.feeStatus === "paid") {
              html += '<span class="ok">已繳費</span> ';
            } else {
              html +=
                '<button type="button" class="sg-btn sm pev-pay-btn" data-reg="' +
                reg.id +
                '" data-mid="' +
                e.memberId +
                '">登記繳費</button> ';
            }
          }
        });
        html +=
          '<br><select class="pev-enroll-sel sg-select" data-reg="' +
          reg.id +
          '"><option value="">幫組員報名</option>' +
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
          alert("已寫入財務模塊 · " + (res.txn && res.txn.txn_id ? res.txn.txn_id : ""));
          renderRegister();
        } else {
          alert("繳費登記失敗：" + (res && res.error ? res.error : "未知"));
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
      '<div class="sg-card"><h3>新增輪值（自動校驗小組聚會衝突 + 近 ' +
      H.ROTA_LOOKBACK_WEEKS +
      " 周頻次）</h3>" +
      '<input id="pev-rot-slot" class="sg-input" placeholder="崗位（如：主日招待）">' +
      '<input id="pev-rot-time" class="sg-input" placeholder="時段（如：週六 15:00）">' +
      '<select id="pev-rot-member" class="sg-select" multiple size="4"><option value="">選擇同工（可多選）</option>' +
      members
        .map(function (m) {
          return '<option value="' + m.id + '">' + H.esc(m.name) + "</option>";
        })
        .join("") +
      '</select><p class="muted">近 ' +
      H.ROTA_LOOKBACK_WEEKS +
      " 周服侍 ≥ " +
      H.ROTA_FREQ_WARN +
      " 次將爆紅警示</p>" +
      '<button type="button" class="sg-btn pev-btn" id="pev-rot-save">儲存並校驗</button></div>';

    html += '<div class="sg-card"><h3>服侍輪值表 · ' + H.esc(H.isoWeekKey(H.todayISO())) + "</h3>";
    if (!board.rotas.length) html += '<p class="muted">暫無輪值</p>';
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
            "已儲存，但有 " +
              res.warnings.length +
              " 條警示：\n" +
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
      '<div class="sg-card"><h3>歸檔大型活動 · 覆盤物資庫</h3>' +
      '<input id="pev-arc-title" class="sg-input" placeholder="活動名稱">' +
      '<textarea id="pev-arc-vision" class="sg-input" rows="2" placeholder="異象／目標"></textarea>' +
      '<input id="pev-arc-budget-p" type="number" class="sg-input" placeholder="預算計劃 $">' +
      '<input id="pev-arc-budget-a" type="number" class="sg-input" placeholder="實際支出 $">' +
      '<input id="pev-arc-vendor" class="sg-input" placeholder="供應商（名稱:項目:金額，逗號分隔）">' +
      '<textarea id="pev-arc-materials" class="sg-input" rows="2" placeholder="可複用物資／文檔（每行一項）"></textarea>' +
      '<textarea id="pev-arc-lessons" class="sg-input" rows="2" placeholder="Lessons Learned"></textarea>' +
      '<button type="button" class="sg-btn pev-btn" id="pev-arc-save">歸檔入庫</button></div>';

    html += '<div class="sg-card"><h3>歷年事工覆盤知識庫</h3>';
    board.archives.forEach(function (a) {
      html +=
        '<div class="sg-list-item pev-archive-item"><strong>' +
        H.esc(a.title) +
        "</strong> · " +
        a.year;
      if (a.vision) html += "<br><em>異象：</em>" + H.esc(a.vision);
      if (a.budgetPlanned != null || a.budgetActual != null) {
        html +=
          "<br>預算：計劃 $" +
          (a.budgetPlanned != null ? a.budgetPlanned : "—") +
          " / 實際 $" +
          (a.budgetActual != null ? a.budgetActual : "—");
        if (a.budgetPlanned && a.budgetActual) {
          var diff = a.budgetActual - a.budgetPlanned;
          html += diff > 0 ? ' <span class="pev-signal red">超支 $' + diff + "</span>" : ' <span class="ok">節餘</span>';
        }
      }
      if (a.vendors && a.vendors.length) {
        html += "<br>供應商：" + a.vendors.map(function (v) {
          return H.esc(v.name) + "（" + H.esc(v.item) + " $" + v.cost + "）";
        }).join("；");
      }
      if (a.materials && a.materials.length) {
        html += "<br>物資庫：" + a.materials.map(H.esc).join(" · ");
      }
      if (a.lessonsLearned) html += "<br><strong>覆盤：</strong>" + H.esc(a.lessonsLearned);
      if (a.summary) html += "<br>" + H.esc(a.summary);
      if (a.tags && a.tags.length) html += "<br><small>標籤：" + a.tags.map(H.esc).join("、") + "</small>";
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
        seed.textContent = "已載入示範";
      };
    }
    var hash = (win.location.hash || "").replace("#tab-", "");
    if (hash && ["announce", "register", "rota", "archive"].indexOf(hash) >= 0) switchTab(hash);
    else renderAll();
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window, document);
