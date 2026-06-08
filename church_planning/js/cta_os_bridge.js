/**
 * CTA-OS 頁面橋接：自動讀本頁/本機分數 → 統一 CTV 報告欄位。
 * 依賴：cta_os_runtime.js
 */
(function (global) {
  "use strict";

  var RT = global.CTAOSRuntime;
  if (!RT) return;

  var SMART_SCORE_MAP = {
    S_clarity: { P: 0.1, S: 0.1, G: 0.1, C: 0.35, R: 0.15, F: 0.2 },
    M_measurability: { P: 0, S: 0, G: 0.15, C: 0.55, R: 0.1, F: 0.2 },
    A_feasibility: { P: 0.05, S: 0, G: 0.2, C: 0.45, R: 0.2, F: 0.1 },
    R_relevance: { P: 0.1, S: 0.15, G: 0.25, C: 0.2, R: 0.15, F: 0.15 },
    T_time_fit: { P: 0, S: 0, G: 0.25, C: 0.35, R: 0.15, F: 0.25 },
    Care_health: { P: 0.35, S: 0.2, G: 0.05, C: 0.1, R: 0.2, F: 0.1 },
    Strategic_bonus: { P: 0, S: 0, G: 0.35, C: 0.35, R: 0.15, F: 0.15 }
  };

  var SPIRITUAL_DIM_MAP = {
    reading_devotion: { P: 0.05, S: 0.55, G: 0, C: 0.1, R: 0.1, F: 0.2 },
    prayer: { P: 0.1, S: 0.6, G: 0, C: 0, R: 0.1, F: 0.2 },
    church_life: { P: 0.15, S: 0.2, G: 0.1, C: 0.15, R: 0.35, F: 0.05 },
    character: { P: 0.35, S: 0.25, G: 0, C: 0.1, R: 0.2, F: 0.1 },
    gospel_giving: { P: 0.1, S: 0.2, G: 0.35, C: 0.1, R: 0.1, F: 0.15 }
  };

  var PASTORAL_DIM_MAP = {
    joy: { P: 0.1, S: 0.45, G: 0, C: 0, R: 0.15, F: 0.3 },
    scripture_word: { P: 0.05, S: 0.65, G: 0, C: 0.1, R: 0.1, F: 0.1 },
    load_boundary: { P: 0.2, S: 0.1, G: 0.25, C: 0.35, R: 0.05, F: 0.05 },
    rest_family: { P: 0.4, S: 0.15, G: 0, C: 0.05, R: 0.2, F: 0.2 },
    team_support: { P: 0.15, S: 0.1, G: 0.05, C: 0.1, R: 0.5, F: 0.1 },
    emotion_stress: { P: 0.45, S: 0.25, G: 0, C: 0.1, R: 0.15, F: 0.05 },
    vision_mission: { P: 0.1, S: 0.2, G: 0.4, C: 0.15, R: 0.1, F: 0.05 }
  };

  function readJson(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function likertItemsFromValues(values, defaultProjection) {
    var items = [];
    values.forEach(function (v) {
      if (v == null || !isFinite(v) || v < 1 || v > 5) return;
      items.push({ value: v, projection: defaultProjection });
    });
    return items;
  }

  function vectorFromLikertValues(values, projection) {
    return RT.scoreByProjection(likertItemsFromValues(values, projection));
  }

  function avgLikertToVector(avg, projection) {
    if (avg == null || !isFinite(avg)) return RT.scoreByProjection([]);
    return RT.scoreByProjection([{ value: avg, projection: projection }]);
  }

  function collectDomLikertItems(root) {
    root = root || document;
    var items = [];
    root.querySelectorAll("[data-cta-projection]").forEach(function (el) {
      var v = Number(el.value);
      if (!isFinite(v) || v < 1 || v > 5) return;
      var proj;
      try {
        proj = JSON.parse(el.getAttribute("data-cta-projection"));
      } catch (e) {
        return;
      }
      items.push({ value: v, projection: proj });
    });
    if (items.length) return items;

    root.querySelectorAll("input[data-q], input[data-cta-q]").forEach(function (el) {
      var v = Number(el.value);
      if (!isFinite(v) || v < 1 || v > 5) return;
      var projAttr = el.getAttribute("data-cta-projection");
      var proj = { P: 0.15, S: 0.15, G: 0.15, C: 0.2, R: 0.2, F: 0.15 };
      if (projAttr) {
        try {
          proj = JSON.parse(projAttr);
        } catch (e2) {}
      }
      items.push({ value: v, projection: proj });
    });
    return items;
  }

  function collectFromSmart() {
    var run = global.AssessmentRunStore ? global.AssessmentRunStore.loadLatest("smart") : null;
    if (run && run.feature_vector) {
      var d = run.derived || {};
      var p = run.profile || {};
      var plan = p.plan_name || p.name;
      return {
        vector: run.feature_vector,
        sourceCount: d.answered_count || (run.raw_answers || []).length || 15,
        sourceNote:
          "讀取 assessment_run · 對齊 " +
          (d.alignment_score != null ? d.alignment_score : "—") +
          " · 負載 " +
          (d.load_cost_score != null ? d.load_cost_score : "—") +
          " · 可行 " +
          (d.feasibility_score != null ? d.feasibility_score : "—"),
        subjectName: plan ? plan + " · SMART" : "SMART 計畫同工",
        assessmentRun: run
      };
    }

    var state = readJson("chp2026-smart-v1");
    var items = [];
    if (state && Array.isArray(state.plans)) {
      state.plans.forEach(function (p) {
        var scores = p.scores || {};
        Object.keys(scores).forEach(function (k) {
          var v = scores[k];
          if (typeof v !== "number" || v < 1 || v > 5) return;
          items.push({
            value: v,
            projection: SMART_SCORE_MAP[k] || { P: 0.1, S: 0.1, G: 0.2, C: 0.3, R: 0.15, F: 0.15 }
          });
        });
      });
    }
    if (!items.length) items = collectDomLikertItems();
    var church = state && state.context && state.context.church_name;
    return {
      vector: RT.scoreByProjection(items),
      sourceCount: items.length,
      sourceNote: items.length ? "讀取 chp2026-smart-v1 計畫自評分" : "尚無本機 SMART 資料",
      subjectName: church ? church + " · SMART" : "SMART 計畫同工"
    };
  }

  function collectFromSwot() {
    var state = readJson("chp2026-swot-v1");
    var items = [];
    var proj = { P: 0.1, S: 0.05, G: 0.3, C: 0.25, R: 0.15, F: 0.15 };
    if (state && Array.isArray(state.dimensions)) {
      state.dimensions.forEach(function (d) {
        ["sClarity", "wClarity", "oClarity", "tClarity"].forEach(function (k) {
          var v = Number(d[k]);
          if (v >= 1 && v <= 5) items.push({ value: v, projection: proj });
        });
      });
    }
    if (!items.length) items = collectDomLikertItems();
    var church = state && state.meta && state.meta.churchName;
    return {
      vector: RT.scoreByProjection(items),
      sourceCount: items.length,
      sourceNote: items.length ? "讀取八維 SWOT 具體度評分" : "尚無 SWOT 本機資料",
      subjectName: church ? church + " · SWOT" : "SWOT 規劃同工"
    };
  }

  function collectFromPdca() {
    var state = readJson("chp2026-pdca-log") || readJson("chp2026-pdca-v1");
    var values = [];
    if (state && state.version === 1 && state.cycle) {
      var c = state.cycle;
      if (c.checkRhythmScore != null) values.push(Number(c.checkRhythmScore));
      if (c.checkGoalMetLikert != null) values.push(Number(c.checkGoalMetLikert));
      if (c.checkResourceLikert != null) values.push(Number(c.checkResourceLikert));
      if (c.checkTeamMoraleLikert != null) values.push(Number(c.checkTeamMoraleLikert));
      if (c.doTrafficLight === "green") values.push(5);
      else if (c.doTrafficLight === "yellow") values.push(3);
      else if (c.doTrafficLight === "red") values.push(2);
    }
    var health = readJson("chp2026-health-result");
    if (health && health.overallNormalized != null) {
      values.push(Number(health.overallNormalized));
    }
    var sel = document.querySelector("#app select");
    if (sel && sel.value !== "") values.push(Number(sel.value));
    var items = likertItemsFromValues(values, { P: 0.1, S: 0.1, G: 0.3, C: 0.35, R: 0.1, F: 0.05 });
    if (!items.length) items = collectDomLikertItems();
    return {
      vector: RT.scoreByProjection(items),
      sourceCount: items.length,
      sourceNote: "讀取 PDCA 迴圈節奏與健康基線",
      subjectName: "PDCA 執行同工"
    };
  }

  function collectFrom8020() {
    var state = readJson("chp2026-8020-v1");
    var values = [];
    var form = state && (state.form || state);
    if (form && form.painScan) {
      Object.keys(form.painScan).forEach(function (k) {
        var v = form.painScan[k];
        if (typeof v === "number" && v >= 1 && v <= 5) values.push(v);
      });
    }
    if (form) {
      ["concentrationLikert", "coreBurnoutLikert", "pipelineLikert", "willingToPruneLikert"].forEach(function (k) {
        var v2 = form[k];
        if (typeof v2 === "number" && v2 >= 1 && v2 <= 5) values.push(v2);
      });
    }
    var items = likertItemsFromValues(values, { P: 0.15, S: 0.05, G: 0.3, C: 0.3, R: 0.15, F: 0.05 });
    if (!items.length) items = collectDomLikertItems();
    var church = form && form.churchName;
    return {
      vector: RT.scoreByProjection(items),
      sourceCount: items.length,
      sourceNote: items.length ? "讀取 80/20 五大痛點掃描" : "尚無 80/20 本機資料",
      subjectName: church ? church + " · 80/20" : "80/20 工作坊"
    };
  }

  function dimScoresToItems(dimScores, dimMap) {
    var items = [];
    Object.keys(dimScores || {}).forEach(function (dim) {
      var avg = dimScores[dim];
      if (avg == null || !isFinite(avg)) return;
      var likert = Math.max(1, Math.min(5, Math.round(avg)));
      items.push({
        value: likert,
        projection: dimMap[dim] || { P: 0.15, S: 0.2, G: 0.15, C: 0.2, R: 0.15, F: 0.15 }
      });
    });
    return items;
  }

  function collectFromSpiritual() {
    var run = global.AssessmentRunStore ? global.AssessmentRunStore.loadLatest("spiritual") : null;
    if (run && run.feature_vector) {
      var d = run.derived || {};
      var name = run.profile && (run.profile.name || run.profile.age_range);
      return {
        vector: run.feature_vector,
        sourceCount: d.answered_count || (run.raw_answers || []).length || 13,
        sourceNote:
          "讀取 assessment_run · 整體 " +
          (d.overall_score != null ? d.overall_score : "—") +
          "（" +
          (d.overall_level || "—") +
          "）",
        subjectName: name ? name + " · 靈命" : "信徒靈命自評",
        assessmentRun: run
      };
    }

    var items = [];
    var sourceNote = "";
    var subjectName = "信徒靈命自評";
    if (typeof global.collectMemberAnswers === "function" &&
        typeof global.computeDimensionScores === "function" &&
        global.MEMBER_QUESTION_MAP) {
      var answers = global.collectMemberAnswers();
      var str = {};
      Object.keys(answers).forEach(function (k) {
        if (answers[k] !== "" && answers[k] != null) str[k] = String(answers[k]);
      });
      var dimScores = global.computeDimensionScores(str, global.MEMBER_QUESTION_MAP);
      items = dimScoresToItems(dimScores, SPIRITUAL_DIM_MAP);
      sourceNote = "讀取問卷即時作答（" + items.length + " 維度）";
    } else {
      var saved = readJson("spiritualSurvey2026-simple");
      if (saved && saved.answers) {
        var str2 = {};
        Object.keys(saved.answers).forEach(function (k) {
          if (saved.answers[k] != null) str2[k] = String(saved.answers[k]);
        });
        if (global.computeDimensionScores && global.MEMBER_QUESTION_MAP) {
          items = dimScoresToItems(
            global.computeDimensionScores(str2, global.MEMBER_QUESTION_MAP),
            SPIRITUAL_DIM_MAP
          );
          sourceNote = "讀取 spiritualSurvey2026-simple";
        }
      }
    }
    if (!items.length) items = collectDomLikertItems();
    return {
      vector: RT.scoreByProjection(items),
      sourceCount: items.length,
      sourceNote: sourceNote || "尚無靈命問卷資料",
      subjectName: subjectName
    };
  }

  function collectFromPastoral() {
    var run = global.AssessmentRunStore ? global.AssessmentRunStore.loadLatest("pastoral") : null;
    if (run && run.feature_vector && !run.is_demo) {
      var dRun = run.derived || {};
      var prof = run.profile || {};
      var label = prof.label || prof.p_church_size;
      return {
        vector: run.feature_vector,
        sourceCount: dRun.answered_count || (run.raw_answers || []).length || 30,
        sourceNote:
          "讀取 assessment_run · 整體 " +
          (dRun.overall_score != null ? dRun.overall_score : "—") +
          " · 警訊 " +
          ((run.risk_flags || []).length || 0) +
          " 項（不含開放心聲）",
        subjectName: label ? label + " · 領袖健康" : "教牧／領袖",
        assessmentRun: run
      };
    }

    var log = readJson("chp2026-pastoral-health-log-v1");
    var items = [];
    var subjectName = "教牧／領袖";
    var sourceNote = "";
    if (Array.isArray(log) && log.length) {
      var last = log[log.length - 1];
      var dimStored = last.dimension_scores || last.dimScores;
      if (dimStored) {
        items = dimScoresToItems(dimStored, PASTORAL_DIM_MAP);
        subjectName = last.label || subjectName;
        return {
          vector: RT.scoreByProjection(items),
          sourceCount: items.length,
          sourceNote: "讀取 chp2026-pastoral-health-log-v1 最近一筆（舊版 log，建議重新更新報告）",
          subjectName: subjectName
        };
      }
    }
    if (typeof global.collectPastoralAnswers === "function" &&
        global.computeDimensionScores &&
        global.PASTORAL_QUESTION_MAP) {
      var formEl = document.getElementById("surveyForm");
      var ans = formEl ? global.collectPastoralAnswers(formEl) : {};
      items = dimScoresToItems(
        global.computeDimensionScores(ans, global.PASTORAL_QUESTION_MAP),
        PASTORAL_DIM_MAP
      );
      sourceNote = "讀取領袖問卷即時作答";
    }
    if (!items.length) items = collectDomLikertItems();
    return {
      vector: RT.scoreByProjection(items),
      sourceCount: items.length,
      sourceNote: sourceNote || "尚無領袖健康紀錄，請先完成問卷",
      subjectName: subjectName
    };
  }

  function collectFromAlda() {
    var run = global.AssessmentRunStore ? global.AssessmentRunStore.loadLatest("alda") : null;
    if (run && run.feature_vector) {
      var d = run.derived || {};
      var name = run.profile && run.profile.name;
      return {
        vector: run.feature_vector,
        sourceCount: (run.raw_answers || []).length || 16,
        sourceNote:
          "讀取 assessment_run · " +
          (d.primary || "—") +
          "／" +
          (d.secondary || "—") +
          " · 真實度 " +
          (d.sincerity != null ? d.sincerity : "—") +
          "%" +
          (run.path_cards && run.path_cards.length ? " · 含出路卡（帶領修飾）" : " · P 軸修飾"),
        subjectName: name ? name + " · ALDA" : "ALDA 領導力同工",
        assessmentRun: run
      };
    }

    var data = readJson("alda_test_results");
    if (!data || !data.vectors) {
      return {
        vector: RT.scoreByProjection(collectDomLikertItems()),
        sourceCount: 0,
        sourceNote: "尚無 ALDA 測評結果，請先提交問卷",
        subjectName: "ALDA 領導力同工"
      };
    }
    var v = data.vectors;
    function norm(x) {
      return RT.normalizeLikert(Math.max(1, Math.min(5, (Number(x) / 24) * 4 + 1)));
    }
    var vector = {
      C: norm(v.C),
      G: norm(v.O),
      S: norm(v.S),
      F: norm(v.F),
      P: norm((Number(v.C) + Number(v.F)) / 48 * 4 + 1),
      R: norm((Number(v.O) + Number(v.S)) / 48 * 4 + 1)
    };
    RT.dimensions.forEach(function (d) {
      vector[d] = Math.round(vector[d] * 10) / 10;
    });
    var name = data.profile && data.profile.name;
    return {
      vector: vector,
      sourceCount: 16,
      sourceNote: "ALDA 叢集 C/O/S/F 映射至 CTV（主：" + (data.primary || "—") + "）",
      subjectName: name || "ALDA 領導力同工"
    };
  }

  function collectFromRaci() {
    var payload = readJson("chp2026-raci-diagnostic-v1");
    if (!payload) {
      return {
        vector: RT.scoreByProjection(collectDomLikertItems()),
        sourceCount: 0,
        sourceNote: "尚無 RACI 診斷紀錄",
        subjectName: "RACI 反思同工"
      };
    }
    var c = payload.counts || { A: 0, B: 0, C: 0, D: 0 };
    var total = c.A + c.B + c.C + c.D || 1;
    var stress = (c.A + c.C) / total;
    var burnout = c.D / total;
    var gap = c.B / total;
    var people = payload.dimPeople != null ? Number(payload.dimPeople) : null;
    var vector;
    if (people != null && isFinite(people)) {
      var base = Math.max(1, Math.min(5, 6 - people / 20));
      vector = vectorFromLikertValues([base, base, base, base], { P: 0.2, S: 0.1, G: 0.35, C: 0.15, R: 0.15, F: 0.05 });
    } else {
      vector = {
        G: Math.round((100 - gap * 35 - stress * 25) * 10) / 10,
        R: Math.round((100 - stress * 45) * 10) / 10,
        C: Math.round((100 - burnout * 40) * 10) / 10,
        P: Math.round((100 - burnout * 50) * 10) / 10,
        S: 68,
        F: Math.round((100 - burnout * 35) * 10) / 10
      };
      RT.dimensions.forEach(function (d) {
        vector[d] = Math.max(0, Math.min(100, vector[d]));
      });
    }
    return {
      vector: vector,
      sourceCount: total,
      sourceNote: "RACI 勾選 A/B/C/D 與結構加權",
      subjectName: (payload.ministry || "RACI") + " · " + (payload.lens === "self" ? "個人" : "團隊")
    };
  }

  var NCD_DIM_TO_CTV = {
    ev: { P: 0.1, S: 0.05, G: 0.45, C: 0.15, R: 0.2, F: 0.05 },
    dis: { P: 0.05, S: 0.1, G: 0.15, C: 0.45, R: 0.15, F: 0.1 },
    fel: { P: 0.15, S: 0.5, G: 0.05, C: 0.05, R: 0.15, F: 0.1 },
    mis: { P: 0, S: 0, G: 0.4, C: 0.45, R: 0.1, F: 0.05 },
    wor: { P: 0.1, S: 0.35, G: 0.1, C: 0.25, R: 0.1, F: 0.1 },
    led: { P: 0.35, S: 0.2, G: 0.1, C: 0.1, R: 0.2, F: 0.05 },
    ste: { P: 0.05, S: 0.15, G: 0.4, C: 0.15, R: 0.1, F: 0.15 },
    rel: { P: 0.4, S: 0.15, G: 0.05, C: 0.05, R: 0.3, F: 0.05 }
  };

  function ncdDimProjection(dimId) {
    var packMap = global.NcdPack && global.NcdPack.NCD_DIM_TO_CTV;
    if (packMap && packMap[dimId]) return packMap[dimId];
    return NCD_DIM_TO_CTV[dimId] || { P: 0.12, S: 0.12, G: 0.2, C: 0.2, R: 0.18, F: 0.18 };
  }

  function collectFromNcd() {
    if (global.NcdPack && typeof global.NcdPack.ensureAssessmentRun === "function") {
      global.NcdPack.ensureAssessmentRun();
    }
    var run = global.AssessmentRunStore ? global.AssessmentRunStore.loadLatest("ncd") : null;
    if (run && run.feature_vector && !run.is_demo) {
      var d = run.derived || {};
      var church = run.profile && run.profile.name;
      var min = d.minimum_factor || {};
      return {
        vector: run.feature_vector,
        sourceCount: (run.raw_answers || []).length || 8,
        sourceNote:
          "讀取 assessment_run · 均分 " +
          (d.overallScore != null ? d.overallScore : "—") +
          "（" +
          (d.healthLabel || "—") +
          "）" +
          (min.label ? " · 最小因子「" + min.label + "」" : d.worstCat ? " · 最弱「" + d.worstCat + "」" : ""),
        subjectName: church ? church + " · NCD" : "教會 NCD 健康診斷",
        assessmentRun: run
      };
    }

    var wrap = readJson("chp2026-health-result");
    var result = wrap && wrap.result ? wrap.result : wrap;
    var items = [];
    var church = "";
    if (result) {
      if (result.churchInfo && result.churchInfo.name) church = result.churchInfo.name;
      (result.dimensions || []).forEach(function (d) {
        var likert = null;
        if (d.normalizedScore != null && isFinite(Number(d.normalizedScore))) {
          likert = Number(d.normalizedScore);
        } else if (d.score != null && d.max) {
          likert = 1 + (Number(d.score) / Number(d.max)) * 4;
        }
        if (likert == null || likert < 1 || likert > 5) return;
        items.push({ value: likert, projection: ncdDimProjection(d.id) });
      });
      if (result.overallNormalized != null && isFinite(Number(result.overallNormalized))) {
        items.push({
          value: Number(result.overallNormalized),
          projection: { P: 0.15, S: 0.2, G: 0.25, C: 0.15, R: 0.15, F: 0.1 }
        });
      }
    }
    return {
      vector: RT.scoreByProjection(items),
      sourceCount: items.length,
      sourceNote: items.length
        ? "讀取 chp2026-health-result（NCD 八維 · 舊鍵，建議回問卷更新報告以雙寫 assessment_run）"
        : "尚無 NCD 健康診斷結果",
      subjectName: church ? church + " · NCD" : "教會 NCD 健康診斷"
    };
  }

  var PROJECTION_PRESETS = {
    johari: [
      { q: "j1", projection: { P: 0.2, S: 0.1, G: 0, C: 0.1, R: 0.6, F: 0 } },
      { q: "j2", projection: { P: 0.3, S: 0.2, G: 0, C: 0, R: 0.4, F: 0.1 } },
      { q: "j3", projection: { P: 0.1, S: 0, G: 0, C: 0.2, R: 0.5, F: 0.2 } },
      { q: "j4", projection: { P: 0.2, S: 0.1, G: 0, C: 0.1, R: 0.5, F: 0.1 } }
    ],
    shape: [
      { q: "s1", projection: { P: 0.1, S: 0.15, G: 0.05, C: 0.45, R: 0.15, F: 0.1 } },
      { q: "s2", projection: { P: 0.25, S: 0.2, G: 0.15, C: 0.1, R: 0.2, F: 0.1 } },
      { q: "s3", projection: { P: 0, S: 0, G: 0.25, C: 0.5, R: 0.15, F: 0.1 } }
    ],
    competency: [
      { q: "c1", projection: { P: 0.1, S: 0, G: 0.2, C: 0.5, R: 0.2, F: 0 } },
      { q: "c2", projection: { P: 0.2, S: 0.1, G: 0, C: 0.1, R: 0.5, F: 0.1 } },
      { q: "c3", projection: { P: 0, S: 0, G: 0.4, C: 0.5, R: 0.1, F: 0 } }
    ],
    kpiokr: [
      { q: "k1", projection: { P: 0, S: 0, G: 0.2, C: 0.6, R: 0.2, F: 0 } },
      { q: "k2", projection: { P: 0, S: 0, G: 0.3, C: 0.6, R: 0.1, F: 0 } },
      { q: "k3", projection: { P: 0.1, S: 0.1, G: 0.1, C: 0.3, R: 0.2, F: 0.2 } }
    ],
    urgent: [
      { q: "u1", projection: { P: 0.1, S: 0.15, G: 0.2, C: 0.25, R: 0.1, F: 0.2 } },
      { q: "u2", projection: { P: 0.05, S: 0.1, G: 0.25, C: 0.35, R: 0.15, F: 0.1 } },
      { q: "u3", projection: { P: 0.15, S: 0.2, G: 0.1, C: 0.2, R: 0.1, F: 0.25 } }
    ]
  };

  function collectFromPreset(toolId, toolName, subjectName) {
    var preset = PROJECTION_PRESETS[toolId] || [];
    var items = [];
    preset.forEach(function (row) {
      var el = document.querySelector('[data-q="' + row.q + '"]');
      if (!el) return;
      var v = Number(el.value);
      if (v >= 1 && v <= 5) items.push({ value: v, projection: row.projection });
    });
    if (!items.length) items = collectDomLikertItems();
    return {
      vector: RT.scoreByProjection(items),
      sourceCount: items.length,
      sourceNote: "讀取本頁 Likert 題（" + items.length + " 題）",
      subjectName: subjectName || toolName + " 同工"
    };
  }

  function collectFromUrgent() {
    var run = global.AssessmentRunStore ? global.AssessmentRunStore.loadLatest("urgent") : null;
    if (run && run.feature_vector && !run.is_demo) {
      var d = run.derived || {};
      var name = run.profile && run.profile.name;
      var count = Array.isArray(run.raw_answers) ? run.raw_answers.length : 0;
      return {
        vector: run.feature_vector,
        sourceCount: count || 14,
        sourceNote:
          "讀取 assessment_run · Q1 " +
          (d.q1_pct != null ? d.q1_pct : "?") +
          "% / Q2 " +
          (d.q2_pct != null ? d.q2_pct : "?") +
          "% / Q3 " +
          (d.q3_pct != null ? d.q3_pct : "?") +
          "% / Q4 " +
          (d.q4_pct != null ? d.q4_pct : "?") +
          "%",
        subjectName: name ? name + " · 優先序" : "重要 vs 緊急同工",
        assessmentRun: run
      };
    }
    return collectFromPreset("urgent", "重要 vs 緊急矩陣");
  }

  function collectFromJohari() {
    var run = global.AssessmentRunStore ? global.AssessmentRunStore.loadLatest("johari") : null;
    if (run && run.feature_vector && !run.is_demo) {
      var d = run.derived || {};
      var name = run.profile && run.profile.name;
      return {
        vector: run.feature_vector,
        sourceCount: (run.raw_answers || []).length || 12,
        sourceNote:
          "讀取 assessment_run · Open " +
          (d.open_pct != null ? d.open_pct : "?") +
          "% / 主區 " +
          (d.dominant || "—") +
          (run.path_cards && run.path_cards.length ? " · 含出路卡" : ""),
        subjectName: name ? name + " · Johari" : "Johari 同工",
        assessmentRun: run
      };
    }
    return collectFromPreset("johari", "Johari 團隊盲點量表");
  }

  function collectFromShape() {
    var run = global.AssessmentRunStore ? global.AssessmentRunStore.loadLatest("shape") : null;
    if (run && run.feature_vector && !run.is_demo) {
      var d = run.derived || {};
      var name = run.profile && run.profile.name;
      return {
        vector: run.feature_vector,
        sourceCount: (run.raw_answers || []).length || 13,
        sourceNote:
          "讀取 assessment_run · 熱情「" +
          (d.top_heart || "—") +
          "」· SHAPE 主軸" +
          (run.path_cards && run.path_cards.length ? " · 含出路卡" : ""),
        subjectName: name ? name + " · SHAPE" : "SHAPE 恩賜同工",
        assessmentRun: run
      };
    }
    return collectFromPreset("shape", "SHAPE 恩賜整合量表");
  }

  function collectFromDisc() {
    var run = global.AssessmentRunStore ? global.AssessmentRunStore.loadLatest("disc") : null;
    if (run && run.feature_vector && !run.is_demo) {
      var d = run.derived || {};
      var name = run.profile && run.profile.name;
      return {
        vector: run.feature_vector,
        sourceCount: (run.raw_answers || []).length || 16,
        sourceNote:
          "讀取 assessment_run · DISC 主型 " +
          (d.primary || "—") +
          (run.path_cards && run.path_cards.length ? " · 含出路卡" : ""),
        subjectName: name ? name + " · DISC" : "DISC 同工",
        assessmentRun: run
      };
    }
    return collectFromPreset("disc", "DISC 溝通風格");
  }

  function collectFromMbti() {
    var run = global.AssessmentRunStore ? global.AssessmentRunStore.loadLatest("mbti") : null;
    if (run && run.feature_vector && !run.is_demo) {
      var d = run.derived || {};
      var name = run.profile && run.profile.name;
      return {
        vector: run.feature_vector,
        sourceCount: (run.raw_answers || []).length || 16,
        sourceNote:
          "讀取 assessment_run · MBTI " +
          (d.code || "—") +
          (run.path_cards && run.path_cards.length ? " · 含出路卡" : ""),
        subjectName: name ? name + " · MBTI" : "MBTI 同工",
        assessmentRun: run
      };
    }
    return collectFromPreset("mbti", "MBTI 性格傾向");
  }

  function collectFromCompetency() {
    var run = global.AssessmentRunStore ? global.AssessmentRunStore.loadLatest("competency") : null;
    if (run && run.feature_vector && !run.is_demo) {
      var d = run.derived || {};
      var name = run.profile && run.profile.name;
      return {
        vector: run.feature_vector,
        sourceCount: (run.raw_answers || []).length || 24,
        sourceNote:
          "讀取 assessment_run · 強項「" +
          (d.primary_label || "—") +
          "」· 待補「" +
          (d.weakest_label || "—") +
          "」" +
          (run.path_cards && run.path_cards.length ? " · 含出路卡（能力陪跑修飾）" : ""),
        subjectName: name ? name + " · 事奉能力" : "事奉能力同工",
        assessmentRun: run
      };
    }
    return collectFromPreset("competency", "事奉能力模型量表");
  }

  var TOOL_META = {
    johari: { name: "Johari 團隊盲點量表", collect: collectFromJohari },
    shape: { name: "SHAPE 恩賜整合量表", collect: collectFromShape },
    disc: { name: "DISC 溝通風格自評", collect: collectFromDisc },
    mbti: { name: "MBTI 性格傾向（簡化）", collect: collectFromMbti },
    competency: { name: "事奉能力模型量表", collect: collectFromCompetency },
    kpiokr: { name: "KPI/OKR 對齊量表", collect: function () { return collectFromPreset("kpiokr", "KPI/OKR 對齊量表"); } },
    urgent: { name: "重要 vs 緊急矩陣", collect: collectFromUrgent },
    smart: { name: "教會版 SMART", collect: collectFromSmart },
    swot: { name: "教會版 SWOT", collect: collectFromSwot },
    pdca: { name: "教會版 PDCA", collect: collectFromPdca },
    ministry8020: { name: "教會版 80/20", collect: collectFrom8020 },
    spiritual: { name: "信徒靈命健康自評", collect: collectFromSpiritual },
    pastoral: { name: "教牧／領袖靈命調查", collect: collectFromPastoral },
    alda: { name: "十二使徒領導力（ALDA）", collect: collectFromAlda },
    raci: { name: "RACI 角色反思", collect: collectFromRaci },
    ncd: { name: "NCD 教會健康診斷", collect: collectFromNcd }
  };

  function ensureReportPanel(anchor) {
    var host = anchor;
    if (typeof host === "string") host = document.querySelector(host);
    if (!host) host = document.getElementById("tab-report") || document.querySelector("main");
    if (!host) return null;
    var panel = host.querySelector(".cta-os-report-panel");
    if (panel) return panel;
    panel = document.createElement("div");
    panel.className = "cta-os-report-panel";
    panel.innerHTML =
      '<h3>CTA-OS 統一報告</h3>' +
      '<p class="cta-os-meta"><span data-cta-field="tool-name"></span> · <span data-cta-field="generated-at"></span></p>' +
      '<p class="cta-os-row"><strong>對象：</strong><span data-cta-field="subject"></span></p>' +
      '<p class="cta-os-row"><strong>資料來源：</strong><span data-cta-field="source-note"></span>（<span data-cta-field="source-count"></span> 筆）</p>' +
      '<p class="cta-os-row"><strong>CTV 向量：</strong><span data-cta-field="vector-line"></span></p>' +
      '<p class="cta-os-row"><strong>優勢維度：</strong><span data-cta-field="strengths"></span></p>' +
      '<p class="cta-os-row"><strong>成長焦點：</strong><span data-cta-field="growth"></span></p>' +
      '<p class="cta-os-row"><strong>風險提示：</strong></p>' +
      '<ul data-cta-field="risks"></ul>' +
      '<pre data-cta-field="plain-text"></pre>' +
      '<div class="cta-os-report-actions">' +
      '<button type="button" data-cta-action="refresh">🔄 重新讀取本頁分數</button>' +
      '<button type="button" data-cta-action="copy">💬 複製純文字報告</button>' +
      '<button type="button" data-cta-action="print">🖨️ 打印</button>' +
      '<a class="cta-os-btn" data-cta-field="center-link" href="cta-os-tool-report.html">開啟報告中心</a>' +
      "</div>";
    host.appendChild(panel);
    return panel;
  }

  function renderReport(panel, report) {
    if (!panel || !report) return;
    function set(field, text) {
      var el = panel.querySelector('[data-cta-field="' + field + '"]');
      if (el) el.textContent = text || "";
    }
    set("tool-name", report.toolName);
    set("subject", report.subjectName);
    set("generated-at", new Date(report.generatedAt).toLocaleString());
    set("source-note", report.sourceNote);
    set("source-count", String(report.sourceCount));
    set("vector-line", report.vectorLine);
    set("strengths", report.strengths);
    set("growth", report.growth);
    var risksEl = panel.querySelector('[data-cta-field="risks"]');
    if (risksEl) {
      risksEl.innerHTML = "";
      var risks = report.risks || [];
      if (!risks.length) {
        var li = document.createElement("li");
        li.textContent = "目前無重大風險旗標。";
        risksEl.appendChild(li);
      } else {
        risks.forEach(function (r) {
          var li2 = document.createElement("li");
          li2.textContent = r;
          risksEl.appendChild(li2);
        });
      }
    }
    var pre = panel.querySelector('[data-cta-field="plain-text"]');
    if (pre) pre.textContent = report.plainText;
    var link = panel.querySelector('[data-cta-field="center-link"]');
    if (link) {
      link.href = "cta-os-tool-report.html?tool=" + encodeURIComponent(report.toolId || "generic");
    }
  }

  function generate(toolId, opts) {
    opts = opts || {};
    var meta = TOOL_META[toolId];
    if (!meta) return null;
    var collected = meta.collect();
    var risks = RT.detectRisks(collected.vector);
    if (collected.assessmentRun && Array.isArray(collected.assessmentRun.risk_flags)) {
      var flagPack =
        toolId === "spiritual"
          ? global.SpiritualPack
          : toolId === "urgent"
            ? global.UrgencyPack
            : toolId === "pastoral"
              ? global.PastoralPack
              : toolId === "johari"
                ? global.JohariPack
                : toolId === "disc"
                  ? global.DiscPack
                  : toolId === "mbti"
                    ? global.MbtiPack
                    : toolId === "ncd"
                      ? global.NcdPack
                : null;
      collected.assessmentRun.risk_flags.forEach(function (flag) {
        var msg =
          flagPack && flagPack.FLAG_DESCRIPTIONS && flagPack.FLAG_DESCRIPTIONS[flag]
            ? flagPack.FLAG_DESCRIPTIONS[flag]
            : flag;
        if (risks.indexOf(msg) < 0) risks.push(msg);
      });
    }
    if (collected.sourceCount > 0 && collected.sourceCount < 3) {
      risks = risks.concat(["作答／資料點偏少，建議補充題目或完成完整問卷後再作決策。"]);
    }
    var report = RT.buildUnifiedReport({
      toolId: toolId,
      toolName: meta.name,
      subjectName: opts.subjectName || collected.subjectName,
      vector: collected.vector,
      sourceCount: collected.sourceCount,
      sourceNote: collected.sourceNote,
      generatedAt: new Date().toISOString()
    });
    report.risks = risks;
    risks.forEach(function (r) {
      if (report.plainText.indexOf(r) < 0) {
        report.plainText += (report.plainText ? "\n" : "") + "- " + r;
      }
    });
    RT.persistLastReport(report);
    RT.persistToolReport(toolId, report);
    try {
      if (global.ChurchDataBridge && typeof global.ChurchDataBridge.syncPlanningAssessmentFromCtaReport === "function") {
        global.ChurchDataBridge.syncPlanningAssessmentFromCtaReport(report, opts);
      }
    } catch (syncErr) {}
    return report;
  }

  function scanAllToolsFromStorage() {
    var synced = [];
    Object.keys(TOOL_META).forEach(function (toolId) {
      try {
        var report = generate(toolId);
        if (!report || !report.sourceCount) return;
        synced.push(toolId);
      } catch (e) {}
    });
    return synced;
  }

  var _pageConfig = null;
  var _panel = null;

  function refresh() {
    if (!_pageConfig) return null;
    var report = generate(_pageConfig.toolId, _pageConfig);
    if (_panel) renderReport(_panel, report);
    if (typeof _pageConfig.onReport === "function") _pageConfig.onReport(report);
    return report;
  }

  function bindPanel(panel) {
    panel.addEventListener("click", function (e) {
      var action = e.target && e.target.getAttribute("data-cta-action");
      if (!action) return;
      if (action === "refresh") refresh();
      if (action === "copy") {
        var pre = panel.querySelector('[data-cta-field="plain-text"]');
        if (pre && navigator.clipboard) navigator.clipboard.writeText(pre.textContent || "");
      }
      if (action === "print") window.print();
    });
  }

  function initPage(config) {
    _pageConfig = config || {};
    var toolId = _pageConfig.toolId;
    if (!toolId || !TOOL_META[toolId]) return;

    if (_pageConfig.injectCss !== false && !document.querySelector('link[data-cta-os-bridge-css="1"]')) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.setAttribute("data-cta-os-bridge-css", "1");
      link.href = _pageConfig.cssHref || "js/cta_os_bridge.css";
      if (location.pathname.indexOf("/planning/") >= 0 && !_pageConfig.cssHref) {
        link.href = "../js/cta_os_bridge.css";
      }
      document.head.appendChild(link);
    }

    _panel = ensureReportPanel(_pageConfig.reportAnchor || "#tab-report");
    if (_panel) bindPanel(_panel);

    if (_pageConfig.fab !== false) {
      var fab = document.createElement("button");
      fab.type = "button";
      fab.className = "cta-os-fab";
      fab.textContent = "CTA-OS";
      fab.addEventListener("click", function () {
        refresh();
        if (_panel) _panel.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      document.body.appendChild(fab);
    }

    var watchKeys = _pageConfig.watchStorage || [];
    if (watchKeys.length) {
      global.addEventListener("storage", function (ev) {
        if (watchKeys.indexOf(ev.key) >= 0) refresh();
      });
    }

    if (_pageConfig.autoRefresh !== false) {
      setTimeout(refresh, _pageConfig.delayMs || 400);
      if (_pageConfig.pollMs) {
        setInterval(refresh, _pageConfig.pollMs);
      }
    }

    if (global.CTAOSItemPacks && global.CTAOSItemPacks.inject) {
      global.CTAOSItemPacks.inject(toolId);
    }

    global.__CTAOS_refresh = refresh;
    global.__CTAOS_generate = function () { return refresh(); };
    global.__CTAOS_generateTool = function (id) {
      return generate(id || toolId, _pageConfig);
    };

    document.addEventListener("click", function (ev) {
      var t = ev.target;
      if (!t) return;
      if (t.matches && (t.matches("[onclick*='generateOsReport']") || t.getAttribute("data-cta-generate") === "1")) {
        setTimeout(refresh, 50);
      }
    });
  }

  global.CTAOSBridge = {
    TOOL_META: TOOL_META,
    generate: generate,
    refresh: refresh,
    scanAllToolsFromStorage: scanAllToolsFromStorage,
    initPage: initPage,
    ensureReportPanel: ensureReportPanel,
    renderReport: renderReport,
    collectDomLikertItems: collectDomLikertItems
  };
})(window);
