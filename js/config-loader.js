/**
 * Bible100 Config Loader
 * 載入 config/modules.json, paths.json, languages.json
 * 供 index.html 及各模組動態讀取路徑與設定
 */
(function (global) {
  'use strict';

  var cache = {};
  var basePath = '';

  function isFileProtocol() {
    return typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';
  }

  function getBasePath() {
    if (basePath) return basePath;
    var path = (window.location.pathname || '').replace(/\\/g, '/').replace(/\/$/, '') || '/';
    if (isFileProtocol()) {
      basePath = path.replace(/\/[^/]*$/, '') || '/';
      return basePath;
    }
    var idx = path.indexOf('bible100_new');
    if (idx >= 0) path = path.slice(0, idx + 12);
    else if (path.indexOf('/church_ministry/') >= 0) path = path.split('/church_ministry/')[0];
    else if (path.indexOf('/school_management/') >= 0) path = path.split('/school_management/')[0];
    else if (path.indexOf('/ai_tools/') >= 0) path = path.split('/ai_tools/')[0];
    else if (path.indexOf('/bible_study/') >= 0) path = path.split('/bible_study/')[0];
    else if (path.indexOf('/languages/') >= 0) path = path.split('/languages/')[0];
    else path = path.replace(/\/[^/]+$/, '') || '';
    basePath = path;
    return basePath;
  }

  function resolveConfigPath(name) {
    var base = getBasePath();
    if (base && !/\/$/.test(base)) base += '/';
    return (base || '') + 'config/' + name;
  }

  function fetchJson(name) {
    if (cache[name]) return Promise.resolve(cache[name]);
    if (isFileProtocol() && global.BIBLE100_EMBEDDED_CONFIG && global.BIBLE100_EMBEDDED_CONFIG[name]) {
      cache[name] = global.BIBLE100_EMBEDDED_CONFIG[name];
      return Promise.resolve(cache[name]);
    }
    return fetch(resolveConfigPath(name))
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (data) {
        cache[name] = data;
        return data;
      })
      .catch(function () { return {}; });
  }

  function applyLocalLanguageFilter(cfg) {
    return fetchJson('local-languages.override.json').catch(function () {
      return fetchJson('local-languages.json');
    }).then(function (local) {
      if (!cfg || !cfg.supported || !local || !local.enabledOnly || !local.enabledOnly.length) {
        return cfg;
      }
      var allow = {};
      local.enabledOnly.forEach(function (c) { allow[c] = true; });
      return {
        supported: cfg.supported.filter(function (l) { return allow[l.code]; }),
        _localFilter: local.enabledOnly
      };
    }).catch(function () { return cfg; });
  }

  var ConfigLoader = {
    getModules: function () { return fetchJson('modules.json'); },
    getPaths: function () { return fetchJson('paths.json'); },
    getModes: function () { return fetchJson('modes.json'); },
    getLanguages: function () {
      return fetchJson('languages.json').then(applyLocalLanguageFilter);
    },
    getLocalLanguagePolicy: function () {
      return fetchJson('local-languages.override.json').catch(function () {
        return fetchJson('local-languages.json');
      });
    },
    getLangMap: function () {
      return this.getLanguages().then(function (cfg) {
        if (!cfg || !cfg.supported) return null;
        var map = {};
        cfg.supported.forEach(function (l) {
          map[l.code] = { page: l.sidebar, first: l.landing };
        });
        return map;
      });
    }
  };

  global.ConfigLoader = global.Bible100Config = ConfigLoader;
})(typeof window !== 'undefined' ? window : this);
