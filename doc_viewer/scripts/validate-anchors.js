/**
 * 從 HTML 提取所有有效錨點 name="_Toc..."
 * 輸出 valid-anchors.json 供 build-toc、build-hymn-index 使用
 * 執行: node scripts/validate-anchors.js
 */

const fs = require('fs');
const path = require('path');

const DOC_DIR = path.join(__dirname, '../hymnology_practical');
const HTML_FILE = path.join(DOC_DIR, 'hyH00《 實用聖詩學 》(鄭翰龍)  V.11  (2023) v2.htm');
const OUT_FILE = path.join(DOC_DIR, 'valid-anchors.json');

function main() {
  if (!fs.existsSync(HTML_FILE)) {
    console.error('找不到 HTML 檔:', HTML_FILE);
    process.exit(1);
  }
  const html = fs.readFileSync(HTML_FILE, 'utf8');
  const anchors = new Set();
  const re = /name=["'](_Toc\d+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    anchors.add(m[1]);
  }
  const arr = Array.from(anchors).sort();
  const out = { anchors: arr, total: arr.length, generated: new Date().toISOString() };
  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), 'utf8');
  console.log('已輸出', arr.length, '個有效錨點至', path.basename(OUT_FILE));
}

main();
