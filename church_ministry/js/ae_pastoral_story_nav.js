/**
 * B 区牧养 · 故事头 + 三步路线（SSOT）
 */
(function (win, doc) {
  "use strict";

  var STORIES = {
    "modules/support/visitation_index.html": {
      title: "💬 探访事工",
      what: "探访与关怀执行终端（牧养的手）",
      do: "接敬拜缺席草稿 · 安排本周探访 · 填写记录",
      from: "侧栏主入口 · 敬拜缺席 · 小组预警",
      to: "储存后写入会友主档 · 成长追踪时间轴",
      prev: { path: "_landing/fellowship.html", label: "牧羊导览", hint: "认路入门" },
      next: { path: "modules/members/member-integrated.html", label: "会友主档", hint: "查看关怀历史" }
    },
    "modules/fellowship/index.html": {
      title: "👥 团契事工总览",
      what: "小组（家）与团契（圈）的入口地图",
      do: "按组织需要选入口 · 不重复填表",
      from: "牧羊导览 · 侧栏团契总览",
      to: "进入小组工作桌或团契的圈",
      prev: { path: "_landing/fellowship.html", label: "牧羊导览", hint: "总地图" },
      next: { path: "modules/fellowship/small-groups-integrated.html", label: "小组工作桌", hint: "名册与目标" }
    },
    "modules/fellowship/small-groups-integrated.html": {
      title: "🏠 小组工作桌",
      what: "组长每日核心 — 4 Tab 工作桌（非全教会组织树）",
      do: "总览看板 · 每周开组 · 目标成果 · 快评与出席快选",
      from: "团契总览 · 侧栏小组工作桌",
      to: "出席联动 → 聚会统计页 · 3 周缺席 → 探访事工",
      prev: { path: "modules/fellowship/index.html", label: "团契总览", hint: "选入口" },
      next: { path: "modules/fellowship/pastoral-attendance.html", label: "聚会出席", hint: "周报与走势" }
    },
    "modules/fellowship/pastoral-attendance.html": {
      title: "📊 聚会与出席统计",
      what: "组长汇报 · 牧区出席走势 · 漏网预警",
      do: "勾选出席 · 看趋势图 · 处理连续缺席预警",
      from: "小组工作桌 · 侧栏聚会出席",
      to: "预警联动组织名册生命周期 · 牧养战略桌",
      prev: { path: "modules/fellowship/small-groups-integrated.html", label: "小组工作桌", hint: "快评" },
      next: { path: "modules/fellowship/pastoral-org-roster.html", label: "组织名册", hint: "生命周期" }
    },
    "modules/fellowship/pastoral-org-roster.html": {
      title: "👥 组织与名册中心",
      what: "牧职树+组长健康度 · 多维标签矩阵 · 生命周期状态机 · 360履历",
      do: "耗尽预警推战略桌 · 交叉筛选名册 · 新朋友落户 · 全景档案",
      from: "团契总览 · 侧栏组织名册",
      to: "点 memberId → 会友主档 · 出席率链出席页",
      prev: { path: "modules/fellowship/pastoral-attendance.html", label: "聚会出席", hint: "出席数据" },
      next: { path: "modules/fellowship/pastoral-events.html", label: "活动通告", hint: "跨组协作" }
    },
    "modules/fellowship/pastoral-events.html": {
      title: "📣 圣工与活动通告",
      what: "小组传递率 · PK 报名 · 服侍冲突校验 · 复盘物资库",
      do: "确认组长转发 · 批量报名 · 轮值冲突警示 · 归档 Lessons Learned",
      from: "组织名册 · 小组工作桌通知",
      to: "报名 memberId 联动会友主档",
      prev: { path: "modules/fellowship/pastoral-org-roster.html", label: "组织名册", hint: "名册" },
      next: { path: "modules/fellowship/pastoral-training.html", label: "门徒训练", hint: "装备" }
    },
    "modules/fellowship/pastoral-training.html": {
      title: "🎓 门徒装备与训练",
      what: "属灵阶梯 · 修课补课 · 提摩太筛选 · Planning 恩赐同步",
      do: "看成长阶梯 · 登记补课 · 筛选准组长 · 同步 SHAPE 恩赐",
      from: "组织名册 360 · C 区主日学 · church_planning SHAPE",
      to: "结业写入 growth 时间轴 · 提摩太池推生命周期",
      prev: { path: "modules/fellowship/pastoral-events.html", label: "活动通告", hint: "营会" },
      next: { path: "modules/fellowship/pastoral-strategy.html", label: "牧养战略桌", hint: "决策" }
    },
    "modules/fellowship/pastoral-strategy.html": {
      title: "🎯 牧养策略与关怀",
      what: "痛点分类探访 · 提案效益模拟 · 代祷红绿灯 · 教会健康指数 · RBAC",
      do: "统一 Inbox · 写提案模拟 · 紧急代祷推工作桌 · 导出 JSON 备份",
      from: "出席预警 · 探访回写 · 组织生命周期",
      to: "探访事工执行 · 教会规划 OS",
      prev: { path: "modules/fellowship/pastoral-training.html", label: "门徒训练", hint: "提摩太" },
      next: { path: "modules/support/visitation_index.html", label: "探访事工", hint: "执行关怀" }
    },
    "modules/members/member-integrated.html": {
      title: "📇 会友主档",
      what: "全会友数据中枢（memberId 对齐）",
      do: "查档案 · 小组归属 · 成长与关怀时间轴",
      from: "探访记录 · 侧栏会友主档",
      to: "回到探访事工继续跟进",
      prev: { path: "modules/support/visitation_index.html", label: "探访事工", hint: "填写记录" },
      next: { path: "modules/fellowship/small-groups-integrated.html", label: "小组工作桌", hint: "看归属" }
    },
    "modules/development/youth-ministry-dev.html": {
      title: "🎯 青年团契活动",
      what: "迎新与外展活动橱窗（迎新人之路）",
      do: "浏览营会／周五敬拜 · 登记新朋友",
      from: "团契的圈 · 牧羊导览迎新人之路",
      to: "新朋友转会友主档或探访事工",
      prev: { path: "modules/fellowship/fellowship-circles.html", label: "团契的圈", hint: "青年团契" },
      next: { path: "modules/support/visitation_index.html", label: "探访事工", hint: "初信跟进" }
    },
    "modules/fellowship/fellowship-circles.html": {
      title: "⭕ 团契的圈",
      what: "同阶段、同地区、同职业的朋友相聚",
      do: "点进适合的圈 · 参加活动",
      from: "牧羊导览 · 团契总览",
      to: "青年活动 · 小组 · 探访",
      prev: { path: "modules/fellowship/index.html", label: "团契总览", hint: "入口" },
      next: { path: "modules/development/youth-ministry-dev.html", label: "青年团契", hint: "活动" }
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
    el.setAttribute("aria-label", "本页说明");
    el.innerHTML =
      "<h2>" + story.title + "</h2>" +
      '<dl class="pastoral-story-grid">' +
      "<dt>是什么</dt><dd>" + story.what + "</dd>" +
      "<dt>做什么</dt><dd>" + story.do + "</dd>" +
      "<dt>从哪来</dt><dd>" + story.from + "</dd>" +
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
    nav.setAttribute("aria-label", "牧养路线三步");

    var prevHref = cmPre + story.prev.path + "?crm_from=b_pastoral";
    var nextHref = cmPre + story.next.path + "?crm_from=b_pastoral";

    nav.innerHTML =
      '<p class="pastoral-trail-nav__title">🛤️ 牧羊小径 · 这一步怎么走</p>' +
      '<div class="pastoral-trail-nav__steps">' +
      '<a class="pastoral-trail-nav__step" href="' + prevHref + '">⬅ 上一步<br><strong>' + story.prev.label + "</strong><small>" + story.prev.hint + "</small></a>" +
      '<span class="pastoral-trail-nav__step is-current">📍 当前<br><strong>' + story.title.replace(/^[^\s]+\s/, "") + "</strong><small>就是这一页</small></span>" +
      '<a class="pastoral-trail-nav__step" href="' + nextHref + '">下一步 ➡<br><strong>' + story.next.label + "</strong><small>" + story.next.hint + "</small></a>" +
      "</div>" +
      '<p class="pastoral-trail-nav__more">' +
      '<a href="' + cmPre + '_landing/fellowship.html">🌾 牧羊导览</a>' +
      (typeof win.bible100ShellNav === "function"
        ? '<a href="#" id="pastoralTrailFullSidebar">📂 完整侧栏</a>'
        : '<a href="' + cmPre + 'sidebar_church_layout_v1.html?focus=b" target="_parent">📂 完整侧栏</a>') +
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
    bar.setAttribute("aria-label", "牧羊小径导航");
    var title = story ? story.title : "🌾 牧羊小径";
    bar.innerHTML =
      '<span class="pastoral-ctx-bar__zone">' + title + "</span>" +
      '<a class="is-primary" href="' + cmPre + '_landing/fellowship.html">🧭 牧羊导览</a>' +
      '<a href="' + cmPre + 'modules/support/visitation_index.html?crm_from=b_pastoral">💬 探访事工</a>' +
      (typeof win.bible100ShellNav === "function"
        ? '<a href="#" id="pastoralCtxSidebar">📂 完整侧栏</a>'
        : '<a href="' + cmPre + 'sidebar_church_layout_v1.html?focus=b">📂 完整侧栏</a>');
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
