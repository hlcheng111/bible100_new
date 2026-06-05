/**
 * 詩集 ID 對照：5 本詩集（Index 命名）↔ 6 個資料夾（source-hymns）
 * 建置 build-temp-embedded.js 不會覆寫此檔
 * 唯一權威對照表
 *
 * 5 本詩集 vs 6 個資料夾對應（source-hymns 統計）：
 *   century_praise  → hymn_00  (812) 世紀頌讚
 *   new_hymnal      → hymn_22  (728) 新編讚美詩
 *   universal_praise→ hymn_pwc  (128) 普頌新/敬拜短歌
 *   lord_new_songs  → hymn_most(192) 頌主新歌/常用
 *   hymns_faith     → hymn_world(54)  Hymns of the Faith
 *   （未對應）      → hymn_chi  (101) 華人詩歌（跨詩集分類）
 */
(function() {
  // 5 本詩集 → 資料夾（folder = source-hymns 的 hymnal 欄位）
  window.HYMNAL_FOLDER_MAP = {
    century_praise:   { folder: 'hymn_00',  name: '世紀頌讚',   displayOrder: 1 },
    new_hymnal:       { folder: 'hymn_22',  name: '新編讚美詩', displayOrder: 2 },
    universal_praise:  { folder: 'hymn_pwc', name: '普頌新',     displayOrder: 3 },
    lord_new_songs:    { folder: 'hymn_most', name: '頌主新歌',  displayOrder: 4 },
    hymns_faith:       { folder: 'hymn_world', name: 'Hymns of the Faith', displayOrder: 5 }
  };

  // 舊 ID 對照（篩選用）：century_praise → hymn_00
  window.HYMNAL_ALIASES = {};
  for (const [k, v] of Object.entries(window.HYMNAL_FOLDER_MAP)) {
    window.HYMNAL_ALIASES[k] = v.folder;
  }

  // 反向：folder → 詩集 ID
  window.FOLDER_TO_HYMNAL = {};
  for (const [k, v] of Object.entries(window.HYMNAL_FOLDER_MAP)) {
    window.FOLDER_TO_HYMNAL[v.folder] = k;
  }

  window.normalizeHymnal = function(id) {
    return (id && window.HYMNAL_ALIASES[id]) ? window.HYMNAL_ALIASES[id] : (id || '');
  };
})();
