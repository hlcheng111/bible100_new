/**
 * C 區 · AI 備課與領袖報告（draft-first，人審後採用）
 */
(function (global) {
  "use strict";

  var LESSON_DRAFT_KEY = "education_lesson_drafts_v1";
  var REPORT_DRAFT_KEY = "education_leader_report_drafts_v1";

  function loadDrafts(key) {
    try {
      var raw = global.localStorage.getItem(key);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function saveDrafts(key, list) {
    global.localStorage.setItem(key, JSON.stringify(list.slice(0, 50)));
  }

  function buildLessonDraft(opts) {
    opts = opts || {};
    var topic = opts.topic || "本週課程";
    var scripture = opts.scripture || "—";
    return {
      id: "ld_" + Date.now(),
      createdAt: new Date().toISOString(),
      status: "draft",
      topic: topic,
      scripture: scripture,
      summary:
        "【AI 草稿·待審】\n「" +
        topic +
        "」（" +
        scripture +
        "）\n\n核心真理摘要（約 300 字）：\n因信稱義是福音核心。本課可強調：人的努力不能換取救恩，唯獨靠基督的義。\n\n破冰／小組討論（3 題）：\n1. 你曾在哪個情境感到「必須表現夠好才被接納」？\n2. 因信稱義如何改變你面對失敗的方式？\n3. 本週如何向一位朋友分享這份恩典？\n\n簡報大綱（繁／簡對照標題）：\n· 課題：" +
        topic +
        " / " +
        topic +
        "\n· 經文：" +
        scripture +
        "\n· 三點：恩典的源頭 · 信心的回應 · 生命的改變",
      hint: "請至 AI 工具中心設定 API 後可改為 LLM 生成；目前為規則模板草稿。"
    };
  }

  function buildLeaderReportDraft(stats) {
    stats = stats || {};
    var rate = stats.attendanceRate != null ? stats.attendanceRate + "%" : "尚無資料";
    var warnings = stats.warningCount != null ? stats.warningCount : 0;
    var classes = stats.classCount != null ? stats.classCount : 0;
    var students = stats.studentCount != null ? stats.studentCount : 0;
    return {
      id: "lr_" + Date.now(),
      createdAt: new Date().toISOString(),
      status: "draft",
      title: "教育部 " + new Date().getFullYear() + " 季報（草稿）",
      body:
        "【AI 草稿·待審】\n\n教育部摘要：\n目前共 " +
        classes +
        " 班、" +
        students +
        " 名學員。整體出席率 " +
        rate +
        "。" +
        (warnings > 0
          ? " 另有 " + warnings + " 位學員觸發連續缺席預警，建議牧養部與小組長提早介入關懷。"
          : " 本季缺席預警尚在可控範圍。") +
        "\n\n建議行動：\n1. 針對低出席班級安排家長聯繫\n2. 確認師資培訓班結業狀態\n3. 與 B 區門訓銜接下一階段課程",
      hint: "資料來源：educationSystemData 真實統計；發送前請主任牧師審閱。"
    };
  }

  function addLessonDraft(opts) {
    var d = buildLessonDraft(opts);
    var list = loadDrafts(LESSON_DRAFT_KEY);
    list.unshift(d);
    saveDrafts(LESSON_DRAFT_KEY, list);
    return d;
  }

  function addLeaderReportDraft(stats) {
    var d = buildLeaderReportDraft(stats);
    var list = loadDrafts(REPORT_DRAFT_KEY);
    list.unshift(d);
    saveDrafts(REPORT_DRAFT_KEY, list);
    return d;
  }

  function getLatestLessonDraft() {
    var list = loadDrafts(LESSON_DRAFT_KEY);
    return list[0] || null;
  }

  function getLatestReportDraft() {
    var list = loadDrafts(REPORT_DRAFT_KEY);
    return list[0] || null;
  }

  global.EducationAiHelper = {
    LESSON_DRAFT_KEY: LESSON_DRAFT_KEY,
    REPORT_DRAFT_KEY: REPORT_DRAFT_KEY,
    buildLessonDraft: buildLessonDraft,
    buildLeaderReportDraft: buildLeaderReportDraft,
    addLessonDraft: addLessonDraft,
    addLeaderReportDraft: addLeaderReportDraft,
    getLatestLessonDraft: getLatestLessonDraft,
    getLatestReportDraft: getLatestReportDraft,
    loadDrafts: loadDrafts
  };
})(typeof window !== "undefined" ? window : this);
