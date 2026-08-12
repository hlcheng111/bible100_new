import type { Persona } from '@bible-app/core';

export interface PersonaTheme {
  primary: string;
  accent: string;
  background: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  bodySize: number;
  headingSize: number;
  borderRadius: number;
}

const ADULT: PersonaTheme = {
  primary: '#1e3a5f',
  accent: '#3b82f6',
  background: '#f8fafc',
  card: '#ffffff',
  text: '#0f172a',
  muted: '#64748b',
  border: '#e2e8f0',
  bodySize: 16,
  headingSize: 22,
  borderRadius: 12,
};

const SEEKER: PersonaTheme = {
  ...ADULT,
  primary: '#0d9488',
  accent: '#14b8a6',
  bodySize: 18,
  headingSize: 24,
  borderRadius: 16,
};

const KIDS: PersonaTheme = {
  primary: '#FF6B6B',
  accent: '#FFE66D',
  background: '#FFF8E7',
  card: '#fffbeb',
  text: '#2D1B4E',
  muted: '#5C4D7A',
  border: '#FFE66D',
  bodySize: 18,
  headingSize: 24,
  borderRadius: 20,
};

const YOUTH: PersonaTheme = {
  ...KIDS,
  primary: '#818CF8',
  background: '#EEF2FF',
  accent: '#F472B6',
};

const PARENT: PersonaTheme = {
  ...ADULT,
  primary: '#F472B6',
  accent: '#FB7185',
  background: '#FDF2F8',
};

export function themeForPersona(persona: Persona): PersonaTheme {
  if (persona === 'kids' || persona === 'child') return KIDS;
  if (persona === 'youth') return YOUTH;
  if (persona === 'seeker') return SEEKER;
  if (persona === 'parent') return PARENT;
  return ADULT;
}
