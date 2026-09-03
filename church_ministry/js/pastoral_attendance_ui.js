/**
 * Page 3 · 聚会与出席统计 UI
 */
(function (win, doc) {
  "use strict";

  var H = win.PastoralDataHub;
  if (!H) return;

  var state = { groupId: null, tab: "report" };
  var trendChart = null;

  function $(id) {
    return doc.getElementById(id);
  }

  function switchTab(name) {
    state.tab = name;
    doc.querySelectorAll(".pa-tab").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === name);
    });
    doc.querySelectorAll(".pa-panel").forEach(function (p) {
      p.classList.toggle("active", p.id === "pa-panel-" + name);
    });
    if (name === "trend") renderTrendChart();
    if (win.history && win.history.replaceState) {
      win.history.replaceState(null, "", "#tab-" + name);
    }
  }

  function renderGroupSelect() {
    var sel = $("pa-group-select");
    if (!sel) return;
    sel.innerHTML = H.getGroups()
      .map(function (g) {
        return '<option value="' + g.id + '">' + H.esc(g.name) + "</option>";
      })
      .join("");
    var q = new URLSearchParams(win.location.search || "");
    state.groupId = q.get("groupId") ? parseInt(q.get("groupId"), 10) : H.getActiveGroup() && H.getActiveGroup().id;
    if (state.groupId == null && H.getGroups()[0]) state.groupId = H.getGroups()[0].id;
    sel.value = String(state.groupId);
    H.setActiveGroup(state.groupId);
    sel.onchange = function () {
      state.groupId = parseInt(sel.value, 10);
      H.setActiveGroup(state.groupId);
      renderAll();
    };
  }

  function renderReportForm() {
    var host = $("pa-report-form");
    if (!host || state.groupId == null) return;
    var roster = H.membersInGroup(state.groupId);
    var wk = H.isoWeekKey(H.todayISO());
    var html =
      "<p>本周 <strong>" +
      H.esc(wk) +
      '</strong> · 勾选出席状态后储存（写入 <code>group_attendance_v1</code> + 会友主档 attendance）</p>';
    html += '<table class="pa-table"><thead><tr><th>会友</th><th>出席</th><th>请假</th><th>缺席</th></tr></thead><tbody>';
    roster.forEach(function (m) {
      html +=
        "<tr><td>" +
        H.memberLinkHtml(m.id, m.name) +
        '</td><td><input type="radio" name="att_' +
        m.id +
        '" value="present" checked></td><td><input type="radio" name="att_' +
        m.id +
        '" value="leave"></td><td><input type="radio" name="att_' +
        m.id +
        '" value="absent"></td></tr>';
    });
    html += "</tbody></table>";
    html += '<p><button type="button" class="pa-btn" id="pa-save-report">提交本周出席</button></p>';
    host.innerHTML = html;
    $("pa-save-report").onclick = function () {
      var records = roster.map(function (m) {
        var picked = doc.querySelector('input[name="att_' + m.id + '"]:checked');
        return { memberId: m.id, status: picked ? picked.value : "present" };
      });
      var res = H.recordGroupAttendanceSession(state.groupId, H.todayISO(), records);
      var msg = "出席已储存。";
      if (res.alerts && res.alerts.length) {
        msg +=
          "\n\n已触发探访预警：" +
          res.alerts.map(function (a) {
            return a.name + "(" + a.streak + "周)";
          }).join("、");
      }
      win.alert(msg);
      renderAlerts();
      renderTrendChart();
    };
  }

  function renderTrendChart() {
    var canvas = $("pa-trend-chart");
    if (!canvas || state.groupId == null || !win.Chart) return;
    var trend = H.getAttendanceTrend(state.groupId, 10);
    var labels = trend.map(function (t) {
      return t.weekKey;
    });
    var data = trend.map(function (t) {
      return t.rate;
    });
    if (trendChart) trendChart.destroy();
    trendChart = new win.Chart(canvas, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "出席率 %",
            data: data,
            borderColor: "#0d9488",
            backgroundColor: "rgba(13,148,136,0.15)",
            tension: 0.3,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { min: 0, max: 100 } }
      }
    });
    var sum = $("pa-trend-summary");
    if (sum) {
      sum.innerHTML = trend.length
        ? trend
            .map(function (t) {
              return (
                "<li>" +
                H.esc(t.weekKey) +
                " · " +
                t.present +
                "/" +
                t.total +
                " · " +
                t.rate +
                "%</li>"
              );
            })
            .join("")
        : "<li>尚无出席记录，请先在「每周汇报」提交。</li>";
    }
  }

  function renderAlerts() {
    var host = $("pa-alerts");
    if (!host) return;
    var alerts = H.listAbsenceAlerts();
    var roster = state.groupId != null ? H.membersInGroup(state.groupId) : [];
    var filtered = alerts.filter(function (a) {
      return roster.some(function (m) {
        return String(m.id) === String(a.memberId);
      });
    });
    if (!filtered.length) {
      host.innerHTML =
        '<p class="ok">✅ 目前没有连续 ' + H.ABSENCE_ALERT_WEEKS + " 周缺席预警。</p>";
      return;
    }
    host.innerHTML =
      '<p>以下会友已触发联动规则 → 探访事工待办 + 牧养事件流</p><ul class="alert-list">' +
      filtered
        .map(function (a) {
          return (
            '<li class="hot"><strong>' +
            H.memberLinkHtml(a.memberId, a.name) +
            "</strong> · 连续缺席 " +
            a.streak +
            ' 周 · <a href="../support/visitation_index.html?crm_from=b_pastoral">探访事工</a></li>'
          );
        })
        .join("") +
      "</ul>";
  }

  function renderFinance() {
    var host = $("pa-finance");
    if (!host) return;
    var B = win.ChurchDataBridge;
    var fin =
      B && B.getFinanceSummary
        ? B.getFinanceSummary()
        : { income: 0, expense: 0, balance: 0 };
    host.innerHTML =
      "<p>小组／牧区财务摘要（只读，详细编目在 E 区财务事工）</p>" +
      '<div class="pa-stat-grid">' +
      '<div class="pa-stat"><span class="n">' +
      fin.income +
      '</span><span class="l">收入示意</span></div>' +
      '<div class="pa-stat"><span class="n">' +
      fin.expense +
      '</span><span class="l">支出示意</span></div>' +
      '<div class="pa-stat"><span class="n">' +
      fin.balance +
      '</span><span class="l">结余示意</span></div></div>' +
      '<p><a href="../finance/finance-integrated.html?crm_from=b_pastoral">→ 财务事工完整系统</a></p>';
  }

  function renderAll() {
    renderReportForm();
    renderTrendChart();
    renderAlerts();
    renderFinance();
  }

  function csvEsc(v) {
    var s = v == null ? "" : String(v);
    if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  function downloadCsv(filename, lines) {
    var blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    var a = doc.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  }

  /** W3 · 出席／缺席長執報告 */
  function exportAttendanceCsv() {
    var store = H.getGroupAttendanceStore ? H.getGroupAttendanceStore() : { sessions: [] };
    var sessions = (store.sessions || []).filter(function (s) {
      return state.groupId == null || Number(s.groupId) === Number(state.groupId);
    });
    var lines = [["weekKey", "date", "groupId", "memberId", "status"].join(",")];
    sessions.forEach(function (sess) {
      (sess.records || []).forEach(function (r) {
        lines.push(
          [sess.weekKey || "", sess.date || "", sess.groupId, r.memberId, r.status || ""].map(csvEsc).join(",")
        );
      });
    });
    downloadCsv("group_attendance_" + H.todayISO() + ".csv", lines);
  }

  function exportAbsenceAlertsCsv() {
    var alerts = H.listAbsenceAlerts() || [];
    var roster = state.groupId != null ? H.membersInGroup(state.groupId) : [];
    var filtered = alerts.filter(function (a) {
      return !roster.length || roster.some(function (m) { return String(m.id) === String(a.memberId); });
    });
    var lines = [["memberId", "name", "streak"].join(",")];
    filtered.forEach(function (a) {
      lines.push([a.memberId, a.name, a.streak].map(csvEsc).join(","));
    });
    downloadCsv("absence_alerts_" + H.todayISO() + ".csv", lines);
  }

  function printWeekRoster() {
    if (state.groupId == null) return;
    var roster = H.membersInGroup(state.groupId);
    var g = H.getGroups().find(function (x) { return Number(x.id) === Number(state.groupId); });
    var wk = H.isoWeekKey(H.todayISO());
    var rows = roster
      .map(function (m) {
        return "<tr><td>" + H.esc(m.name) + "</td><td>" + H.esc(m.id) + "</td><td>□出席 □請假 □缺席</td></tr>";
      })
      .join("");
    var w = win.open("", "_blank");
    if (!w) {
      win.alert("無法開啟列印視窗");
      return;
    }
    w.document.write(
      '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>本週出席名單</title>' +
        "<style>body{font-family:Microsoft JhengHei,sans-serif;font-size:12px;padding:16px}" +
        "table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px;text-align:left}</style></head><body>" +
        "<h1>" +
        H.esc(g ? g.name : "小組") +
        " · 本週出席（" +
        H.esc(wk) +
        "）</h1>" +
        "<table><thead><tr><th>姓名</th><th>memberId</th><th>狀態</th></tr></thead><tbody>" +
        (rows || "<tr><td colspan='3'>無組員（請先在會友／小組指派）</td></tr>") +
        "</tbody></table><script>window.onload=function(){window.print();}</" +
        "script></body></html>"
    );
    w.document.close();
  }

  function boot() {
    H.ensurePastoralSeed(false);
    renderGroupSelect();
    doc.querySelectorAll(".pa-tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        switchTab(btn.getAttribute("data-tab"));
      });
    });
    var csvBtn = $("pa-export-att-csv");
    if (csvBtn) csvBtn.onclick = exportAttendanceCsv;
    var alertBtn = $("pa-export-alert-csv");
    if (alertBtn) alertBtn.onclick = exportAbsenceAlertsCsv;
    var printBtn = $("pa-print-week");
    if (printBtn) printBtn.onclick = printWeekRoster;
    var hash = (win.location.hash || "").replace(/^#/, "");
    if (hash.indexOf("tab-") === 0) switchTab(hash.slice(4));
    renderAll();
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window, document);
