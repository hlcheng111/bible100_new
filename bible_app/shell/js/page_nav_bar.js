/**
 * 跑道子页统一导航：← 回上页 · → 前进 · 🏠 跑道首页
 * 不取代 shell 顶栏 home-pill；landing 页不注入。
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

  var UI = {
    'zh-Hant': { back: '← 回上頁', forward: '→ 前進', home: '🏠 跑道首頁', track: '↩ 回計劃' },
    en: { back: '← Back', forward: '→ Forward', home: '🏠 Track home', track: '↩ Plan' },
    vi: { back: '← Lùi', forward: '→ Tiếp', home: '🏠 Trang chủ', track: '↩ Kế hoạch' },
    id: { back: '← Kembali', forward: '→ Maju', home: '🏠 Beranda', track: '↩ Rencana' },
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

  function inBibleAssets() {
    var p = (global.location.pathname || '').replace(/\\/g, '/');
    return /\/app\/assets\/bible\//i.test(p) || pageName() === 'read66.html';
  }

  function pageHref(name, extraQuery) {
    var prefix = inBibleAssets() ? '../../../shell/pages/' : '';
    var href = prefix + name;
    if (extraQuery) href += (name.indexOf('?') >= 0 ? '&' : '?') + extraQuery.replace(/^\?/, '');
    return href;
  }

  function shouldSkip() {
    var name = pageName();
    if (!name || name === 'landing.html' || name === 'landing-dashboard.html') return true;
    if (global.document.body && global.document.body.classList.contains('page-nav-skip')) return true;
    return false;
  }

  function trackFallbackUrl() {
    var q = new URLSearchParams(global.location.search);
    var track = q.get('track') || '';
    var extra = '';
    if (track === 'theme' && q.get('theme')) extra = 'focus=' + encodeURIComponent(q.get('theme'));
    var name = pageName();
    if (track && TRACK_PAGES[track]) {
      if (name === 'read66.html' || name === 'bible66.html' || name === 'read-done.html') {
        return pageHref(TRACK_PAGES[track], extra);
      }
    }
    if (name === 'bible66.html' && track) return pageHref(TRACK_PAGES[track] || 'landing.html', extra);
    if (/track-plan/.test(name) || /track-30day|track-golden|track-theme/.test(name)) {
      return pageHref('landing.html');
    }
    return pageHref('landing.html');
  }

  function goBack() {
    var fb = trackFallbackUrl();
    var name = pageName();
    if (name === 'read66.html' || name === 'bible66.html') {
      global.location.href = fb;
      return;
    }
    try {
      if (global.history.length > 1) {
        global.history.back();
        return;
      }
    } catch (eHist) {}
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

  function render() {
    if (shouldSkip()) return;
    if (global.document.getElementById('pageNavBar')) return;

    var q = new URLSearchParams(global.location.search);
    var track = q.get('track') || '';

    var bar = global.document.createElement('nav');
    bar.id = 'pageNavBar';
    bar.className = 'page-nav-bar';
    bar.setAttribute('aria-label', 'Page navigation');

    bar.appendChild(mkBtn(t('back'), goBack));
    bar.appendChild(mkBtn(t('forward'), function () {
      try { global.history.forward(); } catch (eF) {}
    }));

    if (track && TRACK_PAGES[track] && pageName() !== TRACK_PAGES[track].toLowerCase()) {
      var extra = '';
      if (track === 'theme' && q.get('theme')) extra = 'focus=' + encodeURIComponent(q.get('theme'));
      var trackLink = global.document.createElement('a');
      trackLink.className = 'page-nav-btn page-nav-btn--track';
      trackLink.href = pageHref(TRACK_PAGES[track], extra);
      trackLink.textContent = t('track');
      bar.appendChild(trackLink);
    }

    var home = global.document.createElement('a');
    home.className = 'page-nav-btn page-nav-btn--home';
    home.href = pageHref('landing.html');
    home.textContent = t('home');
    bar.appendChild(home);

    global.document.body.insertBefore(bar, global.document.body.firstChild);
  }

  global.B100PageNav = { render: render, trackFallbackUrl: trackFallbackUrl };

  if (global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})(typeof window !== 'undefined' ? window : global);
