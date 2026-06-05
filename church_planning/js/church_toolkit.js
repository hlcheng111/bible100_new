/**
 * 教會規劃工具共用：診斷文案、分享、PDF、柱狀圖（Chart.js）
 * 不依賴打包；以 window.ChurchToolkit 暴露。
 */
(function (global) {
  "use strict";

  function storageGet(key) {
    try {
      if (global.PersistenceProvider && typeof global.PersistenceProvider.getInstance === "function") {
        return global.PersistenceProvider.getInstance().getItem(key);
      }
    } catch (e) {
      console.warn("ChurchToolkit: PersistenceProvider.getItem fallback", e);
    }
    return global.localStorage.getItem(key);
  }

  function storageSet(key, value) {
    try {
      if (global.PersistenceProvider && typeof global.PersistenceProvider.getInstance === "function") {
        global.PersistenceProvider.getInstance().setItem(key, value);
        return;
      }
    } catch (e) {
      console.warn("ChurchToolkit: PersistenceProvider.setItem fallback", e);
    }
    global.localStorage.setItem(key, value);
  }

  function trim(s) {
    return String(s == null ? "" : s).trim();
  }

  function nonEmpty(s, fallback) {
    var t = trim(s);
    return t ? t : fallback;
  }

  /** 四句式：現況／風險／根因／下一步 — 保證每句非空 */
  function fourSentenceGeneric(opts) {
    var tool = opts.tool || "工具";
    var current = trim(opts.current);
    var risk = trim(opts.risk);
    var root = trim(opts.root);
    var next = trim(opts.next);
    if (!current)
      current =
        "目前「" +
        tool +
        "」可用的書面線索仍偏少；建議先補 2～3 句可觀察的事實，讓同工對焦同一幅畫面。";
    if (!risk)
      risk =
        "若長期停留在感覺性描述，決策會靠印象與權柄而非共同看見，容易在負載與關係上付出隱性成本。";
    if (!root)
      root =
        "常見根因不是能力不足，而是節奏過滿、缺少替補與可檢核的「最小證據」。";
    if (!next)
      next =
        "下一步：指定一位負責人、一次 30 分鐘對齊會議，並寫下「本季只看的三個指標或現象」。";
    return { current: current, risk: risk, root: root, next: next };
  }

  /** SWOT：依象限平均具體度與文字長度產出四句式 */
  function fourSentenceSwot(ctx) {
    var dims = ctx.dimensions || [];
    var n = dims.length || 8;
    var sumS = 0,
      sumW = 0,
      sumO = 0,
      sumT = 0,
      count = 0;
    var textLen = { s: 0, w: 0, o: 0, t: 0 };
    for (var i = 0; i < dims.length; i++) {
      var d = dims[i];
      if (!d) continue;
      count++;
      sumS += Number(d.sClarity || 0);
      sumW += Number(d.wClarity || 0);
      sumO += Number(d.oClarity || 0);
      sumT += Number(d.tClarity || 0);
      textLen.s += trim(d.s).length;
      textLen.w += trim(d.w).length;
      textLen.o += trim(d.o).length;
      textLen.t += trim(d.t).length;
    }
    if (!count) count = 1;
    var avg = function (x) {
      return x / count;
    };
    var quadLabel = function (name, score, len) {
      return (
        name +
        " 平均具體度 " +
        score.toFixed(1) +
        "/5，文字量 " +
        len +
        " 字"
      );
    };
    var weakest = "W";
    var min = avg(sumW);
    if (avg(sumS) < min) {
      min = avg(sumS);
      weakest = "S";
    }
    if (avg(sumO) < min) {
      min = avg(sumO);
      weakest = "O";
    }
    if (avg(sumT) < min) {
      min = avg(sumT);
      weakest = "T";
    }
    var current =
      "八個事工範疇的輸入概況：" +
      quadLabel("S", avg(sumS), textLen.s) +
      "；" +
      quadLabel("W", avg(sumW), textLen.w) +
      "；" +
      quadLabel("O", avg(sumO), textLen.o) +
      "；" +
      quadLabel("T", avg(sumT), textLen.t) +
      "。";
    var risk =
      "教會處境與企業不同：若 " +
      weakest +
      " 象限長期偏弱，策略會變成「活動堆疊」或「只靠牧者扛」，難形成會眾共同辨識的優先序。";
    var root =
      "根因往往是「沒有把外在機會／威脅寫到可討論的事實層級」，或內在優劣勢沒有對齊治理與替補，導致無法做減法。";
    var next =
      "下一步：用 TOWS 產出「本季只做三件事」— 先從最弱象限補兩句可驗證描述，再為每個威脅寫負責人與檢核日。";
    return fourSentenceGeneric({
      tool: "SWOT",
      current: current,
      risk: risk,
      root: root,
      next: next
    });
  }

  function fourSentencePdca(ctx) {
    var c = ctx.cycle || {};
    var rows = Array.isArray(c.planRows) ? c.planRows : [];
    var planFilled = rows.filter(function (r) {
      return r && trim(r.action).length > 0;
    }).length;
    if (!planFilled) {
      planFilled = [
        c.planProblem,
        c.planGoal,
        c.planMetricsHow,
        c.planTimeline
      ].filter(function (x) {
        return trim(x).length > 0;
      }).length;
    }
    var rhythm = c.checkRhythmScore != null ? Number(c.checkRhythmScore) : null;
    var checkStrong =
      trim(c.checkOutcome || c.checkEvidence).length > 12 &&
      (rhythm != null && rhythm >= 1 && rhythm <= 5);
    var current =
      "Plan 已列 " +
      planFilled +
      " 條行動；Check 對果效／節奏的描寫" +
      (checkStrong ? "可對話" : "仍偏薄") +
      "（節奏健康度" +
      (rhythm != null ? rhythm + "/5" : "未評") +
      "）；Do 與計畫行數已對齊。";
    var risk =
      !checkStrong
        ? "若只看忙碌與情緒、不辨認節奏是否健康，容易把團隊透支當成「不夠摆上」。"
        : "若 Act 沒有「保留／調整／停止」的決定，下一輪 Plan 可能重複同一過載模式。";
    var root =
      trim(c.checkGap)
        ? "從落差來看，值得追問：是目標不清、替補不足、溝通斷裂，還是節期衝突？先選一個主因。"
        : "根因常是「檢核記號事先沒約定」，執行時難以對齊期待。";
    var next =
      trim(c.actAdjust || c.actMustChange)
        ? "下一步：優先落實「要調整的一項」：" +
          trim(c.actAdjust || c.actMustChange).slice(0, 100) +
          "，並指定負責人與檢核日。"
        : "下一步：在 Act 寫清要保留、調整、暫停的做法各至少一句，再進入下一輪 Plan。";
    return fourSentenceGeneric({
      tool: "PDCA",
      current: current,
      risk: risk,
      root: root,
      next: next
    });
  }

  /**
   * 由多個事工計畫的 scores 聚合 alignment / load / feasibility（0–100），供 SMART 報告與四句式。
   * plans: [{ scores: { S_clarity, M_measurability, ... } }]
   */
  function smartAggregateFromPlans(plans) {
    var list = Array.isArray(plans) ? plans : [];
    if (!list.length) {
      return { alignmentScore: null, loadCostScore: null, feasibilityScore: null };
    }
    function num(v) {
      var n = Number(v);
      return Number.isFinite(n) && n >= 1 && n <= 5 ? n : null;
    }
    var alignSum = 0,
      alignN = 0,
      loadSum = 0,
      loadN = 0,
      feasSum = 0,
      feasN = 0;
    for (var i = 0; i < list.length; i++) {
      var sc = (list[i] && list[i].scores) || {};
      var a = [num(sc.S_clarity), num(sc.M_measurability), num(sc.R_relevance), num(sc.T_time_fit)];
      for (var j = 0; j < a.length; j++) {
        if (a[j] != null) {
          alignSum += a[j];
          alignN++;
        }
      }
      var care = num(sc.Care_health);
      var aFeas = num(sc.A_feasibility);
      if (care != null) {
        loadSum += 5 - care;
        loadN++;
      }
      if (aFeas != null && care != null) {
        feasSum += (aFeas + care) / 2;
        feasN++;
      } else if (aFeas != null) {
        feasSum += aFeas;
        feasN++;
      } else if (care != null) {
        feasSum += care;
        feasN++;
      }
    }
    var alignmentScore =
      alignN > 0 ? Math.round((alignSum / alignN / 5) * 100) : null;
    var loadCostScore =
      loadN > 0 ? Math.round((loadSum / loadN / 4) * 100) : null;
    var feasibilityScore =
      feasN > 0 ? Math.round((feasSum / feasN / 5) * 100) : null;
    return {
      alignmentScore: alignmentScore,
      loadCostScore: loadCostScore,
      feasibilityScore: feasibilityScore
    };
  }

  function fourSentenceSmart(ctx) {
    var align = ctx.alignmentScore;
    var load = ctx.loadCostScore;
    var feas = ctx.feasibilityScore;
    if (
      ctx &&
      Array.isArray(ctx.plans) &&
      ctx.plans.length &&
      (align == null || load == null || feas == null)
    ) {
      var agg = smartAggregateFromPlans(ctx.plans);
      if (align == null) align = agg.alignmentScore;
      if (load == null) load = agg.loadCostScore;
      if (feas == null) feas = agg.feasibilityScore;
    }
    var current =
      "規劃診斷分數（僅供對話）：對齊 " +
      (align != null ? align : "—") +
      "、負載成本 " +
      (load != null ? load : "—") +
      "、可行性 " +
      (feas != null ? feas : "—") +
      "。";
    var risk =
      load != null && load > 65
        ? "商業團隊常以「增長」為默認成功；教會若忽略負載成本，會以牧養品質與家庭關係付帳。"
        : "若 SMART 只剩「數字目標」而沒有關係與節奏，會友會感到被 KPI 化，與門訓相悖。";
    var root =
      align != null && align < 45
        ? "根因可能是事工組合與異象脫節，或同時推太多線，導致「忙卻不像我們」。"
        : "根因往往是溝通與替補不足，不是缺少更好的計畫表。";
    var next =
      "下一步：依各計畫的清晰與健康度排序，選 1～2 條主線寫清「暫停／降頻」與對內一句話，並在 90 天內只做可守住的里程碑。";
    return fourSentenceGeneric({
      tool: "SMART",
      current: current,
      risk: risk,
      root: root,
      next: next
    });
  }

  /** 服事 80/20：參與集中度與核心負荷（不接靈命 scoring） */
  function fourSentence8020(ctx) {
    ctx = ctx || {};
    function numOrNaN(v) {
      if (v == null || v === "") return NaN;
      var n = Number(v);
      return Number.isFinite(n) ? n : NaN;
    }
    var c = numOrNaN(ctx.concentrationLikert);
    var burn = numOrNaN(ctx.coreBurnoutLikert);
    var pipe = numOrNaN(ctx.pipelineLikert);
    var prune = numOrNaN(ctx.willingToPruneLikert);
    var name = trim(ctx.churchName);
    var head = name ? "「" + name + "」" : "本教會";
    var conc = !Number.isFinite(c)
      ? "尚未具體描繪集中度，建議先對齊可觀察事實。"
      : c >= 5
        ? "多數可見服事線高度倚賴極少數同工。"
        : c >= 4
          ? "服事參與明顯集中，核心圈負擔感普遍。"
          : c >= 3
            ? "已出現集中趨勢，但仍有調整空間。"
            : c >= 2
              ? "參與面尚稱分散，或團隊對現況感受不一致。"
              : "整體感受偏分散，仍需用具體事實校準。";
    var load = !Number.isFinite(burn)
      ? "核心負荷尚未自評，建議在信任圈內補齊。"
      : burn >= 4
        ? "核心同工疲勞／透支風險值得立刻正視。"
        : burn >= 3
          ? "核心團隊壓力偏高，需要節奏與替補討論。"
          : burn >= 2
            ? "壓力感受尚可，仍應預防無形加班文化。"
            : "自述負荷偏低或極輕，仍建議定期檢核真實節奏。";
    var current = head + "：" + conc + load;
    var risk =
      (Number.isFinite(c) && c >= 4) || (Number.isFinite(burn) && burn >= 4)
        ? "長期「少數人扛多數線」會同時傷害牧養深度、家庭時間與接班梯隊，並讓會眾誤以為服事是「專業同工的事」。"
        : "即使集中度尚可，若沒有清楚的替補與停損，活動增長仍可能悄悄把團隊推回 80/20。";
    var root =
      (Number.isFinite(pipe) && pipe <= 2) || (Number.isFinite(prune) && prune <= 2)
        ? "根因常是「只補洞、不培育」加上「不好意思停掉已習慣的線」，導致人力永遠追不上節目表。"
        : "根因多半是角色不清、邀請門檻過高，或缺少把大任拆成小任的牧養設計，而非會眾不願意。";
    var next =
      "從本頁三個行動中至少完成一項「具名負責人＋期限」；並在治理／同工會中固定檢視「誰在扛、誰被閒置、誰需要歇息」。";
    return fourSentenceGeneric({
      tool: "服事 80/20",
      current: current,
      risk: risk,
      root: root,
      next: next
    });
  }

  function shareWhatsApp(title, lines) {
    var text = [title || "教會規劃"].concat(lines || []).join("\n");
    if (global.navigator && global.navigator.share) {
      global.navigator
        .share({ title: title || "教會規劃", text: text })
        .catch(function () {});
      return;
    }
    var url = "https://wa.me/?text=" + encodeURIComponent(text);
    global.open(url, "_blank");
  }

  function downloadPdf(elementId, filename) {
    var el =
      typeof elementId === "string"
        ? global.document.getElementById(elementId)
        : elementId;
    if (!el || !global.html2pdf) {
      console.warn("church_toolkit: html2pdf 或元素不存在");
      return;
    }
    global.html2pdf()
      .from(el)
      .set({
        margin: 0.35,
        filename: filename || "report.pdf",
        image: { type: "jpeg", quality: 0.96 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { format: "a4", unit: "in" }
      })
      .save();
  }

  /**
   * 柱狀圖；需在頁面載入 Chart.js
   */
  function renderBarChart(canvasId, config) {
    var canvas =
      typeof canvasId === "string"
        ? global.document.getElementById(canvasId)
        : canvasId;
    if (!canvas || !global.Chart) return null;
    var ctx = canvas.getContext("2d");
    var old = canvas._chartInstance;
    if (old && old.destroy) old.destroy();
    var chart = new global.Chart(ctx, {
      type: "bar",
      data: config.data,
      options: config.options || {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, max: config.yMax || undefined }
        },
        plugins: { legend: { position: "bottom" } }
      }
    });
    canvas._chartInstance = chart;
    return chart;
  }

  /** 與規格一致之儲存鍵（供四頁共用） */
  var STORAGE_KEYS = {
    HEALTH_PROFILE: "chp2026-health-profile",
    HEALTH_RESULT: "chp2026-health-result",
    HEALTH_HISTORY: "chp2026-health-history",
    SWOT: "chp2026-swot-v1",
    SMART: "chp2026-smart-v1",
    PDCA: "chp2026-pdca-log",
    PDCA_LEGACY: "chp2026-pdca-v1",
    EIGHTY_TWENTY: "chp2026-8020-v1",
    RESOLUTION_LOG: "chp2026-resolution-log",
    RACI_DIAGNOSTIC: "chp2026-raci-diagnostic-v1"
  };

  /** 健康八維 index 0–7 ↔ 穩定 id（與 SWOT 八維對齊） */
  var HEALTH_DIM_IDS = [
    "ev",
    "dis",
    "fel",
    "mis",
    "wor",
    "led",
    "ste",
    "rel"
  ];

  function saveHealthProfile(profile) {
    try {
      storageSet(
        STORAGE_KEYS.HEALTH_PROFILE,
        JSON.stringify({ version: 1, savedAt: new Date().toISOString(), profile: profile })
      );
    } catch (e) {}
  }

  function loadHealthProfile() {
    try {
      var raw = storageGet(STORAGE_KEYS.HEALTH_PROFILE);
      if (!raw) return null;
      var o = JSON.parse(raw);
      return o && o.profile ? o.profile : null;
    } catch (e) {
      return null;
    }
  }

  function saveHealthResult(result, options) {
    var now = new Date().toISOString();
    try {
      storageSet(
        STORAGE_KEYS.HEALTH_RESULT,
        JSON.stringify({ version: 1, savedAt: now, result: result })
      );
    } catch (e) {}
    try {
      var histRaw = storageGet(STORAGE_KEYS.HEALTH_HISTORY);
      var hist = [];
      if (histRaw) {
        var parsed = JSON.parse(histRaw);
        if (Array.isArray(parsed)) hist = parsed;
      }
      var stage = "in-progress";
      if (!hist.length) stage = "baseline";
      if (options && typeof options.stage === "string" && trim(options.stage)) {
        stage = trim(options.stage).toLowerCase();
      }
      var snap = {
        version: 1,
        savedAt: now,
        stage: stage,
        overallNormalized:
          result && result.overallNormalized != null ? Number(result.overallNormalized) : null,
        overallScore:
          result && result.overallScore != null ? Number(result.overallScore) : null,
        dimensions:
          result && Array.isArray(result.dimensions)
            ? result.dimensions.map(function (d) {
                return {
                  id: d.id,
                  name: d.name,
                  score: d.score,
                  max: d.max,
                  normalizedScore:
                    d.normalizedScore != null ? Number(d.normalizedScore) : null
                };
              })
            : []
      };
      hist.push(snap);
      if (hist.length > 50) hist = hist.slice(hist.length - 50);
      storageSet(STORAGE_KEYS.HEALTH_HISTORY, JSON.stringify(hist));
    } catch (e) {}
  }

  function loadHealthResult() {
    try {
      var raw = storageGet(STORAGE_KEYS.HEALTH_RESULT);
      if (!raw) return null;
      var o = JSON.parse(raw);
      return o && o.result ? o.result : null;
    } catch (e) {
      return null;
    }
  }

  function loadHealthHistory() {
    try {
      var raw = storageGet(STORAGE_KEYS.HEALTH_HISTORY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * 將健康問卷 openAnswers 組成條列摘錄（僅供頁面組字／AI，不寫入儲存）。
   * @param {Array} openAnswers 8×[反思, 聚焦]
   * @param {string[]} dimNames 八範疇顯示名（可空，用預設）
   * @param {number} perDimMax 每範疇合併字串上限
   * @param {number} totalMax 全卷字元上限（含換行）
   */
  function formatHealthOpenContext(openAnswers, dimNames, perDimMax, totalMax) {
    if (!openAnswers || !Array.isArray(openAnswers)) return "";
    perDimMax = Number(perDimMax) > 0 ? Number(perDimMax) : 200;
    totalMax = Number(totalMax) > 0 ? Number(totalMax) : 1200;
    var defaultNames = [
      "佈道",
      "門徒訓練",
      "團契",
      "宣教／服事",
      "崇拜",
      "領導力",
      "管家職分",
      "人際關係"
    ];
    var names =
      dimNames && dimNames.length === 8 ? dimNames : defaultNames;
    var parts = [];
    var total = 0;
    var tail =
      "…（已達摘錄上限；全文見健康診斷報告末「附錄：填寫者觀察」。）";
    for (var i = 0; i < 8; i++) {
      var row = openAnswers[i];
      if (!row || !Array.isArray(row)) continue;
      var a = trim(row[0]);
      var b = trim(row[1]);
      if (!a && !b) continue;
      var line = "";
      if (a) line += "問題反思：" + a;
      if (b) line += (line ? " " : "") + "12 個月聚焦：" + b;
      if (line.length > perDimMax) line = line.slice(0, perDimMax) + "…";
      var block =
        (names[i] || defaultNames[i] || "範疇" + (i + 1)) + "：" + line;
      var addLen = block.length + (parts.length ? 1 : 0);
      if (total + addLen > totalMax) {
        parts.push(tail);
        break;
      }
      parts.push(block);
      total += addLen;
    }
    return parts.join("\n");
  }

  function loadSmartState() {
    try {
      var raw = storageGet(STORAGE_KEYS.SMART);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  /** 供 PDCA 等頁對齊 SMART：v2 讀 plans[0].name；v1 讀 planning.ministryFocus */
  function getSmartFocusLabel() {
    var sm = loadSmartState();
    if (!sm) return "";
    if (sm.version === 2 && sm.plans && sm.plans.length) {
      var p0 = sm.plans[0];
      var n = (p0 && p0.name) || "";
      if (trim(n)) return n;
      if (sm.context && trim(sm.context.season_label)) return sm.context.season_label;
      return "SMART 計畫";
    }
    if (sm.planning && (sm.planning.ministryFocus || sm.planning.outputStep0)) {
      return trim(sm.planning.ministryFocus || sm.planning.outputStep0);
    }
    return "";
  }

  function saveSmartState(payload) {
    try {
      storageSet(
        STORAGE_KEYS.SMART,
        JSON.stringify(
          Object.assign(
            { version: 1, savedAt: new Date().toISOString() },
            payload || {}
          )
        )
      );
    } catch (e) {}
  }

  /**
   * 追加一筆治理決議／會議快照（陣列存於 RESOLUTION_LOG）。
   * @param {Object} entry 自訂欄位；會自動加上 savedAt、version。
   * @returns {number} 陣列長度；失敗時為 0。
   */
  function appendResolutionLog(entry) {
    var key = STORAGE_KEYS.RESOLUTION_LOG;
    var arr = [];
    try {
      var raw = storageGet(key);
      if (raw) {
        var parsed = JSON.parse(raw);
        arr = Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      arr = [];
    }
    var row = Object.assign(
      { version: 1, savedAt: new Date().toISOString() },
      entry || {}
    );
    arr.push(row);
    try {
      storageSet(key, JSON.stringify(arr));
    } catch (e) {
      return 0;
    }
    return arr.length;
  }

  /**
   * 由八維分數產生三則建議：①守住強項 ②補弱點 ③節奏／治理（含分數差、規模權重）
   * catScores 為每維總分（含體質題），max 約 65
   */
  function buildThreeHealthSuggestions(catScores, categoryNames, churchSize) {
    var maxDim = 65;
    var scored = (catScores || []).map(function (s, i) {
      return {
        idx: i,
        id: HEALTH_DIM_IDS[i] || "d" + i,
        name: (categoryNames && categoryNames[i]) || "範疇" + (i + 1),
        score: Number(s) || 0
      };
    });
    var sortedAsc = scored.slice().sort(function (a, b) {
      return a.score - b.score;
    });
    var sortedDesc = scored.slice().sort(function (a, b) {
      return b.score - a.score;
    });
    var worst = sortedAsc[0];
    var best = sortedDesc[0];
    var scoresOnly = scored.map(function (x) {
      return x.score;
    });
    var spread =
      scoresOnly.length > 0
        ? Math.max.apply(null, scoresOnly) - Math.min.apply(null, scoresOnly)
        : 0;
    var isSmall = churchSize === "10" || churchSize === "100";
    var lightLoad = isSmall
      ? "（微型／小型堂會：一次只推 1 個小改變，寧可双月檢視，勿列長工單。）"
      : "";

    var zoneLabel = function (sc) {
      if (sc < maxDim * 0.45) return "需優先關注";
      if (sc < maxDim * 0.58) return "邊際區";
      return "可微調";
    };

    var out = [];

    out.push({
      type: "strength",
      title: "優先焦點 1：守住並深化「" + best.name + "」",
      problem:
        "此範疇相對較穩（約 " +
        best.score +
        "/" +
        maxDim +
        "）。若不刻意守住，資源常被拉去救火弱項，強項團隊反而被掏空或長期一人扛。",
      direction:
        "請先對照本報告下方「" +
        best.name +
        "」一節的「改善建議」，從中選 1–2 條作為本季要守住的具體做法；每季用約 20 分鐘向核心同工覆盤是否仍在軌。" +
        lightLoad,
      fruit: "強項成為可複製的支點，而不是被無限加線的「萬用插座」。",
      risk: "負責人沒有替補與界線時，強項也會變成隱性瓶頸。"
    });

    out.push({
      type: "weakness",
      title: "優先焦點 2：對焦「" + worst.name + "」",
      problem:
        zoneLabel(worst.score) +
        "：「" +
        worst.name +
        "」約 " +
        worst.score +
        "/" +
        maxDim +
        "。（解讀與下方該節「現況診斷」同一套分區，請兩處一起讀。）",
      direction:
        "請對照下方「" +
        worst.name +
        "」的「改善建議」，禱告後在 6–8 週內只試「一個」可觀察的小改變（跟進節奏、說明方式或替補人選之一）。" +
        (isSmall ? " 避免同時大改兩條事工線。" : " 可安排弱項與強項團隊各一位配對禱告與跟進。"),
      fruit: "會眾能具體說出哪裡不一樣，而不只是「我們更忙了」。",
      risk: "若只開會不調整節奏，破口會長期吸走全堂注意力。"
    });

    var govTitle =
      spread > maxDim * 0.35
        ? "優先焦點 3：節奏與治理（縮小八維落差）"
        : "優先焦點 3：節奏與治理（維持對齊）";
    out.push({
      type: "governance",
      title: govTitle,
      problem:
        "八維分數差距約 " +
        spread.toFixed(0) +
        " 分" +
        (spread > maxDim * 0.35
          ? "：會眾體感容易「有的線很好、有的線很亂」，決策也難排先後。"
          : "：整體尚算均衡，仍要預防靠少數人硬撐或部門各說各話。"),
      direction:
        (isSmall
          ? "長執／核心同工每月一次約 45 分鐘：白板上只寫「本季停什麼、誰替補、下次檢核日」，並點名下方連續偏低的 1–2 範疇。"
          : "部門負責人雙月對齊：把人力與資源畫在紙上，對照下方各範疇得分，避免活動表取代牧養優先。") + lightLoad,
      fruit: "決策可追溯、節奏可預期，較不容易被突襲式改動消耗信任。",
      risk: "會議過多卻無結論，或只由牧者口頭宣布，都會削弱同行感。"
    });

    return out.slice(0, 3).map(function (item) {
      return Object.assign({}, item, {
        why: item.problem,
        action: item.direction,
        effect: item.fruit
      });
    });
  }

  function healthDiagnosisLine(catName, score, churchSize) {
    var s = Number(score) || 0;
    var n = catName || "此範疇";
    var maxD = 65;
    var small = churchSize === "10" || churchSize === "100";
    var pre =
      small
        ? "【小型堂會語境】同工常身兼多職，"
        : "【中大型語境】部門較多、溝通鏈較長，";
    if (s < maxD * 0.45)
      return (
        pre +
        "「" +
        n +
        "」呈現明顯張力：宜盡快在禱告中辨認主因，並暫停非必要的活動擴張；勿期待用大型教會的全職編制解小型堂的問題。"
      );
    if (s < maxD * 0.58)
      return (
        pre +
        "「" +
        n +
        "」偏弱：未必是沒有做，更常是路徑不清、替補不足或節奏過滿，導致體驗不穩定。"
      );
    if (s < maxD * 0.68)
      return (
        (small ? "【小型堂會】" : "") +
        "「" +
        n +
        "」屬邊際健康：若長期停在此，" +
        (small ? "少數同工會被透支。" : "跨部協調成本會升高。")
      );
    if (s < maxD * 0.78)
      return (
        "「" +
        n +
        "」大致穩定：可選 1–2 個小點加深，" +
        (small ? "避免同時新增多個新聚會。" : "並檢視是否與其他部門資源衝突。")
      );
    return (
      "「" +
      n +
      "」是現階段資產：" +
      (small
        ? "仍要避免「會做的都找他」，預備替補與安息。"
        : "可帶動其他範疇，但要制度化授權與接班。")
    );
  }

  function healthActionTips(catName, score, churchSize) {
    var s = Number(score) || 0;
    var bank = {
      佈道: [
        "建立「新朋友 24–48 小時內」的問安與跟進節奏（簡訊亦可）",
        "每季一次「自然布道」見證時段，由會友分享而非牧師獨講",
        "為陪讀／陪走友誼設計「不尷尬」的邀請語與聚會入口",
        "檢視禮拜與活動文宣是否對未信者友善（用語、長度、下一步）"
      ],
      門徒訓練: [
        "把「下一步」寫成一張小卡（靈修、小組、服事）讓會友帶回家",
        "導師／小組長半年內接受一次「聆聽與帶領」退修或工作坊",
        "主日信息固定一段「本週操練」連結門訓主題",
        "為青少年／兒童父母提供同步門訓資源，避免世代脫節"
      ],
      團契: [
        "小組聚會預留「生活分享與代禱」而非只有查經進度",
        "衝突發生時，先依「私下—兩三人—教會」路徑，再談事工調整",
        "檢視新人是否在三個月內被邀請進入一個關係圈",
        "避免同一批人長期過載：輪值與安息週"
      ],
      "宣教/服事": [
        "服事前先對齊「為何做」與「誰被牧養」，避免只填人力缺囗",
        "本地與跨文化事工各指定一位禱告與回報窗口",
        "慈惠與門訓連線：受助者也被邀進成長路徑",
        "半年檢視一次服事名單與替補"
      ],
      崇拜: [
        "確認主日信息與禱告、奉獻的連貫，強調「回應」而非表演",
        "為初來者預備短版程序單與「今天可期待什麼」",
        "音響與投影以「聽得清楚、看得懂」為優先",
        "節期與聖礼儀式提前溝通，減少會友困惑"
      ],
      領導力: [
        "長執會議公開「本季三件決策與理由」摘要給同工",
        "重大決策前後預留禱告與諮詢期，避免突襲式通知",
        "書面記錄繼任與授權進度（不必公開細節，但要可追溯）",
        "關懷牧者／主任同工的家庭與休息，列入領袖議程"
      ],
      管家職分: [
        "年報或季報用圖表說明奉獻用途，強調感恩而非募款壓力",
        "預備六個月應急金與設施維護線，避免臨時斷糧",
        "奉獻與門訓連結：教導聖經中的管家觀",
        "印刷與網路形象一致、誠實，反映教會價值"
      ],
      人際關係: [
        "衝突後跟進「修復步驟」而非只停在不來往",
        "肯定與鼓勵的公開表達多於糾錯",
        "為新家庭與單身者設計不同連結點，避免單一模式",
        "領袖先示範認錯與饒恕，再談制度"
      ]
    };
    var key = catName;
    var tips = bank[key] || bank[trim(catName)] || [
      "訂定 6–8 週小目標並指定負責人",
      "與核心團隊禱告後再調整節奏",
      "向會眾說明「為何改變」與「如何參與」",
      "記錄學習，供下一季對照"
    ];
    var small = churchSize === "10" || churchSize === "100";
    var preTips = small
      ? [
          "（小型）先寫下「固定服事核心同工」名單與每人線數，避免同一人扛三線以上",
          "（小型）新嘗試優先併入主日／現有聚會時段"
        ]
      : [];
    var maxD = 65;
    var merged = preTips.concat(tips);
    if (s < maxD * 0.45) return merged.slice(0, 4);
    if (s < maxD * 0.58)
      return [
        merged[0],
        merged[2] || merged[1],
        merged[1],
        merged[3] || tips[2]
      ];
    return [
      tips[0],
      tips[1],
      small ? "維持穩定：寧可少而深，勿為報告數字硬衝" : "維持穩定並選小處加深",
      "鼓勵跨範疇彼此代禱與資源銜接"
    ];
  }

  /**
   * 戰略報告「Before You Plan」：與各範疇現況診斷共用同一套分數敘事，引導 S/W/O/T 反省（非代下結論）。
   */
  function beforeYouPlanHealth(ctx) {
    var catScores = ctx.catScores || [];
    var categoryNames = ctx.categoryNames || [];
    var churchSize = ctx.churchSize;
    var overallScore = ctx.overallScore != null ? ctx.overallScore : "—";
    var healthLabel = ctx.healthLabel || "";
    var maxD = 65;
    var scored = catScores.map(function (s, i) {
      return {
        name: categoryNames[i] || "範疇" + (i + 1),
        score: Number(s) || 0
      };
    });
    if (!scored.length) {
      return {
        s: {
          title: "S｜我要繼續做什麼？（Strengths）",
          body: "尚未有足夠分數資料，請先完成八個範疇問卷。"
        },
        w: {
          title: "W｜我不要再／需要少做什麼？（Weaknesses）",
          body: "—"
        },
        o: {
          title: "O｜我可以做什麼新的？（Opportunities）",
          body: "—"
        },
        t: {
          title: "T｜我要提防什麼？（Threats）",
          body: "—"
        },
        closing:
          "請牧者與核心團隊一起禱告分辨，圈出對你們處境最真實的 1–2 點即可。",
        bridge:
          "接下來請把最有共鳴的重點帶到《教會版 SWOT》整理內外局勢，再落到 SMART 目標與 PDCA 行動。",
        shareSnippet:
          "請完成八範疇問卷以產生與下方各節一致的戰略摘要。"
      };
    }
    var asc = scored.slice().sort(function (a, b) {
      return a.score - b.score;
    });
    var desc = scored.slice().sort(function (a, b) {
      return b.score - a.score;
    });
    var worst = asc[0];
    var worst2 = asc[1] || worst;
    var best = desc[0];
    var best2 = desc[1] || best;
    var spread =
      scored.length > 0
        ? Math.max.apply(
            null,
            scored.map(function (x) {
              return x.score;
            })
          ) -
          Math.min.apply(
            null,
            scored.map(function (x) {
              return x.score;
            })
          )
        : 0;
    var small = churchSize === "10" || churchSize === "100";

    var sBody;
    if (best.score < maxD * 0.5) {
      sBody =
        "整體分數仍偏緊，但相對較穩的是「" +
        best.name +
        "」（約 " +
        best.score +
        "/" +
        maxD +
        "）。建議先把「只做兩件、做到可複製」當原則，避免八個範疇平均用力；可對照下方該節的起步建議，選最小而具體的堅持點。";
    } else {
      sBody =
        "目前有較明顯支點：「" +
        best.name +
        "」（約 " +
        best.score +
        "/" +
        maxD +
        "）與「" +
        best2.name +
        "」。代表這裡的流程、默契或節奏較可預期。下一步不是再加更多活動，而是把做法寫清楚、把人練起來，讓強項成為其他範疇可以借力的槓桿（與下方這兩節的「改善建議」對齊挑選）。";
    }

    var wLine = healthDiagnosisLine(worst.name, worst.score, churchSize);
    var wBody =
      "建議先把注意力放在「" +
      worst.name +
      "」（約 " +
      worst.score +
      "/" +
      maxD +
      "）。「現況診斷」段落已用同一分數區間說明： " +
      wLine +
      " 若「" +
      worst2.name +
      "」也偏低，請避免同時大改兩條線；可先鎖定最缺口的一處，另一處以「減傷、穩節奏」為主。";

    var midIdx = Math.floor(scored.length / 2);
    var mid = scored.slice().sort(function (a, b) {
      return a.score - b.score;
    })[midIdx];
    var oBody =
      "「" +
      mid.name +
      "」目前落在中段，常適合作為槓桿點：不必一次衝頂標，但只要補上「說清楚、跟得到、有人替補」其中一環，整體感受往往就能上移。也可問：能否用「" +
      best.name +
      "」的強項去支撐「" +
      worst.name +
      "」最卡的一點？具體起步仍請以該節下方的建議清單為材，挑一項試行。";

    var tBody =
      spread > maxD * 0.35
        ? "八維落差約 " +
          spread.toFixed(0) +
          " 分：會眾體感容易「有的線很棒、有的線很忙很亂」。若會議與決策節奏不先講清楚，弱線會長期吸走全村救火，強線同工也會被模糊期待拖垮。"
        : "落差不算極端，仍要提防「看起來都及格」其實是少數人硬撐。" +
          (small
            ? " 小型堂會尤忌同工一人多線長期不停；要提防身心耗盡與隱性退出。"
            : " 中大型要提防部門各說各話、資源與說法不一致，溝通成本默默上升。");

    var closing =
      "以上四段是引導反省，不是替貴堂下結論。請牧者與核心團隊禱告分辨，圈出最真實的 1–2 點即可。";

    var bridge =
      "請將最有共鳴的 S/W/O/T 重點帶入《教會版 SWOT》整理成清楚的內外局勢，再轉為 SMART 可驗收目標與 PDCA 行動與檢核。";

    var shareSnippet =
      "均分 " +
      overallScore +
      "（" +
      healthLabel +
      "），最需留意「" +
      worst.name +
      "」。下一步：" +
      bridge;

    return {
      s: {
        title: "S｜我要繼續做什麼？（Strengths）",
        body: sBody
      },
      w: {
        title: "W｜我不要再／需要少做什麼？（Weaknesses）",
        body: wBody
      },
      o: {
        title: "O｜我可以做什麼新的？（Opportunities）",
        body: oBody
      },
      t: {
        title: "T｜我要提防什麼？（Threats）",
        body: tBody
      },
      closing: closing,
      bridge: bridge,
      shareSnippet: shareSnippet
    };
  }

  function fourSentenceHealth(ctx) {
    if (
      !ctx.catScores ||
      !ctx.categoryNames ||
      !ctx.catScores.length
    ) {
      var overall = ctx.overallScore;
      var worst = ctx.worstCat || "—";
      var ws = ctx.worstScore;
      var label = ctx.healthLabel || "";
      return fourSentenceGeneric({
        tool: "健康診斷",
        current:
          "整體均分約 " +
          (overall != null ? overall : "—") +
          " 分（" +
          label +
          "），目前最需留意的範疇為「" +
          worst +
          "」（" +
          (ws != null ? ws : "—") +
          "/65）。",
        risk:
          "若只看總分、忽略最弱維度，資源可能繼續流向已順手的事工，破口擴大。",
        root:
          "常見張力包括：替補不足、決策節奏不清、或活動量超過承載。",
        next:
          "請完成八範疇後使用完整報告的 Before You Plan 與 SWOT 銜接段落。"
      });
    }
    var b = beforeYouPlanHealth({
      overallScore: ctx.overallScore,
      healthLabel: ctx.healthLabel,
      catScores: ctx.catScores,
      categoryNames: ctx.categoryNames,
      churchSize: ctx.churchSize
    });
    return fourSentenceGeneric({
      tool: "健康診斷",
      current: b.s.body,
      risk: b.t.body,
      root: b.w.body,
      next: b.o.body + " " + b.bridge
    });
  }

  var TOOL_SUITE_TEACHING = {
    health:
      "本頁回答「我們整體健康嗎、哪裡失衡」。完成後，分數與建議會存於本機，供 SWOT／SMART／PDCA 讀取作「前情」。",
    swot:
      "本頁回答「在每個事工範疇，內外局勢如何配對」。請帶著健康診斷的強弱項來寫，避免空泛口號。",
    smart:
      "本頁以「每個事工計畫」填一組 S–T 與 Care 自評與補充，必要時多計畫比較取捨。請連結健康與 SWOT，以關係與可持續為優先，而非單一數字 KPI。",
    pdca:
      "本頁追蹤「做了之後學到什麼」。請對齊某一 SMART 或 SWOT 焦點，記錄事實、落差與下一輪必改的一項。"
  };

  global.ChurchToolkit = {
    trim: trim,
    nonEmpty: nonEmpty,
    fourSentenceGeneric: fourSentenceGeneric,
    fourSentenceSwot: fourSentenceSwot,
    fourSentencePdca: fourSentencePdca,
    fourSentenceSmart: fourSentenceSmart,
    fourSentence8020: fourSentence8020,
    smartAggregateFromPlans: smartAggregateFromPlans,
    fourSentenceHealth: fourSentenceHealth,
    beforeYouPlanHealth: beforeYouPlanHealth,
    shareWhatsApp: shareWhatsApp,
    downloadPdf: downloadPdf,
    renderBarChart: renderBarChart,
    STORAGE_KEYS: STORAGE_KEYS,
    HEALTH_DIM_IDS: HEALTH_DIM_IDS,
    saveHealthProfile: saveHealthProfile,
    loadHealthProfile: loadHealthProfile,
    saveHealthResult: saveHealthResult,
    loadHealthResult: loadHealthResult,
    loadHealthHistory: loadHealthHistory,
    formatHealthOpenContext: formatHealthOpenContext,
    loadSmartState: loadSmartState,
    saveSmartState: saveSmartState,
    appendResolutionLog: appendResolutionLog,
    getSmartFocusLabel: getSmartFocusLabel,
    buildThreeHealthSuggestions: buildThreeHealthSuggestions,
    healthDiagnosisLine: healthDiagnosisLine,
    healthActionTips: healthActionTips,
    TOOL_SUITE_TEACHING: TOOL_SUITE_TEACHING
  };
})(typeof window !== "undefined" ? window : this);
