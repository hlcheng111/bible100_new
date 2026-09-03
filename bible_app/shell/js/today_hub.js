/** 今日關卡頁渲染 */
(function (global) {
  function esc(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function renderRing(ring) {
    var root = document.getElementById('coachRing');
    if (!root) return;
    var steps = ['started', 'read', 'reflect', 'shared'];
    var labels = [
      global.B100CoachI18n.t('ring_started'),
      global.B100CoachI18n.t('ring_read'),
      global.B100CoachI18n.t('ring_reflect'),
      global.B100CoachI18n.t('ring_shared'),
    ];
    root.innerHTML = '<p class="coach-block__label">' + esc(global.B100CoachI18n.t('ring_label')) + '</p>' +
      '<ul class="coach-ring" role="list">' +
      steps.map(function (step, i) {
        return '<li class="coach-ring__seg' + (ring[step] ? ' on' : '') + '" title="' + esc(labels[i]) + '"></li>';
      }).join('') +
      '</ul>';
  }

  function render(today) {
    var t = global.B100CoachI18n.t;
    document.documentElement.lang = global.B100CoachI18n.locale() === 'zh-Hant' ? 'zh-Hant' : global.B100CoachI18n.locale();
    var titleEl = document.getElementById('todayTitle');
    if (titleEl) titleEl.textContent = t('today_title');
    var leadEl = document.getElementById('todayLead');
    if (leadEl) leadEl.textContent = t('today_lead');

    var state = global.B100CoachState.load();
    if (today.unitKey) global.B100CoachState.setDailyUnit(today.unitKey);
    state = global.B100CoachState.load();
    renderRing(state.daily.ring);

    var streakEl = document.getElementById('todayStreak');
    if (streakEl) {
      streakEl.textContent = today.streak > 0
        ? t('streak_great', { n: today.streak })
        : t('streak_start');
    }

    var mainTitle = document.getElementById('todayMainTitle');
    if (mainTitle) mainTitle.textContent = today.title;
    var sub = document.getElementById('todaySubtitle');
    if (sub) sub.textContent = today.subtitle + ' · ' + t('minutes', { n: today.minutes });

    var gvRef = document.getElementById('todayGoldenRef');
    if (gvRef) gvRef.textContent = today.goldenRef;
    var gvText = document.getElementById('todayGoldenText');
    if (gvText) gvText.textContent = today.goldenText || '';
    var ch = document.getElementById('todayChallenge');
    if (ch) ch.textContent = today.challenge;

    var readUrl = global.B100CoachKernel.readerUrl(today);
    var btn = document.getElementById('todayStartBtn');
    if (btn) {
      btn.textContent = today.doneToday ? t('btn_done') : t('btn_start');
      btn.classList.toggle('is-done', !!today.doneToday);
      btn.disabled = !!today.doneToday;
      btn.onclick = function () {
        if (today.doneToday) return;
        location.href = readUrl;
      };
    }
  }

  function init() {
    if (!global.B100CoachKernel) return;
    global.B100CoachKernel.resolveToday().then(render).catch(function () {
      var el = document.getElementById('todayMainTitle');
      if (el) el.textContent = '…';
    });
  }

  global.B100TodayHub = { init: init, render: render };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
