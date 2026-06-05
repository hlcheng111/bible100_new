/**
 * 將 source-hymns 精簡後內嵌至 sidebar_playlist.html
 * 使 file:// 開啟時也能載入 2015 首詩歌
 * 執行: node build-sidebar-embedded.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const SIDEBAR_HTML = path.join(__dirname, '../sidebar_playlist.html');

// 嘗試載入 manifest + chunks，否則單一 source-hymns.json
let hymns = [];
try {
  const manifest = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'source-hymns-manifest.json'), 'utf8'));
  if (manifest.chunks && manifest.chunks.length) {
    manifest.chunks.forEach(name => {
      const p = path.join(DATA_DIR, name);
      if (fs.existsSync(p)) {
        const chunk = JSON.parse(fs.readFileSync(p, 'utf8'));
        if (chunk.hymns) hymns = hymns.concat(chunk.hymns);
      }
    });
  }
} catch (_) {}
if (hymns.length === 0) {
  const raw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'source-hymns.json'), 'utf8'));
  hymns = raw.hymns || [];
}

// 精簡欄位（僅 sidebar 所需）
const slim = hymns.map(h => ({
  id: h.id,
  number: h.number,
  title_zh: h.title_zh,
  title_en: h.title_en,
  hymnal: h.hymnal,
  sourcePath: h.sourcePath,
  author: h.author,
  tune: h.tune,
  catalogNumber: h.catalogNumber
})).filter(h => h.sourcePath);

const EMBEDDED = { metadata: { title: '聖詩完整索引', total: slim.length }, hymns: slim };
const jsonStr = JSON.stringify(EMBEDDED);

let html = fs.readFileSync(SIDEBAR_HTML, 'utf8');

const loaderTag = '<script src="data/source-hymns-loader.js"></script>';
const embeddedScript = '<script>window.EMBEDDED = ' + jsonStr + ';</script>';

// 若已有 EMBEDDED 則替換整段，否則插入在 loader 前
const oldEmbeddedRegex = /<script>window\.EMBEDDED = \{[\s\S]*?\};<\/script>\s*\n?\s*/;
if (oldEmbeddedRegex.test(html)) {
  html = html.replace(oldEmbeddedRegex, embeddedScript + '\n  ');
} else {
  html = html.replace(loaderTag, embeddedScript + '\n  ' + loaderTag);
}

fs.writeFileSync(SIDEBAR_HTML, html, 'utf8');
console.log('✅ sidebar_playlist.html 已內嵌 ' + slim.length + ' 首，file:// 可直接顯示');
