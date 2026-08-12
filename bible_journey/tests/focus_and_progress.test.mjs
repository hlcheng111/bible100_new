/**
 * 經文聚焦 + 進度換算靜態驗收（對齊 focusVerses.ts 四跑道契約）
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

const golden = JSON.parse(
  fs.readFileSync(path.join(root, 'src/assets/tracks/golden_verses.json'), 'utf-8')
).verses;

const thematic = JSON.parse(
  fs.readFileSync(path.join(root, 'src/assets/tracks/thematic_readings.json'), 'utf-8')
);

const plan = JSON.parse(
  fs.readFileSync(path.join(root, 'src/assets/tracks/thirty_day_plan.json'), 'utf-8')
);

function thirtyDayMeta(day) {
  return plan.days.find((d) => d.day === day) ?? null;
}

function themeUnitMeta(themeId, bookId, chapter) {
  const theme = thematic.themes.find((th) => th.id === themeId);
  return theme?.units.find((u) => u.bookId === bookId && u.chapter === chapter) ?? null;
}

function resolveFocusVerses(route) {
  if (route.trackId === 'bible66') return null;

  if (route.trackId === '30day' && route.day != null) {
    const meta = thirtyDayMeta(route.day);
    if (meta?.verseStart != null && meta?.verseEnd != null && meta.verseEnd >= meta.verseStart) {
      const out = [];
      for (let v = meta.verseStart; v <= meta.verseEnd; v++) out.push(v);
      return out;
    }
    return null;
  }

  if (route.trackId === 'theme' && route.themeId) {
    const u = themeUnitMeta(route.themeId, route.bookId, route.chapter);
    if (u?.verseStart != null && u?.verseEnd != null && u.verseEnd >= u.verseStart) {
      const out = [];
      for (let v = u.verseStart; v <= u.verseEnd; v++) out.push(v);
      return out;
    }
    return null;
  }

  if (route.trackId === 'golden') {
    if (route.gv) {
      const hit = golden.find((v) => v.id === route.gv);
      if (hit?.verse) return [hit.verse];
    }
    if (route.verse != null) return [route.verse];
  }

  return null;
}

function resolveScrollHighlightVerse(route) {
  if (route.trackId === 'bible66' && route.verse != null) return route.verse;
  return undefined;
}

// bible66 + verse → 整章（不過濾）+ 捲動高亮
const b66 = resolveFocusVerses({ trackId: 'bible66', bookId: 7, chapter: 4, verse: 5 });
if (b66 !== null) fail('bible66+verse must not filter verses');
const hi = resolveScrollHighlightVerse({ trackId: 'bible66', verse: 5 });
if (hi !== 5) fail('bible66 scroll highlight must be verse 5');

// 30day day 9 → 1-13
const d9 = resolveFocusVerses({ trackId: '30day', day: 9, bookId: 9, chapter: 16 });
if (!d9 || d9.length !== 13 || d9[0] !== 1 || d9[12] !== 13) {
  fail('30day day 9 must filter verses 1-13');
}

// golden gv14 → verse 6 only
const g14 = resolveFocusVerses({ trackId: 'golden', gv: 'gv14', bookId: 20, chapter: 3 });
if (!g14 || g14[0] !== 6) fail('gv14 must resolve to verse 6');

// theme wisdom 箴3 → 1-13
const th = resolveFocusVerses({
  trackId: 'theme',
  themeId: 'wisdom',
  bookId: 20,
  chapter: 3,
});
if (!th || th.length !== 13) fail('theme wisdom prov 3 must filter 1-13');

const d14 = plan.days.find((d) => d.day === 14);
if (!d14 || d14.bookId !== 32 || d14.chapter !== 2) {
  fail('day 14 must be Jonah 32:2');
}

const done = {};
function next30() {
  for (const d of plan.days) {
    const pid = `30d:${d.day}`;
    if (!done[pid]) return d;
  }
  return plan.days[0];
}
for (let i = 1; i < 14; i++) done[`30d:${i}`] = true;
const next = next30();
if (next.day !== 14) fail(`next incomplete day expected 14 got ${next.day}`);

if (!process.exitCode) console.log('OK focus verses + progress resolver mirror');
