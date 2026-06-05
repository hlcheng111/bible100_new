import type { ChurchSize } from "./dimensions";
import { CHURCH_HEALTH_QUESTIONS } from "./data/churchHealthQuestions";

const STORAGE_KEY = "chp2026-swot-v2";

export type PersistedState = {
  answers: Record<string, number>;
  churchSize: ChurchSize | null;
  /** 可選：教會簡稱，顯示於報告 */
  churchName: string;
  /** 填寫人職分（AI 萬用公式 P-C-D-O 背景欄） */
  reporterRole: string;
  /** 0=背景；1–10=十維度；11=終局三 Tab */
  wizardStep: number;
};

const defaultState = (): PersistedState => ({
  answers: {},
  churchSize: null,
  churchName: "",
  reporterRole: "",
  wizardStep: 0,
});

export function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      answers:
        parsed.answers && typeof parsed.answers === "object"
          ? parsed.answers
          : {},
      churchSize:
        parsed.churchSize === "micro" ||
        parsed.churchSize === "small" ||
        parsed.churchSize === "medium" ||
        parsed.churchSize === "large"
          ? parsed.churchSize
          : null,
      churchName:
        typeof parsed.churchName === "string" ? parsed.churchName : "",
      reporterRole:
        typeof parsed.reporterRole === "string" ? parsed.reporterRole : "",
      wizardStep:
        typeof parsed.wizardStep === "number" &&
        parsed.wizardStep >= 0 &&
        parsed.wizardStep <= 11
          ? parsed.wizardStep
          : typeof (parsed as { pageIndex?: number }).pageIndex === "number"
            ? Math.min(11, (parsed as { pageIndex: number }).pageIndex)
            : 0,
    };
  } catch {
    return defaultState();
  }
}

export function saveState(state: PersistedState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function totalQuestionCount(): number {
  return CHURCH_HEALTH_QUESTIONS.length;
}
