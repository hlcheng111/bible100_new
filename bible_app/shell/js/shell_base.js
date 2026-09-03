/** 殼根路徑（由 index.html 內嵌腳本設定 B100_SHELL_ROOT） */
(function (global) {
  function shellRoot() {
    if (global.B100_SHELL_ROOT) return global.B100_SHELL_ROOT;
    var p = location.pathname.replace(/\\/g, '/');
    var idx = p.toLowerCase().indexOf('/shell');
    if (idx >= 0) return p.slice(0, idx) + '/shell/';
    return p.slice(0, p.lastIndexOf('/') + 1);
  }

  global.B100ShellPaths = {
    root: shellRoot,
    page: function (rel) {
      rel = String(rel || '').replace(/^\//, '');
      var root = global.B100_SHELL_ROOT;
      if (root && String(root).indexOf('://') >= 0) {
        try {
          return new URL(rel, root).href;
        } catch (eUrl) {}
      }
      var base = shellRoot();
      if (String(base).indexOf('://') >= 0) {
        try {
          return new URL(rel, base).href;
        } catch (eBase) {}
      }
      if (base.slice(-1) !== '/') base += '/';
      return base + rel;
    },
  };
})(window);
