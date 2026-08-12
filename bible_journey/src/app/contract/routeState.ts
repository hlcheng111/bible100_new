import type { DisplayMode } from './readingUnit';

export type Locale = 'zh-Hant' | 'en' | 'vi' | 'id';

export type ViewId =
  | 'home'
  | 'today'
  | 'reader'
  | 'tracks'
  | 'squad'
  | 'qna'
  | 'mentor'
  | 'help';

export type TrackId = 'bible66' | '30day' | 'golden' | 'theme';

/** URL 路由狀態（reader 須帶關卡語境 query） */
export interface RouteState {
  view: ViewId;
  bookId?: number;
  chapter?: number;
  verse?: number;
  trackId?: TrackId;
  day?: number;
  gv?: string;
  themeId?: string;
  progressId?: string;
  displayMode?: DisplayMode;
  help?: 'what' | 'how' | 'why';
}
