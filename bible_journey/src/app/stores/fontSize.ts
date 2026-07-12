export type FontSize = 'sm' | 'md' | 'lg';

const KEY = 'bible_journey_font_size';

const BASE_PX: Record<FontSize, string> = {
  sm: '14px',
  md: '16px',
  lg: '19px',
};

const SCALE: Record<FontSize, number> = {
  sm: 0.9,
  md: 1,
  lg: 1.15,
};

function apply(s: FontSize) {
  document.documentElement.dataset.bjFont = s;
  document.documentElement.style.setProperty('--base-font-size', BASE_PX[s]);
  document.documentElement.style.setProperty('--bj-font-scale', String(SCALE[s]));
}

let size: FontSize = 'md';
const listeners = new Set<(s: FontSize) => void>();

export function getFontSize(): FontSize {
  try {
    const raw = localStorage.getItem(KEY) as FontSize | null;
    if (raw === 'sm' || raw === 'md' || raw === 'lg') return raw;
  } catch {
    /* ignore */
  }
  return size;
}

export function setFontSize(s: FontSize) {
  size = s;
  try {
    localStorage.setItem(KEY, s);
  } catch {
    /* ignore */
  }
  apply(s);
  listeners.forEach((fn) => fn(s));
}

export function subscribeFontSize(fn: (s: FontSize) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function initFontSize() {
  size = getFontSize();
  apply(size);
}

export function fontSizeLabel(s: FontSize): string {
  if (s === 'sm') return 'A−';
  if (s === 'lg') return 'A+';
  return 'A';
}
