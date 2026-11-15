import type { Source } from "./types.ts";

export interface CitationEntry {
  number: number;
  source: Source;
}

/**
 * 页面级的引用编号：按来源在页面上第一次出现的顺序编号，供行内上标和页末
 * 来源表共用。每个页面各自调用一次 createCitations()，编号因此是页面内的。
 */
export function createCitations(sources: Source[]) {
  const byId = new Map(sources.map((source) => [source.id, source]));
  const order: string[] = [];
  const numbers = new Map<string, number>();

  function number(sourceId: string): number {
    const existing = numbers.get(sourceId);
    if (existing != null) return existing;
    const source = byId.get(sourceId);
    if (!source) return 0;
    const next = order.length + 1;
    order.push(sourceId);
    numbers.set(sourceId, next);
    return next;
  }

  /** 只在页面末尾调用，此时所有行内引用都已经登记。 */
  function referenced(): CitationEntry[] {
    return order
      .map((id, index) => ({ number: index + 1, source: byId.get(id) }))
      .filter((entry): entry is CitationEntry => entry.source != null);
  }

  return { number, referenced };
}

export type Citations = ReturnType<typeof createCitations>;
