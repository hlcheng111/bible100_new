/**
 * 聖詩完整提取腳本（3000+ 頁）
 * 1. 從 index_hymnal 取得詩歌清單與路徑
 * 2. 逐頁讀取 HTML，擷取樂譜圖、YouTube、作者照、歌詞等
 * 3. 合併輸出 source-hymns.json + hymns-index.json
 * 執行: node extract-full.js [--limit N] [--scan] [--sample 20]
 *   --scan: 掃描 hymn_* 資料夾取得全部詩歌（約 2000+ 首）
 *   --sample N: 各詩集取 3–4 首，共約 N 首測試樣本
 */

const fs = require('fs');
const path = require('path');

let iconv;
try {
  iconv = require('iconv-lite');
} catch (e) {
  console.error('請先安裝 iconv-lite: npm install iconv-lite');
  process.exit(1);
}

const HYMN_ROOT = path.join(__dirname, '..');
const INDEX_DIR = path.join(HYMN_ROOT, 'index_hymnal');
const DATA_DIR = path.join(__dirname, '../../Users/hlche/.cursor/bible100_new/hymn_management/data');

const HYMNAL_SOURCES = [
  { file: 'Index_hl_世紀頌讚.htm', hymnal: 'century_praise', encoding: 'big5' },
  { file: 'Index_hl頌主新歌.htm', hymnal: 'lord_new_songs', encoding: 'big5' },
  { file: 'ndex_hl_新編讚美詩.htm', hymnal: 'new_hymnal', encoding: 'big5' },
  { file: 'Index_hl_普頌新.htm', hymnal: 'universal_praise', encoding: 'big5' },
];

const SYMBOL_MAP = { '▲': 'world_famous', '●': 'chinese', '◆': 'worship', '★': 'ethnic' };
const LIMIT = process.argv.includes('--limit') ? parseInt(process.argv[process.argv.indexOf('--limit') + 1], 10) : 0;
const USE_SCAN = process.argv.includes('--scan');
const SAMPLE = process.argv.includes('--sample') ? parseInt(process.argv[process.argv.indexOf('--sample') + 1], 10) || 20 : 0;

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

function extractFromIndex(html, hymnal) {
  const entries = [];
  const seen = new Set();
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let m;

  while ((m = rowRegex.exec(html)) !== null) {
    const row = m[1];
    const tds = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
    if (!tds || tds.length < 2) continue;

    const col1 = tds[0].replace(/<td[^>]*>|<\/td>/gi, '');
    const col2 = tds[1].replace(/<td[^>]*>|<\/td>/gi, '');
    const numMatch = col1.match(/^[^0-9]*(\d{1,4})\.?\s/);
    const number = numMatch ? numMatch[1].padStart(3, '0') : null;

    const zhLink = col1.match(/<a[^>]*>([^<]+)<\/a>/);
    let title_zh = zhLink ? decodeHtmlEntities(zhLink[1]) : '';

    const localLink = col2.match(/<a[^>]*href="(\.\.\/hymn_[^"]+\.htm)"[^>]*>([^<]*)<\/a>/i);
    const sourcePath = localLink ? localLink[1] : '';
    let title_en = localLink ? decodeHtmlEntities(localLink[2]).replace(/\s+/g, ' ').trim() : '';

    if (!number) continue;
    const key = `${hymnal}-${number}`;
    if (seen.has(key)) continue;
    seen.add(key);

    let symbol = '', category = 'unknown';
    const full = (title_zh + title_en + col1 + col2);
    for (const [sym, cat] of Object.entries(SYMBOL_MAP)) {
      if (full.includes(sym)) { symbol = sym; category = cat; break; }
    }

    entries.push({
      hymnal, number,
      title_zh: title_zh || title_en || '',
      title_en: title_en || title_zh || '',
      sourcePath,
      symbol, category,
    });
  }
  return entries;
}

