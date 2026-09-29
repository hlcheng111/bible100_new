/**
 * 從 hymn_00/*.htm 抽取純文字歌詞，產生 data/hymn-lyrics-index.json（供側欄全文搜尋）
 * node scripts/build-hymn-lyrics-index.js
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const HYMN_DIR = path.join(__dirname, '../hymn/hymn_00');
const OUT = path.join(DATA_DIR, 'hymn-lyrics-index.json');

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function loadHymns() {
  const manifestPath = path.join(DATA_DIR, 'source-hymns-manifest.json');
  let hymns = [];
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.chunks.forEach(function (name) {
      const chunk = JSON.parse(fs.readFileSync(path.join(DATA_DIR, name), 'utf8'));
      if (chunk.hymns) hymns = hymns.concat(chunk.hymns);
    });
  } catch (_) {
    const raw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'source-hymns.json'), 'utf8'));
    hymns = raw.hymns || [];
  }
  return hymns;
}

const hymns = loadHymns();
const items = [];
let ok = 0;
let miss = 0;

hymns.forEach(function (h) {
  if (!h.id || !h.sourcePath) return;
  const rel = h.sourcePath.replace(/^\.\.\//, '');
  const filePath = path.join(__dirname, '../hymn', rel.replace(/^hymn\//, ''));
  const altPath = path.join(__dirname, '..', rel);
  const fp = fs.existsSync(filePath) ? filePath : (fs.existsSync(altPath) ? altPath : null);
  if (!fp) {
    miss++;
    return;
  }
  try {
    const html = fs.readFileSync(fp, 'utf8');
    const text = stripHtml(html).slice(0, 8000);
    if (text.length > 20) {
      items.push({ id: h.id, text: text });
      ok++;
    }
  } catch (_) {
    miss++;
  }
});

const out = {
  metadata: {
    built: new Date().toISOString(),
    total: items.length,
    missed: miss
  },
  items: items
};

fs.writeFileSync(OUT, JSON.stringify(out), 'utf8');
console.log('✅ hymn-lyrics-index.json:', ok, '首, 缺檔/失敗:', miss);
