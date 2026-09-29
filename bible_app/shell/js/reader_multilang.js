/**
 * 多语查经 · 可选译本列 + 字号（默认双栏，避免四栏过宽）
 */
(function (global) {
  'use strict';

  var LANG_KEY = 'b100_ml_active_langs';

  var VERSIONS = [
    { id: 'zh', key: 'cuv_trust', pill: '中', label: '和合本', css: 'ml-col-h--zh' },
    { id: 'en', key: 'kjv', pill: 'EN', label: 'KJV', css: 'ml-col-h--en' },
    { id: 'vi', key: 'vi_1934', pill: 'VI', label: '越1934', css: 'ml-col-h--vi' },
    { id: 'id', key: 'id_ayt', pill: 'ID', label: '印尼AYT', css: 'ml-col-h--id' },
  ];

  var DEFAULT_ACTIVE = {
    'zh-Hant': ['zh', 'en'],
    en: ['en', 'zh'],
    vi: ['vi', 'en'],
    id: ['id', 'en'],
  };

  var FILTER_LABELS = {
    'zh-Hant': { all: '全部', OT: '旧约', NT: '新约' },
    en: { all: 'All', OT: 'OT', NT: 'NT' },
    vi: { all: 'Tất cả', OT: 'Cũ Ước', NT: 'Tân Ước' },
    id: { all: 'Semua', OT: 'PL', NT: 'PB' },
  };

  function esc(s) {
    var d = global.document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function getLocale() {
    var q = new URLSearchParams(global.location.search);
    return q.get('locale') || 'zh-Hant';
  }

  function loadActiveIds() {
    try {
      var raw = localStorage.getItem(LANG_KEY);
      if (raw) {
        var arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length) {
          return arr.filter(function (id) {
            return VERSIONS.some(function (v) { return v.id === id; });
          });
        }
      }
    } catch (e) {}
    var loc = getLocale();
    return (DEFAULT_ACTIVE[loc] || DEFAULT_ACTIVE['zh-Hant']).slice();
  }

  function saveActiveIds(ids) {
    try {
      localStorage.setItem(LANG_KEY, JSON.stringify(ids));
    } catch (e) {}
  }

  function bookLabel(book, loc) {
    if (!book) return '';
    if (loc === 'vi' && book.nameVi) return book.nameVi;
    if (loc === 'id' && book.nameId) return book.nameId;
    if (loc === 'en' && book.nameEn) return book.nameEn;
    return book.nameZh || book.nameEn || '';
  }

  function parseUrlState() {
    var q = new URLSearchParams(global.location.search);
    return {
      bookId: parseInt(q.get('book'), 10) || 1,
      chapter: parseInt(q.get('chapter'), 10) || 1,
      verse: parseInt(q.get('verse'), 10) || 0,
    };
  }

  function pushUrlState(self) {
    var q = new URLSearchParams(global.location.search);
    q.set('book', String(self.bookId));
    q.set('chapter', String(self.chapter));
    if (self.focusVerse) q.set('verse', String(self.focusVerse));
    else q.delete('verse');
    var next = global.location.pathname + '?' + q.toString();
    try {
      global.history.replaceState(null, '', next);
    } catch (eH) {}
  }

  function MultilangReader(rootEl) {
    this.root = rootEl;
    this.core = new global.BibleReaderCore();
    this.filter = 'all';
    var st = parseUrlState();
    this.bookId = st.bookId;
    this.chapter = st.chapter;
    this.focusVerse = st.verse;
    this.locale = getLocale();
    this.activeIds = loadActiveIds();
  }

  MultilangReader.prototype.activeVersions = function () {
    var self = this;
    return VERSIONS.filter(function (v) {
      return self.activeIds.indexOf(v.id) >= 0;
    });
  };

  MultilangReader.prototype.applyColCount = function () {
    var n = this.activeVersions().length || 1;
    this.root.style.setProperty('--ml-cols', String(n));
    var body = global.document.body;
    if (body) {
      body.setAttribute('data-cols', String(n));
      body.classList.remove('ml-cols-1', 'ml-cols-2', 'ml-cols-3', 'ml-cols-4');
      body.classList.add('ml-cols-' + n);
    }
    var scroll = this.root.querySelector('.ml-scroll');
    if (scroll) scroll.classList.toggle('ml-scroll--wide', n >= 3);
  };

  MultilangReader.prototype.mount = function () {
    var self = this;
    this.root.innerHTML =
      '<div class="ml-top">' +
        '<div class="ml-head">' +
          '<h1 class="ml-title">多语查经</h1>' +
          '<div class="ml-tools">' +
            '<span class="ml-tools-lbl" id="mlLangHeadLbl">譯本</span>' +
            '<div id="mlLangHeadSlot">' +
              '<div class="ml-lang-pills" id="mlLangPills" aria-label="譯本"></div>' +
            '</div>' +
            '<div class="font-size-bar" title="字体">' +
              '<button type="button" class="fs-btn" data-fs="sm">小</button>' +
              '<button type="button" class="fs-btn on" data-fs="md">中</button>' +
              '<button type="button" class="fs-btn" data-fs="lg">大</button>' +
            '</div>' +
          '</div>' +
          '<button type="button" class="ml-drawer-btn" id="mlDrawerBtn" aria-expanded="false" aria-controls="mlDrawer" title="更多：譯本、分類、搜經（不是左側欄）">更多</button>' +
        '</div>' +
        '<div class="ml-rail">' +
          '<label class="ml-book-label">書卷 ' +
            '<select class="ml-select" id="mlBookSelect" aria-label="書卷（66卷）"></select>' +
          '</label>' +
          '<div class="ml-ch-nav">' +
            '<button type="button" class="ml-ch-btn" id="mlPrevCh" aria-label="上一章">◀</button>' +
            '<span class="ml-ch-label" id="mlChLabel">章 1</span>' +
            '<button type="button" class="ml-ch-btn" id="mlNextCh" aria-label="下一章">▶</button>' +
          '</div>' +
          '<label class="ml-verse-jump">' +
            '節 <input type="number" id="mlVerseInput" min="1" max="176" placeholder="—">' +
          '</label>' +
        '</div>' +
        '<div class="ml-drawer" id="mlDrawer" hidden>' +
          '<p class="ml-drawer__h" id="mlLangDrawerLbl">譯本（對照哪幾種）</p>' +
          '<div id="mlLangDrawerSlot"></div>' +
          '<div class="ml-filters" id="mlFilters"></div>' +
          '<p class="ml-drawer__h">書卷分類</p>' +
          '<div class="b100-book-legend" id="mlBookLegend" aria-label="書卷分類"></div>' +
          '<div class="ml-quick-links">' +
            '<a class="ml-quick-link" href="reader-multilang-help.html">使用方法</a>' +
            '<a class="ml-quick-link" id="mlLinkExegesis" href="#">釋經參讀</a>' +
            '<a class="ml-quick-link" id="mlLinkSearch" href="../../../bible_study/search_reader.html">搜經</a>' +
            '<a class="ml-quick-link" id="mlLinkSiteSearch" href="../../../nav_hub/search/dashboard.html">目錄搜</a>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div id="mlDbAlert"></div>' +
      '<div class="ml-scroll" id="mlScroll">' +
        '<div class="ml-cols-head" id="mlColsHead"></div>' +
        '<div class="ml-verses" id="mlVerses"></div>' +
      '</div>';

    this.renderLangPills();
    this.renderFilters();
    this.renderBookLegend();
    this.applyColCount();

    if (global.BibleFontSize) {
      global.BibleFontSize.apply(global.BibleFontSize.get());
      global.BibleFontSize.bind(self.root);
    }

    this.root.querySelector('#mlPrevCh').addEventListener('click', function () {
      self.goChapter(self.chapter - 1);
    });
    this.root.querySelector('#mlNextCh').addEventListener('click', function () {
      self.goChapter(self.chapter + 1);
    });
    this.root.querySelector('#mlBookSelect').addEventListener('change', function (ev) {
      self.selectBook(parseInt(ev.target.value, 10) || 1);
    });
    this.root.querySelector('#mlVerseInput').addEventListener('change', function (ev) {
      var v = parseInt(ev.target.value, 10);
      self.focusVerse = v > 0 ? v : 0;
      self.renderVerses();
      pushUrlState(self);
    });
    this.bindDrawer();
    this.placeLangPills();
    if (global.matchMedia) {
      var mq = global.matchMedia('(max-width: 767px)');
      var onW = function () { self.placeLangPills(); };
      if (mq.addEventListener) mq.addEventListener('change', onW);
      else if (mq.addListener) mq.addListener(onW);
    }

    this.core.bookId = this.bookId;
    this.core.chapter = this.chapter;
    return this.core.load().then(function () {
      self.adoptBooksFromBundle();
      self.core.root = self.root.querySelector('#mlDbAlert');
      self.core.showDbAlert = function () {
        var el = self.root.querySelector('#mlDbAlert');
        if (!el) return;
        if (!self.core.useSample) {
          el.innerHTML = '';
          return;
        }
        el.className = 'br-db-alert';
        el.setAttribute('role', 'alert');
        el.innerHTML =
          '<strong>本機示範</strong> ' +
          '<span>' + esc(self.core.loadError || '僅少量經節') + '</span> ' +
          '<span class="br-db-alert__hint">完整經文請 <a href="https://bible100.lovestoblog.com/bible_app/shell/pages/reader-multilang.html' +
          (global.location.search || '') +
          '" target="_blank" rel="noopener">開雲端讀經頁</a>。</span>';
      };
      self.core.showDbAlert();
      return self.ensureBookData().then(function () { self.renderAll(); });
    }).catch(function () {
      self.adoptBooksFromBundle();
      self.renderAll();
    });
  };

  MultilangReader.prototype.adoptBooksFromBundle = function () {
    if (this.core.books && this.core.books.length) return;
    var pack = global.B100_DATA && global.B100_DATA.books;
    var list = pack && pack.books ? pack.books : pack;
    if (Array.isArray(list) && list.length) this.core.books = list;
  };

  MultilangReader.prototype.ensureBookData = function () {
    var core = this.core;
    core.bookId = this.bookId;
    core.chapter = this.chapter;
    if (!core.ensureFileBook) return Promise.resolve();
    if (core.db && !core.useFileVerses) return Promise.resolve();
    if (global.location.protocol !== 'file:' && !core.useFileVerses) return Promise.resolve();
    return core.ensureFileBook(this.bookId).catch(function () { return false; });
  };

  MultilangReader.prototype.bindDrawer = function () {
    var btn = this.root.querySelector('#mlDrawerBtn');
    var panel = this.root.querySelector('#mlDrawer');
    if (!btn || !panel) return;
    var self = this;
    btn.addEventListener('click', function () {
      var open = panel.hidden;
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.classList.toggle('on', open);
    });
    self.closeDrawer = function () {
      panel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      btn.classList.remove('on');
    };
  };

  MultilangReader.prototype.placeLangPills = function () {
    var pills = this.root.querySelector('#mlLangPills');
    var head = this.root.querySelector('#mlLangHeadSlot');
    var drawer = this.root.querySelector('#mlLangDrawerSlot');
    var headLbl = this.root.querySelector('#mlLangHeadLbl');
    var drawerLbl = this.root.querySelector('#mlLangDrawerLbl');
    if (!pills || !head || !drawer) return;
    var narrow = false;
    try {
      narrow = global.matchMedia && global.matchMedia('(max-width: 767px)').matches;
    } catch (eMq) {}
    if (narrow) {
      drawer.appendChild(pills);
      if (headLbl) headLbl.hidden = true;
      if (drawerLbl) drawerLbl.hidden = false;
    } else {
      head.appendChild(pills);
      if (headLbl) headLbl.hidden = false;
      if (drawerLbl) drawerLbl.hidden = true;
    }
  };

  MultilangReader.prototype.selectBook = function (bookId) {
    var self = this;
    this.bookId = parseInt(bookId, 10) || 1;
    this.chapter = 1;
    this.focusVerse = 0;
    var grid = this.root.querySelector('#mlVerses');
    if (grid) grid.innerHTML = '<p class="ml-empty">載入經文…</p>';
    this.ensureBookData().then(function () { self.renderAll(); });
    if (this.closeDrawer) this.closeDrawer();
  };

  MultilangReader.prototype.renderLangPills = function () {
    var wrap = this.root.querySelector('#mlLangPills');
    if (!wrap) return;
    var self = this;
    wrap.innerHTML = '';
    VERSIONS.forEach(function (v) {
      var btn = global.document.createElement('button');
      btn.type = 'button';
      btn.className = 'ml-lang-btn' + (self.activeIds.indexOf(v.id) >= 0 ? ' active' : '');
      btn.setAttribute('data-lang', v.id);
      btn.title = v.label;
      btn.textContent = v.pill;
      btn.addEventListener('click', function () {
        var on = self.activeIds.indexOf(v.id) >= 0;
        if (on && self.activeIds.length <= 1) return;
        if (on) {
          self.activeIds = self.activeIds.filter(function (id) { return id !== v.id; });
        } else {
          self.activeIds.push(v.id);
        }
        saveActiveIds(self.activeIds);
        self.renderLangPills();
        self.applyColCount();
        self.renderColHeaders();
        self.renderVerses();
      });
      wrap.appendChild(btn);
    });
  };

  MultilangReader.prototype.renderFilters = function () {
    var wrap = this.root.querySelector('#mlFilters');
    if (!wrap) return;
    var fl = FILTER_LABELS[this.locale] || FILTER_LABELS['zh-Hant'];
    var self = this;
    wrap.innerHTML = '';
    ['all', 'OT', 'NT'].forEach(function (f) {
      var btn = global.document.createElement('button');
      btn.type = 'button';
      btn.className = 'ml-f' + (self.filter === f ? ' on' : '');
      btn.setAttribute('data-f', f);
      btn.textContent = fl[f] || f;
      btn.addEventListener('click', function () {
        var prev = self.bookId;
        self.filter = f;
        self.renderFilters();
        self.renderBookSelect();
        self.renderBookLegend();
        if (self.bookId !== prev) self.selectBook(self.bookId);
      });
      wrap.appendChild(btn);
    });
  };

  MultilangReader.prototype.renderColHeaders = function () {
    var head = this.root.querySelector('#mlColsHead');
    if (!head) return;
    var active = this.activeVersions();
    head.innerHTML = '<span class="ml-vn-h"></span>';
    active.forEach(function (v) {
      head.innerHTML +=
        '<div class="ml-col-h ' + v.css + '">' + esc(v.label) + '</div>';
    });
    head.hidden = !active.length;
  };

  MultilangReader.prototype.filteredBooks = function () {
    var books = this.core.books || [];
    var self = this;
    return books.filter(function (b) {
      if (self.filter === 'all') return true;
      var t = b.id <= 39 ? 'OT' : 'NT';
      return self.filter === t;
    });
  };

  MultilangReader.prototype.renderBookLegend = function () {
    var wrap = this.root.querySelector('#mlBookLegend');
    if (!wrap || !global.B100BookCatalog) return;
    var self = this;
    var groups = global.B100BookCatalog.groupsForFilter(this.filter);
    wrap.innerHTML = '';
    groups.forEach(function (g) {
      var btn = global.document.createElement('button');
      btn.type = 'button';
      btn.className = 'b100-book-legend__chip ' + g.css;
      btn.textContent = global.B100BookCatalog.labelForGroup(g, self.locale);
      btn.title = '跳到' + g.labelZh;
      btn.addEventListener('click', function () {
        self.selectBook(g.min);
        var sel = self.root.querySelector('#mlBookSelect');
        if (sel) sel.value = String(g.min);
      });
      wrap.appendChild(btn);
    });
  };

  MultilangReader.prototype.renderBookSelect = function () {
    var sel = this.root.querySelector('#mlBookSelect');
    if (!sel) return;
    var books = this.core.books || [];
    var self = this;
    var filtered = this.filteredBooks();
    if (!filtered.some(function (b) { return b.id === self.bookId; })) {
      if (filtered.length) self.bookId = filtered[0].id;
    }
    sel.innerHTML = '';
    var catalog = global.B100BookCatalog;
    if (catalog && catalog.groupsForFilter) {
      catalog.groupsForFilter(this.filter).forEach(function (g) {
        var og = global.document.createElement('optgroup');
        og.label = catalog.labelForGroup(g, self.locale);
        books.forEach(function (b) {
          if (b.id < g.min || b.id > g.max) return;
          if (self.filter === 'OT' && b.id > 39) return;
          if (self.filter === 'NT' && b.id <= 39) return;
          var opt = global.document.createElement('option');
          opt.value = String(b.id);
          opt.textContent = b.id + ' ' + bookLabel(b, self.locale);
          opt.selected = b.id === self.bookId;
          og.appendChild(opt);
        });
        if (og.children.length) sel.appendChild(og);
      });
    } else {
      filtered.forEach(function (b) {
        var opt = global.document.createElement('option');
        opt.value = String(b.id);
        opt.textContent = b.id + ' ' + bookLabel(b, self.locale);
        opt.selected = b.id === self.bookId;
        sel.appendChild(opt);
      });
    }
  };

  MultilangReader.prototype.currentBook = function () {
    var books = this.core.books || [];
    return books.find(function (b) { return b.id === this.bookId; }.bind(this));
  };

  MultilangReader.prototype.goChapter = function (ch) {
    var book = this.currentBook();
    if (!book) return;
    if (ch < 1) ch = 1;
    if (ch > book.chapters) ch = book.chapters;
    this.chapter = ch;
    this.focusVerse = 0;
    this.renderAll();
  };

  MultilangReader.prototype.updateExegesisLink = function () {
    var a = this.root.querySelector('#mlLinkExegesis');
    var book = this.currentBook();
    if (!a || !book) return;
    var name = book.nameZh || book.nameEn || '';
    a.href =
      '../../../bible_study/comprehensive_exegesis_reader.html?book=' +
      encodeURIComponent(name) +
      '&chapter=' +
      this.chapter;
    a.title = name + ' ' + this.chapter;
  };

  MultilangReader.prototype.renderAll = function () {
    this.renderBookSelect();
    this.renderBookLegend();
    var book = this.currentBook();
    var chLabel = this.root.querySelector('#mlChLabel');
    if (chLabel) chLabel.textContent = book ? ('章 ' + this.chapter) : '章 —';
    if (book && this.chapter > book.chapters) this.chapter = book.chapters;
    if (book && this.chapter < 1) this.chapter = 1;
    var vi = this.root.querySelector('#mlVerseInput');
    if (vi) vi.value = this.focusVerse > 0 ? String(this.focusVerse) : '';
    this.updateExegesisLink();
    this.applyColCount();
    this.renderColHeaders();
    this.renderVerses();
    pushUrlState(this);
  };

  MultilangReader.prototype.queryColumn = function (versionKey, b, c) {
    if (this.core.useSample) {
      var arr = versionKey === 'kjv' ? this.core.sample.en : this.core.sample.data;
      return this.core.sampleVerses(b, c, arr);
    }
    return this.core.queryVerses(versionKey, b, c);
  };

  MultilangReader.prototype.renderVerses = function () {
    var grid = this.root.querySelector('#mlVerses');
    if (!grid) return;
    var self = this;
    var active = this.activeVersions();
    if (!active.length) {
      grid.innerHTML = '<p class="ml-empty">请至少选择一种译本</p>';
      return;
    }
    var cols = active.map(function (v) {
      return self.queryColumn(v.key, self.bookId, self.chapter);
    });
    var maxV = 0;
    cols.forEach(function (col) {
      if (col.length && col[col.length - 1].v > maxV) maxV = col[col.length - 1].v;
    });
    if (!maxV) {
      grid.innerHTML = '<p class="ml-empty">本章暂无经文</p>';
      return;
    }
    grid.innerHTML = '';
    for (var v = 1; v <= maxV; v++) {
      var row = global.document.createElement('div');
      row.className = 'ml-row' + (self.focusVerse === v ? ' ml-focus' : '');
      row.setAttribute('data-cols', String(active.length));
      row.id = self.focusVerse === v ? 'ml-verse-focus' : '';
      var html = '<div class="ml-vn">' + v + '</div>';
      active.forEach(function (ver, idx) {
        var hit = cols[idx].find(function (x) { return x.v === v; });
        html +=
          '<div class="ml-cell' + (hit ? '' : ' ml-cell--empty') + '" data-lang="' + ver.id + '">' +
          esc(hit ? hit.t : '—') +
          '</div>';
      });
      row.innerHTML = html;
      grid.appendChild(row);
    }
    if (self.focusVerse) {
      requestAnimationFrame(function () {
        var el = global.document.getElementById('ml-verse-focus');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  };

  global.B100MultilangReader = MultilangReader;
  global.B100MultilangVersions = VERSIONS;
})(typeof window !== 'undefined' ? window : global);
