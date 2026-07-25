/**
 * 三扇門導航 SSOT — 規劃 / 行政 / 日常（廢 CRM 主入口）
 * 子頁：bible100ShellNav(event, B100TriangleNav.doors.xxx)
 * 總站殼：B100TriangleNav.shellGo('planning'|'journey'|'daily')
 * journey 鍵名保留相容，目標已改為 🟩 行政雙欄。
 */
(function (w) {
  'use strict';

  var DOORS = {
    planning: {
      key: 'planning',
      label: '🧭 規劃',
      sub: '五年計劃／決策河',
      sidebarUrl: 'church_planning/sidebar_plan.html',
      contentUrl: 'church_planning/index_plan.html'
    },
    journey: {
      key: 'journey',
      label: '🟩 行政',
      sub: '執行層／會友與工具',
      sidebarUrl: 'church_ministry/sidebar_church_layout_v1.html?focus=f',
      contentUrl: 'church_ministry/dashboard.html'
    },
    daily: {
      key: 'daily',
      label: '👥 日常手活',
      sub: '探訪、會友、志工',
      sidebarUrl: 'church_ministry/sidebar_church_layout_v1.html',
      contentUrl: 'church_ministry/dashboard.html'
    }
  };

  var EXTRAS = {
    handbook: {
      label: '📖 全站游客手冊',
      sidebarUrl: 'tools/tools-overview-sidebar.html',
      contentUrl: 'help/interconnect-roadmap.html'
    },
    tools: {
      label: '📋 工具總覽',
      sidebarUrl: 'tools/tools-overview-sidebar.html',
      contentUrl: 'tools/tools-dashboard.html'
    },
    guide: {
      label: '🧭 導覽憲法',
      sidebarUrl: 'tools/tools-overview-sidebar.html',
      contentUrl: 'help/site-navigation-guide.html'
    }
  };

  function bustUrl(url) {
    if (!url) return url;
    return url + (url.indexOf('?') >= 0 ? '&' : '?') + 'v=' + Date.now();
  }

  function shellGoPair(sidebarUrl, contentUrl) {
    var sb = document.getElementById('sidebarFrame');
    var cf = document.getElementById('contentFrame');
    if (!sb || !cf) return false;
    var fm = w.frameManager;
    if (fm && typeof fm.showLoading === 'function') {
      fm.showLoading('切換模組…');
    }
    if (w.document && w.document.body) {
      w.document.body.classList.remove('mode-hymn-embed', 'mode-module-shell-embed');
    }
    if (sidebarUrl) sb.src = bustUrl(sidebarUrl);
    if (contentUrl) cf.src = bustUrl(contentUrl);
    return true;
  }

  function goDoor(key, ev) {
    if (ev && ev.preventDefault) ev.preventDefault();
    var door = DOORS[key];
    if (!door) return false;
    if (shellGoPair(door.sidebarUrl, door.contentUrl)) return true;
    if (typeof w.bible100ShellNav === 'function') {
      return w.bible100ShellNav(null, {
        sidebarUrl: door.sidebarUrl,
        contentUrl: door.contentUrl
      });
    }
    if (door.contentUrl) {
      w.location.href = door.contentUrl;
    }
    return false;
  }

  function goExtra(key) {
    var item = EXTRAS[key];
    if (!item) return false;
    if (shellGoPair(item.sidebarUrl, item.contentUrl)) return true;
    if (typeof w.bible100ShellNav === 'function') {
      return w.bible100ShellNav(null, {
        sidebarUrl: item.sidebarUrl,
        contentUrl: item.contentUrl
      });
    }
    if (item.contentUrl) w.location.href = item.contentUrl;
    return false;
  }

  function onclickDoor(key) {
    return function (ev) {
      if (ev && ev.preventDefault) ev.preventDefault();
      goDoor(key);
      return false;
    };
  }

  w.B100TriangleNav = {
    doors: DOORS,
    extras: EXTRAS,
    goDoor: goDoor,
    goExtra: goExtra,
    shellGo: goDoor,
    shellGoPair: shellGoPair,
    onclickDoor: onclickDoor,
    bustUrl: bustUrl
  };
})(typeof window !== 'undefined' ? window : this);
