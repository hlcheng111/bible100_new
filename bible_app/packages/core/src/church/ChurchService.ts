import type { GroupSession, QnaItem, UserRole } from '../types';

export interface ChurchMemberSummary {
  userId: string;
  displayName: string;
  role: UserRole;
  completedUnits: number;
  totalUnits: number;
  percent: number;
}

export interface ChurchDashboardData {
  churchId: string;
  churchName: string;
  memberCount: number;
  groupCount: number;
  avgCompletionPercent: number;
  members: ChurchMemberSummary[];
}

/** Pure helpers for pastor dashboard aggregations (Firestore fetch in app layer). */
export function aggregateMemberProgress(
  members: { userId: string; displayName: string; role: UserRole }[],
  progressByUser: Record<string, { completed: number; total: number }>
): ChurchDashboardData['members'] {
  return members.map((m) => {
    const p = progressByUser[m.userId] || { completed: 0, total: 1189 };
    const percent = p.total ? Math.round((p.completed / p.total) * 100) : 0;
    return {
      ...m,
      completedUnits: p.completed,
      totalUnits: p.total,
      percent,
    };
  });
}

export function buildGroupSession(
  churchId: string,
  groupId: string,
  trackId: string,
  unitId: string,
  scheduledDate: string,
  title?: string
): GroupSession {
  return {
    sessionId: `${groupId}_${scheduledDate}_${unitId}`,
    churchId,
    groupId,
    trackId,
    unitId,
    scheduledDate,
    title,
  };
}

export function canAnswerQna(role: UserRole): boolean {
  return role === 'pastor' || role === 'leader';
}

export function newQnaDraft(
  churchId: string,
  askedBy: string,
  question: string,
  locale: QnaItem['locale']
): Omit<QnaItem, 'qnaId'> {
  return {
    churchId,
    question,
    askedBy,
    locale,
    visibility: 'church',
    createdAt: new Date().toISOString(),
  };
}
