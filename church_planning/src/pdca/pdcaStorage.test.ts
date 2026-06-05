import { afterEach, describe, expect, it } from "vitest";
import {
  clearPdcaState,
  defaultPdcaState,
  loadPdcaState,
  PDCA_STORAGE_KEY,
  savePdcaState,
} from "./pdcaStorage";
import type { PdcaPersistedState } from "./types";

const store: Record<string, string> = {};

afterEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
});

describe("pdcaStorage", () => {
  it("loads default when empty", () => {
    const g = globalThis as unknown as {
      localStorage: { getItem: (k: string) => string | null; setItem: (k: string, v: string) => void; removeItem: (k: string) => void };
    };
    g.localStorage = {
      getItem: (k) => store[k] ?? null,
      setItem: (k, v) => {
        store[k] = v;
      },
      removeItem: (k) => {
        delete store[k];
      },
    };

    expect(loadPdcaState()).toEqual(defaultPdcaState());
  });

  it("round-trips state", () => {
    const g = globalThis as unknown as {
      localStorage: { getItem: (k: string) => string | null; setItem: (k: string, v: string) => void; removeItem: (k: string) => void };
    };
    g.localStorage = {
      getItem: (k) => store[k] ?? null,
      setItem: (k, v) => {
        store[k] = v;
      },
      removeItem: (k) => {
        delete store[k];
      },
    };

    const s: PdcaPersistedState = {
      version: 1,
      seasonFocusLines: ["A", "B", "C"],
      smartGoals: [],
      cycles: [],
    };
    savePdcaState(s);
    expect(store[PDCA_STORAGE_KEY]).toBeDefined();
    expect(loadPdcaState().seasonFocusLines).toEqual(["A", "B", "C"]);
    clearPdcaState();
    expect(loadPdcaState().smartGoals).toEqual([]);
  });
});
