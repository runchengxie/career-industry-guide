/**
 * 数据页的三个筛选维度：行业、性质、状态。没有脚本时表格保持全量显示。
 */
type Dim = "industry" | "nature" | "state";

function chosen(doc: Document, name: Dim): string {
  const input = doc.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);
  return input?.value ?? "all";
}

export function applyFilters(doc: Document): number {
  const industry = chosen(doc, "industry");
  const nature = chosen(doc, "nature");
  const state = chosen(doc, "state");

  const rows = [...doc.querySelectorAll<HTMLTableRowElement>("tr[data-industry]")];
  for (const row of rows) {
    const show =
      (industry === "all" || row.dataset.industry === industry) &&
      (nature === "all" || row.dataset.nature === nature) &&
      (state === "all" || row.dataset.state === state);
    row.hidden = !show;
  }

  // 分组表头在该组所有行都被隐藏时一起隐藏
  for (const body of doc.querySelectorAll<HTMLTableSectionElement>("tbody[data-group]")) {
    const groupId = body.dataset.group ?? "";
    const anyVisible = [...body.querySelectorAll<HTMLTableRowElement>("tr[data-industry]")].some((row) => !row.hidden);
    for (const head of body.querySelectorAll<HTMLTableRowElement>("tr.group-row")) {
      head.hidden = !anyVisible || (industry !== "all" && industry !== groupId);
    }
  }

  const visible = rows.filter((row) => !row.hidden).length;
  const counter = doc.querySelector<HTMLElement>("[data-count]");
  if (counter) counter.textContent = `显示 ${visible} / ${rows.length} 条指标`;
  return visible;
}

export function setupDataFilter(doc: Document): void {
  const controls = [
    ...doc.querySelectorAll<HTMLInputElement>('input[name="industry"], input[name="nature"], input[name="state"]'),
  ];
  if (controls.length === 0) return;
  for (const control of controls) control.addEventListener("change", () => applyFilters(doc));
  applyFilters(doc);
}
