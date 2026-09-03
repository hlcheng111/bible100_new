/**
 * B100 · 模块侧栏渲染器（summary 只开合 · 真实 href 链接）
 */
(function (global, doc) {
  "use strict";

  function esc(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function toneCls(prefix, tone) {
    return tone ? prefix + "--tone-" + tone : "";
  }

  function levelCls(level) {
    if (level === 3) return " b100-msb-link--l3";
    if (level === 2) return " b100-msb-link--l2";
    return "";
  }

  function renderLink(item) {
    var cls =
      "b100-msb-link " +
      toneCls("b100-msb-link", item.tone) +
      levelCls(item.level || 2) +
      (item.enter ? " b100-msb-link--enter" : "");
    var lk =
      item.nav && typeof global.B100_navLinkAttrs === "function"
        ? global.B100_navLinkAttrs(item.nav)
        : { href: "#", onclick: "" };
    var onclick = lk.onclick ? ' onclick="' + esc(lk.onclick) + '"' : "";
    return (
      '<a href="' +
      esc(lk.href || "#") +
      '" class="' +
      cls +
      '"' +
      onclick +
      ">" +
      esc(item.label) +
      "</a>"
    );
  }

  function renderLeaf(item) {
    var lk =
      item.nav && typeof global.B100_navLinkAttrs === "function"
        ? global.B100_navLinkAttrs(item.nav)
        : { href: "#", onclick: "" };
    var onclick = lk.onclick ? ' onclick="' + esc(lk.onclick) + '"' : "";
    return (
      '<a href="' +
      esc(lk.href || "#") +
      '" class="b100-msb-leaf ' +
      toneCls("b100-msb-leaf", item.tone) +
      '"' +
      onclick +
      ">" +
      esc(item.label) +
      "</a>"
    );
  }

  function renderModule(mod) {
    var children = (mod.children || []).slice();
    if (mod.nav && children.length) {
      children.unshift({
        label: mod.enterLabel || "→ 进入主入口",
        tone: mod.tone,
        level: 2,
        enter: true,
        nav: mod.nav
      });
    }
    if (!children.length) {
      if (mod.nav) return renderLeaf(mod);
      return "";
    }
    var openAttr = mod.open === true ? " open" : "";
    var html =
      '<details class="b100-msb-mod b100-msb-mod--l1 ' +
      toneCls("b100-msb-mod", mod.tone) +
      '"' +
      openAttr +
      "><summary>" +
      esc(mod.label) +
      "</summary><div class=\"b100-msb-links\">";
    children.forEach(function (ch) {
      html += renderLink(ch);
    });
    html += "</div></details>";
    return html;
  }

  function renderSidebar(moduleId, host) {
    var meta = (global.B100_SIDEBAR_META || {})[moduleId] || {};
    var tree = (global.B100_SIDEBAR_TREES || {})[moduleId];
    if (!tree || !host) return;

    var html = '<div class="b100-msb-wrap">';
    html +=
      '<h3 class="b100-msb-head ' +
      toneCls("b100-msb-head", meta.tone) +
      '">' +
      esc(meta.title || moduleId) +
      "</h3>";
    if (meta.hint) {
      html += '<p class="b100-msb-hint">' + meta.hint + "</p>";
    }
    if (tree.home) {
      html += renderLeaf(tree.home);
    }
    (tree.modules || []).forEach(function (mod) {
      html += renderModule(mod);
    });
    if (tree.footer && tree.footer.length) {
      html += '<div class="b100-msb-foot">';
      tree.footer.forEach(function (item) {
        html += renderLink(item);
      });
      html += "</div>";
    }
    html += "</div>";
    host.innerHTML = html;
    if (moduleId === "site") wireSiteAccordion(host);
  }

  /** 全站 L0：一次只展開一個大模組 */
  function wireSiteAccordion(host) {
    var mods = host.querySelectorAll(".b100-msb-mod--l1");
    mods.forEach(function (det) {
      det.addEventListener("toggle", function () {
        if (!det.open) return;
        mods.forEach(function (other) {
          if (other !== det) other.open = false;
        });
      });
    });
  }

  function boot() {
    var moduleId = doc.body && doc.body.getAttribute("data-b100-sidebar");
    var host = doc.getElementById("b100-sidebar-root");
    if (moduleId && host) renderSidebar(moduleId, host);
  }

  global.B100ModuleSidebar = { render: renderSidebar };

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(typeof window !== "undefined" ? window : this, document);
