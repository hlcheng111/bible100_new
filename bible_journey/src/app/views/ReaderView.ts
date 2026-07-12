import { getBibleProvider } from '../bible/provider';
import { loadBibleCatalog, chapterRef } from '../bible/catalog';
import { getLocale } from '../stores/locale';
import { t } from '../i18n/strings';
import { navigate } from '../router';
import { markTodayRead } from '../stores/progress';

let loadGen = 0;

export async function renderReader(root: HTMLElement, bookId: number, chapter: number) {
  const gen = ++loadGen;
  const loc = getLocale();
  const bid = bookId;
  const chap = chapter;

  root.innerHTML = `
    <div class="view view--reader bible-read-flow">
      <header class="reader-head">
        <button type="button" class="btn-ghost" id="btnBack">${t('backHome', loc)}</button>
        <h1 id="readerTitle" class="reader-title">${t('loading', loc)}</h1>
        <p class="reader-hint">${t('readerHint', loc)}</p>
      </header>

      <nav class="reader-chap-nav" id="chapNav" aria-label="章節導覽" hidden>
        <button type="button" class="reader-chap-nav__btn" id="btnPrevCh" hidden>← ${t('prevChapter', loc)}</button>
        <button type="button" class="reader-chap-nav__btn reader-chap-nav__btn--list" id="btnPickBook">📜 ${t('pickBook', loc)}</button>
        <button type="button" class="reader-chap-nav__btn" id="btnNextCh" hidden>${t('nextChapter', loc)} →</button>
      </nav>

      <div class="reader-body br-verses" id="readerBody"><p class="loading">…</p></div>

      <footer class="reader-done-bar">
        <button type="button" class="landing-cta__btn" id="btnDone" hidden>${t('checkIn', loc)}</button>
      </footer>
    </div>
  `;

  root.querySelector('#btnBack')?.addEventListener('click', () => navigate({ view: 'home' }));
  root.querySelector('#btnPickBook')?.addEventListener('click', () => {
    navigate({ view: 'tracks', trackId: 'bible66', bookId: bid });
  });

  const titleEl = root.querySelector('#readerTitle') as HTMLElement;
  const navEl = root.querySelector('#chapNav') as HTMLElement;
  let maxCh = chap;

  try {
    const catalog = await loadBibleCatalog();
    if (gen !== loadGen) return;
    const book = catalog.books.find((b) => b.id === bid);
    if (book) {
      titleEl.textContent = chapterRef(book, chap, loc);
      maxCh = book.chapters;
    } else {
      titleEl.textContent = `${bid}:${chap}`;
    }
    navEl.hidden = false;
    const prev = root.querySelector('#btnPrevCh') as HTMLButtonElement;
    const next = root.querySelector('#btnNextCh') as HTMLButtonElement;
    if (chap > 1) {
      prev.hidden = false;
      prev.onclick = () => navigate({ view: 'reader', bookId: bid, chapter: chap - 1, trackId: 'bible66' });
    }
    if (chap < maxCh) {
      next.hidden = false;
      next.onclick = () => navigate({ view: 'reader', bookId: bid, chapter: chap + 1, trackId: 'bible66' });
    }
  } catch {
    if (gen !== loadGen) return;
    titleEl.textContent = `${bid}:${chap}`;
  }

  const body = root.querySelector('#readerBody') as HTMLElement;
  try {
    const data = await getBibleProvider().getChapter(bid, chap);
    if (gen !== loadGen) return;
    body.innerHTML = data.verses.map((v) => renderVerseBlock(v, loc)).join('');
    const done = root.querySelector('#btnDone') as HTMLButtonElement;
    done.hidden = false;
    done.addEventListener('click', () => {
      markTodayRead();
      done.textContent = t('checkedIn', loc);
      done.disabled = true;
    });
  } catch {
    if (gen !== loadGen) return;
    body.innerHTML = `<p class="error">${t('verseLoadFail', loc)}</p>`;
  }
}

function renderVerseBlock(
  v: { verse: number; zh: string; en: string; vi: string; id: string },
  loc: ReturnType<typeof getLocale>
) {
  return `
    <article class="verse-block br-verse-block">
      <header class="verse-block__head">
        <span class="verse-block__badge">${t('verseLabel', loc)} ${v.verse}</span>
      </header>
      <div class="verse-block__body">
        <p class="verse-line lang-zh br-verse-line">
          <span class="lang-tag br-verse-lang">${t('col_zh', loc)}</span>
          <span class="verse-text br-verse-text">${esc(v.zh)}</span>
        </p>
        <p class="verse-line lang-en br-verse-line br-verse-line--alt">
          <span class="lang-tag br-verse-lang">${t('col_en', loc)}</span>
          <span class="verse-text br-verse-text">${esc(v.en)}</span>
        </p>
        <p class="verse-line lang-vi br-verse-line br-verse-line--alt">
          <span class="lang-tag br-verse-lang">${t('col_vi', loc)}</span>
          <span class="verse-text br-verse-text">${esc(v.vi)}</span>
        </p>
        <p class="verse-line lang-id br-verse-line br-verse-line--alt">
          <span class="lang-tag br-verse-lang">${t('col_id', loc)}</span>
          <span class="verse-text br-verse-text">${esc(v.id)}</span>
        </p>
      </div>
    </article>
  `;
}

function esc(s: string) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
