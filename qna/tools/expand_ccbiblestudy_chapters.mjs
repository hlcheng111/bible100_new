/**
 * 華人查經網：把各卷「章節目錄」頁展開為側欄第 3 層（章連結）。
 * 自動抓取，不必手動逐章貼。
 *
 * 用法（在專案根或 qna 下）：
 *   node qna/tools/expand_ccbiblestudy_chapters.mjs
 *   node qna/tools/expand_ccbiblestudy_chapters.mjs --limit=3   # 只試前 3 卷
 *   node qna/tools/build_sidebar_bundle.mjs                    # 再重建 bundle
 *
 * 策略：優先收繁中 CT 系列（*CT##.htm）；若無則 GT；再否則所有 ##章 數字連結。
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const SRC_FILE = path.join(DATA_DIR, "qna_data_華人基督徒查經網站_(_ccbiblestudy_).json");
const DELAY_MS = 700;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs() {
  const lim = process.argv.find((a) => a.startsWith("--limit="));
  return { limit: lim ? parseInt(lim.split("=")[1], 10) : 0 };
}

function absUrl(base, href) {
  try {
    return new URL(href, base).href;
  } catch {
    return "";
  }
}

/** @returns {{title:string,url:string}[]} */
function extractChapters(html, pageUrl) {
  const re = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const ct = [];
  const gt = [];
  const other = [];
  let m;
  while ((m = re.exec(html))) {
    const href = (m[1] || "").trim();
    const text = (m[2] || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (!href || href.startsWith("#") || /^javascript:/i.test(href)) continue;
    const full = absUrl(pageUrl, href);
    if (!full || !/ccbiblestudy\.org/i.test(full)) continue;
    // CT01.htm / 05CT12.htm
    if (/CT\d{2}\.htm$/i.test(full) || /CT\d{2}\.html$/i.test(full)) {
      const num = (full.match(/CT(\d{2})\./i) || [])[1];
      ct.push({ title: num ? `第${num}章` : text || "章", url: full, _n: parseInt(num || "0", 10) });
      continue;
    }
    if (/GT\d{2}\.htm$/i.test(full) || /GT\d{2}\.html$/i.test(full)) {
      const num = (full.match(/GT(\d{2})\./i) || [])[1];
      gt.push({ title: num ? `第${num}章` : text || "章", url: full, _n: parseInt(num || "0", 10) });
      continue;
    }
    // 「01章」「1章」文字
    const ch = text.match(/^0*(\d{1,3})\s*章/);
    if (ch && /\.htm/i.test(full) && !/index/i.test(full)) {
      other.push({
        title: `第${String(ch[1]).padStart(2, "0")}章`,
        url: full,
        _n: parseInt(ch[1], 10),
      });
    }
  }
  const pick = (arr) => {
    const byN = new Map();
    arr.forEach((it) => {
      if (!byN.has(it._n) || it._n > 0) byN.set(it._n, it);
    });
    return [...byN.values()]
      .filter((x) => x._n > 0)
      .sort((a, b) => a._n - b._n)
      .map(({ title, url }) => ({ title, url }));
  };
  if (ct.length) return pick(ct);
  if (gt.length) return pick(gt);
  return pick(other);
}

/** 主題查經 index：100.htm「100認識神」等扁平原文 */
function extractTopicArticles(html, pageUrl) {
  const re = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const out = [];
  const seen = new Set();
  let m;
  while ((m = re.exec(html))) {
    const href = (m[1] || "").trim();
    const text = (m[2] || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (!href || href.startsWith("#") || /^javascript:/i.test(href)) continue;
    const full = absUrl(pageUrl, href);
    if (!full || !/ccbiblestudy\.org/i.test(full)) continue;
    if (/index/i.test(full)) continue;
    const base = full.split("/").pop() || "";
    if (!/^\d{2,4}\.htm[l]?$/i.test(base)) continue;
    if (seen.has(full)) continue;
    seen.add(full);
    const title = text || base.replace(/\.htm[l]?$/i, "");
    out.push({ title: title.slice(0, 120), url: full });
  }
  return out;
}

async function fetchHtml(url) {
  const encoded = url.replace(/ /g, "%20");
  const res = await fetch(encoded, {
    headers: { "User-Agent": UA, Accept: "text/html,*/*" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  // 查經網多用 Big5 / GB；先試 utf-8，再試 big5
  let text = buf.toString("utf8");
  if (text.includes("�") || !/章|查經|目錄/.test(text)) {
    try {
      text = new TextDecoder("big5").decode(buf);
    } catch {
      /* keep utf8 */
    }
  }
  return text;
}

async function main() {
  const { limit } = parseArgs();
  if (!fs.existsSync(SRC_FILE)) {
    console.error("missing", SRC_FILE);
    process.exit(1);
  }
  const doc = JSON.parse(fs.readFileSync(SRC_FILE, "utf8"));
  const subs = doc.subcategories || {};
  const keys = Object.keys(subs);
  const useKeys = limit > 0 ? keys.slice(0, limit) : keys;
  console.log("books to expand:", useKeys.length, limit ? `(limit ${limit})` : "(all)");

  let ok = 0;
  let fail = 0;
  for (const key of useKeys) {
    const items = subs[key] || [];
    const seed = items[0];
    if (!seed || !seed.url) {
      console.warn("skip empty", key);
      fail++;
      continue;
    }
    process.stdout.write(`→ ${key} … `);
    try {
      const html = await fetchHtml(seed.url);
      const chapters = extractChapters(html, seed.url);
      if (chapters.length) {
        subs[key] = [
          { title: `${seed.title || key.split(">").pop().trim()}（全書目錄）`, url: seed.url },
          ...chapters,
        ];
        console.log(`${chapters.length} chapters`);
        ok++;
      } else {
        const arts = extractTopicArticles(html, seed.url);
        if (arts.length) {
          subs[key] = [
            { title: `${seed.title || key.split(">").pop().trim()}（主題目錄）`, url: seed.url },
            ...arts,
          ];
          console.log(`${arts.length} topic articles`);
          ok++;
        } else {
          console.log("no chapters/articles, keep index");
          fail++;
        }
      }
    } catch (e) {
      console.log("FAIL", e.message || e);
      fail++;
    }
    await sleep(DELAY_MS);
  }

  doc.subcategories = subs;
  doc.expandedChaptersAt = new Date().toISOString();
  doc.expandedNote = "CT/GT chapter links under each book; rebuild with build_sidebar_bundle.mjs";
  fs.writeFileSync(SRC_FILE, JSON.stringify(doc, null, 2), "utf8");
  console.log("Wrote", SRC_FILE);
  console.log("ok:", ok, "fail/keep:", fail);
  console.log("Next: node qna/tools/build_sidebar_bundle.mjs");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
