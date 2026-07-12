export type ThirtyDayItem = {
  day: number;
  titleZh: string;
  titleEn: string;
  bookId: number;
  chapter: number;
  hintZh?: string;
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

export type ThemeUnit = { bookId: number; chapter: number; labelZh: string };
export type ThemeItem = {
  id: string;
  nameZh: string;
  nameEn: string;
  emoji: string;
  color: string;
  units: ThemeUnit[];
};

const base = () => `${import.meta.env.BASE_URL}data/tracks/`;

export async function loadThirtyDay() {
  const res = await fetch(`${base()}thirty_day_plan.json`);
  if (!res.ok) throw new Error('thirty_day_plan.json');
  return res.json() as Promise<{ days: ThirtyDayItem[] }>;
}

export async function loadGolden() {
  const res = await fetch(`${base()}golden_verses.json`);
  if (!res.ok) throw new Error('golden_verses.json');
  return res.json() as Promise<{ verses: GoldenItem[] }>;
}

export async function loadThematic() {
  const res = await fetch(`${base()}thematic_readings.json`);
  if (!res.ok) throw new Error('thematic_readings.json');
  return res.json() as Promise<{ themes: ThemeItem[] }>;
}
