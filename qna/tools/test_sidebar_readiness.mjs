/**
 * 自測：確認每個來源都有可點題目，且關鍵來源無舊壞鏈格式。
 * 執行：node qna/tools/test_sidebar_readiness.mjs
 */
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const navJs = fs.readFileSync(path.join(ROOT, "qna_nav_config.js"), "utf8");
const bundleJs = fs.readFileSync(path.join(ROOT, "data", "qna_sidebar_bundle.js"), "utf8");

const navCtx = {};
vm.createContext(navCtx);
vm.runInContext(navJs, navCtx);
const cfg = navCtx.QNA_NAV_CONFIG;

const bundleCtx = { window: {} };
vm.createContext(bundleCtx);
vm.runInContext(bundleJs, bundleCtx);
const bundle = bundleCtx.window.QNA_SIDEBAR_BUNDLE || {};

const EQ_ETSPEDIA_KEYS = [
  "equiptoserve",
  "equiptoserve_deut_ruth",
  "equiptoserve_ot_bg",
  "equiptoserve_nt_bg",
  "equiptoserve_apologetics",
];
const LEGACY_PATH = /\/聖經難題\//;

const report = [];
let fail = 0;

function hasLegacyEquiptoserveUrl(b) {
  return b.groups.some((g) =>
    (g.items || []).some((it) => LEGACY_PATH.test(it.url))
  );
}

for (const s of cfg.sources) {
  if (s.id.startsWith("all")) continue;

  if (s.id === "equiptoserve_etspedia") {
    let localFail = 0;
    for (const k of EQ_ETSPEDIA_KEYS) {
      const b = bundle[k];
      if (!b || !Array.isArray(b.groups) || !b.groups.length) {
        report.push(`FAIL equiptoserve_etspedia (bundle ${k}): no bundle groups`);
        localFail += 1;
        continue;
      }
      const itemCount = b.groups.reduce((n, g) => n + (g.items ? g.items.length : 0), 0);
      if (itemCount === 0) {
        report.push(`FAIL equiptoserve_etspedia (bundle ${k}): no clickable items`);
        localFail += 1;
        continue;
      }
      if (hasLegacyEquiptoserveUrl(b)) {
        report.push(`FAIL equiptoserve_etspedia (bundle ${k}): old 聖經難題 URL still exists`);
        localFail += 1;
      }
    }
    if (localFail === 0) {
      report.push(`OK   equiptoserve_etspedia: all ${EQ_ETSPEDIA_KEYS.length} bundle keys have groups/items, no legacy URLs`);
    } else {
      fail += 1;
    }
    continue;
  }

  const b = bundle[s.id];
  if (!b || !Array.isArray(b.groups) || !b.groups.length) {
    report.push(`FAIL ${s.id}: no bundle groups`);
    fail += 1;
    continue;
  }
  const itemCount = b.groups.reduce((n, g) => n + (g.items ? g.items.length : 0), 0);
  if (itemCount === 0) {
    report.push(`FAIL ${s.id}: no clickable items`);
    fail += 1;
    continue;
  }
  if (s.id.startsWith("equiptoserve") && hasLegacyEquiptoserveUrl(b)) {
    report.push(`FAIL ${s.id}: old 聖經難題 URL still exists`);
    fail += 1;
    continue;
  }
  report.push(`OK   ${s.id}: groups=${b.groups.length}, items=${itemCount}`);
}

console.log(report.join("\n"));
if (fail > 0) {
  console.error(`\nReadiness check failed: ${fail} source(s)`);
  process.exit(1);
}
console.log("\nReadiness check passed.");
