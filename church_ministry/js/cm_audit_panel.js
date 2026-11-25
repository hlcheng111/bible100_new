/**
 * 操作紀錄（審計）面板（P6）——唯讀。
 * 依賴：CmAuditView、ChurchDataBridge.getAuditLogs、ChurchAuth（選用，需 crm.admin）。
 * 不提供新增／修改／刪除；匯出只含白名單內的白話欄位。
 */
(function (global) {
  "use strict";

  var doc = global.document;
  var MAX_SHOW = 200;
  var rows = [];

  function $(id) {
    return doc.getElementById(id);
  }

  function allowed() {
    var A = global.ChurchAuth;
    if (!A || typeof A.can !== "function") return true;
    return A.can("crm.admin");
  }

  function setMsg(msg) {
    var el = $("au-msg");
    if (!el) return;
    el.textContent = msg || "";
    el.hidden = !msg;
  }

  function readEntries() {
    var B = global.ChurchDataBridge;
    if (!B || typeof B.getAuditLogs !== "function") return [];
    try {
      return B.getAuditLogs(0);
    } catch (e) {
      return [];
    }
  }

  function filters() {
    var k = $("au-kind");
    var d = $("au-days");
    var t = $("au-text");
    return {
      kind: k ? k.value : "all",
      sinceDays: d ? Number(d.value) || 0 : 0,
      text: t ? t.value : ""
    };
  }

  function td(text) {
    var c = doc.createElement("td");
    c.textContent = text; /* 一律 textContent：紀錄內容不當 HTML 執行 */
    return c;
  }

  function render() {
    var body = $("au-body");
    var count = $("au-count");
    if (!body) return;
    rows = global.CmAuditView.listRows(readEntries(), filters(), new Date());
    body.innerHTML = "";
    rows.slice(0, MAX_SHOW).forEach(function (r) {
      var tr = doc.createElement("tr");
      tr.appendChild(td(r.time_zh));
      tr.appendChild(td(r.who_zh));
      tr.appendChild(td(r.kind_zh));
      tr.appendChild(td(r.what_zh));
      tr.appendChild(td(r.detail_zh));
      body.appendChild(tr);
    });
    if (count) {
      count.textContent = rows.length
        ? "共 " + rows.length + " 筆" + (rows.length > MAX_SHOW ? "（畫面只列最新 " + MAX_SHOW + " 筆，匯出會是全部）" : "")
        : "沒有符合的紀錄。";
    }
    var empty = $("au-empty");
    if (empty) empty.hidden = readEntries().length > 0;
  }

  function save(name, text, mime) {
    var blob = new Blob([text], { type: mime });
    var a = doc.createElement("a");
    a.href = global.URL.createObjectURL(blob);
    a.download = name;
    doc.body.appendChild(a);
    a.click();
    doc.body.removeChild(a);
    global.setTimeout(function () {
      global.URL.revokeObjectURL(a.href);
    }, 2000);
  }

  function exportAs(kind) {
    if (!rows.length) {
      setMsg("目前沒有可匯出的紀錄。");
      return;
    }
    var stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    if (kind === "csv") save("bible100_audit_" + stamp + ".csv", global.CmAuditView.toCsv(rows), "text/csv;charset=utf-8");
    else save("bible100_audit_" + stamp + ".json", global.CmAuditView.toJson(rows), "application/json");
    setMsg("已匯出 " + rows.length + " 筆（只含白話欄位，不含金額等細節）。");
  }

  function init() {
    if (!global.CmAuditView) return;
    if (!allowed()) {
      setMsg("你的角色沒有查看操作紀錄的權限（需要「行政」或「牧者」）。");
      var main = $("au-main");
      if (main) main.hidden = true;
      return;
    }
    var kind = $("au-kind");
    if (kind) {
      var K = global.CmAuditView.KIND_LABELS;
      Object.keys(K).forEach(function (k) {
        var o = doc.createElement("option");
        o.value = k;
        o.textContent = K[k];
        kind.appendChild(o);
      });
      kind.addEventListener("change", render);
    }
    ["au-days"].forEach(function (id) {
      var el = $(id);
      if (el) el.addEventListener("change", render);
    });
    var t = $("au-text");
    if (t) t.addEventListener("input", render);
    var c = $("au-csv");
    var j = $("au-json");
    if (c) c.addEventListener("click", function () { exportAs("csv"); });
    if (j) j.addEventListener("click", function () { exportAs("json"); });
    render();
  }

  global.CmAuditPanel = { init: init, render: render, exportAs: exportAs };
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
  else init();
})(typeof window !== "undefined" ? window : this);
