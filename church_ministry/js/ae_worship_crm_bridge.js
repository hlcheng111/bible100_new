/**
 * W2 · 敬拜 A 区 CRM 实链（注册 / 交费 / 媒合）
 */
(function (win, doc) {
  "use strict";

  var INTENT_KEY = "worship_crm_intents_v1";

  function cmPrefix() {
    var path = (win.location.pathname || "").replace(/\\/g, "/");
    var i = path.toLowerCase().indexOf("/church_ministry/");
    var rel = i >= 0 ? path.slice(i + "/church_ministry/".length) : path.replace(/^\//, "");
    var depth = (rel.match(/\//g) || []).length;
    return depth ? new Array(depth + 1).join("../") : "";
  }

  function hub(path, role, tab) {
    var cm = cmPrefix();
    var q = "tab=" + encodeURIComponent(tab || "journey") +
      "&role=" + encodeURIComponent(role || "staff") +
      "&crm_from=worship&ae_zone=a";
    return cm + "guide_crm_journey_hub.html?" + q + (path ? "&worship_ref=" + encodeURIComponent(path) : "");
  }

  function links(pageId) {
    var cm = cmPrefix();
    return {
      registerMember: cm + "load_central_member_seed.html?crm_from=worship&intent=register",
      crmJourney: hub(pageId, "member", "journey"),
      matchmaker: hub(pageId, "staff", "matchmaker"),
      finance: cm + "modules/finance/finance-integrated.html?crm_from=worship&role=leader&step=1&intent=activity_fee",
      memberDesk: cm + "modules/members/member-integrated.html?crm_from=worship&role=leader&step=1",
      aiConsole: cm + "../ai_tools/pages/crm_automation_console.html?crm_from=worship&context=rehearsal"
    };
  }

  function pushIntent(type, label, meta) {
    var list = [];
    try {
      list = JSON.parse(localStorage.getItem(INTENT_KEY) || "[]");
      if (!Array.isArray(list)) list = [];
    } catch (e) { list = []; }
    list.unshift({
      id: Date.now(),
      type: type,
      label: label,
      page: pageId(),
      meta: meta || {},
      at: new Date().toISOString(),
      status: "draft"
    });
    list = list.slice(0, 40);
    localStorage.setItem(INTENT_KEY, JSON.stringify(list));
    return list[0];
  }

  function pageId() {
    var p = (win.location.pathname || "").replace(/\\/g, "/");
    return (p.split("/").pop() || "").replace(/\.html$/i, "");
  }

  function renderBridgeExtras(hostId) {
    var host = doc.getElementById(hostId || "ae-worship-bridge-extras");
    if (!host) return;
    var pid = pageId();
    var L = links(pid);
    host.innerHTML =
      '<div class="ae-crm-actions">' +
      '<p class="section-lead"><strong>W2 CRM 实链</strong>（点击写入意向草稿 <code>' + INTENT_KEY + '</code>，不自动扣款／派工）</p>' +
      '<div class="ae-crm-btn-row">' +
      '<a class="ae-crm-btn" href="' + L.registerMember + '" data-intent="register">📥 新员注册／载入会友</a>' +
      '<a class="ae-crm-btn" href="' + L.crmJourney + '" data-intent="journey">🙋 事奉旅程报名</a>' +
      '<a class="ae-crm-btn" href="' + L.matchmaker + '" data-intent="matchmaker">💼 人才媒合中心</a>' +
      '<a class="ae-crm-btn" href="' + L.finance + '" data-intent="fee">💰 活动交费（财务桌）</a>' +
      '<a class="ae-crm-btn" href="' + L.aiConsole + '" data-intent="ai">🤖 AI 口述预填</a>' +
      "</div>" +
      '<div id="aeCrmIntentStatus" class="section-lead" style="margin-top:6px;"></div>' +
      "</div>";

    host.querySelectorAll(".ae-crm-btn[data-intent]").forEach(function (a) {
      a.addEventListener("click", function () {
        var t = a.getAttribute("data-intent");
        var labels = {
          register: "敬拜新员注册",
          journey: "敬拜事奉旅程",
          matchmaker: "敬拜人才媒合",
          fee: "敬拜活动交费",
          ai: "敬拜 AI 预填"
        };
        pushIntent(t, labels[t] || t, { href: a.getAttribute("href"), page: pid });
        if (t === "fee" && win.WorshipDataHub) {
          win.WorshipDataHub.financePrefillFromIntent({ type: t, label: labels[t], page: pid });
        }
        var st = doc.getElementById("aeCrmIntentStatus");
        if (st) st.textContent = "已记录意向草稿：" + (labels[t] || t) + " · " + new Date().toLocaleString();
      });
    });
  }

  win.AeWorshipCrmBridge = {
    INTENT_KEY: INTENT_KEY,
    links: links,
    pushIntent: pushIntent,
    renderBridgeExtras: renderBridgeExtras
  };

  function boot() {
    renderBridgeExtras("ae-worship-bridge-extras");
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window, document);
