import type { Claim, Dataset, Industry, Source } from "./types.ts";

/** 行业各章节的段落，顺序与页面一致。 */
export function claimBlocks(industry: Industry): Claim[] {
  return [
    ...industry.definition,
    ...industry.demand,
    ...industry.dailyWork,
    ...industry.thresholds,
    ...industry.geographyLimits,
    ...industry.profit,
    ...industry.risks,
  ];
}

export function allClaims(data: Dataset): Claim[] {
  return [...data.meta.method, ...data.industries.flatMap(claimBlocks)];
}

/**
 * 来源支撑了哪些对象。此前这是数据里手工维护的 supports 字段，已经和正文脱节
 * （20 处引用没有回填），改为从 metric、role、claim 的 sourceIds 反向生成。
 */
export function supportIndex(data: Dataset): Map<string, string[]> {
  const index = new Map<string, string[]>();
  const add = (sourceId: string, targetId: string): void => {
    const list = index.get(sourceId);
    if (!list) index.set(sourceId, [targetId]);
    else if (!list.includes(targetId)) list.push(targetId);
  };

  for (const metric of data.metrics) {
    for (const sourceId of metric.sourceIds) add(sourceId, metric.id);
  }
  for (const role of data.roles) {
    for (const sourceId of role.sourceIds) add(sourceId, role.id);
  }
  for (const claim of allClaims(data)) {
    for (const sourceId of claim.sourceIds) add(sourceId, claim.id);
  }
  return index;
}

/** 某个来源被引用却不在 sources 里时，索引会多出没有对应记录的键。 */
export function supportOf(index: Map<string, string[]>, source: Source): string[] {
  return index.get(source.id) ?? [];
}
