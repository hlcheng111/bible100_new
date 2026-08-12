(function (global) {
  'use strict';

  function b100SanitizeContentUrl(url, fallback) {
    if (!url) return url;
    if (global.CmZoneNavSsot && global.CmZoneNavSsot.sanitizeContentUrl) {
      url = global.CmZoneNavSsot.sanitizeContentUrl(url, fallback);
    }
    if (global.B100ModuleNavSsot) {
      if (global.B100ModuleNavSsot.isModuleShellUrl && global.B100ModuleNavSsot.isModuleShellUrl(url)) {
        var sh = global.B100ModuleNavSsot.recoverModuleShellInContent(url);
        if (sh && sh.contentUrl) url = sh.contentUrl;
      }
      if (global.B100ModuleNavSsot.sanitizeContentUrl) {
        url = global.B100ModuleNavSsot.sanitizeContentUrl(url, fallback);
      }
    }
    return url;
  }

  function Bible100Shell() {
    this.modes = [];
    this.modules = [];
    this.languages = [];
    this.langMap = {};
    this.config = {};
    this.bootstrapEmbeddedSync();
    this.loadConfig();
  }

  /** file:// 下立即注入 embedded，避免頂欄第二列（A–G）在 async 完成前空白 */
  Bible100Shell.prototype.bootstrapEmbeddedSync = function () {
    try {
      var emb = typeof global !== 'undefined' && global.BIBLE100_EMBEDDED_CONFIG;
      if (!emb) return;
      if (emb['modes.json']) {
        this.config.modes = emb['modes.json'];
        this.modes = (emb['modes.json'].modes || []).slice();
      }
      if (emb['modules.json']) {
        this.config.modules = emb['modules.json'];
        this.modules = (emb['modules.json'].modules || []).slice();
      }
      if (emb['languages.json']) {
        this.config.languages = emb['languages.json'];
        this.languages = (emb['languages.json'].supported || []).slice();
        this.langMap = this.languages.reduce(function (map, lang) {
          map[lang.code] = lang;
          return map;
        }, {});
      }
    } catch (eBoot) { /* ignore */ }
  };

  Bible100Shell.prototype.loadConfig = function () {
    var self = this;
    return Promise.all([
      ConfigLoader.getModes(),
      ConfigLoader.getModules(),
      ConfigLoader.getLanguages()
    ]).then(function (results) {
      self.config.modes = results[0] || {};
      self.config.modules = results[1] || {};
      self.config.languages = results[2] || {};
      self.modes = self.config.modes.modes || [];
      self.modules = self.config.modules.modules || [];
      self.languages = self.config.languages.supported || [];
      self.langMap = self.languages.reduce(function (map, lang) {
        map[lang.code] = lang;
        return map;
      }, {});
      return self.config;
    }).catch(function (err) {
      console.warn('Bible100Shell cannot load config:', err);
      return {};
    });
  };

  Bible100Shell.prototype.getModeById = function (modeId) {
    return this.modes.find(function (mode) { return mode.id === modeId; }) || null;
  };

  Bible100Shell.prototype.getModeConfig = function (modeId) {
    return this.getModeById(modeId);
  };

  Bible100Shell.prototype.getSecondaryNav = function (modeId) {
    var mode = this.getModeConfig(modeId);
    return mode && Array.isArray(mode.secondaryNav) ? mode.secondaryNav : [];
  };

  Bible100Shell.prototype.getModuleById = function (moduleId) {
    return this.modules.find(function (module) { return module.id === moduleId; }) || null;
  };

  Bible100Shell.prototype.getLanguageByCode = function (code) {
    return this.langMap[code] || null;
  };

  Bible100Shell.prototype.getFirstModuleForMode = function (modeId) {
    var mode = this.getModeById(modeId);
    if (!mode || !mode.moduleIds || !mode.moduleIds.length) return null;
    return this.getModuleById(mode.moduleIds[0]) || null;
  };

  Bible100Shell.prototype.addCacheBust = function (url) {
    if (!url) return url;
    var out = url;
    try {
      if (global.B100ChromeI18n && global.B100ChromeI18n.appendLocale) {
        if (/church_ministry\//.test(out) || /bible_app\//.test(out)) {
          out = global.B100ChromeI18n.appendLocale(out);
        }
      }
    } catch (eLoc) {}
    var sep = out.indexOf('?') >= 0 ? '&' : '?';
    return out + sep + 'v=' + Date.now();
  };

  Bible100Shell.prototype.showLoading = function (message) {
    if (window.frameManager && typeof window.frameManager.showLoading === 'function') {
      window.frameManager.showLoading(message || '載入中…');
      return;
    }
    var overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      var textEl = document.getElementById('loadingText');
      if (textEl) textEl.textContent = message || '載入中…';
      overlay.classList.add('active');
    }
  };

  Bible100Shell.prototype.resolveNavPath = function (item) {
    if (!item || !item.path) return '';
    var path = item.path;
    if (item.appendChurchId && typeof global.appendChurchId === 'function') {
      path = global.appendChurchId(path);
    }
    return path;
  };

  Bible100Shell.prototype.resolveSidebarForNavItem = function (item) {
    if (!item) return 'about:blank';
    if (item.sidebar !== undefined && item.sidebar !== null) return item.sidebar;
    if (item.moduleId) {
      var mod = this.getModuleById(item.moduleId);
      if (mod && mod.sidebar) return mod.sidebar;
    }
    var path = item.path || '';
    if (path.indexOf('bible_study/') === 0) {
      if (global.B100ModuleNavSsot && global.B100ModuleNavSsot.sidebarUrlForZone) {
        var studyZone = global.B100ModuleNavSsot.detectZoneFromPath('study', path);
        return global.B100ModuleNavSsot.sidebarUrlForZone('study', studyZone);
      }
      return 'bible_study/sidebar.html';
    }
    if (path.indexOf('school_management/') === 0) {
      if (global.B100ModuleNavSsot && global.B100ModuleNavSsot.sidebarUrlForZone) {
        var schoolZone = global.B100ModuleNavSsot.detectZoneFromPath('school', path);
        return global.B100ModuleNavSsot.sidebarUrlForZone('school', schoolZone);
      }
      return 'school_management/sidebar.html';
    }
    if (path.indexOf('church_planning/') === 0) return 'church_planning/sidebar_plan_v5_preview.html';
    if (path.indexOf('church_ministry/') === 0) {
      if (item.sidebar) return item.sidebar;
      if (path.indexOf('education-integrated') >= 0) {
        return 'church_ministry/sidebar_church_layout_v1.html?focus=c';
      }
      if (global.CmZoneNavSsot && global.CmZoneNavSsot.ZONES) {
        for (var zi = 0; zi < global.CmZoneNavSsot.ZONES.length; zi++) {
          var z = global.CmZoneNavSsot.ZONES[zi];
          if (z.landing === path && z.sidebar) return z.sidebar;
        }
      }
      return 'church_ministry/sidebar_church_layout_v1.html';
    }
    if (path.indexOf('smart_ministry/') === 0) return 'smart_ministry/sidebar.html';
    if (path.indexOf('disciple_dynamics/') === 0) return 'disciple_dynamics/sidebar.html';
    if (path.indexOf('nav_hub/') === 0) return 'nav_hub/sidebar.html';
    if (path.indexOf('ai_tools/') === 0) return 'ai_tools/sidebar.html';
    return 'about:blank';
  };

  Bible100Shell.prototype.applyModeLayout = function (mode) {
    document.body.classList.remove('mode-hymn-embed', 'mode-module-shell-embed');
    if (!mode) return;
    var layout = mode.layout || (mode.defaultEntry && mode.defaultEntry.layout);
    if (layout === 'module-shell-embed') document.body.classList.add('mode-module-shell-embed');
    if (layout === 'hymn-embed') document.body.classList.add('mode-hymn-embed');
  };

  Bible100Shell.prototype.loadFrames = function (sidebarUrl, contentUrl) {
    var sidebarFrame = document.getElementById('sidebarFrame');
    var contentFrame = document.getElementById('contentFrame');
    if (contentUrl) {
      contentUrl = b100SanitizeContentUrl(
        contentUrl,
        'church_ministry/_landing/gateway.html'
      );
    }
    if (sidebarFrame) {
      sidebarFrame.src = sidebarUrl ? this.addCacheBust(sidebarUrl) : 'about:blank';
    }
    if (contentFrame) {
      contentFrame.src = contentUrl ? this.addCacheBust(contentUrl) : 'about:blank';
    }
  };

  Bible100Shell.prototype.itemToNavOpts = function (item, contextMode) {
    if (!item) return {};
    if (item.action === 'home') return { action: 'siteHome' };
    if (item.mode) return { mode: item.mode };

    if (item.hymnEmbed || item.path === 'hymn_management/index.html' || item.path === 'hymn_management/hymn/index.html') {
      return { contentUrl: 'hymn_management/index.html', sidebarUrl: 'about:blank', loading: item.loading || '載入詩歌管理…' };
    }

    var sidebar = item.sidebar !== undefined && item.sidebar !== null
      ? item.sidebar
      : this.resolveSidebarForNavItem(item);

    var opts = {
      mode: item.mode || contextMode || undefined,
      loading: item.loading || (item.labelZh ? item.labelZh + '…' : '載入…')
    };

    if (item.moduleId) {
      var mod = this.getModuleById(item.moduleId);
      if (mod) {
        opts.contentUrl = mod.path;
        opts.sidebarUrl = item.sidebar || mod.sidebar;
      }
      return opts;
    }

    if (item.path) {
      opts.contentUrl = this.resolveNavPath(item);
      var modeId = item.mode || contextMode || '';
      if (modeId && global.B100ModuleNavSsot && global.B100ModuleNavSsot.resolveNavItemPair) {
        var pair = global.B100ModuleNavSsot.resolveNavItemPair(modeId, item);
        if (pair) {
          opts.sidebarUrl = pair.sidebarUrl;
          if (item.moduleNav || (pair.contentUrl && !item.path)) {
            opts.contentUrl = pair.contentUrl;
          }
        } else {
          opts.sidebarUrl = sidebar;
        }
      } else {
        opts.sidebarUrl = sidebar;
      }
      if (opts.contentUrl) {
        opts.contentUrl = b100SanitizeContentUrl(
          opts.contentUrl,
          'church_ministry/_landing/gateway.html'
        );
      }
    }
    return opts;
  };

  Bible100Shell.prototype.loadSecondaryNavItem = function (item, contextMode) {
    if (!item) return;
    if (item.labelShort === 'G' || (item.path && String(item.path).indexOf('church_planning/') === 0)) {
      item = Object.assign({}, item, {
        sidebar: 'church_planning/sidebar_plan_v5_preview.html'
      });
    }
    document.body.classList.remove('mode-hymn-embed', 'mode-module-shell-embed');

    if (item.hymnEmbed || item.path === 'hymn_management/index.html' || item.path === 'hymn_management/hymn/index.html') {
      document.body.classList.add('mode-hymn-embed');
    }

    if (typeof global.navigateShell === 'function') {
      var navOpts = this.itemToNavOpts(item, contextMode);
      if (navOpts.action === 'siteHome') {
        if (typeof global.loadSiteHome === 'function') global.loadSiteHome();
        return;
      }
      if (item.mode && !item.path) {
        if (typeof global.applyMode === 'function') global.applyMode(item.mode);
        return;
      }
      global.navigateShell(navOpts);
      return;
    }

    if (item.action === 'home') {
      if (typeof global.loadSiteHome === 'function') {
        global.loadSiteHome();
      } else if (typeof global.applyMode === 'function') {
        global.applyMode('material');
      }
      return;
    }

    if (item.mode) {
      if (typeof global.applyMode === 'function') global.applyMode(item.mode);
      return;
    }

    if (item.hymnEmbed || item.path === 'hymn_management/index.html' || item.path === 'hymn_management/hymn/index.html') {
      document.body.classList.add('mode-hymn-embed');
      this.showLoading(item.loading || '載入詩歌管理…');
      this.loadFrames('about:blank', 'hymn_management/index.html');
      return;
    }

    this.showLoading(item.loading || (item.label ? item.label + '…' : '載入…'));

    if (item.moduleId) {
      this.loadModuleById(item.moduleId);
      return;
    }

    if (item.path) {
      var path = this.resolveNavPath(item);
      var sidebar = this.resolveSidebarForNavItem(item);
      this.loadFrames(sidebar, path);
    }
  };

  Bible100Shell.prototype.loadModuleById = function (moduleId) {
    var moduleDef = this.getModuleById(moduleId);
    if (!moduleDef) {
      console.warn('Bible100Shell module not found:', moduleId);
      return;
    }
    var contentUrl = moduleDef.path || 'about:blank';
    if (contentUrl) {
      contentUrl = b100SanitizeContentUrl(
        contentUrl,
        'church_ministry/_landing/gateway.html'
      );
    }
    this.loadFrames(moduleDef.sidebar || 'about:blank', contentUrl);
  };

  Bible100Shell.prototype.loadLanguage = function (languageCode) {
    var lang = this.getLanguageByCode(languageCode);
    if (!lang) {
      console.warn('Bible100Shell language not found:', languageCode);
      return;
    }
    var opts = {
      mode: 'material',
      sidebarUrl: lang.sidebar,
      contentUrl: lang.landing,
      loading: '切換語言…'
    };
    if (typeof global.navigateShell === 'function') {
      global.navigateShell(opts);
      return;
    }
    this.showLoading('切換語言…');
    this.loadFrames(opts.sidebarUrl, opts.contentUrl);
  };

  Bible100Shell.prototype.loadMode = function (modeId) {
    var mode = this.getModeConfig(modeId);
    if (!mode) {
      console.warn('Bible100Shell mode not found:', modeId);
      return;
    }

    this.applyModeLayout(mode);

    if (mode.loader === 'qna-v2') {
      if (typeof global.loadQnaV2ContentFrame === 'function') {
        global.loadQnaV2ContentFrame();
      }
      return;
    }

    this.showLoading(mode.loadingMessage || ('載入' + (mode.name || modeId) + '…'));

    if (mode.defaultEntry && mode.defaultEntry.path) {
      this.loadFrames(mode.defaultEntry.sidebar || 'about:blank', mode.defaultEntry.path);
      return;
    }

    var moduleDef = this.getFirstModuleForMode(modeId);
    if (!moduleDef) {
      console.warn('Bible100Shell mode has no default module:', modeId);
      return;
    }
    this.loadModuleById(moduleDef.id);
  };

  Bible100Shell.prototype.buildModeSummary = function () {
    return this.modes.map(function (mode) {
      return {
        id: mode.id,
        name: mode.name,
        description: mode.description,
        moduleIds: (mode.moduleIds || []).slice()
      };
    });
  };

  global.Bible100Shell = new Bible100Shell();
})(typeof window !== 'undefined' ? window : this);
