/** 讀經進度、星星、連續天（本機 localStorage） */
(function (global) {
  var KEY = 'bible100_read_progress_v1';

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { stars: 0, streak: 0, lastDay: '', done: {}, log: [] };
  }

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function markDone(id, meta) {
    var data = load();
    if (data.done[id]) return { newStar: false, stars: data.stars };
    data.done[id] = meta || { at: Date.now() };
    var t = todayStr();
    if (data.lastDay === t) {
      /* same day */
    } else if (data.lastDay) {
      var prev = new Date(data.lastDay);
      var cur = new Date(t);
      var diff = (cur - prev) / 86400000;
      data.streak = diff === 1 ? (data.streak || 0) + 1 : 1;
    } else {
      data.streak = 1;
    }
    data.lastDay = t;
    data.stars = (data.stars || 0) + 1;
    data.log.unshift({ id: id, at: Date.now(), meta: meta || {} });
    if (data.log.length > 200) data.log.length = 200;
    save(data);
    return { newStar: true, stars: data.stars, streak: data.streak };
  }

  function isDone(id) {
    return !!load().done[id];
  }

  function countDone(prefix) {
    var done = load().done;
    var n = 0;
    Object.keys(done).forEach(function (k) {
      if (!prefix || k.indexOf(prefix) === 0) n += 1;
    });
    return n;
  }

  function stats() {
    var data = load();
    return {
      stars: data.stars || 0,
      streak: data.streak || 0,
      lastDay: data.lastDay || '',
      totalDone: Object.keys(data.done || {}).length,
    };
  }

  function chapterId(bookId, chapter) {
    return 'b66:' + bookId + ':' + chapter;
  }

  function dayId(day) {
    return '30d:' + day;
  }

  function goldenId(gvId) {
    return 'gv:' + gvId;
  }

  function themeUnitId(themeId, idx) {
    return 'theme:' + themeId + ':' + idx;
  }

  function plan1yId(day) {
    return '1y:' + day;
  }

  function plan3yId(day) {
    return '3y:' + day;
  }

  global.B100Progress = {
    load: load,
    markDone: markDone,
    isDone: isDone,
    countDone: countDone,
    stats: stats,
    chapterId: chapterId,
    dayId: dayId,
    goldenId: goldenId,
    themeUnitId: themeUnitId,
    plan1yId: plan1yId,
    plan3yId: plan3yId,
  };
})(window);
