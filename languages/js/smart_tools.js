/**
 * smart_tools.js - 聖經一百步頂部互動工具箱
 * 自動從路徑解析 lang / type，讀取 localConfig
 */
(function () {
  'use strict';

  // 從路徑解析 lang 與 type
  function parsePath() {
    const path = window.location.pathname || '';
    const parts = path.split('/').filter(Boolean);
    let lang = 'zh-Hant';
    let type = 'OT';
    const langIdx = parts.indexOf('languages');
    if (langIdx >= 0 && parts[langIdx + 1]) {
      lang = parts[langIdx + 1];
    }
    const typeMatch = parts.find(p => ['OT', 'NT', 'T4'].includes(p));
    if (typeMatch) type = typeMatch;
    const htmlLang = document.documentElement.lang || '';
    if (htmlLang) return { lang: htmlLang.startsWith('zh') ? (htmlLang.includes('CN') ? 'zh-CN' : 'zh-Hant') : htmlLang.split('-')[0] || lang, type };
    return { lang, type };
  }

  const config = window.localConfig || {};
  const pathInfo = parsePath();
  const LANG = config.lang || pathInfo.lang || 'zh-Hant';
  const TYPE = config.type || pathInfo.type || 'OT';

  // 從路徑取得 chapterId（如 chapter2.html -> chapter2）
  function getChapterId() {
    const path = window.location.pathname || '';
    const m = path.match(/\/([^/]+)\.html$/);
    return m ? m[1] : '';
  }

  // 是否需要從 chapter_config.json 載入（頁面無 inline localConfig 時）
  function needsChapterConfig() {
    return !config.videoID && (!config.videos || !config.videos.length) &&
      (!config.quiz || !config.quiz.length) &&
      (!config.context || !config.context.tips || !config.context.tips.length);
  }

  // 從 data/chapter_config.json 載入並合併
  function loadChapterConfig(cb) {
    const path = window.location.pathname || '';
    const parts = path.split('/').filter(Boolean);
    const langIdx = parts.indexOf('languages');
    const base = langIdx >= 0 ? parts.slice(0, langIdx + 1).join('/') : 'languages';
    const configUrl = '/' + base + '/data/chapter_config.json';
    fetch(configUrl)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data) return cb();
        const lang = pathInfo.lang;
        const type = pathInfo.type;
        const chapterId = getChapterId();
        const langData = data[lang];
        const typeData = langData && langData[type];
        const chapterData = typeData && typeData[chapterId];
        if (chapterData) {
          Object.keys(chapterData).forEach(function (k) {
            if (k !== '_schema' && chapterData[k] !== undefined) config[k] = chapterData[k];
          });
        }
        cb();
      })
      .catch(function () { cb(); });
  }

  // Prompt 字典 (多語系)
  const PROMPT_DICT = {
    'zh-Hant': {
      oia: '你是一位精通聖經的神學教育專家。請針對「{title}」這一課，以「{oiaType}」為教學重心。請提供：1. 針對初學者的深入淺出解釋。2. 三個能啟發討論的問題。3. 一個實際的生命應用方向。請用繁體中文回答。',
      character: '請模擬聖經人物，針對「{title}」這段經文，寫一封鼓勵現代信徒的短信。請用繁體中文回答。',
      scene: '請描述「{title}」這段經文發生的場景與環境，適合用於 Midjourney 或 DALL-E 生成插圖。請用繁體中文，以視覺描述為主。',
      ministry: '我正在教導「{title}」，如果學生問：「{question}」，請根據本課教義提供 3 個牧養建議。請用繁體中文回答。',
      outline: '請將「{title}」這課內容轉化為小組帶領的提綱，包含：破冰、經文討論、應用、禱告。請用繁體中文回答。',
      gospel: '請模擬一個不信主的朋友，針對「{title}」的真理提出疑問，並提供如何回應的範例。請用繁體中文回答。'
    },
    'zh-CN': {
      oia: '你是一位精通圣经的神学教育专家。请针对「{title}」这一课，以「{oiaType}」为教学重心。请提供：1. 针对初学者的深入浅出解释。2. 三个能启发讨论的问题。3. 一个实际的生命应用方向。请用简体中文回答。',
      character: '请模拟圣经人物，针对「{title}」这段经文，写一封鼓励现代信徒的短信。请用简体中文回答。',
      scene: '请描述「{title}」这段经文发生的场景与环境，适合用于 Midjourney 或 DALL-E 生成插图。请用简体中文，以视觉描述为主。',
      ministry: '我正在教导「{title}」，如果学生问：「{question}」，请根据本课教义提供 3 个牧养建议。请用简体中文回答。',
      outline: '请将「{title}」这课内容转化为小组带领的提纲，包含：破冰、经文讨论、应用、祷告。请用简体中文回答。',
      gospel: '请模拟一个不信主的朋友，针对「{title}」的真理提出疑问，并提供如何回应的范例。请用简体中文回答。'
    },
    'en': {
      oia: 'You are a Bible expert. For the lesson "{title}", focus on "{oiaType}". Provide: 1. Clear explanation for beginners. 2. Three discussion questions. 3. One practical application. Answer in English.',
      character: 'Simulate a biblical character writing an encouraging message to modern believers about "{title}". Answer in English.',
      scene: 'Describe the scene and setting of "{title}" for Midjourney/DALL-E image generation. Focus on visual description. Answer in English.',
      ministry: 'I am teaching "{title}". If a student asks "{question}", provide 3 pastoral suggestions. Answer in English.',
      outline: 'Convert "{title}" into a small group outline: icebreaker, scripture discussion, application, prayer. Answer in English.',
      gospel: 'Simulate an unbeliever asking about "{title}," and provide response examples. Answer in English.'
    },
    'my': { oia: 'သင်ခန်းစာ "{title}" အတွက် OIA ရှင်းလင်းချက်။ မြန်မာဘာသာဖြင့် ဖြေပါ။', character: 'သမ္မာကျမ်းစာဇာတ်ကောင်ကို ချန်ပီယံ "{title}" အတွက် စာရေးပါ။', scene: '"{title}" အတွက် ရုပ်ပုံဖော်ဖို့ ဖော်ပြပါ။', ministry: '"{title}" သင်နေသည်။ "{question}" မေးပါက လမ်းညွှန်ချက် ၃ ခု ပေးပါ။', outline: '"{title}" ကို အုပ်စုလိုက်လမ်းညွှန်ချက် ပြောင်းပါ။', gospel: '"{title}" အတွက် ယုံကြည်မှုမရှိသူ မေးခွန်းနှင့် ဖြေနည်း။' },
    'kh': { oia: 'សម្រាប់មេរៀន "{title}" និង OIA "{oiaType}"។ ឆ្លើយជាភាសាខ្មែរ។', character: 'ធ្វើជាតួអង្គព្រះគម្ពីរ សរសេរសារទៅអ្នកជឿអំពី "{title}"។', scene: 'ពិពណ៌នាព្រោះ "{title}" សម្រាប់មេដ្យាកោះ។', ministry: 'ខ្ញុំបង្រៀន "{title}"។ បើសិស្សសួរ "{question}" ផ្តល់អនុសាសន៍ ៣។', outline: 'ប្តូរ "{title}" ជាគម្រោងសម្រាប់ក្រុមតូច។', gospel: 'ធ្វើជាអ្នកមិនជឿចម្លើយអំពី "{title}"។' },
    'lo': { oia: 'ສຳລັບບົດຮຽນ "{title}" ແລະ OIA "{oiaType}"។ ຕອບເປັນພາສາລາວ។', character: 'ສະແດງຕົວຕົນຄົນໃນພຣະຄຳພີ ຂຽນສານກ່ຽວກັບ "{title}"។', scene: 'ອະທິບາຍ "{title}" ສຳລັບການສ້າງຮູບ។', ministry: 'ຂ້ອຍກຳລັງສອນ "{title}"។ ຖ້ານັກຮຽນຖາມ "{question}" ໃຫ້ 3 ຄຳແນະນຳ។', outline: 'ປ່ຽນ "{title}" ເປັນຄົນໃຫ້ກຸມຂະແມນ້ອຍ។', gospel: 'ສະແດງຕົວຄົນບໍ່ງົດງຳຖາມກ່ຽວກັບ "{title}"។' },
    'vi': { oia: 'Bạn là chuyên gia Kinh Thánh. Cho bài "{title}" tập trung "{oiaType}". Trả lời bằng tiếng Việt.', character: 'Mô phỏng nhân vật Kinh Thánh viết thư khích lệ về "{title}". Trả lời bằng tiếng Việt.', scene: 'Mô tả cảnh "{title}" cho Midjourney. Trả lời bằng tiếng Việt.', ministry: 'Tôi đang dạy "{title}". Nếu học viên hỏi "{question}", đưa 3 gợi ý mục vụ. Trả lời bằng tiếng Việt.', outline: 'Chuyển "{title}" thành đề cương nhóm nhỏ. Trả lời bằng tiếng Việt.', gospel: 'Mô phỏng người chưa tin hỏi về "{title}". Trả lời bằng tiếng Việt.' }
  };

  const t = PROMPT_DICT[LANG] || PROMPT_DICT['zh-Hant'];

  // 4 tab 標題多語系 (經文背景, 影音教材, AI拼裝車, 課後測驗, 靈修FAQ)
  const TAB_LABELS = {
    'zh-Hant': { bible: '經文背景', video: '影音教材', ai: 'AI 拼裝車', quiz: '課後測驗', notebooklm: '靈修/FAQ', collapse: '收起' },
    'zh-CN': { bible: '经文背景', video: '影音教材', ai: 'AI 拼装车', quiz: '课后测验', notebooklm: '灵修/FAQ', collapse: '收起' },
    'cn': { bible: '经文背景', video: '影音教材', ai: 'AI 拼装车', quiz: '课后测验', notebooklm: '灵修/FAQ', collapse: '收起' },
    'ch': { bible: '經文背景', video: '影音教材', ai: 'AI 拼裝車', quiz: '課後測驗', notebooklm: '靈修/FAQ', collapse: '收起' },
    'en': { bible: 'Context', video: 'Media', ai: 'AI Tools', quiz: 'Quiz', notebooklm: 'FAQ', collapse: 'Close' },
    'vi': { bible: 'Bối cảnh', video: 'Media', ai: 'AI Tools', quiz: 'Quiz', notebooklm: 'FAQ', collapse: 'Đóng' },
    'my': { bible: 'အကြောင်း', video: 'မီဒီယာ', ai: 'AI Tools', quiz: 'ပဟေဠိ', notebooklm: 'FAQ', collapse: 'ပိတ်' },
    'kh': { bible: 'បរិបទ', video: 'មេឌៀ', ai: 'AI Tools', quiz: 'ល្បែង', notebooklm: 'FAQ', collapse: 'បិទ' },
    'lo': { bible: 'ບໍລິບົດ', video: 'ສື່', ai: 'AI Tools', quiz: 'ຄວາມຮູ້', notebooklm: 'FAQ', collapse: 'ປິດ' },
    'id': { bible: 'Konteks', video: 'Media', ai: 'AI Tools', quiz: 'Kuis', notebooklm: 'FAQ', collapse: 'Tutup' },
    'ad': { bible: '經文背景', video: '影音教材', ai: 'AI 拼裝車', quiz: '課後測驗', notebooklm: '靈修/FAQ', collapse: '收起' }
  };
  const tabT = TAB_LABELS[pathInfo.lang] || TAB_LABELS[LANG] || TAB_LABELS['en'];

  // AI 選項依 type 切換
  const AI_OPTIONS = {
    OT: [
      { id: 'oia', label: 'OIA 觀察 (Observation)', oiaType: '觀察 (Observation)' },
      { id: 'oia', label: 'OIA 解釋 (Interpretation)', oiaType: '解釋 (Interpretation)' },
      { id: 'oia', label: 'OIA 應用 (Application)', oiaType: '應用 (Application)' },
      { id: 'character', label: '聖經人物對話模擬' },
      { id: 'scene', label: '場景插畫 Prompt' }
    ],
    NT: [
      { id: 'oia', label: 'OIA 觀察 (Observation)', oiaType: '觀察 (Observation)' },
      { id: 'oia', label: 'OIA 解釋 (Interpretation)', oiaType: '解釋 (Interpretation)' },
      { id: 'oia', label: 'OIA 應用 (Application)', oiaType: '應用 (Application)' },
      { id: 'character', label: '聖經人物對話模擬' },
      { id: 'scene', label: '場景插畫 Prompt' }
    ],
    T4: [
      { id: 'ministry', label: '事奉疑難解答', question: '為什麼上帝不聽我的禱告？' },
      { id: 'outline', label: '小組帶領大綱' },
      { id: 'gospel', label: '福音對話模擬' },
      { id: 'oia', label: 'OIA 教義解析', oiaType: '解釋 (Interpretation)' }
    ]
  };

  function getPageTitle() { return config.title || (document.querySelector('h1') && document.querySelector('h1').innerText) || document.title || '本課'; }

  function buildPrompt(opt) {
    const title = getPageTitle();
    if (opt.id === 'oia') {
      return t.oia.replace(/\{title\}/g, title).replace(/\{oiaType\}/g, opt.oiaType || '');
    }
    if (opt.id === 'character') return t.character.replace(/\{title\}/g, title);
    if (opt.id === 'scene') return t.scene.replace(/\{title\}/g, title);
    if (opt.id === 'ministry') return t.ministry.replace(/\{title\}/g, title).replace(/\{question\}/g, opt.question || '');
    if (opt.id === 'outline') return t.outline.replace(/\{title\}/g, title);
    if (opt.id === 'gospel') return t.gospel.replace(/\{title\}/g, title);
    return '';
  }

  function renderHTML() {
    const videos = config.videos || (config.videoID ? [{ id: config.videoID, label: '影片' }] : []);
    const quiz = config.quiz || [];
    const context = config.context || { title: getPageTitle(), tips: [] };

    const videoTabsHtml = videos.length > 1
      ? '<div class="st-video-tabs" id="st-video-tabs">' + videos.map((v, i) =>
          '<button type="button" data-id="' + v.id + '" class="' + (i === 0 ? 'active' : '') + '">' + (v.label || '影片' + (i + 1)) + '</button>'
        ).join('') + '</div>'
      : '';

    const videoHtml = videos.length
      ? '<div class="st-video-container"><iframe id="st-youtube-frame" src="https://www.youtube.com/embed/' + videos[0].id + '" allowfullscreen></iframe></div>' + videoTabsHtml
      : '<p style="color:#888; font-size:0.9em;">本頁尚未設定影片，請在 localConfig 中設定 videoID 或 videos。</p>';

    const aiOptions = AI_OPTIONS[TYPE] || AI_OPTIONS.OT;
    const aiSelectHtml = '<select id="st-ai-select">' + aiOptions.map((o, i) =>
      '<option value="' + i + '">' + o.label + '</option>'
    ).join('') + '</select>';

    const quizHtml = quiz.length
      ? quiz.map((q, i) => {
          const opts = q.options || [];
          const name = 'st-q' + i;
          return '<div class="st-quiz-item"><h5>' + (i + 1) + '. ' + q.q + '</h5><div class="st-quiz-options">' +
            opts.map((opt, j) => '<label><input type="radio" name="' + name + '" value="' + j + '" data-correct="' + (j === q.a) + '"><span>' + opt + '</span></label>').join('') +
            '</div></div>';
        }).join('')
      : '<p style="color:#888; font-size:0.9em;">本頁尚未設定測驗，請在 localConfig 中設定 quiz。</p>';

    const contextTipsHtml = (context.tips && context.tips.length)
      ? '<div class="st-context-box"><p><strong>' + (context.title || '') + '</strong></p>' + context.tips.map(t => '<p>' + t + '</p>').join('') + '</div>'
      : '<p style="color:#888; font-size:0.9em;">本頁尚未設定經文背景，請在 localConfig 中設定 context.tips。</p>';

    var hasNotebookLM = (config.audio && config.audio.url) || (config.faq && config.faq.length) || (config.deepQuestions && config.deepQuestions.length);
    var tabBar = '<div class="st-tab-bar">' +
      '<button type="button" class="st-tab-btn" data-tab="bible" title="' + tabT.bible + '">📖<span class="st-tab-text">' + tabT.bible + '</span></button>' +
      '<button type="button" class="st-tab-btn" data-tab="video" title="' + tabT.video + '">🎬<span class="st-tab-text">' + tabT.video + '</span></button>' +
      '<button type="button" class="st-tab-btn" data-tab="ai" title="' + tabT.ai + '">🤖<span class="st-tab-text">' + tabT.ai + '</span></button>' +
      '<button type="button" class="st-tab-btn" data-tab="quiz" title="' + tabT.quiz + '">📝<span class="st-tab-text">' + tabT.quiz + '</span></button>';
    if (hasNotebookLM) tabBar += '<button type="button" class="st-tab-btn" data-tab="notebooklm" title="' + tabT.notebooklm + '">🎧<span class="st-tab-text">' + tabT.notebooklm + '</span></button>';
    tabBar += '</div>';

    var notebooklmHtml = '';
    if (hasNotebookLM) {
      var audioHtml = (config.audio && config.audio.url)
        ? '<div class="st-audio-section"><h4>' + (config.audio.label || '靈修聽力') + '</h4><audio controls src="' + config.audio.url + '"></audio></div>'
        : '';
      var faqHtml = (config.faq && config.faq.length)
        ? '<div class="st-faq-section"><h4>🔍 疑難解答</h4>' + config.faq.map(function(f) {
            return '<details class="st-faq-item"><summary>' + (f.q || f.question) + '</summary><p>' + (f.a || f.answer) + '</p></details>';
          }).join('') + '</div>'
        : '';
      var dqHtml = (config.deepQuestions && config.deepQuestions.length)
        ? '<div class="st-deep-section"><h4>💭 深度思考題</h4><ul>' + config.deepQuestions.map(function(q) { return '<li>' + q + '</li>'; }).join('') + '</ul></div>'
        : '';
      notebooklmHtml = '<div class="st-panel" data-panel="notebooklm">' + audioHtml + faqHtml + dqHtml + '</div>';
    }

    return '<div id="smart-header" class="smart-header-injected">' +
      tabBar +
      '<div id="st-tab-display">' +
      '<button type="button" class="st-btn st-btn-secondary st-collapse-btn" id="st-collapse-btn">' + tabT.collapse + '</button>' +
      '<div class="st-panel active" data-panel="bible">' + contextTipsHtml + '</div>' +
      '<div class="st-panel" data-panel="video">' + videoHtml + '</div>' +
      '<div class="st-panel" data-panel="ai">' +
      '<div class="st-ai-box"><h4>🤖 智慧 Prompt 生成器</h4>' +
      aiSelectHtml +
      '<button type="button" class="st-btn st-btn-primary" id="st-build-btn">✨ 生成 AI 指令</button>' +
      '<textarea id="st-prompt-output" class="st-prompt-textarea" readonly placeholder="指令將顯示在此處..."></textarea>' +
      '<button type="button" class="st-btn st-btn-secondary" id="st-copy-btn">📋 複製指令</button></div></div>' +
      '<div class="st-panel" data-panel="quiz">' + quizHtml +
      (quiz.length ? '<button type="button" class="st-btn st-btn-primary st-card-btn" id="st-canvas-card-btn">🖼️ 生成學習卡</button>' : '') + '</div>' +
      notebooklmHtml +
      '</div></div>';
  }

  function inject() {
    if (document.getElementById('smart-header')) return;
    const body = document.body;
    if (!body) return;

    const base = document.createElement('div');
    base.innerHTML = renderHTML();
    const el = base.firstElementChild;
    var backLink = document.querySelector('.back-link') || document.querySelector('a[href*="history.back"]');
    if (backLink) {
      backLink.parentNode.insertBefore(el, backLink.nextSibling);
    } else {
      body.insertBefore(el, body.firstChild);
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    const scriptSrc = (document.currentScript && document.currentScript.src) || '';
    link.href = scriptSrc ? scriptSrc.replace(/smart_tools\.js.*$/, 'smart_tools.css') : '../../../js/smart_tools.css';
    document.head.appendChild(link);

    bindEvents();
  }

  function bindEvents() {
    const bar = document.querySelector('#smart-header .st-tab-bar');
    const display = document.getElementById('st-tab-display');
    const panels = document.querySelectorAll('#smart-header .st-panel');

    if (bar) {
      bar.addEventListener('click', function (e) {
        const btn = e.target.closest('.st-tab-btn');
        if (!btn) return;
        const tab = btn.dataset.tab;
        var isSame = btn.classList.contains('active') && display.classList.contains('show');
        if (isSame) {
          display.classList.remove('show');
          btn.classList.remove('active');
          return;
        }
        bar.querySelectorAll('.st-tab-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        panels.forEach(function (p) {
          p.classList.toggle('active', p.dataset.panel === tab);
        });
        display.classList.add('show');
      });
    }

    const videoTabs = document.getElementById('st-video-tabs');
    const frame = document.getElementById('st-youtube-frame');
    if (videoTabs && frame) {
      videoTabs.addEventListener('click', function (e) {
        const btn = e.target.closest('button');
        if (!btn) return;
        videoTabs.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        frame.src = 'https://www.youtube.com/embed/' + btn.dataset.id;
      });
    }

    const aiSelect = document.getElementById('st-ai-select');
    const buildBtn = document.getElementById('st-build-btn');
    const promptOutput = document.getElementById('st-prompt-output');
    const copyBtn = document.getElementById('st-copy-btn');

    if (buildBtn && promptOutput && aiSelect) {
      const opts = AI_OPTIONS[TYPE] || AI_OPTIONS.OT;
      buildBtn.addEventListener('click', function () {
        const idx = parseInt(aiSelect.value, 10);
        const opt = opts[idx];
        if (opt) promptOutput.value = buildPrompt(opt);
      });
    }

    if (copyBtn && promptOutput) {
      copyBtn.addEventListener('click', function () {
        if (!promptOutput.value) {
          alert('請先生成指令！');
          return;
        }
        promptOutput.select();
        navigator.clipboard ? navigator.clipboard.writeText(promptOutput.value).then(() => alert('✅ 已複製！')) : document.execCommand('copy') && alert('✅ 已複製！');
      });
    }

    var canvasBtn = document.getElementById('st-canvas-card-btn');
    if (canvasBtn) {
      canvasBtn.addEventListener('click', function () {
        generateLearningCard();
      });
    }

    var collapseBtn = document.getElementById('st-collapse-btn');
    if (collapseBtn && display) {
      collapseBtn.addEventListener('click', function () {
        display.classList.remove('show');
        if (bar) bar.querySelectorAll('.st-tab-btn').forEach(function (b) { b.classList.remove('active'); });
      });
    }
  }

  function generateLearningCard() {
    var title = getPageTitle();
    var quizItems = document.querySelectorAll('#smart-header .st-quiz-item');
    var total = quizItems.length;
    var correct = 0;
    quizItems.forEach(function (item) {
      var checked = item.querySelector('input:checked');
      if (checked && checked.dataset.correct === 'true') correct++;
    });
    var score = total ? Math.round((correct / total) * 100) : 0;
    var scoreText = total ? correct + '/' + total + ' (' + score + '%)' : '-';

    var c = document.createElement('canvas');
    c.width = 600;
    c.height = 400;
    var ctx = c.getContext('2d');
    if (!ctx) { alert('瀏覽器不支援 Canvas'); return; }

    ctx.fillStyle = '#1b5e20';
    ctx.fillRect(0, 0, 600, 400);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fillRect(20, 20, 560, 360);

    ctx.fillStyle = '#1b5e20';
    ctx.font = 'bold 24px "Microsoft JhengHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('聖經一百步', 300, 70);
    ctx.font = '16px "Microsoft JhengHei", sans-serif';
    ctx.fillStyle = '#333';
    ctx.fillText(title, 300, 120);

    ctx.font = 'bold 20px "Microsoft JhengHei", sans-serif';
    ctx.fillStyle = '#2e7d32';
    ctx.fillText('課後測驗', 300, 180);
    ctx.font = '28px "Microsoft JhengHei", sans-serif';
    ctx.fillText(scoreText, 300, 230);

    ctx.font = '14px "Microsoft JhengHei", sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText(new Date().toLocaleDateString('zh-TW'), 300, 280);

    c.toBlob(function (blob) {
      if (!blob) return;
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'bible100-' + (title.replace(/[^\w\u4e00-\u9fff]/g, '-').slice(0, 20)) + '.png';
      a.click();
      URL.revokeObjectURL(a.href);
      alert('學習卡已下載！');
    }, 'image/png');
  }

  function whenReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }
  function run() {
    if (needsChapterConfig()) {
      loadChapterConfig(function () { whenReady(inject); });
    } else {
      whenReady(inject);
    }
  }
  run();

  // TOC 目錄多語系：依路徑將 toc-header 的「目錄」改為該語文
  var TOC_LABELS = { cn: '\u76ee\u5f55', ch: '\u76ee\u9304', en: 'Contents', vi: 'M\u1ee5c l\u1ee5c', my: '\u1019\u103e\u1010\u103d\u1000\u103a', kh: '\u1798\u17b6\u179f\u17b6\u1781\u17b6', lo: '\u0eaa\u0eb2\u0ea5\u0eb0\u0e9a\u0eb2\u0ea5', id: 'Daftar', ad: '\u76ee\u9304' };
  function tocLocalize() {
    var h = document.querySelector('.toc-header');
    if (!h) return;
    var label = TOC_LABELS[pathInfo.lang] || TOC_LABELS['en'];
    for (var i = 0; i < h.childNodes.length; i++) {
      var n = h.childNodes[i];
      if (n.nodeType === 3) { n.textContent = label + ' '; break; }
    }
  }
  whenReady(tocLocalize);
})();
