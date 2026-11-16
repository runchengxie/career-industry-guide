/** Only annual and year-end observations have an unambiguous position on this axis. */
export function yearNumber(label: string | null): number | null {
  return label && /^\d{4}(年末)?$/.test(label) ? Number(label.slice(0, 4)) : null;
}

export function chartGeometry(points: { year: number; value: number }[]) {
  const width = 360,
    height = 180,
    left = 68,
    right = 22,
    top = 20,
    bottom = 32;
  const years = [...new Set(points.map((p) => p.year))].sort((a, b) => a - b);
  const values = points.map((p) => p.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const spread = rawMax - rawMin;
  // 纵轴从数据区间出发，留 8% 空白；常数列给一个可见的区间，不让线压在边框上。
  const pad = spread === 0 ? Math.max(Math.abs(rawMax) * 0.05, 1) : spread * 0.08;
  const round = (value: number): number => (Math.abs(value) >= 1000 ? Math.round(value) : Math.round(value * 10) / 10);
  const min = round(rawMin - pad);
  const max = round(rawMax + pad);
  const span = max - min || 1;
  const x = (year: number) =>
    years.length < 2
      ? (left + width - right) / 2
      : left + ((year - years[0]) / (years[years.length - 1] - years[0])) * (width - left - right);
  const y = (value: number) => top + ((max - value) / span) * (height - top - bottom);
  return {
    width,
    height,
    left,
    right,
    min,
    max,
    points: points.map((p) => ({ ...p, x: x(p.year), y: y(p.value) })),
    years: years.map((year) => ({ year, x: x(year) })),
    ticks: [max, (min + max) / 2, min].map((value) => ({ value, y: y(value) })),
  };
}

/** Missing years and duplicate years must never become synthetic line segments. */
export function annualSegments<T extends { year: number }>(points: T[], connect: boolean) {
  return connect
    ? points.slice(1).flatMap((p, i) => (p.year - points[i].year === 1 ? [{ a: points[i], b: p }] : []))
    : [];
}
