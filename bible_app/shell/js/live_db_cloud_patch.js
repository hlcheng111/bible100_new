/** Cloud-safe patch: old live_db_bridge treated http(s) as "live" with null base. */
(function (global) {
  'use strict';
  var db = global.B100LiveDb;
  if (!db || db.__cloudDbPatch) return;
  db.__cloudDbPatch = true;
  db.isLive = function () {
    var base = db.getLiveBase && db.getLiveBase();
    return !!base;
  };
  db.getDbBase = function () {
    var base = db.getLiveBase && db.getLiveBase();
    if (!base) return null;
    return base + '/bible_app/app/assets/bible/';
  };
})(typeof window !== 'undefined' ? window : global);
