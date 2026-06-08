/**
 * DISC 溝通風格 · 工具包（disc）
 * 16 題 Likert → D/I/S/C 分數 · 修飾 MinistryPathBridge role_label
 */
(function (global) {
  "use strict";

  var TOOL_ID = "disc";
  var TOOL_LABEL = "DISC 溝通風格自評";

  var STYLE_LABELS = {
    D: "D 推進型",
    I: "I 影響型",
    S: "S 穩定型",
    C: "C 嚴謹型"
  };

  var STYLE_AFFIRMATION = {
    D: "推進型不是霸道——教會需要破冰者、危機小組的決斷者。天生我才必有用，放對位置就是祝福。",
    I: "影響型不是膚淺——教會需要讓人感到被歡迎、被連結的橋樑。天生我才必有用。",
    S: "穩定型不是消極——教會需要長期陪伴、探訪的守護者。天生我才必有用。",
    C: "嚴謹型不是冷血——教會需要把異象落地、把流程做穩的人。天生我才必有用。"
  };

  var QUESTIONS = [
    { id: "d01", style: "D", label: "長執會意見衝突時，我傾向直接推進、快速決斷。", projection: { P: 0.15, S: 0, G: 0.25, C: 0.15, R: 0.35, F: 0.1 } },
    { id: "d02", style: "D", label: "籌備佈道會時，我喜歡設定明確目標並帶領團隊達成。", projection: { P: 0.1, S: 0, G: 0.3, C: 0.2, R: 0.3, F: 0.1 } },
    { id: "d03", style: "D", label: "面對突發事工張力，我常提出挑戰現狀的觀點。", projection: { P: 0.1, S: 0.05, G: 0.25, C: 0.15, R: 0.35, F: 0.1 } },
    { id: "d04", style: "D", label: "教會危機時，我願意站出來承擔責任。", projection: { P: 0.2, S: 0.1, G: 0.2, C: 0.1, R: 0.3, F: 0.1 } },
    { id: "i01", style: "I", label: "服事後與同工交流，我能用話語激勵團隊、營造正面氛圍。", projection: { P: 0.1, S: 0.15, G: 0.05, C: 0.1, R: 0.55, F: 0.05 } },
    { id: "i02", style: "I", label: "主日接待新朋友時，我樂於認識並建立關係。", projection: { P: 0.05, S: 0.1, G: 0.1, C: 0.15, R: 0.5, F: 0.1 } },
    { id: "i03", style: "I", label: "在小組或事工團隊中，我傾向成為連結各人的橋樑。", projection: { P: 0.05, S: 0.05, G: 0.05, C: 0.1, R: 0.65, F: 0.1 } },
    { id: "i04", style: "I", label: "長執會或同工會議中，我樂於公開分享想法以帶動討論。", projection: { P: 0.05, S: 0.1, G: 0.1, C: 0.15, R: 0.55, F: 0.05 } },
    { id: "s01", style: "S", label: "事工節奏上，我偏好穩定，不願頻繁劇烈變動。", projection: { P: 0.25, S: 0.15, G: 0.05, C: 0.1, R: 0.35, F: 0.1 } },
    { id: "s02", style: "S", label: "探訪長者或長期關懷同一人時，我能耐心傾聽、陪伴。", projection: { P: 0.3, S: 0.2, G: 0, C: 0.15, R: 0.3, F: 0.05 } },
    { id: "s03", style: "S", label: "團隊和諧對我比快速贏更重要。", projection: { P: 0.15, S: 0.1, G: 0.05, C: 0.1, R: 0.55, F: 0.05 } },
    { id: "s04", style: "S", label: "做決定前我謹慎，避免倉促傷害他人。", projection: { P: 0.2, S: 0.15, G: 0.05, C: 0.15, R: 0.4, F: 0.05 } },
    { id: "c01", style: "C", label: "週報行政校對時，我重視細節、流程與品質標準。", projection: { P: 0.05, S: 0, G: 0.35, C: 0.45, R: 0.1, F: 0.05 } },
    { id: "c02", style: "C", label: "長執會做決定前，我習慣收集充分資料。", projection: { P: 0.05, S: 0.05, G: 0.25, C: 0.45, R: 0.15, F: 0.05 } },
    { id: "c03", style: "C", label: "籌備大型聚會時，我善於把複雜任務拆解成可檢核步驟。", projection: { P: 0, S: 0, G: 0.4, C: 0.45, R: 0.1, F: 0.05 } },
    { id: "c04", style: "C", label: "對事工錯誤與疏漏我較敏感，傾向先修正再前進。", projection: { P: 0.1, S: 0.05, G: 0.2, C: 0.5, R: 0.1, F: 0.05 } }
  ];

  function validate(answers, questionSet) {
    questionSet = questionSet || QUESTIONS;
    var map = {};
    var errors = [];
    if (!answers || typeof answers !== "object") return { ok: false, errors: ["缺少 answers"] };
    questionSet.forEach(function (q) {
      var v = Number(answers[q.id]);
      if (!isFinite(v) || v < 1 || v > 5) errors.push("題 " + q.id + " 須為 1–5");
      else map[q.id] = v;
    });
    return errors.length ? { ok: false, errors: errors } : { ok: true, answers: map };
  }

  function computeStyleScores(map) {
    var sums = { D: 0, I: 0, S: 0, C: 0 };
    var counts = { D: 0, I: 0, S: 0, C: 0 };
    QUESTIONS.forEach(function (q) {
      sums[q.style] += map[q.id];
      counts[q.style] += 1;
    });
    var scores = {};
    ["D", "I", "S", "C"].forEach(function (k) {
      scores[k] = counts[k] ? Math.round((sums[k] / counts[k]) * 10) / 10 : 0;
    });
    var ranked = ["D", "I", "S", "C"].sort(function (a, b) {
      return scores[b] - scores[a];
    });
    return {
      scores: scores,
      primary: ranked[0],
      secondary: ranked[1],
      primary_label: STYLE_LABELS[ranked[0]]
    };
  }

  /** 事工壓力下的修飾輪廓（對照自評，供 Tab ③ 四軸對比圖） */
  function computeStressScores(naturalScores, featureVector) {
    var fv = featureVector || {};
    var stress = {};
    ["D", "I", "S", "C"].forEach(function (k) {
      var base = naturalScores[k] || 3;
      var mod = 0;
      if (k === "D") mod = ((fv.R || 50) - 50) * 0.03 + ((fv.G || 50) - 50) * 0.02;
      if (k === "I") mod = ((fv.R || 50) - 50) * 0.025;
      if (k === "S") mod = -((fv.G || 50) - 50) * 0.025 - ((fv.R || 50) - 50) * 0.015;
      if (k === "C") mod = ((fv.C || 50) - 50) * 0.025 + ((fv.G || 50) - 50) * 0.02;
      stress[k] = Math.round(Math.min(5, Math.max(1, base + mod)) * 10) / 10;
    });
    return stress;
  }

  function rankPrimary(scores) {
    var ranked = ["D", "I", "S", "C"].sort(function (a, b) {
      return (scores[b] || 0) - (scores[a] || 0);
    });
    return { primary: ranked[0], primary_label: STYLE_LABELS[ranked[0]] };
  }

  function buildStressNote(natural, stress, natPrimary, stressPrimary) {
    if (natPrimary === stressPrimary) {
      return "自評與壓力修飾主型一致（" + STYLE_LABELS[natPrimary] + "）— 服事節奏相對穩定；仍須與 SHAPE 主軸交叉，勿單憑 DISC 派工。";
    }
    var gap = ["D", "I", "S", "C"].map(function (k) {
      return Math.abs((stress[k] || 0) - (natural[k] || 0));
    });
    var maxGap = Math.max.apply(null, gap);
    return (
      "壓力下主修飾轉向「" +
      STYLE_LABELS[stressPrimary] +
      "」（自評主型「" +
      STYLE_LABELS[natPrimary] +
      "」）— 最大軸差約 " +
      maxGap.toFixed(1) +
      " 分。牧者可談：事工張力是否迫使同工「扮演」非自然節奏？如何互補配搭？"
    );
  }

  function computeFeatureVector(map) {
    var RT = global.CTAOSRuntime;
    var items = QUESTIONS.map(function (q) {
      return { value: map[q.id], projection: q.projection };
    });
    if (RT && RT.scoreByProjection) return RT.scoreByProjection(items);
    return { P: 50, S: 50, G: 50, C: 50, R: 58, F: 50 };
  }

  function buildRun(answers, profile, opts) {
    opts = opts || {};
    var check = validate(answers);
    if (!check.ok) return { ok: false, errors: check.errors };
    var map = check.answers;
    var style = computeStyleScores(map);
    var fv = computeFeatureVector(map);
    var stressScores = computeStressScores(style.scores, fv);
    var stressRank = rankPrimary(stressScores);
    var derived = {
      primary: style.primary,
      secondary: style.secondary,
      primary_label: style.primary_label,
      scores: style.scores,
      stress_scores: stressScores,
      stress_primary: stressRank.primary,
      stress_primary_label: stressRank.primary_label,
      stress_note: buildStressNote(style.scores, stressScores, style.primary, stressRank.primary),
      affirmation: STYLE_AFFIRMATION[style.primary] || ""
    };
    var run = {
      schema_version: 1,
      tool_id: TOOL_ID,
      timestamp: opts.timestamp || Date.now(),
      member_id: opts.member_id != null ? opts.member_id : null,
      profile: Object.assign({ name: "", role: "" }, profile || {}),
      authenticity_score: 1,
      feature_vector: fv,
      derived: derived,
      raw_answers: QUESTIONS.map(function (q) {
        return { q: q.id, value: map[q.id] };
      }),
      risk_flags: [],
      coaching: { style_note: derived.affirmation },
      source_note: "disc_pack v1 · " + QUESTIONS.length + " 題"
    };
    if (global.MinistryPathBridge && MinistryPathBridge.attachPathCards) {
      MinistryPathBridge.attachPathCards(run, { sourceTool: "disc", sourceRun: run, store: global.AssessmentRunStore });
    }
    return { ok: true, run: run };
  }

  function buildDemoRun() {
    var answers = {};
    QUESTIONS.forEach(function (q) {
      answers[q.id] = q.style === "S" ? 4 : q.style === "D" ? 2 : 3;
    });
    answers.s01 = 5;
    answers.s02 = 5;
    answers.s03 = 5;
    answers.d01 = 2;
    answers.c01 = 3;
    var built = buildRun(answers, { name: "示範同工", role: "關懷組" });
    if (built.ok && built.run && built.run.derived) {
      built.run.is_demo = true;
      built.run.derived.stress_scores = { D: 3.8, I: 2.5, S: 3.2, C: 4.2 };
      built.run.derived.stress_primary = "C";
      built.run.derived.stress_primary_label = STYLE_LABELS.C;
      built.run.derived.stress_note = buildStressNote(
        built.run.derived.scores,
        built.run.derived.stress_scores,
        built.run.derived.primary,
        "C"
      );
    }
    return built;
  }

  global.DiscPack = {
    TOOL_ID: TOOL_ID,
    TOOL_LABEL: TOOL_LABEL,
    QUESTIONS: QUESTIONS,
    STYLE_LABELS: STYLE_LABELS,
    STYLE_AFFIRMATION: STYLE_AFFIRMATION,
    validate: validate,
    buildRun: buildRun,
    buildDemoRun: buildDemoRun
  };
})(typeof window !== "undefined" ? window : global);
