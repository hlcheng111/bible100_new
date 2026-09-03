// Image Path Rewriter for standalone chapter pages
// file:// 與上云：只用相對路徑；舊共用圖 → ../../../images/image_*；勿寫 {lang}/media/images/image_*
(function () {
  function inChapterTree() {
    return /\/languages\/[^/]+\/(NT|OT|T4)\/(chapters|advance)\//i.test(
      window.location.pathname || ""
    );
  }

  var IMAGES_BASE = inChapterTree() ? "../../../images/" : "../../images/";
  var SHARED_MEDIA_BASE = inChapterTree() ? "../../../media/images/" : "../../media/images/";

  function normalizePath(p) {
    try {
      return decodeURI(p);
    } catch (e) {
      return p;
    }
  }

  function getFileName(p) {
    var s = (p || "").replace(/\\/g, "/");
    var q = s.split("?")[0].split("#")[0];
    var parts = q.split("/");
    return parts[parts.length - 1] || "";
  }

  function rewriteAbsLanguages(src) {
    // /languages/vi/media/images/x → ../../media/images/x（同語章節）
    // /languages/images/image_NT/x → ../../../images/image_NT/x
    var rest = src.slice("/languages/".length).replace(/\\/g, "/");
    var loc = (window.location.pathname || "").replace(/\\/g, "/");
    var mLang = loc.match(/\/languages\/([^/]+)\//i);
    var curLang = mLang ? mLang[1] : "";
    var parts = rest.split("/");
    var first = parts[0] || "";
    if (first === "images" || first === "media") {
      return "../../../" + rest;
    }
    if (curLang && first.toLowerCase() === curLang.toLowerCase()) {
      return "../../" + parts.slice(1).join("/");
    }
    return "../../../" + rest;
  }

  function rewriteOne(img) {
    var raw = img.getAttribute("src") || "";
    var src = normalizePath(raw);
    var lower = src.toLowerCase();

    if (/^https?:\/\//i.test(src)) return;
    if (src.indexOf("//") === 0) {
      img.setAttribute("src", "https:" + src);
      return;
    }

    if (lower.indexOf("/languages/") === 0) {
      var npAbs = rewriteAbsLanguages(src);
      if (img.getAttribute("src") !== npAbs) img.setAttribute("src", npAbs);
      return;
    }

    var hitNT =
      lower.indexOf("bible100_nt/image_nt/") >= 0 ||
      (lower.indexOf("onedrive") >= 0 && lower.indexOf("image_nt/") >= 0) ||
      lower.indexOf("my webs/bible100_nt/image_nt/") >= 0 ||
      lower.indexOf("my%20webs/bible100_nt/image_nt/") >= 0 ||
      /\/image_nt\//i.test(lower);
    var hitOT =
      lower.indexOf("bible100_ot/image_ot/") >= 0 ||
      (lower.indexOf("onedrive") >= 0 && lower.indexOf("image_ot/") >= 0) ||
      lower.indexOf("my webs/bible100_ot/image_ot/") >= 0 ||
      lower.indexOf("my%20webs/bible100_ot/image_ot/") >= 0 ||
      /\/image_ot\//i.test(lower);
    var hitT4 =
      (lower.indexOf("onedrive") >= 0 && lower.indexOf("image_t4/") >= 0) ||
      /\/image_t4\//i.test(lower);

    var viOtFilesMatch = src.match(
      /\/vi\/OT\/chapters\/[^/]+\.files\/([^/]+\.(?:png|jpe?g|gif|webp|bmp))$/i
    );
    if (viOtFilesMatch) {
      var np1 = SHARED_MEDIA_BASE + "OT1_ref/" + viOtFilesMatch[1];
      if (img.getAttribute("src") !== np1) img.setAttribute("src", np1);
      return;
    }
    var bt01OtFilesMatch = src.match(
      /BT01OT1[^.]*\.files\/([^/]+\.(?:png|jpe?g|gif|webp|bmp))$/i
    );
    if (bt01OtFilesMatch) {
      var np2 = SHARED_MEDIA_BASE + "OT1_ref/" + bt01OtFilesMatch[1];
      if (img.getAttribute("src") !== np2) img.setAttribute("src", np2);
      return;
    }

    var wholeBookMatch = src.match(
      /(NT1_O_whole_book_v0_cn2en|NT1_O_whole_book_v0|OT1_O_whole_book_v0_cn2en_1|OT1_O_whole_book_v0)\.files\/([\w\-\.]+)$/i
    );
    if (wholeBookMatch) {
      var newPathWb = IMAGES_BASE + wholeBookMatch[1] + ".files/" + wholeBookMatch[2];
      if (img.getAttribute("src") !== newPathWb) img.setAttribute("src", newPathWb);
      return;
    }

    if (hitNT || hitOT || hitT4 || lower.indexOf("file:///") === 0) {
      var fname = getFileName(src);
      if (!fname || !/\.(png|jpe?g|gif|webp|bmp)$/i.test(fname)) return;
      var folder = hitOT ? "image_OT/" : hitT4 ? "image_T4/" : "image_NT/";
      var target = IMAGES_BASE + folder + fname;
      if (img.getAttribute("src") !== target) img.setAttribute("src", target);
    }
  }

  function rewriteAll(doc) {
    if (!doc) return;
    doc.querySelectorAll("img").forEach(rewriteOne);
    var mo = new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node && node.tagName === "IMG") rewriteOne(node);
          if (node && node.querySelectorAll) node.querySelectorAll("img").forEach(rewriteOne);
        });
      });
    });
    mo.observe(doc.body || doc.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      rewriteAll(document);
    });
  } else {
    rewriteAll(document);
  }
})();
