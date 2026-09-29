import type { Locale } from '../contract/routeState';
import { getLocale } from '../stores/locale';
import { setLocaleAndSyncReader } from '../stores/languageSync';
import { quizCopy, recommendTrackFromQuiz } from '../i18n/quizCopy';
import { patchRunnerProfile } from '../stores/runnerProfile';
import { enterTrackFromHome } from '../tracks/enterTrack';
import type { TrackId } from '../tracks/catalog';

function esc(s: string) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

let modalRoot: HTMLElement | null = null;

function ensureRoot(): HTMLElement {
  if (modalRoot?.isConnected) return modalRoot;
  modalRoot = document.createElement('div');
  modalRoot.id = 'bibleQuizModalRoot';
  document.body.appendChild(modalRoot);
  return modalRoot;
}

export function closeBibleQuizModal() {
  const root = document.getElementById('bibleQuizModalRoot');
  if (!root) return;
  root.innerHTML = '';
  root.hidden = true;
  document.body.classList.remove('bible-quiz-modal-open');
}

type Answers = { lang?: Locale; familiar?: string; interest?: string };

export function openBibleQuizModal(onDone?: (trackId: TrackId) => void) {
  const loc = getLocale();
  const pack = quizCopy(loc);
  const root = ensureRoot();
  root.hidden = false;
  document.body.classList.add('bible-quiz-modal-open');

  const answers: Answers = {};
  let step = 0;
  const total = pack.steps.length;

  const dismiss = () => closeBibleQuizModal();

  const showResult = (trackId: TrackId) => {
    const trackName = pack.trackNames[trackId];
    root.innerHTML = `
      <div class="bible-quiz-modal" role="dialog" aria-modal="true">
        <button type="button" class="bible-quiz-modal__backdrop" id="quizBackdrop" aria-label="${esc(pack.close)}"></button>
        <div class="bible-quiz-modal__panel bible-quiz-modal__panel--result">
          <p class="bible-quiz-modal__result-emoji" aria-hidden="true">🎉</p>
          <h2>${esc(pack.resultTitle)}</h2>
          <p class="bible-quiz-modal__result-lead">${esc(pack.resultLead(trackName))}</p>
          <button type="button" class="bible-quiz-modal__cta" id="quizStart">${esc(pack.startTrack)}</button>
          <button type="button" class="bible-quiz-modal__ghost" id="quizClose">${esc(pack.close)}</button>
        </div>
      </div>
    `;
    root.querySelector('#quizBackdrop')?.addEventListener('click', () => {
      dismiss();
      onDone?.(trackId);
    });
    root.querySelector('#quizClose')?.addEventListener('click', () => {
      dismiss();
      onDone?.(trackId);
    });
    root.querySelector('#quizStart')?.addEventListener('click', () => {
      dismiss();
      onDone?.(trackId);
      void enterTrackFromHome(trackId);
    });
  };

  const renderStep = () => {
    if (step >= total) {
      const trackId = recommendTrackFromQuiz(answers);
      patchRunnerProfile({ recommendedTrack: trackId, quizDone: true });
      showResult(trackId);
      return;
    }

    const current = pack.steps[step];
    root.innerHTML = `
      <div class="bible-quiz-modal" role="dialog" aria-modal="true">
        <button type="button" class="bible-quiz-modal__backdrop" id="quizBackdrop" aria-label="${esc(pack.close)}"></button>
        <div class="bible-quiz-modal__panel">
          <header class="bible-quiz-modal__head">
            <span class="bible-quiz-modal__step">${esc(pack.stepOf(step + 1, total))}</span>
            <h2>${esc(pack.title)}</h2>
            <button type="button" class="bible-quiz-modal__close" id="quizSkipX">✕</button>
          </header>
          <p class="bible-quiz-modal__question">${esc(current.question)}</p>
          <div class="bible-quiz-modal__options">
            ${current.options
              .map(
                (opt) => `
              <button type="button" class="bible-quiz-modal__opt" data-opt-id="${esc(opt.id)}">
                <span class="bible-quiz-modal__opt-emoji">${esc(opt.emoji)}</span>
                <span>${esc(opt.label)}</span>
              </button>`
              )
              .join('')}
          </div>
          <button type="button" class="bible-quiz-modal__ghost" id="quizSkip">${esc(pack.skip)}</button>
        </div>
      </div>
    `;

    root.querySelector('#quizBackdrop')?.addEventListener('click', dismiss);
    root.querySelector('#quizSkipX')?.addEventListener('click', dismiss);
    root.querySelector('#quizSkip')?.addEventListener('click', dismiss);

    root.querySelectorAll('.bible-quiz-modal__opt').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = (btn as HTMLElement).dataset.optId!;
        if (current.id === 'lang') {
          const locale = id as Locale;
          if (['zh-Hant', 'en', 'vi', 'id'].includes(locale)) {
            setLocaleAndSyncReader(locale);
            answers.lang = locale;
          }
        } else if (current.id === 'familiar') {
          answers.familiar = id;
        } else if (current.id === 'interest') {
          answers.interest = id;
        }
        step += 1;
        renderStep();
      });
    });
  };

  renderStep();
}
