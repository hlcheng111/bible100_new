/**
 * 從 bible_app 同步跑道 JSON
 * - src/assets/tracks/  → Vite 內嵌（dev/build 不依賴 public）
 * - public/data/tracks/ → 靜態託管備用
 * npm run sync:tracks
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, '..', '..', 'bible_app', 'shell', 'data');
const destDirs = [
  path.join(__dirname, '..', 'src', 'assets', 'tracks'),
  path.join(__dirname, '..', 'public', 'data', 'tracks'),
];

const FILES = [
  ['thirty_day_plan.json', 'thirty_day_plan.json'],
  ['golden_verses_100.json', 'golden_verses.json'],
  ['thematic_readings.json', 'thematic_readings.json'],
];

let ok = 0;
for (const destDir of destDirs) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const [from, to] of FILES) {
    const src = path.join(srcDir, from);
    const dest = path.join(destDir, to);
    if (!fs.existsSync(src)) {
      console.warn('SKIP missing', src);
      continue;
    }
    fs.copyFileSync(src, dest);
    ok++;
    console.log('OK', path.relative(path.join(__dirname, '..'), dest));
  }
}
if (!ok) {
  console.error('No track files copied. Check bible_app/shell/data/');
  process.exit(1);
}
console.log(`Synced track files to ${destDirs.length} destinations`);
