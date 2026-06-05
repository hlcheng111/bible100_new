import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(__dirname, "../_fetch/parenting_home.html"), "utf8");
const BASE = "https://christiananswers.net";

function stripTags(s) {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

const skipHref = (href) =>
  !href || href.startsWith("#") || /^javascript:/i.test(href) || /youtube/i.test(href);

function normalizeHref(href) {
  let h = href.trim();
  if (h.startsWith("/")) h = BASE + h;
  return h;
}

const banHref = (h) =>
  !h.includes("christiananswers.net") ||
  /\/teens\/home\.html$/i.test(h) ||
  /\/kids\/home\.html$/i.test(h) ||
  /\/love\/home\.html#/i.test(h);

// Main content: td.padT10 — skip left nav by taking last large table cell pattern
const mainStart = html.indexOf('<td class="padT10');
const mainHtml = mainStart >= 0 ? html.slice(mainStart) : html;

const h2re = /<h2[^>]*(?:id="([^"]*)")?[^>]*>([^<]+)<\/h2>/gi;
const sections = [];
let m;
while ((m = h2re.exec(mainHtml)) !== null) {
  const id = m[1] || "";
  const title = stripTags(m[2]).trim();
  if (!title || /^Tips for better parenting$/i.test(title)) continue;
  sections.push({ id, title, start: m.index });
}
for (let i = 0; i < sections.length; i++) {
  sections[i].end = i + 1 < sections.length ? sections[i + 1].start : mainHtml.length;
}

function cleanTitle(t) {
  t = stripTags(t).replace(/\s*Answer\s*$/i, "").trim();
  const q = t.indexOf("?");
  if (q !== -1) return t.slice(0, q + 1).trim();
  if (t.length > 160) return t.slice(0, 157).trim() + "…";
  return t;
}

function pickFromLi2(liHtml) {
  const hrefs = [];
  const are = /<a\s+[^>]*href="([^"]+)"[^>]*>/gi;
  let am;
  while ((am = are.exec(liHtml)) !== null) {
    const href = am[1];
    if (skipHref(href)) continue;
    const full = normalizeHref(href);
    if (!full.includes("christiananswers.net")) continue;
    hrefs.push(full);
  }
  if (!hrefs.length) return null;
  if (/\/life\/home\.html$/i.test(hrefs[0]) && liHtml.includes("Explore one of God")) {
    const art = hrefs.find((u) => /\/q-aig\//i.test(u));
    if (!art) return null;
    hrefs.splice(0, hrefs.length, art);
  }
  const article = hrefs.find((u) => /\/q-[^/]+\//i.test(u)) || hrefs[0];
  if (banHref(article)) return null;
  const inner = liHtml.replace(/^[\s\S]*?<li[^>]*>/i, "").replace(/<\/li>[\s\S]*$/i, "");
  let title = cleanTitle(inner);
  if (!title) return null;
  return { title, url: article };
}

const result = [];
for (const sec of sections) {
  const chunk = mainHtml.slice(sec.start, sec.end);
  const items = [];
  const seen = new Set();
  const lire = /<li[^>]*class="[^"]*ques[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
  let lm;
  while ((lm = lire.exec(chunk)) !== null) {
    const picked = pickFromLi2(`<li class="ques">${lm[1]}</li>`);
    if (!picked) continue;
    if (seen.has(picked.url)) continue;
    seen.add(picked.url);
    items.push(picked);
  }
  if (items.length) result.push({ topic: sec.title, items });
}

console.log(JSON.stringify({ sections: result.length, questions: result.reduce((n, s) => n + s.items.length, 0) }, null, 2));
fs.writeFileSync(path.join(__dirname, "../_fetch/ca_family_parsed.json"), JSON.stringify(result, null, 0), "utf8");
