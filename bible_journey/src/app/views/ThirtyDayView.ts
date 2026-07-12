import { navigate } from '../router';
import { getLocale } from '../stores/locale';
import { t } from '../i18n/strings';
import { loadThirtyDay, type ThirtyDayItem } from '../tracks/trackData';

function esc(s: string) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function dayTitle(d: ThirtyDayItem, loc: string) {
  if (loc === 'en') return d.titleEn || d.titleZh;
  return d.titleZh;
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
    list.innerHTML = data.days
      .map(
        (d) => `
      <button type="button" class="track-day-card" data-book="${d.bookId}" data-chapter="${d.chapter}">
        <span class="track-day-card__n">Day ${d.day}</span>
        <span class="track-day-card__title">${esc(dayTitle(d, loc))}</span>
        <span class="track-day-card__ref">${d.bookId}:${d.chapter}</span>
        ${d.hintZh ? `<span class="track-day-card__hint">${esc(d.hintZh)}</span>` : ''}
      </button>`
      )
      .join('');
    list.querySelectorAll('.track-day-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        navigate({
          view: 'reader',
          bookId: Number((btn as HTMLElement).dataset.book),
          chapter: Number((btn as HTMLElement).dataset.chapter),
          trackId: '30day',
        });
      });
    });
  } catch {
    list.innerHTML = `<p class="error">${t('trackLoadFail', loc)}</p>`;
  }
}
