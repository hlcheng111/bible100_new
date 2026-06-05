/**
 * Teen Qs index from locally saved menu-ay1.html.
 * Per-list-item: prefer first substantive article href; title from question text.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(__dirname, "../_fetch/menu_ay1.html"), "utf8");

const BASE = "https://christiananswers.net";

function stripTags(s) {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

const skipHref = (href) =>
  !href ||
  href.startsWith("#") ||
  /^javascript:/i.test(href) ||
  /youtube|prageru|livingwaters|voddiebaucham|fortisinstitute/i.test(href);

function normalizeHref(href) {
  let h = href.trim();
  if (h.startsWith("/")) h = BASE + h;
  return h;
}

const banHref = (h) =>
  /\/answersteam\.html$/i.test(h) ||
  /\/menu-at1\.html$/i.test(h) ||
  /\/menu-ay1\.html$/i.test(h) ||
  /\/race\.html$/i.test(h);

const h2re = /<h2[^>]*>([^<]+)<\/h2>/gi;
const sections = [];
let m;
while ((m = h2re.exec(html)) !== null) {
  const title = stripTags(m[1]);
  if (!title || title === "Question Topics") continue;
  sections.push({ title, start: m.index });
}
for (let i = 0; i < sections.length; i++) {
  sections[i].end = i + 1 < sections.length ? sections[i + 1].start : html.indexOf("</div><!--end qList-->");
}

function pickFromLi(liHtml) {
  const hrefs = [];
  const are = /<a\s+[^>]*href="([^"]+)"[^>]*>/gi;
  let am;
  while ((am = are.exec(liHtml)) !== null) {
    let href = am[1];
    if (skipHref(href)) continue;
    const full = normalizeHref(href);
    if (!full.includes("christiananswers.net")) continue;
    if (banHref(full)) continue;
    if (/\/gospel\/noentry\.html$/i.test(full)) continue;
    hrefs.push(full);
  }
  if (!hrefs.length) return null;
  // Prefer /q- paths, then dictionary, then other internal articles
  const rank = (u) => {
    if (/\/q-[^/]+\//i.test(u)) return 0;
    if (/\/dictionary\//i.test(u)) return 1;
    if (/\/q-sum\//i.test(u)) return 0;
    return 2;
  };
  hrefs.sort((a, b) => rank(a) - rank(b));
  const url = hrefs[0];
  let title = stripTags(liHtml.replace(/^[\s\S]*?<li[^>]*>/i, "").replace(/<\/li>[\s\S]*$/i, ""));
  title = title.replace(/\s*Answer\s*$/i, "").replace(/\s*\[\s*$/g, "").trim();
  title = title.replace(/\s*\|\s*$/, "").trim();
  if (title.length < 6 || /^Answer$/i.test(title)) {
    const linkMatch = liHtml.match(/<a[^>]+href="[^"]+"[^>]*>([\s\S]*?)<\/a>/i);
    if (linkMatch) title = stripTags(linkMatch[1]);
  }
  if (!title || title.length < 2) return null;
  const q = title.indexOf("?");
  if (q !== -1) title = title.slice(0, q + 1).trim();
  else if (title.length > 140) title = title.slice(0, 137).trim() + "…";
  return { title, url };
}

const result = [];
for (const sec of sections) {
  const chunk = html.slice(sec.start, sec.end);
  const items = [];
  const seen = new Set();
  const lire = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let lm;
  while ((lm = lire.exec(chunk)) !== null) {
    const picked = pickFromLi(lm[0]);
    if (!picked) continue;
    const key = picked.url;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(picked);
  }
  if (items.length) result.push({ topic: sec.title, items });
}

console.log(JSON.stringify({ sections: result.length, questions: result.reduce((n, s) => n + s.items.length, 0) }, null, 2));
fs.writeFileSync(path.join(__dirname, "../_fetch/ca_teens_parsed.json"), JSON.stringify(result, null, 0), "utf8");
