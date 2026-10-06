/**
 * 樂以載道搜尋：曲庫／分析範例／學科。結果在側欄；點擊只換右欄。
 */
(function (global) {
  "use strict";

  function norm(s) {
    return String(s || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function hymnUrl(path) {
    var p = String(path || "").replace(/\\/g, "/").replace(/^\.\.\//, "");
    if (!p) return "";
    if (p.indexOf("hymn/") !== 0) p = "hymn/" + p;
    var parts = p.split("/");
    return parts
      .map(function (part, i) {
        return i === parts.length - 1 ? encodeURIComponent(part) : part;
      })
      .join("/");
  }

  function hit(q, fields) {
    if (!q) return false;
    var blob = norm(fields.join(" "));
    return blob.indexOf(q) >= 0;
  }

  function search(q, scope) {
    q = norm(q);
    var idx = global.PH_SEARCH_INDEX || { hymns: [], samples: [] };
    var disc = (global.PH_DISCIPLINES_INDEX && global.PH_DISCIPLINES_INDEX.disciplines) || [];
    var hymns = [];
    var samples = [];
    var disciplines = [];
    if (!q) return { q: q, hymns: hymns, samples: samples, disciplines: disciplines };

    if (scope === "all" || scope === "hymns") {
      for (var i = 0; i < idx.hymns.length && hymns.length < 12; i++) {
        var h = idx.hymns[i];
        if (hit(q, [h.zh, h.en, h.author, h.num, h.id])) hymns.push(h);
      }
    }
    if (scope === "all" || scope === "samples") {
      (idx.samples || []).forEach(function (s) {
        if (hit(q, [s.zh, s.en, s.id])) samples.push(s);
      });
    }
    if (scope === "all" || scope === "disciplines") {
      disc.forEach(function (d) {
        if (disciplines.length >= 12) return;
        if (hit(q, [d.code, d.title_zh, d.title_en, d.topics, d.desc, d.lens])) disciplines.push(d);
      });
    }
    return { q: q, hymns: hymns, samples: samples, disciplines: disciplines };
  }

  function matchDisciplines(text, limit) {
    var q = norm(text);
    var disc = (global.PH_DISCIPLINES_INDEX && global.PH_DISCIPLINES_INDEX.disciplines) || [];
    if (!q) return disc.slice(0, limit || 8);
    var scored = [];
    disc.forEach(function (d) {
      var blob = norm([d.code, d.title_zh, d.title_en, d.topics, d.desc, d.scripture].join(" "));
      var score = 0;
      q.split(" ").forEach(function (tok) {
        if (tok && blob.indexOf(tok) >= 0) score += tok.length;
      });
      if (score) scored.push({ d: d, score: score });
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.slice(0, limit || 8).map(function (x) { return x.d; });
  }

  function promptText(title, extra) {
    var codes = ((global.PH_DISCIPLINES_INDEX && global.PH_DISCIPLINES_INDEX.disciplines) || [])
      .map(function (d) { return d.code + " " + d.title_zh; })
      .join("\n");
    return [
      "你是聖詩學草稿助手，不是神學權威。請用繁體中文。",
      "規則：引用經文時標出處；不知道就說需查證；不要編造作者生卒、曲調或樂譜細節；草稿須人審。",
      "詩名／資料：" + (title || "（使用者未填）"),
      extra ? "補充：" + extra : "",
      "請只挑與這首最相關的學科（不必寫滿），每科 80–150 字：定義關聯、可教一點、崇拜可用一點。文末列「未核實」。",
      "學科代碼清單：",
      codes
    ].filter(Boolean).join("\n");
  }

  global.PhSearch = {
    search: search,
    hymnUrl: hymnUrl,
    matchDisciplines: matchDisciplines,
    promptText: promptText
  };
})(typeof window !== "undefined" ? window : this);
