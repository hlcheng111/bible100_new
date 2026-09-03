/**
 * C 區 · 主日學工作桌 UI（🧭 認路 + 4 深度 Tab）
 */
(function (global, doc) {
  "use strict";

  var H, X, AI, charts = {};
  var aModule = { goals: [], outcomes: [] };
  var activeTab = "roster";
  var selectedMemberId = null;

  function getPanelMode() {
    return doc.body ? doc.body.getAttribute("data-edu-panel") || "" : "";
  }

  function requestShellTab(tab, params) {
    params = params || {};
    if (params.memberId) selectedMemberId = params.memberId;
    try {
      if (global.parent && global.parent !== global && global.parent.EducationIntegratedShell) {
        global.parent.EducationIntegratedShell.switchTab(tab, params);
        return true;
      }
    } catch (eShell) {}
    return false;
  }

  function notifyShellOverview() {
    try {
      if (global.parent && global.parent !== global && global.parent.EducationIntegratedShell) {
        global.parent.EducationIntegratedShell.renderOverview();
      }
    } catch (eOv) {}
  }

  function $(id) {
    return doc.getElementById(id);
  }

  function esc(s) {
    return H ? H.esc(s) : String(s == null ? "" : s);
  }

  function toast(msg, type) {
    var el = doc.createElement("div");
    el.style.cssText =
      "position:fixed;top:72px;right:16px;padding:10px 16px;border-radius:8px;z-index:2000;font-size:12px;color:#fff;background:" +
      (type === "error" ? "#dc2626" : type === "info" ? "#2563eb" : "#059669");
    el.textContent = msg;
    doc.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2800);
  }

  function openModal(title, html) {
    var m = $("edu-modal");
    var c = $("edu-modal-content");
    if (!m || !c) return;
    c.innerHTML = '<button type="button" class="edu-modal-close" id="edu-modal-x">&times;</button><h3 style="margin:0 0 12px;font-size:15px;">' + esc(title) + "</h3>" + html;
    m.classList.add("open");
    var x = $("edu-modal-x");
    if (x) x.onclick = closeModal;
  }

  function closeModal() {
    var m = $("edu-modal");
    if (m) m.classList.remove("open");
  }

  function loadAModule() {
    var B = global.ChurchDataBridge;
    if (B && B.getEducationAModuleData) {
      aModule = B.getEducationAModuleData();
      if (!aModule.goals) aModule.goals = [];
      if (!aModule.outcomes) aModule.outcomes = [];
    }
  }

  function saveAModule() {
    var B = global.ChurchDataBridge;
    if (B && B.saveEducationAModuleData) B.saveEducationAModuleData(aModule);
  }

  function renderGuidePanel() {
    var root = $("edu-guide-root");
    if (!root) return;
    var html =
      '<section class="edu-card edu-guide-hero">' +
      "<h3>🧭 歡迎來到 C · 教育培訓</h3>" +
      '<p class="muted">主日學老師多為兼職義工。請先花 60 秒認路，再點上方 <strong>①～④</strong> 開始實務；跨模組請用<strong>左側欄</strong>切換。</p>" +
      '<dl class="education-story-grid">' +
      "<dt>是什麼</dt><dd>主日學、聖經教材、學校學籍、門訓動力站、AI 備課的整合工作區</dd>" +
      "<dt>做什麼</dt><dd>① 班級名冊 · ② 點名預警（連動 B 區）· ③ 門訓銜接 · ④ 教師課程與 AI 草稿</dd>" +
      "<dt>三套資料邊界</dt><dd><code>educationSystemData</code>＝主日學 · <code>schoolMasterDatabase</code>＝全校學籍 · <code>pastoralDiscipleship</code>＝B 區寫入、C 唯讀</dd>" +
      "<dt>從哪進</dt><dd>總站 V5 → 教會事工 → C 區 → 左欄「主日學工作桌」</dd>" +
      "</dl>" +
      '<div class="edu-guide-actions">' +
      '<button type="button" class="edu-btn" id="edu-guide-go-roster">▶ 我準備好了 · 進入 ① 學籍</button>' +
      '<button type="button" class="edu-btn outline" id="edu-guide-go-att">② 直接點名</button>' +
      "</div></section>" +
      '<div class="edu-card"><h3>📋 五 Tab 速查</h3><ul class="edu-guide-list">' +
      "<li><strong>🧭 認路導覽</strong> — 本頁，新同工先看</li>" +
      "<li><strong>① 學籍·班級</strong> — 班級 CRUD、學員綁定 memberId</li>" +
      "<li><strong>② 出席·預警</strong> — 點名；連續 3 次缺席自動拋 B 區</li>" +
      "<li><strong>③ 門訓銜接</strong> — 唯讀 B 區修課動態</li>" +
      "<li><strong>④ 教師·課程</strong> — 教材模板、AI 備課草稿、年度目標</li>" +
      "</ul></div>" +
      '<div class="edu-card"><h3>🔗 跨模組（請用左側欄）</h3><p class="muted">以下模組會切換左欄側欄，看完可從左欄回「主日學工作桌」。</p><div id="edu-guide-cross-links"></div></div>" +
      '<div class="edu-card"><h3>🌾 與 B 區門訓</h3><p class="muted">B 區修課經 bridge 寫入 <code>pastoralDiscipleship</code>，Tab③ 唯讀展示；缺席預警任務類型 <code>education_absence</code>。</p></div>';
    root.innerHTML = html;
    renderCrossLinks("edu-guide-cross-links");
    var goR = $("edu-guide-go-roster");
    var goA = $("edu-guide-go-att");
    if (goR) goR.onclick = function () { switchTab("roster"); };
    if (goA) goA.onclick = function () { switchTab("attendance"); };
  }

  function renderCrossLinks(containerId) {
    var el = $(containerId);
    if (!el || !X) return;
    var links = X.getModuleLinks("../..");
    var html = '<div class="edu-links">';
    links.bibleStudy.items.forEach(function (it) {
      html +=
        '<a class="edu-link-chip" href="#" onclick="return EducationCrossModuleBridge&&EducationCrossModuleBridge.shellNavBible(event,\'' +
        esc(it.lang) +
        "');\" title=\"" +
        esc(it.lang) +
        '">📖 ' +
        esc(it.label) +
        "</a>";
    });
    html +=
      '<a class="edu-link-chip" href="#" onclick="return EducationUi.shellSchool(event)">🏫 ' +
      esc(links.school.label) +
      '</a><a class="edu-link-chip" href="#" onclick="return EducationCrossModuleBridge&&EducationCrossModuleBridge.shellNavDisciple(event);">🎯 門訓動力站</a><a class="edu-link-chip" href="#" onclick="return EducationCrossModuleBridge&&EducationCrossModuleBridge.shellNavAi(event);">🤖 AI 工具中心</a><a class="edu-link-chip" href="' +
      esc(links.pastoral.url) +
      '">🌾 B 門徒訓練</a><a class="edu-link-chip" href="' +
      esc(links.visitation.url) +
      '">💬 探訪關懷</a></div>';
    el.innerHTML = html;
  }

  function renderOverviewStrip() {
    var d = H.getRawData();
    var rate = H.getOverallAttendanceRate();
    var warnings = H.listAbsentWarnings();
    if (getPanelMode()) {
      notifyShellOverview();
      return;
    }
    if ($("edu-stat-classes")) $("edu-stat-classes").textContent = d.classes.length;
    if ($("edu-stat-students")) $("edu-stat-students").textContent = d.students.length;
    if ($("edu-stat-rate")) $("edu-stat-rate").textContent = rate != null ? rate + "%" : "—";
    if ($("edu-stat-warn")) {
      $("edu-stat-warn").textContent = warnings.length;
      if ($("edu-stat-warn").parentElement) {
        $("edu-stat-warn").parentElement.classList.toggle("warn", warnings.length > 0);
      }
    }

    var trend = H.getWeeklyAttendanceTrend(8);
    var ctx = $("edu-trend-chart");
    if (ctx && global.Chart) {
      if (charts.trend) charts.trend.destroy();
      if (trend.empty) {
        $("edu-trend-empty").style.display = "block";
        ctx.style.display = "none";
      } else {
        $("edu-trend-empty").style.display = "none";
        ctx.style.display = "block";
        charts.trend = new Chart(ctx, {
          type: "line",
          data: {
            labels: trend.labels,
            datasets: [{ label: "出席率 %", data: trend.data, borderColor: "#ea580c", fill: false, tension: 0.3 }]
          },
          options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100 } } }
        });
      }
    }

    var rd = $("edu-report-draft");
    if (rd && AI) {
      var latest = AI.getLatestReportDraft();
      rd.innerHTML = latest
        ? '<div class="edu-draft">' + esc(latest.body) + '<p class="muted">' + esc(latest.hint) + "</p></div>"
        : '<p class="muted">尚無報告草稿。按「AI 生成教育部報告」產生（基於真實統計）。</p>';
    }
  }

  function renderRosterPanel() {
    var d = H.getRawData();
    var list = $("edu-classes-list");
    if (!list) return;
    if (!d.classes.length) {
      list.innerHTML = '<div class="edu-empty"><div class="ico">📚</div>尚無班級，請按「新增班級」開始。</div>';
      return;
    }
    list.innerHTML = d.classes
      .map(function (cls) {
        var students = d.students.filter(function (s) { return Number(s.classId) === Number(cls.id); });
        var teacher = d.teachers.find(function (t) { return Number(t.classId) === Number(cls.id) || Number(t.id) === Number(cls.teacherId); });
        return (
          '<div class="edu-card"><h3>' +
          esc(cls.name) +
          ' <span class="tag">' +
          esc(cls.ageRange) +
          "</span></h3>" +
          '<p class="muted">教師：' +
          esc(teacher ? teacher.memberName : "待指派") +
          " · 學員：" +
          students.length +
          "/" +
          cls.capacity +
          " · " +
          esc(cls.schedule) +
          "</p>" +
          '<button type="button" class="edu-btn sm" data-act="view-class" data-id="' +
          cls.id +
          '">學員名冊</button> ' +
          '<button type="button" class="edu-btn sm secondary" data-act="edit-class" data-id="' +
          cls.id +
          '">編輯</button> ' +
          '<button type="button" class="edu-btn sm" style="background:#dc2626" data-act="del-class" data-id="' +
          cls.id +
          '">刪除</button></div>'
        );
      })
      .join("");
    list.querySelectorAll("[data-act]").forEach(function (btn) {
      btn.onclick = function () {
        var act = btn.getAttribute("data-act");
        var id = Number(btn.getAttribute("data-id"));
        if (act === "edit-class") showEditClassModal(id);
        if (act === "del-class" && confirm("確定刪除此班級？")) { H.deleteClass(id); renderAll(); toast("班級已刪除"); }
        if (act === "view-class") showClassRoster(id);
      };
    });
  }

  function showAddClassModal() {
    openModal(
      "新增班級",
      '<label>班級名稱</label><input class="edu-input" id="ed-cls-name" placeholder="例：兒童班">' +
        '<label>類型</label><select class="edu-select" id="ed-cls-cat"><option value="toddler">幼幼班</option><option value="children">兒童班</option><option value="youth">少年班</option><option value="adult">青少年班</option></select>' +
        '<label>容量</label><input class="edu-input" id="ed-cls-cap" type="number" value="25">' +
        '<label>教室</label><input class="edu-input" id="ed-cls-loc">' +
        '<label>時間</label><input class="edu-input" id="ed-cls-sch" placeholder="主日 9:00">' +
        '<button type="button" class="edu-btn" id="ed-cls-save">儲存</button>'
    );
    $("ed-cls-save").onclick = function () {
      var ages = { toddler: "3-5歲", children: "6-9歲", youth: "10-12歲", adult: "13-17歲" };
      var cat = $("ed-cls-cat").value;
      H.addClass({
        name: $("ed-cls-name").value.trim() || "新班級",
        category: cat,
        ageRange: ages[cat],
        capacity: Number($("ed-cls-cap").value) || 25,
        location: $("ed-cls-loc").value,
        schedule: $("ed-cls-sch").value
      });
      closeModal();
      renderAll();
      toast("班級已新增");
    };
  }

  function showEditClassModal(id) {
    var cls = H.getRawData().classes.find(function (c) { return Number(c.id) === Number(id); });
    if (!cls) return;
    openModal(
      "編輯班級",
      '<label>班級名稱</label><input class="edu-input" id="ed-cls-name" value="' +
        esc(cls.name) +
        '">' +
        '<label>容量</label><input class="edu-input" id="ed-cls-cap" type="number" value="' +
        cls.capacity +
        '">' +
        '<label>教室</label><input class="edu-input" id="ed-cls-loc" value="' +
        esc(cls.location || "") +
        '">' +
        '<label>時間</label><input class="edu-input" id="ed-cls-sch" value="' +
        esc(cls.schedule || "") +
        '">' +
        '<button type="button" class="edu-btn" id="ed-cls-save">儲存</button>'
    );
    $("ed-cls-save").onclick = function () {
      H.updateClass(id, {
        name: $("ed-cls-name").value.trim(),
        capacity: Number($("ed-cls-cap").value),
        location: $("ed-cls-loc").value,
        schedule: $("ed-cls-sch").value
      });
      closeModal();
      renderAll();
      toast("班級已更新");
    };
  }

  function showClassRoster(classId) {
    var d = H.getRawData();
    var students = d.students.filter(function (s) { return Number(s.classId) === Number(classId); });
    var rows = students
      .map(function (s) {
        return (
          "<tr><td>" +
          esc(s.name) +
          "</td><td>" +
          (s.memberId ? '<a href="' + esc(X.memberProfileUrl(s.memberId)) + '">M' + esc(s.memberId) + "</a>" : "—") +
          '</td><td><button type="button" class="edu-btn sm" data-mid="' +
          (s.memberId || s.parentMemberId || "") +
          '" data-act="disc">門訓</button></td></tr>'
        );
      })
      .join("");
    openModal(
      "學員名冊",
      '<table class="edu-table"><thead><tr><th>姓名</th><th>memberId</th><th></th></tr></thead><tbody>' +
        (rows || '<tr><td colspan="3">尚無學員</td></tr>') +
        "</tbody></table>" +
        '<hr><label>新增學員姓名</label><input class="edu-input" id="ed-stu-name"><button type="button" class="edu-btn sm" id="ed-stu-add">新增並比對會友</button>'
    );
    var addBtn = $("ed-stu-add");
    if (addBtn) {
      addBtn.onclick = function () {
        var name = $("ed-stu-name").value.trim();
        if (!name) return;
        var matches = H.matchMembersByName(name);
        var memberId = matches.length === 1 ? matches[0].memberId : null;
        if (matches.length > 1 && !confirm("偵測到多位會友，是否仍新增？建議手動綁定 memberId。")) return;
        if (matches.length === 1 && confirm("偵測到本會已有會友「" + matches[0].name + "」(M" + matches[0].memberId + ")，是否綁定學籍？")) {
          memberId = matches[0].memberId;
        }
        H.addStudent({ name: name, classId: classId, memberId: memberId, parentMemberId: memberId, age: 10 });
        closeModal();
        renderAll();
        toast(memberId ? "已綁定 memberId" : "學員已新增（未綁定）");
      };
    }
    doc.querySelectorAll("[data-act=disc]").forEach(function (b) {
      b.onclick = function () {
        var mid = b.getAttribute("data-mid");
        if (mid) selectedMemberId = mid;
        requestShellTab("discipleship", { memberId: mid || "" });
      };
    });
  }

  function renderAttendancePanel() {
    var d = H.getRawData();
    var sel = $("edu-att-class");
    if (sel) {
      sel.innerHTML =
        '<option value="">— 選擇班級 —</option>' +
        d.classes.map(function (c) {
          return '<option value="' + c.id + '">' + esc(c.name) + "</option>";
        }).join("");
    }
    var warnings = H.listAbsentWarnings();
    var warnEl = $("edu-att-warnings");
    if (warnEl) {
      warnEl.innerHTML = warnings.length
        ? warnings
            .map(function (w) {
              return (
                '<div class="edu-card alert"><strong>⚠️ ' +
                esc(w.name) +
                "</strong> · " +
                esc(w.className) +
                " · 連續 " +
                w.streak +
                ' 次缺席 <a href="' +
                esc(X.memberProfileUrl(w.memberId)) +
                '">會友檔案</a> · <a href="' +
                esc(X.getModuleLinks().visitation.url) +
                '">探訪</a></div>'
              );
            })
            .join("")
        : '<div class="edu-empty"><div class="ico">✅</div>目前無連續缺席預警</div>';
    }

    var metricsEl = $("edu-cross-metrics");
    if (metricsEl && selectedMemberId) {
      var m = X.getCrossModuleMetrics(selectedMemberId);
      metricsEl.innerHTML =
        '<div class="edu-metric-grid">' +
        ["truth", "fellowship", "ministry"]
          .map(function (k) {
            var item = m[k];
            return (
              '<div class="edu-metric"><div class="muted">' +
              esc(item.detail || k) +
              '</div><div class="val">' +
              (item.score != null ? item.score + (k === "truth" ? "%" : "") : "—") +
              "</div><div class="muted">" +
              esc(item.label) +
              "</div></div>"
            );
          })
          .join("") +
        "</div>";
    } else if (metricsEl) {
      metricsEl.innerHTML = '<p class="muted">在學員名冊點「門訓」或選擇學員後，可顯示跨模組三指標（非雷達圖）。</p>";
    }
  }

  function showRecordAttendanceModal() {
    var classId = Number($("edu-att-class").value);
    if (!classId) { toast("請先選擇班級", "error"); return; }
    var students = H.getRawData().students.filter(function (s) { return Number(s.classId) === Number(classId); });
    if (!students.length) { toast("此班尚無學員", "error"); return; }
    var date = H.todayISO();
    var rows = students
      .map(function (s) {
        return (
          '<label class="edu-check-row" style="display:block;margin:6px 0"><input type="checkbox" checked data-sid="' +
          s.id +
          '"> ' +
          esc(s.name) +
          ' <input class="edu-input" style="margin-top:4px" placeholder="牧養備註（選填）" data-note="' +
          s.id +
          '"></label>'
        );
      })
      .join("");
    openModal(
      "記錄出席 · " + date,
      rows + '<button type="button" class="edu-btn" id="ed-att-save">儲存點名</button>'
    );
    $("ed-att-save").onclick = function () {
      var records = students.map(function (s) {
        var cb = doc.querySelector('input[data-sid="' + s.id + '"]');
        var note = doc.querySelector('input[data-note="' + s.id + '"]');
        return { studentId: s.id, present: cb ? cb.checked : false, note: note ? note.value : "" };
      });
      var res = X.recordAttendanceWithCare(classId, date, records);
      closeModal();
      renderAll();
      toast("已儲存 " + (res.session && res.session.count) + " 筆；觸發 " + (res.triggered ? res.triggered.length : 0) + " 筆 B 區關懷");
    };
  }

  function renderDiscipleshipPanel() {
    var el = $("edu-disc-body");
    if (!el) return;
    var mid = selectedMemberId || (new URLSearchParams(global.location.search).get("memberId"));
    if (!mid) {
      el.innerHTML =
        '<div class="edu-empty"><div class="ico">🔗</div>請從「學籍·班級」學員名冊選擇學員，或帶 <code>?memberId=</code> 開啟。<br>此 Tab 唯讀顯示 B 區 <code>pastoralDiscipleship</code> 同步。</div>';
      return;
    }
    var rows = X.getMergedTrainingForMember(mid);
    if (!rows.length) {
      el.innerHTML =
        '<p class="muted">會員 M' +
        esc(mid) +
        ' 尚無門訓同步紀錄。</p><p><a class="edu-link-chip" href="../fellowship/pastoral-training.html?crm_from=c_education&memberId=' +
        encodeURIComponent(mid) +
        '">至 B 區登記修課</a></p>';
      return;
    }
    el.innerHTML =
      "<h3>💡 小組門訓同步資訊 · M" +
      esc(mid) +
      "</h3>" +
      rows
        .map(function (r) {
          return (
            '<div class="edu-card"><strong>' +
            esc(r.courseName || r.courseTitle) +
            "</strong><br><span class="muted">狀態：" +
            esc(r.grade || r.completedDate || r.statusLabel || "—") +
            " · 來源：" +
            esc(r.source || "—") +
            (r.link ? ' · <a href="' + esc(r.link) + '">開啟</a>' : "") +
            "</span></div>"
          );
        })
        .join("");
    renderCrossLinks("edu-disc-links");
  }

  function renderTeachingPanel() {
    var d = H.getRawData();
    var tbody = $("edu-teachers-tbody");
    if (tbody) {
      tbody.innerHTML = d.teachers
        .map(function (t) {
          var load = H.getTeacherLoad(t.id);
          var cls = d.classes.find(function (c) { return Number(c.id) === Number(t.classId); });
          var warn = load > H.TEACHER_OVERLOAD_CLASSES ? ' <span class="tag danger">師資過載</span>' : "";
          var cert = t.certified ? '<span class="tag">已認證</span>' : '<span class="tag warn">待認證</span>';
          return (
            "<tr><td>" +
            esc(t.memberName) +
            (t.memberId ? ' <a href="' + esc(X.memberProfileUrl(t.memberId)) + '">M' + t.memberId + "</a>" : "") +
            "</td><td>" +
            esc(cls ? cls.name : "未分配") +
            "</td><td>" +
            load +
            " 班" +
            warn +
            "</td><td>" +
            cert +
            '</td><td><button type="button" class="edu-btn sm" data-tid="' +
            t.id +
            '" data-act="assign">指派</button> <button type="button" class="edu-btn sm" data-tid="' +
            t.id +
            '" data-act="edit-t">編輯</button></td></tr>'
          );
        })
        .join("");
      tbody.querySelectorAll("[data-act]").forEach(function (b) {
        b.onclick = function () {
          var tid = Number(b.getAttribute("data-tid"));
          if (b.getAttribute("data-act") === "assign") showAssignTeacherModal(tid);
          if (b.getAttribute("data-act") === "edit-t") showEditTeacherModal(tid);
        };
      });
    }

    var cur = $("edu-curriculum-tbody");
    if (cur) {
      cur.innerHTML = d.curriculum
        .slice(0, 30)
        .map(function (c) {
          var cls = d.classes.find(function (x) { return Number(x.id) === Number(c.classId); });
          return (
            "<tr><td>" +
            esc(c.date) +
            "</td><td>" +
            esc(cls ? cls.name : "—") +
            "</td><td>" +
            esc(c.topic) +
            "</td><td>" +
            esc(c.scripture) +
            '</td><td><button type="button" class="edu-btn sm" data-cid="' +
            c.id +
            '" data-act="ai-lesson">AI 備課</button></td></tr>'
          );
        })
        .join("");
      cur.querySelectorAll('[data-act="ai-lesson"]').forEach(function (b) {
        b.onclick = function () {
          var lesson = d.curriculum.find(function (x) { return Number(x.id) === Number(b.getAttribute("data-cid")); });
          if (lesson) showAiLessonDraft(lesson);
        };
      });
    }

    renderGoalsSection();
    var ld = $("edu-lesson-draft");
    if (ld && AI) {
      var latest = AI.getLatestLessonDraft();
      ld.innerHTML = latest ? '<div class="edu-draft">' + esc(latest.summary) + "</div>" : '<p class="muted">選擇課程列「AI 備課」產生草稿（需人審）。</p>';
    }
  }

  function showAddTeacherModal() {
    var members = H.getMembers().slice(0, 30);
    var opts = members.map(function (m) {
      return '<option value="' + m.id + '">' + esc(m.name) + " (M" + m.id + ")</option>";
    }).join("");
    openModal(
      "新增教師",
      '<label>綁定會友 memberId</label><select class="edu-select" id="ed-t-mid"><option value="">—</option>' +
        opts +
        '</select><label>專長</label><input class="edu-input" id="ed-t-spec"><label><input type="checkbox" id="ed-t-cert"> 已通過師資培訓</label><br><button type="button" class="edu-btn" id="ed-t-save">儲存</button>'
    );
    $("ed-t-save").onclick = function () {
      var mid = $("ed-t-mid").value;
      H.addTeacher({
        memberId: mid ? Number(mid) : null,
        memberName: mid ? H.resolveMemberName(mid) : $("ed-t-spec").value || "教師",
        specialty: $("ed-t-spec").value,
        certified: $("ed-t-cert").checked
      });
      closeModal();
      renderAll();
      toast("教師已新增");
    };
  }

  function showEditTeacherModal(tid) {
    var t = H.getRawData().teachers.find(function (x) { return Number(x.id) === Number(tid); });
    if (!t) return;
    openModal(
      "編輯教師",
      '<label>專長</label><input class="edu-input" id="ed-t-spec" value="' +
        esc(t.specialty || "") +
        '"><label><input type="checkbox" id="ed-t-cert" ' +
        (t.certified ? "checked" : "") +
        '> 已認證</label><br><button type="button" class="edu-btn" id="ed-t-save">儲存</button> <button type="button" class="edu-btn sm" style="background:#dc2626" id="ed-t-del">刪除</button>'
    );
    $("ed-t-save").onclick = function () {
      H.updateTeacher(tid, { specialty: $("ed-t-spec").value, certified: $("ed-t-cert").checked });
      closeModal();
      renderAll();
      toast("已更新");
    };
    $("ed-t-del").onclick = function () {
      if (confirm("刪除此教師？")) { H.deleteTeacher(tid); closeModal(); renderAll(); }
    };
  }

  function showAssignTeacherModal(tid) {
    var classes = H.getRawData().classes;
    var opts = classes.map(function (c) {
      return '<option value="' + c.id + '">' + esc(c.name) + "</option>";
    }).join("");
    openModal(
      "分配班級",
      '<label>班級</label><select class="edu-select" id="ed-assign-cls">' + opts + '</select><button type="button" class="edu-btn" id="ed-assign-go">指派</button>'
    );
    $("ed-assign-go").onclick = function () {
      var load = H.getTeacherLoad(tid);
      if (load >= H.TEACHER_OVERLOAD_CLASSES && !confirm("此教師已負責 " + load + " 班，確定繼續指派？")) return;
      H.assignTeacherToClass(tid, Number($("ed-assign-cls").value));
      closeModal();
      renderAll();
      toast("已指派班級");
    };
  }

  function showAddCurriculumModal() {
    var d = H.getRawData();
    var clsOpts = d.classes.map(function (c) {
      return '<option value="' + c.id + '">' + esc(c.name) + "</option>";
    }).join("");
    openModal(
      "新增課程",
      '<label>班級</label><select class="edu-select" id="ed-cur-cls">' +
        clsOpts +
        '</select><label>日期</label><input class="edu-input" type="date" id="ed-cur-date" value="' +
        H.todayISO() +
        '"><label>主題</label><input class="edu-input" id="ed-cur-topic"><label>經文</label><input class="edu-input" id="ed-cur-scr"><button type="button" class="edu-btn" id="ed-cur-save">儲存</button>'
    );
    $("ed-cur-save").onclick = function () {
      H.addCurriculum({
        classId: Number($("ed-cur-cls").value),
        date: $("ed-cur-date").value,
        topic: $("ed-cur-topic").value,
        scripture: $("ed-cur-scr").value,
        materials: "自訂",
        status: "planned"
      });
      closeModal();
      renderAll();
      toast("課程已新增");
    };
  }

  function showTemplateModal() {
    var tplOpts = H.CURRICULUM_TEMPLATES.map(function (t) {
      return '<option value="' + t.id + '">' + esc(t.label) + " (" + t.weeks + " 週)</option>";
    }).join("");
    var clsOpts = H.getRawData().classes.map(function (c) {
      return '<option value="' + c.id + '">' + esc(c.name) + "</option>";
    }).join("");
    openModal(
      "套用教材模板",
      '<p class="muted">華人教會常用大綱，一鍵產生每週進度（非 AI 自動排課）。</p><label>模板</label><select class="edu-select" id="ed-tpl-id">' +
        tplOpts +
        '</select><label>班級</label><select class="edu-select" id="ed-tpl-cls">' +
        clsOpts +
        '</select><button type="button" class="edu-btn" id="ed-tpl-go">套用</button>'
    );
    $("ed-tpl-go").onclick = function () {
      var res = H.applyCurriculumTemplate($("ed-tpl-id").value, Number($("ed-tpl-cls").value), H.todayISO());
      closeModal();
      renderAll();
      toast(res.ok ? "已套用 " + res.added + " 週課程" : "套用失敗", res.ok ? "success" : "error");
    };
  }

  function showAiLessonDraft(lesson) {
    var d = AI.addLessonDraft({ topic: lesson.topic, scripture: lesson.scripture });
    openModal("AI 備課草稿（待審）", '<div class="edu-draft">' + esc(d.summary) + '</div><p class="muted">' + esc(d.hint) + ' <a href="../../../ai_tools/dashboard.html" target="_blank">AI 工具中心</a></p>');
    renderTeachingPanel();
  }

  function generateLeaderReport() {
    var d = H.getRawData();
    var draft = AI.addLeaderReportDraft({
      classCount: d.classes.length,
      studentCount: d.students.length,
      attendanceRate: H.getOverallAttendanceRate(),
      warningCount: H.listAbsentWarnings().length
    });
    renderOverviewStrip();
    toast("已生成報告草稿");
    openModal("教育部報告草稿", '<div class="edu-draft">' + esc(draft.body) + "</div>");
  }

  function renderGoalsSection() {
    loadAModule();
    var gEl = $("edu-goals-list");
    if (!gEl) return;
    var allGoals = (aModule.goals || []).concat(
      (H.getRawData().annualGoals || []).map(function (g) {
        return { id: g.id, title: g.title, period: g.period, targetValue: g.targetValue, currentValue: g.currentValue, targetUnit: g.targetUnit, _fromHub: true };
      })
    );
    gEl.innerHTML = allGoals.length
      ? allGoals
          .map(function (g) {
            var cur = Number(g.currentValue) || 0;
            var tgt = Number(g.targetValue) || 100;
            var pct = tgt ? Math.min(100, Math.round((cur / tgt) * 100)) : 0;
            return (
              '<div class="edu-card"><strong>' +
              esc(g.title) +
              "</strong><br><span class="muted">" +
              esc(g.period || "") +
              " · " +
              cur +
              "/" +
              tgt +
              " " +
              esc(g.targetUnit || "") +
              ' (' +
              pct +
              '%)</span></div>'
            );
          })
          .join("")
      : '<p class="muted">尚無年度目標。<button type="button" class="edu-btn sm" id="ed-goal-add">新增目標</button></p>';
    var addG = $("ed-goal-add");
    if (addG) addG.onclick = showAddGoalModal;
  }

  function showAddGoalModal() {
    openModal(
      "新增年度目標",
      '<label>目標</label><input class="edu-input" id="ed-goal-t"><label>期別</label><input class="edu-input" id="ed-goal-p" placeholder="2026 Q2"><label>目標值</label><input class="edu-input" id="ed-goal-v" type="number"><button type="button" class="edu-btn" id="ed-goal-save">儲存至 A 模組</button>'
    );
    $("ed-goal-save").onclick = function () {
      loadAModule();
      var id = (aModule.goals.length ? Math.max.apply(null, aModule.goals.map(function (g) { return g.id; })) : 0) + 1;
      aModule.goals.push({
        id: id,
        title: $("ed-goal-t").value.trim() || "目標",
        period: $("ed-goal-p").value,
        targetValue: Number($("ed-goal-v").value) || 100,
        targetUnit: "%",
        currentValue: 0
      });
      saveAModule();
      closeModal();
      renderTeachingPanel();
      toast("目標已寫入 church_ministry_a_education");
    };
  }

  function renderPanel(name) {
    if (name === "roster") renderRosterPanel();
    else if (name === "attendance") renderAttendancePanel();
    else if (name === "discipleship") renderDiscipleshipPanel();
    else if (name === "teaching") renderTeachingPanel();
  }

  function switchTab(name, params) {
    if (getPanelMode()) {
      requestShellTab(name, params);
      return;
    }
    activeTab = name;
    doc.querySelectorAll(".edu-tab").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-tab") === name);
    });
    doc.querySelectorAll(".edu-panel").forEach(function (p) {
      p.classList.toggle("active", p.id === "edu-panel-" + name);
    });
    var ov = $("edu-overview-strip");
    if (ov) ov.style.display = name === "guide" ? "none" : "";
    if (name === "guide") renderGuidePanel();
    if (name === "roster") renderRosterPanel();
    if (name === "attendance") renderAttendancePanel();
    if (name === "discipleship") renderDiscipleshipPanel();
    if (name === "teaching") renderTeachingPanel();
    try {
      if (global.history && global.history.replaceState) {
        var u = new URL(global.location.href);
        u.hash = "tab-" + name;
        global.history.replaceState(null, "", u.pathname + u.search + u.hash);
      } else if (global.location.hash) {
        global.location.hash = "tab-" + name;
      }
    } catch (eH) {
      global.location.hash = "tab-" + name;
    }
    if (name !== "guide") {
      try {
        global.localStorage.setItem("bible100_edu_seen_guide_v1", "1");
      } catch (eLs) {}
    }
  }

  function resolveInitialTab() {
    var hash = (global.location.hash || "").replace("#tab-", "");
    if (["guide", "roster", "attendance", "discipleship", "teaching"].indexOf(hash) >= 0) {
      return hash;
    }
    var crmFrom = "";
    try {
      crmFrom = new URLSearchParams(global.location.search || "").get("crm_from") || "";
    } catch (eP) {}
    if (crmFrom === "c_landing" || crmFrom === "hub") return "guide";
    try {
      if (!global.localStorage.getItem("bible100_edu_seen_guide_v1")) return "guide";
    } catch (eSeen) {}
    return "roster";
  }

  function renderAll() {
    var panel = getPanelMode();
    if (panel) {
      renderPanel(panel);
      notifyShellOverview();
      return;
    }
    renderOverviewStrip();
    switchTab(activeTab);
  }

  function bindPanelUi(panel) {
    $("edu-modal") &&
      $("edu-modal").addEventListener("click", function (e) {
        if (e.target.id === "edu-modal") closeModal();
      });
    if (panel === "roster") $("edu-btn-add-class") && ($("edu-btn-add-class").onclick = showAddClassModal);
    if (panel === "attendance") $("edu-btn-record-att") && ($("edu-btn-record-att").onclick = showRecordAttendanceModal);
    if (panel === "teaching") {
      $("edu-btn-add-teacher") && ($("edu-btn-add-teacher").onclick = showAddTeacherModal);
      $("edu-btn-add-curriculum") && ($("edu-btn-add-curriculum").onclick = showAddCurriculumModal);
      $("edu-btn-template") && ($("edu-btn-template").onclick = showTemplateModal);
    }
  }

  function bindUi() {
    doc.querySelectorAll(".edu-tab").forEach(function (b) {
      b.onclick = function () { switchTab(b.getAttribute("data-tab")); };
    });
    activeTab = resolveInitialTab();

    $("edu-btn-crm") &&
      ($("edu-btn-crm").onclick = function (ev) {
        if (global.bible100ShellNav) {
          return global.bible100ShellNav(ev, {
            sidebarUrl: "church_ministry/sidebar_crm_journey.html",
            contentUrl: "church_ministry/guide_crm_journey_hub.html?tab=journey&role=teacher"
          });
        }
        return false;
      });

    $("edu-btn-add-class") && ($("edu-btn-add-class").onclick = showAddClassModal);
    $("edu-btn-record-att") && ($("edu-btn-record-att").onclick = showRecordAttendanceModal);
    $("edu-btn-add-teacher") && ($("edu-btn-add-teacher").onclick = showAddTeacherModal);
    $("edu-btn-add-curriculum") && ($("edu-btn-add-curriculum").onclick = showAddCurriculumModal);
    $("edu-btn-template") && ($("edu-btn-template").onclick = showTemplateModal);
    $("edu-btn-ai-report") && ($("edu-btn-ai-report").onclick = generateLeaderReport);
    $("edu-btn-export") && ($("edu-btn-export").onclick = function () { H.downloadEducationBundle(); toast("已匯出 JSON"); });
    $("edu-btn-import") && ($("edu-btn-import").onclick = function () {
      var inp = doc.createElement("input");
      inp.type = "file";
      inp.accept = "application/json";
      inp.onchange = function () {
        var f = inp.files[0];
        if (!f) return;
        var r = new FileReader();
        r.onload = function () {
          try {
            var bundle = JSON.parse(r.result);
            H.importEducationBundle(bundle, { skipConfirm: false });
            renderAll();
            toast("匯入完成");
          } catch (e) { toast("匯入失敗", "error"); }
        };
        r.readAsText(f);
      };
      inp.click();
    });
    $("edu-btn-seed") && ($("edu-btn-seed").onclick = function () {
      if (confirm("載入示範資料？")) { H.ensureEducationSeed(); renderAll(); toast("示範資料已載入"); }
    });
    $("edu-modal") && $("edu-modal").addEventListener("click", function (e) {
      if (e.target.id === "edu-modal") closeModal();
    });
  }

  async function init() {
    H = global.EducationDataHub;
    X = global.EducationCrossModuleBridge;
    AI = global.EducationAiHelper;
    if (!H) {
      console.error("[education] EducationDataHub 未載入");
      return;
    }
    try {
      if (global.ChurchDataBridge && global.ChurchDataBridge.whenReady) {
        await global.ChurchDataBridge.whenReady({ timeoutMs: 8000 });
      }
    } catch (eW) {}
    H.migrateEducationStores();
    var panel = getPanelMode();
    if (panel) {
      try {
        var sp = new URLSearchParams(global.location.search || "");
        var mid = sp.get("memberId");
        if (mid) selectedMemberId = mid;
      } catch (eMid) {}
      try {
        var d0 = H.getRawData();
        if (!d0.classes || !d0.classes.length) {
          var seeded = global.localStorage.getItem("bible100_edu_demo_seeded") === "1";
          if (!seeded) {
            H.ensureEducationSeed();
            global.localStorage.setItem("bible100_edu_demo_seeded", "1");
          }
        }
      } catch (eSeed) {}
      bindPanelUi(panel);
      renderAll();
      return;
    }
    bindUi();
    renderAll();
  }

  global.EducationUi = {
    init: init,
    switchTab: switchTab,
    requestShellTab: requestShellTab,
    shellSchool: function (e) { return X ? X.shellNavSchool(e) : false; },
    renderAll: renderAll
  };

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
  else init();
})(window, document);
