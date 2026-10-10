/**
 * 樂以載道左欄。frame：給模組殼的側欄頁。inline：畫在同一頁，不再多一個框。
 */
(function (global) {
  "use strict";

  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }

  function rewrite(href, root, keepFlag) {
    var hash = "";
    var query = "";
    var path = String(href || "");
    var hi = path.indexOf("#");
    if (hi >= 0) {
      hash = path.slice(hi);
      path = path.slice(0, hi);
    }
    var qi = path.indexOf("?");
    if (qi >= 0) {
      query = path.slice(qi);
      path = path.slice(0, qi);
    }
    var prefix = "practical_hymnology/";
    if (path.indexOf(prefix) === 0) {
      path = (root || "") + path.slice(prefix.length);
    } else if (path.indexOf("../") === 0) {
      path = (root ? "../../../" : "../../") + path.replace(/^\.\.\//, "");
    } else {
      path = (root ? root + "../" : "../") + path;
    }
    if (keepFlag && query.indexOf("embed_side=1") < 0) {
      query += (query ? "&" : "?") + "embed_side=1";
    }
    return path + query + hash;
  }

  function mount(el, opts) {
    if (!el || el.getAttribute("data-ph-side") === "1") return;
    el.setAttribute("data-ph-side", "1");
    opts = opts || {};
    var inline = opts.place === "inline";
    var root = opts.root || "";
    var keepFlag = !!opts.keepFlag;

    function hrefOf(href) {
      return inline ? rewrite(href, root, keepFlag) : href;
    }
    function link(href, label, extra) {
      return "<a data-b100-nav='content' href='" + esc(hrefOf(href)) + "'" + (extra || "") + ">" + esc(label) + "</a>";
    }

    el.innerHTML =
      "<div class='brand'><strong>樂以載道</strong><span>Practical Hymnology · HY</span></div>" +
      "<div class='search'><input id='ph-q' type='search' placeholder='找聖詩：歌名或編號' autocomplete='off' />" +
      "<div class='scopes' id='ph-scopes'>" +
      "<button type='button' data-scope='all' class='on'>全部</button>" +
      "<button type='button' data-scope='hymns'>聖詩</button>" +
      "<button type='button' data-scope='samples'>分析範例</button>" +
      "<button type='button' data-scope='disciplines'>學科</button>" +
      "<a class='scope-go' data-b100-nav='content' href='" + esc(hrefOf("hymn_catalog_sort.html#author")) + "'>作者 · 曲庫篩</a>" +
      "<button type='button' disabled>曲調 · 以後</button>" +
      "<button type='button' disabled>聖詩集 · 以後</button>" +
      "<button type='button' disabled>聖經 · 以後</button>" +
      "<button type='button' disabled>主題 · 以後</button>" +
      "</div></div>" +
      "<div class='sec' id='ph-results'><p class='hint'>這裡只搜站內曲庫（約兩千首）。結果留在這一欄，一次最多 12 筆。外站詩集不在這裡。</p><div id='ph-hits'></div></div>" +
      "<div class='sec' id='ph-tree'><h3>你今天想做什麼？</h3><p class='hint'>先選事，再展開到這一頁。</p></div>" +
      "<div class='sec'><a href='" + esc(hrefOf("../church_ministry/modules/worship/worship-sunday-desk.html")) + "' data-b100-nav='module' data-b100-sidebar='church_ministry/sidebar_church_layout_v1.html?focus=a' data-b100-content='church_ministry/modules/worship/worship-sunday-desk.html'>教會事工 · A 敬拜台</a></div>";

    var scope = "all";
    var qEl = el.querySelector("#ph-q");
    var hits = el.querySelector("#ph-hits");
    var confirmedMap = null;

    function listenBits(hymnId) {
      var rows = (confirmedMap && confirmedMap[String(hymnId)]) || [];
      if (!rows.length) return "";
      var t0 = rows[0];
      var url = (global.YtSacredStore && YtSacredStore.watchUrl)
        ? YtSacredStore.watchUrl(t0.videoId, t0.seconds)
        : "";
      if (!url) return "";
      return "<small style='color:#166534;font-weight:700'>也可聽 · <a href='" + esc(url) + "' target='_blank' rel='noopener noreferrer' style='display:inline;width:auto;padding:0 4px'>" +
        esc(rows.length > 1 ? (rows.length + " 處") : (t0.time || "聽")) + "</a></small>";
    }

    function paint(q) {
      var S = global.PhSearch;
      if (!S) { hits.innerHTML = "<p class='empty'>索引未載入</p>"; return; }
      if (!q) {
        hits.innerHTML = "<p class='empty'>可搜站內約兩千首曲名、已有分析、111 學科。已確認影音會顯示「也可聽」。</p>";
        return;
      }
      var r = S.search(q, scope);
      var html = "";
      function block(title, rows, draw) {
        html += "<div class='group'>" + title + " · " + rows.length + "</div>";
        if (!rows.length) html += "<p class='empty'>沒有</p>";
        else rows.forEach(function (row) { html += draw(row); });
      }
      if (scope === "all" || scope === "hymns") {
        block("聖詩", r.hymns, function (h) {
          var href = hrefOf(S.hymnUrl(h.path) || "hymn_catalog_sort.html");
          return "<a class='hit' data-b100-nav='content' href='" + href + "'><strong>" + esc(h.zh || h.en || h.id) + "</strong><small>" + esc(h.en || h.num || h.id) + "</small>" + listenBits(h.id) + "</a>";
        });
        if (r.moreHymns) {
          html += "<a class='hit' data-b100-nav='content' href='" + esc(hrefOf("hymn_catalog_sort.html?q=" + encodeURIComponent(q))) + "'><strong>還有很多</strong><small>打開全部聖詩</small></a>";
        }
      }
      if (scope === "all" || scope === "samples") {
        block("分析範例", r.samples, function (s) {
          return "<a class='hit' data-b100-nav='content' href='" + esc(hrefOf("practical_hymnology/analyze.html?id=" + encodeURIComponent(s.id))) + "'><strong>" + esc(s.zh) + "</strong><small>已有分析稿</small>" + listenBits(s.id) + "</a>";
        });
      }
      if (scope === "all" || scope === "disciplines") {
        block("學科", r.disciplines, function (d) {
          return "<a class='hit' data-b100-nav='content' href='" + esc(hrefOf("practical_hymnology/" + d.filepath)) + "'><strong>" + esc(d.code + " " + d.title_zh) + "</strong><small>" + esc(d.lens) + "</small></a>";
        });
      }
      var none = !r.hymns.length && !r.samples.length && !r.disciplines.length;
      if (none || scope === "all") {
        html += "<a class='hit' data-b100-nav='content' href='" + esc(hrefOf("practical_hymnology/analyze.html?q=" + encodeURIComponent(q))) + "'><strong>用「" + esc(q) + "」做分析草稿</strong><small>複製一段話去問外面的 AI</small></a>";
      }
      hits.innerHTML = html;
    }

    function render(q) {
      if (confirmedMap || !global.YtSacredStore || !YtSacredStore.loadConfirmedIndex) {
        if (!confirmedMap) confirmedMap = {};
        paint(q);
        return;
      }
      YtSacredStore.loadConfirmedIndex().then(function (map) {
        confirmedMap = map || {};
        paint(q);
      }).catch(function () {
        confirmedMap = {};
        paint(q);
      });
    }

    qEl.addEventListener("input", function () { render(qEl.value.trim()); });
    el.querySelector("#ph-scopes").addEventListener("click", function (e) {
      var b = e.target.closest("[data-scope]");
      if (!b) return;
      scope = b.getAttribute("data-scope");
      Array.prototype.forEach.call(el.querySelectorAll("#ph-scopes button"), function (x) {
        x.classList.toggle("on", x === b);
      });
      render(qEl.value.trim());
    });
    if (inline) {
      el.addEventListener("click", function (e) {
        var a = e.target.closest("a[data-b100-nav='module']");
        if (!a || !global.bible100ShellNav) return;
        e.preventDefault();
        global.bible100ShellNav(e, {
          sidebarUrl: a.getAttribute("data-b100-sidebar"),
          contentUrl: a.getAttribute("data-b100-content")
        });
      });
    }
    if (!inline) {
      global.addEventListener("message", function (ev) {
        var d = ev.data;
        if (!d || d.type !== "ph-search") return;
        if (d.scope) {
          scope = d.scope;
          Array.prototype.forEach.call(el.querySelectorAll("#ph-scopes button"), function (x) {
            x.classList.toggle("on", x.getAttribute("data-scope") === scope);
          });
        }
        qEl.value = d.q || "";
        render(qEl.value.trim());
      });
    }
    render("");

    var GATES = [
      { id: "intro", label: "導論", en: "Introduction" },
      { id: "A", label: "音樂", en: "Music" },
      { id: "B", label: "文字", en: "Text & Poetry" },
      { id: "C", label: "信仰", en: "Faith & Theology" },
      { id: "D", label: "教會", en: "Church & Worship" },
      { id: "E", label: "人生", en: "Life" },
      { id: "F", label: "綜合", en: "Integration" }
    ];
    function lensName(lens) {
      return String(lens || "").replace(/^\d+\.\s*/, "") || "課題";
    }
    function zhTitle(t) {
      var s = String(t || "");
      var cut = s.search(/\s+[A-Za-z]/);
      return cut > 0 ? s.slice(0, cut) : s;
    }
    function lessonOf(s, prefix) {
      if (s.id === "hymn_most_0001") return { href: prefix + "lessons/lesson_01_all_people.html", kind: "lesson", tag: "有課", name: "普天之下萬民萬族" };
      if (s.id === "hymn_most_0121") return { href: prefix + "lessons/lesson_amazing_grace.html", kind: "lesson", tag: "有課", name: "奇異恩典" };
      var names = {
        hymn_00_0001: "主耶和華，求祢引領",
        hymn_most_0122: "怎能如此",
        hymn_most_0025: "平安夜",
        hymn_00_0004: "索塞克斯聖誕頌",
        hymn_chi_0001: "大秦景教三威蒙度讚",
        hymn_pwc_0001: "祂是主",
        hymn_world_0001: "咱著對主唱歌",
        hymn_22_0001: "輕輕觸摸大地"
      };
      return { href: prefix + "analyze.html?id=" + encodeURIComponent(s.id), kind: "ask", tag: "提問", name: names[s.id] || s.zh || s.id };
    }
    function sum(zh, en) {
      return "<summary>" + esc(zh) + "<small class='en'>" + esc(en) + "</small></summary>";
    }
    var discs = (global.PH_DISCIPLINES_INDEX && global.PH_DISCIPLINES_INDEX.disciplines) || [];
    var samples = (global.PH_SEARCH_INDEX && global.PH_SEARCH_INDEX.samples) || [];
    var html = "<details data-zone='find'>" + sum("找聖詩", "Explore Hymns") +
      link("practical_hymnology/landing.html#find", "這一區的地圖") +
      link("hymn_catalog_sort.html", "全部聖詩") +
      link("practical_hymnology/explore/index.html", "外站詩集（Hymnary）") +
      link("hymn/default.htm", "舊索引（原文不改）") +
      "<p class='soon-note'>作者、曲調、詩集、經文、主題：以後</p></details>";
    html += "<details data-zone='learn'>" + sum("學聖詩", "Learn Through Hymns") +
      link("practical_hymnology/landing.html#learn-A", "七門地圖") +
      link("practical_hymnology/resource_selector.html#sets", "課題選歌");
    GATES.forEach(function (g) {
      var rows = discs.filter(function (d) { return d.cat === g.id; });
      var groups = [];
      var map = {};
      rows.forEach(function (d) {
        var k = lensName(d.lens);
        if (!map[k]) { map[k] = []; groups.push(k); }
        map[k].push(d);
      });
      html += "<details>" + sum(g.label, g.en) + link("practical_hymnology/landing.html#learn-" + g.id, "在這一頁展開");
      groups.forEach(function (k) {
        html += "<div class='group'>" + esc(k) + "</div>";
        map[k].forEach(function (d) {
          html += link("practical_hymnology/" + d.filepath, d.code + " " + zhTitle(d.title_zh));
        });
      });
      html += "</details>";
    });
    html += "</details>";
    html += "<details data-zone='research'>" + sum("研究聖詩", "Research Hymns") +
      link("practical_hymnology/landing.html#research", "已有分析的地圖");
    samples.forEach(function (s) {
      var item = lessonOf(s, "practical_hymnology/");
      html += "<a class='ph-line' data-b100-nav='content' href='" + esc(hrefOf(item.href)) + "'><span class='kind " + item.kind + "'>" + item.tag + "</span>" + esc(item.name) + "</a>";
    });
    html += "<p class='soon-note'>按科目請到學聖詩。這裡沒有另一套庫。</p></details>";
    html += "<details data-zone='workshop'>" + sum("聖詩工作坊", "Hymn Workshop") +
      link("practical_hymnology/Applied-Hymnology/index.html", "八週清單") +
      link("practical_hymnology/Applied-Hymnology/week1.html", "第1週 · 奇妙恩典") +
      link("practical_hymnology/Applied-Hymnology/week2.html", "第2週 · 聖哉三一") +
      link("practical_hymnology/Applied-Hymnology/week3.html", "第3週 · 堅固保障") +
      link("practical_hymnology/Applied-Hymnology/week4.html", "第4週 · 心靈安寧") +
      link("practical_hymnology/Applied-Hymnology/week5.html", "第5週 · 教會年曆") +
      link("practical_hymnology/Applied-Hymnology/week6.html", "第6週 · 耶穌恩友") +
      link("practical_hymnology/Applied-Hymnology/week7.html", "第7週 · 我心獻曲") +
      link("practical_hymnology/Applied-Hymnology/week8.html", "第8週 · 綜合敬拜") +
      "</details>";
    html += "<details data-zone='use'>" + sum("使用聖詩", "Use Hymns") +
      link("practical_hymnology/landing.html#use", "這一區的地圖") +
      link("hymn_ai_tools.html", "AI 工具") +
      link("practical_hymnology/ai_youtube_music_library_ai_parser_ironclad_153_proof_edition.html", "影音庫（貼章節聽歌）") +
      link("hymn_editor.html", "編輯歌詞") +
      link("ppt_generator.html", "投影歌詞") +
      link("practical_hymnology/resource_selector.html#guide", "怎樣使用？") +
      "<p class='soon-note'>崇拜歌單：以後</p></details>";
    var tree = el.querySelector("#ph-tree");
    tree.insertAdjacentHTML("beforeend", html);

    function openZone(zone) {
      var nodes = tree.querySelectorAll("details[data-zone]");
      for (var i = 0; i < nodes.length; i++) {
        var d = nodes[i];
        if (d.parentElement !== tree) continue;
        d.open = d.getAttribute("data-zone") === zone;
      }
    }
    function zoneFromHref(href) {
      var path = href || "";
      var hash = "";
      var query = "";
      var at = path.indexOf("#");
      if (at >= 0) { hash = path.slice(at + 1); path = path.slice(0, at); }
      var qi = path.indexOf("?");
      if (qi >= 0) { query = path.slice(qi + 1); path = path.slice(0, qi); }
      var zq = "";
      query.split("&").forEach(function (pair) {
        var bits = pair.split("=");
        var key = "";
        var val = "";
        try { key = decodeURIComponent(bits[0] || ""); val = decodeURIComponent(bits[1] || ""); } catch (e) {}
        if (key === "zone") zq = val;
      });
      if (/Applied-Hymnology/i.test(path)) return "workshop";
      if (/hymn_catalog_sort|\/explore\//i.test(path)) return "find";
      if (/hymn_ai_tools|hymn_editor|ppt_generator|ai_youtube_music_library/i.test(path)) return "use";
      if (/resource_selector/i.test(path)) return hash.indexOf("sets") === 0 ? "learn" : "use";
      if (/analyze\.html|core_hymns|\/lessons\/|hymn_amazing_grace/i.test(path)) return "research";
      if (/journey_intro|\/disciplines\/|learn_catalog|\/prisms\//i.test(path)) return "learn";
      if (/landing\.html/i.test(path)) {
        if (hash.indexOf("learn") === 0 || zq === "learn") return "learn";
        if (hash === "find" || hash === "research" || hash === "use") return hash;
        if (zq === "find" || zq === "research" || zq === "use") return zq;
      }
      return "";
    }
    if (!inline) {
      global.addEventListener("message", function (e) {
        if (!e.data || e.data.type !== "ph-zone") return;
        openZone(e.data.zone);
      });
      tree.addEventListener("click", function (e) {
        if (!e.target.closest("a[href]")) return;
        try { global.parent.postMessage({ type: "hymn-nav-close" }, "*"); } catch (err) {}
      });
      try {
        var w = global.parent.frames.contentFrame;
        if (w && w.location) {
          var zone = zoneFromHref(w.location.href || "");
          if (zone) openZone(zone);
        }
      } catch (e) {}
    } else {
      var here = zoneFromHref(global.location.href || "");
      if (here) openZone(here);
    }
  }

  global.PhSidePanel = { mount: mount, rewrite: rewrite };
})(typeof window !== "undefined" ? window : this);
