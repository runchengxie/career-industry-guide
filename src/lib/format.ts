import type { Metric } from "./types.ts";

export function formatMetric(metric: Metric): string {
  if (metric.availability === "unavailable") return "暂无可靠数据";
  if (metric.availability === "unverified") return "尚未核实";
  const year = metric.year ? `（${metric.year}）` : "";
  return `${metric.display ?? ""}${year}`;
}
