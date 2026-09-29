import { getLocale } from '../stores/locale';
import { onboardingCopy } from '../i18n/onboardingCopy';
import { isOnboarded, patchRunnerProfile } from '../stores/runnerProfile';
import { navigate } from '../router';

function esc(s: string) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

let gateRoot: HTMLElement | null = null;

function ensureRoot(): HTMLElement {
  if (gateRoot?.isConnected) return gateRoot;
  gateRoot = document.createElement('div');
  gateRoot.id = 'onboardingGateRoot';
  document.body.appendChild(gateRoot);
  return gateRoot;
}

export function closeOnboardingGate() {
  const root = document.getElementById('onboardingGateRoot');
  if (!root) return;
  root.innerHTML = '';
  root.hidden = true;
  document.body.classList.remove('onboarding-gate-open');
}

function goHomeAfterOnboard() {
  navigate({ view: 'home' });
}

export function openOnboardingGate(onComplete?: () => void) {
  const loc = getLocale();
  const copy = onboardingCopy(loc);
  const root = ensureRoot();
  root.hidden = false;
  document.body.classList.add('onboarding-gate-open');

  root.innerHTML = `
    <div class="onboarding-gate" role="dialog" aria-modal="true" aria-labelledby="onboardingTitle">
      <div class="onboarding-gate__backdrop"></div>
      <div class="onboarding-gate__panel onboarding-gate__panel--enter">
        <p class="onboarding-gate__mascot" aria-hidden="true">🦁</p>
        <h2 id="onboardingTitle">${esc(copy.title)}</h2>
        <p class="onboarding-gate__lead">${esc(copy.lead)}</p>
        <div class="onboarding-gate__choices">
          <button type="button" class="onboarding-gate__choice onboarding-gate__choice--playful" data-choice="playful">
            <span class="onboarding-gate__choice-title">${esc(copy.playful)}</span>
            <span class="onboarding-gate__choice-hint">${esc(copy.playfulHint)}</span>
          </button>
          <button type="button" class="onboarding-gate__choice onboarding-gate__choice--classic" data-choice="classic">
            <span class="onboarding-gate__choice-title">${esc(copy.classic)}</span>
            <span class="onboarding-gate__choice-hint">${esc(copy.classicHint)}</span>
          </button>
          <button type="button" class="onboarding-gate__choice onboarding-gate__choice--skip" data-choice="skip">
            <span class="onboarding-gate__choice-title">${esc(copy.skip)}</span>
            <span class="onboarding-gate__choice-hint">${esc(copy.skipHint)}</span>
          </button>
        </div>
      </div>
    </div>
  `;

  requestAnimationFrame(() => {
    root.querySelector('.onboarding-gate__panel--enter')?.classList.add('onboarding-gate__panel--visible');
  });

  const finish = (after?: () => void) => {
    closeOnboardingGate();
    onComplete?.();
    after?.();
  };

  root.querySelector('[data-choice="playful"]')?.addEventListener('click', () => {
    patchRunnerProfile({
      uiSkin: 'playful',
      onboarded: true,
      persona: 'kids',
      celebrationEnabled: true,
      onboardedAt: Date.now(),
    });
    finish(() => goHomeAfterOnboard());
  });

  root.querySelector('[data-choice="classic"]')?.addEventListener('click', () => {
    patchRunnerProfile({
      uiSkin: 'classic',
      onboarded: true,
      persona: 'adult',
      celebrationEnabled: false,
      onboardedAt: Date.now(),
    });
    finish(() => goHomeAfterOnboard());
  });

  /** P0.9：禁止 skip 直進經文，一律落在首頁 4 線／經典選單 */
  root.querySelector('[data-choice="skip"]')?.addEventListener('click', () => {
    patchRunnerProfile({
      uiSkin: 'classic',
      onboarded: true,
      celebrationEnabled: false,
      onboardedAt: Date.now(),
    });
    finish(() => goHomeAfterOnboard());
  });
}

export function showOnboardingIfNeeded(onComplete?: () => void): boolean {
  if (isOnboarded()) return false;
  openOnboardingGate(onComplete);
  return true;
}
