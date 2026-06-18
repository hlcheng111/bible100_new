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
      return shellRoot() + rel.replace(/^\//, '');
    },
  };
})(window);
