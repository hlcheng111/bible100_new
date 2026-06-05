/**
 * 80/20 分析純函數（不依賴 Vue／DOM）。以 window.EightyTwentyEngine 暴露。
 */
(function (global) {
  "use strict";

  var TOP20_HELP =
    "前 20%：排序後取 ceil(樣本數×0.2)，至少 1 項；樣本過少時僅供討論引導，非絕對排名。";

  function trim(s) {
    return String(s == null ? "" : s).trim();
  }

  /** 逗號分隔字串 → 非空陣列 */
  function splitToArray(str) {
    if (!str) return [];
    return String(str)
      .split(/[,，、\n]+/)
      .map(function (s) {
        return trim(s);
      })
      .filter(function (s) {
        return s.length > 0;
      });
  }

  /** 計數並依次數降序回傳 [ [key, count], ... ] */
  function countAndSort(arr) {
    var map = {};
    (arr || []).forEach(function (item) {
      if (!item) return;
      var k = String(item);
      map[k] = (map[k] || 0) + 1;
    });
    return Object.keys(map)
      .map(function (k) {
        return [k, map[k]];
      })
      .sort(function (a, b) {
        return b[1] - a[1];
      });
  }

  /** 取前 20% 項數：至少 1，樣本 0 則 0 */
  function topFractionCount(sampleSize) {
    var n = Number(sampleSize) || 0;
    if (n <= 0) return 0;
    return Math.max(1, Math.ceil(n * 0.2));
  }

  /**
   * 依分數排序索引，取前 topFractionCount(length) 個索引。
   * getScore(row, index) → number
   */
  function topIndicesByScore(rows, getScore, descending) {
    var arr = Array.isArray(rows) ? rows : [];
    var len = arr.length;
    if (!len) return [];
    var take = topFractionCount(len);
    var idxs = arr.map(function (_, i) {
      return i;
    });
    var desc = descending !== false;
    idxs.sort(function (a, b) {
      var sa = Number(getScore(arr[a], a)) || 0;
      var sb = Number(getScore(arr[b], b)) || 0;
      return desc ? sb - sa : sa - sb;
    });
    return idxs.slice(0, take);
  }

  /** 事工列：價值分（深耕）與耗損分（檢討） */
  function ministryScores(row) {
    var m = Number(row && row.missionFit) || 0;
    var f = Number(row && row.fruit) || 0;
    var a = Number(row && row.adminBurden) || 0;
    var valueScore = 2 * m + 2 * f - a;
    var wasteScore = 2 * a + (6 - m) + (6 - f);
    return { valueScore: valueScore, wasteScore: wasteScore };
  }

  /**
   * 溝通議題：{ key, label, checked, severity 1-5 }
   * 回傳建議寫 SOP 的 key 列表（severity>=threshold 且 checked）
   */
  function commIssuesNeedingSop(issues, threshold) {
    var t = Number(threshold) > 0 ? Number(threshold) : 4;
    var list = Array.isArray(issues) ? issues : [];
    return list
      .filter(function (it) {
        return (
          it &&
          it.checked &&
          Number(it.severity) >= t
        );
      })
      .map(function (it) {
        return it.key || it.label || "";
      })
      .filter(function (k) {
        return trim(k).length > 0;
      });
  }

  /**
   * 嚴格 RI： (Impact × G) ÷ Effort，Effort 下限 0.1，結果兩位小數。
   */
  function computeRi(impact, theologyWeightG, effort) {
    var im = Number(impact);
    var g = Number(theologyWeightG);
    var e = Number(effort);
    if (!isFinite(im)) im = 0;
    if (!isFinite(g) || g <= 0) g = 1;
    if (!isFinite(e) || e <= 0) e = 0.1;
    return Number(((im * g) / e).toFixed(2));
  }

  /** 取 NCD／健康結果中（略過 load_boundary）單維內部標度峰值 */
  function dimensionListMaxInternal(dimensions) {
    var list = Array.isArray(dimensions) ? dimensions : [];
    var maxV = null;
    var SA = global.ScalingAdapter;
    for (var i = 0; i < list.length; i++) {
      var d = list[i] || {};
      var id = String(d.id || "").toLowerCase();
      var name = String(d.name || "").toLowerCase();
      if (id.indexOf("load_boundary") >= 0 || name.indexOf("負荷與界線") >= 0) continue;
      var ns = Number(d.normalizedScore);
      var internal;
      if (isFinite(ns)) {
        internal = Math.min(5, Math.max(1, ns));
      } else {
        var raw = Number(d.score);
        var mx = Number(d.max);
        if (!isFinite(raw) || !isFinite(mx) || mx <= 0) continue;
        if (SA && typeof SA.toInternalScale === "function" && mx >= 60) {
          internal = SA.toInternalScale(raw, SA.TOOL ? SA.TOOL.NCD_DIM_65 : "ncd_dim_65");
        } else {
          internal = Math.min(5, Math.max(1, (raw / mx) * 5));
        }
      }
      if (internal != null && isFinite(internal)) {
        if (maxV === null || internal > maxV) maxV = internal;
      }
    }
    return maxV;
  }

  /**
   * 跨工具張力：教會健康某維「感受上偏亮」（內部標度高），但領袖負荷／界線自評偏低（高耗損）。
   * @param {object|null} healthResult ChurchToolkit.loadHealthResult()
   * @param {number|null|undefined} pastoralLoadBoundaryLikert5 牧養問卷 load_boundary 維度分 1–5，越高＝界線／負荷調適較佳
   */
  function detectSensitivityDrainTension(healthResult, pastoralLoadBoundaryLikert5) {
    var maxInternal =
      healthResult && healthResult.dimensions
        ? dimensionListMaxInternal(healthResult.dimensions)
        : null;
    var lb = Number(pastoralLoadBoundaryLikert5);
    if (maxInternal == null || !isFinite(maxInternal)) return { triggered: false };
    if (!isFinite(lb)) return { triggered: false };
    var highSensitivity = maxInternal >= 4.0;
    var highDrain = lb <= 2.5;
    if (highSensitivity && highDrain) {
      return {
        triggered: true,
        tag: "預警：高感度、高耗損",
        detail:
          "教會健康診斷中至少一維在數據上相對亮眼，但領袖「負荷與界線」自評偏低，顯示高度耗損風險。請避免只用「會眾面向好看」掩蓋同工透支，並優先安排節奏與問責支持。"
      };
    }
    return { triggered: false };
  }

  global.EightyTwentyEngine = {
    TOP20_HELP: TOP20_HELP,
    splitToArray: splitToArray,
    countAndSort: countAndSort,
    topFractionCount: topFractionCount,
    topIndicesByScore: topIndicesByScore,
    ministryScores: ministryScores,
    commIssuesNeedingSop: commIssuesNeedingSop,
    computeRi: computeRi,
    dimensionListMaxInternal: dimensionListMaxInternal,
    detectSensitivityDrainTension: detectSensitivityDrainTension
  };
})(typeof window !== "undefined" ? window : this);
