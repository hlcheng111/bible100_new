export type BibleCatalogBook = {
  id: number;
  nameZh: string;
  nameEn: string;
  nameVi: string;
  nameId: string;
  chapters: number;
  testament: 'OT' | 'NT';
};

export type BibleCatalog = {
  schemaVersion: number;
  books: BibleCatalogBook[];
  totalChapters: number;
};

let cache: BibleCatalog | null = null;

export async function loadBibleCatalog(): Promise<BibleCatalog> {
  if (cache) return cache;
  const base = `${import.meta.env.BASE_URL}data/bible/`;
  const res = await fetch(`${base}catalog.json`);
  if (!res.ok) throw new Error('catalog.json not found — run npm run export:bible');
  cache = (await res.json()) as BibleCatalog;
  return cache;
}

export function bookName(book: BibleCatalogBook, locale: string): string {
  if (locale === 'en') return book.nameEn;
  if (locale === 'vi') return book.nameVi;
  if (locale === 'id') return book.nameId;
  return book.nameZh;
}

/** 主語 + 對照語（思高站式：創世記 · Genesis） */
export function bookNamePair(book: BibleCatalogBook, locale: string): { primary: string; secondary: string } {
  const primary = bookName(book, locale);
  if (locale === 'zh-Hant') {
    const secondary = book.nameEn;
    return { primary, secondary: secondary === primary ? '' : secondary };
  }
  /** VI／ID／EN：不再附中文對照，避免混語 */
  const secondary = locale === 'en' ? '' : book.nameEn;
  return { primary, secondary: secondary === primary ? '' : secondary };
}

export function chapterRef(
  book: BibleCatalogBook,
  chapter: number,
  locale: string
): string {
  const name = bookName(book, locale);
  if (locale === 'zh-Hant') return `${name} 第 ${chapter} 章`;
  if (locale === 'en') return `${name} ${chapter}`;
  if (locale === 'vi') return `${name} chương ${chapter}`;
  if (locale === 'id') return `${name} pasal ${chapter}`;
  return `${name} ${chapter}`;
}
