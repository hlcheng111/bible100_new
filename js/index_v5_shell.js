(function (global) {
  'use strict';

  function Bible100Shell() {
    this.modes = [];
    this.modules = [];
    this.languages = [];
    this.langMap = {};
    this.config = {};
    this.loadConfig();
  }

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
    var sep = url.indexOf('?') >= 0 ? '&' : '?';
    return url + sep + 'v=' + Date.now();
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
    if (path.indexOf('bible_study/') === 0) return 'bible_study/sidebar.html';
    if (path.indexOf('school_management/') === 0) return 'school_management/sidebar.html';
    if (path.indexOf('church_planning/') === 0) return 'church_planning/sidebar_plan.html';
    if (path.indexOf('church_ministry/') === 0) return 'church_ministry/sidebar.html';
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
    if (sidebarFrame) {
      sidebarFrame.src = sidebarUrl ? this.addCacheBust(sidebarUrl) : 'about:blank';
    }
    if (contentFrame) {
      contentFrame.src = contentUrl ? this.addCacheBust(contentUrl) : 'about:blank';
    }
  };

  Bible100Shell.prototype.loadSecondaryNavItem = function (item) {
    if (!item) return;
    document.body.classList.remove('mode-hymn-embed', 'mode-module-shell-embed');

    if (item.action === 'home') {
      if (typeof global.applyMode === 'function') global.applyMode('material');
      return;
    }

    if (item.mode) {
      if (typeof global.applyMode === 'function') global.applyMode(item.mode);
      return;
    }

    if (item.hymnEmbed || item.path === 'hymn_management/index.html') {
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
    this.loadFrames(moduleDef.sidebar || 'about:blank', moduleDef.path || 'about:blank');
  };

  Bible100Shell.prototype.loadLanguage = function (languageCode) {
    var lang = this.getLanguageByCode(languageCode);
    if (!lang) {
      console.warn('Bible100Shell language not found:', languageCode);
      return;
    }
    this.showLoading('切換語言…');
    this.loadFrames(lang.sidebar, lang.landing);
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
