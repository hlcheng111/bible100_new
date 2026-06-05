/**
 * 健康類靈命問卷共用計分（純函式，無 DOM）。
 *
 * 紅／黃／綠門檻（2026 改版）：綠 ≥ 4.0；黃 ≥ 2.8 且 < 4.0；紅 < 2.8。
 * 若調整門檻或計分規則，請同步更新 docs/SURVEY_DESIGN_PRINCIPLES.md §四。
 */
(function (global) {
  "use strict";

  function normalizeScore(raw, reversed) {
    var val = typeof raw === "string" ? parseInt(raw, 10) : Number(raw);
    if (!isFinite(val) || val < 1 || val > 5) return null;
    return reversed ? 6 - val : val;
  }

  /**
   * @param {Object<string, string>} answers 題目 id → 選取值字串（如 "3"）
   * @param {Object<string, { dim: string, reversed: boolean }>} questionMap
   * @returns {Object<string, number>} 維度 key → 平均（一位小數）
   */
  function computeDimensionScores(answers, questionMap) {
    var buckets = {};
    for (var qid in questionMap) {
      if (!Object.prototype.hasOwnProperty.call(questionMap, qid)) continue;
      var meta = questionMap[qid];
      var raw = answers[qid];
      if (raw === undefined || raw === null || raw === "") continue;
      var norm = normalizeScore(raw, !!meta.reversed);
      if (norm === null) continue;
      var dim = meta.dim;
      if (!buckets[dim]) buckets[dim] = { sum: 0, n: 0 };
      buckets[dim].sum += norm;
      buckets[dim].n += 1;
    }
    var out = {};
    for (var d in buckets) {
      if (!Object.prototype.hasOwnProperty.call(buckets, d)) continue;
      if (buckets[d].n === 0) continue;
      out[d] = Math.round((buckets[d].sum / buckets[d].n) * 10) / 10;
    }
    return out;
  }

  /**
   * @param {Object<string, number>} dimScores
   * @returns {number|null}
   */
  function computeOverallScore(dimScores) {
    var vals = [];
    for (var k in dimScores) {
      if (!Object.prototype.hasOwnProperty.call(dimScores, k)) continue;
      var v = dimScores[k];
      if (typeof v === "number" && isFinite(v)) vals.push(v);
    }
    if (vals.length === 0) return null;
    var sum = vals.reduce(function (s, x) {
      return s + x;
    }, 0);
    return Math.round((sum / vals.length) * 10) / 10;
  }

  /**
   * @param {number|null|undefined} score
   * @returns {"green"|"yellow"|"red"}
   */
  function levelFromScore(score) {
    if (score === null || score === undefined || !isFinite(score)) return "red";
    if (score >= 4.0) return "green";
    if (score >= 2.8) return "yellow";
    return "red";
  }

  global.normalizeScore = normalizeScore;
  global.computeDimensionScores = computeDimensionScores;
  global.computeOverallScore = computeOverallScore;
  global.levelFromScore = levelFromScore;
})(typeof globalThis !== "undefined" ? globalThis : this);
