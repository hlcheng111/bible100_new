import { navigate, navigateToUnit } from '../router';
import { unitFromTheme } from '../contract/readingUnit';
import type { TrackId } from './catalog';
import { nextIncompleteUnitInTheme } from '../stores/progress';

/**
 * 進入賽道：一律先到該路線的選單／地圖，再由使用者點關卡進讀經。
 * （不再直跳「下一關」以免新手全落到創 1:1）
 */
export async function enterTrackFromHome(trackId: TrackId): Promise<void> {
  navigate({ view: 'tracks', trackId });
}

/** 直接進某主題第一個未完成關（進門路徑上的「繼續」捷徑） */
export async function enterThemeUnit(themeId = 'wisdom'): Promise<void> {
  const row = await nextIncompleteUnitInTheme(themeId);
  if (row) {
    navigateToUnit(unitFromTheme(row.themeId, row.themeNameZh, row.unit));
  }
}
