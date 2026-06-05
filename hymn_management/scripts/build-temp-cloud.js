/**
 * 產生雲端用 temp_hymn_cloud.html（無內嵌資料，約 30KB）
 * 解決「Disk quota exceeded」：主機限制單檔大小，內嵌 800KB 會超限
 * 雲端以 HTTP 載入 data/source-hymns.json 即可
 * 執行: node scripts/build-temp-cloud.js
 */

const fs = require('fs');
const path = require('path');

const TEMP_HTML = path.join(__dirname, '../temp_hymn.html');
const OUTPUT = path.join(__dirname, '../temp_hymn_cloud.html');

let html = fs.readFileSync(TEMP_HTML, 'utf8');

const startMarker = '<!-- EMBEDDED_DATA_START -->';
const endMarker = '<!-- EMBEDDED_DATA_END -->';
const startIdx = html.indexOf(startMarker);
const endIdx = html.indexOf(endMarker);

if (startIdx >= 0 && endIdx > startIdx) {
  const replacement = startMarker + '\n      var EMBEDDED = { hymns: [] };\n      ' + endMarker;
  html = html.slice(0, startIdx) + replacement + html.slice(endIdx + endMarker.length);
  fs.writeFileSync(OUTPUT, html, 'utf8');
  const size = (fs.statSync(OUTPUT).size / 1024).toFixed(1);
  console.log('✅ temp_hymn_cloud.html 已產生（' + size + ' KB）');
  console.log('   上傳時可覆蓋為 temp_hymn.html，或改連結指向 temp_hymn_cloud.html');
} else {
  console.error('❌ 找不到替換區塊');
  process.exit(1);
}
