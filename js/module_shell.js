/**
 * 模組殼：窄屏側欄抽屜、點遮罩關閉、內容載入後自動收合（觸控／上雲友善）。
 * 依賴：body.module-shell、#shellMenuBtn、#shellSidebarWrap、#shellBackdrop、#contentFrame
 */
(function () {
  var MQ = '(max-width: 900px)';

  function isNarrow() {
    return window.matchMedia(MQ).matches;
  }

  function init() {
    var body = document.body;
    if (!body.classList.contains('module-shell')) return;

    var btn = document.getElementById('shellMenuBtn');
    var backdrop = document.getElementById('shellBackdrop');
    var contentFrame = document.getElementById('contentFrame');

    function close() {
      body.classList.remove('sidebar-open');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (backdrop) {
        backdrop.hidden = true;
        backdrop.setAttribute('aria-hidden', 'true');
      }
    }

    function open() {
      body.classList.add('sidebar-open');
      if (btn) btn.setAttribute('aria-expanded', 'true');
      if (backdrop) {
        backdrop.hidden = false;
        backdrop.setAttribute('aria-hidden', 'false');
      }
    }

    function toggle() {
      if (body.classList.contains('sidebar-open')) close();
      else open();
    }

    if (btn) btn.addEventListener('click', toggle);
    if (backdrop) backdrop.addEventListener('click', close);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && body.classList.contains('sidebar-open')) close();
    });

    if (contentFrame) {
      contentFrame.addEventListener('load', function () {
        if (isNarrow()) close();
      });
    }

    window.addEventListener('resize', function () {
      if (!isNarrow()) close();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
