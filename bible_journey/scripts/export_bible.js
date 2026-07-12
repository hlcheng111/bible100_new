#!/usr/bin/env node
/**
 * 從 bible_app 的 bible_reader.db 匯出四語章節 JSON
 *
 * 用法（在 bible_journey 目錄）：
 *   npm install
 *   npm run export:bible
 *
 * 或：
 *   node scripts/export_bible.js
 *
 * 環境變數（可選）：
 *   BIBLE_DB_PATH  — SQLite 路徑
 *   BIBLE_OUT_DIR  — 輸出目錄（預設 src/data/bible）
 */
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');
const REPO_ROOT = path.join(PROJECT_ROOT, '..');

const DEFAULT_DB = path.join(REPO_ROOT, 'bible_app', 'app', 'assets', 'bible', 'bible_reader.db');
const DEFAULT_OUT = path.join(PROJECT_ROOT, 'src', 'data', 'bible');
const BOOKS_FILE = path.join(__dirname, 'books_catalog.json');

const VERSIONS = {
  zh: 'cuv_trust',
  en: 'kjv',
  vi: 'vi_1934',
  id: 'id_ayt',
};

const VERSION_KEYS = Object.keys(VERSIONS);
const VERSION_CODES = Object.values(VERSIONS);

function parseArgs() {
  const args = process.argv.slice(2);
  let dbPath = process.env.BIBLE_DB_PATH || DEFAULT_DB;
  let outDir = process.env.BIBLE_OUT_DIR || DEFAULT_OUT;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--db' && args[i + 1]) dbPath = args[++i];
    else if (args[i] === '--out' && args[i + 1]) outDir = args[++i];
    else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`Usage: node scripts/export_bible.js [--db PATH] [--out DIR]`);
      process.exit(0);
    }
  }
  return { dbPath, outDir };
}

function loadBooksCatalog() {
  const raw = JSON.parse(fs.readFileSync(BOOKS_FILE, 'utf8'));
  return raw.books;
}

function chapterFileName(bookId, chapter) {
  return `${bookId}_${chapter}.json`;
}

function ensureDb(dbPath) {
  if (!fs.existsSync(dbPath)) {
    console.error(`ERROR: Database not found:\n  ${dbPath}`);
    console.error('Set BIBLE_DB_PATH or place bible_reader.db at bible_app/app/assets/bible/');
    process.exit(1);
  }
  const size = fs.statSync(dbPath).size;
  if (size < 10 * 1024 * 1024) {
    console.warn(`WARN: DB seems small (${size} bytes). Expected full 4-lang bible (>10MB).`);
  }
}

function verifyVersions(db) {
  const rows = db
    .prepare('SELECT version, COUNT(*) AS c FROM verses GROUP BY version')
    .all();
  const found = Object.fromEntries(rows.map((r) => [r.version, r.c]));
  const missing = VERSION_CODES.filter((v) => !found[v] || found[v] < 1000);
  if (missing.length) {
    console.error('ERROR: Missing or incomplete versions:', missing);
    console.error('Found:', found);
    process.exit(1);
  }
  return found;
}

function loadAllVerses(db) {
  const placeholders = VERSION_CODES.map(() => '?').join(', ');
  const stmt = db.prepare(
    `SELECT version, b AS bookId, c AS chapter, v AS verse, t AS text
     FROM verses
     WHERE version IN (${placeholders})
     ORDER BY b, c, v, version`
  );
  return stmt.all(...VERSION_CODES);
}

function groupChapters(rows) {
  /** @type {Map<string, { bookId: number, chapter: number, byVerse: Map<number, Record<string, string>> }>} */
  const chapters = new Map();

  for (const row of rows) {
    const key = `${row.bookId}_${row.chapter}`;
    if (!chapters.has(key)) {
      chapters.set(key, {
        bookId: row.bookId,
        chapter: row.chapter,
        byVerse: new Map(),
      });
    }
    const ch = chapters.get(key);
    const langKey = VERSION_KEYS[VERSION_CODES.indexOf(row.version)];
    if (!ch.byVerse.has(row.verse)) {
      ch.byVerse.set(row.verse, { verse: row.verse, zh: '', en: '', vi: '', id: '' });
    }
    ch.byVerse.get(row.verse)[langKey] = row.text || '';
  }

  return chapters;
}

