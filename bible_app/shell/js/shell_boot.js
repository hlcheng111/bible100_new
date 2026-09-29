/**
 * file://：靜默探測本機 HTTP（若有才通知子頁）。不要黃字喊 bat、不要丟假 8080 連結。
 */
(function (global) {
  if (location.protocol !== 'file:') return;
  var L = global.B100LiveDb;
  if (!L || !L.probe) return;
  L.probe(2).then(function (ok) {
    if (ok) L.notifyChildFrames();
  });
})(typeof window !== 'undefined' ? window : globalThis);
