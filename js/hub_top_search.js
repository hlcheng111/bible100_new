/**
 * index_v5 頂欄 🔍 搜索
 * 結果留在下拉內（入口＋課名分組）；不強制另開搜尋 Hub 頁。
 * 經文正文：下拉內一鍵載入右欄研讀全文搜尋（同一殼，非新瀏覽器分頁）。
 */
(function (w) {
  "use strict";

  function $(id) {
    return document.getElementById(id);
  }

  function closeDropdown() {
    var panel = $("hubTopSearchResults");
    if (panel) panel.classList.remove("is-open");
  }

  function openDropdown() {
    var panel = $("hubTopSearchResults");
    if (panel) panel.classList.add("is-open");
  }

  function openInContent(path) {
    var cf = $("contentFrame");
    if (cf) cf.src = path;
    if (typeof w.setShellUtilityView === "function") w.setShellUtilityView();
    closeDropdown();
  }

  function openScriptureInContent(query) {
    var q = String(query || "").trim();
    openInContent(
      "bible_study/search_reader.html" + (q ? "?q=" + encodeURIComponent(q) : "")
    );
  }

  /** 僅在需要完整分頁 UI 時用（非預設） */
  function openSiteSearchHub(query) {
    var q = String(query || "").trim();
    var bust = "v=" + Date.now();
    var tabHint = "";
    try {
      if (q && w.Bible100SiteSearch) {
        var navHits = w.Bible100SiteSearch.search(q, { kind: "nav", limit: 1 });
        var curHits = w.Bible100SiteSearch.search(q, { kind: "curriculum", limit: 1 });
        if (!navHits.length && curHits.length) tabHint = "&tab=curriculum";
      }
    } catch (eTab) { /* ignore */ }
    openInContent(
      "nav_hub/site_search_hub.html?" +
        bust +
        (q ? "&q=" + encodeURIComponent(q) : "") +
        tabHint
    );
  }

  function init() {
    var input = $("hubTopSearchInput");
    var results = $("hubTopSearchResults");
    if (!input || !results || !w.Bible100SiteSearch) return;

    var api = w.Bible100SiteSearch.mount({
      input: input,
      results: results,
      basePrefix: "",
      defaultKind: "all",
      limit: 40,
      groupByKind: true,
      buildFooter: function (q) {
        var qq = String(q || "").replace(/"/g, "&quot;");
        var html = "";
        if (q) {
          html +=
            '<button type="button" class="b100-search-more b100-search-more--scripture" id="hubTopSearchScripture" data-q="' +
            qq +
            '">經文全文搜「' +
            String(q).replace(/</g, "") +
            "」（右欄研讀）→</button>";
        }
        html +=
          '<button type="button" class="b100-search-more b100-search-more--quiet" id="hubTopSearchHub" data-q="' +
          qq +
          '">進階：右欄搜尋 Hub 分頁</button>';
        return html;
      },
      onFooterBind: function (container) {
        var sBtn = container.querySelector("#hubTopSearchScripture");
        if (sBtn) {
          sBtn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            openScriptureInContent(sBtn.getAttribute("data-q") || input.value);
          });
        }
        var hBtn = container.querySelector("#hubTopSearchHub");
        if (hBtn) {
          hBtn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            openSiteSearchHub(hBtn.getAttribute("data-q") || input.value);
          });
        }
      }
    });

    input.addEventListener("focus", function () {
      openDropdown();
    });

    input.addEventListener("input", function () {
      openDropdown();
    });

    document.addEventListener("click", function (e) {
      var wrap = $("hubTopSearchWrap");
      if (wrap && !wrap.contains(e.target)) closeDropdown();
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        openDropdown();
        if (api && api.refresh) api.refresh();
        /* 有結果就留在下拉；無目錄結果且有詞 → 直接經文全文 */
        var q = input.value.trim();
        if (q && w.Bible100SiteSearch) {
          var hits = w.Bible100SiteSearch.search(q, { kind: "all", limit: 1 });
          if (!hits.length) openScriptureInContent(q);
        }
      }
    });

    w.__hubTopSearchApi = api;
  }

  w.openSiteSearchHub = openSiteSearchHub;
  w.openScriptureSearch = openScriptureInContent;

  w.openNavHubSearch = function () {
    var fm = w.frameManager || (w.MainFrameManager ? new w.MainFrameManager() : null);
    if (fm && fm.showLoading) fm.showLoading("載入 Sitemap…");
    var bust = "v=" + Date.now();
    var sf = $("sidebarFrame");
    var cf = $("contentFrame");
    if (sf) sf.src = "nav_hub/sidebar_modules_map.html?" + bust;
    if (cf) cf.src = "nav_hub/site_modules_sitemap.html?" + bust;
    if (typeof w.setShellUtilityView === "function") w.setShellUtilityView();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(typeof window !== "undefined" ? window : window);
