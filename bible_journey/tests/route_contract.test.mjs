/**
 * Phase 0.1 — ReadingUnit / RouteState 契約測試（無 DOM）
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function fail(msg) {
  console.error('FAIL', msg);
  process.exitCode = 1;
}

function ok(msg) {
  console.log('OK', msg);
}

// —— 內聯 routeCodec（與 src/app/contract/routeCodec.ts 同步）——
function encodeReaderQuery(route) {
  const q = new URLSearchParams();
  if (route.trackId) q.set('track', route.trackId);
  if (route.day != null) q.set('day', String(route.day));
  if (route.verse != null) q.set('verse', String(route.verse));
  if (route.gv) q.set('gv', route.gv);
  if (route.themeId) q.set('themeId', route.themeId);
  if (route.progressId) q.set('progressId', route.progressId);
  if (route.displayMode) q.set('display', route.displayMode);
  const s = q.toString();
  return s ? `?${s}` : '';
}

function decodeReaderQuery(search) {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const ctx = {};
  const track = q.get('track');
  if (track) ctx.trackId = track;
  const day = Number(q.get('day'));
  if (day > 0) ctx.day = day;
  const verse = Number(q.get('verse'));
  if (verse > 0) ctx.verse = verse;
  const gv = q.get('gv');
  if (gv) ctx.gv = gv;
  const progressId = q.get('progressId');
  if (progressId) ctx.progressId = progressId;
  const display = q.get('display');
  if (display) ctx.displayMode = display;
  return ctx;
}

function parseReaderLocation(hash, search = '') {
  const raw = hash.replace(/^#/, '');
  const [view, seg] = raw.split('/');
  if (view !== 'reader' || !seg) return null;
  const [b, c] = seg.split('-').map(Number);
  if (!b || !c) return null;
  return { view: 'reader', bookId: b, chapter: c, ...decodeReaderQuery(search) };
}

function formatReaderLocation(route) {
  return `#reader/${route.bookId}-${route.chapter}${encodeReaderQuery(route)}`;
}

// —— Day 14 約拿（驗收基準）——
const planPath = path.join(root, 'src/assets/tracks/thirty_day_plan.json');
if (!fs.existsSync(planPath)) {
  fail('missing thirty_day_plan.json');
} else {
  const plan = JSON.parse(fs.readFileSync(planPath, 'utf-8'));
  const d14 = plan.days.find((d) => d.day === 14);
  if (!d14) fail('thirty_day_plan missing day 14');
  else if (d14.bookId !== 32 || d14.chapter !== 2) {
    fail(`day 14 expected Jonah 32:2, got ${d14.bookId}:${d14.chapter}`);
  } else {
    ok('Day 14 → bookId 32 chapter 2 (Jonah)');
  }

  const unit = {
    trackId: '30day',
    progressId: `30d:${d14.day}`,
    bookId: d14.bookId,
    chapter: d14.chapter,
    day: d14.day,
    displayMode: 'chapter',
  };
  const url = formatReaderLocation(unit);
  const parsed = parseReaderLocation(url.split('?')[0], url.includes('?') ? '?' + url.split('?')[1] : '');
  if (!parsed || parsed.bookId !== 32 || parsed.chapter !== 2 || parsed.day !== 14 || parsed.trackId !== '30day') {
    fail(`round-trip URL failed: ${url} → ${JSON.stringify(parsed)}`);
  } else {
    ok('30day Day 14 URL round-trip');
  }
}

// golden verse mode
const goldenPath = path.join(root, 'src/assets/tracks/golden_verses.json');
if (fs.existsSync(goldenPath)) {
  const golden = JSON.parse(fs.readFileSync(goldenPath, 'utf-8'));
  const v = golden.verses[0];
  const gRoute = {
    bookId: v.bookId,
    chapter: v.chapter,
    verse: v.verse,
    trackId: 'golden',
    gv: v.id,
    progressId: `gv:${v.id}`,
    displayMode: 'verse',
  };
  const gUrl = formatReaderLocation(gRoute);
  const gParsed = parseReaderLocation('#reader/' + v.bookId + '-' + v.chapter, gUrl.slice(gUrl.indexOf('?')));
  if (!gParsed || gParsed.verse !== v.verse || gParsed.gv !== v.id || gParsed.displayMode !== 'verse') {
    fail(`golden URL round-trip: ${gUrl}`);
  } else {
    ok('golden verse URL round-trip');
  }
}

const required = [
  'src/app/contract/readingUnit.ts',
  'src/app/contract/routeState.ts',
  'src/app/contract/routeCodec.ts',
];
for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) fail(`missing ${rel}`);
  else ok(`exists ${rel}`);
}

if (process.exitCode) {
  console.error('\nroute contract test(s) failed');
  process.exit(1);
}
console.log('\nOK route contract tests');
