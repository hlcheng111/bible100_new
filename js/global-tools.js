/**
 * Global tools: 翻譯建議、送給 AI、我的收藏、說明
 * 僅在頂層入口載入，全站與所有 iframe 內頁皆可用（由頂層讀取當前 iframe 的 URL/標題）
 * 不修改各模組內頁。
 */
(function () {
  'use strict';

  function getBasePath() {
    var path = (window.location.pathname || '').replace(/\\/g, '/').replace(/\/$/, '') || '/';
    var idx = path.indexOf('bible100_new');
    if (idx >= 0) path = path.slice(idx + 12).replace(/^\//, '');
    var parts = path.split('/').filter(Boolean);
    if (parts.length && /index\.(html?)$/i.test(parts[parts.length - 1])) parts.pop();
    var depth = parts.length;
    if (depth === 0) return '';
    var arr = [];
    for (var i = 0; i < depth; i++) arr.push('..');
    return arr.join('/');
  }

  function getCurrentContext() {
    var url = '';
    var title = '';
    try {
      var cf = document.getElementById('contentFrame');
      if (cf && cf.tagName && cf.tagName.toLowerCase() === 'iframe' && cf.src) {
        try {
          if (cf.contentWindow && cf.contentWindow.location && cf.contentWindow.location.href) {
            url = cf.contentWindow.location.href;
          }
        } catch (e) { }
        if (!url) url = cf.src;
        try {
          if (cf.contentDocument && cf.contentDocument.title) title = cf.contentDocument.title;
        } catch (e2) { }
      }
    } catch (e3) { }
    if (!url) {
      url = window.location.href;
      title = document.title || '';
    }
    if (!title) title = '當前頁面';
    return { url: url, title: title };
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(ta);
      return Promise.resolve();
    } catch (e) {
      document.body.removeChild(ta);
      return Promise.reject(e);
    }
  }

  function showToast(msg) {
    var el = document.getElementById('global-tools-toast');
    if (el) document.body.removeChild(el);
    el = document.createElement('div');
    el.id = 'global-tools-toast';
    el.style.cssText = 'position:fixed;top:60px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:#fff;padding:12px 20px;border-radius:8px;font-size:13px;z-index:10001;max-width:90%;box-shadow:0 4px 16px rgba(0,0,0,0.35);white-space:nowrap;';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function () {
      if (el.parentNode) document.body.removeChild(el);
    }, 3000);
  }

  function doTranslate() {
    var base = getBasePath();
    var translatePath = (base ? base + '/' : '') + 'help/translate.html';
    var ctx = getCurrentContext();
    var url = ctx.url;
    if (url) {
      translatePath += '?url=' + encodeURIComponent(url);
    }
    window.open(translatePath, '_blank', 'noopener');
    if (url) {
      showToast('已開啟翻譯頁並帶入當前網址，可選沉浸式或 Google 翻譯');
    } else {
      showToast('請在翻譯頁貼上從選單複製的連結，再選翻譯方式');
    }
  }

  var aiOptions = [
    { id: 'copilot', label: 'Copilot', url: 'https://copilot.microsoft.com/' },
    { id: 'chatgpt', label: 'ChatGPT', url: 'https://chat.openai.com/' },
    { id: 'claude', label: 'Claude', url: 'https://claude.ai/' },
    { id: 'copyonly', label: '僅複製', url: '' }
  ];

  function doSendToAI(aiId) {
    var ctx = getCurrentContext();
    var text = 'Title: ' + (ctx.title || '') + '\nURL: ' + (ctx.url || '');
    copyText(text).then(function () {
      showToast('已複製標題與網址，可貼到 AI 對話');
      var opt = aiOptions.filter(function (o) { return o.id === aiId; })[0];
      if (opt && opt.url) window.open(opt.url, '_blank', 'noopener');
    }).catch(function () {
      showToast('複製失敗，請手動複製');
    });
  }

  function doSaveCurrent(btnEl) {
    var ctx = getCurrentContext();
    if (!ctx.url) {
      showToast('無法取得當前頁面網址');
      return;
    }
    var key = 'global-tools-saved';
    var raw = localStorage.getItem(key);
    var list = raw ? JSON.parse(raw) : [];
    list.push({ title: ctx.title || ctx.url, url: ctx.url, at: new Date().toISOString() });
    try {
      localStorage.setItem(key, JSON.stringify(list));
      if (btnEl) {
        var orig = btnEl.textContent;
        btnEl.textContent = '✓ 已加入';
        btnEl.style.background = 'rgba(0,180,0,0.5)';
        setTimeout(function () {
          btnEl.textContent = orig;
          btnEl.style.background = '';
        }, 2200);
      }
      showToast('已加入「我的收藏」，可到「已收藏」檢視');
    } catch (e) {
      showToast('儲存失敗（可能為無痕模式）');
    }
  }

  function init() {
    var root = document.getElementById('global-tools-root');
    var topbar = document.querySelector('.topbar-inner');
    if (!root && !topbar && !document.getElementById('global-tools-inject') && !document.querySelector('.header-main')) {
      return; /* 不在主頁面（如 sidebar iframe），跳過初始化避免報錯 */
    }
    var base = getBasePath();
    var helpPath = (base ? base + '/' : '') + 'help/global-tools.htm';
    var savedPath = (base ? base + '/' : '') + 'help/my-saved.html';
    var translatePath = (base ? base + '/' : '') + 'help/translate.html';
    var aiChooserPath = (base ? base + '/' : '') + 'help/ai-chooser.html';
    var htmlEditorPath = (base ? base + '/' : '') + 'tools/html_editor.html';
    var editGuidePath = (base ? base + '/' : '') + 'help/edit-website-guide.html';

    var bar = document.createElement('div');
    bar.className = 'global-tools-bar';
    bar.innerHTML =
      '<span class="global-tools-main-wrap" id="global-tools-main-wrap">' +
      '<a href="#" class="global-tools-btn" id="global-tools-main-btn" title="教會現資訊、會眾入口、目錄搜索">工具 總覽</a>' +
      '<button type="button" class="global-tools-btn global-tools-arrow" id="global-tools-arrow-btn" aria-label="更多選項" title="翻譯、送AI、收藏">▾</button>' +
      '<div class="global-tools-dropdown global-tools-main-dropdown" id="global-tools-main-dropdown" role="menu">' +
      '<a href="#" class="global-tools-dropdown-item" data-action="toolsOverview">前往工具總覽（教會現資訊）</a>' +
      '<a href="#" class="global-tools-dropdown-item" data-action="translate">翻譯</a>' +
      '<span class="global-tools-dropdown-sub">' +
      '<a href="#" class="global-tools-dropdown-item" data-action="sendai">送給 AI ▾</a>' +
      '<div class="global-tools-dropdown global-tools-ai-sub" id="global-tools-ai-dropdown">' +
      '<a href="#" class="global-tools-dropdown-item" data-ai="copilot">Copilot</a>' +
      '<a href="#" class="global-tools-dropdown-item" data-ai="chatgpt">ChatGPT</a>' +
      '<a href="#" class="global-tools-dropdown-item" data-ai="claude">Claude</a>' +
      '<a href="#" class="global-tools-dropdown-item" data-ai="copyonly">僅複製</a>' +
      '<a href="' + aiChooserPath + '" class="global-tools-dropdown-item" target="_blank">更多 AI…</a>' +
      '</div></span>' +
      '<a href="#" class="global-tools-dropdown-item" data-action="save">我的收藏</a>' +
      '<a href="' + savedPath + '" class="global-tools-dropdown-item" target="_blank">已收藏</a>' +
      '<a href="' + htmlEditorPath + '" class="global-tools-dropdown-item" target="_blank">HTML 編輯器</a>' +
      '<a href="' + editGuidePath + '" class="global-tools-dropdown-item" target="_blank">如何編修本站網頁</a>' +
      '<a href="' + helpPath + '" class="global-tools-dropdown-item" target="_blank" title="全站模組/功能/工具說明 Global Tools">說明與使用方法（Global Tools）</a>' +
      '</div></span>';
    bar.setAttribute('aria-label', '全站工具列');

    var style = document.createElement('style');
    style.textContent =
      '.global-tools-bar{display:flex;flex-wrap:wrap;align-items:center;gap:6px;}' +
      '.global-tools-bar.inline{position:static;}' +
      '.global-tools-bar.floating{position:fixed;bottom:16px;right:16px;z-index:10000;}' +
      '.global-tools-btn{display:inline-block;padding:6px 10px;background:rgba(255,255,255,0.25);color:#fff;text-decoration:none;border-radius:6px;font-size:11px;font-family:inherit;border:1px solid rgba(255,255,255,0.4);cursor:pointer;}' +
      '.global-tools-btn:hover{background:rgba(255,255,255,0.35);color:#fff;}' +
      '.global-tools-btn:visited{color:#fff;}' +
      '.global-tools-main-wrap{position:relative;display:inline-block;}' +
      '.global-tools-dropdown{display:none;position:absolute;top:100%;left:0;margin-top:4px;min-width:140px;background:#fff;border:1px solid #ccc;border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:10002;}' +
      '.global-tools-dropdown.open{display:block;}' +
      '.global-tools-dropdown-item{display:block;padding:8px 12px;color:#333;text-decoration:none;font-size:12px;border-bottom:1px solid #eee;}' +
      '.global-tools-dropdown-item:last-child{border-bottom:0;}' +
      '.global-tools-dropdown-item:hover{background:#f0f7ff;color:#0b5fa5;}' +
      '.global-tools-dropdown-sub{position:relative;display:block;}' +
      '.global-tools-ai-sub{left:100%;top:0;margin-left:2px;min-width:110px;}' +
      '.global-tools-ai-sub.open{display:block;}' +
      '.global-tools-arrow{min-width:24px;padding:6px 4px;margin-left:-2px;border-left:1px solid rgba(255,255,255,0.3);}';
    document.head.appendChild(style);

    var mainDropdown = bar.querySelector('#global-tools-main-dropdown');
    var mainBtn = bar.querySelector('#global-tools-main-btn');
    var mainWrap = bar.querySelector('.global-tools-main-wrap');
    var arrowBtn = bar.querySelector('#global-tools-arrow-btn');
    if (mainBtn && mainDropdown && mainWrap) {
      mainBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (typeof window.openToolsOverview === 'function') window.openToolsOverview();
      });
      if (arrowBtn) {
        arrowBtn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          mainDropdown.classList.toggle('open');
        });
      }
      mainWrap.addEventListener('mouseenter', function () { mainDropdown.classList.add('open'); });
      mainWrap.addEventListener('mouseleave', function () { mainDropdown.classList.remove('open'); });
      document.addEventListener('click', function (e) {
        if (!e.target.closest('#global-tools-main-wrap')) mainDropdown.classList.remove('open');
      });
    }

    if (mainDropdown) {
      try {
      mainDropdown.querySelectorAll('[data-action]').forEach(function (item) {
        item.addEventListener('click', function (e) {
          if (item.getAttribute('target') === '_blank') return;
          e.preventDefault();
          var action = item.getAttribute('data-action');
          if (action === 'sendai') {
            var dd = bar.querySelector('#global-tools-ai-dropdown');
            if (dd) dd.classList.toggle('open');
            e.stopPropagation();
            return;
          }
          if (mainDropdown) mainDropdown.classList.remove('open');
          if (action === 'toolsOverview') {
            if (typeof window.openToolsOverview === 'function') window.openToolsOverview();
            return;
          }
          if (action === 'translate') doTranslate();
          else if (action === 'save') doSaveCurrent(item);
        });
      } catch (e) {
        console.warn('global-tools: 初始化 dropdown 時發生錯誤，已跳過', e);
      }
    }
    var dropdown = bar.querySelector('#global-tools-ai-dropdown');
    if (dropdown) {
      dropdown.querySelectorAll('.global-tools-dropdown-item[data-ai]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          if (mainDropdown) mainDropdown.classList.remove('open');
          dropdown.classList.remove('open');
          doSendToAI(a.getAttribute('data-ai'));
        });
      });
      document.addEventListener('click', function (e) {
        if (!e.target.closest('.global-tools-ai-sub') && !e.target.closest('[data-action="sendai"]')) dropdown.classList.remove('open');
      });
    }

    var injectEl = document.getElementById('global-tools-inject');
    var topbarInner = document.querySelector('.topbar-inner');
    var headerMain = document.querySelector('.header-main');
    if (injectEl) {
      injectEl.innerHTML = '';
      bar.classList.add('inline');
      injectEl.appendChild(bar);
    } else if (topbarInner) {
      bar.classList.add('inline');
      var wrap = document.createElement('div');
      wrap.className = 'global-tools-wrap';
      wrap.style.cssText = 'display:table-cell;vertical-align:middle;padding:0 10px;white-space:nowrap;';
      wrap.appendChild(bar);
      var brand = topbarInner.querySelector('.brand');
      if (brand && brand.nextElementSibling) {
        topbarInner.insertBefore(wrap, brand.nextElementSibling);
      } else {
        topbarInner.appendChild(wrap);
      }
    } else if (headerMain) {
      bar.classList.add('inline');
      headerMain.insertBefore(bar, headerMain.firstChild);
    } else {
      var root = document.getElementById('global-tools-root') || document.body;
      bar.classList.add('floating');
      root.appendChild(bar);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
