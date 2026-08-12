/** 同跑隊伍 Lite：本機留言 + 共振 */
(function (global) {
  function esc(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function weekSquadReads() {
    var data = global.B100Progress ? global.B100Progress.load() : { log: [] };
    var weekAgo = Date.now() - 7 * 86400000;
    var n = 0;
    (data.log || []).forEach(function (e) {
      if (e && e.at >= weekAgo) n += 1;
    });
    return n;
  }

  function renderPosts(posts) {
    var root = document.getElementById('squadPosts');
    if (!root) return;
    if (!posts.length) {
      root.innerHTML = '<p class="coach-lead">' + esc(global.B100CoachI18n.t('no_pressure')) + '</p>';
      return;
    }
    root.innerHTML = posts.map(function (p) {
      var label = p.type === 'prayer'
        ? global.B100CoachI18n.t('post_prayer')
        : global.B100CoachI18n.t('post_light');
      return '<div class="coach-post"><p class="coach-post__meta">' + esc(label) + '</p><p>' + esc(p.text) + '</p></div>';
    }).join('');
  }

  function init() {
    var t = global.B100CoachI18n.t;
    document.documentElement.lang = global.B100CoachI18n.locale() === 'zh-Hant' ? 'zh-Hant' : global.B100CoachI18n.locale();

    var squad = global.B100CoachState.load().squad;
    var nameEl = document.getElementById('squadName');
    var goalEl = document.getElementById('squadGoal');
    if (nameEl) nameEl.value = squad.name || '';
    if (goalEl) goalEl.value = squad.goal || '';

    var res = document.getElementById('squadResonance');
    if (res) res.textContent = t('squad_resonance', { n: weekSquadReads() });

    renderPosts(squad.posts || []);

    global.B100CoachKernel.resolveToday().then(function (today) {
      if (goalEl && !goalEl.value) goalEl.value = today.title;
    });

    var saveMeta = function () {
      global.B100CoachState.updateSquad({
        name: nameEl ? nameEl.value : '',
        goal: goalEl ? goalEl.value : '',
      });
    };
    if (nameEl) nameEl.addEventListener('change', saveMeta);
    if (goalEl) goalEl.addEventListener('change', saveMeta);

    var postBtn = document.getElementById('squadPostBtn');
    if (postBtn) {
      postBtn.addEventListener('click', function () {
        var text = (document.getElementById('squadPostText') || {}).value || '';
        var type = (document.getElementById('squadPostType') || {}).value || 'light';
        if (!text.trim()) return;
        global.B100CoachState.addSquadPost(type, text.trim());
        global.B100CoachState.setRing('shared', true);
        var ta = document.getElementById('squadPostText');
        if (ta) ta.value = '';
        renderPosts(global.B100CoachState.load().squad.posts);
        if (res) res.textContent = t('squad_resonance', { n: weekSquadReads() });
      });
    }

    var q = new URLSearchParams(location.search);
    if (q.get('action') === 'post') {
      var ta = document.getElementById('squadPostText');
      if (ta) ta.focus();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
