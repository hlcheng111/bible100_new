import { thirtyDayPreviewLabel, pickLocalizedField } from '../i18n/trackLocale';
import type { Locale } from '../contract/routeState';
import type { RouteState } from '../contract/routeState';
import reflectionsData from '../../assets/coach/coach_reflections.json';
import thirtyDayPlan from '../../assets/tracks/thirty_day_plan.json';
import goldenVerses from '../../assets/tracks/golden_verses.json';
import thematicReadings from '../../assets/tracks/thematic_readings.json';

export type CoachReflection = {
  day?: number;
  bookId: number;
  chapter: number;
  challengeZh?: string;
  challengeEn?: string;
  challengeVi?: string;
  challengeId?: string;
  applicationZh?: string;
  applicationEn?: string;
  applicationVi?: string;
  applicationId?: string;
  prayerZh?: string;
  prayerEn?: string;
  prayerVi?: string;
  prayerId?: string;
  summaryZh?: string;
  summaryEn?: string;
  summaryVi?: string;
  summaryId?: string;
};

export type CoachContent = {
  summary: string;
  application: string;
  challenge: string;
  prayer: string;
  whyNote: string;
  source: 'reflection' | 'thirty_day' | 'golden' | 'theme' | 'fallback';
};

const DEFAULTS = {
  challengeZh: '今天對一個人說一句鼓勵的話。',
  challengeEn: 'Say something encouraging to someone today.',
  challengeVi: 'Động viên ai đó hôm nay.',
  challengeId: 'Berikan semangat kepada seseorang hari ini.',
  applicationZh: '把今天讀到的一節經文記在心裡，遇到困難時想起來。',
  applicationEn: 'Keep one verse from today in mind when you face difficulty.',
  applicationVi: 'Ghi nhớ một câu Kinh hôm nay khi gặp khó khăn.',
  applicationId: 'Ingat satu ayat hari ini saat menghadapi kesulitan.',
  prayerZh: '主啊，謝謝今天的話語。幫助我活出行出來。阿們。',
  prayerEn: "Lord, thank you for today's word. Help me live it out. Amen.",
  prayerVi: 'Lạy Chúa, cảm ơn lời của Ngài. Giúp con sống ra. Amen.',
  prayerId: 'Tuhan, terima kasih atas firman-Mu. Bantu aku hidupkan. Amin.',
  summaryZh: '今天選讀的這段經文，是神要向你說話的一部分。慢慢讀，留意一節打動你的經文。',
  summaryEn: 'This passage is part of what God wants to say to you today. Read slowly and notice one verse that speaks to you.',
  summaryVi: 'Đoạn Kinh này là phần lời Chúa muốn nói với bạn hôm nay. Đọc chậm và chú ý một câu chạm lòng.',
  summaryId: 'Bagian ini adalah bagian firman yang Tuhan ingin sampaikan hari ini. Baca perlahan.',
  whyZh: '聖經不是知識題庫，而是邀請你與神同行。這段經文連結在神的大故事裡。',
  whyEn: 'Scripture invites you to walk with God—not just collect facts. This passage fits into his bigger story.',
  whyVi: 'Kinh Thánh mời bạn đi cùng Chúa, không chỉ tích lũy kiến thức.',
  whyId: 'Alkitab mengajak Anda berjalan dengan Tuhan, bukan hanya mengumpulkan fakta.',
};

/** 非中文：目標語 → En；禁止默默噴中文 */
function pick(row: Record<string, unknown>, base: string, locale: Locale): string {
  return pickLocalizedField(row, base, locale);
}

function findReflection(day: number | undefined, bookId: number, chapter: number): CoachReflection | null {
  const items = (reflectionsData as { items: CoachReflection[] }).items || [];
  const hit = items.find((it) => {
    if (day != null && it.day === day) return true;
    return it.bookId === bookId && it.chapter === chapter;
  });
  return hit || null;
}

function thirtyDayMeta(day: number) {
  return thirtyDayPlan.days.find((d) => d.day === day) ?? null;
}

