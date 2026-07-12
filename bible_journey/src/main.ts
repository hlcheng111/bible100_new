import { initRouter, subscribe, getRoute } from './app/router';
import { renderShell } from './app/shell';
import { initLocale, subscribeLocale } from './app/stores/locale';
import { initFontSize, subscribeFontSize } from './app/stores/fontSize';
import { initReaderLang, subscribeReaderLang } from './app/stores/readerLang';
import { renderHome } from './app/views/HomeView';
import { renderToday } from './app/views/TodayView';
import { renderReader } from './app/views/ReaderView';
import { renderPlaceholder, renderHelp } from './app/views/PlaceholderViews';
import { renderTracks } from './app/views/TracksView';
import type { TrackId } from './app/tracks/catalog';
import './styles/theme-warm.css';
import './styles/landing.css';
import './styles/bible66.css';
import './styles/reader-quad.css';
import './styles/track-list.css';

function renderApp() {
  const route = getRoute();
  const main = document.getElementById('main')!;
  switch (route.view) {
    case 'home':
      renderHome(main);
      break;
    case 'today':
      renderToday(main);
      break;
    case 'reader':
      renderReader(main, route.bookId || 1, route.chapter || 1);
      break;
    case 'squad':
    case 'qna':
    case 'mentor':
      renderPlaceholder(main, route.view);
      break;
    case 'tracks':
      renderTracks(main, route.trackId || 'bible66', route.bookId);
      break;
    case 'help':
      renderHelp(main, route.help || 'how');
      break;
    default:
      renderHome(main);
  }
}

function refreshShell() {
  renderShell(document.getElementById('shell')!);
}

function refreshAll() {
  refreshShell();
  renderApp();
}

function boot() {
  initLocale();
  initFontSize();
  initReaderLang();
  const app = document.getElementById('app')!;
  app.innerHTML = '<div id="shell"></div><main id="main" class="main"></main>';
  subscribeLocale(refreshAll);
  subscribeFontSize(refreshAll);
  subscribeReaderLang(refreshShell);
  initRouter();
  subscribe(() => refreshAll());
  refreshAll();
}

boot();
