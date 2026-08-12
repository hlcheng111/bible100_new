import { initRouter, subscribe, getRoute } from './app/router';
import { renderShell } from './app/shell';
import { initLocale, subscribeLocale } from './app/stores/locale';
import { initFontSize, subscribeFontSize } from './app/stores/fontSize';
import { initReaderLang, subscribeReaderLang } from './app/stores/readerLang';
import { ensureProgressStorage } from './app/stores/progress';
import { ensureCoachStorage } from './app/stores/coachState';
import { ensureRunnerProfile, subscribeRunnerProfile } from './app/stores/runnerProfile';
import { showOnboardingIfNeeded } from './app/ui/OnboardingGate';
import { renderHome } from './app/views/HomeView';
import { renderToday } from './app/views/TodayView';
import { renderReader } from './app/views/ReaderView';
import { renderPlaceholder, renderHelp } from './app/views/PlaceholderViews';
import { renderQna } from './app/views/QnaView';
import { renderMentor } from './app/views/MentorView';
import { renderTracks } from './app/views/TracksView';
import type { TrackId } from './app/tracks/catalog';
import './styles/theme-warm.css';
import './styles/landing.css';
import './styles/bible66.css';
import './styles/reader-quad.css';
import './styles/track-list.css';
import './styles/coach-drawer.css';
import './styles/read-done-bar.css';
import './styles/about-tracks-modal.css';
import './styles/onboarding-gate.css';
import './styles/playful-home.css';
import './styles/theme-adventure.css';
import './styles/qna-mentor.css';
import './styles/bible-quiz-modal.css';
import './styles/checkin-celebration.css';
import './styles/ask-ai-panel.css';

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
      renderReader(main, getRoute());
      break;
    case 'squad':
      renderPlaceholder(main, route.view);
      break;
    case 'qna':
      renderQna(main);
      break;
    case 'mentor':
      renderMentor(main);
      break;
    case 'tracks':
      renderTracks(main, route.trackId || 'bible66', route.bookId, route.themeId);
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
  ensureProgressStorage();
  ensureCoachStorage();
  ensureRunnerProfile();
  initLocale();
  initFontSize();
  initReaderLang();
  if (import.meta.env.DEV) {
    console.info(
      '%c[bible_journey]',
      'color:#6366f1;font-weight:bold',
      'Vite SPA（非 React）。若 Console 出現 React #130 / DevTools / gator.volces.com，多半是瀏覽器擴充，可忽略。'
    );
  }
  const app = document.getElementById('app')!;
  app.innerHTML = '<div id="shell"></div><main id="main" class="main"></main>';
  subscribeLocale(refreshAll);
  subscribeFontSize(refreshAll);
  subscribeReaderLang(refreshShell);
  subscribeRunnerProfile(refreshAll);
  initRouter();
  subscribe(() => refreshAll());
  refreshAll();
  showOnboardingIfNeeded(refreshAll);
}

boot();
