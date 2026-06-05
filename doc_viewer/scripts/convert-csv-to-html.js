/**
 * 讀取 hymn-table.csv，產生 HTML 表格
 * 聖詩欄（及整列每格）為可點連結，不顯示第 7 欄「連結」
 * 執行: node scripts/convert-csv-to-html.js
 */

const fs = require('fs');
const path = require('path');

const DOC_DIR = path.join(__dirname, '../hymnology_practical');
const CSV_FILE = path.join(DOC_DIR, 'hymn-table.csv');
const JSON_FILE = path.join(DOC_DIR, 'hymn-table.json');

function parseCsvLine(line) {
  const result = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      let s = '';
      i++;
      while (i < line.length) {
        if (line[i] === '"') {
          i++;
          if (line[i] === '"') { s += '"'; i++; }
          else break;
        } else { s += line[i]; i++; }
      }
      result.push(s);
    } else {
      let s = '';
      while (i < line.length && line[i] !== ',') { s += line[i]; i++; }
      result.push(s);
      i++;
    }
  }
  return result;
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function main() {
  if (!fs.existsSync(CSV_FILE)) {
    console.error('找不到 hymn-table.csv，請先執行 build-hymn-table.js');
    process.exit(1);
  }

  const text = fs.readFileSync(CSV_FILE, 'utf8').replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) {
    console.error('CSV 無資料');
    process.exit(1);
  }

  const headers = parseCsvLine(lines[0]);
  const colLink = headers.indexOf('連結');
  const colIndex = headers.indexOf('Index');
  const colL1 = headers.indexOf('L1');
  const colL2 = headers.indexOf('L2');
  const colL3 = headers.indexOf('L3');
  const colL4 = headers.indexOf('L4');
  const colL5 = headers.indexOf('L5');
  const col聖詩 = headers.indexOf('聖詩');

  const displayCols = ['Index', 'L1', 'L2', 'L3', 'L4', 'L5', '聖詩'];
  const displayIndices = [colIndex, colL1, colL2, colL3, colL4, colL5, col聖詩].filter(i => i >= 0);

  const rows = [];
  for (let r = 1; r < lines.length; r++) {
    const cells = parseCsvLine(lines[r]);
    const link = colLink >= 0 ? (cells[colLink] || '') : '';
    rows.push({
      index: cells[colIndex] || '',
      L1: cells[colL1] || '',
      L2: cells[colL2] || '',
      L3: cells[colL3] || '',
      L4: cells[colL4] || '',
      L5: cells[colL5] || '',
      聖詩: cells[col聖詩] || '',
      連結: link
    });
  }

  const docPath = rows[0]?.連結 ? rows[0].連結.replace(/#.*$/, '') : 'hymnology_practical/hyH00《 實用聖詩學 》(鄭翰龍)  V.11  (2023) v2.htm';
  const out = { docPath, rows, generated: new Date().toISOString(), total: rows.length };
  fs.writeFileSync(JSON_FILE, JSON.stringify(out, null, 2), 'utf8');
  console.log('已輸出', rows.length, '筆至', path.basename(JSON_FILE));
}

main();
