import type { Locale } from '../contract/routeState';
import { t } from '../i18n/strings';
import { trackJourneyEvent } from '../stores/journeyEvents';
import {
  ASK_AI_MORE_HUB,
  openPlatformTab,
  platformsForLocale,
} from '../config/askAiPlatforms';
import { copyToClipboard } from './clipboard';

export type AskAiPanelOptions = {
  locale: Locale;
  /** buildDeepQnaPrompt 產出 */
  prompt: string;
};

const ROOT_ID = 'bjAskAiPanelRoot';

function esc(s: string) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function removeExisting() {
  document.getElementById(ROOT_ID)?.remove();
  document.body.classList.remove('bj-ask-ai-open');
}

/**
 * 固定入口用的「問 AI」面板（非全站 FAB）。
 * 開啟時優先把提問草稿寫入剪貼簿；平台一律新分頁。
 */
export async function openAskAiPanel(opts: AskAiPanelOptions): Promise<void> {
  const { locale } = opts;
  let prompt = opts.prompt;
  removeExisting();
  trackJourneyEvent('open_ask_ai_panel');

  const platforms = platformsForLocale(locale);
  const ready = platforms.filter((p) => !p.needsLogin);
  const login = platforms.filter((p) => p.needsLogin);

  const root = document.createElement('div');
  root.id = ROOT_ID;
  root.className = 'ask-ai-root';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'askAiTitle');

  const portalBtn = (p: (typeof platforms)[0], primary?: boolean) => `
    <button type="button" class="ask-ai-portal${primary ? ' ask-ai-portal--primary' : ''}" data-ai-url="${esc(p.url)}" data-ai-id="${esc(p.id)}">
      <span class="ask-ai-portal__emoji" aria-hidden="true">${p.emoji}</span>
      <span class="ask-ai-portal__name">${esc(p.name)}</span>
      ${p.needsLogin ? `<span class="ask-ai-portal__badge">${esc(t('askAiNeedsLogin', locale))}</span>` : ''}
    </button>
  `;

  root.innerHTML = `
    <div class="ask-ai-backdrop" data-ask-ai-close tabindex="-1"></div>
    <div class="ask-ai-panel">
      <header class="ask-ai-panel__head">
        <h2 class="ask-ai-panel__title" id="askAiTitle">🤖 ${esc(t('askAiTitle', locale))}</h2>
        <button type="button" class="ask-ai-panel__close" data-ask-ai-close aria-label="${esc(t('askAiClose', locale))}">✕</button>
      </header>

      <p class="ask-ai-panel__lead">${esc(t('askAiLead', locale))}</p>
      <p class="ask-ai-panel__status" id="askAiStatus" role="status" aria-live="polite"></p>

      <section class="ask-ai-block" aria-labelledby="askAiPromptLabel">
        <h3 class="ask-ai-block__title" id="askAiPromptLabel">${esc(t('askAiPromptLabel', locale))}</h3>
        <textarea class="ask-ai-prompt" id="askAiPrompt" rows="8" spellcheck="true">${esc(prompt)}</textarea>
        <div class="ask-ai-block__actions">
          <button type="button" class="ask-ai-btn ask-ai-btn--primary" id="askAiCopy">${esc(t('askAiCopyAgain', locale))}</button>
          <button type="button" class="ask-ai-btn" id="askAiReset">${esc(t('askAiReset', locale))}</button>
        </div>
      </section>

      <section class="ask-ai-block" aria-labelledby="askAiPortalsLabel">
        <h3 class="ask-ai-block__title" id="askAiPortalsLabel">${esc(t('askAiPortalsLabel', locale))}</h3>
        <p class="ask-ai-block__sub">${esc(t('askAiReadyLabel', locale))}</p>
        <div class="ask-ai-portals" id="askAiReady">
          ${ready.map((p, i) => portalBtn(p, i === 0)).join('')}
        </div>
        <p class="ask-ai-block__sub">${esc(t('askAiLoginLabel', locale))}</p>
        <div class="ask-ai-portals" id="askAiLogin">
          ${login.map((p) => portalBtn(p)).join('')}
        </div>
        <a class="ask-ai-more" href="${esc(ASK_AI_MORE_HUB)}" target="_blank" rel="noopener noreferrer">${esc(t('askAiMoreHub', locale))} ↗</a>
      </section>
    </div>
  `;

  document.body.appendChild(root);
  document.body.classList.add('bj-ask-ai-open');

  const statusEl = root.querySelector('#askAiStatus') as HTMLElement;
  const ta = root.querySelector('#askAiPrompt') as HTMLTextAreaElement;

  const setStatus = (msg: string, ok?: boolean) => {
    statusEl.textContent = msg;
    statusEl.classList.toggle('ask-ai-panel__status--ok', ok === true);
    statusEl.classList.toggle('ask-ai-panel__status--err', ok === false);
  };

  const close = () => {
    removeExisting();
    document.removeEventListener('keydown', onKey);
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
  };
  document.addEventListener('keydown', onKey);

  root.querySelectorAll('[data-ask-ai-close]').forEach((el) => {
    el.addEventListener('click', close);
  });

  const doCopy = async (text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setStatus(t('askAiCopiedOk', locale), true);
      trackJourneyEvent('copy_prompt', 'ask_ai_panel');
    } else {
      setStatus(t('askAiCopiedFail', locale), false);
      window.prompt(t('askAiCopiedFail', locale), text);
    }
    return ok;
  };

  /** 開啟時優先寫入剪貼簿 */
  await doCopy(prompt);

  root.querySelector('#askAiCopy')?.addEventListener('click', async () => {
    prompt = ta.value;
    await doCopy(prompt);
  });

  root.querySelector('#askAiReset')?.addEventListener('click', async () => {
    ta.value = opts.prompt;
    prompt = opts.prompt;
    await doCopy(prompt);
  });

  root.querySelectorAll('[data-ai-url]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const url = (btn as HTMLElement).dataset.aiUrl;
      const id = (btn as HTMLElement).dataset.aiId || '';
      if (!url) return;
      prompt = ta.value;
      await doCopy(prompt);
      trackJourneyEvent('open_external_ai', id);
      openPlatformTab(url);
    });
  });

  requestAnimationFrame(() => {
    root.classList.add('ask-ai-root--open');
    ta.focus();
  });
}
