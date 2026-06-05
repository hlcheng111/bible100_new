/**
 * 從 toc.json 抽出第 6 層聖詩，還原 L1-L5 層級，輸出 CSV 與 JSON
 * 表格欄位：Index, L1, L2, L3, L4, L5, 聖詩（連結藏在資料中，HTML 不顯示第 7 欄）
 * 執行: node scripts/build-hymn-table.js
 */

const fs = require('fs');
const path = require('path');

const DOC_DIR = path.join(__dirname, '../hymnology_practical');
const TOC_FILE = path.join(DOC_DIR, 'toc.json');
const CSV_FILE = path.join(DOC_DIR, 'hymn-table.csv');
const JSON_FILE = path.join(DOC_DIR, 'hymn-table.json');
const EMBEDDED_FILE = path.join(DOC_DIR, 'hymn-table-embedded.js');

const DOC_FILENAME = 'hyH00《 實用聖詩學 》(鄭翰龍)  V.11  (2023) v2.htm';

function escapeCsv(val) {
  if (val == null) return '';
  const s = String(val).replace(/"/g, '""');
  return s.includes(',') || s.includes('"') || s.includes('\n') ? '"' + s + '"' : s;
}

function main() {
  if (!fs.existsSync(TOC_FILE)) {
    console.error('找不到 toc.json，請先執行 build-toc-from-headings.js');
    process.exit(1);
  }

  const toc = JSON.parse(fs.readFileSync(TOC_FILE, 'utf8'));
  const items = toc.items || [];

  const stack = [null, null, null, null, null]; // L1..L5
  const rows = [];
  let index = 0;

  for (const it of items) {
    const lvl = it.level || 1;
    const title = (it.title || it.rawTitle || '').trim();
    const anchor = it.anchor || '';

    if (lvl >= 1 && lvl <= 5) {
      stack[lvl - 1] = title;
      for (let i = lvl; i < 5; i++) stack[i] = null;
    } else if (lvl === 6 && anchor && title) {
      index++;
      const link = anchor.startsWith('http') ? anchor : DOC_FILENAME + '#' + anchor;
      rows.push({
        index: index,
        L1: stack[0] || '',
        L2: stack[1] || '',
        L3: stack[2] || '',
        L4: stack[3] || '',
        L5: stack[4] || '',
        聖詩: title,
        連結: link,
        anchor: anchor
      });
    }
  }

  // CSV: Index, L1, L2, L3, L4, L5, 聖詩, 連結（連結供 convert 使用，HTML 不顯示）
  const headers = ['Index', 'L1', 'L2', 'L3', 'L4', 'L5', '聖詩', '連結'];
  const csvLines = [headers.map(escapeCsv).join(',')];
  for (const r of rows) {
    csvLines.push([r.index, r.L1, r.L2, r.L3, r.L4, r.L5, r.聖詩, r.連結].map(escapeCsv).join(','));
  }
  fs.writeFileSync(CSV_FILE, '\uFEFF' + csvLines.join('\n'), 'utf8');

  const out = {
    docPath: DOC_FILENAME,
    rows,
    generated: new Date().toISOString(),
    total: rows.length
  };
  fs.writeFileSync(JSON_FILE, JSON.stringify(out, null, 2), 'utf8');
  fs.writeFileSync(EMBEDDED_FILE, 'window.HYMN_TABLE=' + JSON.stringify(out) + ';\n', 'utf8');

  console.log('已輸出', rows.length, '筆聖詩表格');
  console.log('  CSV:', path.basename(CSV_FILE));
  console.log('  JSON:', path.basename(JSON_FILE));
  console.log('  embedded:', path.basename(EMBEDDED_FILE));
}

main();
