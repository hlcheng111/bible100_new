#!/usr/bin/env node
/**
 * 離線封測：確認 public/data/bible 章節 JSON 與 catalog 一致
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bibleDir = path.join(__dirname, '..', 'public', 'data', 'bible');
const catalogPath = path.join(bibleDir, 'catalog.json');

function fail(msg) {
  console.error('FAIL', msg);
  process.exit(1);
}

if (!fs.existsSync(catalogPath)) {
  fail(`missing ${catalogPath} — run: npm run export:bible`);
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const books = catalog.books || [];
let expected = 0;
const missing = [];

for (const book of books) {
  for (let ch = 1; ch <= book.chapters; ch++) {
    expected++;
    const file = path.join(bibleDir, `${book.id}_${ch}.json`);
    if (!fs.existsSync(file)) missing.push(`${book.id}_${ch}`);
  }
}

const onDisk = fs.readdirSync(bibleDir).filter((f) => /^\d+_\d+\.json$/.test(f)).length;

if (missing.length) {
  console.error(`Missing ${missing.length}/${expected} chapter files (e.g. ${missing.slice(0, 5).join(', ')})`);
  process.exit(1);
}

console.log(`OK bible public bundle: ${onDisk} chapter files, ${books.length} books, catalog totalChapters=${catalog.totalChapters}`);
