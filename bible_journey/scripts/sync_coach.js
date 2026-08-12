/**
 * 從 bible_app 同步教練 JSON → src/assets/coach/
 * npm run sync:coach
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, '..', '..', 'bible_app', 'shell', 'data');
const destDir = path.join(__dirname, '..', 'src', 'assets', 'coach');

const FILES = ['coach_reflections.json', 'coach_faq.json', 'coach_glossary.json'];

fs.mkdirSync(destDir, { recursive: true });
let ok = 0;
for (const name of FILES) {
  const src = path.join(srcDir, name);
  const dest = path.join(destDir, name);
  if (!fs.existsSync(src)) {
    console.warn('SKIP missing', src);
    continue;
  }
  fs.copyFileSync(src, dest);
  ok++;
  console.log('OK', path.relative(path.join(__dirname, '..'), dest));
}
if (!ok) {
  console.error('No coach files copied. Check bible_app/shell/data/');
  process.exit(1);
}
console.log(`Synced ${ok} coach files → src/assets/coach/`);
