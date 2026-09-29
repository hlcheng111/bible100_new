import type { TrackId } from '../tracks/catalog';
import { safeGetItem, safeParseJson, safeSetItem, storageAvailable } from './storageSafe';

const KEY = 'bible_journey_runner_v1';
const SCHEMA = 1;

export type UiSkin = 'playful' | 'classic';
export type PersonaId = 'kids' | 'youth' | 'adult' | 'seeker' | 'parent';

export type RunnerProfile = {
  schema_version: number;
  uiSkin: UiSkin;
  onboarded: boolean;
  nickname: string;
  persona?: PersonaId;
  recommendedTrack?: TrackId;
  quizDone: boolean;
  celebrationEnabled: boolean;
  nicknameSkipped?: boolean;
  onboardedAt?: number;
};

function emptyProfile(): RunnerProfile {
  return {
    schema_version: SCHEMA,
    uiSkin: 'classic',
    onboarded: false,
    nickname: '',
    quizDone: false,
    celebrationEnabled: false,
  };
}

function normalize(raw: Partial<RunnerProfile> | null): RunnerProfile {
  const base = emptyProfile();
  if (!raw || typeof raw !== 'object') return base;
  const skin: UiSkin = raw.uiSkin === 'playful' ? 'playful' : 'classic';
  return {
    schema_version: SCHEMA,
    uiSkin: skin,
    onboarded: !!raw.onboarded,
    nickname: typeof raw.nickname === 'string' ? raw.nickname.slice(0, 24) : '',
    persona: raw.persona,
    recommendedTrack: raw.recommendedTrack,
    quizDone: !!raw.quizDone,
    nicknameSkipped: !!raw.nicknameSkipped,
    celebrationEnabled:
      typeof raw.celebrationEnabled === 'boolean'
        ? raw.celebrationEnabled
        : skin === 'playful',
    onboardedAt: typeof raw.onboardedAt === 'number' ? raw.onboardedAt : undefined,
  };
}

export function loadRunnerProfile(): RunnerProfile {
  const parsed = safeParseJson<Partial<RunnerProfile>>(safeGetItem(KEY));
  return normalize(parsed);
}

export function saveRunnerProfile(patch: Partial<RunnerProfile>): RunnerProfile {
  const next = normalize({ ...loadRunnerProfile(), ...patch });
  if (patch.uiSkin === 'playful' && patch.celebrationEnabled === undefined) {
    next.celebrationEnabled = true;
  }
  if (patch.uiSkin === 'classic' && patch.celebrationEnabled === undefined) {
    next.celebrationEnabled = false;
  }
  safeSetItem(KEY, JSON.stringify(next));
  syncBodySkin(next.uiSkin);
  return next;
}

export function ensureRunnerProfile(): RunnerProfile {
  const st = loadRunnerProfile();
  if (!storageAvailable()) return st;
  if (!safeGetItem(KEY)) saveRunnerProfile(st);
  syncBodySkin(st.uiSkin);
  return st;
}

export function getUiSkin(): UiSkin {
  return loadRunnerProfile().uiSkin;
}

export function isOnboarded(): boolean {
  return loadRunnerProfile().onboarded;
}

export function displayNickname(fallback: string): string {
  const n = loadRunnerProfile().nickname.trim();
  return n || fallback;
}

export function isCelebrationEnabled(): boolean {
  const st = loadRunnerProfile();
  if (!st.celebrationEnabled) return false;
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false;
  }
  return st.uiSkin === 'playful';
}

export function syncBodySkin(skin?: UiSkin) {
  if (typeof document === 'undefined') return;
  document.body.dataset.uiSkin = skin ?? loadRunnerProfile().uiSkin;
}

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeRunnerProfile(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function notifyRunnerProfile() {
  listeners.forEach((fn) => fn());
}

export function patchRunnerProfile(patch: Partial<RunnerProfile>): RunnerProfile {
  const next = saveRunnerProfile(patch);
  notifyRunnerProfile();
  return next;
}
