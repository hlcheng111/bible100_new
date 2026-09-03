/**
 * 六十六卷 · 分类 SSOT（跑道 / 多语查经 / landing 共用）
 */
(function (global) {
  'use strict';

  var GROUPS = [
    { id: 'law', labelZh: '律法书', labelEn: 'Law', min: 1, max: 5, css: 'b100-cat-law', emoji: '📕' },
    { id: 'history', labelZh: '历史书', labelEn: 'History', min: 6, max: 17, css: 'b100-cat-history', emoji: '📜' },
    { id: 'poetry', labelZh: '诗歌智慧书', labelEn: 'Poetry', min: 18, max: 22, css: 'b100-cat-poetry', emoji: '🎵' },
    { id: 'major', labelZh: '大先知书', labelEn: 'Major Prophets', min: 23, max: 27, css: 'b100-cat-major', emoji: '📣' },
    { id: 'minor', labelZh: '小先知书', labelEn: 'Minor Prophets', min: 28, max: 39, css: 'b100-cat-minor', emoji: '📢' },
    { id: 'gospel', labelZh: '福音书', labelEn: 'Gospels', min: 40, max: 43, css: 'b100-cat-gospel', emoji: '✝️' },
    { id: 'acts', labelZh: '使徒行传', labelEn: 'Acts', min: 44, max: 44, css: 'b100-cat-acts', emoji: '🕊️' },
    { id: 'paul', labelZh: '保罗书信', labelEn: "Paul's Letters", min: 45, max: 57, css: 'b100-cat-paul', emoji: '✉️' },
    { id: 'general', labelZh: '一般书信', labelEn: 'General Epistles', min: 58, max: 65, css: 'b100-cat-general', emoji: '📬' },
    { id: 'revelation', labelZh: '启示录', labelEn: 'Revelation', min: 66, max: 66, css: 'b100-cat-revelation', emoji: '🔥' },
  ];

  function groupForBookId(bookId) {
    var id = parseInt(bookId, 10);
    for (var i = 0; i < GROUPS.length; i++) {
      var g = GROUPS[i];
      if (id >= g.min && id <= g.max) return g;
    }
    return null;
  }

  function groupsForFilter(filter) {
    if (filter === 'OT') return GROUPS.filter(function (g) { return g.max <= 39; });
    if (filter === 'NT') return GROUPS.filter(function (g) { return g.min >= 40; });
    return GROUPS.slice();
  }

  function labelForGroup(g, loc) {
    if (!g) return '';
    loc = loc || 'zh-Hant';
    if (loc === 'en' && g.labelEn) return g.emoji + ' ' + g.labelEn;
    return g.emoji + ' ' + g.labelZh;
  }

  global.B100BookCatalog = {
    GROUPS: GROUPS,
    groupForBookId: groupForBookId,
    groupsForFilter: groupsForFilter,
    labelForGroup: labelForGroup,
  };
})(typeof window !== 'undefined' ? window : global);
