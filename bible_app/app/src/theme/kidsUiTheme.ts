/** 兒少 UI — 高飽和、大圓角、歡迎感 */
export const kidsUi = {
  bg: '#FFF8E7',
  bgAlt: '#E8F4FF',
  text: '#2D1B4E',
  textLight: '#5C4D7A',
  white: '#FFFFFF',
  shadow: '#2D1B4E22',
  radius: 24,
  radiusSm: 16,
  fontBig: 28,
  fontTitle: 22,
  fontBody: 17,
  tabActive: '#FF6B6B',
  tabInactive: '#9CA3AF',
  mascot: '🦁',
  squadColors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA'],
};

export const youthUi = {
  ...kidsUi,
  bg: '#EEF2FF',
  bgAlt: '#FDF2F8',
  mascot: '🚀',
  tabActive: '#818CF8',
};

export function uiForRunner(runner: 'kids' | 'youth') {
  return runner === 'youth' ? youthUi : kidsUi;
}
