/**
 * 側欄／內容頁在「殼」內時，攔截 target=contentFrame 的站內連結，改由父層右欄載入。
 * file:/// 下 Chrome 對 postMessage／target=name 行為不一致，故順序：
 * 1) 同源時直接 parent.frames['contentFrame'].location（最穩）
 * 2) postMessage → 父頁 index 監聽 navigate
 * 3) 讀取父 document 的 iframe#contentFrame 設 src
 *
 * 父頁 smart_ministry/index.html：postMessage({ type: 'navigate', url }, '*')
 */
(function () {
  "use strict";

  function bust(url) {
    if (!url) return url;
    var hash = "";
    var h = url.indexOf("#");
    if (h >= 0) {
      hash = url.slice(h);
      url = url.slice(0, h);
    }
    var sep = url.indexOf("?") >= 0 ? "&" : "?";
    return url + sep + "v=" + Date.now() + hash;
  }

  function getContentFrameEl() {
    try {
      if (window.parent && window.parent !== window) {
        var d = window.parent.document;
        if (d) {
          var el = d.getElementById("contentFrame");
          if (el) return el;
        }
        if (window.parent.frames && window.parent.frames["contentFrame"]) {
          return window.parent.frames["contentFrame"].frameElement || null;
        }
      }
    } catch (e) {
      /* file:// 下可能無法讀 parent.document */
    }
    return null;
  }

  function shouldHandle(a) {
    var href = a.getAttribute("href");
    if (!href || href === "#" || href.indexOf("javascript:") === 0) return false;
    var lower = href.toLowerCase();
    if (
      lower.indexOf("http://") === 0 ||
      lower.indexOf("https://") === 0 ||
      lower.indexOf("mailto:") === 0 ||
      lower.indexOf("tel:") === 0
    ) {
      return false;
    }
    var t = (a.getAttribute("target") || "").toLowerCase();
    if (t === "_parent" || t === "_top" || t === "_blank") return false;
    if (t && t !== "contentframe") return false;
    return true;
  }

  function resolveUrl(href) {
    try {
      return new URL(href, window.location.href).href;
    } catch (e) {
      return href;
    }
  }

  /**
   * @returns {boolean} 是否已成功攔截（呼叫方應 preventDefault）
   */
  function navigateToContentFrame(resolvedUrl) {
    /* 1) Frames API：file:/// 下通常比 postMessage 可靠 */
    try {
      if (window.parent && window.parent !== window) {
        var cfWin = window.parent.frames["contentFrame"];
        if (cfWin && cfWin.location) {
          cfWin.location.href = bust(resolvedUrl);
          return true;
        }
      }
    } catch (e1) {
      /* 若仍擋跨文件，改下列方式 */
    }

    /* 2) postMessage */
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "navigate", url: resolvedUrl }, "*");
        return true;
      }
    } catch (e2) {}

    /* 3) 直接設 iframe 元素 src */
    try {
      var frame = getContentFrameEl();
      if (frame && (frame.tagName === "IFRAME" || frame.tagName === "FRAME")) {
        frame.src = bust(resolvedUrl);
        return true;
      }
    } catch (e3) {}

    return false;
  }

  document.addEventListener(
    "click",
    function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!a || a.getAttribute("data-skip-iframe-nav") === "true") return;
      if (!shouldHandle(a)) return;

      var raw = a.getAttribute("href");
      var url = resolveUrl(raw);

      if (navigateToContentFrame(url)) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );
})();
