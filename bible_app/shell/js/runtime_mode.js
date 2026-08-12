/**
 * Bible App runtime mode:
 * - cloud: public site / hosted preview. This is the product default.
 * - local-http: local server with the same cloud paths.
 * - file-preview: direct file open, kept only for USB/local preview.
 */
(function (global) {
  function hostName() {
    return (global.location && global.location.hostname || '').toLowerCase();
  }

  function protocol() {
    return global.location && global.location.protocol || '';
  }

  function isLocalHost(host) {
    return host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host === '::1';
  }

  function mode() {
    if (protocol() === 'file:') return 'file-preview';
    if (isLocalHost(hostName())) return 'local-http';
    return 'cloud';
  }

  function isCloud() {
    return mode() === 'cloud';
  }

  function isLocalHttp() {
    return mode() === 'local-http';
  }

  function isFilePreview() {
    return mode() === 'file-preview';
  }

  function label() {
    if (isCloud()) return '云站版';
    if (isLocalHttp()) return '本機 HTTP 版';
    return '本機預覽版';
  }

  function dbFailCopy() {
    if (isCloud()) {
      return {
        title: '經文暫時未完整載入',
        body: '目前無法載入完整經文，請稍後再試。',
        hint: '',
      };
    }
    if (isLocalHttp()) {
      return {
        title: '本機經庫尚未就緒',
        body: '目前無法載入完整經文，請稍後再試。',
        hint: '',
      };
    }
    return {
      title: '本機預覽模式',
      body: '目前只載入少量四語示範經文，方便先看版面與切換方式。',
      hint: '完整四语请双击 Bible100 根目录「Bible100一键开启」打开总站；云端请直接用网址。',
    };
  }

  function loadFailCopy() {
    if (isCloud()) {
      return {
        title: '資料暫時未載入',
        body: '目前資料暫時未完整載入，請重新整理；若仍未恢復，請聯繫同工。',
      };
    }
    if (isLocalHttp()) {
      return {
        title: '本機資料尚未就緒',
        body: '目前資料暫時未完整載入，請確認本機服務與資料檔已就緒。',
      };
    }
    return {
      title: '本機預覽資料有限',
      body: '目前是直接開啟 HTML 的預覽狀態，部分資料可能不完整。',
    };
  }

  function sampleHintCopy() {
    if (isFilePreview()) {
      return '本機預覽：僅創世記 1–2 章四語示範；完整經文請用雲端版。';
    }
    if (isCloud()) {
      return '目前無法載入完整經文，請稍後再試。';
    }
    if (isLocalHttp()) {
      return '目前無法載入完整經文，請稍後再試。';
    }
    return '本機預覽：僅創世記 1–2 章四語示範；完整經文請用雲端版。';
  }

  function localLaunchVisible() {
    return isFilePreview();
  }

  function previewBannerCopy() {
    return {
      line: '目前為預覽模式：只載入少量示範經節。完整四语请从 Bible100 总站（Bible100一键开启）或云站打开。',
      help: '可在此切换单语／双语／四语并排体验版面；完整 66 卷需 HTTP 总站或云站。',
    };
  }

  function showReaderPreviewBanner() {
    return isFilePreview();
  }

  global.B100RuntimeMode = {
    mode: mode,
    label: label,
    isCloud: isCloud,
    isLocalHttp: isLocalHttp,
    isFilePreview: isFilePreview,
    dbFailCopy: dbFailCopy,
    loadFailCopy: loadFailCopy,
    sampleHintCopy: sampleHintCopy,
    previewBannerCopy: previewBannerCopy,
    showReaderPreviewBanner: showReaderPreviewBanner,
    localLaunchVisible: localLaunchVisible,
  };
})(typeof window !== 'undefined' ? window : globalThis);
