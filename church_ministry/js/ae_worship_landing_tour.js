/**
 * 敬拜花園 landing · 導遊互動
 */
(function (win, doc) {
  "use strict";

  var GUIDE_SPEECH = {
    meili: "歡迎來園！我是美莉。你若只想知道「這周練什麼歌、譜在哪」，跟我走<strong>同工服事徑</strong>就好，不用碰報表。",
    yixuan: "我是園長以軒。主日策劃、人力與禮儀要在同一張圖上看見——請走<strong>部長總控徑</strong>。",
    jiahe: "我是家禾。敬拜的靈魂在禮儀與聖言，不是器材清單。請先走<strong>聖言禮儀徑</strong>。",
    xinyi: "我是欣怡。你若只是會眾，這裡不點名、不統計，只有<strong>會眾築壇徑</strong>讓你預備心靈。"
  };

  var ROUTE_SPEECH = {
    congregation: "這徑適合每一位來崇拜的人：看主題、經文、詩歌，像領受週報，不是被建檔。",
    volunteer: "詩班、樂手、招待同工：只看與你有關的排練與樂譜，溫暖、防呆。",
    leader: "部長與牧者：主日策劃五步、人力全景、探訪守望，一屏決策。",
    liturgy: "講台、禮儀、講道筆記——讓信息與敬拜在同一條故事線上。",
    priesthood: "敬拜團、詩班、器樂、詩歌庫與影音，是祭司手中的兵器，要與主日歌單同頻。",
    hospitality: "門廳與出席：微笑迎客，缺席則啟動關懷，不是冷冰冰打卡。"
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
          (guide ? '<p class="route-blurb">導遊：' + guide.emoji + " " + esc(guide.name) + "</p>" : "") +
          stops +
          '<a class="route-start" href="' +
          pre +
          route.start +
          '">從此徑入園 →</a>' +
          "</article>"
        );
      })
      .join("");
  }

  function renderMap(host) {
    host.innerHTML =
      '<div class="park-map">' +
      "<p><strong>🗺️ 花園示意圖</strong>（服事旅程，非行政菜單）</p>" +
      '<svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M20 60 Q100 20 200 60 T380 60" fill="none" stroke="#86efac" stroke-width="4"/>' +
      '<circle cx="40" cy="60" r="8" fill="#22c55e"/><text x="28" y="85" font-size="9" fill="#166534">築壇</text>' +
      '<circle cx="120" cy="45" r="8" fill="#a78bfa"/><text x="100" y="30" font-size="9" fill="#5b21b6">同工</text>' +
      '<circle cx="200" cy="60" r="8" fill="#f59e0b"/><text x="185" y="85" font-size="9" fill="#92400e">部長</text>' +
      '<circle cx="280" cy="45" r="8" fill="#3b82f6"/><text x="265" y="30" font-size="9" fill="#1d4ed8">禮儀</text>' +
      '<circle cx="360" cy="60" r="8" fill="#ec4899"/><text x="345" y="85" font-size="9" fill="#9d174d">兵器</text>' +
      "</svg>" +
      "<p>沿小徑賞花，需要時再「買花」帶回你的服事（排練、樂譜、排班）。</p></div>";
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
