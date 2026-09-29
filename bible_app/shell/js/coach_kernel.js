/**
 * 教練核心：resolveToday、反思文案、週回顧
 */
(function (global) {
  var SUFFIX = { 'zh-Hant': 'Zh', en: 'En', vi: 'Vi', id: 'Id' };

  function loc() {
    return global.B100CoachI18n ? global.B100CoachI18n.locale() : 'zh-Hant';
  }

  function pick(row, base) {
    if (global.B100CoachI18n) return global.B100CoachI18n.pickField(row, base);
    if (!row) return '';
    var suf = SUFFIX[loc()] || 'Zh';
    return row[base + suf] || row[base + 'Zh'] || '';
  }

  function persona() {
    var q = new URLSearchParams(location.search);
    return q.get('persona') || 'adult';
  }

  function loadThirtyDay() {
    if (global.B100_DATA && global.B100_DATA.thirtyDay) {
      return Promise.resolve(global.B100_DATA.thirtyDay);
    }
    if (global.B100DataLoader) return global.B100DataLoader.thirtyDay();
    return Promise.resolve({ days: [] });
  }

  function loadGolden() {
    if (global.B100_DATA && global.B100_DATA.golden) {
      return Promise.resolve(global.B100_DATA.golden);
    }
    if (global.B100DataLoader) return global.B100DataLoader.golden();
    return Promise.resolve({ verses: [] });
  }

  function loadReflections() {
    var prefix = (location.pathname || '').indexOf('/pages/') >= 0 ? '../data/' : 'data/';
    if (global.B100_DATA && global.B100_DATA.coachReflections) {
      return Promise.resolve(global.B100_DATA.coachReflections);
    }
    return fetch(prefix + 'coach_reflections.json')
      .then(function (r) { return r.ok ? r.json() : { items: [] }; })
      .catch(function () { return { items: [] }; });
  }

  function findGoldenForChapter(golden, bookId, chapter) {
    var verses = (golden && golden.verses) || [];
    var match = verses.find(function (v) {
      return v.bookId === bookId && v.chapter === chapter;
    });
    if (match) return match;
    return verses[0] || null;
  }

  function next30DayNode(plan, p) {
    var days = (plan && plan.days) || [];
    var per = persona();
    var maxDay = per === 'seeker' ? 7 : 30;
    for (var i = 0; i < days.length; i++) {
      var d = days[i];
      if (d.day > maxDay) break;
      var pid = global.B100Progress ? global.B100Progress.dayId(d.day) : ('30d:' + d.day);
      if (!p || !p.isDone(pid)) return d;
    }
    return days[0] || null;
  }

  function nextGoldenNode(golden, p) {
    var verses = (golden && golden.verses) || [];
    for (var i = 0; i < verses.length; i++) {
      var v = verses[i];
      var pid = global.B100Progress ? global.B100Progress.goldenId(v.id) : ('gv:' + v.id);
      if (!p || !p.isDone(pid)) return v;
    }
    return verses[0] || null;
  }

  function bookRef(bookId, chapter) {
    if (global.B100LocalePick && global.B100LocalePick.bookChapterRef) {
      return global.B100LocalePick.bookChapterRef(bookId, chapter, loc());
    }
    return 'Book ' + bookId + ' ' + chapter;
  }

  function reflectionFor(day, bookId, chapter, reflections) {
    var items = (reflections && reflections.items) || [];
    var hit = items.find(function (it) {
      if (day && it.day === day) return true;
      return it.bookId === bookId && it.chapter === chapter;
    });
    if (hit) {
      return {
        challenge: pick(hit, 'challenge'),
        application: pick(hit, 'application'),
        prayer: pick(hit, 'prayer'),
      };
    }
    return {
      challenge: pick({ challengeZh: '今天對一個人說一句鼓勵的話', challengeEn: 'Encourage someone today', challengeVi: 'Động viên ai đó hôm nay', challengeId: 'Berikan semangat hari ini' }, 'challenge'),
      application: pick({ applicationZh: '把今天讀到的一節經文記在心裡，遇到困難時想起來。', applicationEn: 'Keep one verse in mind today.', applicationVi: 'Ghi nhớ một câu Kinh hôm nay.', applicationId: 'Ingat satu ayat hari ini.' }, 'application'),
      prayer: pick({ prayerZh: '主啊，謝謝今天的話語。幫助我活出行出來。阿們。', prayerEn: 'Lord, thank you for today\'s word. Help me live it out. Amen.', prayerVi: 'Lạy Chúa, cảm ơn lời của Ngài. Amen.', prayerId: 'Tuhan, terima kasih atas firman-Mu. Amin.' }, 'prayer'),
    };
  }

  function buildTodayFrom30(d, golden, reflections) {
    var p = global.B100Progress;
    var progressId = p ? p.dayId(d.day) : ('30d:' + d.day);
    var unitKey = '30d:' + d.day;
    var ref = bookRef(d.bookId, d.chapter);
    var title = pick(d, 'title') || ref;
    var gv = findGoldenForChapter(golden, d.bookId, d.chapter);
    var refl = reflectionFor(d.day, d.bookId, d.chapter, reflections);
    var st = p ? p.stats() : { streak: 0, stars: 0 };
    var doneToday = p ? p.isDone(progressId) : false;
    return {
      title: (global.B100CoachI18n ? global.B100CoachI18n.t('day_label', { n: d.day }) : ('Day ' + d.day)) + ' · ' + title,
      subtitle: ref,
      minutes: 5,
      book: d.bookId,
      chapter: d.chapter,
      verse: 1,
      track: '30day',
      day: d.day,
      progressId: progressId,
      unitKey: unitKey,
      goldenRef: gv ? pick(gv, 'ref') : ref,
      goldenText: gv ? pick(gv, 'tag') : pick(d, 'hint'),
      challenge: refl.challenge,
      application: refl.application,
      prayer: refl.prayer,
      doneToday: doneToday,
      streak: st.streak || 0,
      stars: st.stars || 0,
    };
  }

  function buildTodayFromGolden(v, reflections) {
    var p = global.B100Progress;
    var progressId = p ? p.goldenId(v.id) : ('gv:' + v.id);
    var ref = pick(v, 'ref') || bookRef(v.bookId, v.chapter);
    var refl = reflectionFor(null, v.bookId, v.chapter, reflections);
    var st = p ? p.stats() : { streak: 0 };
    return {
      title: ref,
      subtitle: pick(v, 'tag'),
      minutes: 3,
      book: v.bookId,
      chapter: v.chapter,
      verse: v.verse || 1,
      track: 'golden',
      gv: v.id,
      progressId: progressId,
      unitKey: progressId,
      goldenRef: ref,
      goldenText: pick(v, 'tag'),
      challenge: refl.challenge,
      application: refl.application,
      prayer: refl.prayer,
      doneToday: p ? p.isDone(progressId) : false,
      streak: st.streak || 0,
      stars: st.stars || 0,
    };
  }

  function resolveToday(opts) {
    opts = opts || {};
    return Promise.all([loadThirtyDay(), loadGolden(), loadReflections()]).then(function (arr) {
      var plan = arr[0];
      var golden = arr[1];
      var reflections = arr[2];
      var p = global.B100Progress;
      var d = next30DayNode(plan, p);
      if (d) return buildTodayFrom30(d, golden, reflections);
      var gv = nextGoldenNode(golden, p);
      if (gv) return buildTodayFromGolden(gv, reflections);
      return buildTodayFrom30(
        { day: 1, bookId: 1, chapter: 1, titleZh: '起初', titleEn: 'Beginning', hintZh: '神創造天地' },
        golden,
        reflections
      );
    });
  }

  function readerUrl(today) {
    if (!today) return 'bible66.html?book=1&chapter=1';
    var opts = {
      bookId: today.book,
      chapter: today.chapter,
      verse: today.verse,
      track: today.track,
      locale: loc(),
      day: today.day,
      gv: today.gv,
    };
    if (global.B100PageLinks && global.B100PageLinks.bibleReadUrl) {
      return global.B100PageLinks.bibleReadUrl(opts);
    }
    var q = new URLSearchParams();
    q.set('book', String(today.book));
    q.set('chapter', String(today.chapter));
    q.set('track', today.track || '30day');
    if (today.day) q.set('day', String(today.day));
    if (today.gv) q.set('gv', today.gv);
    if (today.verse) q.set('verse', String(today.verse));
    q.set('locale', loc());
    return 'bible66.html?' + q.toString();
  }

  function weekStats() {
    var data = global.B100Progress ? global.B100Progress.load() : { log: [], done: {} };
    var weekAgo = Date.now() - 7 * 86400000;
    var chapters = 0;
    var bookCount = {};
    (data.log || []).forEach(function (entry) {
      if (!entry || entry.at < weekAgo) return;
      var id = entry.id || '';
      if (id.indexOf('b66:') === 0) {
        chapters += 1;
        var parts = id.split(':');
        var b = parts[1];
        bookCount[b] = (bookCount[b] || 0) + 1;
      } else {
        chapters += 1;
      }
    });
    var topBook = '1';
    var topN = 0;
    Object.keys(bookCount).forEach(function (b) {
      if (bookCount[b] > topN) { topN = bookCount[b]; topBook = b; }
    });
    var st = global.B100Progress ? global.B100Progress.stats() : { streak: 0, stars: 0 };
    return {
      chapters: chapters,
      topBookId: parseInt(topBook, 10) || 1,
      topBookRef: bookRef(parseInt(topBook, 10) || 1, 1).split(' ')[0],
      streak: st.streak,
      stars: st.stars,
    };
  }

  function recommendTrack(per) {
    per = per || persona();
    if (per === 'kids' || per === 'seeker') return '30day';
    if (per === 'parent') return 'golden';
    return '30day';
  }

  global.B100CoachKernel = {
    resolveToday: resolveToday,
    readerUrl: readerUrl,
    reflectionFor: reflectionFor,
    weekStats: weekStats,
    recommendTrack: recommendTrack,
    loadReflections: loadReflections,
  };
})(typeof window !== 'undefined' ? window : global);
