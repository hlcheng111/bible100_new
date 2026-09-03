import { navigate } from '../router';
import { getLocale } from '../stores/locale';
import { t } from '../i18n/strings';
import faqData from '../../assets/coach/coach_faq.json';
import { faqForChapter, type FaqItem } from '../coach/coachFaqService';
import { loadLastReading } from '../stores/sessionReading';
import { buildDeepQnaPrompt } from '../coach/coachFaqService';
import { pickLocalizedField } from '../i18n/trackLocale';
import { openAskAiPanel } from '../ui/AskAiPanel';

function esc(s: string) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function pickQa(row: FaqItem, locale: ReturnType<typeof getLocale>) {
  return {
    q: pickLocalizedField(row as unknown as Record<string, unknown>, 'q', locale),
    a: pickLocalizedField(row as unknown as Record<string, unknown>, 'a', locale),
  };
}

export function renderQna(root: HTMLElement) {
  const loc = getLocale();
  const last = loadLastReading();
  const focus =
    last != null ? faqForChapter(last.bookId, last.chapter, loc) : null;
  const items = ((faqData as { items: FaqItem[] }).items || []).slice(0, 12);
  const bookLabel =
    last != null ? `${last.bookId}:${last.chapter}` : t('qna', loc);
  const prompt = buildDeepQnaPrompt(
    last
      ? { view: 'reader', bookId: last.bookId, chapter: last.chapter }
      : { view: 'qna' },
    bookLabel,
    focus,
    loc
  );

  root.innerHTML = `
    <div class="view view--qna">
      <button type="button" class="btn-ghost" id="btnBack">${t('backHome', loc)}</button>
      <header class="track-list-hero" style="--track-color:#818cf8">
        <span class="track-list-hero__emoji">💬</span>
        <h1>${esc(t('qna', loc))}</h1>
        <p>${esc(t('qnaPageLead', loc))}</p>
      </header>

      <div class="qna-ask-ai-row">
        <button type="button" class="qna-cta qna-cta--primary" id="btnQnaAi">🤖 ${esc(t('askAiTitle', loc))}</button>
      </div>

      ${
        focus
          ? `<article class="qna-focus" id="qnaFocus">
            <p class="qna-focus__badge">${esc(t('qnaFocusBadge', loc, {
              book: last!.bookId,
              chapter: last!.chapter,
            }))}</p>
            <h2 class="qna-focus__q">${esc(focus.question)}</h2>
            <p class="qna-focus__a">${esc(focus.answer)}</p>
            <p class="coach-layer coach-layer--inline">${esc(t('contentLayerFaq', loc))}</p>
            <p class="qna-focus__note">${esc(t('qnaNotAuthority', loc))}</p>
          </article>`
          : `<p class="qna-empty">${esc(t('qnaNoFocus', loc))}</p>`
      }

      <section class="qna-library" aria-label="${esc(t('qnaLibraryTitle', loc))}">
        <h2>${esc(t('qnaLibraryTitle', loc))}</h2>
        <div class="qna-library__list">
          ${items
            .map((it) => {
              const { q, a } = pickQa(it, loc);
              if (!q) return '';
              return `<details class="qna-item">
                <summary>${esc(q)}</summary>
                <p>${esc(a)}</p>
              </details>`;
            })
            .join('')}
        </div>
      </section>
    </div>
  `;

  root.querySelector('#btnBack')?.addEventListener('click', () => navigate({ view: 'home' }));
  root.querySelector('#btnQnaAi')?.addEventListener('click', () => {
    void openAskAiPanel({ locale: loc, prompt });
  });
}
