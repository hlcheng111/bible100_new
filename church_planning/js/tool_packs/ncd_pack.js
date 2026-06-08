/**
 * NCD 教會健康診斷 · 工具包（ncd）
 * 國際八維 · 24 題脈動快評 · 最小因子法則 · assessment_run 雙寫
 */
(function (global) {
  "use strict";

  var TOOL_ID = "ncd";
  var TOOL_LABEL = "NCD 教會健康診斷";

  var INTL_DIMS = [
    { id: "gift", legacy: "mis", label: "恩賜導向的服事", en: "Gift-oriented", order: 1 },
    { id: "empower", legacy: "led", label: "權能導向的領導", en: "Empowering", order: 2 },
    { id: "passion", legacy: "dis", label: "充滿熱情的靈性", en: "Passionate", order: 3 },
    { id: "functional", legacy: "ste", label: "結構功能的組織", en: "Functional", order: 4 },
    { id: "worship", legacy: "wor", label: "充滿喜樂的崇拜", en: "Inspiring", order: 5 },
    { id: "wholistic", legacy: "fel", label: "齊心投入的小組", en: "Wholistic", order: 6 },
    { id: "evangelism", legacy: "ev", label: "全面兼顧的佈道", en: "Need-oriented", order: 7 },
    { id: "loving", legacy: "rel", label: "相親相愛的關係", en: "Loving", order: 8 }
  ];

  var DIM_LABELS = {};
  var LEGACY_TO_INTL = {};
  INTL_DIMS.forEach(function (d) {
    DIM_LABELS[d.id] = d.label;
    LEGACY_TO_INTL[d.legacy] = d.id;
  });

  var NCD_DIM_TO_CTV = {
    gift: { P: 0, S: 0, G: 0.4, C: 0.45, R: 0.1, F: 0.05 },
    empower: { P: 0.35, S: 0.2, G: 0.1, C: 0.1, R: 0.2, F: 0.05 },
    passion: { P: 0.05, S: 0.1, G: 0.15, C: 0.45, R: 0.15, F: 0.1 },
    functional: { P: 0.05, S: 0.15, G: 0.4, C: 0.15, R: 0.1, F: 0.15 },
    worship: { P: 0.1, S: 0.35, G: 0.1, C: 0.25, R: 0.1, F: 0.1 },
    wholistic: { P: 0.15, S: 0.5, G: 0.05, C: 0.05, R: 0.15, F: 0.1 },
    evangelism: { P: 0.1, S: 0.05, G: 0.45, C: 0.15, R: 0.2, F: 0.05 },
    loving: { P: 0.4, S: 0.15, G: 0.05, C: 0.05, R: 0.3, F: 0.05 },
    ev: { P: 0.1, S: 0.05, G: 0.45, C: 0.15, R: 0.2, F: 0.05 },
    dis: { P: 0.05, S: 0.1, G: 0.15, C: 0.45, R: 0.15, F: 0.1 },
    fel: { P: 0.15, S: 0.5, G: 0.05, C: 0.05, R: 0.15, F: 0.1 },
    mis: { P: 0, S: 0, G: 0.4, C: 0.45, R: 0.1, F: 0.05 },
    wor: { P: 0.1, S: 0.35, G: 0.1, C: 0.25, R: 0.1, F: 0.1 },
    led: { P: 0.35, S: 0.2, G: 0.1, C: 0.1, R: 0.2, F: 0.05 },
    ste: { P: 0.05, S: 0.15, G: 0.4, C: 0.15, R: 0.1, F: 0.15 },
    rel: { P: 0.4, S: 0.15, G: 0.05, C: 0.05, R: 0.3, F: 0.05 }
  };

  var STRATEGY_ADVICE = {
    gift: {
      diagnosis: "恩賜與才幹尚未對位，同工可能「填補空位」而非「發揮呼召」。",
      plan: "啟動恩賜盤點季：SHAPE 工作坊 + 崗位說明書對照，90 天內完成一輪試任配對。",
      smart_draft: "在 90 天內讓 80% 核心崗位同工完成 SHAPE 自評並與牧者面談一次。"
    },
    empower: {
      diagnosis: "授權不足或決策集中，年輕同工難以承接帶領責任。",
      plan: "長執會建立「決策授權表」與繼任梯隊；每季檢視一位潛力同工的試任授權。",
      smart_draft: "6 個月內為 3 個事工線各指定一位副主責並完成 RACI 對齊。"
    },
    passion: {
      diagnosis: "靈性生活可能流於形式，會眾真實遇見神的比例偏低。",
      plan: "恢復讀經禱告節奏；主日以外增加短靈修聚會，不以活動取代靈命。",
      smart_draft: "本季推動全會 12 週讀經計畫，小組長每週跟進一次。"
    },
    functional: {
      diagnosis: "行政內耗、會議冗長或權責不清，消耗事奉熱情。",
      plan: "精實會議：長執會議程固定 45 分鐘；引進 RACI 權責地理學梳理跨部門流程。",
      smart_draft: "90 天內將核心會議時數減少 30%，並完成 1 條事工線 SOP。"
    },
    worship: {
      diagnosis: "崇拜體驗未能同時餵養會眾與歡迎新朋友。",
      plan: "敬拜團與講道團隊對齊「會眾往哪裡去」；每季一次會眾崇拜回饋。",
      smart_draft: "下一季主日崇拜新增 1 次「新朋友友善」檢核與改進行動。"
    },
    wholistic: {
      diagnosis: "小組流於形式，缺乏生命敞開與彼此守望。",
      plan: "小組長培訓聚焦「全人關顧」；降低組長行政負擔，留出關係時間。",
      smart_draft: "6 個月內 70% 小組完成一次「生命分享」主題聚會並有跟進。"
    },
    evangelism: {
      diagnosis: "佈道與社區需要脫節，外展動力不足。",
      plan: "盤點社區 3 個真實需要；設計「關係外展」而非單次活動。",
      smart_draft: "本季每個小組至少 1 次社區關懷行動並有福音跟進名單。"
    },
    loving: {
      diagnosis: "人際張力或衝突修復文化薄弱，影響信任與合一。",
      plan: "教導聖經衝突步驟；指定 2 位受訓調解同工；長執先示範和好。",
      smart_draft: "90 天內完成 1 場「衝突與和好」同工工作坊並有實際案例演練。"
    }
  };

  var QUESTIONS = [
    { id: "q01", dim: "gift", label: "我在教會的服事能發揮我的主要恩賜與才幹。" },
    { id: "q02", dim: "gift", label: "教會有清楚途徑幫助我發現並運用恩賜。" },
    { id: "q03", dim: "gift", label: "崗位安排重視「對的人」而非只填補空缺。" },
    { id: "q04", dim: "empower", label: "教會領袖樂意授權，並積極成全年輕同工。" },
    { id: "q05", dim: "empower", label: "決策過程透明，同工知道自己的責任範圍。" },
    { id: "q06", dim: "empower", label: "有清楚的領袖發展與傳承途徑。" },
    { id: "q07", dim: "passion", label: "我的靈性生活活潑，能真實經歷上帝的帶領。" },
    { id: "q08", dim: "passion", label: "禱告與讀經是教會文化的一部分，不只是口號。" },
    { id: "q09", dim: "passion", label: "信仰融入日常生活，不只是主日儀式。" },
    { id: "q10", dim: "functional", label: "部門分工與長執會運作有效率，少繁文縟節內耗。" },
    { id: "q11", dim: "functional", label: "會議有明確結論與跟進，不流於空談。" },
    { id: "q12", dim: "functional", label: "資源（人力、預算、場地）配置支持異象而非救火。" },
    { id: "q13", dim: "worship", label: "主日崇拜對我而言是屬靈饗宴，充滿喜樂與敬拜。" },
    { id: "q14", dim: "worship", label: "崇拜兼顧會眾敬拜與新朋友友善。" },
    { id: "q15", dim: "worship", label: "聖經信息忠實且能應用於生活。" },
    { id: "q16", dim: "wholistic", label: "我在小組能分享真實軟弱，組員彼此守望。" },
    { id: "q17", dim: "wholistic", label: "小組聚會節奏穩定，少臨時取消或改期。" },
    { id: "q18", dim: "wholistic", label: "小組生活能幫助我實踐真理，不只聊天。" },
    { id: "q19", dim: "evangelism", label: "教會事工能切合社區真實需要。" },
    { id: "q20", dim: "evangelism", label: "會眾樂意關心未信家人朋友並見證基督。" },
    { id: "q21", dim: "evangelism", label: "有計劃的外展與跟進，不只一次性活動。" },
    { id: "q22", dim: "loving", label: "同工與會友間充滿真誠讚美，少批評指責。" },
    { id: "q23", dim: "loving", label: "衝突發生時，教會能依聖經原則化解。" },
    { id: "q24", dim: "loving", label: "我感受到歸屬感與被接納，敢於做真實的自己。" }
  ];

  var MIN_FACTOR_THRESHOLD = 3.0;
  var CRISIS_RAW_THRESHOLD = 29.25;
  var MARGINAL_OVERALL = 39;

  var FLAG_DESCRIPTIONS = {
    NCD_CRISIS_OVERALL: "整體均分落在危機區 — 宜暫停擴張，以牧養止血與治理對齊為優先。",
    NCD_WEAK_DIM: "有範疇低於 3.0 — 本季只推一個可觀察小改變。",
    NCD_WORST_CRITICAL: "最弱範疇落在需優先關注區 — 長執出兵前請對照改善建議。",
    NCD_MIN_FACTOR: "最小因子（木桶短板）已鎖定 — 請作為年度 PDCA 攻堅主軸。"
  };

  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  function dimProjection(dimId) {
    return NCD_DIM_TO_CTV[dimId] || { P: 0.12, S: 0.12, G: 0.2, C: 0.2, R: 0.18, F: 0.18 };
  }

  function dimToLikert(d) {
    if (d.normalizedScore != null && isFinite(Number(d.normalizedScore))) {
      return Number(d.normalizedScore);
    }
    if (d.score != null && d.max) {
      return 1 + (Number(d.score) / Number(d.max)) * 4;
    }
    if (d.value != null && isFinite(Number(d.value))) return Number(d.value);
    return null;
  }

  function computeDimScoresFromAnswers(map) {
    var sums = {};
    var counts = {};
    QUESTIONS.forEach(function (q) {
      if (!sums[q.dim]) {
        sums[q.dim] = 0;
        counts[q.dim] = 0;
      }
      if (map[q.id] != null) {
        sums[q.dim] += Number(map[q.id]);
        counts[q.dim] += 1;
      }
    });
    var scores = {};
    INTL_DIMS.forEach(function (d) {
      scores[d.id] = counts[d.id] ? round1(sums[d.id] / counts[d.id]) : 0;
    });
    return scores;
  }

  function computeMinimumFactor(dimScores) {
    var minId = INTL_DIMS[0].id;
    var minScore = dimScores[minId] != null ? dimScores[minId] : 5;
    INTL_DIMS.forEach(function (d) {
      var s = dimScores[d.id];
      if (s != null && s < minScore) {
        minScore = s;
        minId = d.id;
      }
    });
    var label = DIM_LABELS[minId] || minId;
    var advice = STRATEGY_ADVICE[minId] || {};
    var legacy = "";
    INTL_DIMS.forEach(function (d) {
      if (d.id === minId) legacy = d.legacy;
    });
    return {
      id: minId,
      legacy: legacy,
      label: label,
      score: minScore,
      diagnosis: advice.diagnosis || "",
      plan: advice.plan || "",
      smart_draft: advice.smart_draft || ""
    };
  }

  function computeFeatureVectorFromDimScores(dimScores, overallNorm) {
    var RT = global.CTAOSRuntime;
    var items = [];
    Object.keys(dimScores).forEach(function (id) {
      var v = dimScores[id];
      if (v == null || v < 1 || v > 5) return;
      items.push({ value: v, projection: dimProjection(id) });
    });
    if (overallNorm != null && isFinite(Number(overallNorm))) {
      items.push({
        value: Number(overallNorm),
        projection: { P: 0.15, S: 0.2, G: 0.25, C: 0.15, R: 0.15, F: 0.1 }
      });
    }
    if (RT && RT.scoreByProjection) return RT.scoreByProjection(items);
    return { P: 50, S: 50, G: 50, C: 50, R: 50, F: 50 };
  }

  function legacyDimsToIntlScores(dimensions) {
    var scores = {};
    INTL_DIMS.forEach(function (d) {
      scores[d.id] = 0;
    });
    (dimensions || []).forEach(function (d) {
      var intlId = LEGACY_TO_INTL[d.id] || d.id;
      var likert = dimToLikert(d);
      if (likert != null) scores[intlId] = likert;
    });
    return scores;
  }

  function buildStrategyCard(minFactor) {
    return {
      type: "church_strategy",
      tier: minFactor.score < MIN_FACTOR_THRESHOLD ? "urgent" : "focus",
      title: "🚨 當前戰略破口：" + minFactor.label + "（" + minFactor.score + " 分）",
      diagnosis: minFactor.diagnosis,
      plan: minFactor.plan,
      smart_draft: minFactor.smart_draft,
      pdca_note: "最小因子法則：五年計劃與本季 PDCA 宜以此維為攻堅主軸，勿同時開多條戰線。"
    };
  }

  function computeRiskFlags(dimScores, derived) {
    var flags = [];
    var overall = derived.overallScore != null ? Number(derived.overallScore) : null;
    if (overall != null && overall < MARGINAL_OVERALL) flags.push("NCD_CRISIS_OVERALL");
    if (derived.worstScore != null && derived.worstScore < CRISIS_RAW_THRESHOLD) {
      flags.push("NCD_WORST_CRITICAL");
    }
    var min = derived.minimum_factor;
    if (min && min.score < MIN_FACTOR_THRESHOLD) flags.push("NCD_MIN_FACTOR");
    Object.keys(dimScores).forEach(function (k) {
      if (dimScores[k] < MIN_FACTOR_THRESHOLD && flags.indexOf("NCD_WEAK_DIM") < 0) {
        flags.push("NCD_WEAK_DIM");
      }
    });
    return flags;
  }

  function validateAnswers(answers) {
    var map = {};
    var errors = [];
    if (!answers || typeof answers !== "object") return { ok: false, errors: ["缺少 answers"] };
    QUESTIONS.forEach(function (q) {
      var v = Number(answers[q.id]);
      if (!isFinite(v) || v < 1 || v > 5) errors.push("題 " + q.id + " 須為 1–5");
      else map[q.id] = v;
    });
    return errors.length ? { ok: false, errors: errors } : { ok: true, answers: map };
  }

  function buildRunFromAnswers(answers, profile, opts) {
    opts = opts || {};
    var check = validateAnswers(answers);
    if (!check.ok) return { ok: false, errors: check.errors };
    var map = check.answers;
    var dimScores = computeDimScoresFromAnswers(map);
    var vals = Object.keys(dimScores).map(function (k) { return dimScores[k]; });
    var overallNorm = vals.length ? round1(vals.reduce(function (a, b) { return a + b; }, 0) / vals.length) : null;
    var minFactor = computeMinimumFactor(dimScores);
    var derived = {
      dim_scores: dimScores,
      overallNormalized: overallNorm,
      overallScore: overallNorm != null ? round1(((overallNorm - 1) / 4) * 65) : null,
      healthLabel: overallNorm >= 4 ? "健康區" : overallNorm >= 3 ? "邊際區" : "危機區",
      minimum_factor: minFactor,
      worstCat: minFactor.label,
      worstScore: minFactor.score,
      survey_mode: "quick_24"
    };
    var strategy_card = buildStrategyCard(minFactor);
    var run = {
      schema_version: 1,
      tool_id: TOOL_ID,
      timestamp: opts.timestamp || Date.now(),
      member_id: null,
      profile: Object.assign({ name: "", church_size: "", city: "" }, profile || {}),
      authenticity_score: 1,
      feature_vector: computeFeatureVectorFromDimScores(dimScores, overallNorm),
      derived: derived,
      raw_answers: QUESTIONS.map(function (q) {
        return { q: q.id, value: map[q.id], dim: q.dim };
      }),
      risk_flags: computeRiskFlags(dimScores, derived),
      strategy_cards: [strategy_card],
      coaching: {
        governance_line: strategy_card.pdca_note,
        weakest_focus: minFactor.plan
      },
      source_note: "ncd_pack v2 · 24 題脈動快評 · 最小因子 " + minFactor.label
    };
    return { ok: true, run: run };
  }

  function buildRunFromHealthResult(result, opts) {
    opts = opts || {};
    if (!result || typeof result !== "object") {
      return { ok: false, errors: ["缺少 health result"] };
    }
    var churchInfo = result.churchInfo || {};
    var intlScores = legacyDimsToIntlScores(result.dimensions || []);
    var minFactor = computeMinimumFactor(intlScores);
    var derived = {
      overallScore: result.overallScore != null ? Number(result.overallScore) : null,
      overallNormalized: result.overallNormalized != null ? Number(result.overallNormalized) : null,
      healthLabel: result.healthLabel || "",
      worstCat: minFactor.label || result.worstCat || "",
      worstScore: result.worstScore != null ? Number(result.worstScore) : minFactor.score,
      dim_scores: intlScores,
      minimum_factor: minFactor,
      dimensions: (result.dimensions || []).map(function (d) {
        return {
          id: d.id,
          intl_id: LEGACY_TO_INTL[d.id] || d.id,
          name: d.name,
          score: d.score,
          max: d.max,
          normalizedScore: d.normalizedScore
        };
      }),
      stage: opts.stage || "in-progress",
      survey_mode: "vue_wizard"
    };
    var strategy_card = buildStrategyCard(minFactor);
    var risk_flags = computeRiskFlags(intlScores, derived);
    var on = derived.overallNormalized;
    var governanceLine = "";
    if (on != null && isFinite(on)) {
      if (on >= 4.0) governanceLine = "持續穩定，擴張影響：在守住節奏與牧養前提下，可延伸事工。";
      else if (on >= 3.0) governanceLine = "邊際調校，保守擴張：先補強最小因子「" + minFactor.label + "」。";
      else governanceLine = "暫停擴張，修復核心：以「" + minFactor.label + "」為止血主軸。";
    }
    var run = {
      schema_version: 1,
      tool_id: TOOL_ID,
      timestamp: opts.timestamp || Date.now(),
      member_id: null,
      profile: {
        name: churchInfo.name || "",
        church_size: churchInfo.size || "",
        city: churchInfo.city || "",
        stage: opts.stage || "in-progress"
      },
      authenticity_score: 1,
      feature_vector: computeFeatureVectorFromDimScores(intlScores, derived.overallNormalized),
      derived: derived,
      raw_answers: (result.dimensions || []).map(function (d) {
        return {
          q: LEGACY_TO_INTL[d.id] || d.id,
          value: dimToLikert(d),
          raw_score: d.score,
          max: d.max,
          name: d.name
        };
      }),
      risk_flags: risk_flags,
      strategy_cards: [strategy_card],
      coaching: {
        governance_line: governanceLine,
        weakest_focus: minFactor.plan,
        war_room_note: "教會層級診斷 — 匯入戰情室六維合成。"
      },
      source_note: "ncd_pack v2 · dual-write · 最小因子 " + minFactor.label
    };
    return { ok: true, run: run };
  }

  function readLegacyWrap() {
    try {
      if (global.ChurchToolkit && typeof global.ChurchToolkit.storageGet === "function") {
        var raw = ChurchToolkit.storageGet("chp2026-health-result");
        if (!raw) return null;
        return JSON.parse(raw);
      }
      if (global.localStorage) {
        var raw2 = global.localStorage.getItem("chp2026-health-result");
        if (!raw2) return null;
        return JSON.parse(raw2);
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  function migrateLegacyFromStorage(opts) {
    if (!global.AssessmentRunStore) return null;
    var existing = AssessmentRunStore.loadLatest(TOOL_ID);
    if (existing && existing.feature_vector) {
      return { ok: true, run: existing, migrated: false };
    }
    var wrap = readLegacyWrap();
    if (!wrap) return null;
    var result = wrap.result || wrap;
    if (!result || !result.dimensions || !result.dimensions.length) return null;
    var built = buildRunFromHealthResult(result, opts || { stage: "legacy-migrate" });
    if (!built.ok) return built;
    var saved = AssessmentRunStore.saveRun(built.run);
    if (!saved.ok) return saved;
    return { ok: true, run: saved.run, migrated: true };
  }

  function ensureAssessmentRun(opts) {
    if (!global.AssessmentRunStore) return null;
    var run = AssessmentRunStore.loadLatest(TOOL_ID);
    if (run && run.feature_vector) return run;
    var mig = migrateLegacyFromStorage(opts);
    return mig && mig.run ? mig.run : null;
  }

  function saveFromHealthResult(result, opts) {
    var built = buildRunFromHealthResult(result, opts);
    if (!built.ok) return built;
    if (!global.AssessmentRunStore) {
      return { ok: false, errors: ["AssessmentRunStore 未載入"] };
    }
    return AssessmentRunStore.saveRun(built.run);
  }

  function saveFromAnswers(answers, profile, opts) {
    var built = buildRunFromAnswers(answers, profile, opts);
    if (!built.ok) return built;
    if (!global.AssessmentRunStore) {
      return { ok: false, errors: ["AssessmentRunStore 未載入"] };
    }
    return AssessmentRunStore.saveRun(built.run);
  }

  function buildDemoRun() {
    var answers = {};
    QUESTIONS.forEach(function (q) {
      answers[q.id] = q.dim === "functional" ? 2 : q.dim === "evangelism" ? 3 : 4;
    });
    var built = buildRunFromAnswers(answers, { name: "示範教會", church_size: "100", city: "台北" });
    if (built.ok && built.run) built.run.is_demo = true;
    return built;
  }

  function prefillSwotNote(run) {
    var min = run && run.derived && run.derived.minimum_factor;
    if (!min) return "";
    return (
      "【NCD 最小因子匯入】戰略破口：「" +
      min.label +
      "」（" +
      min.score +
      " 分）\n" +
      "系統診斷：" +
      (min.diagnosis || "") +
      "\n請在 SWOT 的 Weaknesses 對焦此破口，並在 Opportunities 尋找補強槓桿。"
    );
  }

  function prefillSmartDraft(run) {
    var card = run && run.strategy_cards && run.strategy_cards[0];
    return card && card.smart_draft ? card.smart_draft : "";
  }

  var PDCA_PREFILL_KEY = "chp2026-ncd-pdca-prefill";

  function readPdcaPrefill() {
    try {
      var raw = localStorage.getItem(PDCA_PREFILL_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function legacyIdFromMinFactor(min) {
    if (!min) return null;
    if (min.legacy) return min.legacy;
    var found = null;
    INTL_DIMS.forEach(function (d) {
      if (d.id === min.id) found = d.legacy;
    });
    return found;
  }

  var ELDER_SESSION_QUESTIONS = [
    "過去一季，我們在哪一個 NCD 維度「看似忙碌卻沒有果效」？為什麼？",
    "最小因子破口背後，是資源不足、權責不清，還是文化習慣？我們願意停什麼？",
    "若本季只能推一個 6–8 週可檢核的小改變，會眾能具體說出哪裡不一樣？",
    "誰是這個破口的主責同工？誰是牧者／長執的配對禱告與跟進人？",
    "我們如何把這個破口寫進 SMART 目標，並在 PDCA 雙月會上覆盤？"
  ];

  function buildAlgorithmSummary(run) {
    var d = run && run.derived;
    if (!d || !d.dim_scores) {
      return "<p>完成 Tab ② 測評後，系統會計算八維均分並鎖定最小因子。</p>";
    }
    var rows = INTL_DIMS.map(function (dim) {
      var s = d.dim_scores[dim.id];
      var isMin = d.minimum_factor && d.minimum_factor.id === dim.id;
      return (
        "<tr" +
        (isMin ? ' style="background:#fff1f2;font-weight:700"' : "") +
        "><td>" +
        dim.label +
        "</td><td>" +
        (s != null ? s : "—") +
        "/5</td><td>" +
        (isMin ? "⚠ 最小因子" : s >= 4 ? "穩健" : s >= 3 ? "邊際" : "破口") +
        "</td></tr>"
      );
    }).join("");
    return (
      "<p><strong>演算法（白話）：</strong>每維 3 題平均 → 八維得分 D₁…D₈ → <strong>最小因子</strong> = 最低分那一維（湧泉最窄河道）。</p>" +
      '<table class="w-full text-xs mt-2 border-collapse"><thead><tr><th align="left">維度</th><th>得分</th><th>解讀</th></tr></thead><tbody>' +
      rows +
      "</tbody></table>"
    );
  }

  global.NcdPack = {
    TOOL_ID: TOOL_ID,
    TOOL_LABEL: TOOL_LABEL,
    INTL_DIMS: INTL_DIMS,
    DIM_LABELS: DIM_LABELS,
    LEGACY_TO_INTL: LEGACY_TO_INTL,
    QUESTIONS: QUESTIONS,
    NCD_DIM_TO_CTV: NCD_DIM_TO_CTV,
    STRATEGY_ADVICE: STRATEGY_ADVICE,
    FLAG_DESCRIPTIONS: FLAG_DESCRIPTIONS,
    MIN_FACTOR_THRESHOLD: MIN_FACTOR_THRESHOLD,
    validateAnswers: validateAnswers,
    computeDimScoresFromAnswers: computeDimScoresFromAnswers,
    computeMinimumFactor: computeMinimumFactor,
    buildStrategyCard: buildStrategyCard,
    buildRunFromAnswers: buildRunFromAnswers,
    buildRunFromHealthResult: buildRunFromHealthResult,
    saveFromHealthResult: saveFromHealthResult,
    saveFromAnswers: saveFromAnswers,
    migrateLegacyFromStorage: migrateLegacyFromStorage,
    ensureAssessmentRun: ensureAssessmentRun,
    buildDemoRun: buildDemoRun,
    prefillSwotNote: prefillSwotNote,
    prefillSmartDraft: prefillSmartDraft,
    PDCA_PREFILL_KEY: PDCA_PREFILL_KEY,
    readPdcaPrefill: readPdcaPrefill,
    legacyIdFromMinFactor: legacyIdFromMinFactor,
    ELDER_SESSION_QUESTIONS: ELDER_SESSION_QUESTIONS,
    buildAlgorithmSummary: buildAlgorithmSummary
  };
})(typeof window !== "undefined" ? window : global);
