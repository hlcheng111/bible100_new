/**
 * AI Lab ↔ 教會事工 · 草稿雙向橋（W4 · HITL 不自动写入业务表）
 */
(function (g) {
  "use strict";

  var KEY = "bible100_ai_ministry_bridge";

  var TARGETS = {
    education_quiz: {
      label: "主日學工作桌 · 備課 Tab",
      contentUrl:
        "church_ministry/modules/education/education-integrated.html?crm_from=ai_bridge#tab-teaching",
      sidebarUrl: "church_ministry/sidebar_church_layout_v1.html?focus=c",
      field: "ai_draft_lesson",
    },
    pastoral_care: {
      label: "牧養工作桌 · 關懷/預警",
      contentUrl:
        "church_ministry/modules/fellowship/pastoral-integrated.html?crm_from=ai_bridge&role=leader#tab-alerts",
      sidebarUrl: "church_ministry/sidebar_church_layout_v1.html?focus=b",
      field: "ai_draft_care",
    },
    visitation: {
      label: "探訪工作桌 0-02",
      contentUrl: "church_ministry/modules/support/visitation_index.html?crm_from=ai_bridge",
      sidebarUrl: "church_ministry/sidebar_church_layout_v1.html?focus=b",
      field: "ai_draft_visitation",
    },
    outreach: {
      label: "外展工作桌",
      contentUrl:
        "church_ministry/modules/expansion/outreach-integrated.html?crm_from=ai_bridge#tab-needs",
      sidebarUrl: "church_ministry/sidebar_church_layout_v1.html?focus=d",
      field: "ai_draft_outreach",
    },
    crm_note: {
      label: "CRM 口述预填",
      contentUrl: "ai_tools/pages/crm_automation_console.html?crm_from=ai_bridge",
      sidebarUrl: "ai_tools/sidebar_lab.html?focus=ministry",
      field: "crmIntentText",
    },
    volunteer_shift: {
      label: "义工排班",
      contentUrl: "church_ministry/tools/volunteer_shift/index.html?crm_from=ai_bridge",
      sidebarUrl: "church_ministry/sidebar_church_layout_v1.html?focus=e",
      field: "ai_draft_shift",
    },
  };

  function saveDraft(payload) {
    payload = payload || {};
    var rec = {
      target: payload.target,
      text: String(payload.text || ""),
      title: String(payload.title || "AI 草稿"),
      at: new Date().toISOString(),
      source: payload.source || "ai_workbench",
    };
    g.localStorage.setItem(KEY, JSON.stringify(rec));
    return rec;
  }

  function peekDraft() {
    try {
      var raw = g.localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function consumeDraft(expectedTarget) {
    var d = peekDraft();
    if (!d || !d.text) return null;
    if (expectedTarget && d.target !== expectedTarget) return null;
    try {
      g.localStorage.removeItem(KEY);
    } catch (eR) {}
    return d;
  }

  function pushPastoralHandover(text, title) {
    var H = g.PastoralDataHub;
    if (!H || !H.addHandoverTask) return false;
    H.addHandoverTask({
      type: "pastoral_care",
      memberName: title || "（AI 草稿）",
      reason: String(text || "").slice(0, 2000),
      source: "ai_ministry_bridge",
      link: "ai_tools/tools/ai_workbench_integrated.html",
    });
    return true;
  }

  function importToDesk(targetId, text, title) {
    var t = TARGETS[targetId];
    if (!t) return { ok: false, error: "unknown_target" };
    text = String(text || "").trim();
    if (!text) return { ok: false, error: "empty_text" };
    saveDraft({ target: targetId, text: text, title: title });

    if (targetId === "pastoral_care" || targetId === "visitation") {
      try {
        pushPastoralHandover(text, title);
      } catch (eP) {}
    }

    var nav = {
      sidebarUrl: t.sidebarUrl,
      contentUrl: t.contentUrl,
    };
    if (typeof g.bible100ShellNav === "function") {
      g.bible100ShellNav(null, nav);
    } else if (g.parent && g.parent !== g && typeof g.parent.bible100ShellNav === "function") {
      g.parent.bible100ShellNav(null, nav);
    } else {
      try {
        g.parent.postMessage({ type: "bible100-shell", sidebarUrl: t.sidebarUrl, contentUrl: t.contentUrl }, "*");
      } catch (eM) {}
    }
    return { ok: true, target: t };
  }

  function renderImportBar(hostId, text, defaultTarget) {
    var host = g.document && g.document.getElementById(hostId);
    if (!host || !text) return;
    host.innerHTML = "";
    host.style.cssText =
      "margin:12px 0;padding:10px;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;font-size:11px;";
    var p = g.document.createElement("p");
    p.style.margin = "0 0 8px";
    p.innerHTML = "<strong>📥 匯入事工工作桌</strong> · 草稿已複製到本機橋接；請在工作桌人工核對後才正式使用。";
    host.appendChild(p);
    var row = g.document.createElement("div");
    row.style.display = "flex";
    row.style.flexWrap = "wrap";
    row.style.gap = "6px";
    Object.keys(TARGETS).forEach(function (id) {
      var btn = g.document.createElement("button");
      btn.type = "button";
      btn.className = "ai-bridge-btn";
      btn.style.cssText =
        "padding:8px 12px;border-radius:8px;border:1px solid #059669;background:#fff;cursor:pointer;font-size:11px;min-height:44px;";
      btn.textContent = "→ " + TARGETS[id].label;
      btn.onclick = function () {
        importToDesk(id, text, "AI 匯出");
      };
      row.appendChild(btn);
    });
    host.appendChild(row);
    if (defaultTarget && TARGETS[defaultTarget]) {
      var primary = g.document.createElement("button");
      primary.type = "button";
      primary.style.cssText =
        "margin-top:8px;padding:10px 16px;border:none;border-radius:8px;background:#059669;color:#fff;font-weight:700;cursor:pointer;min-height:44px;width:100%;max-width:320px;";
      primary.textContent = "⭐ 一鍵匯入：" + TARGETS[defaultTarget].label;
      primary.onclick = function () {
        importToDesk(defaultTarget, text, "AI 匯出");
      };
      host.appendChild(primary);
    }
  }

  function applyConsumedToPage() {
    var path = (g.location.pathname || "").replace(/\\/g, "/");
    var d = peekDraft();
    if (!d || !d.text) return;

    if (path.indexOf("crm_automation_console") >= 0 && d.target === "crm_note") {
      var el = g.document.getElementById("crmIntentText");
      if (el) {
        el.value = d.text;
        consumeDraft("crm_note");
        showBanner("已从 AI Lab 载入草稿到口述框（请按「解析」并人工核对）");
      }
      return;
    }
    if (path.indexOf("visitation_index") >= 0 && d.target === "visitation") {
      consumeDraft("visitation");
      showBanner("AI 探访草稿已载入 · 请人工核对后建立任务\n\n" + d.text.slice(0, 500));
      return;
    }
    if (path.indexOf("pastoral-integrated") >= 0 && d.target === "pastoral_care") {
      consumeDraft("pastoral_care");
      showBanner("AI 关怀草稿已通过交接队列推送（请至 Tab④ 或探访桌确认）");
      return;
    }
    if (path.indexOf("education-integrated") >= 0 && d.target === "education_quiz") {
      consumeDraft("education_quiz");
      showBanner("AI 备课/测验草稿已就绪 · 请粘贴至备课区：\n\n" + d.text.slice(0, 600));
      return;
    }
  }

  function showBanner(msg) {
    if (!g.document || !g.document.body) return;
    var bar = g.document.createElement("div");
    bar.setAttribute("role", "status");
    bar.style.cssText =
      "position:sticky;top:0;z-index:999;padding:10px 12px;background:#ecfdf5;border-bottom:2px solid #059669;font-size:12px;white-space:pre-wrap;line-height:1.5;";
    bar.textContent = msg;
    g.document.body.insertBefore(bar, g.document.body.firstChild);
  }

  g.AiMinistryBridge = {
    KEY: KEY,
    TARGETS: TARGETS,
    saveDraft: saveDraft,
    peekDraft: peekDraft,
    consumeDraft: consumeDraft,
    importToDesk: importToDesk,
    renderImportBar: renderImportBar,
    applyConsumedToPage: applyConsumedToPage,
  };

  if (g.document && g.document.readyState === "loading") {
    g.document.addEventListener("DOMContentLoaded", applyConsumedToPage);
  } else {
    setTimeout(applyConsumedToPage, 80);
  }
})(typeof window !== "undefined" ? window : this);
