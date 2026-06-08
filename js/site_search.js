/**
 * Bible100 全站關鍵字搜尋（中央探照燈）
 * 單一索引 · 三層標籤過濾 · 各 nav_hub 入口共用
 */
(function (global) {
  'use strict';

  var LAYER_META = {
    foundation: { id: 'foundation', label: '根基層', labelEn: 'Foundation', emoji: '📖' },
    execution: { id: 'execution', label: '執行層', labelEn: 'Execution', emoji: '👥' },
    strategy: { id: 'strategy', label: '戰略層', labelEn: 'Strategy', emoji: '🧭' },
    infra: { id: 'infra', label: '橫向設施', labelEn: 'Infra', emoji: '🔧' }
  };

  /** @type {Array<{title:string,path:string,keywords:string,layer:string}>} */
  var SITE_SEARCH_INDEX = [
    /* 根基層 */
    { title: '教材與培訓（中文）', path: 'languages/landP_cn.html', keywords: '教材,培訓,中文,百步四寶,material,cn', layer: 'foundation' },
    { title: '聖經研讀中心', path: 'bible_study/dashboard.html', keywords: '聖經,研讀,釋經,讀經,bible,study', layer: 'foundation' },
    { title: '聖經全文搜尋', path: 'bible_study/search_reader.html', keywords: '經文,搜尋,全文,scripture,search', layer: 'foundation' },
    { title: '綜合解讀', path: 'bible_study/comprehensive_exegesis_reader.html', keywords: '釋經,解讀,commentary,exegesis', layer: 'foundation' },
    { title: '聖經難題 Q&A', path: 'qna/qna_index_4layer_V2.htm', keywords: '難題,Q&A,問答,查經,qna', layer: 'foundation' },
    { title: '百步四寶總論手冊', path: 'help/bible100_curriculum_manual.html', keywords: '課程,總論,手冊,curriculum,manual', layer: 'foundation' },
    { title: '中文版側欄', path: 'languages/index_cn.html', keywords: '中文,語言,chinese,cn', layer: 'foundation' },
    { title: '英文版教材', path: 'languages/landP_en.html', keywords: '英文,english,en', layer: 'foundation' },

    /* 執行層 */
    { title: 'CRM 旅程地圖', path: 'church_ministry/guide_crm_journey_hub.html', keywords: 'CRM,旅程,牧養,事工,church,ministry,journey', layer: 'execution' },
    { title: '教會事工儀表板', path: 'church_ministry/dashboard.html', keywords: '戰情,儀表板,CRM,dashboard,行政', layer: 'execution' },
    { title: '會友 CRM', path: 'church_ministry/modules/members/member-integrated.html', keywords: '會友,通訊錄,member,crm', layer: 'execution' },
    { title: '探訪工作桌', path: 'church_ministry/modules/support/visitation_index.html', keywords: '探訪,關懷,visitation,care', layer: 'execution' },
    { title: 'A1 義工排班', path: 'church_ministry/tools/volunteer_shift/index.html', keywords: '排班,義工,志工,volunteer,shift,A1', layer: 'execution' },
    { title: 'A2 探訪跟進', path: 'church_ministry/tools/visitation_followup/index.html', keywords: '探訪,跟進,followup,A2', layer: 'execution' },
    { title: 'A3 財務對帳', path: 'church_ministry/tools/finance_reconciliation/index.html', keywords: '財務,對帳,finance,A3', layer: 'execution' },
    { title: '學校管理', path: 'school_management/dashboard.html', keywords: '學校,學籍,課程,school,management', layer: 'execution' },
    { title: '智慧事奉入口', path: 'smart_ministry/landing.html', keywords: '事奉,恩賜,配對,smart,ministry', layer: 'execution' },
    { title: '事奉媒合', path: 'smart_ministry/talent_ministry_matching.html', keywords: '媒合,CTV,配對,matching', layer: 'execution' },
    { title: '教會事工手冊', path: 'help/church_ministry_manual.html', keywords: 'CRM,手冊,理念,manual', layer: 'execution' },

    /* 戰略層 */
    { title: '教會規劃 OS 主索引', path: 'church_planning/index_plan.html', keywords: '規劃,OS,planning,教會規劃,5F', layer: 'strategy' },
    { title: '五年計劃屬靈前言', path: 'church_planning/vision.html', keywords: '異象,五年,前言,vision,神學', layer: 'strategy' },
    { title: '五階牧養流程', path: 'church_planning/process.html', keywords: '五階,流程,process,牧養', layer: 'strategy' },
    { title: 'SWOT 規劃', path: 'church_planning/Church_Governance_SWOT_matrix.html', keywords: 'SWOT,策略,規劃,swot', layer: 'strategy' },
    { title: 'SMART 目標', path: 'church_planning/smart-planning.html', keywords: 'SMART,目標,smart,okr', layer: 'strategy' },
    { title: 'PDCA 循環', path: 'church_planning/Church_Governance_PDCA_cycle.html', keywords: 'PDCA,改善,pdca', layer: 'strategy' },
    { title: 'CTA-OS 戰情室', path: 'church_planning/cta-os-war-room.html', keywords: '戰情,CTV,CTA,war,room', layer: 'strategy' },
    { title: 'RACI 權責反思', path: 'church_planning/planning/raci-reflection.html', keywords: 'RACI,權責,raci', layer: 'strategy' },
    { title: '教會健康診斷', path: 'church_planning/Church_Health_NCD_planning.html', keywords: '健康,診斷,health,NCD', layer: 'strategy' },
    { title: '營運自動化控制台', path: 'ai_tools/pages/crm_automation_console.html', keywords: '自動化,5F,intent,營運,automation', layer: 'strategy' },

    /* 橫向設施 */
    { title: '三層文集總覽', path: 'knowledge/index.html', keywords: '文集,知識,導言,理念,knowledge,essay', layer: 'infra' },
    { title: '目錄搜尋中心', path: 'nav_hub/index.html', keywords: '目錄,搜尋,導航,nav,hub,search', layer: 'infra' },
    { title: '架構與文檔中心', path: 'help/docs-hub.html', keywords: '文檔,架構,docs,help', layer: 'infra' },
    { title: 'AI 學習 Lab', path: 'ai_tools/ai_lab_landing.html', keywords: 'AI,lab,學習,prompt', layer: 'infra' },
    { title: '詩歌管理', path: 'hymn_management/dashboard.html', keywords: '詩歌,敬拜,hymn,worship', layer: 'infra' },
    { title: '工具總覽', path: 'tools/tools-dashboard.html', keywords: '工具,tools,總覽', layer: 'infra' },
    { title: '決策者一條路', path: 'church_ministry/guide_crm_journey_hub.html?tab=vision', keywords: '決策,牧者,長執,leader,path', layer: 'infra' }
  ];

  function normalizeQuery(q) {
    return String(q || '').trim().toLowerCase();
  }

  function pageMatches(page, query) {
    if (!query) return false;
    var hay = (page.title + ' ' + page.keywords + ' ' + page.path).toLowerCase();
    return hay.indexOf(query) >= 0;
  }

  function resolvePath(path, basePrefix) {
    var p = String(path || '');
    if (/^https?:\/\//i.test(p) || p.indexOf('//') === 0) return p;
    if (p.charAt(0) === '/') return p;
    var prefix = basePrefix || '';
    if (prefix && prefix.charAt(prefix.length - 1) !== '/') prefix += '/';
    return prefix + p;
  }

  function navigate(path, basePrefix) {
    var url = resolvePath(path, basePrefix);
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'navigate', url: url }, '*');
        if (typeof window.parent.bible100OpenContent === 'function') {
          window.parent.bible100OpenContent(url);
          return;
        }
        if (window.parent.document && window.parent.document.getElementById('contentFrame')) {
          window.parent.document.getElementById('contentFrame').src = url;
          return;
        }
      }
    } catch (eNav) { /* cross-origin */ }
    window.location.href = url;
  }

  function highlightText(text, query) {
    if (!query) return text;
    var esc = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return String(text).replace(new RegExp('(' + esc + ')', 'gi'), '<span class="b100-search-highlight">$1</span>');
  }

  function search(query, options) {
    options = options || {};
    var q = normalizeQuery(query);
    var layer = options.layer || null;
    var limit = options.limit || 40;

    var pool = SITE_SEARCH_INDEX.slice();
    if (layer && layer !== 'all') {
      pool = pool.filter(function (p) { return p.layer === layer; });
    }
    if (!q) return [];

    var results = pool.filter(function (p) { return pageMatches(p, q); });
    return results.slice(0, limit);
  }

  function getLayers() {
    return Object.keys(LAYER_META).map(function (k) { return LAYER_META[k]; });
  }

  function getIndex() {
    return SITE_SEARCH_INDEX.slice();
  }

  function renderResults(container, results, query, basePrefix) {
    if (!container) return;
    if (!results.length) {
      container.innerHTML = '<div class="b100-search-empty">沒有找到相關結果，試試其他關鍵詞或切換層級標籤。</div>';
      return;
    }
    var html = '';
    results.forEach(function (page) {
      var meta = LAYER_META[page.layer] || LAYER_META.infra;
      var fullPath = resolvePath(page.path, basePrefix);
      html += '<div class="b100-search-result" data-path="' + fullPath.replace(/"/g, '&quot;') + '" role="button" tabindex="0">';
      html += '<div class="b100-search-result__title">' + highlightText(page.title, query) + '</div>';
      html += '<div class="b100-search-result__meta"><span class="b100-search-layer b100-search-layer--' + page.layer + '">' + meta.emoji + ' ' + meta.label + '</span>';
      html += '<span class="b100-search-result__path">' + fullPath + '</span></div>';
      html += '</div>';
    });
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
  }

  /**
   * @param {Object} opts
   * @param {string|HTMLElement} opts.input
   * @param {string|HTMLElement} opts.results
   * @param {string|HTMLElement} [opts.layerFilter]
   * @param {string} [opts.basePrefix] - e.g. '../' from nav_hub
   */
  function mount(opts) {
    opts = opts || {};
    var inputEl = typeof opts.input === 'string' ? document.querySelector(opts.input) : opts.input;
    var resultsEl = typeof opts.results === 'string' ? document.querySelector(opts.results) : opts.results;
    var layerEl = opts.layerFilter
      ? (typeof opts.layerFilter === 'string' ? document.querySelector(opts.layerFilter) : opts.layerFilter)
      : null;
    var basePrefix = opts.basePrefix || '';
    var currentLayer = 'all';

    function run() {
      var q = inputEl ? inputEl.value : '';
      var list = search(q, { layer: currentLayer === 'all' ? null : currentLayer });
      renderResults(resultsEl, list, normalizeQuery(q), basePrefix);
    }

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

    return { refresh: run, setLayer: function (l) { currentLayer = l || 'all'; run(); } };
  }

  global.Bible100SiteSearch = {
    search: search,
    mount: mount,
    navigate: navigate,
    getLayers: getLayers,
    getIndex: getIndex,
    LAYER_META: LAYER_META,
    renderResults: renderResults,
    highlightText: highlightText
  };
})(typeof window !== 'undefined' ? window : this);
