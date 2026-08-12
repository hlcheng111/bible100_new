import readingData from '../../data/reading_tracks.json';

export interface BibleBook {
  id: number;
  nameZh: string;
  nameEn: string;
  chapters: number;
  testament: 'OT' | 'NT';
}

const books = (readingData as { books: Omit<BibleBook, 'testament'>[] }).books;

export function getBibleBooks(): BibleBook[] {
  return books.map((b) => ({
    ...b,
    testament: b.id <= 39 ? 'OT' : 'NT',
  }));
}

export function getBibleBook(bookId: number): BibleBook | undefined {
  return getBibleBooks().find((b) => b.id === bookId);
}

export function getChapterList(bookId: number): number[] {
  const book = getBibleBook(bookId);
  if (!book) return [];
  return Array.from({ length: book.chapters }, (_, i) => i + 1);
}
