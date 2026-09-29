import type { BibleData, Verse } from '../types';

export interface BibleQuery {
  bookId: number;
  chapter: number;
  version?: string;
}

/** In-memory / JSON bible access (SQLite adapter in app layer). */
export class BibleService {
  private primary: Verse[];
  private secondary: Verse[];
  private version: string;
  private secondaryVersion: string;

  constructor(data: BibleData, secondaryData?: BibleData) {
    this.primary = data.data;
    this.version = data.version;
    this.secondary = secondaryData?.data ?? [];
    this.secondaryVersion = secondaryData?.version ?? '';
  }

  getChapter(query: BibleQuery): { primary: Verse[]; secondary: Verse[]; version: string; secondaryVersion: string } {
    const primary = this.primary
      .filter((v) => v.b === query.bookId && v.c === query.chapter)
      .sort((a, b) => a.v - b.v);
    const secondary = this.secondary
      .filter((v) => v.b === query.bookId && v.c === query.chapter)
      .sort((a, b) => a.v - b.v);
    return {
      primary,
      secondary,
      version: this.version,
      secondaryVersion: this.secondaryVersion,
    };
  }

  static fromSampleJson(raw: {
    version: string;
    data: Verse[];
    en?: Verse[];
  }): BibleService {
    const secondary: BibleData | undefined = raw.en
      ? { version: 'SAMPLE_EN', data: raw.en }
      : undefined;
    return new BibleService({ version: raw.version, data: raw.data }, secondary);
  }
}
