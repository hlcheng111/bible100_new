/**
 * Strategy logic for church ministry RI calculation.
 * Keeps theology weighting and cross-module adapters decoupled from UI.
 */
(function (global) {
  "use strict";

  var RI_PRUNE_THRESHOLD = 0.5;
  var DEFAULT_PRUNE_ADVICE = "建議進行 80/20 深度修剪";

  var THEOLOGY_WEIGHTS = {
    core: 1.5,
    regular: 1.0,
    admin: 0.8
  };

  var IMPACT_DIMENSIONS = [
    { key: "truth_practice", label: "真理實踐" },
    { key: "prayer_worship", label: "禱告敬拜" },
    { key: "fellowship_care", label: "團契關懷" },
    { key: "mission_service", label: "福音外展／服事" },
    { key: "leadership_stewardship", label: "領導治理" }
  ];

  var CONFLICT_MATRIX = {
    high_high: "⚠️ 衝突警告：該目標面臨高威脅(RI)，卻標註為極易達成(A)。請確認是否有足夠預算或同工支持，避免過度樂觀。",
    low_low: "💡 提示：該目標風險低且目前能力也標註為低。可先採小步快跑實驗，不建議一次投入大量固定資源。",
    high_low: "🚩 關鍵卡點：這是高價值但高難度目標，建議拆解多個子階段，先補強能力(A)缺口。"
  };

  function toNum(v) {
    var n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  function normalizeText(v) {
    return String(v == null ? "" : v).trim().toLowerCase();
  }

  function inferALevel(aText) {
    var t = normalizeText(aText);
    if (!t) return "low";
    if (t.indexOf("high") >= 0 || t.indexOf("高") >= 0 || t.indexOf("充足") >= 0 || t.indexOf("可行") >= 0) {
      return "high";
    }
    return "low";
  }

  function inferRiLevel(swotQuadrant) {
    var q = String(swotQuadrant || "").toUpperCase();
    return q === "T" || q === "W" ? "high" : "low";
  }

  function leadershipConfidence(goal, healthScores) {
    var hs = healthScores || {};
    var leadScore = toNum(hs.leadership);
    var aLevel = inferALevel(goal && goal.smart ? goal.smart.a : "");
    if (leadScore != null && leadScore <= 2 && aLevel === "high") {
      return {
        status: "SKEPTICAL",
        warning: "⚠️ 領袖力評分較低，高難度目標可能面臨推動無力風險，建議先增加共識營與同工支持配套。"
      };
    }
    if (leadScore != null && leadScore >= 4) {
      return {
        status: "VALIDATED",
        warning: ""
      };
    }
    return {
      status: "NORMAL",
      warning: ""
    };
  }

  function checkGoalConflicts(goal, healthScores) {
    if (!goal || !goal.smart || !goal.swotRef) return [];
    var results = [];
    var riLevel = inferRiLevel(goal.swotRef.quadrant);
    var aLevel = inferALevel(goal.smart.a);
    var matrixKey = riLevel + "_" + aLevel;
    if (CONFLICT_MATRIX[matrixKey]) {
      results.push({
        type: "STRATEGY_MISMATCH",
        severity: "yellow",
        message: CONFLICT_MATRIX[matrixKey]
      });
    }
    var financeScore = toNum((healthScores || {}).finance);
    if (aLevel === "high" && financeScore != null && financeScore <= 2) {
      results.push({
        type: "RESOURCE_GAP",
        severity: "red",
        message: "❌ 資源衝突：教會財務健康度偏低，但目標標註為易達成，存在預算風險。"
      });
    }
    var confidence = leadershipConfidence(goal, healthScores || {});
    if (confidence.status === "SKEPTICAL" && confidence.warning) {
      results.push({
        type: "LEADERSHIP_GAP",
        severity: "yellow",
        message: confidence.warning
      });
    }
    return results;
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function findHealthDimensionScore(dimensions, key) {
    var list = Array.isArray(dimensions) ? dimensions : [];
    var keywordMap = {
      truth_practice: ["門徒", "真理", "話語", "靈修", "discipleship", "scripture"],
      prayer_worship: ["敬拜", "禱告", "崇拜", "worship", "prayer"],
      fellowship_care: ["團契", "關係", "關懷", "人際", "fellowship", "relationship"],
      mission_service: ["佈道", "宣教", "外展", "服事", "evangel", "mission", "service"],
      leadership_stewardship: ["領導", "治理", "管家", "領袖", "leadership", "steward"]
    };
    var keywords = keywordMap[key] || [];
    var SA = global.ScalingAdapter;
    for (var i = 0; i < list.length; i++) {
      var d = list[i] || {};
      var id = String(d.id || "").toLowerCase();
      var name = String(d.name || "").toLowerCase();
      for (var k = 0; k < keywords.length; k++) {
        var kw = String(keywords[k]).toLowerCase();
        if (id.indexOf(kw) >= 0 || name.indexOf(kw) >= 0) {
          var storedNorm = toNum(d.normalizedScore);
          if (storedNorm != null) return clamp(storedNorm, 1, 5);
          var rawScore = toNum(d.score);
          var rawMax = toNum(d.max) || 65;
          if (rawScore == null || rawMax <= 0) continue;
          var internal;
          if (SA && typeof SA.toInternalScale === "function" && rawMax >= 60) {
            internal = SA.toInternalScale(rawScore, SA.TOOL ? SA.TOOL.NCD_DIM_65 : "ncd_dim_65");
          } else {
            internal = (rawScore / rawMax) * 5;
          }
          return clamp(internal, 1, 5);
        }
      }
    }
    return null;
  }

  function mapLoadBoundaryToEffort(dimensions) {
    var list = Array.isArray(dimensions) ? dimensions : [];
    for (var i = 0; i < list.length; i++) {
      var d = list[i] || {};
      var id = String(d.id || "").toLowerCase();
      var name = String(d.name || "").toLowerCase();
      if (id.indexOf("load_boundary") >= 0 || name.indexOf("負荷與界線") >= 0) {
        var rawScore = toNum(d.score);
        var rawMax = toNum(d.max) || 5;
        if (rawScore == null || rawMax <= 0) return null;
        return clamp(6 - (rawScore / rawMax) * 5, 1, 5);
      }
    }
    return null;
  }

  function loadA1HealthResult() {
    try {
      var raw = global.localStorage.getItem("chp2026-a1-health-results");
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return parsed && parsed.normalizedByImpact ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  function loadHealthResultUnified(contextHealthResult) {
    if (contextHealthResult) return contextHealthResult;
    if (global.ChurchToolkit && typeof global.ChurchToolkit.loadHealthResult === "function") {
      try {
        return global.ChurchToolkit.loadHealthResult();
      } catch (e) {}
    }
    return null;
  }

  function loadPastoralHealthLogArray() {
    var keys = ["chp2026-pastoral-health-log-v1", "church_planning_pastoral_spiritual_health"];
    for (var i = 0; i < keys.length; i++) {
      try {
        var raw = global.localStorage.getItem(keys[i]);
        if (!raw) continue;
        var arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length) return arr;
      } catch (e) {}
    }
    return null;
  }

  function loadPastoralLoadBoundaryScore() {
    try {
      var arr = loadPastoralHealthLogArray();
      if (!arr || !arr.length) return null;
      var latest = arr[arr.length - 1] || {};
      var ds = latest.dimension_scores || {};
      var score = toNum(ds.load_boundary);
      return score != null ? clamp(score, 1, 5) : null;
    } catch (e) {
      return null;
    }
  }

  function theologyWeightOf(category) {
    return THEOLOGY_WEIGHTS[category] || THEOLOGY_WEIGHTS.regular;
  }

  function resolveImpact(row, healthResult) {
    var dimKey = row && row.impactDimensionKey ? row.impactDimensionKey : "truth_practice";
    var linked = healthResult && healthResult.dimensions
      ? findHealthDimensionScore(healthResult.dimensions, dimKey)
      : null;
    if (linked != null) {
      return { value: clamp(linked, 1, 5), source: "health-linked", dimensionKey: dimKey };
    }
    var a1 = loadA1HealthResult();
    var a1Score = a1 && a1.normalizedByImpact ? toNum(a1.normalizedByImpact[dimKey]) : null;
    if (a1Score != null) {
      return { value: clamp(a1Score, 1, 5), source: "health-linked (A1)", dimensionKey: dimKey };
    }
    var selfRated = toNum(row && row.impactInput);
    return {
      value: clamp(selfRated != null ? selfRated : 3, 1, 5),
      source: "self-rated",
      dimensionKey: dimKey
    };
  }

  function resolveEffort(row, healthResult) {
    var loadBoundary = healthResult && healthResult.dimensions
      ? mapLoadBoundaryToEffort(healthResult.dimensions)
      : null;
    if (loadBoundary != null) {
      return { value: clamp(loadBoundary, 1, 5), source: "a2-load-boundary" };
    }
    var pastoralLoadBoundary = loadPastoralLoadBoundaryScore();
    if (pastoralLoadBoundary != null) {
      return { value: clamp(6 - pastoralLoadBoundary, 1, 5), source: "a2-load-boundary" };
    }
    var admin = toNum(row && row.adminBurden);
    var idx = toNum(row && row.effortLoadIndex);
    var fallback = idx != null && admin != null ? (idx + admin) / 2 : (idx != null ? idx : admin);
    return { value: clamp(fallback != null ? fallback : 3, 1, 5), source: "fallback-admin-plus-index" };
  }

  function buildRiAdvice(result, options) {
    if (!result || !result.isPruneCandidate) return "";
    var fn = options && typeof options.adviceGenerator === "function" ? options.adviceGenerator : null;
    if (fn) {
      try {
        var text = fn(result);
        if (text) return String(text);
      } catch (e) {}
    }
    return DEFAULT_PRUNE_ADVICE;
  }

  function calculateMinistryHealth(row, context, options) {
    var safeRow = row || {};
    var safeCtx = context || {};
    var unifiedHealthResult = loadHealthResultUnified(safeCtx.healthResult);
    var g = theologyWeightOf(safeRow.theologyCategory);
    var impact = resolveImpact(safeRow, unifiedHealthResult);
    var effort = resolveEffort(safeRow, unifiedHealthResult);
    var ri =
      global.EightyTwentyEngine && typeof global.EightyTwentyEngine.computeRi === "function"
        ? global.EightyTwentyEngine.computeRi(impact.value, g, effort.value)
        : Number(((impact.value * g) / Math.max(0.1, effort.value)).toFixed(2));
    var result = {
      theologyWeight: g,
      impact: impact.value,
      effort: effort.value,
      riScore: ri,
      isPruneCandidate: ri < RI_PRUNE_THRESHOLD,
      impactSource: impact.source,
      effortSource: effort.source,
      impactDimensionKey: impact.dimensionKey
    };
    result.riAdvice = buildRiAdvice(result, options);
    return result;
  }

  function buildAdvisorPayload(form, context) {
    var rows = (form && Array.isArray(form.ministryRows)) ? form.ministryRows : [];
    var safeCtx = context || {};
    var analyzed = [];
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i] || {};
      var m = calculateMinistryHealth(r, safeCtx, {});
      var ms = (global.EightyTwentyEngine && global.EightyTwentyEngine.ministryScores)
        ? global.EightyTwentyEngine.ministryScores(r)
        : { valueScore: 0, wasteScore: 0 };
      analyzed.push({
        id: r.id || ("min_" + i),
        idx: i,
        name: r.name || "（未命名）",
        theologyCategory: r.theologyCategory || "regular",
        theologyWeight: m.theologyWeight,
        riScore: m.riScore,
        impact: m.impact,
        effort: m.effort,
        impactSource: m.impactSource,
        effortSource: m.effortSource,
        valueScore: Number(ms.valueScore) || 0,
        wasteScore: Number(ms.wasteScore) || 0
      });
    }

    var valid = analyzed.filter(function (x) {
      return Number.isFinite(Number(x.riScore));
    });
    var avgRi = valid.length
      ? Number((valid.reduce(function (s, x) { return s + Number(x.riScore); }, 0) / valid.length).toFixed(2))
      : 0;
    var redZone = valid.filter(function (x) {
      return Number(x.riScore) < RI_PRUNE_THRESHOLD;
    });
    var criticalPruningList = redZone.filter(function (x) {
      return x.theologyCategory !== "core";
    });
    var coreCrisis = redZone.filter(function (x) {
      return x.theologyCategory === "core";
    });

    var recommendations = valid
      .slice()
      .sort(function (a, b) {
        if (a.riScore !== b.riScore) return a.riScore - b.riScore;
        return a.valueScore - b.valueScore;
      })
      .slice(0, 3)
      .map(function (x) {
        var reason = x.riScore < RI_PRUNE_THRESHOLD
          ? "RI 低於修剪閾值，且當前投入產出失衡。"
          : "RI 在整體中偏低，建議先進行小規模重整。";
        return {
          id: x.id,
          name: x.name,
          reason: reason,
          riScore: x.riScore
        };
      });

    var adminWaste = valid
      .filter(function (x) {
        return x.theologyCategory === "admin" && x.effort >= 4 && x.impact <= 2.5;
      })
      .sort(function (a, b) {
        return b.effort - a.effort;
      });
    var coreNeedy = valid
      .filter(function (x) {
        return x.theologyCategory === "core" && (x.impact >= 4 || x.riScore < RI_PRUNE_THRESHOLD);
      })
      .sort(function (a, b) {
        return a.riScore - b.riScore;
      });
    var pairCount = Math.min(adminWaste.length, coreNeedy.length, 3);
    var transferLeads = [];
    for (var p = 0; p < pairCount; p++) {
      transferLeads.push({
        fromMinistryId: adminWaste[p].id,
        fromMinistryName: adminWaste[p].name,
        toMinistryId: coreNeedy[p].id,
        toMinistryName: coreNeedy[p].name,
        rationale: "行政事工高負荷低影響，可釋放人力支援核心使命低 RI 事工。"
      });
    }

    var inferredTags = [];
    var a1Payload = loadA1HealthResult();
    var memberSignals = Object.assign({}, (a1Payload && a1Payload.memberSignals) || {}, safeCtx.memberSignals || {});
    var serviceSatisfaction = toNum(memberSignals.serviceSatisfaction);
    if (serviceSatisfaction != null && serviceSatisfaction <= 2) {
      inferredTags.push("事工與恩賜不匹配");
    }
    var pastoralCareHint = "";
    if (serviceSatisfaction != null && serviceSatisfaction < 2.5) {
      pastoralCareHint =
        "注意：雖然事工表現可能良好，但參與同工的滿意度極低，建議在 Act (PDCA) 階段優先處理牧養關懷。";
    }

    var output = {
      summary: {
        avgRi: avgRi,
        totalRedZone: redZone.length,
        coreMisalignmentCount: coreCrisis.length
      },
      criticalPruningList: criticalPruningList.map(function (x) {
        return {
          id: x.id,
          name: x.name,
          riScore: x.riScore,
          theologyCategory: x.theologyCategory
        };
      }),
      coreCrisis: coreCrisis.map(function (x) {
        return {
          id: x.id,
          name: x.name,
          riScore: x.riScore,
          theologyWeight: x.theologyWeight
        };
      }),
      stewardshipInsight: {
        adminWasteCount: adminWaste.length,
        coreNeedsCount: coreNeedy.length,
        effortAdjustmentHint: inferredTags.indexOf("事工與恩賜不匹配") >= 0
          ? "偵測到服事滿意度偏低，建議在下一版 Effort 係數加入恩賜匹配修正。"
          : ""
      },
      recommendations: recommendations,
      transferLeads: transferLeads,
      inferredTags: inferredTags,
      pastoralCareHint: pastoralCareHint
    };

    var prompt =
      "請分析以下教會數據：\n" +
      JSON.stringify(output, null, 2) +
      (pastoralCareHint ? "\n\n【牧養校準】" + pastoralCareHint : "") +
      "\n\n請以溫暖的牧者口吻，針對資源錯置問題給出具體建議。";

    output.prompt = prompt;
    return output;
  }

  function simulateAdvisorResponse(payload) {
    var p = payload || {};
    var coreCrisis = Array.isArray(p.coreCrisis) ? p.coreCrisis : [];
    var pruneList = Array.isArray(p.criticalPruningList) ? p.criticalPruningList : [];
    var transferLeads = Array.isArray(p.transferLeads) ? p.transferLeads : [];
    var summary = p.summary || { avgRi: 0, totalRedZone: 0, coreMisalignmentCount: 0 };

    var coreLine = coreCrisis.length
      ? "核心危機救援：針對「" + coreCrisis[0].name + "」先成立 4 週支援小組，從常規/行政線抽調 1-2 位同工，並以週檢視節奏降低核心負荷。"
      : "核心危機救援：目前未偵測到核心使命低 RI 危機，建議維持月度檢視與預備替補。";

    var pruneLine = pruneList.length
      ? "修剪建議：針對「" + pruneList[0].name + "」優先採「流程自動化或降頻」方案；若四週後 RI 仍低於門檻，啟動停辦/合併評估。"
      : "修剪建議：目前非核心低 RI 清單為空，建議先從高耗損流程做微調與標準化。";

    var transferLine = transferLeads.length
      ? "人力轉置路徑：由「" + transferLeads[0].fromMinistryName + "」釋放人力，轉支援「" + transferLeads[0].toMinistryName + "」，先以 30 天試行並設定檢核點。"
      : "人力轉置路徑：尚未形成明確配對，建議先盤點行政線可外包/自動化工時，再對齊核心缺口。";

    function badgeLevel(score, invert) {
      var s = Number(score) || 0;
      if (invert) {
        if (s >= 0.7) return "high";
        if (s >= 0.4) return "medium";
        return "low";
      }
      if (s >= 0.7) return "high";
      if (s >= 0.4) return "medium";
      return "low";
    }

    var coreRatio = Number(summary.coreMisalignmentCount || 0) / Math.max(1, Number(summary.totalRedZone || 0));
    var missionScore = 1 - coreRatio * 0.5;
    var missionLevel = badgeLevel(missionScore, false);
    var missionText =
      missionLevel === "high"
        ? "高一致：建議整體仍能回應五年異象，可優先補強核心危機點。"
        : missionLevel === "medium"
          ? "中一致：部分核心使命被低 RI 拉扯，建議先保護核心線再談擴張。"
          : "低一致：核心使命承載不足，需先重排資源與節奏。";

    var emotionalSignals = coreCrisis.filter(function (x) {
      var n = String(x.name || "");
      return /主日|團契|小組|青少年|兒主/.test(n);
    }).length;
    var pastoralRiskScore = Math.min(1, 0.35 + emotionalSignals * 0.3 + coreCrisis.length * 0.2);
    var pastoralLevel = badgeLevel(pastoralRiskScore, true);
    var pastoralText =
      pastoralLevel === "high"
        ? "高情感成本：涉及長期核心聚會，建議採『降頻＋陪伴』而非直接停辦。"
        : pastoralLevel === "medium"
          ? "中情感成本：可先做階段性調整，並預告會眾溝通節奏。"
          : "低情感成本：可優先以流程優化或合併方案執行。";

    var governanceEase = transferLeads.length > 0 ? 0.75 : 0.45;
    var governanceLevel = badgeLevel(governanceEase, false);
    var governanceText =
      governanceLevel === "high"
        ? "可行性高：已有明確人力轉置路徑，可進入 30 天試行。"
        : governanceLevel === "medium"
          ? "可行性中：需先明確定義角色責任與溝通節點。"
          : "可行性低：尚無轉置對象，先盤點行政工時與志工意願。";

    var tensionLine = "";
    var tensionTag = "";
    try {
      var hrSim = global.ChurchToolkit && global.ChurchToolkit.loadHealthResult
        ? global.ChurchToolkit.loadHealthResult()
        : null;
      var lbSim = loadPastoralLoadBoundaryScore();
      if (global.EightyTwentyEngine && typeof global.EightyTwentyEngine.detectSensitivityDrainTension === "function") {
        var ten = global.EightyTwentyEngine.detectSensitivityDrainTension(hrSim, lbSim);
        if (ten && ten.triggered) {
          tensionTag = ten.tag || "";
          tensionLine = "【" + tensionTag + "】" + (ten.detail || "") + "\n\n";
        }
      }
    } catch (eT) {}

    var reportTitle = "AI 策略顧問總結";
    var reportText =
      reportTitle + "\n" +
      "系統快照：平均 RI " + Number(summary.avgRi || 0).toFixed(2) +
      "；紅區 " + Number(summary.totalRedZone || 0) +
      "；核心危機 " + Number(summary.coreMisalignmentCount || 0) + "。\n\n" +
      tensionLine +
      "1) " + coreLine + "\n" +
      "2) " + pruneLine + "\n" +
      "3) " + transferLine + "\n\n" +
      "神學與治理校準：\n" +
      "- 使命一致性：" + missionText + "\n" +
      "- 牧養風險：" + pastoralText + "\n" +
      "- 治理可行性：" + governanceText + "\n\n" +
      "建議節奏：以 30 天為一輪，確認「誰被保護、誰被釋放、哪條核心線被補強」。";

    var linesOut = [coreLine, pruneLine, transferLine];
    if (tensionLine) linesOut.unshift(tensionTag || "跨工具張力預警");

    return {
      title: reportTitle,
      lines: linesOut,
      crossToolTension: tensionTag
        ? { triggered: true, tag: tensionTag, detail: tensionLine.replace(/\n/g, " ").trim() }
        : { triggered: false },
      calibration: {
        missionAlignment: { level: missionLevel, text: missionText },
        pastoralRisk: { level: pastoralLevel, text: pastoralText },
        governanceFeasibility: { level: governanceLevel, text: governanceText }
      },
      reportText: reportText
    };
  }

  global.StrategyLogic = {
    RI_PRUNE_THRESHOLD: RI_PRUNE_THRESHOLD,
    IMPACT_DIMENSIONS: IMPACT_DIMENSIONS,
    THEOLOGY_WEIGHTS: THEOLOGY_WEIGHTS,
    theologyWeightOf: theologyWeightOf,
    calculateMinistryHealth: calculateMinistryHealth,
    buildRiAdvice: buildRiAdvice,
    CONFLICT_MATRIX: CONFLICT_MATRIX,
    inferRiLevel: inferRiLevel,
    inferALevel: inferALevel,
    checkGoalConflicts: checkGoalConflicts,
    calculateConfidence: leadershipConfidence,
    buildAdvisorPayload: buildAdvisorPayload,
    simulateAdvisorResponse: simulateAdvisorResponse
  };
})(typeof window !== "undefined" ? window : this);
