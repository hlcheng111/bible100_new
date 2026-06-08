/**
 * 重要 vs 緊急矩陣 · 工具包（urgent）
 * 12 題象限 + 2 題真實度反向題。無 DOM 依賴，可 Node 單測。
 * 依賴（可選）：CTAOSRuntime.scoreByProjection
 */
(function (global) {
  "use strict";

  var TOOL_ID = "urgent";
  var TOOL_LABEL = "重要 vs 緊急矩陣";

  var DIMENSIONS = ["P", "S", "G", "C", "R", "F"];

  var QUESTIONS = [
    {
      id: "u01",
      quadrant: "Q2",
      reverse: false,
      weight: 1,
      label: "我每週有固定時段處理「重要但不緊急」的事（靈修、門訓、家庭、長期規劃）。",
      projection: { P: 0.1, S: 0.15, G: 0.2, C: 0.25, R: 0.1, F: 0.2 }
    },
    {
      id: "u02",
      quadrant: "Q2",
      reverse: false,
      weight: 1,
      label: "我會把靈修與家庭關係放進「重要」清單，而不是等有空才做。",
      projection: { P: 0.15, S: 0.2, G: 0.1, C: 0.2, R: 0.1, F: 0.25 }
    },
    {
      id: "u03",
      quadrant: "Q2",
      reverse: false,
      weight: 1,
      label: "我會為深度同工（探訪、門訓、長執預備）預留不可被隨意取消的時段。",
      projection: { P: 0.1, S: 0.15, G: 0.15, C: 0.3, R: 0.15, F: 0.15 }
    },
    {
      id: "u04",
      quadrant: "Q1",
      reverse: false,
      weight: 1,
      label: "當危機出現，我容易進入「救火模式」，並難以抽身回到長期規劃。",
      projection: { P: 0.05, S: 0.1, G: 0.25, C: 0.35, R: 0.15, F: 0.1 }
    },
    {
      id: "u05",
      quadrant: "Q1",
      reverse: false,
      weight: 1,
      label: "別人說「很緊急」時，我通常會立刻放下手邊的事去處理。",
      projection: { P: 0.05, S: 0.1, G: 0.25, C: 0.35, R: 0.15, F: 0.1 }
    },
    {
      id: "u06",
      quadrant: "Q1",
      reverse: false,
      weight: 1,
      label: "我的週末或 evenings 常被突發事工或危機占滿。",
      projection: { P: 0.1, S: 0.1, G: 0.2, C: 0.3, R: 0.15, F: 0.15 }
    },
    {
      id: "u07",
      quadrant: "Q3",
      reverse: false,
      weight: 1,
      label: "我常用「忙碌的回覆、瑣碎行政、群組訊息」填滿日程，迴避更難但更重要的事。",
      projection: { P: 0.05, S: 0.05, G: 0.2, C: 0.35, R: 0.25, F: 0.1 }
    },
    {
      id: "u08",
      quadrant: "Q3",
      reverse: false,
      weight: 1,
      label: "我難以對非核心請求說「不」，導致時間被不重要但看似緊急的事占去。",
      projection: { P: 0.05, S: 0.05, G: 0.25, C: 0.3, R: 0.25, F: 0.1 }
    },
    {
      id: "u09",
      quadrant: "Q3",
      reverse: false,
      weight: 1,
      label: "會議、活動與行政事項過多，使我較少處理「重要但不急」的牧養與門訓。",
      projection: { P: 0.1, S: 0.1, G: 0.25, C: 0.25, R: 0.2, F: 0.1 }
    },
    {
      id: "u10",
      quadrant: "Q4",
      reverse: false,
      weight: 1,
      label: "我會拖延重要但不急的事（如規劃、休息、深度關係），直到變成危機。",
      projection: { P: 0.15, S: 0.15, G: 0.1, C: 0.2, R: 0.1, F: 0.3 }
    },
    {
      id: "u11",
      quadrant: "Q4",
      reverse: false,
      weight: 1,
      label: "當感到壓力時，我容易用娛樂、滑手機或無目的忙碌來逃避該面對的重要事。",
      projection: { P: 0.2, S: 0.15, G: 0.05, C: 0.1, R: 0.1, F: 0.4 }
    },
    {
      id: "u12",
      quadrant: "Q4",
      reverse: false,
      weight: 1,
      label: "我常想「等這陣子過了再處理」靈修、家庭或長期事工規劃。",
      projection: { P: 0.15, S: 0.2, G: 0.1, C: 0.15, R: 0.1, F: 0.3 }
    },
    {
      id: "u13",
      quadrant: null,
      reverse: true,
      weight: 0,
      label: "我從不會因事工而忽略家庭或個人靈修。（請誠實作答）",
      projection: { P: 0.2, S: 0.2, G: 0.1, C: 0.1, R: 0.2, F: 0.2 }
    },
    {
      id: "u14",
      quadrant: null,
      reverse: true,
      weight: 0,
      label: "我總能完美平衡四象限，從不感到過勞或內耗。（請誠實作答）",
      projection: { P: 0.15, S: 0.15, G: 0.15, C: 0.15, R: 0.2, F: 0.2 }
    }
  ];

  var QUADRANT_LABELS = {
    Q1: "Q1 重要且緊急（救火）",
    Q2: "Q2 重要不緊急（深度）",
    Q3: "Q3 緊急不重要（打發）",
    Q4: "Q4 不重要不緊急（逃避）"
  };

  var THRESHOLDS = {
    q2_low_pct: 25,
    q1_high_pct: 40,
    q3_high_pct: 30,
    authenticity_low: 0.7
  };

  var FLAG_DESCRIPTIONS = {
    Q2_BELOW_TARGET: "Q2（重要不緊急）時段偏低——靈修、門訓、家庭易被挤掉。",
    OVERLOAD_Q1: "Q1 救火比例偏高——過勞與決策疲勞風險上升。",
    DISTRACTION_Q3: "Q3 打發式忙碌偏高——時間被瑣事與他人緊急占去。",
    AVOIDANCE_Q4: "Q4 逃避比例不低——可能迴避該面對的重要議題。",
    LOW_AUTHENTICITY: "作答真實度偏低——建議與導師面談或隔幾天重填。"
  };

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  function normalizeAnswers(input) {
    var map = {};
    if (!input) return map;
    if (Array.isArray(input)) {
      input.forEach(function (row) {
        if (row && row.q != null && row.value != null) map[row.q] = Number(row.value);
      });
      return map;
    }
    Object.keys(input).forEach(function (k) {
      if (input[k] != null && input[k] !== "") map[k] = Number(input[k]);
    });
    return map;
  }

  function validate(answers) {
    var map = normalizeAnswers(answers);
    var errors = [];
    var missing = [];
    QUESTIONS.forEach(function (q) {
      if (q.quadrant == null && q.reverse) {
        if (map[q.id] == null || !isFinite(map[q.id])) missing.push(q.id);
        return;
      }
      if (map[q.id] == null || !isFinite(map[q.id])) {
        missing.push(q.id);
        return;
      }
      var v = Number(map[q.id]);
      if (v < 1 || v > 5) errors.push(q.id + " 須為 1–5");
    });
    if (missing.length) errors.push("尚未完成：" + missing.join(", "));
    return { ok: errors.length === 0, errors: errors, answers: map };
  }

  function computeAuthenticity(map) {
    var reverseQs = QUESTIONS.filter(function (q) {
      return q.reverse;
    });
    if (!reverseQs.length) return 1;
    var hits = 0;
    reverseQs.forEach(function (q) {
      var v = Number(map[q.id]);
      if (isFinite(v) && v >= 4) hits += 1;
    });
    return round1(1 - hits / reverseQs.length);
  }

  function computeQuadrantPercents(map) {
    var raw = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
    QUESTIONS.forEach(function (q) {
      if (!q.quadrant) return;
      var v = Number(map[q.id]);
      if (!isFinite(v)) return;
      var w = q.weight != null ? q.weight : 1;
      raw[q.quadrant] += v * w;
    });
    var total = raw.Q1 + raw.Q2 + raw.Q3 + raw.Q4;
    if (total <= 0) {
      return { q1_pct: 25, q2_pct: 25, q3_pct: 25, q4_pct: 25, raw: raw };
    }
    return {
      q1_pct: Math.round((raw.Q1 / total) * 100),
      q2_pct: Math.round((raw.Q2 / total) * 100),
      q3_pct: Math.round((raw.Q3 / total) * 100),
      q4_pct: Math.round((raw.Q4 / total) * 100),
      raw: raw
    };
  }

  function scoreByProjectionInline(items) {
    var sums = { P: 0, S: 0, G: 0, C: 0, R: 0, F: 0 };
    var weights = { P: 0, S: 0, G: 0, C: 0, R: 0, F: 0 };
    items.forEach(function (item) {
      var normalized = ((clamp(Number(item.value), 1, 5) - 1) / 4) * 100;
      DIMENSIONS.forEach(function (dim) {
        var w = (item.projection && item.projection[dim]) || 0;
        if (w <= 0) return;
        sums[dim] += normalized * w;
        weights[dim] += w;
      });
    });
    var out = {};
    DIMENSIONS.forEach(function (dim) {
      out[dim] = weights[dim] > 0 ? round1(sums[dim] / weights[dim]) : 0;
    });
    return out;
  }

  function computeFeatureVector(map) {
    var items = [];
    QUESTIONS.forEach(function (q) {
      var v = Number(map[q.id]);
      if (!isFinite(v) || v < 1 || v > 5) return;
      items.push({ value: v, projection: q.projection || {} });
    });
    if (global.CTAOSRuntime && typeof global.CTAOSRuntime.scoreByProjection === "function") {
      return global.CTAOSRuntime.scoreByProjection(items);
    }
    return scoreByProjectionInline(items);
  }

  function computeRiskFlags(derived, authenticity) {
    var flags = [];
    if (derived.q2_pct < THRESHOLDS.q2_low_pct) flags.push("Q2_BELOW_TARGET");
    if (derived.q1_pct > THRESHOLDS.q1_high_pct) flags.push("OVERLOAD_Q1");
    if (derived.q3_pct > THRESHOLDS.q3_high_pct) flags.push("DISTRACTION_Q3");
    if (derived.q4_pct >= 25) flags.push("AVOIDANCE_Q4");
    if (authenticity < THRESHOLDS.authenticity_low) flags.push("LOW_AUTHENTICITY");
    return flags;
  }

  function buildCoaching(derived, flags) {
    var q2 = derived.q2_pct;
    var q1 = derived.q1_pct;
    var growth =
      q2 < THRESHOLDS.q2_low_pct
        ? "Q2 時段偏低：建議每週先鎖定 2 個 90 分鐘「不可取消」深度時段（靈修、門訓或家庭）。"
        : "Q2 有一定基礎：把現有深度時段寫進日曆並告知同工，避免被緊急事項挤掉。";
    var collab =
      q1 > THRESHOLDS.q1_high_pct
        ? "救火比例偏高：與小組長／執事會對齊「誰的緊急、誰主責」，減少所有人同時被拉去 Q1。"
        : "與同工分享你的四象限分布，請一位 accountability partner 每兩週問一次：「本週 Q2 有沒有發生？」";
    var redflag = "";
    if (flags.indexOf("OVERLOAD_Q1") >= 0 && flags.indexOf("Q2_BELOW_TARGET") >= 0) {
      redflag = "Q1 高且 Q2 低：過勞風險。先暫停一項非核心事工，再談新目標。";
    } else if (flags.indexOf("LOW_AUTHENTICITY") >= 0) {
      redflag = "作答一致性偏低：建議與信任的同工或導師面談，或隔幾天重填。";
    } else if (flags.indexOf("AVOIDANCE_Q4") >= 0) {
      redflag = "Q4 逃避比例不低：留意是否用忙碌或娛樂迴避該面對的牧養或家庭議題。";
    } else {
      redflag = "目前無重大象限失衡；仍建議每季重測一次。";
    }
    return {
      growth: growth,
      collaboration: collab,
      redflag: redflag,
      peer_questions: [
        "過去一個月，哪三件事占掉我最多 Q1 時間？",
        "我能否舉一個本週實際發生的 Q2 時段例子？",
        "有沒有一件「別人的緊急」我該學會說不？"
      ],
      mentor_questions: [
        "我的服事節奏是否可持續？",
        "哪些事工應移交或加 AB 角？",
        "家庭與靈修在日程上是否真有位置？"
      ]
    };
  }

  function buildAiPrompt(run) {
    var d = run.derived || {};
    var fv = run.feature_vector || {};
    var name = (run.profile && run.profile.name) || "同工";
    var flags = (run.risk_flags || []).join(", ") || "無";
    return (
      "你是教會事工顧問（非權威，僅供牧者審核）。\n" +
      "對象：" +
      name +
      " · 工具：重要 vs 緊急矩陣\n" +
      "四象限分布：Q1 " +
      (d.q1_pct != null ? d.q1_pct : "?") +
      "% / Q2 " +
      (d.q2_pct != null ? d.q2_pct : "?") +
      "% / Q3 " +
      (d.q3_pct != null ? d.q3_pct : "?") +
      "% / Q4 " +
      (d.q4_pct != null ? d.q4_pct : "?") +
      "%\n" +
      "屬靈真實度：" +
      (run.authenticity_score != null ? run.authenticity_score : "—") +
      "\n" +
      "風險旗標：" +
      flags +
      "\n" +
      "CTV 特徵向量：P=" +
      fv.P +
      " S=" +
      fv.S +
      " G=" +
      fv.G +
      " C=" +
      fv.C +
      " R=" +
      fv.R +
      " F=" +
      fv.F +
      "\n\n" +
      "請產出：\n" +
      "1) 四句式摘要（現況／風險／根因／下一步）\n" +
      "2) 未來 4 週具體行動（含每週 Q2 時段建議）\n" +
      "3) 給小組長的三個追問\n" +
      "勿編造經文；不宣稱屬靈權威；不確定處請明說需牧者查證。"
    );
  }

  function interpretDerived(derived) {
    derived = derived || {};
    var q1 = derived.q1_pct != null ? derived.q1_pct : 0;
    var q2 = derived.q2_pct != null ? derived.q2_pct : 0;
    var q3 = derived.q3_pct != null ? derived.q3_pct : 0;
    var q4 = derived.q4_pct != null ? derived.q4_pct : 0;

    function q1Msg() {
      if (q1 > THRESHOLDS.q1_high_pct) {
        return {
          level: "high",
          label: "偏高",
          harm: "危害：身心透支、家庭與靈修被挤掉；危機常因 Q2 長期被忽略而「燒」成 Q1。",
          action: "建議：與牧者／小組長列出可暫緩事工，建立 AB 角，減少人人救火。"
        };
      }
      if (q1 >= 28) {
        return {
          level: "mid",
          label: "适中",
          harm: "說明：有一定真實危機處理，需留意是否常態化。",
          action: "建議：每週檢視 Q1 是否可移交或預防。"
        };
      }
      return {
        level: "ok",
        label: "尚可",
        harm: "說明：救火壓力相對可控。",
        action: "建議：仍須保護 Q2，避免危機前沒有預備。"
      };
    }

    function q2Msg() {
      if (q2 < THRESHOLDS.q2_low_pct) {
        return {
          level: "low",
          label: "不足",
          harm: "危害：靈修、門訓、家庭、長期規劃被延後；屬靈與事奉易「空心化」。",
          action: "建議：每週先鎖 2 個 90 分鐘 Q2 時段，寫進日曆且不可取消。"
        };
      }
      if (q2 >= 30) {
        return {
          level: "ok",
          label: "良好",
          harm: "說明：有刻意保留深度時段。",
          action: "建議：告知同工這些時段不可随意占用。"
        };
      }
      return {
        level: "mid",
        label: "尚可",
        harm: "說明：有 Q2 但不穩，容易被 Q1/Q3 挤掉。",
        action: "建議：固定重複時段，並在 Tab 下方 SMART 工具寫成可守住目標。"
      };
    }

    function q3Msg() {
      if (q3 > THRESHOLDS.q3_high_pct) {
        return {
          level: "high",
          label: "偏高",
          harm: "危害：時間被他人緊急、瑣碎行政占滿；看似很忙碌，核心事工卻沒推進。",
          action: "建議：練習分辨「誰主責」；非您 R 的事，改為轉介或排程回覆。"
        };
      }
      return {
        level: "ok",
        label: "尚可",
        harm: "說明：打發式忙碌在可控範圍。",
        action: "建議：仍可用 RACI 釐清哪些「緊急」不該落到您身上。"
      };
    }

    function q4Msg() {
      if (q4 >= 25) {
        return {
          level: "high",
          label: "偏高",
          harm: "危害：用娛樂、拖延或無目的消耗迴避該面對的關係與規劃；問題會潛伏成日後 Q1 危機。",
          action: "建議：與導師談一項您一直迴避的「重要但不急」議題。"
        };
      }
      return {
        level: "ok",
        label: "尚可",
        harm: "說明：逃避型消耗不算高。",
        action: "建議：維持休息與安息，但區分「安息」與「逃避」。"
      };
    }

    return {
      preamble:
        "四個百分比加總為 100%，代表您依 14 題自評後，過去一段時間「精力／注意力」在四類事上的相對比例（不是手錶計時）。橫條越長＝該象限占比越大。",
      use:
        "用途：① 您自己知道該先改哪一象限；② 與導師／小組討論有數據；③ 匯入戰情室與 SMART 目標對照（例如把 Q2 寫進本季要守住的時段）。",
      q1: Object.assign({ pct: q1 }, q1Msg()),
      q2: Object.assign({ pct: q2 }, q2Msg()),
      q3: Object.assign({ pct: q3 }, q3Msg()),
      q4: Object.assign({ pct: q4 }, q4Msg())
    };
  }

  function loadUpstreamChain(store) {
    store = store || global.AssessmentRunStore;
    if (!store || typeof store.loadLatest !== "function") {
      return { ok: false, source: "store_missing", runs: {} };
    }
    var spiritual = store.loadLatest("spiritual");
    return {
      ok: !!spiritual,
      source: "assessment_run_store",
      runs: { spiritual: spiritual },
      spiritual_overall:
        spiritual && spiritual.derived && spiritual.derived.overall_score != null
          ? spiritual.derived.overall_score
          : null,
      spiritual_level:
        spiritual && spiritual.derived && spiritual.derived.overall_level
          ? spiritual.derived.overall_level
          : null
    };
  }

  function applyUpstreamHints(derived, upstream) {
    if (!upstream || !upstream.ok) return [];
    var hints = [];
    if (upstream.spiritual_overall != null && upstream.spiritual_overall < 50) {
      hints.push("靈命整體偏低（" + upstream.spiritual_overall + "）— 優先恢復 Q2 靈修時段，勿再加救火。");
    }
    if (derived && derived.q1_pct >= THRESHOLDS.q1_high_pct && upstream.spiritual_overall != null && upstream.spiritual_overall < 55) {
      hints.push("Q1 偏高且靈命偏弱 — 建議與牧者談界線，暫緩新承諾。");
    }
    return hints;
  }

  function buildRun(answers, profile, opts) {
    opts = opts || {};
    var check = validate(answers);
    if (!check.ok) {
      return { ok: false, errors: check.errors };
    }
    var map = check.answers;
    var authenticity = computeAuthenticity(map);
    var derived = computeQuadrantPercents(map);
    var risk_flags = computeRiskFlags(derived, authenticity);
    var upstream = opts.skip_upstream ? null : loadUpstreamChain();
    var upstream_hints = applyUpstreamHints(derived, upstream);
    var coaching = buildCoaching(derived, risk_flags);
    if (upstream_hints.length) {
      coaching.growth = upstream_hints[0] + " " + coaching.growth;
    }
    var raw_answers = QUESTIONS.map(function (q) {
      return { q: q.id, value: map[q.id] };
    });

    var run = {
      schema_version: 1,
      tool_id: TOOL_ID,
      timestamp: opts.timestamp || Date.now(),
      member_id: opts.member_id != null ? opts.member_id : null,
      profile: Object.assign(
        { name: "", role: "", church_size: "micro" },
        profile || {}
      ),
      authenticity_score: authenticity,
      feature_vector: computeFeatureVector(map),
      upstream_snapshot:
        upstream && upstream.ok
          ? {
              spiritual_overall: upstream.spiritual_overall,
              spiritual_level: upstream.spiritual_level
            }
          : null,
      upstream_hints: upstream_hints,
      derived: {
        q1_pct: derived.q1_pct,
        q2_pct: derived.q2_pct,
        q3_pct: derived.q3_pct,
        q4_pct: derived.q4_pct
      },
      raw_answers: raw_answers,
      risk_flags: risk_flags,
      coaching: coaching,
      source_note: "urgency_pack v1 · " + QUESTIONS.length + " 題"
    };

    run.interpretation = interpretDerived(run.derived);
    run.ai_prompt = buildAiPrompt(run);
    return { ok: true, run: run };
  }

  function buildDemoRun() {
    var answers = {};
    QUESTIONS.forEach(function (q) {
      if (q.reverse) {
        answers[q.id] = 2;
        return;
      }
      if (q.quadrant === "Q1") answers[q.id] = 4;
      else if (q.quadrant === "Q2") answers[q.id] = 2;
      else if (q.quadrant === "Q3") answers[q.id] = 3;
      else if (q.quadrant === "Q4") answers[q.id] = 2;
    });
    var built = buildRun(answers, {
      name: "示範同工（非您的資料）",
      role: "小組長",
      church_size: "small"
    });
    if (built.ok && built.run) built.run.is_demo = true;
    return built;
  }

  global.UrgencyPack = {
    TOOL_ID: TOOL_ID,
    TOOL_LABEL: TOOL_LABEL,
    QUESTIONS: QUESTIONS,
    QUADRANT_LABELS: QUADRANT_LABELS,
    THRESHOLDS: THRESHOLDS,
    FLAG_DESCRIPTIONS: FLAG_DESCRIPTIONS,
    validate: validate,
    computeQuadrantPercents: computeQuadrantPercents,
    computeAuthenticity: computeAuthenticity,
    computeFeatureVector: computeFeatureVector,
    computeRiskFlags: computeRiskFlags,
    buildCoaching: buildCoaching,
    buildAiPrompt: buildAiPrompt,
    interpretDerived: interpretDerived,
    buildRun: buildRun,
    buildDemoRun: buildDemoRun,
    loadUpstreamChain: loadUpstreamChain,
    applyUpstreamHints: applyUpstreamHints
  };
})(typeof window !== "undefined" ? window : global);
