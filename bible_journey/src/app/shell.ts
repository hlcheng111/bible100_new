import { navigate, getRoute, type ViewId, type Locale } from './router';
import { getLocale, setLocale } from './stores/locale';
import { getFontSize, setFontSize, fontSizeLabel, type FontSize } from './stores/fontSize';
import {
  isReaderLangVisible,
  toggleReaderLang,
  readerLangFromLocale,
  localeFromReaderLang,
  type ReaderLang,
} from './stores/readerLang';
import { t } from './i18n/strings';
import { getAllTracks, summarizeTrack, type TrackId } from './tracks/catalog';

const CLOUD_URL = 'https://bible100.lovestoblog.com/bible_journey/';

const READER_LANGS: { locale: Locale; col: ReaderLang; label: string }[] = [
  { locale: 'zh-Hant', col: 'zh', label: '中' },
  { locale: 'en', col: 'en', label: 'EN' },
  { locale: 'vi', col: 'vi', label: 'VI' },
  { locale: 'id', col: 'id', label: 'ID' },
];

export function renderShell(mount: HTMLElement) {
  const loc = getLocale();
  const fs = getFontSize();
  const route = getRoute();
  const tracks = getAllTracks().map((row) => summarizeTrack(row, loc));

  mount.innerHTML = `
    <header class="shell-top">
      <div class="shell-bar">
        <button type="button" class="pill${route.view === 'home' ? ' on' : ''}" data-nav="home">🏠 ${t('home', loc)}</button>
        <button type="button" class="pill pill--accent${route.view === 'reader' ? ' on' : ''}" data-nav="today">☀️ ${t('today', loc)}</button>
        <span class="logo">🦁</span>
        <span class="title">${t('appTitle', loc)}</span>
      </div>

      <nav class="shell-tracks" aria-label="${t('tracksNav', loc)}">
        ${tracks
          .map((s) => {
            const active =
              (route.view === 'tracks' && route.trackId === s.id) ||
              (route.view === 'reader' && route.trackId === s.id);
            return `<button type="button" class="track-pill${active ? ' on' : ''}" data-track="${s.id}" style="--track-color:${s.color}" title="${s.title}">
              <span class="track-pill__emoji">${s.emoji}</span>
              <span class="track-pill__label">${s.title}</span>
            </button>`;
          })
          .join('')}
      </nav>

      <nav class="shell-tabs" aria-label="輔助">
        <button type="button" class="${route.view === 'squad' ? 'on' : ''}" data-nav="squad">🤝 ${t('squad', loc)}</button>
        <button type="button" class="${route.view === 'qna' ? 'on' : ''}" data-nav="qna">💬 ${t('qna', loc)}</button>
        <button type="button" class="${route.view === 'mentor' ? 'on' : ''}" data-nav="mentor">✨ ${t('mentor', loc)}</button>
      </nav>

      <div class="shell-tools">
        <div class="lang-pills" aria-label="${t('langNav', loc)}" title="${t('langNavHint', loc)}">
          ${READER_LANGS.map(
            ({ locale, col, label }) =>
              `<button type="button" class="lang-btn lang-btn--${col}${
                isReaderLangVisible(col) ? ' on' : ''
              }" data-reader-lang="${col}" data-ui-locale="${locale}">${label}</button>`
          ).join('')}
        </div>
        <div class="font-pills" aria-label="${t('fontNav', loc)}">
          ${(['sm', 'md', 'lg'] as FontSize[])
            .map(
              (s) =>
                `<button type="button" class="font-btn${s === fs ? ' on' : ''}" data-font="${s}">${fontSizeLabel(s)}</button>`
            )
            .join('')}
        </div>
        <a class="pill pill--cloud" href="${CLOUD_URL}" target="_blank" rel="noopener">${t('cloud', loc)}</a>
      </div>

      <nav class="shell-help" aria-label="說明">
        <button type="button" class="${route.view === 'help' && route.help === 'what' ? 'on' : ''}" data-help="what">？${t('helpWhat', loc)}</button>
        <button type="button" class="${route.view === 'help' && route.help === 'how' ? 'on' : ''}" data-help="how">▶${t('helpHow', loc)}</button>
        <button type="button" class="${route.view === 'help' && route.help === 'why' ? 'on' : ''}" data-help="why">❤${t('helpWhy', loc)}</button>
      </nav>
    </header>
  `;

  mount.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', () => {
      const v = (el as HTMLElement).dataset.nav as ViewId;
      if (v === 'today') navigate({ view: 'reader', bookId: 1, chapter: 1 });
      else navigate({ view: v });
    });
  });

  mount.querySelectorAll('[data-track]').forEach((el) => {
    el.addEventListener('click', () => {
      const id = (el as HTMLElement).dataset.track as TrackId;
      navigate({ view: 'tracks', trackId: id });
    });
  });

  mount.querySelectorAll('[data-help]').forEach((el) => {
    el.addEventListener('click', () => {
      const h = (el as HTMLElement).dataset.help as 'what' | 'how' | 'why';
      navigate({ view: 'help', help: h });
    });
  });

  mount.querySelectorAll('[data-reader-lang]').forEach((el) => {
    el.addEventListener('click', () => {
      const col = (el as HTMLElement).dataset.readerLang as ReaderLang;
      const wasOn = isReaderLangVisible(col);
      toggleReaderLang(col);
      if (!wasOn) {
        setLocale(localeFromReaderLang(col));
      }
    });
  });

  mount.querySelectorAll('[data-font]').forEach((el) => {
    el.addEventListener('click', () => {
      const s = (el as HTMLElement).dataset.font as FontSize;
      setFontSize(s);
    });
  });
}
