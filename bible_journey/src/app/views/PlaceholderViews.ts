import { navigate } from '../router';
import { getLocale } from '../stores/locale';
import { t } from '../i18n/strings';
import { getHelpContent } from '../i18n/helpContent';

const PLACEHOLDER: Record<string, string> = {
  squad: '🤝 同跑隊伍示範：你不在一個人跑。隊名、今日亮光留言將在下一版接上。',
  qna: '💬 牧養問答示範：常見問題白話解釋將從 coach_faq 遷移。',
  mentor: '✨ 智慧導師示範：本週回顧與下週建議將在下一版接上。',
  tracks: '🗺️ 四條跑道：請從首頁展開四條跑道卡片進入。',
};

function esc(s: string) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

export function renderPlaceholder(root: HTMLElement, key: keyof typeof PLACEHOLDER) {
  const loc = getLocale();
  root.innerHTML = `
    <div class="view view--placeholder">
      <p class="placeholder-text">${PLACEHOLDER[key]}</p>
      <button type="button" class="btn-ghost" id="btnBack">${t('backHome', loc)}</button>
    </div>
  `;
  root.querySelector('#btnBack')?.addEventListener('click', () => navigate({ view: 'home' }));
}

export function renderHelp(root: HTMLElement, kind: 'what' | 'how' | 'why') {
  const loc = getLocale();
  const pack = getHelpContent(kind, loc);

  const stepsHtml = pack.steps
    ? `<ol class="help-steps">
        ${pack.steps
          .map(
            (s) => `
          <li class="help-step">
            <span class="help-step__icon">${s.icon}</span>
            <div>
              <strong>${esc(s.title)}</strong>
              <p>${esc(s.text)}</p>
            </div>
          </li>`
          )
          .join('')}
      </ol>`
    : '';

  const sectionsHtml = pack.sections
    .map(
      (sec) => `
      <section class="help-section">
        <h2>${esc(sec.heading)}</h2>
        <p>${esc(sec.body)}</p>
        ${
          sec.bullets
            ? `<ul class="help-bullets">${sec.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`
            : ''
        }
      </section>`
    )
    .join('');

  root.innerHTML = `
    <div class="view view--help help-page">
      <button type="button" class="btn-ghost" id="btnBack">${t('backHome', loc)}</button>
      <header class="help-hero">
        <h1>${esc(pack.title)}</h1>
        <p class="help-lead">${esc(pack.lead)}</p>
      </header>
      ${stepsHtml}
      ${sectionsHtml}
      <footer class="help-cta">
        <button type="button" class="landing-cta__btn" id="btnCta">${esc(pack.cta)}</button>
      </footer>
    </div>
  `;
  root.querySelector('#btnBack')?.addEventListener('click', () => navigate({ view: 'home' }));
  root.querySelector('#btnCta')?.addEventListener('click', () => {
    navigate({ view: 'reader', bookId: 1, chapter: 1 });
  });
}
