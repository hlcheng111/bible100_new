/**
 * 將 source-hymns.json 精簡後內嵌至 temp_hymn.html
 * 使 file:// 開啟時也能顯示 2015 首
 * 執行: node build-temp-embedded.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const TEMP_HTML = path.join(__dirname, '../temp_hymn.html');

const sourcePath = path.join(DATA_DIR, 'source-hymns.json');
const overridesPath = path.join(DATA_DIR, 'hymn-overrides.json');
const raw = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
let overrides = {}, additions = [];
try {
  const ov = JSON.parse(fs.readFileSync(overridesPath, 'utf8'));
  overrides = ov.overrides || ov;
  additions = ov.additions || [];
} catch (_) {}

const hymns = (raw.hymns || []).map(h => {
    const o = overrides[h.id] || {};
    return {
    id: h.id,
    number: o.number ?? h.number,
    title_zh: o.title_zh ?? h.title_zh ?? '',
    title_en: o.title_en ?? h.title_en ?? '',
    hymnal: o.hymnal ?? h.hymnal ?? '',
    sourcePath: o.sourcePath ?? h.sourcePath ?? '',
    author: o.author ?? h.author ?? '',
    tune: o.tune ?? h.tune ?? '',
    catalogNumber: o.catalogNumber ?? h.catalogNumber ?? '',
  };
  });
const allHymns = hymns.concat(additions.filter(a => a && a.id));
const slim = {
  metadata: raw.metadata || { title: '聖詩完整索引', extracted: '', total: allHymns.length },
  hymns: allHymns,
};

const jsonStr = JSON.stringify(slim);

let html = fs.readFileSync(TEMP_HTML, 'utf8');

const startMarker = '<!-- EMBEDDED_DATA_START -->';
const endMarker = '<!-- EMBEDDED_DATA_END -->';
const startIdx = html.indexOf(startMarker);
const endIdx = html.indexOf(endMarker);

if (startIdx >= 0 && endIdx > startIdx) {
  const before = html.slice(0, startIdx + startMarker.length);
  const after = html.slice(endIdx);
  html = before + '\n      var EMBEDDED = ' + jsonStr + ';\n\n      ' + after;
  fs.writeFileSync(TEMP_HTML, html, 'utf8');
  console.log('✅ temp_hymn.html 已內嵌 2015 首，file:// 可直接顯示');
} else {
  console.error('❌ 找不到替換區塊', { startIdx, endIdx });
  process.exit(1);
}
