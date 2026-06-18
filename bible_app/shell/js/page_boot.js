/** 賽道子頁：與殼共用資源版本號 */
(function (global) {
  global.B100_SHELL_ASSET_V = global.B100_SHELL_ASSET_V || '20260618f';
  global.b100AssetUrl = function (rel) {
    var v = global.B100_SHELL_ASSET_V || '1';
    return rel + (rel.indexOf('?') >= 0 ? '&' : '?') + 'v=' + encodeURIComponent(v);
  };
})(typeof window !== 'undefined' ? window : global);
