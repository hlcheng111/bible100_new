/**
 * 教會事工頁 · 一鍵啟動 Chrome i18n（認路層）
 * 依賴：先載入 ../../js/b100_chrome_i18n.js 與 cm_chrome_i18n_pack.js（路徑依頁面深度）
 */
(function (global) {
  'use strict';

  function injectLangRow(host) {
    if (!host || host.querySelector('.cm-i18n-lang-row')) return;
    var row = document.createElement('div');
    row.className = 'cm-i18n-lang-row';
    row.setAttribute('role', 'group');
    row.setAttribute('aria-label', 'Language');
    row.style.cssText =
      'display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin:0 0 10px;padding:6px 10px;' +
      'background:#eef2ff;border:1px solid #c7d2fe;border-radius:8px;font-size:10px;';
    row.innerHTML =
      '<span style="color:#4338ca;font-weight:700;" data-i18n="cm.lang.label">語言</span>' +
      '<button type="button" class="b100-lang-btn" data-locale="zh-Hant" style="padding:3px 7px;font-weight:700;border-radius:4px;border:1px solid #a5b4fc;background:#fff;color:#3730a3;cursor:pointer;">中</button>' +
      '<button type="button" class="b100-lang-btn" data-locale="en" style="padding:3px 7px;font-weight:700;border-radius:4px;border:1px solid #a5b4fc;background:#fff;color:#3730a3;cursor:pointer;">EN</button>' +
      '<button type="button" class="b100-lang-btn" data-locale="vi" style="padding:3px 7px;font-weight:700;border-radius:4px;border:1px solid #a5b4fc;background:#fff;color:#3730a3;cursor:pointer;">VI</button>' +
      '<button type="button" class="b100-lang-btn" data-locale="id" style="padding:3px 7px;font-weight:700;border-radius:4px;border:1px solid #a5b4fc;background:#fff;color:#3730a3;cursor:pointer;">ID</button>' +
      '<span style="margin-left:6px;color:#64748b;" data-i18n="cm.forms.note" data-i18n-bridge="1"></span>';
    host.insertBefore(row, host.firstChild);
  }

  function boot(opts) {
    opts = opts || {};
    var I = global.B100ChromeI18n;
    var pack = global.CmChromeI18nPack;
    if (!I || !pack) return null;
    var root = opts.root || document.body;
    if (opts.langHost !== false) {
      var host =
        (typeof opts.langHost === 'string' && document.querySelector(opts.langHost)) ||
        document.getElementById('cmI18nLangHost') ||
        root;
      injectLangRow(host);
    }
    if (typeof opts.onChange === 'function') {
      global.B100ChromeI18nOnChange = opts.onChange;
    }
    return I.boot(pack);
  }

  function deskText(desk, field) {
    if (!desk || !desk.id) return (desk && desk[field]) || '';
    var I = global.B100ChromeI18n;
    var pack = global.CmChromeI18nPack;
    if (!I || !pack) return desk[field] || '';
    var key = 'cm.desk.' + desk.id + '.' + field;
    return I.t(pack, key) || desk[field] || '';
  }

  global.B100CmI18nBoot = { boot: boot, injectLangRow: injectLangRow, deskText: deskText };
})(typeof window !== 'undefined' ? window : global);
