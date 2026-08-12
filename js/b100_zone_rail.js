/**
 * 教會事工 A–G · landing 防迷航頂欄（回區域首頁，不逼重開總站）
 */
(function (global, doc) {
  "use strict";

  var ZONES = {
    gateway: {
      letter: "",
      title: "教會事工",
      titleEn: "Church Ministry",
      home: "church_ministry/_landing/gateway.html"
    },
    a: {
      letter: "A",
      title: "敬拜音樂",
      titleEn: "Worship",
      home: "church_ministry/_landing/worship.html"
    },
    b: {
      letter: "B",
      title: "牧養小組",
      titleEn: "Pastoral & Groups",
      home: "church_ministry/_landing/fellowship.html"
    },
    c: {
      letter: "C",
      title: "聖經門訓",
      titleEn: "Discipleship",
      home: "church_ministry/_landing/education.html"
    },
    d: {
      letter: "D",
      title: "外展差傳",
      titleEn: "Outreach",
      home: "church_ministry/_landing/outreach.html"
    },
    e: {
      letter: "E",
      title: "社會服務",
      titleEn: "Social Service",
      home: "church_ministry/_landing/social.html"
    },
    f: {
      letter: "F",
      title: "詩歌應用",
      titleEn: "Hymns",
      home: "church_ministry/_landing/hymns.html"
    },
    g: {
      letter: "G",
      title: "規劃行政",
      titleEn: "Plan & Admin",
      home: "church_planning/index_plan.html"
    }
  };

  function inHub() {
    try {
      return global.parent && global.parent !== global;
    } catch (e) {
      return false;
    }
  }

  function detectZone() {
    var body = doc.body;
    if (!body) return null;
    var ae = body.getAttribute("data-b100-ae-zone");
    if (ae && ZONES[ae]) return ae;
    var pat = body.getAttribute("data-b100-pattern") || "";
    if (pat.indexOf("GATEWAY") >= 0) return "gateway";
    try {
      var p = String(global.location.pathname || "").replace(/\\/g, "/").toLowerCase();
      if (p.indexOf("index_plan") >= 0) return "g";
      if (p.indexOf("_landing/gateway") >= 0) return "gateway";
      if (p.indexOf("_landing/worship") >= 0) return "a";
      if (p.indexOf("_landing/fellowship") >= 0) return "b";
      if (p.indexOf("_landing/education") >= 0) return "c";
      if (p.indexOf("_landing/outreach") >= 0) return "d";
      if (p.indexOf("_landing/social") >= 0) return "e";
      if (p.indexOf("_landing/hymns") >= 0) return "f";
    } catch (e2) { /* ignore */ }
    return null;
  }

  function isHomePage(zoneId, cfg) {
    try {
      var p = String(global.location.pathname || "").replace(/\\/g, "/").toLowerCase();
      return p.indexOf(cfg.home.replace(/\\/g, "/").toLowerCase().split("/").pop()) >= 0;
    } catch (e) {
      return false;
    }
  }

  function navHome(cfg) {
    var url = cfg.home;
    if (typeof global.bible100ShellNav === "function") {
      return (
        'href="' +
        url +
        '" onclick="return bible100ShellNav(event,{contentUrl:' +
        JSON.stringify(url) +
        '});"'
      );
    }
    return 'href="' + url + '" data-b100-nav="content"';
  }

  function mount(hostId, zoneId) {
    var host = doc.getElementById(hostId);
    if (!host) return;
    zoneId = zoneId || detectZone();
    if (!zoneId || !ZONES[zoneId]) return;
    var cfg = ZONES[zoneId];
    var homeBtn = "";
    if (!isHomePage(zoneId, cfg)) {
      homeBtn =
        '<a class="b100-zone-rail__home" ' +
        navHome(cfg) +
        ">🏠 回" +
        (cfg.letter ? cfg.letter + " · " : "") +
        cfg.title +
        "</a>";
    }
    var gatewayLink = "";
    if (zoneId !== "gateway") {
      gatewayLink =
        ' <a class="b100-zone-rail__home" ' +
        navHome(ZONES.gateway) +
        ' style="font-weight:600;">路線首頁</a>';
    }
    host.innerHTML =
      '<div class="b100-zone-rail">' +
      homeBtn +
      gatewayLink +
      '<div class="b100-zone-rail__title">' +
      (cfg.letter ? cfg.letter + " " : "") +
      cfg.title +
      "<small>" +
      cfg.titleEn +
      "</small></div></div>";
  }

  function boot(opts) {
    opts = opts || {};
    if (!inHub() && !opts.force) return;
    mount(opts.hostId || "b100-zone-rail-top", opts.zone);
  }

  global.B100ZoneRail = {
    ZONES: ZONES,
    boot: boot,
    mount: mount,
    detectZone: detectZone
  };

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", function () {
      boot({});
    });
  } else {
    boot({});
  }
})(typeof window !== "undefined" ? window : this, document);
