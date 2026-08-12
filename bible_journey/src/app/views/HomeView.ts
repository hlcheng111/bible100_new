import { navigate, navigateToUnit } from '../router';
import { getLocale } from '../stores/locale';
import { t } from '../i18n/strings';
import { landingCopy } from '../i18n/landingCopy';
import { trackCtaCopy } from '../i18n/aboutTracksContent';
import { playfulCopy, PLAYFUL_TRACK_ORDER } from '../i18n/playfulCopy';
import { quizCopy } from '../i18n/quizCopy';
import { loadProgress } from '../stores/progress';
import { resolveToday } from '../coach/resolveToday';
import { loadTodayGuidance } from '../coach/todayGuidance';
import { enterTrackFromHome } from '../tracks/enterTrack';
import {
  getAllTracks,
  summarizeTrack,
  trackDoneCount,
  type TrackId,
} from '../tracks/catalog';
import {
  displayNickname,
  getUiSkin,
  loadRunnerProfile,
  patchRunnerProfile,
} from '../stores/runnerProfile';
import { openBibleQuizModal } from '../ui/BibleQuizModal';
import { openAboutTracksModal } from '../ui/AboutTracksModal';

function esc(s: string) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function renderTrackCardClassic(
  s: ReturnType<typeof summarizeTrack>,
  copy: ReturnType<typeof landingCopy>,
  loc: ReturnType<typeof getLocale>,
  recommended?: TrackId
) {
  const pct = s.total ? Math.min(100, Math.round((s.done / s.total) * 100)) : 0;
  const cta = trackCtaCopy(loc, s.id);
  let title = s.letter ? `${s.title}` : s.title;
  if (s.id === 'golden' && s.countNote) title += `（${s.countNote}）`;
  const rec = recommended === s.id ? ' track-card--recommended' : '';
  return `
    <article class="track-card track-card--roadmap${rec}" data-track="${s.id}" style="--track-color:${s.color}">
      <div class="track-card__roadmap-line" aria-hidden="true"></div>
      <div class="track-card__head">
        <span class="track-card__emoji">${esc(s.emoji)}</span>
        <div class="track-card__titles">
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
      <button type="button" class="track-card__cta track-card__cta--pulse">${esc(cta)}</button>
    </article>
  `;
}

function resolveActivePlayfulTrack(
  ordered: ReturnType<typeof summarizeTrack>[],
  recommended?: TrackId
): TrackId {
  let best: TrackId = 'golden';
  let bestDone = 0;
  for (const s of ordered) {
    if (s.done > bestDone) {
      bestDone = s.done;
      best = s.id;
    }
  }
  if (bestDone > 0) return best;
  return recommended ?? 'golden';
}

function renderPlayfulStep(
  s: ReturnType<typeof summarizeTrack>,
  playful: ReturnType<typeof playfulCopy>,
  opts: { isActive: boolean; isRecommended: boolean }
) {
  const { isActive, isRecommended } = opts;
  const meta = playful.trackPlayful[s.id];
  const progressPct = s.total ? Math.min(100, Math.round((s.done / s.total) * 100)) : 0;
  const carLeft = Math.max(8, Math.min(92, progressPct || 8));
  const active = isActive ? ' playful-step--active' : '';
  const rec = isRecommended ? ' playful-step--recommended' : '';

  return `
    <article class="playful-step${active}${rec}" data-track="${s.id}" style="--track-color:${s.color};--scale-pct:${meta.scalePct}%;--progress-pct:${progressPct}%;--car-left:${carLeft}%">
      <div class="playful-step__float">
        <header class="playful-step__head">
          <h3 class="playful-step__title">${esc(meta.title)}</h3>
          <div class="playful-step__badges">
            <span class="playful-step__badge playful-step__badge--audience">${esc(meta.audience)}</span>
            <span class="playful-step__badge playful-step__badge--time">${esc(meta.time)}</span>
          </div>
        </header>
        <p class="playful-step__blurb">${esc(meta.blurb)} · ${esc(s.progressLabel)}</p>
      </div>
      <div class="playful-step__runway" aria-hidden="true" title="progress ${meta.scalePct}%">
        <span class="playful-step__runway-progress"></span>
        ${isActive ? '<span class="playful-step__car">🏎️</span>' : ''}
      </div>
      <button type="button" class="playful-step__cta" data-track="${s.id}">${esc(meta.cta)}</button>
    </article>
  `;
}

