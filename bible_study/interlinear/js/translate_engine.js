/**
 * 任意越文句翻譯：本機譯文記憶 → Gemini（可選 Key）→ MyMemory 草稿。
 * 絕不把原文回填為中／英譯文。結果標 source，人審後可存進譯文記憶。
 */
(function (global) {
  'use strict';

  var TM_KEY = 'b100_interlinear_tm_v1';
  var API_KEY = 'b100_interlinear_gemini_key';
  var MODELS = ['gemini-2.0-flash', 'gemini-flash-latest', 'gemini-1.5-flash'];

  function lookupKey(text) {
    var Seg = global.B100ViSegment;
    return Seg ? Seg.lookupKey(text) : String(text || '').trim().toLowerCase();
  }

  function loadTm() {
    try {
      return JSON.parse(localStorage.getItem(TM_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  function saveTm(map) {
    try {
      localStorage.setItem(TM_KEY, JSON.stringify(map));
    } catch (e) {}
  }

  function getApiKey() {
    var el = document.getElementById('igApiKey');
    var typed = el && el.value ? el.value.trim() : '';
    if (typed) {
      try { localStorage.setItem(API_KEY, typed); } catch (e) {}
      return typed;
    }
    try {
      return localStorage.getItem(API_KEY) || '';
    } catch (e2) {
      return '';
    }
  }

  function getCached(text) {
    var map = loadTm();
    return map[lookupKey(text)] || null;
  }

  function remember(text, payload) {
    if (!payload || !payload.zh) return;
    var map = loadTm();
    map[lookupKey(text)] = {
      zh: payload.zh,
      en: payload.en || '',
      grammar: payload.grammar || '',
      tokens: payload.tokens || null,
      source: payload.source,
      savedAt: Date.now()
    };
    saveTm(map);
  }

  function looksLikeSourceEcho(src, out) {
    if (!out) return true;
    var a = lookupKey(src);
    var b = lookupKey(out);
    return !b || a === b;
  }

  function myMemory(text, pair) {
    var url =
      'https://api.mymemory.translated.net/get?q=' +
      encodeURIComponent(text) +
      '&langpair=' +
      encodeURIComponent(pair);
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('MyMemory HTTP ' + r.status);
      return r.json();
    }).then(function (j) {
      var t = j && j.responseData && j.responseData.translatedText;
      return String(t || '').trim();
    });
  }

  function geminiOnce(model, apiKey, text) {
    var url =
      'https://generativelanguage.googleapis.com/v1beta/models/' +
      model +
      ':generateContent?key=' +
      encodeURIComponent(apiKey);
    var body = {
      systemInstruction: {
        parts: [{
          text: 'You are a Vietnamese teaching linguist. Return only JSON. Do not invent Bible verses. Mark uncertain glosses. Translations must be natural Traditional Chinese and English, not a copy of the source.'
        }]
      },
      contents: [{
        parts: [{
          text:
            'Gloss this Vietnamese sentence for language learners:\n' +
            JSON.stringify(text) +
            '\nReturn JSON object with keys: translationZh, translationEn, grammarZh, words (array of {target, zh, en, pos}). pos one of noun,verb,adj,pron,prep,adv,part.'
        }]
      }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json'
      }
    };
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) {
          var msg = (j.error && j.error.message) || ('HTTP ' + r.status);
          throw new Error(msg);
        }
        var raw = j.candidates && j.candidates[0] && j.candidates[0].content &&
          j.candidates[0].content.parts && j.candidates[0].content.parts[0] &&
          j.candidates[0].content.parts[0].text;
        if (!raw) throw new Error('空回應');
        var parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return parsed;
      });
    });
  }

  function fromGemini(text, apiKey) {
    var chain = Promise.reject(new Error('no model'));
    MODELS.forEach(function (model) {
      chain = chain.catch(function () { return geminiOnce(model, apiKey, text); });
    });
    return chain.then(function (parsed) {
      var zh = String(parsed.translationZh || parsed.translation_zh || '').trim();
      var en = String(parsed.translationEn || parsed.translation_en || '').trim();
      if (looksLikeSourceEcho(text, zh)) throw new Error('Gemini 未產生中文譯文');
      var words = parsed.words || parsed.tokens || [];
      var tokens = (words || []).map(function (w) {
        return {
          surface: w.target || w.surface || '',
          zh: w.zh || '',
          en: w.en || '',
          pos: w.pos || 'unknown',
          status: 'ai-draft'
        };
      }).filter(function (w) { return w.surface; });
      return {
        zh: zh,
        en: en,
        grammar: String(parsed.grammarZh || parsed.grammar_zh || parsed.notes || '').trim(),
        tokens: tokens.length ? tokens : null,
        source: 'ai-draft'
      };
    });
  }

  function fromMyMemory(text) {
    return myMemory(text, 'vi|zh-TW').then(function (zh) {
      if (looksLikeSourceEcho(text, zh)) throw new Error('MyMemory 中文無效');
      return myMemory(text, 'vi|en').then(function (en) {
        if (looksLikeSourceEcho(text, en)) en = '';
        return {
          zh: zh,
          en: en,
          grammar: '',
          tokens: null,
          source: 'mt-draft'
        };
      });
    });
  }

  function translateFreeText(text) {
    var cached = getCached(text);
    if (cached && cached.zh && !looksLikeSourceEcho(text, cached.zh)) {
      return Promise.resolve(Object.assign({ fromCache: true }, cached));
    }
    var key = getApiKey();
    var start = key
      ? fromGemini(text, key)
      : Promise.reject(new Error('no-key'));
    return start.catch(function () {
      return fromMyMemory(text);
    }).then(function (out) {
      remember(text, out);
      return out;
    });
  }

  global.B100InterlinearTranslate = {
    getApiKey: getApiKey,
    getCached: getCached,
    remember: remember,
    translateFreeText: translateFreeText,
    looksLikeSourceEcho: looksLikeSourceEcho
  };
})(typeof window !== 'undefined' ? window : this);
