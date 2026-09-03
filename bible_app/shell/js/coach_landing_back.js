/** 輔助頁頂部：回首頁（四語） */
(function (global) {
  function locale() {
    if (global.PageLocale && global.PageLocale.getLocale) return global.PageLocale.getLocale();
    return new URLSearchParams(location.search).get('locale') || 'zh-Hant';
  }

  function label() {
    if (global.PageLocale && global.PageLocale.L) return global.PageLocale.L('back_landing');
    return '← 回首頁';
  }

  function mount() {
    if (document.querySelector('.coach-landing-back')) return;
    var nav = document.createElement('nav');
    nav.className = 'coach-landing-back';
    nav.setAttribute('aria-label', 'Back');
    var a = document.createElement('a');
    a.href = 'landing.html?locale=' + encodeURIComponent(locale());
    a.textContent = label();
    nav.appendChild(a);
    var page = document.querySelector('.bible-coach-page');
    if (page) {
      page.insertBefore(nav, page.firstChild);
    } else {
      document.body.insertBefore(nav, document.body.firstChild);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})(window);
