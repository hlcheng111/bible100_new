/**
 * B100 · 站根路径 → 当前页相对 href（file:// / Hub iframe 可复制打开）
 * SSOT 路径均相对 repo 根（与 index_v5.html 同级），例：bible_study/_landing/home.html
 */
(function (g) {
  "use strict";

  var BUILD = "20260807a";
  var REPO_MARK = "/bible100_new/";

  function normalize(p) {
    return String(p || "")
      .replace(/\\/g, "/")
      .replace(/^\.\//, "");
  }

  /** 当前页在站内的目录，如 bible_study/_landing；根页为空字串 */
  function currentSiteDir() {
    var path = normalize(g.location && g.location.pathname);
    if (!path) return "";

    var low = path.toLowerCase();
    var idx = low.indexOf(REPO_MARK);
    if (idx >= 0) {
      path = path.substring(idx + REPO_MARK.length);
    } else {
      var parts = path.split("/").filter(Boolean);
      if (parts.length && /^[a-z]:$/i.test(parts[0])) parts.shift();
      path = parts.join("/");
    }

    var segs = path.split("/").filter(Boolean);
    if (segs.length && /\.html?$/i.test(segs[segs.length - 1])) segs.pop();
    return segs.join("/");
  }

  /**
   * @param {string} sitePath 站根相对路径
   * @returns {string} 相对当前页的 href
   */
  function siteHref(sitePath) {
    sitePath = normalize(sitePath);
    if (!sitePath || sitePath === "#") return "#";
    if (/^(https?:|mailto:|tel:|file:)/i.test(sitePath)) return sitePath;

    var hash = "";
    var q = sitePath.indexOf("?");
    var h = sitePath.indexOf("#");
    if (h >= 0) {
      hash = sitePath.substring(h);
      sitePath = sitePath.substring(0, h);
    }
    if (q >= 0 && (h < 0 || q < h)) {
      hash = sitePath.substring(q) + hash;
      sitePath = sitePath.substring(0, q);
    }

    var from = currentSiteDir();
    if (!from) return sitePath + hash;

    var fromParts = from.split("/");
    var toParts = sitePath.split("/");
    var file = toParts.pop() || "";
    var i = 0;
    while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) i++;
    var ups = fromParts.length - i;
    var prefix = ups ? "../".repeat(ups) : "./";
    var mid = toParts.slice(i);
    var rel = prefix + (mid.length ? mid.join("/") + "/" : "") + file;
    return rel + hash;
  }

  /** 供侧栏显示：站根路径（固定前缀，方便 file:// 拼接） */
  function sitePathLabel(sitePath) {
    return normalize(sitePath);
  }

  g.B100_sitePath = {
    BUILD: BUILD,
    currentSiteDir: currentSiteDir,
    siteHref: siteHref,
    sitePathLabel: sitePathLabel,
  };
  g.B100_siteHref = siteHref;
})(typeof window !== "undefined" ? window : this);
