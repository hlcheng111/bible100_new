/**
 * 以斯拉來源專測：
 * 1) 關鍵題目必須有非首頁 URL
 * 2) 抽樣連結需可達（2xx/3xx）且非 etspedia 首頁
 *
 * 執行：node qna/tools/test_equiptoserve_links.mjs
 */
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const bundleJs = fs.readFileSync(path.join(ROOT, "data", "qna_sidebar_bundle.js"), "utf8");
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(bundleJs, ctx);
const bundle = ctx.window.QNA_SIDEBAR_BUNDLE || {};

const ETSPEDIA_HOME = "https://www.equiptoserve.org/etspedia/";

function findItem(sourceId, keyword) {
  const src = bundle[sourceId];
  if (!src) return null;
  for (const g of src.groups || []) {
    for (const it of g.items || []) {
      if ((it.title || "").includes(keyword)) return { group: g.name, ...it };
    }
  }
  return null;
}

function pickSamples(sourceId, n = 8) {
  const src = bundle[sourceId];
  const out = [];
  if (!src) return out;
  for (const g of src.groups || []) {
    for (const it of g.items || []) {
      out.push(it);
      if (out.length >= n) return out;
    }
  }
  return out;
}

async function status(url) {
  try {
    const r = await fetch(url, { redirect: "follow" });
    return r.status;
  } catch {
    return 0;
  }
}

function titleProbe(title) {
  if (!title) return "";
  let s = String(title).replace(/[（(].*?[)）]/g, "").replace(/\s+/g, "").trim();
  const quoted = [...s.matchAll(/「([^」]+)」/g)];
  if (quoted.length) {
    return quoted[quoted.length - 1][1].replace(/[？?！!。．]/g, "").slice(0, 20);
  }
  // 保留逗號等，頁面標題常含「，」；勿整串刪標點以免與 HTML 不一致
  return s.replace(/[？?！!。．]$/g, "").slice(0, 16);
}

function probeVariants(probe) {
  if (!probe) return [];
  const v = new Set([probe]);
  const swapColon = probe.replace(/(\d):(\d)/g, "$1：$2");
  if (swapColon !== probe) v.add(swapColon);
  const swapSemi = probe.replace(/(\d)；/g, "$1;");
  if (swapSemi !== probe) v.add(swapSemi);
  // 站內 JSON 常在 「3:17」與後接中文間加空白
  const spacedAfterVerse = probe.replace(/(\d+:\d+)(?=[\u4e00-\u9fff])/g, "$1 ");
  if (spacedAfterVerse !== probe) v.add(spacedAfterVerse);
  return [...v];
}

async function verifyContent(url, title) {
  try {
    const r = await fetch(url, { redirect: "follow" });
    const text = await r.text();
    const probe = titleProbe(title);
    if (!probe) return true;
    for (const p of probeVariants(probe)) {
      if (text.includes(p)) return true;
    }
    const short = probe.slice(0, Math.min(8, probe.length));
    return short.length >= 4 && text.includes(short);
  } catch {
    return false;
  }
}

const mustCases = [
  ["equiptoserve_deut_ruth", "亞納族的人是何種人"],
  ["equiptoserve_apologetics", "戰鬥的神學"],
  ["equiptoserve", "神創造天地萬物，神又是誰造的"],
];

let fail = 0;

for (const [sid, kw] of mustCases) {
  const hit = findItem(sid, kw);
  if (!hit) {
    console.log(`FAIL ${sid}: missing case "${kw}"`);
    fail += 1;
    continue;
  }
  const u = String(hit.url || "");
  const badHome = u === ETSPEDIA_HOME || u === ETSPEDIA_HOME.slice(0, -1);
  if (badHome) {
    console.log(`FAIL ${sid}: case "${kw}" still points home`);
    fail += 1;
    continue;
  }
  const st = await status(u);
  if (st < 200 || st >= 400) {
    console.log(`FAIL ${sid}: case "${kw}" status=${st}`);
    fail += 1;
    continue;
  }
  const okContent = await verifyContent(u, hit.title);
  if (!okContent) {
    console.log(`FAIL ${sid}: case "${kw}" content mismatch`);
    fail += 1;
    continue;
  }
  console.log(`OK   ${sid}: "${kw}" -> ${u}`);
}

for (const sid of ["equiptoserve", "equiptoserve_deut_ruth", "equiptoserve_ot_bg", "equiptoserve_nt_bg", "equiptoserve_apologetics"]) {
  const samples = pickSamples(sid, 8);
  for (const it of samples) {
    const u = String(it.url || "");
    if (!u || u === ETSPEDIA_HOME || u === ETSPEDIA_HOME.slice(0, -1)) {
      console.log(`FAIL ${sid}: sample points home (${it.title})`);
      fail += 1;
      continue;
    }
    const st = await status(u);
    if (st < 200 || st >= 400) {
      console.log(`FAIL ${sid}: sample status=${st} (${it.title})`);
      fail += 1;
      continue;
    }
    if (sid === "equiptoserve" || sid === "equiptoserve_deut_ruth") {
      const okContent = await verifyContent(u, it.title);
      if (!okContent) {
        console.log(`FAIL ${sid}: sample content mismatch (${it.title})`);
        fail += 1;
        continue;
      }
    }
  }
  console.log(`OK   ${sid}: sample set passed`);
}

if (fail) {
  console.error(`\nEquiptoserve check failed: ${fail}`);
  process.exit(1);
}
console.log("\nEquiptoserve check passed.");
