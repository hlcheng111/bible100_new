/**
 * 5F 營運自動化三屏劇場 — 劇本 SSOT、URL 情境、一鍵試玩
 */
(function (global) {
  "use strict";

  var SCRIPTS = {
    shift: {
      id: "shift",
      emoji: "📅",
      title: "排班追到心累",
      youSay: "「下週主日守門缺一人，請找代班」",
      aiDoes: "聽懂需求，準備排班表草稿",
      youDecide: "核對時段、複製邀請稿再發送",
      opens: "A1 義工排班",
      sample:
        "下週主日守門缺一人，請幫忙找代班；王弟兄可以協助。"
    },
    visit: {
      id: "visit",
      emoji: "💚",
      title: "探訪記錄難整理",
      youSay: "貼上探訪筆記或口述關懷重點",
      aiDoes: "整理成結構化跟進草稿",
      youDecide: "是否採用、是否存入工作桌",
      opens: "A2 探訪跟進",
      sample:
        "上週探訪李姊妹，她最近工作壓力大，請安排下週三電話關懷跟進。"
    },
    finance: {
      id: "finance",
      emoji: "📒",
      title: "財務對帳（可選）",
      youSay: "「銀行與奉獻紀錄對不上」",
      aiDoes: "預填對帳欄位草稿",
      youDecide: "未用 CRM 記帳可略過此劇本",
      opens: "A3 財務對帳",
      sample:
        "本月銀行對帳差額 3200 元，疑為張弟兄奉獻轉帳尚未入帳。"
    }
  };

  var PAIN_TO_SCRIPT = {
    shift: "shift",
    visit: "visit",
    finance: "finance",
    report: "visit",
    automate: null
  };

  var CONTEXT_COPY = {
    "staff:shift": "你從 <strong>4F 執行層</strong> 來 · 解決：<strong>排班心累</strong> → 5F 已為你備好台詞",
    "staff:visit": "你從 <strong>4F 執行層</strong> 來 · 解決：<strong>探訪斷線</strong> → 5F 幫你整理草稿",
    "staff:finance": "你從 <strong>4F 執行層</strong> 來 · 財務對帳 → 5F 預填欄位",
    "staff:automate": "你從 <strong>事奉旅程第 8 站</strong> 來 · 流程瓶頸 → 5F 口述少填表",
    "staff:": "你從 <strong>🙋 事奉旅程</strong> 來 · 累了就上 5F，不用學新系統",
    "teacher:report": "你從 <strong>老師牧養週 · 週日週報</strong> 來 · 聚會後口述 → 5F 整理跟進草稿",
    "teacher:visit": "你從 <strong>老師牧養週 · 週一探訪</strong> 來 · 貼筆記 → 5F 預填跟進",
    "teacher:": "你從 <strong>👩‍🏫 老師路線</strong> 來 · 5F 幫你少寫表",
    "journey:": "你從 <strong>CRM 旅程中樞</strong> 來 · 選一條劇本試玩即可"
  };

  var REPORT_SAMPLE =
    "週日小組聚會後：陳弟兄分享失業壓力，請安排探訪跟進並整理週報重點。";

  function esc(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getContextParams() {
    try {
      var p = new URLSearchParams(global.location.search || "");
      return {
        from: (p.get("from") || "").trim().toLowerCase(),
        pain: (p.get("pain") || "").trim().toLowerCase()
      };
    } catch (e) {
      return { from: "", pain: "" };
    }
  }

  function contextMessage(from, pain) {
    var key = from + ":" + pain;
    if (CONTEXT_COPY[key]) return CONTEXT_COPY[key];
    if (from && CONTEXT_COPY[from + ":"]) return CONTEXT_COPY[from + ":"];
    return "";
  }

  function renderElevator(host) {
    if (!host) return;
    var floors = [
      { n: "1F", t: "戰情", d: "先看成果" },
      { n: "2F", t: "決策", d: "先診斷再派工" },
      { n: "3F", t: "人才", d: "恩賜與配對" },
      { n: "4F", t: "執行", d: "排班 · 探訪 · 小組 — 痛點常在這", cls: "crm5f-elevator__floor--4f" },
      { n: "5F", t: "輔助 ★", d: "你在這 — 口述一句，AI 幫你填草稿", cls: "crm5f-elevator__floor--5f" }
    ];
    host.innerHTML = floors
      .map(function (f) {
        return (
          '<div class="crm5f-elevator__floor ' +
          (f.cls || "") +
          '"><span class="crm5f-elevator__label">' +
          esc(f.n) +
          "</span><span><strong>" +
          esc(f.t) +
          "</strong> — " +
          esc(f.d) +
          "</span></div>"
        );
      })
      .join("");
  }

  function renderScripts(host, highlightId, onSample) {
    if (!host) return;
    var html = "";
    Object.keys(SCRIPTS).forEach(function (k) {
      var s = SCRIPTS[k];
      var hi = highlightId === k ? " is-highlight" : "";
      html +=
        '<article class="crm5f-script' +
        hi +
        '" data-script="' +
        esc(s.id) +
        '">' +
        '<div class="crm5f-script__emoji">' +
        s.emoji +
        "</div>" +
        '<h3 class="crm5f-script__title">' +
        esc(s.title) +
        "</h3>" +
        '<div class="crm5f-script__grid">' +
        '<div class="crm5f-script__cell"><strong>你說</strong>' +
        esc(s.youSay) +
        "</div>" +
        '<div class="crm5f-script__cell"><strong>AI 做</strong>' +
        esc(s.aiDoes) +
        "</div>" +
        '<div class="crm5f-script__cell"><strong>你決定</strong>' +
        esc(s.youDecide) +
        "</div>" +
        '<div class="crm5f-script__cell"><strong>開哪張表</strong>' +
        esc(s.opens) +
        "</div>" +
        "</div>" +
        '<button type="button" class="crm5f-script__cta" data-fill-script="' +
        esc(s.id) +
        '">👉 一鍵帶入範例句</button>' +
        "</article>";
    });
    host.innerHTML = html;
    host.querySelectorAll("[data-fill-script]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-fill-script");
        if (onSample) onSample(id);
      });
    });
  }

  function renderPipeline(host) {
    if (!host) return;
    host.innerHTML =
      '<div class="crm5f-pipeline">' +
      '<div class="crm5f-pipeline__step"><strong>① 你說</strong>口述或貼上</div>' +
      '<span class="crm5f-pipeline__arrow" aria-hidden="true">→</span>' +
      '<div class="crm5f-pipeline__step"><strong>② 解析</strong>規則 demo（請核對）</div>' +
      '<span class="crm5f-pipeline__arrow" aria-hidden="true">→</span>' +
      '<div class="crm5f-pipeline__step"><strong>③ 草稿</strong>Intent 建議</div>' +
      '<span class="crm5f-pipeline__arrow" aria-hidden="true">→</span>' +
      '<div class="crm5f-pipeline__step"><strong>④ 預填</strong>開表單 · 不儲存</div>' +
      "</div>" +
      '<div class="crm5f-redlines">' +
      "<span>❌ 不自動 LINE</span>" +
      "<span>❌ 不取代牧者派工</span>" +
      '<span class="ok">✅ 只預填 · 你決定是否存</span>' +
      "</div>";
  }

  function fillSample(scriptId, pain) {
    var ta = global.document.getElementById("crmIntentText");
    if (!ta) return;
    var text = "";
    if (pain === "report" && scriptId === "visit") {
      text = REPORT_SAMPLE;
    } else if (SCRIPTS[scriptId]) {
      text = SCRIPTS[scriptId].sample;
    }
    ta.value = text;
    ta.focus();
    var wb = global.document.getElementById("crm5fWorkbench");
    if (wb && wb.scrollIntoView) {
      wb.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function initTheater(options) {
    options = options || {};
    var ctx = getContextParams();
    var pain = ctx.pain;
    var from = ctx.from;
    var highlightId = pain ? PAIN_TO_SCRIPT[pain] : null;
    if (pain === "report") highlightId = "visit";

    var ctxEl = global.document.getElementById("crm5fContext");
    var msg = contextMessage(from, pain);
    if (ctxEl && msg) {
      ctxEl.innerHTML = msg;
      ctxEl.classList.add("is-visible");
    }

    renderElevator(global.document.getElementById("crm5fElevator"));
    renderScripts(global.document.getElementById("crm5fScripts"), highlightId, function (scriptId) {
      fillSample(scriptId, pain);
      if (typeof options.onSampleFilled === "function") {
        setTimeout(function () { options.onSampleFilled(scriptId); }, 120);
      }
    });
    renderPipeline(global.document.getElementById("crm5fPipeline"));

    if (highlightId) {
      var card = global.document.querySelector('.crm5f-script[data-script="' + highlightId + '"]');
      if (card && card.scrollIntoView) {
        setTimeout(function () {
          card.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 300);
      }
      if (options.autoFillOnLoad !== false) {
        fillSample(highlightId, pain);
        if (typeof options.onSampleFilled === "function") {
          setTimeout(function () { options.onSampleFilled(highlightId); }, 200);
        }
      }
    }
  }

  global.CrmAutomationTheater = {
    SCRIPTS: SCRIPTS,
    initTheater: initTheater,
    fillSample: fillSample,
    getContextParams: getContextParams,
    automationConsoleUrl: function (from, pain) {
      var q = [];
      if (from) q.push("from=" + encodeURIComponent(from));
      if (pain) q.push("pain=" + encodeURIComponent(pain));
      return "crm_automation_console.html" + (q.length ? "?" + q.join("&") : "");
    }
  };
})(typeof window !== "undefined" ? window : this);
