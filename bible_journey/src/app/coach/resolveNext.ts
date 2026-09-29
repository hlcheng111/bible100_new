import type { Locale } from '../contract/routeState';
import type { RouteState } from '../contract/routeState';
import type { ReadingUnit } from '../contract/readingUnit';
import {
  unitFrom30Day,
  unitFromGolden,
  unitFromTheme,
} from '../contract/readingUnit';
import {
  goldenRefLabel,
  themePreviewLabel,
  thirtyDayPreviewLabel,
} from '../i18n/trackLocale';
import thirtyDayPlan from '../../assets/tracks/thirty_day_plan.json';
import goldenVerses from '../../assets/tracks/golden_verses.json';
import thematicReadings from '../../assets/tracks/thematic_readings.json';

export type NextUnitPreview = {
  label: string;
  unit: ReadingUnit;
};

function thirtyDayMeta(day: number) {
  return thirtyDayPlan.days.find((d) => d.day === day) ?? null;
}

/** 打卡後「明日預告」：依跑道計算下一關（標籤全語系、非中文介面不噴中文） */
export function resolveNextUnit(route: RouteState, locale: Locale): NextUnitPreview | null {
  if (route.trackId === '30day' && route.day != null) {
    const next = thirtyDayMeta(route.day + 1);
    if (!next) return null;
    const unit = unitFrom30Day(next);
    return { label: thirtyDayPreviewLabel(next, locale), unit };
  }

  if (route.trackId === 'golden') {
    const verses = goldenVerses.verses;
    let idx = -1;
    if (route.gv) idx = verses.findIndex((v) => v.id === route.gv);
    else if (route.bookId && route.chapter) {
      idx = verses.findIndex(
        (v) => v.bookId === route.bookId && v.chapter === route.chapter && v.verse === route.verse
      );
    }
    const next = idx >= 0 ? verses[idx + 1] : verses[0];
    if (!next) return null;
    const unit = unitFromGolden(next);
    return { label: goldenRefLabel(next, locale), unit };
  }

  if (route.trackId === 'theme' && route.themeId) {
    const theme = thematicReadings.themes.find((th) => th.id === route.themeId);
    if (!theme) return null;
    let foundCurrent = false;
    for (const u of theme.units) {
      if (!foundCurrent) {
        if (u.bookId === route.bookId && u.chapter === route.chapter) foundCurrent = true;
        continue;
      }
      const unit = unitFromTheme(theme.id, theme.nameZh, u);
      const label = themePreviewLabel(
        theme.nameZh,
        theme.nameEn,
        u.labelZh,
        u.bookId,
        u.chapter,
        locale
      );
      return { label, unit };
    }
    return null;
  }

  return null;
}
