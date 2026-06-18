(function () {
  var books = [];
  var db = null;
  var bookId = 1;
  var chapter = 1;
  var filter = 'all';
  var sample = { data: [], en: [] };
  var useSample = false;

  var VER = { zh: 'cuv_trust', en: 'kjv', lu: 'luzhen' };
  var DB_URL = '../../app/assets/bible/bible_reader.db';

  function qs(name) {
    return new URLSearchParams(location.search).get(name);
  }

  function esc(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function queryVerses(version, b, c) {
    if (!db) return [];
    var stmt = db.prepare(
      'SELECT v, t FROM verses WHERE version = ? AND b = ? AND c = ? ORDER BY v'
    );
    stmt.bind([version, b, c]);
    var rows = [];
    while (stmt.step()) {
      var r = stmt.getAsObject();
      rows.push({ v: r.v, t: r.t });
    }
    stmt.free();
    return rows;
  }

  function sampleVerses(b, c, arr) {
    return (arr || []).filter(function (v) { return v.b === b && v.c === c; })
      .sort(function (a, b) { return a.v - b.v; })
      .map(function (x) { return { v: x.v, t: x.t }; });
  }

  function renderBooks() {
    var list = document.getElementById('bookList');
    list.innerHTML = '';
    books.forEach(function (b) {
      var testament = b.id <= 39 ? 'OT' : 'NT';
      if (filter !== 'all' && filter !== testament) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = b.id + ' ' + b.nameZh;
      btn.classList.toggle('on', b.id === bookId);
      btn.addEventListener('click', function () {
        bookId = b.id;
        chapter = 1;
        renderBooks();
        renderChapters();
        renderVerses();
      });
      list.appendChild(btn);
    });
  }

  function renderChapters() {
    var bar = document.getElementById('chapterBar');
    var book = books.find(function (b) { return b.id === bookId; });
    bar.innerHTML = '';
    if (!book) return;
    for (var c = 1; c <= book.chapters; c++) {
      (function (ch) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = ch;
        btn.classList.toggle('on', ch === chapter);
        btn.addEventListener('click', function () {
          chapter = ch;
          renderChapters();
          renderVerses();
        });
        bar.appendChild(btn);
      })(c);
    }
  }

  function renderVerses() {
    var grid = document.getElementById('verseGrid');
    var hint = document.getElementById('bibleHint');
    var zh, en, lu;

    if (useSample) {
      zh = sampleVerses(bookId, chapter, sample.data);
      en = sampleVerses(bookId, chapter, sample.en);
      lu = [];
      if (hint) hint.textContent = PageLocale.L('bible_sample');
    } else {
      zh = queryVerses(VER.zh, bookId, chapter);
      en = queryVerses(VER.en, bookId, chapter);
      lu = queryVerses(VER.lu, bookId, chapter);
      if (hint) hint.textContent = PageLocale.L('bible_full');
    }

    if (!zh.length && !en.length) {
      grid.innerHTML = '<p class="empty-msg">' + PageLocale.L('bible_empty') + '</p>';
      return;
    }

    var maxV = 0;
    [zh, en, lu].forEach(function (arr) {
      if (arr.length) maxV = Math.max(maxV, arr[arr.length - 1].v);
    });

    grid.innerHTML = '';
    for (var v = 1; v <= maxV; v++) {
      var z = zh.find(function (x) { return x.v === v; });
      var e = en.find(function (x) { return x.v === v; });
      var l = lu.find(function (x) { return x.v === v; });
      var row = document.createElement('div');
      row.className = 'verse-row';
      row.innerHTML =
        '<div class="num">' + v + '</div>' +
        '<div class="cell zh">' + esc(z ? z.t : '—') + '</div>' +
        '<div class="cell en">' + esc(e ? e.t : '—') + '</div>' +
        '<div class="cell lu">' + esc(l ? l.t : (e ? e.t : '—')) +
          (l ? '' : '<br><small>' + PageLocale.L('col_lu_note') + '</small>') + '</div>' +
        '<div class="cell bridge">' + esc(e ? e.t : '—') +
          '<br><small>' + PageLocale.L('col_bridge_note') + '</small></div>';
      grid.appendChild(row);
    }
  }

  function bindFilters() {
    document.querySelectorAll('.filters .f').forEach(function (btn) {
      btn.addEventListener('click', function () {
        filter = btn.getAttribute('data-f');
        document.querySelectorAll('.filters .f').forEach(function (b) {
          b.classList.toggle('on', b === btn);
        });
        renderBooks();
      });
    });
  }

  function setLoading(msg) {
    var grid = document.getElementById('verseGrid');
    if (grid) grid.innerHTML = '<p class="empty-msg">' + msg + '</p>';
  }

  function initWithBooks(bookData) {
    books = bookData.books || [];
    var qb = parseInt(qs('book') || '1', 10);
    var qc = parseInt(qs('chapter') || '1', 10);
    if (books.some(function (b) { return b.id === qb; })) {
      bookId = qb;
      chapter = Math.max(1, qc);
    }
    bindFilters();
    renderBooks();
    renderChapters();
    renderVerses();
  }

  function loadSqlDb() {
    setLoading(PageLocale.L('bible_loading'));
    return fetch(DB_URL)
      .then(function (r) {
        if (!r.ok) throw new Error('DB HTTP ' + r.status);
        return r.arrayBuffer();
      })
      .then(function (buf) {
        return initSqlJs({
          locateFile: function (file) {
            return 'https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/' + file;
          },
        }).then(function (SQL) {
          db = new SQL.Database(new Uint8Array(buf));
          useSample = false;
        });
      });
  }

  function boot() {
    Promise.all([
      fetch('../data/books.json').then(function (r) { return r.json(); }),
      fetch('../data/sample_bible.json').then(function (r) { return r.json(); }),
    ]).then(function (res) {
      sample = res[1];
      return loadSqlDb()
        .catch(function () {
          useSample = true;
          var hint = document.getElementById('bibleHint');
          if (hint) hint.textContent = PageLocale.L('bible_sample');
        })
        .then(function () { initWithBooks(res[0]); });
    }).catch(function (err) {
      setLoading('载入失败：' + err.message);
    });
  }

  if (typeof initSqlJs === 'undefined') {
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/sql-wasm.js';
    s.onload = boot;
    s.onerror = function () {
      useSample = true;
      boot();
    };
    document.head.appendChild(s);
  } else {
    boot();
  }
})();
