/**
 * 教牧／領袖靈命調查：七維度題組對應、答案收集、維度報告、匿名匯出。
 * 題目 id 與 SURVEY_SOURCE 動態表單一致（A1–F5）。
 * 依賴：spiritual_health_scoring.js
 *
 * ---------------------------------------------------------------------------
 * 為何不是「A–F 各對應一個七維度」？
 * - A–F 是填答節奏與概覽報告卡片（六範疇）；七維度是 health scoring 匯總用。
 * - D 章同時含家庭、同工、會友界線；C 與 D3 都屬負荷／界線；F 同時含問責（支持）
 *   與謙卑／高風險界線（使命與治理）。故採「題目級」映射，避免硬套一字母一維度。
 *
 * 章節大方向（題目級細分見下表）：
 * - A → 靈修與話語（A1–A3）；喜樂／同在向度（A4–A5）
 * - B → 情緒壓力（B1–B5）
 * - C → 負荷與界線（C1,C3–C5）；休息與家庭（C2）
 * - D → 休息與家庭（D1）；團隊支持（D2,D4,D5）；負荷與界線（D3 會友界線）
 * - E → 異象與使命（E1–E5）
 * - F → 團隊支持（F1–F3）；異象與使命（F4–F5）
 *
 * 加厚 joy（喜樂）時的共識（與 SURVEY_DESIGN_PRINCIPLES.md §4.2「維護備忘」一致）：
 * - 喜樂＝與神同在、被愛、安全感、內在安息等「靈命現況」情感／關係向，勿與異象／呼召混成同義。
 * - 若需增加 joy 題數：優先從 B 組（emotion_stress）挑「更偏與神連結的正向情感」之題，逐題檢核後改 dim；
 *   勿自 E／F4–F5 大量拉回「盼望／呼召」題。改動時同步更新 §4.2 速查表與本註解。
 *
 * 反向題（reversed）：目前全為 false。題庫中 B3、B5、D4、E2、E3、F4 等含「沒有／不常／不會」，
 * 語意仍是「非常同意＝較健康／較合宜」，無需 6−x。若日後改寫題幹使「同意＝狀況較差」，須改
 * reversed 並同步 docs/SURVEY_DESIGN_PRINCIPLES.md §4.2。
 *
 * --- A1–F5 題幹摘要（與 HTML 題庫一致）---
 * A1 固定、為自己（非僅事工）的靈修時間。
 * A2 靈修中能向主傾心吐意，非僅完成「功課」。
 * A3 常從神的話語得安慰／方向，非僅為講章找材料。
 * A4 忙碌壓力中仍常意識神與我同在。
 * A5 深知被神愛，身分比「牧者／領袖」更根本。
 * B1 能覺察並說出當下情緒，非一概壓下。
 * B2 挫折委屈會帶到神前或可信任者。
 * B3 最近沒有長期麻木、提不起勁、不想關心人（同意＝較健康）。
 * B4 受批評攻擊後能合理時間內恢復，非長期自責／苦毒。
 * B5 不常用忙碌、追劇、滑手機逃避內心問題（同意＝較健康）。
 * C1 一週服事工作量整體可持續、不長期透支。
 * C2 有意識安排固定休息與安息（含不接電話／訊息時段）。
 * C3 不習慣凡事自己扛，願分工授權。
 * C4 事工有基本計劃與檢討節奏，非只靠臨時救火。
 * C5 過度忙碌或身心警號時，願主動與同工／執事溝通調整。
 * D1 配偶／家人感到被重視陪伴，非僅捲入教會忙碌。
 * D2 與同工有基本信任與開放，能談不同意見與張力。
 * D3 會友期望不合理時能設界線，非一味迎合或爆發。
 * D4 非長期孤單、沒人了解自己承受什麼（同意＝較健康）。
 * D5 衝突中盡量尋求和好尊重，非冷戰／切割／心中定罪。
 * E1 深知呼召源於神，非主要建立在果效或肯定上。
 * E2 果效不如預期時，不會立刻覺得自己是「失敗的工人」（同意＝較健康）。
 * E3 不常拿自己教會與他者比較來衡量價值（同意＝較健康）。
 * E4 面對新挑戰仍對神在教會與個人身上的計劃懷抱盼望。
 * E5 能接受果效多年後才顯現，不急於短期數字衡量一切。
 * F1 教會中有一兩位成熟者可對我說真話、指出盲點。
 * F2 願在合適範圍與核心團隊分享掙扎，非維持完美形象。
 * F3 決策時刻意尋求不同聲音，非只聽贊同者。
 * F4 不把自己的看法等同「神唯一心意」，願承認可能看錯（同意＝較健康）。
 * F5 財務、用人、性別互動等高風險領域有清楚界線與問責（同意＝較健康）。
 * ---------------------------------------------------------------------------
 */