function scanHymnFolders() {
  const folders = ['hymn_00', 'hymn_most', 'hymn_pwc', 'hymn_chi', 'hymn_world', 'hymn_22'];
  const entries = [];
  for (const folder of folders) {
    const dir = path.join(HYMN_ROOT, folder);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.htm') && !f.includes('_vti_cnf'));
    let idx = 0;
    for (const f of files) {
      idx++;
      const num = String(idx).padStart(4, '0');
      const base = f.replace(/\.htm$/i, '');
      const parts = base.split(/\s+_\s+/);
      const title_en = parts[0] ? parts[0].replace(/^\d+\s+\d+\s+/, '').trim() : base;
      const title_zh = parts[1] ? parts[1].replace(/\s*[▲●◆★].*$/, '').trim() : '';
      entries.push({
        hymnal: folder,
        number: num,
        title_zh: title_zh || title_en,
        title_en: title_en || title_zh,
        sourcePath: `../${folder}/${f}`,
        symbol: /▲/.test(base) ? '▲' : /●/.test(base) ? '●' : /◆/.test(base) ? '◆' : /★/.test(base) ? '★' : '',
        category: 'unknown',
      });
    }
  }
  return entries;
}

function pickSampleEntries(allEntries, targetCount = 20) {
  const byFolder = {};
  for (const e of allEntries) {
    if (!byFolder[e.hymnal]) byFolder[e.hymnal] = [];
    byFolder[e.hymnal].push(e);
  }
  const folders = ['hymn_00', 'hymn_most', 'hymn_pwc', 'hymn_chi', 'hymn_world', 'hymn_22'];
  const base = Math.floor(targetCount / folders.length);
  const extra = targetCount - base * folders.length;
  const result = [];
  for (let i = 0; i < folders.length; i++) {
    const folder = folders[i];
    const list = byFolder[folder] || [];
    const take = Math.min(base + (i < extra ? 1 : 0), list.length);
    for (let j = 0; j < take; j++) result.push(list[j]);
  }
  return result.slice(0, targetCount);
}

