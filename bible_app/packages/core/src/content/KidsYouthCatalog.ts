import data from '../../data/kids_youth_content.json';

export interface StoryUnit {
  unitId: string;
  track: 'kids_story' | 'youth_quest';
  order: number;
  titleZh: string;
  titleEn: string;
  heroEmoji: string;
  colors: { primary: string; secondary: string; accent: string };
  bookId: number;
  chapter: number;
  bookLabelZh: string;
  storyZh: string;
  storyEn: string;
  oneLineZh: string;
  oneLineEn: string;
  actionZh: string;
  actionEn: string;
  minutes: number;
  sticker: { id: string; nameZh: string; nameEn: string; emoji: string };
  game: {
    type: string;
    questionZh: string;
    questionEn: string;
    optionsZh: string[];
    optionsEn: string[];
    answerIndex: number;
    wordPuzzleZh: string;
  };
  supplyUrl: string;
}

export interface ContentTrack {
  id: string;
  nameZh: string;
  nameEn: string;
  emoji: string;
  unitCount: number;
}

const payload = data as {
  tracks: ContentTrack[];
  units: StoryUnit[];
};

export function getContentTracks(): ContentTrack[] {
  return payload.tracks;
}

export function getAllUnits(): StoryUnit[] {
  return payload.units;
}

export function getUnitsByTrack(track: string): StoryUnit[] {
  return payload.units.filter((u) => u.track === track).sort((a, b) => a.order - b.order);
}

export function getUnit(unitId: string): StoryUnit | undefined {
  return payload.units.find((u) => u.unitId === unitId);
}

export function getTrackMeta(trackId: string): ContentTrack | undefined {
  return payload.tracks.find((t) => t.id === trackId);
}
