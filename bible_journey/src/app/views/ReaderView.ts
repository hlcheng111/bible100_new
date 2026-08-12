import { getBibleProvider } from '../bible/provider';
import { loadBibleCatalog, chapterRef } from '../bible/catalog';
import { getLocale } from '../stores/locale';
import { t } from '../i18n/strings';
import {
  pickLocalizedField,
  readerContext30Day,
  readerContextGolden,
} from '../i18n/trackLocale';
import thematicReadings from '../../assets/tracks/thematic_readings.json';
import { navigate, type RouteState } from '../router';
import { unitFromRoute } from '../contract/readingUnit';
import { markTodayRead } from '../stores/progress';
import { mountLoadError, logLoadError } from '../ui/loadError';
import { mountCoachDrawer } from '../ui/CoachDrawer';
import { mountReadDoneBar } from '../ui/ReadDoneBar';
import {
  isVerseFocusActive,
  resolveFocusVerses,
  resolveScrollHighlightVerse,
  shouldHideChapterNav,
} from '../reader/focusVerses';
import { spawnCheckInCelebration, showClassicCheckInToast } from '../ui/checkInCelebration';
import { getUiSkin } from '../stores/runnerProfile';
import { ensureAtLeastOneReaderLang } from '../stores/readerLang';
import { markThemeJustCleared, rememberLastReading } from '../stores/sessionReading';

let loadGen = 0;
let themeReturnTimer = 0;

function readerNavigate(ctx: RouteState, patch: Partial<RouteState>) {
  const nextChapter = patch.chapter ?? ctx.chapter ?? 1;
  const chapterChanged = patch.chapter != null && patch.chapter !== ctx.chapter;
  navigate({
    view: 'reader',
    bookId: patch.bookId ?? ctx.bookId ?? 1,
    chapter: nextChapter,
    verse: chapterChanged ? undefined : (patch.verse ?? ctx.verse),
    trackId: patch.trackId ?? ctx.trackId,
    day: patch.day ?? ctx.day,
    gv: patch.gv ?? ctx.gv,
    themeId: patch.themeId ?? ctx.themeId,
    progressId: patch.progressId ?? ctx.progressId,
    displayMode: patch.displayMode ?? ctx.displayMode,
  });
}

function contextLabel(route: RouteState, loc: ReturnType<typeof getLocale>): string {
  if (route.day != null) return readerContext30Day(route.day, loc);
  if (route.gv) return readerContextGolden(route.gv, loc);
  if (route.themeId) {
    const theme = thematicReadings.themes.find((th) => th.id === route.themeId);
    if (theme) {
      const name = pickLocalizedField(theme as Record<string, unknown>, 'name', loc) || theme.nameZh;
      return name;
    }
    return route.themeId;
  }
  if (route.trackId === 'bible66') return t('bible66Title', loc);
  return t('readerHint', loc);
}

function scrollToHighlightVerse(body: HTMLElement, verse: number) {
  requestAnimationFrame(() => {
    const el = body.querySelector(`[data-verse="${verse}"]`) as HTMLElement | null;
    if (!el) return;
    el.classList.add('focus-verse-highlight');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => el.classList.remove('focus-verse-highlight'), 5000);
  });
}

