/**
 * 移除 Strong 編號、排版標籤，輸出適合閱讀的純文字。
 */
export function cleanVerseText(text: string): string {
  if (!text) return '';
  let s = text;
  // 大括號區塊（含 {<WH853>}）
  for (let i = 0; i < 3; i++) {
    s = s.replace(/\{[^{}]*\}/g, '');
  }
  // 角括號標籤（含 <FI>…<Fi>、<WH7225>、<CM> 等）
  for (let i = 0; i < 3; i++) {
    s = s.replace(/<[^>]+>/g, '');
  }
  // 殘留空白與全形空格
  s = s.replace(/[\u3000]+/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

export function cleanQuadVerse(v: { verse: number; zh: string; en: string; vi: string; id: string }) {
  return {
    verse: v.verse,
    zh: cleanVerseText(v.zh),
    en: cleanVerseText(v.en),
    vi: cleanVerseText(v.vi),
    id: cleanVerseText(v.id),
  };
}
