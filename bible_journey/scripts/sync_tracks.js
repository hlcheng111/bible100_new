/**
 * 從 bible_app 同步跑道 JSON 到 public/data/tracks/
 * npm run sync:tracks
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, '..', '..', 'bible_app', 'shell', 'data');
const destDir = path.join(__dirname, '..', 'public', 'data', 'tracks');

const FILES = [
  ['thirty_day_plan.json', 'thirty_day_plan.json'],
  ['golden_verses_100.json', 'golden_verses.json'],
  ['thematic_readings.json', 'thematic_readings.json'],
];

fs.mkdirSync(destDir, { recursive: true });
let ok = 0;
for (const [from, to] of FILES) {
  const src = path.join(srcDir, from);
  const dest = path.join(destDir, to);
  if (!fs.existsSync(src)) {
    console.warn('SKIP missing', src);
    continue;
  }
  fs.copyFileSync(src, dest);
  ok++;
  console.log('OK', to);
}
if (!ok) {
  console.error('No track files copied. Check bible_app/shell/data/');
  process.exit(1);
}
console.log(`Synced ${ok} track files → public/data/tracks/`);
