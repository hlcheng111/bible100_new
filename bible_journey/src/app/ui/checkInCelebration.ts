import { isCelebrationEnabled } from '../stores/runnerProfile';

const PARTICLE_COUNT = 16;
const DURATION_MS = 2200;

export function spawnCheckInCelebration(anchor?: HTMLElement | null) {
  if (!isCelebrationEnabled()) return;

  const host = document.createElement('div');
  host.className = 'checkin-celebration';
  host.setAttribute('aria-hidden', 'true');

  const rect = anchor?.getBoundingClientRect();
  const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const cy = rect ? rect.top + rect.height / 2 : window.innerHeight * 0.55;

  const glyphs = ['⭐', '✨', '🌟', '💫'];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = document.createElement('span');
    p.className = 'checkin-celebration__particle';
    p.textContent = glyphs[i % glyphs.length];
    const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
    const dist = 40 + (i % 5) * 18;
    p.style.left = `${cx}px`;
    p.style.top = `${cy}px`;
    p.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
    p.style.setProperty('--ty', `${Math.sin(angle) * dist - 30}px`);
    p.style.animationDelay = `${(i % 6) * 40}ms`;
    host.appendChild(p);
  }

  document.body.appendChild(host);
  window.setTimeout(() => host.remove(), DURATION_MS);
}

/** Classic 模式：靜態 +1 星提示 */
export function showClassicCheckInToast(message: string) {
  const el = document.createElement('div');
  el.className = 'checkin-classic-toast';
  el.textContent = message;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('checkin-classic-toast--visible'));
  window.setTimeout(() => {
    el.classList.remove('checkin-classic-toast--visible');
    window.setTimeout(() => el.remove(), 300);
  }, 1800);
}
