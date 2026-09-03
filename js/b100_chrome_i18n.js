/**
 * Bible100 · Chrome + Blurb i18n（認路用）
 * - 只譯標題／導語／選單，不譯表單
 * - fallback：vi/id → en → zh-Hant
 * - 狀態：localStorage + ?locale= + postMessage(b100-locale)
 */
(function (global) {
  'use strict';

  var LOCALES = ['zh-Hant', 'en', 'vi', 'id'];
  var STORAGE_KEY = 'b100_ui_locale';
  var MSG_TYPE = 'b100-locale';

  function normalize(loc) {
    if (!loc) return 'zh-Hant';
    var s = String(loc).trim();
    if (s === 'zh' || s === 'zh-TW' || s === 'zh-CN' || s === 'zh-Hans') return 'zh-Hant';
    if (LOCALES.indexOf(s) >= 0) return s;
    return 'zh-Hant';
  }

  function getLocale() {
    try {
      var q = new URLSearchParams(global.location.search || '');
      if (q.get('locale')) return normalize(q.get('locale'));
    } catch (eQ) {}
    try {
      var stored = global.localStorage && global.localStorage.getItem(STORAGE_KEY);
      if (stored) return normalize(stored);
    } catch (eS) {}
    return 'zh-Hant';
  }

  function setLocale(loc, opts) {
    opts = opts || {};
    var next = normalize(loc);
    try {
      if (global.localStorage) global.localStorage.setItem(STORAGE_KEY, next);
    } catch (eW) {}
    try {
      global.document.documentElement.lang = next === 'zh-Hant' ? 'zh-Hant' : next;
    } catch (eL) {}
    if (!opts.silent) broadcast(next);
    return next;
  }

  function broadcast(loc) {
    var payload = { type: MSG_TYPE, locale: loc || getLocale() };
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage(payload, '*');
      }
    } catch (eP) {}
    try {
      global.postMessage(payload, '*');
    } catch (eS) {}
    var frames = global.document && global.document.querySelectorAll('iframe');
    if (frames) {
      for (var i = 0; i < frames.length; i++) {
        try {
          if (frames[i].contentWindow) frames[i].contentWindow.postMessage(payload, '*');
        } catch (eF) {}
      }
    }
  }

  function pickFromDict(dict, loc) {
    if (!dict || typeof dict !== 'object') return '';
    loc = normalize(loc || getLocale());
    if (dict[loc]) return dict[loc];
    if (loc === 'vi' || loc === 'id') {
      if (dict.en) return dict.en;
    }
    if (dict['zh-Hant']) return dict['zh-Hant'];
    if (dict.zh) return dict.zh;
    if (dict.en) return dict.en;
    return '';
  }

  function t(pack, key, loc) {
    if (!pack || !key) return '';
    var row = pack[key];
    if (!row) return '';
    if (typeof row === 'string') return row;
    return pickFromDict(row, loc);
  }

  function bridgeHint(pack, key, loc) {
    loc = normalize(loc || getLocale());
    if (loc === 'zh-Hant' || loc === 'en') return '';
    var row = pack && pack[key];
    if (!row || typeof row === 'string') return '';
    var en = pickFromDict(row, 'en');
    if (!en) return '';
    var primary = pickFromDict(row, loc);
    // VI/ID：主文已是該語時仍附小小英譯；主文已是英文則不再重複
    if (primary && primary === en) return '';
    return en;
  }

  function apply(pack, root) {
    if (!pack) return getLocale();
    var loc = getLocale();
    root = root || (global.document && global.document.body) || null;
    if (!root) return loc;
    try {
      global.document.documentElement.lang = loc === 'zh-Hant' ? 'zh-Hant' : loc;
    } catch (eLang) {}

    root.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var text = t(pack, key, loc);
      if (!text) return;
      var label = el.querySelector(':scope > [data-i18n-label], :scope > .i18n-text');
      if (label) {
        label.textContent = text;
      } else if (el.childElementCount === 0) {
        el.textContent = text;
      } else {
        var nodes = [];
        for (var i = 0; i < el.childNodes.length; i++) {
          var n = el.childNodes[i];
          if (n.nodeType === 3 && String(n.textContent).trim()) nodes.push(n);
        }
        if (nodes.length) {
          nodes[0].textContent = text + (/\s$/.test(nodes[0].textContent) ? '' : ' ');
          // keep trailing space before sibling .arrow / small when present
          if (el.querySelector(':scope > .arrow, :scope > small')) {
            nodes[0].textContent = text + ' ';
          } else {
            nodes[0].textContent = text;
          }
        } else {
          el.insertBefore(global.document.createTextNode(text + ' '), el.firstChild);
        }
      }
      var wantBridge = el.getAttribute('data-i18n-bridge') === '1';
      var bridge = bridgeHint(pack, key, loc);
      var bridgeEl = el.querySelector('.i18n-bridge');
      if (wantBridge && bridge) {
        if (!bridgeEl) {
          bridgeEl = global.document.createElement('small');
          bridgeEl.className = 'i18n-bridge';
          bridgeEl.style.cssText = 'display:block;font-size:8px;opacity:0.75;font-weight:400;line-height:1.2;';
          el.appendChild(bridgeEl);
        }
        bridgeEl.textContent = bridge;
        bridgeEl.hidden = false;
      } else if (bridgeEl) {
        bridgeEl.hidden = true;
      }
    });

    root.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      var html = t(pack, key, loc);
      if (html) el.innerHTML = html;
    });

    root.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-title');
      var text = t(pack, key, loc);
      if (text) el.setAttribute('title', text);
    });

    root.querySelectorAll('.lang-btn[data-locale], .b100-lang-btn[data-locale]').forEach(function (btn) {
      var v = btn.getAttribute('data-locale');
      btn.classList.toggle('on', normalize(v) === loc);
      btn.setAttribute('aria-pressed', normalize(v) === loc ? 'true' : 'false');
    });

    return loc;
  }

  function appendLocale(url, loc) {
    if (!url || /^javascript:/i.test(url) || url.charAt(0) === '#') return url;
    loc = normalize(loc || getLocale());
    try {
      var abs = new URL(url, global.location.href);
      abs.searchParams.set('locale', loc);
      return abs.href;
    } catch (eU) {
      var sep = url.indexOf('?') >= 0 ? '&' : '?';
      if (/[?&]locale=/.test(url)) {
        return url.replace(/([?&])locale=[^&]*/, '$1locale=' + encodeURIComponent(loc));
      }
      return url + sep + 'locale=' + encodeURIComponent(loc);
    }
  }

  function bindLangButtons(pack, root) {
    root = root || global.document;
    if (!root) return;
    root.querySelectorAll('.lang-btn[data-locale], .b100-lang-btn[data-locale]').forEach(function (btn) {
      if (btn.getAttribute('data-b100-i18n-bound') === '1') return;
      btn.setAttribute('data-b100-i18n-bound', '1');
      btn.addEventListener('click', function (ev) {
        if (ev.preventDefault) ev.preventDefault();
        var loc = setLocale(btn.getAttribute('data-locale'));
        apply(pack, global.document.body);
        if (typeof global.B100ChromeI18nOnChange === 'function') {
          try {
            global.B100ChromeI18nOnChange(loc);
          } catch (eC) {}
        }
      });
    });
  }

  function listen(handler) {
    global.addEventListener('message', function (ev) {
      var d = ev.data;
      if (!d || d.type !== MSG_TYPE || !d.locale) return;
      try {
        if (global.localStorage) global.localStorage.setItem(STORAGE_KEY, normalize(d.locale));
      } catch (e) {}
      if (typeof handler === 'function') handler(normalize(d.locale), d);
    });
  }

  function boot(pack, opts) {
    opts = opts || {};
    var loc = getLocale();
    setLocale(loc, { silent: true });
    apply(pack, global.document.body);
    bindLangButtons(pack, global.document);
    listen(function () {
      apply(pack, global.document.body);
      if (opts.onLocale) opts.onLocale(getLocale());
    });
    return loc;
  }

  global.B100ChromeI18n = {
    LOCALES: LOCALES,
    STORAGE_KEY: STORAGE_KEY,
    MSG_TYPE: MSG_TYPE,
    normalize: normalize,
    getLocale: getLocale,
    setLocale: setLocale,
    broadcast: broadcast,
    t: t,
    apply: apply,
    appendLocale: appendLocale,
    bindLangButtons: bindLangButtons,
    listen: listen,
    boot: boot,
  };
})(typeof window !== 'undefined' ? window : global);
