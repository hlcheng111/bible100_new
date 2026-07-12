import { navigate } from '../router';
import { getLocale } from '../stores/locale';
import { t } from '../i18n/strings';

export function renderToday(root: HTMLElement) {
  const loc = getLocale();
  root.innerHTML = `
    <div class="view view--today">
      <h1>☀️ ${t('today', loc)}</h1>
      <p class="lead">${t('todayLead', loc)}</p>
      <button type="button" class="btn-primary" id="btnRead">${t('todayBtn', loc)}</button>
      <button type="button" class="btn-ghost" id="btnBack">${t('backHome', loc)}</button>
    </div>
  `;
  root.querySelector('#btnRead')?.addEventListener('click', () => {
    navigate({ view: 'reader', bookId: 1, chapter: 1 });
  });
  root.querySelector('#btnBack')?.addEventListener('click', () => navigate({ view: 'home' }));
}
