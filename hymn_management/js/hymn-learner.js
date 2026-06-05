/**
 * 互動式聖詩學習頁邏輯
 */

(function() {
  const params = new URLSearchParams(window.location.search);
  const hymnId = params.get('id');

  const el = {
    loading: document.getElementById('loading'),
    content: document.getElementById('content'),
    error: document.getElementById('error'),
    hymnTitle: document.getElementById('hymnTitle'),
    hymnSubtitle: document.getElementById('hymnSubtitle'),
    scoreImage: document.getElementById('scoreImage'),
    btnPlay: document.getElementById('btnPlay'),
    btnPause: document.getElementById('btnPause'),
    progressBar: document.getElementById('progressBar'),
    timeDisplay: document.getElementById('timeDisplay'),
    audioPlayer: document.getElementById('audioPlayer'),
    btnZoom: document.getElementById('btnZoom'),
    btnFullscreen: document.getElementById('btnFullscreen'),
    fullscreenOverlay: document.getElementById('fullscreenOverlay'),
    fullscreenImg: document.getElementById('fullscreenImg'),
    btnCloseFullscreen: document.getElementById('btnCloseFullscreen'),
    theologyBlock: document.getElementById('theologyBlock'),
    historyBlock: document.getElementById('historyBlock'),
  };

  let hymn = null;
  let zoomLevel = 1;

  function getBasePath() {
    return window.location.pathname.replace(/\/[^/]*$/, '') || '.';
  }

  async function loadHymn() {
    if (!hymnId) {
      showError();
      return;
    }
    try {
      const base = getBasePath();
      const data = window.loadSourceHymns
        ? await window.loadSourceHymns()
        : await fetch(base + '/data/source-hymns.json').then(r => r.ok ? r.json() : null);
      if (!data) throw new Error('Failed to load');
      hymn = (data.hymns || []).find(h => h.id === hymnId);
      if (hymn) {
        render();
      } else {
        showError();
      }
    } catch (e) {
      console.error('loadHymn:', e);
      showError();
    }
  }

  function showError() {
    el.loading.classList.add('hidden');
    el.content.classList.add('hidden');
    el.error.classList.remove('hidden');
  }

  function render() {
    el.loading.classList.add('hidden');
    el.error.classList.add('hidden');
    el.content.classList.remove('hidden');

    el.hymnTitle.textContent = hymn.title_zh || hymn.title_en || hymnId;
    el.hymnSubtitle.textContent = (hymn.title_en && hymn.title_zh !== hymn.title_en ? hymn.title_en + ' · ' : '') + '第 ' + hymn.number + ' 首';

    el.scoreImage.src = hymn.scoreImage || 'assets/scores/placeholder.svg';
    el.scoreImage.alt = hymn.title_zh + ' 樂譜';

    el.theologyBlock.textContent = hymn.theology || '（神學解析待補充）';
    el.historyBlock.textContent = hymn.history || '（歷史典故待補充）';

    el.audioPlayer.src = hymn.audioUrl || '';
    el.audioPlayer.onloadedmetadata = () => {
      el.progressBar.max = el.audioPlayer.duration;
      updateTimeDisplay();
    };
    el.audioPlayer.ontimeupdate = () => {
      el.progressBar.value = el.audioPlayer.currentTime;
      updateTimeDisplay();
    };
    el.audioPlayer.onended = () => {
      el.btnPlay.classList.remove('hidden');
      el.btnPause.classList.add('hidden');
    };

    el.btnPlay.onclick = () => {
      el.audioPlayer.play();

      el.btnPlay.classList.add('hidden');
      el.btnPause.classList.remove('hidden');
    };
    el.btnPause.onclick = () => {
      el.audioPlayer.pause();
      el.btnPlay.classList.remove('hidden');
      el.btnPause.classList.add('hidden');
    };

    el.progressBar.oninput = () => {
      el.audioPlayer.currentTime = parseFloat(el.progressBar.value);
    };

    el.btnZoom.onclick = () => {
      zoomLevel = zoomLevel >= 2 ? 1 : zoomLevel + 0.25;
      el.scoreImage.style.transform = `scale(${zoomLevel})`;
      el.scoreImage.style.transformOrigin = 'center center';
    };

    el.btnFullscreen.onclick = () => {
      el.fullscreenImg.src = el.scoreImage.src;
      el.fullscreenOverlay.classList.remove('hidden');
    };
    el.btnCloseFullscreen.onclick = () => {
      el.fullscreenOverlay.classList.add('hidden');
    };
    el.fullscreenOverlay.onclick = (e) => {
      if (e.target === el.fullscreenOverlay) el.fullscreenOverlay.classList.add('hidden');
    };

    if (hymn.audioUrl) {
      el.btnPause.classList.add('hidden');
    } else {
      el.btnPlay.disabled = true;
      el.btnPlay.title = '尚無音訊檔案';
    }
  }

  function updateTimeDisplay() {
    const a = el.audioPlayer;
    const cur = formatTime(a.currentTime || 0);
    const dur = formatTime(a.duration || 0);
    el.timeDisplay.textContent = cur + ' / ' + dur;
  }

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHymn);
  } else {
    loadHymn();
  }
})();
