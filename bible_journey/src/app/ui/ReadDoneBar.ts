import type { Locale } from '../contract/routeState';
import type { RouteState } from '../contract/routeState';
import { t } from '../i18n/strings';
import { navigate, navigateToUnit } from '../router';
import { loadProgress } from '../stores/progress';
import { setCoachRing, squadFeedLines } from '../stores/coachState';
import { faqForChapter, buildDeepQnaPrompt } from '../coach/coachFaqService';
import { buildWeekReview, isMentorUnlocked, mentorUnlockHint } from '../coach/mentorUnlock';
import { resolveNextUnit } from '../coach/resolveNext';
import { openAskAiPanel } from './AskAiPanel';
import { copyToClipboard } from './clipboard';
import { resolveCoachContent } from '../coach/coachService';
import { trackJourneyEvent } from '../stores/journeyEvents';
import { companionsLine } from '../coach/companions';
import { coachSourceBadge } from '../coach/contentLayer';

function esc(s: string) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

export type ReadDoneBarHandle = {
  show: () => void;
  hide: () => void;
  setCancelThemeReturn?: (fn: () => void) => void;
};

export function mountReadDoneBar(
  mount: HTMLElement,
  route: RouteState,
  locale: Locale,
  bookLabel: string
): ReadDoneBarHandle {
  const bid = route.bookId ?? 1;
  const chap = route.chapter ?? 1;
  const faq = faqForChapter(bid, chap, locale);
  const prompt = buildDeepQnaPrompt(route, bookLabel, faq, locale);
  const nextPreview = resolveNextUnit(route, locale);
  const content = resolveCoachContent(route, locale, bookLabel);
  const takeaway = content.application || content.challenge || content.summary;
  const companion = companionsLine(locale, route);
  const isTheme = route.trackId === 'theme' && !!route.themeId;
  let mentorOpen = true;
  let cancelThemeReturn: (() => void) | null = null;

  const openAskAi = () => {
    void openAskAiPanel({ locale, prompt });
  };

  const renderMentorPanel = () => {
    const panel = mount.querySelector('#rdbMentorPanel') as HTMLElement;
    const btn = mount.querySelector('#rdbMentorBtn') as HTMLButtonElement;
    if (!panel || !btn) return;
    const st = loadProgress();
    const unlocked = isMentorUnlocked(st);
    btn.classList.toggle('read-done-bar__action--unlocked', unlocked);
    btn.disabled = false;
    if (mentorOpen) {
      panel.hidden = false;
      panel.classList.add('read-done-bar__mentor-panel--open');
      panel.innerHTML = `<p class="read-done-bar__mentor-text">${esc(buildWeekReview(st, locale))}</p>`;
    } else {
      panel.hidden = true;
      panel.classList.remove('read-done-bar__mentor-panel--open');
    }
  };

  const renderInner = () => {
    const st = loadProgress();
    const squadFeed = squadFeedLines(locale, route);
    const unlocked = isMentorUnlocked(st);
    mount.innerHTML = `
      <section class="read-done-bar read-done-bar--enter" aria-label="${esc(t('readDoneBarLabel', locale))}">
        <p class="read-done-bar__head">${esc(t('readDoneBarHead', locale))}</p>
        <p class="coach-layer coach-layer--inline">${esc(coachSourceBadge(content.source, locale))}</p>

        ${
          isTheme
            ? `<article class="read-done-bar__takeaway" id="rdbTakeaway">
                <p class="read-done-bar__takeaway-label">${esc(t('themeTakeawayLabel', locale))}</p>
                <p class="read-done-bar__takeaway-text">${esc(takeaway)}</p>
                <p class="read-done-bar__takeaway-companion">🤝 ${esc(companion)}</p>
              </article>`
            : `<p class="read-done-bar__takeaway-companion read-done-bar__takeaway-companion--solo">🤝 ${esc(companion)}</p>`
        }

        <div class="read-done-bar__hero-ctas" role="group" aria-label="${esc(t('readDoneHeroCtas', locale))}">
          ${
            isTheme
              ? `<button type="button" class="read-done-bar__hero-btn read-done-bar__hero-btn--primary" id="rdbBackMap">
                  ${esc(t('readDoneBackThemeMap', locale))}
                </button>
                <p class="read-done-bar__auto-hint" id="rdbAutoHint">${esc(t('readDoneAutoReturnHint', locale))}</p>`
              : ''
          }
          <button type="button" class="read-done-bar__hero-btn read-done-bar__hero-btn--qna" id="rdbOpenQna">
            💬 ${esc(t('readDoneAskPastor', locale))}
          </button>
          <button type="button" class="read-done-bar__hero-btn read-done-bar__hero-btn--mentor" id="rdbOpenMentor">
            ✨ ${esc(t('readDoneWeekReview', locale))}
          </button>
        </div>

        <article class="read-done-bar__block read-done-bar__block--enter read-done-bar__block--qna" id="rdbQnaBlock" style="--rdb-delay:40ms">
          <h3 class="read-done-bar__title">💬 ${esc(t('qna', locale))}</h3>
          ${
            faq
              ? `<p class="read-done-bar__q">${esc(faq.question)}</p>
                 <p class="read-done-bar__a">${esc(faq.answer)}</p>`
              : `<p class="read-done-bar__muted">${esc(t('readDoneNoFaq', locale))}</p>`
          }
          <p class="read-done-bar__muted">${esc(t('qnaNotAuthority', locale))}</p>
          <p class="coach-layer coach-layer--inline">${esc(faq ? t('contentLayerFaq', locale) : coachSourceBadge(content.source, locale))}</p>
          <div class="read-done-bar__row-btns">
            <button type="button" class="read-done-bar__ai-open" id="rdbAiMentorOpen">🤖 ${esc(t('askAiTitle', locale))}</button>
            <button type="button" class="read-done-bar__copy" id="rdbCopyPrompt">📋 ${esc(t('askCopyThought', locale))}</button>
            <button type="button" class="read-done-bar__link-page" id="rdbQnaPage">${esc(t('askOpenQnaPage', locale))}</button>
          </div>
          <div class="read-done-bar__copy-toast" id="rdbCopyToast" role="status" aria-live="polite" hidden>
            <div class="read-done-bar__copy-toast-inner">
              <div class="read-done-bar__copy-toast-text">
                <strong id="rdbCopyToastTitle">${esc(t('askCopiedSoft', locale))}</strong>
                <span class="read-done-bar__copy-toast-hint">${esc(t('readDonePasteHintSoft', locale))}</span>
              </div>
              <button type="button" class="rdb-toast__cta" id="rdbAiMentorCta">🤖 ${esc(t('askAiTitle', locale))}</button>
            </div>
          </div>
        </article>

        <article class="read-done-bar__block read-done-bar__block--enter read-done-bar__block--mentor" id="rdbMentorBlock" style="--rdb-delay:80ms">
          <h3 class="read-done-bar__title">✨ ${esc(t('mentor', locale))}</h3>
          <p class="read-done-bar__muted" id="rdbMentorHint">${esc(mentorUnlockHint(st, locale))}</p>
          <button type="button" class="read-done-bar__action${unlocked ? ' read-done-bar__action--unlocked' : ''}" id="rdbMentorBtn">
            ${esc(t('readDoneMentorBtn', locale))}
          </button>
          <div class="read-done-bar__mentor-panel read-done-bar__mentor-panel--open" id="rdbMentorPanel"></div>
          <button type="button" class="read-done-bar__link-page" id="rdbMentorPage">${esc(t('readDoneOpenMentorPage', locale))}</button>
        </article>

        <article class="read-done-bar__block read-done-bar__block--enter" style="--rdb-delay:120ms">
          <h3 class="read-done-bar__title">🤝 ${esc(t('squad', locale))}</h3>
          ${squadFeed.isDemo ? `<p class="read-done-bar__demo-banner">${esc(t('readDoneSquadDemoBanner', locale))}</p>` : ''}
          <ul class="read-done-bar__list">
            ${squadFeed.lines.map((line) => `<li>${esc(line)}</li>`).join('')}
          </ul>
        </article>

        ${
          nextPreview && !isTheme
            ? `<button type="button" class="read-done-bar__tomorrow" id="rdbTomorrow">
            ${esc(t('readDoneTomorrowPreview', locale, { label: nextPreview.label }))}
          </button>`
            : ''
        }
        ${
          nextPreview && isTheme
            ? `<button type="button" class="read-done-bar__tomorrow" id="rdbTomorrow">
            ${esc(t('readDoneNextLevelPreview', locale, { label: nextPreview.label }))}
          </button>`
            : ''
        }
      </section>
    `;

    requestAnimationFrame(() => {
      mount.querySelector('.read-done-bar--enter')?.classList.add('read-done-bar--visible');
      mount.querySelectorAll('.read-done-bar__block--enter').forEach((el) => {
        el.classList.add('read-done-bar__block--visible');
      });
      renderMentorPanel();
    });

    const stopAuto = () => cancelThemeReturn?.();

    mount.querySelector('#rdbBackMap')?.addEventListener('click', () => {
      stopAuto();
      if (route.themeId) navigate({ view: 'tracks', trackId: 'theme', themeId: route.themeId });
    });

    mount.querySelector('#rdbOpenQna')?.addEventListener('click', () => {
      stopAuto();
      trackJourneyEvent('open_ask', 'read_done');
      const block = mount.querySelector('#rdbQnaBlock') as HTMLElement;
      block?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      block?.classList.add('read-done-bar__block--pulse');
      window.setTimeout(() => block?.classList.remove('read-done-bar__block--pulse'), 1200);
    });

    mount.querySelector('#rdbOpenMentor')?.addEventListener('click', () => {
      stopAuto();
      mentorOpen = true;
      renderMentorPanel();
      const block = mount.querySelector('#rdbMentorBlock') as HTMLElement;
      block?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      block?.classList.add('read-done-bar__block--pulse');
      window.setTimeout(() => block?.classList.remove('read-done-bar__block--pulse'), 1200);
    });

    mount.querySelector('#rdbQnaPage')?.addEventListener('click', () => {
      stopAuto();
      navigate({ view: 'qna' });
    });

    mount.querySelector('#rdbMentorPage')?.addEventListener('click', () => {
      stopAuto();
      navigate({ view: 'mentor' });
    });

    mount.querySelector('#rdbTomorrow')?.addEventListener('click', () => {
      stopAuto();
      if (nextPreview) navigateToUnit(nextPreview.unit);
    });

    mount.querySelector('#rdbCopyPrompt')?.addEventListener('click', async () => {
      stopAuto();
      trackJourneyEvent('copy_prompt');
      const toast = mount.querySelector('#rdbCopyToast') as HTMLElement;
      const ok = await copyToClipboard(prompt);
      if (ok && toast) {
        toast.hidden = false;
        toast.classList.add('read-done-bar__copy-toast--show');
        window.setTimeout(() => {
          toast.classList.remove('read-done-bar__copy-toast--show');
        }, 12000);
      } else {
        window.prompt(t('readDoneCopyFallback', locale), prompt);
      }
    });

    mount.querySelector('#rdbAiMentorOpen')?.addEventListener('click', () => {
      stopAuto();
      openAskAi();
    });

    mount.querySelector('#rdbAiMentorCta')?.addEventListener('click', () => {
      stopAuto();
      openAskAi();
    });

    mount.querySelector('#rdbMentorBtn')?.addEventListener('click', () => {
      stopAuto();
      mentorOpen = !mentorOpen;
      renderMentorPanel();
    });
  };

  mount.hidden = true;
  mount.classList.add('read-done-mount--hidden');

  const show = () => {
    setCoachRing('read', true);
    setCoachRing('reflect', true);
    trackJourneyEvent('check_in', `${bid}:${chap}`);
    renderInner();
    mount.hidden = false;
    mount.classList.remove('read-done-mount--hidden');
    requestAnimationFrame(() => {
      mount.classList.add('read-done-mount--visible');
      mount.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      const take = mount.querySelector('#rdbTakeaway') as HTMLElement | null;
      take?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  };

  const hide = () => {
    mount.classList.remove('read-done-mount--visible');
    mount.classList.add('read-done-mount--hidden');
    mount.hidden = true;
    mount.innerHTML = '';
  };

  return {
    show,
    hide,
    setCancelThemeReturn: (fn) => {
      cancelThemeReturn = fn;
    },
  };
}
