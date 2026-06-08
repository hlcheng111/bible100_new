/**
 * 神國職位精準媒合中心 · 跨頁 AssessmentRunStore 聚合與適配分析
 * 接通 SHAPE / Johari / DISC / MBTI / KSA / ALDA 契約與 Fallback
 */
(function (global) {
  "use strict";

  var TOOL_IDS = ["shape", "johari", "disc", "mbti", "competency", "alda"];

  var MATCH_AXES = [
    { key: "shape_peak", label: "SHAPE 恩賜峰值" },
    { key: "ksa_capability", label: "KSA 能力 (K+S)/2" },
    { key: "ksa_attitude", label: "KSA 心志 A" },
    { key: "alda_vision", label: "ALDA 願景 A" },
    { key: "alda_delivery", label: "ALDA 執行 D" },
    { key: "disc_precision", label: "DISC 精準 C" }
  ];

  var ROLE_BLUEPRINTS = {
    pioneer: {
      id: "pioneer",
      label: "開荒先鋒",
      keywords: ["開荒", "外展", "拓植", "先鋒", "佈道點"],
      thresholds: {
        shape_peak: 3.5,
        ksa_capability: 3.0,
        ksa_attitude: 4.5,
        alda_vision: 4.5,
        alda_delivery: 4.0,
        disc_precision: 2.5
      },
      note: "高願景 + 高心志 + 高執行；技能可陪跑。"
    },
    elder: {
      id: "elder",
      label: "治理長執",
      keywords: ["長執", "執事", "治理", "決策", "長老"],
      thresholds: {
        shape_peak: 4.0,
        ksa_capability: 4.0,
        ksa_attitude: 4.0,
        alda_vision: 4.0,
        alda_delivery: 4.0,
        disc_precision: 3.5
      },
      note: "四軸均衡 · ALDA 敏捷領袖核心區。"
    },
    care: {
      id: "care",
      label: "關懷牧職",
      keywords: ["關懷", "探訪", "牧養", "陪跑", "小組"],
      thresholds: {
        shape_peak: 4.0,
        ksa_capability: 3.0,
        ksa_attitude: 4.5,
        alda_vision: 3.5,
        alda_delivery: 3.0,
        disc_precision: 3.0
      },
      note: "牧養恩賜 + 高心志；輔導倫理 K 可陪跑。"
    },
    tech: {
      id: "tech",
      label: "技術音控",
      keywords: ["音控", "音響", "媒體", "投影", "鍵盤", "影音"],
      thresholds: {
        shape_peak: 3.0,
        ksa_capability: 4.5,
        ksa_attitude: 3.0,
        alda_vision: 2.5,
        alda_delivery: 4.0,
        disc_precision: 4.5
      },
      note: "高 S/K + 高 C 型；內向 I 蓄電友好。"
    },
    admin_sunday: {
      id: "admin_sunday",
      label: "行政主日學",
      keywords: ["行政", "主日學", "教案", "排班", "接待"],
      thresholds: {
        shape_peak: 3.5,
        ksa_capability: 4.0,
        ksa_attitude: 3.5,
        alda_vision: 3.0,
        alda_delivery: 3.5,
        disc_precision: 4.0
      },
      note: "教學設計 K+S；流程與精準並重。"
    }
  };

  function round1(n) {
    return Math.round(Number(n) * 10) / 10;
  }

  function maxGiftScore(giftScores) {
    if (!giftScores || typeof giftScores !== "object") return 3;
    var max = 0;
    Object.keys(giftScores).forEach(function (k) {
      max = Math.max(max, Number(giftScores[k]) || 0);
    });
    return max || 3;
  }

  function loadRuns(store) {
    store = store || global.AssessmentRunStore;
    var runs = {};
    var coverage = {};
    TOOL_IDS.forEach(function (id) {
      var run = null;
      if (store && store.loadLatest) run = store.loadLatest(id);
      if (run && !run.is_demo) {
        runs[id] = run;
        coverage[id] = true;
      } else {
        coverage[id] = false;
      }
    });
    return { runs: runs, coverage: coverage };
  }

  function buildPersonVector(runs, opts) {
    opts = opts || {};
    runs = runs || {};
    var shape = runs.shape;
    var comp = runs.competency;
    var alda = runs.alda;
    var disc = runs.disc;
    var mbti = runs.mbti;
    var sources = {};

    var giftScores = null;
    if (shape && shape.derived && shape.derived.gift_scores) {
      giftScores = shape.derived.gift_scores;
      sources.shape = "run";
    } else if (shape && global.MinistryPathBridge && MinistryPathBridge.giftScoresFromShapeRun) {
      giftScores = MinistryPathBridge.giftScoresFromShapeRun(shape);
      sources.shape = "bridge";
    } else if (shape && shape.derived && shape.derived.shape_engine_contract) {
      giftScores = shape.derived.shape_engine_contract.gift_scores;
      sources.shape = "contract";
    } else {
      sources.shape = "default";
    }

    var shape_peak = round1(maxGiftScore(giftScores));

    var ksa = { K: 3, S: 3, A: 3 };
    if (comp && comp.derived && comp.derived.ksa_overall) {
      ksa = comp.derived.ksa_overall;
      sources.competency = "run";
    } else if (comp && comp.derived && comp.derived.ksa_execution_contract) {
      ksa = comp.derived.ksa_execution_contract.ksa_overall || ksa;
      sources.competency = "contract";
    } else {
      sources.competency = "default";
    }

    var lc = { A: 3, L: 3, D: 3, Ag: 3 };
    if (alda && alda.derived && alda.derived.lifecycle) {
      lc = alda.derived.lifecycle;
      sources.alda = "run";
    } else if (alda && alda.derived && alda.derived.alda_lifecycle_contract) {
      lc = alda.derived.alda_lifecycle_contract.lifecycle || lc;
      sources.alda = "contract";
    } else {
      sources.alda = "default";
    }

    var discScores = { D: 3, I: 3, S: 3, C: 3 };
    if (disc && disc.derived && disc.derived.scores) {
      discScores = disc.derived.scores;
      sources.disc = "run";
    } else {
      sources.disc = "default";
      if (mbti && mbti.derived) {
        if (mbti.derived.shape_p_fallback && mbti.derived.shape_p_fallback.disc_scores) {
          discScores = mbti.derived.shape_p_fallback.disc_scores;
          sources.disc = "mbti_fallback";
        } else if (mbti.derived.axis_percents && mbti.derived.axis_percents.JP) {
          var jp = mbti.derived.axis_percents.JP;
          discScores.C = round1(1 + (Number(jp.J) || 50) / 25);
          sources.disc = "mbti_jp_proxy";
        }
      }
    }

    if (mbti && mbti.derived) {
      sources.mbti = mbti.derived.mbti_code || mbti.derived.code ? "run" : "default";
    } else {
      sources.mbti = "default";
    }

    if (opts.demoVector) {
      return Object.assign(
        {
          shape_peak: 4.2,
          ksa_capability: 3.1,
          ksa_attitude: 4.8,
          alda_vision: 4.5,
          alda_delivery: 4.7,
          disc_precision: 2.8
        },
        opts.demoVector
      );
    }

    return {
      shape_peak: shape_peak,
      ksa_capability: round1((Number(ksa.K) + Number(ksa.S)) / 2),
      ksa_attitude: round1(Number(ksa.A)),
      alda_vision: round1(Number(lc.A)),
      alda_delivery: round1(Number(lc.D)),
      disc_precision: round1(Number(discScores.C))
    };
  }

  function buildTalentBundle(store, opts) {
    opts = opts || {};
    var loaded = loadRuns(store);
    var person = buildPersonVector(loaded.runs, opts);
    var name = "";
    TOOL_IDS.some(function (id) {
      var r = loaded.runs[id];
      if (r && r.profile && r.profile.name) {
        name = r.profile.name;
        return true;
      }
      return false;
    });
    if (opts.is_demo) name = name || "示範同工（跨六戰聚合）";
    return {
      runs: loaded.runs,
      coverage: loaded.coverage,
      person: person,
      person_name: name,
      is_demo: !!opts.is_demo,
      sources: buildPersonVector.sources || {}
    };
  }

  function buildDemoTalentBundle() {
    return buildTalentBundle(null, {
      is_demo: true,
      demoVector: {
        shape_peak: 4.2,
        ksa_capability: 3.1,
        ksa_attitude: 4.8,
        alda_vision: 4.5,
        alda_delivery: 4.7,
        disc_precision: 2.8
      }
    });
  }

  function analyzeFit(roleId, personVector) {
    var role = ROLE_BLUEPRINTS[roleId] || ROLE_BLUEPRINTS.pioneer;
    var th = role.thresholds;
    var axes = [];
    var sumPct = 0;
    MATCH_AXES.forEach(function (ax) {
      var required = Number(th[ax.key]) || 3;
      var actual = Number(personVector[ax.key]) || 0;
      var delta = round1(actual - required);
      var pct = Math.min(100, Math.round((actual / Math.max(required, 0.1)) * 100));
      var status = delta >= 0.3 ? "overflow" : delta >= -0.3 ? "ok" : "gap";
      sumPct += pct;
      axes.push({
        key: ax.key,
        label: ax.label,
        required: required,
        actual: actual,
        delta: delta,
        fit_pct: pct,
        status: status
      });
    });
    var overall_pct = Math.round(sumPct / MATCH_AXES.length);
    return {
      role_id: role.id,
      role_label: role.label,
      role_note: role.note,
      overall_pct: overall_pct,
      axes: axes,
      person: personVector
    };
  }

  function buildMatchContract(bundle, fit) {
    bundle = bundle || {};
    fit = fit || {};
    return {
      schema_version: 1,
      source: "matchmaker_core",
      role_id: fit.role_id,
      role_label: fit.role_label,
      overall_pct: fit.overall_pct,
      person_vector: fit.person,
      person_name: bundle.person_name || "",
      coverage: bundle.coverage || {},
      axes: fit.axes,
      timestamp: Date.now(),
      hitl_note: "媒合建議僅供牧者分辨；正式派任須人工確認。"
    };
  }

  function searchRoles(keyword) {
    keyword = String(keyword || "")
      .trim()
      .toLowerCase();
    return Object.keys(ROLE_BLUEPRINTS)
      .map(function (id) {
        return ROLE_BLUEPRINTS[id];
      })
      .filter(function (role) {
        if (!keyword) return true;
        if (role.label.toLowerCase().indexOf(keyword) >= 0) return true;
        return (role.keywords || []).some(function (k) {
          return k.toLowerCase().indexOf(keyword) >= 0;
        });
      });
  }

  function resolveRoleId(keywordOrId) {
    if (ROLE_BLUEPRINTS[keywordOrId]) return keywordOrId;
    var hits = searchRoles(keywordOrId);
    return hits.length ? hits[0].id : "pioneer";
  }

  global.MatchmakerCore = {
    TOOL_IDS: TOOL_IDS,
    MATCH_AXES: MATCH_AXES,
    ROLE_BLUEPRINTS: ROLE_BLUEPRINTS,
    loadRuns: loadRuns,
    buildPersonVector: buildPersonVector,
    buildTalentBundle: buildTalentBundle,
    buildDemoTalentBundle: buildDemoTalentBundle,
    analyzeFit: analyzeFit,
    buildMatchContract: buildMatchContract,
    searchRoles: searchRoles,
    resolveRoleId: resolveRoleId
  };
})(typeof window !== "undefined" ? window : global);