function extractFromHymnPage(html, filePath) {
  const result = {
    scoreImages: [],
    youtube: [],
    authorImage: '',
    lyrics_zh: '',
    lyrics_en: '',
    theology: '',
    history: '',
    author: '',
    translator: '',
    tune: '',
    catalogNumber: '',
  };

  const baseDir = path.dirname(filePath);

  // Author: "Author: William Williams (1745)" or similar (greedy to get full name)
  const authorMatch = html.match(/Author:\s*([^<(]+)(?:\s*\(\d{4}\))?/i);
  if (authorMatch) result.author = decodeHtmlEntities(authorMatch[1]).trim();

  // Translator: "Translator: Peter Williams (1771)" or similar
  const transMatch = html.match(/Translator:\s*([^<(]+)(?:\s*\(\d{4}\))?/i);
  if (transMatch) result.translator = decodeHtmlEntities(transMatch[1]).trim();

  // Tune: hymnary.org/tune/... link text, or standalone tune name (e.g. CWM RHONDDA)
  const tuneLinkMatch = html.match(/<a[^>]*href=["']https?:\/\/hymnary\.org\/tune\/[^"']+["'][^>]*>([^<]+)<\/a>/i);
  if (tuneLinkMatch) {
    result.tune = decodeHtmlEntities(tuneLinkMatch[1]).trim();
  } else {
    const tuneInline = html.match(/\b([A-Z][A-Z\s]{2,20})\s*(?:<\/[ab]|$)/);
    if (tuneInline) result.tune = tuneInline[1].trim();
  }

  // Catalog number: e.g. 生命027, H04B-01J (prefer 生命XXX format from title)
  const catalogMatch = html.match(/生命\s*(\d{2,4}[A-Z]?)/);
  if (catalogMatch) result.catalogNumber = '生命' + catalogMatch[1];
  else {
    const catalogAlt = html.match(/(H\d{2}[A-Z]?[-_]?\d+[A-Z]?)/);
    if (catalogAlt) result.catalogNumber = catalogAlt[1];
  }

  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let imgM;
  while ((imgM = imgRegex.exec(html)) !== null) {
    let src = imgM[1].trim();
    if (src.startsWith('../')) {
      src = path.normalize(path.join(baseDir, src)).replace(/\\/g, '/');
    }
    if (/image_hymn|hymnary\.org\/page\/fetch|squarespace|fuyinchina|\.jpg|\.png|\.jpeg/i.test(src)) {
      if (!result.scoreImages.includes(src)) result.scoreImages.push(src);
    }
    if (/image_author/i.test(src) && !result.authorImage) {
      result.authorImage = src;
    }
  }

  const ytRegex = /<a[^>]*href=["'](https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[^"']+)["'][^>]*>/gi;
  let ytM;
  while ((ytM = ytRegex.exec(html)) !== null) {
    const url = ytM[1].replace(/&amp;/g, '&');
    if (!result.youtube.includes(url)) result.youtube.push(url);
  }

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    result.pageTitle = decodeHtmlEntities(titleMatch[1]).slice(0, 200);
  }

  const tdLeft = html.match(/<td[^>]*align=["']left["'][^>]*>([\s\S]{100,3000}?)<\/td>/i);
  if (tdLeft) {
    const text = tdLeft[1].replace(/<[^>]+>/g, '\n').replace(/&nbsp;/g, ' ').trim();
    if (text.length > 50 && /[\u4e00-\u9fff]/.test(text)) result.lyrics_zh = text.slice(0, 2000);
  }

  const historyMatch = html.match(/(?:II\.\s*Tune|History|歷史|典故)[\s\S]{0,50}([\s\S]{200,2000}?)(?=<(?:p|h[23]|div)|$)/i);
  if (historyMatch) result.history = historyMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1500);

  // extraLinks: 外部連結（hymnary, congsing, challies, zanmeishi 等，排除 youtube）
  const extLinkRegex = /<a[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([^<]*)<\/a>/gi;
  const seenUrls = new Set(result.youtube);
  let extM;
  result.extraLinks = [];
  while ((extM = extLinkRegex.exec(html)) !== null) {
    const url = extM[1].replace(/&amp;/g, '&');
    if (/youtube\.com|youtu\.be/i.test(url)) continue;
    if (seenUrls.has(url)) continue;
    seenUrls.add(url);
    const title = decodeHtmlEntities(extM[2]).trim().slice(0, 80) || url.slice(0, 60);
    if (/hymnary\.org|congsing|challies|zanmeishi|wordwisehymns|hymncompanions/i.test(url)) {
      result.extraLinks.push({ title, url });
    }
  }
  result.extraLinks = result.extraLinks.slice(0, 15);

  // 智能抽取 fallback：從 pageTitle 解析作詞者與曲調名
  const titleStr = result.pageTitle || '';
  if (titleStr) {
    if (!result.author) {
      const authorFromTitle = titleStr.match(/_\s*([A-Za-z][A-Za-z.\s\-']+?)(?=\s+[\u4e00-\u9fff]|$)/);
      if (authorFromTitle) result.author = decodeHtmlEntities(authorFromTitle[1]).trim();
    }
    if (!result.tune) {
      let tuneFromTitle = titleStr.match(/\b([A-Z][A-Z0-9.'\s\-]+(?:\s*\([^)]*\))?)\s*$/);
      if (!tuneFromTitle) tuneFromTitle = titleStr.match(/\b([A-Z]{2}\s+[A-Z][a-z]+)\s*$/);
      if (tuneFromTitle) result.tune = decodeHtmlEntities(tuneFromTitle[1]).trim();
    }
  }

  return result;
}

function resolveFilePath(sourcePath, baseDir) {
  if (!sourcePath) return null;
  const full = path.join(baseDir, sourcePath.replace(/^\.\.\//, ''));
  return path.normalize(full);
}

function readHtmlFile(filePath, encodings = ['utf8', 'big5']) {
  if (!fs.existsSync(filePath)) return null;
  for (const enc of encodings) {
    try {
      const buf = fs.readFileSync(filePath);
      return enc === 'big5' ? iconv.decode(buf, 'big5') : buf.toString(enc);
    } catch (_) {}
  }
  return null;
}

function main() {
  let allEntries = [];
  const indexDir = INDEX_DIR;
  const baseDir = path.join(INDEX_DIR, '..');

  if (USE_SCAN || SAMPLE > 0) {
    allEntries = scanHymnFolders();
    console.log(`掃描資料夾: ${allEntries.length} 首`);
  } else {
    for (const src of HYMNAL_SOURCES) {
      const fp = path.join(INDEX_DIR, src.file);
      if (!fs.existsSync(fp)) {
        console.warn('跳過:', src.file);
        continue;
      }
      const buf = fs.readFileSync(fp);
      const html = src.encoding === 'big5' ? iconv.decode(buf, 'big5') : buf.toString('utf8');
      const entries = extractFromIndex(html, src.hymnal);
      console.log(`${src.hymnal}: 索引 ${entries.length} 首`);
      allEntries.push(...entries);
    }
  }

  const hymns = [];
  const hymnsIndex = [];
  let processed = 0;
  let toProcess = allEntries;
  if (SAMPLE > 0) {
    toProcess = pickSampleEntries(allEntries, SAMPLE);
    console.log(`取樣 ${toProcess.length} 首（各詩集約 3–4 首）`);
  } else if (LIMIT > 0) {
    toProcess = allEntries.slice(0, LIMIT);
  }
  const resolveBase = path.join(INDEX_DIR, '..');

  for (let i = 0; i < toProcess.length; i++) {
    const e = toProcess[i];
    const id = `${e.hymnal}_${e.number}`;
    let content = {
      scoreImages: [], youtube: [], authorImage: '', lyrics_zh: '', lyrics_en: '', theology: '', history: '',
      author: '', translator: '', tune: '', catalogNumber: '', extraLinks: [],
      composer: '', nation: '', period: '', meter: '', key: '', beat: '',
    };

    if (e.sourcePath) {
      const fullPath = resolveFilePath(e.sourcePath, resolveBase);
      const pageHtml = readHtmlFile(fullPath);
      if (pageHtml) {
        content = extractFromHymnPage(pageHtml, fullPath);
      }
    }

    const hymn = {
      id,
      number: e.number,
      title_zh: e.title_zh,
      title_en: e.title_en,
      hymnal: e.hymnal,
      sourcePath: e.sourcePath,
      symbol: e.symbol,
      category: e.category,
      author: content.author || '',
      translator: content.translator || '',
      tune: content.tune || '',
      catalogNumber: content.catalogNumber || '',
      scoreImage: content.scoreImages[0] || 'assets/scores/placeholder.svg',
      scoreImages: content.scoreImages,
      audioUrl: 'assets/audio/placeholder.mp3',
      youtube: content.youtube,
      authorImage: content.authorImage,
      theology: content.theology || '',
      history: content.history || '',
      lyrics_zh: content.lyrics_zh || '',
      lyrics_en: content.lyrics_en || '',
      extraLinks: content.extraLinks || [],
      text2music: { scoreUrl: '', midiUrl: '', jianpuUrl: '' },
      composer: content.composer || '',
      nation: content.nation || '',
      period: content.period || '',
      meter: content.meter || '',
      key: content.key || '',
      beat: content.beat || '',
      aiNotes: '',
      aiTags: [],
    };

    hymns.push(hymn);
    hymnsIndex.push({
      id,
      number: e.number,
      title_zh: e.title_zh,
      title_en: e.title_en,
      hymnal: e.hymnal,
      author: content.author || '',
      tune: content.tune || '',
    });

    processed++;
    if (processed % 100 === 0) console.log(`  已處理 ${processed}/${toProcess.length}`);
  }

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const meta = {
    title: '聖詩完整索引',
    extracted: new Date().toISOString().slice(0, 19),
    total: hymns.length,
  };

  fs.writeFileSync(
    path.join(DATA_DIR, 'source-hymns.json'),
    JSON.stringify({ metadata: meta, hymns }, null, 2),
    'utf8'
  );

  fs.writeFileSync(
    path.join(DATA_DIR, 'hymns-index.json'),
    JSON.stringify({ metadata: meta, hymns: hymnsIndex }, null, 2),
    'utf8'
  );

  console.log(`\n完成: ${hymns.length} 首`);
  console.log(`  source-hymns.json`);
  console.log(`  hymns-index.json`);
  console.log(`\n若需 file:// 顯示 2015 首，請於 hymn_management 執行:`);
  console.log(`  node scripts/build-temp-embedded.js`);
}

main();
