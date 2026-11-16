import assert from "node:assert/strict";
import test from "node:test";
import { comparisonGroups } from "../src/lib/explore.ts";
import { loadDataset } from "../src/lib/load.ts";
import { chartGeometry, seriesSegments, yearNumber } from "../src/lib/trend.ts";

test("标为同口径序列的组保留同年并列来源，并只给一个主来源", () => {
  const data = loadDataset();
  for (const name of ["养老床位", "国内出游人次", "国内出游花费"]) {
    const group = comparisonGroups(data).find((g) => g.name === name)!;
    assert.equal(group.comparable, true);
    assert.ok(group.series, `${name} 应有序列 id`);
    const byYear = new Map<number, number>();
    for (const metric of group.metrics) {
      if (!metric.comparison?.primary) continue;
      const year = Number((metric.year ?? "").slice(0, 4));
      byYear.set(year, (byYear.get(year) ?? 0) + 1);
    }
    assert.ok(
      [...byYear.values()].every((count) => count === 1),
      `${name} 每年至多一个主来源`,
    );
  }
});
test("可比性看数据标记：任一条为不可比即整组不可比", () => {
  const data = loadDataset();
  const seed = data.metrics.find((m) => m.comparison)!;
  const a = { ...seed, year: "2023", comparison: { group: "t", comparable: true, series: "t", primary: true } };
  const b = { ...a, year: "2024" };
  assert.equal(comparisonGroups({ ...data, metrics: [a, b] })[0].comparable, true);
  assert.equal(
    comparisonGroups({ ...data, metrics: [a, { ...b, comparison: { ...b.comparison!, comparable: false } }] })[0]
      .comparable,
    false,
  );
});

test("没有序列标记的组只并列展示，不连线", () => {
  const data = loadDataset();
  const seed = data.metrics.find((m) => m.comparison)!;
  const a = { ...seed, year: "2023", comparison: { group: "t", comparable: true, series: null, primary: false } };
  const group = comparisonGroups({ ...data, metrics: [a, { ...a, year: "2024" }] })[0];
  assert.equal(group.comparable, true);
  assert.equal(group.series, null);
  assert.ok(group.reasons.some((reason) => reason.includes("未标记为同口径序列")));
});

test("year axis preserves duplicate positions and missing-year distances", () => {
  assert.equal(yearNumber("2025年末"), 2025);
  assert.equal(yearNumber("2025Q1"), null);
  const g = chartGeometry([
    { year: 2021, value: 10 },
    { year: 2022, value: 12 },
    { year: 2024, value: 11 },
    { year: 2024, value: 13 },
  ]);
  assert.equal(g.points[2].x, g.points[3].x);
  assert.ok(Math.abs((g.points[2].x - g.points[1].x) / (g.points[1].x - g.points[0].x) - 2) < 1e-10);
});
test("vertical axis spans the data range with padding, not a forced zero", () => {
  const g = chartGeometry([
    { year: 2023, value: 823 },
    { year: 2024, value: 799.3 },
    { year: 2025, value: 767.9 },
  ]);
  // 轴区间必须包住数据，并留出空白；不再强制从零开始
  assert.ok(g.min <= 767.9, `min ${g.min} 应不大于最小值`);
  assert.ok(g.max >= 823, `max ${g.max} 应不小于最大值`);
  assert.ok(g.min > 0, "这一组数据不需要把轴拉到 0");
  assert.ok(g.points.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)));
  for (const tick of g.ticks) {
    assert.ok(tick.value >= g.min && tick.value <= g.max);
    assert.ok(Number.isFinite(tick.y));
  }
});

test("constant and zero series still get a usable range", () => {
  for (const value of [0, 5, -5]) {
    const g = chartGeometry([
      { year: 2024, value },
      { year: 2025, value },
    ]);
    assert.ok(g.points.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)));
    assert.ok(g.max > g.min);
  }
});

test("缺年不连线，并列来源也不参与连线", () => {
  const points = chartGeometry([
    { year: 2023, value: 1, primary: true },
    { year: 2024, value: 2, primary: true },
    { year: 2025, value: 3, primary: true },
    { year: 2025, value: 3.2, primary: false },
    { year: 2027, value: 4, primary: true },
  ]).points;
  assert.equal(seriesSegments(points, false).length, 0);
  assert.deepEqual(
    seriesSegments(points, true).map((segment) => [segment.a.year, segment.b.year]),
    [
      [2023, 2024],
      [2024, 2025],
    ],
    "2025→2027 缺 2026，不补线；并列来源不参与",
  );
});
