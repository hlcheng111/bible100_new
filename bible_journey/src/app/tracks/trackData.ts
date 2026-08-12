import thirtyDayPlan from '../../assets/tracks/thirty_day_plan.json';
import goldenVerses from '../../assets/tracks/golden_verses.json';
import thematicReadings from '../../assets/tracks/thematic_readings.json';

export type ThirtyDayItem = {
  day: number;
  titleZh: string;
  titleEn: string;
  bookId: number;
  chapter: number;
  hintZh?: string;
  verseStart?: number;
  verseEnd?: number;
};

export type GoldenItem = {
  id: string;
  bookId: number;
  chapter: number;
  verse: number;
  refZh: string;
  refEn: string;
  tagZh?: string;
};

export type ThemeUnit = {
  bookId: number;
  chapter: number;
  labelZh: string;
  labelEn?: string;
  labelVi?: string;
  labelId?: string;
  verseStart?: number;
  verseEnd?: number;
  hintZh?: string;
  hintEn?: string;
  hintVi?: string;
  hintId?: string;
  coachSummaryZh?: string;
  coachApplicationZh?: string;
  coachChallengeZh?: string;
  coachPrayerZh?: string;
  coachWhyZh?: string;
};
export type ThemeItem = {
  id: string;
  nameZh: string;
  nameEn: string;
  nameVi?: string;
  nameId?: string;
  /** 舊敘事名（可選副標） */
  storyNameZh?: string;
  emoji: string;
  color: string;
  units: ThemeUnit[];
};

export async function loadThirtyDay() {
  const data = thirtyDayPlan as { days?: ThirtyDayItem[] };
  if (!data.days?.length) throw new Error('empty thirty_day_plan');
  return data as { days: ThirtyDayItem[] };
}

export async function loadGolden() {
  const data = goldenVerses as { verses?: GoldenItem[] };
  if (!data.verses?.length) throw new Error('empty golden_verses');
  return data as { verses: GoldenItem[] };
}

export async function loadThematic() {
  const data = thematicReadings as { themes?: ThemeItem[] };
  if (!data.themes?.length) throw new Error('empty thematic_readings');
  return data as { themes: ThemeItem[] };
}
