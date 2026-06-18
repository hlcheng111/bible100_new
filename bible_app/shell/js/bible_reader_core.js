/**
 * 經文讀取：依 locale 雙欄對照（和合 / KJV / 越1934 / 印尼AYT）
 */
(function (global) {
  function pageInShellPages() {
    var p = (location.pathname || '').replace(/\\/g, '/');
    return p.indexOf('/pages/') >= 0 || /\/pages\/[^/]+\.html$/i.test(p);
  }

  var IN_PAGES = pageInShellPages();
  var DB_URL = IN_PAGES ? '../../app/assets/bible/bible_reader.db' : '../app/assets/bible/bible_reader.db';
  var DATA_PREFIX = IN_PAGES ? '../data/' : 'data/';

  var LOCALE_PAIRS = {
    'zh-Hant': { left: 'cuv_trust', right: 'kjv', colL: 'col_zh', colR: 'col_en', hint: 'bible_hint_zh' },
    en: { left: 'kjv', right: 'cuv_trust', colL: 'col_en', colR: 'col_zh', hint: 'bible_hint_en' },
    vi: { left: 'vi_1934', right: 'kjv', colL: 'col_vi', colR: 'col_en', hint: 'bible_hint_vi' },
    id: { left: 'id_ayt', right: 'kjv', colL: 'col_id', colR: 'col_en', hint: 'bible_hint_id' },
  };

  var FILTER_LABELS = {
    'zh-Hant': { all: '全部', OT: '旧约', NT: '新约' },
    en: { all: 'All', OT: 'OT', NT: 'NT' },
    vi: { all: 'Tất cả', OT: 'Cũ Ước', NT: 'Tân Ước' },
    id: { all: 'Semua', OT: 'Perjanjian Lama', NT: 'Perjanjian Baru' },
  };

  function getLocale() {
    if (global.PageLocale && global.PageLocale.getLocale) {
      return global.PageLocale.getLocale();
    }
    var q = new URLSearchParams(location.search);
    return q.get('locale') || 'zh-Hant';
  }

  function getViewMode() {
    var q = new URLSearchParams(location.search);
    if (q.get('view') === 'single') return 'single';
    if (q.get('view') === 'dual') return 'dual';
    try {
      var raw = localStorage.getItem('bible_shell_state');
      if (raw) {
        var st = JSON.parse(raw);
        if (st.bibleView === 'single' || st.bibleView === 'dual') return st.bibleView;
      }
    } catch (e) {}
    return 'dual';
  }

  function L(key) {
    if (global.PageLocale && global.PageLocale.L) {
      return global.PageLocale.L(key);
    }
    return key;
  }

  function pairForLocale(loc) {
    return LOCALE_PAIRS[loc] || LOCALE_PAIRS.en;
  }

  function bookLabel(book, loc) {
    if (loc === 'vi' && book.nameVi) return book.nameVi;
    if (loc === 'id' && book.nameId) return book.nameId;
    if (loc === 'en' && book.nameEn) return book.nameEn;
    return book.nameZh || book.nameEn || '';
  }

  function cleanVerseText(t) {
    if (!t) return '';
    return String(t)
      .replace(/\{<W[^>]+>\}/gi, '')
      .replace(/<W[A-Z0-9]+>/gi, '')
      .replace(/<FI>/gi, '')
      .replace(/<Fi>/gi, '')
      .replace(/<CM>/gi, '')
      .replace(/\u3000/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function fetchJson(path, bundleKey) {
    return fetch(DATA_PREFIX + path)
      .then(function (r) {
        if (!r.ok) throw new Error('fetch');
        return r.json();
      })
      .catch(function () {
        if (global.B100_DATA && global.B100_DATA[bundleKey]) {
          return global.B100_DATA[bundleKey];
        }
        throw new Error('no-data');
      });
  }

  function BibleReaderCore() {
    this.db = null;
    this.books = [];
    this.useSample = false;
    this.loadError = '';
    this.sample = { data: [], en: [] };
    this.bookId = 1;
    this.chapter = 1;
    this.filter = 'all';
    this.root = null;
    this.locale = getLocale();
    this.onProgressChange = null;
  }

  function urlContext() {
    var q = new URLSearchParams(location.search);
    return {
      track: q.get('track') || 'bible66',
      day: q.get('day'),
      gv: q.get('gv'),
      theme: q.get('theme'),
      unit: q.get('unit'),
      verse: q.get('verse'),
      locale: q.get('locale') || getLocale(),
    };
  }

  function readDoneHref(self) {
    var ctx = urlContext();
    var book = self.books.find(function (b) { return b.id === self.bookId; });
    var ref = (book ? bookLabel(book, self.locale) : '') + ' ' + self.chapter;
    var q = 'track=' + encodeURIComponent(ctx.track) +
      '&book=' + self.bookId + '&chapter=' + self.chapter +
      '&ref=' + encodeURIComponent(ref) +
      '&locale=' + encodeURIComponent(ctx.locale);
    if (ctx.day) q += '&day=' + encodeURIComponent(ctx.day);
    if (ctx.gv) q += '&gv=' + encodeURIComponent(ctx.gv);
    if (ctx.theme) q += '&theme=' + encodeURIComponent(ctx.theme) + '&unit=' + encodeURIComponent(ctx.unit || '0');
    if (ctx.verse) q += '&verse=' + encodeURIComponent(ctx.verse);
    return 'read-done.html?' + q;
  }

  BibleReaderCore.prototype.showDbAlert = function () {
    if (!this.root) return;
    var el = this.root.querySelector('#brDbAlert');
    if (!el) {
      el = document.createElement('div');
      el.id = 'brDbAlert';
      el.className = 'br-db-alert';
      el.setAttribute('role', 'alert');
      this.root.insertBefore(el, this.root.firstChild);
    }
    if (!this.useSample) {
      el.hidden = true;
      return;
    }
    el.hidden = false;
    var msg = this.loadError || '示範模式：僅樣本章節';
    el.innerHTML =
      '<strong>⚠️ 完整經庫未載入</strong> ' +
      '<span>' + esc(msg) + '</span> ' +
      '<span class="br-db-alert__hint">請關閉此頁，雙擊 <code>bible_app/打開聖經跑道.bat</code> 或 <code>聖經跑道一鍵開啟.vbs</code>，再按 Ctrl+F5。</span>';
  };

  BibleReaderCore.prototype.setHint = function (text) {
    var hint = this.root && this.root.querySelector('#brHint');
    if (hint) hint.textContent = text;
  };

  BibleReaderCore.prototype.queryVerses = function (version, b, c) {
    if (!this.db) return [];
    var stmt = this.db.prepare(
      'SELECT v, t FROM verses WHERE version = ? AND b = ? AND c = ? ORDER BY v'
    );
    stmt.bind([version, b, c]);
    var rows = [];
    while (stmt.step()) {
      var r = stmt.getAsObject();
      rows.push({ v: r.v, t: cleanVerseText(r.t) });
    }
    stmt.free();
    return rows;
  };

  BibleReaderCore.prototype.sampleVerses = function (b, c, arr) {
    return (arr || [])
      .filter(function (v) { return v.b === b && v.c === c; })
      .sort(function (a, b) { return a.v - b.v; })
      .map(function (x) { return { v: x.v, t: cleanVerseText(x.t) }; });
  };

  BibleReaderCore.prototype.updateChrome = function () {
    this.locale = getLocale();
    var pair = pairForLocale(this.locale);
    var fl = FILTER_LABELS[this.locale] || FILTER_LABELS.en;
    var single = getViewMode() === 'single';
    if (!this.root) return;
    var wrap = this.root.querySelector('.br-wrap');
    if (wrap) wrap.classList.toggle('br-wrap--single', single);
    var cols = this.root.querySelector('.br-cols');
    if (cols) {
      if (single) {
        cols.innerHTML = '<span>' + esc(L(pair.colL)) + '</span>';
      } else {
        cols.innerHTML = '<span>' + esc(L(pair.colL)) + '</span><span>' + esc(L(pair.colR)) + '</span>';
      }
    }
    this.root.querySelectorAll('.br-f').forEach(function (btn) {
      var f = btn.getAttribute('data-f');
      if (fl[f]) btn.textContent = fl[f];
    });
  };

  BibleReaderCore.prototype.mount = function (rootEl, opts) {
    var self = this;
    this.root = rootEl;
    opts = opts || {};
    if (opts.bookId) this.bookId = opts.bookId;
    if (opts.chapter) this.chapter = opts.chapter;

    this.root.innerHTML =
      '<div class="br-wrap">' +
        '<div class="br-toolbar">' +
          '<div class="br-filters">' +
            '<button type="button" class="br-f on" data-f="all">全部</button>' +
            '<button type="button" class="br-f" data-f="OT">旧约</button>' +
            '<button type="button" class="br-f" data-f="NT">新约</button>' +
          '</div>' +
          '<p class="br-hint" id="brHint">正在打開經庫…</p>' +
        '</div>' +
        '<div class="br-body">' +
          '<aside class="br-books" id="brBooks"></aside>' +
          '<section class="br-read">' +
            '<div class="br-chapters" id="brChapters"></div>' +
            '<div class="br-cols"><span></span><span></span></div>' +
            '<div class="br-verses" id="brVerses"></div>' +
          '</section>' +
        '</div>' +
      '</div>';

    this.root.querySelectorAll('.br-f').forEach(function (btn) {
      btn.addEventListener('click', function () {
        self.filter = btn.getAttribute('data-f');
        self.root.querySelectorAll('.br-f').forEach(function (b) {
          b.classList.toggle('on', b === btn);
        });
        self.renderBooks();
      });
    });

    return this.load().then(function () {
      self.updateChrome();
      self.showDbAlert();
      self.renderAll();
    }).catch(function () {
      self.updateChrome();
      self.showDbAlert();
      self.renderAll();
      self.setHint('載入失敗：請雙擊「打開聖經跑道.bat」');
    });
  };

  BibleReaderCore.prototype.go = function (bookId, chapter) {
    this.bookId = bookId;
    this.chapter = chapter || 1;
    this.renderAll();
  };

  BibleReaderCore.prototype.renderAll = function () {
    this.updateChrome();
    this.showDbAlert();
    this.renderBooks();
    this.renderChapters();
    this.renderVerses();
  };

  BibleReaderCore.prototype.renderBooks = function () {
    var list = this.root.querySelector('#brBooks');
    if (!list) return;
    var self = this;
    var loc = this.locale;
    list.innerHTML = '';
    if (!this.books.length) {
      list.innerHTML = '<p class="br-empty">書卷清單載入中或失敗</p>';
      return;
    }
    this.books.forEach(function (b) {
      var testament = b.id <= 39 ? 'OT' : 'NT';
      if (self.filter !== 'all' && self.filter !== testament) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = b.id + ' ' + bookLabel(b, loc);
      btn.classList.toggle('on', b.id === self.bookId);
      btn.addEventListener('click', function () {
        self.bookId = b.id;
        self.chapter = 1;
        self.renderAll();
      });
      list.appendChild(btn);
    });
    var onBtn = list.querySelector('button.on');
    if (onBtn) {
      requestAnimationFrame(function () {
        onBtn.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      });
    }
  };

  BibleReaderCore.prototype.renderChapters = function () {
    var bar = this.root.querySelector('#brChapters');
    var book = this.books.find(function (b) { return b.id === this.bookId; }.bind(this));
    if (!bar) return;
    bar.innerHTML = '';
    if (!book) return;
    var self = this;
    for (var c = 1; c <= book.chapters; c++) {
      (function (ch) {
        var btn = document.createElement('button');
        btn.type = 'button';
        var chDone = global.B100Progress && global.B100Progress.isDone(global.B100Progress.chapterId(self.bookId, ch));
        btn.textContent = (chDone ? '✓ ' : '') + ch;
        btn.classList.toggle('on', ch === self.chapter);
        btn.addEventListener('click', function () {
          self.chapter = ch;
          self.renderChapters();
          self.renderVerses();
        });
        bar.appendChild(btn);
      })(c);
    }
  };

  BibleReaderCore.prototype.renderVerses = function () {
    var grid = this.root.querySelector('#brVerses');
    if (!grid) return;
    var pair = pairForLocale(this.locale);
    var single = getViewMode() === 'single';
    var left, right;
    if (this.useSample) {
      left = this.sampleVerses(this.bookId, this.chapter, this.sample.data);
      right = this.sampleVerses(this.bookId, this.chapter, this.sample.en);
      if (this.loadError) {
        this.setHint(this.loadError);
      } else {
        this.setHint(L('bible_sample'));
      }
    } else {
      left = this.queryVerses(pair.left, this.bookId, this.chapter);
      right = single ? [] : this.queryVerses(pair.right, this.bookId, this.chapter);
      this.setHint(single ? (L(pair.colL) + ' · ' + L('bible_single_hint')) : L(pair.hint));
    }
    if (!left.length && !right.length) {
      var msg = L('bible_empty');
      if (this.useSample) {
        msg = '示範模式僅含創世記 1 與約 3:16 等樣本章。請雙擊「打開聖經跑道.bat」讀全庫。';
      }
      grid.innerHTML = '<p class="br-empty">' + esc(msg) + '</p>';
      return;
    }
    var maxV = single
      ? (left.length ? left[left.length - 1].v : 0)
      : Math.max(
        left.length ? left[left.length - 1].v : 0,
        right.length ? right[right.length - 1].v : 0
      );
    grid.innerHTML = '';
    var ctx = urlContext();
    var focusV = parseInt(ctx.verse, 10) || 0;
    for (var v = 1; v <= maxV; v++) {
      var a = left.find(function (x) { return x.v === v; });
      var b = right.find(function (x) { return x.v === v; });
      var row = document.createElement('div');
      row.className = 'br-row' + (focusV === v ? ' br-focus' : '');
      row.id = focusV === v ? 'br-verse-focus' : '';
      row.innerHTML = single
        ? '<div class="br-vn">' + v + '</div><div class="br-zh br-single-col">' + esc(a ? a.t : '—') + '</div>'
        : '<div class="br-vn">' + v + '</div>' +
          '<div class="br-zh">' + esc(a ? a.t : '—') + '</div>' +
          '<div class="br-en">' + esc(b ? b.t : '—') + '</div>';
      grid.appendChild(row);
    }
    if (focusV) {
      requestAnimationFrame(function () {
        var el = document.getElementById('br-verse-focus');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
    var bar = document.createElement('div');
    bar.className = 'br-done-bar';
    var doneId = global.B100Progress && global.B100Progress.chapterId(this.bookId, this.chapter);
    var already = global.B100Progress && doneId && global.B100Progress.isDone(doneId);
    bar.innerHTML =
      '<p style="margin:0 0 8px;font-weight:800">' + (already ? '✅ 這章打過卡了' : '🎉 讀完了嗎？') + '</p>' +
      '<a class="btn-track btn-done" href="' + readDoneHref(this) + '">' +
        (already ? '再看 AI 工具 →' : '讀完打卡 + 金星 →') +
      '</a>';
    grid.appendChild(bar);
  };

  BibleReaderCore.prototype.loadSql = function () {
    var self = this;
    if (location.protocol === 'file:') {
      self.loadError = '精簡離線模式（示範經文）';
      return Promise.reject(new Error('file'));
    }
    return fetch(DB_URL + '?_=' + Date.now(), { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('DB ' + r.status);
        return r.arrayBuffer();
      })
      .then(function (buf) {
        if (!buf || buf.byteLength < 1000000) throw new Error('DB small');
        return initSqlJs({
          locateFile: function (f) {
            return 'https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/' + f;
          },
        }).then(function (SQL) {
          self.db = new SQL.Database(new Uint8Array(buf));
          self.useSample = false;
          self.loadError = '';
          self.showDbAlert();
        });
      });
  };

  BibleReaderCore.prototype.load = function () {
    var self = this;
    var booksP = fetchJson('books.json', 'books').catch(function () {
      return { books: [] };
    });
    var sampleP = fetchJson('sample_bible.json', 'sample').catch(function () {
      return { data: [], en: [] };
    });

    return Promise.all([booksP, sampleP]).then(function (res) {
      self.books = res[0].books || [];
      self.sample = res[1];
      var ensureSql = function () {
        return self.loadSql().catch(function (err) {
          self.useSample = true;
          if (!self.loadError) {
            self.loadError = '經庫未就緒（示範模式）→ 請雙擊「打開聖經跑道.bat」';
          }
          if (err && err.message) {
            console.warn('[B100] bible DB:', err.message, DB_URL);
          }
        });
      };
      if (typeof initSqlJs === 'undefined') {
        return new Promise(function (resolve) {
          var s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/sql-wasm.js';
          s.onload = function () { ensureSql().then(resolve); };
          s.onerror = function () {
            self.useSample = true;
            self.loadError = '無法載入 sql.js（需網路）';
            resolve();
          };
          document.head.appendChild(s);
        });
      }
      return ensureSql();
    });
  };

  global.BibleReaderCore = BibleReaderCore;
  global.cleanVerseText = cleanVerseText;
})(window);
