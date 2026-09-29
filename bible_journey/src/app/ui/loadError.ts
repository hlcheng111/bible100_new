import type { Locale } from '../router';
import { t } from '../i18n/strings';

export type LoadErrorKind = 'tracks' | 'catalog' | 'chapter';

export type LoadErrorContext = {
  kind: LoadErrorKind;
  trackId?: string;
  bookId?: number;
  chapter?: number;
};

const LOG_KEY = 'bible_journey_load_errors';
const isDev = import.meta.env.DEV;

function esc(s: string) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error ?? 'unknown');
}

export function isLikelyNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  const msg = errorMessage(error).toLowerCase();
  return msg.includes('fetch') || msg.includes('network') || msg.includes('failed to load');
}

function devCommands(ctx: LoadErrorContext, error: unknown): string[] {
  const cmds: string[] = [];
  if (isDev && isLikelyNetworkError(error)) {
    cmds.push('npm run dev');
  }
  if (ctx.kind === 'tracks') {
    cmds.push('npm run sync:tracks');
  } else if (ctx.kind === 'catalog' || ctx.kind === 'chapter') {
    cmds.push('npm run export:bible');
  }
  return [...new Set(cmds)];
}

function devHintKey(ctx: LoadErrorContext, error: unknown): string {
  if (isLikelyNetworkError(error)) return 'loadFailDevServer';
  if (ctx.kind === 'tracks') return 'loadFailDevTracks';
  return 'loadFailDevCatalog';
}

/** 生產環境靜默記錄；開發環境輸出 console */
export function logLoadError(context: LoadErrorContext, error: unknown) {
  const entry = {
    at: new Date().toISOString(),
    ...context,
    message: errorMessage(error),
    env: isDev ? 'development' : 'production',
  };
  if (isDev) {
    console.error('[bible_journey:load]', entry, error);
    return;
  }
  try {
    const prev = JSON.parse(sessionStorage.getItem(LOG_KEY) || '[]') as unknown[];
    prev.push(entry);
    while (prev.length > 20) prev.shift();
    sessionStorage.setItem(LOG_KEY, JSON.stringify(prev));
  } catch {
    console.error('[bible_journey:load]', entry);
  }
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

function wireRefresh(root: HTMLElement) {
  root.querySelector('[data-action="refresh"]')?.addEventListener('click', () => {
    location.reload();
  });
}

function wireCopy(root: HTMLElement, locale: Locale, command: string) {
  const btn = root.querySelector('[data-action="copy"]') as HTMLButtonElement | null;
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const ok = await copyText(command);
    if (ok) {
      const prev = btn.textContent;
      btn.textContent = t('btnCopied', locale);
      btn.disabled = true;
      window.setTimeout(() => {
        btn.textContent = prev;
        btn.disabled = false;
      }, 2000);
    }
  });
}

/**
 * 依環境渲染載入失敗 UI：
 * - 開發：技術提示 + 一鍵複製終端指令
 * - 正式：友善文案 + 重新整理（背景記錄 log）
 */
export function mountLoadError(
  container: HTMLElement,
  locale: Locale,
  context: LoadErrorContext,
  error: unknown
) {
  logLoadError(context, error);

  if (isDev) {
    const cmds = devCommands(context, error);
    const primaryCmd = cmds[0] || 'npm run export:bible';
    const hint = t(devHintKey(context, error), locale);
    const detail = errorMessage(error);
    container.innerHTML = `
      <div class="load-error-panel load-error-panel--dev" role="alert">
        <p class="load-error-panel__badge">${esc(t('loadFailDevBadge', locale))}</p>
        <p class="load-error-panel__title">${esc(t('loadFailDevTitle', locale))}</p>
        <p class="load-error-panel__msg">${esc(hint)}</p>
        ${
          context.kind === 'chapter' && context.bookId && context.chapter
            ? `<p class="load-error-panel__note">${esc(`${context.bookId}_${context.chapter}.json`)} · ${esc(detail)}</p>`
            : `<p class="load-error-panel__note">${esc(detail)}</p>`
        }
        <p class="load-error-panel__note">${esc(t('loadFailChapterHint', locale))}</p>
        <p class="load-error-panel__note">${esc(t('loadFailLangHint', locale))}</p>
        <code class="load-error-panel__cmd">${esc(primaryCmd)}</code>
        <p class="load-error-panel__note">${esc(t('loadFailDevNote', locale))}</p>
        <div class="load-error-panel__actions">
          <button type="button" class="load-error-panel__btn load-error-panel__btn--primary" data-action="copy">
            ${esc(t('btnCopyCmd', locale))}
          </button>
          <button type="button" class="load-error-panel__btn" data-action="refresh">
            ${esc(t('btnRefresh', locale))}
          </button>
        </div>
      </div>
    `;
    wireCopy(container, locale, primaryCmd);
    wireRefresh(container);
    return;
  }

  container.innerHTML = `
    <div class="load-error-panel" role="alert">
      <p class="load-error-panel__emoji" aria-hidden="true">🙏</p>
      <p class="load-error-panel__msg">${esc(t('loadFailUser', locale))}</p>
      <p class="load-error-panel__note">${esc(t('loadFailLangHint', locale))}</p>
      <div class="load-error-panel__actions">
        <button type="button" class="load-error-panel__btn load-error-panel__btn--primary" data-action="refresh">
          ${esc(t('btnRefresh', locale))}
        </button>
      </div>
    </div>
  `;
  wireRefresh(container);
}
