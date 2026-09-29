import { navigate, navigateToUnit } from '../router';
import { unitFromTheme, themeProgressId } from '../contract/readingUnit';
import { getLocale } from '../stores/locale';
import type { Locale } from '../contract/routeState';
import { t } from '../i18n/strings';
import { themeDisplayName, themeUnitDisplay } from '../i18n/trackLocale';
import { loadBibleCatalog, chapterRef } from '../bible/catalog';
import { loadThematic, type ThemeItem, type ThemeUnit } from '../tracks/trackData';
import { isUnitDone, nextIncompleteUnitInTheme } from '../stores/progress';
import { mountLoadError } from '../ui/loadError';
import { consumeThemeClearFlash } from '../stores/sessionReading';
import { PAIN_TAGS, painTagLabel, recommendThemeFromPain } from '../coach/painRecommend';
import { trackJourneyEvent } from '../stores/journeyEvents';

function esc(s: string) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function unitDoneCount(th: ThemeItem): number {
  return th.units.filter((u) => isUnitDone(themeProgressId(th.id, u.bookId, u.chapter))).length;
}

function firstOpenIndex(th: ThemeItem): number {
  const idx = th.units.findIndex((u) => !isUnitDone(themeProgressId(th.id, u.bookId, u.chapter)));
  return idx < 0 ? Math.max(0, th.units.length - 1) : idx;
}

type NodeState = 'done' | 'current' | 'locked';

function nodeState(th: ThemeItem, index: number): NodeState {
  const u = th.units[index];
  if (isUnitDone(themeProgressId(th.id, u.bookId, u.chapter))) return 'done';
  if (index === firstOpenIndex(th)) return 'current';
  const prevDone = th.units
    .slice(0, index)
    .every((x) => isUnitDone(themeProgressId(th.id, x.bookId, x.chapter)));
  return prevDone ? 'current' : 'locked';
}

function openUnit(theme: ThemeItem, u: ThemeUnit) {
  navigateToUnit(unitFromTheme(theme.id, theme.nameZh, u));
}

function renderPortals(
  list: HTMLElement,
  data: { themes: ThemeItem[] },
  loc: ReturnType<typeof getLocale>
) {
  list.innerHTML = `
    <section class="pain-pick" aria-label="${esc(t('painPickTitle', loc))}">
      <p class="pain-pick__title">${esc(t('painPickTitle', loc))}</p>
      <p class="pain-pick__lead">${esc(t('painPickLead', loc))}</p>
      <div class="pain-pick__chips" role="list">
        ${PAIN_TAGS.map(
          (tag) => `
          <button type="button" class="pain-pick__chip" role="listitem" data-pain="${tag.id}">
            <span aria-hidden="true">${tag.emoji}</span>
            <span>${esc(painTagLabel(tag.id, loc))}</span>
          </button>`
        ).join('')}
      </div>
    </section>
    <p class="theme-portals__caption">${esc(t('trackThemePortalCaption', loc))}</p>
    <div class="theme-portals" role="list">
      ${data.themes
        .map((th) => {
          const done = unitDoneCount(th);
          const total = th.units.length;
          return `
        <button type="button" class="theme-portal" role="listitem" data-theme-open="${th.id}" style="--theme-color:${th.color}">
          <span class="theme-portal__emoji" aria-hidden="true">${th.emoji}</span>
          <span class="theme-portal__name">${esc(themeDisplayName(th, loc))}</span>
          ${
            th.storyNameZh && loc === 'zh-Hant'
              ? `<span class="theme-portal__story">${esc(th.storyNameZh)}</span>`
              : ''
          }
          <span class="theme-portal__prog">${esc(t('trackThemeProg', loc, { done, total }))}</span>
        </button>`;
        })
        .join('')}
    </div>
  `;

  list.querySelectorAll('[data-pain]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tagId = (btn as HTMLElement).dataset.pain || '';
      const themeId = recommendThemeFromPain(tagId);
      if (!themeId) return;
      trackJourneyEvent('pain_pick', tagId);
      navigate({ view: 'tracks', trackId: 'theme', themeId });
    });
  });

  list.querySelectorAll('[data-theme-open]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const themeId = (btn as HTMLElement).dataset.themeOpen || '';
      if (!themeId) return;
      navigate({ view: 'tracks', trackId: 'theme', themeId });
    });
  });
}

