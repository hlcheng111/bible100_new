import { navigate, navigateToUnit, getRoute, type ViewId, type Locale } from './router';
import { getLocale } from './stores/locale';
import { getFontSize, setFontSize, fontSizeLabel, type FontSize } from './stores/fontSize';
import { isReaderLangVisible, type ReaderLang } from './stores/readerLang';
import { setPrimaryLanguage, addCompareReaderLang } from './stores/languageSync';
import { t } from './i18n/strings';
import { getAllTracks, summarizeTrack, type TrackId } from './tracks/catalog';
import { resolveToday } from './coach/resolveToday';
import { openAboutTracksModal } from './ui/AboutTracksModal';
import { enterTrackFromHome } from './tracks/enterTrack';
import { getUiSkin, patchRunnerProfile } from './stores/runnerProfile';
import { playfulCopy } from './i18n/playfulCopy';

const CLOUD_URL = 'https://bible100.lovestoblog.com/bible_journey/';

const READER_LANGS: { locale: Locale; col: ReaderLang; label: string }[] = [
  { locale: 'zh-Hant', col: 'zh', label: '中' },
  { locale: 'en', col: 'en', label: 'EN' },
  { locale: 'vi', col: 'vi', label: 'VI' },
  { locale: 'id', col: 'id', label: 'ID' },
];

function toolsInnerHtml(loc: Locale, fs: FontSize, skin: ReturnType<typeof getUiSkin>, skinLabel: string) {
  return `
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
        <button type="button" class="pill pill--skin" id="btnToggleSkin" title="${skinLabel}">${skin === 'playful' ? '📖' : '🎮'}</button>
        <button type="button" class="pill pill--muted" data-nav="help-about" title="${t('aboutApp', loc)}">ℹ️ ${t('aboutApp', loc)}</button>
  `;
}

function tracksInnerHtml(
  tracks: ReturnType<typeof summarizeTrack>[],
  route: ReturnType<typeof getRoute>
) {
  return tracks
    .map((s) => {
      const active =
        (route.view === 'tracks' && route.trackId === s.id) ||
        (route.view === 'reader' && route.trackId === s.id);
      return `<button type="button" class="track-pill${active ? ' on' : ''}" data-track="${s.id}" style="--track-color:${s.color}" title="${s.title}">
              <span class="track-pill__emoji">${s.emoji}</span>
              <span class="track-pill__label">${s.title}</span>
            </button>`;
    })
    .join('');
}

