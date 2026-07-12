import { navigate } from '../router';
import { getLocale } from '../stores/locale';
import { t } from '../i18n/strings';
import { loadGolden, type GoldenItem } from '../tracks/trackData';

function esc(s: string) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function refLabel(v: GoldenItem, loc: string) {
  if (loc === 'en') return v.refEn || v.refZh;
  return v.refZh;
}

export async function renderGolden(root: HTMLElement) {
  const loc = getLocale();
  root.innerHTML = `
    <div class="view view--track-list">
      <button type="button" class="btn-ghost" id="btnBack">${t('backHome', loc)}</button>
      <header class="track-list-hero" style="--track-color:#fb7185">
        <span class="track-list-hero__emoji">⭐</span>
        <h1>${t('trackGoldenTitle', loc)}</h1>
        <p>${t('trackGoldenLead', loc)}</p>
      </header>
      <div class="track-list track-list--grid" id="trackList"><p class="loading">${t('loading', loc)}</p></div>
    </div>
  `;
  root.querySelector('#btnBack')?.addEventListener('click', () => navigate({ view: 'home' }));

  const list = root.querySelector('#trackList') as HTMLElement;
  try {
    const data = await loadGolden();
    list.innerHTML = data.verses
      .map(
        (v) => `
      <button type="button" class="track-day-card track-day-card--golden" data-book="${v.bookId}" data-chapter="${v.chapter}">
        <span class="track-day-card__title">${esc(refLabel(v, loc))}</span>
        ${v.tagZh ? `<span class="track-day-card__hint">${esc(v.tagZh)}</span>` : ''}
      </button>`
      )
      .join('');
    list.querySelectorAll('.track-day-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        navigate({
          view: 'reader',
          bookId: Number((btn as HTMLElement).dataset.book),
          chapter: Number((btn as HTMLElement).dataset.chapter),
          trackId: 'golden',
        });
      });
    });
  } catch {
    list.innerHTML = `<p class="error">${t('trackLoadFail', loc)}</p>`;
  }
}
