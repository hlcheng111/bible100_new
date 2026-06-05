/**
 * Smart Ministry — 配對 demo（前端）
 * 資料結構對齊 docs/DATA_CONTRACT_v0.1.md 之 GiftProfile、RoleDefinition。
 *
 * 標準化公式（0–100）：
 * raw = Σ_g ( weight[g] * score[g] )，其中 score[g] 為 1–5 李克特平均，缺漏視為 0。
 * maxRaw = Σ_g ( weight[g] * 5 )，僅對權重 > 0 的向度累加（理論上若每題皆答滿分 5）。
 * matchScore = (raw / maxRaw) * 100，四捨五入至整數。
 */
(function (global) {
  "use strict";

  /** 與 DATA_CONTRACT_v0.1.md §3.3「九向度」一致 */
  var DEMO_GIFT_KEYS = [
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

  /** 示範崗位：僅使用 weights.gifts；權重非負，建議針對所用向度加總為 1。結構對齊 RoleDefinition。 */
  var DEMO_ROLE_DEFINITIONS = [
    {
      roleId: "role_sunday_teacher",
      congregationId: null,
      name: "主日學／兒童教導同工",
      weights: {
        gifts: {
          teaching: 0.45,
          shepherding: 0.35,
          encouragement: 0.2,
        },
      },
      priorityTag: "DEMO",
      experienceThreshold: "曾參與小組或教學事工佳",
      updatedAt: new Date().toISOString(),
    },
    {
      roleId: "role_worship_team",
      congregationId: null,
      name: "敬拜團（帶領／樂器）",
      weights: {
        gifts: {
          worship: 0.5,
          encouragement: 0.25,
          serving: 0.25,
        },
      },
      priorityTag: "DEMO",
      experienceThreshold: "能配合排練與主日時段",
      updatedAt: new Date().toISOString(),
    },
    {
      roleId: "role_hospitality_evangelism",
      congregationId: null,
      name: "接待／新朋友關懷",
      weights: {
        gifts: {
          hospitality: 0.35,
          evangelism: 0.35,
          serving: 0.2,
          encouragement: 0.1,
        },
      },
      priorityTag: "DEMO",
      experienceThreshold: "樂於與陌生人交談",
      updatedAt: new Date().toISOString(),
    },
  ];

  /**
   * @param {Record<string, number>} scores
   * @param {number} [topN=3]
   * @returns {string[]}
   */
  function topGiftIdsFromScores(scores, topN) {
    topN = topN == null ? 3 : topN;
    var entries = Object.keys(scores || {}).map(function (k) {
      return { id: k, v: scores[k] };
    });
    entries.sort(function (a, b) {
      return b.v - a.v;
    });
    return entries.slice(0, topN).map(function (e) {
      return e.id;
    });
  }

  /**
   * @param {{ scores?: Record<string, number> }} giftProfile — 契約 GiftProfile；需含 scores（1–5）
   * @param {Array} roleDefinitions — RoleDefinition 陣列
   * @returns {Array<{ roleId: string, name: string, score: number, giftFit: string, breakdown: Record<string, number> }>}
   */
  function matchPersonToRoles(giftProfile, roleDefinitions) {
    var scores = (giftProfile && giftProfile.scores) || {};
    var list = (roleDefinitions || []).map(function (role) {
      var gw = (role.weights && role.weights.gifts) || {};
      var raw = 0;
      var maxRaw = 0;
      var breakdown = {};
      Object.keys(gw).forEach(function (g) {
        var w = Number(gw[g]) || 0;
        if (w <= 0) return;
        var s = Number(scores[g]);
        if (isNaN(s)) s = 0;
        var part = w * s;
        raw += part;
        maxRaw += w * 5;
        breakdown[g] = Math.round(part * 100) / 100;
      });
      var score100 =
        maxRaw > 0 ? Math.round((raw / maxRaw) * 100) : 0;
      var giftFit = buildGiftFitSentence(role.name, gw, scores, topGiftIdsFromScores(scores, 3));
      return {
        roleId: role.roleId,
        name: role.name,
        score: score100,
        giftFit: giftFit,
        breakdown: breakdown,
      };
    });
    list.sort(function (a, b) {
      return b.score - a.score;
    });
    return list;
  }

  function giftLabelEn(key) {
    var map = {
      teaching: "teaching",
      shepherding: "shepherding",
      worship: "worship",
      administration: "administration",
      evangelism: "evangelism",
      encouragement: "encouragement",
      serving: "serving",
      hospitality: "hospitality",
      discernment: "discernment",
    };
    return map[key] || key;
  }

  function buildGiftFitSentence(roleName, weights, scores, topIds) {
    var parts = [];
    Object.keys(weights).forEach(function (g) {
      if ((weights[g] || 0) > 0.15 && scores[g] != null && scores[g] >= 3.5) {
        parts.push(giftLabelEn(g) + "（約 " + scores[g].toFixed(1) + "）");
      }
    });
    var topStr = topIds && topIds.length ? topIds.map(giftLabelEn).join("、") : "";
    var head = "你與「" + roleName + "」的配對度主要參考";
    if (parts.length) {
      return head + "：較高的 " + parts.join("，") + "；你的強項向度為 " + topStr + "。";
    }
    return head + "你的恩賜向度 " + topStr + "；可與牧者禱告是否合適此崗位。";
  }

  global.DEMO_GIFT_KEYS = DEMO_GIFT_KEYS;
  global.DEMO_ROLE_DEFINITIONS = DEMO_ROLE_DEFINITIONS;
  global.matchPersonToRoles = matchPersonToRoles;
  global.topGiftIdsFromScores = topGiftIdsFromScores;
})(typeof window !== "undefined" ? window : this);
