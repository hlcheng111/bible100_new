/**
 * Bible App — 獨立 / Hub 互聯路徑（AI 補給站、主站）
 * 預設僅 supply/prompt.html；ai_tools 須 probe 成功才附加。
 */
(function (global) {
  var PROBE_AI = '/ai_tools/tools/bible_prompt_generator.html';

  function pathNorm() {
    return (location.pathname || '').replace(/\\/g, '/');
  }

  function isRepoRootServe() {
    return pathNorm().indexOf('/bible_app/') >= 0;
  }

  function hubAiBase() {
    if (location.protocol === 'file:') return '';
    if (isRepoRootServe()) return location.origin + '/ai_tools/';
    return '';
  }

  function supplyBase() {
    var p = pathNorm();
    if (p.indexOf('/shell/pages/') >= 0) return 'supply/';
    if (p.indexOf('/bible_app/shell/pages/') >= 0) return 'supply/';
    return 'pages/supply/';
  }

  function supplyPromptUrl(qs) {
    var base = supplyBase();
    return base + 'prompt.html' + (qs || '');
  }

  function hubToolUrl(path, qs) {
    var base = hubAiBase();
    if (!base) return supplyPromptUrl(qs);
    return base + path + (qs || '');
  }

  function supplyTools(passage, ref) {
    var q = '?passage=' + encodeURIComponent(passage) + '&ref=' + encodeURIComponent(ref);
    return [
      { emoji: '✍️', label: '讀經 Prompt', sub: '複製到 ChatGPT/Kimi', url: supplyPromptUrl(q) },
      { emoji: '📖', label: '查經提問範本', sub: '牧養審核用', url: supplyPromptUrl(q + '&mode=qna') },
    ];
  }

  function hubTools(passage, ref) {
    var q = '?passage=' + encodeURIComponent(passage) + '&ref=' + encodeURIComponent(ref);
    var hub = hubAiBase();
    if (!hub) return [];
    return [
      { emoji: '📖', label: '神學 AI 導讀', sub: '背景·原文·問答', url: hub + 'pages/guide_reading_hub.html' + q + '#sec-passage' },
      { emoji: '🔊', label: '文字轉語音', sub: '朗讀經文', url: hub + 'pages/ai_text_to_speech.html' + q },
      { emoji: '🖼️', label: '文字轉圖像', sub: '畫插圖', url: hub + 'pages/ai_text_to_image.html' + q },
      { emoji: '🎼', label: '文字轉音樂', sub: '敬拜氛圍', url: hub + 'pages/ai_text_to_music.html' + q },
      { emoji: '✍️', label: 'Prompt 生成器', sub: '備課提問', url: hub + 'tools/bible_prompt_generator.html' + q },
    ];
  }

  /** 同步：僅殼內 supply（上云預設） */
  function getReadDoneTools(passage, ref) {
    return supplyTools(passage, ref);
  }

  /** 非同步：supply 先顯示，probe 成功再附加 Hub */
  function loadReadDoneTools(passage, ref, cb) {
    var tools = supplyTools(passage, ref);
    if (location.protocol === 'file:' || !isRepoRootServe()) {
      cb(tools);
      return;
    }
    probeHubAi(function (ok) {
      if (ok) tools = tools.concat(hubTools(passage, ref));
      cb(tools);
    });
  }

  function probeHubAi(cb) {
    if (location.protocol === 'file:') {
      cb(false);
      return;
    }
    if (!isRepoRootServe()) {
      cb(false);
      return;
    }
    var url = location.origin + PROBE_AI;
    fetch(url, { method: 'HEAD', cache: 'no-store' })
      .then(function (r) { cb(r.ok); })
      .catch(function () { cb(false); });
  }

  global.B100Bridge = {
    hubAiBase: hubAiBase,
    supplyBase: supplyBase,
    supplyPromptUrl: supplyPromptUrl,
    hubToolUrl: hubToolUrl,
    getReadDoneTools: getReadDoneTools,
    loadReadDoneTools: loadReadDoneTools,
    probeHubAi: probeHubAi,
    isRepoRootServe: isRepoRootServe,
  };
})(typeof window !== 'undefined' ? window : global);
