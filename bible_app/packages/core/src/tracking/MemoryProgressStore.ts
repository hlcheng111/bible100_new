import type { ProgressStore } from './TrackingEngine';
import type { UnitProgress } from '../types';

export class MemoryProgressStore implements ProgressStore {
  private data = new Map<string, UnitProgress>();

  async get(key: string): Promise<UnitProgress | null> {
    return this.data.get(key) ?? null;
  }

  async set(key: string, value: UnitProgress): Promise<void> {
    this.data.set(key, value);
  }

  async getAll(prefix: string): Promise<UnitProgress[]> {
    const out: UnitProgress[] = [];
    for (const [k, v] of this.data) {
      if (k.startsWith(prefix)) out.push(v);
    }
    return out;
  }

  clear(): void {
    this.data.clear();
  }
}
