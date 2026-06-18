/**
 * Persona × Track 導覽矩陣 — 防呆與 Fallback（避免空白頁）
 */
(function (global) {
  var MATRIX = {
    kids: {
      bible66: { allowed: true, page: 'pages/bible66.html', zone: 'today' },
      '30day': { allowed: true, page: 'pages/track-30day.html' },
      golden: { allowed: true, page: 'pages/track-golden.html' },
      theme: { allowed: true, page: 'pages/track-theme.html' },
    },
    adult: {
      bible66: { allowed: true, page: 'pages/bible66.html' },
      '30day': { allowed: true, page: 'pages/track-30day.html' },
      golden: { allowed: true, page: 'pages/track-golden.html' },
      theme: { allowed: true, page: 'pages/track-theme.html' },
    },
    seeker: {
      bible66: { allowed: true, page: 'pages/bible66.html' },
      '30day': { allowed: true, page: 'pages/track-30day.html' },
      golden: { allowed: true, page: 'pages/track-golden.html' },
      theme: { allowed: true, page: 'pages/track-theme.html' },
    },
    parent: {
      bible66: { allowed: true, page: 'pages/bible66.html' },
      '30day': { allowed: true, page: 'pages/track-30day.html' },
      golden: { allowed: true, page: 'pages/track-golden.html' },
      theme: { allowed: true, page: 'pages/track-theme.html' },
    },
  };

  var DEFAULT_TRACK_PAGE = {
    bible66: 'pages/bible66.html',
    '30day': 'pages/track-30day.html',
    golden: 'pages/track-golden.html',
    theme: 'pages/track-theme.html',
  };

  function resolve(persona, track, locale) {
    var p = MATRIX[persona] || MATRIX.adult;
    var rule = p[track] || { allowed: true, page: DEFAULT_TRACK_PAGE[track] || 'pages/home.html' };
    var loc = locale || 'zh-Hant';
    var toast = '';
    if (rule.toast) {
      toast = rule.toast[loc] || rule.toast.en || rule.toast['zh-Hant'] || '';
    }
    return {
      allowed: rule.allowed !== false,
      page: rule.page || DEFAULT_TRACK_PAGE[track],
      extra: rule.extra || null,
      zone: rule.zone || '',
      toast: toast,
      isFallback: !!rule.fallback,
    };
  }

  function isTrackAllowed(persona, track) {
    var r = resolve(persona, track);
    return r.allowed;
  }

  function showToast(msg) {
    if (!msg) return;
    var el = document.getElementById('navMatrixToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'navMatrixToast';
      el.className = 'nav-matrix-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('show'); }, 5200);
  }

  global.B100NavMatrix = {
    MATRIX: MATRIX,
    resolve: resolve,
    isTrackAllowed: isTrackAllowed,
    showToast: showToast,
    DEFAULT_TRACK_PAGE: DEFAULT_TRACK_PAGE,
  };
})(typeof window !== 'undefined' ? window : global);