(function (global) {
  "use strict";

  var PASTORAL_HEALTH_LOG_KEY = "chp2026-pastoral-health-log-v1";
  var PASTORAL_HEALTH_LOG_KEY_LEGACY = "church_planning_pastoral_spiritual_health";

  function storageGet(key) {
    try {
      if (global.PersistenceProvider && typeof global.PersistenceProvider.getInstance === "function") {
        return global.PersistenceProvider.getInstance().getItem(key);
      }
    } catch (e) {
      console.warn("pastoral_spiritual_health: provider get fallback", e);
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
      console.warn("pastoral_spiritual_health: provider set fallback", e);
    }
    global.localStorage.setItem(key, value);
  }

  function migratePastoralHealthLogKeyOnce() {
    try {
      if (storageGet(PASTORAL_HEALTH_LOG_KEY)) return;
      var leg = storageGet(PASTORAL_HEALTH_LOG_KEY_LEGACY);
      if (leg) storageSet(PASTORAL_HEALTH_LOG_KEY, leg);
    } catch (e) {}
  }
  migratePastoralHealthLogKeyOnce();

  var PASTORAL_DIMENSIONS = [
    { key: "joy", label: "喜樂" },
    { key: "scripture_word", label: "靈修與話語" },
    { key: "load_boundary", label: "負荷與界線" },
    { key: "rest_family", label: "休息與家庭" },
    { key: "team_support", label: "團隊支持" },
    { key: "emotion_stress", label: "情緒壓力" },
    { key: "vision_mission", label: "異象與使命" }
  ];

  var PASTORAL_QUESTIONS = [
    { id: "A1", dim: "scripture_word", reversed: false },
    { id: "A2", dim: "scripture_word", reversed: false },
    { id: "A3", dim: "scripture_word", reversed: false },
    { id: "A4", dim: "joy", reversed: false },
    { id: "A5", dim: "joy", reversed: false },
    { id: "B1", dim: "emotion_stress", reversed: false },
    { id: "B2", dim: "emotion_stress", reversed: false },
    { id: "B3", dim: "emotion_stress", reversed: false },
    { id: "B4", dim: "emotion_stress", reversed: false },
    { id: "B5", dim: "emotion_stress", reversed: false },
    { id: "C1", dim: "load_boundary", reversed: false },
    { id: "C2", dim: "rest_family", reversed: false },
    { id: "C3", dim: "load_boundary", reversed: false },
    { id: "C4", dim: "load_boundary", reversed: false },
    { id: "C5", dim: "load_boundary", reversed: false },
    { id: "D1", dim: "rest_family", reversed: false },
    { id: "D2", dim: "team_support", reversed: false },
    { id: "D3", dim: "load_boundary", reversed: false },
    { id: "D4", dim: "team_support", reversed: false },
    { id: "D5", dim: "team_support", reversed: false },
    { id: "E1", dim: "vision_mission", reversed: false },
    { id: "E2", dim: "vision_mission", reversed: false },
    { id: "E3", dim: "vision_mission", reversed: false },
    { id: "E4", dim: "vision_mission", reversed: false },
    { id: "E5", dim: "vision_mission", reversed: false },
    { id: "F1", dim: "team_support", reversed: false },
    { id: "F2", dim: "team_support", reversed: false },
    { id: "F3", dim: "team_support", reversed: false },
    { id: "F4", dim: "vision_mission", reversed: false },
    { id: "F5", dim: "vision_mission", reversed: false }
  ];

  var PASTORAL_QUESTION_MAP = {};
  for (var i = 0; i < PASTORAL_QUESTIONS.length; i++) {
    var q = PASTORAL_QUESTIONS[i];
    PASTORAL_QUESTION_MAP[q.id] = { dim: q.dim, reversed: q.reversed };
  }

  var PASTORAL_DIM_DESCRIPTIONS = {
    joy: "在壓力中仍覺察神的同在與被愛（身分根基於被愛，非僅事工角色）。",
    scripture_word: "為自己（非僅事工）預備靈修，從話語得餵養而非僅找材料。",
    load_boundary: "事奉負荷可持續、願意授權與調整，對會友期望能設立健康界線。",
    rest_family: "刻意休息與安息，家人感到被重視與陪伴。",
    team_support: "同工信任、和好與問責；不長期孤立，能接納提醒。",
    emotion_stress: "情緒覺察、帶到神前或可信任者，少以麻木或逃避應對。",
    vision_mission: "呼召根基在神而非果效；少比較，在高風險領域有界線與問責。"
  };

  var PASTORAL_ACTION_RED = {
    joy: "安排固定「無產出」的安靜時刻，與牧者或導師談論枯竭與身分。",
    scripture_word: "區分「預備事工」與「自己被牧養」的時段，從短讀＋禱告開始。",
    load_boundary: "列出可暫停或交出的項目，與核心團隊訂出調整時間表。",
    rest_family: "為家庭劃出不可侵犯的時段，與配偶／家人核對陪伴品質。",
    team_support: "主動約定一位可說真話的同行者，並在衝突中選擇對話而非冷戰。",
    emotion_stress: "若長期麻木或逃避，考慮尋求專業輔導並向信任同工披露限度。",
    vision_mission: "在禱告中重讀身分經文，與團隊重訂「忠心優於數字」的語言。"
  };

  var PASTORAL_ACTION_GREEN = {
    joy: "為神的同在獻上感謝；持續守護喜樂與盼望，避免被事工日程擠壓。",
    scripture_word: "維持靈修品質，可偶爾陪伴另一位同工檢視靈修是否流於形式。",
    load_boundary: "定期檢視授權與節奏，把健康界線當作對群羊的長期負責。",
    rest_family: "把家庭日放入行事曆並告知團隊，作為見證也是界線操練。",
    team_support: "感謝問責與信任關係，並在團隊中鼓勵說真話的文化。",
    emotion_stress: "延續情緒整理習慣，成為能聽見他人疲憊的同行者。",
    vision_mission: "持守呼召異象，在果效起伏中繼續以忠心與問責守護事奉。"
  };

  function radioStringFromForm(form, name) {
    var el = form.elements[name];
    if (!el) return "";
    var list = el.length !== undefined ? el : [el];
    for (var i = 0; i < list.length; i++) {
      if (list[i].checked) return String(list[i].value);
    }
    return "";
  }

  function collectPastoralAnswers(form) {
    var out = {};
    for (var j = 0; j < PASTORAL_QUESTIONS.length; j++) {
      var pid = PASTORAL_QUESTIONS[j].id;
      out[pid] = radioStringFromForm(form, pid);
    }
    return out;
  }

  function dimQuestionTotals(dimKey) {
    var total = 0;
    for (var k = 0; k < PASTORAL_QUESTIONS.length; k++) {
      if (PASTORAL_QUESTIONS[k].dim === dimKey) total++;
    }
    return total;
  }

  function dimAnsweredCount(answers, dimKey) {
    var n = 0;
    for (var k = 0; k < PASTORAL_QUESTIONS.length; k++) {
      var pq = PASTORAL_QUESTIONS[k];
      if (pq.dim !== dimKey) continue;
      var v = answers[pq.id];
      if (v !== undefined && v !== null && v !== "") n++;
    }
    return n;
  }

  function isSparseDim(answers, dimKey) {
    var total = dimQuestionTotals(dimKey);
    var answered = dimAnsweredCount(answers, dimKey);
    if (total === 0) return false;
    return answered < total / 2;
  }

  function levelLabelZh(level) {
    if (level === "green") return "綠／大致良好";
    if (level === "yellow") return "黃／需留意";
    return "紅／需要特別關注";
  }

  function overallPhrase(level) {
    if (level === "green") return "大致良好";
    if (level === "yellow") return "需留意";
    return "需要特別關注";
  }

  function appendPastoralHealthLog(entry) {
    migratePastoralHealthLogKeyOnce();
    var raw = storageGet(PASTORAL_HEALTH_LOG_KEY);
    var arr = [];
    try {
      arr = raw ? JSON.parse(raw) : [];
    } catch (e) {
      arr = [];
    }
    if (!Array.isArray(arr)) arr = [];
    arr.push(entry);
    storageSet(PASTORAL_HEALTH_LOG_KEY, JSON.stringify(arr));
    try {
      if (global.Bible100Backend && typeof global.Bible100Backend.getBridge === "function") {
        var bridge = global.Bible100Backend.getBridge();
        if (bridge && typeof bridge.triggerWorkflow === "function") {
          bridge.triggerWorkflow("A2_SURVEY_COMPLETED", {
            module: "PASTORAL_HEALTH",
            submittedAt: new Date().toISOString(),
            payload: entry || {}
          });
        }
      }
    } catch (e) {}
  }

  function exportPastoralAnonymousStats() {
    migratePastoralHealthLogKeyOnce();
    var raw =
      storageGet(PASTORAL_HEALTH_LOG_KEY) ||
      storageGet(PASTORAL_HEALTH_LOG_KEY_LEGACY);
    var arr = [];
    try {
      arr = raw ? JSON.parse(raw) : [];
    } catch (e) {
      arr = [];
    }
    if (!Array.isArray(arr)) arr = [];
    var out = arr.map(function (row) {
      return {
        timestamp: row.timestamp || "",
        dimension_scores: row.dimension_scores || {}
      };
    });
    var blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json;charset=utf-8" });
    var a = document.createElement("a");
    var name = "pastoral-spiritual-anonymous-stats-" + new Date().toISOString().slice(0, 10) + ".json";
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }

  function renderPastoralReport(dimScores, overallScore, answers) {
    var host = document.getElementById("pastoral-report");
    if (!host) return;

    var levelOverall = global.levelFromScore(overallScore);
    var overallText = overallScore != null && isFinite(overallScore) ? overallScore.toFixed(1) : "—";
    var phrase = overallScore != null && isFinite(overallScore) ? overallPhrase(levelOverall) : "未能評估";

    var html = "";
    html += '<div class="report-cat pastoral-dim-report-intro">';
    html += "<h3>七維度靈命健康摘要（2026 標準）</h3>";
    html += "<p><strong>整體指數：</strong>" + overallText + "　";
    html += '<span class="pastoral-level-badge pastoral-level-' + levelOverall + '">' + phrase + "</span></p>";
    html += "<p class=\"muted\" style=\"font-size:0.88rem;margin:0;\">門檻與信徒快測一致：綠 ≥ 4.0；黃 2.8–4.0；紅 &lt; 2.8。本摘要與下方 A–F 範疇報告並陳，互補參考。</p>";
    html += "</div>";

    html += '<table class="pastoral-dim-table">';
    html += "<thead><tr>";
    html += "<th>維度</th><th class=\"num\">分數</th><th>等級</th><th>摘要</th>";
    html += "</tr></thead><tbody>";

    var redDims = [];
    var greenDims = [];

    for (var d = 0; d < PASTORAL_DIMENSIONS.length; d++) {
      var dim = PASTORAL_DIMENSIONS[d];
      var score = dimScores[dim.key];
      var sparse = isSparseDim(answers, dim.key);
      var scoreStr = score != null && isFinite(score) ? score.toFixed(1) : "—";
      var lev = global.levelFromScore(score);
      if (lev === "red" && score != null && isFinite(score)) redDims.push(dim.key);
      if (lev === "green" && score != null && isFinite(score)) greenDims.push(dim.key);

      var trClass = sparse ? ' class="pastoral-dim-row-sparse"' : "";
      html += "<tr" + trClass + ">";
      html += "<td>" + dim.label + "</td>";
      html += '<td class="num">' + scoreStr + "</td>";
      html += "<td>" + levelLabelZh(lev) + "</td>";
      html += "<td>" + (PASTORAL_DIM_DESCRIPTIONS[dim.key] || "") + "</td>";
      html += "</tr>";
      if (sparse) {
        html += '<tr class="pastoral-dim-row-sparse"><td colspan="4" style="font-size:0.82rem;color:#64748b;">此維度有效作答題數較少，資料較少，僅供參考。</td></tr>';
      }
    }
    html += "</tbody></table>";

    html += '<div class="report-cat" style="margin-top:1rem;">';
    html += "<h3>需要特別關注的領域</h3>";
    if (redDims.length === 0) {
      html += "<p class=\"muted\">目前沒有落在紅色門檻的維度，或尚有題目未填導致無法判讀。</p>";
    } else {
      html += "<ul class=\"muted\" style=\"padding-left:1.2rem;\">";
      for (var r = 0; r < redDims.length; r++) {
        var rk = redDims[r];
        var rlab = PASTORAL_DIMENSIONS.filter(function (x) {
          return x.key === rk;
        })[0];
        html += "<li><strong>" + (rlab ? rlab.label : rk) + "：</strong>";
        html += PASTORAL_DIM_DESCRIPTIONS[rk] + " <em>建議：</em>" + PASTORAL_ACTION_RED[rk] + "</li>";
      }
      html += "</ul>";
    }
    html += "</div>";

    html += '<div class="report-cat" style="margin-top:1rem;">';
    html += "<h3>已有恩典的領域</h3>";
    if (greenDims.length === 0) {
      html += "<p class=\"muted\">目前沒有落在綠色門檻的維度，或尚有題目未填導致無法判讀。</p>";
    } else {
      html += "<ul class=\"muted\" style=\"padding-left:1.2rem;\">";
      for (var g = 0; g < greenDims.length; g++) {
        var gk = greenDims[g];
        var glab = PASTORAL_DIMENSIONS.filter(function (x) {
          return x.key === gk;
        })[0];
        html += "<li><strong>" + (glab ? glab.label : gk) + "：</strong>";
        html += PASTORAL_DIM_DESCRIPTIONS[gk] + " <em>建議：</em>" + PASTORAL_ACTION_GREEN[gk] + "</li>";
      }
      html += "</ul>";
    }
    html += "</div>";

    html += '<div class="report-cat pastoral-safeguard" style="margin-top:1rem;border-left-color:#64748b;">';
    html += "<h3>保護與牧養聲明</h3>";
    html +=
      "<p class=\"muted\" style=\"margin:0;\">本維度摘要僅供個人反思與受託關懷之用，不作公開排名、績效考核或人事決定之依據。若你或家人出現強烈無助、自傷念頭或其他緊急狀況，請立即聯絡當地緊急支援與專業協助。</p>";
    html += "</div>";

    host.innerHTML = html;
  }

  global.PASTORAL_DIMENSIONS = PASTORAL_DIMENSIONS;
  global.PASTORAL_QUESTIONS = PASTORAL_QUESTIONS;
  global.PASTORAL_QUESTION_MAP = PASTORAL_QUESTION_MAP;
  global.PASTORAL_DIM_DESCRIPTIONS = PASTORAL_DIM_DESCRIPTIONS;
  global.PASTORAL_HEALTH_LOG_KEY = PASTORAL_HEALTH_LOG_KEY;
  global.collectPastoralAnswers = collectPastoralAnswers;
  global.renderPastoralReport = renderPastoralReport;
  global.appendPastoralHealthLog = appendPastoralHealthLog;
  global.exportPastoralAnonymousStats = exportPastoralAnonymousStats;
})(typeof globalThis !== "undefined" ? globalThis : this);
