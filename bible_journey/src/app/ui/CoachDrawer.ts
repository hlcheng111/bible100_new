import type { Locale } from '../contract/routeState';
import type { RouteState } from '../contract/routeState';
import { t } from '../i18n/strings';
import { navigate } from '../router';
import { resolveCoachContent } from '../coach/coachService';
import { coachThemeBadgeHtml } from '../coach/coachTheme';
import { faqForChapter, buildDeepQnaPrompt } from '../coach/coachFaqService';
import { companionsLine } from '../coach/companions';
import { coachSourceBadge, faqSourceBadge } from '../coach/contentLayer';
import { studyLinksFor } from '../coach/studyLinks';
import {
  dismissEmotionPrompt,
  emotionFollowup,
  resolveEmotionPrompt,
  type EmotionReply,
} from '../coach/emotionPrompt';
import { openAskAiPanel } from './AskAiPanel';
import { copyToClipboard } from './clipboard';
import { setCoachRing } from '../stores/coachState';
import { trackJourneyEvent } from '../stores/journeyEvents';

export type CoachTab = 'what' | 'how' | 'why';

function esc(s: string) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

/** Wave 3–4：讀中問答、來源分層、情緒微互動、可選研經外連 */
export function mountCoachDrawer(
  mount: HTMLElement,
  route: RouteState,
  locale: Locale,
  bookLabel: string
) {
  const content = resolveCoachContent(route, locale, bookLabel);
  const bid = route.bookId ?? 1;
  const chap = route.chapter ?? 1;
  const faq = faqForChapter(bid, chap, locale);
  const prompt = buildDeepQnaPrompt(route, bookLabel, faq, locale);
  const companion = companionsLine(locale, route);
  const sourceBadge = coachSourceBadge(content.source, locale);
  const links = studyLinksFor(bid, chap, locale);
  const emotion = resolveEmotionPrompt(route, locale);

  let active: CoachTab = 'what';
  const themeBadge = coachThemeBadgeHtml(route, locale, bookLabel);

  setCoachRing('started', true);
  trackJourneyEvent('start_read', `${bid}:${chap}`);

  const askQ = faq?.question || t('askSoftQuestion', locale);
  const askA = faq?.answer || content.application;

  const openAskAi = () => {
    void openAskAiPanel({ locale, prompt });
  };

  const renderPanel = () => {
    const panel = mount.querySelector('#coachPanel') as HTMLElement;
    if (!panel) return;
    if (active === 'what') {
      panel.innerHTML = `${themeBadge}<p class="coach-drawer__text coach-drawer__text--lead">${esc(content.summary)}</p>`;
    } else if (active === 'how') {
      panel.innerHTML = `${themeBadge}
        <p class="coach-drawer__label">${esc(t('coachApplication', locale))}</p>
        <p class="coach-drawer__text">${esc(content.application)}</p>
        <p class="coach-drawer__label">${esc(t('coachChallenge', locale))}</p>
        <p class="coach-drawer__text">${esc(content.challenge)}</p>`;
    } else {
      panel.innerHTML = `${themeBadge}
        <p class="coach-drawer__label">${esc(t('coachWhyLead', locale))}</p>
        <p class="coach-drawer__text">${esc(content.whyNote)}</p>
        <p class="coach-drawer__label">${esc(t('coachPrayer', locale))}</p>
        <p class="coach-drawer__text coach-drawer__prayer">${esc(content.prayer)}</p>`;
    }
    mount.querySelectorAll('[data-coach-tab]').forEach((btn) => {
      btn.classList.toggle('on', (btn as HTMLElement).dataset.coachTab === active);
    });
  };

  const emotionHtml = emotion
    ? `<aside class="coach-emotion" id="coachEmotion" aria-label="${esc(t('emotionBlockLabel', locale))}">
        <p class="coach-emotion__q">${esc(emotion.question)}</p>
        <div class="coach-emotion__actions">
          <button type="button" class="coach-emotion__btn" data-emo="tired">${esc(t('emotionTiredYes', locale))}</button>
          <button type="button" class="coach-emotion__btn" data-emo="ok">${esc(t('emotionTiredNo', locale))}</button>
          <button type="button" class="coach-emotion__btn coach-emotion__btn--ghost" data-emo="skip">${esc(t('emotionSkip', locale))}</button>
        </div>
        <p class="coach-emotion__tip" id="coachEmotionTip" hidden></p>
      </aside>`
    : '';

  mount.innerHTML = `
    <section class="coach-drawer coach-drawer--note" aria-label="${esc(t('coachDrawerLabel', locale))}">
      <p class="coach-drawer__kicker">${esc(t('coachDrawerLabel', locale))}</p>
      <p class="coach-layer" id="coachLayer">${esc(sourceBadge)}</p>
      <p class="coach-drawer__hero" id="coachHero">${esc(content.summary)}</p>
      <p class="coach-companions" id="coachCompanions">🤝 ${esc(companion)}</p>
      <p class="coach-companions__demo">${esc(t('companionsDemoNote', locale))}</p>

      ${emotionHtml}

      <details class="coach-drawer__more">
        <summary class="coach-drawer__more-sum">${esc(t('coachWhat', locale))} · ${esc(t('coachHow', locale))} · ${esc(t('coachWhy', locale))}</summary>
        <div class="coach-drawer__tabs" role="tablist">
          <button type="button" class="coach-drawer__tab on" data-coach-tab="what" role="tab">${esc(t('coachWhat', locale))}</button>
          <button type="button" class="coach-drawer__tab" data-coach-tab="how" role="tab">${esc(t('coachHow', locale))}</button>
          <button type="button" class="coach-drawer__tab" data-coach-tab="why" role="tab">${esc(t('coachWhy', locale))}</button>
        </div>
        <div class="coach-drawer__panel" id="coachPanel" role="tabpanel"></div>
      </details>

      <details class="coach-ask" id="coachAsk">
        <summary class="coach-ask__sum">💬 ${esc(t('askWhileReading', locale))}</summary>
        <div class="coach-ask__body">
          <p class="coach-layer coach-layer--inline">${esc(faq ? faqSourceBadge(locale) : sourceBadge)}</p>
          <p class="coach-ask__q">${esc(askQ)}</p>
          <p class="coach-ask__a">${esc(askA)}</p>
          <p class="coach-ask__note">${esc(t('qnaNotAuthority', locale))}</p>
          <div class="coach-ask__actions">
            <button type="button" class="coach-ask__btn coach-ask__btn--primary" id="coachAskAi">${esc(t('askAiTitle', locale))}</button>
            <button type="button" class="coach-ask__btn" id="coachAskCopy">${esc(t('askCopyThought', locale))}</button>
            <button type="button" class="coach-ask__btn" id="coachAskPage">${esc(t('askOpenQnaPage', locale))}</button>
          </div>
          <p class="coach-ask__toast" id="coachAskToast" hidden role="status"></p>
        </div>
      </details>

      <details class="coach-study" id="coachStudy">
        <summary class="coach-study__sum">${esc(t('studyLinksTitle', locale))}</summary>
        <ul class="coach-study__list">
          ${links
            .map(
              (l) =>
                `<li><a class="coach-study__link" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer" data-study-kind="${esc(l.kind)}">${esc(l.label)}</a></li>`
            )
            .join('')}
        </ul>
        <p class="coach-study__note">${esc(t('studyLinksNote', locale))}</p>
      </details>
    </section>
  `;

  mount.querySelectorAll('[data-coach-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      active = (btn as HTMLElement).dataset.coachTab as CoachTab;
      renderPanel();
    });
  });

  const askDetails = mount.querySelector('#coachAsk') as HTMLDetailsElement;
  askDetails?.addEventListener('toggle', () => {
    if (askDetails.open) {
      trackJourneyEvent('open_ask', `${bid}:${chap}`);
      setCoachRing('reflect', true);
    }
  });

  mount.querySelector('#coachAskAi')?.addEventListener('click', openAskAi);

  mount.querySelector('#coachAskCopy')?.addEventListener('click', async () => {
    trackJourneyEvent('copy_prompt');
    const toast = mount.querySelector('#coachAskToast') as HTMLElement;
    const ok = await copyToClipboard(prompt);
    if (toast) {
      toast.hidden = false;
      toast.textContent = ok ? t('askCopiedSoft', locale) : t('readDoneCopyFallback', locale);
    }
    if (!ok) window.prompt(t('readDoneCopyFallback', locale), prompt);
  });

  mount.querySelector('#coachAskPage')?.addEventListener('click', () => {
    trackJourneyEvent('open_ask', 'qna_page');
    navigate({ view: 'qna' });
  });

  mount.querySelectorAll('[data-study-kind]').forEach((a) => {
    a.addEventListener('click', () => {
      trackJourneyEvent('open_study_link', (a as HTMLElement).dataset.studyKind || 'passage');
    });
  });

  mount.querySelectorAll('[data-emo]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const reply = (btn as HTMLElement).dataset.emo as EmotionReply;
      if (!emotion) return;
      dismissEmotionPrompt(emotion.id);
      trackJourneyEvent('emotion_reply', reply);
      const box = mount.querySelector('#coachEmotion') as HTMLElement;
      const tip = mount.querySelector('#coachEmotionTip') as HTMLElement;
      if (tip) {
        tip.hidden = false;
        tip.textContent = emotionFollowup(reply, locale);
      }
      mount.querySelectorAll('[data-emo]').forEach((b) => {
        (b as HTMLButtonElement).disabled = true;
      });
      if (reply === 'tired' && box && !box.querySelector('#coachEmotionHope')) {
        const go = document.createElement('button');
        go.type = 'button';
        go.id = 'coachEmotionHope';
        go.className = 'coach-emotion__btn coach-emotion__btn--hope';
        go.textContent = t('emotionGoHope', locale);
        go.addEventListener('click', () => {
          navigate({ view: 'tracks', trackId: 'theme', themeId: 'hope' });
        });
        box.appendChild(go);
      }
    });
  });

  renderPanel();
}
