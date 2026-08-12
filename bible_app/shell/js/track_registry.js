/**
 * 四條賽道統一資料模型（節點 SSOT）
 * 節點形狀：{ nodeId, track, label, sublabel, bookId, chapter, verse?, progressId, linkParams }
 */
(function (global) {
  var SUFFIX = { 'zh-Hant': 'Zh', en: 'En', vi: 'Vi', id: 'Id' };

  function loc() {
    if (global.B100LocalePick && global.B100LocalePick.getLocale) {
      return global.B100LocalePick.getLocale();
    }
    var q = new URLSearchParams(location.search);
    return q.get('locale') || 'zh-Hant';
  }

  function pickField(row, base) {
    if (!row) return '';
    var suf = SUFFIX[loc()] || 'Zh';
    return row[base + suf] || row[base + 'Zh'] || row[base + 'En'] || '';
  }

  function manifestTracks() {
    if (global.B100_DATA && global.B100_DATA.tracksManifest && global.B100_DATA.tracksManifest.tracks) {
      return global.B100_DATA.tracksManifest.tracks;
    }
    return FALLBACK_MANIFEST;
  }

  function metaById(trackId) {
    return manifestTracks().find(function (t) { return t.id === trackId; }) || null;
  }

  function loadJson(trackId) {
    var meta = metaById(trackId);
    if (!meta) return Promise.reject(new Error('unknown track'));
    if (global.B100TrackRegistry && global.B100TrackRegistry._loaders && global.B100TrackRegistry._loaders[trackId]) {
      return global.B100TrackRegistry._loaders[trackId]();
    }
    if (!global.B100DataLoader) return Promise.reject(new Error('no loader'));
    if (trackId === 'plan1y') return global.B100DataLoader.plan1y();
    if (trackId === 'plan3y') return global.B100DataLoader.plan3y();
    if (trackId === 'bible66') return global.B100DataLoader.books();
    if (trackId === '30day') return global.B100DataLoader.thirtyDay();
    if (trackId === 'golden') return global.B100DataLoader.golden();
    if (trackId === 'theme') return global.B100DataLoader.thematic();
    return Promise.reject(new Error('no loader'));
  }

  function loadManifest() {
    if (global.B100_DATA && global.B100_DATA.tracksManifest) {
      return Promise.resolve(global.B100_DATA.tracksManifest);
    }
    var prefix = (location.pathname || '').indexOf('/pages/') >= 0 ? '../data/' : 'data/';
    return fetch(prefix + 'reading_tracks_manifest.json')
      .then(function (r) {
        if (!r.ok) throw new Error('fetch');
        return r.json();
      })
      .catch(function () {
        return { schemaVersion: 2, tracks: FALLBACK_MANIFEST };
      });
  }

  function makeNode(opts) {
    return {
      nodeId: opts.nodeId,
      track: opts.track,
      label: opts.label || '',
      sublabel: opts.sublabel || '',
      bookId: opts.bookId,
      chapter: opts.chapter,
      verse: opts.verse != null ? opts.verse : null,
      progressId: opts.progressId,
      linkParams: opts.linkParams || {},
    };
  }

  function normalizePlan(plan, trackId, prefixFn) {
    var days = (plan && plan.days) || [];
    return days.map(function (d) {
      var ref = global.B100LocalePick
        ? global.B100LocalePick.bookChapterRef(d.bookId, d.chapter)
        : '';
      return makeNode({
        nodeId: prefixFn(d.day),
        track: trackId,
        label: pickField(d, 'title'),
        sublabel: ref,
        bookId: d.bookId,
        chapter: d.chapter,
        progressId: prefixFn(d.day),
        linkParams: { track: trackId, day: d.day },
      });
    });
  }

  function normalize30Day(plan) {
    var days = (plan && plan.days) || [];
    return days.map(function (d) {
      var ref = global.B100LocalePick
        ? global.B100LocalePick.bookChapterRef(d.bookId, d.chapter)
        : '';
      return makeNode({
        nodeId: '30d:' + d.day,
        track: '30day',
        label: pickField(d, 'title'),
        sublabel: ref,
        bookId: d.bookId,
        chapter: d.chapter,
        progressId: global.B100Progress ? global.B100Progress.dayId(d.day) : ('30d:' + d.day),
        linkParams: { track: '30day', day: d.day },
      });
    });
  }

  function normalizeGolden(data) {
    var verses = (data && data.verses) || [];
    return verses.map(function (v) {
      var ref = global.B100LocalePick ? global.B100LocalePick.pickRef(v) : (v.refZh || '');
      return makeNode({
        nodeId: 'gv:' + v.id,
        track: 'golden',
        label: ref,
        sublabel: pickField(v, 'tag'),
        bookId: v.bookId,
        chapter: v.chapter,
        verse: v.verse,
        progressId: global.B100Progress ? global.B100Progress.goldenId(v.id) : ('gv:' + v.id),
        linkParams: { track: 'golden', gv: v.id, verse: v.verse },
      });
    });
  }

  function normalizeTheme(data) {
    var nodes = [];
    (data && data.themes || []).forEach(function (theme) {
      var themeName = pickField(theme, 'name');
      (theme.units || []).forEach(function (unit, idx) {
        nodes.push(makeNode({
          nodeId: 'theme:' + theme.id + ':' + idx,
          track: 'theme',
          label: pickField(unit, 'label'),
          sublabel: themeName,
          bookId: unit.bookId,
          chapter: unit.chapter,
          progressId: global.B100Progress
            ? global.B100Progress.themeUnitId(theme.id, idx)
            : ('theme:' + theme.id + ':' + idx),
          linkParams: { track: 'theme', theme: theme.id, unit: idx },
        }));
      });
    });
    return nodes;
  }

  function normalizeBible66(booksData) {
    var books = (booksData && booksData.books) || [];
    var nodes = [];
    books.forEach(function (book) {
      for (var ch = 1; ch <= book.chapters; ch++) {
        var ref = global.B100LocalePick
          ? global.B100LocalePick.bookChapterRef(book.id, ch)
          : (book.nameZh + ' ' + ch);
        nodes.push(makeNode({
          nodeId: 'b66:' + book.id + ':' + ch,
          track: 'bible66',
          label: ref,
          sublabel: book.id <= 39 ? 'OT' : 'NT',
          bookId: book.id,
          chapter: ch,
          progressId: global.B100Progress
            ? global.B100Progress.chapterId(book.id, ch)
            : ('b66:' + book.id + ':' + ch),
          linkParams: { track: 'bible66' },
        }));
      }
    });
    return nodes;
  }

  function normalizeNodes(trackId, raw) {
    if (trackId === 'plan1y') return normalizePlan(raw, 'plan1y', function (d) { return global.B100Progress ? global.B100Progress.plan1yId(d) : ('1y:' + d); });
    if (trackId === 'plan3y') return normalizePlan(raw, 'plan3y', function (d) { return global.B100Progress ? global.B100Progress.plan3yId(d) : ('3y:' + d); });
    if (trackId === '30day') return normalize30Day(raw);
    if (trackId === 'golden') return normalizeGolden(raw);
    if (trackId === 'theme') return normalizeTheme(raw);
    if (trackId === 'bible66') return normalizeBible66(raw);
    return [];
  }

  function readUrl(trackId, node) {
    var params = {
      bookId: node.bookId,
      chapter: node.chapter,
      track: trackId,
    };
    if (node.verse != null) params.verse = node.verse;
    Object.keys(node.linkParams || {}).forEach(function (k) {
      params[k] = node.linkParams[k];
    });
    if (global.B100PageLinks && global.B100PageLinks.bibleReadUrl) {
      return global.B100PageLinks.bibleReadUrl(params);
    }
    if (global.B100BibleReader && global.B100BibleReader.buildReadUrl) {
      return global.B100BibleReader.buildReadUrl(params);
    }
    var q = 'book=' + params.bookId + '&chapter=' + params.chapter + '&track=' + trackId;
    return 'bible66.html?' + q;
  }

  function readUrlFromParts(trackId, parts) {
    var node = makeNode({
      nodeId: parts.nodeId || trackId,
      track: trackId,
      bookId: parts.bookId,
      chapter: parts.chapter,
      verse: parts.verse,
      linkParams: parts.linkParams || parts,
    });
    return readUrl(trackId, node);
  }

  function countDone(prefix) {
    return global.B100Progress ? global.B100Progress.countDone(prefix) : 0;
  }

  function trackText(meta, base) {
    return pickField(meta, base);
  }

  function loadTrack(trackId) {
    return loadJson(trackId).then(function (raw) {
      var meta = metaById(trackId);
      var nodes = normalizeNodes(trackId, raw);
      var total = nodes.length;
      var prefix = meta ? meta.progressPrefix : '';
      var done = prefix ? countDone(prefix) : 0;
      return {
        id: trackId,
        meta: meta,
        raw: raw,
        nodes: nodes,
        total: total,
        done: done,
      };
    });
  }

  function loadAllSummaries() {
    return loadManifest().then(function () {
      var ids = manifestTracks().map(function (t) { return t.id; });
      return Promise.all(ids.map(function (id) {
        return loadTrack(id).then(function (pack) {
          var meta = pack.meta || {};
          return {
            id: id,
            emoji: meta.emoji || '📖',
            color: meta.color || '#818cf8',
            title: trackText(meta, 'title'),
            lead: trackText(meta, 'lead'),
            audience: trackText(meta, 'audience'),
            countNote: trackText(meta, 'countNote'),
            listPage: meta.listPage || '',
            total: pack.total,
            done: pack.done,
            progressLabel: pack.done + ' / ' + pack.total,
          };
        }).catch(function () {
          var meta = metaById(id) || {};
          return {
            id: id,
            emoji: meta.emoji || '📖',
            color: meta.color || '#818cf8',
            title: trackText(meta, 'title'),
            lead: trackText(meta, 'lead'),
            audience: trackText(meta, 'audience'),
            countNote: trackText(meta, 'countNote'),
            listPage: meta.listPage || '',
            total: 0,
            done: 0,
            progressLabel: '—',
            error: true,
          };
        });
      }));
    });
  }

  function enterTrack(trackId) {
    if (global.parent !== global && global.parent.BibleShellNav && global.parent.BibleShellNav.enterTrack) {
      global.parent.BibleShellNav.enterTrack(trackId);
      return;
    }
    var meta = metaById(trackId);
    var page = meta && meta.listPage ? meta.listPage : 'track-30day.html';
    var q = new URLSearchParams(location.search);
    location.href = page + (q.toString() ? '?' + q.toString() : '');
  }

  var FALLBACK_MANIFEST = [
    { id: 'plan1y', titleZh: '一年計劃', emoji: '🗓️', color: '#6366f1', listPage: 'track-plan1y.html', progressPrefix: '1y:' },
    { id: 'plan3y', titleZh: '三年計劃', emoji: '🐢', color: '#34d399', listPage: 'track-plan3y.html', progressPrefix: '3y:' },
    { id: 'bible66', titleZh: '六十六卷', emoji: '📜', color: '#818cf8', listPage: 'bible66.html', progressPrefix: 'b66:' },
    { id: '30day', titleZh: '三十日', emoji: '📅', color: '#fbbf24', listPage: 'track-30day.html', progressPrefix: '30d:' },
    { id: 'golden', titleZh: '100金句選', emoji: '⭐', color: '#fb7185', listPage: 'track-golden.html', progressPrefix: 'gv:', countNoteZh: '100 句' },
    { id: 'theme', titleZh: '主題讀經', emoji: '🎯', color: '#4ecdc4', listPage: 'track-theme.html', progressPrefix: 'theme:' },
  ];

  global.B100TrackRegistry = {
    manifestTracks: manifestTracks,
    metaById: metaById,
    loadManifest: loadManifest,
    loadTrack: loadTrack,
    loadAllSummaries: loadAllSummaries,
    normalizeNodes: normalizeNodes,
    readUrl: readUrl,
    readUrlFromParts: readUrlFromParts,
    enterTrack: enterTrack,
    makeNode: makeNode,
    _loaders: null,
  };
})(window);
