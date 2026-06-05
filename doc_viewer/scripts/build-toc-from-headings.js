/**
 * 從 HTML 標題 (h1-h6) 解析 TOC，使用實際存在的 name= 錨點
 * 6 層結構：A-K > 章節 > 時期(H01) > 分段 > 作者 > 詩歌
 * 注意：H07–K 區塊若原文標題無錨點，需在 Word 中為標題加入書籤後重新匯出
 * 執行: node scripts/build-toc-from-headings.js
 */

const fs = require('fs');
const path = require('path');

const DOC_DIR = path.join(__dirname, '../hymnology_practical');
const HTML_FILE = path.join(DOC_DIR, 'hyH00《 實用聖詩學 》(鄭翰龍)  V.11  (2023) v2.htm');
const OUT_FILE = path.join(DOC_DIR, 'toc.json');
const EMBEDDED_FILE = path.join(DOC_DIR, 'toc-embedded.js');

function decodeEntities(str) {
  return str.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

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

  const html = fs.readFileSync(HTML_FILE, 'utf8');
  const items = [];

  const headingRe = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m;
  while ((m = headingRe.exec(html)) !== null) {
    const level = parseInt(m[1], 10);
    const content = m[2];

    const anchorMatch = content.match(/<a\s+name=["']([^"']+)["']/);
    if (!anchorMatch) continue;

    const anchor = anchorMatch[1];
    if (!/^_Toc\d+|^_H[0-9A-Za-z_]+/.test(anchor)) continue;

    let title = extractText(content);
    if (!title || title.length < 2) continue;

    title = title.replace(/\[\s*$/g, '').trim();
    if (title.length < 2) continue;

    items.push({
      level: Math.min(level, 6),
      anchor,
      title,
      rawTitle: title
    });
  }

  const seen = new Set();
  let unique = [];
  for (const it of items) {
    const key = it.anchor + '|' + it.title;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(it);
  }
  // 過濾第一段：只保留「總章節索引」起，合併為單一段
  const startIdx = unique.findIndex(it => /總章節索引/.test(it.title || it.rawTitle || ''));
  if (startIdx >= 0) unique = unique.slice(startIdx);

  const out = {
    items: unique,
    generated: new Date().toISOString(),
    total: unique.length,
    source: 'headings'
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), 'utf8');
  fs.writeFileSync(EMBEDDED_FILE, 'window.DOC_TOC=' + JSON.stringify(out) + ';\n', 'utf8');
  console.log('已從標題解析', unique.length, '筆 TOC（6 層）');
}

main();
