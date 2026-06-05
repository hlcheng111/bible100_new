/**
 * 長期計劃 Step 0～3 · 前端資料管線（暫存 localStorage）
 * =============================================================================
 * 之後對應 Supabase（主鍵建議含 church_id + plan_year 或 plan_cycle_id）：
 *   longTermPlanning_step0     → 表 church_planning_step0
 *   longTermPlanning_theology → 表 church_planning_theology
 *   longTermPlanning_surveys  → 表 church_planning_surveys
 *   longTermPlanning_summary  → 表 church_planning_summary
 *   longTermPlanning_swot     → 表 church_planning_swot
 *   longTermPlanning_goals    → 表 church_planning_goals
 *
 * 消費端（讀取／匯總效果）：
 *   · swot.html：讀 step0 + summary；寫 swot
 *   · goals.html：讀 swot + theology；寫 goals
 *   · strategy.html / 未來 swot.html：Step0 里程碑＋健康分數 → SWOT 側欄「現況摘要」
 *   · goals.html：theology 核心價值 → 目標「對齊主軸」下拉
 *   · ai-summary.html：theology → AI 護欄對齊使命；summary → 會議素材
 *   · dashboard.html：多年度 step0.healthScores → 折線／雷達趨勢（未來）
 * =============================================================================
 */
