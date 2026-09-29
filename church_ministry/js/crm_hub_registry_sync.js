/**
 * CRM Hub · 四主區塊與 registry 漸進合併（波 3）
 * - 媒合部門介紹鏈結對齊 A–E primary（crm_from=hub）
 * - 角色／頁籤切換後重刷 Hub 內鏈 query
 */
(function (win, doc) {
  "use strict";

  var DEPT_TO_ZONE = {
    worship: "a",
    pastoral: "b",
    kids: "c",
    outreach: "d",
    admin: "e"
  };

  function zonePrimaryHref(zoneId) {
    var reg = win.CrmJourneyRegistry;
    if (!reg || !reg.aeZones) return null;
    for (var i = 0; i < reg.aeZones.length; i++) {
      var z = reg.aeZones[i];
      if (z.id !== zoneId || !z.primary) continue;
      return reg.toolHref(z.primary.path, z.primary.role, z.primary.step, "hub");
    }
    return null;
  }

  function patchMatchmakerDeptLinks() {
    var brand = win.CrmJourneyBrand;
    if (!brand || !brand.MATCHMAKER_DATA) return;
    Object.keys(DEPT_TO_ZONE).forEach(function (deptKey) {
      var data = brand.MATCHMAKER_DATA[deptKey];
      var href = zonePrimaryHref(DEPT_TO_ZONE[deptKey]);
      if (data && href) data.deptPage = href;
    });
  }

  function enhanceIntroDeptTags() {
    var host = doc.querySelector(".crm-intro-dept-tags");
    if (!host || host.getAttribute("data-registry-sync")) return;
    host.setAttribute("data-registry-sync", "1");
    host.querySelectorAll(".crm-intro-dept-btn[data-dept]").forEach(function (btn) {
      var zoneId = DEPT_TO_ZONE[btn.getAttribute("data-dept") || ""];
      if (!zoneId) return;
      var href = zonePrimaryHref(zoneId);
      if (href) {
        btn.setAttribute("data-ae-primary", href);
        btn.setAttribute("title", (btn.textContent || "").trim() + " · Shift+右鍵可開主工作桌");
      }
    });
    host.addEventListener("contextmenu", function (e) {
      if (!e.shiftKey) return;
      var btn = e.target && e.target.closest ? e.target.closest(".crm-intro-dept-btn[data-ae-primary]") : null;
      if (!btn) return;
      e.preventDefault();
      var u = btn.getAttribute("data-ae-primary");
      var tgt =
        win.CrmJourneyBrand && typeof win.CrmJourneyBrand.linkTarget === "function"
          ? win.CrmJourneyBrand.linkTarget()
          : "_parent";
      if (u) win.open(u, tgt);
    });
  }

  function rebindHubLinks() {
    var brand = win.CrmJourneyBrand;
    var root = doc.querySelector(".crm-hub-v4");
    if (!brand || !root || typeof brand.refreshLinks !== "function") return;
    brand.refreshLinks(root);
  }

  function hookBrand() {
    var brand = win.CrmJourneyBrand;
    if (!brand || brand._registrySyncHooked) return;
    brand._registrySyncHooked = true;
    ["switchMasterTab", "selectRole", "filterMatch"].forEach(function (fn) {
      var orig = brand[fn];
      if (typeof orig !== "function") return;
      brand[fn] = function () {
        if (fn === "filterMatch") patchMatchmakerDeptLinks();
        var out = orig.apply(brand, arguments);
        setTimeout(rebindHubLinks, 0);
        return out;
      };
    });
  }

  function init() {
    patchMatchmakerDeptLinks();
    enhanceIntroDeptTags();
    hookBrand();
    rebindHubLinks();
  }

  win.CrmHubRegistrySync = { init: init, rebindHubLinks: rebindHubLinks };

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window, document);
