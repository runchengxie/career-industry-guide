import type { Metric } from "./types.ts";

export function formatValue(value: number, unit: string | null, decimals: number, group: boolean): string {
  const text = new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: group,
  }).format(value);
  return `${text}${unit ?? ""}`;
}

export function formatMetric(metric: Metric): string {
  if (metric.availability === "unavailable") return "暂无可靠数据";
  if (metric.availability === "unverified") return "尚未核实";
  if (metric.value == null) return "暂无可靠数据";
  return formatValue(metric.value, metric.unit, metric.decimals, metric.group);
}
