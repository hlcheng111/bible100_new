/**
 * B100 Sidebar Kit · 通用渲染器（读 SSOT · 输出统一 HTML）
 * 契约：docs/governance/SIDEBAR_IA_CONTRACT_V1.md
 */
(function (global) {
  "use strict";

  var KIT_BUILD = "20260811e";

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function splitHash(url) {
    url = String(url || "");
    var hi = url.indexOf("#");
    if (hi < 0) return { base: url, hash: "" };
    return { base: url.slice(0, hi), hash: url.slice(hi) };
  }

  function appendQuery(url, key, value) {
    if (!key || value == null || value === "") return url;
    if (new RegExp("[?&]" + key + "=").test(url)) return url;
    var parts = splitHash(url);
    var base = parts.base;
    base += (base.indexOf("?") >= 0 ? "&" : "?") + encodeURIComponent(key) + "=" + encodeURIComponent(String(value));
    return base + parts.hash;
  }

  function badgeHtml(item) {
    if (!item) return "";
    if (item.maturity === "wip") {
      return '<span class="sb-kit-wip sb-g-wip">開發中</span>';
    }
    if (item.maturity === "demo") {
      return '<span class="sb-kit-demo">(DEMO)</span>';
    }
    return "";
  }

  function sublineHtml(item) {
    if (!item || !item.en) return "";
    return '<small class="sb-kit-en sb-g-en">' + esc(item.en) + badgeHtml(item) + "</small>";
  }

  function i18nAttrs(item) {
    if (!item || !item.i18nKey) return "";
    return ' data-i18n="' + esc(item.i18nKey) + '" data-i18n-bridge="1"';
  }

  function renderItem(item, opts) {
    if (!item) return "";
    opts = opts || {};
    var href = item.href || "#";
    var cls =
      "sb-kit-item" +
      (opts.sub ? " sb-kit-item--sub" : "") +
      (opts.nested ? " sb-kit-item--nested" : "") +
      (item.primary ? " sb-kit-item--primary" : "") +
      (item.landing ? " sb-kit-item--landing" : "") +
      (item.extraClass ? " " + item.extraClass : "");
    var attrs = "";
    if (item.nav === "module" && item.moduleSidebar && item.moduleContent) {
      attrs +=
        ' data-b100-nav="module" data-b100-sidebar="' +
        esc(item.moduleSidebar) +
        '" data-b100-content="' +
        esc(item.moduleContent) +
        '"';
    } else {
      attrs += ' data-b100-nav="content" target="contentFrame"';
    }
    if (item.dataAttrs) attrs += " " + item.dataAttrs;
    return (
      '<a href="' +
      esc(href) +
      '" class="' +
      cls.trim() +
      '"' +
      attrs +
      i18nAttrs(item) +
      ' title="' +
      esc(item.en || item.label) +
      '"><strong>' +
      esc(item.label) +
      "</strong>" +
      sublineHtml(item) +
      "</a>"
    );
  }

  function renderCategoryItem(it, opts) {
    if (!it) return "";
    opts = opts || {};
    if (it.children && it.children.length) {
      var n = it.children.length;
      var subHtml = it.children
        .map(function (c) {
          return renderItem(c, { sub: true, nested: true });
        })
        .join("");
      var parentHref = it.href && it.href !== "#" ? it.href : "";
      var headLink = parentHref
        ? '<a class="sb-kit-nest-parent" href="' +
          esc(parentHref) +
          '" data-b100-nav="content" target="contentFrame"' +
          i18nAttrs(it) +
          "><strong>" +
          esc(it.label) +
          "</strong>" +
          sublineHtml(it) +
          "</a>"
        : "<strong>" + esc(it.label) + "</strong>" + sublineHtml(it);
      return (
        '<details class="sb-kit-cat sb-kit-cat--nested">' +
        '<summary class="sb-kit-cat__summary sb-kit-cat__summary--nested">' +
        headLink +
        '<small class="sb-kit-en sb-kit-count"> · ' +
        n +
        " 项</small>" +
        '<span class="sb-kit-cat__arrow" aria-hidden="true">▶</span>' +
        "</summary>" +
        subHtml +
        "</details>"
      );
    }
    return renderItem(it, { sub: true });
  }

  function renderCategory(cat, opts) {
    if (!cat || !cat.items || !cat.items.length) return "";
    opts = opts || {};
    var n = cat.items.length;
    var openAttr = cat.open ? " open" : "";
    var num = cat.num ? '<span class="sb-kit-cat__num">' + esc(cat.num) + "</span>" : "";
    var count = cat.hideCount ? "" : '<small class="sb-kit-en sb-kit-count"> · ' + n + " 项</small>";
    var itemsHtml = cat.items
      .map(function (it) {
        return renderCategoryItem(it, opts);
      })
      .join("");
    var catAttrs = cat.dataAttrs ? " " + cat.dataAttrs : "";
    return (
      '<details class="sb-kit-cat' +
      (cat.extraClass ? " " + cat.extraClass : "") +
      '"' +
      openAttr +
      catAttrs +
      ">" +
      '<summary class="sb-kit-cat__summary">' +
      num +
      '<span class="sb-kit-cat__label"><strong>' +
      esc(cat.summary || cat.label) +
      "</strong>" +
      (cat.en ? '<small class="sb-kit-en">' + esc(cat.en) + count + "</small>" : count) +
      '</span><span class="sb-kit-cat__arrow" aria-hidden="true">▶</span>' +
      "</summary>" +
      itemsHtml +
      "</details>"
    );
  }

  function renderZone(zone, opts) {
    if (!zone) return "";
    opts = opts || {};
    var theme = zone.theme || "cm-zone";
    var headI18n = zone.i18nKey ? i18nAttrs(zone) : "";
    var headEn = zone.en
      ? '<small class="sb-kit-en">' + esc(zone.en) + "</small>"
      : "";
    var headInner = esc(zone.label) + headEn;
    var headHtml;
    if (zone.focusZone && !opts.activeFocus) {
      var focusId = zone.focusZone;
      var focusHref =
        "sidebar_church_layout_v1.html?focus=" + encodeURIComponent(focusId);
      headHtml =
        '<a class="sb-kit-zone__head sb-kit-zone__head--link" href="' +
        esc(focusHref) +
        '" target="_self" data-cm-focus-switch="' +
        esc(focusId) +
        '"' +
        headI18n +
        ' title="' +
        esc(zone.en || zone.label) +
        '">' +
        headInner +
        '<span class="sb-kit-zone__rail-arrow" aria-hidden="true">▶</span></a>';
    } else if (zone.headHref) {
      headHtml =
        '<a class="sb-kit-zone__head sb-kit-zone__head--link" href="' +
        esc(zone.headHref) +
        '" data-b100-nav="content" target="contentFrame"' +
        headI18n +
        ' title="' +
        esc(zone.en || zone.label) +
        '">' +
        headInner +
        "</a>";
    } else {
      headHtml = '<div class="sb-kit-zone__head"' + headI18n + ">" + headInner + "</div>";
    }
    var primaryHtml = (zone.primary || [])
      .map(function (it) {
        return renderItem(it);
      })
      .join("");
    var catHtml = (zone.categories || [])
      .map(function (c) {
        return renderCategory(c, opts);
      })
      .join("");
    var focus = zone.focusZone ? ' data-focus-zone="' + esc(zone.focusZone) + '"' : "";
    var group = zone.sbGroup ? ' data-sb-group="' + esc(zone.sbGroup) + '"' : "";
    var activeCls = opts.activeFocus ? " sb-kit-zone--focus-active" : "";
    return (
      '<div class="sb-kit-zone sb-kit-zone--' +
      esc(theme) +
      activeCls +
      '"' +
      focus +
      group +
      ' data-sb-zone="' +
      esc(zone.id) +
      '">' +
      headHtml +
      '<div class="sb-kit-zone__body">' +
      primaryHtml +
      catHtml +
      "</div></div>"
    );
  }

  /** focus 模式：非当前区仅层1 一行可点（切 focus 只换左栏，右栏进 landing） */
  function renderZoneRail(zone, opts) {
    if (!zone) return "";
    opts = opts || {};
    var focusId = zone.id || zone.focusZone || "";
    var href =
      "sidebar_church_layout_v1.html?focus=" + encodeURIComponent(focusId);
    var headI18n = zone.i18nKey ? i18nAttrs(zone) : "";
    var headEn = zone.en ? '<small class="sb-kit-en">' + esc(zone.en) + "</small>" : "";
    return (
      '<div class="sb-kit-zone sb-kit-zone--rail" data-sb-zone="' +
      esc(zone.id) +
      '">' +
      '<a class="sb-kit-zone__head sb-kit-zone__head--link" href="' +
      esc(href) +
      '" target="_self" data-cm-focus-switch="' +
      esc(focusId) +
      '"' +
      headI18n +
      ' title="' +
      esc(zone.en || zone.label) +
      '">' +
      esc(zone.label) +
      headEn +
      '<span class="sb-kit-zone__rail-arrow" aria-hidden="true">▶</span>' +
      "</a></div>"
    );
  }

  global.B100SidebarRender = {
    KIT_BUILD: KIT_BUILD,
    esc: esc,
    splitHash: splitHash,
    appendQuery: appendQuery,
    sublineHtml: sublineHtml,
    badgeHtml: badgeHtml,
    renderItem: renderItem,
    renderCategory: renderCategory,
    renderZone: renderZone,
    renderZoneRail: renderZoneRail
  };
})(typeof window !== "undefined" ? window : this);
