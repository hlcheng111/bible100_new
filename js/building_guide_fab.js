/**
 * 總站殼全域浮動鈕：🏛️ 大樓導覽（三扇門 + 游客手冊 + 工具總覽）
 * 僅在 index_v5 等有雙 iframe 的殼頁啟用。
 */
(function (w, d) {
  'use strict';

  var PANEL_ID = 'b100BuildingGuidePanel';
  var BTN_ID = 'b100BuildingGuideFab';

  function closePanel() {
    var panel = d.getElementById(PANEL_ID);
    var btn = d.getElementById(BTN_ID);
    if (panel) panel.classList.remove('open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function togglePanel() {
    var panel = d.getElementById(PANEL_ID);
    var btn = d.getElementById(BTN_ID);
    if (!panel || !btn) return;
    var open = !panel.classList.contains('open');
    panel.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function act(fn) {
    return function (ev) {
      if (ev && ev.preventDefault) ev.preventDefault();
      closePanel();
      fn();
      return false;
    };
  }

  function goLobby() {
    closePanel();
    if (typeof w.loadDefaultChineseMaterials === 'function') {
      w.loadDefaultChineseMaterials();
      return;
    }
    if (w.B100TriangleNav && typeof w.B100TriangleNav.shellGoPair === 'function') {
      w.B100TriangleNav.shellGoPair('languages/index_cn.html', 'languages/landing_new_cn.html');
      return;
    }
    w.location.href = 'languages/landing_new_cn.html';
  }

  function buildPanel() {
    var nav = w.B100TriangleNav;
    if (!nav) return null;

    var panel = d.createElement('div');
    panel.id = PANEL_ID;
    panel.className = 'b100-building-guide-panel';
    panel.setAttribute('role', 'menu');
    panel.setAttribute('aria-label', '大樓導覽選單');

    var title = d.createElement('div');
    title.className = 'b100-bg-panel-title';
    title.textContent = '三扇門 · 都要能走回去';
    panel.appendChild(title);

    var hint = d.createElement('p');
    hint.className = 'b100-bg-panel-hint';
    hint.textContent = '不用找樓層 — 點一扇門即切換側欄與內容';
    panel.appendChild(hint);

    function addBtn(text, handler, cls) {
      var b = d.createElement('button');
      b.type = 'button';
      b.className = 'b100-bg-menu-btn' + (cls ? ' ' + cls : '');
      b.textContent = text;
      b.setAttribute('role', 'menuitem');
      b.addEventListener('click', act(handler));
      panel.appendChild(b);
    }

    addBtn(nav.doors.planning.label + ' · ' + nav.doors.planning.sub, function () { nav.goDoor('planning'); }, 'door-planning');
    addBtn(nav.doors.journey.label + ' · ' + nav.doors.journey.sub, function () { nav.goDoor('journey'); }, 'door-journey');
    addBtn(nav.doors.daily.label + ' · ' + nav.doors.daily.sub, function () { nav.goDoor('daily'); }, 'door-daily');

    var sep = d.createElement('div');
    sep.className = 'b100-bg-sep';
    sep.textContent = '導覽與工具';
    panel.appendChild(sep);

    addBtn(nav.extras.handbook.label, function () { nav.goExtra('handbook'); });
    addBtn(nav.extras.guide.label, function () { nav.goExtra('guide'); });
    addBtn(nav.extras.tools.label, function () {
      if (typeof w.openToolsOverview === 'function') w.openToolsOverview();
      else nav.goExtra('tools');
    });

    addBtn('🏠 回一樓大廳（教材首頁）', goLobby, 'door-lobby');

    return panel;
  }

  function init() {
    if (!d.getElementById('sidebarFrame') || !d.getElementById('contentFrame')) return;
    if (d.getElementById(BTN_ID)) return;

    var fab = d.createElement('button');
    fab.type = 'button';
    fab.id = BTN_ID;
    fab.className = 'b100-building-guide-fab';
    fab.setAttribute('aria-label', '大樓導覽');
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-controls', PANEL_ID);
    fab.innerHTML = '<span class="b100-bg-fab-icon">🏛️</span><span class="b100-bg-fab-text">大樓導覽</span>';
    fab.addEventListener('click', function (ev) {
      ev.preventDefault();
      togglePanel();
    });

    var panel = buildPanel();
    if (!panel) return;

    d.body.appendChild(panel);
    d.body.appendChild(fab);

    d.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!t || !t.closest) return;
      if (t.closest('#' + BTN_ID) || t.closest('#' + PANEL_ID)) return;
      closePanel();
    });
    d.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') closePanel();
    });
  }

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  w.B100BuildingGuideFab = { init: init, close: closePanel };
})(window, document);
