/**
 * 將 source-hymns.json 分割成多個小於 1.5MB 的檔案，以符合寄傳商單檔上傳限制（常見 2MB）
 * 執行：node scripts/split-source-hymns-for-upload.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const SOURCE = path.join(DATA_DIR, 'source-hymns.json');
const MAX_BYTES = 1.2 * 1024 * 1024; // 1.2 MB（保守，符合 2MB 限制）

const raw = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
const hymns = raw.hymns || [];
const metadata = raw.metadata || {};

// 將 C:/hymn/image_hymn/ 改為相對路徑 hymn/image_hymn/
function fixPaths(obj) {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    return obj.replace(/^C:\/hymn\/image_hymn\//i, 'hymn/image_hymn/')
              .replace(/^C:\/hymn\/image_author\//i, 'hymn/image_author/')
              .replace(/^C:\/hymn\/images\//i, 'hymn/images/');
  }
  if (Array.isArray(obj)) return obj.map(fixPaths);
  if (typeof obj === 'object') {
    const o = {};
    for (const k of Object.keys(obj)) o[k] = fixPaths(obj[k]);
    return o;
  }
  return obj;
}

const fixedHymns = hymns.map(h => fixPaths(h));

const chunks = [];
let current = [];
let currentSize = 2; // "[]" 

for (const h of fixedHymns) {
  const s = JSON.stringify(h);
  const addSize = (current.length ? 1 : 0) + s.length + 1; // comma + item
  if (currentSize + addSize > MAX_BYTES && current.length > 0) {
    chunks.push([...current]);
    current = [];
    currentSize = 2;
  }
  current.push(h);
  currentSize += (current.length > 1 ? 1 : 0) + s.length;
}
if (current.length > 0) chunks.push(current);

const manifest = { chunks: [] };
for (let i = 0; i < chunks.length; i++) {
  const name = `source-hymns-${i + 1}.json`;
  manifest.chunks.push(name);
  const chunkData = {
    metadata: i === 0 ? metadata : { part: i + 1, total: chunks.length },
    hymns: chunks[i]
  };
  fs.writeFileSync(path.join(DATA_DIR, name), JSON.stringify(chunkData), 'utf8');
  const sizeMB = (Buffer.byteLength(JSON.stringify(chunkData), 'utf8') / 1024 / 1024).toFixed(2);
  console.log(`  ${name}: ${chunks[i].length} 首, ${sizeMB} MB`);
}

fs.writeFileSync(path.join(DATA_DIR, 'source-hymns-manifest.json'), JSON.stringify(manifest), 'utf8');
console.log(`\n✅ 已分割為 ${chunks.length} 個檔案，清單: data/source-hymns-manifest.json`);
console.log('上傳時請一併上傳 data/ 內所有 source-hymns-*.json 與 source-hymns-manifest.json');
