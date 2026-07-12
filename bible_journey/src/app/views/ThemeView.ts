import { navigate } from '../router';
import { getLocale } from '../stores/locale';
import { t } from '../i18n/strings';
import { loadThematic, type ThemeItem } from '../tracks/trackData';

function esc(s: string) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function themeName(th: ThemeItem, loc: string) {
  if (loc === 'en') return th.nameEn || th.nameZh;
  return th.nameZh;
}

export async function renderThematic(root: HTMLElement) {
  const loc = getLocale();
  root.innerHTML = `
    <div class="view view--track-list">
      <button type="button" class="btn-ghost" id="btnBack">${t('backHome', loc)}</button>
      <header class="track-list-hero" style="--track-color:#4ecdc4">
        <span class="track-list-hero__emoji">🎯</span>
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
    list.innerHTML = data.themes
      .map((th) => {
        const units = th.units
          .map(
            (u) =>
              `<button type="button" class="b66-chapter" data-book="${u.bookId}" data-chapter="${u.chapter}">${esc(u.labelZh)}</button>`
          )
          .join('');
        return `
        <article class="theme-card" style="--track-color:${th.color}">
          <header class="theme-card__head">
            <span class="theme-card__emoji">${th.emoji}</span>
            <h2>${esc(themeName(th, loc))}</h2>
          </header>
          <div class="theme-card__units">${units}</div>
        </article>`;
      })
      .join('');
    list.querySelectorAll('.b66-chapter').forEach((btn) => {
      btn.addEventListener('click', () => {
        navigate({
          view: 'reader',
          bookId: Number((btn as HTMLElement).dataset.book),
          chapter: Number((btn as HTMLElement).dataset.chapter),
          trackId: 'theme',
        });
      });
    });
  } catch {
    list.innerHTML = `<p class="error">${t('trackLoadFail', loc)}</p>`;
  }
}
