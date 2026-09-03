/** Wave 3–4：輕量本機事件與漏斗（不上傳） */
import { safeGetItem, safeParseJson, safeSetItem } from './storageSafe';

const KEY = 'bible_journey_events_v1';

export type JourneyEventName =
  | 'start_read'
  | 'check_in'
  | 'open_ask'
  | 'open_ask_ai_panel'
  | 'copy_prompt'
  | 'open_external_ai'
  | 'pain_pick'
  | 'emotion_reply'
  | 'open_study_link';

type EventRow = { name: JourneyEventName; at: number; meta?: string };

type Store = { events: EventRow[] };

function load(): Store {
  const parsed = safeParseJson<Store>(safeGetItem(KEY));
  if (!parsed || !Array.isArray(parsed.events)) return { events: [] };
  return { events: parsed.events.slice(-200) };
}

export function trackJourneyEvent(name: JourneyEventName, meta?: string) {
  try {
    const st = load();
    st.events.push({ name, at: Date.now(), meta: meta?.slice(0, 80) });
    if (st.events.length > 200) st.events = st.events.slice(-200);
    safeSetItem(KEY, JSON.stringify(st));
  } catch {
    /* ignore */
  }
}

export function countJourneyEvents(name: JourneyEventName, sinceMs?: number): number {
  const cutoff = sinceMs ?? 0;
  return load().events.filter((e) => e.name === name && e.at >= cutoff).length;
}

export type FunnelSnapshot = {
  weekStarts: number;
  weekCheckIns: number;
  weekAsks: number;
  weekPainPicks: number;
  weekEmotion: number;
  weekExternalAi: number;
  weekStudyLinks: number;
};

/** Wave 4E：本週基礎漏斗（僅本機） */
export function getFunnelSnapshot(now = Date.now()): FunnelSnapshot {
  const weekAgo = now - 7 * 86400000;
  return {
    weekStarts: countJourneyEvents('start_read', weekAgo),
    weekCheckIns: countJourneyEvents('check_in', weekAgo),
    weekAsks: countJourneyEvents('open_ask', weekAgo),
    weekPainPicks: countJourneyEvents('pain_pick', weekAgo),
    weekEmotion: countJourneyEvents('emotion_reply', weekAgo),
    weekExternalAi: countJourneyEvents('open_external_ai', weekAgo),
    weekStudyLinks: countJourneyEvents('open_study_link', weekAgo),
  };
}
