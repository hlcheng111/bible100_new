/**
 * 全站靜態資源版本號 — 上云後改此處即可破除 CSS/JS 快取
 */
(function (global) {
  "use strict";
  global.BIBLE100_BUILD_VERSION = "20260605";
  global.bible100CacheBust = function (url) {
    if (!url || url.indexOf("javascript:") === 0 || url.indexOf("#") === 0) return url;
    var v = global.BIBLE100_BUILD_VERSION || String(Date.now());
    return url + (url.indexOf("?") >= 0 ? "&" : "?") + "v=" + encodeURIComponent(v);
  };
  global.bible100AppendQuery = function (url, params) {
    if (!url) return url;
    var parts = [];
    Object.keys(params || {}).forEach(function (k) {
      if (params[k] != null && params[k] !== "") parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(String(params[k])));
    });
    if (!parts.length) return global.bible100CacheBust ? global.bible100CacheBust(url) : url;
    var sep = url.indexOf("?") >= 0 ? "&" : "?";
    return url + sep + parts.join("&");
  };
})(typeof window !== "undefined" ? window : this);
