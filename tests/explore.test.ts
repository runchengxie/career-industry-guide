import assert from "node:assert/strict";
import test from "node:test";
import { dataMatrix, labelMetrics, metricsByIndustry, summarize } from "../src/lib/explore.ts";
import { loadDataset } from "../src/lib/load.ts";
import { metricCategories } from "../src/lib/types.ts";

test("概览统计与数据一致", () => {
  const data = loadDataset();
  const summary = summarize(data);
  assert.equal(summary.total, data.metrics.length);
  assert.equal(summary.value + summary.unavailable + summary.unverified, summary.total);
  assert.equal(summary.verifiedRoles, data.roles.filter((role) => role.verification === "verified").length);
});

test("数据地图覆盖全部类别与行业，且每格都能落到指标", () => {
  const data = loadDataset();
  const rows = dataMatrix(data);
  assert.equal(rows.length, metricCategories.length);
  for (const row of rows) {
    assert.equal(row.cells.length, data.industries.length);
    for (const cell of row.cells) {
      if (cell.kind === "not-tracked") {
        assert.equal(cell.values.length + cell.gaps.length, 0);
      } else {
        assert.ok(cell.values.length + cell.gaps.length > 0);
      }
      for (const metric of [...cell.values, ...cell.gaps]) {
        assert.equal(metric.category, row.category);
        assert.equal(metric.subjectId, cell.industry.id);
      }
    }
  }
});

test("有数值又有缺口的格子标成 mixed", () => {
  const data = loadDataset();
  const rows = dataMatrix(data);
  const demand = rows.find((row) => row.category === "需求规模");
  const elderly = demand?.cells.find((cell) => cell.industry.id === "elderly-care");
  assert.equal(elderly?.kind, "mixed");
  assert.ok(elderly?.gaps.some((metric) => metric.id === "elder-revenue"));
});

test("按行业分组的指标数加起来等于总数", () => {
  const data = loadDataset();
  const groups = metricsByIndustry(data);
  assert.equal(groups.reduce((sum, group) => sum + group.metrics.length, 0), data.metrics.length);
});

test("同名指标合并年份，不重复列出", () => {
  const data = loadDataset();
  const labels = labelMetrics(
    data.metrics.filter((metric) => metric.id === "ad-revenue-2024" || metric.id === "ad-revenue-2025"),
  );
  assert.deepEqual(labels, ["广告业务收入（2024、2025）"]);
});

test("名字不同的指标不合并", () => {
  const data = loadDataset();
  const labels = labelMetrics(data.metrics.filter((metric) => metric.id.startsWith("tour-trips")));
  assert.equal(labels.length, 2);
  assert.ok(labels.some((label) => label.startsWith("国内居民出游人次（2024、2025）")));
  assert.ok(labels.some((label) => label.startsWith("国内出游人次（2025）")));
});
