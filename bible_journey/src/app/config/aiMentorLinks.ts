/**
 * AI 助手跳轉 — Wave 3：本站問答優先，外連降為次級
 */
const GUIDE_HUB_PATH = '/ai_tools/pages/guide_reading_hub.html#qa-section';
const DEEPSEEK_URL = 'https://chat.deepseek.com';

export type AiMentorTarget = 'guide_hub' | 'deepseek' | 'in_app';

export type AiMentorLink = {
  url: string;
  target: AiMentorTarget;
};

function isStandaloneBibleJourney(pathname: string): boolean {
  const p = pathname.replace(/\/+$/, '');
  return /\/bible_journey$/.test(p) || p.endsWith('/bible_journey/dist');
}

/** 外部備援連結（次級） */
export function resolveAiMentorLink(): AiMentorLink {
  if (typeof location === 'undefined') {
    return { url: DEEPSEEK_URL, target: 'deepseek' };
  }

  if (location.protocol === 'file:') {
    try {
      const url = new URL('../../ai_tools/pages/guide_reading_hub.html#qa-section', location.href).href;
      return { url, target: 'guide_hub' };
    } catch {
      return { url: DEEPSEEK_URL, target: 'deepseek' };
    }
  }

  const { origin, pathname, port } = location;

  if (port === '5173' || port === '4173') {
    return { url: DEEPSEEK_URL, target: 'deepseek' };
  }

  if (isStandaloneBibleJourney(pathname)) {
    return { url: DEEPSEEK_URL, target: 'deepseek' };
  }

  return { url: `${origin}${GUIDE_HUB_PATH}`, target: 'guide_hub' };
}

/** 次級：開外部助手 */
export function openAiMentor(): AiMentorLink {
  const link = resolveAiMentorLink();
  window.open(link.url, '_blank', 'noopener,noreferrer');
  return link;
}

export function aiMentorSecondaryHint(localeHint: 'hub' | 'deepseek'): 'hub' | 'deepseek' {
  return localeHint;
}
