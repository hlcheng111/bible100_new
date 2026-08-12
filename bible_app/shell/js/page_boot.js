/** 賽道子頁：與殼共用資源版本號 + 載入 live_db_bridge / page_nav_bar */
(function (global) {
  global.B100_SHELL_ASSET_V = global.B100_SHELL_ASSET_V || '20260813dbfix';
  try {
    var scripts = global.document.getElementsByTagName('script');
    var me = scripts[scripts.length - 1];
    if (me && me.src) {
      var base = me.src.replace(/[#?].*$/, '').replace(/\/[^/]+$/, '/');
      var v = encodeURIComponent(global.B100_SHELL_ASSET_V);
      if (!global.B100LiveDb) {
        global.document.write('<script src="' + base + 'live_db_bridge.js?v=' + v + '"><\/script>');
      }
      if (!global.B100PageNav) {
        global.document.write('<script src="' + base + 'page_nav_bar.js?v=' + v + '"><\/script>');
      }
      if (!global.__B100_LIVE_DB_PATCH__) {
        global.document.write('<script src="' + base + 'live_db_cloud_patch.js?v=' + v + '"><\/script>');
      }
    }
  } catch (eBridge) {}
  try {
    if (global.B100LiveDb && !global.B100LiveDb.__cloudDbPatch) {
      global.B100LiveDb.__cloudDbPatch = true;
      global.B100LiveDb.isLive = function () {
        var base = global.B100LiveDb.getLiveBase && global.B100LiveDb.getLiveBase();
        return !!base;
      };
      global.B100LiveDb.getDbBase = function () {
        var base = global.B100LiveDb.getLiveBase && global.B100LiveDb.getLiveBase();
        if (!base) return null;
        return base + '/bible_app/app/assets/bible/';
      };
    }
    global.__B100_LIVE_DB_PATCH__ = true;
  try {
    if (global.parent !== global) {
      global.document.documentElement.classList.add('in-shell-iframe');
    }
  } catch (eIf) {
    global.document.documentElement.classList.add('in-shell-iframe');
  }
  global.b100AssetUrl = function (rel) {
    var v = global.B100_SHELL_ASSET_V || '1';
    return rel + (rel.indexOf('?') >= 0 ? '&' : '?') + 'v=' + encodeURIComponent(v);
  };
})(typeof window !== 'undefined' ? window : global);
