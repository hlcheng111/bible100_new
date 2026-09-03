import { useCallback, useEffect, useState } from 'react';
import { getRunner, getCompletedIds, type RunnerType } from '../storage/kidsProgress';
import { getUnitsByTrack } from '@bible-app/core';

export function useKidsRunner() {
  const [runner, setRunnerState] = useState<RunnerType>('kids');
  const [completed, setCompleted] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const r = await getRunner();
    const c = await getCompletedIds();
    setRunnerState(r);
    setCompleted(c);
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const track = runner === 'youth' ? 'youth_quest' : 'kids_story';
  const units = getUnitsByTrack(track);
  const todayUnit =
    units.find((u) => !completed.includes(u.unitId)) ?? units[units.length - 1];
  const percent = units.length
    ? Math.round((completed.filter((id) => units.some((u) => u.unitId === id)).length / units.length) * 100)
    : 0;

  return { runner, completed, ready, units, todayUnit, percent, refresh, track };
}
