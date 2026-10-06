/**
 * 6 欄可排序：資料來自 default.htm 抽出檔（不改原文）。點列開原頁 .htm。
 */
(function (global) {
  "use strict";

  var COLS = [
    { key: "number", label: "編號" },
    { key: "full", label: "全稱" },
    { key: "en", label: "英文詩名" },
    { key: "zh", label: "中文詩名" },
    { key: "author", label: "作者" },
    { key: "catalog", label: "館藏" }
  ];

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function encodeHymnRel(rel) {
    var p = String(rel || "").replace(/\\/g, "/").replace(/^\.\.\//, "");
    if (!p) return "";
    var parts = p.split("/");
    return parts
      .map(function (part, i) {
        return i === parts.length - 1 ? encodeURIComponent(part) : part;
      })
      .join("/");
  }

  function originalHtmHref(rel, hymnRoot) {
    var enc = encodeHymnRel(rel);
    if (!enc) return "";
    return (hymnRoot || "") + "hymn/" + enc;
  }

  function cmp(a, b, key, dir) {
    var n = String(a[key] || "").localeCompare(String(b[key] || ""), "en", {
      numeric: true,
      sensitivity: "base"
    });
    return dir === "desc" ? -n : n;
  }

  function loadDefaultCatalog() {
    if (global.B100_DEFAULT_HTM_CATALOG && global.B100_DEFAULT_HTM_CATALOG.rows) {
      return Promise.resolve(global.B100_DEFAULT_HTM_CATALOG);
    }
    var base = "";
    try {
      var scripts = document.getElementsByTagName("script");
      var i;
      for (i = 0; i < scripts.length; i++) {
        var src = scripts[i].src || "";
        var cut = src.indexOf("/js/hymn_catalog_sort.js");
        if (cut >= 0) {
          base = src.slice(0, cut + 1);
          break;
        }
      }
    } catch (e0) {}
    return fetch(base + "data/default-htm-catalog.json")
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .catch(function () {
        return null;
      });
  }

  function boot(opts) {
    opts = opts || {};
    var hymnRoot = opts.hymnRoot != null ? opts.hymnRoot : opts.root || "";
    var qEl = document.getElementById("hymnCatFilter");
    var countEl = document.getElementById("hymnCatCount");
    var headEl = document.getElementById("hymnCatHead");
    var bodyEl = document.getElementById("hymnCatBody");
    if (!bodyEl || !headEl) return;

    var all = [];
    var sortKey = "en";
    var sortDir = "asc";

    function renderHead() {
      headEl.innerHTML = COLS.map(function (c) {
        var mark = c.key === sortKey ? (sortDir === "asc" ? " ▲" : " ▼") : "";
        return (
          '<th scope="col" data-sort="' +
          c.key +
          '" title="點此排序">' +
          esc(c.label) +
          mark +
          "</th>"
        );
      }).join("");
    }

    function visibleRows() {
      var q = ((qEl && qEl.value) || "").trim().toLowerCase();
      var list = all.filter(function (r) {
        if (!r.href) return false;
        if (!q) return true;
        return (
          r.number.toLowerCase().indexOf(q) >= 0 ||
          r.full.toLowerCase().indexOf(q) >= 0 ||
          r.en.toLowerCase().indexOf(q) >= 0 ||
          r.zh.toLowerCase().indexOf(q) >= 0 ||
          r.author.toLowerCase().indexOf(q) >= 0 ||
          r.catalog.toLowerCase().indexOf(q) >= 0
        );
      });
      list.sort(function (a, b) {
        return cmp(a, b, sortKey, sortDir);
      });
      return list;
    }

    function render() {
      var list = visibleRows();
      if (countEl) {
        countEl.textContent =
          "顯示 " + list.length + " / " + all.length + " 首（從 default.htm 抽出）· 點表頭排序 · 點列開原頁";
      }
      renderHead();
      if (!list.length) {
        bodyEl.innerHTML =
          '<tr><td colspan="6" class="hymn-cat-empty">沒有符合列。可核對未改的 <a href="' +
          esc(hymnRoot + "hymn/default.htm") +
          '">default.htm</a>。</td></tr>';
        return;
      }
      bodyEl.innerHTML = list
        .map(function (r) {
          return (
            "<tr>" +
            COLS.map(function (c) {
              var cell = esc(r[c.key]);
              return (
                '<td><a href="' +
                esc(r.href) +
                '" title="打開原頁曲譜">' +
                (cell || "—") +
                "</a></td>"
              );
            }).join("") +
            "</tr>"
          );
        })
        .join("");
    }

    headEl.addEventListener("click", function (e) {
      var th = e.target.closest("th[data-sort]");
      if (!th) return;
      var key = th.getAttribute("data-sort");
      if (key === sortKey) {
        sortDir = sortDir === "asc" ? "desc" : "asc";
      } else {
        sortKey = key;
        sortDir = "asc";
      }
      render();
    });

    if (qEl) {
      var t;
      qEl.addEventListener("input", function () {
        clearTimeout(t);
        t = setTimeout(render, 120);
      });
      if ((location.hash || "") === "#author") {
        qEl.placeholder = "輸入作者，在這張曲庫篩";
        qEl.focus();
      }
    }

    loadDefaultCatalog().then(function (pack) {
      var rows = (pack && pack.rows) || [];
      all = rows.map(function (r) {
        return {
          number: r.number || "",
          full: r.full || "",
          en: r.en || "",
          zh: r.zh || "",
          author: r.author || "",
          catalog: r.catalog || "",
          href: originalHtmHref(r.href, hymnRoot)
        };
      });
      render();
    });
  }

  function requestPlaylistSidebar() {
    var pair = {
      sidebarUrl: "hymn_management/sidebar_playlist.html"
    };
    if (typeof global.bible100ShellNav === "function") {
      global.bible100ShellNav(null, pair);
      return;
    }
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage(
          {
            type: "bible100-shell",
            sidebarUrl: "hymn_management/sidebar_playlist.html"
          },
          "*"
        );
      }
    } catch (e1) {}
  }

  global.B100HymnCatalogSort = {
    boot: boot,
    originalHtmHref: originalHtmHref,
    requestPlaylistSidebar: requestPlaylistSidebar
  };
})(typeof window !== "undefined" ? window : this);
