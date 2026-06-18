/**
 * index 入口：直接進入賽道全頁（無 iframe 殼）
 */
(function (global) {
  var TRACK_PAGES = {
    bible66: 'pages/bible66.html',
    '30day': 'pages/track-30day.html',
    golden: 'pages/track-golden.html',
    theme: 'pages/track-theme.html',
  };
  var STORAGE_KEY = 'bible_shell_state';
  var DEFAULT = { locale: 'zh-Hant', persona: 'kids', track: '30day' };

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return Object.assign({}, DEFAULT, JSON.parse(raw));
    } catch (e) {}
    return Object.assign({}, DEFAULT);
  }

  function trackUrl(trackId, search) {
    var s = loadState();
    var params = new URLSearchParams(search || '');
    var track = trackId || params.get('track') || s.track || '30day';
    if (!TRACK_PAGES[track]) track = '30day';
    s.track = track;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    var q = new URLSearchParams();
    q.set('locale', params.get('locale') || s.locale);
    q.set('persona', params.get('persona') || s.persona);
    q.set('track', track);
    return TRACK_PAGES[track] + '?' + q.toString();
  }

  function isIndexPage() {
    var p = (location.pathname || '').replace(/\\/g, '/');
    return /\/shell\/index\.html$/i.test(p) || /\/shell\/?$/i.test(p);
  }

  function boot() {
    var params = new URLSearchParams(location.search);
    if (!isIndexPage()) return;

    if (params.get('embed') === 'hub') {
      var wrap = document.createElement('div');
      wrap.style.cssText = 'margin:0;height:100vh';
      var frame = document.createElement('iframe');
      frame.style.cssText = 'width:100%;height:100%;border:0';
      frame.title = '聖經跑道';
      frame.src = trackUrl(params.get('track'), location.search);
      wrap.appendChild(frame);
      document.body.innerHTML = '';
      document.body.appendChild(wrap);
      return;
    }

    location.replace(trackUrl(params.get('track'), location.search));
  }

  global.B100ShellEntry = { trackUrl: trackUrl, TRACK_PAGES: TRACK_PAGES };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
