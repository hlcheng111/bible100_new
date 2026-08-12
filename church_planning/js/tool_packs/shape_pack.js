/**
 * SHAPE 恩賜整合 · 工具包（shape）
 * S/H/A/E 自評；P（Personality）不重複出題，fallback 讀 disc/mbti/johari。
 * 主軸決定 ministry_type；path_cards 經 MinistryPathBridge。
 */
(function (global) {
  "use strict";

  var TOOL_ID = "shape";
  var TOOL_LABEL = "SHAPE 恩賜整合量表";

  var GIFT_LABELS_ZH = {
    teaching: "教導",
    shepherding: "牧養",
    encouragement: "勸慰",
    administration: "治理",
    evangelism: "佈道",
    serving: "服事",
    hospitality: "款待",
    worship: "敬拜",
    discernment: "辨別"
  };

  function giftLabelZh(key) {
    return GIFT_LABELS_ZH[key] || key || "—";
  }

  var SHAPE_AFFIRMATION = {
    S: "屬靈恩賜是神所賜的工具箱——教導、牧養、治理、憐憫等，每一樣都能在 Body 中找到位置。",
    H: "心志熱情是服事的燃料——您最關心哪群人，往往就是神預備您服事的方向。",
    A: "才能與經驗是社會技能庫——可讓您在現有空缺中更快就位（Employ）。",
    P: "個性節奏不重複在此問卷填寫；請用 DISC／MBTI 工具，本 pack 會自動讀取修飾出路。",
    E: "生命經歷（含傷痕與恩典）讓您最能安慰同路的人——這是事奉的深度，不是包袱。"
  };

  function buildMicroStep(top_heart, top_gift) {
    var heartSteps = {
      新人: "本週主日後主動問一位新朋友「今天怎麼來教會的？」並為對方代禱一句。",
      兒少: "本週與主日學或青少年同工聊 10 分鐘，了解一個實際需要。",
      長者: "本週打電話或探訪一位長者／病弱肢體，只問候、不帶事工壓力。",
      外展: "本週為一位未信同事或鄰居做一件具體關心（問候、陪餐、代禱）。"
    };
    if (heartSteps[top_heart]) return heartSteps[top_heart];
    return (
      "本週與牧者或小組長約 15 分鐘，談「" +
      giftLabelZh(top_gift) +
      "」恩賜方向是否適合一張出路卡試任。"
    );
  }

  function buildCoaching(top_heart, top_gift) {
    return {
      shape_affirmation: SHAPE_AFFIRMATION,
      next_tools: "建議補填 Johari（團隊互知）與 DISC/MBTI（溝通節奏），出路卡會更完整。",
      micro_step: buildMicroStep(top_heart, top_gift),
      redflag: "勿用單一恩賜分數綁架呼召；出路卡是探索可能性，須經牧者面談與 HITL 確認。"
    };
  }

  var QUESTIONS = [
    { id: "s01", axis: "S", gift: "teaching", label: "教導主日學或查經時，我能清楚傳遞真理並感到喜樂。", projection: { P: 0.05, S: 0.2, G: 0.05, C: 0.55, R: 0.1, F: 0.05 } },
    { id: "s02", axis: "S", gift: "shepherding", label: "探訪或陪跑同工靈命時，我自然關心對方成長。", projection: { P: 0.25, S: 0.15, G: 0, C: 0.35, R: 0.2, F: 0.05 } },
    { id: "s03", axis: "S", gift: "encouragement", label: "服事後若有人灰心，我善於用話語或行動激勵他。", projection: { P: 0.1, S: 0.1, G: 0, C: 0.2, R: 0.5, F: 0.1 } },
    { id: "s04", axis: "S", gift: "administration", label: "籌備佈道會或大型聚會時，我能把事工整理成可執行分工。", projection: { P: 0.05, S: 0.05, G: 0.35, C: 0.45, R: 0.1, F: 0 } },
    { id: "h01", axis: "H", heart: "新人", label: "我對首次來教會的新朋友特別有負擔。", projection: { P: 0.1, S: 0.1, G: 0.1, C: 0.2, R: 0.4, F: 0.1 } },
    { id: "h02", axis: "H", heart: "兒少", label: "主日學或青少年事工讓我長期有熱情投入。", projection: { P: 0.15, S: 0.15, G: 0.05, C: 0.35, R: 0.2, F: 0.1 } },
    { id: "h03", axis: "H", heart: "長者", label: "探訪長者、病弱或獨居者後，我常感到被神使用。", projection: { P: 0.2, S: 0.1, G: 0, C: 0.25, R: 0.35, F: 0.1 } },
    { id: "h04", axis: "H", heart: "外展", label: "社區外展、職場或跨文化宣教是我心裡的火。", projection: { P: 0.05, S: 0.1, G: 0.35, C: 0.2, R: 0.15, F: 0.15 } },
    { id: "a01", axis: "A", ability: "admin", label: "週報行政、流程表或專案排程是我擅長且願意服事的。", projection: { P: 0, S: 0, G: 0.4, C: 0.45, R: 0.1, F: 0.05 } },
    { id: "a02", axis: "A", ability: "media", label: "敬拜投影、文案、設計或影音製作我能勝任。", projection: { P: 0, S: 0.05, G: 0.15, C: 0.45, R: 0.15, F: 0.2 } },
    { id: "a03", axis: "A", ability: "care", label: "面對突發關懷需要時，我能傾聽並採取實際行動。", projection: { P: 0.2, S: 0.1, G: 0, C: 0.25, R: 0.35, F: 0.1 } },
    { id: "e01", axis: "E", experience: "grace", label: "我曾經歷神的恩典，願以此故事陪伴同路人。", projection: { P: 0.15, S: 0.25, G: 0.05, C: 0.15, R: 0.35, F: 0.05 } },
    { id: "e02", axis: "E", experience: "trial", label: "我走過家庭、健康或職場風暴，仍願在教會服事。", projection: { P: 0.25, S: 0.2, G: 0, C: 0.1, R: 0.35, F: 0.1 } }
  ];

  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  function validate(answers) {
    var map = {};
    var errors = [];
    QUESTIONS.forEach(function (q) {
      var v = Number(answers && answers[q.id]);
      if (!isFinite(v) || v < 1 || v > 5) errors.push("題 " + q.id + " 須為 1–5");
      else map[q.id] = v;
    });
    return errors.length ? { ok: false, errors: errors } : { ok: true, answers: map };
  }

  function computeGiftScores(map) {
    var buckets = {};
    QUESTIONS.filter(function (q) {
      return q.axis === "S" && q.gift;
    }).forEach(function (q) {
      if (!buckets[q.gift]) buckets[q.gift] = { sum: 0, n: 0 };
      buckets[q.gift].sum += map[q.id];
      buckets[q.gift].n += 1;
    });
    var scores = {
      teaching: 3,
      shepherding: 3,
      encouragement: 3,
      administration: 3,
      evangelism: 3,
      serving: 3,
      hospitality: 3,
      worship: 3,
      discernment: 3
    };
    Object.keys(buckets).forEach(function (g) {
      if (buckets[g].n) scores[g] = round1(buckets[g].sum / buckets[g].n);
    });
    if (scores.shepherding >= 3.5) scores.hospitality = Math.max(scores.hospitality, scores.shepherding - 0.3);
    if (scores.teaching >= 3.5) scores.discernment = Math.max(scores.discernment, scores.teaching - 0.2);
    return scores;
  }

  function computeTopHeart(map) {
    var best = { heart: "服事", score: 0 };
    QUESTIONS.filter(function (q) {
      return q.axis === "H" && q.heart;
    }).forEach(function (q) {
      if (map[q.id] > best.score) best = { heart: q.heart, score: map[q.id] };
    });
    return best.heart;
  }

  function computeFeatureVector(map) {
    var RT = global.CTAOSRuntime;
    var items = [];
    QUESTIONS.forEach(function (q) {
      items.push({ value: map[q.id], projection: q.projection });
    });
    if (RT && RT.scoreByProjection) return RT.scoreByProjection(items);
    return { P: 50, S: 55, G: 50, C: 60, R: 52, F: 48 };
  }

  function personalityNoteFromStore(store) {
    var parts = [];
    if (!store || !store.loadLatest) return "尚未填寫 DISC/MBTI；完成後出路卡會更精准。";
    ["disc", "mbti", "johari"].forEach(function (id) {
      var r = store.loadLatest(id);
      if (r && !r.is_demo && r.derived) {
        if (r.derived.primary) parts.push("DISC " + r.derived.primary);
        if (r.derived.code) parts.push("MBTI " + r.derived.code);
        if (r.derived.dominant) parts.push("Johari " + r.derived.dominant);
      }
    });
    return parts.length ? "已讀取協作風格：" + parts.join("、") : "尚未填寫 DISC/MBTI/Johari 協作工具。";
  }

  function topGiftKey(gift_scores) {
    var best = { key: "teaching", score: 0 };
    Object.keys(gift_scores || {}).forEach(function (k) {
      if ((gift_scores[k] || 0) > best.score) best = { key: k, score: gift_scores[k] };
    });
    return best.key;
  }

  /** 戰情室／媒合中心跨頁契約（Church OS 核心引擎） */
  function buildShapeEngineContract(gift_scores, top_heart, store) {
    var tg = topGiftKey(gift_scores);
    var pNote = personalityNoteFromStore(store);
    var disc = store && store.loadLatest ? store.loadLatest("disc") : null;
    var mbti = store && store.loadLatest ? store.loadLatest("mbti") : null;
    return {
      schema_version: 1,
      source_tool: TOOL_ID,
      engine_role: "ministry_type_primary",
      top_heart: top_heart || "服事",
      top_gift: tg,
      gift_scores: gift_scores || {},
      p_axis_note: pNote,
      p_axis_fallback: mbti && mbti.shape_p_fallback ? mbti.shape_p_fallback : null,
      disc_primary: disc && disc.derived ? disc.derived.primary : null,
      mbti_code: mbti && (mbti.mbti_code || (mbti.derived && mbti.derived.mbti_code)) || null,
      fallback_note: "SHAPE 決定事奉大類；P 軸由 DISC/MBTI 補足；出路卡經 MinistryPathBridge 合成。"
    };
  }

  function buildRun(answers, profile, opts) {
    opts = opts || {};
    var check = validate(answers);
    if (!check.ok) return { ok: false, errors: check.errors };
    var map = check.answers;
    var gift_scores = computeGiftScores(map);
    var top_heart = computeTopHeart(map);
    var store = global.AssessmentRunStore;
    var engineContract = buildShapeEngineContract(gift_scores, top_heart, store);
    var run = {
      schema_version: 1,
      tool_id: TOOL_ID,
      timestamp: opts.timestamp || Date.now(),
      member_id: opts.member_id != null ? opts.member_id : null,
      profile: Object.assign({ name: "", role: "" }, profile || {}),
      authenticity_score: 1,
      feature_vector: computeFeatureVector(map),
      shape_engine_contract: engineContract,
      derived: {
        gift_scores: gift_scores,
        top_heart: top_heart,
        top_gift: engineContract.top_gift,
        personality_note: engineContract.p_axis_note,
        shape_engine_contract: engineContract
      },
      raw_answers: QUESTIONS.map(function (q) {
        return { q: q.id, value: map[q.id] };
      }),
      risk_flags: [],
      coaching: buildCoaching(top_heart, engineContract.top_gift),
      source_note: "shape_pack v2 · S/H/A/E " + QUESTIONS.length + " 題 · shape_engine_contract"
    };
    if (global.MinistryPathBridge && MinistryPathBridge.attachPathCards) {
      MinistryPathBridge.attachPathCards(run, { sourceTool: "shape", sourceRun: run, store: global.AssessmentRunStore });
    }
    return { ok: true, run: run };
  }

  function buildDemoRun() {
    var answers = {};
    QUESTIONS.forEach(function (q) {
      answers[q.id] = q.axis === "S" ? 4 : 3;
    });
    answers.s01 = 5;
    answers.h03 = 5;
    var built = buildRun(answers, { name: "示範姊妹", role: "小組員" });
    if (built.ok && built.run) built.run.is_demo = true;
    return built;
  }

  global.ShapePack = {
    TOOL_ID: TOOL_ID,
    TOOL_LABEL: TOOL_LABEL,
    QUESTIONS: QUESTIONS,
    GIFT_LABELS_ZH: GIFT_LABELS_ZH,
    giftLabelZh: giftLabelZh,
    SHAPE_AFFIRMATION: SHAPE_AFFIRMATION,
    validate: validate,
    buildRun: buildRun,
    buildDemoRun: buildDemoRun,
    buildShapeEngineContract: buildShapeEngineContract
  };
})(typeof window !== "undefined" ? window : global);
