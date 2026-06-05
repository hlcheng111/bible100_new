/**
 * 信徒靈命健康自我審查：題組設定、答案收集、維度報告渲染。
 * 依賴：spiritual_health_scoring.js（全域 computeDimensionScores 等）；可選 survey_ui_common.js（進度列）
 */
(function (global) {
  "use strict";

  var MEMBER_DIMENSIONS = [
    { key: "reading_devotion", label: "讀經靈修" },
    { key: "prayer", label: "禱告" },
    { key: "church_life", label: "教會生活" },
    { key: "character", label: "品格" },
    { key: "gospel_giving", label: "福音與奉獻" }
  ];

  var MEMBER_QUESTIONS = [
    { id: "q1", dim: "reading_devotion", reversed: false },
    { id: "q2", dim: "reading_devotion", reversed: false },
    { id: "q3", dim: "reading_devotion", reversed: false },
    { id: "q4", dim: "prayer", reversed: false },
    { id: "q5", dim: "prayer", reversed: false },
    { id: "q6", dim: "prayer", reversed: false },
    { id: "q7", dim: "church_life", reversed: false },
    { id: "q8", dim: "church_life", reversed: false },
    { id: "q9", dim: "church_life", reversed: false },
    { id: "q10", dim: "character", reversed: false },
    { id: "q11", dim: "character", reversed: false },
    { id: "q12", dim: "gospel_giving", reversed: false },
    { id: "q13", dim: "gospel_giving", reversed: false }
  ];

  var MEMBER_QUESTION_MAP = {};
  for (var i = 0; i < MEMBER_QUESTIONS.length; i++) {
    var q = MEMBER_QUESTIONS[i];
    MEMBER_QUESTION_MAP[q.id] = { dim: q.dim, reversed: q.reversed };
  }

  var MEMBER_DIM_DESCRIPTIONS = {
    reading_devotion: "固定讀經、默想與在生活中實踐神話語的習慣。",
    prayer: "個人禱告、交托憂慮與讚美感恩的節奏。",
    church_life: "主日與聚會穩定度、事奉參與與對教會的委身。",
    character: "忍耐、饒恕、和睦與肢體相處的品格操練。",
    gospel_giving: "關心未信者、見證與金錢奉獻的態度。"
  };

  var MEMBER_ACTION_RED = {
    reading_devotion: "與牧者或組長約時間，從每日短讀＋一句禱告開始，逐步建立節奏。",
    prayer: "設定每天 1～2 個固定時段簡短禱告，並找一位同伴每週互相代禱。",
    church_life: "先恢復主日崇拜，再與牧者談論合宜的事奉份量與界線。",
    character: "在衝突發生時先暫停、禱告，必要時尋求牧者協助和好。",
    gospel_giving: "為 1～2 位未信友代禱，並嘗試一個具體、可負擔的關懷行動。"
  };

  var MEMBER_ACTION_GREEN = {
    reading_devotion: "感謝主的建立；可考慮陪伴一位初信者一起讀經。",
    prayer: "維持節奏並為教會與肢體提名代禱。",
    church_life: "在事奉與休息間保持平衡，留意身心訊號。",
    character: "成為和好與鼓勵的同行者，分享你的學習。",
    gospel_giving: "延續負擔，可參與差傳代禱或奉獻的具體計劃。"
  };

  function collectMemberAnswers() {
    var out = {};
    for (var i = 1; i <= 13; i++) {
      var qid = "q" + i;
      var checked = document.querySelector('input[name="' + qid + '"]:checked');
      out[qid] = checked ? String(checked.value) : "";
    }
    return out;
  }

  function dimQuestionTotals(dimKey) {
    var total = 0;
    for (var j = 0; j < MEMBER_QUESTIONS.length; j++) {
      if (MEMBER_QUESTIONS[j].dim === dimKey) total++;
    }
    return total;
  }

  function dimAnsweredCount(answers, dimKey) {
    var n = 0;
    for (var j = 0; j < MEMBER_QUESTIONS.length; j++) {
      var mq = MEMBER_QUESTIONS[j];
      if (mq.dim !== dimKey) continue;
      var v = answers[mq.id];
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

  function badgeClassForLevel(level) {
    if (level === "green") return "badge-good";
    if (level === "yellow") return "badge-warning";
    return "badge-bad";
  }

  function renderMemberReport(dimScores, overallScore, answers) {
    var host = document.getElementById("member-report");
    if (!host) return;

    var levelOverall = global.levelFromScore(overallScore);
    var overallText = overallScore != null && isFinite(overallScore) ? overallScore.toFixed(1) : "—";
    var phrase = overallScore != null && isFinite(overallScore) ? overallPhrase(levelOverall) : "未能評估";

    var html = "";
    html += '<div class="report-section">';
    html += '<div class="report-section-title">靈命健康維度概覽（2026 標準）</div>';
    html += '<p class="summary-row"><span class="field-label">整體指數（維度平均）：</span>';
    html += '<span class="field-value">' + overallText + '</span>　';
    html += '<span class="badge ' + badgeClassForLevel(levelOverall) + '">' + phrase + "</span></p>";
    html += '<p class="note-small">整體指數為各範疇平均分再平均；門檻：綠 ≥ 4.0；黃 2.8–4.0；紅 &lt; 2.8。</p>';
    html += "</div>";

    html += '<div class="report-section">';
    html += '<div class="report-section-title">各範疇分數</div>';
    html += '<table style="width:100%;border-collapse:collapse;font-size:0.86rem;">';
    html += "<thead><tr>";
    html += '<th style="text-align:left;border-bottom:1px solid #e5e7eb;padding:4px;">範疇</th>';
    html += '<th style="text-align:right;border-bottom:1px solid #e5e7eb;padding:4px;">分數</th>';
    html += '<th style="text-align:left;border-bottom:1px solid #e5e7eb;padding:4px;">等級</th>';
    html += '<th style="text-align:left;border-bottom:1px solid #e5e7eb;padding:4px;">摘要</th>';
    html += "</tr></thead><tbody>";

    var redDims = [];
    var greenDims = [];

    for (var d = 0; d < MEMBER_DIMENSIONS.length; d++) {
      var dim = MEMBER_DIMENSIONS[d];
      var score = dimScores[dim.key];
      var sparse = isSparseDim(answers, dim.key);
      var rowClass = sparse ? ' class="dim-row-sparse"' : "";
      var scoreStr = score != null && isFinite(score) ? score.toFixed(1) : "—";
      var lev = global.levelFromScore(score);
      if (lev === "red" && score != null && isFinite(score)) redDims.push(dim.key);
      if (lev === "green" && score != null && isFinite(score)) greenDims.push(dim.key);

      html += "<tr" + rowClass + ">";
      html += '<td style="padding:4px 4px 4px 0;vertical-align:top;">' + dim.label + "</td>";
      html += '<td style="padding:4px;text-align:right;vertical-align:top;">' + scoreStr + "</td>";
      html += '<td style="padding:4px;vertical-align:top;">' + levelLabelZh(lev) + "</td>";
      html += '<td style="padding:4px;vertical-align:top;">' + (MEMBER_DIM_DESCRIPTIONS[dim.key] || "") + "</td>";
      html += "</tr>";
      if (sparse) {
        html += '<tr class="dim-row-sparse"><td colspan="4" style="font-size:0.78rem;color:#6b7280;padding:0 0 6px 0;">此範疇有效作答題數較少，資料較少，僅供參考。</td></tr>';
      }
    }

    html += "</tbody></table></div>";

    html += '<div class="report-section">';
    html += '<div class="report-section-title">需要特別關注的領域</div>';
    if (redDims.length === 0) {
      html += '<p class="note-small">目前沒有落在「紅色」門檻的範疇，或尚有題目未填導致無法判讀。</p>';
    } else {
      html += "<ul class=\"note-small\">";
      for (var r = 0; r < redDims.length; r++) {
        var rk = redDims[r];
        var lab = MEMBER_DIMENSIONS.filter(function (x) {
          return x.key === rk;
        })[0];
        html += "<li><strong>" + (lab ? lab.label : rk) + "：</strong> ";
        html += MEMBER_DIM_DESCRIPTIONS[rk] + " <em>建議：</em>" + MEMBER_ACTION_RED[rk] + "</li>";
      }
      html += "</ul>";
    }
    html += "</div>";

    html += '<div class="report-section">';
    html += '<div class="report-section-title">已有恩典的領域</div>';
    if (greenDims.length === 0) {
      html += '<p class="note-small">目前沒有落在「綠色」門檻的範疇，或尚有題目未填導致無法判讀。</p>';
    } else {
      html += "<ul class=\"note-small\">";
      for (var g = 0; g < greenDims.length; g++) {
        var gk = greenDims[g];
        var glab = MEMBER_DIMENSIONS.filter(function (x) {
          return x.key === gk;
        })[0];
        html += "<li><strong>" + (glab ? glab.label : gk) + "：</strong> ";
        html += MEMBER_DIM_DESCRIPTIONS[gk] + " <em>建議：</em>" + MEMBER_ACTION_GREEN[gk] + "</li>";
      }
      html += "</ul>";
    }
    html += "</div>";

    html += '<div class="report-section">';
    html += '<div class="report-section-title">保護與牧養聲明</div>';
    html +=
      "<p class=\"note-small\">本報告僅供個人在主前反省與與信任牧者／同伴討論之用，不是成績單或靈命排名。若你感到長期憂鬱、強烈無助或自我／他人安全受威脅，請盡快尋求專業協助與緊急支援。</p>";
    html += "</div>";

    host.innerHTML = html;
  }

  function updateMemberProgressUI() {
    var el = document.getElementById("member-answer-progress");
    if (!el) return;
    var n = 0;
    for (var i = 1; i <= 13; i++) {
      if (document.querySelector('input[name="q' + i + '"]:checked')) n++;
    }
    if (typeof global.SurveyUiCommon !== "undefined") {
      global.SurveyUiCommon.updateSurveyProgress({
        targetElement: el,
        totalQuestions: 13,
        answeredCount: n
      });
    } else {
      el.textContent = "已答 " + n + "／總 13 題";
    }
  }

  global.MEMBER_DIMENSIONS = MEMBER_DIMENSIONS;
  global.MEMBER_QUESTIONS = MEMBER_QUESTIONS;
  global.MEMBER_QUESTION_MAP = MEMBER_QUESTION_MAP;
  global.MEMBER_DIM_DESCRIPTIONS = MEMBER_DIM_DESCRIPTIONS;
  global.collectMemberAnswers = collectMemberAnswers;
  global.renderMemberReport = renderMemberReport;
  global.updateMemberProgressUI = updateMemberProgressUI;
  global.memberIsSparseDim = isSparseDim;
})(typeof globalThis !== "undefined" ? globalThis : this);
