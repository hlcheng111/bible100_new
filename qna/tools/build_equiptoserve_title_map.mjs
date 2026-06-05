/**
 * 從以斯拉新站抓取 title -> 文章 URL 映射（支援分類 slug）。
 * 重點：同一 title 可能出現在不同分類底下（例如 deuteronomy-ruth），
 * 不能只用 title 單鍵，否則會錯指到別卷/別分類。
 *
 * 執行：node qna/tools/build_equiptoserve_title_map.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE = path.join(__dirname, "..", "data", "equiptoserve_title_url_map.json");

const BOOK_PAGES = [
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/genesis",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/exodus",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/leviticus",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/numbers",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/deuteronomy",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/joshua",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/judges",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/ruth",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/first-samuel",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/second-samuel",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/first-kings",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/second-kings",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/first-chronicles",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/second-chronicles",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/ezra",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/nehemiah",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/esther",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/job",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/psalms",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/proverbs",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/ecclesiastes",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/song-of-solomon",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/isaiah",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/jeremiah",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/lamentations",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/ezekiel",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/daniel",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/hosea",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/joel",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/amos",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/obadiah",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/jonah",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/micah",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/nahum",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/habakkuk",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/zephaniah",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/haggai",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/zechariah",
  "https://www.equiptoserve.org/etspedia/old-testament-bible-questions/malachi",
  "https://www.equiptoserve.org/etspedia/new-testament-bible-questions/matthew",
  "https://www.equiptoserve.org/etspedia/new-testament-bible-questions/mark",
  "https://www.equiptoserve.org/etspedia/new-testament-bible-questions/luke",
  "https://www.equiptoserve.org/etspedia/new-testament-bible-questions/john",
  "https://www.equiptoserve.org/etspedia/new-testament-bible-questions/acts",
  "https://www.equiptoserve.org/etspedia/new-testament-bible-questions/romans",
  "https://www.equiptoserve.org/etspedia/new-testament-bible-questions/first-corinthians",
  "https://www.equiptoserve.org/etspedia/new-testament-bible-questions/second-corinthians",
  "https://www.equiptoserve.org/etspedia/new-testament-bible-questions/galatians",
  "https://www.equiptoserve.org/etspedia/new-testament-bible-questions/ephesians",
  "https://www.equiptoserve.org/etspedia/new-testament-bible-questions/philippians",
  "https://www.equiptoserve.org/etspedia/new-testament-bible-questions/colossians",
  "https://www.equiptoserve.org/etspedia/new-testament-bible-questions/first-thessalonians",
  "https://www.equiptoserve.org/etspedia/new-testament-bible-questions/second-thessalonians",
  "https://www.equiptoserve.org/etspedia/new-testament-bible-questions/first-timothy",
  "https://www.equiptoserve.org/etspedia/new-testament-bible-questions/second-timothy",
  "https://www.equiptoserve.org/etspedia/new-testament-bible-questions/titus",
  "https://www.equiptoserve.org/etspedia/new-testament-bible-questions/philemon",
  "https://www.equiptoserve.org/etspedia/new-testament-bible-questions/hebrews",
  "https://www.equiptoserve.org/etspedia/new-testament-bible-questions/james",
  "https://www.equiptoserve.org/etspedia/new-testament-bible-questions/first-peter",
  "https://www.equiptoserve.org/etspedia/new-testament-bible-questions/second-peter",
  "https://www.equiptoserve.org/etspedia/new-testament-bible-questions/first-john",
  "https://www.equiptoserve.org/etspedia/new-testament-bible-questions/second-john",
  "https://www.equiptoserve.org/etspedia/new-testament-bible-questions/third-john",
  "https://www.equiptoserve.org/etspedia/new-testament-bible-questions/jude",
  "https://www.equiptoserve.org/etspedia/new-testament-bible-questions/revelation",
  "https://www.equiptoserve.org/etspedia/辯道護教",
  "https://www.equiptoserve.org/etspedia/舊約背景",
  "https://www.equiptoserve.org/etspedia/新約背景",
];

function normalizeTitle(s) {
  if (!s) return "";
  return s
    .replace(/\s+/g, "")
    .replace(/[（(][^)）]*[)）]/g, "")
    .replace(/[？?！!。．、,，:：;；"'「」『』]/g, "")
    .trim();
}

function decodeNextPayload(html) {
  const re = /self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)<\/script>/g;
  let out = "";
  let m;
  while ((m = re.exec(html))) {
    const raw = m[1];
    out += JSON.parse('"' + raw.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"');
  }
  return out;
}

/** @type {Record<string, {byCategory: Record<string,string>, fallbacks: string[]}>} */
const map = {};
let totalPairs = 0;

