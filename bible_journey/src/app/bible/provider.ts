import type { Locale } from '../router';
import { cleanQuadVerse } from './cleanVerseText';

export type QuadVerse = {
  verse: number;
  zh: string;
  en: string;
  vi: string;
  id: string;
};

export type ChapterPayload = {
  bookId: number;
  chapter: number;
  verses: QuadVerse[];
};

export interface BibleProvider {
  getChapter(bookId: number, chapter: number): Promise<ChapterPayload>;
}

/** 章節 JSON（由 npm run export:bible 產生，執行時 fetch） */
export class JsonChapterProvider implements BibleProvider {
  async getChapter(bookId: number, chapter: number): Promise<ChapterPayload> {
    const file = `${bookId}_${chapter}.json`;
    const base = `${import.meta.env.BASE_URL}data/bible/`;
    const res = await fetch(`${base}${file}`);
    if (!res.ok) {
      throw new Error(`Chapter not found: ${bookId}:${chapter} (run npm run export:bible)`);
    }
    const raw = (await res.json()) as ChapterPayload;
    return {
      bookId: raw.bookId,
      chapter: raw.chapter,
      verses: raw.verses.map(cleanQuadVerse),
    };
  }
}

/** 預留：sql.js + bible_reader.db（完整 66 卷四語） */
export class SqlJsProvider implements BibleProvider {
  private ready: Promise<void>;

  constructor() {
    this.ready = Promise.resolve();
  }

  async getChapter(bookId: number, chapter: number): Promise<ChapterPayload> {
    await this.ready;
    throw new Error('SqlJsProvider not wired yet — use export script from bible_reader.db');
  }
}

let provider: BibleProvider = new JsonChapterProvider();

export function getBibleProvider(): BibleProvider {
  return provider;
}

export function setBibleProvider(p: BibleProvider) {
  provider = p;
}

export function verseText(v: QuadVerse, locale: Locale): string {
  if (locale === 'en') return v.en;
  if (locale === 'vi') return v.vi;
  if (locale === 'id') return v.id;
  return v.zh;
}
