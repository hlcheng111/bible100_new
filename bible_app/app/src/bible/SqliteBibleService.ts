import * as SQLite from 'expo-sqlite';
import type { Verse } from '@bible-app/core';
import { BibleService } from '@bible-app/core';
import sampleBible from '@bible-app/core/data/sample_bible.json';
import { ensureBundledBibleDb } from './importBundledBible';

const VERSION_ALIASES: Record<string, string> = {
  cuv_trust: 'cuv_trust',
  kjv: 'kjv',
  luzhen: 'luzhen',
  SAMPLE: 'SAMPLE',
  SAMPLE_EN: 'SAMPLE_EN',
};

export class SqliteBibleService {
  private db: SQLite.SQLiteDatabase | null = null;
  private fallback: BibleService;

  constructor() {
    this.fallback = BibleService.fromSampleJson(sampleBible as Parameters<typeof BibleService.fromSampleJson>[0]);
  }

  async open(): Promise<void> {
    try {
      this.db = await ensureBundledBibleDb();
      const row = await this.db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM verses');
      if (!row || row.c === 0) {
        await this.seedSample();
      }
    } catch {
      try {
        this.db = await SQLite.openDatabaseAsync('bible_reader.db');
        await this.seedSample();
      } catch {
        this.db = null;
      }
    }
  }

  private async seedSample(): Promise<void> {
    if (!this.db) return;
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS verses (
        version TEXT NOT NULL,
        b INTEGER NOT NULL,
        c INTEGER NOT NULL,
        v INTEGER NOT NULL,
        t TEXT NOT NULL,
        PRIMARY KEY (version, b, c, v)
      );
      CREATE INDEX IF NOT EXISTS idx_verses_lookup ON verses(version, b, c);
    `);
    const raw = sampleBible as { version: string; data: Verse[]; en?: Verse[] };
    for (const verse of raw.data) {
      await this.db.runAsync(
        'INSERT OR REPLACE INTO verses (version, b, c, v, t) VALUES (?, ?, ?, ?, ?)',
        [raw.version, verse.b, verse.c, verse.v, verse.t]
      );
    }
    if (raw.en) {
      for (const verse of raw.en) {
        await this.db.runAsync(
          'INSERT OR REPLACE INTO verses (version, b, c, v, t) VALUES (?, ?, ?, ?, ?)',
          ['SAMPLE_EN', verse.b, verse.c, verse.v, verse.t]
        );
      }
    }
  }

  async getChapter(
    bookId: number,
    chapter: number,
    primaryVersion = 'cuv_trust',
    secondaryVersion = 'kjv'
  ): Promise<ReturnType<BibleService['getChapter']>> {
    const pv = VERSION_ALIASES[primaryVersion] || primaryVersion;
    const sv = VERSION_ALIASES[secondaryVersion] || secondaryVersion;

    if (!this.db) {
      return this.fallback.getChapter({ bookId, chapter });
    }
    const primary = await this.db.getAllAsync<Verse>(
      'SELECT b, c, v, t FROM verses WHERE version = ? AND b = ? AND c = ? ORDER BY v',
      [pv, bookId, chapter]
    );
    if (!primary.length) {
      return this.fallback.getChapter({ bookId, chapter });
    }
    const secondary = await this.db.getAllAsync<Verse>(
      'SELECT b, c, v, t FROM verses WHERE version = ? AND b = ? AND c = ? ORDER BY v',
      [sv, bookId, chapter]
    );
    return {
      primary,
      secondary,
      version: pv,
      secondaryVersion: sv,
    };
  }
}

let singleton: SqliteBibleService | null = null;

export async function getBibleService(): Promise<SqliteBibleService> {
  if (!singleton) {
    singleton = new SqliteBibleService();
    await singleton.open();
  }
  return singleton;
}
