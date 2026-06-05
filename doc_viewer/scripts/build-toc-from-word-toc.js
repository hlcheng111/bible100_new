/**
 * 從 Word TOC 區塊解析，補齊 H07–K 等（僅解析前 2MB 以加速）
 * 需與 build-toc-from-headings 產出的 toc.json 合併
 * 執行: node scripts/build-toc-from-word-toc.js
 */

const fs = require('fs');
const path = require('path');

const DOC_DIR = path.join(__dirname, '../hymnology_practical');
const HTML_FILE = path.join(DOC_DIR, 'hyH00《 實用聖詩學 》(鄭翰龍)  V.11  (2023) v2.htm');
const TOC_FILE = path.join(DOC_DIR, 'toc.json');
const OUT_FILE = path.join(DOC_DIR, 'toc.json');
const EMBEDDED_FILE = path.join(DOC_DIR, 'toc-embedded.js');
const CHUNK = 10 * 1024 * 1024;

function extractText(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function main() {
  if (!fs.existsSync(HTML_FILE)) {
    console.error('找不到 HTML 檔:', HTML_FILE);
    process.exit(1);
  }
  const fd = fs.openSync(HTML_FILE, 'r');
  const buf = Buffer.alloc(CHUNK);
  fs.readSync(fd, buf, 0, CHUNK, 0);
  fs.closeSync(fd);
  const html = buf.toString('utf8');

  const tocStart = html.indexOf('<p class=MsoToc1');
  const hymnIdx = tocStart >= 0 ? html.indexOf('Hymn Index', tocStart) : -1;
  const sliceEnd = (tocStart >= 0 && hymnIdx > tocStart) ? hymnIdx + 100 : tocStart + 500000;
  const tocHtml = tocStart >= 0 ? html.slice(tocStart, sliceEnd) : '';

  const items = [];
  const tocRe = /<p\s+class="?MsoToc([1-9])"?[^>]*>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = tocRe.exec(tocHtml)) !== null) {
    const level = Math.min(parseInt(m[1], 10), 6);
    const block = m[2];
    const anchorMatch = block.match(/_Toc\d+|_H[0-9A-Za-z_]+/);
    if (!anchorMatch) continue;
    const anchor = anchorMatch[0];
    let title = extractText(block);
    if (!title || title.length < 2) continue;
    title = title.replace(/\[\s*$/g, '').trim();
    const idx = title.indexOf('PAGEREF');
    if (idx >= 0) title = title.slice(0, idx).trim();
    if (title.length < 2) continue;
    if (/^Hymn\s*Index|^詩歌索引$/i.test(title.replace(/\s+/g, ' ').trim())) break;
    items.push({ level, anchor, title, rawTitle: title });
  }

  let base = { items: [], generated: '', total: 0, source: 'headings' };
  if (fs.existsSync(TOC_FILE)) {
    base = JSON.parse(fs.readFileSync(TOC_FILE, 'utf8'));
  }
  const byAnchor = new Map();
  const order = [];
  for (const it of base.items || []) {
    if (!byAnchor.has(it.anchor)) order.push(it.anchor);
    byAnchor.set(it.anchor, it);
  }
  for (const it of items) {
    if (!byAnchor.has(it.anchor)) order.push(it.anchor);
    if (!byAnchor.has(it.anchor) || /PAGEREF/.test(byAnchor.get(it.anchor).title)) byAnchor.set(it.anchor, it);
  }
  let unique = order.map(a => byAnchor.get(a)).filter(Boolean);
  // 過濾第一段：實用聖詩學目錄、主要章節索引及其子項，只保留「總章節索引」起
  const startIdx = unique.findIndex(it => /總章節索引/.test(it.title || it.rawTitle || ''));
  if (startIdx >= 0) unique = unique.slice(startIdx);
  const out = { items: unique, generated: new Date().toISOString(), total: unique.length, source: 'headings+toc' };
  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), 'utf8');
  fs.writeFileSync(EMBEDDED_FILE, 'window.DOC_TOC=' + JSON.stringify(out) + ';\n', 'utf8');
  console.log('已從 Word TOC 補齊，共', unique.length, '筆 TOC');
}

main();
