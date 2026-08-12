/**
 * PR-A 驗收：#reader/20-3?track=golden 必須命中 golden_verses.json（箴 3:6）
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const golden = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/assets/tracks/golden_verses.json'), 'utf-8')
);
const matches = golden.verses.filter((v) => v.bookId === 20 && v.chapter === 3);
if (matches.length < 2) {
  console.error('FAIL expected gv13+gv14 on Prov 3');
  process.exit(1);
}
const last = matches[matches.length - 1];
if (last.refZh !== '箴 3:6' || last.tagZh !== '認識祂') {
  console.error('FAIL golden 3:6 metadata', last);
  process.exit(1);
}
const reflections = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/assets/coach/coach_reflections.json'), 'utf-8')
);
if (!reflections.items?.length) {
  console.error('FAIL coach_reflections.json empty');
  process.exit(1);
}
console.log('OK golden route 20-3 ->', last.refZh, last.tagZh);
