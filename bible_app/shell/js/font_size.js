/** 全站字體：小/中/大；殼頁會同步 iframe 內容 */
(function (global) {
  var KEY = 'bible_hub_font';
  var SIZES = { sm: '13px', md: '15px', lg: '18px' };

  function get() {
    try {
      var v = localStorage.getItem(KEY);
      if (v && SIZES[v]) return v;
    } catch (e) {}
    return 'md';
  }

  function applyToDoc(doc, size) {
    if (!doc || !doc.documentElement) return;
    doc.documentElement.setAttribute('data-font', size);
    doc.documentElement.style.fontSize = SIZES[size];
  }

  function apply(size) {
    if (!SIZES[size]) size = 'md';
    applyToDoc(document, size);
    document.querySelectorAll('.fs-btn').forEach(function (btn) {
      btn.classList.toggle('on', btn.getAttribute('data-fs') === size);
    });
    try { localStorage.setItem(KEY, size); } catch (e) {}
    var frame = document.getElementById('contentFrame');
    if (frame) {
      try {
        applyToDoc(frame.contentDocument || frame.contentWindow.document, size);
      } catch (e) {}
    }
  }

  function bind(root) {
    (root || document).querySelectorAll('.fs-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        apply(btn.getAttribute('data-fs'));
      });
    });
  }

  function init() {
    apply(get());
    bind(document);
  }

  function hookIframe(frame) {
    if (!frame) return;
    frame.addEventListener('load', function () {
      apply(get());
      try {
        var inner = frame.contentDocument || frame.contentWindow.document;
        if (inner) bind(inner);
      } catch (e) {}
    });
  }

  global.BibleFontSize = { init: init, apply: apply, bind: bind, get: get, hookIframe: hookIframe };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
