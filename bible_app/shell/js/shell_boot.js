/**
 * 啟動防呆：file:// 時接上本機 HTTP（8080/3000）；cloud/local-http 為完整模式
 */
(function (global) {
  var LAUNCH_HINT =
    '请双击 Bible100 根目录「Bible100一键开启」（或「打开Bible100.bat」），再从 index 进入。';

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
      '⚠️ 预览模式 · 仅示范章节 · 点此查看如何打开完整四语经文' +
      '</button>';
    document.body.insertBefore(bar, document.body.firstChild);
    document.getElementById('offlineBarBtn').addEventListener('click', showModal);
  }

  function showModal() {
    var old = document.getElementById('offlineModal');
    if (old) {
      old.hidden = false;
      return;
    }
    var m = document.createElement('div');
    m.id = 'offlineModal';
    m.className = 'offline-modal';
    m.innerHTML =
      '<div class="offline-modal__card">' +
      '<h2>🦁 打开完整四语圣经跑道</h2>' +
      '<p>目前为<strong>预览模式</strong>（仅少量示范经节）。</p>' +
      '<p><strong>本机一步：</strong>关闭此页，在 Bible100 文件夹双击：</p>' +
      '<p style="font-size:15px;font-weight:900;color:#4338ca">📂 Bible100一键开启</p>' +
      '<p style="font-size:12px;color:#64748b">（或「打开Bible100.bat」→ 自动打开总站 index）</p>' +
      '<p class="offline-modal__try" id="retryStatus">' +
      '<button type="button" id="retryLive">已启动 · 再试连接完整版</button></p>' +
      '<button type="button" class="btn-big btn-teal" id="closeModal">继续预览</button>' +
      '</div>';
    document.body.appendChild(m);
    document.getElementById('closeModal').addEventListener('click', function () {
      m.hidden = true;
    });
    document.getElementById('retryLive').addEventListener('click', tryLiveRedirect);
  }

  function tryLiveRedirect() {
    var status = document.getElementById('retryStatus');
    var L = global.B100LiveDb;
    if (status) status.textContent = '正在连接本机服务…';
    var p = L && L.probe ? L.probe(4) : Promise.resolve(false);
    p.then(function (ok) {
      if (ok && L) {
        var url = L.getShellUrl() + (global.location.search || '');
        global.location.replace(url);
        return;
      }
      if (status) {
        status.innerHTML =
          '❌ 尚未检测到本机 HTTP。<br>' +
          LAUNCH_HINT +
          ' <button type="button" id="retryLive2">再试</button>';
        var b2 = document.getElementById('retryLive2');
        if (b2) b2.addEventListener('click', tryLiveRedirect);
      } else {
        alert('本机完整版尚未启动。\n' + LAUNCH_HINT);
      }
    });
  }

  function bootFilePreview() {
    var inIframe = false;
    try {
      inIframe = global.self !== global.top;
    } catch (eIf) {
      inIframe = true;
    }
    var L = global.B100LiveDb;
    var p = L && L.probe ? L.probe(3) : Promise.resolve(false);
    p.then(function (ok) {
      if (ok && L) {
        L.notifyChildFrames();
        var shellUrl = L.getShellUrl() + (global.location.search || '');
        var hubUrl = (L.getHubUrl ? L.getHubUrl() : shellUrl) + '?b100_mode=study&b100_track=1';
        if (!inIframe) {
          global.location.replace(shellUrl);
          return;
        }
        var pill = document.createElement('div');
        pill.className = 'live-ok-pill';
        pill.innerHTML =
          '✓ 本机 HTTP 已连接 · 四语经库可用 · ' +
          '<a href="' +
          hubUrl +
          '" target="_blank" rel="noopener" style="color:#fff">从总站打开 ↗</a>';
        document.body.appendChild(pill);
        try {
          var cf = document.getElementById('contentFrame');
          if (cf) {
            cf.addEventListener('load', function () {
              L.notifyChildFrames();
            });
          }
        } catch (eCf) {}
        return;
      }
      showOfflineBanner();
    });
  }

  if (location.protocol === 'file:') {
    bootFilePreview();
  } else if (
    global.B100RuntimeMode &&
    global.B100RuntimeMode.isLocalHttp &&
    global.B100RuntimeMode.isLocalHttp()
  ) {
    var ok = document.createElement('div');
    ok.id = 'liveOkPill';
    ok.className = 'live-ok-pill';
    ok.textContent = '✓ 完整模式（本机 HTTP）';
    document.body.appendChild(ok);
  } else if (global.B100RuntimeMode && global.B100RuntimeMode.isCloud && global.B100RuntimeMode.isCloud()) {
    /* 云站：无额外横幅 */
  }
})(typeof window !== 'undefined' ? window : globalThis);
