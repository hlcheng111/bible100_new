/**
 * W3 · 敬拜主桌 / 子頁樞紐面板 UI
 */
(function (win, doc) {
  "use strict";

  function cmPrefix() {
    var path = (win.location.pathname || "").replace(/\\/g, "/");
    var i = path.toLowerCase().indexOf("/church_ministry/");
    var rel = i >= 0 ? path.slice(i + "/church_ministry/".length) : path.replace(/^\//, "");
    var depth = (rel.match(/\//g) || []).length;
    return depth ? new Array(depth + 1).join("../") : "";
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;");
  }

  function renderMain(hostId) {
    var H = win.WorshipDataHub;
    if (!H) return;
    var host = doc.getElementById(hostId || "w3-hub-panel");
    if (!host) return;
    if (win.AeWorshipRoleViews && win.AeWorshipRoleViews.getRole() === "volunteer") {
      host.innerHTML = "";
      return;
    }
    var snap = H.collectSnapshot();
    var val = H.validateIntegrity();
    var cm = cmPrefix();
    var burnout = H.scanBurnoutSignals ? H.scanBurnoutSignals() : [];
    host.innerHTML =
      '<div class="w3-hub-panel">' +
      '<p class="section-lead"><strong>事工總覽</strong> · 敬拜團、詩班、CRM 草稿與出席一覽</p>' +
      '<div class="w3-hub-grid">' +
      '<div class="w3-hub-stat"><strong>' + snap.worshipTeam.members + '</strong>敬拜團成員</div>' +
      '<div class="w3-hub-stat"><strong>' + snap.choir.members + '</strong>詩班團員</div>' +
      '<div class="w3-hub-stat"><strong>' + snap.crm.intents + '</strong>CRM 意向草稿</div>' +
      '<div class="w3-hub-stat"><strong>' + snap.ai.rehearsalDrafts + '</strong>排練 AI 草稿</div>' +
      '<div class="w3-hub-stat"><strong>' + snap.attendance.absentToday + '</strong>今日缺席</div>' +
      '<div class="w3-hub-stat"><strong>' + snap.crm.visitationDrafts + '</strong>探訪草稿</div>' +
      "</div>" +
      (snap.flow.nextPractice
        ? '<p class="section-lead">下次排練：' + esc(snap.flow.nextPractice.date) + " " + esc(snap.flow.nextPractice.place || "") + "</p>"
        : "") +
      (burnout.length
        ? '<p class="w3-hub-warn">⚠️ ' + burnout.length + " 位同工缺席預警 · <a href=\"" + H.visitationHubUrl(cm) + '">探訪工作桌</a></p>'
        : "") +
      (val.issues.length
        ? '<p class="w3-hub-warn">⚠️ 會友對齊：' + val.issues.slice(0, 2).join("；") + (val.issues.length > 2 ? "…" : "") + "</p>"
        : '<p class="section-lead" style="color:#059669;">✅ 會友主檔對齊正常</p>') +
      '<div class="w3-hub-actions">' +
      '<button type="button" class="fbtn" id="w3BtnSync">↻ 同步敬拜團排班→主桌</button>' +
      '<button type="button" class="fbtn" id="w3BtnValidate">🔍 重新檢查</button>' +
      '<a class="fbtn" style="text-decoration:none;" href="' + H.visitationHubUrl(cm) + '">💬 探訪工作桌</a>' +
      '<a class="fbtn" style="text-decoration:none;" href="' + H.financeHubUrl(cm) + '">💰 財務預填</a>' +
      "</div></div>";

    var sync = doc.getElementById("w3BtnSync");
    var valBtn = doc.getElementById("w3BtnValidate");
    if (sync) {
      sync.addEventListener("click", function () {
        var n = H.pullTeamSchedulesToHub();
        alert("已同步 " + n + " 場主日場次到主桌數據（含敬拜團排班來源標記）");
        renderMain(hostId);
      });
    }
    if (valBtn) valBtn.addEventListener("click", function () { renderMain(hostId); });
  }

  function renderStrip(hostId) {
    var H = win.WorshipDataHub;
    if (!H) return;
    var host = doc.getElementById(hostId || "ae-worship-hub-strip");
    if (!host) return;
    var snap = H.collectSnapshot();
    var cm = cmPrefix();
    host.innerHTML =
      '<p class="section-lead"><strong>W3 樞紐</strong> · 意向 ' + snap.crm.intents +
      " · AI草稿 " + snap.ai.rehearsalDrafts +
      ' · <a href="' + cm + "modules/worship/worship-integrated.html#w3-hub-panel" + '">回主桌</a></p>';
  }

  function boot() {
    renderMain("w3-hub-panel");
    renderStrip("ae-worship-hub-strip");
  }

  win.AeWorshipHubPanel = { renderMain: renderMain, renderStrip: renderStrip };

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window, document);
