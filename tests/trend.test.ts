import assert from "node:assert/strict";
import test from "node:test";
import { comparisonGroups } from "../src/lib/explore.ts";
import { loadDataset } from "../src/lib/load.ts";
import { chartGeometry, yearNumber } from "../src/lib/trend.ts";

test("real duplicate-year groups are preserved but never treated as a sequence", () => {
  const data = loadDataset();
  for (const name of ["养老床位", "国内出游人次", "国内出游花费"]) {
    const group = comparisonGroups(data).find((g) => g.name === name)!;
    assert.equal(group.comparable, false);
    assert.ok(group.reasons.some((r) => r.includes("同年")));
    assert.equal(group.metrics.length, data.metrics.filter((m) => m.comparison?.group === name).length);
  }
});
test("comparability considers every flag and scope, independent of record order", () => {
  const data = loadDataset();
  const seed = data.metrics.find((m) => m.comparison)!;
  const a = { ...seed, year: "2023", comparison: { group: "test", comparable: true } };
  const b = { ...a, year: "2024", comparison: { group: "test", comparable: false } };
  for (const metrics of [
    [a, b],
    [b, a],
  ])
    assert.equal(comparisonGroups({ ...data, metrics })[0].comparable, false);
  assert.equal(
    comparisonGroups({ ...data, metrics: [a, { ...a, year: "2024", scope: "different" }] })[0].comparable,
    false,
  );
  assert.equal(comparisonGroups({ ...data, metrics: [a, { ...a, year: "2024" }] })[0].comparable, true);
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
test("zero and constant series have finite geometry and a visible zero baseline", () => {
  for (const value of [0, 5, -5]) {
    const g = chartGeometry([
      { year: 2024, value },
      { year: 2025, value },
    ]);
    assert.ok(g.points.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)));
    assert.ok(g.ticks.some((t) => t.value === 0));
    assert.ok(g.max > g.min);
  }
});

test("annual and year-end observations are not joined merely because their years differ", () => {
  const data = loadDataset();
  const seed = data.metrics.find((m) => m.comparison)!;
  const a = { ...seed, year: "2023", comparison: { group: "test", comparable: true } };
  assert.equal(comparisonGroups({ ...data, metrics: [a, { ...a, year: "2024年末" }] })[0].comparable, false);
});

test("missing years break lines instead of bridging unavailable observations", async () => {
  const { annualSegments } = await import("../src/lib/trend.ts");
  const points = chartGeometry([
    { year: 2021, value: 1 },
    { year: 2022, value: 2 },
    { year: 2024, value: 3 },
  ]).points;
  assert.equal(annualSegments(points, false).length, 0);
  assert.deepEqual(
    annualSegments(points, true).map((s) => [s.a.year, s.b.year]),
    [[2021, 2022]],
  );
});