function renderRoadmapDock(
  summaries: ReturnType<typeof summarizeTrack>[],
  loc: ReturnType<typeof getLocale>
) {
  return summaries
    .map(
      (s, i) => `
    <div class="tracks-roadmap__item" style="--track-color:${s.color};--roadmap-i:${i}">
      ${i > 0 ? '<span class="tracks-roadmap__arrow" aria-hidden="true">➜</span>' : ''}
      <button type="button" class="tracks-dock__btn tracks-dock__btn--roadmap" data-track="${s.id}" style="--track-color:${s.color}">
        <span class="tracks-dock__emoji">${esc(s.emoji)}</span>
        <span class="tracks-dock__label">${esc(s.title)}</span>
        <span class="tracks-dock__run">${esc(trackCtaCopy(loc, s.id))}</span>
      </button>
    </div>`
    )
    .join('');
}

function bindTodayGuidance(root: HTMLElement) {
  const el = root.querySelector('#todayGuideText') as HTMLElement | null;
  if (!el) return;
  const loc = getLocale();
  void loadTodayGuidance(loc).then(({ text }) => {
    if (!el.isConnected) return;
    el.textContent = text;
  });
}

function bindHomeEvents(root: HTMLElement) {
  root.querySelector('#btnStartToday')?.addEventListener('click', () => {
    void resolveToday().then((unit) => navigateToUnit(unit));
  });

  root.querySelector('#btnOpenQuiz')?.addEventListener('click', () => {
    openBibleQuizModal();
  });

  root.querySelector('#btnSaveNickname')?.addEventListener('click', () => {
    const input = root.querySelector('#nicknameInput') as HTMLInputElement | null;
    const val = input?.value?.trim().slice(0, 24) || '';
    patchRunnerProfile({ nickname: val });
    renderHome(root);
  });

  root.querySelector('#btnNicknameLater')?.addEventListener('click', () => {
    patchRunnerProfile({ nicknameSkipped: true });
    renderHome(root);
  });

  root.querySelector('#btnSwitchClassic')?.addEventListener('click', () => {
    patchRunnerProfile({ uiSkin: 'classic', celebrationEnabled: false });
    renderHome(root);
  });

  root.querySelector('#btnAboutTracks')?.addEventListener('click', () => {
    openAboutTracksModal(getLocale());
  });

  root.querySelectorAll('[data-path-track]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = (btn as HTMLElement).dataset.pathTrack as TrackId;
      if (id) void enterTrackFromHome(id);
    });
  });

  root.querySelectorAll('.tracks-dock__btn[data-track]').forEach((btn) => {
    const id = (btn as HTMLElement).dataset.track as TrackId;
    btn.addEventListener('click', () => {
      void enterTrackFromHome(id);
    });
  });

  root.querySelectorAll('.playful-step__cta[data-track], .playful-lane__node[data-track]').forEach((btn) => {
    const id = (btn as HTMLElement).dataset.track as TrackId;
    btn.addEventListener('click', () => {
      void enterTrackFromHome(id);
    });
  });

  root.querySelectorAll('.track-card').forEach((card) => {
    const id = (card as HTMLElement).dataset.track as TrackId;
    const go = () => {
      void enterTrackFromHome(id);
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

  bindTodayGuidance(root);
}

function renderClassicHome(root: HTMLElement) {
  const loc = getLocale();
  const copy = landingCopy(loc);
  const st = loadProgress();
  const profile = loadRunnerProfile();
  const summaries = getAllTracks().map((row) =>
    summarizeTrack(row, loc, trackDoneCount(row.id as TrackId))
  );

  root.innerHTML = `
    <div class="view view--home landing-page landing-page--quiet" data-ui-skin="classic">
      <header class="landing-hero landing-hero--compact">
        <p class="landing-hero__mascot" aria-hidden="true">🦁</p>
        <h1>${esc(copy.welcomeTitle)}</h1>
        <p class="landing-hero__tagline">${esc(t('tagline', loc))}</p>
      </header>

      <section class="landing-cta landing-cta--hero" aria-labelledby="quickTitle">
        <span class="landing-cta__eyebrow">${esc(copy.quickEyebrow)}</span>
        <h2 class="landing-cta__title" id="quickTitle">${esc(t('todayCardTitle', loc))}</h2>
        <p class="landing-cta__hint">${esc(copy.quickHint)}</p>
        <button type="button" class="landing-cta__btn landing-cta__btn--breathe" id="btnStartToday">${esc(t('startToday', loc))}</button>
      </section>

      <aside class="today-guide" aria-labelledby="todayGuideTitle">
        <h3 class="today-guide__title" id="todayGuideTitle">${esc(t('todayGuideTitle', loc))}</h3>
        <p class="today-guide__text" id="todayGuideText">${esc(t('todayGuideLoading', loc))}</p>
      </aside>

      <section class="landing-path" aria-labelledby="landingPathTitle">
        <h2 class="landing-path__title" id="landingPathTitle">${esc(copy.pathTitle)}</h2>
        <p class="landing-path__lead">${esc(copy.pathLead)}</p>
        <ol class="landing-path__steps">
          ${copy.pathSteps
            .map(
              (s, i) => `
            <li class="landing-path__step">
              <button type="button" class="landing-path__card" data-path-track="${s.trackId}">
                <span class="landing-path__n" aria-hidden="true">${i + 1}</span>
                <span class="landing-path__emoji" aria-hidden="true">${s.emoji}</span>
                <span class="landing-path__body">
                  <strong>${esc(s.title)}</strong>
                  <span>${esc(s.text)}</span>
                </span>
              </button>
            </li>`
            )
            .join('')}
        </ol>
        <p class="landing-path__foot">${esc(copy.pathFoot)}</p>
      </section>

      <aside class="landing-reassure" aria-label="${esc(t('reassure', loc))}">
        <p class="landing-reassure__text">${esc(t('reassure', loc))}</p>
      </aside>

      <details class="landing-more-routes" open>
        <summary class="landing-more-routes__summary">${esc(t('moreRoutesTitle', loc))}</summary>
        <p class="landing-more-routes__hint">${esc(t('moreRoutesHint', loc))}</p>
        <div class="tracks-roadmap">
          ${renderRoadmapDock(summaries, loc)}
        </div>
        <div class="landing-more-routes__about">
          <button type="button" class="landing-cta__btn-secondary" id="btnAboutTracks">ℹ️ ${esc(t('aboutApp', loc))}</button>
        </div>
        <div class="track-cards track-cards--roadmap landing-more-routes__cards" aria-live="polite">
          ${summaries.map((s) => renderTrackCardClassic(s, copy, loc, profile.recommendedTrack)).join('')}
        </div>
      </details>

      <details class="landing-flow-fold">
        <summary class="landing-flow-fold__summary">${esc(copy.flowTitle)}</summary>
        <section class="landing-flow" aria-label="${esc(copy.flowTitle)}">
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
          <p class="landing-story-inline">${esc(copy.story)}</p>
        </section>
      </details>

      <div class="landing-stats landing-stats--compact">
        <div class="landing-stat">⭐ <span>${esc(copy.stars)}</span><strong>${st.stars}</strong></div>
        <div class="landing-stat">🔥 <span>${esc(copy.streak)}</span><strong>${st.streak}</strong></div>
      </div>

      <footer class="landing-version" aria-label="version">${esc(copy.version)}</footer>
    </div>
  `;

  bindHomeEvents(root);
}

function renderPlayfulHome(root: HTMLElement) {
  const loc = getLocale();
  const copy = landingCopy(loc);
  const playful = playfulCopy(loc);
  const quiz = quizCopy(loc);
  const st = loadProgress();
  const profile = loadRunnerProfile();
  const name = displayNickname(playful.hudDefaultName);
  const showNickname = !profile.nickname.trim() && !profile.nicknameSkipped;

  const byId = Object.fromEntries(
    getAllTracks().map((row) => {
      const id = row.id as TrackId;
      return [id, summarizeTrack(row, loc, trackDoneCount(id))];
    })
  ) as Record<TrackId, ReturnType<typeof summarizeTrack>>;

  const ordered = PLAYFUL_TRACK_ORDER.map((id) => byId[id]).filter(Boolean);
  const activeTrack = resolveActivePlayfulTrack(ordered, profile.recommendedTrack);

  const steps = ordered
    .map((s) =>
      renderPlayfulStep(s, playful, {
        isActive: s.id === activeTrack,
        isRecommended: profile.recommendedTrack === s.id,
      })
    )
    .join('');

  root.innerHTML = `
    <div class="view view--home landing-page landing-page--playful landing-page--quiet" data-ui-skin="playful">
      <div class="playful-hud-dashboard" aria-label="${esc(copy.progress)}">
        <div class="playful-hud-dashboard__avatar" aria-hidden="true">🏎️</div>
        <div class="playful-hud-dashboard__main">
          <span class="playful-hud-dashboard__name">${esc(name)}</span>
          <span class="playful-hud-dashboard__role">${esc(playful.hudRunner)}</span>
        </div>
        <div class="playful-hud-dashboard__gauges">
          <span class="playful-hud-gauge">⭐ <strong>${st.stars}</strong></span>
          <span class="playful-hud-gauge">🔥 <strong>${st.streak}</strong></span>
        </div>
      </div>

      <section class="landing-cta landing-cta--hero" aria-labelledby="playfulTodayTitle">
        <span class="landing-cta__eyebrow">${esc(copy.quickEyebrow)}</span>
        <h2 class="landing-cta__title" id="playfulTodayTitle">${esc(t('todayCardTitle', loc))}</h2>
        <button type="button" class="landing-cta__btn landing-cta__btn--breathe" id="btnStartToday">☀️ ${esc(t('startToday', loc))}</button>
        ${
          !profile.quizDone
            ? `<button type="button" class="landing-cta__btn-secondary" id="btnOpenQuiz" title="${esc(quiz.banner)}">${esc(quiz.banner)}</button>`
            : ''
        }
      </section>

      <aside class="today-guide" aria-labelledby="todayGuideTitlePlayful">
        <h3 class="today-guide__title" id="todayGuideTitlePlayful">${esc(t('todayGuideTitle', loc))}</h3>
        <p class="today-guide__text" id="todayGuideText">${esc(t('todayGuideLoading', loc))}</p>
      </aside>

      ${
        showNickname
          ? `
      <details class="playful-nickname-fold">
        <summary>${esc(playful.nicknameBanner)}</summary>
        <div class="playful-nickname-banner__row">
          <input type="text" id="nicknameInput" class="playful-nickname-banner__input" maxlength="24" placeholder="${esc(playful.nicknamePlaceholder)}" />
          <button type="button" class="playful-nickname-banner__save" id="btnSaveNickname">${esc(playful.nicknameSave)}</button>
          <button type="button" class="playful-nickname-banner__later" id="btnNicknameLater">${esc(playful.nicknameLater)}</button>
        </div>
      </details>`
          : ''
      }

      <details class="landing-more-routes">
        <summary class="landing-more-routes__summary">${esc(t('moreRoutesTitle', loc))}</summary>
        <p class="landing-more-routes__hint">${esc(playful.mapHint)}</p>
        <div class="playful-steps" role="list">
          ${steps}
        </div>
      </details>

      <button type="button" class="playful-switch-classic" id="btnSwitchClassic">${esc(playful.switchClassic)}</button>

      <footer class="landing-version" aria-label="version">${esc(copy.version)}</footer>
    </div>
  `;

  bindHomeEvents(root);
}

export function renderHome(root: HTMLElement) {
  if (getUiSkin() === 'playful') {
    renderPlayfulHome(root);
  } else {
    renderClassicHome(root);
  }
}