type GoldenRow = (typeof goldenVerses.verses)[number];

function goldenMeta(
  gvId: string | undefined,
  bookId: number,
  chapter: number,
  verse?: number
): GoldenRow | null {
  if (gvId) {
    return goldenVerses.verses.find((v) => v.id === gvId) ?? null;
  }
  const matches = goldenVerses.verses.filter(
    (v) => v.bookId === bookId && v.chapter === chapter
  );
  if (!matches.length) return null;
  if (verse != null) {
    return matches.find((v) => v.verse === verse) ?? matches[matches.length - 1];
  }
  return matches[matches.length - 1];
}

type ThemeMeta = {
  themeNameZh: string;
  themeNameEn: string;
  storyNameZh?: string;
  unit: (typeof thematicReadings.themes)[number]['units'][number];
};

function themeMeta(themeId: string | undefined, bookId: number, chapter: number): ThemeMeta | null {
  if (!themeId) return null;
  const theme = thematicReadings.themes.find((th) => th.id === themeId);
  if (!theme) return null;
  const unit = theme.units.find((u) => u.bookId === bookId && u.chapter === chapter);
  if (!unit) return null;
  return {
    themeNameZh: theme.nameZh,
    themeNameEn: theme.nameEn,
    storyNameZh: (theme as { storyNameZh?: string }).storyNameZh,
    unit,
  };
}

function buildThemeCoach(locale: Locale, meta: ThemeMeta, bookLabel: string): Omit<CoachContent, 'source'> {
  const u = meta.unit as Record<string, unknown> & {
    labelZh: string;
    hintZh?: string;
    coachSummaryZh?: string;
    coachApplicationZh?: string;
    coachChallengeZh?: string;
    coachPrayerZh?: string;
    coachWhyZh?: string;
  };
  const themeName =
    pickLocalizedField(
      { nameZh: meta.themeNameZh, nameEn: meta.themeNameEn },
      'name',
      locale
    ) ||
    meta.themeNameEn ||
    meta.themeNameZh;
  const hint =
    pickLocalizedField(u, 'hint', locale) ||
    pickLocalizedField(u, 'label', locale) ||
    (locale === 'zh-Hant' ? u.hintZh || u.labelZh : '');

  const summary =
    pickLocalizedField(u, 'coachSummary', locale) ||
    (locale === 'zh-Hant'
      ? `若你正感受到「${themeName}」：${hint}。今天讀 ${bookLabel}，慢一點也沒關係。`
      : locale === 'vi'
        ? `Nếu bạn đang cảm nhận 「${themeName}」: ${hint}. Hôm nay đọc ${bookLabel}, chậm cũng được.`
        : locale === 'id'
          ? `Jika Anda merasakan 「${themeName}」: ${hint}. Hari ini baca ${bookLabel}.`
          : `If this resonates—${themeName}: ${hint}. Read ${bookLabel} slowly.`);

  const application =
    pickLocalizedField(u, 'coachApplication', locale) ||
    pick(DEFAULTS as unknown as Record<string, unknown>, 'application', locale);

  const challenge =
    pickLocalizedField(u, 'coachChallenge', locale) ||
    pick(DEFAULTS as unknown as Record<string, unknown>, 'challenge', locale);

  const prayer =
    pickLocalizedField(u, 'coachPrayer', locale) ||
    pick(DEFAULTS as unknown as Record<string, unknown>, 'prayer', locale);

  const whyNote =
    pickLocalizedField(u, 'coachWhy', locale) ||
    pick(DEFAULTS as unknown as Record<string, unknown>, 'why', locale);

  return { summary, application, challenge, prayer, whyNote };
}

