/**
 * W6 · 敬拜缺席草稿 ↔ 探访工作桌闭环
 */
(function (win, doc) {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function readDrafts() {
    if (win.WorshipDataHub) return win.WorshipDataHub.readVisitationDrafts();
    try {
      return JSON.parse(localStorage.getItem("worship_visitation_drafts_v1") || "[]");
    } catch (e) {
      return [];
    }
  }

  function writeDrafts(list) {
    localStorage.setItem("worship_visitation_drafts_v1", JSON.stringify(list));
  }

  function updateDraft(id, patch) {
    var list = readDrafts();
    var hit = list.filter(function (d) {
      return String(d.id) === String(id);
    })[0];
    if (!hit) return null;
    Object.keys(patch).forEach(function (k) {
      hit[k] = patch[k];
    });
    hit.updatedAt = new Date().toISOString();
    writeDrafts(list);
    return hit;
  }

  function promoteToMission(draft) {
    var bridge = win.ChurchDataBridge;
    if (!bridge || typeof bridge.saveVisitationMission !== "function") {
      return { ok: false, error: "ChurchDataBridge 不可用" };
    }
    var mission = {
      id: "worship_" + (draft.id || Date.now()),
      targetMemberId: draft.memberId,
      target: draft.memberName,
      date: draft.serviceDate || new Date().toISOString().slice(0, 10),
      status: "planned",
      type: "流失預警",
      name: (draft.reason || "敬拜关怀") + " · " + draft.memberName,
      team: "",
      notes: draft.note || "来自敬拜缺席草稿（worship_visitation_drafts_v1）",
      priority: "高",
      origin: "worship_absence",
      worshipDraftId: draft.id,
      createdAt: new Date().toISOString()
    };
    bridge.saveVisitationMission(mission);
    return { ok: true, mission: mission };
  }

  function renderPanel(hostId) {
    var host = doc.getElementById(hostId || "worship-visitation-drafts");
    if (!host) return;
    var drafts = readDrafts().filter(function (d) {
      return d.status !== "done";
    });
    if (!drafts.length) {
      host.innerHTML =
        '<p class="hint">暂无敬拜来源的探访草稿。可在 <a href="../worship/attendance-management.html">崇拜出席</a> 记录缺席后自动生成。</p>';
      return;
    }
    host.innerHTML =
      '<table class="worship-draft-table"><thead><tr><th>对象</th><th>原因</th><th>崇拜日</th><th>状态</th><th>操作</th></tr></thead><tbody>' +
      drafts
        .map(function (d) {
          var st = d.status === "planned" ? "已排程" : "待安排";
          return (
            "<tr data-draft-id=\"" +
            esc(d.id) +
            "\"><td>" +
            esc(d.memberName) +
            "</td><td>" +
            esc(d.reason) +
            "</td><td>" +
            esc(d.serviceDate || "—") +
            "</td><td>" +
            st +
            '</td><td class="worship-draft-actions">' +
            '<button type="button" class="btn-primary btn-sm-w" data-act="accept">接案</button> ' +
            '<button type="button" class="btn-ghost btn-sm-w" data-act="form">填记录</button> ' +
            '<button type="button" class="btn-ghost btn-sm-w" data-act="done">完成</button>' +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table>";
    host.querySelectorAll("[data-act]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var tr = btn.closest("tr");
        var id = tr && tr.getAttribute("data-draft-id");
        var draft = readDrafts().filter(function (x) {
          return String(x.id) === String(id);
        })[0];
        if (!draft) return;
        var act = btn.getAttribute("data-act");
        if (act === "accept") {
          promoteToMission(draft);
          updateDraft(id, { status: "planned" });
          renderPanel(hostId);
          return;
        }
        if (act === "form") {
          promoteToMission(draft);
          updateDraft(id, { status: "planned" });
          prefillVisitForm(draft);
          var tabForm = doc.querySelector('.tab-btn[data-tab="form"]');
          if (tabForm) tabForm.click();
          return;
        }
        if (act === "done") {
          updateDraft(id, { status: "done" });
          renderPanel(hostId);
        }
      });
    });
  }

  function prefillVisitForm(draft) {
    var person = doc.getElementById("visitPerson");
    var type = doc.getElementById("visitType");
    var summary = doc.getElementById("visitSummary");
    var date = doc.getElementById("visitDate");
    if (person) person.value = draft.memberName || "";
    if (type) {
      var opts = type.options;
      var i;
      for (i = 0; i < opts.length; i++) {
        if (opts[i].value.indexOf("流失") >= 0) {
          type.selectedIndex = i;
          break;
        }
      }
    }
    if (summary) {
      summary.value =
        (draft.reason || "敬拜缺席关怀") +
        (draft.serviceDate ? "（崇拜日 " + draft.serviceDate + "）" : "") +
        (draft.note ? "\n" + draft.note : "");
    }
    if (date && draft.serviceDate) date.value = draft.serviceDate;
  }

  function bootFromQuery() {
    var params = new URLSearchParams(win.location.search || "");
    var member = params.get("draft_member");
    if (!member) return;
    var draft = readDrafts().filter(function (d) {
      return d.memberName === member && d.status !== "done";
    })[0];
    if (draft) {
      var tabList = doc.querySelector('.tab-btn[data-tab="list"]');
      if (tabList) tabList.click();
      setTimeout(function () {
        prefillVisitForm(draft);
      }, 200);
    }
  }

  win.AeWorshipVisitationBridge = {
    renderPanel: renderPanel,
    prefillVisitForm: prefillVisitForm,
    promoteToMission: promoteToMission,
    updateDraft: updateDraft
  };

  function boot() {
    renderPanel("worship-visitation-drafts");
    bootFromQuery();
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window, document);
