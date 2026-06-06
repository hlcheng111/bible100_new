/**
 * CRM 功能頁情境頂條（安全繩）— 從 Hub 帶 role/step 參數進入時顯示
 */
(function (global) {
  "use strict";

  var ROLE_ZH = {
    member: "會友／學生",
    teacher: "老師／組長",
    staff: "事工同工",
    leader: "牧者／長執"
  };

  var STEP_TITLES = {
    staff: [
      "排班追到心累",
      "缺人苦求",
      "跨部門媒合",
      "權責混亂",
      "名冊分散",
      "探訪斷線",
      "跟進漏接",
      "流程瓶頸"
    ],
    teacher: [
      "班級名冊",
      "聚會前備課",
      "恩賜分組",
      "聚會後週報",
      "探訪跟進",
      "出席戰情",
      "牧養策略"
    ],
    member: [
      "認識自己",
      "恩賜方向",
      "找對服事",
      "加入小組",
      "更深裝備"
    ],
    leader: [
      "先看見成果",
      "戰情一頁清",
      "權責共識",
      "教會評估",
      "跨工具戰情",
      "異象落地"
    ]
  };

  var FLOOR_HINT = {
    shift: "您在 4F 執行層。AI 可預填空檔，請您核對後做最後派工決定。",
    visit: "您在 4F 執行層。貼上探訪筆記，AI 只整理草稿，存不存由您決定。",
    dashboard: "您在 1F 戰情層。先看全貌與待辦，再往下執行。",
    default: "您在 4F 執行層。完成本步後可隨時回到旅程中樞。"
  };

  function getParams() {
    try {
      var p = new URLSearchParams(global.location.search || "");
      return {
        from: p.get("crm_from") || p.get("from") || "",
        role: p.get("role") || "",
        step: p.get("step"),
        tab: p.get("tab") || "journey",
        pain: p.get("pain") || ""
      };
    } catch (e) {
      return { from: "", role: "", step: null, tab: "journey", pain: "" };
    }
  }

  function hubReturnUrl(role, step, tab) {
    var base = "guide_crm_journey_hub.html";
    var q = [];
    if (tab === "vision" || role === "leader") {
      q.push("tab=vision", "role=leader");
    } else {
      q.push("tab=" + (tab || "journey"));
      if (role) q.push("role=" + encodeURIComponent(role));
    }
    if (step != null && step !== "" && tab !== "vision") q.push("step=" + encodeURIComponent(String(step)));
    if (global.bible100CacheBust) return global.bible100CacheBust(base + "?" + q.join("&"));
    return base + "?" + q.join("&");
  }

  function fiveFUrl(role, pain) {
    var base = "../ai_tools/pages/crm_automation_console.html";
    var q = [];
    if (role) q.push("from=" + encodeURIComponent(role));
    if (pain) q.push("pain=" + encodeURIComponent(pain));
    else if (role === "staff") q.push("pain=shift");
    if (global.bible100CacheBust) return global.bible100CacheBust(base + (q.length ? "?" + q.join("&") : ""));
    return base + (q.length ? "?" + q.join("&") : "");
  }

  function stepTitle(role, stepIdx) {
    var arr = STEP_TITLES[role];
    if (arr && arr[stepIdx]) return arr[stepIdx];
    return "第 " + (Number(stepIdx) + 1) + " 站";
  }

  function detectPain(pathname) {
    if (/volunteer_shift/.test(pathname)) return "shift";
    if (/visitation/.test(pathname)) return "visit";
    if (/dashboard/.test(pathname)) return "dashboard";
    return "default";
  }

  function renderBar(opts) {
    opts = opts || {};
    var params = getParams();
    if (params.from !== "hub" && !opts.force) return;
    var role = params.role || "member";
    var step = params.step != null ? Number(params.step) : null;
    if (!isFinite(step)) {
      try {
        step = Number(global.localStorage.getItem("crm_journey_step_v1")) || 0;
      } catch (e2) {
        step = 0;
      }
    }
    var tab = params.tab || "journey";
    var pain = params.pain || detectPain(global.location.pathname || "");
    var hint = FLOOR_HINT[pain] || FLOOR_HINT.default;

    var bar = global.document.createElement("div");
    bar.className = "crm-ctx-bar";
    bar.setAttribute("role", "navigation");
    bar.setAttribute("aria-label", "CRM 旅程安全繩");

    var emoji = role === "staff" ? "🙋" : role === "teacher" ? "👩‍🏫" : role === "leader" ? "⛪" : "📖";
    var trail =
      emoji + " " + (ROLE_ZH[role] || "會友") + "旅程 · 第 " + (step + 1) + " 站：" + stepTitle(role, step);

    bar.innerHTML =
      '<div class="crm-ctx-bar__trail">' + trail + "</div>" +
      '<div class="crm-ctx-bar__hint">' + hint + "</div>" +
      '<div class="crm-ctx-bar__actions">' +
      '<a class="crm-ctx-bar__btn crm-ctx-bar__btn--primary" id="crmCtxBackHub" href="#">⬅ 返回我的旅程</a>' +
      (role === "staff" || role === "teacher"
        ? '<a class="crm-ctx-bar__btn crm-ctx-bar__btn--5f" id="crmCtxGo5f" href="#">☕ 累了？5F 口述預填</a>'
        : "") +
      "</div>";

    var back = bar.querySelector("#crmCtxBackHub");
    var go5f = bar.querySelector("#crmCtxGo5f");
    var hubUrl = hubReturnUrl(role, step, tab);
    if (back) {
      back.href = hubUrl;
      back.target = "_parent";
    }
    if (go5f) {
      go5f.href = fiveFUrl(role, pain === "default" ? (role === "teacher" ? "report" : "shift") : pain);
      go5f.target = "_parent";
    }

    var mount = opts.mount ? global.document.querySelector(opts.mount) : global.document.body;
    if (!mount) return;
    var first = mount.firstChild;
    if (first) mount.insertBefore(bar, first);
    else mount.appendChild(bar);
  }

  global.CrmContextBar = { render: renderBar, getParams: getParams, hubReturnUrl: hubReturnUrl };
  if (global.document.currentScript && global.document.currentScript.getAttribute("data-auto") !== "0") {
    global.document.addEventListener("DOMContentLoaded", function () {
      renderBar();
    });
  }
})(typeof window !== "undefined" ? window : this);
