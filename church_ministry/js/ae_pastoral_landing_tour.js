/**
 * B 牧养 · 牧羊导览 landing 互动
 */
(function (win, doc) {
  "use strict";

  var COMPANION_SPEECH = {
    han: "我是瀚声。牧养不是追数字，是<strong>数算羊群</strong>（箴 27:23）。请走<strong>牧者守望</strong>，先看本周谁被遗漏。",
    lin: "我是林心。组长不必写长篇报告——记一件<strong>微小胜利</strong>就好；系统只帮你整理草稿。",
    an: "我是安慈。新朋友、病患、久没来的人——<strong>关怀之路</strong>帮你列清单，探访仍由人决定。",
    xin: "我是信实。你若只是来聚会，走<strong>被牧养之路</strong>；这里不逼你填行政表。"
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/</g, "&lt;");
  }

  function cmPre() {
    return "../";
  }

  function href(path) {
    path = String(path || "");
    if (path.indexOf("http") === 0) return path;
    if (path.indexOf("../../") === 0) return path;
    if (path.indexOf("../") === 0) return cmPre() + path.slice(3);
    return cmPre() + path;
  }

  function renderMirrors(host) {
    var R = win.AePastoralJourneyRegistry;
    if (!R || !host) return;
    host.innerHTML = R.MIRRORS.map(function (m) {
      var tools = m.tools
        .map(function (t) {
          return '<li><a href="' + href(t.path) + '">' + esc(t.label) + "</a></li>";
        })
        .join("");
      return (
        '<article class="mirror-card">' +
        "<h3>" +
        m.emoji +
        " " +
        esc(m.title) +
        "</h3>" +
        "<p><em>" +
        esc(m.churchAsk) +
        "</em></p>" +
        "<p>" +
        esc(m.blurb) +
        "</p>" +
        "<ul>" +
        tools +
        "</ul></article>"
      );
    }).join("");
  }

  function renderQuestions(host) {
    var R = win.AePastoralJourneyRegistry;
    if (!R || !host) return;
    host.innerHTML = R.SIX_QUESTIONS.map(function (q) {
      return (
        '<div class="question-stop"><strong>' +
        esc(q.title) +
        "</strong>" +
        esc(q.hint) +
        "</div>"
      );
    }).join("");
  }

  function renderRoutes(host, filterCompanionId) {
    var R = win.AePastoralJourneyRegistry;
    if (!R || !host) return;
    host.innerHTML = R.ROUTES.filter(function (route) {
      return !filterCompanionId || route.companionId === filterCompanionId;
    })
      .map(function (route) {
        var badge =
          route.status === "live"
            ? ""
            : '<span class="route-badge">逐步开放</span>';
        var stops =
          '<ul class="route-stops">' +
          route.stops
            .map(function (st) {
              var u = href(st.path) + (st.hash ? "#" + st.hash : "");
              return '<li>🌿 <a href="' + u + '">' + esc(st.label) + "</a></li>";
            })
            .join("") +
          "</ul>";
        return (
          '<article class="route-card" id="route-' +
          route.id +
          '">' +
          "<h3>" +
          route.emoji +
          " " +
          esc(route.title) +
          badge +
          "</h3>" +
          '<p class="route-blurb">' +
          esc(route.blurb) +
          "</p>" +
          stops +
          '<a class="route-start" href="' +
          href(route.start) +
          '">从此路开始 →</a>' +
          "</article>"
        );
      })
      .join("");
  }

  function renderCompanions(host, onPick) {
    var R = win.AePastoralJourneyRegistry;
    if (!R || !host) return;
    host.innerHTML = R.COMPANIONS.map(function (c) {
      return (
        '<button type="button" class="companion-chip" data-id="' +
        c.id +
        '">' +
        c.emoji +
        " " +
        esc(c.name) +
        "</button>"
      );
    }).join("");
    host.querySelectorAll(".companion-chip").forEach(function (btn) {
      btn.addEventListener("click", function () {
        host.querySelectorAll(".companion-chip").forEach(function (b) {
          b.classList.remove("active");
        });
        btn.classList.add("active");
        onPick(btn.getAttribute("data-id"));
      });
    });
    var first = host.querySelector(".companion-chip");
    if (first) first.click();
  }

  function boot() {
    var mirrors = doc.getElementById("mirror-grid");
    var questions = doc.getElementById("question-rail");
    var chips = doc.getElementById("companion-chips");
    var speech = doc.getElementById("companion-speech");
    var routes = doc.getElementById("route-grid");
    renderMirrors(mirrors);
    renderQuestions(questions);
    if (chips && speech && routes) {
      renderCompanions(chips, function (id) {
        speech.innerHTML = COMPANION_SPEECH[id] || "";
        renderRoutes(routes, id);
      });
      renderRoutes(routes, null);
    }
    var hash = (win.location.hash || "").replace(/^#/, "");
    if (hash && hash.indexOf("route-") === 0) {
      var el = doc.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    bindShellContentLinks();
  }

  function bindShellContentLinks() {
    if (!win.parent || win.parent === win || typeof win.bible100OpenContent !== "function") return;
    doc.addEventListener(
      "click",
      function (ev) {
        var a = ev.target.closest("a[href]");
        if (!a || a.getAttribute("data-shell-skip")) return;
        var raw = a.getAttribute("href");
        if (!raw || raw.charAt(0) === "#" || /^(https?:|mailto:|tel:|javascript:)/i.test(raw)) return;
        try {
          var abs = new URL(raw, win.location.href);
          var p = abs.pathname.replace(/\/+/g, "/");
          var i = p.indexOf("/church_ministry/");
          if (i < 0) return;
          ev.preventDefault();
          win.bible100OpenContent(ev, p.slice(i + 1) + abs.search + abs.hash);
        } catch (eLink) {}
      },
      true
    );
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window, document);
