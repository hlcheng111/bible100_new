// DEMO ONLY: fixture data for local testing — 非正式會友資料；列表／配對測試用
// 對齊 docs/DATA_CONTRACT_v0.1.md — GiftProfile（scores 為 1–5 李克特平均）

(function (global) {
  "use strict";

  var KEYS = [
    "teaching",
    "shepherding",
    "worship",
    "administration",
    "evangelism",
    "encouragement",
    "serving",
    "hospitality",
    "discernment",
  ];

  function round1(x) {
    return Math.round(x * 10) / 10;
  }

  /** 決定性偽隨機（0–1） */
  function seeded(n) {
    var x = Math.sin(n * 9999.971) * 10000;
    return x - Math.floor(x);
  }

  function buildScores(seed) {
    var o = {};
    KEYS.forEach(function (k, i) {
      o[k] = round1(1 + seeded(seed + i * 17) * 4);
    });
    return o;
  }

  function topFromScores(scores) {
    var arr = KEYS.map(function (k) {
      return { k: k, v: scores[k] };
    });
    arr.sort(function (a, b) {
      return b.v - a.v;
    });
    return [arr[0].k, arr[1].k, arr[2].k];
  }

  var fixtures = [];
  for (var i = 1; i <= 30; i++) {
    var pid = "demo-" + String(i).padStart(3, "0");
    var scores = buildScores(i * 100);
    fixtures.push({
      personId: pid,
      scores: scores,
      topGiftIds: topFromScores(scores),
      updatedAt: "2026-04-14T00:00:00.000Z",
    });
  }

  global.DEMO_GIFT_FIXTURES = fixtures;
})(typeof window !== "undefined" ? window : this);
