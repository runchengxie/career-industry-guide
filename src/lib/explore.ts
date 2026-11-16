import type { Dataset, Industry, Metric, MetricCategory } from "./types.ts";
import { metricCategories } from "./types.ts";

export interface Summary {
  total: number;
  value: number;
  unavailable: number;
  unverified: number;
  sources: number;
  industries: number;
  roles: number;
  verifiedRoles: number;
}

export function summarize(data: Dataset): Summary {
  const byAvailability = (state: Metric["availability"]): number =>
    data.metrics.filter((metric) => metric.availability === state).length;
  return {
    total: data.metrics.length,
    value: byAvailability("value"),
    unavailable: byAvailability("unavailable"),
    unverified: byAvailability("unverified"),
    sources: data.sources.length,
    industries: data.industries.length,
    roles: data.roles.length,
    verifiedRoles: data.roles.filter((role) => role.verification === "verified").length,
  };
}

export type CellKind = "tracked" | "mixed" | "missing" | "not-tracked";

export interface MapCell {
  industry: Industry;
  kind: CellKind;
  values: Metric[];
  gaps: Metric[];
}

export interface MapRow {
  category: MetricCategory;
  cells: MapCell[];
}

/**
 * 数据地图：某个类别在某行业是“有数值”“有数值但还缺关键项”“记了缺口但取不到”
 * 还是“还没立项”。四者分开，才不会把“没去找”说成“找不到”。
 */
export function dataMatrix(data: Dataset): MapRow[] {
  return metricCategories.map((category) => ({
    category,
    cells: data.industries.map((industry) => {
      const metrics = data.metrics.filter((metric) => metric.subjectId === industry.id && metric.category === category);
      const values = metrics.filter((metric) => metric.availability === "value");
      const gaps = metrics.filter((metric) => metric.availability !== "value");
      const kind: CellKind =
        values.length > 0 && gaps.length > 0
          ? "mixed"
          : values.length > 0
            ? "tracked"
            : gaps.length > 0
              ? "missing"
              : "not-tracked";
      return { industry, kind, values, gaps };
    }),
  }));
}

/** 指标按行业分组，组内按分类顺序、同年份相邻排列，供数据页表格使用。 */
export function metricsByIndustry(data: Dataset): { industry: Industry; metrics: Metric[] }[] {
  const order = (metric: Metric): number => metricCategories.indexOf(metric.category);
  const byYear = (a: Metric, b: Metric): number =>
    (a.year ?? "").localeCompare(b.year ?? "", "zh-CN", { numeric: true });
  return data.industries.map((industry) => ({
    industry,
    metrics: data.metrics
      .filter((metric) => metric.subjectId === industry.id)
      .sort((a, b) => order(a) - order(b) || byYear(a, b)),
  }));
}

/** 把同名指标合并成一条：保留第一次出现的指标 id 与全部年份，供地图里的链接使用。 */
export function labelGroups(metrics: Metric[]): { name: string; years: string[]; firstId: string }[] {
  const byName = new Map<string, { years: Set<string>; firstId: string }>();
  for (const metric of metrics) {
    const entry = byName.get(metric.name) ?? { years: new Set<string>(), firstId: metric.id };
    if (metric.year) entry.years.add(metric.year);
    byName.set(metric.name, entry);
  }
  const byYear = (a: string, b: string): number => a.localeCompare(b, "zh-CN", { numeric: true });
  return [...byName].map(([name, entry]) => ({
    name,
    firstId: entry.firstId,
    years: [...entry.years].sort(byYear),
  }));
}
export interface ComparisonGroup {
  name: string;
  /** 数据里标为可比的组，才可能连线。 */
  comparable: boolean;
  /** 组内共用的序列 id；为空表示只并列展示。 */
  series: string | null;
  reasons: string[];
  metrics: Metric[];
}

/** 把标了 comparison 的指标按组聚合，并给出能否连线的原因。 */
export function comparisonGroups(data: Dataset): ComparisonGroup[] {
  const groups = new Map<string, Metric[]>();
  for (const metric of data.metrics) {
    if (!metric.comparison) continue;
    const list = groups.get(metric.comparison.group) ?? [];
    list.push(metric);
    groups.set(metric.comparison.group, list);
  }

  return [...groups.entries()].map(([name, members]) => {
    const reasons: string[] = [];
    const comparable = members.every((metric) => metric.comparison?.comparable === true);
    if (!comparable) reasons.push("数据标记为不可比");

    const seriesIds = new Set(members.map((metric) => metric.comparison?.series ?? null));
    const series = seriesIds.size === 1 ? [...seriesIds][0] : null;
    if (seriesIds.size > 1) reasons.push("组内序列标记不一致");
    if (comparable && !series) reasons.push("未标记为同口径序列，只并列展示");

    for (const [field, label] of [
      ["unit", "单位"],
      ["category", "分类"],
      ["subjectId", "对象"],
    ] as const) {
      if (new Set(members.map((metric) => metric[field])).size > 1) {
        reasons.push(`${label}不一致，不能画在同一条线上`);
      }
    }

    return { name, comparable, series, reasons, metrics: members };
  });
}
