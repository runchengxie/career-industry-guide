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
  const rendered = new Set<string>();

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

  /**
   * 渲染行内引用时调用：返回编号，并标记是不是这一页的第一次出现，
   * 第一次出现的地方才有 id，供页末来源表的 ↩ 跳回。
   */
  function ref(sourceId: string): { number: number; first: boolean } {
    const value = number(sourceId);
    if (value <= 0) return { number: 0, first: false };
    const first = !rendered.has(sourceId);
    rendered.add(sourceId);
    return { number: value, first };
  }

  /** 只在页面末尾调用，此时所有行内引用都已经登记。 */
  function referenced(): CitationEntry[] {
    return order
      .map((id, index) => ({ number: index + 1, source: byId.get(id) }))
      .filter((entry): entry is CitationEntry => entry.source != null);
  }

  return { number, ref, referenced };
}

export type Citations = ReturnType<typeof createCitations>;
