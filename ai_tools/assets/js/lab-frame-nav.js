/**
 * Bible 100 AI Lab — 在 ai_lab.html 的 contentFrame 內導航（file:// 下 target 常失效）
 * 路徑一律相對於 ai_tools/（與 ai_lab.html 同層），例如 dashboard.html、pages/ai_qa_system.html
 */
(function () {
  'use strict';

  function setFrameLocation(win, relUrl) {
    try {
      var fr = win.frames && win.frames['contentFrame'];
      if (fr && fr.location) {
        fr.location.href = relUrl;
        return true;
      }
    } catch (e) {}
    try {
      var el = win.document.getElementById('contentFrame');
      if (el) {
        el.src = relUrl;
        return true;
      }
    } catch (e2) {}
    return false;
  }

  /**
   * 偵測：是否在「左欄側欄」iframe。
   * file:// 下 frameElement 有時為 null，改由父文件比對哪個 iframe 的 contentWindow 是本視窗。
   */
  function isInLeftSidebarIframe() {
    try {
      var fe = window.frameElement;
      if (fe) {
        var id0 = (fe.getAttribute('id') || '').toLowerCase();
        var nm0 = (fe.getAttribute('name') || '').toLowerCase();
        var src0 = (fe.getAttribute('src') || '').toLowerCase();
        if (id0 === 'sidebarframe' || id0 === 'labsidebarframe' || nm0 === 'sidebarframe') return true;
        if (src0.indexOf('sidebar_lab') !== -1 || src0.indexOf('sidebar.html') !== -1) return true;
      }
    } catch (e0) {}
    try {
      if (window === window.top) return false;
      var p = window.parent;
      if (!p || !p.document) return false;
      var ifs = p.document.getElementsByTagName('iframe');
      for (var i = 0; i < ifs.length; i++) {
        try {
          if (ifs[i].contentWindow !== window) continue;
          var id = (ifs[i].id || '').toLowerCase();
          var nm = (ifs[i].name || '').toLowerCase();
          var src = String(ifs[i].src || '').toLowerCase();
          if (id.indexOf('sidebar') !== -1 || nm.indexOf('sidebar') !== -1) return true;
          if (src.indexOf('sidebar_lab') !== -1 || src.indexOf('sidebar.html') !== -1) return true;
        } catch (e2) {}
      }
    } catch (e3) {}
    /* 父頁有 #contentFrame 且本視窗不是右欄 → 視為左欄（雙 iframe 殼） */
    try {
      if (window === window.top) return false;
      var p2 = window.parent;
      if (!p2 || !p2.document) return false;
      var cfEl = p2.document.getElementById('contentFrame');
      if (!cfEl) return false;
      try {
        if (cfEl.contentWindow === window) return false;
      } catch (eCw) {}
      var ifs2 = p2.document.getElementsByTagName('iframe');
      for (var j = 0; j < ifs2.length; j++) {
        try {
          if (ifs2[j].contentWindow === window) return true;
        } catch (eJ) {}
      }
    } catch (eP) {}
    return false;
  }

  /** 將 ai_tools 相對路徑轉成給 contentFrame 用的絕對 file:/https: URL */
  function resolveUrlUnderAiTools(u) {
    u = String(u || '').trim().replace(/^[\\/]+/, '').replace(/^ai_tools\/?/i, '');
    if (!u) u = 'ai_lab_landing.html';
    try {
      if (window.parent && typeof window.parent.labResolveAiToolsUrl === 'function') {
        return window.parent.labResolveAiToolsUrl(u);
      }
    } catch (e0) {}
    try {
      var ph = String(window.parent.location.href).replace(/\\/g, '/');
      var low = ph.toLowerCase();
      var marker = '/ai_tools/';
      var idx = low.lastIndexOf(marker);
      if (idx !== -1) {
        return ph.slice(0, idx + marker.length) + u.replace(/\\/g, '/');
      }
      var slash = ph.lastIndexOf('/');
      var dir = slash >= 0 ? ph.slice(0, slash + 1) : ph + '/';
      return dir + 'ai_tools/' + u.replace(/\\/g, '/');
    } catch (e1) {
      return u;
    }
  }

  var BIBLE100_SIDEBAR_NAV = 'bible100-sidebar-content-nav';

  /**
   * 以絕對 URL 載入父頁右欄。
   * @param {boolean} forceNotify - 側欄觸發時為 true：file:// 下改 src 有時被靜默忽略，一律再送 postMessage 讓父頁接球。
   */
  function setParentContentFrameAbsoluteUrl(absUrl, forceNotify) {
    var url = String(absUrl || '').trim();
    if (!url) return false;
    var notify = !!forceNotify;
    try {
      var p = window.parent;
      if (!p || p === window) return false;
      var ok = false;
      try {
        var el = p.document.getElementById('contentFrame');
        if (el) {
          el.setAttribute('src', url);
          el.src = url;
          ok = true;
        }
      } catch (e1) {}
      if (!ok) {
        try {
          var fr = p.frames && p.frames['contentFrame'];
          if (fr) {
            fr.location.href = url;
            ok = true;
          }
        } catch (e2) {}
      }
      if (notify || !ok) {
        try {
          p.postMessage({ type: BIBLE100_SIDEBAR_NAV, url: url }, '*');
        } catch (e3) {}
      }
      return true;
    } catch (e) {
      try {
        var p3 = window.parent;
        if (p3 && p3 !== window) {
          p3.postMessage({ type: BIBLE100_SIDEBAR_NAV, url: url }, '*');
        }
      } catch (e4) {}
      return false;
    }
  }

  /** 從側欄頁導向父層右欄 contentFrame（避免 labNavStandalone 把整個側欄換成內容頁 →「字變超大」） */
  function navigateParentContentFrame(relUrl) {
    var u = String(relUrl || '').replace(/^[\\/]+/, '');
    try {
      if (!window.parent || window.parent === window) return false;
      if (!isInLeftSidebarIframe()) return false;
      var full = resolveUrlUnderAiTools(u);
      return setParentContentFrameAbsoluteUrl(full, true);
    } catch (e) {
      return false;
    }
  }

  /** 無殼時：從 pages/*.html 開啟 ai_tools 根下檔案需 ../ */
  function labNavStandalone(relUrl) {
    var u = String(relUrl || '').replace(/^[\\/]+/, '');
    try {
      if (isInLeftSidebarIframe() && navigateParentContentFrame(u)) return;
    } catch (e0) {}
    var cur = '';
    try {
      cur = window.location.href || '';
    } catch (e0) {}
    var inPages = /[\\/]pages[\\/]/i.test(cur);
    if (!inPages) {
      window.location.href = u;
      return;
    }
    if (u.indexOf('pages/') === 0) {
      window.location.href = '../' + u;
      return;
    }
    if (
      /^(vision|dashboard|ethics_ai|ai_lab|ai_lab_landing|index|404)\.html$/i.test(u) ||
      u.indexOf('paths/') === 0 ||
      u.indexOf('resources/') === 0 ||
      u.indexOf('guides/') === 0 ||
      u.indexOf('functions/') === 0 ||
      u.indexOf('tools/') === 0 ||
      u.indexOf('_landing/') === 0
    ) {
      window.location.href = '../' + u;
      return;
    }
    window.location.href = u;
  }

  /** 由子頁呼叫：導向父層 Lab 的 contentFrame（路徑相對 ai_tools/） */
  window.labNav = function (relUrl) {
    var u = String(relUrl || '').replace(/^[\\/]+/, '');
    try {
      if (isInLeftSidebarIframe() && navigateParentContentFrame(u)) return;
    } catch (eNav0) {}
    try {
      if (window.parent && window.parent !== window && typeof window.parent.labLoadContent === 'function') {
        try {
          window.parent.labLoadContent(u);
        } catch (eLoad) {
          if (!navigateParentContentFrame(u)) throw eLoad;
        }
        return;
      }
    } catch (e1) {
      if (navigateParentContentFrame(u)) return;
    }
    try {
      if (window.parent && window.parent !== window && typeof window.parent.labResolveAiToolsUrl === 'function') {
        var full = window.parent.labResolveAiToolsUrl(u);
        if (setFrameLocation(window.parent, full)) return;
      }
    } catch (e1b) {}
    try {
      if (window.top && window.top !== window && typeof window.top.labLoadContent === 'function') {
        window.top.labLoadContent(u);
        return;
      }
    } catch (e3) {}
    try {
      if (window.top && window.top !== window && typeof window.top.labResolveAiToolsUrl === 'function') {
        var fullT = window.top.labResolveAiToolsUrl(u);
        if (setFrameLocation(window.top, fullT)) return;
      }
    } catch (e3b) {}
    if (navigateParentContentFrame(u)) return;
    labNavStandalone(u);
  };

  /**
   * file:// 下 new URL 偶發失敗或 pathname 不含 /ai_tools/：改用手動拼路徑（相對於 ai_tools/）
   */
  function pathRelativeToAiTools(href, baseHref) {
    var h = String(href || '').trim();
    if (!h || h.indexOf('javascript:') === 0) return null;
    var hashIdx = h.indexOf('#');
    var hash = hashIdx >= 0 ? h.slice(hashIdx) : '';
    var pathPart = hashIdx >= 0 ? h.slice(0, hashIdx) : h;
    if (!pathPart || pathPart === '#') return null;
    /* 由 ai_tools 內連到 ../help 等：相對路徑演算法會錯位，改由外層用絕對 URL 載入 contentFrame */
    if (/^\.\.(\/|\\)/.test(pathPart) || pathPart === '..') return null;
    var base = String(baseHref || '').replace(/\\/g, '/');
    var lower = base.toLowerCase();
    var needle = '/ai_tools/';
    var q = lower.indexOf(needle);
    if (q === -1) {
      needle = 'ai_tools/';
      q = lower.indexOf(needle);
      if (q === -1) return null;
    }
    var after = base.slice(q + needle.length);
    var dir = after.replace(/[^/]+$/, '');
    var combined = dir + pathPart.replace(/\\/g, '/');
    var parts = combined.split('/');
    var stack = [];
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (p === '..') {
        if (stack.length) stack.pop();
      } else if (p && p !== '.') stack.push(p);
    }
    return stack.join('/') + hash;
  }

  /** 將目前頁面的 a[href] 轉成 ai_tools/ 相對路徑（供 contentFrame 使用） */
  function hrefToAiToolsRelative(href, baseHref) {
    if (!href) return null;
    var h = String(href).trim();
    if (!h || h.indexOf('javascript:') === 0 || h === '#' || (h.indexOf('#') === 0 && h.indexOf('/') === -1)) return null;
    if (/^https?:/i.test(h) || h.indexOf('//') === 0) return null;
    try {
      var resolved = new URL(href, baseHref);
      var path = resolved.pathname.replace(/\\/g, '/');
      var lower = path.toLowerCase();
      var idx = lower.indexOf('/ai_tools/');
      if (idx !== -1) {
        return path.slice(idx + '/ai_tools/'.length) + resolved.search + resolved.hash;
      }
      var m = path.match(/[/\\]ai_tools[/\\](.+)$/i);
      if (m) return m[1].replace(/\\/g, '/') + resolved.search + resolved.hash;
    } catch (err) {}
    return pathRelativeToAiTools(href, baseHref);
  }

  /** file:／Windows 下路徑格式多變：用完整 href 字串尋找 /ai_tools/ 後綴 */
  function fallbackHrefToAiToolsRelative(href, baseHref) {
    try {
      var resolved = new URL(href, baseHref);
      var full = String(resolved.href).replace(/\\/g, '/');
      var low = full.toLowerCase();
      var key = '/ai_tools/';
      var idx = low.lastIndexOf(key);
      if (idx === -1) return null;
      return full.slice(idx + key.length);
    } catch (err) {
      return null;
    }
  }

  function isLabShellWindow(win) {
    try {
      return (
        win &&
        typeof win.labLoadContent === 'function' &&
        win.frames &&
        win.frames['contentFrame']
      );
    } catch (e) {
      return false;
    }
  }

  /** 殼頁本身（ai_lab.html）、或殼內子頁（可呼叫 parent.labLoadContent） */
  function labShellAvailable() {
    try {
      if (isLabShellWindow(window)) return true;
    } catch (e0) {}
    try {
      if (window.parent && window.parent !== window && typeof window.parent.labLoadContent === 'function') return true;
    } catch (e) {}
    try {
      if (window.top && window.top !== window && typeof window.top.labLoadContent === 'function') return true;
    } catch (e2) {}
    try {
      if (window.parent && window.parent !== window && window.parent.frames && window.parent.frames['contentFrame']) return true;
    } catch (e3) {}
    try {
      if (window.top && window.top !== window && window.top.frames && window.top.frames['contentFrame']) return true;
    } catch (e4) {}
    return false;
  }

  document.addEventListener(
    'click',
    function (e) {
      var a = e.target && e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      if (a.getAttribute('target') !== 'contentFrame') return;

      var raw = a.getAttribute('href');
      if (!raw || raw.indexOf('javascript:') === 0) return;

      var inSidebar = isInLeftSidebarIframe();
      if (!inSidebar && !labShellAvailable()) return;

      var rawTrim = String(raw).trim();
      if (/^https?:/i.test(rawTrim) || rawTrim.indexOf('//') === 0) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        setParentContentFrameAbsoluteUrl(rawTrim, inSidebar);
        return;
      }

      var labPath =
        hrefToAiToolsRelative(raw, window.location.href) ||
        fallbackHrefToAiToolsRelative(raw, window.location.href);

      if (!labPath) {
        if (!inSidebar) return;
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        try {
          setParentContentFrameAbsoluteUrl(new URL(raw, window.location.href).href, true);
        } catch (eFull) {}
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();

      if (inSidebar) {
        setParentContentFrameAbsoluteUrl(resolveUrlUnderAiTools(labPath), true);
        return;
      }

      try {
        if (isLabShellWindow(window)) {
          window.labLoadContent(labPath);
          return;
        }
      } catch (e1) {}
      window.labNav(labPath);
    },
    true
  );
})();
