/**
 * 教會版 SMART · 工具包 v2（smart）
 * 15 題 SMART+Care 交叉矩陣 · 六向度 rollup · 對齊 church_toolkit.smartAggregateFromPlans
 */
(function (global) {
  "use strict";

  var TOOL_ID = "smart";
  var TOOL_LABEL = "教會版 SMART";
  var PACK_VERSION = 2;

  var DIMENSIONS = ["P", "S", "G", "C", "R", "F"];

  var DIM_KEYS = ["S_clarity", "M_measurability", "A_feasibility", "R_relevance", "T_time_fit", "Care_health"];

  var DIM_LABELS = {
    S_clarity: "S｜具體清晰",
    M_measurability: "M｜可衡量",
    A_feasibility: "A｜可達成",
    R_relevance: "R｜相關貼合",
    T_time_fit: "T｜時程節奏",
    Care_health: "Care｜牧養負載"
  };

  /** 15 題：S×3 · M×3 · A+T×3 · R×3 · Care×3 */
  var QUESTIONS = [
    {
      id: "smart_s1",
      dim: "S_clarity",
      section: "S｜具體清晰（3 題）",
      label: "受益對象是否具體（誰），而非「全教會都要更屬靈」這類口號？"
    },
    {
      id: "smart_s2",
      dim: "S_clarity",
      section: null,
      label: "盼望看見的改變，能否用一句話向新同工解釋清楚？"
    },
    {
      id: "smart_s3",
      dim: "S_clarity",
      section: null,
      label: "核心團隊對「要做什麼、不做什麼」是否有共同畫面？"
    },
    {
      id: "smart_m1",
      dim: "M_measurability",
      section: "M｜可衡量（3 題）",
      label: "是否有可觀察的進展記號（溫和、非冷冰冰 KPI）？"
    },
    {
      id: "smart_m2",
      dim: "M_measurability",
      section: null,
      label: "三個月試行後，團隊能否說出「怎樣算有進展、怎樣算需調整」？"
    },
    {
      id: "smart_m3",
      dim: "M_measurability",
      section: null,
      label: "進展記號是否已與牧者／長執對齊（避免事後才發現標準不同）？"
    },
    {
      id: "smart_at1",
      dim: "A_feasibility",
      section: "A + T｜可行與時限（3 題）",
      label: "現有人力、時間、預算是否足以支撐試行（非空有理想）？"
    },
    {
      id: "smart_at2",
      dim: "T_time_fit",
      section: null,
      label: "試行期長度與教會節期（主日、節慶、退修）是否相容、可守住？"
    },
    {
      id: "smart_at3",
      dim: "A_feasibility",
      section: null,
      label: "若需縮小或暫停，是否已有共識機制（而非硬撐到崩潰）？"
    },
    {
      id: "smart_r1",
      dim: "R_relevance",
      section: "R + Care｜貼合與負載（6 題 · 交叉檢驗）",
      label: "是否呼應本季異象與剛完成的靈命／優先序診斷？"
    },
    {
      id: "smart_r2",
      dim: "R_relevance",
      section: null,
      label: "與 SWOT 或 80/20 重點是否同一主線（非另起爐灶）？"
    },
    {
      id: "smart_r3",
      dim: "R_relevance",
      section: null,
      label: "長執是否已對這條主線賦予優先權（非一人獨推）？"
    },
    {
      id: "smart_c1",
      dim: "Care_health",
      section: null,
      label: "預期最累的同工是誰？是否已有替補、輪值或暫緩方案？"
    },
    {
      id: "smart_c2",
      dim: "Care_health",
      section: null,
      label: "計畫是否保留主日、家庭與個人靈修／休息的界線？"
    },
    {
      id: "smart_c3",
      dim: "Care_health",
      section: null,
      label: "若負載上升，團隊是否敢說「暫停」而不被視為失敗或缺乏信心？"
    }
  ];

  var DIM_PROJECTION = {
    S_clarity: { P: 0.1, S: 0.1, G: 0.1, C: 0.35, R: 0.15, F: 0.2 },
    M_measurability: { P: 0, S: 0, G: 0.15, C: 0.55, R: 0.1, F: 0.2 },
    A_feasibility: { P: 0.05, S: 0, G: 0.2, C: 0.45, R: 0.2, F: 0.1 },
    R_relevance: { P: 0.1, S: 0.15, G: 0.25, C: 0.2, R: 0.15, F: 0.15 },
    T_time_fit: { P: 0, S: 0, G: 0.25, C: 0.35, R: 0.15, F: 0.25 },
    Care_health: { P: 0.35, S: 0.2, G: 0.05, C: 0.1, R: 0.2, F: 0.1 }
  };

  var THRESHOLDS = {
    green: 4.0,
    yellow: 2.8,
    min_answered: 12,
    load_high: 65,
    align_low: 45,
    feas_low: 45
  };

  var FLAG_DESCRIPTIONS = {
    LOW_COMPLETION: "作答少於 " + THRESHOLDS.min_answered + " 題，報告僅供初步對話，請補填 15 題矩陣。",
    LOAD_HIGH: "負載成本偏高：R+Care 交叉檢驗顯示計畫可能壓垮同工，宜縮小試行或延長節奏。",
    ALIGN_LOW: "對齊度偏低：S/M/R/T 向度平均不足，目標可能不夠具體或與異象／季節脫節。",
    CARE_LOW: "Care 向度平均偏低：牧養成本被低估，請與小組長談節奏、替補與界線。",
    FEAS_LOW: "可行性偏低：A+Care 交叉顯示資源或節奏不足以支撐，先補資源或簡化目標。",
    R_DRIFT: "R 向度偏低：與異象／SWOT 主線可能脫節，勿急著排程。"
  };

  var DIM_HINTS = {
    S_clarity: "三題平均：對象、改變、團隊共識是否說得清。",
    M_measurability: "三題平均：溫和記號與檢核節奏是否到位。",
    A_feasibility: "兩題平均：資源與暫停機制是否 realistic。",
    R_relevance: "三題平均：異象、SWOT、長執優先權是否一致。",
    T_time_fit: "試行期與教會節期是否可守住。",
    Care_health: "三題平均：替補、界線、敢停是否顧到。"
  };

  function round1(n) {
    return Math.round(n * 10) / 10;
  }

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

  function levelFromScore(score) {
    if (score == null || !isFinite(score)) return "red";
    if (score >= THRESHOLDS.green) return "green";
    if (score >= THRESHOLDS.yellow) return "yellow";
    return "red";
  }

  function avgValues(values) {
    var nums = values.filter(function (v) {
      return v != null && isFinite(v);
    });
    if (!nums.length) return null;
    return round1(nums.reduce(function (a, b) { return a + b; }, 0) / nums.length);
  }

  /** 15 題 → 六向度 rollup 平均 */
  function computeDimScores(answerMap) {
    var buckets = {};
    DIM_KEYS.forEach(function (k) { buckets[k] = []; });
    QUESTIONS.forEach(function (q) {
      var v = answerMap[q.id];
      if (v != null && isFinite(v) && v >= 1 && v <= 5 && buckets[q.dim]) {
        buckets[q.dim].push(v);
      }
    });
    var out = {};
    DIM_KEYS.forEach(function (k) {
      out[k] = avgValues(buckets[k]);
    });
    return out;
  }

  function aggregateFromDimScores(dimScores) {
    function n(k) {
      var v = dimScores[k];
      return v != null && isFinite(v) ? v : null;
    }
    var alignParts = [n("S_clarity"), n("M_measurability"), n("R_relevance"), n("T_time_fit")].filter(function (x) {
      return x != null;
    });
    var care = n("Care_health");
    var aAvg = n("A_feasibility");
    var rAvg = n("R_relevance");

    var alignSum = 0;
    alignParts.forEach(function (v) { alignSum += v; });
    var alignment_score = alignParts.length ? Math.round((alignSum / alignParts.length / 5) * 100) : null;

    var loadParts = [];
    if (care != null) loadParts.push(5 - care);
    if (rAvg != null) loadParts.push(5 - rAvg);
    QUESTIONS.filter(function (q) { return q.dim === "Care_health"; }).forEach(function (q) {
      /* Care 已在 care avg；R 低也增加隱性負載感 */
    });
    var loadSum = 0;
    if (care != null) loadSum += 5 - care;
    if (rAvg != null) loadSum += (5 - rAvg) * 0.35;
    var loadN = (care != null ? 1 : 0) + (rAvg != null ? 0.35 : 0);
    var load_cost_score = loadN > 0 ? Math.round((loadSum / loadN / 4) * 100) : null;

    var feasParts = [];
    if (aAvg != null) feasParts.push(aAvg);
    if (care != null) feasParts.push(care);
    var feasSum = feasParts.reduce(function (a, b) { return a + b; }, 0);
    var feasibility_score = feasParts.length ? Math.round((feasSum / feasParts.length / 5) * 100) : null;

    var execParts = [aAvg, n("T_time_fit")].filter(function (x) { return x != null; });
    var execSum = execParts.reduce(function (a, b) { return a + b; }, 0);
    var execution_score = execParts.length ? Math.round((execSum / execParts.length / 5) * 100) : null;

    var sustainParts = [];
    if (alignment_score != null) sustainParts.push(alignment_score);
    if (execution_score != null) sustainParts.push(execution_score);
    if (load_cost_score != null) sustainParts.push(Math.max(0, 100 - load_cost_score));
    var sustainSum = sustainParts.reduce(function (a, b) { return a + b; }, 0);
    var sustain_score = sustainParts.length ? Math.round(sustainSum / sustainParts.length) : null;

    return {
      alignment_score: alignment_score,
      load_cost_score: load_cost_score,
      feasibility_score: feasibility_score,
      execution_score: execution_score,
      sustain_score: sustain_score
    };
  }

  function computeComposite(dimScores) {
    function n(k) {
      var v = dimScores[k];
      return v != null && isFinite(v) ? v : null;
    }
    var smrt = [n("S_clarity"), n("M_measurability"), n("R_relevance"), n("T_time_fit")].filter(function (x) {
      return x != null;
    });
    var ac = [n("A_feasibility"), n("Care_health")].filter(function (x) {
      return x != null;
    });
    var clarityAvg = smrt.length ? smrt.reduce(function (a, b) { return a + b; }, 0) / smrt.length : 0;
    var execAvg = ac.length ? ac.reduce(function (a, b) { return a + b; }, 0) / ac.length : 0;
    return round1(0.6 * (clarityAvg / 5) * 100 + 0.4 * (execAvg / 5) * 100);
  }

  function computeFeatureVector(answerMap) {
    var items = [];
    QUESTIONS.forEach(function (q) {
      var v = Number(answerMap[q.id]);
      if (!isFinite(v) || v < 1 || v > 5) return;
      items.push({ value: v, projection: DIM_PROJECTION[q.dim] || DIM_PROJECTION.S_clarity });
    });
    if (global.CTAOSRuntime && global.CTAOSRuntime.scoreByProjection) {
      return global.CTAOSRuntime.scoreByProjection(items);
    }
    var sums = { P: 0, S: 0, G: 0, C: 0, R: 0, F: 0 };
    var weights = { P: 0, S: 0, G: 0, C: 0, R: 0, F: 0 };
    items.forEach(function (item) {
      var normalized = ((Math.max(1, Math.min(5, item.value)) - 1) / 4) * 100;
      DIMENSIONS.forEach(function (d) {
        var w = (item.projection && item.projection[d]) || 0;
        if (w <= 0) return;
        sums[d] += normalized * w;
        weights[d] += w;
      });
    });
    var out = {};
    DIMENSIONS.forEach(function (d) {
      out[d] = weights[d] > 0 ? round1(sums[d] / weights[d]) : 0;
    });
    return out;
  }

  function computeRiskFlags(dimScores, agg, answeredCount) {
    var flags = [];
    if (answeredCount < THRESHOLDS.min_answered) flags.push("LOW_COMPLETION");
    if (agg.load_cost_score != null && agg.load_cost_score > THRESHOLDS.load_high) flags.push("LOAD_HIGH");
    if (agg.alignment_score != null && agg.alignment_score < THRESHOLDS.align_low) flags.push("ALIGN_LOW");
    if (dimScores.Care_health != null && dimScores.Care_health < THRESHOLDS.yellow) flags.push("CARE_LOW");
    if (dimScores.A_feasibility != null && dimScores.A_feasibility < THRESHOLDS.yellow) flags.push("FEAS_LOW");
    if (
      agg.feasibility_score != null &&
      agg.feasibility_score < THRESHOLDS.feas_low &&
      flags.indexOf("FEAS_LOW") < 0
    ) {
      flags.push("FEAS_LOW");
    }
    if (dimScores.R_relevance != null && dimScores.R_relevance < THRESHOLDS.yellow) flags.push("R_DRIFT");
    return flags;
  }

  function buildCoaching(dimScores, agg, flags) {
    var growth =
      agg.alignment_score != null && agg.alignment_score >= 55
        ? "對齊度尚可（" + agg.alignment_score + "）：把 S/M 三題共識寫成可複誦兩句話，貼在會議室或群組置頂。"
        : "對齊度需加強（" + (agg.alignment_score != null ? agg.alignment_score : "—") + "）：請用 30 分鐘重寫「對象＋改變」，對照 15 題中 S/M/R 低分項。";
    var collab =
      flags.indexOf("LOAD_HIGH") >= 0 || flags.indexOf("CARE_LOW") >= 0
        ? "負載交叉檢驗亮紅：Care 三題 + R 優先權需再談；與小組長對齊 A 與替補，必要時縮小試行。"
        : "可邀請 accountability partner，兩週對照 M 向度三題問一次：「記號是否仍 realistic？」";
    var redflag =
      flags.indexOf("FEAS_LOW") >= 0
        ? "A+Care 交叉顯示可行性不足（" + (agg.feasibility_score != null ? agg.feasibility_score : "—") + "）：先補人力或簡化，再談擴張。"
        : flags.indexOf("R_DRIFT") >= 0 || flags.indexOf("ALIGN_LOW") >= 0
          ? "主線可能漂移：回到 SWOT／優先序，確認 15 題中 R 三題是否仍成立。"
          : "若長期無共識或衝突加劇，請牧者 facilitation；SMART 不能取代關係。";
    return {
      growth: growth,
      collaboration: collab,
      redflag: redflag,
      peer_questions: [
        "15 題裡哪一組（S/M/A/R/Care）最讓我們心虛？",
        "誰會因這計畫最累？Care 三題是否誠實？",
        "三個月後用 M 向度的哪個記號開檢討會？"
      ],
      mentor_questions: [
        "這條 SMART 是否呼應靈命／優先序診斷（R 三題）？",
        "A+T 三題顯示的資源與節期，長執是否背書？",
        "試行期結束：什麼情況下該停、該調、該擴？"
      ]
    };
  }

  function buildMetricBridge(dimScores, agg) {
    function fmt(k) {
      return dimScores[k] != null ? dimScores[k].toFixed(1) : "—";
    }
    return (
      "對齊 " +
      (agg.alignment_score != null ? agg.alignment_score : "—") +
      " ← avg(S=" +
      fmt("S_clarity") +
      ", M=" +
      fmt("M_measurability") +
      ", R=" +
      fmt("R_relevance") +
      ", T=" +
      fmt("T_time_fit") +
      ") · 負載 " +
      (agg.load_cost_score != null ? agg.load_cost_score : "—") +
      " ← Care=" +
      fmt("Care_health") +
      "（反向）+ R 隱性成本 · 可行 " +
      (agg.feasibility_score != null ? agg.feasibility_score : "—") +
      " ← avg(A=" +
      fmt("A_feasibility") +
      ", Care=" +
      fmt("Care_health") +
      ") · PDCA：P=對齊 · D=avg(A,T) · C=負載 · A=永續綜合"
    );
  }

  function pdcaLevelForScore(score, invert) {
    if (score == null || !isFinite(score)) return "unknown";
    if (!invert) {
      if (score >= 65) return "green";
      if (score >= 50) return "yellow";
      return "red";
    }
    if (score <= 45) return "green";
    if (score <= 65) return "yellow";
    return "red";
  }

  /**
   * PDCA 教牧導遊診斷（Tab ③ SSOT）— 每個分數必附白話解讀與行動建議。
   */
  function buildPdcaGuide(dimScores, agg) {
    var align = agg.alignment_score;
    var exec = agg.execution_score;
    var load = agg.load_cost_score;
    var sustain = agg.sustain_score;

    function narrP(level, score) {
      if (level === "green") {
        return {
          diagnosis: "異象尚清晰",
          pastoral: "核心同工對「什麼叫做好」大方向一致，長執會可進入預算與分工，而非再辯論口號。",
          action: "把 15 題中 S/M 共識寫成兩句可複誦摘要，貼在會議室或群組置頂，作為三個月檢討對照。"
        };
      }
      if (level === "yellow") {
        return {
          diagnosis: "異象有迷霧",
          pastoral:
            "大家口號喊得響，但對「做到什麼程度算成功」仍各說各話——" +
            (score != null ? score + " 分" : "目前分數") +
            " 代表長執容易在預算上空轉，卻摸不到具體第一步。",
          action: "請長執會先暫緩細項預算，花兩週釐清：今年到底要接觸多少對象、用什麼記號衡量（對照 M 三題）。"
        };
      }
      return {
        diagnosis: "異象迷霧嚴重",
        pastoral: "計畫像摸象——每人都覺得重要，卻說不清「誰、做什麼、三個月後看什麼」。這不是填答者不認真，而是目標尚未 SMART 化。",
        action: "暫停新事工表決，召開異象對齊會：把口號改寫成「對象＋改變＋可衡量記號」，對照 S/M/R 低分題逐條補強。"
      };
    }

    function narrD(level, score) {
      if (level === "green") {
        return {
          diagnosis: "執行面可推進",
          pastoral: "A（資源可行）與 T（時程適配）交叉顯示：以教會現有人力、恩賜與節期，推動具備現實基礎。",
          action: "鎖定 12 週試行節奏，每兩週用 M 向度記號問一次：「進度是否仍 realistic？」"
        };
      }
      if (level === "yellow") {
        return {
          diagnosis: "執行需降溫",
          pastoral: "資源或時程有一側偏緊；若照原規模硬推，同工會在第三個月開始補洞、補洞、再補洞。",
          action: "縮小首期目標或拉長時程；與小組長對齊 A 三題中的缺口，必要時先找友堂或外部資源再開工。"
        };
      }
      return {
        diagnosis: "空中樓閣",
        pastoral:
          "🚨 執行紅燈！以現有人力、恩賜與財務，這計畫在執行面幾乎是硬著陸（" +
          (score != null ? score + " 分" : "—") +
          "）。強推只會消耗信任與體力。",
        action: "強烈建議：降低首期目標、把一年改為兩年分期，或向外尋求友堂資源——切勿盲目開工。"
      };
    }

    function narrC(level, score) {
      if (level === "green") {
        return {
          diagnosis: "負載在可承載範圍",
          pastoral: "Care 三題顯示同工仍有安息留白；這計畫尚未明顯榨乾核心團隊。",
          action: "維持「加一項事工、檢視一項舊負擔」的習慣；試行期結束再問 Care 三題是否仍誠實。"
        };
      }
      if (level === "yellow") {
        return {
          diagnosis: "負載升溫中",
          pastoral: "同工開始感到吃緊；R 的隱性成本與 Care 反向分數顯示，邊做邊喘的風險上升。",
          action: "長執會盤點：誰最累？能否合併會議、減少行政庶務，或加替補人力再談擴張。"
        };
      }
      return {
        diagnosis: "枯乾過勞高危期",
        pastoral:
          "⚠️ 枯乾高危！同工正咬牙硬撐，安息留白已低於安全線（" +
          (score != null ? score + " 分 ↑累" : "—") +
          "）。這是全表最精華的教牧關懷指標——計畫在榨乾隱性成本。",
        action: "強烈建議：長執會啟動減負機制——加一項聖工，就必須砍或合併至少一項行政庶務；為核心同工留綠洲。"
      };
    }

    function narrA(level, score) {
      if (level === "green") {
        return {
          diagnosis: "具永續推進潛力",
          pastoral: "對齊、執行與負載三者交叉後，這條 SMART 有機會跑完試行並進入傳承，而非一次性燃盡。",
          action: "設定試行結束的停／調／擴三條件，並指定後備同工，避免只靠單一英雄。"
        };
      }
      if (level === "yellow") {
        return {
          diagnosis: "永續需刻意設計",
          pastoral: "可以試行，但若不加梯隊與節奏管理，第二年容易人困馬乏。",
          action: "把「誰接班、何時減碼、何時停損」寫進長執會議程，對照 P/D/C 三項再調一次。"
        };
      }
      return {
        diagnosis: "難以永續",
        pastoral:
          "對齊、可行與負載交叉顯示：強行推滿一年，同工大面積乾枯、事工黯然收場的機率極高（" +
          (score != null ? score + " 分" : "—") +
          "）。",
        action: "現階段應縮小試行、建立梯隊傳承，或明確設定停損點——什麼情況下該停、該調、絕不硬撐。"
      };
    }

    var specs = [
      {
        key: "P",
        letter: "P",
        title: "Plan · 異象與目標對齊",
        source: "來自 15 題 S/M/R/T 四向度 rollup → 對齊度（0–100）",
        score: align,
        invert: false,
        suffix: "分",
        narr: narrP
      },
      {
        key: "D",
        letter: "D",
        title: "Do · 可行推動",
        source: "來自 A（資源可行）+ T（時程適配）交叉 → 執行分（0–100）",
        score: exec,
        invert: false,
        suffix: "分",
        narr: narrD
      },
      {
        key: "C",
        letter: "C",
        title: "Check · 隱性負載",
        source: "來自 Care 反向 + R 隱性成本 → 負載分（愈高愈累）",
        score: load,
        invert: true,
        suffix: "分",
        narr: narrC
      },
      {
        key: "A",
        letter: "A",
        title: "Act · 永續持續",
        source: "綜合對齊、執行、與（100−負載）→ 永續營運指數（0–100）",
        score: sustain,
        invert: false,
        suffix: "分",
        narr: narrA
      }
    ];

    var items = specs.map(function (spec) {
      var level = pdcaLevelForScore(spec.score, spec.invert);
      var text = spec.narr(level, spec.score);
      var scoreDisplay =
        spec.score != null
          ? spec.score + spec.suffix + (spec.invert && spec.score > 60 ? " ↑累" : "")
          : "—";
      return {
        key: spec.key,
        letter: spec.letter,
        title: spec.title,
        source: spec.source,
        score: spec.score,
        score_display: scoreDisplay,
        invert: spec.invert,
        level: level,
        diagnosis: text.diagnosis,
        pastoral: text.pastoral,
        action: text.action
      };
    });

    return {
      intro:
        "SMART 目標若沒有執行滾動，容易停在口號。系統把 15 題特徵投影到 PDCA（戴明環）：" +
        "不是半導體 KPI 考核，而是給長執／牧長「異象對齊 → 能否開工 → 同工是否被榨乾 → 能否跑完」四步診斷。",
      items: items
    };
  }

  function buildAiPrompt(run) {
    var d = run.derived || {};
    var s = d.dim_scores || {};
    var lines = DIM_KEYS.map(function (k) {
      return DIM_LABELS[k] + "=" + (s[k] != null ? s[k] : "—");
    });
    return (
      "你是教會事工規劃顧問（非權威，僅供牧者審核）。\n" +
      "工具：教會版 SMART v2（15 題矩陣）\n" +
      "計畫：" +
      ((run.profile && run.profile.plan_name) || "—") +
      "\n" +
      "六向度 rollup：" +
      lines.join(" / ") +
      "\n" +
      "對齊 " +
      (d.alignment_score != null ? d.alignment_score : "—") +
      " · 負載 " +
      (d.load_cost_score != null ? d.load_cost_score : "—") +
      " · 可行 " +
      (d.feasibility_score != null ? d.feasibility_score : "—") +
      "\n" +
      "風險：" +
      ((run.risk_flags || []).join(", ") || "無") +
      "\n" +
      "CTV：P=" +
      run.feature_vector.P +
      " S=" +
      run.feature_vector.S +
      " G=" +
      run.feature_vector.G +
      " C=" +
      run.feature_vector.C +
      " R=" +
      run.feature_vector.R +
      " F=" +
      run.feature_vector.F +
      "\n\n" +
      "請產出：1) 四句式 SMART 摘要 2) 12 週試行節奏 3) 給長執三個追問\n" +
      "強調非 KPI 考核；勿編造經文；不確定處請明說需牧者查證。"
    );
  }

  function validate(answers) {
    var map = normalizeAnswers(answers);
    var errors = [];
    var answeredCount = 0;
    QUESTIONS.forEach(function (q) {
      if (map[q.id] != null && isFinite(map[q.id])) {
        if (map[q.id] < 1 || map[q.id] > 5) errors.push(q.id + " 須為 1–5");
        else answeredCount++;
      }
    });
    if (!answeredCount) errors.push("尚未作答");
    if (answeredCount > 0 && answeredCount < QUESTIONS.length) {
      errors.push("請完成全部 " + QUESTIONS.length + " 題（目前 " + answeredCount + " 題）");
    }
    return { ok: errors.length === 0, errors: errors, answers: map, answeredCount: answeredCount };
  }

  function buildRun(answers, profile, opts) {
    opts = opts || {};
    var check = validate(answers);
    if (!check.ok || !check.answeredCount) {
      return { ok: false, errors: check.errors.length ? check.errors : ["尚無足夠作答"] };
    }
    var answerMap = check.answers;
    var dimScores = computeDimScores(answerMap);
    var dimLevels = {};
    DIM_KEYS.forEach(function (k) {
      if (dimScores[k] != null) dimLevels[k] = levelFromScore(dimScores[k]);
    });
    var agg = aggregateFromDimScores(dimScores);
    var risk_flags = computeRiskFlags(dimScores, agg, check.answeredCount);
    var coaching = buildCoaching(dimScores, agg, risk_flags);
    var raw_answers = QUESTIONS.map(function (q) {
      return { q: q.id, dim: q.dim, value: answerMap[q.id] != null ? answerMap[q.id] : null };
    });

    var run = {
      schema_version: PACK_VERSION,
      tool_id: TOOL_ID,
      timestamp: opts.timestamp || Date.now(),
      member_id: opts.member_id != null ? opts.member_id : null,
      profile: Object.assign({ plan_name: "", season_label: "", plan_summary: "" }, profile || {}),
      authenticity_score: round1(check.answeredCount / QUESTIONS.length),
      feature_vector: computeFeatureVector(answerMap),
      derived: Object.assign(
        {
          dim_scores: dimScores,
          dim_levels: dimLevels,
          composite: computeComposite(dimScores),
          answered_count: check.answeredCount,
          question_total: QUESTIONS.length,
          metric_bridge: buildMetricBridge(dimScores, agg),
          pdca_guide: buildPdcaGuide(dimScores, agg)
        },
        agg
      ),
      raw_answers: raw_answers,
      risk_flags: risk_flags,
      coaching: coaching,
      source_note: "smart_pack v" + PACK_VERSION + " · " + check.answeredCount + "/" + QUESTIONS.length + " 題"
    };
    run.ai_prompt = buildAiPrompt(run);
    return { ok: true, run: run };
  }

  function buildDemoRun() {
    var answers = {
      smart_s1: 3, smart_s2: 3, smart_s3: 2,
      smart_m1: 3, smart_m2: 2, smart_m3: 3,
      smart_at1: 2, smart_at2: 3, smart_at3: 2,
      smart_r1: 4, smart_r2: 3, smart_r3: 3,
      smart_c1: 2, smart_c2: 2, smart_c3: 2
    };
    var built = buildRun(answers, {
      plan_name: "示範：探訪久未出席會友",
      season_label: "2026 第二季",
      plan_summary: "每週兩對夫婦探訪，為期三個月試行。"
    });
    if (built.ok && built.run) built.run.is_demo = true;
    return built;
  }

  /** 舊版 6 題 id 相容 rollup（遷移用） */
  function aggregateFromScores(scores) {
    var dimScores = computeDimScores(scores);
    if (scores.S_clarity != null && !scores.smart_s1) {
      dimScores = {
        S_clarity: scores.S_clarity,
        M_measurability: scores.M_measurability,
        A_feasibility: scores.A_feasibility,
        R_relevance: scores.R_relevance,
        T_time_fit: scores.T_time_fit,
        Care_health: scores.Care_health
      };
    }
    return aggregateFromDimScores(dimScores);
  }

  global.SmartPack = {
    TOOL_ID: TOOL_ID,
    TOOL_LABEL: TOOL_LABEL,
    PACK_VERSION: PACK_VERSION,
    QUESTIONS: QUESTIONS,
    DIM_KEYS: DIM_KEYS,
    DIM_LABELS: DIM_LABELS,
    DIM_HINTS: DIM_HINTS,
    DIM_PROJECTION: DIM_PROJECTION,
    THRESHOLDS: THRESHOLDS,
    FLAG_DESCRIPTIONS: FLAG_DESCRIPTIONS,
    validate: validate,
    buildRun: buildRun,
    buildDemoRun: buildDemoRun,
    buildAiPrompt: buildAiPrompt,
    computeDimScores: computeDimScores,
    aggregateFromDimScores: aggregateFromDimScores,
    aggregateFromScores: aggregateFromScores,
    buildPdcaGuide: buildPdcaGuide,
    levelFromScore: levelFromScore
  };
})(typeof window !== "undefined" ? window : global);
