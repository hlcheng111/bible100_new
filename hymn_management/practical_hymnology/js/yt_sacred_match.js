/**
 * 聖詩影音庫 · 對站內歌名（建議＋人確認）
 * 依賴 window.PH_SEARCH_INDEX（可選；未載入則建議為空）
 */
(function (global) {
  "use strict";

  /** 常見英／中別名 → 搜尋用關鍵字（半自動） */
  var ALIASES = [
    { keys: ["amazing grace", "奇異恩典", "奇異的恩典"], hint: "amazing grace" },
    { keys: ["how great thou art", "你真偉大", "真神之愛"], hint: "how great thou art" },
    { keys: ["blessed assurance", "蒙福保證", "有福的確據"], hint: "blessed assurance" },
    { keys: ["what a friend we have in jesus", "耶穌恩友", "耶穌是我親愛朋友"], hint: "what a friend" },
    { keys: ["holy holy holy", "聖哉聖哉聖哉", "聖哉三一"], hint: "holy holy holy" },
    { keys: ["it is well with my soul", "我心靈得安寧", "心靈安寧"], hint: "it is well" },
    { keys: ["great is thy faithfulness", "你的信實廣大"], hint: "great is thy faithfulness" },
    { keys: ["be still my soul", "我靈鎮靜", "安息我心"], hint: "be still my soul" },
    { keys: ["come thou fount", "來啊造福泉源", "萬福源頭"], hint: "come thou fount" },
    { keys: ["nearer my god to thee", "更近我主", "與主更親近"], hint: "nearer my god" },
    { keys: ["rock of ages", "萬古磐石", "萬古盤石"], hint: "rock of ages" },
    { keys: ["the old rugged cross", "古舊十架", "奇妙十架"], hint: "old rugged cross" },
    { keys: ["just as i am", "照我本相"], hint: "just as i am" },
    { keys: ["silent night", "平安夜"], hint: "silent night" },
    { keys: ["how great our joy", "喜樂何其大"], hint: "how great our joy" }
  ];

  function normalizeTitle(t) {
    return String(t || "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\(.*?\)|\[.*?\]/g, " ")
      .replace(/\binstrumental\b|\bpiano\b|\borgan\b|\bcover\b|\blive\b|\bversion\b|\b fore\b/gi, " ")
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function hymnIndex() {
    var idx = global.PH_SEARCH_INDEX;
    return (idx && idx.hymns) || [];
  }

  function aliasHint(norm) {
    for (var i = 0; i < ALIASES.length; i++) {
      var a = ALIASES[i];
      for (var j = 0; j < a.keys.length; j++) {
        if (norm.indexOf(normalizeTitle(a.keys[j])) >= 0 || normalizeTitle(a.keys[j]).indexOf(norm) >= 0) {
          return normalizeTitle(a.hint);
        }
      }
    }
    return "";
  }

  function scoreHymn(queryNorm, hymn) {
    if (!queryNorm) return 0;
    var zh = normalizeTitle(hymn.zh);
    var en = normalizeTitle(hymn.en);
    var blob = zh + " " + en + " " + normalizeTitle(hymn.author || "");
    var score = 0;
    if (zh === queryNorm || en === queryNorm) score += 100;
    if (zh.indexOf(queryNorm) >= 0 || en.indexOf(queryNorm) >= 0) score += 40;
    if (blob.indexOf(queryNorm) >= 0) score += 20;
    var toks = queryNorm.split(" ").filter(function (t) { return t.length >= 3; });
    for (var i = 0; i < toks.length; i++) {
      if (blob.indexOf(toks[i]) >= 0) score += Math.min(8, toks[i].length);
    }
    var hint = aliasHint(queryNorm);
    if (hint && (blob.indexOf(hint) >= 0 || zh.indexOf(hint) >= 0 || en.indexOf(hint) >= 0)) score += 35;
    return score;
  }

  function suggestForTitle(title, limit) {
    limit = limit || 5;
    var hymns = hymnIndex();
    var q = normalizeTitle(title);
    if (!q || !hymns.length) return [];
    var hint = aliasHint(q);
    var scored = [];
    for (var i = 0; i < hymns.length; i++) {
      var h = hymns[i];
      var s = scoreHymn(q, h);
      if (hint) s = Math.max(s, scoreHymn(hint, h) * 0.9);
      if (s < 28) continue;
      scored.push({
        id: h.id,
        zh: h.zh,
        en: h.en,
        path: h.path,
        num: h.num,
        score: Math.round(s)
      });
    }
    scored.sort(function (a, b) { return b.score - a.score; });
    var out = [];
    var seen = {};
    for (var k = 0; k < scored.length && out.length < limit; k++) {
      if (seen[scored[k].id]) continue;
      seen[scored[k].id] = 1;
      out.push(scored[k]);
    }
    return out;
  }

  function labelOf(cand) {
    if (!cand) return "";
    var s = String(cand.zh || cand.en || cand.id || "");
    if (s.length > 72) s = s.slice(0, 70) + "…";
    return s;
  }

  function applySuggestion(track, cand) {
    if (!track || !cand) return track;
    track.hymn_id = cand.id;
    track.hymn_label = labelOf(cand);
    track.hymn_path = cand.path || null;
    track.hymn_match_status = "suggested";
    return track;
  }

  function confirmMatch(track, cand) {
    if (!track) return track;
    if (cand) {
      track.hymn_id = cand.id;
      track.hymn_label = labelOf(cand);
      track.hymn_path = cand.path || null;
    }
    if (!track.hymn_id) return track;
    track.hymn_match_status = "confirmed";
    return track;
  }

  function clearMatch(track) {
    if (!track) return track;
    track.hymn_id = null;
    track.hymn_label = null;
    track.hymn_path = null;
    track.hymn_match_status = "none";
    return track;
  }

  function rejectMatch(track) {
    if (!track) return track;
    track.hymn_id = null;
    track.hymn_label = null;
    track.hymn_path = null;
    track.hymn_match_status = "rejected";
    return track;
  }

  function isMatchEligible(t) {
    if (!t) return false;
    var src = String(t.source || "legacy").toLowerCase();
    // 字典／示範／不明來源不進正式對名
    if (src === "dictionary" || src === "legacy" || src === "memo") return false;
    return src === "chapter" || src === "ytdlp" || src === "import" || src === "url_stub";
  }

  /** 批次：僅對可信來源、尚未確認／拒絕的曲目寫入建議（不自動 confirmed） */
  function suggestBatch(tracks, opts) {
    opts = opts || {};
    var minScore = opts.minScore || 45;
    var onlyUnset = opts.onlyUnset !== false;
    var n = 0;
    (tracks || []).forEach(function (t) {
      if (!t) return;
      if (!isMatchEligible(t)) return;
      if (onlyUnset && t.hymn_match_status && t.hymn_match_status !== "none" && t.hymn_match_status !== "suggested") return;
      if (t.hymn_match_status === "confirmed" || t.hymn_match_status === "rejected") return;
      var cands = suggestForTitle(t.title, 3);
      if (!cands.length || cands[0].score < minScore) return;
      applySuggestion(t, cands[0]);
      n++;
    });
    return n;
  }

  global.YtSacredMatch = {
    normalizeTitle: normalizeTitle,
    suggestForTitle: suggestForTitle,
    suggestBatch: suggestBatch,
    isMatchEligible: isMatchEligible,
    applySuggestion: applySuggestion,
    confirmMatch: confirmMatch,
    clearMatch: clearMatch,
    rejectMatch: rejectMatch,
    labelOf: labelOf,
    ALIASES: ALIASES
  };
})(typeof window !== "undefined" ? window : this);
