/**

 * 在 index_v5 雙 iframe 殼內：同時切換 sidebarFrame + contentFrame。

 * 子頁（側欄或內容框）呼叫 bible100ShellNav(ev, { sidebarUrl, contentUrl })。

 * 路徑為相對於 bible100_new 根目錄（與 index_v5.html 同層）。

 * 省略的欄位不會改動對應 iframe。

 * @returns {boolean} 是否已交由殼處理（false 時呼叫方可降級 href）

 */

(function (w) {

  function bust(url) {

    if (!url) return url;

    var hashIdx = url.indexOf('#');

    if (hashIdx >= 0) {

      var base = url.slice(0, hashIdx);

      var hash = url.slice(hashIdx);

      return base + (base.indexOf('?') >= 0 ? '&' : '?') + 'v=' + Date.now() + hash;

    }

    return url + (url.indexOf('?') >= 0 ? '&' : '?') + 'v=' + Date.now();

  }



  /** 根相對路徑 → 從當前頁推算的 file:// / 深層 iframe 可用 URL */

  function resolveToSiteRoot(rel) {

    rel = String(rel || '').replace(/^\/+/, '');

    if (!rel) return rel;

    if (/^https?:\/\//i.test(rel)) return rel;

    try {

      var path = w.location.pathname.replace(/\\/g, '/');

      var idx = path.indexOf('/bible100_new/');

      if (idx >= 0) {

        var root = path.slice(0, idx + '/bible100_new/'.length);

        return root + rel;

      }

      var cm = path.indexOf('/church_ministry/');

      if (cm >= 0) {

        return '../' + rel.replace(/^church_ministry\//, 'church_ministry/');

      }

      var depth = (path.match(/\//g) || []).length - 1;

      var up = depth > 0 ? new Array(depth + 1).join('../') : '';

      return up + rel;

    } catch (e) {

      return rel;

    }

  }



  function findShellDocument() {

    var seen = [];

    var cur = w;

    for (var depth = 0; depth < 8 && cur; depth++) {

      try {

        if (cur.document && seen.indexOf(cur.document) < 0) {

          seen.push(cur.document);

          var sb = cur.document.getElementById('sidebarFrame');

          var cf = cur.document.getElementById('contentFrame');

          if (sb && cf) return { doc: cur.document, sidebar: sb, content: cf, win: cur };

        }

      } catch (errDoc) {}

      try {

        if (!cur.parent || cur.parent === cur) break;

        cur = cur.parent;

      } catch (errPar) {

        break;

      }

    }

    try {

      var top = w.top;

      if (top && top.document && seen.indexOf(top.document) < 0) {

        var sb2 = top.document.getElementById('sidebarFrame');

        var cf2 = top.document.getElementById('contentFrame');

        if (sb2 && cf2) return { doc: top.document, sidebar: sb2, content: cf2, win: top };

      }

    } catch (errTop) {}

    return null;

  }



  function toAbsoluteIframeSrc(url, shellWin) {

    if (!url) return url;

    if (/^https?:\/\//i.test(url) || String(url).indexOf('file:') === 0) return url;

    try {

      return new URL(url, (shellWin || w).location.href).href;

    } catch (eAbs) {

      return url;

    }

  }



  function resolveIframeSrc(url, shellWin) {

    url = String(url || '').replace(/^\.?\//, '');

    if (!url || /^https?:\/\//i.test(url) || /^file:/i.test(url)) return url;

    if (url.indexOf('../') === 0 || url.indexOf('./') === 0) return url;

    try {

      if (w.CmShellPaths && w.CmShellPaths.inCmStandaloneTree && shellWin) {

        try {

          if (w.CmShellPaths.isCmIndexShell(shellWin) && w.CmShellPaths.resolveShellUrl) {

            return w.CmShellPaths.resolveShellUrl(url);

          }

        } catch (eCm) {}

      }

      var path = (shellWin || w).location.pathname.replace(/\\/g, '/');

      if (/\/index_v5\.html$/i.test(path) || /\/bible100_new\/index\.html$/i.test(path)) {

        return url;

      }

      var mod = path.match(/\/([^/]+)\/index\.html$/i);

      if (mod) {

        var prefix = mod[1] + '/';

        if (url.indexOf(prefix) === 0) return url.slice(prefix.length);

        return '../' + url;

      }

    } catch (eR) {}

    return url;

  }



  function parentFrames() {

    var shell = findShellDocument();

    if (!shell) return null;

    return { sidebar: shell.sidebar, content: shell.content, shellWin: shell.win };

  }



  function postShell(sidebarUrl, contentUrl) {

    var payload = {

      type: 'bible100-shell',

      sidebarUrl: sidebarUrl || '',

      contentUrl: contentUrl || ''

    };

    var posted = false;

    try {

      var cur = w;

      for (var depth = 0; depth < 8 && cur; depth++) {

        try {

          if (cur.parent && cur.parent !== cur) {

            cur.parent.postMessage(payload, '*');

            posted = true;

          }

        } catch (errPost) {}

        try {

          if (!cur.parent || cur.parent === cur) break;

          cur = cur.parent;

        } catch (errUp) {

          break;

        }

      }

      if (w.top && w.top !== w) {

        w.top.postMessage(payload, '*');

        posted = true;

      }

    } catch (err) {}

    return posted;

  }



  function postNavigate(url) {

    try {

      if (w.parent && w.parent !== w) {

        w.parent.postMessage({ type: 'navigate', url: url }, '*');

        return true;

      }

    } catch (err2) {}

    return false;

  }



  function inIframe() {

    try {

      return w.parent && w.parent !== w;

    } catch (eIf) {

      return false;

    }

  }



  w.bible100ShellNav = function (ev, opts) {

    if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();

    if (ev && typeof ev.stopPropagation === 'function') ev.stopPropagation();

    opts = opts || {};

    var sb = opts.sidebarUrl || '';

    var cf = opts.contentUrl || '';

    if (!sb && !cf) return false;



    var fr = parentFrames();

    if (fr) {

      var sw = fr.shellWin;

      if (sb) fr.sidebar.src = bust(toAbsoluteIframeSrc(resolveIframeSrc(sb, sw), sw));

      if (cf) fr.content.src = bust(toAbsoluteIframeSrc(resolveIframeSrc(cf, sw), sw));

      return true;

    }



    if (inIframe() && postShell(sb, cf)) return true;

    if (postShell(sb, cf)) return true;



    if (!inIframe()) {

      if (cf) {

        w.location.href = resolveToSiteRoot(cf);

        return true;

      }

      if (sb) {

        w.location.href = resolveToSiteRoot(sb);

        return true;

      }

    }

    return false;

  };



  w.bible100OpenContent = function (ev, url) {

    if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();

    if (!url) return false;

    var fr = parentFrames();

    if (fr) {

      var sw2 = fr.shellWin;

      fr.content.src = bust(toAbsoluteIframeSrc(resolveIframeSrc(url, sw2), sw2));

      return true;

    }

    if (postNavigate(url)) return true;

    if (!inIframe()) {

      w.location.href = resolveToSiteRoot(url);

      return true;

    }

    return false;

  };



  w.bible100ResolveToSiteRoot = resolveToSiteRoot;

  w.bible100ResolveIframeSrc = resolveIframeSrc;

  w.bible100FindShellDocument = findShellDocument;

})(typeof window !== 'undefined' ? window : this);


