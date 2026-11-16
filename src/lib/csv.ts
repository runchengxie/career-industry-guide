/** CSV 单元格转义：引号、逗号、换行都要包起来，内部引号翻倍。 */
export function csvCell(value: string | number | null | undefined): string {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** 生成带 BOM 的 CSV，Excel 打开中文不乱码。 */
export function toCsv(header: string[], rows: (string | number | null | undefined)[][]): string {
  return `\ufeff${[header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n")}\n`;
}
