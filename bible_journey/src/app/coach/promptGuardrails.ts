import type { Locale } from '../contract/routeState';

/** Wave 4A：不造經／不權威 — Prompt 護欄 SSOT（無 API） */
const GUARD: Record<Locale, string> = {
  'zh-Hant':
    '【請遵守】必引用經文、不編造經文、不宣稱屬靈權威、不取代牧者／老師、不確定時明說需查證。',
  en: '【Rules】Cite Scripture; do not invent verses; claim no spiritual authority; do not replace pastors/teachers; say when unsure and encourage verification.',
  vi: '【Quy tắc】Trích Kinh Thánh; không bịa câu; không tự xưng quyền thuộc linh; không thay mục sư; nói rõ khi chưa chắc.',
  id: '【Aturan】Kutip Alkitab; jangan mengarang ayat; jangan klaim otoritas rohani; jangan ganti gembala; akui ketidakpastian.',
};

export function promptGuard(locale: Locale): string {
  return GUARD[locale] || GUARD['zh-Hant'];
}

export function wrapWithGuardrails(body: string, locale: Locale): string {
  return `${promptGuard(locale)}\n\n${body.trim()}`;
}
