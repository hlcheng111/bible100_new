/**

 * D 區 · 牧養問答：讀者路徑 — 本頁 Prompt + 難題 Q&A（不鏈備課工作台）

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

      question: (q.get('question') || q.get('q') || '').trim(),

    };

  }



  function siteModuleUrl(path, qs) {

    qs = qs || '';

    if (global.location.protocol === 'file:') {

      return '../../../../' + path + qs;

    }

    var bridge = global.B100Bridge;

    if (bridge && bridge.isRepoRootServe && bridge.isRepoRootServe()) {

      return global.location.origin + '/' + path + qs;

    }

    return '../../../' + path + qs;

  }



  function qnaHubUrl(ctx, bookNameZh) {

    var cat = 'A';

    if (ctx.bookId > 39) cat = 'A_NT';

    else if (ctx.bookId > 0) cat = 'A_OT';

    var qs = '?cat=' + cat;

    var book = bookNameZh || '';

    if (!book && ctx.ref) {

      book = ctx.ref.replace(/\s*第?\s*\d+\s*章.*$/, '').trim();

    }

    if (book) qs += '&book=' + encodeURIComponent(book);

    if (ctx.chapter) qs += '&chapter=' + encodeURIComponent(String(ctx.chapter));

    return siteModuleUrl('qna/index.html', qs);

  }



  function passageFrom(ctx, bookNameZh) {

    if (ctx.ref) return ctx.ref;

    if (bookNameZh && ctx.chapter) {

      return bookNameZh + ' ' + ctx.chapter + (ctx.verse ? ':' + ctx.verse : '');

    }

    return '';

  }



  /** 學生延伸：僅難題題庫（導讀歸 E 區） */

  function buildExtensionLinks(ctx, bookNameZh) {

    return [

      {

        emoji: '📚',

        label: '聖經難題 Q&A',

        sub: bookNameZh

          ? '已帶「' + bookNameZh + '」書卷篩選 · 站內多來源題庫'

          : '問過的難題與參考答案 · 仍須牧者審核',

        url: qnaHubUrl(ctx, bookNameZh),

        target: '_blank',

      },

    ];

  }



  function loadBookName(bookId, cb) {

    if (!bookId) {

      cb('');

      return;

    }

    var url = '../data/books.json';

    fetch(url)

      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })

      .then(function (data) {

        var books = (data && data.books) || [];

        var hit = books.filter(function (b) { return b.id === bookId; })[0];

        cb(hit ? (hit.nameZh || hit.nameEn || '') : '');

      })

      .catch(function () { cb(''); });

  }



  function renderExtensionLinks(links) {

    var root = global.document.getElementById('qnaExtLinks');

    if (!root) return;

    root.innerHTML = '';

    links.forEach(function (tool) {

      var a = global.document.createElement('a');

      a.className = 'qna-ext-link';

      a.href = tool.url;

      if (tool.target) a.target = tool.target;

      if (tool.target === '_blank') a.rel = 'noopener';

      a.innerHTML =

        '<strong>' + tool.emoji + ' ' + tool.label + '</strong>' +

        '<div class="qna-ext-sub">' + tool.sub + '</div>';

      root.appendChild(a);

    });

  }



  function buildInlinePrompt(ref, question) {

    var r = ref || '（請填經文）';

    var q = question || '請協助整理信仰問答草稿';

    return (

      '你是一位信仰問答草稿助手（回答須由牧者/老師審核）。\n\n' +

      '經文：' + r + '\n問題：' + q + '\n\n要求：\n' +

      '1. 只引用真實存在的經文，不編造章節\n' +

      '2. 標明不確定處需查證\n' +

      '3. 用繁體中文回答，保留經文原文\n' +

      '4. 結尾提醒：此為草稿，請牧者/老師審核\n'

    );

  }



  function bindInlineForm(ctx, bookNameZh) {

    var refIn = global.document.getElementById('qnaRef');

    var qIn = global.document.getElementById('qnaQuestion');

    var out = global.document.getElementById('qnaOut');

    if (!refIn || !out) return;



    var passage = passageFrom(ctx, bookNameZh);

    refIn.value = ctx.ref || passage;

    if (qIn && ctx.question) qIn.value = ctx.question;



    function gen() {

      out.value = buildInlinePrompt(refIn.value.trim(), qIn ? qIn.value.trim() : '');

    }



    var btnGen = global.document.getElementById('btnQnaGen');

    var btnCopy = global.document.getElementById('btnQnaCopy');

    if (btnGen) btnGen.addEventListener('click', gen);

    if (btnCopy) btnCopy.addEventListener('click', function () {

      if (!out.value) gen();

      out.select();

      try {

        global.document.execCommand('copy');

        alert('已複製！請貼到您使用的 AI 工具，並請牧者/老師審核。');

      } catch (e) {

        alert('請手動複製文字框內容。');

      }

    });

    if (refIn.value) gen();

  }



  function landingHref(ctx) {
    if (global.B100PageNav && global.B100PageNav.pageHref) {
      return global.B100PageNav.pageHref('landing.html');
    }
    var loc = (ctx && ctx.locale) || 'zh-Hant';
    return 'landing.html?locale=' + encodeURIComponent(loc);
  }

  function updateContextBar(ctx, bookNameZh) {

    var el = global.document.getElementById('qnaContext');

    if (!el) return;

    var passage = passageFrom(ctx, bookNameZh);

    if (!passage && !ctx.ref) {

      el.className = 'ctx-bar ctx-bar--empty';

      el.innerHTML =
        '尚未帶入經文。請先 <a href="' +
        landingHref(ctx) +
        '">回尋寶地圖選賽道</a>，讀完打卡後點「我有問題」會自動帶入。也可手動填下方經文。';

      return;

    }

    el.className = 'ctx-bar';

    el.innerHTML = '你剛讀：<strong>' + (ctx.ref || passage) + '</strong>';

  }



  function init() {

    var ctx = parseCtx();

    loadBookName(ctx.bookId, function (bookNameZh) {

      updateContextBar(ctx, bookNameZh);

      renderExtensionLinks(buildExtensionLinks(ctx, bookNameZh));

      bindInlineForm(ctx, bookNameZh);

    });

  }



  global.B100QnaHub = {

    parseCtx: parseCtx,

    qnaHubUrl: qnaHubUrl,

    buildExtensionLinks: buildExtensionLinks,

    init: init,

  };



  if (global.document.readyState === 'loading') {

    global.document.addEventListener('DOMContentLoaded', init);

  } else {

    init();

  }

})(typeof window !== 'undefined' ? window : global);

