import type { APIRoute } from "astro";
import { toCsv } from "../../lib/csv.ts";
import { formatMetric } from "../../lib/format.ts";
import { natureLabel } from "../../lib/labels.ts";
import { metricCategories } from "../../lib/types.ts";
import { loadDataset } from "../../lib/load.ts";

export const GET: APIRoute = () => {
  const data = loadDataset();
  const names = new Map(data.industries.map((industry) => [industry.id, industry.name]));
  const sources = new Map(data.sources.map((source) => [source.id, source.author]));

  const industryOrder = new Map(data.industries.map((industry, index) => [industry.id, index]));
  const categoryOrder = new Map(metricCategories.map((category, index) => [category, index]));
  const byYear = (a: string, b: string): number => a.localeCompare(b, "zh-CN", { numeric: true });

  // 与数据页表格一致：先行业，再分类，最后年份
  const ordered = [...data.metrics].sort(
    (a, b) =>
      (industryOrder.get(a.subjectId) ?? 99) - (industryOrder.get(b.subjectId) ?? 99) ||
      (categoryOrder.get(a.category) ?? 99) - (categoryOrder.get(b.category) ?? 99) ||
      byYear(a.year ?? "", b.year ?? ""),
  );

  const header = ["行业", "指标", "分类", "显示值", "数值", "单位", "年份", "地区", "性质", "口径", "来源", "备注"];
  const rows = ordered.map((metric) => [
    names.get(metric.subjectId) ?? metric.subjectId,
    metric.name,
    metric.category,
    metric.availability === "value" ? formatMetric(metric) : "",
    metric.value ?? "",
    metric.unit ?? "",
    metric.year ?? "",
    metric.geography ?? "",
    natureLabel[metric.nature],
    metric.scope ?? "",
    metric.sourceIds.map((id) => sources.get(id) ?? id).join("；"),
    metric.note ?? "",
  ]);

  return new Response(toCsv(header, rows), {
    headers: { "content-type": "text/csv; charset=utf-8" },
  });
};
