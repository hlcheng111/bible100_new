/**
 * V6 外觀：無 Key 直譯、不提示 bat。經庫能連就靜默用。
 */
(function () {
  'use strict';

  var testMode = 'none';
  var lastItems = [];

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function currentLang() {
    var el = document.getElementById('targetLangSelect');
    return el && el.value === 'id' ? 'id' : 'vi';
  }

  function analysisLang() {
    var el = document.getElementById('analysisLangSelect');
    return (el && el.value) || 'zh-en';
  }

  function posClass(pos) {
    var p = (pos || '').toLowerCase();
    if (p.indexOf('noun') >= 0) return 'noun';
    if (p.indexOf('verb') >= 0) return 'verb';
    if (p.indexOf('adj') >= 0) return 'adj';
    if (p.indexOf('pron') >= 0) return 'pron';
    if (p.indexOf('prep') >= 0) return 'prep';
    if (p.indexOf('adv') >= 0) return 'adv';
    if (p.indexOf('part') >= 0) return 'part';
    return 'unknown';
  }

  function posName(pos) {
    var p = posClass(pos);
    if (p === 'noun') return '名詞 N';
    if (p === 'verb') return '動詞 V';
    if (p === 'adj') return '形容詞 Adj';
    if (p === 'pron') return '代詞 Pron';
    if (p === 'prep') return '介／連 Prep';
    if (p === 'adv') return '副詞 Adv';
    if (p === 'part') return '助詞 Part';
    return '單詞';
  }

  function setStatus(dbOk) {
    var el = document.getElementById('statusBadge');
    if (!el) return;
    el.textContent = dbOk ? '詞典直譯 · 經節可對照' : '詞典直譯模式';
  }

  function renderCard(w, an) {
    var showZh = an !== 'en';
    var showEn = an !== 'zh';
    var zh = '';
    if (showZh) {
      zh = w.zh
        ? '<div class="zh gloss-zh">' + esc(w.zh) + '</div>'
        : '<div class="miss gloss-zh">未登錄</div>';
    }
    var en = showEn && w.en ? '<div class="en">' + esc(w.en) + '</div>' : '';
    return (
      '<div class="ig-card ' + posClass(w.pos) + '">' +
      '<div class="pos">' + esc(posName(w.pos)) + '</div>' +
      '<div class="surf foreign-word">' + esc(w.surface) + '</div>' +
      zh + en +
      '</div>'
    );
  }

  function renderBlock(item) {
    var an = analysisLang();
    var zhLabel = item.transSource === 'verified-overlay' || item.transSource === 'verse-aligned'
      ? '對應中文'
      : '直譯草稿（中）';
    var enLabel = item.transSource === 'verified-overlay' || item.transSource === 'verse-aligned'
      ? '對應英文'
      : '直譯草稿（英）';
    var zhHtml = item.transZh
      ? '<span class="gloss-zh ' + (item.transSource === 'literal-draft' ? 'ig-draft' : 'ig-ok') + '">' + esc(item.transZh) + '</span>'
      : '<span class="ig-empty gloss-zh">未譯</span>';
    var enHtml = item.transEn
      ? '<span class="' + (item.transSource === 'literal-draft' ? 'ig-draft' : 'ig-ok') + '">' + esc(item.transEn) + '</span>'
      : '<span class="ig-empty">未譯</span>';
    var gramHtml = item.gram && item.gram.text
      ? esc(item.gram.text)
      : '<span class="ig-empty">詞級標註已完成；無整句句法模板。</span>';
    var zhRow = an === 'en' ? '' : '<div class="ig-row"><strong>' + zhLabel + '</strong> ' + zhHtml + '</div>';
    var enRow = an === 'zh' ? '' : '<div class="ig-row"><strong>' + enLabel + '</strong> ' + enHtml + '</div>';
    return (
      '<article class="ig-block">' +
      (item.refLabel ? '<div class="ig-ref">經節 ' + esc(item.refLabel) + '</div>' : '') +
      '<div class="ig-row"><strong>原文</strong> <span class="foreign-word">' + esc(item.source) + '</span></div>' +
      '<div class="ig-cards">' + item.tokens.map(function (w) { return renderCard(w, an); }).join('') + '</div>' +
      zhRow + enRow +
      '<div class="ig-row"><strong>語法解析</strong> ' + gramHtml + '</div></article>'
    );
  }

  function applyTestClass() {
    var box = document.getElementById('analysisResults');
    if (!box) return;
    box.classList.remove('hide-zh', 'hide-fo');
    if (testMode === 'zh') box.classList.add('hide-zh');
    if (testMode === 'fo') box.classList.add('hide-fo');
    ['btnTestNone', 'btnTestZh', 'btnTestFo'].forEach(function (id) {
      var b = document.getElementById(id);
      if (b) b.classList.toggle('ig-test-on', (id === 'btnTestNone' && testMode === 'none') || (id === 'btnTestZh' && testMode === 'zh') || (id === 'btnTestFo' && testMode === 'fo'));
    });
  }

  function baseItem(line) {
    var Seg = window.B100ViSegment;
    var lang = currentLang();
    var overlay = Seg.findOverlay(line, lang);
    var tokens = Seg.segmentSentence(line, lang);
    var litZh = Seg.literalDraft(tokens, 'zh');
    var litEn = Seg.literalDraft(tokens, 'en');
    var transZh = overlay && overlay.translationZh ? overlay.translationZh : null;
    var transEn = overlay && overlay.translationEn ? overlay.translationEn : null;
    var transSource = transZh ? 'verified-overlay' : 'not-generated';
    if (!transZh && litZh) {
      transZh = litZh;
      transSource = 'literal-draft';
    }
    if (!transEn && litEn) transEn = litEn;
    if (transZh && Seg.lookupKey(transZh) === Seg.lookupKey(line)) {
      transZh = litZh && Seg.lookupKey(litZh) !== Seg.lookupKey(line) ? litZh : null;
      transSource = transZh ? 'literal-draft' : 'not-generated';
    }
    if (transEn && Seg.lookupKey(transEn) === Seg.lookupKey(line)) {
      transEn = litEn && Seg.lookupKey(litEn) !== Seg.lookupKey(line) ? litEn : null;
    }
    return {
      source: line,
      lang: lang,
      tokens: tokens,
      transZh: transZh,
      transEn: transEn,
      transSource: transSource,
      gram: Seg.grammarHint(tokens, overlay, lang),
      aligned: null,
      refLabel: '',
      overlay: overlay
    };
  }

  function applyVerse(item) {
    var Look = window.B100VerseLookup;
    var Seg = window.B100ViSegment;
    if (!Look || !Look.isReady() || item.overlay) return item;
    var ref = Look.parseRef(item.source);
    var hit = ref
      ? Look.getAligned(ref.b, ref.c, ref.v)
      : (Look.findBySourceText && Look.findBySourceText(item.source, item.lang));
    if (!hit || !(hit.vi || hit.zh || hit.id)) return item;
    item.aligned = hit;
    item.refLabel = hit.b + ':' + hit.c + ':' + hit.v;
    if (hit.zh) {
      item.transZh = hit.zh;
      item.transSource = 'verse-aligned';
    }
    if (hit.en) item.transEn = hit.en;
    var surface = item.lang === 'id' ? hit.id : hit.vi;
    if (surface && Seg.lookupKey(surface) !== Seg.lookupKey(item.source)) {
      item.tokens = Seg.segmentSentence(surface, item.lang);
      if (item.transSource !== 'verse-aligned') {
        item.transZh = Seg.literalDraft(item.tokens, 'zh') || item.transZh;
        item.transEn = Seg.literalDraft(item.tokens, 'en') || item.transEn;
        item.transSource = item.transZh ? 'literal-draft' : item.transSource;
      }
      item.gram = Seg.grammarHint(item.tokens, null, item.lang);
    }
    return item;
  }

  function paint(items) {
    lastItems = items;
    var box = document.getElementById('analysisResults');
    box.innerHTML = items.map(renderBlock).join('');
    applyTestClass();
  }

  function run() {
    var dir = document.getElementById('analysisDirection');
    if (dir && dir.value === 'zh-to-foreign') {
      dir.value = 'foreign-to-zh';
    }
    var Seg = window.B100ViSegment;
    var Look = window.B100VerseLookup;
    var box = document.getElementById('analysisResults');
    var raw = document.getElementById('inputText').value;
    var lines = Seg.splitLines(raw);
    if (!lines.length && Look && Look.parseUrlVerse && Look.isReady()) {
      var urlRef = Look.parseUrlVerse();
      if (urlRef) {
        var aligned = Look.getAligned(urlRef.b, urlRef.c, urlRef.v);
        var s0 = currentLang() === 'id' ? aligned.id : aligned.vi;
        if (s0) lines = [s0];
      }
    }
    if (!lines.length) {
      box.innerHTML = '<p class="ig-hint">請先輸入或載入範例。</p>';
      return;
    }
    if (lines.length === 1 && Look && Look.isReady() && Look.parseRef(lines[0]) && !/[a-zàáăâêôơư]/i.test(lines[0])) {
      var a = Look.getAligned(Look.parseRef(lines[0]).b, Look.parseRef(lines[0]).c, Look.parseRef(lines[0]).v);
      var surface = currentLang() === 'id' ? a.id : a.vi;
      if (surface) lines = [surface];
    }
    paint(lines.map(baseItem).map(applyVerse));
  }

  function loadSample(kind) {
    var pack = window.B100InterlinearLexicon;
    var sel = document.getElementById('targetLangSelect');
    var ta = document.getElementById('inputText');
    if (kind === 'id') {
      sel.value = 'id';
      ta.value = pack.SAMPLE_TEXT_ID;
    } else if (kind === 'vi2') {
      sel.value = 'vi';
      ta.value = (pack.OVERLAY && pack.OVERLAY[1] && pack.OVERLAY[1].keys[0]) || pack.SAMPLE_TEXT;
    } else {
      sel.value = 'vi';
      ta.value = (pack.OVERLAY && pack.OVERLAY[0] && pack.OVERLAY[0].keys[0]) || pack.SAMPLE_TEXT;
    }
    run();
  }

  function speakAll() {
    if (!('speechSynthesis' in window) || !lastItems.length) return;
    var lang = currentLang() === 'id' ? 'id-ID' : 'vi-VN';
    var text = lastItems.map(function (i) { return i.source; }).join(' ');
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.75;
    window.speechSynthesis.speak(u);
  }

  function boot() {
    document.getElementById('btnSampleVi1').addEventListener('click', function () { loadSample('vi1'); });
    document.getElementById('btnSampleVi2').addEventListener('click', function () { loadSample('vi2'); });
    document.getElementById('btnSampleId').addEventListener('click', function () { loadSample('id'); });
    document.getElementById('btnAnalyze').addEventListener('click', run);
    document.getElementById('btnClear').addEventListener('click', function () {
      document.getElementById('inputText').value = '';
    });
    document.getElementById('btnSpeak').addEventListener('click', speakAll);
    document.getElementById('btnTestNone').addEventListener('click', function () { testMode = 'none'; applyTestClass(); });
    document.getElementById('btnTestZh').addEventListener('click', function () { testMode = 'zh'; applyTestClass(); });
    document.getElementById('btnTestFo').addEventListener('click', function () { testMode = 'fo'; applyTestClass(); });
    document.getElementById('analysisDirection').addEventListener('change', function () {
      if (this.value === 'zh-to-foreign') this.value = 'foreign-to-zh';
    });
    document.getElementById('targetLangSelect').addEventListener('change', function () {
      var pack = window.B100InterlinearLexicon;
      var ta = document.getElementById('inputText');
      if (!ta.value.trim()) ta.value = currentLang() === 'id' ? pack.SAMPLE_TEXT_ID : pack.SAMPLE_TEXT;
    });
    var Look = window.B100VerseLookup;
    if (!Look) {
      setStatus(false);
      return;
    }
    Look.init().then(function (ok) {
      setStatus(!!ok);
      var urlRef = Look.parseUrlVerse && Look.parseUrlVerse();
      if (urlRef && ok) {
        var a = Look.getAligned(urlRef.b, urlRef.c, urlRef.v);
        var surface = currentLang() === 'id' ? a.id : a.vi;
        if (surface) document.getElementById('inputText').value = surface;
      }
      if (document.getElementById('inputText').value.trim()) run();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
