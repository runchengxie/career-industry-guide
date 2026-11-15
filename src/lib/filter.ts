import type { DirectionId, Industry, Role } from "./types.ts";

export const emptyFilterMessage = "当前方向在已录入的三个样本中没有匹配岗位";

function roleMatches(role: Role, direction: DirectionId): boolean {
  return role.humanitiesFit === "match" && (direction === "all" || role.direction === direction);
}

export function matchingRoles(roles: Role[], industryId: string, direction: DirectionId): Role[] {
  return roles.filter((role) => role.industryIds.includes(industryId) && roleMatches(role, direction));
}

export function filterIndustries(industries: Industry[], roles: Role[], direction: DirectionId): Industry[] {
  if (direction === "all") return industries;
  return industries.filter((industry) => matchingRoles(roles, industry.id, direction).length > 0);
}
