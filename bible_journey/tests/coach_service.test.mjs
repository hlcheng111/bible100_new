/**
 * PR-A：Day 14 約拿教練摘要 fallback（三十日 hint）
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const plan = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/assets/tracks/thirty_day_plan.json'), 'utf-8')
);
const d14 = plan.days.find((d) => d.day === 14);
if (!d14 || d14.bookId !== 32 || d14.chapter !== 2) {
  console.error('FAIL day 14 jonah metadata');
  process.exit(1);
}
const summary = `【Day ${d14.day} · ${d14.titleZh}】${d14.hintZh}`;
if (!summary.includes('約拿') && !summary.includes('魚腹')) {
  console.error('FAIL day 14 summary missing jonah hint');
  process.exit(1);
}
console.log('OK coach day 14 summary fallback');
