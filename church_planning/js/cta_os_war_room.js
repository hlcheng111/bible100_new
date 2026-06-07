/**
 * CTA-OS Phase 3 戰情室：多工具 CTV 聚合、跨工具風險、角色配對建議。
 */
(function (global) {
  "use strict";

  var RT = global.CTAOSRuntime;
  var Bridge = global.CTAOSBridge;
  if (!RT || !Bridge) return;

  var TOOL_LINKS = {
    johari: "johari-window-assessment.html",
    shape: "shape-gifts-assessment.html",
    competency: "ministry-competency-assessment.html",
    kpiokr: "kpi-okr-alignment.html",
    urgent: "important-urgent-matrix.html",
    smart: "smart-assessment.html",
    swot: "swot-planning.html",
    pdca: "pdca-planning.html",
    ministry8020: "ministry-8020-planning.html",
    spiritual: "信徒靈性生命健康自我審查.html",
    pastoral: "pastoral-spiritual-survey-pro.html",
    alda: "12 Apostles Leadership Assessment.html",
    raci: "planning/raci-reflection.html",
    ncd: "Church_Health_NCD_planning.html"
  };

  function ctvToGiftScores(vector) {
    function to15(v) {
      return Math.max(1, Math.min(5, 1 + (Number(v) || 0) / 25));
    }
    return {
      teaching: to15(vector.C),
      shepherding: to15(vector.P),
      worship: to15(vector.S),
      administration: to15(vector.G),
      evangelism: to15((vector.G + vector.F) / 2),
      encouragement: to15(vector.R),
      serving: to15((vector.C + vector.R) / 2),
      hospitality: to15(vector.R),
      discernment: to15(vector.F)
    };
  }

  function loadSmRoleDefinitions() {
    var roles = [];
    if (global.DEMO_ROLE_DEFINITIONS && global.DEMO_ROLE_DEFINITIONS.length) {
      roles = roles.concat(global.DEMO_ROLE_DEFINITIONS);
    }
    if (global.SmartMinistryCanonical && typeof global.SmartMinistryCanonical.listMinistriesCatalog === "function") {
      global.SmartMinistryCanonical.listMinistriesCatalog().slice(0, 12).forEach(function (m) {
        var mid = m.ministry_id || m.id || "min";
        var name = m.name || m.title || m.ministry_name || "事工崗位";
        roles.push({
          roleId: "sm_" + mid,
          name: name,
          weights: {
            gifts: {
              teaching: 0.2,
              shepherding: 0.25,
              serving: 0.25,
              administration: 0.15,
              encouragement: 0.15
            }
          }
        });
      });
    }
    if (!roles.length) {
      roles = DEMO_ROLES.map(function (r) {
        return {
          roleId: r.roleId,
          name: r.roleName,
          weights: {
            gifts: {
              teaching: r.required.C / 100,
              shepherding: r.required.P / 100,
              administration: r.required.G / 100,
              serving: r.required.C / 100,
              encouragement: r.required.R / 100,
              evangelism: r.required.G / 100
            }
          }
        };
      });
    }
    return roles;
  }

  var DEMO_ROLES = [
    {
      roleId: "shepherd_coordinator",
      roleName: "牧養協調／小組長",
      required: { P: 72, S: 65, G: 50, C: 55, R: 70, F: 60 }
    },
    {
      roleId: "ministry_admin",
      roleName: "事工行政統籌",
      required: { P: 45, S: 50, G: 75, C: 78, R: 62, F: 65 }
    },
    {
      roleId: "worship_lead",
      roleName: "敬拜主責",
      required: { P: 55, S: 68, G: 48, C: 72, R: 65, F: 70 }
    },
    {
      roleId: "discipleship_trainer",
      roleName: "門訓講師",
      required: { P: 60, S: 70, G: 52, C: 75, R: 58, F: 68 }
    },
    {
      roleId: "missions_catalyst",
      roleName: "差傳推動",
      required: { P: 50, S: 62, G: 78, C: 60, R: 55, F: 72 }
    }
  ];

  /** 六維小白解說（合成分數 = 已掃描各量表平均，非單一問卷） */
  var DIM_LAYMAN = {
    P: {
      nick: "車頭健康度",
      meaning: "牧長與核心同工的靈命、負擔與耗盡風險",
      sources: "主要來自《領袖健康診斷》",
      low: "分數越低，代表同工過勞或耗竭風險越高"
    },
    S: {
      nick: "屬靈根基",
      meaning: "弟兄姊妹讀經、禱告與真實靈命狀態",
      sources: "主要來自《信徒靈命健康自評》",
      low: "分數偏低時，宜先談靈命節奏，再推新目標"
    },
    G: {
      nick: "治理宣教",
      meaning: "異象是否清晰、策略有沒有走偏",
      sources: "主要來自《SWOT 分析》《SMART 目標》",
      low: "分數偏低時，長執宜先對齊異象與資源配置"
    },
    C: {
      nick: "恩賜能力",
      meaning: "同工是否擺對位置、能否發揮恩賜",
      sources: "主要來自《SHAPE 恩賜盤點》《事奉能力評估》",
      low: "分數偏低時，派工前先盤點恩賜與訓練缺口"
    },
    R: {
      nick: "團隊關係",
      meaning: "同工、長執之間是相愛還是充滿張力與盲點",
      sources: "主要來自《Johari 盲點工作桌》《RACI 權責反思》",
      low: "分數偏低時，先修復關係與溝通，再加速執行"
    },
    F: {
      nick: "成形果效",
      meaning: "事工推進進度、有沒有行政卡關或空轉",
      sources: "主要來自《重要 vs 緊急矩陣》《PDCA 循環》",
      low: "分數偏低時，檢查是否「忙緊急、荒重要」"
    }
  };

  var PACK_TOOL_ROWS = [
    { id: "pastoral", packKey: "PastoralPack", fallbackName: "領袖健康診斷" },
    { id: "spiritual", packKey: "SpiritualPack", fallbackName: "信徒靈命自評" }
  ];

  var CRITICAL_FLAGS = { BURNOUT: 1, POWER: 1, LOW_COMPLETION: 1, SPIRITUAL_STAGNATION: 1 };

  function scoreBand(value, hasData) {
    if (!hasData) return { label: "尚無資料", cls: "wr-score-none" };
    var v = Number(value) || 0;
    if (v >= 60) return { label: "大致穩健", cls: "wr-score-ok" };
    if (v >= 45) return { label: "需留意", cls: "wr-score-warn" };
    return { label: "破口明顯", cls: "wr-score-risk" };
  }

  function roleLevelZh(level) {
    var map = {
      trial: "可試任（仍須牧者面談）",
      pastoral_review: "牧者確認後再邀請",
      explore: "可探索、不宜直接派工",
      defer: "暫緩，先補強其他面向"
    };
    return map[level] || level;
  }

  function collectPackAlertFlags() {
    var out = [];
    if (!global.AssessmentRunStore || typeof AssessmentRunStore.loadLatest !== "function") return out;
    PACK_TOOL_ROWS.forEach(function (row) {
      var run = AssessmentRunStore.loadLatest(row.id);
      if (!run || run.is_demo) return;
      var pack = global[row.packKey];
      var toolName =
        (pack && pack.TOOL_LABEL) ||
        (Bridge.TOOL_META && Bridge.TOOL_META[row.id] && Bridge.TOOL_META[row.id].name) ||
        row.fallbackName;
      (run.risk_flags || []).forEach(function (flag) {
        var key = String(flag || "").toUpperCase();
        var desc =
          pack && pack.FLAG_DESCRIPTIONS && (pack.FLAG_DESCRIPTIONS[key] || pack.FLAG_DESCRIPTIONS[flag]);
        out.push({
          level: CRITICAL_FLAGS[key] ? "critical" : "warning",
          kind: "pack",
          message: "【" + toolName + "】" + (desc || key),
          toolId: row.id
        });
      });
    });
    return out;
  }

  function renderDimGrid(composite, hasData) {
    return RT.dimensions
      .map(function (dim) {
        var guide = DIM_LAYMAN[dim] || {};
        var label = RT.dimensionLabels[dim] || dim;
        var score = hasData ? composite[dim] : null;
        var band = scoreBand(score, hasData);
        return (
          '<div class="wr-dim-cell" title="' +
          (guide.sources || "") +
          " · " +
          (guide.low || "") +
          '">' +
          '<div class="wr-dim-letter">' +
          dim +
          " " +
          label +
          "</div>" +
          '<div class="wr-dim-score">' +
          (hasData ? score : "—") +
          "</div>" +
          '<span class="wr-dim-band ' +
          band.cls +
          '">' +
          band.label +
          "</span>" +
          "<div><strong>" +
          (guide.nick || "") +
          "</strong></div>" +
          "<div>" +
          (guide.meaning || "") +
          "</div>" +
          '<div class="wr-note" style="margin-top:4px;">' +
          (guide.sources || "") +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  function weakestDims(composite, n) {
    n = n || 2;
    return RT.dimensions
      .slice()
      .sort(function (a, b) {
        return (composite[a] || 0) - (composite[b] || 0);
      })
      .slice(0, n);
  }

  /** 十字路口：弱維度 → 下一站修復入口 */
  var WEAK_DIM_FIX = {
    P: { label: "補強《領袖健康診斷》", kind: "tool", target: "pastoral" },
    S: { label: "補強《信徒靈命健康自評》", kind: "tool", target: "spiritual" },
    G: { label: "前往步驟 5 · 策略工具箱（SWOT·SMART）", kind: "content", target: "guides/guide_step5_strategy.html" },
    C: { label: "補強 SHAPE 恩賜盤點", kind: "tool", target: "shape" },
    R: { label: "補強 Johari 盲點工作桌", kind: "tool", target: "johari" },
    F: { label: "前往《重要 vs 緊急矩陣》", kind: "tool", target: "urgent" }
  };

  var TABLE_COL_TIPS = {
    tool: "點工具名稱 → 立刻回健康診斷中心裡的原始問卷，重新填寫或按「更新報告」。",
    scores:
      "這份問卷自己算出來的 P-S-G-C-R-F 分數（滿分 100）。用來對比：到底是哪一份工具拉低了全教會總平均。",
    scanned:
      "本機最後一次按「🔍 掃描」的時間。超過 90 天會標「建議更新」——同工與教會狀況可能已變，宜請大家重填。",
    source:
      "assessment_run = 新版自來水管（問卷頁按「更新報告」自動同步）；舊版 log = 以前填的資料，建議回問卷升級。"
  };

  var HUB = {
    assessment: "assessment-os-hub.html",
    strategy: "guides/guide_step5_strategy.html",
    matchmaker: "church_ministry/guide_crm_journey_hub.html?tab=matchmaker",
    dashboard: "dashboard.html"
  };

  function escAttr(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function navClickAttr(kind, target) {
    target = String(target || "");
    if (kind === "root") {
      return "planningOpenRoot(event,'" + target.replace(/'/g, "\\'") + "')";
    }
    if (kind === "tool") {
      return "planningOpenByToolId(event,'" + target.replace(/'/g, "\\'") + "')";
    }
    return "planningOpenContent(event,'" + target.replace(/'/g, "\\'") + "')";
  }

  function navLink(label, kind, target) {
    return (
      '<a class="wr-link" href="#" onclick="return ' +
      navClickAttr(kind, target) +
      ';">' +
      label +
      "</a>"
    );
  }

  function thHelp(label, tip) {
    return (
      "<th><span class=\"wr-th-help\" title=\"" +
      escAttr(tip) +
      '">' +
      label +
      ' <span class="wr-q" aria-hidden="true">❓</span></span></th>'
    );
  }

  function laymanSourceNote(note) {
    note = String(note || "");
    if (/assessment_run/i.test(note)) {
      return "✅ 新版自來水管（問卷「更新報告」自動同步）" + (note ? " · " + note : "");
    }
    if (/log|legacy|舊/i.test(note)) {
      return "⚠️ 舊版 log · 建議回問卷按「更新報告」升級" + (note ? " · " + note : "");
    }
    return note || "本機問卷／掃描匯入";
  }

  function buildCoverageBlock(state) {
    var parts = [];
    var store = global.AssessmentRunStore;
    var pastoralN = 0;
    var spiritualN = 0;
    if (store && typeof store.listRuns === "function") {
      pastoralN = store.listRuns("pastoral").length;
      spiritualN = store.listRuns("spiritual").length;
    }
    if (state.toolCount) {
      parts.push(
        "目前已掃描 <strong>" +
          state.toolCount +
          "</strong> 份問卷工具（合成平均成六維）。<strong>覆蓋率提示：</strong>分數是「有填的人／有掃描的工具」的輪廓，不代表每一位會友都已填寫。"
      );
    }
    if (pastoralN > 0) {
      parts.push(
        "《領袖健康診斷》本機有 <strong>" +
          pastoralN +
          "</strong> 次填寫紀錄。" +
          (pastoralN <= 8
            ? "若只有少數核心同工填寫，分數反映的是<strong>車頭極端壓力</strong>——不能完全代表全教會，但車頭要爆了，長執就該停看聽！"
            : "已有多位同工填寫，較能反映核心團隊整體狀態（仍須牧者對話確認）。")
      );
    }
    if (spiritualN > 0 && spiritualN <= 8) {
      parts.push(
        "《信徒靈命自評》目前約 <strong>" +
          spiritualN +
          "</strong> 次紀錄——樣本偏少時，宜當「方向燈」而非「全教會普查」。"
      );
    }
    if (!parts.length) return "";
    return '<div class="wr-coverage">' + parts.join(" ") + "</div>";
  }

  function renderWeakDimFixes(weakDims, composite) {
    if (!weakDims || !weakDims.length) return "";
    var items = weakDims
      .map(function (d) {
        var fix = WEAK_DIM_FIX[d];
        var g = DIM_LAYMAN[d] || {};
        if (!fix) return "";
        var extra =
          d === "C"
            ? " · " + navLink("事奉媒合中心", "root", HUB.matchmaker)
            : "";
        return (
          "<li>" +
          "<strong>" +
          d +
          "</strong>（" +
          (g.nick || RT.dimensionLabels[d]) +
          " " +
          composite[d] +
          " 分）→ " +
          navLink(fix.label, fix.kind, fix.target) +
          extra +
          "</li>"
        );
      })
      .join("");
    if (!items) return "";
    return (
      '<div class="wr-fix-box">' +
      "<strong>🎯 弱維度去哪裡修？</strong> 開完會的下一步（點連結直達）" +
      '<ul class="wr-fix-list">' +
      items +
      "</ul></div>"
    );
  }

  function renderEpochPlaceholder() {
    return (
      '<div class="wr-epoch-bar">' +
      "<span>📅 年度趨勢（規劃中）</span>" +
      '<select disabled aria-disabled="true" title="正式版將可比對各年度六維走势">' +
      '<option selected>2026 當前（本機試用）</option>' +
      "<option>2025</option>" +
      "<option>2024</option>" +
      "</select>" +
      '<span class="wr-note">正式版可一鍵對比：「2024 年 P 軸 75 分 → 2026 年 40 分」——看清是健康增長還是血汗虛胖（事奉回測）。</span>' +
      "</div>"
    );
  }

  function renderStorageFaq() {
    return (
      '<details class="wr-fold wr-storage-faq">' +
      "<summary>✓ 試用版本機資料 · 未來存哪？有年度回測嗎？</summary>" +
      "<p><strong>現在：</strong>資料存在您這台電腦的瀏覽器本機（localStorage），方便快速體驗，<em>不會</em>自動上傳雲端。</p>" +
      "<p><strong>正式版規劃：</strong>教會私有加密雲端帳號；只有通過長執權限（RACI 的 A／I 角色）開會時才能解鎖掃描，並可去識別化（隱匿姓名）。</p>" +
      "<p><strong>年度回測：</strong>P2 數據契約通電後，上方「年度趨勢」將可篩選 2024／2025／2026，對比各年 P/S/G/C/R/F 走势。</p>" +
      "</details>"
    );
  }

  function renderScoreFaq() {
    return (
      '<details class="wr-fold">' +
      "<summary>分數越高越好嗎？100 分代表完美教會嗎？</summary>" +
      "<p><strong>不是。</strong>管理學上的 100 分在教會往往意味「過度理想化的屬靈面具」——大家不敢寫實話。戰情室追求的是<strong>動態平衡</strong>：各軸落在 60–80、彼此落差不大，往往比「一軸 100、另一軸 20」更具長期擴展力。</p>" +
      "</details>"
    );
  }

  function renderDashboardSisterCard() {
    return (
      '<section class="wr-card wr-span-all wr-sister-dash">' +
      "<h2>姊妹頁：戰情總覽數據盤</h2>" +
      '<div class="wr-sister-grid">' +
      '<div class="wr-sister-col wr-sister-here">' +
      "<strong>✅ 您現在在：健康雷達戰情室</strong>" +
      "<ul>" +
      "<li><strong>看什麼：</strong>六維 P/S/G/C/R/F 合成、跨工具風險、崗位腦力激盪</li>" +
      "<li><strong>資料從哪來：</strong>健康診斷中心各量表 → 掃描 → 合成平均</li>" +
      "<li><strong>給誰用：</strong>長執開會找破口、排議程</li>" +
      "</ul></div>" +
      '<div class="wr-sister-col wr-sister-there">' +
      "<strong>↗ " + navLink("戰情總覽數據盤", "content", HUB.dashboard) + "</strong>" +
      "<ul>" +
      "<li><strong>看什麼：</strong>Step 0～3、SWOT、SMART 目標、PDCA 快訊、決議追蹤（唯讀 KPI）</li>" +
      "<li><strong>資料從哪來：</strong>流程總覽／策略頁已填的本機資料</li>" +
      "<li><strong>給誰用：</strong>行政同工看「今年進度、目標完成幾項」</li>" +
      "</ul></div>" +
      "</div>" +
      '<p class="wr-card-lead"><strong>怎麼配合？</strong>長執先在<strong>戰情室</strong>看六維破口 → 再到<strong>數據盤</strong>對照 SWOT／目標是否跟進 → 缺資料就回健康診斷中心補填。兩頁讀不同本機鍵，互補不重複；數據盤頂部會顯示從戰情室掃描來的六維橋接摘要。</p>' +
      '<div class="wr-nav-out">' +
      '<a class="wr-btn" href="#" onclick="return ' +
      navClickAttr("content", HUB.dashboard) +
      ';">📋 前往戰情總覽數據盤（執行 KPI）</a>' +
      "</div></section>"
    );
  }

  function vecArray(v) {
    return RT.dimensions.map(function (d) {
      return v[d] || 0;
    });
  }

  function cosine(a, b) {
    if (!a.length || a.length !== b.length) return 0;
    var dot = 0;
    var na = 0;
    var nb = 0;
    for (var i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      na += a[i] * a[i];
      nb += b[i] * b[i];
    }
    if (!na || !nb) return 0;
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
  }

  function getToolVector(toolEntry) {
    return toolEntry && toolEntry.report && toolEntry.report.vector;
  }

  function avgDim(toolEntries, dim) {
    var sum = 0;
    var n = 0;
    toolEntries.forEach(function (entry) {
      var v = getToolVector(entry);
      if (v && isFinite(v[dim])) {
        sum += v[dim];
        n += 1;
      }
    });
    return n ? sum / n : null;
  }

  function detectCrossToolRisks(registry) {
    var risks = [];
    var tools = registry.tools || {};
    function v(id) {
      var e = tools[id];
      return e ? getToolVector(e) : null;
    }

    var spiritual = v("spiritual");
    var pastoral = v("pastoral");
    var smart = v("smart");
    var pdca = v("pdca");
    var kpi = v("kpiokr");
    var raci = v("raci");
    var m8020 = v("ministry8020");
    var alda = v("alda");

    function innerLife() {
      var vals = [];
      if (spiritual) vals.push((spiritual.S + spiritual.F) / 2);
      if (pastoral) vals.push((pastoral.S + pastoral.P) / 2);
      if (alda) vals.push((alda.S + alda.F) / 2);
      if (!vals.length) return null;
      return vals.reduce(function (a, b) {
        return a + b;
      }, 0) / vals.length;
    }

    function outputDrive() {
      var vals = [];
      if (smart) vals.push((smart.C + smart.G) / 2);
      if (pdca) vals.push((pdca.C + pdca.G) / 2);
      if (kpi) vals.push((kpi.C + kpi.G) / 2);
      if (!vals.length) return null;
      return vals.reduce(function (a, b) {
        return a + b;
      }, 0) / vals.length;
    }

    var inner = innerLife();
    var output = outputDrive();
    if (inner != null && output != null && output >= 72 && inner <= 48) {
      risks.push({
        level: "critical",
        message:
          "跨工具警示：規劃／執行面向（SMART·PDCA·KPI）偏強，但靈命／牧養面向偏弱——先調整節奏與安息，再推新目標。"
      });
    }

    if (raci && m8020) {
      if (raci.R < 52 && m8020.C >= 68) {
        risks.push({
          level: "warning",
          message:
            "RACI 顯示團隊連結／權責張力，80/20 又顯示執行集中——建議拆分 R 與加支援，避免馬大式過勞。"
        });
      }
    }

    if (spiritual && smart && spiritual.S <= 50 && smart.G >= 70) {
      risks.push({
        level: "warning",
        message: "信徒靈命自評偏低，但 SMART 治理目標偏高——避免用事工產出掩蓋靈命空洞。"
      });
    }

    var sSpread = [];
    Object.keys(tools).forEach(function (id) {
      var vec = v(id);
      if (vec && isFinite(vec.S)) sSpread.push(vec.S);
    });
    if (sSpread.length >= 2) {
      var minS = Math.min.apply(null, sSpread);
      var maxS = Math.max.apply(null, sSpread);
      if (maxS - minS >= 28) {
        risks.push({
          level: "info",
          message:
            "各工具在「屬靈 S」維度落差超過 28 分——可能反映不同對象或不同情境，建議牧者對齊解讀脈絡。"
        });
      }
    }

    var entries = Object.keys(tools).map(function (k) {
      return tools[k];
    });
    var composite = buildCompositeVector(registry);
    var compositeRisks = RT.detectRisks(composite);
    compositeRisks.forEach(function (msg) {
      risks.push({ level: "warning", message: "合成向量：" + msg });
    });

    return risks;
  }

  function buildCompositeVector(registry) {
    var vectors = [];
    Object.keys(registry.tools || {}).forEach(function (id) {
      var vec = getToolVector(registry.tools[id]);
      if (vec) vectors.push(vec);
    });
    return RT.averageVectors(vectors);
  }

  function rankRoles(composite) {
    if (global.matchPersonToRoles) {
      var giftScores = ctvToGiftScores(composite);
      var smRoles = loadSmRoleDefinitions();
      var matched = global.matchPersonToRoles({ scores: giftScores }, smRoles);
      return matched.map(function (m) {
        var score = Number(m.score) || 0;
        var level =
          score >= 82 ? "trial" : score >= 70 ? "pastoral_review" : score >= 58 ? "explore" : "defer";
        return {
          roleId: m.roleId,
          roleName: m.name,
          score: score,
          level: level,
          source: m.roleId.indexOf("sm_") === 0 ? "Smart Ministry" : "示範崗位"
        };
      });
    }
    var cv = vecArray(composite);
    return DEMO_ROLES.map(function (role) {
      var rv = vecArray(role.required);
      var sim = cosine(cv, rv);
      var score = Math.round(sim * 1000) / 10;
      var level =
        score >= 82 ? "trial" : score >= 70 ? "pastoral_review" : score >= 58 ? "explore" : "defer";
      return {
        roleId: role.roleId,
        roleName: role.roleName,
        score: score,
        level: level,
        source: "CTV 示範"
      };
    }).sort(function (a, b) {
      return b.score - a.score;
    });
  }

  function buildWarRoomState() {
    var registry = RT.readRegistry();
    var toolIds = Object.keys(registry.tools || {});
    var composite = buildCompositeVector(registry);
    var tb = {};
    RT.dimensions.slice()
      .sort(function (a, b) {
        return composite[b] - composite[a];
      })
      .forEach(function (d, i) {
        if (i < 2) tb.top = (tb.top || []).concat([d]);
        if (i >= RT.dimensions.length - 2) tb.bottom = (tb.bottom || []).concat([d]);
      });
    return {
      registry: registry,
      toolCount: toolIds.length,
      composite: composite,
      compositeLine: RT.formatVectorLine(composite),
      risks: collectPackAlertFlags().concat(detectCrossToolRisks(registry)),
      roles: rankRoles(composite),
      tools: toolIds
        .map(function (id) {
          var entry = registry.tools[id];
          var rep = entry && entry.report;
          return {
            toolId: id,
            name: (rep && rep.toolName) || (Bridge.TOOL_META[id] && Bridge.TOOL_META[id].name) || id,
            vector: rep && rep.vector,
            vectorLine: rep && rep.vectorLine,
            syncedAt: entry.syncedAt,
            sourceNote: rep && rep.sourceNote,
            href: TOOL_LINKS[id] || null
          };
        })
        .sort(function (a, b) {
          return (b.syncedAt || "").localeCompare(a.syncedAt || "");
        })
    };
  }

  function buildPlainSummary(state) {
    var lines = [
      "【CTA-OS 戰情室摘要】",
      "已同步工具數：" + state.toolCount,
      "合成 CTV：" + state.compositeLine,
      ""
    ];
    if (state.tools.length) {
      lines.push("各工具快照：");
      state.tools.forEach(function (t) {
        lines.push(
          "- " +
            t.name +
            "：" +
            (t.vectorLine || "—") +
            "（" +
            (t.syncedAt ? new Date(t.syncedAt).toLocaleString() : "—") +
            "）"
        );
      });
      lines.push("");
    }
    if (state.risks.length) {
      lines.push("跨工具風險：");
      state.risks.forEach(function (r) {
        lines.push("- [" + r.level + "] " + r.message);
      });
      lines.push("");
    }
    lines.push("角色配對（合成向量）：");
    state.roles.slice(0, 3).forEach(function (r) {
      lines.push("- " + r.roleName + "：" + r.score + " 分（" + r.level + "）");
    });
    lines.push("");
    lines.push("— 本摘要僅供團隊禱告與對話，不作人事任免依據。");
    return lines.join("\n");
  }

  function renderRadar(canvas, vector) {
    if (!canvas || !global.Chart) return null;
    var labels = RT.dimensions.map(function (d) {
      return d + " " + RT.dimensionLabels[d];
    });
    var data = RT.dimensions.map(function (d) {
      return vector[d] || 0;
    });
    if (canvas._ctaChart) {
      canvas._ctaChart.destroy();
    }
    canvas._ctaChart = new Chart(canvas.getContext("2d"), {
      type: "radar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "合成 CTV",
            data: data,
            backgroundColor: "rgba(67, 56, 202, 0.2)",
            borderColor: "#4338ca",
            pointBackgroundColor: "#4338ca"
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { stepSize: 20 }
          }
        }
      }
    });
    return canvas._ctaChart;
  }

  function mountWarRoom(root) {
    if (!root) return;
    var state = buildWarRoomState();
    var hasData = state.toolCount > 0;
    var weak = hasData ? weakestDims(state.composite, 2) : [];
    var weakText = weak
      .map(function (d) {
        var g = DIM_LAYMAN[d] || {};
        return d + "（" + (g.nick || RT.dimensionLabels[d]) + " " + state.composite[d] + " 分）";
      })
      .join("、");

    var toolRows = state.tools
      .map(function (t) {
        var stale =
          t.syncedAt && Date.now() - new Date(t.syncedAt).getTime() > 1000 * 60 * 60 * 24 * 90;
        return (
          "<tr>" +
          '<td><a class="wr-link" href="#" onclick="return ' +
          navClickAttr("tool", t.toolId) +
          ';" title="回健康診斷中心 · 補填或更新這份量表">' +
          t.name +
          "</a></td>" +
          "<td class=\"wr-mono\">" +
          (t.vectorLine || "—") +
          "</td>" +
          '<td class="' +
          (stale ? "wr-stale" : "") +
          '">' +
          (t.syncedAt ? new Date(t.syncedAt).toLocaleString() : "—") +
          (stale ? ' <span class="wr-badge wr-badge-warn">建議更新</span>' : "") +
          "</td>" +
          '<td class="wr-note">' +
          laymanSourceNote(t.sourceNote) +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    var coverageHtml = buildCoverageBlock(state);
    var weakFixHtml = hasData ? renderWeakDimFixes(weak, state.composite) : "";

    var riskEmptyCopy =
      '<li class="wr-empty-warm">' +
      "<strong>這裡是「複合式災難預報」</strong>——當您在「健康診斷中心」填完至少兩份量表並按「掃描本機」後，系統會自動比對例如：<em>領袖過勞 × 事工過載</em>、<em>靈命偏低 × SMART 目標過高</em> 等交叉風險，並列出白話警訊。" +
      " 目前資料不足，尚無法比對；請先填寫量表再掃描。" +
      "</li>";

    var riskHtml = state.risks.length
      ? state.risks
          .map(function (r) {
            return (
              '<li class="wr-risk wr-risk-' +
              r.level +
              '">' +
              r.message +
              "</li>"
            );
          })
          .join("")
      : riskEmptyCopy;

    var roleEmptyCopy =
      '<tr><td colspan="3" class="wr-empty-warm">' +
      "<strong>這裡是「恩賜與崗位對對碰」</strong>——數據源頭：" +
      navLink("SHAPE 恩賜整合量表", "tool", "shape") +
      "、" +
      navLink("事奉能力模型量表", "tool", "competency") +
      "。掃描後系統會把合成六維轉成恩賜輪廓，<em>僅供長執腦力激盪</em>，不是自動派工。" +
      " 填好後按「掃描本機」，再 " +
      navLink("前往事奉媒合中心", "root", HUB.matchmaker) +
      " 正式點選會友派工。" +
      "</td></tr>";

    var roleHtml = hasData
      ? state.roles
          .map(function (r) {
            return (
              "<tr><td>" +
              r.roleName +
              '<br><span class="wr-note">' +
              (r.source || "") +
              "</span></td><td class=\"wr-mono\">" +
              r.score +
              " 分</td><td>" +
              roleLevelZh(r.level) +
              "</td></tr>"
            );
          })
          .join("")
      : roleEmptyCopy;

    var focusLine = hasData
      ? "目前最需關注：<strong>" +
        weakText +
        "</strong>。分數 0–100，追求<strong>動態平衡</strong>（各軸 60–80 且落差不大），不是越高越好。"
      : "尚無合成分數。請到 " +
        navLink("健康診斷中心", "content", HUB.assessment) +
        " 填寫量表，回到此頁按「掃描本機各工具分數」。";

    root.innerHTML =
      '<section class="wr-section">' +
      '<div class="wr-layman-hero">' +
      "<p><strong>這頁是什麼？</strong>長執會與牧長的<strong>戰略決策桌</strong>——不是給會友填表的頁面。目的：把前面各份問卷簡化成<strong>六大健康指標</strong>，開會時大家看同一張圖，少憑感覺爭吵，多對準破口。</p>" +
      "<p><strong>資料從哪來？</strong>您已在 " +
      navLink("健康診斷中心", "content", HUB.assessment) +
      " 填過的量表（領袖健康、靈命自評、SMART、Johari…）。按下方「掃描本機」後，分數會從本機儲存匯入並<strong>合成平均</strong>成六維；數字不會上傳雲端，也不含會友姓名。</p>" +
      "<p>" +
      focusLine +
      "</p>" +
      '<p class="wr-hitl">⚠️ 本戰情室是「煙霧探測器」：供禱告、對話與議程排序。不作人事考核、績效排名或自動派工；敏感分辨須回到牧者一對一陪伴。開放題心聲<strong>不會</strong>進入戰情室，只留本機一對一報告。</p>' +
      renderStorageFaq() +
      "</div>" +
      renderEpochPlaceholder() +
      '<div class="wr-actions">' +
      '<button type="button" class="wr-btn wr-btn-primary" id="wr-scan">🔍 掃描本機各工具分數</button>' +
      '<button type="button" class="wr-btn" id="wr-copy">💬 複製戰情摘要</button>' +
      '<button type="button" class="wr-btn" onclick="window.print()">🖨️ 打印</button>' +
      '<a class="wr-btn" href="#" onclick="return planningOpenContent(event,\'assessment-os-hub.html\');">健康診斷中心</a>' +
      "</div>" +
      '<p class="wr-meta">已同步 <strong id="wr-tool-count">' +
      state.toolCount +
      "</strong> 個工具 · 戰情庫更新 " +
      (state.registry.updatedAt
        ? new Date(state.registry.updatedAt).toLocaleString()
        : "—") +
      "</p>" +
      "</section>" +
      '<div class="wr-grid">' +
      '<section class="wr-card wr-span2">' +
      "<h2>全教會六維總成績（CTV 雷達）</h2>" +
      '<p class="wr-card-lead"><strong>為了什麼？</strong>一眼看見 P/S/G/C/R/F 輪廓，找出<strong>最大破口</strong>。下方六格說明每一軸的屬靈／管理意義與主要來源問卷；滑鼠移到格子上可看提示。</p>' +
      '<div class="wr-dim-grid">' +
      renderDimGrid(state.composite, hasData) +
      "</div>" +
      (hasData
        ? '<p class="wr-line wr-mono" style="font-size:0.78rem;">合成摘要：' + state.compositeLine + "</p>"
        : "") +
      '<canvas id="wr-radar" height="260"></canvas>' +
      weakFixHtml +
      renderScoreFaq() +
      "<details class=\"wr-fold\"><summary>CTV 是什麼縮寫？</summary>" +
      "Church Transformation Vector：把多份量表對映到同一套六維語言（P 牧養、S 屬靈、G 治理、C 能力、R 團隊、F 果效），方便長執用同一詞彙討論，而不是各說各話。" +
      "</details>" +
      "</section>" +
      '<section class="wr-card">' +
      "<h2>跨工具風險</h2>" +
      '<p class="wr-card-lead"><strong>從何而來？</strong>比對<strong>兩份以上</strong>量表的分數組合（例如領袖耗盡 + 事工過載）。若某工具已寫入 assessment_run，單工具警訊（如【耗盡】）也會列在這裡。</p>' +
      '<ul class="wr-risk-list">' +
      riskHtml +
      "</ul>" +
      "</section>" +
      '<section class="wr-card">' +
      "<h2>角色配對建議</h2>" +
      '<p class="wr-card-lead"><strong>從何而來？</strong>底層來自 ' +
      navLink("SHAPE 恩賜整合量表", "tool", "shape") +
      " 與 " +
      navLink("事奉能力模型量表", "tool", "competency") +
      "，再對照示範崗位或 Smart Ministry 目錄。<strong>往哪裡去？</strong>看到推薦後，到下方「事奉媒合中心」正式點選會友、拉入同工名單——須牧者確認，不可當 KPI 或自動派工。</p>" +
      '<table class="wr-table"><thead><tr><th>崗位</th><th>匹配度</th><th>建議程度</th></tr></thead><tbody>' +
      roleHtml +
      "</tbody></table>" +
      '<div class="wr-nav-out">' +
      '<a class="wr-btn wr-btn-primary" href="#" onclick="return ' +
      navClickAttr("root", HUB.matchmaker) +
      ';">🟢 前往事奉媒合中心（正式派工）</a>' +
      '<span class="wr-note">長執與牧者在此點選會友、完成事工配對；戰情室只提供腦力激盪，不直接改 CRM 名單。</span>' +
      "</div>" +
      "</section>" +
      "</div>" +
      renderDashboardSisterCard() +
      '<section class="wr-card wr-span-all">' +
      "<h2>各工具分數快照</h2>" +
      '<p class="wr-table-caption">全站交通樞紐：每一列 = 一份已掃描的量表。分數太低？<strong>點工具名</strong>立刻回 ' +
      navLink("健康診斷中心", "content", HUB.assessment) +
      " 對應問卷補填。表頭 ❓ 滑鼠移過可看大白話說明。</p>" +
      coverageHtml +
      (toolRows
        ? '<table class="wr-table"><thead><tr>' +
          thHelp("工具", TABLE_COL_TIPS.tool) +
          thHelp("六維分數", TABLE_COL_TIPS.scores) +
          thHelp("上次掃描", TABLE_COL_TIPS.scanned) +
          thHelp("資料怎麼讀到的", TABLE_COL_TIPS.source) +
          "</tr></thead><tbody>" +
          toolRows +
          "</tbody></table>"
        : '<p class="wr-empty-warm">尚無快照。請先到 ' +
          navLink("健康診斷中心", "content", HUB.assessment) +
          " 選量表填寫，再按上方「掃描本機」。與 " +
          navLink("戰情總覽數據盤", "content", HUB.dashboard) +
          " 不同：那頁看 KPI／PDCA 執行進度，這裡看六維健康合成。</p>") +
      "</section>";

    var scanBtn = root.querySelector("#wr-scan");
    if (scanBtn) {
      scanBtn.addEventListener("click", function () {
        var synced = Bridge.scanAllToolsFromStorage();
        scanBtn.textContent = "已掃描 " + synced.length + " 個工具，重新載入…";
        mountWarRoom(root);
      });
    }
    var copyBtn = root.querySelector("#wr-copy");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var s = buildWarRoomState();
        if (navigator.clipboard) navigator.clipboard.writeText(buildPlainSummary(s));
      });
    }

    var canvas = root.querySelector("#wr-radar");
    if (hasData) renderRadar(canvas, state.composite);
  }

  global.CTAOSWarRoom = {
    buildWarRoomState: buildWarRoomState,
    buildPlainSummary: buildPlainSummary,
    mountWarRoom: mountWarRoom,
    scanAndMount: function (root) {
      Bridge.scanAllToolsFromStorage();
      mountWarRoom(root);
    }
  };
})(window);
