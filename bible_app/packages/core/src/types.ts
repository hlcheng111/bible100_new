export type Persona = 'kids' | 'youth' | 'child' | 'adult' | 'seeker' | 'parent';
export type Locale = 'zh-Hant' | 'en' | 'vi' | 'id';
export type ProgressStatus = 'unread' | 'in_progress' | 'completed';
export type UserRole = 'member' | 'leader' | 'pastor';
export type RewardType = 'badge' | 'voucher' | 'certificate';

export interface ReadingUnit {
  unitId: string;
  bookId: number;
  chapter: number;
  bookNameZh: string;
  bookNameEn: string;
}

export interface ReadingTrack {
  id: string;
  nameZh: string;
  nameEn: string;
  bookRange: [number, number];
  unitCount: number;
  units: ReadingUnit[];
}

export interface UnitProgress {
  unitId: string;
  trackId: string;
  status: ProgressStatus;
  completedAt?: string;
  durationSec?: number;
  updatedAt: string;
}

export interface UserSettings {
  locale: Locale;
  secondaryLocale?: Locale;
  bibleVersion: string;
  secondaryBibleVersion?: string;
  persona: Persona;
  remindersEnabled: boolean;
  reminderHour: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  persona: Persona;
  locale: Locale;
  churchId?: string;
  role: UserRole;
  parentUid?: string;
  settings: UserSettings;
  streak: { current: number; lastActiveDate?: string };
}

export interface Verse {
  b: number;
  c: number;
  v: number;
  t: string;
}

export interface BibleData {
  version: string;
  data: Verse[];
}

export interface GroupSession {
  sessionId: string;
  churchId: string;
  groupId: string;
  trackId: string;
  unitId: string;
  scheduledDate: string;
  title?: string;
}

export interface QnaItem {
  qnaId: string;
  churchId: string;
  question: string;
  answer?: string;
  askedBy: string;
  answeredBy?: string;
  locale: Locale;
  visibility: 'private' | 'church';
  createdAt: string;
}