export function renderShell(mount: HTMLElement) {
  const loc = getLocale();
  const fs = getFontSize();
  const route = getRoute();
  const tracks = getAllTracks().map((row) => summarizeTrack(row, loc));
  const skin = getUiSkin();
  const skinLabel =
    skin === 'playful'
      ? playfulCopy(loc).switchClassic
      : loc === 'zh-Hant'
        ? '🎮 親子模式'
        : loc === 'vi'
          ? '🎮 Chế độ trẻ'
          : loc === 'id'
            ? '🎮 Mode anak'
            : '🎮 Kids mode';

  /** Wave 1：頂欄安靜；閱讀頁更克制 */
  const readerQuiet = route.view === 'reader';

  mount.innerHTML = `
    <header class="shell-top shell-top--quiet${readerQuiet ? ' shell-top--reader' : ''}">
      <div class="shell-bar">
        <button type="button" class="pill${route.view === 'home' ? ' on' : ''}" data-nav="home">🏠 ${t('home', loc)}</button>
        <button type="button" class="pill pill--accent${route.view === 'reader' ? ' on' : ''}" data-nav="today">☀️ ${t('today', loc)}</button>
        <span class="logo" aria-hidden="true">🦁</span>
        <span class="title">${t('appTitle', loc)}</span>
        <button type="button" class="pill pill--more" id="btnShellMore" aria-expanded="false" aria-controls="shellMorePanel" title="${t('shellMore', loc)}">≡</button>
      </div>

      <div class="shell-more" id="shellMorePanel" aria-hidden="true" inert>
        <div class="shell-more__inner">
          <p class="shell-more__label">${t('shellMoreTracks', loc)}</p>
          <nav class="shell-tracks shell-tracks--in-more" aria-label="${t('tracksNav', loc)}">
            ${tracksInnerHtml(tracks, route)}
          </nav>
          <p class="shell-more__label">${t('shellMoreCare', loc)}</p>
          <nav class="shell-care shell-care--in-more" aria-label="${t('shellMoreCare', loc)}">
            <button type="button" class="pill${route.view === 'qna' ? ' on' : ''}" data-nav="qna">💬 ${t('qna', loc)}</button>
            <button type="button" class="pill${route.view === 'mentor' ? ' on' : ''}" data-nav="mentor">✨ ${t('mentor', loc)}</button>
          </nav>
          <p class="shell-more__label">${t('shellMoreTools', loc)}</p>
          <div class="shell-tools shell-tools--in-more">
            ${toolsInnerHtml(loc, fs, skin, skinLabel)}
          </div>
        </div>
      </div>
    </header>
  `;

  mount.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', () => {
      const v = (el as HTMLElement).dataset.nav as ViewId | 'help-about';
      if (v === 'today') void resolveToday().then((unit) => navigateToUnit(unit));
      else if (v === 'help-about') openAboutTracksModal(loc);
      else navigate({ view: v as ViewId });
    });
  });

  mount.querySelectorAll('[data-track]').forEach((el) => {
    el.addEventListener('click', () => {
      const id = (el as HTMLElement).dataset.track as TrackId;
      void enterTrackFromHome(id);
    });
  });

  mount.querySelectorAll('[data-reader-lang]').forEach((el) => {
    el.addEventListener('click', (ev) => {
      const col = (el as HTMLElement).dataset.readerLang as ReaderLang;
      const wasOn = isReaderLangVisible(col);
      const e = ev as MouseEvent;

      /** Ctrl／⌘＋點：加開對照語，不改介面語 */
      if (!wasOn && (e.ctrlKey || e.metaKey)) {
        addCompareReaderLang(col);
        return;
      }

      if (wasOn) {
        /** 已是此語且為主語：再點＝確認同步（介面＋單語經文） */
        setPrimaryLanguage(col);
        return;
      }

      /** 點亮某語＝介面＋經文＋陪伴一齊切到該語 */
      setPrimaryLanguage(col);
    });
  });

  mount.querySelectorAll('[data-font]').forEach((el) => {
    el.addEventListener('click', () => {
      const s = (el as HTMLElement).dataset.font as FontSize;
      setFontSize(s);
    });
  });

  mount.querySelector('#btnToggleSkin')?.addEventListener('click', () => {
    const next = getUiSkin() === 'playful' ? 'classic' : 'playful';
    patchRunnerProfile({
      uiSkin: next,
      celebrationEnabled: next === 'playful',
    });
  });

  const moreBtn = mount.querySelector('#btnShellMore') as HTMLButtonElement | null;
  const morePanel = mount.querySelector('#shellMorePanel') as HTMLElement | null;

  const setMoreOpen = (open: boolean) => {
    if (!morePanel || !moreBtn) return;
    if (open) {
      morePanel.classList.add('shell-more--open');
      morePanel.removeAttribute('inert');
      morePanel.setAttribute('aria-hidden', 'false');
      moreBtn.setAttribute('aria-expanded', 'true');
      moreBtn.classList.add('on');
      moreBtn.setAttribute('title', t('shellMoreClose', loc));
    } else {
      morePanel.classList.remove('shell-more--open');
      morePanel.setAttribute('inert', '');
      morePanel.setAttribute('aria-hidden', 'true');
      moreBtn.setAttribute('aria-expanded', 'false');
      moreBtn.classList.remove('on');
      moreBtn.setAttribute('title', t('shellMore', loc));
    }
  };

  moreBtn?.addEventListener('click', () => {
    const open = moreBtn.getAttribute('aria-expanded') !== 'true';
    setMoreOpen(open);
  });
}
