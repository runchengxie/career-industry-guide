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
      const metrics = data.metrics.filter(
        (metric) => metric.subjectId === industry.id && metric.category === category,
      );
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

/** 指标按行业分组，供数据页表格使用。 */
export function metricsByIndustry(data: Dataset): { industry: Industry; metrics: Metric[] }[] {
  return data.industries.map((industry) => ({
    industry,
    metrics: data.metrics.filter((metric) => metric.subjectId === industry.id),
  }));
}

/** 把同名指标的年份合并成一条，避免“广告业务收入、广告业务收入”。 */
export function labelMetrics(metrics: Metric[]): string[] {
  const byName = new Map<string, Set<string>>();
  for (const metric of metrics) {
    const years = byName.get(metric.name) ?? new Set<string>();
    if (metric.year) years.add(metric.year);
    byName.set(metric.name, years);
  }
  return [...byName].map(([name, years]) =>
    years.size > 0 ? `${name}（${[...years].join("、")}）` : name,
  );
}
