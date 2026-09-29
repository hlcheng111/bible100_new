import type { Locale } from '../contract/routeState';
import type { RouteState } from '../contract/routeState';
import faqData from '../../assets/coach/coach_faq.json';
import { wrapWithGuardrails } from './promptGuardrails';
import { pickLocalizedField } from '../i18n/trackLocale';

export type FaqItem = {
  id: string;
  bookId?: number;
  chapter?: number;
  qZh?: string;
  qEn?: string;
  qVi?: string;
  qId?: string;
  aZh?: string;
  aEn?: string;
  aVi?: string;
  aId?: string;
};

/** 章節 → FAQ id（擴充 sync 檔無 bookId 時的命中表） */
const CHAPTER_FAQ: Record<string, string> = {
  '1:1': 'genesis-importance',
  '1:2': 'genesis-importance',
  '2:1': 'law-today',
  '2:2': 'law-today',
};

/** 非中文：目標語 → En；禁止默默噴中文 */
function pick(row: FaqItem, base: 'q' | 'a', locale: Locale): string {
  return pickLocalizedField(row as unknown as Record<string, unknown>, base, locale);
}

export function faqForChapter(
  bookId: number,
  chapter: number,
  locale: Locale
): { question: string; answer: string; id: string } | null {
  const items = (faqData as { items: FaqItem[] }).items || [];
  const hit =
    items.find((it) => it.bookId === bookId && it.chapter === chapter) ||
    items.find((it) => it.id === CHAPTER_FAQ[`${bookId}:${chapter}`]) ||
    null;
  if (!hit) return null;
  const question = pick(hit, 'q', locale);
  const answer = pick(hit, 'a', locale);
  if (!question && !answer) return null;
  return {
    id: hit.id,
    question,
    answer,
  };
}

function defaultAskQuestion(locale: Locale): string {
  if (locale === 'en') return 'What is God saying to me through this passage?';
  if (locale === 'vi') return 'Đoạn Kinh này muốn nói gì với tôi hôm nay?';
  if (locale === 'id') return 'Apa yang ingin Tuhan sampaikan kepadaku lewat bagian ini?';
  return '這段經文對我今天的生活有什麼提醒？';
}

function promptBody(locale: Locale, ctx: string, q: string): string {
  if (locale === 'en') {
    return `I just finished reading: ${ctx}.\n\nPlease help me reflect on Scripture (you are a study draft, not final authority):\n${q}\n\nAnswer plainly: ① brief summary ② one application ③ what to verify with a pastor/teacher.`;
  }
  if (locale === 'vi') {
    return `Tôi vừa đọc xong: ${ctx}.\n\nXin giúp tôi suy ngẫm Kinh Thánh (bản nháp học tập, không phải thẩm quyền cuối):\n${q}\n\nTrả lời dễ hiểu: ① tóm tắt ngắn ② một ứng dụng ③ điều cần xác nhận với mục sư/giáo viên.`;
  }
  if (locale === 'id') {
    return `Saya baru selesai membaca: ${ctx}.\n\nTolong bantu saya merenungkan Alkitab (draf belajar, bukan otoritas akhir):\n${q}\n\nJawab sederhana: ① ringkasan singkat ② satu penerapan ③ yang perlu dicek dengan gembala/guru.`;
  }
  return `我剛讀完：${ctx}。\n\n請協助我根據聖經思考（你是學習草稿，非神學權威）：\n${q}\n\n請用白話回覆：①簡短摘要 ②一則生活應用 ③需要向牧者／老師查證的部分。`;
}

export function buildDeepQnaPrompt(
  route: RouteState,
  bookLabel: string,
  faq: { question: string } | null,
  locale: Locale
): string {
  const ctx = [
    bookLabel,
    route.day != null ? `Day ${route.day}` : '',
    route.trackId ? `track=${route.trackId}` : '',
  ]
    .filter(Boolean)
    .join(' · ');
  const q = faq?.question || defaultAskQuestion(locale);
  return wrapWithGuardrails(promptBody(locale, ctx, q), locale);
}
