/**
 * C 區教育 · 故事头 + 四 Tab 快跳 + 路线（对齐 B 区牧养故事导航）
 */
(function (win, doc) {
  "use strict";

  var STORIES = {
    "_landing/education.html": {
      title: "🧭 教育培訓導覽",
      what: "主日學、聖經教材、學校學籍、門訓動力站、AI 備課的認路地圖",
      do: "選工作桌或跨站殼；日常操作用四 Tab 主入口",
      from: "CRM 旅程 · 側欄 C 區",
      to: "主日學工作桌四 Tab",
      prev: { path: "guide_crm_journey_hub.html", label: "CRM 旅程", hint: "總地圖" },
      next: { path: "modules/education/education-integrated.html", label: "主日學工作桌", hint: "① 學籍" }
    },
    "modules/education/education-integrated.html": {
      title: "🎓 主日學工作桌",
      what: "四 Tab 深度：學籍·班級 · 出席預警 · 門訓銜接 · 教師課程",
      do: "點名 → 缺席推 B 區 · 讀 pastoralDiscipleship · AI 備課草稿",
      from: "教育導覽 · B 門徒訓練同步",
      to: "會友成長軸 · 探訪 · 學校學籍",
      prev: { path: "_landing/education.html", label: "教育導覽", hint: "認路" },
      next: { path: "modules/fellowship/pastoral-training.html", label: "B 門徒訓練", hint: "修課" }
    }
  };

  var TRAIL_ORDER = [
    "_landing/education.html",
    "modules/education/education-integrated.html",
    "modules/fellowship/pastoral-training.html"
  ];

  function normPath(p) {
    return String(p || "")
      .replace(/\\/g, "/")
      .split("?")[0]
      .split("#")[0]
      .replace(/^\.\//, "")
      .toLowerCase();
  }

  function currentRelPath() {
    var p = normPath(win.location.pathname || "");
    var idx = p.indexOf("/church_ministry/");
    if (idx >= 0) return p.slice(idx + "/church_ministry/".length);
    if (p.indexOf("church_ministry/") === 0) return p.slice("church_ministry/".length);
    return p.replace(/^\//, "");
  }

  function storyForPath(rel) {
    rel = normPath(rel);
    if (STORIES[rel]) return STORIES[rel];
    var keys = Object.keys(STORIES);
    for (var i = 0; i < keys.length; i++) {
      if (rel.indexOf(normPath(keys[i])) >= 0) return STORIES[keys[i]];
    }
    return null;
  }

  function injectEducationCtxBar(cmPre, rel) {
    if (doc.getElementById("education-ctx-bar")) return;
    var bar = doc.createElement("div");
    bar.id = "education-ctx-bar";
    bar.className = "education-ctx-bar";
    bar.setAttribute("role", "navigation");
    bar.setAttribute("aria-label", "C 區四 Tab 快跳");
    var base = (cmPre || "") + "modules/education/education-integrated.html?crm_from=c_ctx";
    bar.innerHTML =
      '<span class="education-ctx-bar__zone">📚 C · 教育培訓</span>' +
      '<a href="' + (cmPre || "") + '_landing/education.html">🧭 導覽</a>' +
      '<a href="' + base + '#tab-roster">① 學籍</a>' +
      '<a href="' + base + '#tab-attendance">② 出席</a>' +
      '<a href="' + base + '#tab-discipleship">③ 門訓</a>' +
      '<a href="' + base + '#tab-teaching">④ 課程</a>' +
      '<a href="#" class="is-muted" id="edu-ctx-bible">📖 聖經教材</a>';
    doc.body.insertBefore(bar, doc.body.firstChild);
    var bib = doc.getElementById("edu-ctx-bible");
    if (bib && win.bible100ShellNav) {
      bib.onclick = function (ev) {
        return win.bible100ShellNav(ev, {
          sidebarUrl: "bible_study/sidebar.html",
          contentUrl: "bible_study/dashboard.html?lang=CN"
        });
      };
    }
  }

  function injectStoryHead(cmPre, rel, mountSelector) {
    if (doc.getElementById("education-story-head")) return;
    var story = storyForPath(rel);
    if (!story) return;
    var mount = (mountSelector && doc.querySelector(mountSelector)) || doc.querySelector(".edu-wrap") || doc.body;
    var el = doc.createElement("section");
    el.id = "education-story-head";
    el.className = "education-story-head";
    el.innerHTML =
      "<h2>" + story.title + "</h2>" +
      '<dl class="education-story-grid">' +
      "<dt>是什麼</dt><dd>" + story.what + "</dd>" +
      "<dt>做什麼</dt><dd>" + story.do + "</dd>" +
      "<dt>從哪來</dt><dd>" + story.from + "</dd>" +
      "<dt>去哪</dt><dd>" + story.to + "</dd>" +
      "</dl>";
    var anchor = doc.getElementById("ae-primary-nav-strip") || doc.getElementById("education-ctx-bar") || doc.querySelector(".crm-ctx-bar");
    if (anchor && anchor.nextSibling) {
      mount.insertBefore(el, anchor.nextSibling);
    } else if (anchor) {
      anchor.parentNode.appendChild(el);
    } else {
      mount.insertBefore(el, mount.firstChild);
    }
  }

  function injectTrailNav(cmPre, rel) {
    if (doc.getElementById("education-trail-nav")) return;
    var story = storyForPath(rel);
    if (!story) return;
    var nav = doc.createElement("nav");
    nav.id = "education-trail-nav";
    nav.className = "education-trail-nav";
    nav.setAttribute("aria-label", "教育路線");
    var html = '<span class="trail-label">路線：</span>';
    if (story.prev) {
      html += '<a href="' + (cmPre || "") + story.prev.path + '">← ' + story.prev.label + "</a>";
    }
    html += ' <span class="trail-here">【' + story.title + "】</span> ";
    if (story.next) {
      html += '<a href="' + (cmPre || "") + story.next.path + '">' + story.next.label + " →</a>";
    }
    nav.innerHTML = html;
    var roadmap = doc.getElementById("ae-zone-roadmap");
    if (roadmap) roadmap.parentNode.insertBefore(nav, roadmap);
    else doc.body.appendChild(nav);
  }

  win.AeEducationStoryNav = {
    STORIES: STORIES,
    storyForPath: storyForPath,
    currentRelPath: currentRelPath,
    injectEducationCtxBar: injectEducationCtxBar,
    injectStoryHead: injectStoryHead,
    injectTrailNav: injectTrailNav
  };
})(window, document);
