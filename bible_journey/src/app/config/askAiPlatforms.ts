import type { Locale } from '../contract/routeState';

export type AskAiPlatform = {
  id: string;
  emoji: string;
  name: string;
  url: string;
  /** 可能需要帳號／登入 */
  needsLogin?: boolean;
  /** 越高越靠前；依 App 語系排序 */
  weight: Record<Locale, number>;
};

/** 皆以新分頁開啟；不做 iframe 內嵌對話 */
export const ASK_AI_PLATFORMS: AskAiPlatform[] = [
  {
    id: 'kimi',
    emoji: '🤖',
    name: 'Kimi AI',
    url: 'https://www.kimi.com/',
    weight: { 'zh-Hant': 100, en: 40, vi: 40, id: 40 },
  },
  {
    id: 'qianyi',
    emoji: '💬',
    name: '千義通問',
    url: 'https://chat.qianyiwen.com/',
    weight: { 'zh-Hant': 90, en: 30, vi: 30, id: 30 },
  },
  {
    id: 'grok',
    emoji: '🚀',
    name: 'Grok AI',
    url: 'https://x.ai/',
    weight: { 'zh-Hant': 70, en: 80, vi: 70, id: 70 },
  },
  {
    id: 'deepseek',
    emoji: '🌊',
    name: 'DeepSeek',
    url: 'https://chat.deepseek.com/',
    weight: { 'zh-Hant': 65, en: 55, vi: 55, id: 55 },
  },
  {
    id: 'chatgpt',
    emoji: '💭',
    name: 'ChatGPT',
    url: 'https://chatgpt.com/',
    needsLogin: true,
    weight: { 'zh-Hant': 50, en: 100, vi: 100, id: 100 },
  },
  {
    id: 'claude',
    emoji: '🧠',
    name: 'Claude',
    url: 'https://claude.ai/',
    needsLogin: true,
    weight: { 'zh-Hant': 45, en: 95, vi: 85, id: 85 },
  },
  {
    id: 'gemini',
    emoji: '💎',
    name: 'Gemini',
    url: 'https://gemini.google.com/',
    needsLogin: true,
    weight: { 'zh-Hant': 40, en: 90, vi: 95, id: 95 },
  },
];

export const ASK_AI_MORE_HUB =
  'https://bible100.lovestoblog.com/ai_tools/pages/ai_qa_system.html';

export function platformsForLocale(locale: Locale): AskAiPlatform[] {
  return [...ASK_AI_PLATFORMS].sort((a, b) => b.weight[locale] - a.weight[locale]);
}

export function openPlatformTab(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}
