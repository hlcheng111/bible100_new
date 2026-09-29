/** 讀後教練：應用、禱告、能量環、軟連結 */
(function (global) {
  function esc(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function qParam(name) {
    return new URLSearchParams(location.search).get(name) || '';
  }

  function loadReflection(book, chapter, day) {
    return global.B100CoachKernel.loadReflections().then(function (data) {
      return global.B100CoachKernel.reflectionFor(
        day ? parseInt(day, 10) : null,
        parseInt(book, 10),
        parseInt(chapter, 10),
        data
      );
    });
  }

  function renderCoach(refl, ref) {
    var t = global.B100CoachI18n.t;
    var root = document.getElementById('coachReflect');
    if (!root) return;

    global.B100CoachState.setRing('read', true);

    var state = global.B100CoachState.load();
    var steps = ['started', 'read', 'reflect', 'shared'];
    var ringHtml = '<p class="coach-block__label">' + esc(t('ring_label')) + '</p><ul class="coach-ring">' +
      steps.map(function (s) {
        return '<li class="coach-ring__seg' + (state.daily.ring[s] ? ' on' : '') + '"></li>';
      }).join('') + '</ul>';

    var locale = global.B100CoachI18n.locale();
    var book = qParam('book') || '1';
    var chapter = qParam('chapter') || '1';
    var track = qParam('track') || 'bible66';
    var qna = 'ai-qna.html?book=' + book + '&chapter=' + chapter + '&locale=' + locale + '&ref=' + encodeURIComponent(ref);
    var squad = 'pacing.html?locale=' + locale + '&action=post';
    var mentor = 'ai-tutor.html?locale=' + locale;

    root.innerHTML =
      ringHtml +
      '<section class="coach-block"><p class="coach-block__label">' + esc(t('reflect_title')) + '</p></section>' +
      '<section class="coach-block"><p class="coach-block__label">' + esc(t('apply_label')) + '</p>' +
        '<p class="coach-block__text">' + esc(refl.application) + '</p></section>' +
      '<section class="coach-block"><p class="coach-block__label">' + esc(t('prayer_label')) + '</p>' +
        '<p class="coach-block__text">' + esc(refl.prayer) + '</p></section>' +
      '<ul class="coach-links">' +
        '<li><a href="' + esc(qna) + '">' + esc(t('link_qna')) + '</a></li>' +
        '<li><a href="' + esc(squad) + '">' + esc(t('link_squad')) + '</a></li>' +
        '<li><a href="' + esc(mentor) + '">' + esc(t('link_mentor')) + '</a></li>' +
      '</ul>';

    global.B100CoachState.setRing('reflect', true);
  }

  global.B100ReadDoneCoach = {
    mount: function (ref) {
      var book = qParam('book') || '1';
      var chapter = qParam('chapter') || '1';
      var day = qParam('day');
      loadReflection(book, chapter, day).then(function (refl) {
        renderCoach(refl, ref);
      });
    },
  };
})(window);