function put(key, categorySlug, url) {
  if (!key || !url) return;
  if (!map[key]) map[key] = { byCategory: {}, fallbacks: [] };
  if (categorySlug && !map[key].byCategory[categorySlug]) {
    map[key].byCategory[categorySlug] = url;
  }
  if (!map[key].fallbacks.includes(url)) map[key].fallbacks.push(url);
}

for (const pageUrl of BOOK_PAGES) {
  let html = "";
  let ok = false;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const res = await fetch(pageUrl, { redirect: "follow" });
      if (!res.ok) {
        console.warn("skip page:", res.status, pageUrl);
        break;
      }
      html = await res.text();
      ok = true;
      break;
    } catch (e) {
      console.warn("retry page:", attempt, pageUrl, String(e && e.message ? e.message : e));
      await new Promise((r) => setTimeout(r, 300 * attempt));
    }
  }
  if (!ok) continue;

  const decoded = decodeNextPayload(html);
  // 只抽「分類區塊 posts[]」：避免把同一題灌進所有書卷分類。
  {
    const token = '\\"posts\\":[';
    const endToken = '],\\"children\\":[';
    const postRe = /\\"title\\":\\"([^\\"]+)\\",\\"slug\\":\\"([^\\"]+)\\"/g;
    let from = 0;
    while (true) {
      const idx = decoded.indexOf(token, from);
      if (idx < 0) break;

      // 往回找最近的「分類物件」slug（避免抓到上一題的 post.slug）
      const back = decoded.slice(Math.max(0, idx - 5000), idx);
      const namePos = back.lastIndexOf('\\"name\\":\\"');
      const tail = namePos >= 0 ? back.slice(namePos) : back;
      let catSlug = "";
      const slugTok = '\\"slug\\":\\"';
      const slugPos = tail.lastIndexOf(slugTok);
      if (slugPos >= 0) {
        const start = slugPos + slugTok.length;
        const endQ = tail.indexOf('\\"', start);
        if (endQ > start) catSlug = tail.slice(start, endQ);
      }

      // posts[] 以 children 欄位為邊界；抓不到就跳過，避免錯抓到下一段。
      const end = decoded.indexOf(endToken, idx);
      if (end < 0) {
        from = idx + token.length;
        continue;
      }

      const postsChunk = decoded.slice(idx + token.length, Math.max(idx + token.length, end));
      let pm;
      while ((pm = postRe.exec(postsChunk))) {
        const title = pm[1];
        const slug = pm[2];
        const key = normalizeTitle(title);
        if (!key || !slug) continue;
        if (catSlug) {
          const url = `https://www.equiptoserve.org/etspedia/${catSlug}/${slug}`;
          put(key, catSlug, url);
        }
        totalPairs += 1;
      }

      from = idx + token.length;
    }
  }
  console.log("parsed:", pageUrl);
}

fs.writeFileSync(
  OUT_FILE,
  JSON.stringify(
    { generatedAt: new Date().toISOString(), count: Object.keys(map).length, items: map },
    null,
    2
  ),
  "utf8"
);
console.log("wrote map:", OUT_FILE);
console.log("unique titles:", Object.keys(map).length, "raw pairs:", totalPairs);
