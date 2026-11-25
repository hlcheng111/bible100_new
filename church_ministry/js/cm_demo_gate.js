/**
 * 教會事工 · 示範資料守門（CmDemoGate）
 *
 * 原則：資料是空的時候，畫面就老實顯示「尚無資料」，不要偷偷塞示範資料。
 *  - 空資料：頁頂出現提示條，使用者「按了」才載入示範。
 *  - 載入後：頁頂常駐「這裡含示範資料」提示，避免誤當真資料匯出。
 *  - 使用者把資料刪光再重整：回到「尚無資料」，不會再被自動寫回示範。
 *
 * 用法：CmDemoGate.offer(isEmpty, loadFn, { id: "worship/instrument-team", what: "器樂團成員" });
 * 可選：opts.isDemo = function () { return true/false; }  // 自訂「目前是否含示範」的判斷
 */
(function (global) {
  "use strict";

  var FLAG_KEY = "cm_demo_loaded_v1";
  var BAR_ID = "cmDemoGateBar";

  function readFlags() {
    try {
      return JSON.parse(global.localStorage.getItem(FLAG_KEY) || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  function writeFlags(f) {
    try {
      global.localStorage.setItem(FLAG_KEY, JSON.stringify(f));
    } catch (e) {}
  }

  function pageId() {
    return String(global.location.pathname || "").split("/").slice(-2).join("/");
  }

  function onReady(fn) {
    if (global.document.body) fn();
    else global.document.addEventListener("DOMContentLoaded", fn);
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function bar(kind, html) {
    var doc = global.document;
    var el = doc.getElementById(BAR_ID);
    if (!el) {
      el = doc.createElement("div");
      el.id = BAR_ID;
      el.setAttribute("role", "status");
      doc.body.insertBefore(el, doc.body.firstChild);
    }
    var bg = kind === "demo" ? "#fff7e6" : "#eef6ff";
    var bd = kind === "demo" ? "#f5c26b" : "#9ec5f8";
    el.style.cssText =
      "margin:0;padding:8px 14px;font-size:13px;line-height:1.6;color:#1f2d3d;background:" +
      bg + ";border-bottom:1px solid " + bd + ";display:flex;flex-wrap:wrap;gap:8px;align-items:center;";
    el.innerHTML = html;
    return el;
  }

  function btnCss() {
    return "padding:3px 10px;border:1px solid #888;border-radius:6px;background:#fff;cursor:pointer;font-size:12px;";
  }

  function showDemoNotice(opts) {
    var el = bar(
      "demo",
      "<strong>示範</strong><span>這裡目前含示範資料" +
        (opts.what ? "（" + esc(opts.what) + "）" : "") +
        "。正式使用前，請先刪除示範項目，再輸入真實資料；示範內容不要匯出給牧者當真。</span>"
    );
    return el;
  }

  function offer(isEmpty, loadFn, opts) {
    opts = opts || {};
    var id = opts.id || pageId();
    onReady(function () {
      var flags = readFlags();
      var empty = !!isEmpty;
      var demoNow = typeof opts.isDemo === "function" ? !!opts.isDemo() : !!flags[id];

      if (empty) {
        if (flags[id]) {
          delete flags[id];
          writeFlags(flags);
        }
        var el = bar(
          "empty",
          "<strong>尚無資料</strong><span>" +
            (opts.what ? esc(opts.what) + "還是空的。" : "這裡還是空的。") +
            "可以直接新增自己的資料，或先看一份示範。</span>" +
            '<button type="button" id="cmDemoGateLoad" style="' + btnCss() + '">載入示範資料（會標示「示範」）</button>'
        );
        var b = el.querySelector("#cmDemoGateLoad");
        if (b) {
          b.addEventListener("click", function () {
            try {
              loadFn();
            } catch (e) {
              if (global.console) global.console.error(e);
            }
            var f = readFlags();
            f[id] = new Date().toISOString();
            writeFlags(f);
            showDemoNotice(opts);
          });
        }
      } else if (demoNow) {
        showDemoNotice(opts);
      }
    });
  }

  /** 頁面自己有「載入示範」按鈕時，載入後呼叫：記旗標並顯示「示範」提示條 */
  function markLoaded(opts) {
    opts = opts || {};
    var id = opts.id || pageId();
    var f = readFlags();
    f[id] = new Date().toISOString();
    writeFlags(f);
    onReady(function () {
      showDemoNotice(opts);
    });
  }

  global.CmDemoGate = { offer: offer, markLoaded: markLoaded, FLAG_KEY: FLAG_KEY };
})(typeof window !== "undefined" ? window : this);
