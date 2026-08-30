/**
 * 任意越文句：經節／已校 overlay 優先；其餘走本機譯文記憶或線上草稿翻譯。
 * 絕不把原文填進中英欄。
 */
(function () {
  'use strict';

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function currentLang() {
    var el = document.getElementById('igLang');
    return el && el.value === 'id' ? 'id' : 'vi';
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

  function sourceLabel(src) {
    if (src === 'verified-overlay') return '已校教材';
    if (src === 'verse-aligned') return '本機經節對譯';
    if (src === 'ai-draft') return 'AI 草稿';
    if (src === 'mt-draft') return '機器翻譯草稿';
    if (src === 'user-tm') return '本機譯文記憶';
    return src || '未產生';
  }

  function setBanner(dbOk) {
    var el = document.getElementById('igBanner');
    if (!el) return;
    var key = window.B100InterlinearTranslate && window.B100InterlinearTranslate.getApiKey();
    var bits = [];
    bits.push(dbOk
      ? '本機經庫已連上（越1934／印尼AYT／和合／KJV）。'
      : '經庫未載入：請用打開Bible100.bat 的本機 HTTP。示範句仍可用。');
    bits.push(key
      ? '已有 Gemini Key：任意新句走 AI 草稿。'
      : '未填 Key：任意新句走免費機器翻譯草稿（需上網），品質請人審。');
    el.className = dbOk ? 'ig-banner' : 'ig-banner is-warn';
    el.textContent = bits.join(' ');
  }

  function renderCard(w) {
    var zh = w.zh ? '<div class="zh">' + esc(w.zh) + '</div>' : '<div class="miss">未登錄</div>';
    var en = w.en ? '<div class="en">' + esc(w.en) + '</div>' : '';
    return (
      '<div class="ig-card ' + posClass(w.pos) + '"><div class="pos">' + esc(w.pos || 'unknown') +
      '</div><div class="surf">' + esc(w.surface) + '</div>' + zh + en + '</div>'
    );
  }

  function renderBlock(item) {
    var transClass = (item.transSource === 'ai-draft' || item.transSource === 'mt-draft') ? 'ig-draft' : 'ig-ok';
    var zhHtml = item.transZh
      ? '<span class="' + transClass + '">' + esc(item.transZh) + '</span> <small>（' + esc(sourceLabel(item.transSource)) + '）</small>'
      : '<span class="ig-empty">未產生譯文（請檢查網路或 API Key）</span>';
    var enHtml = item.transEn
      ? '<span class="' + transClass + '">' + esc(item.transEn) + '</span>'
      : '<span class="ig-empty">Not generated</span>';
    var gramHtml = item.gram && item.gram.text
      ? esc(item.gram.text) + ' <small>（' + esc(item.gram.level) + '）</small>'
      : '<span class="ig-empty">無句構說明（詞典／模板未命中，且草稿未提供）。</span>';
    var lit = item.literal ? esc(item.literal) : '（詞典無足夠詞義，無法拼接）';
    var para = '';
    if (item.aligned && (item.aligned.vi || item.aligned.id)) {
      if (item.aligned.vi) para += '<div class="ig-row"><strong>經庫越文</strong> ' + esc(item.aligned.vi) + '</div>';
      if (item.aligned.id) para += '<div class="ig-row"><strong>經庫印尼</strong> ' + esc(item.aligned.id) + '</div>';
    }
    return (
      '<article class="ig-block">' +
      (item.refLabel ? '<div class="ig-ref">經節 ' + esc(item.refLabel) + '</div>' : '') +
      '<div class="ig-row"><strong>原文</strong> ' + esc(item.source) + '</div>' +
      '<div class="ig-cards">' + item.tokens.map(renderCard).join('') + '</div>' +
      '<div class="ig-row"><strong>逐詞直譯</strong> ' + lit + ' <small>（詞彙拼接，非通順譯）</small></div>' +
      '<div class="ig-row"><strong>中文</strong> ' + zhHtml + '</div>' +
      '<div class="ig-row"><strong>英文</strong> ' + enHtml + '</div>' +
      para +
      '<div class="ig-row"><strong>句構</strong> ' + gramHtml + '</div></article>'
    );
  }

  function baseItem(line) {
    var Seg = window.B100ViSegment;
    var lang = currentLang();
    var overlay = Seg.findOverlay(line, lang);
    var tokens = Seg.segmentSentence(line, lang);
    return {
      source: line,
      lang: lang,
      tokens: tokens,
      literal: Seg.literalDraft(tokens),
      transZh: overlay && overlay.translationZh ? overlay.translationZh : null,
      transEn: overlay && overlay.translationEn ? overlay.translationEn : null,
      transSource: overlay && overlay.translationZh ? 'verified-overlay' : 'not-generated',
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
      : (Look.findBySourceText
        ? Look.findBySourceText(item.source, item.lang)
        : Look.findByViText(item.source));
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
      item.literal = Seg.literalDraft(item.tokens);
      item.gram = Seg.grammarHint(item.tokens, null, item.lang);
    }
    return item;
  }

  function applyDraft(item) {
    if (item.transZh) return Promise.resolve(item);
    var Tr = window.B100InterlinearTranslate;
    if (!Tr) return Promise.resolve(item);
    return Tr.translateFreeText(item.source, item.lang).then(function (out) {
      if (!out || !out.zh) return item;
      item.transZh = out.zh;
      item.transEn = out.en || null;
      item.transSource = out.fromCache ? 'user-tm' : out.source;
      if (out.tokens && out.tokens.length) item.tokens = out.tokens;
      if (out.grammar) item.gram = { level: out.source, text: out.grammar };
      return item;
    }).catch(function () {
      return item;
    });
  }

  function run() {
    var Seg = window.B100ViSegment;
    var Look = window.B100VerseLookup;
    var box = document.getElementById('igResults');
    var raw = document.getElementById('igInput').value;
    var lines = Seg.splitLines(raw);
    if (!lines.length && Look && Look.parseUrlVerse) {
      var urlRef = Look.parseUrlVerse();
      if (urlRef && Look.isReady()) {
        var aligned = Look.getAligned(urlRef.b, urlRef.c, urlRef.v);
        if (aligned.vi) lines = [aligned.vi];
      }
    }
    if (!lines.length) {
      box.innerHTML = '<p class="ig-hint">請貼越文或印尼文，或載入示範句。</p>';
      return;
    }
    if (lines.length === 1 && Look && Look.isReady() && Look.parseRef(lines[0]) && !/[a-zàáăâêôơư]/i.test(lines[0])) {
      var a = Look.getAligned(Look.parseRef(lines[0]).b, Look.parseRef(lines[0]).c, Look.parseRef(lines[0]).v);
      var surface = currentLang() === 'id' ? a.id : a.vi;
      if (surface) lines = [surface];
    }
    box.innerHTML = '<p class="ig-hint">正在對照／翻譯…</p>';
    var items = lines.map(baseItem).map(applyVerse);
    var chain = Promise.resolve();
    items.forEach(function (item, idx) {
      chain = chain.then(function () { return applyDraft(item); }).then(function (done) {
        items[idx] = done;
      });
    });
    chain.then(function () {
      box.innerHTML = items.map(renderBlock).join('');
    });
  }

  function boot() {
    var keyEl = document.getElementById('igApiKey');
    try {
      var saved = localStorage.getItem('b100_interlinear_gemini_key');
      if (saved && keyEl) keyEl.value = saved;
    } catch (e) {}
    document.getElementById('btnSample').addEventListener('click', function () {
      var pack = window.B100InterlinearLexicon;
      document.getElementById('igInput').value = currentLang() === 'id'
        ? pack.SAMPLE_TEXT_ID
        : pack.SAMPLE_TEXT;
      run();
    });
    document.getElementById('btnRun').addEventListener('click', run);
    var langEl = document.getElementById('igLang');
    if (langEl) langEl.addEventListener('change', function () { setBanner(window.B100VerseLookup && window.B100VerseLookup.isReady()); });
    document.getElementById('btnSaveKey').addEventListener('click', function () {
      window.B100InterlinearTranslate.getApiKey();
      setBanner(window.B100VerseLookup && window.B100VerseLookup.isReady());
    });
    var Look = window.B100VerseLookup;
    if (!Look) {
      setBanner(false);
      return;
    }
    Look.init().then(function (ok) {
      setBanner(!!ok);
      var urlRef = Look.parseUrlVerse && Look.parseUrlVerse();
      if (urlRef && ok) {
        var a = Look.getAligned(urlRef.b, urlRef.c, urlRef.v);
        var surface = currentLang() === 'id' ? a.id : a.vi;
        if (surface) document.getElementById('igInput').value = surface;
      }
      if (document.getElementById('igInput').value.trim()) run();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
