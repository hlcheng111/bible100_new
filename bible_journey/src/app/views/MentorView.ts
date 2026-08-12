import { navigate } from '../router';
import { getLocale } from '../stores/locale';
import { t } from '../i18n/strings';
import { loadProgress } from '../stores/progress';
import { buildWeekReview, isMentorUnlocked, mentorUnlockHint } from '../coach/mentorUnlock';
import { openAiMentor } from '../config/aiMentorLinks';
import { getFunnelSnapshot, trackJourneyEvent } from '../stores/journeyEvents';

function esc(s: string) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

export function renderMentor(root: HTMLElement) {
  const loc = getLocale();
  const st = loadProgress();
  const unlocked = isMentorUnlocked(st);
  const review = buildWeekReview(st, loc);
  const funnel = getFunnelSnapshot();

  root.innerHTML = `
    <div class="view view--mentor">
      <button type="button" class="btn-ghost" id="btnBack">${t('backHome', loc)}</button>
      <header class="track-list-hero" style="--track-color:#f59e0b">
        <span class="track-list-hero__emoji">✨</span>
        <h1>${esc(t('mentor', loc))}</h1>
        <p>${esc(t('mentorPageLead', loc))}</p>
      </header>

      <article class="mentor-card">
        <p class="mentor-card__hint">${esc(mentorUnlockHint(st, loc))}</p>
        <pre class="mentor-card__review">${esc(review)}</pre>
        ${
          unlocked
            ? ''
            : `<p class="mentor-card__soft">${esc(t('mentorPreviewNote', loc))}</p>`
        }
        <button type="button" class="qna-cta qna-cta--primary" id="btnMentorAi">${esc(t('readDoneAiMentorOpen', loc))}</button>
      </article>

      <article class="mentor-funnel" aria-label="${esc(t('funnelTitle', loc))}">
        <h2 class="mentor-funnel__title">${esc(t('funnelTitle', loc))}</h2>
        <p class="mentor-funnel__note">${esc(t('funnelLocalOnly', loc))}</p>
        <ul class="mentor-funnel__list">
          <li>${esc(t('funnelStarts', loc, { n: funnel.weekStarts }))}</li>
          <li>${esc(t('funnelCheckIns', loc, { n: funnel.weekCheckIns }))}</li>
          <li>${esc(t('funnelAsks', loc, { n: funnel.weekAsks }))}</li>
          <li>${esc(t('funnelPain', loc, { n: funnel.weekPainPicks }))}</li>
          <li>${esc(t('funnelEmotion', loc, { n: funnel.weekEmotion }))}</li>
        </ul>
      </article>
    </div>
  `;

  root.querySelector('#btnBack')?.addEventListener('click', () => navigate({ view: 'home' }));
  root.querySelector('#btnMentorAi')?.addEventListener('click', () => {
    trackJourneyEvent('open_external_ai', 'mentor_page');
    openAiMentor();
  });
}
