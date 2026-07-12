import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const FORBIDDEN = ['iframe', '打開聖經跑道.bat', '預覽版', 'shell_boot'];

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (name === 'node_modules' || name === 'dist') continue;
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (/\.(ts|tsx)$/.test(name)) acc.push(p);
  }
  return acc;
}

let failed = 0;
const srcDir = path.join(root, 'src');
for (const file of walk(srcDir)) {
  const text = fs.readFileSync(file, 'utf-8');
  for (const word of FORBIDDEN) {
    if (text.includes(word)) {
      console.error(`FAIL ${path.relative(root, file)}: contains "${word}"`);
      failed++;
    }
  }
}

const required = [
  'src/app/router.ts',
  'src/app/views/ReaderView.ts',
  'scripts/export_bible.js',
  'scripts/books_catalog.json',
];
for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) {
    console.error(`FAIL missing ${rel}`);
    failed++;
  }
}

if (failed) {
  console.error(`\n${failed} smoke check(s) failed`);
  process.exit(1);
}
console.log('OK bible_journey smoke checks');
