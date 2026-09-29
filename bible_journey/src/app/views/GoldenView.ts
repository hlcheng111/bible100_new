import { navigate, navigateToUnit } from '../router';
import { unitFromGolden } from '../contract/readingUnit';
import { getLocale } from '../stores/locale';
import { t } from '../i18n/strings';
import { goldenCardDisplay } from '../i18n/trackLocale';
import { loadGolden, type GoldenItem } from '../tracks/trackData';
import { mountLoadError } from '../ui/loadError';

function esc(s: string) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
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
      .map((v: GoldenItem) => {
        const card = goldenCardDisplay(v, loc);
        const tagHtml = card.tag
          ? `<span class="track-day-card__hint">${esc(card.tag)}</span>`
          : '';
        return `
      <button type="button" class="track-day-card track-day-card--golden" data-gv="${v.id}" data-book="${v.bookId}" data-chapter="${v.chapter}">
        <span class="track-day-card__title">${esc(card.ref)}</span>
        ${tagHtml}
      </button>`;
      })
      .join('');

    list.querySelectorAll('.track-day-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const v = data.verses.find((x) => x.id === (btn as HTMLElement).dataset.gv);
        if (v) navigateToUnit(unitFromGolden(v));
      });
    });
  } catch (err) {
    mountLoadError(list, loc, { kind: 'tracks', trackId: 'golden' }, err);
  }
}
