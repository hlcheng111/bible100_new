import AsyncStorage from '@react-native-async-storage/async-storage';

const COMPLETED_KEY = 'kids_youth_completed';
const STICKERS_KEY = 'kids_youth_stickers';
const RUNNER_KEY = 'kids_youth_runner';

export type RunnerType = 'kids' | 'youth';

export async function getRunner(): Promise<RunnerType> {
  const v = await AsyncStorage.getItem(RUNNER_KEY);
  return v === 'youth' ? 'youth' : 'kids';
}

export async function setRunner(r: RunnerType): Promise<void> {
  await AsyncStorage.setItem(RUNNER_KEY, r);
}

export async function getCompletedIds(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(COMPLETED_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export async function markUnitComplete(unitId: string): Promise<string[]> {
  const list = await getCompletedIds();
  if (!list.includes(unitId)) list.push(unitId);
  await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(list));
  return list;
}

export async function getStickers(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(STICKERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export async function addSticker(stickerId: string): Promise<void> {
  const list = await getStickers();
  if (!list.includes(stickerId)) {
    list.push(stickerId);
    await AsyncStorage.setItem(STICKERS_KEY, JSON.stringify(list));
  }
}
