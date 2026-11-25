/**
 * 工作桌 Tab 的「資料何來何去」細字條（CmFlowStrip）
 *
 * 每個 Tab 下方一行小字：📥 資料來自哪 → 📤 去向哪。小白看得到資料從哪來、往哪去。
 * 不寫任何業務資料，只依「目前作用中的 Tab」換文字。
 *
 * 用法：
 *   CmFlowStrip.mount({
 *     tabs: ".edu-shell-tab",                       // Tab 按鈕選擇器
 *     notes: { roster: { from: "…", to: "…", link: { href: "…", text: "…" } } },
 *     key: function (btn) { return btn.getAttribute("data-tab"); }   // 可省略：預設讀 data-tab 或 onclick 裡的 switchTab('x')
 *   });
 */
(function (global) {
  "use strict";

  var STYLE_ID = "cmFlowStripStyle";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function injectStyle(doc) {
    if (doc.getElementById(STYLE_ID)) return;
    var st = doc.createElement("style");
    st.id = STYLE_ID;
    st.textContent =
      ".cm-flow-strip{display:flex;flex-wrap:wrap;gap:4px 14px;align-items:baseline;margin:6px 0 8px;padding:5px 10px;" +
      "border-radius:8px;background:#f8fafc;border:1px dashed #cbd5e1;font-size:11px;line-height:1.5;color:#64748b;}" +
      ".cm-flow-strip b{color:#0f172a;font-weight:700;}" +
      ".cm-flow-strip a{color:#0369a1;font-weight:700;text-decoration:none;}" +
      ".cm-flow-strip a:hover{text-decoration:underline;}";
    doc.head.appendChild(st);
  }

  function defaultKey(btn) {
    var k = btn.getAttribute("data-tab");
    if (k) return k;
    var m = /\(\s*['"]([\w-]+)['"]/.exec(btn.getAttribute("onclick") || "");
    return m ? m[1] : "";
  }

  function mount(opts) {
    opts = opts || {};
    var doc = global.document;
    var tabs = [].slice.call(doc.querySelectorAll(opts.tabs || ""));
    if (!tabs.length) return null;
    injectStyle(doc);
    var keyOf = opts.key || defaultKey;
    var notes = opts.notes || {};
    var host = tabs[0].parentNode;
    var strip = doc.createElement("p");
    strip.className = "cm-flow-strip";
    strip.setAttribute("data-cm-flow-strip", "1");
    host.parentNode.insertBefore(strip, host.nextSibling);

    function active() {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].classList.contains("active") || tabs[i].getAttribute("aria-selected") === "true") return tabs[i];
      }
      return null;
    }

    function render() {
      var b = active();
      var n = b ? notes[keyOf(b)] : null;
      strip.hidden = !n;
      if (!n) return;
      strip.innerHTML =
        "<span>📥 <b>資料來自</b>：" + esc(n.from) + "</span>" +
        "<span>📤 <b>去向</b>：" + esc(n.to) +
        (n.link
          ? ' <a href="' + esc(n.link.href) + '" data-b100-nav="content">' + esc(n.link.text) + " →</a>"
          : "") +
        "</span>";
    }

    tabs.forEach(function (b) {
      b.addEventListener("click", function () {
        global.setTimeout(render, 0);
      });
    });
    if (global.MutationObserver) {
      new global.MutationObserver(render).observe(host, { attributes: true, subtree: true, attributeFilter: ["class", "aria-selected"] });
    }
    render();
    return strip;
  }

  global.CmFlowStrip = { mount: mount };
})(typeof window !== "undefined" ? window : this);
