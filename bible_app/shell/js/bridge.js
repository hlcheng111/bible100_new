/**
 * Bible App — 獨立 / Hub 互聯路徑（讀後學生路徑 vs 老師備課台）
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

  /** 讀完打卡 · 學生路徑（2 卡：問答 + 更深讀；不鏈備課工作台／媒體 demo） */
  function readDoneStudentTools(search) {
    var q = search instanceof URLSearchParams ? search : new URLSearchParams(search || '');
    var parts = [];
    ['track', 'book', 'chapter', 'verse', 'ref', 'passage', 'locale', 'day', 'gv', 'theme', 'unit'].forEach(function (k) {
      var v = q.get(k);
      if (v) parts.push(k + '=' + encodeURIComponent(v));
    });
    var qs = parts.length ? '?' + parts.join('&') : '';
    return [
      {
        emoji: '💬',
        label: '我有問題',
        sub: '複製 Prompt · 或查難題題庫',
        url: 'ai-qna.html' + qs,
        hi: true,
      },
      {
        emoji: '📖',
        label: '更深讀這段',
        sub: '背景·原文·三鏡頭導讀',
        url: 'ai-tutor.html' + qs,
        hi: true,
      },
    ];
  }

  /** 同步：學生讀後兩卡 */
  function getReadDoneTools(passage, ref) {
    return readDoneStudentTools(new URLSearchParams(global.location.search));
  }

  /** 非同步：與同步相同（跑道不 probe 附加 Hub demo 工具） */
  function loadReadDoneTools(passage, ref, cb) {
    cb(readDoneStudentTools(new URLSearchParams(global.location.search)));
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
    readDoneStudentTools: readDoneStudentTools,
    getReadDoneTools: getReadDoneTools,
    loadReadDoneTools: loadReadDoneTools,
    probeHubAi: probeHubAi,
    isRepoRootServe: isRepoRootServe,
    studyReaderUrl: function () {
      var path = 'bible_study/comprehensive_exegesis_reader.html?book=創世記&chapter=1';
      if (location.protocol === 'file:') return '../../' + path;
      if (isRepoRootServe()) return location.origin + '/' + path;
      return '../../' + path;
    },
    parallelReaderUrl: function () {
      var path = 'bible_study/parallel_mode_v3.html';
      if (location.protocol === 'file:') return '../../' + path;
      if (isRepoRootServe()) return location.origin + '/' + path;
      return '../../' + path;
    },
  };
})(typeof window !== 'undefined' ? window : global);
