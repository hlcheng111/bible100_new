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

  function zoneNow() {
    var path = location.pathname || location.href || "";
    var h = (location.hash || "").replace(/^#/, "");
    if (/Applied-Hymnology/i.test(path)) return "workshop";
    if (/hymn_catalog_sort|\/explore\//i.test(path)) return "find";
    if (/hymn_ai_tools|hymn_editor|ppt_generator/i.test(path)) return "use";
    if (/resource_selector/i.test(path)) return h.indexOf("sets") === 0 ? "learn" : "use";
    if (/analyze\.html|core_hymns|\/lessons\/|hymn_amazing_grace/i.test(path)) return "research";
    if (/journey_intro|\/disciplines\/|learn_catalog|\/prisms\//i.test(path)) return "learn";
    if (/landing\.html/i.test(path)) {
      if (h.indexOf("learn") === 0) return "learn";
      if (h === "find" || h === "research" || h === "use") return h;
      return here || "";
    }
    return here || "";
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
    if (dock) dock.style.top = nav.parentNode ? ((nav.offsetHeight || 46) + "px") : "0px";
  }
  function inPhShell() {
    try {
      var p = window.parent;
      return !!(p && p !== window && p.document.body.classList.contains("mode-ph"));
    } catch (e) {
      return false;
    }
  }
  if (!inPhShell()) document.body.insertBefore(nav, document.body.firstChild);
  window.addEventListener("hashchange", mark);
  window.addEventListener("load", mark);
  mark();
})();
