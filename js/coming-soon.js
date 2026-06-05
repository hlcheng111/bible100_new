/**
 * Bible100 開發中功能提示
 * 取代 alert('…功能開發中')，改為非侵入式 toast
 */
(function (global) {
  'use strict';

  function showComingSoon(customMsg, dashboardUrl) {
    var msg = (typeof customMsg === 'string' && customMsg) ? customMsg : '此功能暫未開放';
    var url = (typeof dashboardUrl === 'string' && dashboardUrl) ? dashboardUrl : '';
    var el = document.createElement('div');
    el.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:12px 20px;border-radius:8px;font-size:14px;z-index:10001;max-width:90%;box-shadow:0 4px 16px rgba(0,0,0,0.3);text-align:center;';
    el.innerHTML = msg;
    if (url) {
      var a = document.createElement('a');
      a.href = url;
      a.textContent = ' 返回中心';
      a.style.cssText = 'color:#90caf9;margin-left:8px;text-decoration:underline;';
      a.onclick = function () { el.remove(); };
      el.appendChild(a);
    }
    document.body.appendChild(el);
    setTimeout(function () {
      if (el.parentNode) el.remove();
    }, 4000);
  }

  global.showComingSoon = showComingSoon;
})(typeof window !== 'undefined' ? window : this);
