import type { Locale, Persona } from '../types';

const BOOK_NAMES: Record<number, { zh: string; en: string }> = {
  1: { zh: '創世記', en: 'Genesis' },
  40: { zh: '馬太福音', en: 'Matthew' },
  43: { zh: '約翰福音', en: 'John' },
  66: { zh: '啟示錄', en: 'Revelation' },
};

export interface PromptOptions {
  bookId: number;
  chapter?: number;
  persona: Persona;
  locale: Locale;
  outputType: 'notebooklm' | 'ppt' | 'infographic' | 'video';
}

export function generatePrompt(opts: PromptOptions): string {
  const book = BOOK_NAMES[opts.bookId] || { zh: `書卷${opts.bookId}`, en: `Book ${opts.bookId}` };
  const ch = opts.chapter ? `第 ${opts.chapter} 章` : '全書';
  const chEn = opts.chapter ? `chapter ${opts.chapter}` : 'whole book';

  const personaGuide: Record<Persona, string> = {
    seeker: '對象是初信者：用白話、生活應用、避免神學術語堆砌。',
    adult: '對象是成年信徒：可含歷史背景、解經提要、交叉經文。',
    child: '對象是兒童：用故事、插圖建議、家長陪讀提示，語氣溫暖。',
  };

  const outputGuide: Record<PromptOptions['outputType'], string> = {
    notebooklm: '產出適合 NotebookLM 的學習指南大綱（分段、討論問題、應用）。',
    ppt: '產出 8–12 頁簡報大綱（每頁標題 + 3 個要點）。',
    infographic: '產出資訊圖結構（標題、時間線、關鍵經文、視覺建議）。',
    video: '產出 3–5 分鐘短影片腳本（開場、經文、應用、結語）。',
  };

  return [
    '【聖經研讀 Prompt — 請人工審核後使用】',
    '',
    `經文範圍：${book.zh}（${book.en}）${ch} / ${chEn}`,
    personaGuide[opts.persona],
    outputGuide[opts.outputType],
    '',
    '硬性要求：',
    '1. 只引用真實經文，不可編造經節。',
    '2. 不宣稱屬靈權威，不取代牧者/老師。',
    '3. 不確定時明說需查證。',
    '4. 輸出標註「AI 草稿，需牧者審核」。',
    '',
    opts.locale === 'en'
      ? 'Please respond in English.'
      : '請以繁體中文回覆；若引用經文請標明譯本。',
  ].join('\n');
}
