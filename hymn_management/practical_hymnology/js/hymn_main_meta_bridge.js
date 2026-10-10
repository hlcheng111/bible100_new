/**
 * 影音庫只「消費」主資料：節期／異本掛 HYMN_AXES（或本檔輕量異本表），
 * 不在 YouTube 曲目上另造節期真相。
 */
(function (global) {
  "use strict";

  /** 同曲異本：主鍵＝站內 hymn_id 群；影音庫用 confirmed 的 hymn_id 對上即可 */
  var VARIANT_GROUPS = [
    {
      id: "amazing_grace",
      label: "奇異恩典 / Amazing Grace",
      hymn_ids: ["hymn_most_0121"]
    },
    {
      id: "holy_holy_holy",
      label: "聖哉三一 / Holy, Holy, Holy",
      hymn_ids: []
    },
    {
      id: "silent_night",
      label: "平安夜 / Silent Night",
      hymn_ids: ["hymn_most_0025"]
    },
    {
      id: "sussex_carol",
      label: "索塞克斯聖誕頌",
      hymn_ids: ["hymn_00_0004"]
    }
  ];

  function axesOf(hymnId) {
    var ax = global.HYMN_AXES && global.HYMN_AXES.hymns;
    if (!ax) return null;
    return ax[String(hymnId || "")] || null;
  }

  function seasonsOfHymn(hymnId) {
    var row = axesOf(hymnId);
    return (row && row.seasons) ? row.seasons.slice() : [];
  }

  function currentSeason() {
    if (global.B100LiturgicalYear && typeof global.B100LiturgicalYear.seasonOf === "function") {
      return global.B100LiturgicalYear.seasonOf(new Date());
    }
    return { code: "ordinary", zh: "常年期" };
  }

  function matchSeasonCodes(code) {
    if (global.B100LiturgicalYear && typeof global.B100LiturgicalYear.matchCodes === "function") {
      return global.B100LiturgicalYear.matchCodes(code);
    }
    return code ? [code] : [];
  }

  /** 已確認曲目中，主資料 seasons 命中本週節期者 */
  function filterTracksByCurrentSeason(tracks) {
    var season = currentSeason();
    var codes = matchSeasonCodes(season.code);
    if (!codes.length) return { season: season, tracks: [] };
    var out = (tracks || []).filter(function (t) {
      if (!t || t.hymn_match_status !== "confirmed" || !t.hymn_id) return false;
      var ss = seasonsOfHymn(t.hymn_id);
      for (var i = 0; i < ss.length; i++) {
        if (codes.indexOf(ss[i]) >= 0) return true;
      }
      return false;
    });
    return { season: season, tracks: out };
  }

  function variantGroupForHymnId(hymnId) {
    var id = String(hymnId || "");
    if (!id) return null;
    for (var i = 0; i < VARIANT_GROUPS.length; i++) {
      var g = VARIANT_GROUPS[i];
      if ((g.hymn_ids || []).indexOf(id) >= 0) return g;
    }
    return null;
  }

  function buildAiPrompts(tracks) {
    var list = (tracks || []).filter(function (t) {
      return t && t.hymn_match_status === "confirmed" && t.hymn_id;
    }).slice(0, 12);
    var lines = list.map(function (t, i) {
      return (i + 1) + ". " + (t.hymn_label || t.title) +
        " [hymn_id=" + t.hymn_id + "]" +
        (t.videoId ? " YT=" + t.videoId + "@" + (t.time || "0:00") : "");
    });
    var roster = lines.length ? lines.join("\n") : "（尚無已確認曲目）";
    var medley = [
      "你是教會敬拜組曲草稿助手，不是神學權威。請用繁體中文。",
      "規則：不編造經文；調性／拍號若不確定就標「需司琴核對」；草稿須人審，不可當正式崇拜程序。",
      "任務：從下列「已確認」曲目中，挑 3 首做成約 15 分鐘安靜默想組曲（速度宜漸進、主題連貫）。",
      "已確認曲目：",
      roster,
      "請輸出：①選曲理由 ②建議順序與約略分鐘 ③轉接一句話 ④未核實清單。"
    ].join("\n");
    var story = [
      "你是聖詩背景與靈修短評草稿助手，不是神學權威。請用繁體中文。",
      "規則：引用經文須標出處；作者生卒、曲調名不確定就明說需查證；不可宣稱屬靈權威；草稿須人審。",
      "請就下列第一首（若無則請使用者改選）寫：創作背景（約 120 字）＋靈修默想指引（三點可操作）＋未核實。",
      "曲目：",
      roster
    ].join("\n");
    return { medley: medley, story: story, count: list.length };
  }

  global.HymnMainMetaBridge = {
    VARIANT_GROUPS: VARIANT_GROUPS,
    axesOf: axesOf,
    seasonsOfHymn: seasonsOfHymn,
    currentSeason: currentSeason,
    filterTracksByCurrentSeason: filterTracksByCurrentSeason,
    variantGroupForHymnId: variantGroupForHymnId,
    buildAiPrompts: buildAiPrompts
  };
})(typeof window !== "undefined" ? window : this);
