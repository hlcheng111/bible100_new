/**
 * CM · 探訪佇列 UI（handoverTasks 來源標籤 A/B/C/D）
 */
(function (global) {
  "use strict";

  function sourceBadge(source) {
    source = String(source || "").toLowerCase();
    var label = "CRM";
    var cls = "cm-source-badge";
    if (source.indexOf("education") >= 0 || source.indexOf("c_") === 0) {
      label = "C 主日學";
      cls += " src-c";
    } else if (source.indexOf("pastoral") >= 0 || source.indexOf("b_") === 0) {
      label = "B 牧養";
      cls += " src-b";
    } else if (source.indexOf("worship") >= 0 || source.indexOf("a_") === 0) {
      label = "A 敬拜";
      cls += " src-a";
    } else if (source.indexOf("outreach") >= 0 || source.indexOf("d_") === 0) {
      label = "D 外展";
      cls += " src-d";
    }
    return { label: label, cls: cls };
  }

  function renderHandoverList(listId, emptyId, opts) {
    opts = opts || {};
    var listEl = global.document.getElementById(listId);
    var emptyEl = emptyId ? global.document.getElementById(emptyId) : null;
    if (!listEl) return;
    var H = global.PastoralDataHub;
    if (!H || !H.getOrgStore) {
      listEl.innerHTML = "<p class='muted'>PastoralDataHub 未載入</p>";
      return;
    }
    if (H.evaluateLifecycleRules) H.evaluateLifecycleRules();
    var tasks = (H.getOrgStore().handoverTasks || []).filter(function (t) {
      return t.status === "pending";
    });
    if (opts.zone === "b") {
      tasks = tasks.filter(function (t) {
        var s = String(t.source || "").toLowerCase();
        return s.indexOf("pastoral") >= 0 || s.indexOf("b_") >= 0 || t.type === "absence_followup";
      });
    }
    listEl.innerHTML = "";
    if (!tasks.length) {
      if (emptyEl) emptyEl.hidden = false;
      return;
    }
    if (emptyEl) emptyEl.hidden = true;
    tasks.slice(0, 50).forEach(function (t) {
      var badge = sourceBadge(t.source || t.type || "");
      var row = global.document.createElement("div");
      row.className = "sg-list-item";
      row.style.marginBottom = "8px";
      row.innerHTML =
        '<span class="' +
        badge.cls +
        '">' +
        badge.label +
        "</span> " +
        "<strong>" +
        (t.memberName || t.memberId || "—") +
        "</strong><br><span class='muted'>" +
        (t.reason || "") +
        "</span>";
      listEl.appendChild(row);
    });
  }

  function injectVisitationBanner() {
    var host = global.document.getElementById("cm-visitation-handover-host");
    if (!host) return;
    renderHandoverList("cm-visitation-handover-list", "cm-visitation-handover-empty");
  }

  global.CmVisitationQueueUi = {
    sourceBadge: sourceBadge,
    renderHandoverList: renderHandoverList,
    injectVisitationBanner: injectVisitationBanner
  };
})(typeof window !== "undefined" ? window : this);