/** 金句路線：由標籤 + 經文參考組成陪伴四件套 */
function buildGoldenCoach(locale: Locale, g: GoldenRow): Omit<CoachContent, 'source'> {
  const gRow = g as Record<string, unknown>;
  const ref =
    pickLocalizedField(gRow, 'ref', locale) ||
    String(g.refEn || g.refZh || '');
  const tag =
    pickLocalizedField(gRow, 'tag', locale) ||
    (locale === 'zh-Hant' ? g.tagZh : locale === 'vi' ? 'câu này' : locale === 'id' ? 'ayat ini' : 'this verse');
  if (locale === 'en') {
    return {
      summary: `【${ref}】${tag}. Read slowly—let this one verse speak to your heart today.`,
      application: `Carry 「${tag}」 from ${ref} into one real moment today—a choice, a conversation, or a pause.`,
      challenge: `Share today's golden verse (${ref}) with one person, in person or by message.`,
      prayer: `Lord, let the truth of ${ref} shape how I live today. Amen.`,
      whyNote: `The golden track is one verse a day—small enough to remember, deep enough to change you.`,
    };
  }
  if (locale === 'vi') {
    return {
      summary: `【${ref}】${tag}. Đọc chậm—để câu Kinh này chạm vào lòng bạn.`,
      application: `Mang 「${tag}」 từ ${ref} vào một khoảnh khắc thật hôm nay.`,
      challenge: `Chia sẻ câu vàng hôm nay (${ref}) với một người.`,
      prayer: `Lạy Chúa, xin lời ${ref} định hình đời sống con. Amen.`,
      whyNote: `Đường vàng là mỗi ngày một câu—đủ nhỏ để nhớ, đủ sâu để thay đổi.`,
    };
  }
  if (locale === 'id') {
    return {
      summary: `【${ref}】${tag}. Baca perlahan—biarkan ayat ini menyentuh hati.`,
      application: `Bawa 「${tag}」 dari ${ref} ke satu momen nyata hari ini.`,
      challenge: `Bagikan ayat emas hari ini (${ref}) kepada satu orang.`,
      prayer: `Tuhan, biarkan ${ref} membentuk hidupku. Amin.`,
      whyNote: `Jalur emas: satu ayat sehari—cukup kecil untuk diingat, cukup dalam untuk mengubah.`,
    };
  }
  return {
    summary: `【${ref}】${tag}。細讀這節，讓神的話今天只對你說。`,
    application: `把「${tag}」從 ${ref} 帶進今天一個真實時刻——一個選擇、一段對話，或片刻安靜。`,
    challenge: `向一個人分享今日金句（${ref}），當面或傳訊息都可以。`,
    prayer: `主啊，願 ${ref} 的真理今天塑造我。阿們。`,
    whyNote: `金句每天一句——小到記得住，深到能溫暖你。`,
  };
}

function buildDynamicFallback(locale: Locale, bookLabel: string): Omit<CoachContent, 'source'> {
  if (locale === 'en') {
    return {
      summary: `About ${bookLabel}: read slowly and notice one verse that speaks to you.`,
      application: `Keep one line from ${bookLabel} in mind when you face difficulty today.`,
      challenge: `Say something encouraging to someone today.`,
      prayer: `Lord, thank you for today's word through ${bookLabel}. Help me live it out. Amen.`,
      whyNote: `Scripture invites you to walk with God—not just collect facts.`,
    };
  }
  if (locale === 'vi') {
    return {
      summary: `Về ${bookLabel}: đọc chậm và chú ý một câu chạm lòng.`,
      application: `Ghi nhớ một câu từ ${bookLabel} khi gặp khó khăn hôm nay.`,
      challenge: `Động viên ai đó hôm nay.`,
      prayer: `Lạy Chúa, cảm ơn lời Ngài qua ${bookLabel}. Giúp con sống ra. Amen.`,
      whyNote: `Kinh Thánh mời bạn đi cùng Chúa, không chỉ tích lũy kiến thức.`,
    };
  }
  if (locale === 'id') {
    return {
      summary: `Tentang ${bookLabel}: baca perlahan dan perhatikan satu ayat yang menyentuh.`,
      application: `Ingat satu baris dari ${bookLabel} saat menghadapi kesulitan hari ini.`,
      challenge: `Berikan semangat kepada seseorang hari ini.`,
      prayer: `Tuhan, terima kasih atas firman melalui ${bookLabel}. Bantu aku hidupkan. Amin.`,
      whyNote: `Alkitab mengajak Anda berjalan dengan Tuhan, bukan hanya mengumpulkan fakta.`,
    };
  }
  return {
    summary: `關於${bookLabel}的這段經文：慢慢讀，留意一節打動你的話。`,
    application: `把${bookLabel}中讀到的一節記在心裡，今天遇到困難時想起來。`,
    challenge: `今天對一個人說一句鼓勵的話。`,
    prayer: `主啊，謝謝藉著${bookLabel}對我說話。幫助我活出行出來。阿們。`,
    whyNote: `聖經不是知識題庫，而是邀請你與神同行。`,
  };
}

