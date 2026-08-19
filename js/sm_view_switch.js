/**
 * 智慧事奉視角：會友 / 牧者（本機切換，非登入 RBAC）
 * localStorage b100_sm_view = member | leader
 */
(function (g) {
  "use strict";

  var KEY = "b100_sm_view";

  function readView() {
    try {
      var q = new URLSearchParams(g.location.search || "");
      var v = q.get("view") || q.get("sm_view");
      if (v === "member" || v === "leader") return v;
    } catch (e) {}
    try {
      var s = g.localStorage.getItem(KEY);
      if (s === "member" || s === "leader") return s;
    } catch (e2) {}
    return "member";
  }

  var bc = null;
  try {
    if (typeof BroadcastChannel !== "undefined") bc = new BroadcastChannel("b100_sm_view");
  } catch (e0) {}

  function writeView(view, skipStore) {
    if (view !== "member" && view !== "leader") view = "member";
    if (!skipStore) {
      try {
        g.localStorage.setItem(KEY, view);
      } catch (e) {}
    }
    try {
      if (bc) bc.postMessage({ view: view });
    } catch (e1) {}
    try {
      g.postMessage({ type: "b100-sm-view", view: view }, "*");
      if (g.parent && g.parent !== g) {
        g.parent.postMessage({ type: "b100-sm-view", view: view }, "*");
      }
    } catch (e2) {}
    return view;
  }

  function apply(root) {
    var view = readView();
    var el = root || (g.document && g.document.body);
    if (!el) return view;
    el.classList.remove("sm-view-member", "sm-view-leader");
    el.classList.add(view === "leader" ? "sm-view-leader" : "sm-view-member");
    el.setAttribute("data-sm-view", view);
    var btns = el.querySelectorAll("[data-sm-set-view]");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var on = b.getAttribute("data-sm-set-view") === view;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    }
    return view;
  }

  function bind(root) {
    var el = root || (g.document && g.document.body);
    if (!el || el.getAttribute("data-sm-view-bound")) return;
    el.setAttribute("data-sm-view-bound", "1");
    el.addEventListener("click", function (ev) {
      var btn = ev.target.closest && ev.target.closest("[data-sm-set-view]");
      if (!btn) return;
      writeView(btn.getAttribute("data-sm-set-view"));
      apply(el);
      if (btn.tagName === "BUTTON") ev.preventDefault();
    });
    if (bc) {
      bc.onmessage = function (ev) {
        var d = ev.data || {};
        if (d.view === "member" || d.view === "leader") apply(el);
      };
    }
    g.addEventListener("message", function (ev) {
      var d = ev.data;
      if (!d || d.type !== "b100-sm-view") return;
      if (d.view === "member" || d.view === "leader") {
        try {
          g.localStorage.setItem(KEY, d.view);
        } catch (e) {}
        apply(el);
      }
    });
    apply(el);
  }

  g.B100SmView = { KEY: KEY, readView: readView, writeView: writeView, apply: apply, bind: bind };

  if (g.document) {
    if (g.document.readyState === "loading") {
      g.document.addEventListener("DOMContentLoaded", function () {
        bind();
      });
    } else bind();
  }
})(typeof window !== "undefined" ? window : this);
