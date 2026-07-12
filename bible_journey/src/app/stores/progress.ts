const KEY = 'bible_journey_progress';

export type ProgressState = {
  stars: number;
  streak: number;
  lastDay: string;
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as ProgressState;
  } catch {
    /* ignore */
  }
  return { stars: 0, streak: 0, lastDay: '' };
}

export function saveProgress(state: ProgressState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function markTodayRead(): ProgressState {
  const st = loadProgress();
  const today = todayKey();
  if (st.lastDay !== today) {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yesterday = y.toISOString().slice(0, 10);
    st.streak = st.lastDay === yesterday ? st.streak + 1 : 1;
    st.stars += 1;
    st.lastDay = today;
    saveProgress(st);
  }
  return st;
}