function buildSummary(
  locale: Locale,
  refl: CoachReflection | null,
  dayMeta: ReturnType<typeof thirtyDayMeta>,
  golden: GoldenRow | null,
  bookLabel: string
): string {
  if (refl) {
    const s = pick(refl as Record<string, unknown>, 'summary', locale);
    if (s) return s;
  }
  if (dayMeta) {
    if (locale === 'zh-Hant') {
      return `【Day ${dayMeta.day} · ${dayMeta.titleZh}】${dayMeta.hintZh}。今天讀 ${bookLabel}，留意神要對你說的話。`;
    }
    return `${thirtyDayPreviewLabel(dayMeta, locale)} · ${bookLabel}`;
  }
  if (golden) {
    return buildGoldenCoach(locale, golden).summary;
  }
  return pick(DEFAULTS as unknown as Record<string, unknown>, 'summary', locale);
}

export function resolveCoachContent(
  route: RouteState,
  locale: Locale,
  bookLabel: string
): CoachContent {
  const bookId = route.bookId ?? 1;
  const chapter = route.chapter ?? 1;
  const day = route.day;
  const trackId = route.trackId ?? 'bible66';

  const golden =
    trackId === 'golden' ? goldenMeta(route.gv, bookId, chapter, route.verse) : null;
  const theme = trackId === 'theme' ? themeMeta(route.themeId, bookId, chapter) : null;

  if (golden) {
    const g = buildGoldenCoach(locale, golden);
    return { ...g, source: 'golden' };
  }

  if (theme) {
    const th = buildThemeCoach(locale, theme, bookLabel);
    return { ...th, source: 'theme' };
  }

  const refl = findReflection(day, bookId, chapter);
  const dayMeta = day != null ? thirtyDayMeta(day) : null;

  if (refl) {
    return {
      summary:
        pick(refl as Record<string, unknown>, 'summary', locale) ||
        buildSummary(locale, null, dayMeta, null, bookLabel),
      application:
        pick(refl as Record<string, unknown>, 'application', locale) ||
        pick(DEFAULTS as unknown as Record<string, unknown>, 'application', locale),
      challenge:
        pick(refl as Record<string, unknown>, 'challenge', locale) ||
        pick(DEFAULTS as unknown as Record<string, unknown>, 'challenge', locale),
      prayer:
        pick(refl as Record<string, unknown>, 'prayer', locale) ||
        pick(DEFAULTS as unknown as Record<string, unknown>, 'prayer', locale),
      whyNote: pick(DEFAULTS as unknown as Record<string, unknown>, 'why', locale),
      source: 'reflection',
    };
  }

  if (dayMeta) {
    return {
      summary: buildSummary(locale, null, dayMeta, null, bookLabel),
      application: pick(DEFAULTS as unknown as Record<string, unknown>, 'application', locale),
      challenge: pick(DEFAULTS as unknown as Record<string, unknown>, 'challenge', locale),
      prayer: pick(DEFAULTS as unknown as Record<string, unknown>, 'prayer', locale),
      whyNote: pick(DEFAULTS as unknown as Record<string, unknown>, 'why', locale),
      source: 'thirty_day',
    };
  }

  const fb = buildDynamicFallback(locale, bookLabel);
  return { ...fb, source: 'fallback' };
}
