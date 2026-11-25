/**
 * B 區牧養 · 故事頭 + 三步路線（SSOT）
 */
(function (win, doc) {
  "use strict";

  var STORIES = {
    "modules/support/visitation_index.html": {
      title: "💬 探訪事工",
      what: "探訪與關懷執行終端（牧養的手）",
      do: "接敬拜缺席草稿 · 安排本週探訪 · 填寫記錄",
      from: "側欄主入口 · 敬拜缺席 · 小組預警",
      to: "儲存後寫入會友主檔 · 成長追蹤時間軸",
      prev: { path: "_landing/fellowship.html", label: "牧羊導覽", hint: "認路入門" },
      next: { path: "modules/members/member-integrated.html", label: "會友主檔", hint: "查看關懷歷史" }
    },
    "modules/fellowship/index.html": {
      title: "👥 團契事工總覽",
      what: "小組（家）與團契（圈）的入口地圖",
      do: "按組織需要選入口 · 不重複填表",
      from: "牧羊導覽 · 側欄團契總覽",
      to: "進入小組工作桌或團契的圈",
      prev: { path: "_landing/fellowship.html", label: "牧羊導覽", hint: "總地圖" },
      next: { path: "modules/fellowship/small-groups-integrated.html", label: "小組工作桌", hint: "名冊與目標" }
    },
    "modules/fellowship/small-groups-integrated.html": {
      title: "🏠 小組工作桌",
      what: "組長每日核心 — 4 Tab 工作桌（非全教會組織樹）",
      do: "總覽看板 · 每週開組 · 目標成果 · 快評與出席快選",
      from: "團契總覽 · 側欄小組工作桌",
      to: "出席聯動 → 聚會統計頁 · 3 周缺席 → 探訪事工",
      prev: { path: "modules/fellowship/index.html", label: "團契總覽", hint: "選入口" },
      next: { path: "modules/fellowship/attendance-checkin.html", label: "現場點名", hint: "簽到台" }
    },
    "modules/fellowship/attendance-checkin.html": {
      title: "✅ 現場點名 · 簽到台",
      what: "手動編號／電話簽到 · 組長批量 · 防重複打卡",
      do: "建場次 · 開始聚會 · 手輸或批量勾選 · 匯出 CSV",
      from: "小組工作桌 · 牧養 Tab② · 側欄現場點名",
      to: "出席統計趨勢 · 缺席預警 → 探訪（人確認）",
      prev: { path: "modules/fellowship/small-groups-integrated.html", label: "小組工作桌", hint: "快評" },
      next: { path: "modules/fellowship/pastoral-attendance.html", label: "出席統計", hint: "週報與走勢" }
    },
    "modules/fellowship/pastoral-attendance.html": {
      title: "📊 聚會與出席統計",
      what: "組長彙報 · 牧區出席走勢 · 漏網預警",
      do: "勾選出席 · 看趨勢圖 · 處理連續缺席預警",
      from: "現場點名 · 小組工作桌 · 側欄聚會出席統計",
      to: "預警聯動組織名冊生命週期 · 牧養戰略桌",
      prev: { path: "modules/fellowship/attendance-checkin.html", label: "現場點名", hint: "簽到台" },
      next: { path: "modules/fellowship/pastoral-org-roster.html", label: "組織名冊", hint: "生命週期" }
    },
    "modules/fellowship/pastoral-org-roster.html": {
      title: "👥 組織與名冊中心",
      what: "牧職樹+組長健康度 · 多維標籤矩陣 · 生命週期狀態機 · 360履歷",
      do: "耗盡預警推戰略桌 · 交叉篩選名冊 · 新朋友落戶 · 全景檔案",
      from: "團契總覽 · 側欄組織名冊",
      to: "點 memberId → 會友主檔 · 出席率鏈出席頁",
      prev: { path: "modules/fellowship/pastoral-attendance.html", label: "聚會出席", hint: "出席數據" },
      next: { path: "modules/fellowship/pastoral-events.html", label: "活動通告", hint: "跨組協作" }
    },
    "modules/fellowship/pastoral-events.html": {
      title: "📣 聖工與活動通告",
      what: "小組傳遞率 · PK 報名 · 服侍衝突校驗 · 覆盤物資庫",
      do: "確認組長轉發 · 批量報名 · 輪值衝突警示 · 歸檔 Lessons Learned",
      from: "組織名冊 · 小組工作桌通知",
      to: "報名 memberId 聯動會友主檔",
      prev: { path: "modules/fellowship/pastoral-org-roster.html", label: "組織名冊", hint: "名冊" },
      next: { path: "modules/fellowship/pastoral-training.html", label: "門徒訓練", hint: "裝備" }
    },
    "modules/fellowship/pastoral-training.html": {
      title: "🎓 門徒裝備與訓練",
      what: "屬靈階梯 · 修課補課 · 提摩太篩選 · Planning 恩賜同步",
      do: "看成長階梯 · 登記補課 · 篩選準組長 · 同步 SHAPE 恩賜",
      from: "組織名冊 360 · C 區主日學 · church_planning SHAPE",
      to: "結業寫入 growth 時間軸 · 提摩太池推生命週期",
      prev: { path: "modules/fellowship/pastoral-events.html", label: "活動通告", hint: "營會" },
      next: { path: "modules/fellowship/pastoral-strategy.html", label: "牧養戰略桌", hint: "決策" }
    },
    "modules/fellowship/pastoral-strategy.html": {
      title: "🎯 牧養策略與關懷",
      what: "痛點分類探訪 · 提案效益模擬 · 代禱紅綠燈 · 教會健康指數 · RBAC",
      do: "統一 Inbox · 寫提案模擬 · 緊急代禱推工作桌 · 導出 JSON 備份",
      from: "出席預警 · 探訪回寫 · 組織生命週期",
      to: "探訪事工執行 · 教會規劃 OS",
      prev: { path: "modules/fellowship/pastoral-training.html", label: "門徒訓練", hint: "提摩太" },
      next: { path: "modules/support/visitation_index.html", label: "探訪事工", hint: "執行關懷" }
    },
    "modules/members/member-integrated.html": {
      title: "📇 會友主檔",
      what: "全會友數據中樞（memberId 對齊）",
      do: "查檔案 · 小組歸屬 · 成長與關懷時間軸",
      from: "探訪記錄 · 側欄會友主檔",
      to: "回到探訪事工繼續跟進",
      prev: { path: "modules/support/visitation_index.html", label: "探訪事工", hint: "填寫記錄" },
      next: { path: "modules/fellowship/small-groups-integrated.html", label: "小組工作桌", hint: "看歸屬" }
    },
    "modules/development/youth-ministry-dev.html": {
      title: "🎯 青年團契活動",
      what: "迎新與外展活動櫥窗（迎新人之路）",
      do: "瀏覽營會／週五敬拜 · 登記新朋友",
      from: "團契的圈 · 牧羊導覽迎新人之路",
      to: "新朋友轉會友主檔或探訪事工",
      prev: { path: "modules/fellowship/fellowship-circles.html", label: "團契的圈", hint: "青年團契" },
      next: { path: "modules/support/visitation_index.html", label: "探訪事工", hint: "初信跟進" }
    },
    "modules/fellowship/fellowship-circles.html": {
      title: "⭕ 團契的圈",
      what: "同階段、同地區、同職業的朋友相聚",
      do: "點進適合的圈 · 參加活動",
      from: "牧羊導覽 · 團契總覽",
      to: "青年活動 · 小組 · 探訪",
      prev: { path: "modules/fellowship/index.html", label: "團契總覽", hint: "入口" },
      next: { path: "modules/development/youth-ministry-dev.html", label: "青年團契", hint: "活動" }
    }
  };

  var TRAIL_ORDER = [
    "_landing/fellowship.html",
    "modules/development/youth-ministry-dev.html",
    "modules/members/member-integrated.html",
    "modules/fellowship/index.html",
    "modules/fellowship/small-groups-integrated.html",
    "modules/support/visitation_index.html"
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

  function memberGrowthUrl(cmPre, memberId) {
    var base = (cmPre || "") + "modules/members/member-integrated.html?crm_from=b_pastoral";
    if (memberId == null || memberId === "") return base + "#tab=growth";
    return base + "#tab=growth&memberId=" + encodeURIComponent(String(memberId));
  }

  function visitationUrl(cmPre, memberId) {
    var base = (cmPre || "") + "modules/support/visitation_index.html?crm_from=b_pastoral";
    if (memberId) base += "&memberId=" + encodeURIComponent(String(memberId));
    return base;
  }

  function injectStoryHead(cmPre, rel, mountSelector) {
    if (doc.getElementById("pastoral-story-head")) return;
    var story = storyForPath(rel);
    if (!story) return;
    var mount =
      (mountSelector && doc.querySelector(mountSelector)) ||
      doc.querySelector(".page") ||
      doc.querySelector(".hub-wrap") ||
      doc.querySelector(".fc-wrap") ||
      doc.querySelector(".sg-wrap") ||
      doc.querySelector(".container") ||
      doc.body;
    if (!mount) return;

    var el = doc.createElement("section");
    el.id = "pastoral-story-head";
    el.className = "pastoral-story-head";
    el.setAttribute("aria-label", "本頁說明");
    el.innerHTML =
      "<h2>" + story.title + "</h2>" +
      '<dl class="pastoral-story-grid">' +
      "<dt>是什麼</dt><dd>" + story.what + "</dd>" +
      "<dt>做什麼</dt><dd>" + story.do + "</dd>" +
      "<dt>從哪來</dt><dd>" + story.from + "</dd>" +
      "<dt>去哪</dt><dd>" + story.to + "</dd>" +
      "</dl>";

    var first = mount.firstElementChild;
    if (first && first.id === "ae-primary-nav-strip") {
      mount.insertBefore(el, first.nextSibling);
    } else if (first && (first.classList.contains("pastoral-ctx-bar") || first.classList.contains("crm-ctx-bar"))) {
      mount.insertBefore(el, first.nextSibling);
    } else {
      mount.insertBefore(el, mount.firstChild);
    }
  }

  function injectTrailNav(cmPre, rel) {
    if (doc.getElementById("pastoral-trail-nav")) return;
    var story = storyForPath(rel);
    if (!story) return;

    var nav = doc.createElement("nav");
    nav.id = "pastoral-trail-nav";
    nav.className = "pastoral-trail-nav";
    nav.setAttribute("aria-label", "牧養路線三步");

    var prevHref = cmPre + story.prev.path + "?crm_from=b_pastoral";
    var nextHref = cmPre + story.next.path + "?crm_from=b_pastoral";

    nav.innerHTML =
      '<p class="pastoral-trail-nav__title">🛤️ 牧羊小徑 · 這一步怎麼走</p>' +
      '<div class="pastoral-trail-nav__steps">' +
      '<a class="pastoral-trail-nav__step" href="' + prevHref + '">⬅ 上一步<br><strong>' + story.prev.label + "</strong><small>" + story.prev.hint + "</small></a>" +
      '<span class="pastoral-trail-nav__step is-current">📍 當前<br><strong>' + story.title.replace(/^[^\s]+\s/, "") + "</strong><small>就是這一頁</small></span>" +
      '<a class="pastoral-trail-nav__step" href="' + nextHref + '">下一步 ➡<br><strong>' + story.next.label + "</strong><small>" + story.next.hint + "</small></a>" +
      "</div>" +
      '<p class="pastoral-trail-nav__more">' +
      '<a href="' + cmPre + '_landing/fellowship.html">🌾 牧羊導覽</a>' +
      (typeof win.bible100ShellNav === "function"
        ? '<a href="#" id="pastoralTrailFullSidebar">📂 完整側欄</a>'
        : '<a href="' + cmPre + 'sidebar_church_layout_v1.html?focus=b" target="_parent">📂 完整側欄</a>') +
      "</p>";

    doc.body.appendChild(nav);
    var trailSide = doc.getElementById("pastoralTrailFullSidebar");
    if (trailSide) {
      trailSide.onclick = function (ev) {
        if (ev.preventDefault) ev.preventDefault();
        win.bible100ShellNav(ev, {
          sidebarUrl: "church_ministry/sidebar_church_layout_v1.html?focus=b",
          contentUrl: ""
        });
        return false;
      };
    }
  }

  function injectPastoralCtxBar(cmPre, rel) {
    if (doc.getElementById("pastoral-ctx-bar")) return;
    var story = storyForPath(rel);
    var bar = doc.createElement("div");
    bar.id = "pastoral-ctx-bar";
    bar.className = "pastoral-ctx-bar";
    bar.setAttribute("role", "navigation");
    bar.setAttribute("aria-label", "牧羊小徑導航");
    var title = story ? story.title : "🌾 牧羊小徑";
    bar.innerHTML =
      '<span class="pastoral-ctx-bar__zone">' + title + "</span>" +
      '<a class="is-primary" href="' + cmPre + '_landing/fellowship.html">🧭 牧羊導覽</a>' +
      '<a href="' + cmPre + 'modules/support/visitation_index.html?crm_from=b_pastoral">💬 探訪事工</a>' +
      (typeof win.bible100ShellNav === "function"
        ? '<a href="#" id="pastoralCtxSidebar">📂 完整側欄</a>'
        : '<a href="' + cmPre + 'sidebar_church_layout_v1.html?focus=b">📂 完整側欄</a>');
    doc.body.insertBefore(bar, doc.body.firstChild);
    var side = doc.getElementById("pastoralCtxSidebar");
    if (side) {
      side.onclick = function (ev) {
        if (ev.preventDefault) ev.preventDefault();
        win.bible100ShellNav(ev, {
          sidebarUrl: "church_ministry/sidebar_church_layout_v1.html?focus=b",
          contentUrl: "church_ministry/modules/support/visitation_index.html"
        });
        return false;
      };
    }
  }

  win.AePastoralStoryNav = {
    STORIES: STORIES,
    TRAIL_ORDER: TRAIL_ORDER,
    storyForPath: storyForPath,
    currentRelPath: currentRelPath,
    memberGrowthUrl: memberGrowthUrl,
    visitationUrl: visitationUrl,
    injectStoryHead: injectStoryHead,
    injectTrailNav: injectTrailNav,
    injectPastoralCtxBar: injectPastoralCtxBar
  };
})(window, document);
