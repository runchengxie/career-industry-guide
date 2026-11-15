import type { APIRoute } from "astro";
import { formatMetric } from "../../lib/format.ts";
import { natureLabel } from "../../lib/labels.ts";
import { loadDataset } from "../../lib/load.ts";

function cell(value: string | number | null | undefined): string {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export const GET: APIRoute = () => {
  const data = loadDataset();
  const names = new Map(data.industries.map((industry) => [industry.id, industry.name]));
  const sources = new Map(data.sources.map((source) => [source.id, source.author]));

  const header = ["行业", "指标", "分类", "显示值", "数值", "单位", "年份", "地区", "性质", "口径", "来源", "备注"];
  const rows = data.metrics.map((metric) => [
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

  const csv = [header, ...rows].map((row) => row.map(cell).join(",")).join("\n");
  return new Response(`\ufeff${csv}\n`, { headers: { "content-type": "text/csv; charset=utf-8" } });
};
