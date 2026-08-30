/**
 * 越文正規化 + 最長片語優先切詞。
 */
(function (global) {
  'use strict';

  function normalizeVi(text) {
    return String(text || '')
      .normalize('NFC')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/&lt;br\s*\/?&gt;/gi, '\n')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[–—]/g, '-')
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .trim();
  }

  function lookupKey(s) {
    return normalizeVi(s)
      .toLowerCase()
      .replace(/^[.,;:!?，。！？；：]+|[.,;:!?，。！？；：]+$/g, '');
  }

  function lexiconFor(lang) {
    var pack = global.B100InterlinearLexicon || {};
    return lang === 'id' ? (pack.LEXICON_ID || {}) : (pack.LEXICON || {});
  }

  function overlayFor(lang) {
    var pack = global.B100InterlinearLexicon || {};
    return lang === 'id' ? (pack.OVERLAY_ID || []) : (pack.OVERLAY || []);
  }

  function findOverlay(sentence, lang) {
    var key = lookupKey(sentence);
    var list = overlayFor(lang || 'vi');
    for (var i = 0; i < list.length; i++) {
      var keys = list[i].keys || [];
      for (var k = 0; k < keys.length; k++) {
        if (lookupKey(keys[k]) === key) return list[i];
      }
    }
    return null;
  }

  function splitLines(text) {
    return normalizeVi(text)
      .split(/\n+/)
      .map(function (s) { return s.trim(); })
      .filter(function (s) { return s.length > 0; });
  }

  function rawTokens(sentence) {
    return sentence
      .split(/(\s+|[,;:!?.，。！？；：""''()]+)/)
      .map(function (t) { return t.trim(); })
      .filter(function (t) { return t.length > 0; });
  }

  function lexiconGet(surface, lang) {
    var dict = lexiconFor(lang);
    return dict[lookupKey(surface)] || null;
  }

  function longestMatch(parts, i, lang) {
    var max = Math.min(3, parts.length - i);
    for (var n = max; n >= 2; n--) {
      var joined = parts.slice(i, i + n).join(' ');
      if (/^[,;:!?.，。！？；：]+$/.test(joined)) continue;
      var hit = lexiconGet(joined, lang);
      if (hit) return { n: n, surface: parts.slice(i, i + n).join(' '), entry: hit };
    }
    return null;
  }

  function segmentSentence(sentence, lang) {
    lang = lang || 'vi';
    var overlay = findOverlay(sentence, lang);
    if (overlay && overlay.words && overlay.words.length) {
      return overlay.words.map(function (w) {
        return {
          surface: w.target,
          zh: w.zh || '',
          en: w.en || '',
          pos: w.pos || 'unknown',
          status: 'verified-overlay'
        };
      });
    }
    var parts = rawTokens(sentence);
    var words = [];
    for (var i = 0; i < parts.length; i++) {
      var tok = parts[i];
      if (/^[,;:!?.，。！？；：]+$/.test(tok)) {
        words.push({ surface: tok, zh: '標點', en: 'punct', pos: 'part', status: 'rule-gloss' });
        continue;
      }
      var multi = longestMatch(parts, i, lang);
      if (multi) {
        words.push({
          surface: multi.surface,
          zh: multi.entry.zh,
          en: multi.entry.en,
          pos: multi.entry.pos,
          status: 'rule-gloss'
        });
        i += multi.n - 1;
        continue;
      }
      var one = lexiconGet(tok, lang);
      if (one) {
        words.push({
          surface: tok, zh: one.zh, en: one.en, pos: one.pos, status: 'rule-gloss'
        });
      } else {
        words.push({
          surface: tok, zh: '', en: '', pos: 'unknown', status: 'unknown'
        });
      }
    }
    return words;
  }

  function grammarHint(tokens, overlay, lang) {
    if (overlay && overlay.notes) {
      return { level: 'verified-overlay', text: overlay.notes };
    }
    var low = (tokens || []).map(function (t) { return lookupKey(t.surface); });
    if (lang === 'id') {
      if (low.indexOf('selamat') >= 0) {
        return { level: 'template', text: '受限句型：招呼語。Selamat + 時段（pagi／siang／sore／malam）。' };
      }
      if (low.indexOf('apa kabar') >= 0) {
        return { level: 'template', text: '受限句型：問候。apa kabar 慣用為「你好嗎」，不是逐字「什麼消息」。' };
      }
      if (low.indexOf('tidak') >= 0 || low.indexOf('bukan') >= 0) {
        return { level: 'template', text: '受限句型：否定。tidak 否定動詞／形容詞；bukan 否定名詞。' };
      }
      return { level: 'not-generated', text: null };
    }
    if (low.indexOf('lạy') >= 0) {
      return { level: 'template', text: '受限句型：祈禱呼語。Lạy 表崇敬呼求。' };
    }
    if (low.indexOf('trị đến') >= 0 || low.indexOf('nguyện') >= 0) {
      return { level: 'template', text: '受限句型：祈願／祈求。不是完整依存分析。' };
    }
    return { level: 'not-generated', text: null };
  }

  function literalDraft(tokens) {
    var bits = [];
    (tokens || []).forEach(function (t) {
      if (t.pos === 'part' && t.zh === '標點') return;
      if (t.zh) bits.push(t.zh);
    });
    return bits.length ? bits.join(' · ') : '';
  }

  global.B100ViSegment = {
    normalizeVi: normalizeVi,
    lookupKey: lookupKey,
    findOverlay: findOverlay,
    splitLines: splitLines,
    segmentSentence: segmentSentence,
    grammarHint: grammarHint,
    literalDraft: literalDraft
  };
})(typeof window !== 'undefined' ? window : this);
