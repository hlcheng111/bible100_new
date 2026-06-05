/**
 * Bible 100 AI Lab — optional enhancements (keyboard / focus)
 */
(function () {
  'use strict';

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var top = document.querySelector('.lab-topbar');
    if (top && document.activeElement && top.contains(document.activeElement)) {
      var main = document.getElementById('contentFrame');
      if (main) try { main.focus(); } catch (err) {}
    }
  });
})();
