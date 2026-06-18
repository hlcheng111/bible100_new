/**
 * 啟動防呆：file:// 時嘗試接上已開的本機服務，否則顯示精簡離線提示
 */
(function () {
  function endpoints() {
    var host = 'http://127.0.0.1:3000';
    var p = (location.pathname || '').replace(/\\/g, '/');
    if (p.indexOf('/bible_app/shell') >= 0) {
      return {
        live: host + '/bible_app/shell/index.html',
        probe: host + '/bible_app/shell/js/probe.js',
      };
    }
    return {
      live: host + '/shell/index.html',
      probe: host + '/shell/js/probe.js',
    };
  }

  var EP = endpoints();
  var LIVE_URL = EP.live;
  var PROBE_JS = EP.probe;
  var BAT_HINT = '請關閉此頁，在 bible_app 資料夾雙擊「打開聖經跑道.bat」（或「聖經跑道一鍵開啟.vbs」）。';

  function probeLive(cb) {
    var done = false;
    var timer = setTimeout(function () {
      if (done) return;
      done = true;
      cb(false);
    }, 4000);
    var prev = window.__B100_SERVER_LIVE__;
    window.__B100_SERVER_LIVE__ = false;
    var s = document.createElement('script');
    s.src = PROBE_JS + '?' + Date.now();
    s.onload = function () {
      if (done) return;
      done = true;
      clearTimeout(timer);
      s.remove();
      cb(!!window.__B100_SERVER_LIVE__);
      window.__B100_SERVER_LIVE__ = prev;
    };
    s.onerror = function () {
      if (done) return;
      done = true;
      clearTimeout(timer);
      s.remove();
      cb(false);
    };
    document.head.appendChild(s);
  }

  function probeLiveRetry(cb, left) {
    probeLive(function (ok) {
      if (ok) return cb(true);
      if (left <= 1) return cb(false);
      setTimeout(function () { probeLiveRetry(cb, left - 1); }, 1500);
    });
  }

  function goLive() {
    window.location.replace(LIVE_URL + (window.location.search || ''));
  }

  function showOfflineBanner() {
    var bar = document.getElementById('offlineBar');
    if (bar) {
      bar.hidden = false;
      return;
    }
    bar = document.createElement('div');
    bar.id = 'offlineBar';
    bar.className = 'offline-bar';
    bar.innerHTML =
      '<button type="button" class="offline-bar__btn" id="offlineBarBtn">' +
      '⚠️ 精簡離線模式 · 點此一鍵說明（如何開完整版）' +
      '</button>';
    document.body.insertBefore(bar, document.body.firstChild);
    document.getElementById('offlineBarBtn').addEventListener('click', showModal);
  }

  function showModal() {
    var old = document.getElementById('offlineModal');
    if (old) { old.hidden = false; return; }
    var m = document.createElement('div');
    m.id = 'offlineModal';
    m.className = 'offline-modal';
    m.innerHTML =
      '<div class="offline-modal__card">' +
      '<h2>🦁 解鎖完整 66 卷與 AI 補給站</h2>' +
      '<p>目前為<strong>預覽模式</strong>（僅示範經文）。</p>' +
      '<p><strong>只需一步：</strong>關閉此頁，在 <code>bible_app</code> 資料夾雙擊：</p>' +
      '<p style="font-size:15px;font-weight:900;color:#4338ca">📂 聖經跑道一鍵開啟.vbs</p>' +
      '<p style="font-size:12px;color:#64748b">（或「打開聖經跑道.bat」— 會自動開瀏覽器，約需 10～30 秒）</p>' +
      '<p class="offline-modal__try" id="retryStatus">' +
      '<button type="button" id="retryLive">我已雙擊啟動 · 再試連線完整版</button></p>' +
      '<button type="button" class="btn-big btn-teal" id="closeModal">先用預覽模式</button>' +
      '</div>';
    document.body.appendChild(m);
    document.getElementById('closeModal').addEventListener('click', function () { m.hidden = true; });
    document.getElementById('retryLive').addEventListener('click', tryLiveRedirect);
  }

  function tryLiveRedirect() {
    var status = document.getElementById('retryStatus');
    if (status) status.textContent = '正在連線本機服務…（首次啟動可能需 30 秒）';
    probeLiveRetry(function (ok) {
      if (ok) {
        goLive();
        return;
      }
      if (status) {
        status.innerHTML =
          '❌ 尚未偵測到本機服務。<br>' + BAT_HINT +
          ' <button type="button" id="retryLive2">再試一次</button>';
        var b2 = document.getElementById('retryLive2');
        if (b2) b2.addEventListener('click', tryLiveRedirect);
      } else {
        alert('本機完整版尚未啟動。\n' + BAT_HINT);
      }
    }, 8);
  }

  if (location.protocol === 'file:') {
    probeLiveRetry(function (ok) {
      if (ok) goLive();
      else showOfflineBanner();
    }, 3);
  } else if (location.hostname === '127.0.0.1' || location.hostname === 'localhost') {
    var ok = document.createElement('div');
    ok.id = 'liveOkPill';
    ok.className = 'live-ok-pill';
    ok.textContent = '✓ 完整模式';
    document.body.appendChild(ok);
  }
})();
