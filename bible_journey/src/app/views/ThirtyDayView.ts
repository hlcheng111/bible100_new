import { navigate, navigateToUnit } from '../router';
import { unitFrom30Day } from '../contract/readingUnit';
import { getLocale } from '../stores/locale';
import type { Locale } from '../contract/routeState';
import { t } from '../i18n/strings';
import { thirtyDayCardDisplay } from '../i18n/trackLocale';
import { loadBibleCatalog, chapterRef } from '../bible/catalog';
import { loadThirtyDay, type ThirtyDayItem } from '../tracks/trackData';
import { mountLoadError } from '../ui/loadError';

function esc(s: string) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

export async function renderThirtyDay(root: HTMLElement) {
  const loc = getLocale();
  root.innerHTML = `
    <div class="view view--track-list">
      <button type="button" class="btn-ghost" id="btnBack">${t('backHome', loc)}</button>
      <header class="track-list-hero" style="--track-color:#fbbf24">
        <span class="track-list-hero__emoji">📅</span>
        <h1>${t('track30Title', loc)}</h1>
        <p>${t('track30Lead', loc)}</p>
      </header>
      <div class="track-list" id="trackList"><p class="loading">${t('loading', loc)}</p></div>
    </div>
  `;
  root.querySelector('#btnBack')?.addEventListener('click', () => navigate({ view: 'home' }));

  const list = root.querySelector('#trackList') as HTMLElement;
  try {
    const data = await loadThirtyDay();
    let catalog: Awaited<ReturnType<typeof loadBibleCatalog>> | null = null;
    try {
      catalog = await loadBibleCatalog();
    } catch {
      catalog = null;
    }

    list.innerHTML = data.days
      .map((d: ThirtyDayItem) => {
        const book = catalog?.books.find((b) => b.id === d.bookId);
        const refLabel = book ? chapterRef(book, d.chapter, loc) : undefined;
        const card = thirtyDayCardDisplay(d, loc, refLabel);
        const hintHtml = card.hint
          ? `<span class="track-day-card__hint">${esc(card.hint)}</span>`
          : '';
        return `
      <button type="button" class="track-day-card" data-day="${d.day}" data-book="${d.bookId}" data-chapter="${d.chapter}">
        <span class="track-day-card__n">${esc(card.dayLabel)}</span>
        <span class="track-day-card__title">${esc(card.title)}</span>
        <span class="track-day-card__ref">${esc(card.ref)}</span>
        ${hintHtml}
      </button>`;
      })
      .join('');

    list.querySelectorAll('.track-day-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const day = data.days.find((d) => d.day === Number((btn as HTMLElement).dataset.day));
        if (day) navigateToUnit(unitFrom30Day(day));
      });
    });
  } catch (err) {
    mountLoadError(list, loc, { kind: 'tracks', trackId: '30day' }, err);
  }
}
