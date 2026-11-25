/**
 * 義工排班檢查面板（E 區 · P4）
 * 依賴：CmShiftRules、CmGoogleLinks、ChurchDataBridge（讀排班，可缺）、VolunteerShiftTool（導覽，可缺）
 * 只讀：不改排班、不通知、不連網、不呼叫 AI。缺底座時降級並提示。
 */
(function (global) {
  "use strict";

  var doc = global.document;
  var last = null;

  function $(id) {
    return doc.getElementById(id);
  }

  function rules() {
    return global.CmShiftRules || null;
  }

  function setStatus(msg, kind) {
    var el = $("rcStatus");
    if (!el) return;
    el.textContent = msg || "";
    el.style.background = kind === "ok" ? "#ecfdf5" : kind === "warn" ? "#fffbeb" : "#f1f5f9";
    el.hidden = !msg;
  }

  function readData() {
    var B = global.ChurchDataBridge;
    if (!B || !B.getVolunteerData) return { ok: false, schedules: [], ministries: [] };
    try {
      var vol = B.getVolunteerData() || {};
      return {
        ok: true,
        schedules: Array.isArray(vol.schedules) ? vol.schedules : [],
        ministries: vol.ministries || vol.positions || []
      };
    } catch (e) {
      return { ok: false, schedules: [], ministries: [] };
    }
  }

  function copyText(text) {
    if (global.navigator && global.navigator.clipboard && global.navigator.clipboard.writeText) {
      return global.navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = doc.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        doc.body.appendChild(ta);
        ta.select();
        var ok = doc.execCommand("copy");
        doc.body.removeChild(ta);
        ok ? resolve() : reject(new Error("copy failed"));
      } catch (e) {
        reject(e);
      }
    });
  }

  function renderKpi(r) {
    var host = $("rcKpi");
    if (!host) return;
    host.innerHTML = "";
    [
      ["重要", r.counts.high],
      ["注意", r.counts.mid],
      ["參考", r.counts.low],
      ["已檢查排班", r.scanned]
    ].forEach(function (k) {
      var d = doc.createElement("div");
      d.className = "cm-kpi";
      var lab = doc.createElement("span");
      lab.className = "cm-muted";
      lab.textContent = k[0];
      var num = doc.createElement("strong");
      num.textContent = String(k[1]);
      d.appendChild(lab);
      d.appendChild(num);
      host.appendChild(d);
    });
  }

  function renderIssues(r) {
    var host = $("rcIssues");
    if (!host) return;
    host.innerHTML = "";
    if (!r.issues.length) {
      var ok = doc.createElement("div");
      ok.className = "rc-ok";
      ok.textContent = r.scanned
        ? "沒有發現需要處理的事項，很好！"
        : "這段期間還沒有排班資料。請先到「新增排班」建立，或回「首頁」載入試用資料。";
      host.appendChild(ok);
      return;
    }
    r.issues.forEach(function (i) {
      var d = doc.createElement("div");
      d.className = "rc-issue rc-issue--" + i.severity;
      var tag = doc.createElement("span");
      tag.className = "rc-tag rc-tag--" + i.severity;
      tag.textContent = i.severity_label;
      var kind = doc.createElement("strong");
      kind.textContent = i.kind_label + "　";
      d.appendChild(tag);
      d.appendChild(kind);
      d.appendChild(doc.createTextNode(i.message));
      host.appendChild(d);
    });
  }

  function renderRules(r) {
    var host = $("rcRules");
    if (!host) return;
    host.innerHTML = "";
    [
      "檢查未來 " + r.rules.window_days + " 天",
      "每人每週最多 " + r.rules.max_per_week + " 次",
      "每人每月最多 " + r.rules.max_per_month + " 次",
      r.rules.confirm_within_days + " 天內要服事卻還沒確認，會提醒",
      "次數高於平均 " + r.rules.imbalance_ratio + " 倍（且至少多 2 次）會提醒不平均"
    ].forEach(function (t) {
      var li = doc.createElement("li");
      li.textContent = t;
      host.appendChild(li);
    });
  }

  function run() {
    var C = rules();
    if (!C) return;
    var data = readData();
    if (!data.ok) {
      setStatus("找不到排班資料底座，無法檢查；請從教會事工入口開啟本頁。", "warn");
    } else {
      setStatus("", "");
    }
    last = C.checkSchedules(data.schedules, { ministries: data.ministries });
    renderKpi(last);
    renderIssues(last);
    renderRules(last);
    var rep = $("rcReport");
    if (rep) rep.textContent = C.buildReportText(last);
  }

  function onCopy() {
    var C = rules();
    if (!C || !last) return;
    copyText(C.buildReportText(last))
      .then(function () {
        setStatus("已複製檢查報告，可貼給事工負責人。", "ok");
      })
      .catch(function () {
        setStatus("無法自動複製，請展開「看報告全文」手動複製。", "warn");
      });
  }

  function onCopyRules() {
    var C = rules();
    if (!C) return;
    copyText(C.buildPromptRules())
      .then(function () {
        setStatus("已複製規則附註。請貼在 AI 提示詞後面；AI 只出草稿，須人審。", "ok");
      })
      .catch(function () {
        setStatus("無法自動複製規則附註。", "warn");
      });
  }

  function updateDraftNote() {
    var el = $("rcDraftNote");
    var I = global.B100ChromeI18n;
    if (!el || !I || !I.getLocale) return;
    var loc = I.getLocale();
    el.hidden = !(loc === "vi" || loc === "id");
  }

  function init() {
    if (!$("rcIssues")) return;
    var nav = $("toolNav");
    if (nav && global.VolunteerShiftTool && VolunteerShiftTool.renderToolNav) {
      nav.innerHTML = VolunteerShiftTool.renderToolNav("rules_check");
    }
    if (global.B100CmI18nBoot) {
      try {
        global.B100CmI18nBoot.boot({ onChange: updateDraftNote });
      } catch (e) {}
    }
    updateDraftNote();
    var G = global.CmGoogleLinks;
    if (G && G.renderRows) {
      G.renderRows($("rcLinks"), ["volunteer_schedule_sheet", "volunteer_availability_form"], doc);
    }
    $("rcCopy").onclick = onCopy;
    $("rcRerun").onclick = run;
    $("rcCopyRules").onclick = onCopyRules;
    run();
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  global.CmShiftRulesPanel = { init: init, run: run };
})(typeof window !== "undefined" ? window : this);
