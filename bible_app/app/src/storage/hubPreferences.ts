import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AudienceId, ReadingModeId } from '@bible-app/core';

const AUDIENCE_KEY = 'hub_audience';
const MODE_KEY = 'hub_last_mode';

export async function getAudience(): Promise<AudienceId | null> {
  const v = await AsyncStorage.getItem(AUDIENCE_KEY);
  if (v === 'kids' || v === 'youth' || v === 'adult' || v === 'seeker' || v === 'parent') return v;
  return null;
}

export async function setAudience(a: AudienceId): Promise<void> {
  await AsyncStorage.setItem(AUDIENCE_KEY, a);
}

export async function getLastMode(): Promise<ReadingModeId | null> {
  const v = await AsyncStorage.getItem(MODE_KEY);
  if (v === 'bible66' || v === 'thirty_day' || v === 'golden_100' || v === 'thematic') return v;
  return null;
}

export async function setLastMode(m: ReadingModeId): Promise<void> {
  await AsyncStorage.setItem(MODE_KEY, m);
}
