/**
 * 站內「下方一格」內嵌 AI 平台：可內嵌則 iframe，否則新分頁 + 佔位說明
 */
(function () {
  'use strict';

  function hostnameOpensNewTabOnly(hostname) {
    var h = (hostname || '').toLowerCase().replace(/^www\./, '');
    var blocked = [
      'claude.ai', 'chatgpt.com', 'openai.com', 'x.ai',
      'gemini.google.com', 'google.com',
      'chat.deepseek.com', 'deepseek.com',
      'copilot.microsoft.com', 'bing.com',
      'qianwen.aliyun.com', 'aliyun.com',
      'perplexity.ai', 'poe.com', 'you.com'
    ];
    for (var j = 0; j < blocked.length; j++) {
      if (h === blocked[j] || h.endsWith('.' + blocked[j])) return true;
    }
    if (h.indexOf('openai.') !== -1) return true;
    return false;
  }

  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function escAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  }

  /**
   * @param opts {{ containerId: string, barId: string, placeholderId?: string, url: string, name?: string, height?: string }}
   */
  window.labEmbedPlatform = function (opts) {
    if (!opts || !opts.url) return;
    var url = opts.url;
    var name = opts.name || 'AI';
    var container = document.getElementById(opts.containerId || 'labEmbedContainer');
    var bar = document.getElementById(opts.barId || 'labEmbedBar');
    var ph = opts.placeholderId ? document.getElementById(opts.placeholderId) : null;
    var host = '';
    try {
      host = new URL(url).hostname;
    } catch (e) {}
    var mustTab = hostnameOpensNewTabOnly(host);
    if (!container || !bar) return;

    if (mustTab) {
      window.open(url, '_blank', 'noopener,noreferrer');
      bar.textContent = '⚠ ' + name + '（已開新分頁，此站不允許內嵌）';
      container.innerHTML = '';
      if (ph) {
        ph.style.display = 'block';
        ph.innerHTML =
          '<p><strong>' +
          escHtml(name) +
          '</strong> 已在<strong>新分頁</strong>開啟。</p><p><a href="' +
          escAttr(url) +
          '" target="_blank" rel="noopener noreferrer">再開一次</a></p>';
      }
      return;
    }

    if (ph) {
      ph.style.display = 'none';
      ph.innerHTML = '';
    }
    bar.textContent = '當前（內嵌）：' + name + ' — 若空白請改選其他平台';
    container.innerHTML = '';
    var iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.title = name;
    iframe.setAttribute('frameborder', '0');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.background = '#fff';
    container.style.minHeight = opts.height || '480px';
    container.style.height = opts.height || '480px';
    container.appendChild(iframe);
  };
})();
