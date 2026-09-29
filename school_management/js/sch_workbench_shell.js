/**
 * School · 4 Tab 整合壳
 */
(function (g, doc) {
  "use strict";

  var TAB_SRC = {
    today: "attendance/index.html?crm_from=sch_wb",
    enroll: "students/index.html?crm_from=sch_wb&mode=admit",
    finance: "finance/tuition.html?crm_from=sch_wb",
    admin: "system/database.html?crm_from=sch_wb",
  };

  function $(id) {
    return doc.getElementById(id);
  }

  function toast(msg) {
    var el = $("sch-wb-toast");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    setTimeout(function () {
      el.hidden = true;
    }, 2800);
  }

  function refreshStats() {
    var el = $("sch-wb-stats");
    if (!el || !g.schoolDB) return;
    var st = g.schoolDB.getMemberLinkStats ? g.schoolDB.getMemberLinkStats() : {};
    var students = (g.schoolDB.data.students || []).length;
    var pending = st.students_pending || 0;
    var fin = g.schoolDB.getFinanceExportStats ? g.schoolDB.getFinanceExportStats() : {};
    el.textContent =
      "学生 " +
      students +
      " · 待取录 " +
      pending +
      " · 待导出学费 " +
      (fin.ready_to_export || 0);
  }

  function switchTab(tab) {
    doc.querySelectorAll(".sch-shell-tab").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-tab") === tab);
    });
    var panel = $("sch-panel-today");
    var frame = $("sch-integrated-subframe");
    if (tab === "today") {
      if (panel) panel.hidden = false;
      if (frame) {
        frame.hidden = false;
        var src = TAB_SRC.today;
        frame.src = src + (src.indexOf("?") >= 0 ? "&" : "?") + "v=" + Date.now();
      }
    } else {
      if (panel) panel.hidden = true;
      if (frame) {
        frame.hidden = false;
        var src2 = TAB_SRC[tab];
        if (src2) frame.src = src2 + (src2.indexOf("?") >= 0 ? "&" : "?") + "v=" + Date.now();
      }
    }
    try {
      var u = new URL(g.location.href);
      u.hash = "tab-" + tab;
      if (g.history.replaceState) g.history.replaceState(null, "", u.pathname + u.search + u.hash);
    } catch (eH) {
      g.location.hash = "tab-" + tab;
    }
    refreshStats();
  }

  function resolveTab() {
    var h = (g.location.hash || "").replace("#tab-", "");
    if (TAB_SRC[h]) return h;
    return "today";
  }

  doc.querySelectorAll(".sch-shell-tab").forEach(function (btn) {
    btn.onclick = function () {
      switchTab(btn.getAttribute("data-tab"));
    };
  });

  var btnBackup = $("sch-btn-backup");
  if (btnBackup) {
    btnBackup.onclick = function () {
      if (!g.SchSyncBridge) return alert("SchSyncBridge 未载入");
      g.SchSyncBridge.quickBackupDownload();
      toast("已下载 schoolMasterDatabase 备份");
    };
  }

  var btnSeed = $("sch-btn-seed");
  if (btnSeed) {
    btnSeed.onclick = function () {
      if (!g.schoolDB || !g.schoolDB.ensureSeedStudents) return;
      if (!confirm("载入约 30 人试用班（示范种子）？真实资料请先备份。")) return;
      g.schoolDB.ensureSeedStudents(30, true);
      refreshStats();
      toast("已载入试用班示范");
      switchTab("today");
    };
  }

  g.SchWorkbenchShell = { switchTab: switchTab, toast: toast, refreshStats: refreshStats };

  switchTab(resolveTab());
  refreshStats();
})(window, document);