(function (global) {
  function storageGet(key) {
    try {
      if (global.PersistenceProvider && typeof global.PersistenceProvider.getInstance === "function") {
        return global.PersistenceProvider.getInstance().getItem(key);
      }
    } catch (e) {}
    return localStorage.getItem(key);
  }

  function storageSet(key, value) {
    try {
      if (global.PersistenceProvider && typeof global.PersistenceProvider.getInstance === "function") {
        global.PersistenceProvider.getInstance().setItem(key, value);
        return;
      }
    } catch (e) {}
    localStorage.setItem(key, value);
  }

  function getChurchId() {
    try {
      if (global.CURRENT_CHURCH_ID) return String(global.CURRENT_CHURCH_ID).trim();
      if (global.location && global.location.search) {
        var params = new URLSearchParams(global.location.search);
        var q = params.get("church_id");
        if (q && String(q).trim()) return String(q).trim();
      }
    } catch (e) {}
    return "default";
  }

  function keyWithNamespace(baseKey) {
    return "chp2026_" + getChurchId() + "_" + baseKey;
  }

  var BASE_KEYS = {
    STEP0: "longTermPlanning_step0",
    THEOLOGY: "longTermPlanning_theology",
    SURVEYS: "longTermPlanning_surveys",
    SUMMARY: "longTermPlanning_summary",
    SWOT: "longTermPlanning_swot",
    GOALS: "longTermPlanning_goals",
  };

  function resolveKeyCandidates(baseKey) {
    return [keyWithNamespace(baseKey), baseKey];
  }

  function readStore(baseKey) {
    var candidates = resolveKeyCandidates(baseKey);
    for (var i = 0; i < candidates.length; i++) {
      var raw = storageGet(candidates[i]);
      if (raw) return raw;
    }
    return null;
  }

  function writeStore(baseKey, value) {
    storageSet(keyWithNamespace(baseKey), value);
  }

  var KEYS = {
    get STEP0() {
      return keyWithNamespace(BASE_KEYS.STEP0);
    },
    get THEOLOGY() {
      return keyWithNamespace(BASE_KEYS.THEOLOGY);
    },
    get SURVEYS() {
      return keyWithNamespace(BASE_KEYS.SURVEYS);
    },
    get SUMMARY() {
      return keyWithNamespace(BASE_KEYS.SUMMARY);
    },
    get SWOT() {
      return keyWithNamespace(BASE_KEYS.SWOT);
    },
    get GOALS() {
      return keyWithNamespace(BASE_KEYS.GOALS);
    },
    base: BASE_KEYS,
  };

  function safeParse(json, fallback) {
    try {
      return json ? JSON.parse(json) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function defaultStep0() {
    return {
      version: 1,
      milestones: [
        { year: "", event: "", spiritualMeaning: "" },
        { year: "", event: "", spiritualMeaning: "" },
        { year: "", event: "", spiritualMeaning: "" },
      ],
      pastorReflection: "",
      /** 1–5：主觀自評，之後儀表板可做雷達圖、年度對照 */
      healthScores: {
        leadership: 3,
        mission: 3,
        finance: 3,
        culture: 3,
        tech: 3,
        worship: 3,
        fellowship: 3,
        discipleship: 3,
        evangelism: 3,
      },
      updatedAt: null,
    };
  }

  function defaultTheology() {
    return {
      version: 1,
      greatCommandment: "",
      greatCommission: "",
      seasonalCall: "",
      missionStatement: "",
      visionStatement: "",
      coreValues: "",
      updatedAt: null,
    };
  }

  function defaultSurveys() {
    return {
      version: 1,
      publicUrl: "",
      leadersUrl: "",
      updatedAt: null,
    };
  }

  function defaultSummary() {
    return {
      version: 1,
      rawText: "",
      summaryBullets: [],
      generatedAt: null,
      model: "demo-local",
      /** H1：整理結果的證據強度（給計劃主線與會議用） */
      evidenceLevel: "hypothesis",
      /** H3：誰在何時跟進（自由文字） */
      accountabilityNote: "",
    };
  }

  /** 單一 SWOT 項目：id, text, sourceRef = step0 | step3 | free */
  function defaultSwot() {
    return {
      version: 1,
      items: { S: [], W: [], O: [], T: [] },
      updatedAt: null,
    };
  }

  function defaultGoals() {
    return {
      version: 1,
      goals: [],
      updatedAt: null,
    };
  }

  function loadStep0() {
    var d = safeParse(readStore(BASE_KEYS.STEP0), null);
    if (!d || typeof d !== "object") return defaultStep0();
    var def = defaultStep0();
    d.milestones = Array.isArray(d.milestones) ? d.milestones : def.milestones;
    d.healthScores = Object.assign({}, def.healthScores, d.healthScores || {});
    if (d.pastorReflection === undefined) d.pastorReflection = "";
    return d;
  }

  function saveStep0(data) {
    var prev = loadStep0();
    var merged = Object.assign({}, prev, data);
    merged.updatedAt = nowIso();
    writeStore(BASE_KEYS.STEP0, JSON.stringify(merged));
    return merged;
  }

  function loadTheology() {
    var d = safeParse(readStore(BASE_KEYS.THEOLOGY), null);
    if (!d || typeof d !== "object") return defaultTheology();
    return Object.assign(defaultTheology(), d);
  }

  function saveTheology(data) {
    var prev = loadTheology();
    var merged = Object.assign({}, prev, data);
    merged.updatedAt = nowIso();
    writeStore(BASE_KEYS.THEOLOGY, JSON.stringify(merged));
    return merged;
  }

  function loadSurveys() {
    var d = safeParse(readStore(BASE_KEYS.SURVEYS), null);
    if (!d || typeof d !== "object") return defaultSurveys();
    return Object.assign(defaultSurveys(), d);
  }

  function saveSurveys(data) {
    var prev = loadSurveys();
    var merged = Object.assign({}, prev, data);
    merged.updatedAt = nowIso();
    writeStore(BASE_KEYS.SURVEYS, JSON.stringify(merged));
    return merged;
  }

  function loadSummary() {
    var d = safeParse(readStore(BASE_KEYS.SUMMARY), null);
    if (!d || typeof d !== "object") return defaultSummary();
    return Object.assign(defaultSummary(), d);
  }

  function saveSummary(data) {
    var prev = loadSummary();
    var merged = Object.assign({}, prev, data);
    if (merged.summaryBullets && merged.summaryBullets.length) {
      merged.generatedAt = nowIso();
    }
    writeStore(BASE_KEYS.SUMMARY, JSON.stringify(merged));
    return merged;
  }

  /** 給 swot.html：Step0 摘要（里程碑最近幾筆＋健康分數＋反思節錄） */
  function getStep0SnapshotForSwot() {
    var s = loadStep0();
    var filled = s.milestones.filter(function (m) {
      return (m.event || "").trim() || (m.year || "").trim();
    });
    return {
      milestoneCount: filled.length,
      recentMilestones: filled.slice(-5),
      healthScores: s.healthScores,
      reflectionPreview: (s.pastorReflection || "").slice(0, 200),
    };
  }

  function loadSwot() {
    var d = safeParse(readStore(BASE_KEYS.SWOT), null);
    if (!d || typeof d !== "object") return defaultSwot();
    var def = defaultSwot();
    d.items = d.items && typeof d.items === "object" ? d.items : def.items;
    ["S", "W", "O", "T"].forEach(function (q) {
      if (!Array.isArray(d.items[q])) d.items[q] = [];
    });
    return d;
  }

  function saveSwot(data) {
    var prev = loadSwot();
    var merged = Object.assign({}, prev, data);
    merged.items = data.items || prev.items;
    merged.updatedAt = nowIso();
    writeStore(BASE_KEYS.SWOT, JSON.stringify(merged));
    return merged;
  }

  /** 看板／儀表板：目標狀態（存在 longTermPlanning_goals.goals[].status） */
  var GOAL_STATUS_ORDER = ["backlog", "this_year", "in_progress", "done"];

  function normalizeGoal(g) {
    if (!g || typeof g !== "object") return g;
    if (!g.status || GOAL_STATUS_ORDER.indexOf(g.status) < 0) {
      g.status = "backlog";
    }
    return g;
  }

  function loadGoals() {
    var d = safeParse(readStore(BASE_KEYS.GOALS), null);
    if (!d || typeof d !== "object") return defaultGoals();
    var def = defaultGoals();
    d.goals = Array.isArray(d.goals) ? d.goals.map(normalizeGoal) : def.goals;
    return d;
  }

  function saveGoals(data) {
    var prev = loadGoals();
    var merged = Object.assign({}, prev, data);
    var list = data.goals != null ? data.goals : prev.goals;
    merged.goals = Array.isArray(list) ? list.map(normalizeGoal) : prev.goals;
    merged.updatedAt = nowIso();
    writeStore(BASE_KEYS.GOALS, JSON.stringify(merged));
    try {
      if (global.ChurchDataBridge && typeof global.ChurchDataBridge.onGoalsUpdated === "function") {
        global.ChurchDataBridge.onGoalsUpdated(merged.goals, {
          churchId: getChurchId(),
          key: KEYS.GOALS,
          updatedAt: merged.updatedAt,
        });
      }
    } catch (e) {}
    return merged;
  }

  /**
   * 示範教會資料（僅供開發）
   * ---------------------------------------------------------------------------
   * · 任何頁面皆不綁定按鈕；若需測試，請在瀏覽器主控台手動執行：
   *   LongTermPipeline.loadDemoData()
   * · 會覆蓋本機 localStorage 管線鍵；上雲後請改後端 seed 或移除。
   * ---------------------------------------------------------------------------
   */
  function loadDemoData() {
    var iso = nowIso();
    var SW = {
      S: [
        { id: "demo-sw-s1", text: "長執團隊穩定、願意禱告同行", sourceRef: "step0" },
        { id: "demo-sw-s2", text: "主日敬拜與兒童主日學有固定同工", sourceRef: "step3" },
        { id: "demo-sw-s3", text: "與鄰近學校曾有合作經驗", sourceRef: "free" },
      ],
      W: [
        { id: "demo-sw-w1", text: "青年與職青參與度偏低", sourceRef: "step3" },
        { id: "demo-sw-w2", text: "文書與資料數位化不足", sourceRef: "free" },
      ],
      O: [
        { id: "demo-sw-o1", text: "社區新家庭移入、鄰里活動需求增加", sourceRef: "step3" },
        { id: "demo-sw-o2", text: "線上直播與小組工具成熟，可擴大接觸", sourceRef: "free" },
        { id: "demo-sw-o3", text: "可連結區會青年事工資源", sourceRef: "free" },
      ],
      T: [
        { id: "demo-sw-t1", text: "會友工時長、志工疲勞", sourceRef: "step3" },
        { id: "demo-sw-t2", text: "附近同質團體競爭注意力", sourceRef: "free" },
      ],
    };

    storageSet(
      KEYS.STEP0,
      JSON.stringify({
        version: 1,
        milestones: [
          { year: "2018", event: "新堂啟用，定根社區", spiritualMeaning: "學習以堂會為家、接待鄰舍。" },
          { year: "2020", event: "疫情中轉為線上聚會與關懷", spiritualMeaning: "在限制中經歷同在與牧養創新。" },
          { year: "2022", event: "成立職青小組與家庭事工", spiritualMeaning: "承認不同世代的需要並同行。" },
          { year: "2024", event: "首次辦社區親子日", spiritualMeaning: "踏出圍牆、與社區建立信任。" },
          { year: "2025", event: "長執會通過三年方向草案", spiritualMeaning: "在禱告中對齊異象與優先順序。" },
        ],
        pastorReflection:
          "示範：我們是一群蒙召在這城區作鹽作光的人；接下來一年願意在禱告與門訓上多走一步。",
        healthScores: {
          leadership: 4,
          mission: 4,
          finance: 3,
          culture: 3,
          tech: 2,
          worship: 4,
          fellowship: 3,
          discipleship: 3,
          evangelism: 3,
        },
        updatedAt: iso,
      })
    );

    storageSet(
      KEYS.THEOLOGY,
      JSON.stringify({
        version: 1,
        greatCommandment: "全心愛神、愛人如己，在敬拜、相交與使命中活出來。",
        greatCommission: "在本城使人作門徒，從洗禮到教導凡主所吩咐的。",
        seasonalCall: "這一季特別留意家庭與下一代、以及與社區鄰舍的關係。",
        missionStatement: "我們是一群蒙召在____社區敬拜上帝、彼此建立、服事世界的子民。",
        visionStatement: "五年內成為一間禱告敬拜有活力、家庭與青年被建立、並與社區有穩定連結的教會。",
        coreValues: "敬拜與禱告文化、家庭與下一代、社區關懷、誠實合一",
        updatedAt: iso,
      })
    );

    storageSet(
      KEYS.SURVEYS,
      JSON.stringify({
        version: 1,
        publicUrl: "https://forms.example.org/demo-congregation",
        leadersUrl: "https://forms.example.org/demo-leaders",
        updatedAt: iso,
      })
    );

    storageSet(
      KEYS.SUMMARY,
      JSON.stringify({
        version: 1,
        rawText: "（示範）會眾關心：青年參與、家庭支持、社區形象；領袖關心：人力與財務穩健。",
        summaryBullets: [
          "多數會眾期待更有節奏的禱告與小組生活。",
          "青年與職青需要清楚的下一步（門訓／服事入口）。",
          "社區活動獲正面回饋，可考慮常態化一季一次。",
          "文書與資料整理是跨部門共同痛點，適合列為支援型目標。",
        ],
        generatedAt: iso,
        model: "demo-seed",
      })
    );

    storageSet(
      KEYS.SWOT,
      JSON.stringify({
        version: 1,
        items: SW,
        updatedAt: iso,
      })
    );

    storageSet(
      KEYS.GOALS,
      JSON.stringify({
        version: 1,
        goals: [
          {
            id: "demo-g-1",
            title: "建立每季一次全教會禱告會（含職青時段）",
            description: "回應會眾對禱告節奏的期待，並連結職青參與。",
            visionAxis: "敬拜與禱告文化",
            status: "this_year",
            smart: {
              s: "每季一次、週五晚、全教會＋職青分組",
              m: "每季至少 40 人參與，會後回收回饋表",
              a: "現有敬拜與牧養團隊輪值",
              r: "對齊使命主軸「敬拜與禱告文化」",
              t: "本年度內完成四季",
            },
            swotRef: { quadrant: "W", itemId: "demo-sw-w1" },
          },
          {
            id: "demo-g-2",
            title: "與鄰近學校合辦兩次週末親子體驗",
            description: "延續社區親子日經驗，深化學校關係。",
            visionAxis: "社區關懷",
            status: "in_progress",
            smart: {
              s: "兩次週六下午、遊戲＋短信息",
              m: "每次報名家庭數與新面孔比例",
              a: "執事會已同意預算與人力",
              r: "呼應大使命與社區關懷主軸",
              t: "學年度內完成",
            },
            swotRef: { quadrant: "O", itemId: "demo-sw-o1" },
          },
          {
            id: "demo-g-3",
            title: "完成長執資料數位化（通訊錄＋會議紀錄範本）",
            description: "減輕文書負擔，利於交接與追蹤。",
            visionAxis: "誠實合一",
            status: "done",
            smart: {
              s: "採共用雲端資料夾＋固定範本",
              m: "長執通訊錄 100% 上線、每次會議紀錄 7 日內上傳",
              a: "指定一位文書同工維護",
              r: "支撐治理與透明度",
              t: "上季已試行，本季結案",
            },
            swotRef: { quadrant: "W", itemId: "demo-sw-w2" },
          },
          {
            id: "demo-g-4",
            title: "試辦「青年晚禱＋職場分享」每月兩次",
            description: "小步實驗青年參與模式。",
            visionAxis: "家庭與下一代",
            status: "backlog",
            smart: {
              s: "每月第一、三週五晚",
              m: "出席人數與一次訪談回饋",
              a: "先以 3 位青年領袖帶領",
              r: "回應 SWOT 青年參與議題",
              t: "下半年評估是否升級為年度目標",
            },
            swotRef: null,
          },
          {
            id: "demo-g-5",
            title: "訂定宣教奉獻與代禱名單公開節奏",
            description: "強化與區會／宣教夥伴的連結。",
            visionAxis: "敬拜與禱告文化",
            status: "backlog",
            smart: {
              s: "每季更新代禱名單、主日公禱一次",
              m: "奉獻達標與代禱事項回覆率",
              a: "財務與宣教組協作",
              r: "大使命中的差派意識",
              t: "明年起常態化",
            },
            swotRef: { quadrant: "O", itemId: "demo-sw-o3" },
          },
        ],
        updatedAt: iso,
      })
    );

    return true;
  }

  /** goals.html：扁平列出 SWOT 項目供「引用」下拉 */
  function getSwotItemsFlat() {
    var sw = loadSwot();
    var out = [];
    ["S", "W", "O", "T"].forEach(function (q) {
      (sw.items[q] || []).forEach(function (it) {
        if (!it || !it.id) return;
        var t = (it.text || "").trim();
        out.push({
          quadrant: q,
          id: it.id,
          text: t,
          label: "[" + q + "] " + (t.length > 36 ? t.slice(0, 36) + "…" : t),
        });
      });
    });
    return out;
  }

  function validateGoalRefs() {
    var swFlat = getSwotItemsFlat();
    var idMap = {};
    swFlat.forEach(function (it) {
      if (it && it.id) idMap[it.id] = it;
    });
    var state = loadGoals();
    return (state.goals || []).map(function (g) {
      var out = Object.assign({}, g);
      out._isOrphaned = false;
      out._orphanReason = "";
      if (out && out.swotRef && out.swotRef.itemId) {
        var hit = idMap[out.swotRef.itemId];
        if (!hit) {
          out._isOrphaned = true;
          out._orphanReason = "missing_swot_item";
        } else if (
          out.swotRef.quadrant &&
          String(out.swotRef.quadrant).toUpperCase() !== String(hit.quadrant || "").toUpperCase()
        ) {
          out._isOrphaned = true;
          out._orphanReason = "quadrant_mismatch";
        }
      }
      return out;
    });
  }

  /** 給未來 goals 頁：從神學欄位拆出主軸選項（暫用整段 coreValues） */
  function getVisionAxisOptions() {
    var t = loadTheology();
    var raw = (t.coreValues || "").trim();
    if (!raw) return [];
    return raw
      .split(/[,，、\n]/)
      .map(function (x) {
        return x.trim();
      })
      .filter(Boolean)
      .slice(0, 12);
  }

  function goalStatusLabel(key) {
    var map = {
      backlog: "候選／待考慮",
      this_year: "本年度目標",
      in_progress: "進行中",
      done: "已完成",
    };
    return map[key] || key;
  }

  /**
   * P1/P2：SWOT→SMART→看板 斷鏈與規則提醒（L1/L2）
   * P4 註：longTermPlanning_* 與 chp2026-* 可能並存，見回傳 pdcaNote。
   */
  function analyzePlanningChain() {
    var sw = loadSwot();
    var goalsState = loadGoals();
    var sum = loadSummary();
    var l1 = [];
    var l2 = [];

    function swotFilledCount() {
      var n = 0;
      ["S", "W", "O", "T"].forEach(function (q) {
        (sw.items[q] || []).forEach(function (it) {
          if (it && String(it.text || "").trim()) n++;
        });
      });
      return n;
    }

    var swN = swotFilledCount();
    if (swN === 0) {
      l1.push({
        step: "SWOT",
        msg: "尚無有效 SWOT 條目（四象限皆空或僅占位）",
        href: "swot.html",
      });
    }

    var gList = goalsState.goals || [];
    if (!gList.length) {
      l1.push({ step: "SMART", msg: "尚未建立 SMART 目標列", href: "goals.html" });
    }

    var titled = gList.filter(function (g) {
      return g && String(g.title || "").trim();
    });
    var withT = titled.filter(function (g) {
      return g.smart && String(g.smart.t || "").trim();
    });
    if (titled.length && withT.length < titled.length) {
      l2.push({
        rule: "P2",
        msg: "部分目標缺少 SMART 的 T（時限）— 可問責性不足",
        href: "goals.html",
      });
    }

    var activeBoard = gList.filter(function (g) {
      var st = g.status || "backlog";
      return st === "this_year" || st === "in_progress";
    });
    if (gList.length && !activeBoard.length) {
      l2.push({
        rule: "P2",
        msg: "看板上無「本年度／進行中」卡片— 執行鏈可能停在候選",
        href: "kanban.html",
      });
    }

    var noSwotRef = titled.filter(function (g) {
      return !g.swotRef;
    }).length;
    if (titled.length >= 2 && noSwotRef >= Math.ceil(titled.length / 2)) {
      l2.push({
        rule: "P2",
        msg: "多數目標未連結 SWOT 條目— 策略對應可能斷裂",
        href: "goals.html",
      });
    }

    var orphaned = validateGoalRefs().filter(function (g) {
      return g && g._isOrphaned;
    });
    if (orphaned.length) {
      l2.push({
        rule: "P2",
        msg: "偵測到 " + orphaned.length + " 筆目標 SWOT 參照失效（ORPHANED_REF）",
        href: "goals.html",
      });
    }

    var pdcaRaw = null;
    try {
      pdcaRaw = storageGet("chp2026-pdca-log") || storageGet("chp2026-pdca-v1");
    } catch (e) {
      pdcaRaw = null;
    }
    var pdcaNote = pdcaRaw
      ? "已偵測本機 chp2026 PDCA 資料；與 longTermPlanning_* 管線可能為雙軌，遷移請依 DATA_CONTRACT／主線決策。"
      : "尚未偵測 chp2026 PDCA；若已用獨立頁填寫，請確認與本流程目標對齊。";

    var meetingBullets = [];
    if (sum.summaryBullets && sum.summaryBullets.length) {
      sum.summaryBullets.slice(0, 3).forEach(function (b) {
        meetingBullets.push("• " + String(b).trim());
      });
    }
    gList
      .filter(function (g) {
        return (g.status || "") === "in_progress";
      })
      .slice(0, 2)
      .forEach(function (g) {
        meetingBullets.push("• 進行中目標：" + (g.title || "（無標題）"));
      });
    if (!meetingBullets.length) {
      meetingBullets.push("• （尚無 Step 3 摘要條列與進行中目標— 请先完成 Step 2～3 與 goals）");
    }

    return {
      l1: l1,
      l2: l2,
      meetingBullets: meetingBullets.join("\n"),
      pdcaNote: pdcaNote,
    };
  }

  global.LongTermPipeline = {
    GOAL_STATUS_ORDER: GOAL_STATUS_ORDER,
    goalStatusLabel: goalStatusLabel,
    normalizeGoal: normalizeGoal,
    KEYS: KEYS,
    loadStep0: loadStep0,
    saveStep0: saveStep0,
    loadTheology: loadTheology,
    saveTheology: saveTheology,
    loadSurveys: loadSurveys,
    saveSurveys: saveSurveys,
    loadSummary: loadSummary,
    saveSummary: saveSummary,
    loadSwot: loadSwot,
    saveSwot: saveSwot,
    loadGoals: loadGoals,
    saveGoals: saveGoals,
    loadDemoData: loadDemoData,
    getStep0SnapshotForSwot: getStep0SnapshotForSwot,
    getVisionAxisOptions: getVisionAxisOptions,
    getSwotItemsFlat: getSwotItemsFlat,
    analyzePlanningChain: analyzePlanningChain,
    validateGoalRefs: validateGoalRefs,
    getChurchId: getChurchId,
    keyWithNamespace: keyWithNamespace,
    defaults: {
      step0: defaultStep0,
      theology: defaultTheology,
      surveys: defaultSurveys,
      summary: defaultSummary,
      swot: defaultSwot,
      goals: defaultGoals,
    },
  };
})(
  typeof window !== "undefined" ? window : this
);

/*
 * =============================================================================
 * 【開發者備忘】Supabase 對應草稿（上線時將 load/save 改為 API，欄位可再調）
 * =============================================================================
 *
 * 通用：建議每表含 church_id (uuid FK)、plan_cycle_id 或 plan_year、updated_at。
 *
 * church_planning_step0
 *   milestones jsonb  -- [{ year, event, spiritualMeaning }]
 *   pastor_reflection text
 *   health_scores jsonb  -- { leadership..evangelism: 1-5 }
 *
 * church_planning_theology
 *   great_commandment, great_commission, seasonal_call text
 *   mission_statement, vision_statement, core_values text
 *
 * church_planning_surveys
 *   public_url, leaders_url text
 *
 * church_planning_summary
 *   raw_text text, summary_bullets jsonb, generated_at, model text
 *
 * church_planning_swot
 *   items jsonb  -- { S/W/O/T: [{ id, text, sourceRef }] }
 *
 * church_planning_goals
 *   goals jsonb  -- [{ id, title, description, visionAxis, status, smart, swotRef }]
 *
 * 索引建議：church_id + plan_year；RLS 依 church_id 篩選。
 * =============================================================================
 */
