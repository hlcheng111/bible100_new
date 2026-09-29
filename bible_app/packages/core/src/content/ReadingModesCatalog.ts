import thirtyDay from '../../data/thirty_day_plan.json';
import golden from '../../data/golden_verses_100.json';
import thematic from '../../data/thematic_readings.json';

export type ReadingModeId = 'bible66' | 'thirty_day' | 'golden_100' | 'thematic';

export interface ReadingModeMeta {
  id: ReadingModeId;
  nameZh: string;
  nameEn: string;
  emoji: string;
  color: string;
  descZh: string;
  descEn: string;
}

export interface ThirtyDayEntry {
  day: number;
  titleZh: string;
  titleEn: string;
  bookId: number;
  chapter: number;
  hintZh: string;
}

export interface GoldenVerseEntry {
  id: string;
  bookId: number;
  chapter: number;
  verse: number;
  refZh: string;
  refEn: string;
  tagZh: string;
}

export interface ThematicUnit {
  bookId: number;
  chapter: number;
  labelZh: string;
}

export interface ThematicTheme {
  id: string;
  nameZh: string;
  nameEn: string;
  emoji: string;
  color: string;
  units: ThematicUnit[];
}

export type AudienceId = 'kids' | 'youth' | 'adult' | 'seeker' | 'parent';

export interface AudienceMeta {
  id: AudienceId;
  nameZh: string;
  nameEn: string;
  emoji: string;
  color: string;
  descZh: string;
  isKidsPrimary: boolean;
}

export const READING_MODES: ReadingModeMeta[] = [
  {
    id: 'bible66',
    nameZh: '66 卷書目',
    nameEn: '66 Books',
    emoji: '📖',
    color: '#4ECDC4',
    descZh: '舊約 + 新約，按卷按章自由選讀',
    descEn: 'Browse all 66 books chapter by chapter',
  },
  {
    id: 'thirty_day',
    nameZh: '30 日讀經',
    nameEn: '30-Day Plan',
    emoji: '📅',
    color: '#818CF8',
    descZh: '每天一章精選，30 天走一遍信仰核心',
    descEn: 'One curated chapter per day for 30 days',
  },
  {
    id: 'golden_100',
    nameZh: '100 經文金句',
    nameEn: '100 Golden Verses',
    emoji: '⭐',
    color: '#FFE66D',
    descZh: '經典金句，一節一節記在心裡',
    descEn: 'Classic verses to treasure',
  },
  {
    id: 'thematic',
    nameZh: '主題讀經',
    nameEn: 'Thematic Reading',
    emoji: '🎯',
    color: '#FF6B6B',
    descZh: '按主題串連：信心、禱告、愛、盼望…',
    descEn: 'Read by theme: faith, prayer, love, hope…',
  },
];

export const AUDIENCES: AudienceMeta[] = [
  {
    id: 'kids',
    nameZh: '兒童開心跑',
    nameEn: 'Kids Run',
    emoji: '🦁',
    color: '#FF6B6B',
    descZh: '故事、貼紙、小遊戲',
    isKidsPrimary: true,
  },
  {
    id: 'youth',
    nameZh: '少年闖關跑',
    nameEn: 'Youth Quest',
    emoji: '🚀',
    color: '#818CF8',
    descZh: '闖關、勳章、同跑隊',
    isKidsPrimary: true,
  },
  {
    id: 'adult',
    nameZh: '成人讀經',
    nameEn: 'Adult',
    emoji: '📘',
    color: '#1e3a5f',
    descZh: '跑道、進度、雙語',
    isKidsPrimary: false,
  },
  {
    id: 'seeker',
    nameZh: '慕道探索',
    nameEn: 'Seeker',
    emoji: '🌱',
    color: '#0d9488',
    descZh: '從零開始認識信仰',
    isKidsPrimary: false,
  },
  {
    id: 'parent',
    nameZh: '家長同行',
    nameEn: 'Parent',
    emoji: '👨‍👩‍👧',
    color: '#F472B6',
    descZh: '與孩子同跑、家長工具',
    isKidsPrimary: false,
  },
];

export function getReadingMode(id: ReadingModeId): ReadingModeMeta | undefined {
  return READING_MODES.find((m) => m.id === id);
}

export function getAudience(id: AudienceId): AudienceMeta | undefined {
  return AUDIENCES.find((a) => a.id === id);
}

export function getThirtyDayPlan(): ThirtyDayEntry[] {
  return (thirtyDay as { days: ThirtyDayEntry[] }).days;
}

export function getGoldenVerses(): GoldenVerseEntry[] {
  return (golden as { verses: GoldenVerseEntry[] }).verses;
}

export function getThematicThemes(): ThematicTheme[] {
  return (thematic as { themes: ThematicTheme[] }).themes;
}

export function getThematicTheme(id: string): ThematicTheme | undefined {
  return getThematicThemes().find((t) => t.id === id);
}
