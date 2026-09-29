/**
 * E 區 · 更深讀：接神學導讀站（guide_reading_hub），不鏈備課工作台
 */
(function (global) {
  'use strict';

  function parseCtx() {
    var q = new URLSearchParams(global.location.search);
    return {
      bookId: parseInt(q.get('book'), 10) || 0,
      chapter: parseInt(q.get('chapter'), 10) || 0,
      verse: q.get('verse') || '',
      ref: (q.get('ref') || q.get('passage') || '').trim(),
      locale: q.get('locale') || 'zh-Hant',
      track: q.get('track') || '',
    };
  }

  function passageFrom(ctx, bookNameZh) {
    if (ctx.ref) return ctx.ref;
    if (bookNameZh && ctx.chapter) {
      return bookNameZh + ' ' + ctx.chapter + (ctx.verse ? ':' + ctx.verse : '');
    }
    return '';
  }

  function guideReadingUrl(ctx, bookNameZh) {
    var passage = passageFrom(ctx, bookNameZh);
    var ref = ctx.ref || passage;
    var qs = '';
    if (passage || ref) {
      qs =
        '?passage=' +
        encodeURIComponent(passage || ref) +
        '&ref=' +
        encodeURIComponent(ref || passage) +
        '#sec-passage';
    } else {
      qs = '#sec-passage';
    }
    if (global.location.protocol === 'file:') {
      return '../../../../ai_tools/pages/guide_reading_hub.html' + qs;
    }
    var bridge = global.B100Bridge;
    if (bridge && bridge.hubToolUrl) {
      return bridge.hubToolUrl('pages/guide_reading_hub.html', qs.replace('#sec-passage', '') + '#sec-passage');
    }
    if (bridge && bridge.isRepoRootServe && bridge.isRepoRootServe()) {
      return global.location.origin + '/ai_tools/pages/guide_reading_hub.html' + qs;
    }
    return '../../../ai_tools/pages/guide_reading_hub.html' + qs;
  }

  function loadBookName(bookId, cb) {
    if (!bookId) {
      cb('');
      return;
    }
    fetch('../data/books.json')
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (data) {
        var books = (data && data.books) || [];
        var hit = books.filter(function (b) { return b.id === bookId; })[0];
        cb(hit ? (hit.nameZh || hit.nameEn || '') : '');
      })
      .catch(function () { cb(''); });
  }

  function updateContextBar(ctx, bookNameZh) {
    var el = global.document.getElementById('tutorContext');
    if (!el) return;
    var passage = passageFrom(ctx, bookNameZh);
    if (!passage && !ctx.ref) {
      el.textContent = '尚未帶入書卷；請從「讀完打卡」或讀經頁進入。';
      return;
    }
    el.innerHTML = '你剛讀：<strong>' + (ctx.ref || passage) + '</strong>';
  }

  function init() {
    var ctx = parseCtx();
    if (global.location.protocol === 'file:') {
      var note = global.document.getElementById('tutorFileNote');
      if (note) note.hidden = false;
    }
    loadBookName(ctx.bookId, function (bookNameZh) {
      updateContextBar(ctx, bookNameZh);
      var go = global.document.getElementById('tutorGo');
      if (go) {
        go.href = guideReadingUrl(ctx, bookNameZh);
        go.target = '_blank';
        go.rel = 'noopener';
      }
    });
  }

  global.B100TutorHub = { parseCtx: parseCtx, guideReadingUrl: guideReadingUrl, init: init };

  if (global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : global);
