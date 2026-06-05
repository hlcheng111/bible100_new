/**
 * 從 toc.json 的 hymnIndexToc 篩選詩歌索引
 * 智慧分類：section, subsection, author, hymn, reference
 * 只保留有效錨點
 * 執行: node scripts/validate-anchors.js && node scripts/build-toc.js && node scripts/build-hymn-index.js
 */

const fs = require('fs');
const path = require('path');

const DOC_DIR = path.join(__dirname, '../hymnology_practical');
const TOC_FILE = path.join(DOC_DIR, 'toc.json');
const ANCHORS_FILE = path.join(DOC_DIR, 'valid-anchors.json');
const OUT_FILE = path.join(DOC_DIR, 'hymn-index.json');
const EMBEDDED_FILE = path.join(DOC_DIR, 'hymn-index-embedded.js');

function normalizeTitle(t) {
  return (t || '')
    .replace(/[\u3000\u00A0\s]{2,}/g, ' ')
    .replace(/[。．]\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanHymnTitle(t) {
  return t
    .replace(/^第\s*首\s*[、，,．.]?\s*/g, '')
    .replace(/[、，,：:]\s*第\s*首\s*$/g, '')
    .replace(/\s*；\s*第\s*首\s*$/g, '')
    .replace(/\s*第\s*首\s*等\s*$/g, '')
    .replace(/[：:]\s*第\s*首\s*$/g, '')
    .trim();
}

function categorize(title) {
  const t = title || '';
  if (/^聖詩\s*[:：]\s*/.test(t)) return 'hymn';
  if (/調名\s*[:：]\s*/i.test(t) || /^[A-Z][a-z]+\s+\d+\s+[^\u4e00-\u9fff]*$/.test(t)) return 'tune';
  if (/\[聖詩歷史\s+時期\s+\d+\]/.test(t)) return 'section';
  if (/^[甲乙丙丁戊己庚辛]\s+[\u4e00-\u9fff]/.test(t)) return 'section';
  if (/參考(文章|視頻)[：:]/i.test(t) || /YouTube|infographic/i.test(t)) return 'reference';
  if (/\[詞作者\]|\[詞，曲作者\]|\[曲作者\]|\[拉丁\s*詩歌\s*翻译\]|詞作者|曲作者/i.test(t)) return 'author';
  if (/^[A-Z][a-z]+.*,\s*(St\.\s*)?[\u4e00-\u9fff\u4e00-\u9fa5].*\(\d{3,4}-\d{3,4}\)/.test(t)) return 'author';
  if (/^[A-Za-z]\d{2}\s*[\u4e00-\u9fff]/.test(t)) return 'subsection';
  if (/《[^》]+》/.test(t) || /^[A-Z][a-z].*\s+\d+\s+[^\u4e00-\u9fff]*$/.test(t)) return 'hymn';
  return 'hymn';
}

function isJunk(title) {
  const t = (title || '').replace(/\s/g, '');
  if (!t || t.length < 2) return true;
  if (/^[。.、,@#\[\]（）；；：:＠]+$/.test(t)) return true;
  if (/^＠\s/.test(t) || /^＠\./.test(t)) return true;
  if (/^調名\s*[:：]\s*#?\s*$/.test(t)) return true;
  if (/^[。.、,@#\[\]]+/.test(t)) return true;
  if (/^[；：:（）\[\]\.、]+$/.test(t)) return true;
  if (/^[^\u4e00-\u9fffA-Za-z]+$/.test(t)) return true;
  return false;
}

function main() {
  if (!fs.existsSync(TOC_FILE)) {
    console.error('請先執行 build-toc.js');
    process.exit(1);
  }

  let validAnchors = null;
  if (fs.existsSync(ANCHORS_FILE)) {
    const a = JSON.parse(fs.readFileSync(ANCHORS_FILE, 'utf8'));
    validAnchors = new Set(a.anchors || []);
  }

  const toc = JSON.parse(fs.readFileSync(TOC_FILE, 'utf8'));
  const items = (toc.hymnIndexToc && toc.hymnIndexToc.length > 0) ? toc.hymnIndexToc : (toc.items || []);
  const fromHeadings = toc.source === 'headings';

  const hymns = [];
  const seen = new Set();

  for (const it of items) {
    let title = normalizeTitle(it.title || it.rawTitle || '');
    if (!it.anchor || !title) continue;
    if (!fromHeadings && validAnchors && !validAnchors.has(it.anchor)) continue;
    if (isJunk(title)) continue;
    if (seen.has(it.anchor)) continue;
    seen.add(it.anchor);

    title = cleanHymnTitle(title);
    if (!title) continue;

    const cat = categorize(title);
    const hasZh = /[\u4e00-\u9fff]/.test(title);
    const hasEn = /[A-Za-z]/.test(title);

    hymns.push({
      anchor: it.anchor,
      title,
      category: cat,
      titleZh: hasZh ? title.replace(/[^\u4e00-\u9fff]/g, '') : '',
      titleEn: hasEn ? title.replace(/[^A-Za-z\s]/g, ' ').replace(/\s+/g, ' ').trim() : ''
    });
  }

  const catOrder = { section: 0, subsection: 1, author: 2, tune: 3, hymn: 4, reference: 5 };
  hymns.sort((a, b) => {
    const ca = catOrder[a.category] ?? 5;
    const cb = catOrder[b.category] ?? 5;
    if (ca !== cb) return ca - cb;
    const za = (a.titleZh || a.title).localeCompare(b.titleZh || b.title, 'zh');
    if (za !== 0) return za;
    return (a.titleEn || '').localeCompare(b.titleEn || '', 'en');
  });

  const out = { items: hymns, generated: new Date().toISOString(), total: hymns.length };
  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), 'utf8');
  fs.writeFileSync(EMBEDDED_FILE, 'window.DOC_HYMN_INDEX=' + JSON.stringify(out) + ';\n', 'utf8');
  console.log('已輸出', hymns.length, '筆詩歌索引至', path.basename(OUT_FILE));
}

main();
