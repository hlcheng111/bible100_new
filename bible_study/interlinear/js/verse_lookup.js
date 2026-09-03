/**
 * 本機／HTTP 經節查詢（不依賴 lovestoblog）。
 */
(function (global) {
  'use strict';

  var SQL_SRC = '../../bible_app/shell/vendor/sqljs/sql-wasm.js';
  var SQL_DIR = '../../bible_app/shell/vendor/sqljs/';
  var REL_DB_BASE = '../../bible_app/app/assets/bible/';

  var BOOK_ALIAS = {
    '創': 1, '創世記': 1, 'gen': 1, 'genesis': 1,
    '太': 40, '馬太': 40, '馬太福音': 40, 'mat': 40, 'matt': 40, 'matthew': 40,
    '可': 41, '馬可': 41, 'mrk': 41, 'mark': 41,
    '路': 42, '路加': 42, 'luk': 42, 'luke': 42,
    '約': 43, '約翰': 43, '約翰福音': 43, 'jhn': 43, 'john': 43,
    '羅': 45, '羅馬': 45, 'rom': 45, 'romans': 45
  };

  var state = { db: null, ready: false, error: '', viIndex: null, idIndex: null };

  function cleanVerseText(t) {
    if (global.cleanVerseText) return global.cleanVerseText(t);
    return String(t || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  }

  function parseRef(raw) {
    var s = String(raw || '').trim();
    var m = s.match(/^(\d{1,2})\s*[:：.]\s*(\d{1,3})\s*[:：.]\s*(\d{1,3})$/);
    if (m) return { b: parseInt(m[1], 10), c: parseInt(m[2], 10), v: parseInt(m[3], 10) };
    m = s.match(/^([^\d\s]{1,12}|[A-Za-z]{2,12})[. ]\s*(\d{1,3})\s*[:：.]\s*(\d{1,3})\b/);
    if (m) {
      var alias = BOOK_ALIAS[m[1]] || BOOK_ALIAS[String(m[1]).toLowerCase()];
      if (alias) return { b: alias, c: parseInt(m[2], 10), v: parseInt(m[3], 10) };
    }
    return null;
  }

  function parseUrlVerse() {
    var q = new URLSearchParams(location.search);
    var book = q.get('book');
    var chapter = q.get('chapter');
    var verse = q.get('verse');
    if (!book || !chapter || !verse) return null;
    var bNum = parseInt(book, 10);
    if (!bNum) bNum = BOOK_ALIAS[book] || BOOK_ALIAS[String(book).toLowerCase()] || 0;
    if (!bNum) return null;
    return { b: bNum, c: parseInt(chapter, 10), v: parseInt(verse, 10) };
  }

  function dbBase() {
    if (global.B100LiveDb && global.B100LiveDb.getDbBase) {
      var live = global.B100LiveDb.getDbBase();
      if (live && /^https?:\/\//i.test(live)) return live;
    }
    try {
      return new URL(REL_DB_BASE, location.href).href;
    } catch (e) {
      return REL_DB_BASE;
    }
  }

  function getArrayBuffer(url) {
    return fetch(url, { cache: 'force-cache', credentials: 'same-origin' }).then(function (r) {
      if (!r.ok) throw new Error('fetch ' + r.status);
      return r.arrayBuffer();
    });
  }

  function looksLikeDb(buf) {
    if (!buf || buf.byteLength < 1000000) return false;
    var view = new Uint8Array(buf);
    if (view[0] === 0x3C) return false;
    return true;
  }

  function assembleParts(base, manifest) {
    var parts = (manifest && manifest.parts) || [];
    if (!parts.length) return Promise.reject(new Error('empty parts'));
    return Promise.all(parts.map(function (name) {
      return getArrayBuffer(base + name);
    })).then(function (bufs) {
      var total = 0;
      bufs.forEach(function (b) { total += b.byteLength; });
      var out = new Uint8Array(total);
      var off = 0;
      bufs.forEach(function (b) {
        out.set(new Uint8Array(b), off);
        off += b.byteLength;
      });
      return out.buffer;
    });
  }

  function fetchDbBuffer(base) {
    if (!/\/$/.test(base)) base += '/';
    return fetch(base + 'bible_reader.db.manifest.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; })
      .then(function (manifest) {
        return getArrayBuffer(base + 'bible_reader.db').then(function (buf) {
          if (looksLikeDb(buf)) return buf;
          throw new Error('DB small');
        }).catch(function () {
          return assembleParts(base, manifest);
        });
      });
  }

  function loadSqlJs() {
    if (typeof initSqlJs === 'function') return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = SQL_SRC;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('sql.js')); };
      document.head.appendChild(s);
    });
  }

  function queryOne(version, b, c, v) {
    if (!state.db) return '';
    var stmt = state.db.prepare(
      'SELECT t FROM verses WHERE version = ? AND b = ? AND c = ? AND v = ? LIMIT 1'
    );
    stmt.bind([version, b, c, v]);
    var t = '';
    if (stmt.step()) t = cleanVerseText(stmt.getAsObject().t);
    stmt.free();
    return t;
  }

  function buildIndex(version) {
    var Seg = global.B100ViSegment;
    var map = {};
    var stmt = state.db.prepare('SELECT b, c, v, t FROM verses WHERE version = ?');
    stmt.bind([version]);
    while (stmt.step()) {
      var r = stmt.getAsObject();
      var t = cleanVerseText(r.t);
      var key = Seg ? Seg.lookupKey(t) : String(t).toLowerCase();
      if (key && !map[key]) map[key] = { b: r.b, c: r.c, v: r.v, t: t };
    }
    stmt.free();
    return map;
  }

  function findBySourceText(sentence, lang) {
    var Seg = global.B100ViSegment;
    var key = Seg ? Seg.lookupKey(sentence) : String(sentence || '').toLowerCase();
    if (!key || !state.db) return null;
    if (lang === 'id') {
      if (!state.idIndex) state.idIndex = buildIndex('id_ayt');
      return state.idIndex[key] || null;
    }
    if (!state.viIndex) state.viIndex = buildIndex('vi_1934');
    return state.viIndex[key] || null;
  }

  function getAligned(b, c, v) {
    return {
      b: b, c: c, v: v,
      vi: queryOne('vi_1934', b, c, v),
      zh: queryOne('cuv_trust', b, c, v),
      en: queryOne('kjv', b, c, v),
      id: queryOne('id_ayt', b, c, v)
    };
  }

  function init() {
    var probe = global.B100LiveDb && global.B100LiveDb.probe
      ? global.B100LiveDb.probe(0)
      : Promise.resolve(false);
    return probe.catch(function () { return false; }).then(function () {
      return loadSqlJs();
    }).then(function () {
      return initSqlJs({ locateFile: function (f) { return SQL_DIR + f; } });
    }).then(function (SQL) {
      return fetchDbBuffer(dbBase()).then(function (buf) {
        if (!looksLikeDb(buf)) throw new Error('DB small');
        state.db = new SQL.Database(new Uint8Array(buf));
        state.ready = true;
        state.error = '';
        return true;
      });
    }).catch(function (err) {
      state.ready = false;
      state.error = (err && err.message) || '';
      return false;
    });
  }

  global.B100VerseLookup = {
    init: init,
    parseRef: parseRef,
    parseUrlVerse: parseUrlVerse,
    findByViText: function (s) { return findBySourceText(s, 'vi'); },
    findBySourceText: findBySourceText,
    getAligned: getAligned,
    isReady: function () { return state.ready; },
    error: function () { return state.error; }
  };
})(typeof window !== 'undefined' ? window : this);