async function renderPath(
  list: HTMLElement,
  theme: ThemeItem,
  loc: Locale
) {
  const done = unitDoneCount(theme);
  const total = theme.units.length;
  const openIdx = firstOpenIndex(theme);
  const name = themeDisplayName(theme, loc);
  const flash = consumeThemeClearFlash(theme.id);
  const clearedIdx =
    flash != null
      ? theme.units.findIndex((u) => u.bookId === flash.bookId && u.chapter === flash.chapter)
      : -1;

  let catalog: Awaited<ReturnType<typeof loadBibleCatalog>> | null = null;
  try {
    catalog = await loadBibleCatalog();
  } catch {
    catalog = null;
  }

  const unitRows = theme.units.map((u, i) => {
    const book = catalog?.books.find((b) => b.id === u.bookId);
    const refLabel = book ? chapterRef(book, u.chapter, loc) : undefined;
    const { label, hint } = themeUnitDisplay(u, loc, refLabel);
    const st = nodeState(theme, i);
    const side = i % 2 === 0 ? 'left' : 'right';
    const icon =
      st === 'done' ? '✓' : st === 'locked' ? '🔒' : i === theme.units.length - 1 ? '🏆' : String(i + 1);
    const hintHtml = hint ? `<span class="theme-path__hint">${esc(hint)}</span>` : '';
    const range =
      u.verseStart != null && u.verseEnd != null
        ? `<span class="theme-path__range">${u.verseStart}–${u.verseEnd}</span>`
        : '';
    const flashCls =
      clearedIdx === i
        ? ' theme-path__node--cleared-flash'
        : flash && i === openIdx && st === 'current'
          ? ' theme-path__node--unlock-flash'
          : '';
    return `
            <li class="theme-path__node theme-path__node--${st} theme-path__node--${side}${flashCls}" style="--i:${i}">
              <button type="button" class="theme-path__btn" data-unit-idx="${i}" aria-label="${esc(label)}">
                <span class="theme-path__bubble" aria-hidden="true">${icon}</span>
                <span class="theme-path__meta">
                  <strong class="theme-path__label">${esc(label)}</strong>
                  ${hintHtml}
                  ${range}
                </span>
              </button>
            </li>`;
  });

  list.innerHTML = `
    <section class="theme-path${flash ? ' theme-path--just-cleared' : ''}" style="--theme-color:${theme.color}" aria-labelledby="themePathTitle">
      ${
        flash
          ? `<div class="theme-path__banner" role="status">⭐ ${esc(t('themeClearBanner', loc))}</div>`
          : ''
      }
      <header class="theme-path__head">
        <button type="button" class="theme-path__back" id="btnThemeGates">${esc(t('trackThemeBackGates', loc))}</button>
        <div class="theme-path__title-row">
          <span class="theme-path__emoji" aria-hidden="true">${theme.emoji}</span>
          <div>
            <h2 id="themePathTitle" class="theme-path__title">${esc(name)}</h2>
            ${
              theme.storyNameZh && loc === 'zh-Hant'
                ? `<p class="theme-path__story">${esc(theme.storyNameZh)}</p>`
                : ''
            }
            <p class="theme-path__prog">${esc(t('trackThemeProg', loc, { done, total }))}</p>
          </div>
        </div>
        <p class="theme-path__lead">${esc(t('trackThemePathLead', loc))}</p>
        <button type="button" class="theme-path__continue" id="btnThemeContinue">${esc(t('trackThemeContinue', loc))}</button>
        <div class="theme-path__after-ctas">
          <button type="button" class="theme-path__mini-cta" id="btnPathQna">💬 ${esc(t('readDoneAskPastor', loc))}</button>
          <button type="button" class="theme-path__mini-cta" id="btnPathMentor">✨ ${esc(t('readDoneWeekReview', loc))}</button>
        </div>
      </header>

      <div class="theme-path__trail">
        <ol class="theme-path__nodes">
          ${unitRows.join('')}
        </ol>
      </div>
    </section>
  `;

  list.querySelector('#btnThemeGates')?.addEventListener('click', () => {
    navigate({ view: 'tracks', trackId: 'theme' });
  });

  list.querySelector('#btnThemeContinue')?.addEventListener('click', () => {
    openUnit(theme, theme.units[openIdx]);
  });

  list.querySelector('#btnPathQna')?.addEventListener('click', () => navigate({ view: 'qna' }));
  list.querySelector('#btnPathMentor')?.addEventListener('click', () => navigate({ view: 'mentor' }));

  list.querySelectorAll('[data-unit-idx]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number((btn as HTMLElement).dataset.unitIdx);
      const u = theme.units[idx];
      if (!u) return;
      openUnit(theme, u);
    });
  });

  if (flash) {
    const target =
      (list.querySelector('.theme-path__node--unlock-flash') as HTMLElement) ||
      (list.querySelector('.theme-path__node--cleared-flash') as HTMLElement);
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

export async function renderThematic(root: HTMLElement, themeId?: string) {
  const loc = getLocale();
  root.innerHTML = `
    <div class="view view--track-list view--theme-adventure">
      <button type="button" class="btn-ghost" id="btnBack">${t('backHome', loc)}</button>
      <header class="track-list-hero" style="--track-color:#4ecdc4">
        <span class="track-list-hero__emoji">🚪</span>
        <h1>${t('trackThemeTitle', loc)}</h1>
        <p>${t('trackThemeLead', loc)}</p>
      </header>
      <div class="track-theme-list" id="trackList"><p class="loading">${t('loading', loc)}</p></div>
    </div>
  `;
  root.querySelector('#btnBack')?.addEventListener('click', () => navigate({ view: 'home' }));

  const list = root.querySelector('#trackList') as HTMLElement;
  try {
    const data = await loadThematic();
    if (themeId) {
      const theme = data.themes.find((th) => th.id === themeId);
      if (theme) {
        await renderPath(list, theme, loc);
        return;
      }
    }
    renderPortals(list, data, loc);

    if (!themeId) {
      /* keep hub start on portals */
    }
  } catch (err) {
    mountLoadError(list, loc, { kind: 'tracks', trackId: 'theme' }, err);
  }
}

/** 供「開始第一關」捷徑（若外部仍呼叫） */
export async function startThemeFirstIncomplete(themeId: string) {
  const row = await nextIncompleteUnitInTheme(themeId);
  if (!row) return;
  navigateToUnit(unitFromTheme(row.themeId, row.themeNameZh, row.unit));
}
