/* Bible App Shell — 頂欄 + iframe 賽道 */
(function () {
  var global = typeof window !== 'undefined' ? window : {};
  var STORAGE_KEY = 'bible_shell_state';
  var STATE_SCHEMA = 3;
  var RESUME_MS = 7 * 24 * 60 * 60 * 1000;
  var DEPRECATED_FRAMES = /app-hub\.html|home\.html|landing-dashboard/i;
  var DEFAULT = {
    schemaVersion: STATE_SCHEMA,
    locale: 'zh-Hant',
    persona: 'kids',
    track: 'plan1y',
    zone: '',
    footer: '',
    bibleView: 'dual',
    lastFrame: '',
    lastFrameExtra: null,
    lastFrameAt: 0,
  };

  var ZONE_PAGES = {
    pacing: 'pages/pacing.html',
    today: 'pages/track-plan1y.html',
    bible: 'pages/bible66.html',
    qna: 'pages/ai-qna.html',
    ai: 'pages/ai-tutor.html',
  };

  var TRACK_PAGES = {
    bible66: 'pages/bible66.html',
    plan1y: 'pages/track-plan1y.html',
    plan3y: 'pages/track-plan3y.html',
    '30day': 'pages/track-30day.html',
    golden: 'pages/track-golden.html',
    theme: 'pages/track-theme.html',
    landing: 'pages/landing.html',
  };

  var FOOTER_PAGES = {
    idea: 'pages/guide-idea.html',
    methods: 'pages/guide-methods.html',
    howto: 'pages/guide-howto.html',
    demo: 'pages/guide-demo.html',
  };

  var frame = document.getElementById('contentFrame');
  var state = loadState();

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = Object.assign({}, DEFAULT, JSON.parse(raw));
        if (!parsed.schemaVersion || parsed.schemaVersion < STATE_SCHEMA) {
          parsed.lastFrame = '';
          parsed.lastFrameExtra = null;
          parsed.lastFrameAt = 0;
          parsed.track = parsed.track || 'plan1y';
          parsed.schemaVersion = STATE_SCHEMA;
        }
        return sanitizeState(parsed);
      }
    } catch (e) {}
    return Object.assign({}, DEFAULT);
  }

  function isTrackListPage(path) {
    return /track-30day|track-golden|track-theme|track-plan1y|track-plan3y/i.test(path || '');
  }

  function isBiblePage(path) {
    return /bible66\.html|read66\.html/i.test(path || '');
  }

  function isValidResume(path, extra) {
    if (!path) return false;
    if (DEPRECATED_FRAMES.test(path)) return false;
    if (!isBiblePage(path)) return true;
    extra = extra || {};
    var book = parseInt(extra.book, 10);
    var chapter = parseInt(extra.chapter, 10);
    if (!book || !chapter) return false;
    if (book === 1 && chapter === 1 && extra.track === '30day' && extra.day) {
      if (String(extra.day) !== '1') return false;
    }
    return true;
  }

  function sanitizeState(st) {
    if (st.lastFrame && !isValidResume(st.lastFrame, st.lastFrameExtra)) {
      st.lastFrame = '';
      st.lastFrameExtra = null;
      st.lastFrameAt = 0;
    }
    return st;
  }

  function cacheBustQs() {
    return '_cv=' + encodeURIComponent(global.B100_SHELL_ASSET_V || String(Date.now()));
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function queryParams(extra) {
    var q = new URLSearchParams();
    q.set('locale', state.locale);
    q.set('persona', state.persona);
    q.set('track', state.track);
    q.set('view', state.bibleView || 'dual');
    if (extra) {
      Object.keys(extra).forEach(function (k) {
        if (k === 'locale' || k === 'persona' || k === 'view') return;
        q.set(k, extra[k]);
      });
    }
    return q.toString();
  }

  function parseFramePath(raw) {
    var qIdx = raw.indexOf('?');
    var path = qIdx >= 0 ? raw.slice(0, qIdx) : raw;
    var extra = {};
    if (qIdx >= 0) {
      new URLSearchParams(raw.slice(qIdx + 1)).forEach(function (v, k) {
        extra[k] = v;
      });
    }
    return { path: path, extra: extra };
  }

  function rememberFrame(path, extra) {
    state.lastFrame = path;
    state.lastFrameExtra = extra || null;
    state.lastFrameAt = Date.now();
    if (extra && extra.track) state.track = extra.track;
    saveState();
  }

  function setFrame(path, extra, skipRemember) {
    if (!frame || !path) return;
    var basePath = path.split('?')[0];
    var merged = Object.assign({}, extra || {});
    if (path.indexOf('?') >= 0) {
      new URLSearchParams(path.slice(path.indexOf('?') + 1)).forEach(function (v, k) {
        merged[k] = v;
      });
    }
    var rel = basePath + '?' + queryParams(merged) + '&' + cacheBustQs();
    if (!skipRemember) rememberFrame(basePath, merged);
    if (location.protocol === 'file:' && /bible66\.html/i.test(basePath)) {
      rel = '../app/assets/bible/read66.html?' + queryParams(merged) + '&' + cacheBustQs();
    }
    if (global.B100ShellPaths && global.B100ShellPaths.page) {
      frame.src = global.B100ShellPaths.page(rel);
    } else {
      frame.src = rel;
    }
  }

  function listenFrameSync() {
    window.addEventListener('message', function (ev) {
      if (!ev.data || ev.data.type !== 'bible100-shell-frame') return;
      var parsed = parseFramePath(ev.data.path || '');
      if (!parsed.path || parsed.path.indexOf('pages/') !== 0) return;
      if (!isValidResume(parsed.path, parsed.extra)) return;
      state.lastFrame = parsed.path;
      state.lastFrameExtra = parsed.extra;
      state.lastFrameAt = Date.now();
      if (parsed.extra.track) state.track = parsed.extra.track;
      saveState();
    });
  }

  function shouldResume() {
    if (!state.lastFrame || !state.lastFrameAt) return false;
    return Date.now() - state.lastFrameAt < RESUME_MS;
  }

  function resolveTrackPage(trackId) {
    return global.B100NavMatrix
      ? global.B100NavMatrix.resolve(state.persona, trackId, state.locale)
      : {
          page: TRACK_PAGES[trackId] || TRACK_PAGES['plan1y'],
          zone: trackId === 'bible66' ? 'bible' : '',
          extra: null,
          toast: '',
        };
  }

  function enterTrack(trackId, extra) {
    state.track = trackId;
    state.footer = '';
    var resolved = resolveTrackPage(trackId);
    state.zone = resolved.zone || (trackId === 'bible66' ? 'bible' : '');
    saveState();
    syncUI();
    setFrame(resolved.page, extra || resolved.extra || null);
    if (resolved.toast && global.B100NavMatrix && global.B100NavMatrix.showToast) {
      global.B100NavMatrix.showToast(resolved.toast);
    }
    closeMore();
  }

  function applyI18n() {
    var loc = state.locale;
    document.documentElement.lang = loc === 'zh-Hant' ? 'zh-Hant' : loc;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      el.textContent = BibleShellI18n.t(loc, key);
    });
    document.title = BibleShellI18n.t(loc, 'appTitle');
    var titleEl = document.getElementById('shellTitle');
    if (titleEl) titleEl.textContent = BibleShellI18n.t(loc, 'appTitle');
  }

  function setActive(group, value) {
    document.querySelectorAll('[data-group="' + group + '"]').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-value') === value);
    });
  }

  function closeMore() {
    var panel = document.getElementById('morePanel');
    var btn = document.getElementById('btnMore');
    if (panel) panel.hidden = true;
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function toggleMore() {
    var panel = document.getElementById('morePanel');
    var btn = document.getElementById('btnMore');
    if (!panel) return;
    var open = panel.hidden;
    panel.hidden = !open;
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function goHome() {
    state.footer = '';
    state.zone = '';
    saveState();
    syncUI();
    setFrame(TRACK_PAGES.landing);
    closeMore();
  }

  function reloadContent(opts) {
    opts = opts || {};
    if (state.footer && FOOTER_PAGES[state.footer]) {
      setFrame(FOOTER_PAGES[state.footer]);
      return;
    }
    if (state.zone && ZONE_PAGES[state.zone]) {
      setFrame(ZONE_PAGES[state.zone]);
      return;
    }
    if (opts.forceTrackList || isTrackListPage(state.lastFrame)) {
      enterTrack(state.track || 'plan1y');
      return;
    }
    if (!opts.forceTrackList && shouldResume() && state.lastFrame && isValidResume(state.lastFrame, state.lastFrameExtra)) {
      setFrame(state.lastFrame, state.lastFrameExtra || null);
      return;
    }
    enterTrack(state.track || 'plan1y');
  }

  function pick(group, value) {
    if (group === 'footer') {
      state.footer = value;
      state.zone = '';
      setFrame(FOOTER_PAGES[value] || FOOTER_PAGES.howto);
      saveState();
      syncUI();
      closeMore();
      return;
    }

    if (group === 'locale') {
      state.locale = value;
      saveState();
      syncUI();
      if (isTrackListPage(state.lastFrame)) {
        enterTrack(state.track || 'plan1y');
      } else if (isBiblePage(state.lastFrame) && isValidResume(state.lastFrame, state.lastFrameExtra)) {
        setFrame(state.lastFrame, state.lastFrameExtra || null);
      } else {
        reloadContent({ forceTrackList: true });
      }
      return;
    }

    if (group === 'bibleView') {
      state.bibleView = value;
      saveState();
      syncUI();
      if (isBiblePage(state.lastFrame) && isValidResume(state.lastFrame, state.lastFrameExtra)) {
        setFrame(state.lastFrame, state.lastFrameExtra || null);
      } else if (isTrackListPage(state.lastFrame)) {
        enterTrack(state.track || 'plan1y');
      } else {
        reloadContent({ forceTrackList: true });
      }
      closeMore();
      return;
    }

    if (group === 'persona') {
      state.persona = value;
      state.footer = '';
      saveState();
      syncUI();
      closeMore();
      enterTrack(state.track || 'plan1y');
      return;
    }

    if (group === 'track') {
      enterTrack(value);
      return;
    }

    if (group === 'zone') {
      state.footer = '';
      state.zone = value;
      saveState();
      syncUI();
      setFrame(ZONE_PAGES[value] || ZONE_PAGES.today);
      closeMore();
      return;
    }

    saveState();
    syncUI();
  }

  function syncUI() {
    applyI18n();
    setActive('locale', state.locale);
    setActive('persona', state.persona);
    setActive('track', state.track);
    setActive('zone', state.zone);
    setActive('bibleView', state.bibleView || 'dual');
    if (global.B100NavMatrix) {
      document.querySelectorAll('[data-group="track"]').forEach(function (btn) {
        var v = btn.getAttribute('data-value');
        var ok = global.B100NavMatrix.isTrackAllowed(state.persona, v);
        btn.disabled = !ok;
        btn.classList.toggle('tab-disabled', !ok);
      });
    }
  }

  function bindTabs() {
    document.querySelectorAll('[data-group]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        pick(btn.getAttribute('data-group'), btn.getAttribute('data-value'));
      });
    });
    var homeBtn = document.getElementById('btnHome');
    if (homeBtn) {
      homeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        goHome();
      });
    }
    var moreBtn = document.getElementById('btnMore');
    if (moreBtn) moreBtn.addEventListener('click', toggleMore);

    var readerBtn = document.getElementById('btnReaderHub');
    if (readerBtn) {
      readerBtn.addEventListener('click', function () {
        closeMore();
        var studyUrl = 'bible_study/comprehensive_exegesis_reader.html?book=創世記&chapter=1';
        try {
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'navigate', url: studyUrl }, '*');
            return;
          }
        } catch (eNav) {}
        if (global.B100Bridge && global.B100Bridge.studyReaderUrl) {
          window.open(global.B100Bridge.studyReaderUrl(), '_blank', 'noopener');
        } else {
          setFrame('pages/bible66.html', { track: 'study', locale: state.locale });
        }
      });
    }

    var params = new URLSearchParams(location.search);
    if (params.get('fresh') === '1') {
      state.lastFrame = '';
      state.lastFrameExtra = null;
      state.lastFrameAt = 0;
      saveState();
    }
    if (params.get('track') && TRACK_PAGES[params.get('track')]) {
      state.track = params.get('track');
    }
    if (params.get('embed') === 'hub') {
      var hubHome = global.B100Bridge && global.B100Bridge.isRepoRootServe()
        ? '/index_v5.html'
        : '../../index_v5.html';
      homeBtn.setAttribute('href', hubHome);
      homeBtn.setAttribute('data-i18n', 'homeHub');
    }
  }

  function init() {
    bindTabs();
    listenFrameSync();
    syncUI();
    var params = new URLSearchParams(location.search);
    if (params.get('track') && TRACK_PAGES[params.get('track')]) {
      enterTrack(params.get('track'));
    } else if (state.footer && FOOTER_PAGES[state.footer]) {
      setFrame(FOOTER_PAGES[state.footer]);
    } else if (shouldResume() && state.lastFrame && isValidResume(state.lastFrame, state.lastFrameExtra)) {
      setFrame(state.lastFrame, state.lastFrameExtra || null);
    } else {
      goHome();
    }
    if (frame && global.BibleFontSize && global.BibleFontSize.hookIframe) {
      global.BibleFontSize.hookIframe(frame);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.BibleShellNav = {
    getState: function () { return state; },
    setFrame: setFrame,
    enterTrack: enterTrack,
    goHome: goHome,
  };
})();
