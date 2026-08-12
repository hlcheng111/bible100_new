/**
 * @deprecated 请改加载 js/b100_nav_ssot.js（路线图由 SSOT 自动生成）
 */
(function (g) {
  "use strict";
  if (typeof g.B100_buildRouteMaps === "function") {
    g.B100_ROUTE_MAPS = g.B100_buildRouteMaps();
  } else if (typeof console !== "undefined" && console.warn) {
    console.warn("[B100] Load js/b100_nav_ssot.js before b100_route_maps_data.js");
  }
})(typeof window !== "undefined" ? window : this);
