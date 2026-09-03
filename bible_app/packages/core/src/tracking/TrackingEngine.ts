import type { ProgressStatus, ReadingTrack, UnitProgress } from '../types';
import tracksData from '../../data/reading_tracks.json';

export interface ProgressStore {
  get(key: string): Promise<UnitProgress | null>;
  set(key: string, value: UnitProgress): Promise<void>;
  getAll(prefix: string): Promise<UnitProgress[]>;
}

export interface TrackingEngineOptions {
  userId: string;
  minReadSeconds?: number;
}

export class TrackingEngine {
  private userId: string;
  private minReadSeconds: number;
  private store: ProgressStore;

  constructor(store: ProgressStore, options: TrackingEngineOptions) {
    this.store = store;
    this.userId = options.userId;
    this.minReadSeconds = options.minReadSeconds ?? 30;
  }

  static getTracks(): ReadingTrack[] {
    return (tracksData as unknown as { tracks: ReadingTrack[] }).tracks;
  }

  static getTrack(trackId: string): ReadingTrack | undefined {
    return TrackingEngine.getTracks().find((t) => t.id === trackId);
  }

  static parseUnitId(unitId: string): { trackId: string; bookId: number; chapter: number } | null {
    const m = unitId.match(/^(ot_front|ot_back|nt)_(\d+)_(\d+)$/);
    if (!m) return null;
    return { trackId: m[1], bookId: parseInt(m[2], 10), chapter: parseInt(m[3], 10) };
  }

  private key(unitId: string): string {
    return `progress:${this.userId}:${unitId}`;
  }

  async getProgress(unitId: string): Promise<UnitProgress> {
    const existing = await this.store.get(this.key(unitId));
    if (existing) return existing;
    const parsed = TrackingEngine.parseUnitId(unitId);
    return {
      unitId,
      trackId: parsed?.trackId ?? '',
      status: 'unread',
      updatedAt: new Date().toISOString(),
    };
  }

  async openUnit(unitId: string): Promise<UnitProgress> {
    const current = await this.getProgress(unitId);
    if (current.status === 'completed') return current;
    const parsed = TrackingEngine.parseUnitId(unitId);
    const updated: UnitProgress = {
      ...current,
      trackId: parsed?.trackId ?? current.trackId,
      status: 'in_progress',
      updatedAt: new Date().toISOString(),
    };
    await this.store.set(this.key(unitId), updated);
    return updated;
  }

  async markComplete(unitId: string, durationSec?: number): Promise<UnitProgress> {
    const parsed = TrackingEngine.parseUnitId(unitId);
    const updated: UnitProgress = {
      unitId,
      trackId: parsed?.trackId ?? '',
      status: 'completed',
      completedAt: new Date().toISOString(),
      durationSec,
      updatedAt: new Date().toISOString(),
    };
    await this.store.set(this.key(unitId), updated);
    return updated;
  }

  async getTrackSummary(trackId: string): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    percent: number;
  }> {
    const track = TrackingEngine.getTrack(trackId);
    if (!track) return { total: 0, completed: 0, inProgress: 0, percent: 0 };

    const all = await this.store.getAll(`progress:${this.userId}:`);
    const trackUnits = new Set(track.units.map((u) => u.unitId));
    let completed = 0;
    let inProgress = 0;
    for (const p of all) {
      if (!trackUnits.has(p.unitId)) continue;
      if (p.status === 'completed') completed++;
      else if (p.status === 'in_progress') inProgress++;
    }
    const total = track.unitCount;
    return {
      total,
      completed,
      inProgress,
      percent: total ? Math.round((completed / total) * 100) : 0,
    };
  }

  async allTracksComplete(): Promise<boolean> {
    const ids = ['ot_front', 'ot_back', 'nt'];
    for (const id of ids) {
      const s = await this.getTrackSummary(id);
      if (s.completed < s.total) return false;
    }
    return true;
  }

  async mergeRemote(remote: UnitProgress[]): Promise<void> {
    for (const r of remote) {
      const local = await this.getProgress(r.unitId);
      if (local.status === 'completed') continue;
      if (r.status === 'completed') {
        await this.store.set(this.key(r.unitId), { ...r, updatedAt: r.updatedAt || new Date().toISOString() });
        continue;
      }
      const localTime = new Date(local.updatedAt).getTime();
      const remoteTime = new Date(r.updatedAt).getTime();
      if (remoteTime > localTime) {
        await this.store.set(this.key(r.unitId), r);
      }
    }
  }

  getMinReadSeconds(): number {
    return this.minReadSeconds;
  }
}

export function statusLabel(status: ProgressStatus, locale: 'zh-Hant' | 'en'): string {
  const map: Record<ProgressStatus, { 'zh-Hant': string; en: string }> = {
    unread: { 'zh-Hant': '未讀', en: 'Unread' },
    in_progress: { 'zh-Hant': '進行中', en: 'In progress' },
    completed: { 'zh-Hant': '已完成', en: 'Completed' },
  };
  return map[status][locale];
}
