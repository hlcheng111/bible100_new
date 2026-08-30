/**
 * 經文讀取：依 locale 雙欄對照（和合 / KJV / 越1934 / 印尼AYT）
 */
(function (global) {
  function pageInShellPages() {
    var p = (location.pathname || '').replace(/\\/g, '/');
    return p.indexOf('/pages/') >= 0 || /\/pages\/[^/]+\.html$/i.test(p);
  }

  function pageInBibleAssets() {
    var p = (location.pathname || '').replace(/\\/g, '/');
    return /\/app\/assets\/bible\//i.test(p);
  }

  var IN_BIBLE_DIR = pageInBibleAssets();
  var IN_PAGES = pageInShellPages() && !IN_BIBLE_DIR;
  var DB_BASE = IN_BIBLE_DIR ? './' : (IN_PAGES ? '../../app/assets/bible/' : '../app/assets/bible/');
  var DB_URL = DB_BASE + 'bible_reader.db';
  var DATA_PREFIX = IN_BIBLE_DIR ? '../../../shell/data/' : (IN_PAGES ? '../data/' : 'data/');

  function sqlDir() {
    if (IN_BIBLE_DIR) return '../../../shell/vendor/sqljs/';
    if (IN_PAGES) return '../vendor/sqljs/';
    return 'vendor/sqljs/';
  }

  function fileVerseSrc(bookId) {
    var name = 'b' + bookId + '.js';
    if (IN_BIBLE_DIR) return './verses/' + name;
    if (IN_PAGES) return '../../app/assets/bible/verses/' + name;
    return '../app/assets/bible/verses/' + name;
  }

  function loadFileBook(bookId) {
    bookId = parseInt(bookId, 10) || 1;
    if (global.B100FileVerses && global.B100FileVerses[bookId]) {
      return Promise.resolve(true);
    }
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = fileVerseSrc(bookId);
      s.onload = function () {
        try { s.remove(); } catch (eRm) {}
        if (global.B100FileVerses && global.B100FileVerses[bookId]) resolve(true);
        else reject(new Error('empty pack'));
      };
      s.onerror = function () {
        try { s.remove(); } catch (eRm2) {}
        reject(new Error('script'));
      };
      document.head.appendChild(s);
    });
  }

  var IDB_NAME = 'b100_bible_sql';

  function idbOpen() {
    return new Promise(function (resolve, reject) {
      try {
        var req = indexedDB.open(IDB_NAME, 1);
        req.onupgradeneeded = function () {
          if (!req.result.objectStoreNames.contains('db')) req.result.createObjectStore('db');
        };
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { reject(req.error); };
      } catch (eIdb) {
        reject(eIdb);
      }
    });
  }

  function idbGet() {
    return idbOpen().then(function (db) {
      return new Promise(function (resolve) {
        var tx = db.transaction('db', 'readonly').objectStore('db').get('bible_reader');
        tx.onsuccess = function () { resolve(tx.result || null); };
        tx.onerror = function () { resolve(null); };
      });
    }).catch(function () { return null; });
  }

  function idbPut(buf) {
    return idbOpen().then(function (db) {
      return new Promise(function (resolve) {
        var tx = db.transaction('db', 'readwrite').objectStore('db').put(buf, 'bible_reader');
        tx.onsuccess = function () { resolve(); };
        tx.onerror = function () { resolve(); };
      });
    }).catch(function () {});
  }

  function cloudReaderHref() {
    var name = ((location.pathname || '').split('/').pop() || '').split('?')[0];
    var page = /reader-multilang\.html/i.test(name) ? 'reader-multilang.html' : 'bible66.html';
    return 'https://bible100.lovestoblog.com/bible_app/shell/pages/' + page + (location.search || '');
  }

  function cloudReaderLink(label) {
    return '<a href="' + cloudReaderHref() + '" target="_blank" rel="noopener">' + (label || '雲端讀經頁') + '</a>';
  }

  function cloudReadCta(self) {
    var href = cloudReaderHref();
    var book = self && self.books
      ? self.books.find(function (b) { return b.id === self.bookId; })
      : null;
    var loc = (self && self.locale) || getLocale();
    var name = book ? bookLabel(book, loc) : '';
    var ch = self && self.chapter ? String(self.chapter) : '';
    var verse = parseInt((urlContext().verse || ''), 10) || 0;
    var ref = name
      ? (name + ' ' + ch + ' 章' + (verse ? ' 第 ' + verse + ' 節' : ''))
      : '這一章';
    return (
      '<p style="margin:0 0 10px">本機沒有「' + esc(ref) + '」的經文。</p>' +
      '<p><label class="btn-track btn-done" style="display:inline-block;cursor:pointer">選取本機經庫 bible_reader.db' +
        '<input id="b100PickDb" type="file" accept=".db,.sqlite,application/octet-stream" style="display:none" />' +
      '</label></p>' +
      '<p style="margin:8px 0 0;font-size:12px;color:#64748b">檔案位置：bible_app\\app\\assets\\bible\\bible_reader.db</p>' +
      '<p style="margin:10px 0 0"><a class="btn-track" href="' + href + '" target="_blank" rel="noopener">或新分頁讀雲端「' + esc(ref) + '」</a></p>' +
      '<p style="margin:12px 0 0;font-size:13px;line-height:1.5;color:#475569">雲端第一次約 30～60 秒載經庫；選本機檔則立刻用真 66 卷。</p>'
    );
  }

  function activeDbBase() {
    if (global.B100LiveDb && global.B100LiveDb.getDbBase) {
      var live = global.B100LiveDb.getDbBase();
      if (live && /^https?:\/\//i.test(live)) return live;
    }
    if (global.__B100_LIVE_DB_BASE__ && /^https?:\/\//i.test(global.__B100_LIVE_DB_BASE__)) {
      return global.__B100_LIVE_DB_BASE__;
    }
    return DB_BASE;
  }

  function openSqlBuffer(self, buf) {
    if (!buf || buf.byteLength < 1000000) return Promise.reject(new Error('DB small'));
    var sqlBase = sqlDir();
    return initSqlJs({
      locateFile: function (f) {
        return sqlBase + f;
      },
    }).then(function (SQL) {
      self.db = new SQL.Database(new Uint8Array(buf));
      self.useSample = false;
      self.loadError = '';
      self.showDbAlert();
      idbPut(buf);
    });
  }

  function bufferLooksLikeDb(buf) {
    if (!buf || buf.byteLength < 1000000) return false;
    var view = new Uint8Array(buf);
    if (view[0] === 0x3C) return false;
    var head = new TextDecoder().decode(view.slice(0, 15));
    return head.indexOf('SQLite format') >= 0 || buf.byteLength >= 1000000;
  }

  function fetchDbBufferFrom(base) {
    base = base || activeDbBase();
    function getArrayBuffer(url) {
      return fetch(url, { cache: 'no-store', credentials: 'same-origin' })
        .then(function (r) {
          if (!r.ok) throw new Error('fetch ' + r.status);
          var ct = (r.headers.get('content-type') || '').toLowerCase();
          if (ct.indexOf('text/html') >= 0) throw new Error('fetch html');
          return r.arrayBuffer();
        })
        .catch(function () {
          return new Promise(function (resolve, reject) {
            try {
              var xhr = new XMLHttpRequest();
              xhr.open('GET', url, true);
              xhr.responseType = 'arraybuffer';
              xhr.onload = function () {
                if (xhr.status === 0 || xhr.status === 200) resolve(xhr.response);
                else reject(new Error('xhr ' + xhr.status));
              };
              xhr.onerror = function () { reject(new Error('xhr err')); };
              xhr.send();
            } catch (eXhr) {
              reject(eXhr);
            }
          });
        });
    }
    function loadWhole() {
      return getArrayBuffer(base + 'bible_reader.db?_=' + Date.now()).then(function (buf) {
        if (bufferLooksLikeDb(buf)) return buf;
        throw new Error('DB small');
      });
    }
    function loadParts() {
      return getArrayBuffer(base + 'bible_reader.db.manifest.json?_=' + Date.now())
        .then(function (buf) {
          var manifest = JSON.parse(new TextDecoder().decode(buf));
          var parts = (manifest && manifest.parts) || [];
          if (!parts.length) throw new Error('empty manifest');
          return Promise.all(
            parts.map(function (name) {
              return getArrayBuffer(base + name + '?_=' + Date.now()).then(function (partBuf) {
                if (!partBuf || partBuf.byteLength < 100000 || new Uint8Array(partBuf)[0] === 0x3C) {
                  throw new Error('part bad ' + name);
                }
                return partBuf;
              });
            })
          ).then(function (bufs) {
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
        });
    }
    if (location.protocol === 'file:') {
      return loadParts().catch(function () { return loadWhole(); });
    }
    return loadWhole().catch(function () { return loadParts(); });
  }

  function fetchDbBuffer() {
    return fetchDbBufferFrom(activeDbBase());
  }

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
      .replace(/<RF>[\s\S]*?<Rf>/gi, '')
      .replace(/<Rf>[\s\S]*?<RF>/gi, '')
      .replace(/<FR>[\s\S]*?<Fr>/gi, '')
      .replace(/<Fr>[\s\S]*?<FR>/gi, '')
      .replace(/<\/?R[Ff][^>]*>/gi, '')
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
    this.useFileVerses = false;
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
    var prefix = IN_BIBLE_DIR ? '../../../shell/pages/' : '';
    return prefix + 'read-done.html?' + q;
  }

  function trackListHref() {
    var ctx = urlContext();
    var map = {
      plan1y: 'track-plan1y.html',
      plan3y: 'track-plan3y.html',
      '30day': 'track-30day.html',
      golden: 'track-golden.html',
      theme: 'track-theme.html',
    };
    var page = map[ctx.track];
    if (!page) return '';
    var prefix = IN_BIBLE_DIR ? '../../../shell/pages/' : '';
    var href = prefix + page;
    if (ctx.track === 'theme' && ctx.theme) {
      href += '?focus=' + encodeURIComponent(ctx.theme);
    }
    return href;
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
    var msg = this.loadError || '经库未完整载入';
    var liveHint = '';
    var RT = global.B100RuntimeMode;
    if (RT && RT.isCloud && RT.isCloud()) {
      liveHint = '云端：请确认已上传 bible_reader.db 分片 + manifest.json，然后 Ctrl+F5。';
    } else if (RT && RT.isLocalHttp && RT.isLocalHttp()) {
      liveHint = '请 Ctrl+F5 重试；若仍失败，请确认 bible_app/app/assets/bible/ 经库完整。';
    } else if (global.B100LiveDb && global.B100LiveDb.isLive && global.B100LiveDb.isLive()) {
      var shellUrl =
        global.B100LiveDb.getShellUrl &&
        global.B100LiveDb.getShellUrl();
      liveHint =
        '已连本机 HTTP，但经库载入失败。请 Ctrl+F5 或 <a href="' +
        (shellUrl || '#') +
        '" target="_blank" rel="noopener">重开跑道 ↗</a>。';
    } else if (location.protocol === 'file:') {
      el.innerHTML = cloudReadCta(this);
      this.bindLocalDbPicker();
      return;
    } else {
      liveHint = '請刷新頁面；雲端請稍後再試。';
    }
    var title = '經庫未完整載入';
    el.innerHTML =
      '<strong>' + title + '</strong> ' +
      '<span>' + esc(msg) + '</span> ' +
      '<span class="br-db-alert__hint">' + liveHint + '</span>';
  };

  BibleReaderCore.prototype.setHint = function (text) {
    var hint = this.root && this.root.querySelector('#brHint');
    if (hint) hint.textContent = text;
  };

  BibleReaderCore.prototype.bindLocalDbPicker = function () {
    var self = this;
    var input = document.getElementById('b100PickDb');
    if (!input || input.getAttribute('data-bound')) return;
    input.setAttribute('data-bound', '1');
    input.addEventListener('change', function () {
      var f = input.files && input.files[0];
      if (!f) return;
      self.setHint('正在讀取本機經庫…');
      var reader = new FileReader();
      reader.onload = function () {
        openSqlBuffer(self, reader.result).then(function () {
          self.renderAll();
        }).catch(function () {
          self.useSample = true;
          self.loadError = '選的檔不是 bible_reader.db';
          self.showDbAlert();
        });
      };
      reader.onerror = function () {
        self.loadError = '讀檔失敗';
        self.showDbAlert();
      };
      reader.readAsArrayBuffer(f);
    });
  };

  BibleReaderCore.prototype.queryVerses = function (version, b, c) {
    if (this.useFileVerses) {
      var pack = global.B100FileVerses && global.B100FileVerses[b];
      var ch = pack && pack[version] && pack[version][String(c)];
      if (!ch || !ch.length) return [];
      var rows = [];
      for (var i = 1; i < ch.length; i++) {
        if (ch[i]) rows.push({ v: i, t: cleanVerseText(ch[i]) });
      }
      return rows;
    }
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
      self.setHint('本機示範。完整經文請開雲端讀經頁。');
    });
  };

  BibleReaderCore.prototype.go = function (bookId, chapter) {
    var self = this;
    this.bookId = bookId;
    this.chapter = chapter || 1;
    if (this.useFileVerses) {
      loadFileBook(this.bookId).then(function () { self.renderAll(); });
      return;
    }
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
        if (self.useFileVerses) {
          loadFileBook(self.bookId).then(function () { self.renderAll(); });
          return;
        }
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
      if (this.useSample && location.protocol === 'file:') {
        grid.innerHTML = '<div class="br-empty">' + cloudReadCta(this) + '</div>';
        this.bindLocalDbPicker();
        return;
      }
      var msg = L('bible_empty');
      if (this.useSample) {
        msg = (function () {
          var h2 = (location.hostname || '').toLowerCase();
          if (location.protocol !== 'file:' && h2 !== 'localhost' && h2 !== '127.0.0.1') {
            return '此章經文未載入。請確認雲端已上傳 bible_reader.db。';
          }
          if (global.B100LiveDb && global.B100LiveDb.isLive && global.B100LiveDb.isLive()) {
            return '此章暫無資料。請 Ctrl+F5 重試。';
          }
          return '此章暫無經文。';
        })();
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
      '</a>' +
      (function () {
        var back = trackListHref();
        if (!back) return '';
        return ' <a class="btn-track" href="' + back + '">↩ 回跑道選其他關</a>';
      })();
    grid.appendChild(bar);
  };

  BibleReaderCore.prototype.loadSql = function () {
    var self = this;
    function loadFromBase(base) {
      return fetchDbBufferFrom(base).then(function (buf) {
        return openSqlBuffer(self, buf);
      });
    }
    if (location.protocol !== 'file:') {
      return loadFromBase(activeDbBase());
    }
    return idbGet().then(function (cached) {
      if (cached && bufferLooksLikeDb(cached)) {
        return openSqlBuffer(self, cached);
      }
      return loadFileBook(self.bookId).then(function () {
        self.useFileVerses = true;
        self.useSample = false;
        self.loadError = '';
        self.showDbAlert();
      });
    }).catch(function () {
      self.loadError = '僅示範經節';
      return Promise.reject(new Error('file'));
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
            self.loadError = '經庫未就緒';
          }
          if (err && err.message) {
            console.warn('[B100] bible DB:', err.message, DB_URL);
          }
        });
      };
      if (location.protocol === 'file:') {
        return ensureSql();
      }
      if (typeof initSqlJs === 'undefined') {
        return new Promise(function (resolve) {
          var s = document.createElement('script');
          var sqlBase = sqlDir();
          s.src = sqlBase + 'sql-wasm.js';
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

  /** 多語查經換卷用：不呼叫 renderAll，避免動到跑道 DOM。HTTPS／已開 sql 時直接略過。 */
  BibleReaderCore.prototype.ensureFileBook = function (bookId) {
    var self = this;
    bookId = parseInt(bookId, 10) || 1;
    this.bookId = bookId;
    if (this.db && !this.useFileVerses) {
      return Promise.resolve('sql');
    }
    return loadFileBook(bookId).then(function () {
      self.useFileVerses = true;
      self.useSample = false;
      self.loadError = '';
      return 'file';
    });
  };

  global.BibleReaderCore = BibleReaderCore;
  global.cleanVerseText = cleanVerseText;
})(window);
