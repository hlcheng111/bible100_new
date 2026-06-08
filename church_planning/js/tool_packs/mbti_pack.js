/**
 * MBTI 性格傾向（教會治理版）· 工具包（mbti）
 * 16 題 Likert · 長執會／講道／牧養危機情境 · SHAPE P 軸 Fallback
 */
(function (global) {
  "use strict";

  var TOOL_ID = "mbti";
  var TOOL_LABEL = "MBTI 性格傾向自覺（教會治理版）";

  var AXIS_LABELS = {
    EI: "外向 E / 內向 I",
    SN: "實感 S / 直覺 N",
    TF: "思考 T / 情感 F",
    JP: "判斷 J / 感知 P"
  };

  var TYPE_CHURCH = {
    ISTJ: "規矩守護的行政守望者",
    ISFJ: "溫柔可靠的關懷後勤",
    INFJ: "幕後深思的屬靈導師",
    INTJ: "異象藍圖的戰略策劃者",
    ISTP: "冷靜應變的技術同工",
    ISFP: "安靜創作的敬拜藝術者",
    INFP: "理想主義的靈性陪輔",
    INTP: "真理深究的教學設計者",
    ESTP: "臨場突破的行動先鋒",
    ESFP: "歡迎氛圍的聚會帶動者",
    ENFP: "創意連結的拓荒激勵者",
    ENTP: "辯證創新的異象推手",
    ESTJ: "鋼鐵般的事工執行長",
    ESFJ: "關係樞紐的團隊管家",
    ENFJ: "鼓舞人心的帶領牧者",
    ENTJ: "推進決策的長執舵手"
  };

  var CODE_AFFIRMATION =
    "各傾向都是教會需要的肢體——不是誰高誰低，是時間、團隊與崗位是否對位。天生我才必有用。";

  var QUESTIONS = [
    { id: "e01", axis: "EI", letter: "E", label: "主日聚會後，與多位弟兄姊妹交流讓我感到被充電、更有力量服事。", projection: { P: 0.05, S: 0.05, G: 0, C: 0.1, R: 0.6, F: 0.2 } },
    { id: "e02", axis: "EI", letter: "E", label: "長執會或同工會議中，我傾向當場發言、帶動討論方向。", projection: { P: 0.1, S: 0.1, G: 0.1, C: 0.15, R: 0.5, F: 0.05 } },
    { id: "i01", axis: "EI", letter: "I", label: "深度一對一牧養對話，比大型公開服事更讓我覺得「做對了位置」。", projection: { P: 0.25, S: 0.15, G: 0, C: 0.1, R: 0.4, F: 0.1 } },
    { id: "i02", axis: "EI", letter: "I", label: "在服事空檔，我更需要獨處禱告、默想，才能整理心志再投入。", projection: { P: 0.15, S: 0.35, G: 0, C: 0.05, R: 0.3, F: 0.15 } },
    { id: "s01", axis: "SN", letter: "S", label: "聽完主日講道，我較關心「這週具體怎麼做」，而不是先談五年後異象。", projection: { P: 0.05, S: 0.05, G: 0.2, C: 0.55, R: 0.1, F: 0.05 } },
    { id: "s02", axis: "SN", letter: "S", label: "籌備事工時，我偏好依現有流程與檢核表，一步步務實完成。", projection: { P: 0, S: 0.05, G: 0.15, C: 0.55, R: 0.15, F: 0.1 } },
    { id: "n01", axis: "SN", letter: "N", label: "我常從講道或禱告中，看見教會未來可能的新方向與可能性。", projection: { P: 0.05, S: 0.1, G: 0.35, C: 0.25, R: 0.15, F: 0.1 } },
    { id: "n02", axis: "SN", letter: "N", label: "我善於用異象、隱喻，幫助會眾連結真理與當下處境。", projection: { P: 0.05, S: 0.15, G: 0.3, C: 0.3, R: 0.15, F: 0.05 } },
    { id: "t01", axis: "TF", letter: "T", label: "長執會面對爭議時，我優先釐清原則、制度與公平，再顧及情緒。", projection: { P: 0.05, S: 0, G: 0.25, C: 0.45, R: 0.15, F: 0.1 } },
    { id: "t02", axis: "TF", letter: "T", label: "我認為事奉要走得長久，需要清楚界線與可檢核的標準，而非只靠感覺。", projection: { P: 0.1, S: 0.05, G: 0.3, C: 0.35, R: 0.15, F: 0.05 } },
    { id: "f01", axis: "TF", letter: "F", label: "做決定前，我會先想「這對弟兄姊妹的心、關係意味著什麼」。", projection: { P: 0.25, S: 0.15, G: 0.05, C: 0.1, R: 0.4, F: 0.05 } },
    { id: "f02", axis: "TF", letter: "F", label: "若團隊和諧受損，即使方向正確，我也會感到難以安心推進。", projection: { P: 0.2, S: 0.1, G: 0.05, C: 0.05, R: 0.55, F: 0.05 } },
    { id: "j01", axis: "JP", letter: "J", label: "我喜歡事奉有明確時程、分工表與截止日，心裡比較踏實。", projection: { P: 0.05, S: 0, G: 0.35, C: 0.4, R: 0.1, F: 0.1 } },
    { id: "j02", axis: "JP", letter: "J", label: "年度計畫一旦排定，我傾向按表推進，減少臨時變更。", projection: { P: 0, S: 0, G: 0.3, C: 0.45, R: 0.15, F: 0.1 } },
    { id: "p01", axis: "JP", letter: "P", label: "突發關懷或危機需要時，我樂於暫停原計畫，彈性調整優先順序。", projection: { P: 0.1, S: 0.1, G: 0.15, C: 0.2, R: 0.25, F: 0.2 } },
    { id: "p02", axis: "JP", letter: "P", label: "面對未完全明朗的事工方向，我寧可保留選項，不過早定案。", projection: { P: 0.05, S: 0.05, G: 0.2, C: 0.25, R: 0.25, F: 0.2 } }
  ];

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

  function axisPairPct(leftSum, leftN, rightSum, rightN, leftLetter, rightLetter) {
    var leftAvg = leftN ? leftSum / leftN : 3;
    var rightAvg = rightN ? rightSum / rightN : 3;
    var total = leftAvg + rightAvg || 1;
    var leftPct = Math.round((leftAvg / total) * 100);
    var rightPct = 100 - leftPct;
    var margin = Math.abs(leftPct - 50);
    var dominant = leftPct >= rightPct ? leftLetter : rightLetter;
    var o = {};
    o[leftLetter] = leftPct;
    o[rightLetter] = rightPct;
    o.dominant = dominant;
    o.margin = margin;
    o.balance = margin < 8 ? "balanced" : margin < 20 ? "leaning" : "extreme";
    return o;
  }

  function computeAxisScores(map) {
    var pairs = {
      EI: { E: 0, I: 0, nE: 0, nI: 0 },
      SN: { S: 0, N: 0, nS: 0, nN: 0 },
      TF: { T: 0, F: 0, nT: 0, nF: 0 },
      JP: { J: 0, P: 0, nJ: 0, nP: 0 }
    };
    QUESTIONS.forEach(function (q) {
      var v = map[q.id];
      var bucket = pairs[q.axis];
      if (!bucket) return;
      if (q.letter === "E") {
        bucket.E += v;
        bucket.nE += 1;
      } else if (q.letter === "I") {
        bucket.I += v;
        bucket.nI += 1;
      } else if (q.letter === "S") {
        bucket.S += v;
        bucket.nS += 1;
      } else if (q.letter === "N") {
        bucket.N += v;
        bucket.nN += 1;
      } else if (q.letter === "T") {
        bucket.T += v;
        bucket.nT += 1;
      } else if (q.letter === "F") {
        bucket.F += v;
        bucket.nF += 1;
      } else if (q.letter === "J") {
        bucket.J += v;
        bucket.nJ += 1;
      } else if (q.letter === "P") {
        bucket.P += v;
        bucket.nP += 1;
      }
    });

    var axisPercents = {
      EI: axisPairPct(pairs.EI.E, pairs.EI.nE, pairs.EI.I, pairs.EI.nI, "E", "I"),
      SN: axisPairPct(pairs.SN.S, pairs.SN.nS, pairs.SN.N, pairs.SN.nN, "S", "N"),
      TF: axisPairPct(pairs.TF.T, pairs.TF.nT, pairs.TF.F, pairs.TF.nF, "T", "F"),
      JP: axisPairPct(pairs.JP.J, pairs.JP.nJ, pairs.JP.P, pairs.JP.nP, "J", "P")
    };

    var code =
      axisPercents.EI.dominant +
      axisPercents.SN.dominant +
      axisPercents.TF.dominant +
      axisPercents.JP.dominant;

    return { code: code, axes: pairs, axis_percents: axisPercents };
  }

  function buildEnergyNote(axisPercents) {
    var extremes = ["EI", "SN", "TF", "JP"].filter(function (k) {
      return axisPercents[k] && axisPercents[k].balance === "extreme";
    });
    if (!extremes.length) {
      return "四軸多為平衡或輕微偏態 — 適合彈性配崗；仍須與 SHAPE 恩賜主軸交叉，勿單憑字母派工。";
    }
    return (
      "極端軸：" +
      extremes
        .map(function (k) {
          var a = axisPercents[k];
          return k + "→" + a.dominant + "(" + Math.max(a.E || a.S || a.T || a.J || 0, a.I || a.N || a.F || a.P || 0) + "%)";
        })
        .join("、") +
      " — 與同字母但 51% 的同工節奏不同；牧養須看百分比落差，避免標籤化。"
    );
  }

  function buildShapePFallback(code, axisPercents, churchLabel) {
    return {
      schema_version: 1,
      source_tool: TOOL_ID,
      mbti_code: code,
      axis_percents: {
        EI: { E: axisPercents.EI.E, I: axisPercents.EI.I },
        SN: { S: axisPercents.SN.S, N: axisPercents.SN.N },
        TF: { T: axisPercents.TF.T, F: axisPercents.TF.F },
        JP: { J: axisPercents.JP.J, P: axisPercents.JP.P }
      },
      p_axis_label: "SHAPE P 軸 · " + code,
      church_type_label: churchLabel || TYPE_CHURCH[code] || "",
      fallback_note: "當 SHAPE 未填或 P 軸缺資料時，戰情室與媒合中心可引用此 MBTI Fallback。"
    };
  }

  function computeFeatureVector(map) {
    var RT = global.CTAOSRuntime;
    var items = QUESTIONS.map(function (q) {
      return { value: map[q.id], projection: q.projection };
    });
    if (RT && RT.scoreByProjection) return RT.scoreByProjection(items);
    return { P: 50, S: 50, G: 50, C: 50, R: 55, F: 50 };
  }

  function buildRun(answers, profile, opts) {
    opts = opts || {};
    var check = validate(answers);
    if (!check.ok) return { ok: false, errors: check.errors };
    var map = check.answers;
    var axis = computeAxisScores(map);
    var churchLabel = TYPE_CHURCH[axis.code] || "";
    var shapePFallback = buildShapePFallback(axis.code, axis.axis_percents, churchLabel);
    var derived = {
      code: axis.code,
      mbti_code: axis.code,
      axis_percents: axis.axis_percents,
      type_label_church: churchLabel,
      shape_p_fallback: shapePFallback,
      energy_note: buildEnergyNote(axis.axis_percents),
      affirmation: CODE_AFFIRMATION
    };
    var run = {
      schema_version: 1,
      tool_id: TOOL_ID,
      timestamp: opts.timestamp || Date.now(),
      member_id: opts.member_id != null ? opts.member_id : null,
      profile: Object.assign({ name: "", role: "" }, profile || {}),
      authenticity_score: 1,
      feature_vector: computeFeatureVector(map),
      derived: derived,
      mbti_code: axis.code,
      shape_p_fallback: shapePFallback,
      raw_answers: QUESTIONS.map(function (q) {
        return { q: q.id, value: map[q.id] };
      }),
      risk_flags: [],
      coaching: { code_note: "教會治理自覺用途，非臨床診斷；服事配對須搭配 SHAPE 主軸與牧者分辨。" },
      source_note: "mbti_pack v2 · " + QUESTIONS.length + " 題 · P軸 Fallback"
    };
    if (global.MinistryPathBridge && MinistryPathBridge.attachPathCards) {
      MinistryPathBridge.attachPathCards(run, { sourceTool: "mbti", sourceRun: run, store: global.AssessmentRunStore });
    }
    return { ok: true, run: run };
  }

  function buildDemoRun() {
    var answers = {};
    QUESTIONS.forEach(function (q) {
      answers[q.id] = 3;
    });
    answers.i01 = 5;
    answers.i02 = 5;
    answers.e01 = 2;
    answers.e02 = 2;
    answers.n01 = 5;
    answers.n02 = 4;
    answers.s01 = 2;
    answers.f01 = 5;
    answers.f02 = 5;
    answers.t01 = 2;
    answers.j01 = 4;
    answers.j02 = 5;
    answers.p01 = 2;
    var built = buildRun(answers, { name: "示範同工", role: "小組長" });
    if (built.ok && built.run) {
      built.run.is_demo = true;
      if (built.run.derived) {
        built.run.derived.axis_percents = {
          EI: { E: 32, I: 68, dominant: "I", margin: 18, balance: "leaning" },
          SN: { S: 28, N: 72, dominant: "N", margin: 22, balance: "extreme" },
          TF: { T: 26, F: 74, dominant: "F", margin: 24, balance: "extreme" },
          JP: { J: 65, P: 35, dominant: "J", margin: 15, balance: "leaning" }
        };
        built.run.derived.code = "INFJ";
        built.run.derived.mbti_code = "INFJ";
        built.run.derived.type_label_church = TYPE_CHURCH.INFJ;
        built.run.derived.shape_p_fallback = buildShapePFallback("INFJ", built.run.derived.axis_percents, TYPE_CHURCH.INFJ);
        built.run.derived.energy_note = buildEnergyNote(built.run.derived.axis_percents);
        built.run.mbti_code = "INFJ";
        built.run.shape_p_fallback = built.run.derived.shape_p_fallback;
      }
    }
    return built;
  }

  global.MbtiPack = {
    TOOL_ID: TOOL_ID,
    TOOL_LABEL: TOOL_LABEL,
    QUESTIONS: QUESTIONS,
    AXIS_LABELS: AXIS_LABELS,
    TYPE_CHURCH: TYPE_CHURCH,
    validate: validate,
    buildRun: buildRun,
    buildDemoRun: buildDemoRun,
    buildShapePFallback: buildShapePFallback
  };
})(typeof window !== "undefined" ? window : global);
