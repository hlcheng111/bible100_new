/**
 * P3 研發儲備：經文 / Q&A context → 規劃工具（SWOT 等）
 * 當牧者在研讀或 Q&A 得到屬靈觀點，可「帶入異象開 SWOT」。
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'bible100_scripture_context_v1';

  function encodeParam(val) {
    return encodeURIComponent(String(val || '').slice(0, 500));
  }

  /**
   * 組裝帶 context 的 SWOT URL
   * @param {{ ref?: string, title?: string, snippet?: string, source?: string }} ctx
   */
  function buildSwotUrl(ctx) {
    ctx = ctx || {};
    var base = 'church_planning/Church_Governance_SWOT_matrix.html';
    var params = [];
    if (ctx.ref) params.push('ctx_ref=' + encodeParam(ctx.ref));
    if (ctx.title) params.push('ctx_title=' + encodeParam(ctx.title));
    if (ctx.snippet) params.push('ctx_snippet=' + encodeParam(ctx.snippet));
    if (ctx.source) params.push('ctx_source=' + encodeParam(ctx.source));
    return params.length ? base + '?' + params.join('&') : base;
  }

  function readFromUrl() {
    try {
      var sp = new URLSearchParams(window.location.search || '');
      if (!sp.has('ctx_ref') && !sp.has('ctx_title') && !sp.has('ctx_snippet')) return null;
      return {
        ref: sp.get('ctx_ref') || '',
        title: sp.get('ctx_title') || '',
        snippet: sp.get('ctx_snippet') || '',
        source: sp.get('ctx_source') || 'url'
      };
    } catch (e) {
      return null;
    }
  }

  function saveContext(ctx) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        savedAt: new Date().toISOString(),
        ref: ctx.ref || '',
        title: ctx.title || '',
        snippet: ctx.snippet || '',
        source: ctx.source || 'manual'
      }));
    } catch (eStore) { /* quota */ }
  }

  function loadContext() {
    var fromUrl = readFromUrl();
    if (fromUrl) return fromUrl;
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  /** 在規劃頁顯示經文宏願橫幅（若存在 context） */
  function renderContextBanner(containerId) {
    var ctx = loadContext();
    var el = document.getElementById(containerId || 'scriptureContextBanner');
    if (!ctx || !el) return;
    if (!ctx.ref && !ctx.title && !ctx.snippet) return;

    el.hidden = false;
    el.className = 'b100-scripture-ctx-banner';
    el.innerHTML =
      '<p class="b100-scripture-ctx-banner__kicker">💡 帶入的經文異象 · Scripture context</p>' +
      '<p class="b100-scripture-ctx-banner__ref"><strong>' + (ctx.ref || ctx.title) + '</strong></p>' +
      (ctx.snippet ? '<p class="b100-scripture-ctx-banner__snippet">' + ctx.snippet + '</p>' : '') +
      '<p class="b100-scripture-ctx-banner__hint">此段文字已預填為 SWOT「願景／機會」思考起點；請人工審核後再納入教會計劃。</p>';
  }

  global.ScriptureContextBridge = {
    buildSwotUrl: buildSwotUrl,
    readFromUrl: readFromUrl,
    saveContext: saveContext,
    loadContext: loadContext,
    renderContextBanner: renderContextBanner,
    STORAGE_KEY: STORAGE_KEY
  };
})(typeof window !== 'undefined' ? window : this);
