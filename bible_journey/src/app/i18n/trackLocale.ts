import type { Locale } from '../contract/routeState';
import { t } from './strings';

const CJK_RE = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/;

const SUFFIX: Record<Locale, string> = {
  'zh-Hant': 'Zh',
  en: 'En',
  vi: 'Vi',
  id: 'Id',
};

export function containsCjk(text: string): boolean {
  return CJK_RE.test(text);
}

/** 動態跑道資料：優先語系欄位；非中文介面禁止 fallback 到含 CJK 的 Zh 欄 */
export function pickLocalizedField(
  row: Record<string, unknown>,
  base: string,
  locale: Locale
): string {
  const suf = SUFFIX[locale];
  const primary = String(row[`${base}${suf}`] ?? '').trim();
  if (primary) {
    if (locale === 'zh-Hant' || !containsCjk(primary)) return primary;
  }
  const en = String(row[`${base}En`] ?? '').trim();
  if (en && locale !== 'zh-Hant') return en;
  const zh = String(row[`${base}Zh`] ?? '').trim();
  if (locale === 'zh-Hant' && zh) return zh;
  return '';
}

export function dayWord(locale: Locale): string {
  if (locale === 'vi') return 'Ngày';
  if (locale === 'id') return 'Hari';
  return 'Day';
}

export type ThirtyDayRow = {
  day: number;
  titleZh?: string;
  titleEn?: string;
  hintZh?: string;
  hintEn?: string;
  bookId: number;
  chapter: number;
};

/** 教練抽屜「今日主題」— 非中文介面絕不噴純中文 hint */
export function thirtyDayThemeShort(day: ThirtyDayRow, locale: Locale): string {
  if (locale === 'zh-Hant') {
    return day.hintZh || day.titleZh || `${dayWord(locale)} ${day.day}`;
  }
  const hint = pickLocalizedField(day as Record<string, unknown>, 'hint', locale);
  const title = pickLocalizedField(day as Record<string, unknown>, 'title', locale);
  if (hint) return hint;
  if (title) return title;
  return `${dayWord(locale)} ${day.day} 🕊️`;
}

/** 明日預告 / 標題列用完整標籤 */
export function thirtyDayPreviewLabel(day: ThirtyDayRow, locale: Locale): string {
  const dw = dayWord(locale);
  if (locale === 'zh-Hant') {
    const title = day.titleZh || `${dw} ${day.day}`;
    const hint = day.hintZh;
    return hint ? `${dw} ${day.day} · ${title}【${hint}】` : `${dw} ${day.day} · ${title}`;
  }
  const title = pickLocalizedField(day as Record<string, unknown>, 'title', locale) || `${dw} ${day.day}`;
  const hint = pickLocalizedField(day as Record<string, unknown>, 'hint', locale);
  if (hint) return `${dw} ${day.day} · ${title} — ${hint}`;
  return `${dw} ${day.day} · ${title}`;
}

export type GoldenRow = {
  refZh: string;
  refEn?: string;
  refVi?: string;
  refId?: string;
};

export function goldenRefLabel(g: GoldenRow, locale: Locale): string {
  if (locale === 'zh-Hant') return g.refZh;
  if (locale === 'en') return g.refEn || g.refZh;
  if (locale === 'vi') {
    const vi = (g.refVi || g.refEn || '').trim();
    return vi || g.refEn || g.refZh;
  }
  const id = g.refId || g.refEn || '';
  return id && !containsCjk(id) ? id : g.refEn || g.refZh;
}

export function themePreviewLabel(
  themeNameZh: string,
  themeNameEn: string | undefined,
  unitLabelZh: string,
  bookId: number,
  chapter: number,
  locale: Locale
): string {
  if (locale === 'zh-Hant') return `${themeNameZh} · ${unitLabelZh}`;
  const themeName =
    themeNameEn || (containsCjk(themeNameZh) ? t('trackThemeGeneric', locale) : themeNameZh);
  if (containsCjk(unitLabelZh)) {
    return `${themeName} · ${t('trackThemeUnitFallback', locale, { bookId, chapter })}`;
  }
  return `${themeName} · ${unitLabelZh}`;
}

