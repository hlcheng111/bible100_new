import type { TrackId } from '../tracks/catalog';
import { renderBible66 } from './Bible66View';
import { renderThirtyDay } from './ThirtyDayView';
import { renderGolden } from './GoldenView';
import { renderThematic } from './ThemeView';

export function renderTracks(
  root: HTMLElement,
  trackId: TrackId,
  pickerBookId?: number,
  themeId?: string
) {
  if (trackId === 'bible66') {
    void renderBible66(root, pickerBookId ?? null);
    return;
  }
  if (trackId === '30day') {
    void renderThirtyDay(root);
    return;
  }
  if (trackId === 'golden') {
    void renderGolden(root);
    return;
  }
  if (trackId === 'theme') {
    void renderThematic(root, themeId);
    return;
  }
}
