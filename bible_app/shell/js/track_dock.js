/**
 * 賽道底欄 — 全頁模式切換（無 iframe 殼）
 */
(function () {
  var TRACKS = [
    { id: '30day', href: 'track-30day.html', icon: '📅', label: '三十日' },
    { id: 'bible66', href: 'bible66.html', icon: '📖', label: '66卷' },
    { id: 'golden', href: 'track-golden.html', icon: '⭐', label: '金句' },
    { id: 'theme', href: 'track-theme.html', icon: '🎯', label: '主題' },
  ];
  var STORAGE_KEY = 'bible_shell_state';
  var DEFAULT = { locale: 'zh-Hant', persona: 'kids', track: '30day' };

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return Object.assign({}, DEFAULT, JSON.parse(raw));
    } catch (e) {}
    return Object.assign({}, DEFAULT);
  }

  function saveTrack(id) {
    var s = loadState();
    s.track = id;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }

  function qs(extra) {
    var s = loadState();
    var q = new URLSearchParams(location.search);
    var loc = q.get('locale') || s.locale || 'zh-Hant';
    var persona = q.get('persona') || s.persona || 'kids';
    var p = new URLSearchParams();
    p.set('locale', loc);
    p.set('persona', persona);
    p.set('track', extra || s.track);
    return '?' + p.toString();
  }

  function currentTrackId() {
    var body = document.body;
    if (body && body.getAttribute('data-track')) return body.getAttribute('data-track');
    var path = (location.pathname || '').replace(/\\/g, '/');
    if (path.indexOf('bible66') >= 0) return 'bible66';
    if (path.indexOf('track-30day') >= 0) return '30day';
    if (path.indexOf('track-golden') >= 0) return 'golden';
    if (path.indexOf('track-theme') >= 0) return 'theme';
    return loadState().track || '30day';
  }

  function mount() {
    var cur = currentTrackId();
    saveTrack(cur);
    var nav = document.createElement('nav');
    nav.className = 'track-dock';
    nav.setAttribute('aria-label', '賽道');
    var html = '<div class="track-dock__inner">';
    html += '<span class="track-dock__brand">🦁</span>';
    TRACKS.forEach(function (t) {
      var on = t.id === cur ? ' track-dock__btn--on' : '';
      html += '<a class="track-dock__btn' + on + '" href="' + t.href + qs(t.id) + '">' +
        '<span class="track-dock__ico">' + t.icon + '</span>' +
        '<span class="track-dock__lbl">' + t.label + '</span></a>';
    });
    html += '<button type="button" class="track-dock__btn track-dock__more" id="dockMore" title="語言與說明">⋯</button>';
    html += '</div>';
    nav.innerHTML = html;
    document.body.appendChild(nav);
    document.body.classList.add('has-track-dock');

    var panel = document.createElement('div');
    panel.id = 'dockPanel';
    panel.className = 'track-dock-panel';
    panel.hidden = true;
    panel.innerHTML =
      '<div class="track-dock-panel__card">' +
      '<p class="track-dock-panel__title">語言</p>' +
      '<div class="track-dock-panel__row" id="dockLang"></div>' +
      '<p class="track-dock-panel__title">說明</p>' +
      '<a href="guide-howto.html' + qs() + '">操作說明</a>' +
      '<a href="guide-idea.html' + qs() + '">本站理念</a>' +
      '<button type="button" class="track-dock-panel__close" id="dockClose">關閉</button></div>';
    document.body.appendChild(panel);

    var langs = [
      { v: 'zh-Hant', l: '繁中' },
      { v: 'en', l: 'EN' },
      { v: 'vi', l: 'VI' },
      { v: 'id', l: 'ID' },
    ];
    var st = loadState();
    var langRoot = document.getElementById('dockLang');
    langs.forEach(function (L) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = L.l;
      b.className = 'track-dock-lang' + (st.locale === L.v ? ' on' : '');
      b.addEventListener('click', function () {
        var s = loadState();
        s.locale = L.v;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
        var u = new URL(location.href);
        u.searchParams.set('locale', L.v);
        location.href = u.toString();
      });
      langRoot.appendChild(b);
    });

    document.getElementById('dockMore').addEventListener('click', function () {
      panel.hidden = !panel.hidden;
    });
    document.getElementById('dockClose').addEventListener('click', function () {
      panel.hidden = true;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
