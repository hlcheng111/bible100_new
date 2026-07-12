import { navigate } from '../router';
import { getLocale } from '../stores/locale';
import { t } from '../i18n/strings';
import { landingCopy } from '../i18n/landingCopy';
import { loadProgress } from '../stores/progress';
import {
  enterTrackReader,
  getAllTracks,
  summarizeTrack,
  trackDoneCount,
  type TrackId,
} from '../tracks/catalog';

function esc(s: string) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function renderTrackCard(s: ReturnType<typeof summarizeTrack>, copy: ReturnType<typeof landingCopy>) {
  const pct = s.total ? Math.min(100, Math.round((s.done / s.total) * 100)) : 0;
  let title = s.letter ? `Track ${s.letter}：${s.title}` : s.title;
  if (s.id === 'golden' && s.countNote) title += `（${s.countNote}）`;
  return `
    <article class="track-card" data-track="${s.id}" style="--track-color:${s.color}">
      <div class="track-card__head">
        <span class="track-card__emoji">${esc(s.emoji)}</span>
        <div class="track-card__titles">
          ${s.letter ? `<span class="track-card__letter">Track ${s.letter}</span>` : ''}
          <h2>${esc(title)}</h2>
          ${s.audience ? `<span class="track-card__audience">${esc(s.audience)}</span>` : ''}
        </div>
      </div>
      <p class="track-card__lead">${esc(s.lead)}</p>
      <div class="track-card__progress">
        <div class="track-card__bar"><span style="width:${pct}%"></span></div>
        <span class="track-card__prog-text">${copy.progress} <strong>${esc(s.progressLabel)}</strong>${
          s.countNote ? ` · <em>${esc(s.countNote)}</em>` : ''
        }</span>
      </div>
      <button type="button" class="track-card__cta">${copy.enter}</button>
    </article>
  `;
}

export function renderHome(root: HTMLElement) {
  const loc = getLocale();
  const copy = landingCopy(loc);
  const st = loadProgress();
  const summaries = getAllTracks().map((row) =>
    summarizeTrack(row, loc, trackDoneCount(row.id as TrackId))
  );

  root.innerHTML = `
    <div class="view view--home landing-page">
      <header class="landing-hero">
        <p class="landing-hero__mascot" aria-hidden="true">🦁</p>
        <h1>${esc(copy.welcomeTitle)}</h1>
        <p class="landing-hero__tagline">${esc(t('tagline', loc))}</p>
        <p class="landing-hero__lead">${esc(t('lead', loc))}</p>
      </header>

      <section class="landing-cta" aria-labelledby="quickTitle">
        <span class="landing-cta__eyebrow">${esc(copy.quickEyebrow)}</span>
        <h2 class="landing-cta__title" id="quickTitle">${esc(t('todayCardTitle', loc))}</h2>
        <p class="landing-cta__hint">${esc(copy.quickHint)}</p>
        <button type="button" class="landing-cta__btn" id="btnStartToday">${esc(t('startToday', loc))}</button>
      </section>

      <aside class="landing-reassure" aria-label="安心說明">
        <p class="landing-reassure__text">${esc(t('reassure', loc))}</p>
      </aside>

      <section class="landing-tracks-dock" aria-labelledby="tracksDockTitle">
        <h2 class="landing-tracks-dock__title" id="tracksDockTitle">${esc(t('tracksDockTitle', loc))}</h2>
        <div class="tracks-dock">
          ${summaries
            .map(
              (s) => `
            <button type="button" class="tracks-dock__btn" data-track="${s.id}" style="--track-color:${s.color}">
              <span class="tracks-dock__emoji">${esc(s.emoji)}</span>
              <span class="tracks-dock__label">${esc(s.title)}</span>
              <span class="tracks-dock__sub">Track ${s.letter}</span>
            </button>`
            )
            .join('')}
        </div>
      </section>

      <section class="landing-flow" aria-labelledby="flowTitle">
        <h2 class="landing-flow__title" id="flowTitle">${esc(copy.flowTitle)}</h2>
        <div class="landing-flow__demo" aria-hidden="true">
          <span class="landing-flow__arrow">☀️</span><span class="landing-flow__arrow-sep">→</span>
          <span class="landing-flow__arrow">📖</span><span class="landing-flow__arrow-sep">→</span>
          <span class="landing-flow__arrow">✅</span><span class="landing-flow__arrow-sep">→</span>
          <span class="landing-flow__arrow">🤝</span>
        </div>
        <ol class="landing-flow__steps">
          ${copy.flowSteps
            .map(
              (s) => `
            <li class="landing-flow__step">
              <span class="landing-flow__step-icon" aria-hidden="true">${esc(s.icon)}</span>
              <div class="landing-flow__step-body">
                <strong>${esc(s.title)}</strong>
                <span>${esc(s.text)}</span>
              </div>
            </li>`
            )
            .join('')}
        </ol>
      </section>

      <section class="landing-story">
        <p>${esc(copy.story)}</p>
      </section>

      <div class="landing-stats landing-stats--compact">
        <div class="landing-stat">⭐ <span>${esc(copy.stars)}</span><strong>${st.stars}</strong></div>
        <div class="landing-stat">🔥 <span>${esc(copy.streak)}</span><strong>${st.streak}</strong></div>
      </div>

      <section class="landing-explore">
        <summary class="landing-explore__summary">${esc(copy.exploreSummary)}</summary>
        <div class="track-cards" aria-live="polite">
          ${summaries.map((s) => renderTrackCard(s, copy)).join('')}
        </div>
        <p class="landing-foot">${esc(copy.foot)}</p>
      </section>

      <footer class="landing-version" aria-label="版本">${esc(copy.version)}</footer>
    </div>
  `;

  root.querySelector('#btnStartToday')?.addEventListener('click', () => {
    navigate({ view: 'reader', bookId: 1, chapter: 1 });
  });

  root.querySelectorAll('.tracks-dock__btn').forEach((btn) => {
    const id = (btn as HTMLElement).dataset.track as TrackId;
    btn.addEventListener('click', () => navigate({ view: 'tracks', trackId: id }));
  });

  root.querySelectorAll('.track-card').forEach((card) => {
    const id = (card as HTMLElement).dataset.track as TrackId;
    const go = () => {
      const ref = enterTrackReader(id);
      navigate({ view: 'reader', bookId: ref.bookId, chapter: ref.chapter, trackId: id });
    };
    card.querySelector('.track-card__cta')?.addEventListener('click', (ev) => {
      ev.stopPropagation();
      go();
    });
    card.addEventListener('click', (ev) => {
      if ((ev.target as HTMLElement).closest('.track-card__cta')) return;
      navigate({ view: 'tracks', trackId: id });
    });
  });
}