function writeChapter(outDir, ch) {
  const verses = [...ch.byVerse.values()].sort((a, b) => a.verse - b.verse);
  const payload = {
    bookId: ch.bookId,
    chapter: ch.chapter,
    verses,
  };
  const file = path.join(outDir, chapterFileName(ch.bookId, ch.chapter));
  fs.writeFileSync(file, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  return verses.length;
}

function buildCatalog(books, chapterCounts, exportedAt, dbPath) {
  const catalogBooks = books.map((b) => {
    const dbChapters = chapterCounts.get(b.id) || b.chapters;
    return {
      id: b.id,
      nameZh: b.nameZh,
      nameEn: b.nameEn,
      nameVi: b.nameVi,
      nameId: b.nameId,
      chapters: dbChapters,
      testament: b.id <= 39 ? 'OT' : 'NT',
    };
  });
  const totalChapters = [...chapterCounts.values()].reduce((a, n) => a + n, 0);
  return {
    schemaVersion: 1,
    exportedAt,
    sourceDb: dbPath,
    versions: VERSIONS,
    bookCount: catalogBooks.length,
    totalChapters,
    books: catalogBooks,
  };
}

function main() {
  const { dbPath, outDir } = parseArgs();
  ensureDb(dbPath);
  fs.mkdirSync(outDir, { recursive: true });

  const books = loadBooksCatalog();
  const bookById = new Map(books.map((b) => [b.id, b]));

  console.log('Opening', dbPath);
  const db = new Database(dbPath, { readonly: true });
  try {
    const versionCounts = verifyVersions(db);
    console.log('Versions OK:', versionCounts);

    console.log('Loading verses (4 languages)…');
    const rows = loadAllVerses(db);
    console.log(`Rows loaded: ${rows.length.toLocaleString()}`);

    const chapters = groupChapters(rows);
    console.log(`Chapters to export: ${chapters.size}`);

    let files = 0;
    let verseTotal = 0;
    const chapterCounts = new Map();

    for (const ch of chapters.values()) {
      const n = writeChapter(outDir, ch);
      files++;
      verseTotal += n;
      chapterCounts.set(ch.bookId, (chapterCounts.get(ch.bookId) || 0) + 1);
    }

    // 補齊 catalog 中無經文資料的書卷章數（應為 0）
    for (const b of books) {
      if (!chapterCounts.has(b.id)) chapterCounts.set(b.id, 0);
    }

    const catalog = buildCatalog(books, chapterCounts, new Date().toISOString(), dbPath);
    fs.writeFileSync(path.join(outDir, 'catalog.json'), JSON.stringify(catalog, null, 2) + '\n', 'utf8');

    // 移除舊示範檔 gen_1.json（已由 1_1.json 取代）
    const legacy = path.join(outDir, 'gen_1.json');
    if (fs.existsSync(legacy)) {
      fs.unlinkSync(legacy);
      console.log('Removed legacy gen_1.json');
    }

    console.log('\nExport complete');
    console.log(`  Output: ${outDir}`);
    console.log(`  Chapter files: ${files}`);
    console.log(`  Verses (sum): ${verseTotal.toLocaleString()}`);
    console.log(`  Books in catalog: ${catalog.bookCount}`);
    console.log(`  catalog.json written`);

    const mismatches = books.filter((b) => {
      const exported = chapterCounts.get(b.id) || 0;
      return exported > 0 && exported !== b.chapters;
    });
    if (mismatches.length) {
      console.warn('\nWARN: Chapter count differs from books_catalog.json for:');
      for (const b of mismatches) {
        console.warn(`  Book ${b.id} ${b.nameEn}: catalog=${b.chapters}, db=${chapterCounts.get(b.id)}`);
      }
    }
  } finally {
    db.close();
  }
}

main();