export async function renderReader(root: HTMLElement, route: RouteState) {
  const gen = ++loadGen;
  const loc = getLocale();
  const bid = route.bookId || 1;
  const chap = route.chapter || 1;
  const unit = unitFromRoute({ ...route, view: 'reader' });
  const focusVerses = resolveFocusVerses(route, unit);
  const verseFocus = isVerseFocusActive(focusVerses);
  const hideChapNav = shouldHideChapterNav(route, focusVerses);
  const scrollVerse = resolveScrollHighlightVerse(route);
  const ctxLine = contextLabel(route, loc);
  ensureAtLeastOneReaderLang();

  root.innerHTML = `
    <div class="view view--reader bible-read-flow${route.trackId === 'bible66' ? ' bible-read-flow--catalog' : ''}">
      <header class="reader-head">
        <button type="button" class="btn-back-to-map" id="btnBack" title="${t('backToMap', loc)}">${t('backToMap', loc)}</button>
        <p class="reader-context" id="readerContext">${esc(ctxLine)}</p>
        <h1 id="readerTitle" class="reader-title">${t('loading', loc)}</h1>
        <p class="reader-hint">${t('readerHint', loc)}</p>
      </header>

      <nav class="reader-chap-nav" id="chapNav" aria-label="章節導覽" hidden>
        <button type="button" class="reader-chap-nav__btn" id="btnPrevCh" hidden>← ${t('prevChapter', loc)}</button>
        <button type="button" class="reader-chap-nav__btn reader-chap-nav__btn--list" id="btnPickBook">📜 ${t('pickBook', loc)}</button>
        <button type="button" class="reader-chap-nav__btn" id="btnNextCh" hidden>${t('nextChapter', loc)} →</button>
      </nav>

      <div id="coachMount" class="coach-mount--bookmark"></div>

      <div class="reader-body br-verses reader-page" id="readerBody"><p class="loading">…</p></div>

      <footer class="reader-done-bar">
        <button type="button" class="landing-cta__btn" id="btnDone" hidden>${t('checkIn', loc)}</button>
        <div id="readDoneMount" class="read-done-mount--hidden" hidden></div>
      </footer>
    </div>
  `;

  root.querySelector('#btnBack')?.addEventListener('click', () => {
    if (route.trackId === 'theme' && route.themeId) {
      navigate({ view: 'tracks', trackId: 'theme', themeId: route.themeId });
      return;
    }
    if (route.trackId === 'bible66') {
      navigate({ view: 'tracks', trackId: 'bible66', bookId: bid });
      return;
    }
    if (route.trackId) {
      navigate({ view: 'tracks', trackId: route.trackId });
      return;
    }
    navigate({ view: 'home' });
  });
  const pickTrack = route.trackId || 'bible66';
  root.querySelector('#btnPickBook')?.addEventListener('click', () => {
    navigate({ view: 'tracks', trackId: pickTrack, bookId: pickTrack === 'bible66' ? bid : undefined });
  });

  const titleEl = root.querySelector('#readerTitle') as HTMLElement;
  const navEl = root.querySelector('#chapNav') as HTMLElement;
  navEl.hidden = hideChapNav;
  const coachMount = root.querySelector('#coachMount') as HTMLElement;
  const doneBtn = root.querySelector('#btnDone') as HTMLButtonElement;
  const readDoneMount = root.querySelector('#readDoneMount') as HTMLElement;
  let bookLabelForCoach = `${bid}:${chap}`;
  let readDoneBar = mountReadDoneBar(readDoneMount, route, loc, bookLabelForCoach);

  const refreshCoach = () => mountCoachDrawer(coachMount, route, loc, bookLabelForCoach);
  refreshCoach();
  doneBtn.hidden = false;
  doneBtn.addEventListener('click', () => {
    markTodayRead(unit?.progressId);
    rememberLastReading(bid, chap, route.themeId);
    doneBtn.textContent = t('checkedIn', loc);
    doneBtn.disabled = true;
    if (getUiSkin() === 'playful') {
      spawnCheckInCelebration(doneBtn);
    } else {
      showClassicCheckInToast(`+1 ⭐`);
    }
    bookLabelForCoach = titleEl.textContent || bookLabelForCoach;
    readDoneBar = mountReadDoneBar(readDoneMount, route, loc, bookLabelForCoach);
    readDoneBar.show();

    /** Track D：打卡 → 痛點對焦一句 → 再回地圖（可取消） */
    if (route.trackId === 'theme' && route.themeId) {
      markThemeJustCleared(route.themeId, bid, chap);
      if (themeReturnTimer) window.clearTimeout(themeReturnTimer);
      themeReturnTimer = window.setTimeout(() => {
        themeReturnTimer = 0;
        navigate({ view: 'tracks', trackId: 'theme', themeId: route.themeId });
      }, 5200);
      readDoneBar.setCancelThemeReturn?.(() => {
        if (themeReturnTimer) {
          window.clearTimeout(themeReturnTimer);
          themeReturnTimer = 0;
        }
      });
    }
  });

  let maxCh = chap;

  try {
    const catalog = await loadBibleCatalog();
    if (gen !== loadGen) return;
    const book = catalog.books.find((b) => b.id === bid);
    if (book) {
      let title = chapterRef(book, chap, loc);
      if (verseFocus && focusVerses?.length === 1) {
        title += ` · ${t('verseLabel', loc)} ${focusVerses[0]}`;
      } else if (verseFocus && focusVerses && focusVerses.length > 1) {
        title += ` · ${t('verseLabel', loc)} ${focusVerses[0]}–${focusVerses[focusVerses.length - 1]}`;
      } else if (scrollVerse != null) {
        title += ` · ${t('verseLabel', loc)} ${scrollVerse}`;
      }
      titleEl.textContent = title;
      bookLabelForCoach = title;
      refreshCoach();
      maxCh = book.chapters;
    } else {
      titleEl.textContent = `${bid}:${chap}`;
    }
    navEl.hidden = hideChapNav;
    const prev = root.querySelector('#btnPrevCh') as HTMLButtonElement;
    const next = root.querySelector('#btnNextCh') as HTMLButtonElement;
    if (chap > 1) {
      prev.hidden = false;
      prev.onclick = () => readerNavigate(route, { chapter: chap - 1 });
    }
    if (chap < maxCh) {
      next.hidden = false;
      next.onclick = () => readerNavigate(route, { chapter: chap + 1 });
    }
  } catch {
    if (gen !== loadGen) return;
    titleEl.textContent = `${bid}:${chap}`;
  }

  const body = root.querySelector('#readerBody') as HTMLElement;
  try {
    const data = await getBibleProvider().getChapter(bid, chap);
    if (gen !== loadGen) return;
    let verses = data.verses;
    if (focusVerses?.length) {
      const set = new Set(focusVerses);
      verses = data.verses.filter((v) => set.has(v.verse));
    }
    if (!verses.length) {
      logLoadError(
        { kind: 'chapter', bookId: bid, chapter: chap, trackId: route.trackId },
        new Error(
          focusVerses?.length
            ? `No verses in chapter for focus [${focusVerses.join(',')}]`
            : 'Chapter JSON returned 0 verses'
        )
      );
      body.innerHTML = `
        <div class="load-error-panel" role="alert">
          <p class="load-error-panel__emoji" aria-hidden="true">📖</p>
          <p class="load-error-panel__title">${esc(t('loadFailDevTitle', loc))}</p>
          <p class="load-error-panel__msg">${esc(t('loadFailChapterEmpty', loc))}</p>
          <p class="load-error-panel__note">${esc(t('loadFailLangHint', loc))}</p>
          <p class="load-error-panel__note">${esc(t('loadFailChapterHint', loc))}</p>
          <div class="load-error-panel__actions">
            <button type="button" class="load-error-panel__btn load-error-panel__btn--primary" id="btnEmptyRetry">${esc(t('btnRetry', loc))}</button>
            <button type="button" class="btn-back-to-map" id="btnEmptyHome">${esc(t('backToMap', loc))}</button>
          </div>
        </div>
      `;
      body.querySelector('#btnEmptyRetry')?.addEventListener('click', () => location.reload());
      body.querySelector('#btnEmptyHome')?.addEventListener('click', () => navigate({ view: 'home' }));
      refreshCoach();
      return;
    }
    body.innerHTML = verses
      .map((v) => renderVerseBlock(v, loc, scrollVerse === v.verse || (verseFocus && focusVerses?.[0] === v.verse)))
      .join('');
    if (scrollVerse != null) scrollToHighlightVerse(body, scrollVerse);
    else if (verseFocus && focusVerses?.[0] != null) scrollToHighlightVerse(body, focusVerses[0]);
    bookLabelForCoach = titleEl.textContent || `${bid}:${chap}`;
    refreshCoach();
  } catch (err) {
    if (gen !== loadGen) return;
    mountLoadError(body, loc, { kind: 'chapter', bookId: bid, chapter: chap, trackId: route.trackId }, err);
    refreshCoach();
  }
}

function renderVerseBlock(
  v: { verse: number; zh: string; en: string; vi: string; id: string },
  loc: ReturnType<typeof getLocale>,
  highlight?: boolean
) {
  const hi = highlight ? ' focus-verse-highlight' : '';
  return `
    <article class="verse-block br-verse-block${hi}" data-verse="${v.verse}" id="verse-${v.verse}">
      <span class="verse-num" aria-label="${t('verseLabel', loc)} ${v.verse}">${v.verse}</span>
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
