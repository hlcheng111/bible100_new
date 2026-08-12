import { navigate, navigateToUnit } from '../router';
import { unitFromBible66 } from '../contract/readingUnit';
import { getLocale } from '../stores/locale';
import type { Locale } from '../contract/routeState';
import { t } from '../i18n/strings';
import { loadBibleCatalog, bookNamePair, type BibleCatalogBook } from '../bible/catalog';
import { mountLoadError } from '../ui/loadError';

function esc(s: string) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

/** 系統入口：書卷 id → 第 1 章（非痛點測驗） */
const GUIDE_PATHS: { id: string; bookId: number; labelKey: string }[] = [
  { id: 'genesis', bookId: 1, labelKey: 'bible66PathGenesis' },
  { id: 'matthew', bookId: 40, labelKey: 'bible66PathMatthew' },
  { id: 'john', bookId: 43, labelKey: 'bible66PathJohn' },
  { id: 'psalm', bookId: 19, labelKey: 'bible66PathPsalm' },
];

function renderBookRow(book: BibleCatalogBook, loc: Locale, expandedId: number | null) {
  const { primary, secondary } = bookNamePair(book, loc);
  const expanded = expandedId === book.id;
  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);
  const nameHtml = secondary
    ? `${esc(primary)} <span class="b66-book__en">${esc(secondary)}</span>`
    : esc(primary);

  return `
    <li class="b66-book${expanded ? ' b66-book--open' : ''}" data-book="${book.id}">
      <button type="button" class="b66-book__head" data-book-toggle="${book.id}" aria-expanded="${expanded}">
        <span class="b66-book__id">${book.id}</span>
        <span class="b66-book__names">${nameHtml}</span>
        <span class="b66-book__ch-count">${book.chapters} ${t('chaptersUnit', loc)}</span>
        <span class="b66-book__chev" aria-hidden="true">${expanded ? '▾' : '›'}</span>
      </button>
      ${
        expanded
          ? `<div class="b66-chapters" role="list" aria-label="${esc(t('bible66PickChapter', loc))}">
        ${chapters
          .map(
            (c) =>
              `<button type="button" class="b66-chapter" role="listitem" data-chapter="${c}" data-book="${book.id}">${c}</button>`
          )
          .join('')}
      </div>`
          : ''
      }
    </li>
  `;
}

function renderSection(title: string, books: BibleCatalogBook[], loc: Locale, expandedId: number | null) {
  if (!books.length) return '';
  return `
    <section class="b66-sect">
      <h3 class="b66-sect__title">${esc(title)}</h3>
      <ul class="b66-list">${books.map((b) => renderBookRow(b, loc, expandedId)).join('')}</ul>
    </section>
  `;
}

function guideHtml(loc: Locale) {
  return `
    <aside class="b66-guide" aria-labelledby="b66GuideTitle">
      <h2 class="b66-guide__title" id="b66GuideTitle">${esc(t('bible66GuideTitle', loc))}</h2>
      <p class="b66-guide__lead">${esc(t('bible66GuideLead', loc))}</p>
      <p class="b66-guide__paths-label">${esc(t('bible66GuidePathsLabel', loc))}</p>
      <div class="b66-guide__paths">
        ${GUIDE_PATHS.map(
          (p) =>
            `<button type="button" class="b66-guide__path" data-guide-book="${p.bookId}">${esc(
              t(p.labelKey, loc)
            )}</button>`
        ).join('')}
      </div>
      <p class="b66-guide__tips-title">${esc(t('bible66GuideTipsTitle', loc))}</p>
      <ol class="b66-guide__tips">
        <li>${esc(t('bible66Tip1', loc))}</li>
        <li>${esc(t('bible66Tip2', loc))}</li>
        <li>${esc(t('bible66Tip3', loc))}</li>
        <li>${esc(t('bible66Tip4', loc))}</li>
      </ol>
    </aside>
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
      ${guideHtml(loc)}
      <h2 class="b66-catalog-label">${esc(t('bible66CatalogLabel', loc))}</h2>
      <div class="b66-catalog" id="b66List"><p class="loading">${t('loading', loc)}</p></div>
    </div>
  `;

  root.querySelector('#btnBack')?.addEventListener('click', () => navigate({ view: 'home' }));

  root.querySelectorAll('[data-guide-book]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const bookId = Number((btn as HTMLElement).dataset.guideBook);
      if (!bookId) return;
      navigateToUnit(unitFromBible66(bookId, 1));
    });
  });

  const list = root.querySelector('#b66List') as HTMLElement;
  try {
    const catalog = await loadBibleCatalog();
    const ot = catalog.books.filter((b) => b.testament === 'OT');
    const nt = catalog.books.filter((b) => b.testament === 'NT');
    list.innerHTML =
      renderSection(t('bible66Ot', loc), ot, loc, expandedBookId) +
      renderSection(t('bible66Nt', loc), nt, loc, expandedBookId);
    bindBible66List(root, expandedBookId);

    if (expandedBookId != null) {
      requestAnimationFrame(() => {
        const open = list.querySelector(`.b66-book--open`) as HTMLElement | null;
        open?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  } catch (err) {
    mountLoadError(list, loc, { kind: 'catalog' }, err);
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
      navigateToUnit(unitFromBible66(bookId, chapter));
    });
  });
}