/** 主題入口／路徑標題 — VI/ID 明確優先 nameVi/nameId，避免 HMR 舊包只剩 nameEn */
export function themeDisplayName(
  th: {
    nameZh: string;
    nameEn?: string;
    nameVi?: string;
    nameId?: string;
  },
  locale: Locale
): string {
  if (locale === 'vi') {
    const vi = (th.nameVi || '').trim();
    if (vi && !containsCjk(vi)) return vi;
  }
  if (locale === 'id') {
    const id = (th.nameId || '').trim();
    if (id && !containsCjk(id)) return id;
  }
  const name = pickLocalizedField(th as Record<string, unknown>, 'name', locale);
  if (name) return name;
  if (locale === 'zh-Hant') return th.nameZh;
  if (locale === 'vi' || locale === 'id') return t('trackThemeGeneric', locale);
  return th.nameEn || t('trackThemeGeneric', locale);
}

/** 主題路徑節點：非中文介面禁止顯示 labelZh／hintZh */
export function themeUnitDisplay(
  u: {
    labelZh: string;
    hintZh?: string;
    bookId: number;
    chapter: number;
  },
  locale: Locale,
  chapterRefLabel?: string
): { label: string; hint: string } {
  const pickedLabel = pickLocalizedField(u as Record<string, unknown>, 'label', locale);
  const pickedHint = pickLocalizedField(u as Record<string, unknown>, 'hint', locale);

  if (locale === 'zh-Hant') {
    return {
      label: pickedLabel || u.labelZh,
      hint: pickedHint || u.hintZh || '',
    };
  }

  let label = pickedLabel;
  if (!label) {
    if (!containsCjk(u.labelZh)) label = u.labelZh;
    else label = chapterRefLabel || t('trackThemeUnitFallback', locale, { bookId: u.bookId, chapter: u.chapter });
  }

  let hint = pickedHint;
  if (!hint && u.hintZh && !containsCjk(u.hintZh)) hint = u.hintZh;

  return { label, hint: hint || '' };
}

export function readerContext30Day(day: number, locale: Locale): string {
  if (locale === 'en') return `Day ${day} · 30-Day Plan`;
  if (locale === 'vi') return `Ngày ${day} · Kế hoạch 30 ngày`;
  if (locale === 'id') return `Hari ${day} · Rencana 30 Hari`;
  return `Day ${day} · 三十日`;
}

export function readerContextGolden(gvId: string, locale: Locale): string {
  if (locale === 'en') return `Golden verse · ${gvId}`;
  if (locale === 'vi') return `Câu vàng · ${gvId}`;
  if (locale === 'id') return `Ayat emas · ${gvId}`;
  return `金句 · ${gvId}`;
}

/** 三十日卡片：標題／提示（非中文不顯示 hintZh） */
export function thirtyDayCardDisplay(
  d: {
    day: number;
    titleZh: string;
    titleEn?: string;
    hintZh?: string;
    bookId: number;
    chapter: number;
  },
  locale: Locale,
  chapterRefLabel?: string
): { dayLabel: string; title: string; hint: string; ref: string } {
  const dw = dayWord(locale);
  const dayLabel = `${dw} ${d.day}`;
  const title =
    pickLocalizedField(d as Record<string, unknown>, 'title', locale) ||
    (locale === 'zh-Hant' ? d.titleZh : d.titleEn || `${dw} ${d.day}`);
  let hint = pickLocalizedField(d as Record<string, unknown>, 'hint', locale);
  if (!hint && locale === 'zh-Hant') hint = d.hintZh || '';
  if (hint && locale !== 'zh-Hant' && containsCjk(hint)) hint = '';

  const ref =
    chapterRefLabel || t('trackThemeUnitFallback', locale, { bookId: d.bookId, chapter: d.chapter });

  return { dayLabel, title, hint, ref };
}

/** 金句卡片：經文參考 + 標籤 */
export function goldenCardDisplay(
  v: {
    refZh: string;
    refEn?: string;
    refVi?: string;
    refId?: string;
    tagZh?: string;
    tagEn?: string;
    tagVi?: string;
    tagId?: string;
  },
  locale: Locale
): { ref: string; tag: string } {
  const ref = goldenRefLabel(v, locale);
  let tag = pickLocalizedField(v as Record<string, unknown>, 'tag', locale);
  if (!tag && locale === 'zh-Hant') tag = v.tagZh || '';
  if (tag && locale !== 'zh-Hant' && containsCjk(tag)) tag = '';
  return { ref, tag };
}
