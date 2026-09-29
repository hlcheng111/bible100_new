/** 對齊 bible_app coach_state.js — bible100_coach_state_v1 */
import type { Locale } from '../contract/routeState';
import type { RouteState } from '../contract/routeState';
import { t } from '../i18n/strings';
import goldenVerses from '../../assets/tracks/golden_verses.json';
import { safeGetItem, safeParseJson, safeSetItem, storageAvailable } from './storageSafe';
import { companionsCount } from '../coach/companions';

const KEY = 'bible100_coach_state_v1';
const SCHEMA = 1;

export type SquadMember = {
  name: string;
  day?: number;
  done?: boolean;
  noteZh?: string;
  progress?: string;
  time?: string;
};

export type SquadPost = {
  id: string;
  type: 'light' | 'prayer';
  text: string;
  author?: string;
  at: number;
};

export type CoachStateData = {
  schema_version: number;
  daily: {
    date: string;
    unit_key: string;
    ring: { started: boolean; read: boolean; reflect: boolean; shared: boolean };
  };
  squad: {
    name: string;
    goal: string;
    members: SquadMember[];
    posts: SquadPost[];
  };
  mentor: { last_week_review_at: string };
};

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function emptyDaily() {
  return {
    date: todayStr(),
    unit_key: '',
    ring: { started: false, read: false, reflect: false, shared: false },
  };
}

function defaults(): CoachStateData {
  return {
    schema_version: SCHEMA,
    daily: emptyDaily(),
    squad: {
      name: '同跑小隊',
      goal: '每天一點點，一起完成三十日',
      members: [],
      posts: [],
    },
    mentor: { last_week_review_at: '' },
  };
}

export type SquadFeed = {
  lines: string[];
  isDemo: boolean;
};

function goldenVerseIndex(route: RouteState): number {
  if (route.gv) {
    const idx = goldenVerses.verses.findIndex((v) => v.id === route.gv);
    return idx >= 0 ? idx + 1 : 1;
  }
  return 1;
}

export function squadFeedLines(locale: Locale, route: RouteState): SquadFeed {
  const track = route.trackId ?? 'bible66';
  const n = companionsCount(route);

  if (track === 'theme' || track === 'bible66') {
    return {
      isDemo: true,
      lines: [t('companionsReading', locale, { n }), t('readDoneSquadEmpty', locale)],
    };
  }

  if (track === '30day' && route.day != null && route.day > 0) {
    const day = route.day;
    return {
      isDemo: true,
      lines: [
        t('companionsReading', locale, { n }),
        t('readDoneSquadDone', locale, { name: '小明', day }),
        t('readDoneSquadDone', locale, { name: '阿花', day: Math.max(1, day - 1) }),
        t('readDoneSquadDoing', locale, { name: 'David', day }),
      ],
    };
  }

  if (track === 'golden') {
    const gvN = goldenVerseIndex(route);
    const total = goldenVerses.verses.length;
    return {
      isDemo: true,
      lines: [
        t('companionsReading', locale, { n }),
        t('readDoneSquadGoldenDone', locale, { name: '小明', n: gvN, total }),
        t('readDoneSquadGoldenDoing', locale, { name: 'David', n: gvN }),
      ],
    };
  }

  const squad = loadCoachState().squad;
  const lines: string[] = [];
  for (const m of squad.members) {
    if (m.progress) {
      const tail = m.time ? ` · ${m.time}` : '';
      lines.push(`${m.name}：${m.progress}${tail}`);
    } else if (m.noteZh) {
      lines.push(`${m.name}：${m.noteZh}`);
    } else if (m.day != null) {
      lines.push(
        m.done
          ? t('readDoneSquadDone', locale, { name: m.name, day: m.day })
          : t('readDoneSquadDoing', locale, { name: m.name, day: m.day })
      );
    }
  }
  for (const p of (squad.posts || []).slice(0, 3)) {
    const who = p.author || t('readDoneSquadTeammate', locale);
    lines.push(`${who}：${p.text}`);
  }
  if (lines.length) {
    return { isDemo: true, lines };
  }
  return {
    isDemo: true,
    lines: [t('companionsReading', locale, { n }), t('readDoneSquadEmpty', locale)],
  };
}

/** 相容測試用錯誤格式：squad 為陣列、或 members 在根層 */
function normalizeParsed(raw: Record<string, unknown>): Partial<CoachStateData> {
  const base = { ...raw } as Partial<CoachStateData>;
  if (Array.isArray(raw.squad)) {
    base.squad = {
      name: '同跑小隊',
      goal: '',
      members: raw.squad as SquadMember[],
      posts: [],
    };
  }
  if (Array.isArray(raw.members) && !base.squad) {
    base.squad = {
      name: '同跑小隊',
      goal: '',
      members: raw.members as SquadMember[],
      posts: [],
    };
  }
  return base;
}

export function ensureCoachStorage(): CoachStateData {
  const st = loadCoachState();
  if (!storageAvailable()) return st;
  if (!safeGetItem(KEY)) saveCoachState(st);
  return st;
}

export function loadCoachState(): CoachStateData {
  const parsed = safeParseJson<Record<string, unknown>>(safeGetItem(KEY));
  if (!parsed) return defaults();
  try {
    const norm = normalizeParsed(parsed);
    const merged = { ...defaults(), ...norm };
    if (norm.squad) merged.squad = { ...defaults().squad, ...norm.squad };
    if (norm.daily) merged.daily = { ...defaults().daily, ...norm.daily };
    if (!Array.isArray(merged.squad.members)) merged.squad.members = [];
    if (!Array.isArray(merged.squad.posts)) merged.squad.posts = [];
    return merged;
  } catch {
    return defaults();
  }
}

export function saveCoachState(data: CoachStateData) {
  const base = defaults();
  const payload: CoachStateData = {
    ...base,
    ...data,
    squad: { ...base.squad, ...data.squad, members: data.squad?.members ?? [], posts: data.squad?.posts ?? [] },
    daily: { ...base.daily, ...data.daily },
  };
  safeSetItem(KEY, JSON.stringify(payload));
}

export function setCoachRing(
  ring: 'started' | 'read' | 'reflect' | 'shared',
  value: boolean
) {
  const st = loadCoachState();
  st.daily.ring[ring] = value;
  st.daily.date = todayStr();
  saveCoachState(st);
}

export function resetCoachState() {
  localStorage.removeItem(KEY);
}
