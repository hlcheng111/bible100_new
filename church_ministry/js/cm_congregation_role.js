/**
 * Church Center · 會眾 vs 同工角色分流（W6）
 * 預設 role=member（QR／公開連結）；role=leader 才顯示行政報表。
 */
(function (w) {
  "use strict";

  function parseRole() {
    try {
      var sp = new URLSearchParams(w.location.search || "");
      var role = String(sp.get("role") || "member").toLowerCase();
      if (role !== "leader" && role !== "member") role = "member";
      return {
        role: role,
        isMember: role === "member",
        isLeader: role === "leader",
      };
    } catch (e) {
      return { role: "member", isMember: true, isLeader: false };
    }
  }

  function applyBodyClass(ctx) {
    ctx = ctx || parseRole();
    if (w.document && w.document.body) {
      w.document.body.classList.toggle("cc-role-member", ctx.isMember);
      w.document.body.classList.toggle("cc-role-leader", ctx.isLeader);
      w.document.body.setAttribute("data-cc-role", ctx.role);
    }
  }

  w.CmCongregationRole = {
    parse: parseRole,
    applyBodyClass: applyBodyClass,
  };

  if (w.document && w.document.body) applyBodyClass();
  else if (w.document) {
    w.document.addEventListener("DOMContentLoaded", function () {
      applyBodyClass();
    });
  }
})(typeof window !== "undefined" ? window : this);
