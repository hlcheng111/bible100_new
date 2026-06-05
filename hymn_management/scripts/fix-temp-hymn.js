/**
 * 修復 temp_hymn.html 中損壞的 EMBEDDED 區塊
 * 執行: node scripts/fix-temp-hymn.js
 * 然後: node scripts/build-temp-embedded.js
 */
const fs = require('fs');
const path = require('path');
const TEMP_HTML = path.join(__dirname, '../temp_hymn.html');

let html = fs.readFileSync(TEMP_HTML, 'utf8');

// 損壞模式：filterHymnal 後直接接 orphaned JSON
const orphanStart = ';{"id":"hymn_00_0002"';
const funcMarker = 'function toFileUrl(sp)';
const fixBlock = `
      var filterAuthor = urlParams.get('author') || '';
      var filterTune = urlParams.get('tune') || '';
      var filterCatalog = urlParams.get('catalog') || '';
      var filterTags = (urlParams.get('tags') || '').split(/\\s+/).filter(Boolean);
      var filterSearch = (urlParams.get('search') || '').trim();
      var EMBEDDED = {};
`;

const orphanIdx = html.indexOf(orphanStart);
const funcIdx = html.indexOf(funcMarker);

if (orphanIdx < 0 || funcIdx < 0) {
  console.error('❌ 找不到損壞區塊', { orphanIdx, funcIdx });
  process.exit(1);
}

// before: 到並包含 ";" (filterHymnal 行結尾)
// replace: orphaned JSON 到 function toFileUrl 前
// after: function toFileUrl 開始
const before = html.slice(0, orphanIdx + 1);
const after = html.slice(funcIdx);

// build 腳本需要 endMarker '};\n\n      function toFileUrl'（2 個換行 + 6 空格）
html = before + fixBlock + '\n\n      ' + after;
fs.writeFileSync(TEMP_HTML, html, 'utf8');
console.log('✅ temp_hymn.html 已修復，請執行 node scripts/build-temp-embedded.js');
