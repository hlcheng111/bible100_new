/**
 * Bible100 全站關鍵字搜尋（中央探照燈）
 * - 索引：data/search/*.json（HTTP／上云）或 js/search_indexes_embedded.js（file://）
 * - 種類：nav（站內入口）／curriculum（教材課名）— 非經文全文
 * - 經文全文請走 bible_study/search_reader.html
 */
(function (global) {
  'use strict';

  var LAYER_META = {
    foundation: { id: 'foundation', label: '根基層', labelEn: 'Foundation', emoji: '📖' },
    execution: { id: 'execution', label: '執行層', labelEn: 'Execution', emoji: '👥' },
    strategy: { id: 'strategy', label: '戰略層', labelEn: 'Strategy', emoji: '🧭' },
    infra: { id: 'infra', label: '橫向設施', labelEn: 'Infra', emoji: '🔧' }
  };

  var KIND_META = {
    nav: { id: 'nav', label: '站內入口', labelEn: 'Site' },
    curriculum: { id: 'curriculum', label: '教材課名', labelEn: 'Lessons' }
  };

  /** 極小後備（embedded／JSON 皆失敗時） */
  var FALLBACK_NAV = [
    { title: '聖經研讀中心', path: 'bible_study/index.html', keywords: '聖經,研讀,bible,study', layer: 'foundation', kind: 'nav', lang: 'zh' },
    { title: '聖經全文搜尋（經文）', path: 'bible_study/search_reader.html', keywords: '經文,全文,scripture', layer: 'foundation', kind: 'nav', lang: 'zh' },
    { title: '聖經難題 Q&A', path: 'qna/index.html', keywords: '難題,Q&A,qna', layer: 'foundation', kind: 'nav', lang: 'zh' },
    { title: '教材與培訓路線圖', path: 'languages/_landing/home.html', keywords: '教材,百步,material', layer: 'foundation', kind: 'nav', lang: 'zh' },
    { title: '全站搜尋 Hub', path: 'nav_hub/site_search_hub.html', keywords: '搜尋,search,hub', layer: 'infra', kind: 'nav', lang: 'zh' },
    { title: '目錄 Sitemap', path: 'nav_hub/site_modules_sitemap.html', keywords: '目錄,sitemap', layer: 'infra', kind: 'nav', lang: 'zh' }
  ];

  var _items = null;
  var _readyPromise = null;
  var EMPTY_COPY =
    '沒有匹配的入口或課名。可換關鍵詞，或用下方「經文全文」在譯本裡搜（目錄索引不含經文正文）。';

  /** 英中常用對照：holy / jesus 等可命中中文課名關鍵詞 */
  var QUERY_ALIASES = {
    holy: ['holy', 'holiness', 'hallowed', '聖潔', '聖靈', '聖徒', '使徒信經', '屬靈'],
    holiness: ['holiness', 'holy', '聖潔', '成聖'],
    spirit: ['spirit', '聖靈', '屬靈', 'holy spirit'],
    'holy spirit': ['holy spirit', '聖靈', '屬靈', 'spirit'],
    jesus: ['jesus', '耶穌', '基督', 'christ'],
    christ: ['christ', '基督', '耶穌', 'jesus'],
    god: ['god', '神', '上帝'],
    prayer: ['prayer', '禱告', '主禱文', '主祷文'],
    creed: ['creed', '使徒信經', '信經'],
    armor: ['armor', 'armour', '軍裝', '屬靈軍裝'],
    gospel: ['gospel', '福音'],
    love: ['love', '愛', '約316', '約翰']
  };

  function normalizeQuery(q) {
    return String(q || '').trim().toLowerCase();
  }

  function expandQueryTerms(q) {
    var raw = normalizeQuery(q);
    if (!raw) return [];
    var terms = [raw];
    if (QUERY_ALIASES[raw]) {
      QUERY_ALIASES[raw].forEach(function (t) {
        var n = normalizeQuery(t);
        if (n && terms.indexOf(n) < 0) terms.push(n);
      });
    }
    return terms;
  }

  function tagItem(raw, defaultKind) {
    if (!raw || !raw.path) return null;
    return {
      title: String(raw.title || ''),
      path: String(raw.path || ''),
      keywords: String(raw.keywords || ''),
      layer: raw.layer || 'infra',
      kind: raw.kind || defaultKind || 'nav',
      lang: raw.lang || '',
      track: raw.track || ''
    };
  }

  function mergeFromEmbedded() {
    var bag = global.B100_SEARCH_INDEXES;
    if (!bag) return null;
    var out = [];
    (bag.nav || []).forEach(function (r) {
      var t = tagItem(r, 'nav');
      if (t) out.push(t);
    });
    (bag.curriculum_cn || []).forEach(function (r) {
      var t = tagItem(r, 'curriculum');
      if (t) out.push(t);
    });
    (bag.curriculum_en || []).forEach(function (r) {
      var t = tagItem(r, 'curriculum');
      if (t) out.push(t);
    });
    return out.length ? out : null;
  }

  function fetchJson(url) {
    return fetch(url, { cache: 'no-store' }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    });
  }

  function resolveDataBase() {
    try {
      var scripts = document.getElementsByTagName('script');
      for (var i = scripts.length - 1; i >= 0; i--) {
        var src = scripts[i].src || '';
        if (/site_search\.js/i.test(src)) {
          return src.replace(/js\/site_search\.js.*$/i, 'config/search/');
        }
      }
    } catch (e0) { /* ignore */ }
    return 'config/search/';
  }

  function loadFromFetch() {
    var base = resolveDataBase();
    return Promise.all([
      fetchJson(base + 'nav_index.json').catch(function () { return null; }),
      fetchJson(base + 'curriculum_cn.json').catch(function () { return null; }),
      fetchJson(base + 'curriculum_en.json').catch(function () { return null; })
    ]).then(function (parts) {
      var out = [];
      if (parts[0] && parts[0].items) {
        parts[0].items.forEach(function (r) {
          var t = tagItem(r, 'nav');
          if (t) out.push(t);
        });
      }
      if (parts[1] && parts[1].items) {
        parts[1].items.forEach(function (r) {
          var t = tagItem(r, 'curriculum');
          if (t) out.push(t);
        });
      }
      if (parts[2] && parts[2].items) {
        parts[2].items.forEach(function (r) {
          var t = tagItem(r, 'curriculum');
          if (t) out.push(t);
        });
      }
      return out.length ? out : null;
    });
  }

  function ensureReady() {
    if (_items) return Promise.resolve(_items);
    if (_readyPromise) return _readyPromise;
    _readyPromise = loadFromFetch()
      .then(function (fetched) {
        if (fetched) return fetched;
        var emb = mergeFromEmbedded();
        if (emb) return emb;
        return FALLBACK_NAV.map(function (r) { return tagItem(r, 'nav'); });
      })
      .catch(function () {
        var emb = mergeFromEmbedded();
        if (emb) return emb;
        return FALLBACK_NAV.map(function (r) { return tagItem(r, 'nav'); });
      })
      .then(function (list) {
        _items = list;
        return _items;
      });
    return _readyPromise;
  }

  function pageMatches(page, query) {
    if (!query) return false;
    var hay = (page.title + ' ' + page.keywords + ' ' + page.path + ' ' + (page.track || '')).toLowerCase();
    var terms = expandQueryTerms(query);
    for (var i = 0; i < terms.length; i++) {
      if (hay.indexOf(terms[i]) >= 0) return true;
    }
    return false;
  }

  function resolvePath(path, basePrefix) {
    var p = String(path || '');
    if (/^https?:\/\//i.test(p) || p.indexOf('//') === 0) return p;
    if (p.charAt(0) === '/') return p;
    var prefix = basePrefix || '';
    if (prefix && prefix.charAt(prefix.length - 1) !== '/') prefix += '/';
    return prefix + p;
  }

  /** 總站 contentFrame 必須用站根相對路徑（勿帶 ../） */
  function toHubRootPath(path) {
    var p = String(path || '').replace(/\\/g, '/');
    if (/^https?:\/\//i.test(p) || p.indexOf('//') === 0) return p;
    while (p.indexOf('../') === 0) p = p.slice(3);
    if (p.indexOf('./') === 0) p = p.slice(2);
    if (p.charAt(0) === '/') p = p.slice(1);
    return p;
  }

  function navigate(path, basePrefix) {
    var localUrl = resolvePath(path, basePrefix);
    var hubUrl = toHubRootPath(localUrl);
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'navigate', url: hubUrl }, '*');
        if (typeof window.parent.bible100OpenContent === 'function') {
          window.parent.bible100OpenContent(hubUrl);
          return;
        }
        if (window.parent.document && window.parent.document.getElementById('contentFrame')) {
          window.parent.document.getElementById('contentFrame').src = hubUrl;
          return;
        }
      }
    } catch (eNav) { /* cross-origin */ }
    window.location.href = localUrl;
  }

  function highlightText(text, query) {
    if (!query) return text;
    var esc = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return String(text).replace(new RegExp('(' + esc + ')', 'gi'), '<span class="b100-search-highlight">$1</span>');
  }

  function getPoolSync() {
    if (_items) return _items;
    var emb = mergeFromEmbedded();
    if (emb) {
      _items = emb;
      return _items;
    }
    return FALLBACK_NAV.map(function (r) { return tagItem(r, 'nav'); });
  }

  /**
   * @param {string} query
   * @param {{layer?:string,kind?:string,lang?:string,limit?:number}} options
   */
  function search(query, options) {
    options = options || {};
    var q = normalizeQuery(query);
    var layer = options.layer || null;
    var kind = options.kind || null;
    var lang = options.lang || null;
    var limit = options.limit || 40;
    var pool = getPoolSync().slice();

    if (kind && kind !== 'all') {
      pool = pool.filter(function (p) { return p.kind === kind; });
    }
    if (layer && layer !== 'all') {
      pool = pool.filter(function (p) { return p.layer === layer; });
    }
    if (lang && lang !== 'all') {
      var langLc = String(lang).toLowerCase();
      pool = pool.filter(function (p) {
        if (!p.lang) return true;
        var pl = String(p.lang).toLowerCase();
        if (langLc === 'cn' || langLc === 'zh' || langLc === 'zh-hant' || langLc === 'zh-hans') {
          return pl === 'cn' || pl.indexOf('zh') === 0;
        }
        return pl === langLc || pl.indexOf(langLc) === 0;
      });
    }
    if (!q) return [];
    return pool.filter(function (p) { return pageMatches(p, q); }).slice(0, limit);
  }

  function getLayers() {
    return Object.keys(LAYER_META).map(function (k) { return LAYER_META[k]; });
  }

  function getIndex() {
    return getPoolSync().slice();
  }

  function renderOneResult(page, query, basePrefix) {
    var meta = LAYER_META[page.layer] || LAYER_META.infra;
    var kindMeta = KIND_META[page.kind] || KIND_META.nav;
    var hubPath = toHubRootPath(page.path);
    var showPath = resolvePath(page.path, basePrefix);
    var html = '';
    html += '<div class="b100-search-result" data-path="' + hubPath.replace(/"/g, '&quot;') + '" role="button" tabindex="0">';
    html += '<div class="b100-search-result__title">' + highlightText(page.title, query) + '</div>';
    html += '<div class="b100-search-result__meta">';
    html += '<span class="b100-search-kind">' + kindMeta.label + '</span>';
    if (page.kind === 'nav') {
      html += '<span class="b100-search-layer b100-search-layer--' + page.layer + '">' + meta.emoji + ' ' + meta.label + '</span>';
    } else if (page.track) {
      html += '<span class="b100-search-track">' + page.track + '</span>';
    }
    if (page.lang) {
      html += '<span class="b100-search-lang">' + page.lang + '</span>';
    }
    html += '<span class="b100-search-result__path">' + showPath + '</span></div>';
    html += '</div>';
    return html;
  }

  function renderResults(container, results, query, basePrefix, extras) {
    if (!container) return;
    extras = extras || {};
    if (!results.length) {
      container.innerHTML = '<div class="b100-search-empty">' + (extras.emptyHtml || EMPTY_COPY) + '</div>';
      if (extras.footerHtml) {
        container.innerHTML += extras.footerHtml;
      }
      if (typeof extras.onFooterBind === 'function') extras.onFooterBind(container);
      return;
    }
    var html = '';
    if (extras.groupByKind) {
      var groups = [
        { kind: 'nav', label: '站內入口' },
        { kind: 'curriculum', label: '教材課名' }
      ];
      groups.forEach(function (g) {
        var slice = results.filter(function (p) { return p.kind === g.kind; });
        if (!slice.length) return;
        html += '<div class="b100-search-group-title">' + g.label + '（' + slice.length + '）</div>';
        slice.forEach(function (page) {
          html += renderOneResult(page, query, basePrefix);
        });
      });
    } else {
      results.forEach(function (page) {
        html += renderOneResult(page, query, basePrefix);
      });
    }
    if (extras.footerHtml) html += extras.footerHtml;
    container.innerHTML = html;
    container.querySelectorAll('.b100-search-result').forEach(function (el) {
      function go() {
        navigate(el.getAttribute('data-path'), '');
      }
      el.addEventListener('click', go);
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
      });
    });
    if (typeof extras.onFooterBind === 'function') extras.onFooterBind(container);
  }

  /**
   * @param {Object} opts
   */
  function mount(opts) {
    opts = opts || {};
    var inputEl = typeof opts.input === 'string' ? document.querySelector(opts.input) : opts.input;
    var resultsEl = typeof opts.results === 'string' ? document.querySelector(opts.results) : opts.results;
    var layerEl = opts.layerFilter
      ? (typeof opts.layerFilter === 'string' ? document.querySelector(opts.layerFilter) : opts.layerFilter)
      : null;
    var kindEl = opts.kindFilter
      ? (typeof opts.kindFilter === 'string' ? document.querySelector(opts.kindFilter) : opts.kindFilter)
      : null;
    var basePrefix = opts.basePrefix || '';
    var currentLayer = opts.defaultLayer || 'all';
    var currentKind = opts.defaultKind || 'all';
    var limit = opts.limit || 40;
    var lang = opts.lang || null;

    function footerFor(q) {
      if (typeof opts.buildFooter === 'function') return opts.buildFooter(q);
      return '';
    }

    function run() {
      var q = inputEl ? inputEl.value : '';
      var list = search(q, {
        layer: currentLayer === 'all' ? null : currentLayer,
        kind: currentKind === 'all' ? null : currentKind,
        lang: lang,
        limit: limit
      });
      renderResults(resultsEl, list, normalizeQuery(q), basePrefix, {
        footerHtml: footerFor(normalizeQuery(q) || String(q || '').trim()),
        onFooterBind: opts.onFooterBind,
        groupByKind: !!opts.groupByKind,
        emptyHtml: opts.emptyHtml
      });
      if (typeof opts.onAfterRender === 'function') opts.onAfterRender(list, q);
    }

    ensureReady().then(function () { run(); });

    if (inputEl) {
      inputEl.addEventListener('input', run);
      inputEl.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && inputEl) { inputEl.value = ''; run(); }
      });
    }

    if (layerEl) {
      layerEl.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-layer]');
        if (!btn) return;
        currentLayer = btn.getAttribute('data-layer') || 'all';
        layerEl.querySelectorAll('[data-layer]').forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
        });
        run();
      });
    }

    if (kindEl) {
      kindEl.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-kind]');
        if (!btn) return;
        currentKind = btn.getAttribute('data-kind') || 'all';
        kindEl.querySelectorAll('[data-kind]').forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
        });
        run();
      });
    }

    return {
      refresh: run,
      setLayer: function (l) { currentLayer = l || 'all'; run(); },
      setKind: function (k) { currentKind = k || 'all'; run(); },
      setLang: function (l) { lang = l || null; run(); },
      ensureReady: ensureReady
    };
  }

  // 啟動時預載（不阻塞）
  ensureReady();

  global.Bible100SiteSearch = {
    search: search,
    mount: mount,
    navigate: navigate,
    getLayers: getLayers,
    getIndex: getIndex,
    ensureReady: ensureReady,
    LAYER_META: LAYER_META,
    KIND_META: KIND_META,
    renderResults: renderResults,
    highlightText: highlightText,
    EMPTY_COPY: EMPTY_COPY,
    resolvePath: resolvePath,
    toHubRootPath: toHubRootPath
  };
})(typeof window !== 'undefined' ? window : this);
