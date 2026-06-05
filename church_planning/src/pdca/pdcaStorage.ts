import type { PdcaPersistedState } from "./types";

export const PDCA_STORAGE_KEY = "chp2026-pdca-log";
export const PDCA_STORAGE_KEY_LEGACY = "chp2026-pdca-v1";

export function defaultPdcaState(): PdcaPersistedState {
  return {
    version: 1,
    seasonFocusLines: ["", "", ""],
    smartGoals: [],
    cycles: [],
  };
}

export function loadPdcaState(): PdcaPersistedState {
  try {
    let raw = localStorage.getItem(PDCA_STORAGE_KEY);
    let fromLegacy = false;
    if (!raw) {
      raw = localStorage.getItem(PDCA_STORAGE_KEY_LEGACY);
      fromLegacy = !!raw;
    }
    if (!raw) return defaultPdcaState();
    const p = JSON.parse(raw) as Partial<PdcaPersistedState>;
    if (p.version !== 1) return defaultPdcaState();
    const normalized: PdcaPersistedState = {
      version: 1,
      seasonFocusLines: normalizeTriple(p.seasonFocusLines),
      smartGoals: Array.isArray(p.smartGoals) ? p.smartGoals : [],
      cycles: Array.isArray(p.cycles) ? p.cycles : [],
    };
    if (fromLegacy) savePdcaState(normalized);
    return normalized;
  } catch {
    return defaultPdcaState();
  }
}

function normalizeTriple(
  v: unknown
): [string, string, string] {
  if (!Array.isArray(v) || v.length < 3) return ["", "", ""];
  return [
    typeof v[0] === "string" ? v[0] : "",
    typeof v[1] === "string" ? v[1] : "",
    typeof v[2] === "string" ? v[2] : "",
  ];
}

export function savePdcaState(state: PdcaPersistedState): void {
  localStorage.setItem(PDCA_STORAGE_KEY, JSON.stringify(state));
}

export function clearPdcaState(): void {
  localStorage.removeItem(PDCA_STORAGE_KEY);
  localStorage.removeItem(PDCA_STORAGE_KEY_LEGACY);
}
