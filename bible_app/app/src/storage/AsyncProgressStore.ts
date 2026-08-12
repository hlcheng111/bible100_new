import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ProgressStore } from '@bible-app/core';
import type { UnitProgress } from '@bible-app/core';

export class AsyncProgressStore implements ProgressStore {
  async get(key: string): Promise<UnitProgress | null> {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UnitProgress;
    } catch {
      return null;
    }
  }

  async set(key: string, value: UnitProgress): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  }

  async getAll(prefix: string): Promise<UnitProgress[]> {
    const keys = await AsyncStorage.getAllKeys();
    const matched = keys.filter((k) => k.startsWith(prefix));
    const pairs = await AsyncStorage.multiGet(matched);
    const out: UnitProgress[] = [];
    for (const [, v] of pairs) {
      if (!v) continue;
      try {
        out.push(JSON.parse(v) as UnitProgress);
      } catch {
        /* skip */
      }
    }
    return out;
  }
}
