import {
  matchVolunteerToRole,
  rankRoleMatches,
  type MatchResult,
  type MinistryRoleProfile,
  type VolunteerProfile,
} from "../matching/matchingEngine";
import type { CtvDimension, CtvVector } from "../ctv/types";

export type TeamCompositionSummary = {
  memberIds: string[];
  teamAverage: Record<CtvDimension, number>;
  weakDimensions: CtvDimension[];
};

function avgVector(vectors: CtvVector[]): Record<CtvDimension, number> {
  const totals = {
    P: 0,
    S: 0,
    G: 0,
    C: 0,
    R: 0,
    F: 0,
  };
  if (!vectors.length) return totals;
  for (const vector of vectors) {
    totals.P += vector.dimensions.P.score;
    totals.S += vector.dimensions.S.score;
    totals.G += vector.dimensions.G.score;
    totals.C += vector.dimensions.C.score;
    totals.R += vector.dimensions.R.score;
    totals.F += vector.dimensions.F.score;
  }
  return {
    P: totals.P / vectors.length,
    S: totals.S / vectors.length,
    G: totals.G / vectors.length,
    C: totals.C / vectors.length,
    R: totals.R / vectors.length,
    F: totals.F / vectors.length,
  };
}

export function recommendRoleMatches(
  volunteer: VolunteerProfile,
  roles: MinistryRoleProfile[]
): MatchResult[] {
  return roles
    .map((role) => matchVolunteerToRole(volunteer, role))
    .sort((a, b) => b.finalScore - a.finalScore);
}

export function recommendRoleCandidates(
  volunteers: VolunteerProfile[],
  role: MinistryRoleProfile
): MatchResult[] {
  return rankRoleMatches(volunteers, role);
}

export function summarizeTeamComposition(
  volunteers: VolunteerProfile[],
  threshold = 65
): TeamCompositionSummary {
  const vectors = volunteers.map((volunteer) => volunteer.ctv);
  const teamAverage = avgVector(vectors);
  const weakDimensions = (Object.keys(teamAverage) as CtvDimension[]).filter(
    (dim) => teamAverage[dim] < threshold
  );
  return {
    memberIds: volunteers.map((volunteer) => volunteer.memberId),
    teamAverage,
    weakDimensions,
  };
}

export function recommendRaciRoleByVector(
  ctv: CtvVector
): "A" | "R" | "C" | "I" {
  const leadership = ctv.dimensions.G.score + ctv.dimensions.F.score;
  const execution = ctv.dimensions.C.score + ctv.dimensions.R.score;
  const consult = ctv.dimensions.P.score + ctv.dimensions.S.score;

  if (leadership >= execution && leadership >= consult) return "A";
  if (execution >= leadership && execution >= consult) return "R";
  if (consult >= execution) return "C";
  return "I";
}
