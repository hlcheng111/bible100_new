/**
 * 文化契合度（culture）· 異象與價值共鳴 · CTV-C
 * 24 題 Likert · 四向度 rollup · 非篩選人事
 */
(function (global) {
  "use strict";

  var TOOL_ID = "culture";
  var TOOL_LABEL = "文化契合度";
  var PACK_VERSION = 2;

  var DIMENSIONS = ["P", "S", "G", "C", "R", "F"];

  var DIM_KEYS = ["vision_commit", "servant_life", "truth_practice", "team_trust"];

  var DIM_LABELS = {
    vision_commit: "異象認同",
    servant_life: "僕人生命",
    truth_practice: "真理實踐",
    team_trust: "團隊信任"
  };

  function q(id, dim, section, label) {
    return { id: id, dim: dim, section: section, label: label };
  }

  var QUESTIONS = [
    q("cul_v1", "vision_commit", "異象認同（6 題）", "我能用自己的話說出本堂五年異象的核心方向。"),
    q("cul_v2", "vision_commit", null, "長執與同工在重要決定上，會先問「這是否符合我們的異象」。"),
    q("cul_v3", "vision_commit", null, "新事工提案會被溫和地問：與核心價值是否一致，而非只看熱心。"),
    q("cul_v4", "vision_commit", null, "會眾大致知道教會「為什麼做這些事」，而不只是活動名單。"),
    q("cul_v5", "vision_commit", null, "當資源有限時，我們願意為異象取捨，而非什麼都想做。"),
    q("cul_v6", "vision_commit", null, "異象不是牆上標語，而是在日常決策中被提起、被禱告。"),
    q("cul_s1", "servant_life", "僕人生命（6 題）", "帶領者願意在團隊面前承認限制，不裝作無所不能。"),
    q("cul_s2", "servant_life", null, "我們慣於先服事、後談權柄；領袖為團隊擋風雨多於追求面子。"),
    q("cul_s3", "servant_life", null, "同工被鼓勵說「不」或「需要幫助」，而不被視為不屬靈。"),
    q("cul_s4", "servant_life", null, "衝突發生時，優先修復關係，而非急著分對錯、貼標籤。"),
    q("cul_s5", "servant_life", null, "我們會為疲累的同工調整節奏，而不是只加碼期待。"),
    q("cul_s6", "servant_life", null, "服事文化重視「與神同行」，而非只追事工產出數字。"),
    q("cul_t1", "truth_practice", "真理實踐（6 題）", "我們在決策中會回到聖經與教會信仰傳統尋求依據。"),
    q("cul_t2", "truth_practice", null, "講道與小組教導的內容，能在日常生活中被討論、被活出來。"),
    q("cul_t3", "truth_practice", null, "我們避免用文化潮流或管理學口號取代福音核心。"),
    q("cul_t4", "truth_practice", null, "對敏感議題，我們願意慢下來查經、禱告，而非急著表態。"),
    q("cul_t5", "truth_practice", null, "真理實踐包含公義、憐憫與謙卑，不只有個人靈修。"),
    q("cul_t6", "truth_practice", null, "錯誤被溫和指正時，文化上傾向學習而非防衛或報復。"),
    q("cul_r1", "team_trust", "團隊信任（6 題）", "部門之間願意分享資訊，而不是各守各的地盤。"),
    q("cul_r2", "team_trust", null, "我可以在適當範圍內表達不同意見，而不怕報復或冷處理。"),
    q("cul_r3", "team_trust", null, "我們相信多數同工的動機是為了教會，而非私心。"),
    q("cul_r4", "team_trust", null, "背後論人是少數，多數衝突會被帶到當事人面前。"),
    q("cul_r5", "team_trust", null, "新同工能在合理時間內感到被接納、被信任。"),
    q("cul_r6", "team_trust", null, "當計畫失敗時，我們先一起檢討系統與流程，而非找替罪羊。")
  ];

  var DIM_PROJECTION = {
    vision_commit: { P: 0.1, S: 0.15, G: 0.35, C: 0.3, R: 0.05, F: 0.05 },
    servant_life: { P: 0.35, S: 0.25, G: 0.05, C: 0.15, R: 0.15, F: 0.05 },
    truth_practice: { P: 0.15, S: 0.45, G: 0.1, C: 0.2, R: 0.05, F: 0.05 },
    team_trust: { P: 0.2, S: 0.1, G: 0.05, C: 0.1, R: 0.45, F: 0.1 }
  };

  var THRESHOLDS = { green: 4.0, yellow: 2.8, min_answered: 24, trust_breach: 3.0 };

  /** Cameron & Quinn CVAM 四象限（教會語境映射） */
  var CVAM_KEYS = ["clan", "adhocracy", "market", "hierarchy"];
  var CVAM_LABELS = {
    clan: "Clan｜家庭牧養",
    adhocracy: "Adhocracy｜先知外展",
    market: "Market｜使徒推動力",
    hierarchy: "Hierarchy｜長執治理"
  };
  var CVAM_DIM_BLEND = {
    clan: { servant_life: 0.55, team_trust: 0.45 },
    adhocracy: { vision_commit: 0.5, truth_practice: 0.5 },
    market: { vision_commit: 0.75, servant_life: 0.25 },
    hierarchy: { truth_practice: 0.55, team_trust: 0.45 }
  };

  var FLAG_DESCRIPTIONS = {
    LOW_COMPLETION: "作答少於 24 題，文化契合度報告僅供初步對話。",
    TRUST_BREACH:
      "團隊信任均分低於 3.0：團隊信任發生破口。此時強推大型五年擴建計劃將面臨內部張力，建議優先滾動 NCD「相親相愛的關係」。",
    VISION_WEAK: "異象認同偏弱：五年計劃前宜先回到異象對齊退修。",
    SERVANT_DRIFT: "僕人生命向度偏弱：帶領文化可能偏控制或過勞驅動。",
    TRUTH_GAP: "真理實踐偏弱：教導與生活可能脫節，宜加強查經與陪談。"
  };

  function round1(n) { return Math.round(n * 10) / 10; }

  function normalizeAnswers(input) {
    var map = {};
    if (!input) return map;
    if (Array.isArray(input)) {
      input.forEach(function (row) {
        if (row && row.q != null) map[row.q] = Number(row.value);
      });
      return map;
    }
    Object.keys(input).forEach(function (k) {
      if (input[k] != null && input[k] !== "") map[k] = Number(input[k]);
    });
    return map;
  }

  function avgValues(values) {
    var nums = values.filter(function (v) { return v != null && isFinite(v); });
    if (!nums.length) return null;
    return round1(nums.reduce(function (a, b) { return a + b; }, 0) / nums.length);
  }

  function computeDimScores(answerMap) {
    var buckets = {};
    DIM_KEYS.forEach(function (k) { buckets[k] = []; });
    QUESTIONS.forEach(function (qu) {
      var v = answerMap[qu.id];
      if (v != null && isFinite(v) && v >= 1 && v <= 5) buckets[qu.dim].push(v);
    });
    var out = {};
    DIM_KEYS.forEach(function (k) { out[k] = avgValues(buckets[k]); });
    return out;
  }

  function computeFeatureVector(answerMap) {
    var items = [];
    QUESTIONS.forEach(function (qu) {
      var v = Number(answerMap[qu.id]);
      if (!isFinite(v) || v < 1 || v > 5) return;
      items.push({ value: v, projection: DIM_PROJECTION[qu.dim] });
    });
    if (global.CTAOSRuntime && global.CTAOSRuntime.scoreByProjection) {
      return global.CTAOSRuntime.scoreByProjection(items);
    }
    return { P: 0, S: 0, G: 0, C: 0, R: 0, F: 0 };
  }

  function computeRiskFlags(dimScores, answeredCount) {
    var flags = [];
    if (answeredCount < THRESHOLDS.min_answered) flags.push("LOW_COMPLETION");
    if (dimScores.team_trust != null && dimScores.team_trust < THRESHOLDS.trust_breach) flags.push("TRUST_BREACH");
    if (dimScores.vision_commit != null && dimScores.vision_commit < THRESHOLDS.yellow) flags.push("VISION_WEAK");
    if (dimScores.servant_life != null && dimScores.servant_life < THRESHOLDS.yellow) flags.push("SERVANT_DRIFT");
    if (dimScores.truth_practice != null && dimScores.truth_practice < THRESHOLDS.yellow) flags.push("TRUTH_GAP");
    return flags;
  }

  function dimToPercent(avg) {
    if (avg == null || !isFinite(avg)) return null;
    return Math.round((avg / 5) * 100);
  }

  function computeCvamScores(dimScores) {
    var out = {};
    CVAM_KEYS.forEach(function (k) {
      var blend = CVAM_DIM_BLEND[k] || {};
      var sum = 0;
      var w = 0;
      Object.keys(blend).forEach(function (dk) {
        var v = dimScores[dk];
        if (v != null && isFinite(v)) {
          sum += v * blend[dk];
          w += blend[dk];
        }
      });
      out[k] = w > 0 ? dimToPercent(sum / w) : null;
    });
    return out;
  }

  /** 文化偏離係數 Cv：四象限與均衡基線 50% 的平均絕對偏差 */
  function computeCultureDeviation(cvam) {
    var vals = CVAM_KEYS.map(function (k) { return cvam[k]; }).filter(function (x) { return x != null; });
    if (!vals.length) return null;
    var baseline = 50;
    var dev = vals.reduce(function (a, v) { return a + Math.abs(v - baseline); }, 0) / vals.length;
    return Math.round(dev);
  }

  /** 屬靈信任破口值：team_trust < 3.0 時線性映射 0–100 */
  function computeTrustBreachScore(teamTrust) {
    if (teamTrust == null || !isFinite(teamTrust)) return 0;
    if (teamTrust >= THRESHOLDS.trust_breach) return 0;
    return Math.min(100, Math.round(((THRESHOLDS.trust_breach - teamTrust) / THRESHOLDS.trust_breach) * 100));
  }

  function loadUpstreamChain(store) {
    store = store || global.AssessmentRunStore;
    if (!store || typeof store.loadLatest !== "function") {
      return { ok: false, source: "store_missing", runs: {} };
    }
    var ncd = store.loadLatest("ncd");
    var swot = store.loadLatest("swot");
    var ncdMin = ncd && ncd.derived && ncd.derived.minimum_factor ? ncd.derived.minimum_factor : null;
    var relationHint = null;
    if (ncdMin && (ncdMin.key === "loving_relationships" || String(ncdMin.label || "").indexOf("相親相愛") >= 0)) {
      relationHint = "NCD 最小因子指向「相親相愛的關係」— 文化測評請優先關注團隊信任向度。";
    }
    return {
      ok: !!(ncd || swot),
      source: "assessment_run_store",
      runs: { ncd: ncd, swot: swot },
      ncd_minimum: ncdMin,
      ncd_relation_focus: relationHint,
      swot_primary: swot && swot.derived && swot.derived.focus_strategy ? swot.derived.focus_strategy : null
    };
  }

  function buildCoaching(dimScores, flags) {
    return {
      growth:
        dimScores.vision_commit != null && dimScores.vision_commit >= 4
          ? "異象認同尚穩：可把五年計劃寫成「異象延伸故事」，讓會眾聽得懂。"
          : "異象需再對齊：建議長執退修，用兩句話重述「我們是誰、往哪去」。",
      collaboration:
        flags.indexOf("TRUST_BREACH") >= 0
          ? "信任破口優先：暫緩大型擴建表決，先在小組滾動聆聽與和好。"
          : "邀請各部門負責人分享「我們如何活出核心價值」真實故事。",
      redflag:
        flags.indexOf("TRUST_BREACH") >= 0
          ? "⚠️ 戰情室建議：團隊信任 &lt;3.0 時，五年計劃宜縮小首期、加強關係修復。"
          : "本工具不篩選人；低分是群體健康信號，請牧者 facilitation。"
    };
  }

  function validate(answers) {
    var map = normalizeAnswers(answers);
    var errors = [];
    var answeredCount = 0;
    QUESTIONS.forEach(function (qu) {
      if (map[qu.id] != null && isFinite(map[qu.id])) {
        if (map[qu.id] < 1 || map[qu.id] > 5) errors.push(qu.id + " 須為 1–5");
        else answeredCount++;
      }
    });
    if (!answeredCount) errors.push("尚未作答");
    if (answeredCount > 0 && answeredCount < QUESTIONS.length) {
      errors.push("請完成全部 " + QUESTIONS.length + " 題");
    }
    return { ok: errors.length === 0, errors: errors, answers: map, answeredCount: answeredCount };
  }

  function buildRun(answers, profile, opts) {
    opts = opts || {};
    var check = validate(answers);
    if (!check.ok) return { ok: false, errors: check.errors };
    var dimScores = computeDimScores(check.answers);
    var flags = computeRiskFlags(dimScores, check.answeredCount);
    var parts = DIM_KEYS.map(function (k) { return dimScores[k]; }).filter(function (x) { return x != null; });
    var dnaAvg = parts.length ? parts.reduce(function (a, b) { return a + b; }, 0) / parts.length : null;
    var cvam = computeCvamScores(dimScores);
    var cultureResonance = dnaAvg != null ? Math.round((dnaAvg / 5) * 100) : null;
    var upstream = opts.skip_upstream ? null : loadUpstreamChain();
    var run = {
      schema_version: PACK_VERSION,
      tool_id: TOOL_ID,
      timestamp: opts.timestamp || Date.now(),
      profile: Object.assign({ church_label: "" }, profile || {}),
      authenticity_score: round1(check.answeredCount / QUESTIONS.length),
      feature_vector: computeFeatureVector(check.answers),
      upstream_snapshot: upstream && upstream.ok ? { ncd_minimum: upstream.ncd_minimum, swot_primary: upstream.swot_primary } : null,
      derived: {
        dim_scores: dimScores,
        cvam_scores: cvam,
        culture_deviation_cv: computeCultureDeviation(cvam),
        trust_breach_score: computeTrustBreachScore(dimScores.team_trust),
        culture_resonance_score: cultureResonance,
        dna_resonance_score: cultureResonance,
        answered_count: check.answeredCount,
        question_total: QUESTIONS.length
      },
      raw_answers: QUESTIONS.map(function (qu) {
        return { q: qu.id, dim: qu.dim, value: check.answers[qu.id] };
      }),
      risk_flags: flags,
      coaching: buildCoaching(dimScores, flags),
      source_note: "culture_pack v" + PACK_VERSION
    };
    return { ok: true, run: run };
  }

  function buildDemoRun() {
    var answers = {};
    QUESTIONS.forEach(function (qu, i) {
      answers[qu.id] = 2 + (i % 3);
    });
    answers.cul_r1 = 2;
    answers.cul_r2 = 2;
    answers.cul_r3 = 2;
    var built = buildRun(answers, { church_label: "示範堂" });
    if (built.ok) built.run.is_demo = true;
    return built;
  }

  global.CulturePack = {
    TOOL_ID: TOOL_ID,
    TOOL_LABEL: TOOL_LABEL,
    PACK_VERSION: PACK_VERSION,
    QUESTIONS: QUESTIONS,
    DIM_KEYS: DIM_KEYS,
    DIM_LABELS: DIM_LABELS,
    CVAM_KEYS: CVAM_KEYS,
    CVAM_LABELS: CVAM_LABELS,
    THRESHOLDS: THRESHOLDS,
    FLAG_DESCRIPTIONS: FLAG_DESCRIPTIONS,
    validate: validate,
    buildRun: buildRun,
    buildDemoRun: buildDemoRun,
    loadUpstreamChain: loadUpstreamChain,
    computeCvamScores: computeCvamScores,
    computeCultureDeviation: computeCultureDeviation,
    computeTrustBreachScore: computeTrustBreachScore
  };
})(typeof window !== "undefined" ? window : global);
