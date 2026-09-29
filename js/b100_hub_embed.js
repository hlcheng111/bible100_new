/**
 * B100 · Hub 内嵌检测 + 内容页 Chrome 三档
 * 契约：docs/governance/B100_CONTENT_CHROME_V1.md
 */
(function (global, doc) {
  "use strict";

  var EMBED_BUILD = "20260812clean";

  function quietLandingDom() {
    if (!doc.body) return;
    doc.querySelectorAll(".b100-kicker").forEach(function (el) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
    ["b100-warm-banner", "b100-capability-badge"].forEach(function (id) {
      var node = doc.getElementById(id);
      if (node && node.parentNode) node.parentNode.removeChild(node);
    });
    var top = doc.getElementById("b100-landing-shell-top");
    if (top) top.innerHTML = "";
    doc.body.classList.add("b100-hub-landing-quiet");
  }

  function inHubContentFrame() {
    try {
      if (!global.parent || global.parent === global) return false;
      var fe = global.frameElement;
      if (fe) {
        var id = fe.id || "";
        var name = fe.getAttribute("name") || "";
        if (id === "contentFrame" || name === "contentFrame") return true;
      }
      /* file:// 下 frameElement 常為 null；改比對 parent 的 contentFrame.contentWindow */
      var pd = global.parent.document;
      if (pd) {
        var cf = pd.getElementById("contentFrame");
        if (cf && cf.contentWindow === global) return true;
      }
    } catch (e) { /* cross-origin */ }
    return false;
  }

  function inModuleShell() {
    try {
      if (!global.parent || global.parent === global) return false;
      var pd = global.parent.document;
      if (pd.getElementById("contentFrame") && pd.getElementById("sidebarFrame")) {
        return inHubContentFrame();
      }
    } catch (e2) { /* ignore */ }
    return false;
  }

  function bodyChromeAttr() {
    var body = doc.body;
    if (!body) return "";
    return body.getAttribute("data-b100-chrome") || body.getAttribute("data-b100-ae-chrome") || "";
  }

  function resolveChromeMode() {
    var explicit = bodyChromeAttr();
    if (explicit === "full" || explicit === "minimal" || explicit === "hub-hidden") {
      return explicit;
    }
    if (explicit === "off") return "hub-hidden";
    if (inModuleShell()) return "hub-hidden";
    if (inHubContentFrame()) return "hub-hidden";
    return explicit === "minimal" ? "minimal" : "minimal";
  }

  function shouldHideChrome() {
    return resolveChromeMode() === "hub-hidden";
  }

  function injectEmbedStyles() {
    if (doc.getElementById("b100-hub-embed-style")) return;
    var st = doc.createElement("style");
    st.id = "b100-hub-embed-style";
    st.textContent =
      "body.b100-hub-embedded #ae-primary-nav-strip," +
      "body.b100-hub-embedded .ae-primary-nav-strip," +
      "body.b100-hub-embedded .crm-ctx-bar," +
      "body.b100-hub-embedded nav.top-nav," +
      "body.b100-hub-embedded .top-nav," +
      "body.b100-hub-embedded nav.anchor-nav," +
      "body.b100-hub-embedded .anchor-nav," +
      "body.b100-hub-embedded .land-lang-row," +
      "body.b100-hub-embedded #b100-zone-rail-top + .land-lang-row," +
      "body.b100-hub-embedded .cm-land-addr," +
      "body.b100-hub-embedded #b100-landing-shell-top," +
      "body.b100-hub-embedded .b100-kicker," +
      "body.b100-hub-embedded .cm-land-head," +
      "body.b100-hub-embedded #b100-warm-banner," +
      "body.b100-hub-embedded #b100-capability-badge" +
      "{display:none!important;}" +
      "body.b100-hub-embedded{padding-top:0!important;}" +
      "body.b100-hub-embedded .container{max-width:none;}" +
      "@media print{body.b100-hub-embedded #ae-primary-nav-strip," +
      "body.b100-hub-embedded .crm-ctx-bar{display:none!important;}}";
    (doc.head || doc.documentElement).appendChild(st);
  }

  function apply() {
    if (!doc.body) return resolveChromeMode();
    var mode = resolveChromeMode();
    if (mode === "hub-hidden") {
      doc.body.classList.add("b100-hub-embedded");
      doc.body.setAttribute("data-b100-chrome-resolved", "hub-hidden");
      injectEmbedStyles();
      quietLandingDom();
    } else {
      doc.body.classList.remove("b100-hub-embedded");
      doc.body.setAttribute("data-b100-chrome-resolved", mode);
    }
    return mode;
  }

  function boot() {
    if (doc.body) apply();
    else doc.addEventListener("DOMContentLoaded", apply);
  }

  boot();

  global.B100HubEmbed = {
    EMBED_BUILD: EMBED_BUILD,
    inHubContentFrame: inHubContentFrame,
    inModuleShell: inModuleShell,
    resolveChromeMode: resolveChromeMode,
    shouldHideChrome: shouldHideChrome,
    quietLandingDom: quietLandingDom,
    apply: apply
  };
})(typeof window !== "undefined" ? window : this, document);
