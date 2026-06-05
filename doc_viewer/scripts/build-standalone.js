/**
 * 產生 viewer-standalone.html，內嵌 toc 與 hymn-index 資料
 * 供 file:// 直接開啟使用
 * 執行: node scripts/build-standalone.js
 */

const fs = require('fs');
const path = require('path');

const DOC_DIR = path.join(__dirname, '../hymnology_practical');
const TOC_FILE = path.join(DOC_DIR, 'toc.json');
const HYMN_FILE = path.join(DOC_DIR, 'hymn-index.json');
const VIEWER_FILE = path.join(__dirname, '../viewer.html');
const OUT_FILE = path.join(__dirname, '../viewer-standalone.html');

function main() {
  if (!fs.existsSync(TOC_FILE) || !fs.existsSync(HYMN_FILE)) {
    console.error('請先執行 build-toc.js 和 build-hymn-index.js');
    process.exit(1);
  }
  const toc = JSON.parse(fs.readFileSync(TOC_FILE, 'utf8'));
  const hymn = JSON.parse(fs.readFileSync(HYMN_FILE, 'utf8'));
  let html = fs.readFileSync(VIEWER_FILE, 'utf8');

  const dataScript = '<script id="embedded-data">\nwindow.DOC_TOC=' + JSON.stringify(toc) + ';\nwindow.DOC_HYMN_INDEX=' + JSON.stringify(hymn) + ';\n</script>\n';
  html = html.replace('</head>', dataScript + '</head>');

  fs.writeFileSync(OUT_FILE, html, 'utf8');
  console.log('已輸出 viewer-standalone.html（內嵌', toc.items.length, '筆 TOC、', hymn.items.length, '筆詩歌索引）');
}

main();
