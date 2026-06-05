/**
 * 聖詩索引提取腳本
 * 從 C:/hymn/index_hymnal/*.htm 提取詩歌資料，輸出 source-hymns.json
 * 需安裝: npm install iconv-lite
 * 執行: node extract-to-json.js
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
const OUTPUT_PATH = path.join(__dirname, '../../Users/hlche/.cursor/bible100_new/hymn_management/data/source-hymns.json');

const HYMNAL_SOURCES = [
  { file: 'Index_hl_世紀頌讚.htm', hymnal: 'century_praise', encoding: 'big5' },
  { file: 'Index_hl頌主新歌.htm', hymnal: 'lord_new_songs', encoding: 'big5' },
  { file: 'ndex_hl_新編讚美詩.htm', hymnal: 'new_hymnal', encoding: 'big5' },
  { file: 'Index_hl_普頌新.htm', hymnal: 'universal_praise', encoding: 'big5' },
];

const SYMBOL_MAP = { '▲': 'world_famous', '●': 'chinese', '◆': 'worship', '★': 'ethnic' };

function extractHymnsFromHtml(html, hymnal, encoding) {
  const hymns = [];
  const seen = new Set();

  // 匹配表格行: <tr>...</tr>
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1];

    // 第一欄: 編號 + 中文標題 (可能有 <a href="...">標題</a>)
    const col1Match = rowHtml.match(/<td[^>]*>([\s\S]*?)<\/td>/i);
    if (!col1Match) continue;

    const col1 = col1Match[1];
    const numMatch = col1.match(/(\d{1,4})\.?\s*(?:&nbsp;|\s)*/);
    const number = numMatch ? numMatch[1].padStart(3, '0') : null;

    const zhLinkMatch = col1.match(/<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/);
    let title_zh = zhLinkMatch ? zhLinkMatch[2].replace(/&nbsp;/g, ' ').trim() : '';
    if (!title_zh) {
      const text = col1.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
      const afterNum = text.replace(/^\d{1,4}\.?\s*/, '');
      if (afterNum && !/^[A-Z\s　]+$/.test(afterNum)) title_zh = afterNum;
    }

    // 第二欄: 英文標題 (優先取 ../hymn_xxx/ 連結)
    const col2Match = rowHtml.match(/<td[^>]*>[\s\S]*?<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i);
    const col2 = col2Match ? col2Match[1] : '';

    const localLinkMatch = col2.match(/<a[^>]*href="(\.\.\/hymn_[^"]+\.htm)"[^>]*>([^<]*)<\/a>/i);
    const extLinkMatch = col2.match(/<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>([^<]*)<\/a>/i);
    const anyLinkMatch = col2.match(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/i);

    let sourcePath = '';
    let title_en = '';

    if (localLinkMatch) {
      sourcePath = localLinkMatch[1];
      title_en = localLinkMatch[2].replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    } else if (anyLinkMatch) {
      sourcePath = anyLinkMatch[1];
      title_en = anyLinkMatch[2].replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    }

    if (!title_zh && !title_en) continue;
    if (!number) continue;

    const id = `${hymnal.slice(0, 2)}${number}`;
    const key = `${hymnal}-${number}`;
    if (seen.has(key)) continue;
    seen.add(key);

    let symbol = '';
    let category = 'unknown';
    const fullText = (title_zh + title_en);
    for (const [sym, cat] of Object.entries(SYMBOL_MAP)) {
      if (fullText.includes(sym)) {
        symbol = sym;
        category = cat;
        break;
      }
    }

    hymns.push({
      id: `${hymnal}_${number}`,
      number,
      title_zh: title_zh || title_en,
      title_en: title_en || title_zh,
      hymnal,
      sourcePath: sourcePath || '',
      scoreImage: 'assets/scores/placeholder.svg',
      audioUrl: 'assets/audio/placeholder.mp3',
      theology: '',
      history: '',
      symbol,
      category,
    });
  }

  return hymns;
}

function main() {
  const allHymns = [];
  const hymnalNames = { century_praise: '世紀頌讚', lord_new_songs: '頌主新歌', new_hymnal: '新編讚美詩', universal_praise: '普頌新' };

  for (const src of HYMNAL_SOURCES) {
    const filePath = path.join(INDEX_DIR, src.file);
    if (!fs.existsSync(filePath)) {
      console.warn(`跳過（檔案不存在）: ${src.file}`);
      continue;
    }

    let html;
    try {
      const buf = fs.readFileSync(filePath);
      html = src.encoding === 'big5' ? iconv.decode(buf, 'big5') : buf.toString('utf8');
    } catch (e) {
      console.error(`讀取失敗 ${src.file}:`, e.message);
      continue;
    }

    const hymns = extractHymnsFromHtml(html, src.hymnal, src.encoding);
    console.log(`${hymnalNames[src.hymnal] || src.hymnal}: 提取 ${hymns.length} 首`);
    allHymns.push(...hymns);
  }

  const output = {
    metadata: {
      title: '聖詩索引（從 C:/hymn 提取）',
      extracted: new Date().toISOString().slice(0, 10),
      total: allHymns.length,
    },
    hymns: allHymns,
  };

  const outDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8');
  console.log(`\n已輸出: ${OUTPUT_PATH}`);
  console.log(`總計: ${allHymns.length} 首聖詩`);
}

main();
