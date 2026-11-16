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
  const min = Math.min(0, ...points.map((p) => p.value));
  const max = Math.max(0, ...points.map((p) => p.value)) || (min === 0 ? 1 : 0);
  const span = max - min;
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
    ticks: [min, (min + max) / 2, max].map((value) => ({ value, y: y(value) })),
  };
}

/** Missing years and duplicate years must never become synthetic line segments. */
export function annualSegments<T extends { year: number }>(points: T[], connect: boolean) {
  return connect
    ? points.slice(1).flatMap((p, i) => (p.year - points[i].year === 1 ? [{ a: points[i], b: p }] : []))
    : [];
}
