import type { Locale } from '../contract/routeState';
import { getLocale } from '../stores/locale';
import { getAboutTracksContent } from '../i18n/aboutTracksContent';
import { enterTrackFromHome } from '../tracks/enterTrack';

function esc(s: string) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

let modalRoot: HTMLElement | null = null;

function ensureModalRoot(): HTMLElement {
  if (modalRoot?.isConnected) return modalRoot;
  modalRoot = document.createElement('div');
  modalRoot.id = 'aboutTracksModalRoot';
  document.body.appendChild(modalRoot);
  return modalRoot;
}

export function closeAboutTracksModal() {
  const root = document.getElementById('aboutTracksModalRoot');
  if (!root) return;
  root.innerHTML = '';
  root.hidden = true;
  document.body.classList.remove('about-tracks-modal-open');
}

export function openAboutTracksModal(locale?: Locale) {
  const loc = locale ?? getLocale();
  const pack = getAboutTracksContent(loc);
  const root = ensureModalRoot();
  root.hidden = false;
  document.body.classList.add('about-tracks-modal-open');

  root.innerHTML = `
    <div class="about-tracks-modal" role="dialog" aria-modal="true" aria-labelledby="aboutTracksTitle">
      <button type="button" class="about-tracks-modal__backdrop" id="aboutTracksBackdrop" aria-label="${esc(pack.close)}"></button>
      <div class="about-tracks-modal__panel about-tracks-modal__panel--enter">
        <header class="about-tracks-modal__head">
          <h2 id="aboutTracksTitle">${esc(pack.title)}</h2>
          <p class="about-tracks-modal__lead">${esc(pack.lead)}</p>
          <button type="button" class="about-tracks-modal__close" id="aboutTracksClose">✕</button>
        </header>
        <p class="about-tracks-modal__note">${esc(pack.pasteNote)}</p>
        <div class="about-tracks-modal__grid">
          ${pack.rows
            .map(
              (row) => `
            <article class="about-tracks-modal__card" data-about-track="${row.id}">
              <span class="about-tracks-modal__emoji">${esc(row.emoji)}</span>
              <h3>${esc(row.title)}</h3>
              <p class="about-tracks-modal__meta">${esc(row.audience)} · ${esc(row.time)}</p>
              <p class="about-tracks-modal__body">${esc(row.body)}</p>
              <button type="button" class="about-tracks-modal__cta" data-about-start="${row.id}">${esc(row.cta)}</button>
            </article>`
            )
            .join('')}
        </div>
        <footer class="about-tracks-modal__foot">
          <button type="button" class="btn-ghost" id="aboutTracksDismiss">${esc(pack.close)}</button>
        </footer>
      </div>
    </div>
  `;

  requestAnimationFrame(() => {
    root.querySelector('.about-tracks-modal__panel--enter')?.classList.add('about-tracks-modal__panel--visible');
  });

  const dismiss = () => closeAboutTracksModal();
  root.querySelector('#aboutTracksBackdrop')?.addEventListener('click', dismiss);
  root.querySelector('#aboutTracksClose')?.addEventListener('click', dismiss);
  root.querySelector('#aboutTracksDismiss')?.addEventListener('click', dismiss);

  root.querySelectorAll('[data-about-start]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = (btn as HTMLElement).dataset.aboutStart as import('../tracks/catalog').TrackId;
      closeAboutTracksModal();
      void enterTrackFromHome(id);
    });
  });
}
