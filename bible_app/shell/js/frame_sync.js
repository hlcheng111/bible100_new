/** iframe 內頁：通知父殼記住目前位置（回來接續） */
(function (global) {
  function framePath() {
    var p = (location.pathname || '').replace(/\\/g, '/');
    var name = p.split('/').pop() || 'index.html';
    return 'pages/' + name + (location.search || '');
  }

  function isValidPath(path) {
    if (!path || path.indexOf('pages/') !== 0) return false;
    if (/bible66\.html/i.test(path)) {
      var qIdx = path.indexOf('?');
      if (qIdx < 0) return false;
      var q = new URLSearchParams(path.slice(qIdx + 1));
      var book = parseInt(q.get('book'), 10);
      var chapter = parseInt(q.get('chapter'), 10);
      if (!book || !chapter) return false;
      if (book === 1 && chapter === 1 && q.get('track') === '30day' && q.get('day') && q.get('day') !== '1') {
        return false;
      }
    }
    return true;
  }

  function notifyParent() {
    if (global.parent === global) return;
    var path = framePath();
    if (!isValidPath(path)) return;
    try {
      global.parent.postMessage({
        type: 'bible100-shell-frame',
        path: path,
      }, '*');
    } catch (e) {}
  }

  if (global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', notifyParent);
  } else {
    notifyParent();
  }
  global.addEventListener('pagehide', notifyParent);
})(window);
