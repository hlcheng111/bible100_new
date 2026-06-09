/**
 * A 敬拜 W1 · 六项区块自动注入（批量套用诗班模板）
 */
(function (doc, win) {
  "use strict";

  var MARKER = "data-ae-worship-shell-done";

  function pageId() {
    var p = (win.location.pathname || "").replace(/\\/g, "/");
    var file = p.split("/").pop() || "";
    return file.replace(/\.html$/i, "").split("?")[0];
  }

  function cmPrefix() {
    var rel = (function () {
      var path = (win.location.pathname || "").replace(/\\/g, "/");
      var i = path.toLowerCase().indexOf("/church_ministry/");
      if (i >= 0) return path.slice(i + "/church_ministry/".length);
      return path.replace(/^\//, "");
    })();
    var depth = (rel.match(/\//g) || []).length;
    return depth ? new Array(depth + 1).join("../") : "";
  }

  function resolveHref(href, cmPre) {
    if (!href || href.indexOf("http") === 0) return href;
    if (href.indexOf("modules/") === 0) return cmPre + href;
    if (href.indexOf("../") === 0) return cmPre + href.replace(/^\.\.\//, "");
    if (/\/modules\/media\//i.test(win.location.pathname || "")) return "../worship/" + href;
    return href;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function section(id, title, html, extra) {
    return (
      '<section id="' + id + '" class="section-block">' +
      "<h2>" + esc(title) + "</h2>" +
      '<p class="section-lead">' + html + "</p>" +
      (id === "ae-worship-org" ? '<div id="aeMemberIdLinkPanel"></div>' : "") +
      (id === "ae-worship-training" ? '<div id="ae-worship-ai-draft-training"></div>' : "") +
      (extra || "") +
      "</section>"
    );
  }

  function buildShell(cfg, cmPre) {
    var isMedia = /\/modules\/media\//i.test(win.location.pathname || "");
    var worshipPre = isMedia ? "../worship/" : "";
    var landing = cmPre + "_landing/worship.html";
    var integrated = cmPre + (isMedia ? "modules/worship/worship-integrated.html" : "worship-integrated.html");
    var anchors =
      '<nav class="anchor-nav" aria-label="敬拜六项">' +
      '<a href="#ae-worship-meaning">① 意义</a>' +
      '<a href="#ae-worship-org">② 组织</a>' +
      '<a href="#ae-worship-training">③ 训练</a>' +
      '<a href="#ae-worship-performance">④ 演出</a>' +
      '<a href="#ae-worship-activities">⑤ 活动</a>' +
      '<a href="#ae-worship-scores">⑥ 乐谱</a>' +
      '<a href="#ae-worship-tool">⑦ 工具</a>' +
      '<a href="#ae-worship-bridge">互联</a>' +
      '<a href="#ae-worship-next">填完去哪</a>' +
      "</nav>";

    var nextHtml = (cfg.nextLinks || [])
      .map(function (l) {
        return '<a href="' + esc(resolveHref(l.href, cmPre)) + '">' + esc(l.label) + "</a>";
      })
      .join("");

    var theoryBlock =
      section("ae-worship-meaning", "① 事工意义", cfg.meaning || "") +
      section("ae-worship-org", "② 组织", cfg.org || "") +
      section("ae-worship-training", "③ 训练", cfg.training || "") +
      section("ae-worship-performance", "④ 演出", cfg.performance || "") +
      section("ae-worship-activities", "⑤ 活动", cfg.activities || "") +
      section("ae-worship-scores", "⑥ 乐谱", cfg.scores || "");
    if (cfg.mode === "tool") {
      theoryBlock =
        '<details class="ae-worship-theory-fold"><summary>📖 事工说明（点击展开 ①–⑥）</summary>' +
        theoryBlock +
        "</details>";
    }

    return (
      '<div class="ae-worship-shell" id="ae-worship-shell-root">' +
      '<nav class="top-nav" aria-label="页面导航">' +
      '<span class="lbl">本页导航</span>' +
      '<a href="' + landing + '">🌳 敬拜花园</a>' +
      '<a href="' + cmPre + (isMedia ? "modules/worship/" : "") + 'worship-together.html">🕊️ 会众筑坛</a>' +
      '<a href="' + integrated + '?view=volunteer">🙋 我的服事</a>' +
      '<a href="' + integrated + '?view=leader">敬拜工作台</a>' +
      '<a href="' + cmPre + 'dashboard.html">⛪ 事工中心</a>' +
      "</nav>" +
      anchors +
      '<div class="page-title-bar"><h1>' +
      esc(cfg.emoji || "") +
      " " +
      esc(cfg.title || "") +
      "</h1></div>" +
      theoryBlock +
      '<section id="ae-worship-tool" class="section-block">' +
      "<h2>" +
      esc(cfg.toolLabel || "⑦ 本页工具") +
      "</h2>" +
      '<div class="ae-worship-tool-host" id="ae-worship-tool-host"></div>' +
      "</section>" +
      '<section id="ae-worship-bridge" class="section-block">' +
      "<h2>🔗 模块互联</h2>" +
      '<p class="section-lead">AI 只预填草稿，不自动派工。</p>' +
      (cfg.bridgeHtml || "") +
      '<div id="ae-worship-bridge-extras"></div>' +
      '<div id="ae-worship-hub-strip"></div>' +
      '<div id="ae-worship-ai-draft"></div>' +
      "</section>" +
      '<section id="ae-worship-next" class="section-block">' +
      "<h2>⑧ 填完去哪</h2>" +
      '<div class="next-links">' +
      nextHtml +
      "</div></section></div>"
    );
  }

  function moveContentIntoTool(host) {
    var body = doc.body;
    var skip = { SCRIPT: 1, LINK: 1, STYLE: 1 };
    var nodes = [];
    for (var i = 0; i < body.childNodes.length; i++) {
      var n = body.childNodes[i];
      if (n.nodeType !== 1) continue;
      if (n.id === "ae-worship-shell-root" || n.id === "ae-primary-nav-strip") continue;
      if (n.getAttribute && n.getAttribute(MARKER)) continue;
      if (skip[n.tagName]) continue;
      nodes.push(n);
    }
    nodes.forEach(function (n) {
      host.appendChild(n);
    });
  }

  function renderWorshipTeamLinkPanel(hostId, cmPre) {
    var host = doc.getElementById(hostId);
    if (!host || !win.WorshipTeamBridge) return;
    var count = win.MemberIdBridge ? (win.MemberIdBridge.listMembers().length) : 0;
    host.innerHTML =
      '<div class="ae-member-bridge">' +
      '<p class="section-lead"><strong>W2 敬拜团对齐：</strong> <code>worshipTeamData</code> 成员 + 排班姓名槽位 → memberId</p>' +
      '<button type="button" class="fbtn" id="aeWorshipTeamLinkBtn">对齐敬拜团嵌套数据</button> ' +
      '<span id="aeWorshipTeamLinkStatus"></span> ' +
      '<a class="fbtn" style="text-decoration:none;display:inline-block;" href="' +
      (cmPre + "modules/members/member-integrated.html") + '">会友主档</a>' +
      '<small style="display:block;margin-top:4px;color:#64748b;">会友 ' + count + ' 人 · 先载入中央会友再对齐</small></div>';
    var btn = doc.getElementById("aeWorshipTeamLinkBtn");
    var st = doc.getElementById("aeWorshipTeamLinkStatus");
    if (btn) {
      btn.addEventListener("click", function () {
        var stats = win.WorshipTeamBridge.autoLinkAll();
        if (st) {
          st.textContent = "成员 " + stats.membersLinked + "/" + stats.membersTotal +
            " · 排班槽 " + stats.scheduleSlots;
        }
        win.dispatchEvent(new CustomEvent("worshipTeamLinked", { detail: stats }));
      });
    }
  }

  function init() {
    if (doc.body.getAttribute(MARKER)) return;
    var reg = win.AeWorshipPageRegistry || {};
    var id = pageId();
    var cfg = reg[id];
    if (!cfg) return;
    if (cfg.mode === "skip" || doc.body.getAttribute("data-ae-worship-shell") === "skip") return;

    var cmPre = cmPrefix();
    var wrap = doc.createElement("div");
    wrap.innerHTML = buildShell(cfg, cmPre);
    var shellRoot = wrap.firstChild;

    if (cfg.mode === "lite") {
      doc.body.insertBefore(shellRoot, doc.body.firstChild);
      var toolHost = doc.getElementById("ae-worship-tool-host");
      if (toolHost && toolHost.parentElement) toolHost.parentElement.style.display = "none";
    } else {
      doc.body.insertBefore(shellRoot, doc.body.firstChild);
      var host = doc.getElementById("ae-worship-tool-host");
      if (host) moveContentIntoTool(host);
    }

    if (win.MemberIdBridge && cfg.rosterKey === "worshipTeamData" && win.WorshipTeamBridge) {
      renderWorshipTeamLinkPanel("aeMemberIdLinkPanel", cmPre);
    } else if (win.MemberIdBridge && cfg.rosterKey) {
      win.MemberIdBridge.renderLinkPanel("aeMemberIdLinkPanel", {
        rosterKey: cfg.rosterKey,
        memberPageHref: cmPre + "modules/members/member-integrated.html"
      });
    } else if (win.MemberIdBridge) {
      win.MemberIdBridge.renderLinkPanel("aeMemberIdLinkPanel", {
        memberPageHref: cmPre + "modules/members/member-integrated.html"
      });
    }

    doc.body.setAttribute(MARKER, "1");
    if (!doc.body.getAttribute("data-b100-ae-zone")) {
      doc.body.setAttribute("data-b100-ae-zone", "a");
    }
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(document, window);
