/**
 * 跑道葉子頁統一導航（L5 chrome）
 * ← 回上頁 · 🏠 跑道首頁 · 賽道快捷 · Hub 麵包屑
 */
(function (global) {
  'use strict';

  var TRACK_PAGES = {
    plan1y: 'track-plan1y.html',
    plan3y: 'track-plan3y.html',
    '30day': 'track-30day.html',
    golden: 'track-golden.html',
    theme: 'track-theme.html',
    bible66: 'bible66.html',
  };

  var PAGE_LABELS = {
    'landing.html': { zh: '尋寶地圖', en: 'Treasure map' },
    'track-plan3y.html': { zh: '三年計劃', en: '3-year plan' },
    'track-plan1y.html': { zh: '一年計劃', en: '1-year plan' },
    'track-30day.html': { zh: '三十日', en: '30 days' },
    'track-golden.html': { zh: '100 金句', en: 'Golden verses' },
    'track-theme.html': { zh: '主題讀經', en: 'Themes' },
    'reader-multilang.html': { zh: '多语查经', en: 'Multilingual' },
    'read-done.html': { zh: '讀完打卡', en: 'Done' },
    'bible66.html': { zh: '六十六卷', en: '66 books' },
    'read66.html': { zh: '六十六卷', en: '66 books' },
    'pacing.html': { zh: '同跑隊伍', en: 'Squad pacing' },
    'ai-qna.html': { zh: '牧養問答', en: 'Pastoral Q&A' },
    'ai-tutor.html': { zh: '智慧導師', en: 'AI tutor' },
    'supply/prompt.html': { zh: '讀經 Prompt', en: 'Reading prompt' },
  };

  var UI = {
    'zh-Hant': {
      back: '← 回上頁',
      forward: '→ 前進',
      home: '🏠 跑道首頁',
      track: '↩ 回計劃',
      hubSite: '總站',
      hubStudy: '聖經研讀',
      hubTrack: '聖經跑道',
      zoneLabel: '快捷',
      zoneMap: '🗺️ 尋寶地圖',
      zoneToday: '📅 今日關卡',
      zonePacing: '🏃 同跑隊伍',
      zoneQna: '💬 牧養問答',
      zoneAi: '🎓 智慧導師',
      demoTag: '示範',
      backRead: '📖 回經文',
      backDone: '↩ 讀完頁',
      fullShell: '⚙️ 對象·單雙語',
    },
    en: {
      back: '← Back',
      forward: '→ Forward',
      home: '🏠 Track home',
      track: '↩ Plan',
      hubSite: 'Site',
      hubStudy: 'Bible Study',
      hubTrack: 'Bible Track',
      zoneLabel: 'Quick',
      zoneMap: '🗺️ Map',
      zoneToday: '📅 Today',
      zonePacing: '🏃 Squad',
      zoneQna: '💬 Q&A',
      zoneAi: '🎓 Tutor',
      demoTag: 'demo',
      backRead: '📖 Reading',
      backDone: '↩ Done page',
      fullShell: '⚙️ Persona·view',
    },
    vi: {
      back: '← Lùi',
      forward: '→ Tiếp',
      home: '🏠 Trang chủ',
      track: '↩ Kế hoạch',
      hubSite: 'Trang',
      hubStudy: 'Nghiên cứu',
      hubTrack: 'Hành trình',
      zoneLabel: 'Nhanh',
      zoneMap: '🗺️ Bản đồ',
      zoneToday: '📅 Hôm nay',
      zonePacing: '🏃 Đội',
      zoneQna: '💬 Hỏi đáp',
      zoneAi: '🎓 Gia sư',
      demoTag: 'demo',
      backRead: '📖 Đọc',
      backDone: '↩ Xong',
      fullShell: '⚙️ Đối tượng',
    },
    id: {
      back: '← Kembali',
      forward: '→ Maju',
      home: '🏠 Beranda',
      track: '↩ Rencana',
      hubSite: 'Situs',
      hubStudy: 'Studi',
      hubTrack: 'Lintasan',
      zoneLabel: 'Cepat',
      zoneMap: '🗺️ Peta',
      zoneToday: '📅 Hari ini',
      zonePacing: '🏃 Tim',
      zoneQna: '💬 Tanya',
      zoneAi: '🎓 Tutor',
      demoTag: 'demo',
      backRead: '📖 Baca',
      backDone: '↩ Selesai',
      fullShell: '⚙️ Persona',
    },
  };

  function loc() {
    if (global.B100LocalePick && global.B100LocalePick.getLocale) {
      return global.B100LocalePick.getLocale();
    }
    return new URLSearchParams(global.location.search).get('locale') || 'zh-Hant';
  }

  function t(key) {
    var pack = UI[loc()] || UI['zh-Hant'];
    return pack[key] || UI['zh-Hant'][key] || key;
  }

  function pageName() {
    var p = (global.location.pathname || '').replace(/\\/g, '/');
    return (p.split('/').pop() || '').split('?')[0].toLowerCase();
  }

  function pageRelPath() {
    var p = (global.location.pathname || '').replace(/\\/g, '/');
    if (/\/supply\//i.test(p)) return 'supply/prompt.html';
    return pageName();
  }

  var SHELL_PAGES_SITE = 'bible_app/shell/pages/';

  function siteShellPagesPath(name) {
    name = String(name || '').replace(/^pages\//, '');
    if (/^bible_app\//i.test(name)) return name;
    return SHELL_PAGES_SITE + name;
  }

  function appendQuery(href, extraQuery, locale) {
    if (extraQuery) {
      href += (href.indexOf('?') >= 0 ? '&' : '?') + String(extraQuery).replace(/^\?/, '');
    }
    if (locale && href.indexOf('locale=') < 0) {
      href += (href.indexOf('?') >= 0 ? '&' : '?') + 'locale=' + encodeURIComponent(locale);
    }
    return href;
  }

  /** 站根相對路徑 → 當前 iframe 可用 href（避免 Hub 頂層把 pacing.html 解到 404） */
  function pageHref(name, extraQuery) {
    var locale = loc();
    var file = String(name || '').split('?')[0];
    var existQ = String(name || '').indexOf('?') >= 0 ? String(name).slice(String(name).indexOf('?')) : '';
    var sitePath = siteShellPagesPath(file);
    var href = '';

    if (global.B100_sitePath && global.B100_sitePath.siteHref) {
      href = global.B100_sitePath.siteHref(sitePath);
    } else {
      try {
        href = new URL(file, global.location.href).href;
      } catch (eRel) {
        href = sitePath;
      }
    }

    if (global.B100LiveDb && global.B100LiveDb.isLive && global.B100LiveDb.isLive() && global.B100LiveDb.pageUrl) {
      href = global.B100LiveDb.pageUrl(file);
    }

    if (existQ) {
      href = href.split('?')[0] + existQ;
    }
    return appendQuery(href, extraQuery, locale);
  }

  function fullShellHref(track) {
    var q = 'fresh=1&locale=' + encodeURIComponent(loc());
    if (track) q += '&track=' + encodeURIComponent(track);
    var sitePath = 'bible_app/shell/index.html?' + q;
    if (global.B100_sitePath && global.B100_sitePath.siteHref) {
      return global.B100_sitePath.siteHref(sitePath);
    }
    try {
      return new URL('../index.html?' + q, global.location.href).href;
    } catch (eShell) {
      return sitePath;
    }
  }

  function siteIndexHref() {
    try {
      return new URL('../../../index.html?b100_mode=study', global.location.href).href;
    } catch (e) {
      return '../../../index.html?b100_mode=study';
    }
  }

  function inHubContentFrame() {
    try {
      if (!global.parent || global.parent === global) return false;
      var fe = global.frameElement;
      if (fe && (fe.id === 'contentFrame' || fe.getAttribute('name') === 'contentFrame')) return true;
      var pd = global.parent.document;
      if (pd) {
        var cf = pd.getElementById('contentFrame');
        if (cf && cf.contentWindow === global) return true;
      }
    } catch (e) {}
    return false;
  }

  function shouldSkip() {
    var name = pageName();
    if (!name || name === 'landing.html' || name === 'landing-dashboard.html') return true;
    return false;
  }

  function todayPageForTrack(track) {
    if (track === 'plan3y') return 'track-plan3y.html';
    if (track === '30day') return 'track-30day.html';
    if (track === 'golden') return 'track-golden.html';
    if (track === 'theme') return 'track-theme.html';
    return 'track-plan1y.html';
  }

  function trackFallbackUrl() {
    var q = new URLSearchParams(global.location.search);
    var track = q.get('track') || '';
    var extra = '';
    if (track === 'theme' && q.get('theme')) extra = 'focus=' + encodeURIComponent(q.get('theme'));
    var name = pageName();
    if (track && TRACK_PAGES[track]) {
      if (
        name === 'read66.html' ||
        name === 'bible66.html' ||
        name === 'reader-multilang.html' ||
        name === 'read-done.html'
      ) {
        return pageHref(TRACK_PAGES[track], extra);
      }
    }
    if ((name === 'bible66.html' || name === 'reader-multilang.html') && track) {
      return pageHref(TRACK_PAGES[track] || 'landing.html', extra);
    }
    if (/track-plan/.test(name) || /track-30day|track-golden|track-theme/.test(name)) {
      return pageHref('landing.html');
    }
    return pageHref('landing.html');
  }

  function currentPageLabel() {
    var rel = pageRelPath();
    var pack = PAGE_LABELS[rel] || PAGE_LABELS[pageName()];
    if (pack) return loc() === 'en' ? pack.en : pack.zh;
    return rel.replace(/\.html$/i, '');
  }

  function goBack() {
    var fb = trackFallbackUrl();
    var name = pageName();
    if (
      name === 'read66.html' ||
      name === 'bible66.html' ||
      name === 'reader-multilang.html' ||
      name === 'read-done.html'
    ) {
      global.location.href = fb;
      return;
    }
    if (/\/supply\//i.test(global.location.pathname || '')) {
      try {
        if (global.history.length > 1) {
          global.history.back();
          return;
        }
      } catch (eHist) {}
      global.location.href = pageHref('read-done.html');
      return;
    }
    try {
      if (global.history.length > 1) {
        global.history.back();
        return;
      }
    } catch (eHist2) {}
    global.location.href = fb;
  }

  function mkBtn(label, onClick) {
    var b = global.document.createElement('button');
    b.type = 'button';
    b.className = 'page-nav-btn';
    b.textContent = label;
    b.addEventListener('click', onClick);
    return b;
  }

  function mkLink(href, label, className) {
    var a = global.document.createElement('a');
    a.className = 'page-nav-btn' + (className ? ' ' + className : '');
    a.href = href;
    a.textContent = label;
    return a;
  }

  function renderBreadcrumb(wrap) {
    if (!inHubContentFrame()) return;
    var crumb = global.document.createElement('nav');
    crumb.className = 'page-nav-breadcrumb';
    crumb.setAttribute('aria-label', 'Breadcrumb');
    var parts = [];
    parts.push('<a href="' + siteIndexHref() + '">' + t('hubSite') + '</a>');
    parts.push('<span class="page-nav-breadcrumb__sep">›</span>');
    parts.push('<a href="' + siteIndexHref() + '">' + t('hubStudy') + '</a>');
    parts.push('<span class="page-nav-breadcrumb__sep">›</span>');
    parts.push('<a href="' + pageHref('landing.html') + '">' + t('hubTrack') + '</a>');
  if (pageName() !== 'landing.html') {
      parts.push('<span class="page-nav-breadcrumb__sep">›</span>');
      parts.push('<span class="page-nav-breadcrumb__here">' + currentPageLabel() + '</span>');
    }
    crumb.innerHTML = parts.join('');
    wrap.appendChild(crumb);
  }

  function readingContextQuery() {
    var q = new URLSearchParams(global.location.search);
    var keys = ['track', 'book', 'chapter', 'verse', 'ref', 'passage', 'locale', 'day', 'gv', 'theme', 'unit'];
    var parts = [];
    keys.forEach(function (k) {
      var v = q.get(k);
      if (v) parts.push(k + '=' + encodeURIComponent(v));
    });
    return parts.join('&');
  }

  function isPostReadPage() {
    var name = pageName();
    return name === 'reader-multilang.html' || name === 'read-done.html';
  }

  function renderZoneDock(wrap, track) {
    var dock = global.document.createElement('div');
    dock.className = 'page-nav-zone-dock';
    dock.setAttribute('aria-label', t('zoneLabel'));

    var lbl = global.document.createElement('span');
    lbl.className = 'page-nav-zone-label';
    lbl.textContent = t('zoneLabel') + ':';
    dock.appendChild(lbl);

    var zones = [
      { href: pageHref('landing.html'), text: t('zoneMap') },
      { href: pageHref(todayPageForTrack(track)), text: t('zoneToday') },
    ];

    if (isPostReadPage()) {
      zones.push(
        { href: pageHref('ai-qna.html', readingContextQuery()), text: t('zoneQna') },
        { href: pageHref('ai-tutor.html', readingContextQuery()), text: t('zoneAi') }
      );
    }

    zones.forEach(function (z) {
      var demo = z.demo && !isPostReadPage();
      var a = mkLink(z.href, z.text + (demo ? ' ·' + t('demoTag') : ''), demo ? 'page-nav-btn--demo' : '');
      dock.appendChild(a);
    });

    if (inHubContentFrame()) {
      var shell = mkLink(fullShellHref(track), t('fullShell'), 'page-nav-btn--shell');
      shell.target = '_blank';
      shell.rel = 'noopener noreferrer';
      shell.title = '完整跑道：兒童／成人、單語／雙語（新分頁）';
      dock.appendChild(shell);
    }

    wrap.appendChild(dock);
  }

  function renderSupplyExtras(bar) {
    var q = new URLSearchParams(global.location.search);
    if (q.get('passage') || q.get('ref')) {
      var readOpts =
        'book=' +
        encodeURIComponent(q.get('book') || '1') +
        '&chapter=' +
        encodeURIComponent(q.get('chapter') || '1');
      if (q.get('track')) readOpts += '&track=' + encodeURIComponent(q.get('track'));
      bar.appendChild(mkLink(pageHref('reader-multilang.html', readOpts), t('backRead'), 'page-nav-btn--track'));
    }
    bar.appendChild(mkLink(pageHref('landing.html'), t('home'), 'page-nav-btn--home'));
  }

  function render() {
    if (shouldSkip()) return;
    if (global.document.getElementById('pageNavChrome')) return;

    var q = new URLSearchParams(global.location.search);
    var track = q.get('track') || '';
    var name = pageName();
    var isSupply = /\/supply\//i.test(global.location.pathname || '');

    var wrap = global.document.createElement('div');
    wrap.id = 'pageNavChrome';
    wrap.className = 'page-nav-chrome';

    renderBreadcrumb(wrap);

    var bar = global.document.createElement('nav');
    bar.id = 'pageNavBar';
    bar.className = 'page-nav-bar';
    bar.setAttribute('aria-label', 'Page navigation');

    bar.appendChild(mkBtn(t('back'), goBack));
    bar.appendChild(
      mkBtn(t('forward'), function () {
        try {
          global.history.forward();
        } catch (eF) {}
      })
    );

    if (track && TRACK_PAGES[track] && pageName() !== TRACK_PAGES[track].toLowerCase()) {
      var extra = '';
      if (track === 'theme' && q.get('theme')) extra = 'focus=' + encodeURIComponent(q.get('theme'));
      bar.appendChild(mkLink(pageHref(TRACK_PAGES[track], extra), t('track'), 'page-nav-btn--track'));
    }

    if (name === 'read-done.html' && track) {
      var readBack = pageHref('reader-multilang.html', global.location.search.replace(/^\?/, ''));
      bar.appendChild(mkLink(readBack, t('backRead'), 'page-nav-btn--track'));
    }

    if (!isSupply) {
      bar.appendChild(mkLink(pageHref('landing.html'), t('home'), 'page-nav-btn--home'));
    } else {
      renderSupplyExtras(bar);
    }

    wrap.appendChild(bar);

    if (!isSupply && name !== 'pacing.html') {
      renderZoneDock(wrap, track);
    }

    global.document.body.classList.add('has-page-nav-chrome');
    global.document.body.insertBefore(wrap, global.document.body.firstChild);
  }

  global.B100PageNav = {
    render: render,
    trackFallbackUrl: trackFallbackUrl,
    inHubContentFrame: inHubContentFrame,
    pageHref: pageHref,
    siteShellPagesPath: siteShellPagesPath,
    fullShellHref: fullShellHref,
  };

  if (global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})(typeof window !== 'undefined' ? window : global);
