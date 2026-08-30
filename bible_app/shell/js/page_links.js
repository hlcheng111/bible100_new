/** 賽道 → 讀經頁連結（帶齊 book/chapter/track，避免落到創 1:1） */
(function (global) {
  function locale() {
    return global.B100LocalePick
      ? global.B100LocalePick.getLocale()
      : (new URLSearchParams(location.search).get('locale') || 'zh-Hant');
  }

  function viewMode() {
    try {
      var raw = localStorage.getItem('bible_shell_state');
      if (raw) {
        var st = JSON.parse(raw);
        if (st.bibleView === 'single' || st.bibleView === 'dual') return st.bibleView;
      }
    } catch (e) {}
    var q = new URLSearchParams(location.search);
    return q.get('view') === 'single' ? 'single' : 'dual';
  }

  function shellPageHref(rel) {
    if (global.B100LiveDb && global.B100LiveDb.resolvePageHref) {
      return global.B100LiveDb.resolvePageHref(rel);
    }
    return rel;
  }

  function bibleReadUrl(opts) {
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
    q.set('locale', opts.locale || locale());
    q.set('view', opts.view || viewMode());
    var rel = 'bible66.html?' + q.toString();
    if (location.protocol === 'file:') {
      if (/\/app\/assets\/bible\//i.test((location.pathname || '').replace(/\\/g, '/'))) {
        return 'read66.html?' + q.toString();
      }
      try {
        return new URL('../../app/assets/bible/read66.html?' + q.toString(), location.href).href;
      } catch (eRel) {
        return '../../app/assets/bible/read66.html?' + q.toString();
      }
    }
    return shellPageHref(rel);
  }

  function bibleReadAnchorAttrs() {
    return '';
  }

  function decorateReadAnchor(el) {
    return el;
  }

  global.B100PageLinks = {
    bibleReadUrl: bibleReadUrl,
    bibleReadAnchorAttrs: bibleReadAnchorAttrs,
    decorateReadAnchor: decorateReadAnchor,
    viewMode: viewMode,
    shellPageHref: shellPageHref
  };
})(window);
