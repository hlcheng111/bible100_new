/** 智慧導師：週回顧 + 下週建議 */
(function (global) {
  function esc(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function init() {
    var t = global.B100CoachI18n.t;
    document.documentElement.lang = global.B100CoachI18n.locale() === 'zh-Hant' ? 'zh-Hant' : global.B100CoachI18n.locale();

    var stats = global.B100CoachKernel.weekStats();
    var review = document.getElementById('mentorReview');
    if (review) {
      review.innerHTML =
        '<p>' + esc(t('chapters_read', { n: stats.chapters })) + '</p>' +
        '<p>' + esc(t('streak_great', { n: stats.streak || 0 })) + '</p>' +
        '<p>⭐ ' + stats.stars + '</p>';
    }

    var per = new URLSearchParams(location.search).get('persona') || 'adult';
    var rec = global.B100CoachKernel.recommendTrack(per);
    var recText = t('rec_30day');
    if (rec === 'golden') recText = t('rec_golden');
    if (rec === 'theme') recText = t('rec_theme');
    var plan = document.getElementById('mentorPlan');
    var trackPages = {
      bible66: 'bible66.html',
      '30day': 'track-30day.html',
      golden: 'track-golden.html',
      theme: 'track-theme.html',
    };
    var trackPage = trackPages[rec] || 'track-30day.html';
    if (plan) {
      plan.innerHTML = '<p>' + esc(recText) + '</p>' +
        '<a class="coach-btn coach-btn--ghost" href="' + esc(trackPage) + '?locale=' +
        encodeURIComponent(global.B100CoachI18n.locale()) + '">' + esc(recText) + ' →</a>';
    }

    var bar = document.getElementById('mentorBar');
    if (bar) {
      var pct = Math.min(100, stats.chapters * 5);
      bar.innerHTML = '<div class="coach-bar"><span style="width:' + pct + '%"></span></div>';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
