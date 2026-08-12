import type { Locale } from '../contract/routeState';
import { t } from '../i18n/strings';

export type StudyLink = {
  kind: 'passage' | 'parallel' | 'commentary';
  label: string;
  url: string;
};

const BOOK_EN: Record<number, string> = {
  1: 'Genesis',
  2: 'Exodus',
  3: 'Leviticus',
  4: 'Numbers',
  5: 'Deuteronomy',
  6: 'Joshua',
  18: 'Job',
  19: 'Psalm',
  20: 'Proverbs',
  21: 'Ecclesiastes',
  23: 'Isaiah',
  25: 'Lamentations',
  40: 'Matthew',
  41: 'Mark',
  42: 'Luke',
  43: 'John',
  45: 'Romans',
  50: 'Philippians',
  58: 'Hebrews',
};

/** 常見平行／互補經文（精選） */
const PARALLELS: Record<string, { search: string; labelZh: string; labelEn: string }[]> = {
  '1:1': [{ search: 'John 1:1-5', labelZh: '平行：約翰福音 1:1–5', labelEn: 'Parallel: John 1:1–5' }],
  '1:3': [{ search: 'John 1:1-5', labelZh: '平行：約翰福音 1:1–5', labelEn: 'Parallel: John 1:1–5' }],
  '19:23': [{ search: 'John 10:11-15', labelZh: '平行：約翰福音 10:11–15', labelEn: 'Parallel: John 10:11–15' }],
  '40:5': [{ search: 'Luke 6:20-26', labelZh: '平行：路加福音 6:20–26', labelEn: 'Parallel: Luke 6:20–26' }],
  '40:6': [{ search: 'Luke 11:1-4', labelZh: '平行：路加福音 11:1–4', labelEn: 'Parallel: Luke 11:1–4' }],
  '43:3': [{ search: 'Numbers 21:4-9', labelZh: '背景：民數記 21:4–9', labelEn: 'Background: Numbers 21:4–9' }],
  '45:8': [{ search: 'John 3:16-17', labelZh: '平行：約翰福音 3:16–17', labelEn: 'Parallel: John 3:16–17' }],
  '50:4': [{ search: 'Matthew 6:25-34', labelZh: '平行：馬太福音 6:25–34', labelEn: 'Parallel: Matthew 6:25–34' }],
};

function bibleGateway(search: string, locale: Locale): string {
  const version = locale === 'en' ? 'NIV' : 'CUVMPT';
  return `https://www.biblegateway.com/passage/?search=${encodeURIComponent(search)}&version=${version}`;
}

function bookName(bookId: number): string {
  return BOOK_EN[bookId] || `Book${bookId}`;
}

/** Wave 4B：可選外連（可靠公開資源），不喧賓奪主 */
export function studyLinksFor(bookId: number, chapter: number, locale: Locale): StudyLink[] {
  const name = bookName(bookId);
  const passage = `${name} ${chapter}`;
  const links: StudyLink[] = [
    {
      kind: 'passage',
      label: t('studyLinkPassage', locale, { ref: passage }),
      url: bibleGateway(passage, locale),
    },
  ];

  const extras = PARALLELS[`${bookId}:${chapter}`] || [];
  for (const ex of extras) {
    links.push({
      kind: 'parallel',
      label: locale === 'en' ? ex.labelEn : ex.labelZh,
      url: bibleGateway(ex.search, locale),
    });
  }

  links.push({
    kind: 'commentary',
    label: t('studyLinkCommentary', locale),
    url: `https://biblehub.com/${name.toLowerCase()}/${chapter}.htm`,
  });

  return links;
}
