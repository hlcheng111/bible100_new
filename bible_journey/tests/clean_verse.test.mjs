import assert from 'assert';

function cleanVerseText(text) {
  if (!text) return '';
  let s = text;
  for (let i = 0; i < 3; i++) s = s.replace(/\{[^{}]*\}/g, '');
  for (let i = 0; i < 3; i++) s = s.replace(/<[^>]+>/g, '');
  s = s.replace(/[\u3000]+/g, ' ');
  return s.replace(/\s+/g, ' ').trim();
}

const raw =
  '起初<WAH9002><WH7225>，　神<WH430>创造<WH1254><WTH8804>{<WH853>}天<WH8064>{<WH853>}地<WH776>。';
const cleaned = cleanVerseText(raw);
assert(!cleaned.includes('<'), cleaned);
assert(!cleaned.includes('{'), cleaned);
assert(cleaned.includes('起初'), cleaned);

const fi = 'And darkness<WH2822> <FI>was<Fi> upon the face<WH6440>.<CM>';
const c2 = cleanVerseText(fi);
assert(!c2.includes('<'), c2);

console.log('OK cleanVerseText');
