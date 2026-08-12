import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
  TrackingEngine,
  fromFirestoreDoc,
  toFirestoreDoc,
  progressDocId,
  type UnitProgress,
} from '@bible-app/core';
import { AsyncProgressStore } from '../storage/AsyncProgressStore';
import { ensureFirestoreDb, isFirebaseConfigured } from '../firebase/client';
import { useAuth } from './AuthContext';

interface ProgressContextValue {
  engine: TrackingEngine | null;
  refresh: () => Promise<void>;
  syncing: boolean;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);
const store = new AsyncProgressStore();

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [tick, setTick] = useState(0);

  const engine = useMemo(() => {
    if (!userId) return null;
    return new TrackingEngine(store, { userId });
  }, [userId, tick]);

  const syncFromCloud = useCallback(async () => {
    if (!isFirebaseConfigured() || !userId || userId === 'guest-local') return;
    const db = await ensureFirestoreDb();
    if (!db) return;

    setSyncing(true);
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      const snap = await getDocs(collection(db, 'users', userId, 'progress'));
      const remote: UnitProgress[] = snap.docs.map((d) =>
        fromFirestoreDoc(d.data() as ReturnType<typeof toFirestoreDoc>)
      );
      if (engine) await engine.mergeRemote(remote);
    } finally {
      setSyncing(false);
    }
  }, [userId, engine]);

  const syncToCloud = useCallback(
    async (progress: UnitProgress) => {
      if (!isFirebaseConfigured() || !userId || userId === 'guest-local') return;
      const db = await ensureFirestoreDb();
      if (!db) return;

      const { doc, setDoc } = await import('firebase/firestore');
      const id = progressDocId(progress.trackId, progress.unitId);
      await setDoc(doc(db, 'users', userId, 'progress', id), toFirestoreDoc(progress), {
        merge: true,
      });
    },
    [userId]
  );

  useEffect(() => {
    if (engine && userId && userId !== 'guest-local' && isFirebaseConfigured()) {
      syncFromCloud();
    }
  }, [engine, userId, syncFromCloud]);

  const refresh = useCallback(async () => {
    setTick((t) => t + 1);
    await syncFromCloud();
  }, [syncFromCloud]);

  useEffect(() => {
    if (!engine) return;
    const original = engine.markComplete.bind(engine);
    engine.markComplete = async (unitId: string, durationSec?: number) => {
      const result = await original(unitId, durationSec);
      await syncToCloud(result);
      return result;
    };
  }, [engine, syncToCloud]);

  return (
    <ProgressContext.Provider value={{ engine, refresh, syncing }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
