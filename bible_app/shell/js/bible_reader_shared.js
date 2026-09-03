/**
 * 四語閱讀器 SSOT：顯示模式、版本元資料、讀經 URL 建構
 * 供 page_links、賽道頁與 bible_reader_core 共用
 */
(function (global) {
  var STORAGE_KEY = 'bible_shell_state';
  var DEFAULT_VIEW = 'dual';
  var VALID_VIEWS = { single: 1, dual: 1, quad: 1 };
  var NARROW_MQ = '(max-width: 720px)';

  var LOCALE_PAIRS = {
    'zh-Hant': { left: 'cuv_trust', right: 'kjv', colL: 'col_zh', colR: 'col_en', hint: 'bible_hint_zh' },
    en: { left: 'kjv', right: 'cuv_trust', colL: 'col_en', colR: 'col_zh', hint: 'bible_hint_en' },
    vi: { left: 'vi_1934', right: 'kjv', colL: 'col_vi', colR: 'col_en', hint: 'bible_hint_vi' },
    id: { left: 'id_ayt', right: 'kjv', colL: 'col_id', colR: 'col_en', hint: 'bible_hint_id' },
  };

  var BIBLE_VERSIONS = [
    { version: 'cuv_trust', col: 'col_zh', sample: 'data', missing: '繁中' },
    { version: 'kjv', col: 'col_en', sample: 'en', missing: 'English' },
    { version: 'vi_1934', col: 'col_vi', sample: 'vi', missing: '越文' },
    { version: 'id_ayt', col: 'col_id', sample: 'id', missing: '印尼文' },
  ];

  function normalizeView(mode) {
    return VALID_VIEWS[mode] ? mode : DEFAULT_VIEW;
  }

  function isNarrowViewport() {
    if (typeof global.matchMedia !== 'function') return false;
    return global.matchMedia(NARROW_MQ).matches;
  }

  function getViewMode() {
    var q = new URLSearchParams(location.search);
    var qv = q.get('view');
    if (qv && VALID_VIEWS[qv]) return qv;
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var st = JSON.parse(raw);
        if (st.bibleView && VALID_VIEWS[st.bibleView]) return st.bibleView;
      }
    } catch (e) {}
    return DEFAULT_VIEW;
  }

  /** 窄螢幕自動將 quad 降級為 dual，避免四欄擠爆 */
  function getEffectiveViewMode() {
    var mode = getViewMode();
    if (mode === 'quad' && isNarrowViewport()) return 'dual';
    return mode;
  }

  function persistViewMode(mode) {
    mode = normalizeView(mode);
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var st = raw ? Object.assign({}, JSON.parse(raw)) : {};
      st.bibleView = mode;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(st));
    } catch (e) {}
    return mode;
  }

  function setViewMode(mode, opts) {
    opts = opts || {};
    mode = normalizeView(mode);
    if (!opts.skipStorage) persistViewMode(mode);
    if (!opts.skipUrl && typeof location !== 'undefined' && location.href) {
      try {
        var u = new URL(location.href);
        u.searchParams.set('view', mode);
        if (opts.replace !== false) {
          history.replaceState(null, '', u.pathname + u.search + u.hash);
        } else {
          history.pushState(null, '', u.pathname + u.search + u.hash);
        }
      } catch (e) {}
    }
    if (!opts.skipNotify && global.parent !== global) {
      try {
        global.parent.postMessage({ type: 'bible100-shell-bible-view', view: mode }, '*');
      } catch (e) {}
    }
    return mode;
  }

  function localeFromPage(opts) {
    if (opts && opts.locale) return opts.locale;
    if (global.B100LocalePick && global.B100LocalePick.getLocale) {
      return global.B100LocalePick.getLocale();
    }
    if (global.PageLocale && global.PageLocale.getLocale) {
      return global.PageLocale.getLocale();
    }
    var q = new URLSearchParams(location.search);
    return q.get('locale') || 'zh-Hant';
  }

  function buildReadUrl(opts) {
    opts = opts || {};
    var q = new URLSearchParams();
    q.set('book', String(opts.bookId != null ? opts.bookId : 1));
    q.set('chapter', String(opts.chapter != null ? opts.chapter : 1));
    if (opts.track) q.set('track', opts.track);
    if (opts.day != null) q.set('day', String(opts.day));
    if (opts.gv) q.set('gv', opts.gv);
    if (opts.theme) q.set('theme', opts.theme);
    if (opts.unit != null) q.set('unit', String(opts.unit));
    if (opts.verse != null) q.set('verse', String(opts.verse));
    q.set('locale', localeFromPage(opts));
    q.set('view', opts.view || getViewMode());
    return 'bible66.html?' + q.toString();
  }

  function pairForLocale(loc) {
    return LOCALE_PAIRS[loc] || LOCALE_PAIRS.en;
  }

  function versionMeta(version) {
    return BIBLE_VERSIONS.find(function (v) { return v.version === version; }) || BIBLE_VERSIONS[0];
  }

  global.B100BibleReader = {
    STORAGE_KEY: STORAGE_KEY,
    DEFAULT_VIEW: DEFAULT_VIEW,
    VALID_VIEWS: ['single', 'dual', 'quad'],
    NARROW_MQ: NARROW_MQ,
    LOCALE_PAIRS: LOCALE_PAIRS,
    BIBLE_VERSIONS: BIBLE_VERSIONS,
    isNarrowViewport: isNarrowViewport,
    getViewMode: getViewMode,
    getEffectiveViewMode: getEffectiveViewMode,
    setViewMode: setViewMode,
    persistViewMode: persistViewMode,
    normalizeView: normalizeView,
    buildReadUrl: buildReadUrl,
    pairForLocale: pairForLocale,
    versionMeta: versionMeta,
  };
})(window);
