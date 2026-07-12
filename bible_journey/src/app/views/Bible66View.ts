import { getLocale } from '../stores/locale';
import { navigate, type Locale } from '../router';
import { t } from '../i18n/strings';
import { loadBibleCatalog, bookName, type BibleCatalogBook } from '../bible/catalog';

function esc(s: string) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function renderBookCard(book: BibleCatalogBook, loc: Locale, expandedId: number | null) {
  const name = bookName(book, loc);
  const expanded = expandedId === book.id;
  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);
  return `
    <article class="b66-book${expanded ? ' b66-book--open' : ''}" data-book="${book.id}">
      <button type="button" class="b66-book__head" data-book-toggle="${book.id}">
        <span class="b66-book__id">${book.id}</span>
        <div class="b66-book__meta">
          <h2 class="b66-book__name">${esc(name)}</h2>
          <span class="b66-book__sub">${book.chapters} ${t('chaptersUnit', loc)} · ${book.testament}</span>
        </div>
        <span class="b66-book__chev" aria-hidden="true">${expanded ? '▾' : '▸'}</span>
      </button>
      ${
        expanded
          ? `<div class="b66-chapters" role="list">
        ${chapters
          .map(
            (c) =>
              `<button type="button" class="b66-chapter" data-chapter="${c}" data-book="${book.id}">${c}</button>`
          )
          .join('')}
      </div>`
          : ''
      }
    </article>
  `;
}

export async function renderBible66(root: HTMLElement, expandedBookId: number | null) {
  const loc = getLocale();
  root.innerHTML = `
    <div class="view view--b66">
      <button type="button" class="btn-ghost" id="btnBack">${t('backHome', loc)}</button>
      <header class="b66-hero">
        <span class="b66-hero__emoji">📜</span>
        <h1>${t('bible66Title', loc)}</h1>
        <p class="b66-hero__lead">${t('bible66Lead', loc)}</p>
      </header>
      <div class="b66-list" id="b66List"><p class="loading">${t('loading', loc)}</p></div>
    </div>
  `;

  root.querySelector('#btnBack')?.addEventListener('click', () => navigate({ view: 'home' }));

  const list = root.querySelector('#b66List') as HTMLElement;
  try {
    const catalog = await loadBibleCatalog();
    list.innerHTML =     catalog.books.map((b) => renderBookCard(b, loc, expandedBookId)).join('');
    bindBible66List(root, expandedBookId);
  } catch {
    list.innerHTML = `<p class="error">${t('catalogFail', loc)}</p>`;
  }
}

function bindBible66List(root: HTMLElement, expandedBookId: number | null) {
  root.querySelectorAll('[data-book-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number((btn as HTMLElement).dataset.bookToggle);
      if (expandedBookId === id) {
        navigate({ view: 'tracks', trackId: 'bible66' });
      } else {
        navigate({ view: 'tracks', trackId: 'bible66', bookId: id });
      }
    });
  });

  root.querySelectorAll('.b66-chapter').forEach((btn) => {
    btn.addEventListener('click', () => {
      const bookId = Number((btn as HTMLElement).dataset.book);
      const chapter = Number((btn as HTMLElement).dataset.chapter);
      navigate({ view: 'reader', bookId, chapter, trackId: 'bible66' });
    });
  });
}
