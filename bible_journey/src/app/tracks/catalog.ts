import type { Locale } from '../router';
import manifest from '../../data/reading_tracks_manifest.json';

export type TrackId = 'bible66' | '30day' | 'golden' | 'theme';

export type TrackMeta = (typeof manifest.tracks)[number];

const SUFFIX: Record<Locale, string> = {
  'zh-Hant': 'Zh',
  en: 'En',
  vi: 'Vi',
  id: 'Id',
};

const TRACK_LETTERS: Record<TrackId, string> = {
  bible66: 'A',
  '30day': 'B',
  golden: 'C',
  theme: 'D',
};

export function getAllTracks(): TrackMeta[] {
  return manifest.tracks;
}

export function getTrack(id: TrackId): TrackMeta | undefined {
  return manifest.tracks.find((t) => t.id === id);
}

function pick(row: TrackMeta, base: string, locale: Locale): string {
  const suf = SUFFIX[locale] || 'Zh';
  const key = `${base}${suf}` as keyof TrackMeta;
  const zh = `${base}Zh` as keyof TrackMeta;
  const en = `${base}En` as keyof TrackMeta;
  return String(row[key] || row[zh] || row[en] || '');
}

export type TrackSummary = {
  id: TrackId;
  letter: string;
  emoji: string;
  color: string;
  title: string;
  lead: string;
  audience: string;
  countNote: string;
  done: number;
  total: number;
  progressLabel: string;
};

export function summarizeTrack(row: TrackMeta, locale: Locale, done = 0): TrackSummary {
  const id = row.id as TrackId;
  const total = row.total || 1;
  const doneClamped = Math.min(done, total);
  return {
    id,
    letter: TRACK_LETTERS[id],
    emoji: row.emoji,
    color: row.color,
    title: pick(row, 'title', locale),
    lead: pick(row, 'lead', locale),
    audience: pick(row, 'audience', locale),
    countNote: pick(row, 'countNote', locale),
    done: doneClamped,
    total,
    progressLabel: `${doneClamped}/${total}`,
  };
}

export function trackDoneCount(id: TrackId): number {
  try {
    const raw = localStorage.getItem(`bible_journey_track_${id}`);
    if (raw) return Number(JSON.parse(raw).done) || 0;
  } catch {
    /* ignore */
  }
  return 0;
}

export function enterTrackReader(id: TrackId): { bookId: number; chapter: number } {
  if (id === '30day' || id === 'bible66') return { bookId: 1, chapter: 1 };
  if (id === 'golden') return { bookId: 1, chapter: 1 };
  return { bookId: 1, chapter: 1 };
}
