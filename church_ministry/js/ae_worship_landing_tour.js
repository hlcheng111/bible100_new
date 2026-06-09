/**
 * 敬拜花园 landing · 导游互动
 */
(function (win, doc) {
  "use strict";

  var GUIDE_SPEECH = {
    meili: "欢迎来园！我是美莉。你若只想知道「这周练什么歌、谱在哪」，跟我走<strong>同工服事径</strong>就好，不用碰报表。",
    yixuan: "我是园长以轩。主日策划、人力与礼仪要在同一张图上看见——请走<strong>部长总控径</strong>。",
    jiahe: "我是家禾。敬拜的灵魂在礼仪与圣言，不是器材清单。请先走<strong>圣言礼仪径</strong>。",
    xinyi: "我是欣怡。你若只是会众，这里不点名、不统计，只有<strong>会众筑坛径</strong>让你预备心灵。"
  };

  var ROUTE_SPEECH = {
    congregation: "这径适合每一位来崇拜的人：看主题、经文、诗歌，像领受周报，不是被建档。",
    volunteer: "诗班、乐手、招待同工：只看与你有关的排练与乐谱，温暖、防呆。",
    leader: "部长与牧者：主日策划五步、人力全景、探访守望，一屏决策。",
    liturgy: "讲台、礼仪、讲道笔记——让信息与敬拜在同一条故事线上。",
    priesthood: "敬拜团、诗班、器乐、诗歌库与影音，是祭司手中的兵器，要与主日歌单同频。",
    hospitality: "门厅与出席：微笑迎客，缺席则启动关怀，不是冷冰冰打卡。"
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/</g, "&lt;");
  }

  function cmPre() {
    return "../";
  }

  function renderStoryline(host) {
    var R = win.AeWorshipJourneyRegistry;
    if (!R) return;
    host.innerHTML = R.STORYLINE.map(function (s) {
      return (
        '<div class="story-stop"><strong>第' +
        esc(s.act) +
        "幕 " +
        esc(s.title) +
        "</strong>" +
        esc(s.hint) +
        "</div>"
      );
    }).join("");
  }

  function renderRoutes(host, filterGuideId) {
    var R = win.AeWorshipJourneyRegistry;
    if (!R) return;
    var pre = cmPre();
    host.innerHTML = R.ROUTES.filter(function (route) {
      return !filterGuideId || route.guideId === filterGuideId;
    })
      .map(function (route) {
        var guide = R.guideById(route.guideId);
        var stops =
          '<ul class="route-stops">' +
          route.stops
            .map(function (st) {
              return '<li>🌷 <a href="' + pre + st.path + '">' + esc(st.label) + "</a></li>";
            })
            .join("") +
          "</ul>";
        return (
          '<article class="route-card" id="route-' +
          route.id +
          '" data-route="' +
          route.id +
          '">' +
          "<h3>" +
          route.emoji +
          " " +
          esc(route.title) +
          "</h3>" +
          '<p class="route-blurb">' +
          esc(route.blurb) +
          "</p>" +
          (guide ? '<p class="route-blurb">导游：' + guide.emoji + " " + esc(guide.name) + "</p>" : "") +
          stops +
          '<a class="route-start" href="' +
          pre +
          route.start +
          '">从此径入园 →</a>' +
          "</article>"
        );
      })
      .join("");
  }

  function renderMap(host) {
    host.innerHTML =
      '<div class="park-map">' +
      "<p><strong>🗺️ 花园示意图</strong>（服事旅程，非行政菜单）</p>" +
      '<svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M20 60 Q100 20 200 60 T380 60" fill="none" stroke="#86efac" stroke-width="4"/>' +
      '<circle cx="40" cy="60" r="8" fill="#22c55e"/><text x="28" y="85" font-size="9" fill="#166534">筑坛</text>' +
      '<circle cx="120" cy="45" r="8" fill="#a78bfa"/><text x="100" y="30" font-size="9" fill="#5b21b6">同工</text>' +
      '<circle cx="200" cy="60" r="8" fill="#f59e0b"/><text x="185" y="85" font-size="9" fill="#92400e">部长</text>' +
      '<circle cx="280" cy="45" r="8" fill="#3b82f6"/><text x="265" y="30" font-size="9" fill="#1d4ed8">礼仪</text>' +
      '<circle cx="360" cy="60" r="8" fill="#ec4899"/><text x="345" y="85" font-size="9" fill="#9d174d">兵器</text>' +
      "</svg>" +
      "<p>沿小径赏花，需要时再「买花」带回你的服事（排练、乐谱、排班）。</p></div>";
  }

  function boot() {
    var R = win.AeWorshipJourneyRegistry;
    if (!R) return;
    var chips = doc.getElementById("guide-chips");
    var speech = doc.getElementById("guide-speech");
    var storyHost = doc.getElementById("story-rail");
    var routeHost = doc.getElementById("route-grid");
    var mapHost = doc.getElementById("park-map-host");
    var activeGuide = "meili";

    if (storyHost) renderStoryline(storyHost);
    if (mapHost) renderMap(mapHost);
    if (routeHost) renderRoutes(routeHost, null);

    if (chips) {
      chips.innerHTML = R.GUIDES.map(function (g) {
        return (
          '<button type="button" class="guide-chip' +
          (g.id === activeGuide ? " active" : "") +
          '" data-guide="' +
          g.id +
          '">' +
          g.emoji +
          " " +
          esc(g.name) +
          "</button>"
        );
      }).join("");
      chips.querySelectorAll(".guide-chip").forEach(function (btn) {
        btn.addEventListener("click", function () {
          activeGuide = btn.getAttribute("data-guide");
          chips.querySelectorAll(".guide-chip").forEach(function (b) {
            b.classList.toggle("active", b.getAttribute("data-guide") === activeGuide);
          });
          if (speech) {
            speech.innerHTML = GUIDE_SPEECH[activeGuide] || "";
          }
          if (routeHost) renderRoutes(routeHost, activeGuide);
        });
      });
    }
    if (speech) speech.innerHTML = GUIDE_SPEECH.meili || "";

    var hash = (win.location.hash || "").replace(/^#/, "");
    if (hash.indexOf("route-") === 0) {
      var el = doc.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window, document);
