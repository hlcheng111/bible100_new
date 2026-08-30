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

  function findOverlay(sentence) {
    var pack = global.B100InterlinearLexicon;
    if (!pack) return null;
    var key = lookupKey(sentence);
    var list = pack.OVERLAY || [];
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

  function lexiconGet(surface) {
    var dict = (global.B100InterlinearLexicon && global.B100InterlinearLexicon.LEXICON) || {};
    return dict[lookupKey(surface)] || null;
  }

  function longestMatch(parts, i) {
    var max = Math.min(3, parts.length - i);
    for (var n = max; n >= 2; n--) {
      var joined = parts.slice(i, i + n).join(' ');
      if (/^[,;:!?.，。！？；：]+$/.test(joined)) continue;
      var hit = lexiconGet(joined);
      if (hit) return { n: n, surface: parts.slice(i, i + n).join(' '), entry: hit };
    }
    return null;
  }

  function segmentSentence(sentence) {
    var overlay = findOverlay(sentence);
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
      var multi = longestMatch(parts, i);
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
      var one = lexiconGet(tok);
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

  function grammarHint(tokens, overlay) {
    if (overlay && overlay.notes) {
      return { level: 'verified-overlay', text: overlay.notes };
    }
    var low = (tokens || []).map(function (t) { return lookupKey(t.surface); });
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
