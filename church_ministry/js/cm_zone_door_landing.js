/**
 * CM · 區級 landing 扇門渲染（讀 CmZoneDoorSsot）
 */
(function (global, doc) {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function resolveHref(href) {
    href = String(href || "#");
    if (/^https?:|^\/|^#/.test(href)) return href;
    if (href.indexOf("../") === 0 || href.indexOf("./") === 0) return href;
    return "../" + href.replace(/^\//, "");
  }

  function mount(opts) {
    opts = opts || {};
    var zoneId =
      opts.zoneId ||
      (doc.body && doc.body.getAttribute("data-b100-landing-zone")) ||
      "";
    zoneId = String(zoneId).toLowerCase();
    var S = global.CmZoneDoorSsot;
    var z = (S && S.zone(zoneId)) || opts.fallback || null;
    if (!z) return false;

    var h1 = doc.getElementById("cm-zd-title");
    var lead = doc.getElementById("cm-zd-lead");
    var host = doc.getElementById("cm-zd-doors");
    var enLine = doc.getElementById("cm-zd-en");
    if (h1) h1.textContent = z.labelZh;
    if (enLine) enLine.textContent = z.labelEn;
    if (lead) lead.textContent = z.labelEn + " · " + z.lead;
    if (doc.title && z.labelZh) {
      try {
        doc.title = z.labelZh + " · " + z.labelEn;
      } catch (eT) {}
    }
    if (!host) return true;

    host.innerHTML = (z.doors || [])
      .map(function (d) {
        var href = resolveHref(d.href);
        return (
          '<a class="cm-zd-door" href="' +
          esc(href) +
          '" data-b100-nav="content">' +
          "<strong>" +
          esc(d.label) +
          '</strong><span class="en">' +
          esc(d.en) +
          '</span><p class="blurb">' +
          esc(d.blurb) +
          "</p></a>"
        );
      })
      .join("");
    return true;
  }

  function boot() {
    mount({});
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  global.CmZoneDoorLanding = { mount: mount, boot: boot };
})(typeof window !== "undefined" ? window : this, document);
