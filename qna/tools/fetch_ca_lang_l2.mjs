import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function get(url) {
  return new Promise((res, rej) => {
    https
      .get(
        url,
        { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } },
        (r) => {
          let d = "";
          r.on("data", (c) => (d += c));
          r.on("end", () => res(d));
        }
      )
      .on("error", rej);
  });
}

/** L2 blocks from zh trad home (查問主題 column) — hrefs copied from saved HTML */
const ZH_L2 = [
  { topic: "耶穌基督是你問題的答案嗎？", url: "https://christiananswers.net/chinese/trad/gospel/home.html" },
  { topic: "創造與進化", url: "https://christiananswers.net/chinese/trad/creation/home.html" },
  { topic: "考古學", url: "https://christiananswers.net/archaeology/home.html" },
  { topic: "出世以前的生命", url: "https://christiananswers.net/life/home.html" },
  { topic: "恐龍大謎團與聖經－問題解答", url: "https://christiananswers.net/dinosaurs/home.html" },
  { topic: "新片評論", url: "https://christiananswers.net/spotlight/home.html" },
  { topic: "耶穌基督", url: "https://christiananswers.net/jesus/home.html" },
  { topic: "養育子女和婚姻", url: "https://christiananswers.net/parenting/home.html" },
  { topic: "性和愛", url: "https://christiananswers.net/love/home.html" },
  { topic: "青少年問題", url: "https://christiananswers.net/teens/home.html" },
  { topic: "關於聖經的", url: "https://christiananswers.net/bible/about.html" },
  { topic: "給兒童的", url: "https://christiananswers.net/kids/amzbk-0.html" },
  { topic: "聖經和神學", url: "https://christiananswers.net/menu-at1.html" },
  { topic: "給兒童的問題解答", url: "https://christiananswers.net/kids/menu-ans.html" },
  { topic: "政府", url: "https://christiananswers.net/menu-ag1.html" },
  { topic: "宗教", url: "https://christiananswers.net/menu-ar1.html" },
  { topic: "青年人的問題", url: "https://christiananswers.net/menu-ay1.html" },
];

const BASE = "https://christiananswers.net";

function norm(href) {
  let h = href.trim();
  if (h.startsWith("/")) h = BASE + h;
  return h;
}

function strip(s) {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractQuestions(html, pageUrl) {
  const items = [];
  const seen = new Set();
  const re = /<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    let href = m[1];
    if (!href || href.startsWith("#") || /^javascript:/i.test(href)) continue;
    const full = norm(href);
    if (!full.includes("christiananswers.net")) continue;
    if (/\/home\.html$/i.test(full) && !/\/q-/i.test(full)) continue;
    if (/(btn-|\.gif|\.jpg|\.png|favicon)/i.test(full)) continue;
    if (/\/forms\//i.test(full)) continue;
    if (full === pageUrl || full + "/" === pageUrl) continue;
    const t = strip(m[2]);
    if (t.length < 4) continue;
    if (/^here$/i.test(t) || /^GO\s*$/i.test(t) || /^click/i.test(t)) continue;
    const key = full;
    if (seen.has(key)) continue;
    seen.add(key);
    const q = t.indexOf("?");
    const title = q !== -1 ? t.slice(0, q + 1) : t.length > 120 ? t.slice(0, 117) + "…" : t;
    items.push({ title, url: full });
  }
  return items.slice(0, 80);
}

const out = [];
for (const l2 of ZH_L2) {
  console.error("fetch", l2.url);
  const html = await get(l2.url);
  const items = extractQuestions(html, l2.url);
  out.push({ topic: l2.topic, l2Url: l2.url, items });
}
fs.writeFileSync(path.join(__dirname, "../_fetch/ca_zh_full.json"), JSON.stringify(out, null, 0), "utf8");
console.log(JSON.stringify({ l2: out.length, q: out.reduce((n, x) => n + x.items.length, 0) }));
