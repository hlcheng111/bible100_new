/**
 * C 區主工作桌殼 · 頂部 5 Tab + 子 iframe（方案 B）
 */
(function (global, doc) {
  "use strict";

  var TAB_SRC = {
    guide: "guide_story.html",
    roster: "edu_roster.html",
    attendance: "edu_attendance.html",
    discipleship: "edu_discipleship.html",
    teaching: "edu_teaching.html"
  };

  var activeTab = "roster";

  function $(id) {
    return doc.getElementById(id);
  }

  function bust(url) {
    if (!url) return url;
    var h = url.indexOf("#");
    if (h >= 0) {
      var b = url.slice(0, h);
      return b + (b.indexOf("?") >= 0 ? "&" : "?") + "v=" + Date.now() + url.slice(h);
    }
    return url + (url.indexOf("?") >= 0 ? "&" : "?") + "v=" + Date.now();
  }

  function buildFrameSrc(tab, params) {
    params = params || {};
    var base = TAB_SRC[tab] || TAB_SRC.roster;
    var q = [];
    try {
      var sp = new URLSearchParams(global.location.search || "");
      var crm = sp.get("crm_from");
      var role = sp.get("role");
      if (crm) q.push("crm_from=" + encodeURIComponent(crm));
      if (role) q.push("role=" + encodeURIComponent(role));
    } catch (eQ) {}
    if (params.memberId) q.push("memberId=" + encodeURIComponent(params.memberId));
    return base + (q.length ? "?" + q.join("&") : "");
  }

  function setTabActive(tab) {
    doc.querySelectorAll(".edu-shell-tab").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tab);
    });
  }

  function updateHash(tab) {
    try {
      if (global.history && global.history.replaceState) {
        var u = new URL(global.location.href);
        u.hash = "tab-" + tab;
        global.history.replaceState(null, "", u.pathname + u.search + u.hash);
      } else {
        global.location.hash = "tab-" + tab;
      }
    } catch (eH) {
      global.location.hash = "tab-" + tab;
    }
  }

  function switchTab(tab, params) {
    if (!TAB_SRC[tab]) tab = "roster";
    activeTab = tab;
    var frame = $("edu-integrated-subframe");
    if (frame) frame.src = bust(buildFrameSrc(tab, params));
    setTabActive(tab);
    updateHash(tab);
    if (tab !== "guide") {
      try {
        global.localStorage.setItem("bible100_edu_seen_guide_v1", "1");
      } catch (eLs) {}
    }
    renderOverview();
  }

  function resolveInitialTab() {
    var hash = (global.location.hash || "").replace("#tab-", "");
    if (TAB_SRC[hash]) return hash;
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

  function renderOverview() {
    var H = global.EducationDataHub;
    if (!H) return;
    var d = H.getRawData();
    var rate = H.getOverallAttendanceRate();
    var warnings = H.listAbsentWarnings();
    if ($("edu-stat-classes")) $("edu-stat-classes").textContent = d.classes.length;
    if ($("edu-stat-students")) $("edu-stat-students").textContent = d.students.length;
    if ($("edu-stat-rate")) $("edu-stat-rate").textContent = rate != null ? rate + "%" : "—";
    if ($("edu-stat-warn")) {
      $("edu-stat-warn").textContent = warnings.length;
      if ($("edu-stat-warn").parentElement) {
        $("edu-stat-warn").parentElement.classList.toggle("warn", warnings.length > 0);
      }
    }
  }

  function bindToolbar() {
    var H = global.EducationDataHub;
    var AI = global.EducationAiHelper;
    $("edu-btn-seed") &&
      ($("edu-btn-seed").onclick = function () {
        if (confirm("載入示範資料？") && H) {
          H.ensureEducationSeed();
          renderOverview();
          switchTab(activeTab);
          alert("示範資料已載入");
        }
      });
    $("edu-btn-export") &&
      ($("edu-btn-export").onclick = function () {
        if (H) H.downloadEducationBundle();
      });
    $("edu-btn-roster-csv") &&
      ($("edu-btn-roster-csv").onclick = function () {
        if (H) H.downloadRosterCsv();
      });
    $("edu-btn-att-csv") &&
      ($("edu-btn-att-csv").onclick = function () {
        if (H) H.downloadAttendanceCsv();
      });
    $("edu-btn-warn-csv") &&
      ($("edu-btn-warn-csv").onclick = function () {
        if (H) H.downloadAbsentWarningsCsv();
      });
    $("edu-btn-roster-print") &&
      ($("edu-btn-roster-print").onclick = function () {
        if (H) H.printRosterBrief();
      });
    $("edu-btn-import") &&
      ($("edu-btn-import").onclick = function () {
        if (!H) return;
        var inp = doc.createElement("input");
        inp.type = "file";
        inp.accept = "application/json";
        inp.onchange = function () {
          var f = inp.files[0];
          if (!f) return;
          var r = new FileReader();
          r.onload = function () {
            try {
              H.importEducationBundle(JSON.parse(r.result), { skipConfirm: false });
              renderOverview();
              switchTab(activeTab);
            } catch (e) {
              alert("匯入失敗");
            }
          };
          r.readAsText(f);
        };
        inp.click();
      });
    $("edu-btn-ai-report") &&
      ($("edu-btn-ai-report").onclick = function () {
        if (!H || !AI) return;
        var d = H.getRawData();
        AI.addLeaderReportDraft({
          classCount: d.classes.length,
          studentCount: d.students.length,
          attendanceRate: H.getOverallAttendanceRate(),
          warningCount: H.listAbsentWarnings().length
        });
        renderOverview();
        alert("已生成教育部報告草稿（請人審後使用）");
      });
    $("edu-btn-crm") &&
      ($("edu-btn-crm").onclick = function (ev) {
        if (global.bible100ShellNav) {
          return global.bible100ShellNav(ev, {
            sidebarUrl: "church_ministry/sidebar_church_layout_v1.html?focus=c",
            contentUrl: "church_ministry/modules/development/discipleship-training.html"
          });
        }
        return false;
      });
    doc.querySelectorAll(".edu-shell-tab").forEach(function (btn) {
      btn.onclick = function () {
        switchTab(btn.getAttribute("data-tab"));
      };
    });
  }

  function renderSchoolBridge() {
    var B = global.CmSchoolBridge;
    var el = $("edu-bridge-summary");
    if (!B || !el) return;
    var s = B.getRosterAlignmentSummary();
    el.textContent =
      "主日學 " + s.eduLinked + "/" + s.eduTotal + " 已連 memberId · 學校 " + s.schoolLinked + "/" + s.schoolTotal +
      " · 交集 " + s.overlapMemberIds + " · 缺席預警 " + s.absentWarnings;
    $("edu-btn-school-dash") &&
      ($("edu-btn-school-dash").onclick = function (ev) {
        B.shellNavSchoolDashboard(ev);
      });
    $("edu-btn-visitation-queue") &&
      ($("edu-btn-visitation-queue").onclick = function (ev) {
        if (global.bible100ShellNav) {
          return global.bible100ShellNav(ev, {
            sidebarUrl: "church_ministry/sidebar_church_layout_v1.html?focus=b",
            contentUrl: "church_ministry/modules/support/visitation_index.html?crm_from=c_education_absence"
          });
        }
        global.location.href = "../support/visitation_index.html?crm_from=c_education_absence";
      });
    $("edu-btn-dd-library") &&
      ($("edu-btn-dd-library").onclick = function (ev) {
        if (global.bible100ShellNav) {
          return global.bible100ShellNav(ev, {
            sidebarUrl: "disciple_dynamics/sidebar.html",
            contentUrl: "disciple_dynamics/dashboard.html?crm_from=cm_c_readonly"
          });
        }
        global.location.href = "../../../disciple_dynamics/dashboard.html?crm_from=cm_c_readonly";
      });
  }

  function syncSidebarFocusC() {
    try {
      var p = global.parent;
      if (!p || p === global) return;
      var sb = p.document.getElementById("sidebarFrame");
      if (sb && sb.src && String(sb.src).indexOf("focus=c") >= 0) return;
      var sidebarUrl = "church_ministry/sidebar_church_layout_v1.html?focus=c";
      if (global.CmShellPaths && global.CmShellPaths.isCmIndexShell && global.CmShellPaths.isCmIndexShell(p)) {
        sidebarUrl = "sidebar_church_layout_v1.html?focus=c";
      }
      if (typeof p.bible100ShellNav === "function") {
        p.bible100ShellNav(null, { sidebarUrl: sidebarUrl });
        return;
      }
      p.postMessage({ type: "bible100-shell", sidebarUrl: sidebarUrl }, "*");
    } catch (eS) {}
  }

  async function init() {
    syncSidebarFocusC();
    var H = global.EducationDataHub;
    if (H) {
      try {
        if (global.ChurchDataBridge && global.ChurchDataBridge.whenReady) {
          await global.ChurchDataBridge.whenReady({ timeoutMs: 8000 });
        }
      } catch (eW) {}
      H.migrateEducationStores();
    }
    bindToolbar();
    switchTab(resolveInitialTab());
    renderSchoolBridge();
  }

  global.EducationIntegratedShell = { switchTab: switchTab, renderOverview: renderOverview, renderSchoolBridge: renderSchoolBridge };

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
  else init();
})(window, document);
