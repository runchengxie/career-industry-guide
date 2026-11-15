import type { APIRoute } from "astro";
import { verificationLabel } from "../../lib/labels.ts";
import { loadDataset } from "../../lib/load.ts";

function cell(value: string | null | undefined): string {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export const GET: APIRoute = () => {
  const data = loadDataset();
  const names = new Map(data.industries.map((industry) => [industry.id, industry.name]));
  const header = ["岗位", "方向", "行业", "核验状态", "雇主", "材料性质", "职位链接", "核验日期", "限制", "来源"];
  const rows = data.roles.map((role) => [
    role.name,
    role.direction,
    role.industryIds.map((id) => names.get(id) ?? id).join("、"),
    verificationLabel[role.verification],
    role.employer ?? "",
    role.materialNature ?? "",
    role.postingUrl ?? "",
    role.verifiedOn ?? "",
    role.limits,
    role.sourceIds.join("；"),
  ]);
  const csv = [header, ...rows].map((row) => row.map(cell).join(",")).join("\n");
  return new Response(`\ufeff${csv}\n`, { headers: { "content-type": "text/csv; charset=utf-8" } });
};
