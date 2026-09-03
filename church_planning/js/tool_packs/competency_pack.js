/**
 * 事奉能力模型 · 工具包（competency）
 * 24 題 Likert · 6 能力域 × KSA（知識／技能／態度）· MinistryPathBridge 陪跑降級
 */
(function (global) {
  "use strict";

  var TOOL_ID = "competency";
  var TOOL_LABEL = "事奉能力模型量表";

  var KSA_LABELS = { K: "知識 Knowledge", S: "技能 Skill", A: "態度 Attitude" };

  var DOMAIN_LABELS = {
    admin_ops: "行政落地",
    lead_comm: "帶領溝通",
    care_practice: "關懷實務",
    teach_design: "教學設計",
    team_collab: "團隊協作",
    crisis_resp: "危機應變"
  };

  var DOMAIN_AFFIRMATION = {
    admin_ops: "行政不是次要——教會需要把異象落地的人。KSA 可培育，熱情是起點。",
    lead_comm: "帶領溝通可學——小步試任、導師陪跑，比一次派工更安全。",
    care_practice: "關懷是慢慢學的技藝——傾聽與陪伴，可在探訪與小組中操練。",
    teach_design: "教學設計需要時間——教案與節奏可在主日學 shadow 中成長。",
    team_collab: "團隊協作是教會健康核心——衝突調解與配合同工，宜在試任中學。",
    crisis_resp: "危機應變靠演練——先從副手與備援角色累積臨場經驗。"
  };

  var KSA_TRAINING_HINT = {
    K: "知識缺口 → 安排流程說明、SOP 閱讀或微課程",
    S: "技能缺口 → 安排 shadow、試任與導師一對一操練",
    A: "態度／韌性 → 牧養面談、節奏調整與同伴代禱"
  };

  var QUESTIONS = [
    { id: "a01", domain: "admin_ops", ksa: "K", label: "教會借用場地或採買用品時，我知道該找誰、走什麼基本流程？", projection: { P: 0, S: 0, G: 0.35, C: 0.55, R: 0.05, F: 0.1 } },
    { id: "a02", domain: "admin_ops", ksa: "S", label: "整理小組通知、簽到或資料時，我能讓同工跟得上、不會漏掉？", projection: { P: 0.05, S: 0, G: 0.3, C: 0.45, R: 0.1, F: 0.1 } },
    { id: "a03", domain: "admin_ops", ksa: "A", label: "面對繁瑣行政，我仍能保持耐心，不輕易敷衍？", projection: { P: 0.1, S: 0.05, G: 0.2, C: 0.4, R: 0.15, F: 0.1 } },
    { id: "a04", domain: "admin_ops", ksa: "S", label: "我願意寫簡短交接或 SOP，讓小組事工不因請假而停擺？", projection: { P: 0.05, S: 0, G: 0.35, C: 0.45, R: 0.1, F: 0.05 } },
    { id: "l01", domain: "lead_comm", ksa: "K", label: "帶查經或小組時，我能說清楚這段要幫助組員明白什麼？", projection: { P: 0.1, S: 0.1, G: 0.2, C: 0.35, R: 0.2, F: 0.05 } },
    { id: "l02", domain: "lead_comm", ksa: "S", label: "小組討論發散時，我能溫和地幫大家收斂到一兩個可實踐的結論？", projection: { P: 0.15, S: 0.1, G: 0.15, C: 0.35, R: 0.25, F: 0 } },
    { id: "l03", domain: "lead_comm", ksa: "A", label: "我願意成全組員、提攜後輩，而不是自己一直當主角？", projection: { P: 0.2, S: 0.1, G: 0.1, C: 0.25, R: 0.3, F: 0.05 } },
    { id: "l04", domain: "lead_comm", ksa: "S", label: "我能用清楚、溫和的方式向組員說明這週服事重點？", projection: { P: 0.1, S: 0.1, G: 0.2, C: 0.35, R: 0.25, F: 0 } },
    { id: "c01", domain: "care_practice", ksa: "K", label: "探訪或傾聽時，我知道哪些話不該亂說（例如不替人下醫療或屬靈診斷）？", projection: { P: 0.25, S: 0.1, G: 0, C: 0.3, R: 0.3, F: 0.05 } },
    { id: "c02", domain: "care_practice", ksa: "S", label: "一對一聊天時，我會少插話，讓對方感到被聽見？", projection: { P: 0.25, S: 0.15, G: 0, C: 0.25, R: 0.3, F: 0.05 } },
    { id: "c03", domain: "care_practice", ksa: "A", label: "我能保守組員隱私，在同理與界線之間取得平衡？", projection: { P: 0.3, S: 0.1, G: 0, C: 0.2, R: 0.35, F: 0.05 } },
    { id: "c04", domain: "care_practice", ksa: "S", label: "組員情緒激動時，我能先安撫，再請牧者或更資深同工介入？", projection: { P: 0.2, S: 0.1, G: 0.05, C: 0.2, R: 0.35, F: 0.1 } },
    { id: "t01", domain: "teach_design", ksa: "K", label: "備查經前，我能先抓住經文重點，而不是只找故事填時間？", projection: { P: 0.05, S: 0.1, G: 0.1, C: 0.55, R: 0.15, F: 0.05 } },
    { id: "t02", domain: "teach_design", ksa: "S", label: "我能為組員準備簡單教案或討論問題，步驟清楚？", projection: { P: 0.05, S: 0.1, G: 0.1, C: 0.55, R: 0.15, F: 0.05 } },
    { id: "t03", domain: "teach_design", ksa: "A", label: "我對真理懷抱敬畏，願意依組員程度調整節奏？", projection: { P: 0.1, S: 0.1, G: 0.05, C: 0.45, R: 0.2, F: 0.1 } },
    { id: "t04", domain: "teach_design", ksa: "S", label: "帶查經時，我會控制時間並留出組員分享？", projection: { P: 0.1, S: 0.1, G: 0.05, C: 0.5, R: 0.2, F: 0.05 } },
    { id: "m01", domain: "team_collab", ksa: "K", label: "我大概知道教會各部門如何配合（例如主日學、敬拜、關懷）？", projection: { P: 0.05, S: 0.05, G: 0.15, C: 0.25, R: 0.45, F: 0.05 } },
    { id: "m02", domain: "team_collab", ksa: "S", label: "與同工意見不同時，我會主動溝通、尋求共識？", projection: { P: 0.1, S: 0.1, G: 0.1, C: 0.15, R: 0.5, F: 0.05 } },
    { id: "m03", domain: "team_collab", ksa: "A", label: "我願意配合整體調度，而不是堅持自己的做法？", projection: { P: 0.1, S: 0.05, G: 0.1, C: 0.15, R: 0.55, F: 0.05 } },
    { id: "m04", domain: "team_collab", ksa: "S", label: "我會主動與相鄰事工同步資訊，避免重複勞動？", projection: { P: 0.05, S: 0, G: 0.15, C: 0.25, R: 0.45, F: 0.1 } },
    { id: "r01", domain: "crisis_resp", ksa: "K", label: "主日或聚會若有人身體不適、設備故障，我知道該通知誰？", projection: { P: 0.1, S: 0.1, G: 0.15, C: 0.3, R: 0.2, F: 0.15 } },
    { id: "r02", domain: "crisis_resp", ksa: "S", label: "主日突發狀況時，我能冷靜補位或照已知步驟應對？", projection: { P: 0.15, S: 0.05, G: 0.1, C: 0.3, R: 0.25, F: 0.15 } },
    { id: "r03", domain: "crisis_resp", ksa: "A", label: "面對突發壓力或指責時，我仍能穩住情緒、不輕易崩潰？", projection: { P: 0.2, S: 0.1, G: 0.05, C: 0.2, R: 0.25, F: 0.2 } },
    { id: "r04", domain: "crisis_resp", ksa: "S", label: "小組或聚會衝突時，我會先穩定現場，再請有權柄者介入？", projection: { P: 0.15, S: 0.05, G: 0.1, C: 0.2, R: 0.35, F: 0.15 } }
  ];

  var COMPETENCY_THRESHOLD = 3;

  var FLAG_DESCRIPTIONS = {
    SKILL_GAP: "關鍵能力域低於門檻 — 宜安排 90 天導師陪跑試任，不作單次淘汰。",
    KSA_GAP: "KSA 矩陣有明顯缺口 — 請對照 Tab ④ 安排微課程或 shadow 陪跑。"
  };

  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  function validate(answers) {
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

  function computeDomainScores(map) {
    var sums = {};
    var counts = {};
    QUESTIONS.forEach(function (q) {
      if (!sums[q.domain]) {
        sums[q.domain] = 0;
        counts[q.domain] = 0;
      }
      sums[q.domain] += map[q.id];
      counts[q.domain] += 1;
    });
    var scores = {};
    Object.keys(sums).forEach(function (d) {
      scores[d] = counts[d] ? round1(sums[d] / counts[d]) : 0;
    });
    var ranked = Object.keys(scores).sort(function (a, b) {
      return scores[b] - scores[a];
    });
    return {
      domain_scores: scores,
      primary_domain: ranked[0] || "—",
      secondary_domain: ranked[1] || "—",
      primary_label: DOMAIN_LABELS[ranked[0]] || ranked[0],
      weakest_domain: ranked[ranked.length - 1] || "—",
      weakest_label: DOMAIN_LABELS[ranked[ranked.length - 1]] || "—",
      weakest_score: scores[ranked[ranked.length - 1]] || 0
    };
  }

  function computeKsaScores(map) {
    var overall = { K: [], S: [], A: [] };
    var byDomain = {};
    QUESTIONS.forEach(function (q) {
      if (!byDomain[q.domain]) byDomain[q.domain] = { K: [], S: [], A: [] };
      if (map[q.id] != null && q.ksa) {
        byDomain[q.domain][q.ksa].push(map[q.id]);
        overall[q.ksa].push(map[q.id]);
      }
    });
    var ksa_overall = {};
    ["K", "S", "A"].forEach(function (k) {
      var arr = overall[k];
      ksa_overall[k] = arr.length ? round1(arr.reduce(function (a, b) { return a + b; }, 0) / arr.length) : 0;
    });
    var domain_ksa = {};
    Object.keys(byDomain).forEach(function (dom) {
      domain_ksa[dom] = {};
      ["K", "S", "A"].forEach(function (k) {
        var arr = byDomain[dom][k];
        domain_ksa[dom][k] = arr.length ? round1(arr.reduce(function (a, b) { return a + b; }, 0) / arr.length) : null;
      });
    });
    var weakestKsa = "K";
    var weakestKsaScore = ksa_overall.K;
    ["S", "A"].forEach(function (k) {
      if (ksa_overall[k] < weakestKsaScore) {
        weakestKsa = k;
        weakestKsaScore = ksa_overall[k];
      }
    });
    return {
      ksa_overall: ksa_overall,
      domain_ksa: domain_ksa,
      weakest_ksa: weakestKsa,
      weakest_ksa_score: weakestKsaScore,
      training_hint: KSA_TRAINING_HINT[weakestKsa] || ""
    };
  }

  function computeFeatureVector(map) {
    var RT = global.CTAOSRuntime;
    var items = QUESTIONS.map(function (q) {
      return { value: map[q.id], projection: q.projection };
    });
    if (RT && RT.scoreByProjection) return RT.scoreByProjection(items);
    return { P: 50, S: 50, G: 50, C: 55, R: 52, F: 50 };
  }

  function buildMicroStep(derived) {
    derived = derived || {};
    var mp = derived.matrix_position || {};
    var domainSteps = {
      teach_design: "本週備查經時，先寫下「組員要帶走的一個重點」再開始帶領。",
      lead_comm: "本週小組中，刻意留 5 分鐘讓組員分享，自己少講一點。",
      care_practice: "本週關心一位組員，只傾聽、不給建議，結束時代禱一句。",
      admin_ops: "本週把一項小組行政（通知／簽到）寫成三行交接給同工。",
      team_collab: "本週主動與一位相鄰事工同工同步本週安排，避免重複。",
      crisis_resp: "本週向一位資深同工確認：主日突發狀況該找誰？"
    };
    if (mp.profile_type === "passionate_rookie") {
      return "本週跟一位有經驗的同工 shadow 一次查經或服事（只觀察、記一個學習點）。";
    }
    if (mp.profile_type === "skilled_burnout") {
      return "本週與牧者談 15 分鐘，只談節奏與心志更新，不加新服事。";
    }
    return domainSteps[derived.weakest_domain] || "本週與牧者約 15 分鐘，談一項可 shadow 的成長小步。";
  }

  function buildCoaching(derived) {
    var mp = derived.matrix_position || {};
    return {
      capability_note:
        "強項「" +
        derived.primary_label +
        "」／成長中「" +
        derived.weakest_label +
        "」— 陪跑方向：" +
        (derived.training_hint || ""),
      growth_accompaniment:
        mp.growth_label || mp.profile_label || "均衡成長區 — 與牧者談試任節奏。",
      micro_step: buildMicroStep(derived),
      redflag: "本報告是成長陪伴參考，不作升遷或淘汰依據；出路卡須 HITL 確認。"
    };
  }

  function buildMatrixPosition(ksa_overall) {
    ksa_overall = ksa_overall || { K: 3, S: 3, A: 3 };
    var k = Number(ksa_overall.K) || 0;
    var s = Number(ksa_overall.S) || 0;
    var a = Number(ksa_overall.A) || 0;
    var capability = round1((k + s) / 2);
    var profile =
      capability >= 3.5 && a >= 3.5
        ? "leader_core"
        : capability < 3 && a >= 3.5
          ? "passionate_rookie"
          : capability >= 3.5 && a < 3
            ? "skilled_burnout"
            : "developing";
    return {
      capability_axis: capability,
      attitude: a,
      knowledge: k,
      skills: s,
      profile_type: profile,
      profile_label:
        profile === "leader_core"
          ? "核心穩定區（可談授權與成全）"
          : profile === "passionate_rookie"
            ? "熱心成長區（宜 shadow 陪跑）"
            : profile === "skilled_burnout"
              ? "技能穩、心志需更新（宜節奏調整）"
              : "均衡成長區（小步試任）",
      growth_label:
        profile === "leader_core"
          ? "您在能力與心志上較穩定，適合與牧者談成全與授權。"
          : profile === "passionate_rookie"
            ? "您的心志很寶貴，技能可透過 shadow 慢慢長成。"
            : profile === "skilled_burnout"
              ? "您的技能是教會資產，宜先談心志更新與減負。"
              : "您在各面向均衡成長中，適合小步試任與陪跑。"
    };
  }

  function buildKsaExecutionContract(derived, store) {
    var shape = store && store.loadLatest ? store.loadLatest("shape") : null;
    return {
      schema_version: 1,
      source_tool: TOOL_ID,
      ksa_overall: derived.ksa_overall,
      matrix_position: derived.matrix_position,
      weakest_domain: derived.weakest_domain,
      weakest_ksa: derived.weakest_ksa,
      threshold: derived.threshold,
      shape_top_heart: shape && shape.derived ? shape.derived.top_heart : null,
      execution_note: "KSA 修飾 employ/explore；事奉大類仍以 SHAPE 為主軸。"
    };
  }

  function buildRun(answers, profile, opts) {
    opts = opts || {};
    var check = validate(answers);
    if (!check.ok) return { ok: false, errors: check.errors };
    var map = check.answers;
    var domains = computeDomainScores(map);
    var ksa = computeKsaScores(map);
    var matrix_position = buildMatrixPosition(ksa.ksa_overall);
    var derived = {
      domain_scores: domains.domain_scores,
      domain_ksa: ksa.domain_ksa,
      ksa_overall: ksa.ksa_overall,
      matrix_position: matrix_position,
      weakest_ksa: ksa.weakest_ksa,
      weakest_ksa_score: ksa.weakest_ksa_score,
      training_hint: ksa.training_hint,
      primary_domain: domains.primary_domain,
      secondary_domain: domains.secondary_domain,
      primary_label: domains.primary_label,
      weakest_domain: domains.weakest_domain,
      weakest_label: domains.weakest_label,
      weakest_score: domains.weakest_score,
      affirmation: DOMAIN_AFFIRMATION[domains.primary_domain] || "",
      threshold: COMPETENCY_THRESHOLD,
      matrix_note:
        matrix_position.profile_label +
        " — 最弱 KSA：" +
        KSA_LABELS[ksa.weakest_ksa] +
        "（" +
        ksa.weakest_ksa_score +
        "）"
    };
    var executionContract = buildKsaExecutionContract(derived, global.AssessmentRunStore);
    derived.ksa_execution_contract = executionContract;
    var flags = [];
    if (domains.weakest_score < COMPETENCY_THRESHOLD) flags.push("SKILL_GAP");
    if (ksa.weakest_ksa_score < COMPETENCY_THRESHOLD) flags.push("KSA_GAP");
    var run = {
      schema_version: 1,
      tool_id: TOOL_ID,
      timestamp: opts.timestamp || Date.now(),
      member_id: opts.member_id != null ? opts.member_id : null,
      profile: Object.assign({ name: "", role: "" }, profile || {}),
      authenticity_score: 1,
      feature_vector: computeFeatureVector(map),
      derived: derived,
      ksa_execution_contract: executionContract,
      raw_answers: QUESTIONS.map(function (q) {
        return { q: q.id, value: map[q.id], ksa: q.ksa, domain: q.domain };
      }),
      risk_flags: flags,
      coaching: buildCoaching(derived),
      source_note: "competency_pack v2 · KSA · " + QUESTIONS.length + " 題"
    };
    if (global.MinistryPathBridge && MinistryPathBridge.attachPathCards) {
      MinistryPathBridge.attachPathCards(run, { sourceTool: "competency", sourceRun: run, store: global.AssessmentRunStore });
    }
    return { ok: true, run: run };
  }

  function buildDemoRun() {
    var answers = {};
    QUESTIONS.forEach(function (q) {
      if (q.ksa === "A") answers[q.id] = 5;
      else if (q.ksa === "K") answers[q.id] = 2;
      else if (q.ksa === "S") answers[q.id] = q.domain === "teach_design" ? 2 : 3;
      else answers[q.id] = 3;
    });
    var built = buildRun(answers, { name: "示範同工", role: "主日學協助" });
    if (built.ok && built.run && built.run.derived) {
      built.run.is_demo = true;
      built.run.derived.ksa_overall = { K: 2.4, S: 2.6, A: 4.8 };
      built.run.derived.matrix_position = buildMatrixPosition(built.run.derived.ksa_overall);
      built.run.derived.matrix_note =
        "熱心成長區 — 宜 90 天 shadow 陪跑，不作淘汰。";
      built.run.ksa_execution_contract = buildKsaExecutionContract(built.run.derived, global.AssessmentRunStore);
      built.run.derived.ksa_execution_contract = built.run.ksa_execution_contract;
    }
    return built;
  }

  global.CompetencyPack = {
    TOOL_ID: TOOL_ID,
    TOOL_LABEL: TOOL_LABEL,
    KSA_LABELS: KSA_LABELS,
    DOMAIN_LABELS: DOMAIN_LABELS,
    DOMAIN_AFFIRMATION: DOMAIN_AFFIRMATION,
    KSA_TRAINING_HINT: KSA_TRAINING_HINT,
    QUESTIONS: QUESTIONS,
    COMPETENCY_THRESHOLD: COMPETENCY_THRESHOLD,
    FLAG_DESCRIPTIONS: FLAG_DESCRIPTIONS,
    validate: validate,
    computeDomainScores: computeDomainScores,
    computeKsaScores: computeKsaScores,
    buildRun: buildRun,
    buildDemoRun: buildDemoRun,
    buildMatrixPosition: buildMatrixPosition,
    buildKsaExecutionContract: buildKsaExecutionContract
  };
})(typeof window !== "undefined" ? window : global);
