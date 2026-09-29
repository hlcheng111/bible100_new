import type { UnitProgress } from '../types';

export interface FirestoreProgressDoc {
  unitId: string;
  trackId: string;
  status: UnitProgress['status'];
  completedAt?: string;
  durationSec?: number;
  updatedAt: string;
}

export function progressDocId(trackId: string, unitId: string): string {
  return `${trackId}_${unitId.replace(`${trackId}_`, '')}`;
}

export function toFirestoreDoc(p: UnitProgress): FirestoreProgressDoc {
  return {
    unitId: p.unitId,
    trackId: p.trackId,
    status: p.status,
    completedAt: p.completedAt,
    durationSec: p.durationSec,
    updatedAt: p.updatedAt,
  };
}

export function fromFirestoreDoc(doc: FirestoreProgressDoc): UnitProgress {
  return {
    unitId: doc.unitId,
    trackId: doc.trackId,
    status: doc.status,
    completedAt: doc.completedAt,
    durationSec: doc.durationSec,
    updatedAt: doc.updatedAt,
  };
}
