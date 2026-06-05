/**
 * 從 Word 匯出的 HTML 解析 TOC（MsoToc1-9）
 * 只取最早的主 TOC、三層結構、過濾無效錨點
 * 執行: node scripts/validate-anchors.js && node scripts/build-toc.js
 */

const fs = require('fs');
const path = require('path');

const DOC_DIR = path.join(__dirname, '../hymnology_practical');
const HTML_FILE = path.join(DOC_DIR, 'hyH00《 實用聖詩學 》(鄭翰龍)  V.11  (2023) v2.htm');
const ANCHORS_FILE = path.join(DOC_DIR, 'valid-anchors.json');
const OUT_FILE = path.join(DOC_DIR, 'toc.json');
const EMBEDDED_FILE = path.join(DOC_DIR, 'toc-embedded.js');

function decodeEntities(str) {
  return str.replace(/&#(\d+);/g, function(_, n) {
    return String.fromCharCode(parseInt(n, 10));
  }).replace(/&nbsp;/g, ' ').trim();
}

function normalizeTitle(t) {
  return t
    .replace(/[\u3000\u00A0\s]{2,}/g, ' ')
    .replace(/[。．]\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractToc(html, validAnchors) {
  const all = [];
  const parts = html.split(/<p\s+class=MsoToc(\d)/gi);
  for (let i = 1; i < parts.length; i += 2) {
    const level = parseInt(parts[i], 10);
    const block = '<p class=MsoToc' + parts[i] + parts[i + 1];
    const endIdx = block.indexOf('</p>');
    const content = endIdx >= 0 ? block.slice(0, endIdx) : block;

    const anchorMatch = content.match(/_Toc\d+/);
    const anchor = anchorMatch ? anchorMatch[0] : null;
    if (!anchor || (validAnchors && !validAnchors.has(anchor))) continue;

    const linkMatch = content.match(/<a\s+href="#[^"]*"[^>]*>([\s\S]*?)<\/a>/i);
    let title = '';
    if (linkMatch) {
      const inner = linkMatch[1].replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ');
      title = decodeEntities(inner);
    }
    if (!title) {
      const entityMatches = content.match(/&#\d+;/g);
      title = entityMatches ? decodeEntities(entityMatches.join('')) : '';
    }
    title = normalizeTitle(title);
    if (!title) title = '(未解析)';

    const lvl = Math.min(level, 3);
    all.push({ level: lvl, anchor, title, rawTitle: title });
  }

  const chapterToc = [];
  const hymnIndexToc = [];
  const hymnIndexStartPattern = /^(詩歌名索引|聖詩名索引|Hymn\s*Index|Hymn\s*Title\s*Index)\s*$/i;
  for (const it of all) {
    if (hymnIndexStartPattern.test(it.rawTitle)) {
      hymnIndexToc.push(it);
    } else if (hymnIndexToc.length > 0) {
      hymnIndexToc.push(it);
    } else {
      chapterToc.push(it);
    }
  }
  return { chapterToc, hymnIndexToc };
}

function main() {
  if (!fs.existsSync(HTML_FILE)) {
    console.error('找不到 HTML 檔:', HTML_FILE);
    process.exit(1);
  }

  let validAnchors = null;
  if (fs.existsSync(ANCHORS_FILE)) {
    const a = JSON.parse(fs.readFileSync(ANCHORS_FILE, 'utf8'));
    validAnchors = new Set(a.anchors || []);
    console.log('已載入', validAnchors.size, '個有效錨點');
  } else {
    console.warn('未找到 valid-anchors.json，請先執行 validate-anchors.js');
  }

  console.log('讀取 HTML...');
  const html = fs.readFileSync(HTML_FILE, 'utf8');
  console.log('解析 TOC（章節 + 詩歌索引）...');
  const { chapterToc, hymnIndexToc } = extractToc(html, validAnchors);

  const out = {
    items: chapterToc,
    hymnIndexToc,
    generated: new Date().toISOString(),
    total: chapterToc.length,
    hymnIndexTotal: hymnIndexToc.length
  };
  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), 'utf8');
  fs.writeFileSync(EMBEDDED_FILE, 'window.DOC_TOC=' + JSON.stringify(out) + ';\n', 'utf8');
  console.log('已輸出 章節', chapterToc.length, '筆、詩歌索引', hymnIndexToc.length, '筆');
}

main();
