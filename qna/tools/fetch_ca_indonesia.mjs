/**
 * 抓取印尼站各主題入口頁，僅保留 /indonesian/ 路徑下實質問答／專文連結（收紧規則）。
 * 輸出 _fetch/ca_id_full.json
 */
import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function get(url) {
  return new Promise((res, rej) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; Bible100QnA/1.0)" } }, (r) => {
        let d = "";
        r.on("data", (c) => (d += c));
        r.on("end", () => res(d));
      })
      .on("error", rej);
  });
}

const BASE = "https://christiananswers.net";

function norm(href) {
  let h = href.trim();
  if (h.startsWith("/")) h = BASE + h;
  return h;
}

function strip(s) {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

const JUNK_TITLE = /^(jawaban|jawabannya|about it|direktori|directory|copyright|petunjuk|courtesy|statement of faith|search our site|online|contact|inggris|english|dutch|spanyol|belanda|hongaria)$/i;

function isUsefulIndonesianLink(full, title) {
  if (!/\/indonesian\//i.test(full)) return false;
  const t = title.trim();
  if (t.length < 12) return false;
  if (JUNK_TITLE.test(t)) return false;
  if (/^jawaban(s|nya)?\s*$/i.test(t)) return false;

  const low = full.toLowerCase();
  if (/(btn-|\.gif|\.jpg|\.png|\.pdf|\.ram)(\?|$)/i.test(low)) return false;
  if (/media\.christiananswers|forms\.|cgi-bin|youtube|prageru/i.test(low)) return false;
  if (/\/indonesian\/menu-/i.test(low)) return false;
  if (/\/kids\/(clr-|menu-)/i.test(low)) return false;

  // 以問答／專文路徑為主
  if (/\/indonesian\/q-/i.test(low)) return true;
  if (/\/indonesian\/(gospel|godstory|dinosaurs)\//i.test(low) && /\.html$/i.test(low)) return true;
  if (/\/indonesian\/dictionary\//i.test(low)) return true;

  return false;
}

function extractQuestionsId(html, pageUrl, max = 80) {
  const items = [];
  const seen = new Set();
  const re = /<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    let href = m[1];
    if (!href || href.startsWith("#") || /^javascript:/i.test(href)) continue;
    const full = norm(href);
    if (!/christiananswers\.net/i.test(full)) continue;
    if (full.replace(/\/$/, "") === pageUrl.replace(/\/$/, "")) continue;

    const title = strip(m[2]);
    const q = title.indexOf("?");
    const shortTitle = q !== -1 ? title.slice(0, q + 1) : title.length > 160 ? title.slice(0, 157) + "…" : title;

    if (!isUsefulIndonesianLink(full, shortTitle)) continue;
    if (seen.has(full)) continue;
    seen.add(full);
    items.push({ title: shortTitle, url: full });
    if (items.length >= max) break;
  }
  return items;
}

const ID_L2 = [
  { topic: "Kisah Mengenai Allah", url: "https://christiananswers.net/indonesian/godstory/home.html" },
  { topic: "Kreasi dan Evolusi", url: "https://christiananswers.net/indonesian/creation/home.html" },
  { topic: "Arkeologi Kitab Suci", url: "https://christiananswers.net/indonesian/archaeology/home.html" },
  { topic: "Injil — Apakah Yesus Jawaban Anda?", url: "https://christiananswers.net/indonesian/gospel/home.html" },
  { topic: "Agama", url: "https://christiananswers.net/indonesian/menu-ar1i.html" },
  { topic: "Keluarga & Perkawinan", url: "https://christiananswers.net/indonesian/parenting/home.html" },
  { topic: "Pemerintah & Isu Sosial", url: "https://christiananswers.net/indonesian/menu-ag1i.html" },
  { topic: "Teologi Kristen", url: "https://christiananswers.net/indonesian/menu-at1i.html" },
  { topic: "Pertanyaan untuk anak-anak", url: "https://christiananswers.net/indonesian/kids/menu-ans.html" },
];

async function run() {
  const out = [];
  for (const l2 of ID_L2) {
    console.error("id", l2.url);
    const html = await get(l2.url);
    out.push({ topic: l2.topic, l2Url: l2.url, items: extractQuestionsId(html, l2.url) });
  }
  fs.writeFileSync(path.join(__dirname, "../_fetch/ca_id_full.json"), JSON.stringify(out), "utf8");
  console.log("id blocks", out.length, "items", out.reduce((n, x) => n + x.items.length, 0));
}

await run();
