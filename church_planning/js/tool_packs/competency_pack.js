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
    { id: "a01", domain: "admin_ops", ksa: "K", label: "我清楚教會請購、場地借用與基本法規／安全流程。", projection: { P: 0, S: 0, G: 0.35, C: 0.55, R: 0.05, F: 0.1 } },
    { id: "a02", domain: "admin_ops", ksa: "S", label: "我能熟練整理文書、排班與資料歸檔，讓團隊跟得上進度。", projection: { P: 0.05, S: 0, G: 0.3, C: 0.45, R: 0.1, F: 0.1 } },
    { id: "a03", domain: "admin_ops", ksa: "A", label: "面對繁瑣行政，我仍能保持耐心與細心，不輕易敷衍。", projection: { P: 0.1, S: 0.05, G: 0.2, C: 0.4, R: 0.15, F: 0.1 } },
    { id: "a04", domain: "admin_ops", ksa: "S", label: "我願意建立 SOP 或交接筆記，讓事工不因人事變動停擺。", projection: { P: 0.05, S: 0, G: 0.35, C: 0.45, R: 0.1, F: 0.05 } },
    { id: "l01", domain: "lead_comm", ksa: "K", label: "我理解小組動力學與異象傳遞的基本原理。", projection: { P: 0.1, S: 0.1, G: 0.2, C: 0.35, R: 0.2, F: 0.05 } },
    { id: "l02", domain: "lead_comm", ksa: "S", label: "我能在會議或小組中引導討論並收斂成可執行結論。", projection: { P: 0.15, S: 0.1, G: 0.15, C: 0.35, R: 0.25, F: 0 } },
    { id: "l03", domain: "lead_comm", ksa: "A", label: "我具備成全他人、提攜後輩的謙卑心態。", projection: { P: 0.2, S: 0.1, G: 0.1, C: 0.25, R: 0.3, F: 0.05 } },
    { id: "l04", domain: "lead_comm", ksa: "S", label: "我能用清楚、溫和的方式向同工傳達事工異象與期待。", projection: { P: 0.1, S: 0.1, G: 0.2, C: 0.35, R: 0.25, F: 0 } },
    { id: "c01", domain: "care_practice", ksa: "K", label: "我明白基本輔導傾聽原則與探訪禁忌（不越權給醫療建議）。", projection: { P: 0.25, S: 0.1, G: 0, C: 0.3, R: 0.3, F: 0.05 } },
    { id: "c02", domain: "care_practice", ksa: "S", label: "一對一傾聽時，我能專注、少打斷，讓對方感到被尊重。", projection: { P: 0.25, S: 0.15, G: 0, C: 0.25, R: 0.3, F: 0.05 } },
    { id: "c03", domain: "care_practice", ksa: "A", label: "我能長期保守會友隱私，具備高度同理心與界線。", projection: { P: 0.3, S: 0.1, G: 0, C: 0.2, R: 0.35, F: 0.05 } },
    { id: "c04", domain: "care_practice", ksa: "S", label: "當會友情緒激動，我能先安撫再轉介牧者或專業資源。", projection: { P: 0.2, S: 0.1, G: 0.05, C: 0.2, R: 0.35, F: 0.1 } },
    { id: "t01", domain: "teach_design", ksa: "K", label: "我系統性掌握基要真理，能對準經文重點備課。", projection: { P: 0.05, S: 0.1, G: 0.1, C: 0.55, R: 0.15, F: 0.05 } },
    { id: "t02", domain: "teach_design", ksa: "S", label: "我能獨立編寫教案，設計適合對象年齡的教學步驟。", projection: { P: 0.05, S: 0.1, G: 0.1, C: 0.55, R: 0.15, F: 0.05 } },
    { id: "t03", domain: "teach_design", ksa: "A", label: "我對真理懷抱敬畏，樂意因材施教、調整節奏。", projection: { P: 0.1, S: 0.1, G: 0.05, C: 0.45, R: 0.2, F: 0.1 } },
    { id: "t04", domain: "teach_design", ksa: "S", label: "帶領查經或主日學時，我能控制時間並留出討論空間。", projection: { P: 0.1, S: 0.1, G: 0.05, C: 0.5, R: 0.2, F: 0.05 } },
    { id: "m01", domain: "team_collab", ksa: "K", label: "我理解堂會跨部門運作的整體架構與溝通節點。", projection: { P: 0.05, S: 0.05, G: 0.15, C: 0.25, R: 0.45, F: 0.05 } },
    { id: "m02", domain: "team_collab", ksa: "S", label: "意見不合時，我能主動溝通、尋求共識而非堅持己見。", projection: { P: 0.1, S: 0.1, G: 0.1, C: 0.15, R: 0.5, F: 0.05 } },
    { id: "m03", domain: "team_collab", ksa: "A", label: "我樂意放下個人堅持，配合整體調度與異象。", projection: { P: 0.1, S: 0.05, G: 0.1, C: 0.15, R: 0.55, F: 0.05 } },
    { id: "m04", domain: "team_collab", ksa: "S", label: "我會主動與相鄰事工同步資訊，減少重複勞動。", projection: { P: 0.05, S: 0, G: 0.15, C: 0.25, R: 0.45, F: 0.1 } },
    { id: "r01", domain: "crisis_resp", ksa: "K", label: "我清楚聚會突發狀況（設備、醫療、安全）的通報 SOP。", projection: { P: 0.1, S: 0.1, G: 0.15, C: 0.3, R: 0.2, F: 0.15 } },
    { id: "r02", domain: "crisis_resp", ksa: "S", label: "主日突發狀況時，我能冷靜補位或照 SOP 應對。", projection: { P: 0.15, S: 0.05, G: 0.1, C: 0.3, R: 0.25, F: 0.15 } },
    { id: "r03", domain: "crisis_resp", ksa: "A", label: "面對突發壓力或指責時，我具備情緒韌性，不輕易崩潰。", projection: { P: 0.2, S: 0.1, G: 0.05, C: 0.2, R: 0.25, F: 0.2 } },
    { id: "r04", domain: "crisis_resp", ksa: "S", label: "面對突發衝突，我會先穩定現場，再請有權柄者介入。", projection: { P: 0.15, S: 0.05, G: 0.1, C: 0.2, R: 0.35, F: 0.15 } }
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
          ? "領袖核心區"
          : profile === "passionate_rookie"
            ? "高心志、低技能 · 熱血新人"
            : profile === "skilled_burnout"
              ? "高技能、低心志 · 倦怠老手"
              : "均衡發展／陪跑試任區"
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
      coaching: {
        capability_note:
          "強項「" +
          domains.primary_label +
          "」／待補「" +
          domains.weakest_label +
          "」— KSA 最弱：" +
          KSA_LABELS[ksa.weakest_ksa] +
          "（" +
          ksa.weakest_ksa_score +
          "）· " +
          ksa.training_hint
      },
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
        "高心志、低技能 · 熱血新人 — 宜 90 天 shadow 陪跑，不作淘汰。";
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
