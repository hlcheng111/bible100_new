/**
 * Smart Ministry report column dictionary (single source of truth)
 * Keep common columns aligned across matching and skill exports.
 */
(function (global) {
  var COMMON = [
    '姓名',
    'personId',
    '主要恩賜',
    'MBTI',
    '崗位',
    '配對分數',
    '狀態',
    '來源',
    '時間'
  ];

  global.SMART_MINISTRY_REPORT_COLUMNS = {
    COMMON: COMMON,
    MATCHING: COMMON.concat(['優先度', '需求']),
    SKILL: COMMON.concat(['技能名稱', '技能分類', '技能等級'])
  };
})(typeof window !== 'undefined' ? window : this);

