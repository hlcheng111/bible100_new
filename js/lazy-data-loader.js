/**
 * Lazy fetch for large static data under data/ (JSON / JS).
 * Prefer SQLite .db when available; use fetch + cache for optional JSON blobs.
 */
(function (global) {
  'use strict';

  var cache = Object.create(null);

  function resolveDataUrl(relativePath) {
    var path = (window.location.pathname || '').replace(/\\/g, '/');
    var idx = path.indexOf('bible100_new');
    var base = idx >= 0 ? path.slice(0, idx + 12) : path.replace(/\/[^/]+$/, '');
    if (base && !/\/$/.test(base)) base += '/';
    return (base || '') + 'data/' + relativePath.replace(/^\//, '');
  }

  function loadJson(relativePath, options) {
    options = options || {};
    var key = relativePath;
    if (cache[key]) return Promise.resolve(cache[key]);
    var url = resolveDataUrl(relativePath);
    return fetch(url, { cache: options.cache || 'default' })
      .then(function (r) {
        if (!r.ok) throw new Error('Failed to load ' + url);
        return r.json();
      })
      .then(function (data) {
        cache[key] = data;
        return data;
      });
  }

  /** Prefer gb_parsing.db via SQL.js; JSON is fallback only when explicitly requested. */
  function loadGbParsing(options) {
    options = options || {};
    if (options.preferJson) return loadJson('orig/gb_parsing.json', options);
    return Promise.reject(new Error('Use SQLite data/orig/gb_parsing.db via bible_study DB loader; set preferJson:true only for debug.'));
  }

  global.LazyDataLoader = {
    loadJson: loadJson,
    loadGbParsing: loadGbParsing,
    clearCache: function () { cache = Object.create(null); }
  };
})(typeof window !== 'undefined' ? window : this);
