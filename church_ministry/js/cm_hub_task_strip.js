/**
 * Phase 4 · CM A–G 任務帶（僅 UI 導航，零業務寫入）
 * 鐵律：本檔不得呼叫 localStorage.setItem / canonical save*
 */
(function (win, doc) {
  "use strict";

  var CHAINS = {
    e_shift: {
      zone: "E",
      title: "E · 義工排班",
      purpose: "確認配對後排班與邀請文字；資料來自 canonical 配對與會友主檔",
      prev: { label: "← 配對工作台", href: "../../../smart_ministry/talent_ministry_matching.html" },
      next: { label: "人才追蹤 →", href: "../../../smart_ministry/talent_tracking.html" },
      data: "memberSystemData · bible100_smart_ministry_main.ministry_assignment",
      ai: { label: "AI 關懷短訊草稿", href: "../../../ai_tools/tools/ai_workbench_integrated.html?scenario=care_sms#tab-prompt" },
      tier: "canonical",
    },
    c_education: {
      zone: "C",
      title: "C · 主日學",
      purpose: "學籍／出席／備課；會友 externalId 橋接，不另建第二套會友表",
      prev: { label: "← 會友恩賜", href: "../../../smart_ministry/spiritual_gifts.html" },
      next: { label: "配對工作台 →", href: "../../../smart_ministry/talent_ministry_matching.html" },
      data: "education_data_hub · memberSystemData（externalId）",
      ai: { label: "AI 備課草稿", href: "../../../ai_tools/tools/ai_workbench_integrated.html?scenario=teach_lesson#tab-prompt" },
      tier: "canonical",
    },
    b_pastoral: {
      zone: "B",
      title: "B · 牧養小組",
      purpose: "小組／缺席／探訪佇列；關懷推送須同工確認",
      prev: { label: "← 會友主檔", href: "../../modules/members/member-integrated.html" },
      next: { label: "探訪工作桌 →", href: "../../modules/support/visitation_index.html" },
      data: "pastoral_data_hub · member_id 對齊 CentralMemberDB",
      ai: { label: "探訪記錄草稿", href: "../../../ai_tools/tools/ai_workbench_integrated.html?scenario=visit_note#tab-serve" },
      tier: "canonical",
    },
  };

  function resolveChain() {
    var b = doc.body;
    if (!b) return null;
    var id = b.getAttribute("data-cm-hub-chain");
    if (id && CHAINS[id]) return CHAINS[id];
    var zone = (b.getAttribute("data-b100-ae-zone") || "").toLowerCase();
    if (zone === "e" || b.getAttribute("data-cm-four-page") === "shift") return CHAINS.e_shift;
    if (zone === "c" || b.getAttribute("data-b100-edu-integrated")) return CHAINS.c_education;
    if (zone === "b" || /pastoral/i.test(b.className || "")) return CHAINS.b_pastoral;
    return null;
  }

  function rootPrefix() {
    var p = String(win.location.pathname || "").replace(/\\/g, "/");
    var i = p.toLowerCase().indexOf("/church_ministry/");
    if (i < 0) return "";
    var rel = p.slice(i + "/church_ministry/".length);
    var depth = (rel.match(/\//g) || []).length;
    return depth ? new Array(depth + 1).join("../") : "";
  }

  function absHref(href) {
    if (!href) return "#";
    if (/^https?:\/\//i.test(href)) return href;
    return href;
  }

  function render() {
    if (doc.getElementById("cm-hub-task-strip")) return;
    var chain = resolveChain();
    if (!chain) return;
    var pre = rootPrefix();
    var el = doc.createElement("div");
    el.id = "cm-hub-task-strip";
    el.className = "cm-hub-task-strip";
    el.setAttribute("role", "navigation");
    el.setAttribute("aria-label", "事奉價值鏈任務帶");
    var tier = chain.tier === "canonical"
      ? '<span class="cm-hub-tier cm-hub-tier--canonical">✅ Hub-canonical</span>'
      : "";
    el.innerHTML =
      "<div><strong>" +
      chain.title +
      "</strong>" +
      tier +
      " · " +
      chain.purpose +
      "</div>" +
      '<div class="cm-hub-steps">' +
      '<a href="' +
      absHref(chain.prev.href) +
      '" target="contentFrame">' +
      chain.prev.label +
      "</a>" +
      "<span>|</span>" +
      '<a href="' +
      absHref(chain.next.href) +
      '" target="contentFrame">' +
      chain.next.label +
      "</a>" +
      (chain.ai
        ? '<span>|</span><a href="' +
          absHref(chain.ai.href) +
          '" target="contentFrame">' +
          chain.ai.label +
          "</a>"
        : "") +
      "</div>" +
      '<div class="cm-hub-meta">資料來源：' +
      chain.data +
      " · 任務帶僅導航，不寫入 canonical</div>";
    var anchor =
      doc.querySelector(".edu-header") ||
      doc.querySelector(".cm-shell-header") ||
      doc.querySelector(".cm-tool-hero") ||
      doc.querySelector("header") ||
      doc.body.firstChild;
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(el, anchor.nextSibling);
    } else {
      doc.body.insertBefore(el, doc.body.firstChild);
    }
    if (chain.tier === "canonical" && doc.body) {
      doc.body.setAttribute("data-b100-page-tier", "canonical");
    }
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", render);
  else render();

  win.CmHubTaskStrip = { CHAINS: CHAINS, render: render };
})(window, document);
