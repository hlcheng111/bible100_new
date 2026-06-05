/**
 * 抽測每個來源前幾條連結是否可達（HTTP 2xx/3xx）。
 * 執行：node qna/tools/sample_url_health.mjs
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

function pickSamples(groups, n = 3) {
  const out = [];
  for (const g of groups || []) {
    for (const it of g.items || []) {
      out.push(it.url);
      if (out.length >= n) return out;
    }
  }
  return out;
}

async function check(url) {
  try {
    const r = await fetch(url, { redirect: "follow" });
    return r.status;
  } catch {
    return 0;
  }
}

let failed = 0;
for (const [sid, val] of Object.entries(bundle)) {
  const urls = pickSamples(val.groups, 3);
  const statuses = [];
  for (const u of urls) statuses.push(await check(u));
  const bad = statuses.some((s) => s < 200 || s >= 400);
  if (bad) failed += 1;
  console.log(`${bad ? "WARN" : "OK  "} ${sid} => ${statuses.join(", ")}`);
}
if (failed) {
  console.log(`\nHealth sample warnings: ${failed} source(s)`);
} else {
  console.log("\nHealth sample passed.");
}
