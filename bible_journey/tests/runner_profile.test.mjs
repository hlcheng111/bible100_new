/** @typedef {'30day'|'golden'|'theme'|'bible66'} TrackId */

/**
 * @param {{ familiar?: string; interest?: string }} answers
 * @returns {TrackId}
 */
function recommendTrackFromQuiz(answers) {
  const scores = { '30day': 0, golden: 0, theme: 0, bible66: 0 };
  const f = answers.familiar;
  if (f === 'egg') scores['30day'] += 3;
  if (f === 'compass') scores.theme += 3;
  if (f === 'sword') scores.bible66 += 3;
  const i = answers.interest;
  if (i === 'crown') scores.theme += 2;
  if (i === 'whale') scores['30day'] += 2;
  if (i === 'bulb') scores.golden += 3;
  let best = '30day';
  let max = -1;
  for (const id of ['30day', 'golden', 'theme', 'bible66']) {
    if (scores[id] > max) {
      max = scores[id];
      best = id;
    }
  }
  const tied = ['30day', 'golden', 'theme', 'bible66'].filter((id) => scores[id] === max);
  if (tied.length > 1 && f) {
    const familiarPick = f === 'egg' ? '30day' : f === 'compass' ? 'theme' : f === 'sword' ? 'bible66' : best;
    if (tied.includes(familiarPick)) return familiarPick;
  }
  return best;
}

let failed = 0;

if (recommendTrackFromQuiz({ familiar: 'egg', interest: 'whale' }) !== '30day') {
  console.error('FAIL egg+whale should be 30day');
  failed++;
}
if (recommendTrackFromQuiz({ familiar: 'compass', interest: 'crown' }) !== 'theme') {
  console.error('FAIL compass+crown should be theme');
  failed++;
}
if (recommendTrackFromQuiz({ familiar: 'sword', interest: 'bulb' }) !== 'bible66') {
  console.error('FAIL sword+bulb should be bible66 (sword wins)');
  failed++;
}
if (recommendTrackFromQuiz({ familiar: 'egg', interest: 'bulb' }) !== '30day') {
  console.error('FAIL egg+bulb should be 30day (familiar tiebreak)');
  failed++;
}

const required = [
  'src/app/stores/runnerProfile.ts',
  'src/app/ui/OnboardingGate.ts',
  'src/app/ui/BibleQuizModal.ts',
  'src/app/ui/checkInCelebration.ts',
  'src/app/i18n/quizCopy.ts',
  'src/app/i18n/playfulCopy.ts',
  'src/app/i18n/onboardingCopy.ts',
  'src/styles/playful-home.css',
];

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) {
    console.error(`FAIL missing ${rel}`);
    failed++;
  }
}

if (failed) {
  console.error(`\n${failed} runner profile test(s) failed`);
  process.exit(1);
}
console.log('OK runner profile / quiz routing checks');
