(function () {
  var s = document.currentScript;
  if (!s) return;
  var root = s.getAttribute("data-root") || "";
  var here = s.getAttribute("data-here") || "";
  var css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = root + "ph_module_bar.css";
  document.head.appendChild(css);

  var items = [
    ["find", "找聖詩", root + "landing.html#find"],
    ["learn", "學聖詩", root + "landing.html#learn-A"],
    ["research", "研究聖詩", root + "landing.html#research"],
    ["use", "使用聖詩", root + "landing.html#use"],
    ["workshop", "聖詩工作坊", root + "Applied-Hymnology/index.html"]
  ];
  var nav = document.createElement("nav");
  nav.className = "ph-bar";
  nav.setAttribute("aria-label", "樂以載道");
  var brand = document.createElement("a");
  brand.className = "ph-brand";
  brand.setAttribute("data-b100-nav", "content");
  brand.href = root + "landing.html";
  brand.textContent = "樂以載道";
  nav.appendChild(brand);
  var group = document.createElement("div");
  group.className = "ph-zones";
  items.forEach(function (it) {
    var a = document.createElement("a");
    a.href = it[2];
    a.textContent = it[1];
    a.setAttribute("data-b100-nav", "content");
    a.setAttribute("data-zone", it[0]);
    group.appendChild(a);
  });
  nav.appendChild(group);

  function queryZone() {
    var z = "";
    try { z = new URLSearchParams(location.search).get("zone") || ""; } catch (e) {}
    return z;
  }
  function zoneNow() {
    var path = location.pathname || location.href || "";
    var h = (location.hash || "").replace(/^#/, "");
    var zq = queryZone();
    if (/Applied-Hymnology/i.test(path)) return "workshop";
    if (/hymn_catalog_sort|\/explore\//i.test(path)) return "find";
    if (/hymn_ai_tools|hymn_editor|ppt_generator/i.test(path)) return "use";
    if (/resource_selector/i.test(path)) return h.indexOf("sets") === 0 ? "learn" : "use";
    if (/analyze\.html|core_hymns|\/lessons\/|hymn_amazing_grace/i.test(path)) return "research";
    if (/journey_intro|\/disciplines\/|learn_catalog|\/prisms\//i.test(path)) return "learn";
    if (/landing\.html/i.test(path)) {
      if (h.indexOf("learn") === 0 || zq === "learn") return "learn";
      if (h === "find" || h === "research" || h === "use") return h;
      if (zq === "find" || zq === "research" || zq === "use") return zq;
      return "";
    }
    return here && here !== "map" ? here : "";
  }
  function tell(zone) {
    if (!zone) return;
    try { window.parent.postMessage({ type: "ph-zone", zone: zone }, "*"); } catch (e) {}
  }
  function mark() {
    var z = zoneNow();
    var links = group.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      links[i].classList.toggle("on", links[i].getAttribute("data-zone") === z);
    }
    tell(z);
    var dock = document.querySelector(".dock");
    if (dock) {
      var barH = nav.parentNode ? (nav.offsetHeight || 46) : 0;
      var noteEl = document.querySelector(".ph-door-note");
      if (noteEl) barH += noteEl.offsetHeight || 0;
      dock.style.top = barH ? (barH + "px") : "0px";
    }
  }
  function inOuterFrame() {
    try {
      return !!(window.parent && window.parent !== window);
    } catch (e) {
      return true;
    }
  }
  function wantSide() {
    var q = location.search || "";
    if (/[?&]in_shell=1/.test(q)) return false;
    try { return window.parent === window; } catch (e) { return false; }
  }
  /* file:// 讀不到外層頁面。人已在總站右欄時，不再畫第二條黑條。 */
  if (!inOuterFrame()) document.body.insertBefore(nav, document.body.firstChild);

  function keepEmbed(href) {
    if (!/[?&]embed_side=1/.test(location.search || "")) return href;
    if (!href || href.indexOf("embed_side=1") >= 0 || href.indexOf("://") >= 0 || href.charAt(0) === "#") return href;
    var hash = "";
    var hi = href.indexOf("#");
    if (hi >= 0) { hash = href.slice(hi); href = href.slice(0, hi); }
    return href + (href.indexOf("?") >= 0 ? "&" : "?") + "embed_side=1" + hash;
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || !wantSide()) return;
    var next = keepEmbed(a.getAttribute("href"));
    if (!next || next === a.getAttribute("href")) return;
    e.preventDefault();
    location.href = next;
  });

  function chain(list, i, done) {
    if (i >= list.length) { done(); return; }
    if (list[i].check()) { chain(list, i + 1, done); return; }
    var s = document.createElement("script");
    s.src = list[i].src;
    s.onload = function () { chain(list, i + 1, done); };
    s.onerror = function () { chain(list, i + 1, done); };
    document.head.appendChild(s);
  }
  function armSide() {
    if (!wantSide()) return;
    var split = document.createElement("div");
    split.className = "ph-split";
    var aside = document.createElement("aside");
    aside.className = "ph-inline-side";
    var main = document.createElement("div");
    main.className = "ph-inline-main";
    var nodes = [];
    var n = document.body.firstChild;
    while (n) { nodes.push(n); n = n.nextSibling; }
    document.body.appendChild(split);
    split.appendChild(aside);
    split.appendChild(main);
    nodes.forEach(function (node) {
      if (node === split) return;
      if (node.nodeType === 1 && node.classList && (node.classList.contains("ph-bar") || node.classList.contains("ph-door-note"))) return;
      main.appendChild(node);
    });
    document.body.classList.add("ph-with-side");
    var up = root ? root + "../" : "../";
    chain([
      { src: up + "data/ph_search_index.js", check: function () { return !!window.PH_SEARCH_INDEX; } },
      { src: (root || "") + "data/disciplines_index.js", check: function () { return !!window.PH_DISCIPLINES_INDEX; } },
      { src: up + "js/ph_search.js", check: function () { return !!window.PhSearch; } },
      { src: (root || "") + "js/yt_sacred_store.js", check: function () { return !!window.YtSacredStore; } },
      { src: up + "js/ph_side_panel.js", check: function () { return !!window.PhSidePanel; } }
    ], 0, function () {
      if (window.PhSidePanel) {
        window.PhSidePanel.mount(aside, {
          place: "inline",
          root: root,
          keepFlag: /[?&]embed_side=1/.test(location.search || "")
        });
      }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", armSide);
  else armSide();
  window.addEventListener("hashchange", mark);
  window.addEventListener("load", mark);
  mark();
})();
