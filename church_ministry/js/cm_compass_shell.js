/**
 * CM diversified landings · panel BELOW stage · short EN · zone palette
 */
(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function zoneLandingHref(id) {
    var map = {
      a: "worship.html",
      b: "pastoral.html",
      c: "education.html",
      d: "outreach.html",
      e: "social.html",
      f: "../../hymn_management/practical_hymnology/landing.html",
      g: "planning.html",
      h: "attendance.html",
    };
    return map[id] || "gateway.html";
  }

  function applyPalette(id) {
    var P = window.CmZonePalette;
    if (P && P.applyToElement) P.applyToElement(document.body, id);
    else document.body.setAttribute("data-cm-zone", id);
  }

  function renderRoutes(routes) {
    return (routes || [])
      .map(function (r) {
        return (
          '<a href="' +
          esc(r.href) +
          '"><strong>' +
          esc(r.t) +
          "</strong>" +
          (r.tEn ? '<span class="en">' + esc(r.tEn) + "</span>" : "") +
          (r.d ? '<span class="d">' + esc(r.d) + "</span>" : "") +
          "</a>"
        );
      })
      .join("");
  }

  function showNodePanel(panel, node) {
    if (!panel || !node) return;
    panel.hidden = false;
    panel.innerHTML =
      '<div class="tag">' +
      esc(node.nameEn || node.id) +
      "</div><h2>" +
      esc(node.title || node.name) +
      " <span class=\"cm-en-inline\" style=\"display:inline;font-weight:500\">" +
      esc(node.titleEn || node.nameEn || "") +
      "</span></h2>" +
      '<p class="blurb">' +
      esc(node.blurb || "") +
      '</p><div class="routes">' +
      renderRoutes(node.routes) +
      "</div>";
  }

  function chromeTop(z) {
    var isGate = z.id === "gateway";
    return (
      '<div class="cm-where">' +
      '<a href="../../index_v5.html?mode=church">教會</a><span class="sep">/</span>' +
      (isGate
        ? "<span>總羅盤</span>"
        : '<a href="gateway.html">總羅盤</a><span class="sep">/</span><span>' + esc(z.titleZh) + "</span>") +
      '<span class="cm-en">' +
      esc(z.titleEn) +
      "</span></div>" +
      '<header class="cm-hero">' +
      '<div class="cm-kicker">' +
      esc(z.kicker) +
      "</div><h1>" +
      esc(z.titleZh) +
      '</h1><p class="hero-en">' +
      esc(z.titleEn) +
      '</p><p class="lead">' +
      esc(z.lead) +
      '</p><div class="cm-hero-actions">' +
      '<a class="cm-btn cm-btn-primary" href="' +
      esc(z.primaryHref) +
      '">' +
      esc(z.primaryLabel) +
      (z.primaryLabelEn ? '<span class="en">' + esc(z.primaryLabelEn) + "</span>" : "") +
      '</a><a class="cm-btn cm-btn-ghost" href="' +
      esc(z.ghostHref) +
      '">' +
      esc(z.ghostLabel) +
      (z.ghostLabelEn ? '<span class="en">' + esc(z.ghostLabelEn) + "</span>" : "") +
      "</a></div></header>" +
      (z.preface ? '<p class="cm-preface">' + esc(z.preface) + "</p>" : "")
    );
  }

  function bindNodes(root, nodes, panel) {
    var btns = root.querySelectorAll(".cm-node");
    var byId = {};
    (nodes || []).forEach(function (n) {
      byId[n.id] = n;
    });
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-node");
        btns.forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        showNodePanel(panel, byId[id]);
        try {
          panel.scrollIntoView({ block: "nearest", behavior: "smooth" });
        } catch (e) {}
      });
    });
    if (nodes && nodes[0] && btns[0]) btns[0].click();
  }

  function nodesHtml(nodes) {
    return (nodes || [])
      .map(function (n) {
        return (
          '<button type="button" class="cm-node" data-node="' +
          esc(n.id) +
          '"><span class="code">' +
          esc(n.nameEn || n.id) +
          '</span><span class="name">' +
          esc(n.name) +
          '</span><span class="en">' +
          esc(n.nameEn) +
          '</span><span class="hint">' +
          esc(n.hint) +
          "</span></button>"
        );
      })
      .join("");
  }

  function layoutTitle(layout) {
    var map = {
      timeline: { zh: "主日步驟", en: "Steps" },
      loop: { zh: "關懷環", en: "Loop" },
      tabs: { zh: "工作桌 Tab", en: "Tabs" },
      funnel: { zh: "外展漏斗", en: "Funnel" },
      net: { zh: "服事節點", en: "Nodes" },
      board: { zh: "決策欄", en: "Board" },
      steps: { zh: "出席步驟", en: "Steps" },
    };
    return map[layout] || { zh: "路線", en: "Routes" };
  }

  function emptyPanel(msg) {
    return '<div class="cm-panel-empty">' + esc(msg) + "</div>";
  }

  function renderZonePage(zoneId) {
    var api = window.CmCompassZones;
    if (!api) return;
    var z = api.get(zoneId);
    if (!z || !z.nodes) return;
    var root = document.getElementById("cm-root");
    if (!root) return;

    document.body.classList.add("cm-zone-" + zoneId);
    applyPalette(zoneId);
    document.title = z.titleZh + " · Bible100";

    var lt = layoutTitle(z.layout);
    root.innerHTML =
      chromeTop(z) +
      '<h2 class="cm-section-title">' +
      esc(lt.zh) +
      ' <span class="cm-en-inline" style="display:inline">' +
      esc(lt.en) +
      "</span></h2>" +
      '<p class="cm-section-hint">點一項 → 下方出現可進的頁面。</p>' +
      '<div class="cm-stage cm-layout-' +
      esc(z.layout) +
      '" id="cm-stage">' +
      nodesHtml(z.nodes) +
      "</div>" +
      '<aside class="cm-panel" id="cm-panel" aria-live="polite">' +
      emptyPanel("點上方一項，這裡出現入口。") +
      "</aside>" +
      '<p class="cm-foot"><a href="gateway.html">總羅盤</a> · <a href="../../hymn_management/practical_hymnology/landing.html">F 樂以載道</a></p>';

    bindNodes(root, z.nodes, document.getElementById("cm-panel"));
  }

  function renderGateway() {
    var api = window.CmCompassZones;
    if (!api) return;
    var z = api.get("gateway");
    if (!z) return;
    var root = document.getElementById("cm-root");
    if (!root) return;
    var nav = window.CmZoneNavSsot;

    document.body.classList.add("cm-zone-gateway");
    applyPalette("gateway");
    document.title = z.titleZh + " · Bible100";

    function zoneMeta(id) {
      if (nav && nav.getZone) return nav.getZone(id) || {};
      return {};
    }

    root.innerHTML =
      chromeTop(z) +
      '<div class="cm-flow" id="cm-flow"></div>' +
      '<h2 class="cm-section-title">八區 · Zones</h2>' +
      '<p class="cm-section-hint">每區一色。點色塊 → 下方看路線 → 進入。</p>' +
      '<div class="cm-mosaic" id="cm-mosaic">' +
      (z.tiles || [])
        .map(function (t) {
          var meta = zoneMeta(t.id);
          var en = (meta.labelEn || t.nameEn || "").replace(/^[A-H]\s+/, "");
          /* shorten display EN to first word-ish */
          if (en.indexOf("&") >= 0) en = en.split("&")[0].trim();
          if (en.indexOf(" ") >= 0 && en.length > 14) en = t.nameEn || en.split(" ")[0];
          return (
            '<button type="button" class="cm-tile" data-zone="' +
            esc(t.id) +
            '"><span class="code">' +
            esc((t.id || "").toUpperCase()) +
            '</span><span class="name">' +
            esc(t.name) +
            '</span><span class="en">' +
            esc(t.nameEn) +
            '</span><span class="hint">' +
            esc(t.hint) +
            "</span></button>"
          );
        })
        .join("") +
      "</div>" +
      '<aside class="cm-panel" id="cm-panel" aria-live="polite">' +
      emptyPanel("點上方一區，這裡出現入口。") +
      "</aside>" +
      '<p class="cm-foot">F 聖詩已完整；其餘區引導進正式工作頁。</p>';

    var panel = document.getElementById("cm-panel");
    var tiles = root.querySelectorAll(".cm-tile");
    var tileById = {};
    (z.tiles || []).forEach(function (t) {
      tileById[t.id] = t;
    });

    function panelForZone(id) {
      var t = tileById[id] || {};
      var meta = zoneMeta(id);
      var label = meta.labelZh || t.name || id;
      var en = t.nameEn || meta.labelEn || "";
      var landing = zoneLandingHref(id);
      var routes = [
        { href: landing, t: "進入此區", tEn: "Enter", d: label },
      ];
      if (id === "a") {
        routes.push({
          href: "../modules/worship/worship-sunday-desk.html",
          t: "主日工作桌",
          tEn: "Desk",
          d: "直接做事",
        });
      } else if (id === "b") {
        routes.push({
          href: "../modules/fellowship/pastoral-integrated.html",
          t: "牧養整合",
          tEn: "Desk",
          d: "直接做事",
        });
      } else if (id === "c") {
        routes.push({
          href: "../modules/education/education-integrated.html#tab-guide",
          t: "教育工作桌",
          tEn: "SS desk",
          d: "直接做事",
        });
      } else if (id === "d") {
        routes.push({
          href: "../modules/expansion/outreach-integrated.html#tab-needs",
          t: "外展工作桌",
          tEn: "Desk",
          d: "直接做事",
        });
      } else if (id === "e") {
        routes.push({
          href: "../tools/volunteer_shift/index.html",
          t: "義工排班",
          tEn: "Shifts",
          d: "直接做事",
        });
      } else if (id === "h") {
        routes.push({
          href: "../modules/fellowship/attendance-checkin.html",
          t: "報到點名",
          tEn: "Check-in",
          d: "直接做事",
        });
      } else if (id === "g") {
        routes.push({
          href: "../../church_planning/index_plan.html",
          t: "規劃索引",
          tEn: "Index",
          d: "直接做事",
        });
      } else if (id === "f") {
        routes.push({
          href: "../../hymn_management/practical_hymnology/landing.html",
          t: "樂以載道",
          tEn: "Hymns",
          d: "換側欄",
        });
      }

      panel.hidden = false;
      panel.innerHTML =
        '<div class="tag">' +
        esc((id || "").toUpperCase()) +
        "</div><h2>" +
        esc(label) +
        ' <span class="cm-en-inline" style="display:inline;font-weight:500">' +
        esc(en) +
        "</span></h2>" +
        '<p class="blurb">' +
        esc(t.blurb || "") +
        '</p><div class="routes">' +
        renderRoutes(routes) +
        "</div>";
      try {
        panel.scrollIntoView({ block: "nearest", behavior: "smooth" });
      } catch (e2) {}
    }

    tiles.forEach(function (tile) {
      tile.addEventListener("click", function () {
        var id = tile.getAttribute("data-zone");
        tiles.forEach(function (c) {
          c.classList.toggle("is-active", c === tile);
        });
        panelForZone(id);
      });
    });

    var flow = document.getElementById("cm-flow");
    if (flow && z.flows) {
      z.flows.forEach(function (f) {
        var b = document.createElement("button");
        b.type = "button";
        b.innerHTML = esc(f.label) + '<span class="en">' + esc(f.labelEn || "") + "</span>";
        b.addEventListener("click", function () {
          flow.querySelectorAll("button").forEach(function (x) {
            x.classList.remove("is-on");
          });
          b.classList.add("is-on");
          var target = root.querySelector('.cm-tile[data-zone="' + f.focus + '"]');
          if (target) target.click();
        });
        flow.appendChild(b);
      });
    }

    var start = root.querySelector('.cm-tile[data-zone="a"]');
    if (start) start.click();
  }

  function boot() {
    var id = (document.body.getAttribute("data-cm-compass") || "").toLowerCase();
    if (!id) return;
    if (id === "gateway") renderGateway();
    else renderZonePage(id);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
